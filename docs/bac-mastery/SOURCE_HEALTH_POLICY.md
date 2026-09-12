# BAC Mastery — Source Health & Staleness Policy
**Governance Document: External Reference & Citation Integrity**
*Version: 1.0.0 — Source Freshness Standards*
*Status: Verified & Active*

---

## 1. The Principle of Source Freshness

Outbound URLs, ministerial circular links, and textbook citations degrade over time due to link rot, ministerial site reorganizations, and curriculum revisions.

BAC Mastery maintains source health through continuous automated freshness tracking (`evaluateSourceHealth`) without destructive side effects:

$$\mathbf{Stale\ Source} \implies \mathbf{Flagged\ for\ Review}\ (\text{Never Silently Deleted})$$

---

## 2. Source Health Classification Tiers

| Status | Age Window (Days) | Operational Meaning | Action Required |
| :--- | :--- | :--- | :--- |
| **`FRESH`** | $\le 30$ days | Recently verified active, functional, and syllabus-aligned. | None. Fully trusted for automated recommendations. |
| **`VALID`** | $31 - 120$ days | Confirmed within standard operating cycle. | Scheduled for routine quarterly audit. |
| **`STALE_WARNING`** | $121 - 180$ days | Approaching validity expiration. | Flagged in inspector backlog for verification check. |
| **`SOURCE_STALE`** | $> 180$ days | Expired validity window; link or circular may have changed. | High-priority inspection required; recommendation priority lowered. |

---

## 3. Audited Source Typologies

1. **Ministerial Portals & Circulars (`education.gov.dz`)**:
   - Monitored for annual circular updates and schedule directives.
2. **National Examination Archives (`onec.dz`)**:
   - Verified for past BAC exam session papers and official correction grids.
3. **Public Pedagogical Broadcasters (`crdp.education.dz`)**:
   - Checked for video lecture stream availability and syllabus conformity.
4. **Interactive Simulation Applets**:
   - Monitored for browser compatibility (HTML5 / WebGL) and responsive rendering.

---

## 4. Remediation Workflow for Stale Sources

When `evaluateSourceHealth` emits `needsAudit === true`:
1. **Verification**: A content reviewer navigates to the external URL to ensure:
   - The link returns HTTP 200 without SSL/TLS warnings.
   - The referenced content remains unchanged and pedagogy is sound.
2. **Timestamp Update**: If verified intact, `lastCheckedAt` is updated to the current ISO date, restoring status to `FRESH`.
3. **Replacement / Archive**: If the link is broken or superseded, a replacement reference is cited. The old reference is archived with an explanatory note.
