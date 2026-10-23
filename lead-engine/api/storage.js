import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { guard, cors } = require("./_lib/auth.cjs");
const db = require("./_lib/db.cjs");
export default async function (req, res) {
  cors(req, res);
  if (!guard(req, res)) return;
  if (req.method !== "GET")
    return res.status(405).json({ error: "Method not allowed" });
  if (!db.connected())
    return res
      .status(200)
      .json({ configured: false, verified: false, mode: "browser" });
  try {
    await Promise.all(
      ["leads", "lead_runs", "app_settings"].map((table) =>
        db.request(table, { query: "select=id&limit=1" }),
      ),
    );
    return res
      .status(200)
      .json({
        configured: true,
        verified: true,
        mode: "shared",
        checkedAt: new Date().toISOString(),
      });
  } catch {
    return res
      .status(503)
      .json({
        configured: true,
        verified: false,
        error:
          "Shared storage could not be verified. Apply schema.sql to the connected Supabase project and check its server credentials.",
      });
  }
}
