import { useEffect, useState } from "react";

export function CopyableCA({ address }: { address: string }) {
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null; // wait until client

  const short = address ? address.slice(0, 4) + "..." + address.slice(-4) : "";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  return (
    <button
      onClick={copy}
      className="relative px-3 py-1.5 rounded-md border border-gray-300 hover:bg-gray-100 text-sm font-mono"
    >
      {short}
      {copied && (
        <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-0.5 rounded transition-opacity">
          Copied!
        </span>
      )}
    </button>
  );
}
