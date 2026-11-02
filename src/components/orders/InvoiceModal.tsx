"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { ordersApi } from "@/lib/api/orders";
import { errorMessage } from "@/lib/errors";
import { formatDate, taka } from "@/lib/format";
import { payLabel } from "@/lib/constants";
import { SITE } from "@/lib/site";
import type { Invoice } from "@/types";

// একটি পরিষ্কার A4 ইনভয়েস। পর্দায় পপআপে দেখায়, প্রিন্টে শুধু এই ইনভয়েসটাই পুরো পাতায় ছাপা হয় (বাকি সাইট নয়)।
function Sheet({ inv, print = false }: { inv: Invoice; print?: boolean }) {
  const th = "px-2 py-2 text-xs font-semibold uppercase tracking-wide text-muted";
  const td = "px-2 py-2.5 align-top";
  return (
    <div className={`bg-white text-ink ${print ? "text-[13px]" : "text-[13px] sm:text-sm"}`}>
      <div className="flex flex-wrap items-start justify-between gap-3 border-b-2 border-brand-600 pb-4">
        <div>
          <p className="font-script text-3xl font-bold text-brand-600">{SITE.name}</p>
          <p className="mt-1 text-muted">{SITE.phone}</p>
          <p className="text-muted">{SITE.email}</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-extrabold uppercase tracking-wide">ইনভয়েস</p>
          <p className="font-bold">#{inv.invoice_no}</p>
          <p className="text-muted">{formatDate(inv.date)}</p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg bg-brand-50/60 p-3">
          <p className="text-xs font-semibold uppercase text-muted">গ্রাহক</p>
          <p className="font-semibold">{inv.customer.name}</p>
          <p>{inv.customer.phone}</p>
        </div>
        <div className="rounded-lg bg-brand-50/60 p-3">
          <p className="text-xs font-semibold uppercase text-muted">ডেলিভারি ঠিকানা</p>
          <p className="break-words">{inv.ship_to.address}{inv.ship_to.area ? `, ${inv.ship_to.area}` : ""}, {inv.ship_to.district}</p>
        </div>
      </div>

      <table className="mt-4 w-full table-fixed border-collapse">
        <colgroup><col className="w-8" /><col /><col className="w-[4.5rem] sm:w-24" /><col className="w-10 sm:w-14" /><col className="w-[4.75rem] sm:w-24" /></colgroup>
        <thead>
          <tr className="border-y border-line bg-brand-50/50 text-left">
            <th className={th}>#</th><th className={th}>পণ্য</th><th className={`${th} text-right`}>দাম</th><th className={`${th} text-center`}>পরিমাণ</th><th className={`${th} text-right`}>মোট</th>
          </tr>
        </thead>
        <tbody>
          {inv.items.map((it, i) => (
            <tr key={i} className="border-b border-line/70 [break-inside:avoid]">
              <td className={`${td} text-muted`}>{i + 1}</td>
              <td className={`${td} break-words`}>{it.name}</td>
              <td className={`${td} whitespace-nowrap text-right tabular-nums`}>{taka(it.unit_price)}</td>
              <td className={`${td} text-center tabular-nums`}>{it.quantity}</td>
              <td className={`${td} whitespace-nowrap text-right font-semibold tabular-nums`}>{taka(it.line_total)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="ml-auto mt-4 w-full max-w-72 space-y-1.5 [break-inside:avoid]">
        <div className="flex justify-between"><span className="text-muted">সাবটোটাল</span><span className="tabular-nums">{taka(inv.subtotal)}</span></div>
        {inv.discount > 0 && <div className="flex justify-between"><span className="text-muted">ডিসকাউন্ট{inv.coupon_code ? ` (${inv.coupon_code})` : ""}</span><span className="tabular-nums">- {taka(inv.discount)}</span></div>}
        <div className="flex justify-between"><span className="text-muted">ডেলিভারি চার্জ</span><span className="tabular-nums">{inv.shipping_fee ? taka(inv.shipping_fee) : "ফ্রি"}</span></div>
        <div className="flex justify-between border-t-2 border-ink pt-2 text-base font-extrabold"><span>সর্বমোট</span><span className="tabular-nums">{taka(inv.total)}</span></div>
      </div>

      <div className="mt-5 flex flex-wrap justify-between gap-2 border-t border-line pt-3 text-muted [break-inside:avoid]">
        <p>পেমেন্ট: <b className="text-ink">{payLabel(inv.payment_method, inv.payment_label)}</b> ({inv.payment_status === "paid" ? "পরিশোধিত" : "অপরিশোধিত"})</p>
        {inv.tracking_code && <p>ট্র্যাকিং: <b className="text-ink">{inv.tracking_code}</b></p>}
      </div>
      <p className="mt-6 text-center text-muted">কেনাকাটার জন্য ধন্যবাদ! — {SITE.name}</p>
    </div>
  );
}

export function InvoiceModal({ orderNo, open, onClose }: { orderNo: string; open: boolean; onClose: () => void }) {
  const [inv, setInv] = useState<Invoice | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || inv) return;
    ordersApi.invoice(orderNo).then(setInv).catch((e) => setError(errorMessage(e)));
  }, [open, inv, orderNo]);

  const print = () => {
    const cls = "printing-invoice";
    const done = () => { document.body.classList.remove(cls); window.removeEventListener("afterprint", done); };
    document.body.classList.add(cls);
    window.addEventListener("afterprint", done);
    setTimeout(done, 60000);
    window.print();
  };

  return (
    <Modal open={open} onClose={onClose} title={`ইনভয়েস #${orderNo}`} wide>
      {!inv && !error && <div className="grid place-items-center py-10"><Spinner className="h-7 w-7 text-brand-600" /></div>}
      {error && <p className="text-brand-600">{error}</p>}
      {inv && (
        <div className="space-y-4">
          <Sheet inv={inv} />
          <Button onClick={print} variant="outline">প্রিন্ট / PDF করুন</Button>
          {/* প্রিন্টের জন্য আলাদা কপি: পর্দায় লুকানো, প্রিন্টে পুরো A4 জুড়ে */}
          {createPortal(<div id="invoice-print-portal" className="hidden"><Sheet inv={inv} print /></div>, document.body)}
        </div>
      )}
    </Modal>
  );
}
