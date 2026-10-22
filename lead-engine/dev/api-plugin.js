// Run the same server-only handlers as Vercel, without a Vercel login.
import status from "../api/status.js";
import run from "../api/run.js";
import leads from "../api/leads.js";
const handlers = {
  "/api/status": status,
  "/api/run": run,
  "/api/leads": leads,
};
export default function apiPlugin() {
  return {
    name: "prospect-local-api",
    configureServer(server) {
      server.middlewares.use(serve);
    },
    configurePreviewServer(server) {
      server.middlewares.use(serve);
    },
  };
}
async function serve(req, res, next) {
  const url = new URL(req.url, "http://localhost");
  if (!url.pathname.startsWith("/api/")) return next();
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (body) => {
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(body));
  };
  const handler = handlers[url.pathname];
  if (!handler) return res.status(404).json({ error: "Unknown API route" });
  try {
    let body = "";
    for await (const chunk of req) {
      body += chunk;
      if (Buffer.byteLength(body) > 16384)
        return res.status(413).json({ error: "Request body too large" });
    }
    req.body = body ? JSON.parse(body) : {};
    req.query = Object.fromEntries(url.searchParams);
    await handler(req, res);
  } catch (error) {
    res
      .status(error instanceof SyntaxError ? 400 : 500)
      .json({
        error:
          error instanceof SyntaxError
            ? "Invalid JSON request"
            : "Local API request failed",
      });
  }
}
