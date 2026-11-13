import { FitBanner } from "./FitBanner";
import type { Offer } from "@/types";

// অ্যাডমিন প্যানেলের "Offers" থেকে লাইভ অফারের ব্যানার (কম উচ্চতা, পুরো ছবি, ডান পাশে বাটন)।
// লেখা, বাটন ও লিংক অ্যাডমিন থেকে বদলানো যায়; লিংক না দিলে অফারের পণ্যের পেজে যায়।
export function OfferBanners({ offers }: { offers: Offer[] }) {
  return (
    <section aria-label="অফার" className="space-y-2.5">
      {offers.map((o) => (
        <FitBanner key={o.id} src={o.banner_url} alt={`${o.title} - ${o.percent}% ছাড়`} href={o.link_url || `/offers/${o.slug}`}
          button={o.button_text} badge={`${o.percent}% ছাড়`} />
      ))}
    </section>
  );
}
