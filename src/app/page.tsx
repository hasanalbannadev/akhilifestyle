import type { Metadata } from "next";
import { HeroSlider } from "@/components/home/HeroSlider";
import { FeatureStrip } from "@/components/home/FeatureStrip";
import { CategoryCircles } from "@/components/home/CategoryCircles";
import { SectionHeader } from "@/components/home/SectionHeader";
import { OfferBanners } from "@/components/home/OfferBanners";
import { PromoBanner } from "@/components/home/PromoBanner";
import { ProductGrid } from "@/components/product/ProductGrid";
import { catalogApi } from "@/lib/api/catalog";
import { safe } from "@/lib/api/safe";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: `${SITE.name} - ব্যাগ, জুয়েলারি ও লাইফস্টাইল অ্যাক্সেসরিজ | ক্যাশ অন ডেলিভারি` },
  alternates: { canonical: "/" },
};

// হোম পেজ: Banner -> Feature -> Category -> Best Seller -> Promo -> New Arrival
export default async function HomePage() {
  const [banners, categories, best, fresh, offers] = await Promise.all([
    safe(catalogApi.banners(), []),
    safe(catalogApi.categories(), []),
    safe(catalogApi.bestSellers(6), []),
    safe(catalogApi.newArrivals(8), []),
    safe(catalogApi.offers(), []),
  ]);
  const topCategories = categories.filter((c) => !c.parent_id);

  return (
    <div className="space-y-2.5 md:space-y-3">
      <HeroSlider banners={banners} />
      <FeatureStrip />
      <CategoryCircles categories={topCategories} />

      {best.length > 0 && (
        <section>
          <SectionHeader title="বেস্ট সেলার" href="/shop" />
          <ProductGrid products={best} cols="lg:grid-cols-6" />
        </section>
      )}

      {offers.length > 0 ? <OfferBanners offers={offers} /> : <PromoBanner />}

      {fresh.length > 0 && (
        <section>
          <SectionHeader title="নতুন পণ্য" href="/shop?sort=new" />
          <ProductGrid products={fresh} />
        </section>
      )}

      {best.length === 0 && fresh.length === 0 && (
        <p className="py-10 text-center text-muted">পণ্য শীঘ্রই যোগ করা হচ্ছে। একটু পরে আবার দেখুন।</p>
      )}
    </div>
  );
}
