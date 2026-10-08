# Marginline product validation

**Assessment, 8 October 2026:** A standalone margin check is not novel enough to distinguish the concept. Shopify Flow provides conditions and external HTTP calls; Shopify offers margin guardrails; Matrixify dry runs mainly validate import structure.

**Stronger wedge:** a shared pre-action check that evaluates changes from AI campaign planning, n8n, Make and Matrixify-style catalog synchronization *together*. Independently safe actions can jointly oversubscribe inventory, conflict with negotiated B2B prices or exceed approvals.

### Tested fictional batch
- 2 overlapping glove promotions each pass alone, but their combined 40-unit demand exceeds 36 units available to promise
- One negotiated clinic price is overwritten from £22 to £26
- One campaign exceeds a £500/day approval threshold
- One input is stale
- One other action is compliant

Default original verdict: 3 blocked, 2 review, 1 allow. After remediations: all 6 allow. Proposed changes are never executed.

### Limits
This concept does not demonstrate that MyDigital-Metrics lacks these controls. The prototype is not integrated with live Shopify/Matrixify/ad-platform systems. A production service needs authenticated clients, authoritative and fresh merchant data, time-bound inventory reservations, complete cost accounting, durable audit logs and idempotent action gates.

### References
- MyDigital-Metrics' Matrixify operations: https://www.linkedin.com/posts/mydigitalmetrics_matrixify-shopifyops-dentalsupply-activity-7507828631801393152-JgQi
- Shopify Flow: https://help.shopify.com/en/manual/shopify-flow
- Shopify Smart Pricing: https://help.shopify.com/en/manual/products/details/product-pricing/smart-pricing/overview
- Matrixify dry run: https://matrixify.app/documentation/matrixify-import-export-job-options/

Position it as *how I would extend the systems you already build*, never as *something you must have overlooked*.
