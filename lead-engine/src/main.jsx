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
  ShieldCheck,
  Clock3,
  AlertCircle,
  ChevronRight,
  KeyRound,
  X,
} from "lucide-react";
import SpotlightCard from "./components/vendor/SpotlightCard";
import Inspector, { SourceLink } from "./components/Inspector";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./components/Tabs";
import { Button, Input, SelectField } from "./components/Controls";
import WorkspaceMenu from "./components/WorkspaceMenu";
import SettingsPanel from "./components/SettingsPanel";
import {
  SECTORS,
  REGIONS,
  STAGES,
  labelFor,
  dateLabel,
  mergeLeads,
  exportLeads,
} from "./lib";
import "@fontsource/dm-sans/latin-400.css";
import "@fontsource/dm-sans/latin-500.css";
import "@fontsource/dm-sans/latin-600.css";
import "@fontsource/dm-sans/latin-700.css";
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
    [settingsOpen, setSettingsOpen] = useState(false),
    [storageCheck, setStorageCheck] = useState(null),
    [checkingStorage, setCheckingStorage] = useState(false);
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
  const accessGeneration = useRef(0);
  const storage = Boolean(health?.storage);
  const leads = storage ? (access ? remoteLeads : []) : localLeads;
  const runs = storage ? (access ? remoteRuns : []) : localRuns;
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
      const generation = accessGeneration.current;
      setLoading(true);
      try {
        const out = await send("/api/leads");
        if (generation !== accessGeneration.current) return;
        setConnected(true);
        if (out.stored) {
          setRemoteLeads(out.leads || []);
          setRemoteRuns(out.runs || []);
        }
        if (!preserveError) setError("");
      } catch (e) {
        if (generation !== accessGeneration.current) return;
        setConnected(false);
        setError(e.message);
      } finally {
        if (generation === accessGeneration.current) setLoading(false);
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
      setSettingsOpen(true);
      setNotice(
        "Configure the server and unlock this workspace to start discovery.",
      );
      return;
    }
    runLock.current = true;
    setBusy(true);
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
      setSettingsOpen(false);
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setAuthBusy(false);
    }
  };
  const saveLead = async (changes) => {
    const lead = selected;
    const generation = accessGeneration.current;
    if (storage)
      await send("/api/leads?id=" + encodeURIComponent(lead.id), {
        method: "PATCH",
        body: JSON.stringify(changes),
      });
    if (generation !== accessGeneration.current) return;
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
  const lockWorkspace = () => {
    accessGeneration.current += 1;
    setLoading(false);
    setCheckingStorage(false);
    try {
      sessionStorage.removeItem("prospect_access");
    } catch {}
    setAccess("");
    setConnected(false);
    setRemoteLeads([]);
    setRemoteRuns([]);
    setSelected(null);
    setStorageCheck(null);
    setNotice("Workspace locked.");
  };
  const checkStorage = async () => {
    const generation = accessGeneration.current;
    setCheckingStorage(true);
    try {
      const out = await send("/api/storage");
      if (generation !== accessGeneration.current) return;
      setStorageCheck(out);
    } catch (e) {
      if (generation !== accessGeneration.current) return;
      setStorageCheck({ verified: false, error: e.message });
    } finally {
      if (generation === accessGeneration.current) setCheckingStorage(false);
    }
  };
  const openSettings = () => {
    setSettingsOpen(true);
    refreshStatus();
  };
  const reduce = useReducedMotion();
  return (
    <>
      <a className="skip-link" href="#workspace">
        Skip to workspace
      </a>
      <header className="topbar">
        <div className="topbar-inner">
          <a
            className="brand"
            href="#workspace"
            aria-label="Prospect workspace"
          >
            <Mark />
            <span>
              prospect<span className="brand-period">.</span>
            </span>
          </a>
          <span className="workspace-name">MyDigital-Metrics</span>
          <div className="topbar-right">
            <Button
              variant="ghost"
              size="icon"
              onClick={openSettings}
              aria-label="Open workspace settings"
            >
              <Settings2 size={18} />
            </Button>
            <WorkspaceMenu
              onSettings={openSettings}
              onLock={lockWorkspace}
              unlocked={Boolean(access && connected)}
              busy={busy}
            />
          </div>
        </div>
      </header>
      <main id="workspace" className="workspace">
        <div className="page-heading">
          <div>
            <h1>Find your next conversation.</h1>
            <p>
              Discover businesses worth knowing. Review the evidence before
              reaching out.
            </p>
          </div>
          <span className="workspace-mode">
            {storage ? "Shared workspace" : "Personal workspace"}
          </span>
        </div>
        {health?.testFixture && (
          <p className="fixture-banner">
            AUTOMATED QA · SYNTHETIC .test FIXTURES · NOT LIVE SOURCING
          </p>
        )}
        <SpotlightCard
          className="research-command"
          theme="light"
          intensity={reduce ? 0 : 0.05}
          borderGlow={0}
          proximity={0}
          flare={false}
          grain={0}
          style={{ "--spotlight-card-shadow": "none" }}
        >
          <div className="research-controls">
            <SelectField
              label="Business segment"
              options={SECTORS}
              value={sector}
              onChange={setSector}
              disabled={busy}
            />
            <SelectField
              label="Target market"
              options={REGIONS}
              value={region}
              onChange={setRegion}
              disabled={busy}
            />
            <Button
              variant="primary"
              className="run-button"
              onClick={run}
              disabled={busy || health === null}
            >
              {busy ? (
                <RefreshCw size={17} className="spin" />
              ) : (
                <Search size={17} />
              )}
              <span>{busy ? "Researching…" : "Find prospects"}</span>
              <ArrowRight size={17} />
            </Button>
          </div>
          <div className="research-context">
            <span>
              {busy
                ? "Searching and checking public websites. Keep this page open."
                : "Independent ecommerce brands · Public storefront checks · Human review"}
            </span>
            <span>
              {latest
                ? `Last run ${dateLabel(latest.started_at)}`
                : "Ready for your first search"}
            </span>
          </div>
        </SpotlightCard>
        <section className="research-area" aria-label="Research workspace">
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
              </TabsList>
              <span className="review-count">
                {approved} approved for contact
              </span>
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
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Dismiss message"
                  onClick={() => {
                    setError("");
                    setNotice("");
                  }}
                >
                  <X size={16} />
                </Button>
              </div>
            )}
            {(leadsStorageError || runsStorageError) && !storage && (
              <p className="feedback error" role="alert">
                Browser storage is unavailable or full. Export your shortlist
                before closing.
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
                    <Button
                      variant="ghost"
                      key={key}
                      className={filter === key ? "filter active" : "filter"}
                      aria-pressed={filter === key}
                      onClick={() => setFilter(key)}
                    >
                      {text}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="ghost"
                  className="button plain export-button"
                  disabled={!visible.length}
                  onClick={() => exportLeads(visible)}
                >
                  <Download size={15} />
                  Export {visible.length > 0 ? `(${visible.length})` : ""}
                </Button>
              </div>
              {leads.length > 0 && (
                <label className="search-field">
                  <Search size={16} />
                  <Input
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
                    <h2>No prospects yet.</h2>
                    <p>
                      Choose a segment and market above, then find prospects. We
                      check public storefronts before adding businesses here.
                    </p>

                    <span className="empty-note">
                      Your research will appear here.
                    </span>
                  </div>
                ) : visible.length ? (
                  visible.map((lead) => (
                    <Button
                      variant="ghost"
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
                    </Button>
                  ))
                ) : (
                  <div className="empty-filter">
                    <p>No prospects match this view.</p>
                    <Button
                      variant="ghost"
                      className="text-button"
                      onClick={() => {
                        setFilter("all");
                        setQuery("");
                      }}
                    >
                      Clear filters
                    </Button>
                  </div>
                )}
              </div>
              <div className="list-footer">
                <span>
                  <ShieldCheck size={14} />
                  Evidence supports review. It does not prove buying intent.
                </span>
                {storage && (
                  <Button
                    variant="ghost"
                    className="text-button"
                    disabled={loading}
                    onClick={refresh}
                  >
                    Refresh
                  </Button>
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
                  <Button
                    variant="ghost"
                    className="button plain"
                    disabled={loading}
                    onClick={refresh}
                  >
                    <RefreshCw size={15} />
                    Refresh
                  </Button>
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
                  <p>Run your brief to build an auditable research history.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </section>
        <footer className="workspace-footer">
          <span>Prospect for MyDigital-Metrics</span>
          <span>
            {storage ? "Shared records" : "Saved on this device"} · Outreach
            stays in your hands
          </span>
          <a href="/licenses/" target="_blank" rel="noreferrer">
            Component licenses
            <ArrowUpRight size={12} />
          </a>
        </footer>
      </main>
      <SettingsPanel open={settingsOpen} onOpenChange={setSettingsOpen}>
        <section className="settings-section">
          <h2>Workspace access</h2>
          {access && connected ? (
            <div className="access-summary">
              <ShieldCheck size={19} />
              <div>
                <strong>Workspace unlocked</strong>
                <p>
                  You can run research and review prospects. Lock this session
                  from the workspace menu.
                </p>
              </div>
            </div>
          ) : (
            <form className="unlock-form" onSubmit={unlock}>
              <p>
                Enter your workspace key to start research. It stays in this
                browser tab; provider keys stay on the server.
              </p>
              <label>
                Workspace access key
                <Input
                  type="password"
                  autoComplete="current-password"
                  required
                  value={accessInput}
                  onChange={(e) => setAccessInput(e.target.value)}
                  aria-invalid={Boolean(authError)}
                  aria-describedby={authError ? "unlock-error" : undefined}
                />
              </label>
              {authError && (
                <p id="unlock-error" role="alert" className="error-text">
                  {authError}
                </p>
              )}
              {health && !health.secure && (
                <p className="config-help">
                  Workspace protection needs APP_ACCESS_KEY in the Vercel
                  project’s environment settings. Add it and redeploy to enable
                  unlocking.
                </p>
              )}
              <div className="form-actions">
                <Button
                  variant="primary"
                  type="submit"
                  disabled={authBusy || !health?.secure}
                >
                  <KeyRound size={16} />
                  {authBusy ? "Checking…" : "Unlock workspace"}
                </Button>
              </div>
            </form>
          )}
        </section>
        <section className="settings-section">
          <div className="settings-section-heading">
            <h2>Shared storage</h2>
            <span className="settings-state">
              {storageCheck?.verified
                ? "Verified"
                : storage
                  ? "Connection added"
                  : "Not connected"}
            </span>
          </div>
          <p>
            {storage
              ? "Supabase keeps prospects, reviews and run history available across devices. Verify the database before relying on shared records."
              : "Research currently stays on this device. Connect Supabase to keep prospects and review history across devices."}
          </p>
          <div className="settings-inline-action">
            <span>
              {storage
                ? "Server connection is configured."
                : "No database credentials are entered in this app."}
            </span>
            <Button
              variant="secondary"
              size="small"
              disabled={!access || !storage || checkingStorage}
              onClick={checkStorage}
            >
              {checkingStorage ? "Checking…" : "Verify storage"}
            </Button>
          </div>
          {storageCheck && (
            <p
              className={
                storageCheck.verified ? "verification-result" : "error-text"
              }
              role="status"
            >
              {storageCheck.verified
                ? "Verified access to prospects, run history and saved search settings."
                : storageCheck.error || "Shared storage is not connected."}
            </p>
          )}
        </section>
        <details className="technical-settings">
          <summary>
            Service details <ChevronRight size={16} />
          </summary>
          <div className="technical-settings-content">
            <p className="small muted">
              Configuration is shown here for the workspace owner. A successful
              search verifies provider access.
            </p>
            <div className="service-row">
              <span>Discovery provider</span>
              <strong>
                {health?.search ? "Configured" : "Not configured"}
              </strong>
            </div>
            <div className="service-row">
              <span>Workspace protection</span>
              <strong>
                {health?.secure ? "Configured" : "Not configured"}
              </strong>
            </div>
            <div className="service-row">
              <span>Daily scheduling</span>
              <strong>{health?.schedule ? "Configured" : "Not enabled"}</strong>
            </div>
            {health?.missing?.length > 0 && (
              <p className="config-help">
                Missing server configuration: {health.missing.join(", ")}.
                Update the Vercel environment settings and redeploy.
              </p>
            )}
            <p className="small muted">
              Scheduling requires a verified Supabase connection and an active
              scheduler. It is optional for manual searches.
            </p>
            <div className="form-actions">
              <Button variant="secondary" size="small" onClick={refreshStatus}>
                <RefreshCw size={14} />
                Recheck services
              </Button>
            </div>
          </div>
        </details>
      </SettingsPanel>
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
