import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { guard, cors } = require("./_lib/auth.cjs"),
  { execute } = require("./_lib/workflow.cjs"),
  db = require("./_lib/db.cjs");
const { withSignal, timedSignal } = require("./_lib/context.cjs");
export default async function (req, res) {
  cors(req, res);
  if (!["GET", "POST"].includes(req.method))
    return res.status(405).json({ error: "Method not allowed" });
  if (!guard(req, res, { cron: req.method === "GET" })) return;
  if (
    req.method === "GET" &&
    !(
      process.env.CRON_SECRET &&
      req.headers.authorization === `Bearer ${process.env.CRON_SECRET}`
    )
  )
    return res
      .status(405)
      .json({ error: "Scheduled endpoint requires scheduler authentication" });
  return withSignal(timedSignal(53000), async () => {
    try {
      const input =
        req.method === "POST"
          ? typeof req.body === "string"
            ? JSON.parse(req.body)
            : req.body || {}
          : (await db.getSettings()) || {
              sector: process.env.DEFAULT_SECTOR || "beauty",
              region: process.env.DEFAULT_REGION || "uk",
            };
      return res
        .status(200)
        .json(
          await execute(input, req.method === "GET" ? "scheduled" : "manual"),
        );
    } catch (e) {
      const status =
        e instanceof SyntaxError
          ? 400
          : /not configured|not connected/.test(e.message)
            ? 424
            : /already in progress/.test(e.message)
              ? 409
              : /quota|rate limit/i.test(e.message)
                ? 429
                : 503;
      return res.status(status).json({
        error:
          e instanceof SyntaxError
            ? "Invalid JSON request"
            : e.message || "Prospecting run could not complete",
      });
    }
  });
}
