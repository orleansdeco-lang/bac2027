# BAC Mastery V1 — Curriculum Verification & Provenance Policy
**Institutional Standards for Pedagogical Truth, Statutory Grounding & Honest Claims**
**Document Version**: 1.0.0 (V1 Completion Baseline)  
**Academic Year**: 2026–2027  

---

## 1. Ethical Stance & Truth in EdTech

A fundamental defect in digital education platforms is the casual, misleading claim that digital content is "100% officially accredited" or "officially recognized by the Ministry."

**BAC Mastery V1 takes an uncompromising stance on educational integrity**:
> We strictly differentiate between statutory legal baselines enacted by executive decree, pedagogical syllabus guidelines issued by inspectorates, and proprietary educational adaptations engineered by our pedagogical team.

Under no circumstances will BAC Mastery falsely label provisional benchmarks or historical baselines as `OFFICIAL_CURRENT` without citing a verifiable, public ministerial circular (*circulaire ministérielle*) signed for the active 2026–2027 academic session.

---

## 2. Statutory Hierarchy of Curriculum Verification

Every curriculum item, stream definition, subject, and coefficient in the platform carries an explicit `verificationStatus` drawn from a 6-tier hierarchy:

```
┌────────────────────────┐
│    OFFICIAL_CURRENT    │  Level 1: Signed 2026-2027 ministerial circular with direct reference.
└───────────┬────────────┘
            │
┌───────────▼────────────┐
│   OFFICIAL_HISTORICAL  │  Level 2: Executive Decree 07-142 (19 May 2007) - Authoritative Baseline.
└───────────┬────────────┘
            │
┌───────────▼────────────┐
│   RESEARCH_SUPPORTED   │  Level 3: Peer-reviewed learning science & cognitive psychology literature.
└───────────┬────────────┘
            │
┌───────────▼────────────┐
│   BAC_MASTERY_DERIVED  │  Level 4: Proprietary pedagogical engineering (twins, repair guides, drills).
└───────────┬────────────┘
            │
┌───────────▼────────────┐
│       PROVISIONAL      │  Level 5: Explicitly declared working benchmark pending official circular.
└───────────┬────────────┘
            │
┌───────────▼────────────┐
│       UNVERIFIED       │  Level 6: STRICTLY PROHIBITED in student-facing production builds.
└────────────────────────┘
```

### Detailed Criteria per Tier:

1. **`OFFICIAL_CURRENT`**:
   - **Requirement**: Must cite an active, publicly promulgated ministerial circular or decree issued by the Algerian Ministry of National Education for the current academic session (2026–2027).
   - **Current Status**: Reserved strictly for validated 2026–2027 publications.
2. **`OFFICIAL_HISTORICAL`**:
   - **Requirement**: Codified in official government publications (e.g., *Décret Exécutif n° 07-142 du 19 mai 2007* published in the *Journal Officiel* n° 33).
   - **Application**: Applied to all 6 stream definitions, 4 Technique Math branches, core subject structures, and baseline coefficient scales.
3. **`RESEARCH_SUPPORTED`**:
   - **Requirement**: Grounded in empirical educational psychology, cognitive science, or psychometric research (e.g., Ebbinghaus forgetting curve, Roediger & Karpicke retrieval practice, Sweller cognitive load theory).
   - **Application**: Spaced repetition algorithms, interleaving schedules, and confidence self-assessment scoring.
4. **`BAC_MASTERY_DERIVED`**:
   - **Requirement**: Created by BAC Mastery's educational engineers to serve student remediation.
   - **Application**: Isomorphic twin exercises, distractor error categorization, Error Lab repair guides, and micro-drills.
5. **`PROVISIONAL`**:
   - **Requirement**: Used when minor subject coefficient weightings or syllabus orderings await formal circular confirmation.
   - **Application**: Clear user-facing disclaimer that the metric is a standard benchmark.
6. **`UNVERIFIED`**:
   - **Requirement**: Any content lacking provenance metadata or failing quality audits.
   - **Enforcement**: Blocked at build time. Zero items in production.

---

## 3. Provenance & Citation Protocol

Every subject and skill record must contain an explicit `provenance` metadata object:

```typescript
interface ProvenanceRecord {
  source: string;              // Official title of syllabus, decree, or research work
  sourceType: 
    | "ministry_curriculum"    // Official ministerial syllabus document
    | "official_decree"        // Statutory executive decree (JORA)
    | "bac_mastery_pedagogy";  // Original pedagogical engineering
  rightsStatus: 
    | "official_public_curriculum" // Public regulatory reference
    | "proprietary_adaptation";    // Original authoring
  citationNotes?: string;      // Legal or curricular context notes
}
```

---

## 4. Zero Tolerance Quality Audit Invariants

Any content update must pass 5 absolute invariants before moving to `PUBLISHED`:

1. **Zero Hallucinations**: Every mathematical formula, chemical reaction, and biological diagram is independently verified against authoritative scientific textbooks.
2. **Step-by-Step Scoring Transparency**: Solutions follow the exact point allocation methodology used in official Baccalauréat marking centers (*barème officiel*).
3. **Isomorphic Twin Integrity**: A retest question must test the exact same cognitive demand, mathematical operation, and method as the practice item, varying only the surface constants or narrative context.
4. **Actionable Error Remediation**: An error card cannot merely say "Wrong, review your lesson." It must identify the root misconception and provide a step-by-step cognitive correction.
5. **Continuous Regression Testing**: Automated CI scripts (`scripts/test-bac-v1-architecture.mjs` and related suites) must pass 100% with zero defects.
