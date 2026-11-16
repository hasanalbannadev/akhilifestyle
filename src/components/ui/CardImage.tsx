"use client";
import { useEffect, useState } from "react";
import { imageUrl, PLACEHOLDER } from "@/lib/image";

// পণ্য কার্ডের ছবি: সব কার্ডে ছবির বাক্স হুবহু একই বর্গ মাপের (স্ট্যান্ডার্ড)।
// - বড় ছবি ছোট হয়ে বাক্সে ঢোকে, ছোট ছবি বড় হয়ে বাক্স ভরে — দুটোই একই মাপে দেখায়।
// - কখনো কাটা পড়ে না (পুরো ছবি দেখা যায়), ছবির অনুপাত বদলায় না (লম্বা/চওড়া হয় না)।
// - ছবি আসল রেজোলিউশনেই থাকে; ব্রাউজার শুধু দেখানোর মাপ বদলায়, ফাইল কমপ্রেস হয় না।
export function CardImage({ src, alt, priority = false }: { src?: string | null; alt: string; priority?: boolean }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => { setFailed(false); }, [src]);
  return (
    <span className="relative block aspect-square w-full overflow-hidden rounded-lg" style={{ background: "#faf7f8" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={failed ? PLACEHOLDER : imageUrl(src)} alt={alt} loading={priority ? "eager" : "lazy"} decoding="async"
        onError={() => setFailed(true)}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", maxWidth: "none", objectFit: "contain", objectPosition: "center" }} />
    </span>
  );
}
