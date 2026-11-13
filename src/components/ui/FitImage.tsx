"use client";
import { SmartImage } from "@/components/ui/SmartImage";

// ছবি নিজের মাপেই বসে: প্রস্থ ফ্রেমের সমান, উচ্চতা ছবির অনুপাত অনুযায়ী। কাটা পড়ে না, বাড়তি ফাঁকা জায়গাও থাকে না।
export function FitImage({ src, alt, priority = false, className = "" }:
  { src?: string | null; alt: string; priority?: boolean; className?: string }) {
  return <SmartImage src={src} alt={alt} priority={priority} className={`block h-auto w-full ${className}`} />;
}
