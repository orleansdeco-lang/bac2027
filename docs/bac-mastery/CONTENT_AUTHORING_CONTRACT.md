# BAC Mastery — Content Authoring Contract & Validator
**Pedagogical Specification & Authoring Rules**
*Version: 1.0.0 — Reusable Package Contract*
*Status: Verified & Implemented*

---

## 1. The Content Package Invariant

A skill in BAC Mastery is authored as an **atomic, self-contained pedagogical package** (`ContentPackage`). Publishing isolated lessons without exercises, or questions without repair guides, is strictly prohibited by the authoring contract.

---

## 2. Package Schema & Minimum Mandatory Elements

Every authored skill package must satisfy:

```typescript
export interface ContentPackage {
  packageId: string;
  streamId: StreamId;
  subjectId: SubjectId;
  specialtyId?: TechniqueMathSpecialty;
  topicId: string;
  skillId: string;
  objective_ar: string;
  objective_fr?: string;
  prerequisites: string[];
  lesson: {
    title_ar: string;
    contentMarkdown_ar: string;
    keyTakeaway_ar: string;
  };
  workedExample: {
    problem_ar: string;
    stepByStepSolution_ar: string[]; // Minimum 2 sequential steps
    pedagogicalComment_ar: string;
  };
  activeRecall: {
    prompt_ar: string;
    expectedAnswer_ar: string;
    concealedInitially: boolean;     // Concealed to force retrieval
  };
  practice: ContentPackagePracticeItem[]; // Minimum 2 original items
  retest: ContentPackageRetestItem;       // Independent isomorphic twin
  repairGuide: ContentPackageRepairGuide; // Mental model dismantling
  visualNecessity: VisualNecessityLevel;  // REQUIRED / USEFUL / OPTIONAL / NOT_NEEDED
  visualAssetIds: string[];
  externalResourceIds: string[];
  examTransfer: ContentPackageExamTransfer;
  motivationSupport?: {
    status: "NORMALIZED" | "NOT_NEEDED";
    microNormalizeText_ar?: string;
  };
  provenance: {
    sourceId: string;
    sourceTitle: string;
    classification: SourceClassification;
    rightsStatus: string;
    lastAuditedAt: string;
  };
  lifecycleState: ContentLifecycleStage;
}
```

---

## 3. Retest Transfer Quality Invariant

The retest question is the **mastery verification gate** of the learning operating system. The authoring contract enforces:

1. **`isIsomorphicTwin === true`**: The retest evaluates the identical theoretical and procedural concept.
2. **`altersSurfaceContext === true`**: The retest alters numerical coefficients, geometrical orientations, or physical variable symbols.
3. **No Worked Example Duplication**: Re-using the prompt or values of the worked example in the retest is rejected as a critical validation blocker.
4. **Independent Solution Path**: The student must construct the answer from a blank state without relying on visual pattern recognition.

---

## 4. Visual Necessity & Explicit `NOT_NEEDED` Policy

Optional pedagogical components must declare an explicit status rather than being omitted:

- **Visual Assets**:
  - `VISUAL_REQUIRED`: Spatial, geometric, anatomical, or schematic skills (e.g. RC circuits, asymptotes). Must link valid assets.
  - `VISUAL_USEFUL`: Abstract concepts that benefit from diagrams (e.g. function sign tables).
  - `VISUAL_OPTIONAL`: Supplemental illustrations.
  - `VISUAL_NOT_NEEDED`: Purely symbolic or grammatical operations (e.g. algebraic factorization rules).
- **Exam Transfer**:
  - Must state `AVAILABLE` with BAC typology notes or `NOT_NEEDED` if purely preliminary.

---

## 5. Lightweight Mind & Motivation Support

To support student resilience without becoming a clinical therapy app:
- **Difficulty Normalization**: *"هذه المهارة تُمثل نقطة تعثر لدى 65% من التلاميذ في البداية؛ التكرار والنمذجة كفيلان بإتقانها."*
- **Micro Task Reset**: *"إذا تعثرت مرتين، توقف لدقيقتين، راجع خطوة النشر فقط، ثم أعد المحاولة."*
- **Strict Rule**: Zero psychiatric jargon, zero clinical counseling.
