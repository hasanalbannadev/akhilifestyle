"use client";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";

// ডেস্কটপ ও ট্যাবে "← ফিরে যান" (মোবাইলে লুকানো, সেখানে ফোনের Back আছে): যে পেজ থেকে এসেছিল সেখানে ফেরে। আগের পেজ না থাকলে (সরাসরি লিংকে ঢুকলে) হোমে যায়।
export function BackButton({ label = "ফিরে যান" }: { label?: string }) {
  const router = useRouter();
  const back = () => { if (window.history.length > 1) router.back(); else router.push("/"); };
  return (
    <button type="button" onClick={back} className="mb-3 hidden items-center gap-1 md:inline-flex rounded-full border border-line bg-white px-3 py-1.5 text-sm font-medium text-ink hover:bg-brand-50">
      <Icon name="chevron-left" className="h-4 w-4" /> {label}
    </button>
  );
}
