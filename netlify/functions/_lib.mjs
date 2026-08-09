import { getStore } from "@netlify/blobs";
import crypto from "node:crypto";

export const STORE_NAME = "semongko-wheel";
export const CONFIG_KEY = "config";
export const LOG_KEY = "audit-log";
export const store = () => getStore({ name: STORE_NAME, consistency: "strong" });

export const DEFAULT_CONFIG = {
  site: {
    name: "RODA KEBERUNTUNGAN SEMESTA88",
    title: "Lucky Wheel",
    subtitle: "Masukkan kode tiket untuk memulai putaran.",
    welcomeTitle: "Selamat Datang di Lucky Wheel!",
    welcomeText: "Masukkan kode tiket yang diberikan untuk memulai putaran.",
    logoUrl: "",
    backgroundUrl: "",
    primaryColor: "#e20a16",
    secondaryColor: "#ffd700",
    accentColor: "#0d0203",
    showWelcome: true,
    footerText: "Roda Keberuntungan",
  },
  wheel: {
    duration: 4,
    spins: 10,
    outerRadius: 185,
    innerRadius: 75,
    textFontSize: 18,
    segments: [
      { id: "p1", label: "IPHONE 17 PRO MAX", color: "#ff0000", textColor: "#ffffff", weight: 1, enabled: true },
      { id: "p2", label: "PLAYSTATION 5", color: "#111111", textColor: "#ffd700", weight: 1, enabled: true },
      { id: "p3", label: "10,000,000", color: "#ffd700", textColor: "#111111", weight: 1, enabled: true },
      { id: "p4", label: "5,000,000", color: "#168a32", textColor: "#ffffff", weight: 1, enabled: true },
      { id: "p5", label: "VERSYS 650", color: "#ff0000", textColor: "#ffffff", weight: 1, enabled: true },
      { id: "p6", label: "1,000,000", color: "#ffd700", textColor: "#111111", weight: 1, enabled: true },
      { id: "p7", label: "500,000", color: "#168a32", textColor: "#ffffff", weight: 1, enabled: true },
      { id: "p8", label: "100,000", color: "#ffd700", textColor: "#111111", weight: 1, enabled: true },
      { id: "p9", label: "50,000", color: "#168a32", textColor: "#ffffff", weight: 1, enabled: true },
      { id: "p10", label: "20,000", color: "#ffd700", textColor: "#111111", weight: 1, enabled: true },
      { id: "p11", label: "CASHBACK 10%", color: "#ff0000", textColor: "#ffffff", weight: 1, enabled: true },
      { id: "p12", label: "BONUS DP 10%", color: "#ffd700", textColor: "#111111", weight: 1, enabled: true }
    ]
  },
  claim: {
    whatsapp: "",
    whatsappMessage: "Halo, saya mau klaim hadiah dengan kode kemenangan {CODE}",
    instagram: "",
    facebook: "",
    twitter: "",
    claimLabel: "Klaim Melalui WhatsApp"
  },
  messages: {
    winTitle: "SELAMAT!",
    winText: "Anda memenangkan hadiah {PRIZE}!",
    lossText: "Kode berhasil diproses. Silakan cek hasil putaran.",
    invalidCode: "Kode tiket tidak ditemukan atau sudah digunakan.",
    expiredCode: "Kode tiket sudah kadaluarsa.",
    systemError: "Terjadi kesalahan sistem. Silakan coba lagi."
  },
  tickets: []
};

export async function loadConfig() {
  const data = await store().get(CONFIG_KEY, { type: "json" });
  return data ? normalizeConfig(data) : structuredClone(DEFAULT_CONFIG);
}

export function normalizeConfig(data) {
  const base = structuredClone(DEFAULT_CONFIG);
  const merged = {
    ...base,
    ...data,
    site: { ...base.site, ...(data.site || {}) },
    wheel: { ...base.wheel, ...(data.wheel || {}) },
    claim: { ...base.claim, ...(data.claim || {}) },
    messages: { ...base.messages, ...(data.messages || {}) },
    tickets: Array.isArray(data.tickets) ? data.tickets : base.tickets,
  };
  merged.wheel.segments = Array.isArray(merged.wheel.segments) ? merged.wheel.segments : base.wheel.segments;
  return merged;
}

export async function saveConfig(config) {
  const normalized = normalizeConfig(config);
  normalized.updatedAt = new Date().toISOString();
  await store().setJSON(CONFIG_KEY, normalized);
  return normalized;
}

export async function addAudit(action, meta = {}) {
  const s = store();
  const logs = (await s.get(LOG_KEY, { type: "json" })) || [];
  logs.unshift({ at: new Date().toISOString(), action, ...meta });
  await s.setJSON(LOG_KEY, logs.slice(0, 200));
}

const enc = (v) => new TextEncoder().encode(v);
const b64url = (buf) => Buffer.from(buf).toString("base64url");
const secret = () => process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || "CHANGE_ME_NOW";

export function sign(payload) {
  const body = b64url(Buffer.from(JSON.stringify(payload)));
  const sig = b64url(crypto.createHmac("sha256", secret()).update(body).digest());
  return `${body}.${sig}`;
}

export function verify(token) {
  try {
    if (!token) return null;
    const [body, sig] = token.split(".");
    const expected = crypto.createHmac("sha256", secret()).update(body).digest();
    const given = Buffer.from(sig, "base64url");
    if (given.length !== expected.length || !crypto.timingSafeEqual(given, expected)) return null;
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    if (!payload.exp || payload.exp < Date.now()) return null;
    return payload;
  } catch { return null; }
}

export function getSession(req) {
  const cookie = req.headers.get("cookie") || "";
  const match = cookie.match(/(?:^|;\s*)sw_session=([^;]+)/);
  return verify(match?.[1]);
}

export function requireAdmin(req) {
  const session = getSession(req);
  return session?.role === "admin" ? session : null;
}

export function json(data, status = 200, extra = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", ...extra }
  });
}

export function corsHeaders() {
  return { "cache-control": "no-store" };
}

import { addAudit, json, loadConfig, requireAdmin, saveConfig, store, LOG_KEY } from "./_lib.mjs";

function cleanConfig(data) {
  if (!data || typeof data !== "object") throw new Error("Data tidak valid");
  if (!data.wheel || !Array.isArray(data.wheel.segments)) throw new Error("Wheel segments tidak valid");
  data.wheel.segments = data.wheel.segments.map((s, i) => ({
    id: String(s.id || `p${Date.now()}-${i}`),
    label: String(s.label || "HADIAH").slice(0, 80),
    color: String(s.color || "#ff0000"),
    textColor: String(s.textColor || "#ffffff"),
    weight: Math.max(0, Number(s.weight) || 0),
    enabled: s.enabled !== false
  }));
  data.tickets = Array.isArray(data.tickets) ? data.tickets : [];
  data.tickets = data.tickets.map(t => ({
    id: String(t.id || crypto.randomUUID()),
    code: String(t.code || "").trim().toUpperCase(),
    prizeId: String(t.prizeId || ""),
    status: ["active", "used", "expired"].includes(t.status) ? t.status : "active",
    createdAt: t.createdAt || new Date().toISOString(),
    usedAt: t.usedAt || null,
    winner: t.winner || null
  })).filter(t => t.code);
  return data;
}

export default async (req) => {
  const session = requireAdmin(req);
  if (!session) return json({ error: "Unauthorized" }, 401);
  try {
    if (req.method === "GET") {
      const config = await loadConfig();
      const logs = (await store().get(LOG_KEY, { type: "json" })) || [];
      return json({ config, logs: logs.slice(0, 100) });
    }
    if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
    const body = await req.json();
    if (body.action === "save") {
      const config = cleanConfig(body.config);
      await saveConfig(config);
      await addAudit("config_saved", { username: session.username });
      return json({ ok: true, config });
    }
    if (body.action === "reset") {
      const { DEFAULT_CONFIG } = await import("./_lib.mjs");
      const config = structuredClone(DEFAULT_CONFIG);
      await saveConfig(config);
      await addAudit("config_reset", { username: session.username });
      return json({ ok: true, config });
    }
    if (body.action === "clear_logs") {
      await store().setJSON(LOG_KEY, []);
      return json({ ok: true });
    }
    return json({ error: "Unknown action" }, 400);
  } catch (e) { return json({ error: e.message }, 400); }
};

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

import { loadConfig, json } from "./_lib.mjs";
export default async () => {
  const config = await loadConfig();
  const safe = structuredClone(config);
  delete safe.tickets;
  return json(safe, 200, { "cache-control": "no-store" });
};

import { addAudit, json, loadConfig, saveConfig } from "./_lib.mjs";

function pickWeighted(segments) {
  const enabled = segments.filter(s => s.enabled !== false && Number(s.weight) > 0);
  if (!enabled.length) return null;
  const total = enabled.reduce((a, s) => a + Number(s.weight), 0);
  let r = Math.random() * total;
  for (const s of enabled) { r -= Number(s.weight); if (r <= 0) return s; }
  return enabled.at(-1);
}

export default async (req) => {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  try {
    const { code } = await req.json();
    const cleanCode = String(code || "").trim().toUpperCase();
    if (!cleanCode) return json({ error: "Kode tiket wajib diisi." }, 400);
    const config = await loadConfig();
    const ticket = config.tickets.find(t => t.code === cleanCode);
    if (!ticket) return json({ error: config.messages.invalidCode }, 404);
    if (ticket.status === "expired") return json({ error: config.messages.expiredCode }, 410);
    if (ticket.status !== "active") return json({ error: "Kode tiket sudah digunakan." }, 409);

    let prize = config.wheel.segments.find(s => s.id === ticket.prizeId && s.enabled !== false);
    if (!prize) prize = pickWeighted(config.wheel.segments);
    if (!prize) return json({ error: "Belum ada hadiah aktif." }, 500);

    ticket.status = "used";
    ticket.usedAt = new Date().toISOString();
    ticket.winner = { prizeId: prize.id, label: prize.label };
    await saveConfig(config);
    await addAudit("spin", { code: cleanCode, prizeId: prize.id });

    return json({ ok: true, prize, code: cleanCode, message: config.messages.winText.replaceAll("{PRIZE}", prize.label) });
  } catch (e) { return json({ error: e.message }, 500); }
};
