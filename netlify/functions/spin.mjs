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
