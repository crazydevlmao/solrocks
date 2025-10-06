import Head from "next/head";
import useSWR from "swr";
import { useEffect, useMemo, useState } from "react";
import { Header } from "../components/header"; // <-- fixed casing
import { MetricCard } from "../components/MetricCard";
import { Carousel } from "../components/Carousel";

const fetcher = (u: string) => fetch(u).then((r) => r.json());

/** Smooth, slower typewriter swap (no arbitrary Tailwind animation) */
function TypeSwap({ words }: { words: string[] }) {
  const [i, setI] = useState(0);
  const [txt, setTxt] = useState("");
  const [phase, setPhase] = useState<"typing" | "pause" | "deleting">("typing");

  useEffect(() => {
    const word = words[i % words.length];
    let delay = 130; // slower typing speed

    if (phase === "typing") {
      delay = 130;
      if (txt.length < word.length) {
        const t = setTimeout(() => setTxt(word.slice(0, txt.length + 1)), delay);
        return () => clearTimeout(t);
      } else {
        const t = setTimeout(() => setPhase("pause"), 1300); // longer pause
        return () => clearTimeout(t);
      }
    }

    if (phase === "pause") {
      const t = setTimeout(() => setPhase("deleting"), 800); // slower transition
      return () => clearTimeout(t);
    }

    if (phase === "deleting") {
      delay = 90;
      if (txt.length > 0) {
        const t = setTimeout(() => setTxt(txt.slice(0, -1)), delay);
        return () => clearTimeout(t);
      } else {
        setPhase("typing");
        setI((v) => (v + 1) % words.length);
      }
    }
  }, [txt, phase, i, words]);

  return (
    <span className="inline-block pr-1 border-r-2 border-black/50 typing-caret">
      {txt}
      <style jsx global>{`
        .typing-caret {
          animation: caretBlink 1.2s steps(1) infinite;
        }
        @keyframes caretBlink {
          50% {
            border-color: transparent;
          }
        }
      `}</style>
    </span>
  );
}

export default function Home() {
  const { data } = useSWR("/api/metrics", fetcher, {
    refreshInterval: 10000,
    revalidateOnFocus: false,
  });

  const words = useMemo(
    () => ["SolRocks", "100 NFTs", "Immutable", "Onchain", "Built on Solana"],
    []
  );

  const fmtUSD = (n?: number | null) =>
    n == null
      ? "—"
      : new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          maximumFractionDigits: 0,
        }).format(n);

  const fmtSOL = (n?: number | null) =>
    n == null
      ? "—"
      : `${Number(n).toLocaleString(undefined, {
          maximumFractionDigits: 3,
        })} SOL`;

  const pumpLink =
    process.env.NEXT_PUBLIC_PUMPFUN_LINK ||
    `https://pump.fun/coin/${
      process.env.NEXT_PUBLIC_TOKEN_MINT ||
      process.env.TOKEN_MINT ||
      "9RXsi1X2yjyPmkkSUoEvDjCGXAh8VsVA1Kv9yeafpump"
    }`;

  return (
    <div className="min-h-screen h-screen overflow-hidden relative bg-white text-black">
      <Head>
        <title>SolRocks</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* subtle grid + soft blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
      <div
        className="pointer-events-none absolute -top-28 -left-24 w-[42rem] h-[42rem] rounded-full blur-3xl opacity-40"
        style={{
          background:
            "radial-gradient(circle at 30% 30%, #a78bfa 0%, transparent 60%)",
        }}
      />
      <div
        className="pointer-events-none absolute -bottom-36 -right-24 w-[42rem] h-[42rem] rounded-full blur-3xl opacity-40"
        style={{
          background:
            "radial-gradient(circle at 70% 70%, #34d399 0%, transparent 60%)",
        }}
      />

      <Header
        ca={
          process.env.NEXT_PUBLIC_TOKEN_MINT ||
          process.env.TOKEN_MINT ||
          "9RXsi1X2yjyPmkkSUoEvDjCGXAh8VsVA1Kv9yeafpump"
        }
        meLink={
          process.env.NEXT_PUBLIC_MAGIC_EDEN_LINK ||
          "https://magiceden.io/marketplace/solrocks___"
        }
        xLink={process.env.NEXT_PUBLIC_X_LINK || "https://x.com"}
        pumpLink={pumpLink}
      />

      {/* Full-viewport content (minus header height) */}
      <main className="relative z-10 h-[calc(100vh-4rem)] max-w-6xl mx-auto px-4 pt-20 pb-0 flex flex-col gap-6 overflow-hidden">
        {/* Title */}
        <h1 className="text-center font-black tracking-tight text-4xl sm:text-5xl md:text-6xl">
          <TypeSwap words={words} />
        </h1>

        {/* Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <MetricCard label="Market Cap" value={fmtUSD(data?.marketcap)} />
          <MetricCard label="NFT Floor" value={fmtSOL(data?.floor)} />
          <MetricCard label="Total NFTs" value={"100"} />
        </section>

        {/* Lore + Carousel */}
        <section className="flex-1 grid grid-rows-[1fr_1fr] gap-4 overflow-hidden">
          {/* Lore */}
          <div className="relative rounded-2xl bg-white/75 backdrop-blur border border-black/10 shadow-sm p-6 overflow-hidden">
            {/* soft animated wash */}
            <div
              className="pointer-events-none absolute -inset-16 opacity-40 blur-3xl"
              style={{
                background:
                  "conic-gradient(from 0deg, #a78bfa33, #34d39933, #a78bfa33)",
                animation: "sweep 8s linear infinite",
              }}
            />
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "linear-gradient(135deg, rgba(52,211,153,0.08), rgba(167,139,250,0.08))",
              }}
            />

            <div className="relative z-10 h-full flex items-center">
              {/* LORE */}
              <p className="lore text-base md:text-lg leading-relaxed tracking-tight text-gray-900">
                The first SolRock wasn’t forged; it was
                <span className="grad-glow"> unearthed</span>. One block was empty; the next
                held a weight — silent, certain, older than the noise around it. No pitch, no promise;
                only <span className="underline-scan">truth etched into the chain</span>.
                <br /><br />
                Then came a hundred more — fragments seeded through Solana’s stonework, each with its own grain.
                Some carry <span className="chip">trade scars</span> and bright edges. Others rest cool and patient,
                waiting for the next epoch to pass.
                <br /><br />
                When markets shout, the Rocks <span className="breathe">stand steady</span>. When the feed goes dark,
                they <span className="hum">hum beneath the surface</span>. They don’t hurry and they don’t explain — proof
                that not everything on-chain must move to matter.
              </p>
            </div>

            {/* local keyframes for this card */}
            <style jsx>{`
              @keyframes sweep { from { transform: rotate(0) } to { transform: rotate(360deg) } }

              .lore { animation: loreEnter .7s cubic-bezier(.22,.61,.36,1) both; }
              @keyframes loreEnter {
                from { opacity: 0; transform: translateY(8px); }
                to   { opacity: 1; transform: translateY(0); }
              }

              .grad-glow {
                margin-left: .25rem;
                font-weight: 600;
                background: linear-gradient(90deg,#34d399,#a78bfa);
                -webkit-background-clip: text; background-clip: text; color: transparent;
                animation: gradGlow 3.2s ease-in-out infinite;
              }
              @keyframes gradGlow {
                0%,100% { filter: drop-shadow(0 0 0 rgba(167,139,250,0)); }
                50%     { filter: drop-shadow(0 0 8px rgba(167,139,250,0.35)); }
              }

              .underline-scan {
                position: relative; font-weight: 600;
                text-decoration: underline;
                text-decoration-color: rgba(52,211,153,.7);
                text-underline-offset: 6px;
              }
              .underline-scan::after {
                content:""; position:absolute; left:0; bottom:-2px; height:2px; width:100%;
                background: linear-gradient(90deg,rgba(52,211,153,0),rgba(52,211,153,.9),rgba(52,211,153,0));
                transform: scaleX(0); transform-origin:left; opacity:.9;
                animation: scan 2.6s ease-in-out infinite;
              }
              @keyframes scan {
                0% { transform: scaleX(0); transform-origin:left; }
                50% { transform: scaleX(1); transform-origin:left; }
                51% { transform: scaleX(1); transform-origin:right; }
                100% { transform: scaleX(0); transform-origin:right; }
              }

              .chip {
                display:inline-block; margin:0 .25rem; padding:0 .375rem;
                border-radius:.375rem; background:#ecfdf5; color:#047857; font-weight:600;
                box-shadow:0 0 6px rgba(52,211,153,.15);
              }

              .breathe { display:inline-block; font-weight:700; animation:breathe 3.4s ease-in-out infinite; }
              @keyframes breathe { 0%,100% { transform: scale(1) } 50% { transform: scale(1.02) } }

              .hum { font-style:italic; color:rgba(0,0,0,.72); animation:humPulse 6s ease-in-out infinite; }
              @keyframes humPulse {
                0%,100% { text-shadow:0 0 0 rgba(52,211,153,0) }
                50% { text-shadow:0 0 10px rgba(52,211,153,.35) }
              }
            `}</style>
          </div>

          {/* Carousel (fills exact row height; top space == bottom space) */}
          <div className="h-full overflow-hidden">
            <Carousel count={100} src="/solrock.png" />
          </div>
        </section>
        {/* END Lore + Carousel */}
      </main>

      {/* Professional footer overlay (no background) */}
      <footer className="pointer-events-auto fixed bottom-2 inset-x-0 z-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between text-[12px] text-black/60">
            <span>© {new Date().getFullYear()} SolRocks</span>
            <div className="flex items-center gap-4">
              <a href={pumpLink} target="_blank" rel="noreferrer" className="hover:text-black">Pump.fun</a>
              <a href={process.env.NEXT_PUBLIC_MAGIC_EDEN_LINK || "https://magiceden.io/marketplace/solrocks___"} target="_blank" rel="noreferrer" className="hover:text-black">Magic Eden</a>
              <a href={process.env.NEXT_PUBLIC_X_LINK || "https://x.com"} target="_blank" rel="noreferrer" className="hover:text-black">X</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
