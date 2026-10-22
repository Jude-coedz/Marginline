"use strict";
/** Server-side discovery, verification and scoring. No browser key exposure. */
const dns = require("node:dns").promises;
const net = require("node:net");
const ipaddr = require("ipaddr.js");
const { Agent, fetch: websiteFetch } = require("undici");
const { timedSignal } = require("./context.cjs");

const BAD_HOSTS = [
  "shopify.com",
  "google.com",
  "facebook.com",
  "instagram.com",
  "linkedin.com",
  "amazon.com",
  "amazon.co.uk",
  "yelp.com",
  "reddit.com",
  "pinterest.com",
  "tiktok.com",
  "youtube.com",
  "etsy.com",
  "ebay.com",
  "wikipedia.org",
  "trustpilot.com",
  "crunchbase.com",
  "businesswire.com",
  "prnewswire.com",
  "theguardian.com",
  "forbes.com",
  "vogue.com",
  "medium.com",
  "substack.com",
  "globenewswire.com",
];
function domainOf(raw) {
  try {
    const u = new URL(raw);
    if (
      !["https:", "http:"].includes(u.protocol) ||
      u.username ||
      u.password ||
      u.port
    )
      return null;
    const h = u.hostname.toLowerCase().replace(/^www\./, "");
    if (
      !h.includes(".") ||
      net.isIP(h) ||
      h.endsWith(".local") ||
      h === "localhost" ||
      !/^[a-z0-9.-]+$/.test(h) ||
      BAD_HOSTS.some((d) => h === d || h.endsWith("." + d))
    )
      return null;
    return h;
  } catch {
    return null;
  }
}
function rejectIp(ip) {
  try {
    return ipaddr.parse(ip).range() !== "unicast";
  } catch {
    return true;
  }
}
async function publicAddresses(host, { signal } = {}) {
  const deadline = timedSignal(2500, signal);
  deadline.throwIfAborted();
  let onAbort;
  try {
    const resolved = await Promise.race([
      dns.lookup(host, { all: true }),
      new Promise((_, reject) => {
        onAbort = () => reject(Error("Website DNS lookup timed out"));
        deadline.addEventListener("abort", onAbort, { once: true });
      }),
    ]);
    if (!resolved.length || resolved.some((x) => rejectIp(x.address)))
      throw Error("Website address is not public");
    return resolved;
  } finally {
    if (onAbort) deadline.removeEventListener("abort", onAbort);
  }
}
function pinnedLookup(host, addresses) {
  return (hostname, options, callback) => {
    if (hostname !== host)
      return callback(Error("Unexpected website hostname"));
    if (options?.all) return callback(null, addresses);
    callback(null, addresses[0].address, addresses[0].family);
  };
}
function clean(s) {
  return String(s || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&(?:amp|quot|nbsp|lt|gt);/gi, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 260);
}
function meta(html, key) {
  const tags = html.match(/<meta\b[^>]+>/gi) || [];
  for (const t of tags) {
    if (new RegExp(`(?:name|property)=["']${key}["']`, "i").test(t))
      return clean((t.match(/content=["']([^"']*)["']/i) || [])[1] || "");
  }
  return "";
}
function parseHomepage(html, url) {
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .slice(0, 12000);
  const title = clean(
    (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1],
  );
  const description = meta(html, "description") || meta(html, "og:description");
  const h1 = clean((html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i) || [])[1]);
  return {
    url,
    title,
    description,
    h1,
    shopify:
      /cdn\.shopify\.com|Shopify\.theme|myshopify\.com|shopify-section|shopify-features|shopify-payment-button/i.test(
        html,
      ),
    productLinks: /href=["'][^"']*\/products?\//i.test(html),
    newsletter:
      /klaviyo-form|mailchimp|omnisend|newsletter|<input[^>]+type=["']email["']/i.test(
        html,
      ),
    contact: /href=["'][^"']*(contact|inquiry|enquiry)/i.test(html),
    subscription: /\bsubscription|subscribe and save|replenishment\b/i.test(
      text,
    ),
    body: clean(text.slice(0, 1200)),
    checkedAt: new Date().toISOString(),
  };
}
async function cappedHtml(r, max = 380000) {
  if (!r.ok) throw Error("Website returned HTTP " + r.status);
  if (!/text\/html/i.test(r.headers.get("content-type") || ""))
    throw Error("Website did not return HTML");
  const reader = r.body?.getReader();
  if (!reader) throw Error("Empty response");
  let chunks = [],
    bytes = 0;
  try {
    while (true) {
      const x = await reader.read();
      if (x.done) break;
      const chunk = x.value.subarray(0, max - bytes);
      chunks.push(chunk);
      bytes += chunk.length;
      if (bytes >= max) break;
    }
  } finally {
    reader.cancel().catch(() => {});
  }
  return Buffer.concat(chunks).toString("utf8");
}
async function auditDomain(domain, { signal } = {}) {
  const host = domainOf("https://" + domain);
  if (!host) throw Error("Invalid business website");
  let url = new URL("https://" + host + "/");
  for (let i = 0; i < 3; i++) {
    const addresses = await publicAddresses(url.hostname, { signal });
    // Resolve once, validate every address, and pin the connection to that result.
    // TLS still validates the original hostname; redirects are checked separately.
    const dispatcher = new Agent({
      connect: { lookup: pinnedLookup(url.hostname, addresses) },
    });
    try {
      const response = await websiteFetch(url, {
        dispatcher,
        redirect: "manual",
        signal: timedSignal(6500, signal),
        headers: {
          "user-agent":
            "Mozilla/5.0 (compatible; ProspectResearch/3.0; public-homepage-check)",
          Accept: "text/html",
        },
      });
      if (response.status >= 300 && response.status < 400) {
        await response.body?.cancel();
        const location = response.headers.get("location");
        if (!location) throw Error("Website redirect has no destination");
        const next = new URL(location, url);
        if (
          next.protocol !== "https:" ||
          next.port ||
          next.username ||
          next.password ||
          next.hostname.replace(/^www\./, "") !== host
        )
          throw Error("Website redirected to another domain");
        if (i === 2) throw Error("Too many redirects");
        url = next;
      } else return parseHomepage(await cappedHtml(response), url.href);
    } finally {
      await dispatcher.destroy();
    }
  }
}
const SECTORS = {
  beauty: {
    label: "Beauty & skincare",
    term: "independent skincare, makeup, cosmetics and beauty product brands",
  },
  wellness: {
    label: "Health & wellness",
    term: "health, wellness and self-care consumer product brands",
  },
  dental: {
    label: "Dental & oral care",
    term: "toothpaste, oral care, oral hygiene and dental products ecommerce brands",
  },
  fashion: {
    label: "Fashion & accessories",
    term: "independent fashion, clothing, and accessories online stores",
  },
  home: {
    label: "Home & lifestyle",
    term: "homeware, home decor, accessories, fragrances and candle brands",
  },
};
const REGIONS = {
  uk: { label: "United Kingdom" },
  us: { label: "United States" },
  ca: { label: "Canada" },
};
function brief(input) {
  const sector = SECTORS[input?.sector] ? input.sector : "beauty";
  const region = REGIONS[input?.region] ? input.region : "uk";
  return {
    sector,
    region,
    sectorLabel: SECTORS[sector].label,
    regionLabel: REGIONS[region].label,
  };
}
function searches(b) {
  return [
    `Independent ${SECTORS[b.sector].term} based in ${REGIONS[b.region].label}, selling directly through their own online store`,
  ];
}
function extractJsonArray(raw) {
  const s = String(raw || "")
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/, "")
    .trim();
  let parsed;
  try {
    parsed = JSON.parse(s);
  } catch {
    const start = s.indexOf("["),
      end = s.lastIndexOf("]");
    if (start >= 0 && end > start) {
      try {
        parsed = JSON.parse(s.slice(start, end + 1));
      } catch {}
    }
    if (!parsed) {
      const l = s.indexOf("{"),
        r = s.lastIndexOf("}");
      if (l >= 0 && r > l) {
        try {
          parsed = JSON.parse(s.slice(l, r + 1));
        } catch {}
      }
    }
  }
  if (Array.isArray(parsed)) return parsed;
  for (const k of [
    "businesses",
    "companies",
    "candidates",
    "results",
    "brands",
  ])
    if (Array.isArray(parsed?.[k])) return parsed[k];
  return [];
}
function parseCandidates(raw) {
  const rows = extractJsonArray(raw),
    out = new Map();
  for (const row of rows) {
    if (!row || typeof row !== "object") continue;
    let u = String(row.website || row.url || row.domain || "").trim();
    if (!/^https?:\/\//i.test(u)) u = "https://" + u;
    const domain = domainOf(u);
    if (!domain || out.has(domain)) continue;
    out.set(domain, {
      domain,
      name: clean(row.name || ""),
      snippet: clean(row.description || row.reason || ""),
      sourceUrl: "https://" + domain + "/",
      declaredCountry: clean(row.country || ""),
    });
  }
  return [...out.values()];
}
async function geminiSearch(b, { fetcher = fetch } = {}) {
  const key = process.env.GEMINI_API_KEY;
  if (!key)
    throw Error(
      "Gemini is not connected. Add GEMINI_API_KEY in Vercel environment settings.",
    );
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  if (!/^gemini-[a-z0-9.-]+$/.test(model))
    throw Error("Invalid Gemini model setting");
  const prompt = `Use Google Search NOW to research real ecommerce businesses. Find 8 to 12 currently operating independent ${SECTORS[b.sector].term} with an official direct-to-consumer online storefront in ${REGIONS[b.region].label}. Prefer small or mid-size brands; avoid directories, marketplaces, agencies, social media pages and articles.\nFor EACH company, verify the likely official website using web results. Do not guess domains; do not invent brands or assert Shopify without checking. If fewer than 8 qualify, return fewer. Output ONLY valid compact JSON in this shape: {"businesses":[{"name":"Business","website":"https://official-business-site.example","country":"${REGIONS[b.region].label}","description":"Brief factual product category"}]}. No Markdown. This is research data and will be validated independently. Search the web even if you know potential examples.`;
  const response = await fetcher(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        tools: [{ google_search: {} }],
        generationConfig: { temperature: 0.15 },
      }),
      signal: timedSignal(35000),
    },
  );
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    let msg = "Gemini returned HTTP " + response.status;
    if (response.status === 400)
      msg =
        "Gemini could not use Google Search grounding with this key/model. Check model access in AI Studio.";
    if (response.status === 401 || response.status === 403)
      msg =
        "Gemini API key is invalid or Google Search grounding is unavailable for this account.";
    if (response.status === 429)
      msg =
        "Gemini quota or rate limit reached. Try a smaller run later or check your free-tier limits.";
    throw Error(msg + (response.status >= 500 ? " Try again." : ""));
  }
  const json = await response.json();
  const candidate = json.candidates?.[0];
  if (json.promptFeedback?.blockReason || candidate?.finishReason === "SAFETY")
    throw Error(
      "Gemini blocked this research request. Change the brief and try again.",
    );
  if (candidate?.finishReason === "MAX_TOKENS")
    throw Error(
      "Gemini truncated the research response. No partial candidate list was accepted; try again.",
    );
  const metadata = candidate?.groundingMetadata || {};
  const queries = (metadata.webSearchQueries || []).filter(Boolean);
  const citations = (metadata.groundingChunks || [])
    .map((x) => x.web)
    .filter(Boolean)
    .map((x) => ({ title: clean(x.title), url: x.uri }))
    .filter((x) => /^https?:\/\//.test(x.url))
    .slice(0, 12);
  if (queries.length === 0 && citations.length === 0)
    throw Error(
      "Gemini did not provide evidence that Google Search ran. No ungrounded companies were accepted.",
    );
  const content = (candidate?.content?.parts || [])
    .map((x) => x.text || "")
    .join("\n");
  const candidates = parseCandidates(content).slice(0, 15);
  if (candidates.length === 0)
    throw Error(
      "Gemini searched but returned no machine-readable official storefront URLs. Run again with another market.",
    );
  return { candidates, queries, citations, model };
}
function companyName(title, domain) {
  const prefix = String(title || "")
    .split(/\s+[\-|•|]\s+/)[0]
    .replace(/\b(Home|Official Site|Shop Now|Buy Online)\b/gi, "")
    .trim();
  return prefix && prefix.length < 65
    ? prefix
    : domain
        .split(".")[0]
        .replace(/[-_]/g, " ")
        .replace(/\b\w/g, (a) => a.toUpperCase());
}
function scoreCandidate(a, b) {
  const observed = [],
    evidence = [];
  let score = 0;
  if (a.shopify) {
    score += 42;
    observed.push("Shopify technology detected");
    evidence.push({
      label: "Shopify marker on public homepage",
      source: a.url,
    });
  } else observed.push("Shopify not confirmed");
  if (a.productLinks) {
    score += 18;
    observed.push("Links to product catalogue");
    evidence.push({ label: "Product catalogue links visible", source: a.url });
  }
  if (a.newsletter) {
    score += 8;
    observed.push("Email capture signal");
    evidence.push({
      label: "Email capture or newsletter signal",
      source: a.url,
    });
  }
  if (a.contact) {
    score += 6;
    observed.push("Public contact pathway");
    evidence.push({ label: "Contact link visible", source: a.url });
  }
  if (a.subscription) {
    score += 6;
    observed.push("Subscription-language signal");
    evidence.push({ label: "Subscription wording visible", source: a.url });
  }
  if (a.title) {
    score += 8;
    observed.push("Page title available");
  }
  if (a.description) {
    score += 8;
    observed.push("Search description available");
  }
  const qualification =
    score >= 68 && a.shopify ? "strong" : score >= 42 ? "review" : "unverified";
  const reason =
    a.shopify && a.productLinks
      ? "Product-led Shopify storefront with observable commerce infrastructure"
      : a.shopify
        ? "Shopify signal present; suitability needs human review"
        : "Public homepage checked; Shopify remains unconfirmed";
  return {
    score,
    qualification,
    reason,
    observed,
    evidence,
    homepage: a.url,
    scanned_at: a.checkedAt,
    shopify: a.shopify,
    sector: b.sectorLabel,
    region: b.regionLabel,
  };
}
function draft(lead) {
  const name = lead.name || "your team";
  return {
    subject: `An idea for ${name}`,
    body: `Hi ${name} team,\n\nI came across your online storefront while researching independent ${lead.sector?.toLowerCase() || "ecommerce"} brands.\n\nAt MyDigital-Metrics we work on the digital systems behind customer acquisition and conversion. Would it be helpful if I sent over a couple of observations specific to your store?\n\nBest,\nMyDigital-Metrics`,
  };
}
async function gather(input) {
  const b = brief(input),
    output = await geminiSearch(b);
  return { brief: b, ...output };
}
async function limitedMap(items, worker, max = 4) {
  const out = new Array(items.length);
  let i = 0;
  await Promise.all(
    Array.from({ length: Math.min(max, items.length) }, async () => {
      while (i < items.length) {
        const index = i++;
        try {
          out[index] = { value: await worker(items[index]) };
        } catch (e) {
          out[index] = { error: e.message || String(e) };
        }
      }
    }),
  );
  return out;
}
module.exports = {
  domainOf,
  rejectIp,
  parseHomepage,
  brief,
  searches,
  scoreCandidate,
  draft,
  auditDomain,
  geminiSearch,
  parseCandidates,
  gather,
  limitedMap,
  companyName,
  publicAddresses,
  pinnedLookup,
  cappedHtml,
};
