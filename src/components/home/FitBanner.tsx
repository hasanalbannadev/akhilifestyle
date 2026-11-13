"use client";
import Link from "next/link";
import { SmartImage } from "@/components/ui/SmartImage";

// কম উচ্চতার ব্যানার: যে ছবিই দিন পুরোটা দেখায় (কাটা পড়ে না), ফ্রেমের ফাঁকা অংশ ওই ছবিরই ঝাপসা রঙে ভরে।
// পুরো ব্যানার চাপলে লিংকে যায়। বাটন থাকলে ব্যানারের ডান পাশে ভেতরেই বসে (বাটনও একই লিংকে নিয়ে যায়)।
export function FitBanner({ src, alt, href, button, ratio = "aspect-[5/1] sm:aspect-[8/1]", badge, className = "" }: {
  src?: string | null; alt: string; href: string; button?: string | null; ratio?: string; badge?: string; className?: string;
}) {
  const inner = (
    <div className={`relative overflow-hidden rounded-xl bg-brand-50 ${ratio} ${className}`}>
      <SmartImage src={src} alt="" className="absolute inset-0 h-full w-full scale-110 object-cover opacity-90 blur-2xl" />
      <SmartImage src={src} alt={alt} className="relative h-full w-full object-contain" />
      {badge && <span className="absolute left-1.5 top-1.5 rounded-full bg-brand-600 px-2 py-0.5 text-[10px] font-bold text-white shadow sm:left-2 sm:top-2 sm:px-2.5 sm:text-xs">{badge}</span>}
      {button && (
        <span className="absolute right-2 top-1/2 max-w-[45%] -translate-y-1/2 truncate rounded-lg bg-brand-600 px-2.5 py-1 text-[11px] font-bold text-white shadow-md sm:right-4 sm:px-4 sm:py-2 sm:text-sm">{button}</span>
      )}
    </div>
  );
  const cls = "group block";
  return href.startsWith("http")
    ? <a href={href} aria-label={alt} className={cls}>{inner}</a>
    : <Link href={href} aria-label={alt} className={cls}>{inner}</Link>;
}
