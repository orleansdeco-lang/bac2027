import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { Book, BookFilters, BookInput, LibraryStats } from "@/types/book";
import { INITIAL_BOOKS_SEED } from "@/data/books-seed";

const LOCAL_STORAGE_KEY = "shater_books_library_cache";
const LOCAL_DOWNLOADS_MAP = "shater_books_downloads_tracker";

export const BooksService = {
  /**
   * Fetch all books matching the specified filters.
   * Gracefully merges with verified Algerian seed references when Supabase is initializing or offline.
   */
  async getBooks(filters?: BookFilters): Promise<Book[]> {
    let books: Book[] = [];

    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase
          .from("books")
          .select("*");

        if (filters?.search && filters.search.trim() !== "") {
          const s = filters.search.trim();
          query = query.or(`title.ilike.%${s}%,author.ilike.%${s}%`);
        }

        if (filters?.category && filters.category !== "all") {
          query = query.eq("category", filters.category);
        }

        if (filters?.subject && filters.subject !== "all") {
          query = query.eq("subject", filters.subject);
        }

        if (filters?.stream && filters.stream !== "all") {
          query = query.contains("streams", [filters.stream]);
        }

        if (filters?.featuredOnly) {
          query = query.eq("is_featured", true);
        }

        if (filters?.sortBy === "popular") {
          query = query.order("downloads_count", { ascending: false });
        } else if (filters?.sortBy === "oldest") {
          query = query.order("created_at", { ascending: true });
        } else {
          query = query.order("created_at", { ascending: false });
        }

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          books = data as Book[];
        }
      } catch (err) {
        console.warn("Could not query books from Supabase, falling back to seed items:", err);
      }
    }

    // If database returned no books, use high-fidelity seed dataset with client-side filtering
    if (books.length === 0) {
      books = BooksService.filterInMemory(INITIAL_BOOKS_SEED, filters);
    }

    // Apply any local download count augmentations from current session
    books = BooksService.applyLocalDownloadCounts(books);

    return books;
  },

  /**
   * In-memory filtering helper for fallback mode
   */
  filterInMemory(pool: Book[], filters?: BookFilters): Book[] {
    let result = [...pool];

    if (filters?.search && filters.search.trim() !== "") {
      const q = filters.search.toLowerCase().trim();
      result = result.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          (b.author && b.author.toLowerCase().includes(q))
      );
    }

    if (filters?.stream && filters.stream !== "all") {
      result = result.filter((b) => b.streams.includes(filters.stream!));
    }

    if (filters?.subject && filters.subject !== "all") {
      result = result.filter((b) => b.subject === filters.subject);
    }

    if (filters?.category && filters.category !== "all") {
      result = result.filter((b) => b.category === filters.category);
    }

    if (filters?.featuredOnly) {
      result = result.filter((b) => b.is_featured);
    }

    if (filters?.sortBy === "popular") {
      result.sort((a, b) => b.downloads_count - a.downloads_count);
    } else if (filters?.sortBy === "oldest") {
      result.sort(
        (a, b) =>
          new Date(a.created_at || 0).getTime() -
          new Date(b.created_at || 0).getTime()
      );
    } else {
      result.sort(
        (a, b) =>
          new Date(b.created_at || 0).getTime() -
          new Date(a.created_at || 0).getTime()
      );
    }

    return result;
  },

  /**
   * Retrieve a single book by ID
   */
  async getBookById(id: string): Promise<Book | null> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from("books")
          .select("*")
          .eq("id", id)
          .single();

        if (!error && data) {
          return data as Book;
        }
      } catch {}
    }

    const found = INITIAL_BOOKS_SEED.find((b) => b.id === id);
    return found || null;
  },

  /**
   * Atomically increment downloads count for a book
   */
  async incrementDownload(bookId: string): Promise<number> {
    let newCount: number | null = null;

    // 1. Try Supabase RPC
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.rpc("increment_book_downloads", {
          target_book_id: bookId,
        });
        if (!error && typeof data === "number") {
          newCount = data;
        } else {
          // Fallback direct update
          const { data: directData } = await supabase
            .from("books")
            .select("downloads_count")
            .eq("id", bookId)
            .single();

          if (directData) {
            const nextVal = (directData.downloads_count || 0) + 1;
            await supabase
              .from("books")
              .update({ downloads_count: nextVal })
              .eq("id", bookId);
            newCount = nextVal;
          }
        }
      } catch (e) {
        console.warn("Could not increment download in Supabase:", e);
      }
    }

    // 2. Track locally in browser storage for instant visual feedback
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(LOCAL_DOWNLOADS_MAP);
        const map = stored ? JSON.parse(stored) : {};
        map[bookId] = (map[bookId] || 0) + 1;
        localStorage.setItem(LOCAL_DOWNLOADS_MAP, JSON.stringify(map));
      } catch {}
    }

    return newCount || 1;
  },

  /**
   * Apply client-side local download offsets
   */
  applyLocalDownloadCounts(books: Book[]): Book[] {
    if (typeof window === "undefined") return books;
    try {
      const stored = localStorage.getItem(LOCAL_DOWNLOADS_MAP);
      if (!stored) return books;
      const map: Record<string, number> = JSON.parse(stored);
      return books.map((b) => {
        if (map[b.id]) {
          return { ...b, downloads_count: b.downloads_count + map[b.id] };
        }
        return b;
      });
    } catch {
      return books;
    }
  },

  /**
   * Create a new reference book (Admin / Operator only)
   */
  async createBook(input: BookInput): Promise<{ success: boolean; data?: Book; error?: string }> {
    if (!isSupabaseConfigured || !supabase) {
      return { success: false, error: "قاعدة بيانات Supabase غير متصلة" };
    }

    try {
      const { data, error } = await supabase
        .from("books")
        .insert([
          {
            title: input.title,
            author: input.author || null,
            category: input.category,
            subject: input.subject,
            streams: input.streams || [],
            cover_url: input.cover_url || null,
            file_url: input.file_url,
            file_size: input.file_size || null,
            pages_count: input.pages_count || null,
            year_edition: input.year_edition || null,
            is_featured: Boolean(input.is_featured),
            downloads_count: 0,
          },
        ])
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: data as Book };
    } catch (err: any) {
      return { success: false, error: err?.message || "فشلت عملية إضافة المرجع" };
    }
  },

  /**
   * Update an existing book (Admin / Operator only)
   */
  async updateBook(id: string, updates: Partial<BookInput>): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured || !supabase) {
      return { success: false, error: "قاعدة بيانات Supabase غير متصلة" };
    }

    try {
      const { error } = await supabase
        .from("books")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || "فشلت عملية تعديل المرجع" };
    }
  },

  /**
   * Delete a book (Admin / Operator only)
   */
  async deleteBook(id: string): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured || !supabase) {
      return { success: false, error: "قاعدة بيانات Supabase غير متصلة" };
    }

    try {
      const { error } = await supabase.from("books").delete().eq("id", id);
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || "فشلت عملية حذف المرجع" };
    }
  },

  /**
   * Retrieve aggregate statistics for the Library
   */
  async getLibraryStats(booksList?: Book[]): Promise<LibraryStats> {
    const list = booksList || (await BooksService.getBooks());
    const byCategory: Record<any, number> = {
      official: 0,
      professor_series: 0,
      summary: 0,
      exam_solutions: 0,
    };

    let totalDownloads = 0;
    let featuredCount = 0;

    for (const b of list) {
      totalDownloads += b.downloads_count || 0;
      if (b.is_featured) featuredCount++;
      if (byCategory[b.category] !== undefined) {
        byCategory[b.category]++;
      }
    }

    return {
      totalBooks: list.length,
      totalDownloads,
      featuredCount,
      byCategory,
    };
  },
};
