import { addAudit, json, sign } from "./_lib.mjs";

export default async (req) => {
  if (req.method === "GET") return json({ authenticated: false });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  try {
    const { action, username, password } = await req.json();
    if (action === "logout") {
      return new Response(JSON.stringify({ ok: true }), {
        headers: { "content-type": "application/json", "set-cookie": "sw_session=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Strict" }
      });
    }
    const adminUser = process.env.ADMIN_USERNAME || "admin";
    const adminPass = process.env.ADMIN_PASSWORD;
    if (!adminPass) return json({ error: "ADMIN_PASSWORD belum diset di Netlify Environment Variables." }, 500);
    if (username !== adminUser || password !== adminPass) {
      await addAudit("login_failed", { username: username || "" });
      return json({ error: "Username atau password salah." }, 401);
    }
    const token = sign({ role: "admin", username: adminUser, exp: Date.now() + 1000 * 60 * 60 * 12 });
    await addAudit("login", { username: adminUser });
    return json({ ok: true, username: adminUser }, 200, {
      "set-cookie": `sw_session=${token}; Max-Age=43200; Path=/; HttpOnly; Secure; SameSite=Strict`
    });
  } catch (e) { return json({ error: e.message }, 400); }
};
