-- Seed Data: Most popular and authoritative Algerian BAC Reference Books & Ministerial Textbooks
-- Table: public.books

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
-- 1. الفيزياء - تأشيرة النجاح
(
    'تأشيرة النجاح في العلوم الفيزيائية (الجزء الأول: المتابعة الزمنية والظواهر الكهربائية)',
    'الأستاذ تومي',
    'professor_series',
    'physics',
    ARRAY['scientific', 'math_tech', 'math'],
    'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?auto=format&fit=crop&w=600&q=80',
    'https://dzexams.com/files/bac/subjects/sciences_exp/physics/bac-2024-physics.pdf',
    '42 MB',
    215,
    '2025',
    1420,
    true
),
-- 2. فيزياء - حوليات الأستاذ قزوري
(
    'حوليات الأستاذ قزوري في الفيزياء - بنك التمارين النموذجية مع الحلول المنهجية',
    'الأستاذ عبد القادر قزوري',
    'professor_series',
    'physics',
    ARRAY['scientific', 'math_tech', 'math'],
    'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=600&q=80',
    'https://dzexams.com/files/bac/subjects/sciences_exp/physics/bac-2023-physics.pdf',
    '38 MB',
    184,
    '2024',
    1890,
    true
),
-- 3. فيزياء - سلسلة المغني
(
    'سلسلة المغني في العلوم الفيزيائية - حلول وتمارين البكالوريا المعمقة',
    'سلسلة المغني (أ. حوحو & أ. بن عثمان)',
    'professor_series',
    'physics',
    ARRAY['scientific', 'math_tech', 'math'],
    'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=600&q=80',
    'https://dzexams.com/files/bac/subjects/sciences_exp/physics/bac-2022-physics.pdf',
    '54 MB',
    310,
    '2024',
    980,
    false
),
-- 4. رياضيات - سلاسل الأستاذ نور الدين (الدوال)
(
    'الشامل في الدوال العددية والأسية واللوغاريتمية - دراسة مفصلة مع مسائل البكالوريا',
    'الأستاذ نور الدين',
    'professor_series',
    'math',
    ARRAY['scientific', 'math_tech', 'math', 'management'],
    'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=600&q=80',
    'https://dzexams.com/files/bac/subjects/sciences_exp/math/bac-2024-math.pdf',
    '48 MB',
    260,
    '2025',
    3450,
    true
),
-- 5. رياضيات - سلاسل الأستاذ نور الدين (المتتاليات والاحتمالات)
(
    'سلسلة المتتاليات العددية والاحتمالات - أفكار الحساب وتمارين البكالوريات السابقة',
    'الأستاذ نور الدين',
    'professor_series',
    'math',
    ARRAY['scientific', 'math_tech', 'math', 'management'],
    'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?auto=format&fit=crop&w=600&q=80',
    'https://dzexams.com/files/bac/subjects/sciences_exp/math/bac-2023-math.pdf',
    '36 MB',
    195,
    '2025',
    2110,
    false
),
-- 6. رياضيات - سلسلة الهباج
(
    'سلسلة الهباج في الرياضيات - حلول شاملة ومفصلة لتمارين الكتاب المدرسي',
    'دار الهباج للنشر',
    'professor_series',
    'math',
    ARRAY['scientific', 'math_tech', 'math'],
    'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
    'https://dzexams.com/files/bac/subjects/sciences_exp/math/bac-2022-math.pdf',
    '62 MB',
    340,
    '2024',
    1570,
    false
),
-- 7. علوم طبيعية - حقيبة الأستاذ بوالريش أحمد
(
    'المجلة العلمية وحقيبة المتفوق في علوم الطبيعة والحياة (تركيب البروتين والمناعة)',
    'الأستاذ أحمد بوالريش',
    'professor_series',
    'science',
    ARRAY['scientific', 'math'],
    'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&w=600&q=80',
    'https://dzexams.com/files/bac/subjects/sciences_exp/sciences/bac-2024-sciences.pdf',
    '52 MB',
    280,
    '2025',
    2890,
    true
),
-- 8. علوم طبيعية - سلاسل الأستاذ أحمد أمين خليفة
(
    'سلسلة التحدي والمسعى العلمي في علوم الطبيعة والحياة - استدلال علمي منهجي',
    'الأستاذ أحمد أمين خليفة',
    'professor_series',
    'science',
    ARRAY['scientific', 'math'],
    'https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&w=600&q=80',
    'https://dzexams.com/files/bac/subjects/sciences_exp/sciences/bac-2023-sciences.pdf',
    '44 MB',
    230,
    '2024',
    1740,
    false
),
-- 9. تاريخ وجغرافيا - ملخصات الأستاذ محمودي عادل
(
    'الملخص الشامل والمركز في التاريخ والجغرافيا - خرائط، مصطلحات وشخصيات ميسرة',
    'الأستاذ محمودي عادل',
    'summary',
    'history_geo',
    ARRAY['scientific', 'math_tech', 'math', 'management', 'literature', 'languages'],
    'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=600&q=80',
    'https://dzexams.com/files/bac/subjects/gestion_eco/history_geo/bac-2024-history_geo.pdf',
    '24 MB',
    120,
    '2025',
    4120,
    true
),
-- 10. تاريخ وجغرافيا - السلسلة الأرجوانية للأستاذ بورنان
(
    'السلسلة الأرجوانية في التاريخ والجغرافيا - المنهجية الكاملة لنيل العلامة الكاملة',
    'الأستاذ عمار بورنان',
    'summary',
    'history_geo',
    ARRAY['scientific', 'math_tech', 'math', 'management', 'literature', 'languages'],
    'https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&w=600&q=80',
    'https://dzexams.com/files/bac/subjects/lettres_philo/history_geo/bac-2023-history_geo.pdf',
    '29 MB',
    145,
    '2025',
    3280,
    true
),
-- 11. علوم إسلامية - السلسلة الخضراء للأستاذ شمس الدين
(
    'السلسلة الخضراء في العلوم الإسلامية - شرح جميع الدروس وأسئلة الفهم والاستنتاج',
    'الأستاذ شمس الدين حماش',
    'summary',
    'islamic',
    ARRAY['scientific', 'math_tech', 'math', 'management', 'literature', 'languages'],
    'https://images.unsplash.com/photo-1584281722573-956df1637740?auto=format&fit=crop&w=600&q=80',
    'https://dzexams.com/files/bac/subjects/sciences_exp/islamic/bac-2024-islamic.pdf',
    '18 MB',
    98,
    '2025',
    3840,
    true
),
-- 12. علوم إسلامية - مطوية الأستاذ بوسعادي
(
    'مطوية الأستاذ بوسعادي المركزة - قواعد الحفظ السريع وخرائط الشريعة الإسلامية',
    'الأستاذ عبد العزيز بوسعادي',
    'summary',
    'islamic',
    ARRAY['scientific', 'math_tech', 'math', 'management', 'literature', 'languages'],
    'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80',
    'https://dzexams.com/files/bac/subjects/sciences_exp/islamic/bac-2023-islamic.pdf',
    '12 MB',
    48,
    '2025',
    2910,
    false
),
-- 13. فلسفة - السلسلة الفضية للأستاذ خليل سعيداني
(
    'السلسلة الفضية في الفلسفة - منهجية كتابة المقالات الفلسفية (جدل، استقصاء، مقارنة)',
    'الأستاذ خليل سعيداني',
    'professor_series',
    'philosophy',
    ARRAY['literature', 'languages', 'scientific', 'management', 'math'],
    'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=600&q=80',
    'https://dzexams.com/files/bac/subjects/lettres_philo/philosophy/bac-2024-philosophy.pdf',
    '31 MB',
    168,
    '2025',
    2430,
    true
),
-- 14. لغة عربية - الشامل في الأدب العربي وقواعد اللغة
(
    'السلسلة الذهبية في الأدب العربي - البلاغة، العروض والتقويم النقدي للبكالوريا',
    'الأستاذ حيقون أسامة',
    'professor_series',
    'arabic',
    ARRAY['literature', 'languages', 'scientific', 'math_tech', 'management'],
    'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=600&q=80',
    'https://dzexams.com/files/bac/subjects/lettres_philo/arabic/bac-2024-arabic.pdf',
    '27 MB',
    155,
    '2025',
    1690,
    false
),
-- 15. كتب رسمية - الكتاب المدرسي رياضيات 3 ثانوي
(
    'الكتاب المدرسي الرسمي: الرياضيات للسنة الثالثة ثانوي (الجزء الأول والثاني)',
    'وزارة التربية الوطنية الجزائرية (الديوان الوطني للمطبوعات المدرسية)',
    'official',
    'math',
    ARRAY['scientific', 'math_tech', 'math'],
    'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=600&q=80',
    'https://dzexams.com/files/bac/subjects/sciences_exp/math/bac-2024-math.pdf',
    '65 MB',
    384,
    '2024',
    3120,
    true
),
-- 16. كتب رسمية - الكتاب المدرسي فيزياء 3 ثانوي
(
    'الكتاب المدرسي الرسمي: العلوم الفيزيائية للسنة الثالثة ثانوي',
    'وزارة التربية الوطنية الجزائرية (الديوان الوطني للمطبوعات المدرسية)',
    'official',
    'physics',
    ARRAY['scientific', 'math_tech', 'math'],
    'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=600&q=80',
    'https://dzexams.com/files/bac/subjects/sciences_exp/physics/bac-2024-physics.pdf',
    '58 MB',
    320,
    '2024',
    2750,
    true
),
-- 17. كتب رسمية - الكتاب المدرسي علوم الطبيعة والحياة
(
    'الكتاب المدرسي الرسمي: علوم الطبيعة والحياة للسنة الثالثة ثانوي',
    'وزارة التربية الوطنية الجزائرية (الديوان الوطني للمطبوعات المدرسية)',
    'official',
    'science',
    ARRAY['scientific', 'math'],
    'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=600&q=80',
    'https://dzexams.com/files/bac/subjects/sciences_exp/sciences/bac-2024-sciences.pdf',
    '49 MB',
    272,
    '2024',
    2200,
    true
),
-- 18. حوليات - الموسوعة الشاملة لمواضيع البكالوريا المحلولة 2018-2024
(
    'الموسوعة الكبرى لحوليات البكالوريا الرسمية مع الحلول الوزارية المفصلة (جميع الشعب)',
    'لجنة أساتذة التفوق الأكاديمي',
    'exam_solutions',
    'math',
    ARRAY['scientific', 'math_tech', 'math', 'management', 'literature', 'languages'],
    'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80',
    'https://dzexams.com/files/bac/subjects/sciences_exp/math/bac-2024-math.pdf',
    '85 MB',
    460,
    '2025',
    4950,
    true
)
ON CONFLICT DO NOTHING;
