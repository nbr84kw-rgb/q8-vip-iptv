import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "crypto";

function secret() {
  return process.env["SUPABASE_SERVICE_ROLE_KEY"] ?? "q8vip";
}
export function signStream(url: string) {
  return createHmac("sha256", secret()).update(url).digest("hex").slice(0, 32);
}
function wrap(url: string) {
  return `/api/public/stream?u=${encodeURIComponent(url)}&s=${signStream(url)}`;
}

export const Route = createFileRoute("/api/public/stream")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const params = new URL(request.url).searchParams;
        const target = params.get("u") ?? "";
        const sig = params.get("s") ?? "";
        const exp = signStream(target);
        if (sig.length !== exp.length || !timingSafeEqual(Buffer.from(sig), Buffer.from(exp))) {
          return new Response("Forbidden", { status: 403 });
        }
        const headers: Record<string, string> = { "User-Agent": "VLC/3.0.20 LibVLC/3.0.20" };
        const range = request.headers.get("range");
        if (range) headers["Range"] = range;
        const res = await fetch(target, { headers, redirect: "follow" });
        const finalUrl = res.url || target;
        const type = res.headers.get("content-type") ?? "";
        const isPlaylist = /mpegurl/i.test(type) || /\.m3u8(\?|$)/i.test(finalUrl);
        if (isPlaylist && res.ok) {
          const text = await res.text();
          const out = text
            .split(/\r?\n/)
            .map((line) => {
              const l = line.trim();
              if (!l) return line;
              if (l.startsWith("#")) {
                return line.replace(/URI="([^"]+)"/g, (_m, u) => `URI="${wrap(new URL(u, finalUrl).toString())}"`);
              }
              return wrap(new URL(l, finalUrl).toString());
            })
            .join("\n");
          return new Response(out, {
            headers: { "content-type": "application/vnd.apple.mpegurl", "cache-control": "no-cache", "access-control-allow-origin": "*" },
          });
        }
        const h = new Headers();
        for (const k of ["content-type", "content-length", "content-range", "accept-ranges"]) {
          const v = res.headers.get(k);
          if (v) h.set(k, v);
        }
        h.set("access-control-allow-origin", "*");
        return new Response(res.body, { status: res.status, headers: h });
      },
    },
  },
});
