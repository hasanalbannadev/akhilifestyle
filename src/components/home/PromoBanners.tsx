import { FitBanner } from "./FitBanner";
import { LinkButton } from "@/components/ui/Button";
import type { Banner } from "@/types";

// admin panel এর "Promo" ব্যানার (পণ্যের সারির নিচে)। ছবি দিলে কম উচ্চতার ব্যানারে পুরো ছবি (কাটা পড়ে না),
// চাইলে ডান পাশে বাটন; ব্যানার চাপলে লিংকে যায়। ছবি না দিলে লেখা + অফারের দাম + বোতাম।
export function PromoBanners({ banners }: { banners: Banner[] }) {
  return (
    <div className="space-y-2.5">
      {banners.map((b) => {
        const link = b.link_url || "/shop";
        if (b.image_url) {
          return <FitBanner key={b.id} src={b.image_url} alt={b.title || "অফার"} href={link} button={b.button_text} />;
        }
        return (
          <section key={b.id} className="flex items-center justify-between gap-4 overflow-hidden rounded-xl bg-gradient-to-r from-brand-100 via-brand-50 to-white px-5 py-3 md:px-10">
            <div className="min-w-0">
              <h2 className="break-words text-lg font-extrabold md:text-xl">{b.title}</h2>
              {b.subtitle && <p className="break-words text-sm font-bold text-brand-600 md:text-base">{b.subtitle}</p>}
            </div>
            <LinkButton href={link} size="sm" className="shrink-0">{b.button_text || "এখনই কিনুন"}</LinkButton>
          </section>
        );
      })}
    </div>
  );
}
