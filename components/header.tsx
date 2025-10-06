import { useEffect, useMemo, useState } from "react";

export function Header({
  ca,
  meLink,
  xLink,
  pumpLink,
}: {
  ca: string;
  meLink: string;
  xLink: string;
  pumpLink: string;
}) {
  const [copied, setCopied] = useState(false);
  const short = useMemo(() => {
    if (!ca) return "";
    const start = ca.slice(0, 4);
    const end = ca.endsWith("pump") ? "…pump" : ca.slice(-4);
    return `${start}...${end}`;
  }, [ca]);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 900);
    return () => clearTimeout(t);
  }, [copied]);

  const copy = async () => {
    try { await navigator.clipboard.writeText(ca); setCopied(true); } catch {}
  };

  return (
    <header className="fixed top-0 inset-x-0 z-20 h-16">
      <div className="relative h-full">
        {/* left spacer */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2" />
        {/* center CA + copy */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="flex items-center gap-2 bg-white/70 backdrop-blur px-3 py-1.5 rounded-full shadow-sm border border-black/10">
            <span className="font-mono text-sm tracking-tight">{short}</span>
            <button
              onClick={copy}
              className="relative inline-flex items-center px-2 py-1 rounded-full border border-black/10 hover:bg-black/5 active:scale-[0.98] transition"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
                <path d="M9 9V5a2 2 0 0 1 2-2h6l4 4v10a2 2 0 0 1-2 2h-4" fill="none" stroke="currentColor" strokeWidth="1.6" />
                <rect x="3" y="7" width="12" height="14" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6" />
              </svg>
              <span className={`pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs px-2 py-1 rounded-md bg-black text-white ${copied ? "opacity-100" : "opacity-0"} transition-opacity`}>
                Copied
              </span>
            </button>
          </div>
        </div>

        {/* right icons */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
          
          {/* X */}
          <a
            href={xLink}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-black text-white hover:opacity-90 active:scale-[0.98] transition"
            aria-label="X"
            title="X"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden>
              <path fill="currentColor" d="M18.244 2H21l-6.58 7.51L22 22h-6.91l-4.54-5.77L4.42 22H2l7.11-8.11L2 2h6.91l4.18 5.32L18.244 2zm-2.42 18h2.28L8.24 4H5.96l9.864 16z"/>
            </svg>
          </a>
          {/* Magic Eden */}
          <a
            href={meLink}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-white text-[#7c3aed] border border-black/10 hover:bg-[#faf5ff] active:scale-[0.98] transition"
            aria-label="Magic Eden"
            title="Magic Eden"
          >
            <svg viewBox="0 0 64 64" width="18" height="18" aria-hidden>
              <path fill="currentColor" d="M12 20h10l10 10 10-10h10v24H42V30L32 40 22 30v14H12z"/>
            </svg>
          </a>
        </div>
      </div>
    </header>
  );
}
