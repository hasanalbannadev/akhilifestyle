"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { SupportChat } from "@/components/account/SupportChat";
import { useAuth } from "@/context/AuthContext";
import { supportApi } from "@/lib/api/support";
import { SITE } from "@/lib/site";

// না-দেখা মেসেজের সংখ্যা (শুধু লগইন করা কাস্টমারের, উইন্ডো বন্ধ থাকলে)। চ্যাট খুললে "support-seen" এ ০।
function useUnread(enabled: boolean) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!enabled) { setN(0); return; }
    let alive = true;
    const load = () => { if (!document.hidden) supportApi.unread().then((r) => alive && setN(r.count)).catch(() => {}); };
    load();
    const t = setInterval(load, 5000);
    const seen = () => setN(0);
    window.addEventListener("support-seen", seen);
    return () => { alive = false; clearInterval(t); window.removeEventListener("support-seen", seen); };
  }, [enabled]);
  return n;
}

// ডান নিচে ভাসমান চ্যাট আইকন। ডেস্কটপে ছোট চ্যাট উইন্ডো খোলে; মোবাইলে সরাসরি পুরো চ্যাট পেজে (/account/support) যায়।
export function ChatWidget() {
  const path = usePathname() || "/";
  const router = useRouter();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const unread = useUnread(!!user && !open);
  const wa = SITE.whatsapp ? `https://wa.me/${SITE.whatsapp.replace(/\D/g, "")}` : "";   // .env এ থাকলে উইন্ডোর নিচে ছোট লিংক

  const onSupport = path.startsWith("/account/support");
  useEffect(() => { if (onSupport) setOpen(false); }, [onSupport]);   // পুরো চ্যাট পেজে গেলে (যেভাবেই যান) ছোট উইন্ডো বন্ধ হয়ে যায়

  if (onSupport) return null;   // পুরো চ্যাট পেজে একই চ্যাট দুবার দেখানো হবে না

  const click = () => {
    if (window.matchMedia("(min-width: 768px)").matches) { setOpen((o) => !o); return; }
    router.push(user ? "/account/support" : "/login?next=/account/support");
  };

  return (
    <>
      {open && (
        <div role="dialog" aria-label="চ্যাট"
          className="fixed bottom-24 right-6 z-50 hidden h-[520px] max-h-[calc(100vh-7rem)] w-[380px] flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-2xl md:flex">
          <div className="flex items-center gap-2 bg-brand-600 px-4 py-3 text-white">
            <div className="min-w-0 flex-1">
              <p className="truncate font-bold leading-tight">Akhi Lifestyle</p>
              <p className="text-xs text-white/85">সাপোর্ট</p>
            </div>
            {user && <Link href="/account/support" onClick={() => setOpen(false)} className="rounded-full px-2.5 py-1 text-xs font-semibold hover:bg-white/15">বড় করুন</Link>}
            <button type="button" onClick={() => setOpen(false)} aria-label="বন্ধ করুন" className="grid h-8 w-8 place-items-center rounded-full hover:bg-white/15">
              <Icon name="x" className="h-5 w-5" />
            </button>
          </div>
          <div className="min-h-0 flex-1">
            {user ? <SupportChat compact /> : (
              <div className="grid h-full place-items-center p-6 text-center">
                <div>
                  <p className="font-semibold">চ্যাট করতে লগইন করুন</p>
                  <p className="mt-1 text-sm text-muted">লগইন করলে আপনার আগের মেসেজও এখানে দেখতে পাবেন।</p>
                  <Link href="/login?next=/account/support" onClick={() => setOpen(false)}
                    className="mt-4 inline-block rounded-full bg-brand-600 px-6 py-2 text-sm font-semibold text-white hover:bg-brand-700">লগইন করুন</Link>
                </div>
              </div>
            )}
          </div>
          {(wa || SITE.messenger) && (
            <p className="border-t border-line px-4 py-2 text-center text-xs text-muted">
              {wa && <a href={wa} target="_blank" rel="noopener noreferrer" className="font-medium text-brand-600 hover:underline">WhatsApp-এ লিখুন</a>}
              {wa && SITE.messenger && " · "}
              {SITE.messenger && <a href={SITE.messenger} target="_blank" rel="noopener noreferrer" className="font-medium text-brand-600 hover:underline">Messenger-এ লিখুন</a>}
            </p>
          )}
        </div>
      )}
      <button type="button" onClick={click} aria-label={open ? "চ্যাট বন্ধ করুন" : "চ্যাটে যোগাযোগ করুন"}
        className="fixed bottom-20 right-4 z-30 grid h-12 w-12 place-items-center rounded-full bg-brand-600 text-white shadow-lg shadow-brand-600/30 hover:bg-brand-700 md:bottom-6 md:right-6 md:z-50">
        <Icon name={open ? "x" : "chat"} className="h-6 w-6" />
        {!open && unread > 0 && (
          <span className="absolute -right-1 -top-1 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">{unread > 99 ? "99+" : unread}</span>
        )}
      </button>
    </>
  );
}
