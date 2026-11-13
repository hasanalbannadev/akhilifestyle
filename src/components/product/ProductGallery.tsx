"use client";
import { useEffect, useMemo, useState } from "react";
import { FitImage } from "@/components/ui/FitImage";
import { MediaThumb } from "@/components/ui/MediaThumb";
import { WishlistButton } from "./WishlistButton";
import { useColor } from "./ColorContext";
import { cn } from "@/lib/format";
import { imageUrl } from "@/lib/image";
import { isVideo } from "@/lib/media";
import type { ProductImage } from "@/types";

// বড় ছবি ডানে, বামে ছোট থাম্বনেইল (মোবাইলেও পাশে)।
// কোনো রং বাছলে সেই রঙের ছবি আগে আসে, আর প্রথমটা বড় ছবির জায়গায় বসে।
// থাম্বনেইলে ভিডিও থাকলে চাপ দিলে বড় ছবির জায়গায় ভিডিও চলে। ছবি কাটা পড়ে না, পুরোটা দেখায়।
export function ProductGallery({ images, name, productId }: { images: ProductImage[]; name: string; productId: number }) {
  const { color } = useColor();
  const list = useMemo(() => {
    const own = (color?.images ?? []).map((url, i) => ({ id: -(i + 1), url, sort_order: i }));
    const seen = new Set(own.map((i) => i.url));
    const rest = images.filter((im) => !seen.has(im.url));
    const all: ProductImage[] = [...own, ...rest];
    return all.length ? all : [{ id: 0, url: "", sort_order: 0 }];
  }, [images, color]);
  const [active, setActive] = useState(0);
  useEffect(() => { setActive(0); }, [color?.id]); // রং বদলালে ওই রঙের প্রথম ছবি বড় ছবি হবে
  const cur = list[Math.min(active, list.length - 1)];
  const isVid = isVideo(cur?.url);
  const [playing, setPlaying] = useState(false);
  useEffect(() => { setPlaying(false); }, [cur?.url]); // ভিডিও আগে থাম্বনেইল হিসেবে আসে, চাপলে চলে

  return (
    <div className="flex flex-row-reverse items-start gap-2.5 sm:gap-3">
      <div className="relative min-w-0 flex-1 self-start overflow-hidden rounded-2xl border border-line bg-brand-50/50">
        {isVid ? (
          playing ? (
            <video key={cur.url} src={imageUrl(cur.url)} controls autoPlay playsInline preload="auto"
              className="aspect-video w-full bg-black object-contain" />
          ) : (
            <button type="button" onClick={() => setPlaying(true)} aria-label={`ভিডিও চালান: ${name}`}
              className="group relative block aspect-video w-full bg-black text-left">
              <video src={`${imageUrl(cur.url)}#t=0.1`} preload="metadata" muted playsInline
                className="pointer-events-none h-full w-full object-contain" />
              <span className="absolute inset-0 flex items-center justify-center bg-black/25 transition group-hover:bg-black/35">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/95 text-brand-600 shadow-lg">
                  <svg viewBox="0 0 24 24" className="ml-1 h-7 w-7" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
                </span>
              </span>
              <span className="absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-black/70 to-transparent px-3 pb-2 pt-6 text-sm font-semibold text-white">{name}</span>
            </button>
          )
        ) : (
          <FitImage key={cur?.url} src={cur?.url} alt={name} priority />
        )}
        <WishlistButton productId={productId} className="absolute right-3 top-3 h-10 w-10" />
      </div>
      {list.length > 1 && (
        <div className="no-scrollbar flex max-h-[26rem] w-14 shrink-0 flex-col gap-2 overflow-y-auto sm:w-20">
          {list.map((im, i) => (
            <button key={`${im.id}-${im.url}`} onClick={() => setActive(i)} aria-label={isVideo(im.url) ? `ভিডিও ${i + 1}` : `ছবি ${i + 1}`}
              className={cn("aspect-square w-full shrink-0 overflow-hidden rounded-lg border-2 bg-white", i === active ? "border-brand-600" : "border-line")}>
              <MediaThumb src={im.url} alt={`${name} ${i + 1}`} className="h-full w-full object-contain" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
