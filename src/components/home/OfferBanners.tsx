import Link from "next/link";
import { SmartImage } from "@/components/ui/SmartImage";
import type { Offer } from "@/types";

// অ্যাডমিন প্যানেলের "Offers" থেকে লাইভ অফারের ব্যানার। ব্যানারে ক্লিক করলে অফারের পণ্যের পেজে যায়।
export function OfferBanners({ offers }: { offers: Offer[] }) {
  const many = offers.length > 1;
  return (
    <section aria-label="অফার" className={many ? "grid gap-2.5 md:grid-cols-2" : ""}>
      {offers.map((o) => (
        <Link key={o.id} href={`/offers/${o.slug}`} aria-label={`${o.title} - ${o.percent}% ছাড়`}
          className="group relative block overflow-hidden rounded-xl bg-brand-50">
          <div className={many ? "aspect-[16/6]" : "aspect-[16/6] sm:aspect-[21/5]"}>
            <SmartImage src={o.banner_url} alt={o.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]" />
          </div>
          <span className="absolute left-2 top-2 rounded-full bg-brand-600 px-2.5 py-0.5 text-xs font-bold text-white shadow">{o.percent}% ছাড়</span>
        </Link>
      ))}
    </section>
  );
}
