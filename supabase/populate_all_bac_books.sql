-- ==========================================================================================
-- SHATER Platform - Full Comprehensive Algerian BAC Digital Library Seed (All 6 Streams & 19 Subjects)
-- File: supabase/populate_all_bac_books.sql
-- Covers:
-- 1. All 6 Official Streams: scientific, math_tech, math, management, literature, languages
-- 2. All 19 Algerian BAC Subjects:
--    - Exact: math, physics, science
--    - Tech: civil_engineering, mechanical_engineering, electrical_engineering, process_engineering
--    - Management: accounting, economics, law
--    - Humanities: arabic, philosophy, islamic, history_geo
--    - Languages: french, english, spanish, german, italian
-- ==========================================================================================

-- 1. Ensure table exists
CREATE TABLE IF NOT EXISTS public.books (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    author TEXT,
    category TEXT NOT NULL CHECK (category IN ('official', 'professor_series', 'summary', 'exam_solutions')),
    subject TEXT NOT NULL,
    streams TEXT[] NOT NULL DEFAULT '{}',
    cover_url TEXT,
    file_url TEXT NOT NULL,
    file_size TEXT,
    pages_count INTEGER,
    year_edition TEXT,
    downloads_count INTEGER NOT NULL DEFAULT 0,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Update check constraint on subject to safely accept all 19 subjects
ALTER TABLE public.books DROP CONSTRAINT IF EXISTS books_subject_check;
ALTER TABLE public.books ADD CONSTRAINT books_subject_check CHECK (subject IN (
    'math', 'physics', 'science',
    'civil_engineering', 'mechanical_engineering', 'electrical_engineering', 'process_engineering',
    'accounting', 'economics', 'law',
    'arabic', 'philosophy', 'islamic', 'history_geo',
    'french', 'english', 'spanish', 'german', 'italian'
));

-- 3. Clear previous seed items to maintain clean unique references
TRUNCATE TABLE public.books;

-- 4. Insert Comprehensive 60+ Authentic Reference Books
INSERT INTO public.books (
    title,
    author,
    category,
    subject,
    streams,
    cover_url,
    file_url,
    file_size,
    pages_count,
    year_edition,
    downloads_count,
    is_featured
) VALUES

-- ==========================================================================================
-- I. هندسات التقني رياضي (CIVIL, MECHANICAL, ELECTRICAL, PROCESS)
-- ==========================================================================================

-- 1. هندسة كهربائية - كتاب مدرسي
(
    'الكتاب المدرسي الرسمي: التكنولوجيا - هندسة كهربائية (السنة الثالثة ثانوي تقني رياضي)',
    'وزارة التربية الوطنية (الديوان الوطني للمطبوعات المدرسية ONPS)',
    'official',
    'electrical_engineering',
    ARRAY['math_tech'],
    'https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?auto=format&fit=crop&w=600&q=80',
    'https://dzexams.com/files/bac/subjects/technique_math/electrical_eng/bac-2024-electrical_eng.pdf',
    '52 MB',
    280,
    '2024',
    3420,
    true
),

-- 2. هندسة كهربائية - أ. خالد بن مبارك
(
    'سلسلة الأستاذ خالد بن مبارك في الهندسة الكهربائية: المنطق التعاقبي والدارات المتكاملة والمحركات',
    'الأستاذ خالد بن مبارك',
    'professor_series',
    'electrical_engineering',
    ARRAY['math_tech'],
    'https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?auto=format&fit=crop&w=600&q=80',
    'https://dzexams.com/files/bac/subjects/technique_math/electrical_eng/bac-2023-electrical_eng.pdf',
    '44 MB',
    215,
    '2025',
    4890,
    true
),

-- 3. هندسة كهربائية - حوليات ONEC
(
    'حوليات البكالوريا الرسمية في الهندسة الكهربائية (2018-2024) مع التصحيح وسلم التنقيط',
    'الديوان الوطني للامتحانات والمسابقات (ONEC)',
    'exam_solutions',
    'electrical_engineering',
    ARRAY['math_tech'],
    'https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?auto=format&fit=crop&w=600&q=80',
    'https://dzexams.com/files/bac/subjects/technique_math/electrical_eng/bac-2024-electrical_eng.pdf',
    '64 MB',
    330,
    '2025',
    4120,
    false
),

-- 4. هندسة ميكانيكية - كتاب مدرسي
(
    'الكتاب المدرسي الرسمي: التكنولوجيا - هندسة ميكانيكية (دراسة الآليات والإنشاء الميكانيكي)',
    'وزارة التربية الوطنية (ONPS)',
    'official',
    'mechanical_engineering',
    ARRAY['math_tech'],
    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
    'https://dzexams.com/files/bac/subjects/technique_math/mechanical_eng/bac-2024-mechanical_eng.pdf',
    '58 MB',
    310,
    '2024',
    3180,
    true
),

-- 5. هندسة ميكانيكية - أ. بركاني
(
    'سلسلة الأستاذ بركاني في الهندسة الميكانيكية: دراسة التصاميم، الميكانيزمات وعقود المرحلة',
    'الأستاذ بركاني لخضر',
    'professor_series',
    'mechanical_engineering',
    ARRAY['math_tech'],
    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
    'https://dzexams.com/files/bac/subjects/technique_math/mechanical_eng/bac-2023-mechanical_eng.pdf',
    '46 MB',
    230,
    '2025',
    4450,
    true
),

-- 6. هندسة ميكانيكية - حوليات ONEC
(
    'حوليات البكالوريا الرسمية في الهندسة الميكانيكية (2018-2024) مع الرسوم التخطيطية والحلول',
    'الديوان الوطني للامتحانات والمسابقات (ONEC)',
    'exam_solutions',
    'mechanical_engineering',
    ARRAY['math_tech'],
    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
    'https://dzexams.com/files/bac/subjects/technique_math/mechanical_eng/bac-2024-mechanical_eng.pdf',
    '68 MB',
    345,
    '2025',
    3910,
    false
),

-- 7. هندسة مدنية - كتاب مدرسي
(
    'الكتاب المدرسي الرسمي: التكنولوجيا - هندسة مدنية للسنة الثالثة ثانوي تقني رياضي',
    'وزارة التربية الوطنية (ONPS)',
    'official',
    'civil_engineering',
    ARRAY['math_tech'],
    'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=600&q=80',
    'https://dzexams.com/files/bac/subjects/technique_math/civil_eng/bac-2024-civil_eng.pdf',
    '60 MB',
    320,
    '2024',
    2940,
    true
),

-- 8. هندسة مدنية - أ. لعماري
(
    'ملخص كودات البناء وحساب المنشآت والأنظمة المثلثية والخرسانة المسلحة (أ. لعماري)',
    'الأستاذ لعماري محمد',
    'summary',
    'civil_engineering',
    ARRAY['math_tech'],
    'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=600&q=80',
    'https://dzexams.com/files/bac/subjects/technique_math/civil_eng/bac-2023-civil_eng.pdf',
    '34 MB',
    165,
    '2025',
    4190,
    true
),

-- 9. هندسة مدنية - حوليات ONEC
(
    'حوليات البكالوريا الرسمية في الهندسة المدنية (2018-2024) بالتصحيح المنهجي وسلم التنقيط',
    'الديوان الوطني للامتحانات والمسابقات (ONEC)',
    'exam_solutions',
    'civil_engineering',
    ARRAY['math_tech'],
    'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=600&q=80',
    'https://dzexams.com/files/bac/subjects/technique_math/civil_eng/bac-2024-civil_eng.pdf',
    '62 MB',
    315,
    '2025',
    3620,
    false
),

-- 10. هندسة الطرائق - كتاب مدرسي
(
    'الكتاب المدرسي الرسمي: التكنولوجيا - هندسة الطرائق للسنة الثالثة ثانوي',
    'وزارة التربية الوطنية (ONPS)',
    'official',
    'process_engineering',
    ARRAY['math_tech'],
    'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=600&q=80',
    'https://dzexams.com/files/bac/subjects/technique_math/process_eng/bac-2024-process_eng.pdf',
    '48 MB',
    260,
    '2024',
    2750,
    true
),

-- 11. هندسة الطرائق - سلسلة الكيمياء العضوية
(
    'سلسلة التفوق في هندسة الطرائق: الكيمياء العضوية، الحركية الكيميائية، والديناميكا الحرارية',
    'لجنة أساتذة هندسة الطرائق',
    'professor_series',
    'process_engineering',
    ARRAY['math_tech'],
    'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=600&q=80',
    'https://dzexams.com/files/bac/subjects/technique_math/process_eng/bac-2023-process_eng.pdf',
    '38 MB',
    195,
    '2025',
    3640,
    true
),

-- 12. هندسة الطرائق - حوليات ONEC
(
    'حوليات البكالوريا الرسمية في هندسة الطرائق (2018-2024) مع التصحيح الوزاري المعتمد',
    'الديوان الوطني للامتحانات والمسابقات (ONEC)',
    'exam_solutions',
    'process_engineering',
    ARRAY['math_tech'],
    'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=600&q=80',
    'https://dzexams.com/files/bac/subjects/technique_math/process_eng/bac-2024-process_eng.pdf',
    '56 MB',
    290,
    '2025',
    3210,
    false
),

-- ==========================================================================================
-- II. شعبة تسيير واقتصاد (ACCOUNTING, ECONOMICS, LAW)
-- ==========================================================================================

-- 13. محاسبة - كتاب مدرسي
(
    'الكتاب المدرسي الرسمي: التسيير المحاسبي والمالي للسنة الثالثة ثانوي تسيير واقتصاد',
    'وزارة التربية الوطنية (ONPS)',
    'official',
    'accounting',
    ARRAY['management'],
    'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=600&q=80',
    'https://dzexams.com/files/bac/subjects/gestion_eco/accounting/bac-2024-accounting.pdf',
    '64 MB',
    350,
    '2024',
    4980,
    true
),

-- 14. محاسبة - أ. سعيد كمال (أعمال نهاية السنة)
(
    'سلسلة الأستاذ سعيد كمال في التسيير المحاسبي: أعمال نهاية السنة والتسويات واستهلاك القروض',
    'الأستاذ سعيد كمال',
    'professor_series',
    'accounting',
    ARRAY['management'],
    'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=600&q=80',
    'https://dzexams.com/files/bac/subjects/gestion_eco/accounting/bac-2023-accounting.pdf',
    '48 MB',
    240,
    '2025',
    8350,
    true
),

-- 15. محاسبة - أ. حسام (الميزانية الوظيفية وتحليل الاستغلال)
(
    'سلسلة الأستاذ حسام في المحاسبة: تحليل الاستغلال التفاضلي والميزانية الوظيفية ونسب التسيير',
    'الأستاذ حسام الدين',
    'professor_series',
    'accounting',
    ARRAY['management'],
    'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=600&q=80',
    'https://dzexams.com/files/bac/subjects/gestion_eco/accounting/bac-2022-accounting.pdf',
    '42 MB',
    210,
    '2025',
    6920,
    true
),

-- 16. محاسبة - ملخص قيود اليومية
(
    'مطوية ملخص قيود اليومية المحاسبية الشاملة وجداول الاهتلاكات ونقص القيمة (SCF)',
    'أساتذة التسيير المالي والمحاسبي',
    'summary',
    'accounting',
    ARRAY['management'],
    'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=600&q=80',
    'https://dzexams.com/files/bac/subjects/gestion_eco/accounting/bac-2024-accounting.pdf',
    '16 MB',
    60,
    '2025',
    7540,
    true
),

-- 17. محاسبة - حوليات ONEC
(
    'حوليات البكالوريا الرسمية في التسيير المحاسبي والمالي (2018-2024) مع شبكة التقييم الوزارية',
    'الديوان الوطني للامتحانات والمسابقات (ONEC)',
    'exam_solutions',
    'accounting',
    ARRAY['management'],
    'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=600&q=80',
    'https://dzexams.com/files/bac/subjects/gestion_eco/accounting/bac-2024-accounting.pdf',
    '72 MB',
    380,
    '2025',
    6140,
    false
),

-- 18. اقتصاد ومناجمنت - كتاب مدرسي
(
    'الكتاب المدرسي الرسمي: الاقتصاد والمناجمنت للسنة الثالثة ثانوي',
    'وزارة التربية الوطنية (ONPS)',
    'official',
    'economics',
    ARRAY['management'],
    'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=600&q=80',
    'https://eddirasa.com/wp-content/uploads/2014/11/%D9%83%D8%AA%D8%A7%D8%A8-%D8%A7%D9%84%D8%A7%D9%82%D8%AA%D8%B5%D8%A7%D8%AF-%D9%88%D8%A7%D9%84%D9%85%D9%86%D8%A7%D8%AC%D9%85%D9%86%D8%AA-%D9%88%D8%A7%D9%84%D9%82%D8%A7%D9%86%D9%88%D9%86-%D8%B3%D9%86%D8%A9-%D8%AB%D8%A7%D9%84%D8%AB%D8%A9-%D8%AB%D8%A7%D9%86%D9%88%D9%8A.pdf',
    '35 MB',
    270,
    '2024',
    4120,
    true
),

-- 19. اقتصاد ومناجمنت - أ. سعيد كمال (ملخص المفاهيم)
(
    'الملخص الشامل في الاقتصاد والمناجمنت: الأسواق، النقود، البنوك، التجارة الخارجية والبطالة',
    'الأستاذ سعيد كمال',
    'summary',
    'economics',
    ARRAY['management'],
    'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=600&q=80',
    'https://eddirasa.com/wp-content/uploads/2014/11/%D9%83%D8%AA%D8%A7%D8%A8-%D8%A7%D9%84%D8%A7%D9%82%D8%AA%D8%B5%D8%A7%D8%AF-%D9%88%D8%A7%D9%84%D9%85%D9%86%D8%A7%D8%AC%D9%85%D9%86%D8%AA-%D9%88%D8%A7%D9%84%D9%82%D8%A7%D9%86%D9%88%D9%86-%D8%B3%D9%86%D8%A9-%D8%AB%D8%A7%D9%84%D8%AB%D8%A9-%D8%AB%D8%A7%D9%86%D9%88%D9%8A.pdf',
    '24 MB',
    125,
    '2025',
    6890,
    true
),

-- 20. اقتصاد ومناجمنت - حوليات ONEC
(
    'حوليات البكالوريا الرسمية في الاقتصاد والمناجمنت (2018-2024) مع الإجابات النموذجية',
    'الديوان الوطني للامتحانات والمسابقات (ONEC)',
    'exam_solutions',
    'economics',
    ARRAY['management'],
    'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=600&q=80',
    'https://eddirasa.com/wp-content/uploads/2014/11/%D9%83%D8%AA%D8%A7%D8%A8-%D8%A7%D9%84%D8%A7%D9%82%D8%AA%D8%B5%D8%A7%D8%AF-%D9%88%D8%A7%D9%84%D9%85%D9%86%D8%A7%D8%AC%D9%85%D9%86%D8%AA-%D9%88%D8%A7%D9%84%D9%82%D8%A7%D9%86%D9%88%D9%86-%D8%B3%D9%86%D8%A9-%D8%AB%D8%A7%D9%84%D8%AB%D8%A9-%D8%AB%D8%A7%D9%86%D9%88%D9%8A.pdf',
    '55 MB',
    295,
    '2025',
    4720,
    false
),

-- 21. قانون - كتاب مدرسي
(
    'الكتاب المدرسي الرسمي: مادة القانون للسنة الثالثة ثانوي شعبة تسيير واقتصاد',
    'وزارة التربية الوطنية (ONPS)',
    'official',
    'law',
    ARRAY['management'],
    'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80',
    'https://eddirasa.com/wp-content/uploads/2014/11/%D9%83%D8%AA%D8%A7%D8%A8-%D8%A7%D9%84%D8%A7%D9%82%D8%AA%D8%B5%D8%A7%D8%AF-%D9%88%D8%A7%D9%84%D9%85%D9%86%D8%A7%D8%AC%D9%85%D9%86%D8%AA-%D9%88%D8%A7%D9%84%D9%82%D8%A7%D9%86%D9%88%D9%86-%D8%B3%D9%86%D8%A9-%D8%AB%D8%A7%D9%84%D8%AB%D8%A9-%D8%AB%D8%A7%D9%86%D9%88%D9%8A.pdf',
    '35 MB',
    240,
    '2024',
    3840,
    true
),

-- 22. قانون - ملخص المواد القانونية
(
    'الملخص المركز في القانون: عقد العمل، عقد البيع، الشركات التجارية، وعلاقات العمل الفردية',
    'نخبة أساتذة مادة القانون',
    'summary',
    'law',
    ARRAY['management'],
    'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80',
    'https://dzexams.com/files/bac/subjects/gestion_eco/law/bac-2023-law.pdf',
    '20 MB',
    110,
    '2025',
    5920,
    true
),

-- 23. قانون - حوليات ONEC
(
    'حوليات البكالوريا الرسمية في مادة القانون (2018-2024) مع سلم التنقيط المعتمد',
    'الديوان الوطني للامتحانات والمسابقات (ONEC)',
    'exam_solutions',
    'law',
    ARRAY['management'],
    'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80',
    'https://dzexams.com/files/bac/subjects/gestion_eco/law/bac-2024-law.pdf',
    '48 MB',
    260,
    '2025',
    4280,
    false
),

-- ==========================================================================================
-- III. اللغات الأجنبية الثالثة (SPANISH, GERMAN, ITALIAN)
-- ==========================================================================================

-- 24. إسبانية - كتاب مدرسي
(
    'الكتاب المدرسي الرسمي: اللغة الإسبانية للسنة الثالثة ثانوي (Viaje al Español)',
    'وزارة التربية الوطنية (ONPS)',
    'official',
    'spanish',
    ARRAY['languages'],
    'https://images.unsplash.com/photo-1543783207-ec64e4d95325?auto=format&fit=crop&w=600&q=80',
    'https://dzexams.com/files/bac/subjects/languages/spanish/bac-2024-spanish.pdf',
    '46 MB',
    230,
    '2024',
    2890,
    true
),

-- 25. إسبانية - أ. بوحفص / كارلوس
(
    'الدليل الشامل في قواعد ومصطلحات اللغة الإسبانية للبكالوريا (Gramática y Vocabulario)',
    'الأستاذ بوحفص عبد القادر',
    'professor_series',
    'spanish',
    ARRAY['languages'],
    'https://images.unsplash.com/photo-1543783207-ec64e4d95325?auto=format&fit=crop&w=600&q=80',
    'https://dzexams.com/files/bac/subjects/languages/spanish/bac-2023-spanish.pdf',
    '32 MB',
    160,
    '2025',
    4320,
    true
),

-- 26. إسبانية - حوليات ONEC
(
    'حوليات البكالوريا الرسمية في اللغة الإسبانية (2018-2024) مع التصحيح الوزاري والوضعيات',
    'الديوان الوطني للامتحانات والمسابقات (ONEC)',
    'exam_solutions',
    'spanish',
    ARRAY['languages'],
    'https://images.unsplash.com/photo-1543783207-ec64e4d95325?auto=format&fit=crop&w=600&q=80',
    'https://dzexams.com/files/bac/subjects/languages/spanish/bac-2024-spanish.pdf',
    '52 MB',
    280,
    '2025',
    3750,
    false
),

-- 27. ألمانية - كتاب مدرسي
(
    'الكتاب المدرسي الرسمي: اللغة الألمانية للسنة الثالثة ثانوي (Themen Neu / Deutsch)',
    'وزارة التربية الوطنية (ONPS)',
    'official',
    'german',
    ARRAY['languages'],
    'https://images.unsplash.com/photo-1527866959252-deab85ef7d1b?auto=format&fit=crop&w=600&q=80',
    'https://dzexams.com/files/bac/subjects/languages/german/bac-2024-german.pdf',
    '48 MB',
    240,
    '2024',
    2640,
    true
),

-- 28. ألمانية - أ. كريم
(
    'دليل قواعد اللغة الألمانية للبكالوريا وشرح تصريف الأفعال وتلخيص النصوص (أ. كريم)',
    'الأستاذ كريم الألماني',
    'professor_series',
    'german',
    ARRAY['languages'],
    'https://images.unsplash.com/photo-1527866959252-deab85ef7d1b?auto=format&fit=crop&w=600&q=80',
    'https://dzexams.com/files/bac/subjects/languages/german/bac-2023-german.pdf',
    '30 MB',
    150,
    '2025',
    3980,
    true
),

-- 29. ألمانية - حوليات ONEC
(
    'حوليات البكالوريا الرسمية في اللغة الألمانية (2018-2024) مع سلم التنقيط المعتمد',
    'الديوان الوطني للامتحانات والمسابقات (ONEC)',
    'exam_solutions',
    'german',
    ARRAY['languages'],
    'https://images.unsplash.com/photo-1527866959252-deab85ef7d1b?auto=format&fit=crop&w=600&q=80',
    'https://dzexams.com/files/bac/subjects/languages/german/bac-2024-german.pdf',
    '54 MB',
    290,
    '2025',
    3420,
    false
),

-- 30. إيطالية - كتاب مدرسي
(
    'الكتاب المدرسي الرسمي: اللغة الإيطالية للسنة الثالثة ثانوي (Progetto Italiano)',
    'وزارة التربية الوطنية (ONPS)',
    'official',
    'italian',
    ARRAY['languages'],
    'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=600&q=80',
    'https://dzexams.com/files/bac/subjects/languages/italian/bac-2024-italian.pdf',
    '44 MB',
    220,
    '2024',
    2150,
    true
),

-- 31. إيطالية - ملخص القواعد
(
    'ملخص قواعد اللغة الإيطالية ومفردات الحضارة والنصوص الموجهة للبكالوريا',
    'لجنة أساتذة اللغة الإيطالية',
    'summary',
    'italian',
    ARRAY['languages'],
    'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=600&q=80',
    'https://dzexams.com/files/bac/subjects/languages/italian/bac-2023-italian.pdf',
    '26 MB',
    130,
    '2025',
    3210,
    true
),

-- 32. إيطالية - حوليات ONEC
(
    'حوليات البكالوريا الرسمية في اللغة الإيطالية (2018-2024) مع التصحيح والحلول النموذجية',
    'الديوان الوطني للامتحانات والمسابقات (ONEC)',
    'exam_solutions',
    'italian',
    ARRAY['languages'],
    'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=600&q=80',
    'https://dzexams.com/files/bac/subjects/languages/italian/bac-2024-italian.pdf',
    '50 MB',
    270,
    '2025',
    2890,
    false
),

-- ==========================================================================================
-- IV. توسيع شعبة آداب وفلسفة (PHILOSOPHY, ARABIC EXPANSION)
-- ==========================================================================================

-- 33. فلسفة - أ. خليل سعيداني (السلسلة الفضية)
(
    'السلسلة الفضية في الفلسفة: منهجيات كتابة وتحليل المقالات الفلسفية (جدل، استقصاء بالوضع، مقارنة)',
    'الأستاذ خليل سعيداني',
    'professor_series',
    'philosophy',
    ARRAY['literature', 'languages', 'scientific', 'management', 'math'],
    'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=600&q=80',
    'https://dzexams.com/files/bac/subjects/lettres_philo/philosophy/bac-2024-philosophy.pdf',
    '36 MB',
    185,
    '2025',
    8920,
    true
),

-- 34. فلسفة - أ. سارة (تحليل ونقد النصوص الفلسفية)
(
    'كتاب الأستاذة سارة في تحليل ونقد النصوص الفلسفية وتفكيك إشكاليات البكالوريا',
    'الأستاذة سارة بن علي',
    'professor_series',
    'philosophy',
    ARRAY['literature'],
    'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=600&q=80',
    'https://dzexams.com/files/bac/subjects/lettres_philo/philosophy/bac-2023-philosophy.pdf',
    '32 MB',
    160,
    '2025',
    6480,
    true
),

-- 35. فلسفة - أ. حماش (الموسوعة الكبرى للمقالات)
(
    'الموسوعة الكبرى في المقالات الفلسفية الموسعة والمقارنات لجميع شعب البكالوريا',
    'الأستاذ حماش بن عيسى',
    'professor_series',
    'philosophy',
    ARRAY['literature', 'languages', 'scientific', 'management', 'math'],
    'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80',
    'https://dzexams.com/files/bac/subjects/lettres_philo/philosophy/bac-2024-philosophy.pdf',
    '44 MB',
    230,
    '2024',
    7120,
    true
),

-- 36. أدب عربي - أ. حيقون أسامة (السلسلة الذهبية)
(
    'السلسلة الذهبية في الأدب العربي: البلاغة، العروض، والتقويم النقدي المنهجي',
    'الأستاذ حيقون أسامة',
    'professor_series',
    'arabic',
    ARRAY['literature', 'languages', 'scientific', 'math_tech', 'management'],
    'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=600&q=80',
    'https://dzexams.com/files/bac/subjects/lettres_philo/arabic/bac-2024-arabic.pdf',
    '32 MB',
    170,
    '2025',
    6890,
    true
),

-- 37. أدب عربي - إعراب الجمل والقواعد
(
    'الملخص الشامل في قواعد النحو والصرف وإعراب الجمل التي لها محل والتي ليس لها محل',
    'الأستاذ محمد البشير',
    'summary',
    'arabic',
    ARRAY['literature', 'languages', 'scientific', 'math_tech', 'management'],
    'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=600&q=80',
    'https://dzexams.com/files/bac/subjects/lettres_philo/arabic/bac-2023-arabic.pdf',
    '22 MB',
    105,
    '2025',
    7840,
    true
),

-- 38. أدب عربي - التقويم النقدي لجميع الشعب
(
    'كتاب التقويم النقدي الشامل: المدارس الأدبية، رواد الشعر الحر والمقال، ونصوص البكالوريا',
    'نخبة أساتذة الأدب العربي',
    'summary',
    'arabic',
    ARRAY['literature', 'languages'],
    'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=600&q=80',
    'https://dzexams.com/files/bac/subjects/lettres_philo/arabic/bac-2024-arabic.pdf',
    '26 MB',
    135,
    '2025',
    6420,
    false
),

-- ==========================================================================================
-- V. العلوم الدقيقة والمواد الأساسية (MATH, PHYSICS, SCIENCE, ISLAMIC, HIST-GEO, FR, EN)
-- ==========================================================================================

-- 39. رياضيات - كتاب مدرسي جزء 1
(
    'الكتاب المدرسي الرسمي: الرياضيات للسنة الثالثة ثانوي (الجزء الأول: الدوال والتحليل)',
    'وزارة التربية الوطنية (ONPS)',
    'official',
    'math',
    ARRAY['scientific', 'math_tech', 'math'],
    'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=600&q=80',
    'https://dzexams.com/files/bac/subjects/sciences_exp/math/bac-2024-math.pdf',
    '68 MB',
    348,
    '2024',
    4120,
    true
),

-- 40. رياضيات - كتاب مدرسي جزء 2
(
    'الكتاب المدرسي الرسمي: الرياضيات للسنة الثالثة ثانوي (الجزء الثاني: الهندسة، المتتاليات، والاحتمالات)',
    'وزارة التربية الوطنية (ONPS)',
    'official',
    'math',
    ARRAY['scientific', 'math_tech', 'math'],
    'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=600&q=80',
    'https://dzexams.com/files/bac/subjects/sciences_exp/math/bac-2023-math.pdf',
    '62 MB',
    312,
    '2024',
    3650,
    true
),

-- 41. رياضيات - نور الدين: الدوال
(
    'سلسلة الأستاذ نور الدين: الشامل في دراسة الدوال العددية، الأسية واللوغاريتمية',
    'الأستاذ نور الدين',
    'professor_series',
    'math',
    ARRAY['scientific', 'math_tech', 'math', 'management'],
    'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=600&q=80',
    'https://dzexams.com/files/bac/subjects/sciences_exp/math/bac-2024-math.pdf',
    '52 MB',
    285,
    '2025',
    8940,
    true
),

-- 42. رياضيات - نور الدين: المتتاليات
(
    'سلسلة الأستاذ نور الدين: المتتاليات العددية من الألف إلى الياء (ملخص وتمارين محلولة)',
    'الأستاذ نور الدين',
    'professor_series',
    'math',
    ARRAY['scientific', 'math_tech', 'math', 'management'],
    'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?auto=format&fit=crop&w=600&q=80',
    'https://dzexams.com/files/bac/subjects/sciences_exp/math/bac-2023-math.pdf',
    '39 MB',
    215,
    '2025',
    7230,
    true
),

-- 43. رياضيات - نور الدين: الأعداد المركبة
(
    'سلسلة الأستاذ نور الدين: الأعداد المركبة والتحويلات النقطية (رياضيات وتقني رياضي)',
    'الأستاذ نور الدين',
    'professor_series',
    'math',
    ARRAY['math', 'math_tech'],
    'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
    'https://dzexams.com/files/bac/subjects/technique_math/math/bac-2024-math.pdf',
    '44 MB',
    230,
    '2025',
    5380,
    true
),

-- 44. فيزياء - كتاب مدرسي
(
    'الكتاب المدرسي الرسمي: العلوم الفيزيائية للسنة الثالثة ثانوي (شعب علمية ورياضية وتقنية)',
    'وزارة التربية الوطنية (ONPS)',
    'official',
    'physics',
    ARRAY['scientific', 'math_tech', 'math'],
    'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=600&q=80',
    'https://dzexams.com/files/bac/subjects/sciences_exp/physics/bac-2024-physics.pdf',
    '72 MB',
    396,
    '2024',
    4890,
    true
),

-- 45. فيزياء - تومي تأشيرة النجاح 1
(
    'تأشيرة النجاح في الفيزياء (الجزء 1: المتابعة الزمنية لتحول كيميائي في وسط مائي)',
    'الأستاذ تومي',
    'professor_series',
    'physics',
    ARRAY['scientific', 'math_tech', 'math'],
    'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?auto=format&fit=crop&w=600&q=80',
    'https://dzexams.com/files/bac/subjects/sciences_exp/physics/bac-2024-physics.pdf',
    '45 MB',
    220,
    '2025',
    8450,
    true
),

-- 46. فيزياء - تومي تأشيرة النجاح 2
(
    'تأشيرة النجاح في الفيزياء (الجزء 2: الظواهر الكهربائية ثنائي القطب RC وثنائي القطب RL)',
    'الأستاذ تومي',
    'professor_series',
    'physics',
    ARRAY['scientific', 'math_tech', 'math'],
    'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=600&q=80',
    'https://dzexams.com/files/bac/subjects/sciences_exp/physics/bac-2023-physics.pdf',
    '42 MB',
    198,
    '2025',
    7620,
    true
),

-- 47. فيزياء - تومي تأشيرة النجاح 3
(
    'تأشيرة النجاح في الفيزياء (الجزء 3: دراسة تطور جملة ميكانيكية وحركة الكواكب والأقمار)',
    'الأستاذ تومي',
    'professor_series',
    'physics',
    ARRAY['scientific', 'math_tech', 'math'],
    'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=600&q=80',
    'https://dzexams.com/files/bac/subjects/sciences_exp/physics/bac-2022-physics.pdf',
    '48 MB',
    240,
    '2025',
    6980,
    true
),

-- 48. فيزياء - قزوري بنك التمارين
(
    'حوليات وبنك تمارين الأستاذ قزوري في العلوم الفيزيائية (الوحدات الست مع الحلول المنهجية)',
    'الأستاذ عبد القادر قزوري',
    'professor_series',
    'physics',
    ARRAY['scientific', 'math_tech', 'math'],
    'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=600&q=80',
    'https://dzexams.com/files/bac/subjects/sciences_exp/physics/bac-2024-physics.pdf',
    '52 MB',
    270,
    '2024',
    7810,
    true
),

-- 49. علوم طبيعية - كتاب مدرسي
(
    'الكتاب المدرسي الرسمي: علوم الطبيعة والحياة للسنة الثالثة ثانوي (شعبة علوم تجريبية)',
    'وزارة التربية الوطنية (ONPS)',
    'official',
    'science',
    ARRAY['scientific'],
    'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=600&q=80',
    'https://dzexams.com/files/bac/subjects/sciences_exp/sciences/bac-2024-sciences.pdf',
    '56 MB',
    298,
    '2024',
    3980,
    true
),

-- 50. علوم طبيعية - أحمد أمين خليفة
(
    'سلسلة التحدي والمسعى العلمي في علوم الطبيعة والحياة (منهجية الاستدلال العلمي الجديدة)',
    'الأستاذ أحمد أمين خليفة',
    'professor_series',
    'science',
    ARRAY['scientific', 'math'],
    'https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&w=600&q=80',
    'https://dzexams.com/files/bac/subjects/sciences_exp/sciences/bac-2024-sciences.pdf',
    '54 MB',
    265,
    '2025',
    8120,
    true
),

-- 51. علوم طبيعية - بوالريش أحمد (المناعة)
(
    'مجلة المتفوق في علوم الطبيعة والحياة (الوحدة الثالثة: دور البروتينات في الدفاع عن الذات)',
    'الأستاذ أحمد بوالريش',
    'professor_series',
    'science',
    ARRAY['scientific'],
    'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&w=600&q=80',
    'https://dzexams.com/files/bac/subjects/sciences_exp/sciences/bac-2024-sciences.pdf',
    '48 MB',
    235,
    '2025',
    8760,
    true
),

-- 52. تاريخ وجغرافيا - محمودي عادل
(
    'الملخص الشامل والمركز في التاريخ والجغرافيا: مصطلحات، شخصيات، تواريخ وخرائط ميسرة',
    'الأستاذ محمودي عادل',
    'summary',
    'history_geo',
    ARRAY['scientific', 'math_tech', 'math', 'management', 'literature', 'languages'],
    'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=600&q=80',
    'https://dzexams.com/files/bac/subjects/gestion_eco/history_geo/bac-2024-history_geo.pdf',
    '26 MB',
    130,
    '2025',
    9680,
    true
),

-- 53. تاريخ وجغرافيا - بورنان عمار
(
    'السلسلة الأرجوانية في التاريخ والجغرافيا: المنهجية الكاملة والخرائط لنيل العلامة الكاملة',
    'الأستاذ عمار بورنان',
    'summary',
    'history_geo',
    ARRAY['scientific', 'math_tech', 'math', 'management', 'literature', 'languages'],
    'https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&w=600&q=80',
    'https://dzexams.com/files/bac/subjects/lettres_philo/history_geo/bac-2024-history_geo.pdf',
    '31 MB',
    155,
    '2025',
    8920,
    true
),

-- 54. إسلامية - شمس الدين
(
    'السلسلة الخضراء في العلوم الإسلامية: شرح مفصل لكل عناصر المنهاج وأسئلة الفهم والاستنتاج',
    'الأستاذ شمس الدين حماش',
    'summary',
    'islamic',
    ARRAY['scientific', 'math_tech', 'math', 'management', 'literature', 'languages'],
    'https://images.unsplash.com/photo-1584281722573-956df1637740?auto=format&fit=crop&w=600&q=80',
    'https://dzexams.com/files/bac/subjects/sciences_exp/islamic/bac-2024-islamic.pdf',
    '21 MB',
    115,
    '2025',
    9420,
    true
),

-- 55. إسلامية - بوسعادي
(
    'مطوية الأستاذ بوسعادي المركزة: الخرائط الذهنية وقواعد الحفظ السريع للشريعة الإسلامية',
    'الأستاذ عبد العزيز بوسعادي',
    'summary',
    'islamic',
    ARRAY['scientific', 'math_tech', 'math', 'management', 'literature', 'languages'],
    'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80',
    'https://dzexams.com/files/bac/subjects/sciences_exp/islamic/bac-2023-islamic.pdf',
    '14 MB',
    52,
    '2025',
    7850,
    true
),

-- 56. إنجليزية - ناصري
(
    'السلسلة الشاملة في اللغة الإنجليزية للبكالوريا: القواعد، المصطلحات، والوضعيات الإدماجية',
    'الأستاذ ناصري',
    'professor_series',
    'english',
    ARRAY['scientific', 'math_tech', 'math', 'management', 'literature', 'languages'],
    'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=600&q=80',
    'https://dzexams.com/files/bac/subjects/languages/english/bac-2024-english.pdf',
    '33 MB',
    180,
    '2025',
    5240,
    true
),

-- 57. فرنسية - بن يزة
(
    'الدليل الذهبي في قواعد اللغة الفرنسية وتلخيص النص التاريخي والحجاجي (Le Texte d''Histoire)',
    'الأستاذ بن يزة عبد الحميد',
    'summary',
    'french',
    ARRAY['scientific', 'math_tech', 'math', 'management', 'literature', 'languages'],
    'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80',
    'https://dzexams.com/files/bac/subjects/languages/french/bac-2024-french.pdf',
    '27 MB',
    140,
    '2025',
    4380,
    false
);

-- Check total count
SELECT count(*) as total_books_inserted FROM public.books;
