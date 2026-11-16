"use client";
import { useEffect, useState } from "react";
import { catalogApi } from "@/lib/api/catalog";
import { imageUrl } from "@/lib/image";
import type { Product } from "@/types";

// চ্যাটে অ্যাডমিন যে পণ্য পাঠায় ("নাম / দাম Tk / পণ্যের লিংক") সেটা সুন্দর কার্ড হয়ে দেখায়:
// ছবি, নাম, দাম ও "View & order" বোতাম (চাপলে পণ্যের পেজে গিয়ে অর্ডার করা যায়)।
// পণ্যের ছবি/নাম/দাম আসল পণ্য থেকেই আসে। না পেলে মেসেজের লেখা দিয়েই কার্ড হয়।
export function parseProductMsg(text?: string | null): { name: string; price: string; slug: string; href: string } | null {
  if (!text) return null;
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length < 3 || lines.length > 4) return null;
  const m = lines[lines.length - 1].match(/^https?:\/\/[^/\s]+\/product\/([^/?#\s]+)\/?$/i);
  if (!m) return null;
  return { name: lines[0], price: lines[1], slug: m[1], href: `/product/${m[1]}` };
}

export function ProductMsgCard({ text, mine }: { text: string; mine?: boolean }) {
  const p = parseProductMsg(text);
  const [prod, setProd] = useState<Product | null>(null);
  useEffect(() => {
    if (!p) return;
    let on = true;
    catalogApi.product(p.slug, 0).then((r) => { if (on) setProd(r); }).catch(() => {});
    return () => { on = false; };
  }, [p?.slug]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!p) return null;
  const img = prod?.images?.[0]?.url;
  const price = prod ? `${Math.round(prod.price)} Tk` : p.price;
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-white text-ink" style={{ width: 230, maxWidth: "100%" }}>
      <a href={p.href} className="relative block bg-[#faf7f8]" style={{ aspectRatio: "1 / 1" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {img ? <img src={imageUrl(img)} alt={p.name} loading="lazy" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", maxWidth: "none", objectFit: "contain" }} />
          : <span className="absolute inset-0 grid place-items-center text-3xl">🛍️</span>}
      </a>
      <div className="p-2.5">
        <p className="line-clamp-2 text-[13px] font-semibold leading-snug">{prod?.name ?? p.name}</p>
        <p className="mt-0.5 text-sm font-bold text-brand-600">{price}</p>
        <a href={p.href} className="mt-2 block rounded-lg bg-brand-600 py-2 text-center text-sm font-semibold text-white hover:bg-brand-700">View &amp; order</a>
      </div>
    </div>
  );
}
