"use client";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Field";
import { ChatComposer } from "./ChatComposer";
import { ReviewGallery, ReviewPhotos } from "@/components/product/ReviewPhotos";
import { useToast } from "@/context/ToastContext";
import { supportApi } from "@/lib/api/support";
import { errorMessage } from "@/lib/errors";
import { formatDate } from "@/lib/format";
import type { SupportMsg } from "@/types";

// প্রথমবার চ্যাট খুললে, বা শেষ মেসেজের পর এতক্ষণ পার হলে (ঘণ্টা) আবার স্বাগত বার্তা দেখায়। এটা শুধু দেখানো হয়, ডাটাবেসে সেভ হয় না।
const GREET_AFTER_HOURS = 2;
const GREETING = "আসসালামু আলাইকুম! 🛍️ Akhi Lifestyle-এ আপনাকে স্বাগতম।\nআপনার পছন্দের ব্যাগ, অ্যাকসেসরিজ আর আরও অনেক কিছু এখন এক জায়গায়। ✨\nShop Smart • Live Stylish\nপণ্য, দাম, অর্ডার বা ডেলিভারি নিয়ে যা জানতে চান, এখানেই লিখুন। ছবিও দিতে পারেন।\nআমাদের এজেন্ট খুব শীঘ্রই আপনার সাথে যোগাযোগ করবে 💖";

function Greeting() {
  return (
    <div className="flex justify-start">
      <div className="max-w-[85%] rounded-2xl bg-brand-50 px-3.5 py-2 text-sm text-ink">
        <p className="mb-0.5 text-xs font-bold text-brand-600">Akhi Lifestyle</p>
        <p className="whitespace-pre-wrap break-words">{GREETING}</p>
      </div>
    </div>
  );
}

// আমাদের সাথে সরাসরি মেসেজ। ছবি দেওয়া যায় (সর্বোচ্চ ৩টা)। নিজের মেসেজ এডিট করা যায়, মোছা যায় না।
export function SupportChat({ compact = false }: { compact?: boolean } = {}) {   // compact: ছোট চ্যাট উইন্ডোর ভেতরে (ওপরের শিরোনাম ছাড়া, পুরো উচ্চতা জুড়ে)
  const toast = useToast();
  const [msgs, setMsgs] = useState<SupportMsg[] | null>(null);
  const [text, setText] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState<SupportMsg | null>(null);
  const [eText, setEText] = useState("");
  const [ePhotos, setEPhotos] = useState<string[]>([]);
  const endRef = useRef<HTMLDivElement>(null);
  const first = useRef(true);
  const [greetAfter, setGreetAfter] = useState<number | null>(null);   // কোন মেসেজের পরে স্বাগত বার্তা বসবে (০ = সবার আগে)
  const greeted = useRef(false);

  const lastId = useRef(0);
  const load = useCallback(async () => {
    try {
      const all = await supportApi.list();
      lastId.current = all.length ? all[all.length - 1].id : 0;
      if (!greeted.current) {
        greeted.current = true;
        const last = all.length ? all[all.length - 1] : null;
        const old = last ? Date.now() - new Date(last.created_at).getTime() > GREET_AFTER_HOURS * 3600 * 1000 : true;
        if (old) setGreetAfter(last ? last.id : 0);
      }
      setMsgs(all);
      window.dispatchEvent(new Event("support-seen"));
    } catch { setMsgs((m) => m ?? []); }
  }, []);
  // নতুন মেসেজ প্রতি ৩ সেকেন্ডে (শুধু নতুনগুলো আনে, তাই হালকা); পুরো তালিকা ২০ সেকেন্ডে একবার (মোছা/এডিট ধরতে)
  const fresh = useCallback(async () => {
    try {
      const add = await supportApi.list(lastId.current || undefined);
      if (!add.length) return;
      lastId.current = add[add.length - 1].id;
      setMsgs((m) => { const have = new Set((m ?? []).map((x) => x.id)); return [...(m ?? []), ...add.filter((x) => !have.has(x.id))]; });
      window.dispatchEvent(new Event("support-seen"));
    } catch { /* next tick */ }
  }, []);
  useEffect(() => {
    load();
    let n = 0;
    const t = setInterval(() => { if (document.hidden) return; n += 1; if (n % 20 === 0) load(); else fresh(); }, 1000);
    const vis = () => { if (!document.hidden) fresh(); };
    document.addEventListener("visibilitychange", vis);
    const rt = () => { fresh(); };
    window.addEventListener("rt-push", rt);
    return () => { clearInterval(t); document.removeEventListener("visibilitychange", vis); window.removeEventListener("rt-push", rt); };
  }, [load, fresh]);
  useEffect(() => {
    if (msgs === null) return;
    if (first.current) { first.current = false; return; }
    endRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [msgs?.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const send = async () => {
    if (!text.trim() && !photos.length) return;
    setBusy(true);
    try { await supportApi.send(text.trim(), photos); setText(""); setPhotos([]); await load(); }
    catch (err) { toast(errorMessage(err), "error"); }
    finally { setBusy(false); }
  };
  const startEdit = (m: SupportMsg) => { setEditing(m); setEText(m.text ?? ""); setEPhotos(m.images); };
  const saveEdit = async () => {
    if (!editing) return;
    setBusy(true);
    try { await supportApi.edit(editing.id, eText.trim(), ePhotos); setEditing(null); await load(); toast("মেসেজ আপডেট হয়েছে"); }
    catch (err) { toast(errorMessage(err), "error"); }
    finally { setBusy(false); }
  };

  return (
    <section className={compact ? "flex h-full min-h-0 flex-col bg-white" : "mb-5 rounded-2xl border border-line bg-white"}>
      {!compact && (
        <div className="border-b border-line px-4 py-3">
          <h2 className="font-bold">আমাদের মেসেজ করুন</h2>
          <p className="text-xs text-muted">আপনার প্রশ্ন বা সমস্যা লিখুন, ছবিও দিতে পারেন। আমরা এখানেই উত্তর দেব।</p>
        </div>
      )}
      <div className={compact ? "min-h-0 flex-1 space-y-3 overflow-y-auto p-3" : "max-h-[55vh] min-h-32 space-y-3 overflow-y-auto p-4"} aria-live="polite">
        {msgs === null ? <p className="text-center text-sm text-muted">লোড হচ্ছে…</p>
          : msgs.length === 0 && greetAfter === null ? <p className="text-center text-sm text-muted">এখনো কোনো মেসেজ নেই।</p>
          : <>
            {greetAfter === 0 && <Greeting />}
            {msgs.map((m) => {
            const mine = m.sender === "customer";
            return (
              <Fragment key={m.id}>
              <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm ${mine ? "bg-brand-600 text-white" : "bg-brand-50 text-ink"}`}>
                  {!mine && <p className="mb-0.5 text-xs font-bold text-brand-600">Akhi Lifestyle</p>}
                  {editing?.id === m.id ? (
                    <div className="space-y-2 text-ink">
                      <Textarea value={eText} onChange={(e) => setEText(e.target.value)} maxLength={1500} />
                      <ReviewPhotos value={ePhotos} saved={m.images} max={3} onChange={setEPhotos} upload={supportApi.upload} discard={supportApi.discard} />
                      <div className="flex gap-2">
                        <Button size="sm" loading={busy} onClick={saveEdit}>সংরক্ষণ</Button>
                        <Button size="sm" variant="outline" onClick={() => setEditing(null)}>বাতিল</Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {m.text && <p className="whitespace-pre-wrap break-words">{m.text}</p>}
                      <ReviewGallery images={m.images} />
                      <p className={`mt-1 text-[11px] ${mine ? "text-white/80" : "text-muted"}`}>
                        {formatDate(m.created_at)}{m.edited ? " · এডিটেড" : ""}
                        {mine && <button type="button" className="ml-2 underline" onClick={() => startEdit(m)}>এডিট</button>}
                      </p>
                    </>
                  )}
                </div>
              </div>
              {greetAfter === m.id && <Greeting />}
              </Fragment>
            );
          })}
          </>}
        <div ref={endRef} />
      </div>
      <ChatComposer text={text} onText={setText} photos={photos} onPhotos={setPhotos} busy={busy} onSend={() => send()}
        upload={supportApi.upload} discard={supportApi.discard} />
    </section>
  );
}
