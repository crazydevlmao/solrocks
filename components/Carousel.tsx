// components/Carousel.tsx
import React, { useMemo } from "react";

type Props = {
  count: number;      // e.g. 100
  src: string;        // e.g. "/solrock.png"
  speedMs?: number;   // optional, default slower & smooth
};

export const Carousel: React.FC<Props> = ({ count, src, speedMs = 45000 }) => {
  const items = useMemo(() => Array.from({ length: count }, (_, i) => i + 1), [count]);

  return (
    <div className="relative h-full overflow-hidden">
      {/* edge fade to make it feel premium */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          maskImage:
            "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
        }}
      />

      {/* Marquee: inner duplicated strip => translateX(-50%) for perfect loop */}
      <div
        className="marquee"
        style={
          {
            // @ts-ignore
            "--speed": `${speedMs}ms`,
          } as React.CSSProperties
        }
      >
        <div className="marquee-inner">
          {items.map((n) => (
            <Tile key={`a-${n}`} n={n} src={src} />
          ))}
          {items.map((n) => (
            <Tile key={`b-${n}`} n={n} src={src} />
          ))}
        </div>
      </div>

      <style jsx>{`
        .marquee {
          height: 100%;
          will-change: transform;
        }
        .marquee-inner {
          height: 100%;
          display: flex;
          align-items: center;
          gap: 16px;
          animation: scroll var(--speed) linear infinite;
        }
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        /* Respect prefers-reduced-motion */
        @media (prefers-reduced-motion: reduce) {
          .marquee-inner {
            animation: none;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
};

function Tile({ n, src }: { n: number; src: string }) {
  return (
    <div className="relative shrink-0 w-32 sm:w-36 md:w-40 lg:w-44 aspect-square rounded-xl overflow-hidden bg-white shadow-[0_6px_20px_rgba(0,0,0,0.12)] ring-1 ring-black/5">
      <img
        src={src}
        alt={`SolRock #${n}`}
        loading="lazy"
        className="h-full w-full object-contain"
        draggable={false}
      />
      {/* number badge */}
      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-xs font-semibold text-gray-900 bg-white/85 backdrop-blur ring-1 ring-black/10">
        #{n}
      </div>

      {/* subtle motion sheen */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 hover:opacity-100 transition-opacity"
        style={{
          background:
            "linear-gradient(120deg, transparent 0%, rgba(255,255,255,0.15) 30%, transparent 60%)",
        }}
      />
    </div>
  );
}
