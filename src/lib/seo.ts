// SEO এর সাহায্যকারী: canonical url, JSON-LD
import { SITE } from "@/lib/site";
import { imageUrl } from "@/lib/image";
import { stripHtml } from "@/lib/format";
import type { Product } from "@/types";
import type { Metadata } from "next";

// রিটার্ন ও ডেলিভারির তথ্য — এখানে বদলালে পণ্য কোড ও পলিসি পেজ দুটোতেই বদলাবে
export const RETURN_DAYS = 7;          // কত দিনের মধ্যে রিটার্ন
export const SHIP_DHAKA = 60;          // ঢাকায় ডেলিভারি চার্জ
export const SHIP_OUTSIDE = 120;       // ঢাকার বাইরে
export const HANDLE_DAYS = [0, 1];     // প্যাকিং: কত দিন
export const TRANSIT_DAYS = [1, 4];    // পৌঁছাতে: কত দিন

export const absUrl = (path: string) => `${SITE.url}${path.startsWith("/") ? path : "/" + path}`;

export function productJsonLd(p: Product, rating?: { average: number | null; count: number }) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: stripHtml(p.description, 300) || p.name,
    image: p.images.map((i) => imageUrl(i.url)),
    sku: String(p.id),
    brand: { "@type": "Brand", name: SITE.name },
    offers: {
      "@type": "Offer",
      url: absUrl(`/product/${p.slug}`),
      priceCurrency: "BDT",
      price: p.price,
      availability: p.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "BD",
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: RETURN_DAYS,
        returnMethod: "https://schema.org/ReturnByMail",
        returnFees: "https://schema.org/ReturnShippingFees",
      },
      shippingDetails: [SHIP_DHAKA, SHIP_OUTSIDE].map((fee, i) => ({
        "@type": "OfferShippingDetails",
        shippingRate: { "@type": "MonetaryAmount", value: fee, currency: "BDT" },
        shippingDestination: { "@type": "DefinedRegion", addressCountry: "BD", ...(i === 0 ? { addressRegion: "Dhaka" } : {}) },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: { "@type": "QuantitativeValue", minValue: HANDLE_DAYS[0], maxValue: HANDLE_DAYS[1], unitCode: "DAY" },
          transitTime: { "@type": "QuantitativeValue", minValue: TRANSIT_DAYS[0], maxValue: TRANSIT_DAYS[1], unitCode: "DAY" },
        },
      })),
    },
    ...(rating && rating.count > 0 && rating.average
      ? { aggregateRating: { "@type": "AggregateRating", ratingValue: rating.average, reviewCount: rating.count } }
      : {}),
  };
}

export const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE.name,
  url: SITE.url,
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE.url}/shop?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

export const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE.name,
  url: SITE.url,
  email: SITE.email,
  telephone: SITE.phone,
};

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem", position: i + 1, name: it.name, item: absUrl(it.path),
    })),
  };
}

// প্রতি পেজের নিজস্ব title/description/url দিয়ে og + twitter বানায়।
// (না দিলে Next হোমপেজের og:title/og:url inherit করে → WhatsApp/Facebook এ সব লিংকে একই প্রিভিউ দেখায়)
export function withOg(m: Metadata, path?: string): Metadata {
  const t = typeof m.title === "string" ? m.title : SITE.name;
  const title = t.includes(SITE.name) ? t : `${t} | ${SITE.name}`;
  const canon = path ?? (m.alternates?.canonical as string | undefined);
  const desc = (m.description as string | undefined) ?? SITE.description;
  const og = (m.openGraph ?? {}) as Record<string, unknown>;
  return {
    ...m,
    openGraph: { type: "website", locale: "bn_BD", siteName: SITE.name, title, description: desc, ...(canon ? { url: canon } : {}), ...og },
    twitter: { card: "summary_large_image", title, description: desc, ...(m.twitter ?? {}) },
  } as Metadata;
}
