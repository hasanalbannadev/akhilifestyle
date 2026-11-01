"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo } from "@/components/ui/Logo";
import { Icon } from "@/components/ui/Icon";
import { SearchBox } from "./SearchBox";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";
import type { Category } from "@/types";

function Badge({ n }: { n: number }) {
  if (!n) return null;
  return (
    <span className="absolute -right-1.5 max-[359px]:-right-0.5 -top-1.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-brand-600 px-1 text-[10px] font-bold text-white">
      {n > 99 ? "99+" : n}
    </span>
  );
}

function IconLink({ href, label, icon, badge = 0 }: { href: string; label: string; icon: string; badge?: number }) {
  return (
    <Link href={href} aria-label={label} className="relative grid h-9 w-9 max-[359px]:h-8 max-[359px]:w-8 place-items-center rounded-full text-ink hover:bg-brand-50 sm:h-10 sm:w-10">
      <Icon name={icon} className="h-[22px] w-[22px]" />
      <Badge n={badge} />
    </Link>
  );
}

// categories server (layout.tsx) থেকে আসে
export function Header({ categories }: { categories: Category[] }) {
  const { cart } = useCart();
  const { user } = useAuth();
  const { ids } = useWishlist();
  const [menu, setMenu] = useState(false);
  // টপ বারে কোন ক্যাটাগরি কোন ক্রমে - admin panel এর "Top bar position" (০ = দেখাবে না)। পুরোনো backend হলে আগের মতো প্রথম ৫টা।
  const mains = categories.filter((c) => !c.parent_id);
  const top = mains.some((c) => c.nav_order !== undefined)
    ? mains.filter((c) => (c.nav_order ?? 0) > 0).sort((a, b) => (a.nav_order ?? 0) - (b.nav_order ?? 0))
    : mains.slice(0, 5);

  // মেনু খোলা থাকলে পেছনের পেজ স্ক্রল হবে না
  useEffect(() => {
    if (!menu) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [menu]);

  return (
    <>
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur">
      <div className="container-x flex h-14 items-center gap-1.5 sm:gap-3 lg:gap-5">
        <button className="grid h-9 w-9 max-[359px]:h-8 max-[359px]:w-8 shrink-0 place-items-center rounded-full hover:bg-brand-50 sm:h-10 sm:w-10 lg:hidden" onClick={() => setMenu(true)} aria-label="মেনু">
          <Icon name="menu" />
        </button>
        <Logo />
        {/* ডেস্কটপে মেনু লোগোর পাশেই, তাই আলাদা সারি লাগে না */}
        <nav className="hidden min-w-0 lg:block" aria-label="ক্যাটাগরি">
          <ul className="no-scrollbar flex items-center gap-5 overflow-x-auto text-[14px] font-medium">
            <li><Link href="/" className="whitespace-nowrap hover:text-brand-600">হোম</Link></li>
            {top.map((c) => (
              <li key={c.id}><Link href={`/category/${c.slug}`} className="whitespace-nowrap hover:text-brand-600">{c.name}</Link></li>
            ))}
            <li><Link href="/shop" className="whitespace-nowrap text-brand-600 hover:underline">সব পণ্য</Link></li>
          </ul>
        </nav>
        <SearchBox className="mx-auto hidden max-w-md flex-1 md:block" />
        <div className="ml-auto flex shrink-0 items-center gap-0 sm:gap-1 md:ml-0">
          <IconLink href={user ? "/account" : "/login"} label="অ্যাকাউন্ট" icon="user" />
          <IconLink href="/account/wishlist" label="পছন্দের তালিকা" icon="heart" badge={ids.size} />
          <IconLink href="/cart" label="কার্ট" icon="bag" badge={cart.count} />
        </div>
      </div>

      {/* মোবাইলে সার্চ নিচের লাইনে */}
      <div className="container-x pb-2 md:hidden"><SearchBox /></div>

    </header>

    {/* মোবাইল সাইড মেনু */}
    {menu && (
      <div className="fixed inset-0 z-[60] lg:hidden">
        <div className="absolute inset-0 bg-navy/50" onClick={() => setMenu(false)} />
        <aside className="absolute left-0 top-0 h-full w-72 max-w-[85%] overflow-y-auto bg-white p-5 shadow-xl">
          <div className="mb-5 flex items-center justify-between">
            <Logo />
            <button onClick={() => setMenu(false)} aria-label="বন্ধ করুন"><Icon name="x" /></button>
          </div>
          <ul className="space-y-1 text-[15px]" onClick={() => setMenu(false)}>
            <li><Link className="block rounded-lg px-3 py-2.5 hover:bg-brand-50" href="/">হোম</Link></li>
            <li><Link className="block rounded-lg px-3 py-2.5 hover:bg-brand-50" href="/shop">সব পণ্য</Link></li>
            {top.map((c) => (
              <li key={c.id}><Link className="block rounded-lg px-3 py-2.5 hover:bg-brand-50" href={`/category/${c.slug}`}>{c.name}</Link></li>
            ))}
            <li className="my-2 border-t border-line" />
            <li><Link className="block rounded-lg px-3 py-2.5 hover:bg-brand-50" href="/track">অর্ডার ট্র্যাক করুন</Link></li>
            <li><Link className="block rounded-lg px-3 py-2.5 hover:bg-brand-50" href="/contact">যোগাযোগ</Link></li>
          </ul>
        </aside>
      </div>
    )}
    </>
  );
}
