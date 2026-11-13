import { FitBanner } from "./FitBanner";
import type { Offer } from "@/types";

// অ্যাডমিন প্যানেলের "Offers" থেকে লাইভ অফারের ব্যানার (কম উচ্চতা, পুরো ছবি, ডান পাশে বাটন)।
// লেখা, বাটন ও লিংক অ্যাডমিন থেকে বদলানো যায়; লিংক না দিলে অফারের পণ্যের পেজে যায়।
export function OfferBanners({ offers }: { offers: Offer[] }) {
  const many = offers.length > 1;
  return (
    <section aria-label="অফার" className={many ? "grid gap-2.5 md:grid-cols-2" : ""}>
      {offers.map((o) => (
        <FitBanner key={o.id} src={o.banner_url} alt={`${o.title} - ${o.percent}% ছাড়`} href={o.link_url || `/offers/${o.slug}`}
          button={o.button_text} badge={`${o.percent}% ছাড়`} ratio={many ? "aspect-[3/1] sm:aspect-[5/1]" : "aspect-[5/1] sm:aspect-[8/1]"} />
      ))}
    </section>
  );
}
