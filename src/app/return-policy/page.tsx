import type { Metadata } from "next";
import { withOg, applySeo, seoFor, RETURN_DAYS, SHIP_DHAKA, SHIP_OUTSIDE } from "@/lib/seo";
import { StaticPage } from "@/components/layout/StaticPage";

const baseMetadata: Metadata = withOg({
  title: "রিটার্ন ও রিফান্ড পলিসি",
  description: "পণ্য রিটার্ন ও রিফান্ডের নিয়ম।",
  alternates: { canonical: "/return-policy" },
});

export default function Page() {
  return (
    <StaticPage title="রিটার্ন ও রিফান্ড পলিসি">
      <ul>
        <li>ডেলিভারি পাওয়ার {RETURN_DAYS} দিনের মধ্যে পণ্যে সমস্যা থাকলে অ্যাকাউন্টের অর্ডার পেজ থেকে রিটার্ন অনুরোধ করুন।</li>
        <li>পণ্য অব্যবহৃত ও আসল অবস্থায় থাকতে হবে।</li>
        <li>অনুমোদনের পর রিফান্ড প্রক্রিয়া শুরু হয়।</li>
        <li>রিফান্ডের সময় ডেলিভারি চার্জ ও ব্যাংক চার্জ বাদ দিয়ে বাকি সম্পূর্ণ টাকা ফেরত দেওয়া হবে।</li>
        <li>ডেলিভারি চার্জ: ঢাকায় ৳{SHIP_DHAKA}, ঢাকার বাইরে ৳{SHIP_OUTSIDE} (প্রয়োজনে কুরিয়ারের ওপর নির্ভর করে খরচ কম-বেশি হতে পারে)।</li>
      </ul>
    </StaticPage>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  return applySeo(baseMetadata, await seoFor("pages", "/return-policy"));
}
