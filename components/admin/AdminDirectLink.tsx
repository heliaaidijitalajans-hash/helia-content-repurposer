"use client";

import { useEffect, useState } from "react";

export function AdminDirectLink() {
  const [href, setHref] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setHref(`${window.location.origin}/admin`);
  }, []);

  async function copy() {
    if (!href) return;
    try {
      await navigator.clipboard.writeText(href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="rounded-lg border border-blue-200/80 bg-blue-50/50 px-4 py-3 text-sm">
      <p className="font-medium text-slate-900">Doğrudan admin linki</p>
      <p className="mt-1 text-slate-600">
        Yer imi veya paylaşım için:{" "}
        <code className="rounded bg-white px-1.5 py-0.5 text-xs text-slate-800">
          {href || "…"}
        </code>
      </p>
      <button
        type="button"
        disabled={!href}
        onClick={() => void copy()}
        className="mt-2 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {copied ? "Kopyalandı" : "Linki panoya kopyala"}
      </button>
    </div>
  );
}
