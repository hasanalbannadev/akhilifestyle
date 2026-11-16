"use client";
import { useEffect, useState } from "react";
import { catalogApi } from "@/lib/api/catalog";
import type { Category } from "@/types";
import { imageUrl } from "@/lib/image";

// স্বাগত বার্তার নিচে ক্যাটাগরির কার্ড (ছবি + নাম)। চাপলে ওয়েবসাইটের ওই ক্যাটাগরি পেজ খোলে, সেখান থেকে অর্ডার।
export function ChatCatalog() {
  const [cats, setCats] = useState<Category[]>([]);
  useEffect(() => {
    let on = true;
    catalogApi.categories(300).then((r) => { if (on) setCats(r.slice(0, 10)); }).catch(() => {});
    return () => { on = false; };
  }, []);
  if (!cats.length) return null;
  return (
    <div className="mt-2 -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
      {cats.map((c) => (
        <a key={c.id} href={`/category/${c.slug}`} className="block shrink-0 overflow-hidden rounded-xl border border-line bg-white text-ink" style={{ width: 104 }}>
          <span className="relative block bg-[#faf7f8]" style={{ aspectRatio: "1 / 1" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {c.image_url ? <img src={imageUrl(c.image_url)} alt={c.name} loading="lazy" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", maxWidth: "none", objectFit: "contain" }} />
              : <span className="absolute inset-0 grid place-items-center text-2xl">🛍️</span>}
          </span>
          <span className="block px-1.5 py-1.5 text-center text-[12px] font-semibold leading-tight">{c.name}</span>
        </a>
      ))}
    </div>
  );
}
