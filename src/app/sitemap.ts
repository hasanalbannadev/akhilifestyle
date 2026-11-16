import type { MetadataRoute } from "next";
import { catalogApi } from "@/lib/api/catalog";
import { seoApi } from "@/lib/api/seo";
import { safe } from "@/lib/api/safe";
import { SITE } from "@/lib/site";

export const revalidate = 3600;

// sitemap.xml: সব ক্যাটাগরি ও পণ্যের লিংক নিজে নিজে তৈরি হয়। অ্যাডমিনে "Hide from Google" দেওয়া পেজ বাদ যায়।
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const seo = await seoApi.all(3600);
  const staticPages = ["", "/shop", "/categories", "/track", "/about", "/contact", "/privacy", "/terms", "/return-policy"]
    .filter((p) => !seo.pages[p === "" ? "/" : p]?.noindex)
    .map((p) => ({ url: `${SITE.url}${p}`, lastModified: now, changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.6 }));

  const categories = await safe(catalogApi.categories(3600), []);
  const catPages = categories.filter((c) => !seo.categories[c.slug]?.noindex).map((c) => ({
    url: `${SITE.url}/category/${c.slug}`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.7,
  }));

  // সর্বোচ্চ ৫০ পেজ × ৬০ = ৩০০০ পণ্য।
  const products = [];
  for (let page = 1; page <= 50; page++) {
    const res = await safe(catalogApi.products({ page, page_size: 60 }, 3600), null);
    if (!res || res.items.length === 0) break;
    products.push(...res.items);
    if (products.length >= res.total) break;
  }
  const productPages = products.filter((p) => !seo.products[p.slug]?.noindex).map((p) => ({
    url: `${SITE.url}/product/${p.slug}`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.8,
  }));

  return [...staticPages, ...catPages, ...productPages];
}
