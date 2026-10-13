import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/auth/login")({
  server: {
    handlers: {
      OPTIONS: async () => {
        return new Response(null, {
          status: 204,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
          },
        });
      },
      POST: async ({ request }) => {
        try {
          const body = (await request.json().catch(() => ({}))) as {
            username?: string;
            code?: string;
            password?: string;
            is_tv?: boolean;
          };
          const username = String(body.username || body.code || "").trim();
          if (!username) {
            return new Response(JSON.stringify({ error: "الرجاء إدخال كود أو رقم الاشتراك" }), {
              status: 400,
              headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
            });
          }

          const isAdmin =
            username === "65555165" ||
            username === "888888" ||
            username.toLowerCase() === "admin" ||
            username.toLowerCase() === "65555165@kingvip.app";

          const user = {
            id: username,
            username: username,
            email: `${username}@kingvip.app`,
            role: isAdmin ? "admin" : "user",
            banned: false,
            active: true,
            days_left: isAdmin ? 999 : 365,
            expires_at: Date.now() + (isAdmin ? 999 : 365) * 86400000,
            features: { live: true, movies: true, series: true, kids: true },
            max_quality: "auto",
            max_devices: isAdmin ? 10 : 2,
            created_at: Date.now(),
          };

          return new Response(
            JSON.stringify({
              ok: true,
              token: `vip_session_${username}_${Date.now()}`,
              user,
            }),
            {
              status: 200,
              headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
              },
            },
          );
        } catch (err) {
          return new Response(JSON.stringify({ error: "فشل التحقق من الكود" }), {
            status: 500,
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
          });
        }
      },
    },
  },
});
