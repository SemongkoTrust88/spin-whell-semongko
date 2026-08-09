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
