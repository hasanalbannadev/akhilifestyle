import { api } from "@/lib/api/client";

// Search-engine verification for IndexNow: https://akhilifestyle.com/indexnow/<key> must answer with the key itself.
export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  try {
    const r = await api<{ key: string }>("/seo/indexnow-key", { revalidate: 0 });
    if (r && r.key === key) return new Response(key, { headers: { "content-type": "text/plain; charset=utf-8" } });
  } catch { /* fall through */ }
  return new Response("Not found", { status: 404 });
}
