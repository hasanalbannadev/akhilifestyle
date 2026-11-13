"use client";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { SmartImage } from "@/components/ui/SmartImage";
import { Icon } from "@/components/ui/Icon";
import { cartApi } from "@/lib/api/cart";
import type { CouponPopup as Popup } from "@/types";

// কুপন পপআপ (পুরো সাইটের মাঝখানে): সাইটে ঢুকলে একবার ভেসে ওঠে (ট্যাব/ব্রাউজার বন্ধ করে আবার ঢুকলে আবার), কয়েক সেকেন্ড থাকে,
// কাস্টমার নিজেও ✕ চাপতে পারে। কুপন কোড কপি করা যায়। মাউস/আঙুল রাখলে সময় থেমে থাকে।
const KEY = "akhi_coupon_popup_seen";

export function CouponPopup() {
  const [p, setP] = useState<Popup | null>(null);
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const close = useCallback(() => { if (timer.current) clearTimeout(timer.current); setP(null); }, []);
  const arm = useCallback((sec: number) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(close, sec * 1000);
  }, [close]);

  useEffect(() => {
    let seen = "";
    try { seen = sessionStorage.getItem(KEY) || ""; } catch { /* private mode: show it every page load */ }
    let alive = true;
    const t = setTimeout(() => {
      cartApi.couponPopup().then((c) => {
        if (!alive || !c || seen === String(c.id)) return;
        try { sessionStorage.setItem(KEY, String(c.id)); } catch { /* ignore */ }
        setP(c);
        arm(c.seconds || 2);
      }).catch(() => {});
    }, 800);
    return () => { alive = false; clearTimeout(t); if (timer.current) clearTimeout(timer.current); };
  }, [arm]);

  if (!p) return null;
  const copy = async () => {
    if (!p.code) return;
    try { await navigator.clipboard.writeText(p.code); } catch {
      const t = document.createElement("textarea"); t.value = p.code; document.body.appendChild(t); t.select();
      try { document.execCommand("copy"); } catch { /* ignore */ } t.remove();
    }
    setCopied(true);
    arm(Math.max(p.seconds || 2, 3));       // কপি করলে একটু বেশি সময় দেখায়
  };

  const hasImg = !!p.image;
  const hasCode = !!p.code;                       // শুধু ব্যানার ক্যাম্পেইনে কোড থাকে না
  const hasBtn = !!(p.button_text && p.link);
  const showBottom = hasCode || hasBtn;
  // লিংক দিলে বাটন ছাড়াও ব্যানারে চাপলে সেই লিংকে যায়
  const wrap = (child: React.ReactNode) => p.link
    ? <Link href={p.link} onClick={close} className="block">{child}</Link>
    : <>{child}</>;
  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-black/55 p-4" role="dialog" aria-modal="true" aria-label="অফার" onClick={close}>
      <div className="relative w-full max-w-[380px]" onClick={(e) => e.stopPropagation()}
        onMouseEnter={() => timer.current && clearTimeout(timer.current)} onMouseLeave={() => arm(p.seconds || 2)}
        onTouchStart={() => timer.current && clearTimeout(timer.current)}>
        <button onClick={close} aria-label="বন্ধ করুন" className="absolute -right-2.5 -top-2.5 z-10 grid h-9 w-9 place-items-center rounded-full border-2 border-brand-500 bg-white text-brand-600 shadow-lg">
          <Icon name="x" className="h-4 w-4" />
        </button>
        <div className="max-h-[92vh] animate-[popin_.25s_ease-out] overflow-y-auto rounded-3xl border-2 border-brand-500 bg-white shadow-2xl">

          {hasImg ? (
            // ছবি পুরোটা, কাটা ছাড়া, নিজের মাপে
            wrap(<SmartImage src={p.image} alt={p.title || "অফার"} className="block h-auto w-full" />)
          ) : (
            // ছবি না দিলে সাইটের রঙে ডিফল্ট ব্যানার
            wrap(
              <div className="bg-gradient-to-br from-brand-100 via-brand-50 to-white px-5 pb-5 pt-9 text-center">
                {hasCode && <p className="text-sm font-bold text-brand-600">স্পেশাল কুপন</p>}
                {hasCode && p.label && <p className="mt-1 text-5xl font-extrabold leading-tight text-brand-600">{p.label}</p>}
                <p className={`break-words text-lg font-extrabold ${hasCode ? "mt-2" : "text-2xl text-brand-600"}`}>{p.title || "আপনার জন্য বিশেষ অফার"}</p>
                {p.text && <p className="mt-1 break-words text-sm text-muted">{p.text}</p>}
              </div>,
            )
          )}

          {showBottom && (
            <div className="space-y-3 border-t border-brand-100 bg-white p-4">
              {hasCode && (
                <button onClick={copy} aria-label="কুপন কোড কপি করুন"
                  className="flex w-full items-center gap-3 rounded-xl border-2 border-dashed border-brand-500 bg-brand-50 px-3 py-2.5 text-left shadow-[0_0_18px_rgba(219,20,80,.35)]">
                  <span className="min-w-0 flex-1 break-all text-xl font-extrabold tracking-wider text-brand-600">{p.code}</span>
                  <span className="shrink-0 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-bold text-white">{copied ? "কপি হয়েছে ✓" : "কপি"}</span>
                </button>
              )}
              {hasBtn && (
                <Link href={p.link!} onClick={close} className="block rounded-xl bg-brand-600 py-3 text-center text-base font-bold text-white shadow-md">{p.button_text}</Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
