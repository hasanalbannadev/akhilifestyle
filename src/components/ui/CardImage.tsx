"use client";
import { useEffect, useState } from "react";
import { imageUrl, PLACEHOLDER } from "@/lib/image";

// পণ্য কার্ডের ছবি: সব কার্ডে ছবির বাক্স একই বর্গ মাপের।
// - বড় ছবি (লম্বা/চওড়া যাই হোক) ছোট হয়ে বাক্সের ভেতরে পুরোটা দেখায়, কখনো কাটা পড়ে না।
// - ছোট ছবি নিজের মাপেই মাঝখানে বসে, চারপাশে ফাঁকা থাকে (বড় করে ঝাপসা করা হয় না)।
// - ছবির কোণ গোল, চারপাশে সামান্য গ্যাপ।
export function CardImage({ src, alt, priority = false }: { src?: string | null; alt: string; priority?: boolean }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => { setFailed(false); }, [src]);
  return (
    <span className="relative block aspect-square w-full">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={failed ? PLACEHOLDER : imageUrl(src)} alt={alt} loading={priority ? "eager" : "lazy"} decoding="async"
        onError={() => setFailed(true)}
        style={{ maxWidth: "calc(100% - 12px)", maxHeight: "calc(100% - 12px)" }}
        className="absolute inset-1.5 m-auto h-auto w-auto rounded-lg object-contain" />
    </span>
  );
}
