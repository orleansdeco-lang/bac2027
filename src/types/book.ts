export type BookCategory =
  | 'official'
  | 'professor_series'
  | 'summary'
  | 'exam_solutions';

export type BookSubject =
  // العلوم الدقيقة
  | 'math'
  | 'physics'
  | 'science'
  // هندسات تقني رياضي
  | 'civil_engineering'
  | 'mechanical_engineering'
  | 'electrical_engineering'
  | 'process_engineering'
  // مواد تسيير واقتصاد
  | 'accounting'
  | 'economics'
  | 'law'
  // المواد الأدبية والإنسانية
  | 'arabic'
  | 'philosophy'
  | 'islamic'
  | 'history_geo'
  // اللغات الأجنبية
  | 'french'
  | 'english'
  | 'spanish'
  | 'german'
  | 'italian';

export type BookStream =
  | 'scientific'
  | 'math_tech'
  | 'math'
  | 'management'
  | 'literature'
  | 'languages';

export interface Book {
  id: string;
  title: string;
  author: string | null;
  category: BookCategory;
  subject: BookSubject | string;
  streams: string[];
  cover_url: string | null;
  file_url: string;
  file_size: string | null;
  pages_count?: number | null;
  year_edition?: string | null;
  downloads_count: number;
  is_featured: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface BookFilters {
  search?: string;
  stream?: string;
  subject?: string;
  category?: string;
  sortBy?: 'latest' | 'popular' | 'oldest';
  featuredOnly?: boolean;
}

export interface BookInput {
  title: string;
  author?: string;
  category: BookCategory;
  subject: string;
  streams: string[];
  cover_url?: string;
  file_url: string;
  file_size?: string;
  pages_count?: number;
  year_edition?: string;
  is_featured?: boolean;
}

export interface LibraryStats {
  totalBooks: number;
  totalDownloads: number;
  featuredCount: number;
  byCategory: Record<BookCategory, number>;
}
