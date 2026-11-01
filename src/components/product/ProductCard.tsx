"use client";
import Link from "next/link";
import { useState } from "react";
import { SmartImage } from "@/components/ui/SmartImage";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { PriceTag } from "./PriceTag";
import { WishlistButton } from "./WishlistButton";
import { AddToCartButton } from "./AddToCartButton";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { discountPercent } from "@/lib/format";
import type { Product } from "@/types";

// পণ্যের কার্ড (হোম, ক্যাটাগরি, রিলেটেড সব জায়গায় একই)।
// রং থাকলে: রং বাটন (radio) চাপলে সেই রং বাছাই হয় ও কার্ডের ছবি সেই রঙের ছবি হয়ে যায়।
export function ProductCard({ p, priority = false }: { p: Product; priority?: boolean }) {
  const off = discountPercent(p.price, p.compare_at_price);
  const colors = p.colors ?? [];
  const [colorId, setColorId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const { add } = useCart();
  const toast = useToast();
  const color = colors.find((c) => c.id === colorId) ?? null;
  const img = color?.images?.[0] ?? p.images[0]?.url;
  const soldOut = color ? color.stock < 1 : p.stock < 1;

  async function addWithColor() {
    if (!color) { toast("আগে একটা রং বাছুন", "error"); return; }
    setBusy(true);
    await add(p.id, 1, color.id);
    setBusy(false);
  }

  return (
    <article className="group flex flex-col rounded-lg border border-line bg-white p-2 transition-shadow hover:shadow-md">
      <div className="relative overflow-hidden rounded-md bg-brand-50/60">
        <Link href={`/product/${p.slug}`} aria-label={p.name}>
          {/* key: রং বদলালে ছবি নতুন করে লোড হয় (আগের ছবি ফেল করলেও আটকে থাকে না) */}
          <SmartImage key={img} src={img} alt={p.name} priority={priority}
            className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105" />
        </Link>
        <WishlistButton productId={p.id} className="absolute right-1.5 top-1.5" />
        {off > 0 && <span className="absolute left-1.5 top-1.5 rounded bg-brand-600 px-1 py-0.5 text-[10px] font-bold text-white">{off}%</span>}
        {p.stock < 1 && <span className="absolute inset-x-0 bottom-0 bg-navy/70 py-0.5 text-center text-[11px] text-white">স্টক শেষ</span>}
      </div>
      <Link href={`/product/${p.slug}`} className="mt-1.5 line-clamp-2 min-h-9 text-[13px] font-medium leading-[18px] hover:text-brand-600">
        {p.name}
      </Link>
      <div className="mt-0.5"><PriceTag price={p.price} compare={p.compare_at_price} /></div>
      {colors.length > 0 && (
        <div role="radiogroup" aria-label="রং" className="mt-1 flex flex-wrap items-center gap-1.5">
          {colors.slice(0, 6).map((c) => {
            const on = c.id === colorId;
            return (
              <button key={c.id} type="button" role="radio" aria-checked={on} aria-label={c.name} title={c.name}
                disabled={c.stock < 1}
                onClick={() => setColorId(on ? null : c.id)}
                className={`h-[18px] w-[18px] rounded-full border border-black/15 transition disabled:cursor-not-allowed disabled:opacity-30 ${
                  on ? "ring-2 ring-brand-600 ring-offset-1" : "hover:scale-110"}`}
                style={{ background: c.hex || "#ddd" }} />
            );
          })}
          {colors.length > 6 && <span className="text-[11px] text-muted">+{colors.length - 6}</span>}
          {color && <span className="text-[11px] text-muted">{color.name}</span>}
        </div>
      )}
      <div className="mt-auto pt-2">
        {colors.length > 0 ? (
          soldOut && p.stock < 1
            ? <Button disabled variant="soft" size="sm" className="min-h-8 h-auto! w-full px-2 py-1 text-[13px] leading-tight">স্টক শেষ</Button>
            : <Button size="sm" loading={busy} disabled={soldOut} onClick={addWithColor} className="min-h-8 h-auto! w-full px-2 py-1 text-[13px] leading-tight">
                {!busy && <Icon name="bag" className="h-4 w-4 shrink-0" />} কার্টে যোগ করুন
              </Button>
        ) : (
          <AddToCartButton productId={p.id} stock={p.stock} className="min-h-8 h-auto! px-2 py-1 text-[13px] leading-tight" />
        )}
      </div>
    </article>
  );
}
