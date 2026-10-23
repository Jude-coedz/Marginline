import React, { useEffect, useRef, useState } from "react";
import { X, ArrowUpRight, Check, Copy, Save } from "lucide-react";
import { Button, Input, SelectField } from "./Controls";
import { AlertDialog } from "@base-ui/react/alert-dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./Tabs";
import { STAGES, labelFor, dateLabel, safeLink } from "../lib";
export function SourceLink({ href, children }) {
  const url = safeLink(href);
  return url ? (
    <a href={url} target="_blank" rel="noopener noreferrer">
      {children}
      <ArrowUpRight size={14} aria-hidden="true" />
    </a>
  ) : (
    <span>{children}</span>
  );
}
export default function Inspector({ lead, onClose, onSave, claim }) {
  const dialog = useRef(null),
    [stage, setStage] = useState(lead.stage || "new"),
    [notes, setNotes] = useState(lead.notes || ""),
    [subject, setSubject] = useState(lead.outreach_subject || ""),
    [body, setBody] = useState(lead.outreach_body || ""),
    [saving, setSaving] = useState(false),
    [feedback, setFeedback] = useState(""),
    [error, setError] = useState(""),
    [discardOpen, setDiscardOpen] = useState(false);
  useEffect(() => {
    const previous = document.activeElement;
    dialog.current.showModal();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, []);
  const dirty =
    stage !== (lead.stage || "new") ||
    notes !== (lead.notes || "") ||
    subject !== (lead.outreach_subject || "") ||
    body !== (lead.outreach_body || "");
  const close = () => {
    if (saving) return;
    if (dirty) setDiscardOpen(true);
    else onClose();
  };
  const save = async () => {
    setSaving(true);
    setFeedback("");
    setError("");
    try {
      await onSave({
        stage,
        notes,
        outreach_subject: subject,
        outreach_body: body,
      });
      setFeedback("Review saved. No message sent.");
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`);
      setFeedback("Draft copied. Send manually after review.");
    } catch {
      setError(
        "Clipboard unavailable. Select the draft text and copy it manually.",
      );
    }
  };
  return (
    <dialog
      ref={dialog}
      className="inspector"
      onCancel={(e) => {
        e.preventDefault();
        if (discardOpen) setDiscardOpen(false);
        else if (!saving) close();
      }}
      onClick={(e) => {
        if (e.target === dialog.current && !saving) close();
      }}
      aria-labelledby="inspector-title"
    >
      <div className="inspector-inner">
        <header className="inspector-head">
          <span>Prospect review</span>
          <Button
            variant="ghost"
            className="icon-button"
            aria-label="Close prospect review"
            disabled={saving}
            onClick={close}
          >
            <X />
          </Button>
        </header>
        <div className="company-heading">
          <div className="company-letter">
            {(lead.name || lead.domain).slice(0, 1)}
          </div>
          <h2 id="inspector-title">{lead.name || lead.domain}</h2>
          <SourceLink href={lead.website}>{lead.domain}</SourceLink>
          <div className="company-meta">
            <span>{labelFor(STAGES, lead.stage)}</span>
            <span>{lead.score}/100 technical fit</span>
          </div>
        </div>
        <Tabs defaultValue="evidence">
          <TabsList aria-label="Prospect details">
            <TabsTrigger value="evidence">Evidence</TabsTrigger>
            <TabsTrigger value="outreach">Outreach draft</TabsTrigger>
          </TabsList>
          <TabsContent value="evidence">
            <section className="inspector-section">
              <h3>Observed on the website</h3>
              <p className="muted small">
                Homepage checked {dateLabel(lead.scanned_at)}. Signals can
                become stale.
              </p>
              <ul className="observations">
                {(lead.observed || []).map((item, i) => (
                  <li key={i}>
                    <Check size={15} aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="source-links">
                {(lead.evidence || []).map((item, i) => (
                  <SourceLink key={i} href={item.source}>
                    {item.label}
                  </SourceLink>
                ))}
              </div>
            </section>
            <section className="inspector-section">
              <h3>Research interpretation</h3>
              <p>{lead.reason}</p>
              {claim?.description && (
                <p>
                  <strong>Gemini suggestion:</strong> {claim.description}
                </p>
              )}
              <p className="caution">
                Confirm category, location
                {claim?.country ? ` (${claim.country} suggested)` : ""},
                official ownership and agency fit yourself. A public homepage
                and a technical score do not establish buying intent.
              </p>
            </section>
          </TabsContent>
          <TabsContent value="outreach">
            <section className="inspector-section">
              <h3>A conversation starts with review.</h3>
              <p className="muted">
                Edit the draft around a specific observation you can
                substantiate. Approval saves your decision; it does not send an
                email.
              </p>
              <label>
                Subject
                <Input
                  disabled={saving}
                  value={subject}
                  onChange={(e) => {
                    setSubject(e.target.value);
                    setFeedback("");
                  }}
                  maxLength={200}
                />
              </label>
              <label>
                First-touch draft
                <textarea
                  disabled={saving}
                  rows={12}
                  value={body}
                  onChange={(e) => {
                    setBody(e.target.value);
                    setFeedback("");
                  }}
                  maxLength={10000}
                />
              </label>
              <Button
                variant="secondary"
                className="button secondary"
                onClick={copy}
                disabled={!body || saving}
              >
                <Copy size={15} />
                Copy draft
              </Button>
            </section>
          </TabsContent>
        </Tabs>
        <section className="inspector-section review-fields">
          <SelectField
            label="Review stage"
            options={STAGES}
            value={stage}
            onChange={(value) => {
              setStage(value);
              setFeedback("");
            }}
            disabled={saving}
            container={dialog}
          />
          <label>
            Private review notes
            <textarea
              disabled={saving}
              rows={3}
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
                setFeedback("");
              }}
              maxLength={10000}
              placeholder="What makes this business a fit? What needs checking?"
            />
          </label>
        </section>
        <footer className="inspector-footer">
          {error && (
            <p role="alert" className="error-text">
              {error}
            </p>
          )}
          {feedback && <p role="status">{feedback}</p>}
          <Button
            variant="primary"
            className="button primary"
            disabled={saving}
            onClick={save}
          >
            <Save size={16} />
            {saving ? "Saving…" : "Save review"}
          </Button>
          <span>No automatic outreach</span>
        </footer>
      </div>
      <AlertDialog.Root open={discardOpen} onOpenChange={setDiscardOpen}>
        <AlertDialog.Portal container={dialog}>
          <AlertDialog.Backdrop className="confirm-backdrop" />
          <AlertDialog.Popup className="confirm-panel">
            <AlertDialog.Title>Discard this review?</AlertDialog.Title>
            <AlertDialog.Description>
              Your unsaved notes and draft edits will be lost. The saved
              prospect will stay in your shortlist.
            </AlertDialog.Description>
            <div className="form-actions">
              <AlertDialog.Close render={<Button variant="secondary" />}>
                Keep editing
              </AlertDialog.Close>
              <Button variant="danger" onClick={onClose}>
                Discard changes
              </Button>
            </div>
          </AlertDialog.Popup>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </dialog>
  );
}
