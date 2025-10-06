import type { NextApiRequest, NextApiResponse } from "next";
import { getCache, setCache } from "../../lib/cache";

const TTL = 10_000; // 10 seconds cache

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const cached = getCache<any>("metrics");
    if (cached) {
      res.setHeader("Cache-Control", "s-maxage=10");
      return res.json(cached);
    }

    const [marketcap, nft] = await Promise.allSettled([
      fetchMarketcap(),
      fetchNFTFloorAndRoyalties(),
    ]);

    const floor = nft.status === "fulfilled" ? nft.value.floor : null;
    const royalties = nft.status === "fulfilled" ? nft.value.royalties : null;

    const data = {
      marketcap: marketcap.status === "fulfilled" ? marketcap.value : null,
      floor,
      royalties,        // 5% of floor (in SOL)
      owners: null,     // per request: stop asking for holders
      supply: 100,      // fixed total NFTs
      updatedAt: new Date().toISOString(),
    };

    setCache("metrics", data, TTL);
    res.setHeader("Cache-Control", "s-maxage=10").json(data);
  } catch (err: any) {
    console.error("metrics error", err);
    res.status(500).json({ error: err.message });
  }
}

/* =============== 1) MARKET CAP (Birdeye × Helius) =============== */
async function fetchMarketcap() {
  const mint = process.env.TOKEN_MINT ?? "";
  const beKey = process.env.BIRDEYE_API_KEY ?? "";
  const heliusKey = process.env.HELIUS_API_KEY ?? "";
  if (!mint || !beKey || !heliusKey) return null;

  // Birdeye price
  const headers = { "X-API-KEY": beKey };
  const overview = await safeJson(
    fetch(`https://public-api.birdeye.so/defi/token_overview?address=${mint}`, { headers })
  );
  const price = overview?.data?.price ?? overview?.data?.value ?? null;
  if (!price) return null;

  // Helius total supply (Token-2022 safe)
  const supply = await fetchTokenSupply(mint, heliusKey);
  return supply ? price * supply : null;
}

async function fetchTokenSupply(mint: string, heliusKey: string) {
  const res = await fetch(`https://mainnet.helius-rpc.com/?api-key=${heliusKey}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: "supply",
      method: "getTokenSupply",
      params: [mint],
    }),
  });
  const json = await res.json();
  const amount = json?.result?.value?.amount ?? null;
  const decimals = json?.result?.value?.decimals ?? 0;
  return amount && decimals ? Number(amount) / 10 ** decimals : null;
}

/* =============== 2) NFT FLOOR + 5% ROYALTIES (Magic Eden only) =============== */
async function fetchNFTFloorAndRoyalties() {
  const symbol = process.env.ME_SYMBOL ?? ""; // e.g. "solrocks___"
  if (!symbol) return { floor: null, royalties: null };

  // Primary: get cheapest active listing (robust "true floor")
  let floor = await getCheapestListingFloor(symbol);

  // Fallback: /stats floorPrice (lamports -> SOL)
  if (floor == null) {
    const stats = await safeJson(
      fetch(`https://api-mainnet.magiceden.dev/v2/collections/${symbol}/stats`, { headers: meHeaders() })
    );
    if (stats && stats.floorPrice != null) {
      floor = Number(stats.floorPrice) / 1e9;
    }
  }

  const royalties = floor != null ? floor * 0.05 : null; // 5% in SOL
  return { floor, royalties };
}

async function getCheapestListingFloor(symbol: string) {
  // Try multiple parameter styles; ME varies in the wild
  const urls = [
    `https://api-mainnet.magiceden.dev/v2/collections/${symbol}/listings?offset=0&limit=1&order=price&direction=asc`,
    `https://api-mainnet.magiceden.dev/v2/collections/${symbol}/listings?offset=0&limit=1&sortBy=price&sortDirection=asc`,
    `https://api-mainnet.magiceden.dev/v2/collections/${symbol}/listings?offset=0&limit=1`,
  ];
  for (const url of urls) {
    const listings = await safeJson(fetch(url, { headers: meHeaders() }));
    if (Array.isArray(listings) && listings.length > 0) {
      const p = listings[0]?.price;
      if (typeof p === "number") return p; // already in SOL here
    }
  }
  return null;
}

/* ============================== Helpers ============================== */
function meHeaders() {
  return {
    Accept: "application/json",
    "User-Agent": "SolRocks-Dashboard/1.0",
  };
}

// Safe JSON: won’t crash on ME plaintext rate-limit messages
async function safeJson(promise: Promise<Response> | Response) {
  const res = promise instanceof Response ? promise : await promise;
  try {
    return await res.json();
  } catch {
    const text = await res.text();
    console.warn("Non-JSON response:", text.slice(0, 120));
    return {};
  }
}
