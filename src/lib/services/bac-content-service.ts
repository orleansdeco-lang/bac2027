import { BacMasterItem, MasterInventoryFilterParams, MasterInventoryStats } from "@/lib/content/bac-inventory";

const CACHE_KEY = "shater_bac_inventory_v1";
const STATS_KEY = "shater_bac_inventory_stats_v1";
const SYNC_TIMESTAMP_KEY = "shater_bac_last_sync_v1";

let memoryCache: BacMasterItem[] | null = null;
let memoryStats: MasterInventoryStats | null = null;

export const BacContentService = {
  /**
   * Fetches the complete master inventory from the API with local caching
   */
  async loadAllInventory(forceRefresh = false): Promise<{
    items: BacMasterItem[];
    stats: MasterInventoryStats | null;
    fromCache: boolean;
  }> {
    // 1. Check memory cache first
    if (!forceRefresh && memoryCache && memoryCache.length > 0) {
      return { items: memoryCache, stats: memoryStats, fromCache: true };
    }

    // 2. Check browser localStorage
    if (!forceRefresh && typeof window !== "undefined") {
      try {
        const cachedStr = localStorage.getItem(CACHE_KEY);
        const statsStr = localStorage.getItem(STATS_KEY);
        if (cachedStr) {
          const parsed = JSON.parse(cachedStr);
          if (Array.isArray(parsed) && parsed.length > 0) {
            memoryCache = parsed;
            if (statsStr) memoryStats = JSON.parse(statsStr);
            return { items: memoryCache, stats: memoryStats, fromCache: true };
          }
        }
      } catch (e) {
        console.warn("Could not read inventory from localStorage:", e);
      }
    }

    // 3. Fetch from API
    try {
      const res = await fetch("/api/bac/inventory?limit=2000", {
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();

      if (data.success && Array.isArray(data.data)) {
        memoryCache = data.data;
        memoryStats = data.stats;

        if (typeof window !== "undefined") {
          try {
            localStorage.setItem(CACHE_KEY, JSON.stringify(data.data));
            if (data.stats) localStorage.setItem(STATS_KEY, JSON.stringify(data.stats));
            localStorage.setItem(SYNC_TIMESTAMP_KEY, new Date().toISOString());
          } catch (e) {
            console.warn("Storage quota exceeded or error writing cache:", e);
          }
        }

        return { items: memoryCache || [], stats: memoryStats, fromCache: false };
      }
    } catch (err) {
      console.error("Failed to load inventory from API:", err);
    }

    return { items: memoryCache || [], stats: memoryStats, fromCache: false };
  },

  /**
   * Triggers an online sync against the server and remote repositories
   */
  async triggerOnlineSync(): Promise<{
    success: boolean;
    message: string;
    syncedAt: string;
    stats?: MasterInventoryStats;
  }> {
    try {
      const res = await fetch("/api/bac/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error(`Sync HTTP error! status: ${res.status}`);
      const data = await res.json();

      if (data.success) {
        // Re-load inventory to update caches
        await this.loadAllInventory(true);
      }

      return {
        success: data.success,
        message: data.message || "تمت المزامنة أونلاين بنجاح",
        syncedAt: data.syncedAt || new Date().toISOString(),
        stats: data.stats,
      };
    } catch (err: any) {
      console.error("Online sync failed:", err);
      return {
        success: false,
        message: err.message || "فشلت عملية المزامنة أونلاين، تحقق من الاتصال بالإنترنت",
        syncedAt: new Date().toISOString(),
      };
    }
  },

  /**
   * Fast client-side filtering and search across the in-memory dataset
   */
  filterItems(
    allItems: BacMasterItem[],
    filters: MasterInventoryFilterParams
  ): BacMasterItem[] {
    let result = allItems;

    // 1. Stream
    if (filters.stream && filters.stream !== "all") {
      result = result.filter((i) => i.streamId === filters.stream);
    }

    // 2. Subject
    if (filters.subject && filters.subject !== "all") {
      result = result.filter((i) => {
        const sub = i.subjectId as string;
        if (sub === filters.subject) return true;
        if (filters.subject === "third_language") {
          return (
            sub.startsWith("third_language") ||
            sub === "german" ||
            sub === "spanish" ||
            sub === "italian"
          );
        }
        if (filters.subject === "german" && sub === "third_language_de") return true;
        if (filters.subject === "spanish" && sub === "third_language_es") return true;
        if (filters.subject === "italian" && sub === "third_language_it") return true;
        return false;
      });
    }

    // 3. Year
    if (filters.year && filters.year !== "all" && Number(filters.year) > 0) {
      const y = Number(filters.year);
      result = result.filter((i) => i.year === y);
    }

    // 4. Decade
    if (filters.decade && filters.decade !== "all") {
      if (filters.decade === "2020s") result = result.filter((i) => i.year >= 2020);
      else if (filters.decade === "2010s") result = result.filter((i) => i.year >= 2010 && i.year <= 2019);
      else if (filters.decade === "2000s") result = result.filter((i) => i.year >= 2000 && i.year <= 2009);
      else if (filters.decade === "1990s") result = result.filter((i) => i.year >= 1990 && i.year <= 1999);
    }

    // 5. Content Type
    if (filters.contentType && filters.contentType !== "all") {
      result = result.filter((i) => i.content_type === filters.contentType);
    }

    // 6. Session
    if (filters.session && filters.session !== "all") {
      result = result.filter((i) => i.session === filters.session);
    }

    // 7. Term
    if (filters.term && filters.term !== "all") {
      const t = Number(filters.term);
      result = result.filter((i) => i.term === t);
    }

    // 8. Has Solution
    if (filters.hasSolution && filters.hasSolution !== "all") {
      const req = filters.hasSolution === "yes";
      result = result.filter((i) => i.has_solution === req);
    }

    // 9. Search Query
    if (filters.searchQuery && filters.searchQuery.trim().length > 0) {
      const q = filters.searchQuery.trim().toLowerCase();
      result = result.filter((i) => {
        return (
          i.title_ar.toLowerCase().includes(q) ||
          i.subject_name.toLowerCase().includes(q) ||
          i.subjectId.toLowerCase().includes(q) ||
          i.stream_name.toLowerCase().includes(q) ||
          i.streamId.toLowerCase().includes(q) ||
          String(i.year).includes(q) ||
          (i.topic && i.topic.toLowerCase().includes(q)) ||
          (i.notes && i.notes.toLowerCase().includes(q)) ||
          (i.source_name && i.source_name.toLowerCase().includes(q)) ||
          (i.keywords && i.keywords.some((k) => k.toLowerCase().includes(q)))
        );
      });
    }

    // 10. Sorting
    const sortBy = filters.sortBy || "newest";
    result = [...result];
    if (sortBy === "newest") {
      result.sort((a, b) => b.year - a.year || b.id.localeCompare(a.id));
    } else if (sortBy === "oldest") {
      result.sort((a, b) => a.year - b.year || a.id.localeCompare(b.id));
    } else if (sortBy === "most_detailed") {
      result.sort((a, b) => (b.has_solution ? 1 : 0) - (a.has_solution ? 1 : 0) || b.year - a.year);
    } else if (sortBy === "coefficient") {
      result.sort((a, b) => (b.coefficient || 0) - (a.coefficient || 0) || b.year - a.year);
    }

    return result;
  },
};
