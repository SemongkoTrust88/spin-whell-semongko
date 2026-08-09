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
