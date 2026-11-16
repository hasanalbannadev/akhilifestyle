// অ্যাডমিন প্যানেল থেকে বসানো SEO (title / description / keywords / noindex)। API বন্ধ থাকলে খালি ফেরত দেয়।
import { api } from "./client";
import { safe } from "./safe";

export interface SeoEntry { title?: string; description?: string; keywords?: string; noindex?: boolean }
export interface SeoMap { pages: Record<string, SeoEntry>; categories: Record<string, SeoEntry>; products: Record<string, SeoEntry> }
const EMPTY: SeoMap = { pages: {}, categories: {}, products: {} };

export const seoApi = {
  all: (revalidate = 300) => safe(api<SeoMap>("/seo", { revalidate }), EMPTY),
};
