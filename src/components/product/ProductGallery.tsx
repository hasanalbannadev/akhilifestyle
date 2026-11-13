"use client";
import { useEffect, useMemo, useState } from "react";
import { SmartImage } from "@/components/ui/SmartImage";
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
  const playing = isVideo(cur?.url);

  return (
    <div className="flex flex-row-reverse items-start gap-2.5 sm:gap-3">
      <div className="relative min-w-0 flex-1 self-start overflow-hidden rounded-2xl border border-line bg-brand-50/50">
        {playing ? (
          <video key={cur.url} src={imageUrl(cur.url)} controls autoPlay playsInline preload="metadata"
            className="aspect-square w-full bg-black object-contain" />
        ) : (
          <SmartImage key={cur?.url} src={cur?.url} alt={name} priority className="aspect-square w-full object-contain" />
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
