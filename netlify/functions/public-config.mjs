import { loadConfig, json } from "./_lib.mjs";
export default async () => {
  const config = await loadConfig();
  const safe = structuredClone(config);
  delete safe.tickets;
  return json(safe, 200, { "cache-control": "no-store" });
};
