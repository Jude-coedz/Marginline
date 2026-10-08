/* Marginline: interactive, deterministic demo. Nothing is sent to Shopify or any external service. */
(function () {
  "use strict";

  const AVAILABLE = 36;
  const PLANNER_DEMAND = 20;
  const STARTING_RETARGET_DEMAND = 20;
  const CAMPAIGN_SKU = "NG-100";
  const STORAGE = "marginline:demo-v2";

  const scenes = [
    {
      index: "01", kicker: "THE SETUP",
      headline: "One product.<br>Two good intentions.",
      description: "A campaign planner and a retargeting workflow each want to promote the same product. They never check each other's plans.",
      action: "Check each workflow", micro: "Both proposals look perfectly reasonable on their own.",
      note: "Every planned action has its own workflow. The inventory does not."
    },
    {
      index: "02", kicker: "THE BLIND SPOT",
      headline: "Two green checks.<br>One missing question.",
      description: "Each automation checks its own 20-unit campaign against 36 available units. Both pass. Neither sees the other's demand.",
      action: "Check them together", micro: "What happens when both campaigns go live in the same window?",
      note: "20 ≤ 36. Both workflows individually return a pass."
    },
    {
      index: "03", kicker: "THE COMMERCIAL RISK",
      headline: "The workflows pass.<br>The release doesn't.",
      description: "Marginline evaluates the combined release. Forty units have been promised against just 36 available. Hold the release before either promotion goes live.",
      action: "Resolve this release", micro: "A four-unit shortage, caught before anything goes live.",
      note: "The shared inventory check catches what individual workflows missed."
    },
    {
      index: "04", kicker: "THE RESOLUTION",
      headline: "A safer decision.<br>Before it ships.",
      description: "Adjust the retargeting forecast below. Marginline recalculates the shared exposure as you change the release plan.",
      action: "Export decision record", micro: "Try reducing the second forecast to 16 or fewer units.",
      note: "A cleared preflight means ready for the next approval, not already published."
    }
  ];

  const $ = (id) => document.getElementById(id);
  const dom = {
    instrument: $("instrument"), heading: $("scene-heading"), description: $("scene-description"),
    kicker: $("scene-kicker"), index: $("step-index"), primary: $("primary-action"), label: $("primary-label"),
    restart: $("restart"), footer: $("footer-explanation"), micro: $("control-message"),
    overline: $("control-overline"), slider: $("second-demand"), amount: $("fix-amount"),
    panel: $("fix-panel"), hint: $("fix-hint"), suggested: $("suggest-fix"),
    sourceUnits: $("source-b-units"), sourceNote: $("source-b-note"), planned: $("planned-number"),
    fill: $("capacity-fill"), percentage: $("capacity-percent"), difference: $("capacity-difference"),
    status: $("decision-status"), copy: $("decision-copy"), evidence: $("evidence"),
    evidenceToggle: $("evidence-toggle"), mathArrow: $("math-arrow"),
    mathRetarget: $("math-retargeting"), mathTotal: $("math-total"), conclusion: $("math-conclusion"),
    proof: $("proofbar-copy")
  };

  let state = {stage: 0, demandB: STARTING_RETARGET_DEMAND};
  try {
    const stored = JSON.parse(window.sessionStorage.getItem(STORAGE) || "null");
    if (stored && Number.isInteger(stored.stage) && stored.stage >= 0 && stored.stage <= 3 &&
       Number.isInteger(stored.demandB) && stored.demandB >= 0 && stored.demandB <= AVAILABLE) {
      state = {stage: stored.stage, demandB: stored.demandB};
    }
  } catch (_) { /* Private browsing may not allow persistence. */ }

  function save() {
    try { window.sessionStorage.setItem(STORAGE, JSON.stringify(state)); } catch (_) { /* No persistence available. */ }
  }

  function evaluate() {
    const first = {source: "AI campaign planner", forecast: PLANNER_DEMAND,
      individuallyAllowed: PLANNER_DEMAND <= AVAILABLE};
    const second = {source: "n8n retargeting", forecast: state.demandB,
      individuallyAllowed: state.demandB <= AVAILABLE};
    const combined = PLANNER_DEMAND + state.demandB;
    return {
      sku: CAMPAIGN_SKU,
      stockSnapshot: {availableToPromise: AVAILABLE, origin: "fictional_shopify_merchant",
        assumption: "The source systems refer to the same SKU and overlapping campaign window."},
      proposedActions: [first, second],
      combinedUnits: combined,
      shortage: Math.max(0, combined - AVAILABLE),
      verdict: combined > AVAILABLE ? "BLOCK" : "READY_FOR_APPROVAL",
      reason: combined > AVAILABLE
        ? "Two individually acceptable workflows oversubscribe the shared stock."
        : "The sum of planned demands fits the available-to-promise inventory.",
      limits: ["Synthetic inputs", "No reserved stock writes", "No guaranteed atomic execution",
        "Preflight is not an execution authorization"]
    };
  }

  function reveal(stageChange) {
    if (!stageChange || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    [dom.kicker, dom.heading, dom.description].forEach(function (node, i) {
      if (!node || !node.animate) return;
      node.animate([
        {opacity: .38, transform: "translateY(9px)"},
        {opacity: 1, transform: "translateY(0px)"}
      ], {duration: 390 + i * 100, easing: "cubic-bezier(.19,1,.22,1)", fill: "none"});
    });
    if (state.stage === 1) {
      document.querySelectorAll(".connection-flow").forEach(function (path, i) {
        if (path.animate) path.animate([
          {strokeDashoffset: 210, opacity: .1}, {strokeDashoffset: 0, opacity: .95}
        ], {duration: 620, delay: i * 140, fill: "forwards",
          easing: "cubic-bezier(.4,0,.2,1)"});
      });
    } else if (state.stage >= 2) {
      document.querySelectorAll(".connection-flow").forEach(function (path) {
        if (path.animate) path.animate([{strokeDashoffset: 210}, {strokeDashoffset: 0}],
          {duration: 500, fill: "forwards", easing: "cubic-bezier(.4,0,.2,1)"});
      });
      const sym = $("decision-symbol");
      if (sym && sym.animate) sym.animate([
        {opacity: .5, transform: "scale(.78) translateY(7px)"},
        {opacity: 1, transform: "scale(1) translateY(0)"}
      ], {duration: 540, easing: "cubic-bezier(.19,1,.22,1)"});
    }
  }

  function render(stageChange) {
    const scene = scenes[state.stage];
    const result = evaluate();
    const checked = state.stage >= 2;
    const ready = result.verdict === "READY_FOR_APPROVAL";

    dom.instrument.dataset.stage = String(state.stage);
    dom.instrument.dataset.outcome = ready ? "allowed" : "blocked";
    dom.index.textContent = scene.index;
    dom.kicker.textContent = scene.kicker;
    dom.heading.innerHTML = scene.headline;
    dom.description.textContent = scene.description;
    dom.overline.textContent = state.stage === 3
      ? (ready ? "REVISED RELEASE / VALIDATED" : "REVISED RELEASE / STILL ON HOLD")
      : ["A TWO-MINUTE WALKTHROUGH", "INDIVIDUALLY SAFE", "THE HIDDEN COLLISION", "THE RESOLUTION"][state.stage];
    dom.micro.textContent = state.stage === 3 && ready
      ? "The combined demand now fits. This release can move to the next approval step."
      : scene.micro;
    dom.footer.lastElementChild.textContent = scene.note;

    dom.slider.value = String(state.demandB);
    dom.amount.textContent = String(state.demandB);
    dom.sourceUnits.textContent = String(state.demandB);
    dom.sourceNote.textContent = state.demandB + " units forecast";
    dom.planned.innerHTML = (checked ? result.combinedUnits : "—") + ' <span>units</span>';
    dom.mathRetarget.textContent = state.demandB + " units";
    dom.mathTotal.textContent = result.combinedUnits + " units";
    dom.percentage.textContent = checked
      ? Math.round((result.combinedUnits / AVAILABLE) * 100) + "% of available stock"
      : "Awaiting combined check";
    dom.fill.style.width = (checked ? Math.min(100, result.combinedUnits / AVAILABLE * 100) : 0) + "%";

    if (checked) {
      dom.difference.textContent = result.shortage
        ? result.shortage + " units oversubscribed"
        : (AVAILABLE - result.combinedUnits) + " units still available";
      dom.status.textContent = ready ? "Ready for review" : "Release held";
      dom.copy.textContent = ready ? "No shared-stock conflict found in this proposed release."
        : result.shortage + " units are promised beyond available stock.";
      dom.proof.textContent = ready
        ? "One updated forecast clears the shared inventory constraint."
        : "Every individual check can pass while the combined release is unsafe.";
      dom.conclusion.textContent = ready
        ? "Each campaign fits individually, and the combined " + result.combinedUnits +
          "-unit plan is within the 36 available units. Preflight clears, subject to other approvals."
        : "Each action is within 36 units. Together, " + result.combinedUnits +
          " > 36. The entire release remains held until the conflict is resolved.";
    } else {
      dom.difference.textContent = "";
      dom.status.textContent = state.stage === 1 ? "Both passed" : "Not checked";
      dom.copy.textContent = state.stage === 1
        ? "Each workflow is safe when evaluated alone."
        : "Check the release before any automation acts.";
      dom.proof.textContent = state.stage === 1
        ? "Individually, 20 is less than 36. Both systems report success."
        : "This is the kind of error individual workflow checks cannot see.";
      dom.conclusion.textContent =
        "The individual checks only compare each forecast with the 36 units available. The shared release check must evaluate their combined demand.";
    }

    dom.panel.hidden = state.stage !== 3;
    dom.restart.hidden = state.stage === 0;
    dom.label.textContent = scene.action;
    dom.primary.disabled = state.stage === 3 && !ready;
    dom.primary.setAttribute("aria-disabled", String(state.stage === 3 && !ready));
    dom.primary.title = state.stage === 3 && !ready
      ? "First reduce the total forecast to 36 units or fewer." : "";

    dom.hint.textContent = ready
      ? "Safe against this stock snapshot. No actions have been executed."
      : "Currently " + result.shortage + " units over. Move the slider or apply the suggested allocation.";

    document.querySelectorAll(".step-dot").forEach(function (dot, i) {
      dot.classList.toggle("active", i === state.stage);
    });
    save();
    reveal(stageChange);
  }

  function advance() {
    if (state.stage < 3) {
      state.stage += 1;
      render(true);
      return;
    }
    if (evaluate().verdict === "READY_FOR_APPROVAL") exportRecord();
  }

  function reset() {
    state.stage = 0;
    state.demandB = STARTING_RETARGET_DEMAND;
    dom.evidence.hidden = true;
    dom.evidenceToggle.setAttribute("aria-expanded", "false");
    dom.evidenceToggle.firstChild.textContent = "Show the math ";
    dom.mathArrow.textContent = "↗";
    document.querySelectorAll(".connection-flow").forEach(function (path) {
      path.getAnimations().forEach(function (animation) { animation.cancel(); });
    });
    render(true);
    dom.instrument.scrollIntoView({block: "nearest", behavior:
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth"});
  }

  function exportRecord() {
    const result = evaluate();
    if (result.verdict !== "READY_FOR_APPROVAL" || state.stage !== 3) return;
    const record = {
      name: "Marginline — Synthetic commercial preflight",
      generatedAt: new Date().toISOString(),
      scenario: "Two overlapping promotions for a shared SKU",
      workflow: "Demo exercise, no connected systems or executions",
      evaluation: result,
      history: [
        {moment: "individual", note: "Each action individually requested fewer units than available", status: "ALLOW_IN_ISOLATION"},
        {moment: "combined", note: result.reason, status: result.verdict}
      ],
      nextStep: "External authorization and authoritative inventory reservation required before execution"
    };
    const url = URL.createObjectURL(new Blob([JSON.stringify(record,null,2)], {type: "application/json"}));
    const link = document.createElement("a"); link.href = url;
    link.download = "marginline-release-preflight.json";
    document.body.appendChild(link); link.click(); link.remove();
    window.setTimeout(function () { URL.revokeObjectURL(url); }, 1200);
    const original = dom.label.textContent;
    dom.label.textContent = "Decision record saved ✓";
    window.setTimeout(function () { if (state.stage === 3) dom.label.textContent = original; }, 2100);
  }

  $("hero-start").addEventListener("click", function (event) {
    event.preventDefault();
    if (state.stage === 0) advance();
    $("experience").scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
      block: "start"
    });
  });
  dom.primary.addEventListener("click", advance);
  dom.restart.addEventListener("click", reset);
  dom.suggested.addEventListener("click", function () {
    state.demandB = Math.max(0, AVAILABLE - PLANNER_DEMAND);
    render(true);
  });
  dom.slider.addEventListener("input", function () {
    state.demandB = Math.max(0, Math.min(AVAILABLE, Number(dom.slider.value)));
    render(false);
  });
  dom.evidenceToggle.addEventListener("click", function () {
    const opening = dom.evidence.hidden;
    dom.evidence.hidden = !opening;
    dom.evidenceToggle.setAttribute("aria-expanded", String(opening));
    dom.evidenceToggle.firstChild.textContent = opening ? "Hide the math " : "Show the math ";
    dom.mathArrow.textContent = opening ? "↖" : "↗";
    if (opening && dom.evidence.animate && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      dom.evidence.animate([{opacity:0, transform:"translateY(-5px)"},{opacity:1, transform:"translateY(0)"}],
        {duration:260, easing:"cubic-bezier(.22,.65,.18,1)"});
    }
  });

  render(false);
})();
