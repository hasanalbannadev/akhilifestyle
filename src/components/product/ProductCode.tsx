"use client";
import { useState } from "react";
import { Icon } from "@/components/ui/Icon";

// প্রোডাক্ট কোড (যেমন 401)। "কপি" চাপলে কোডটা কপি হয়, যাতে মেসেজে দোকানকে পাঠানো যায়।
export function ProductCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    const done = () => { setCopied(true); setTimeout(() => setCopied(false), 1500); };
    try { navigator.clipboard.writeText(code).then(done).catch(() => {}); } catch { /* ignore */ }
  };
  return (
    <p className="flex items-center gap-2 text-sm text-muted">
      <span>Product code: <b className="text-ink">{code}</b></span>
      <button type="button" onClick={copy} className="inline-flex items-center gap-1 rounded-full border border-line px-2 py-0.5 text-xs font-medium text-brand-600 hover:bg-brand-50">
        {copied && <Icon name="check" className="h-3.5 w-3.5" />}{copied ? "কপি হয়েছে" : "কপি"}
      </button>
    </p>
  );
}
