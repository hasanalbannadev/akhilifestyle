"use client";
import { SmartImage } from "@/components/ui/SmartImage";
import { imageUrl } from "@/lib/image";
import { isVideo } from "@/lib/media";

// ছোট প্রিভিউ: ছবি হলে ছবি, ভিডিও হলে ভিডিওর প্রথম ফ্রেম + প্লে চিহ্ন
export function MediaThumb({ src, alt, className = "h-full w-full object-cover" }: { src?: string | null; alt: string; className?: string }) {
  if (!isVideo(src)) return <SmartImage src={src} alt={alt} className={className} />;
  return (
    <span className="relative block h-full w-full bg-black">
      <video src={imageUrl(src)} muted playsInline preload="metadata" aria-label={alt} className={className} />
      <span className="absolute inset-0 grid place-items-center">
        <span className="grid h-6 w-6 place-items-center rounded-full bg-black/60 text-white">
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 translate-x-px" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
        </span>
      </span>
    </span>
  );
}
