/**
 * BAC Mastery V2 — Content Diagnostics & Duplicate Detection (Task 1.5)
 * 
 * INVARIANT:
 * Pure, deterministic diagnostic engine for auditing content collections.
 * 
 * CRITICAL ARCHITECTURAL LAW:
 * Duplicates and conflicts are detected and explicitly reported.
 * They are NEVER silently resolved, merged, or deleted based on heuristics.
 */

export type DuplicateDiagnosticKind =
  | "exact_id_collision"
  | "semantic_title_overlap"
  | "superseded_catalog_overlap";

export interface ContentDuplicateRecord {
  entityType: "skill" | "question" | "topic" | "subject" | "resource";
  id: string;
  sources: string[];
  kind: DuplicateDiagnosticKind;
  details: string;
}

export interface DuplicateDiagnosticReport {
  hasDuplicates: boolean;
  duplicateCount: number;
  duplicates: ContentDuplicateRecord[];
  auditTimestamp: string;
}

export interface CatalogAuditInput {
  catalogName: string;
  entityType: ContentDuplicateRecord["entityType"];
  items: Array<{ id: string; title_ar?: string; title_fr?: string }>;
}

/**
 * Pure diagnostic auditor across multiple content catalogs.
 * Detects exact ID collisions and catalog overlaps without mutating any item.
 */
export function auditContentDuplicates(
  catalogs: CatalogAuditInput[],
  options?: { auditTimestamp?: string }
): DuplicateDiagnosticReport {
  const duplicates: ContentDuplicateRecord[] = [];
  const idMap = new Map<string, { catalogNames: string[]; entityType: ContentDuplicateRecord["entityType"]; titles: string[] }>();

  for (const catalog of catalogs) {
    for (const item of catalog.items) {
      const key = `${catalog.entityType}:${item.id}`;
      const existing = idMap.get(key);
      const title = item.title_ar || item.title_fr || item.id;

      if (!existing) {
        idMap.set(key, {
          catalogNames: [catalog.catalogName],
          entityType: catalog.entityType,
          titles: [title],
        });
      } else {
        if (!existing.catalogNames.includes(catalog.catalogName)) {
          existing.catalogNames.push(catalog.catalogName);
        }
        existing.titles.push(title);
      }
    }
  }

  Array.from(idMap.entries()).forEach(([key, record]) => {
    if (record.catalogNames.length > 1) {
      const id = key.split(":")[1];
      const isLegacyOverlap =
        record.catalogNames.some((c: string) => c.toLowerCase().includes("legacy")) &&
        record.catalogNames.some((c: string) => c.toLowerCase().includes("canonical"));

      duplicates.push({
        entityType: record.entityType,
        id,
        sources: [...record.catalogNames],
        kind: isLegacyOverlap ? "superseded_catalog_overlap" : "exact_id_collision",
        details: isLegacyOverlap
          ? `ID "${id}" exists in both canonical authoring and legacy catalog. Legacy catalog is superseded; duplicates must not be silently auto-merged.`
          : `Exact ID collision detected across catalogs: ${record.catalogNames.join(", ")}.`,
      });
    }
  });

  return {
    hasDuplicates: duplicates.length > 0,
    duplicateCount: duplicates.length,
    duplicates,
    auditTimestamp: options?.auditTimestamp || "2026-09-17T00:00:00.000Z",
  };
}
