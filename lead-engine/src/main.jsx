import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { createRoot } from "react-dom/client";
import { MotionConfig, useReducedMotion } from "framer-motion";
import {
  ArrowUpRight,
  ArrowRight,
  Search,
  Settings2,
  RefreshCw,
  Download,
  Check,
  Globe2,
  ShieldCheck,
  Clock3,
  AlertCircle,
  ChevronRight,
  KeyRound,
  Database,
  X,
  SlidersHorizontal,
} from "lucide-react";
import SpotlightCard from "./components/vendor/SpotlightCard";
import Inspector, { SourceLink } from "./components/Inspector";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./components/Tabs";
import {
  SECTORS,
  REGIONS,
  STAGES,
  labelFor,
  dateLabel,
  mergeLeads,
  exportLeads,
} from "./lib";
import "@fontsource/dm-sans/400.css";
import "@fontsource/dm-sans/500.css";
import "@fontsource/dm-sans/600.css";
import "@fontsource/dm-sans/700.css";
import "@fontsource/manrope/500.css";
import "@fontsource/manrope/600.css";
import "./styles.css";
function read(key, fallback, store = localStorage) {
  try {
    const value = JSON.parse(store.getItem(key));
    return value == null ? fallback : value;
  } catch {
    return fallback;
  }
}
function useStored(key, initial) {
  const [value, setValue] = useState(() => {
    const saved = read(key, initial);
    return Array.isArray(initial) && !Array.isArray(saved) ? initial : saved;
  });
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      setFailed(false);
    } catch {
      setFailed(true);
    }
  }, [key, value]);
  return [value, setValue, failed];
}
function Mark() {
  return (
    <svg viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <path
        d="M5 22V7h9a6 6 0 0 1 0 12H9M10 24V12h5"
        stroke="currentColor"
        strokeWidth="2.3"
      />
      <circle cx="22" cy="5" r="2" fill="currentColor" />
    </svg>
  );
}
function Status({ ok, children }) {
  return (
    <span className={`status ${ok ? "ok" : "pending"}`}>
      <span />
      {children}
    </span>
  );
}
function Select({ label, options, value, onChange, disabled }) {
  return (
    <label>
      {label}
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map(([key, text]) => (
          <option key={key} value={key}>
            {text}
          </option>
        ))}
      </select>
    </label>
  );
}
function Pipeline({ busy, latest }) {
  const reduce = useReducedMotion();
  return (
    <SpotlightCard
      className="pipeline"
      theme="light"
      intensity={reduce ? 0 : 0.08}
      borderGlow={0}
      proximity={0}
      flare={false}
      grain={0}
      style={{ "--spotlight-card-shadow": "none" }}
    >
      <div className="pipeline-title">
        <span>Research protocol</span>
        <Status ok={latest?.status === "completed"}>
          {busy
            ? "Running"
            : latest?.status === "completed"
              ? "Last run completed"
              : latest?.status === "failed"
                ? "Last run failed"
                : "Awaiting first run"}
        </Status>
      </div>
      <ol>
        <li>
          <Globe2 />
          <div>
            <strong>Discover</strong>
            <span>Gemini + Google Search</span>
          </div>
        </li>
        <li>
          <ShieldCheck />
          <div>
            <strong>Check</strong>
            <span>Public storefront evidence</span>
          </div>
        </li>
        <li>
          <Check />
          <div>
            <strong>Review</strong>
            <span>Your decision before outreach</span>
          </div>
        </li>
      </ol>
      {busy && (
        <p className="running-copy" role="status">
          <RefreshCw className="spin" size={14} />
          Waiting for grounded search and website checks. Counts appear when the
          server responds.
        </p>
      )}
    </SpotlightCard>
  );
}
function RunRecord({ run }) {
  return (
    <details className="run-record">
      <summary>
        <span className={`run-state ${run.status}`} aria-hidden="true">
          {run.status === "completed" ? (
            <Check size={16} />
          ) : (
            <AlertCircle size={16} />
          )}
        </span>
        <span className="run-identity">
          <strong>
            {labelFor(SECTORS, run.sector)} · {labelFor(REGIONS, run.region)}
          </strong>
          <small>
            {dateLabel(run.started_at)} · {run.status}
          </small>
        </span>
        <span className="run-summary">
          {run.status === "failed"
            ? "See error"
            : `${run.found ?? 0} found / ${run.checked ?? 0} accepted`}
        </span>
        <ChevronRight size={16} />
      </summary>
      <div className="run-details">
        {run.error && <p className="error-text">{run.error}</p>}
        {run.status === "completed" && (
          <>
            <dl className="run-counts">
              {[
                ["Discovered", run.found],
                ["Accepted", run.checked],
                ["Discarded", run.failed],
                ["Shopify markers", run.verified],
              ].map(([label, n]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{n ?? 0}</dd>
                </div>
              ))}
            </dl>
            <p className="small muted">
              {run.details?.model} · Reported search queries
            </p>
            <ul>
              {(run.details?.queries || []).map((q, i) => (
                <li key={i}>{q}</li>
              ))}
            </ul>
            {!run.details?.queries?.length && (
              <p className="small">
                The provider supplied citations without search-query text.
              </p>
            )}
            <h4>Search sources</h4>
            <div className="source-links">
              {(run.details?.citations || []).map((c, i) => (
                <SourceLink key={i} href={c.url}>
                  {c.title || "Search source"}
                </SourceLink>
              ))}
            </div>
            <h4>Candidate decisions</h4>
            {(run.details?.outcomes || run.details?.errors || []).map(
              (c, i) => (
                <div className="candidate-outcome" key={i}>
                  <strong>{c.domain}</strong>
                  <span>
                    {c.accepted ? "Accepted for review" : "Discarded"} ·{" "}
                    {c.reason || c.error}
                  </span>
                </div>
              ),
            )}
          </>
        )}
      </div>
    </details>
  );
}
function App() {
  const [health, setHealth] = useState(null),
    [tab, setTab] = useState("shortlist"),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false),
    [loading, setLoading] = useState(false),
    [selected, setSelected] = useState(null),
    [filter, setFilter] = useState("all"),
    [query, setQuery] = useState(""),
    [briefExpanded, setBriefExpanded] = useState(false);
  const [localLeads, setLocalLeads, leadsStorageError] = useStored(
      "prospect_v3_leads",
      [],
    ),
    [localRuns, setLocalRuns, runsStorageError] = useStored(
      "prospect_v3_runs",
      [],
    ),
    [sector, setSector] = useStored("prospect_sector", "beauty"),
    [region, setRegion] = useStored("prospect_region", "uk");
  const [remoteLeads, setRemoteLeads] = useState([]),
    [remoteRuns, setRemoteRuns] = useState([]),
    [access, setAccess] = useState(() => {
      try {
        return sessionStorage.getItem("prospect_access") || "";
      } catch {
        return "";
      }
    }),
    [accessInput, setAccessInput] = useState(""),
    [authBusy, setAuthBusy] = useState(false),
    [authError, setAuthError] = useState("");
  const runLock = useRef(false);
  const storage = Boolean(health?.storage);
  const leads = storage ? remoteLeads : localLeads;
  const runs = storage ? remoteRuns : localRuns;
  const latest = runs[0];
  const configured = Boolean(health?.search && health?.secure);
  const canRun = configured && Boolean(access);
  const [connected, setConnected] = useState(false);
  const send = useCallback(
    async (path, options = {}, key = access) => {
      const response = await fetch(path, {
        ...options,
        headers: { "Content-Type": "application/json", "X-Prospect-Key": key },
        signal: AbortSignal.timeout(65000),
      });
      const payload = await response.json().catch(() => {
        throw Error(
          "The API returned an invalid response. Check the server logs.",
        );
      });
      if (!response.ok)
        throw Error(payload.error || `Request failed (${response.status})`);
      return payload;
    },
    [access],
  );
  const refreshStatus = useCallback(async () => {
    try {
      const response = await fetch("/api/status", {
        signal: AbortSignal.timeout(8000),
      });
      if (!response.ok) throw Error();
      const h = await response.json();
      if (h.service !== "Prospect") throw Error();
      setHealth(h);
    } catch {
      setHealth({
        search: false,
        secure: false,
        storage: false,
        schedule: false,
        missing: [
          "API unavailable. Run npm run dev from lead-engine, or use a Vercel preview.",
        ],
      });
    }
  }, []);
  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);
  const refresh = useCallback(
    async ({ preserveError = false } = {}) => {
      if (!access) return;
      setLoading(true);
      try {
        const out = await send("/api/leads");
        setConnected(true);
        if (out.stored) {
          setRemoteLeads(out.leads || []);
          setRemoteRuns(out.runs || []);
        }
        if (!preserveError) setError("");
      } catch (e) {
        setConnected(false);
        setError(e.message);
      } finally {
        setLoading(false);
      }
    },
    [access, send],
  );
  useEffect(() => {
    if (access && health) refresh();
  }, [access, storage, Boolean(health)]);
  const run = async () => {
    if (runLock.current) return;
    if (!canRun) {
      setTab("settings");
      setNotice(
        "Configure the server and unlock this workspace to start discovery.",
      );
      return;
    }
    runLock.current = true;
    setBusy(true);
    setBriefExpanded(false);
    setError("");
    setNotice("");
    const startedAt = new Date().toISOString(),
      selection = { sector, region };
    try {
      const out = await send("/api/run", {
        method: "POST",
        body: JSON.stringify(selection),
      });
      if (!Array.isArray(out.leads) || !Number.isInteger(out.found))
        throw Error(
          "The run returned an incomplete response. No results were saved.",
        );
      if (out.stored) {
        setRemoteLeads((old) => mergeLeads(old, out.leads));
        await refresh();
      } else {
        setLocalLeads((old) => mergeLeads(old, out.leads));
        setLocalRuns((old) =>
          [
            {
              id: crypto.randomUUID(),
              ...selection,
              status: "completed",
              trigger: "manual",
              started_at: startedAt,
              finished_at: new Date().toISOString(),
              found: out.found,
              added: out.added,
              verified: out.verified,
              checked: out.checked,
              failed: out.failed,
              details: out.details,
            },
            ...old,
          ].slice(0, 25),
        );
      }
      setFilter("all");
      setQuery("");
      setTab(out.leads.length ? "shortlist" : "runs");
      setNotice(
        `Research complete. ${out.found} discovered, ${out.checked} accepted, ${out.failed} discarded. Review the evidence before outreach.`,
      );
    } catch (e) {
      const message =
        e.name === "TimeoutError"
          ? "The request timed out. Check run history before retrying; the server may still be finishing."
          : e.message;
      setError(message);
      if (!storage)
        setLocalRuns((old) =>
          [
            {
              id: crypto.randomUUID(),
              ...selection,
              status: "failed",
              trigger: "manual",
              started_at: startedAt,
              error: message,
            },
            ...old,
          ].slice(0, 25),
        );
      else await refresh({ preserveError: true });
      setTab("runs");
    } finally {
      setBusy(false);
      runLock.current = false;
    }
  };
  const unlock = async (e) => {
    e.preventDefault();
    setAuthBusy(true);
    setAuthError("");
    try {
      await send("/api/leads", {}, accessInput);
      try {
        sessionStorage.setItem("prospect_access", accessInput);
      } catch {
        setNotice(
          "Session storage is unavailable. Unlock again after reloading.",
        );
      }
      setAccess(accessInput);
      setConnected(true);
      setAccessInput("");
      setNotice("Workspace unlocked for this session.");
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setAuthBusy(false);
    }
  };
  const saveLead = async (changes) => {
    const lead = selected;
    if (storage)
      await send("/api/leads?id=" + encodeURIComponent(lead.id), {
        method: "PATCH",
        body: JSON.stringify(changes),
      });
    const setter = storage ? setRemoteLeads : setLocalLeads;
    setter((old) =>
      old.map((x) => (x.domain === lead.domain ? { ...x, ...changes } : x)),
    );
    setSelected((old) => ({ ...old, ...changes }));
  };
  const visible = useMemo(
    () =>
      leads
        .filter(
          (l) =>
            (filter === "all" ||
              (filter === "shopify" && l.shopify) ||
              (filter === "approved" && l.stage === "approved") ||
              (filter === "new" && l.stage === "new")) &&
            `${l.name} ${l.domain}`.toLowerCase().includes(query.toLowerCase()),
        )
        .sort((a, b) => (b.score || 0) - (a.score || 0)),
    [leads, filter, query],
  );
  const claims = runs.flatMap((r) => r.details?.claims || []);
  const approved = leads.filter((l) => l.stage === "approved").length;
  return (
    <>
      <a className="skip-link" href="#workspace">
        Skip to workspace
      </a>
      <header className="topbar">
        <a className="brand" href="#workspace" aria-label="Prospect workspace">
          <Mark />
          <span>
            prospect<span className="brand-period">.</span>
          </span>
        </a>
        <span className="workspace-name">
          MyDigital-Metrics <span>/</span> Research workspace
        </span>
        <div className="topbar-right">
          <Status ok={configured}>
            {health === null
              ? "Checking configuration"
              : configured
                ? "Gemini configured"
                : "Setup required"}
          </Status>
          <button
            className="icon-button"
            onClick={() => {
              setTab("settings");
              refreshStatus();
            }}
            aria-label="Open workspace settings"
          >
            <Settings2 size={18} />
          </button>
          <span
            className="workspace-avatar"
            title="MyDigital-Metrics workspace"
          >
            MD
          </span>
        </div>
      </header>
      <main id="workspace" className="workspace">
        <div className="page-heading">
          <div>
            <h1>Prospect research</h1>
            <p>
              Discover businesses. Check the evidence. Start a better
              conversation.
            </p>
          </div>
          <span className="storage-caption">
            <Database size={14} />
            {storage ? "Shared workspace" : "Browser pilot"}
            <span className="muted">· {leads.length} prospects</span>
          </span>
        </div>
        {health?.testFixture && (
          <p className="fixture-banner">
            AUTOMATED QA · SYNTHETIC .test FIXTURES · NOT LIVE SOURCING
          </p>
        )}
        <div className="workbench">
          <aside className={`brief-panel ${briefExpanded ? "expanded" : ""}`}>
            <div className="brief-heading">
              <span className="brief-mark">
                <SlidersHorizontal size={18} />
              </span>
              <h2>Your research brief</h2>
              <button
                className="brief-toggle text-button"
                aria-expanded={briefExpanded}
                aria-controls="brief-fields"
                onClick={() => setBriefExpanded((v) => !v)}
              >
                {briefExpanded ? "Done" : "Edit"}
              </button>
            </div>
            <p className="brief-summary">
              {labelFor(SECTORS, sector)} · {labelFor(REGIONS, region)}
            </p>
            <p className="brief-intro">
              Define the businesses worth a closer look. Your brief stays ready
              for the next run.
            </p>
            <div className="brief-fields" id="brief-fields">
              <Select
                label="Business segment"
                options={SECTORS}
                value={sector}
                onChange={setSector}
                disabled={busy}
              />
              <Select
                label="Target market"
                options={REGIONS}
                value={region}
                onChange={setRegion}
                disabled={busy}
              />
            </div>
            <div className="brief-scope">
              <span>Looking for</span>
              <p>
                Independent, direct-to-consumer brands with a public online
                storefront.
              </p>
              <span>Checking for</span>
              <p>
                Commerce infrastructure, product links and public contact
                pathways.
              </p>
            </div>
            <button
              className="button primary run-button"
              disabled={busy || health === null}
              onClick={run}
            >
              {busy ? (
                <RefreshCw size={17} className="spin" />
              ) : (
                <Search size={17} />
              )}
              <span>{busy ? "Researching…" : "Find prospects"}</span>
              {!busy && <ArrowRight size={16} />}
            </button>
            <p className="brief-footnote">
              {busy
                ? "Search is running. Keep this page open."
                : canRun
                  ? "One grounded search. Independently checked websites."
                  : "Connect Gemini and unlock the workspace to begin."}
            </p>
            <div className="schedule-summary">
              <Clock3 size={16} />
              <div>
                <strong>
                  {health?.schedule
                    ? "Daily schedule configured"
                    : "Run on your terms"}
                </strong>
                <p>
                  {health?.schedule
                    ? "08:00 UTC · uses the last manual brief. Verify your Vercel scheduler."
                    : "Manual discovery is available first. Add shared storage to enable daily research."}
                </p>
                <button
                  className="text-button"
                  onClick={() => setTab("settings")}
                >
                  {health?.schedule
                    ? "Check configuration"
                    : "Scheduling setup"}
                  <ArrowUpRight size={14} />
                </button>
              </div>
            </div>
          </aside>
          <section className="research-area" aria-label="Research workspace">
            <Pipeline busy={busy} latest={latest} />
            <Tabs value={tab} onValueChange={setTab}>
              <div className="output-toolbar">
                <TabsList aria-label="Workspace views">
                  <TabsTrigger value="shortlist">
                    Shortlist <span className="tab-count">{leads.length}</span>
                  </TabsTrigger>
                  <TabsTrigger value="runs">
                    Run log{" "}
                    {runs.length > 0 && (
                      <span className="tab-count">{runs.length}</span>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="settings">Connections</TabsTrigger>
                </TabsList>
                <span className="review-count">{approved} approved</span>
              </div>
              {(error || notice) && (
                <div
                  className={error ? "feedback error" : "feedback"}
                  role={error ? "alert" : "status"}
                >
                  <span>
                    {error ? <AlertCircle size={17} /> : <Check size={17} />}
                  </span>
                  <p>{error || notice}</p>
                  <button
                    className="icon-button"
                    aria-label="Dismiss message"
                    onClick={() => {
                      setError("");
                      setNotice("");
                    }}
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
              {(leadsStorageError || runsStorageError) && !storage && (
                <p className="feedback error" role="alert">
                  Browser storage is unavailable or full. Changes remain in
                  memory only; export your shortlist before closing.
                </p>
              )}
              <TabsContent value="shortlist">
                <div className="list-tools">
                  <div className="filter-group" aria-label="Filter prospects">
                    {[
                      ["all", "All"],
                      ["new", "To review"],
                      ["shopify", "Shopify"],
                      ["approved", "Approved"],
                    ].map(([key, text]) => (
                      <button
                        key={key}
                        className={filter === key ? "filter active" : "filter"}
                        aria-pressed={filter === key}
                        onClick={() => setFilter(key)}
                      >
                        {text}
                      </button>
                    ))}
                  </div>
                  <button
                    className="button plain export-button"
                    disabled={!visible.length}
                    onClick={() => exportLeads(visible)}
                  >
                    <Download size={15} />
                    Export {visible.length > 0 ? `(${visible.length})` : ""}
                  </button>
                </div>
                {leads.length > 0 && (
                  <label className="search-field">
                    <Search size={16} />
                    <input
                      type="search"
                      aria-label="Search company or domain"
                      value={query}
                      placeholder="Search company or domain"
                      onChange={(e) => setQuery(e.target.value)}
                    />
                  </label>
                )}
                <div className="prospect-list" aria-busy={loading || busy}>
                  <div className="list-columns">
                    <span>Company / website</span>
                    <span>Observed signals</span>
                    <span>Technical fit</span>
                    <span>Review</span>
                  </div>
                  {loading && !leads.length ? (
                    <div className="empty-state">
                      <p role="status">Loading workspace prospects…</p>
                    </div>
                  ) : !leads.length ? (
                    <div className="empty-state">
                      <div className="empty-index" aria-hidden="true">
                        <span />
                        <span />
                        <span />
                        <Search size={23} />
                      </div>
                      <h2>
                        Your next conversation
                        <br />
                        starts with a search.
                      </h2>
                      <p>
                        Run your brief to find real businesses. Only websites
                        that pass the public storefront checks reach this
                        shortlist.
                      </p>
                      <button
                        className="text-button"
                        onClick={run}
                        disabled={busy}
                      >
                        {configured
                          ? "Run your research brief"
                          : "Connect your research engine"}
                        <ArrowRight size={16} />
                      </button>
                      <span className="empty-note">
                        No sample leads. Your research belongs here.
                      </span>
                    </div>
                  ) : visible.length ? (
                    visible.map((lead) => (
                      <button
                        className="prospect-row"
                        key={lead.id || lead.domain}
                        onClick={() => setSelected(lead)}
                        aria-label={`Review ${lead.name || lead.domain}`}
                      >
                        <span className="company-cell">
                          <span className="row-letter">
                            {(lead.name || lead.domain).slice(0, 1)}
                          </span>
                          <span>
                            <strong>{lead.name || lead.domain}</strong>
                            <small>{lead.domain}</small>
                          </span>
                        </span>
                        <span className="signals-cell">
                          <span
                            className={
                              lead.shopify ? "signal positive" : "signal"
                            }
                          >
                            <span />
                            {lead.shopify
                              ? "Shopify marker"
                              : "Storefront checked"}
                          </span>
                          <small>{lead.reason}</small>
                        </span>
                        <span className="score-cell">
                          {lead.score}
                          <small>/100</small>
                        </span>
                        <span className="stage-cell">
                          {labelFor(STAGES, lead.stage)}
                          <ArrowUpRight size={15} />
                        </span>
                      </button>
                    ))
                  ) : (
                    <div className="empty-filter">
                      <p>No prospects match this view.</p>
                      <button
                        className="text-button"
                        onClick={() => {
                          setFilter("all");
                          setQuery("");
                        }}
                      >
                        Clear filters
                      </button>
                    </div>
                  )}
                </div>
                <div className="list-footer">
                  <span>
                    <ShieldCheck size={14} />
                    Evidence supports review. It does not prove buying intent.
                  </span>
                  {storage && (
                    <button
                      className="text-button"
                      disabled={loading}
                      onClick={refresh}
                    >
                      Refresh
                    </button>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="runs">
                <div className="view-heading">
                  <div>
                    <h2>Research run log</h2>
                    <p>Queries, sources and every candidate decision.</p>
                  </div>
                  {storage && (
                    <button
                      className="button plain"
                      disabled={loading}
                      onClick={refresh}
                    >
                      <RefreshCw size={15} />
                      Refresh
                    </button>
                  )}
                </div>
                {busy && (
                  <p className="feedback" role="status">
                    Research in progress. Results will appear when the server
                    responds; no candidate counts are estimated.
                  </p>
                )}
                {runs.length ? (
                  runs.map((r) => <RunRecord key={r.id} run={r} />)
                ) : (
                  <div className="empty-filter">
                    <Clock3 size={24} />
                    <h3>No research runs yet</h3>
                    <p>
                      Run your brief to build an auditable research history.
                    </p>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="settings">
                <div className="view-heading">
                  <div>
                    <h2>Research connections</h2>
                    <p>
                      Configuration presence is shown below. A successful run
                      verifies provider access.
                    </p>
                  </div>
                  <button className="button plain" onClick={refreshStatus}>
                    <RefreshCw size={15} />
                    Recheck
                  </button>
                </div>
                <div className="connection-list">
                  {[
                    {
                      title: "Gemini + Google Search",
                      key: "GEMINI_API_KEY",
                      ok: health?.search,
                      description:
                        "Required for live discovery. Server only; never enter the API key here.",
                    },
                    {
                      title: "Workspace protection",
                      key: "APP_ACCESS_KEY",
                      ok: health?.secure,
                      description: "Required to protect the research endpoint.",
                    },
                    {
                      title: "Shared storage",
                      key: "SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY",
                      ok: health?.storage,
                      description:
                        "Optional for manual runs. Apply schema.sql to enable durable records.",
                    },
                    {
                      title: "Daily automation",
                      key: "CRON_SECRET",
                      ok: health?.schedule,
                      description:
                        "Requires shared storage and an active Vercel cron deployment.",
                    },
                  ].map((c) => (
                    <div className="connection" key={c.key}>
                      <span
                        className={
                          c.ok ? "connection-check present" : "connection-check"
                        }
                      >
                        {c.ok ? <Check size={17} /> : <span />}
                      </span>
                      <div>
                        <h3>{c.title}</h3>
                        <p>{c.description}</p>
                        <code>{c.key}</code>
                      </div>
                      <span className="connection-state">
                        {c.ok ? "Configured" : "Not configured"}
                      </span>
                    </div>
                  ))}
                </div>
                {health?.missing?.length > 0 && (
                  <div className="config-help">
                    <h3>Set up on the server</h3>
                    <p>
                      Add the missing variables to Vercel preview settings or an
                      ignored <code>lead-engine/.env.local</code>, then restart
                      the dev server or redeploy. Keep credentials out of source
                      control.
                    </p>
                    <p className="small">
                      Missing: {health.missing.join(", ")}
                    </p>
                  </div>
                )}
                <form className="unlock-form" onSubmit={unlock}>
                  <div>
                    <h3>
                      {connected
                        ? "Workspace unlocked"
                        : "Unlock this workspace"}
                    </h3>
                    <p>
                      The workspace access key stays in this browser tab’s
                      session. Your Gemini key stays on the server.
                    </p>
                  </div>
                  {access && connected ? (
                    <button
                      className="button secondary"
                      type="button"
                      onClick={() => {
                        try {
                          sessionStorage.removeItem("prospect_access");
                        } catch {}
                        setAccess("");
                        setConnected(false);
                        setRemoteLeads([]);
                        setRemoteRuns([]);
                        setSelected(null);
                      }}
                    >
                      Lock workspace
                    </button>
                  ) : (
                    <>
                      <label>
                        Workspace access key
                        <input
                          type="password"
                          autoComplete="current-password"
                          required
                          value={accessInput}
                          onChange={(e) => setAccessInput(e.target.value)}
                          aria-invalid={Boolean(authError)}
                          aria-describedby={
                            authError ? "unlock-error" : undefined
                          }
                        />
                      </label>
                      {authError && (
                        <p
                          id="unlock-error"
                          role="alert"
                          className="error-text"
                        >
                          {authError}
                        </p>
                      )}
                      <button
                        className="button primary"
                        disabled={authBusy || !health?.secure}
                      >
                        <KeyRound size={16} />
                        {authBusy ? "Checking…" : "Unlock workspace"}
                      </button>
                    </>
                  )}
                </form>
              </TabsContent>
            </Tabs>
          </section>
        </div>
        <footer className="workspace-footer">
          <span>Prospect for MyDigital-Metrics</span>
          <span>
            {storage ? "Shared records" : "Stored in this browser"} ·
            Human-reviewed outreach
          </span>
          <a href="/licenses/" target="_blank" rel="noreferrer">
            Component licenses
            <ArrowUpRight size={12} />
          </a>
        </footer>
      </main>
      {selected && (
        <Inspector
          key={selected.id || selected.domain}
          lead={selected}
          claim={claims.find((c) => c.domain === selected.domain)}
          onClose={() => setSelected(null)}
          onSave={saveLead}
        />
      )}
    </>
  );
}
createRoot(document.getElementById("root")).render(
  <MotionConfig reducedMotion="user">
    <App />
  </MotionConfig>,
);
