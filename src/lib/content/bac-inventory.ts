import fs from "fs";
import path from "path";
import { StreamId, SubjectId } from "@/types/education";
import { ExamKind, BacExamItem } from "@/data/exams";

export interface AlternateSource {
  source_name: string;
  source_url: string;
  file_url: string;
}

export interface BacMasterItem extends BacExamItem {
  country: string;
  education_level: string;
  grade: string;
  stream_name: string;
  subject_name: string;
  content_type: "bac_official" | "bac_blanc" | "term_exam" | "term_quiz";
  source_name: string;
  source_url: string;
  file_url: string;
  file_type: string;
  language: string;
  has_solution: boolean;
  solution_url: string;
  estimated_pages: number;
  estimated_questions: number;
  topic: string;
  topics: string[];
  skills: string[];
  difficulty: string;
  source_type: string;
  rights_status: string;
  quality_status: string;
  alternate_sources: AlternateSource[];
  notes?: string;
  discovered_at: string;
}

export interface MasterInventoryFilterParams {
  stream?: string;
  subject?: string;
  year?: number | string;
  decade?: "all" | "2020s" | "2010s" | "2000s" | "1990s";
  contentType?: "all" | "bac_official" | "bac_blanc" | "term_exam" | "term_quiz";
  session?: "all" | "regular" | "exceptional";
  term?: "all" | "1" | "2" | "3";
  hasSolution?: "all" | "yes" | "no";
  searchQuery?: string;
  sortBy?: "newest" | "oldest" | "most_detailed" | "coefficient";
  page?: number;
  limit?: number;
}

export interface MasterInventoryStats {
  totalItems: number;
  bacOfficial: number;
  bacBlanc: number;
  termExams: number;
  termQuizzes: number;
  withSolutions: number;
  withoutSolutions: number;
  yearsCount: number;
  streamsCount: number;
  subjectsCount: number;
  lastSyncedAt: string;
}

// In-memory cache for fast SSR and API responses
let cachedItems: BacMasterItem[] | null = null;
let lastSyncedAt: string = new Date().toISOString();

/**
 * Normalizes raw JSON items from SHATER_BAC_CONTENT_INVENTORY into typed BacMasterItem
 */
function normalizeRawItem(raw: any): BacMasterItem {
  let mappedKind: ExamKind = "official_bac";
  if (raw.content_type === "bac_blanc") mappedKind = "bac_blanc";
  else if (raw.content_type === "term_exam") mappedKind = "term_exam";
  else if (raw.content_type === "term_quiz") mappedKind = "term_quiz";

  const streamId = (raw.stream || "sciences_exp") as StreamId;
  const subjectId = (raw.subject || "math") as SubjectId;

  return {
    id: raw.id,
    year: Number(raw.year) || 2024,
    session: raw.session === "exceptional" ? "exceptional" : "regular",
    kind: mappedKind,
    term: raw.term ? (Number(raw.term) as 1 | 2 | 3) : undefined,
    streamId,
    subjectId,
    title_ar: raw.title_ar || raw.title || "",
    topicsCount: raw.estimated_questions > 4 ? 2 : 1,
    subjectPdfUrl: raw.file_url || raw.source_url || "",
    solutionPdfUrl: raw.solution_url || raw.file_url || "",
    keywords: Array.isArray(raw.topics) ? raw.topics : [raw.topic || ""],
    durationMinutes: raw.content_type === "term_quiz" ? 60 : 210,
    coefficient: 5,
    country: raw.country || "DZ",
    education_level: raw.education_level || "secondary",
    grade: raw.grade || "3AS",
    stream_name: raw.stream_name || "",
    subject_name: raw.subject_name || "",
    content_type: raw.content_type || "bac_official",
    source_name: raw.source_name || "DzExams / ONEC",
    source_url: raw.source_url || "",
    file_url: raw.file_url || "",
    file_type: raw.file_type || "pdf",
    language: raw.language || "ar",
    has_solution: Boolean(raw.has_solution),
    solution_url: raw.solution_url || "",
    estimated_pages: Number(raw.estimated_pages) || 4,
    estimated_questions: Number(raw.estimated_questions) || 8,
    topic: raw.topic || "",
    topics: Array.isArray(raw.topics) ? raw.topics : [],
    skills: Array.isArray(raw.skills) ? raw.skills : ["needs_mapping"],
    difficulty: raw.difficulty || "standard_bac",
    source_type: raw.source_type || "official",
    rights_status: raw.rights_status || "official_public_reference",
    quality_status: raw.quality_status || "verified",
    alternate_sources: Array.isArray(raw.alternate_sources) ? raw.alternate_sources : [],
    notes: raw.notes || "",
    discovered_at: raw.discovered_at || new Date().toISOString(),
  };
}

/**
 * Loads items from disk (src/data/content-bank/inventory.json or content-research)
 */
export function getMasterInventoryItems(): BacMasterItem[] {
  if (cachedItems && cachedItems.length > 0) {
    return cachedItems;
  }

  try {
    const candidates = [
      path.resolve(process.cwd(), "src/data/content-bank/inventory.json"),
      path.resolve(process.cwd(), "content-research/SHATER_BAC_CONTENT_INVENTORY.json"),
    ];

    for (const filePath of candidates) {
      if (fs.existsSync(filePath)) {
        const rawContent = fs.readFileSync(filePath, "utf8");
        const parsed = JSON.parse(rawContent);
        if (Array.isArray(parsed) && parsed.length > 0) {
          cachedItems = parsed.map(normalizeRawItem);
          const stat = fs.statSync(filePath);
          lastSyncedAt = stat.mtime.toISOString();
          return cachedItems;
        }
      }
    }
  } catch (err) {
    console.error("Failed to load master inventory:", err);
  }

  // Fallback if file not yet loaded
  cachedItems = [];
  return cachedItems;
}

/**
 * Re-reads from disk, invalidates in-memory cache, and updates sync timestamp
 */
export function syncMasterInventory(): { success: boolean; count: number; syncedAt: string } {
  try {
    const srcPath = path.resolve(process.cwd(), "content-research/SHATER_BAC_CONTENT_INVENTORY.json");
    const destPath = path.resolve(process.cwd(), "src/data/content-bank/inventory.json");

    if (fs.existsSync(srcPath)) {
      const raw = fs.readFileSync(srcPath, "utf8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Ensure destination dir exists
        const destDir = path.dirname(destPath);
        if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
        fs.writeFileSync(destPath, raw, "utf8");

        cachedItems = parsed.map(normalizeRawItem);
        lastSyncedAt = new Date().toISOString();
        return { success: true, count: cachedItems.length, syncedAt: lastSyncedAt };
      }
    }
  } catch (err) {
    console.error("Sync error:", err);
  }

  return { success: false, count: cachedItems ? cachedItems.length : 0, syncedAt: lastSyncedAt };
}

export function getLastSyncTime(): string {
  return lastSyncedAt;
}

/**
 * Computes fast statistics across the inventory
 */
export function getMasterStats(): MasterInventoryStats {
  const items = getMasterInventoryItems();
  let bacOfficial = 0;
  let bacBlanc = 0;
  let termExams = 0;
  let termQuizzes = 0;
  let withSolutions = 0;

  const yearsSet = new Set<number>();
  const streamsSet = new Set<string>();
  const subjectsSet = new Set<string>();

  for (const item of items) {
    if (item.content_type === "bac_official") bacOfficial++;
    else if (item.content_type === "bac_blanc") bacBlanc++;
    else if (item.content_type === "term_exam") termExams++;
    else if (item.content_type === "term_quiz") termQuizzes++;

    if (item.has_solution) withSolutions++;
    yearsSet.add(item.year);
    streamsSet.add(item.streamId);
    subjectsSet.add(item.subjectId);
  }

  return {
    totalItems: items.length,
    bacOfficial,
    bacBlanc,
    termExams,
    termQuizzes,
    withSolutions,
    withoutSolutions: items.length - withSolutions,
    yearsCount: yearsSet.size,
    streamsCount: streamsSet.size,
    subjectsCount: subjectsSet.size,
    lastSyncedAt,
  };
}

/**
 * Advanced Multi-Faceted Filter and Search Engine
 */
export function filterMasterInventory(params: MasterInventoryFilterParams): {
  items: BacMasterItem[];
  total: number;
  availableYears: number[];
  stats: MasterInventoryStats;
} {
  const allItems = getMasterInventoryItems();
  const stats = getMasterStats();

  // Distinct sorted years for filter dropdown
  const availableYears = Array.from(new Set(allItems.map((i) => i.year))).sort((a, b) => b - a);

  let filtered = allItems;

  // 1. Stream filter
  if (params.stream && params.stream !== "all") {
    filtered = filtered.filter((i) => i.streamId === params.stream);
  }

  // 2. Subject filter
  if (params.subject && params.subject !== "all") {
    filtered = filtered.filter((i) => {
      const sub = i.subjectId as string;
      if (sub === params.subject) return true;
      if (params.subject === "third_language") {
        return (
          sub.startsWith("third_language") ||
          sub === "german" ||
          sub === "spanish" ||
          sub === "italian"
        );
      }
      if (params.subject === "german" && sub === "third_language_de") return true;
      if (params.subject === "spanish" && sub === "third_language_es") return true;
      if (params.subject === "italian" && sub === "third_language_it") return true;
      return false;
    });
  }

  // 3. Year filter (single year)
  if (params.year && params.year !== "all" && Number(params.year) > 0) {
    const targetYear = Number(params.year);
    filtered = filtered.filter((i) => i.year === targetYear);
  }

  // 4. Decade / Era quick filter
  if (params.decade && params.decade !== "all") {
    if (params.decade === "2020s") filtered = filtered.filter((i) => i.year >= 2020);
    else if (params.decade === "2010s") filtered = filtered.filter((i) => i.year >= 2010 && i.year <= 2019);
    else if (params.decade === "2000s") filtered = filtered.filter((i) => i.year >= 2000 && i.year <= 2009);
    else if (params.decade === "1990s") filtered = filtered.filter((i) => i.year >= 1990 && i.year <= 1999);
  }

  // 5. Content type filter
  if (params.contentType && params.contentType !== "all") {
    filtered = filtered.filter((i) => i.content_type === params.contentType);
  }

  // 6. Session filter
  if (params.session && params.session !== "all") {
    filtered = filtered.filter((i) => i.session === params.session);
  }

  // 7. Academic Term filter
  if (params.term && params.term !== "all") {
    const termNum = Number(params.term);
    filtered = filtered.filter((i) => i.term === termNum);
  }

  // 8. Has Solution filter
  if (params.hasSolution && params.hasSolution !== "all") {
    const requiresSolution = params.hasSolution === "yes";
    filtered = filtered.filter((i) => i.has_solution === requiresSolution);
  }

  // 9. Instant Full-text Search
  if (params.searchQuery && params.searchQuery.trim().length > 0) {
    const q = params.searchQuery.trim().toLowerCase();
    filtered = filtered.filter((i) => {
      const matchTitle = i.title_ar.toLowerCase().includes(q);
      const matchSubject = i.subject_name.toLowerCase().includes(q) || i.subjectId.toLowerCase().includes(q);
      const matchStream = i.stream_name.toLowerCase().includes(q) || i.streamId.toLowerCase().includes(q);
      const matchYear = String(i.year).includes(q);
      const matchTopic = i.topic.toLowerCase().includes(q);
      const matchKeywords = i.keywords?.some((k) => k.toLowerCase().includes(q));
      const matchSource = i.source_name.toLowerCase().includes(q);

      return matchTitle || matchSubject || matchStream || matchYear || matchTopic || matchKeywords || matchSource;
    });
  }

  // 10. Sorting
  const sortBy = params.sortBy || "newest";
  if (sortBy === "newest") {
    filtered.sort((a, b) => b.year - a.year || b.id.localeCompare(a.id));
  } else if (sortBy === "oldest") {
    filtered.sort((a, b) => a.year - b.year || a.id.localeCompare(b.id));
  } else if (sortBy === "most_detailed") {
    filtered.sort((a, b) => (b.has_solution ? 1 : 0) - (a.has_solution ? 1 : 0) || b.year - a.year);
  } else if (sortBy === "coefficient") {
    filtered.sort((a, b) => (b.coefficient || 0) - (a.coefficient || 0) || b.year - a.year);
  }

  const total = filtered.length;

  // Pagination (if specified)
  if (params.page && params.limit && params.limit > 0) {
    const start = (params.page - 1) * params.limit;
    filtered = filtered.slice(start, start + params.limit);
  }

  return {
    items: filtered,
    total,
    availableYears,
    stats,
  };
}
