"use client";
import { useRef, useState } from "react";
import { MediaThumb } from "@/components/ui/MediaThumb";
import { Icon } from "@/components/ui/Icon";
import { useToast } from "@/context/ToastContext";
import { errorMessage } from "@/lib/errors";

type Up = (f: File) => Promise<{ url: string }>;

// চ্যাটের লেখার জায়গা: একই সারিতে বামে "+" (ছবি যোগ), মাঝে লেখার বক্স, ডানে পাঠানোর বোতাম। ছবি জমলে ওপরে ছোট করে দেখায়।
export function ChatComposer({ text, onText, photos, onPhotos, busy, onSend, upload, discard, max = 3 }: {
  text: string; onText: (v: string) => void; photos: string[]; onPhotos: (v: string[]) => void;
  busy: boolean; onSend: () => void; upload: Up; discard: (u: string) => Promise<unknown>; max?: number;
}) {
  const toast = useToast();
  const file = useRef<HTMLInputElement>(null);
  const cam = useRef<HTMLInputElement>(null);
  const [menu, setMenu] = useState(false);
  const [up, setUp] = useState(false);
  const can = (text.trim() || photos.length) && !busy && !up;

  const pick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).slice(0, max - photos.length);
    e.target.value = "";
    if (!files.length) return;
    setUp(true);
    const next = [...photos];
    for (const f of files) {
      const vid = /^video\/(mp4|webm|quicktime)$/.test(f.type);
      if (!vid && !/^image\/(jpeg|png|webp)$/.test(f.type)) { toast("ছবি (JPG, PNG, WEBP) বা ভিডিও (MP4, MOV, WEBM) দিন", "error"); continue; }
      if (vid && f.size > 20 * 1024 * 1024) { toast("ভিডিও সর্বোচ্চ 20 MB হতে পারবে", "error"); continue; }
      try { next.push((await upload(f)).url); } catch (err) { toast(errorMessage(err), "error"); }
    }
    onPhotos(next);
    setUp(false);
  };
  const remove = (u: string) => { onPhotos(photos.filter((x) => x !== u)); discard(u).catch(() => {}); };

  return (
    <form onSubmit={(e) => { e.preventDefault(); if (can) onSend(); }} className="border-t border-line p-3">
      {photos.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {photos.map((u) => (
            <div key={u} className="relative h-14 w-14 overflow-hidden rounded-lg border border-line">
              <MediaThumb src={u} alt="ছবি বা ভিডিও" className="h-full w-full object-cover" />
              <button type="button" aria-label="ছবি মুছুন" onClick={() => remove(u)}
                className="absolute right-0.5 top-0.5 grid h-5 w-5 place-items-center rounded-full bg-black/70 text-white"><Icon name="x" className="h-3 w-3" /></button>
            </div>
          ))}
        </div>
      )}
      <div className="flex items-end gap-2">
        <div className="relative shrink-0">
          <button type="button" aria-label="ছবি বা ভিডিও যোগ করুন" title="ছবি বা ভিডিও যোগ করুন" disabled={photos.length >= max || up} onClick={() => setMenu((v) => !v)}
            className="grid h-11 w-11 place-items-center rounded-full border border-line text-brand-600 hover:bg-brand-50 disabled:opacity-40">
            {up ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" /> : <Icon name="plus" className="h-5 w-5" />}
          </button>
          {menu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenu(false)} />
              <div className="absolute bottom-12 left-0 z-20 w-44 overflow-hidden rounded-xl border border-line bg-white shadow-lg">
                <button type="button" onClick={() => { setMenu(false); cam.current?.click(); }}
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm hover:bg-brand-50"><Icon name="camera" className="h-4 w-4" /> ক্যামেরা</button>
                <button type="button" onClick={() => { setMenu(false); file.current?.click(); }}
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm hover:bg-brand-50"><Icon name="image" className="h-4 w-4" /> গ্যালারি</button>
              </div>
            </>
          )}
        </div>
        <textarea value={text} onChange={(e) => onText(e.target.value)} maxLength={1500} rows={1} placeholder="আপনার মেসেজ লিখুন…"
          onKeyDown={(e) => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey) && can) { e.preventDefault(); onSend(); } }}
          className="max-h-32 min-h-11 min-w-0 flex-1 resize-none rounded-2xl border border-line bg-white px-4 py-2.5 text-[15px] leading-snug focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100" />
        <button type="submit" aria-label="পাঠান" disabled={!can}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-40">
          {busy ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <Icon name="send" className="h-5 w-5" />}
        </button>
      </div>
      <input ref={file} type="file" accept="image/*,video/mp4,video/webm,video/quicktime" multiple hidden onChange={pick} />
      <input ref={cam} type="file" accept="image/*" capture="environment" hidden onChange={pick} />
    </form>
  );
}
