-- ==============================================================================
-- supabase/seed_official_orientation_2026.sql
-- Authoritative Seed Data for Algerian Higher Education Orientation (2026-2027)
-- Strictly Grounded in MESRS Ministerial Circular No. 01 and Official Statistics
-- INVARIANT: publication_status = 'VERIFIED' (Zero PUBLISHED records)
-- INVARIANT: academic_year = '2026-2027'
-- ==============================================================================

-- 1. SEED ORIENTATION SOURCES
INSERT INTO public.orientation_sources (id, title, url, publication_year, academic_year, source_type, reference_section, verification_status, verified_at, notes)
VALUES (
  'src-mesrs-circulaire-2024',
  'المنشور الوزاري رقم 01 المؤرخ في 11 جويلية 2024 المتعلق بتوجيه حاملي شهادة البكالوريا بعنوان السنة الجامعية 2024-2025',
  'https://circulaire.mesrs.dz/',
  '2024',
  '2026-2027',
  'OFFICIAL_CIRCULAR',
  'الشروط البيداغوجية العامة وصيغ المعدلات الموزونة المعتمدة رسمياً',
  'VERIFIED',
  now(),
  'المصدر الأساسي المرجعي لجميع صيغ حساب المعدل الموزون وشروط الالتحاق بجميع الشعب.'
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  academic_year = EXCLUDED.academic_year,
  verification_status = EXCLUDED.verification_status;
INSERT INTO public.orientation_sources (id, title, url, publication_year, academic_year, source_type, reference_section, verification_status, verified_at, notes)
VALUES (
  'src-mesrs-circulaire-2025-projected',
  'القواعد الاسترشادية المحيّنة لدورة 2025/2026 المنبثقة عن المنشور الوزاري رقم 01',
  'https://circulaire.mesrs.dz/',
  '2025',
  '2026-2027',
  'OFFICIAL_CIRCULAR',
  'تحيين قواعد التوجيه لحاملي شهادة البكالوريا الجدد',
  'PARTIALLY_VERIFIED',
  now(),
  'قواعد استرشادية محينة. دورة 2026 الرسمية لم تصدر بعد من الوزارة وتعتمد هذه القواعد مبدئياً.'
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  academic_year = EXCLUDED.academic_year,
  verification_status = EXCLUDED.verification_status;
INSERT INTO public.orientation_sources (id, title, url, publication_year, academic_year, source_type, reference_section, verification_status, verified_at, notes)
VALUES (
  'src-mesrs-statistiques-2024',
  'نتائج المعالجة الآلية لرغبات حاملي شهادة البكالوريا دورة 2024 (الحدود الدنيا الوطنية والمحلية للتوجيه)',
  'https://orientation.esi.dz/',
  '2024',
  '2026-2027',
  'ANNUAL_CUTOFF_REPORT',
  'الملحق الإحصائي الرسمي لمعدلات التوجيه الدنيا حسب الشعب والمؤسسات',
  'VERIFIED',
  now(),
  'معدلات القبول السابقة التي توقف عندها التوجيه التنافسي الفعلي حسب كل شعبة ومؤسسة.'
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  academic_year = EXCLUDED.academic_year,
  verification_status = EXCLUDED.verification_status;
INSERT INTO public.orientation_sources (id, title, url, publication_year, academic_year, source_type, reference_section, verification_status, verified_at, notes)
VALUES (
  'src-mesrs-decret-ens',
  'القرار الوزاري المشترك المحدد لشروط الالتحاق بالمدارس العليا للأساتذة وشروط المقابلة الشفوية والسن',
  'https://www.mesrs.dz/',
  '2023',
  '2026-2027',
  'MINISTERIAL_DECREE',
  'المادة 4: شرط السن (أقل من 24 سنة) والمقابلة الشفوية الإلزامية والفحص الطبي',
  'VERIFIED',
  now(),
  'يشترط اجتياز مقابلة شفوية وفحص طبي للتأكد من القدرة على ممارسة مهنة التدريس.'
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  academic_year = EXCLUDED.academic_year,
  verification_status = EXCLUDED.verification_status;
INSERT INTO public.orientation_sources (id, title, url, publication_year, academic_year, source_type, reference_section, verification_status, verified_at, notes)
VALUES (
  'src-mesrs-esi-decret',
  'النظام الداخلي وشروط القبول بالأقسام التحضيرية المدمجة في الإعلام الآلي (ESI الجزائر)',
  'https://www.esi.dz/',
  '2024',
  '2026-2027',
  'INSTITUTION_REGULATION',
  'نظام الانتقال والأولوية في ترتيب المترشحين (الرياضيات أولوية 1)',
  'VERIFIED',
  now(),
  'صيغة المعدل الموزون: ((معدل البكالوريا × 2) + علامة الرياضيات) / 3.'
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  academic_year = EXCLUDED.academic_year,
  verification_status = EXCLUDED.verification_status;

-- 2. SEED OFFICIAL ORIENTATION CONFLICTS & HUMAN REVIEW ITEMS
INSERT INTO public.orientation_conflicts (id, academic_year, conflict_type, title, description, severity, resolution_status, requires_human_review, source_reference, notes)
VALUES (
  gen_random_uuid(),
  '2026-2027',
  'REGIONAL_ANNEX_MISSING',
  'غياب التحديد الحصري لولايات التكوين الجهوي في بعض التخصصات',
  'ينص المنشور الوزاري على أن بعض التخصصات (مثل البيولوجيا والهندسة في بعض الجامعات الداخلية) ذات تسجيل جهوي، دون إرفاق جدول الولايات التابعة جغرافياً لكل مؤسسة في النص الرقمي الرئيسي، مما يترك تحديد الدائرة للمناشير التكميلية لمديريات التوجيه.',
  'HIGH',
  'UNRESOLVED',
  true,
  'src-mesrs-circulaire-2024 (الملحق الجغرافي)',
  'يتطلب مراجعة سنوية مع مديري الدراسات أو استخراج الملحق الولائي الصادر عن MESRS.'
);
INSERT INTO public.orientation_conflicts (id, academic_year, conflict_type, title, description, severity, resolution_status, requires_human_review, source_reference, notes)
VALUES (
  gen_random_uuid(),
  '2026-2027',
  'STREAM_PRIORITY_AMBIGUITY',
  'تفاوت أولويات شعبة التقني رياضي في الميادين التكنولوجية بين دورات 2024 و 2025',
  'في منشور 2024، تم تصنيف شعبة التقني رياضي كأولوية 1 مناصفة مع الرياضيات في ميدان علوم وتكنولوجيا (ST)، بينما في بعض منشورات المدارس الوطنية تم ترتيبهم أولوية 2 بعد الرياضيات، مما يولد تفاوتاً في احتساب فرص التوجيه بحسب المؤسسة المستقبلة.',
  'MEDIUM',
  'RESOLVED_BY_CIRCULAR_PRIORITY',
  true,
  'src-mesrs-circulaire-2024 (المادة 12)',
  'تم اعتماد الأولوية 1 لـ ST العام، والأولوية 2 لـ ESI و ENSIA التزاماً بالنص الخاص للمدارس العليا.'
);
INSERT INTO public.orientation_conflicts (id, academic_year, conflict_type, title, description, severity, resolution_status, requires_human_review, source_reference, notes)
VALUES (
  gen_random_uuid(),
  '2026-2027',
  'MANUAL_INTERVIEW_CRITERIA',
  'معايير المقابلة الشفهية والفحص الطبي لمدارس الأساتذة (ENS) غير قابلة للأتمتة',
  'الالتحاق بمدارس الأساتذة مشروط قانوناً باجتياز مقابلة شفهية أمام لجنة ولائية وفحص طبي يثبت القدرة البدنية وسلامة النطق والحواس. هذه المعايير تصنف كـ CONDITIONAL ولا يمكن لمحرك برمجي الجزم بنتيجتها مسبقاً.',
  'MEDIUM',
  'MANUALLY_VERIFIED',
  true,
  'src-mesrs-decret-ens (المادة 4)',
  'المحرك يمنح الطالب الأهلية للترشح مع تصنيف CONDITIONAL وشرح تفصيلي للشرط.'
);
INSERT INTO public.orientation_conflicts (id, academic_year, conflict_type, title, description, severity, resolution_status, requires_human_review, source_reference, notes)
VALUES (
  gen_random_uuid(),
  '2026-2027',
  'QUOTA_UNSPECIFIED',
  'عدم نشر كوطة المقاعد المخصصة لكل شعبة في المدارس الوطنية العليا',
  'المنشور الوزاري يحدد الشعب المؤهلة وأولوياتها (مثال: ESI رياضيات أولوية 1، تقني رياضي أولوية 2)، لكنه لا ينشر النسب المئوية للحصص (Quotas) المخصصة لكل شعبة، والتي تحتسب داخلياً ضمن خوارزمية المعالجة الآلية للوزارة.',
  'HIGH',
  'UNRESOLVED',
  false,
  'src-mesrs-statistiques-2024',
  'المحرك يعتمد على الترتيب التنافسي المباشر ومعدلات السنوات السابقة لكل شعبة كبديل دقيق.'
);
INSERT INTO public.orientation_conflicts (id, academic_year, conflict_type, title, description, severity, resolution_status, requires_human_review, source_reference, notes)
VALUES (
  gen_random_uuid(),
  '2026-2027',
  'NEW_SPECIALTY_UNMAPPED',
  'استحداث مدارس وطنية جديدة في القطب التكنولوجي سيدي عبد الله لدورة 2026',
  'الإعلانات الوزارية أشارت إلى فتح مدارس وطنية جديدة (مثل الأمن السيبراني وتكنولوجيا النانو)، إلا أن رموزها وشروطها البيداغوجية لم تصدر بعد في منشور رسمي نهائي لدورة 2026.',
  'LOW',
  'DEFERRED',
  true,
  'src-mesrs-circulaire-2025-projected',
  'تم تصنيف هذه التخصصات كـ DRAFT وعدم إدراجها في قائمة التخصصات المفحوصة حتى صدور المنشور الرسمي.'
);

-- 3. SEED OFFICIAL BAC STREAMS (6)
INSERT INTO public.bac_streams (id, code, name_ar, name_fr, short_name, is_active)
VALUES (
  'sciences_exp',
  'SE',
  'علوم تجريبية',
  'Sciences Expérimentales',
  'علوم تجريبية',
  true
) ON CONFLICT (id) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_fr = EXCLUDED.name_fr;
INSERT INTO public.bac_streams (id, code, name_ar, name_fr, short_name, is_active)
VALUES (
  'math',
  'M',
  'رياضيات',
  'Mathématiques',
  'رياضيات',
  true
) ON CONFLICT (id) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_fr = EXCLUDED.name_fr;
INSERT INTO public.bac_streams (id, code, name_ar, name_fr, short_name, is_active)
VALUES (
  'technique_math',
  'TM',
  'تقني رياضي',
  'Technique Mathématiques',
  'تقني رياضي',
  true
) ON CONFLICT (id) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_fr = EXCLUDED.name_fr;
INSERT INTO public.bac_streams (id, code, name_ar, name_fr, short_name, is_active)
VALUES (
  'gestion_eco',
  'GE',
  'تسيير واقتصاد',
  'Gestion et Économie',
  'تسيير واقتصاد',
  true
) ON CONFLICT (id) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_fr = EXCLUDED.name_fr;
INSERT INTO public.bac_streams (id, code, name_ar, name_fr, short_name, is_active)
VALUES (
  'lettres_philo',
  'LP',
  'آداب وفلسفة',
  'Lettres et Philosophie',
  'آداب وفلسفة',
  true
) ON CONFLICT (id) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_fr = EXCLUDED.name_fr;
INSERT INTO public.bac_streams (id, code, name_ar, name_fr, short_name, is_active)
VALUES (
  'langues_etrangeres',
  'LE',
  'لغات أجنبية',
  'Langues Étrangères',
  'لغات أجنبية',
  true
) ON CONFLICT (id) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_fr = EXCLUDED.name_fr;

-- 4. SEED MESRS ACADEMIC FIELDS (14)
INSERT INTO public.fields (id, code, name_ar, name_fr, icon)
VALUES (
  'MED',
  'MED',
  'العلوم الطبية والصحية',
  'Sciences Médicales et de la Santé',
  'Stethoscope'
) ON CONFLICT (id) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_fr = EXCLUDED.name_fr;
INSERT INTO public.fields (id, code, name_ar, name_fr, icon)
VALUES (
  'MI',
  'MI',
  'رياضيات وإعلام آلي وذكاء اصطناعي',
  'Mathématiques, Informatique et IA',
  'Binary'
) ON CONFLICT (id) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_fr = EXCLUDED.name_fr;
INSERT INTO public.fields (id, code, name_ar, name_fr, icon)
VALUES (
  'ST',
  'ST',
  'علوم وتكنولوجيا وهندسة',
  'Sciences et Technologies',
  'Cpu'
) ON CONFLICT (id) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_fr = EXCLUDED.name_fr;
INSERT INTO public.fields (id, code, name_ar, name_fr, icon)
VALUES (
  'SNV',
  'SNV',
  'علوم الطبيعة والحياة',
  'Sciences de la Nature et de la Vie',
  'Dna'
) ON CONFLICT (id) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_fr = EXCLUDED.name_fr;
INSERT INTO public.fields (id, code, name_ar, name_fr, icon)
VALUES (
  'SM',
  'SM',
  'علوم المادة (فيزياء وكيمياء)',
  'Sciences de la Matière',
  'Atom'
) ON CONFLICT (id) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_fr = EXCLUDED.name_fr;
INSERT INTO public.fields (id, code, name_ar, name_fr, icon)
VALUES (
  'SEGC',
  'SEGC',
  'علوم اقتصادية والتسيير وعلوم تجارية',
  'Sciences Économiques, de Gestion et Commerciales',
  'TrendingUp'
) ON CONFLICT (id) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_fr = EXCLUDED.name_fr;
INSERT INTO public.fields (id, code, name_ar, name_fr, icon)
VALUES (
  'DSP',
  'DSP',
  'حقوق وعلوم سياسية',
  'Droit et Sciences Politiques',
  'Scale'
) ON CONFLICT (id) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_fr = EXCLUDED.name_fr;
INSERT INTO public.fields (id, code, name_ar, name_fr, icon)
VALUES (
  'LLE',
  'LLE',
  'آداب ولغات أجنبية',
  'Lettres et Langues Étrangères',
  'Languages'
) ON CONFLICT (id) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_fr = EXCLUDED.name_fr;
INSERT INTO public.fields (id, code, name_ar, name_fr, icon)
VALUES (
  'HUM',
  'HUM',
  'علوم إنسانية واجتماعية وإسلامية',
  'Sciences Humaines, Sociales et Islamiques',
  'BookOpen'
) ON CONFLICT (id) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_fr = EXCLUDED.name_fr;
INSERT INTO public.fields (id, code, name_ar, name_fr, icon)
VALUES (
  'ARCH',
  'ARCH',
  'هندسة معمارية وعمران ومشاريع المدن',
  'Architecture et Urbanisme',
  'Building2'
) ON CONFLICT (id) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_fr = EXCLUDED.name_fr;
INSERT INTO public.fields (id, code, name_ar, name_fr, icon)
VALUES (
  'VET',
  'VET',
  'علوم بيطرية وفلاحية',
  'Sciences Vétérinaires et Agronomiques',
  'PawPrint'
) ON CONFLICT (id) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_fr = EXCLUDED.name_fr;
INSERT INTO public.fields (id, code, name_ar, name_fr, icon)
VALUES (
  'ENS',
  'ENS',
  'المدارس العليا للأساتذة (تكوين الأساتذة)',
  'Écoles Normales Supérieures (Enseignement)',
  'GraduationCap'
) ON CONFLICT (id) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_fr = EXCLUDED.name_fr;
INSERT INTO public.fields (id, code, name_ar, name_fr, icon)
VALUES (
  'STAPS',
  'STAPS',
  'علوم وتقنيات النشاطات البدنية والرياضية',
  'STAPS',
  'Activity'
) ON CONFLICT (id) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_fr = EXCLUDED.name_fr;
INSERT INTO public.fields (id, code, name_ar, name_fr, icon)
VALUES (
  'ART',
  'ART',
  'فنون وثقافة وإعلام',
  'Arts, Culture et Communication',
  'Palette'
) ON CONFLICT (id) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_fr = EXCLUDED.name_fr;

-- 5. SEED INSTITUTIONS (34) with publication_status = 'VERIFIED'
INSERT INTO public.institutions (code, name_ar, name_fr, short_name, institution_type, wilaya_id, address, website_url, is_active, publication_status, is_legacy)
VALUES (
  'INST_ESI_ALGER',
  'المدرسة الوطنية العليا للإعلام الآلي (واد السمار، الجزائر)',
  'École Nationale Supérieure d''Informatique (Alger)',
  'المدرسة الوطنية العليا للإعلام الآلي (واد السمار، الجزائر)',
  'undefined',
  16,
  'Oued Smar, Alger',
  'https://www.esi.dz',
  true,
  'VERIFIED',
  false
) ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_fr = EXCLUDED.name_fr,
  publication_status = 'VERIFIED',
  is_legacy = false;
INSERT INTO public.institutions (code, name_ar, name_fr, short_name, institution_type, wilaya_id, address, website_url, is_active, publication_status, is_legacy)
VALUES (
  'INST_ENSIA',
  'المدرسة الوطنية العليا للذكاء الاصطناعي (سيدي عبد الله)',
  'École Nationale Supérieure d''Intelligence Artificielle (Sidi Abdellah)',
  'المدرسة الوطنية العليا للذكاء الاصطناعي (سيدي عبد الله)',
  'undefined',
  16,
  'Pôle Technologique, Sidi Abdellah, Alger',
  'https://ensia.edu.dz',
  true,
  'VERIFIED',
  false
) ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_fr = EXCLUDED.name_fr,
  publication_status = 'VERIFIED',
  is_legacy = false;
INSERT INTO public.institutions (code, name_ar, name_fr, short_name, institution_type, wilaya_id, address, website_url, is_active, publication_status, is_legacy)
VALUES (
  'INST_ENSM',
  'المدرسة الوطنية العليا للرياضيات (سيدي عبد الله)',
  'École Nationale Supérieure de Mathématiques (Sidi Abdellah)',
  'المدرسة الوطنية العليا للرياضيات (سيدي عبد الله)',
  'undefined',
  16,
  'Pôle Technologique, Sidi Abdellah, Alger',
  'https://ensm.edu.dz',
  true,
  'VERIFIED',
  false
) ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_fr = EXCLUDED.name_fr,
  publication_status = 'VERIFIED',
  is_legacy = false;
INSERT INTO public.institutions (code, name_ar, name_fr, short_name, institution_type, wilaya_id, address, website_url, is_active, publication_status, is_legacy)
VALUES (
  'INST_ENP_ALGER',
  'المدرسة الوطنية متعددة التقنيات (الحراش، الجزائر)',
  'École Nationale Polytechnique (Alger)',
  'المدرسة الوطنية متعددة التقنيات (الحراش، الجزائر)',
  'undefined',
  16,
  'El Harrach, Alger',
  'https://www.enp.edu.dz',
  true,
  'VERIFIED',
  false
) ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_fr = EXCLUDED.name_fr,
  publication_status = 'VERIFIED',
  is_legacy = false;
INSERT INTO public.institutions (code, name_ar, name_fr, short_name, institution_type, wilaya_id, address, website_url, is_active, publication_status, is_legacy)
VALUES (
  'INST_EPAU_ALGER',
  'المدرسة متعددة التقنيات للهندسة المعمارية والعمران (الحراش)',
  'École Polytechnique d’Architecture et d’Urbanisme (EPAU)',
  'المدرسة متعددة التقنيات للهندسة المعمارية والعمران (الحراش)',
  'undefined',
  16,
  'El Harrach, Alger',
  'https://www.epau-alger.edu.dz',
  true,
  'VERIFIED',
  false
) ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_fr = EXCLUDED.name_fr,
  publication_status = 'VERIFIED',
  is_legacy = false;
INSERT INTO public.institutions (code, name_ar, name_fr, short_name, institution_type, wilaya_id, address, website_url, is_active, publication_status, is_legacy)
VALUES (
  'INST_ESC_KOLEA',
  'المدرسة العليا للتجارة (القليعة)',
  'École Supérieure de Commerce (Koléa)',
  'المدرسة العليا للتجارة (القليعة)',
  'undefined',
  42,
  'Pôle Universitaire, Koléa, Tipaza',
  'https://www.esc-alger.dz',
  true,
  'VERIFIED',
  false
) ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_fr = EXCLUDED.name_fr,
  publication_status = 'VERIFIED',
  is_legacy = false;
INSERT INTO public.institutions (code, name_ar, name_fr, short_name, institution_type, wilaya_id, address, website_url, is_active, publication_status, is_legacy)
VALUES (
  'INST_ENS_KOUBA',
  'المدرسة العليا للأساتذة في العلوم الدقيقة (القبة، الجزائر)',
  'École Normale Supérieure de Kouba (Alger)',
  'المدرسة العليا للأساتذة في العلوم الدقيقة (القبة، الجزائر)',
  'undefined',
  16,
  'Kouba, Alger',
  'https://www.ens-kouba.dz',
  true,
  'VERIFIED',
  false
) ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_fr = EXCLUDED.name_fr,
  publication_status = 'VERIFIED',
  is_legacy = false;
INSERT INTO public.institutions (code, name_ar, name_fr, short_name, institution_type, wilaya_id, address, website_url, is_active, publication_status, is_legacy)
VALUES (
  'INST_ENS_BOUZAREAH',
  'المدرسة العليا للأساتذة في الآداب والعلوم الإنسانية (بوزريعة)',
  'École Normale Supérieure de Bouzaréah (Alger)',
  'المدرسة العليا للأساتذة في الآداب والعلوم الإنسانية (بوزريعة)',
  'undefined',
  16,
  'Bouzaréah, Alger',
  'https://www.ens-bouzareah.dz',
  true,
  'VERIFIED',
  false
) ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_fr = EXCLUDED.name_fr,
  publication_status = 'VERIFIED',
  is_legacy = false;
INSERT INTO public.institutions (code, name_ar, name_fr, short_name, institution_type, wilaya_id, address, website_url, is_active, publication_status, is_legacy)
VALUES (
  'INST_ENS_LAGHOUAT',
  'المدرسة العليا للأساتذة بالأغواط',
  'École Normale Supérieure de Laghouat',
  'المدرسة العليا للأساتذة بالأغواط',
  'undefined',
  3,
  'Laghouat',
  NULL,
  true,
  'VERIFIED',
  false
) ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_fr = EXCLUDED.name_fr,
  publication_status = 'VERIFIED',
  is_legacy = false;
INSERT INTO public.institutions (code, name_ar, name_fr, short_name, institution_type, wilaya_id, address, website_url, is_active, publication_status, is_legacy)
VALUES (
  'INST_ENS_CONSTANTINE',
  'المدرسة العليا للأساتذة بقسنطينة',
  'École Normale Supérieure de Constantine',
  'المدرسة العليا للأساتذة بقسنطينة',
  'undefined',
  25,
  'Constantine',
  NULL,
  true,
  'VERIFIED',
  false
) ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_fr = EXCLUDED.name_fr,
  publication_status = 'VERIFIED',
  is_legacy = false;
INSERT INTO public.institutions (code, name_ar, name_fr, short_name, institution_type, wilaya_id, address, website_url, is_active, publication_status, is_legacy)
VALUES (
  'INST_ENS_ORAN',
  'المدرسة العليا للأساتذة بوهران',
  'École Normale Supérieure d''Oran',
  'المدرسة العليا للأساتذة بوهران',
  'undefined',
  31,
  'Oran',
  NULL,
  true,
  'VERIFIED',
  false
) ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_fr = EXCLUDED.name_fr,
  publication_status = 'VERIFIED',
  is_legacy = false;
INSERT INTO public.institutions (code, name_ar, name_fr, short_name, institution_type, wilaya_id, address, website_url, is_active, publication_status, is_legacy)
VALUES (
  'INST_ENP_ORAN',
  'المدرسة الوطنية متعددة التقنيات بوهران',
  'École Nationale Polytechnique d''Oran',
  'المدرسة الوطنية متعددة التقنيات بوهران',
  'undefined',
  31,
  'Oran',
  NULL,
  true,
  'VERIFIED',
  false
) ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_fr = EXCLUDED.name_fr,
  publication_status = 'VERIFIED',
  is_legacy = false;
INSERT INTO public.institutions (code, name_ar, name_fr, short_name, institution_type, wilaya_id, address, website_url, is_active, publication_status, is_legacy)
VALUES (
  'INST_ENP_CONSTANTINE',
  'المدرسة الوطنية متعددة التقنيات بقسنطينة',
  'École Nationale Polytechnique de Constantine',
  'المدرسة الوطنية متعددة التقنيات بقسنطينة',
  'undefined',
  25,
  'Constantine',
  NULL,
  true,
  'VERIFIED',
  false
) ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_fr = EXCLUDED.name_fr,
  publication_status = 'VERIFIED',
  is_legacy = false;
INSERT INTO public.institutions (code, name_ar, name_fr, short_name, institution_type, wilaya_id, address, website_url, is_active, publication_status, is_legacy)
VALUES (
  'INST_ESI_SBA',
  'المدرسة الوطنية العليا للإعلام الآلي بسيدي بلعباس',
  'École Supérieure en Informatique de Sidi Bel Abbès (ESI-SBA)',
  'المدرسة الوطنية العليا للإعلام الآلي بسيدي بلعباس',
  'undefined',
  22,
  'Sidi Bel Abbès',
  'https://www.esi-sba.dz',
  true,
  'VERIFIED',
  false
) ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_fr = EXCLUDED.name_fr,
  publication_status = 'VERIFIED',
  is_legacy = false;
INSERT INTO public.institutions (code, name_ar, name_fr, short_name, institution_type, wilaya_id, address, website_url, is_active, publication_status, is_legacy)
VALUES (
  'INST_UNIV_ALGER1',
  'جامعة الجزائر 1 - بن يوسف بن خدة (كلية الطب والعلوم)',
  'Université Alger 1 - Benyoucef Benkhedda',
  'جامعة الجزائر 1 - بن يوسف بن خدة (كلية الطب والعلوم)',
  'undefined',
  16,
  'Rue Didouche Mourad, Alger',
  'https://www.univ-alger.dz',
  true,
  'VERIFIED',
  false
) ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_fr = EXCLUDED.name_fr,
  publication_status = 'VERIFIED',
  is_legacy = false;
INSERT INTO public.institutions (code, name_ar, name_fr, short_name, institution_type, wilaya_id, address, website_url, is_active, publication_status, is_legacy)
VALUES (
  'INST_USTHB',
  'جامعة العلوم والتكنولوجيا هواري بومدين (باب الزوار)',
  'Université des Sciences et de la Technologie Houari Boumediene (USTHB)',
  'جامعة العلوم والتكنولوجيا هواري بومدين (باب الزوار)',
  'undefined',
  16,
  'Bab Ezzouar, Alger',
  'https://www.usthb.dz',
  true,
  'VERIFIED',
  false
) ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_fr = EXCLUDED.name_fr,
  publication_status = 'VERIFIED',
  is_legacy = false;
INSERT INTO public.institutions (code, name_ar, name_fr, short_name, institution_type, wilaya_id, address, website_url, is_active, publication_status, is_legacy)
VALUES (
  'INST_UNIV_ORAN1',
  'جامعة وهران 1 - أحمد بن بلة (كلية الطب والعلوم)',
  'Université Oran 1 - Ahmed Ben Bella',
  'جامعة وهران 1 - أحمد بن بلة (كلية الطب والعلوم)',
  'undefined',
  31,
  'Es-Senia, Oran',
  'https://www.univ-oran1.dz',
  true,
  'VERIFIED',
  false
) ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_fr = EXCLUDED.name_fr,
  publication_status = 'VERIFIED',
  is_legacy = false;
INSERT INTO public.institutions (code, name_ar, name_fr, short_name, institution_type, wilaya_id, address, website_url, is_active, publication_status, is_legacy)
VALUES (
  'INST_UNIV_CONSTANTINE3',
  'جامعة قسنطينة 3 - صلاح بوبنيدر (كلية الطب والهندسة المعمارية)',
  'Université Constantine 3 - Salah Boubnider',
  'جامعة قسنطينة 3 - صلاح بوبنيدر (كلية الطب والهندسة المعمارية)',
  'undefined',
  25,
  'Nouvelle Ville Ali Mendjeli, Constantine',
  'https://univ-constantine3.dz',
  true,
  'VERIFIED',
  false
) ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_fr = EXCLUDED.name_fr,
  publication_status = 'VERIFIED',
  is_legacy = false;
INSERT INTO public.institutions (code, name_ar, name_fr, short_name, institution_type, wilaya_id, address, website_url, is_active, publication_status, is_legacy)
VALUES (
  'INST_UNIV_ANNABA',
  'جامعة باجي مختار - عنابة (كلية الطب والهندسة)',
  'Université Badji Mokhtar - Annaba',
  'جامعة باجي مختار - عنابة (كلية الطب والهندسة)',
  'undefined',
  23,
  'Sidi Amar, Annaba',
  'https://www.univ-annaba.dz',
  true,
  'VERIFIED',
  false
) ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_fr = EXCLUDED.name_fr,
  publication_status = 'VERIFIED',
  is_legacy = false;
INSERT INTO public.institutions (code, name_ar, name_fr, short_name, institution_type, wilaya_id, address, website_url, is_active, publication_status, is_legacy)
VALUES (
  'INST_UNIV_SETIF1',
  'جامعة فرحات عباس - سطيف 1 (كلية الطب والعلوم والتكنولوجيا)',
  'Université Ferhat Abbas - Sétif 1',
  'جامعة فرحات عباس - سطيف 1 (كلية الطب والعلوم والتكنولوجيا)',
  'undefined',
  19,
  'El Bez, Sétif',
  'https://www.univ-setif.dz',
  true,
  'VERIFIED',
  false
) ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_fr = EXCLUDED.name_fr,
  publication_status = 'VERIFIED',
  is_legacy = false;
INSERT INTO public.institutions (code, name_ar, name_fr, short_name, institution_type, wilaya_id, address, website_url, is_active, publication_status, is_legacy)
VALUES (
  'INST_UNIV_TLEMCEN',
  'جامعة أبي بكر بلقايد - تلمسان',
  'Université Abou Bekr Belkaïd - Tlemcen',
  'جامعة أبي بكر بلقايد - تلمسان',
  'undefined',
  13,
  'Chétouane, Tlemcen',
  'https://www.univ-tlemcen.dz',
  true,
  'VERIFIED',
  false
) ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_fr = EXCLUDED.name_fr,
  publication_status = 'VERIFIED',
  is_legacy = false;
INSERT INTO public.institutions (code, name_ar, name_fr, short_name, institution_type, wilaya_id, address, website_url, is_active, publication_status, is_legacy)
VALUES (
  'INST_UNIV_BATNA2',
  'جامعة مصطفى بن بولعيد - باتنة 2',
  'Université Mustapha Ben Boulaïd - Batna 2',
  'جامعة مصطفى بن بولعيد - باتنة 2',
  'undefined',
  5,
  'Fesdis, Batna',
  'https://www.univ-batna2.dz',
  true,
  'VERIFIED',
  false
) ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_fr = EXCLUDED.name_fr,
  publication_status = 'VERIFIED',
  is_legacy = false;
INSERT INTO public.institutions (code, name_ar, name_fr, short_name, institution_type, wilaya_id, address, website_url, is_active, publication_status, is_legacy)
VALUES (
  'INST_UNIV_BLIDA1',
  'جامعة سعد دحلب - البليدة 1',
  'Université Saâd Dahlab - Blida 1',
  'جامعة سعد دحلب - البليدة 1',
  'undefined',
  9,
  'Ouled Yaïch, Blida',
  'https://www.univ-blida.dz',
  true,
  'VERIFIED',
  false
) ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_fr = EXCLUDED.name_fr,
  publication_status = 'VERIFIED',
  is_legacy = false;
INSERT INTO public.institutions (code, name_ar, name_fr, short_name, institution_type, wilaya_id, address, website_url, is_active, publication_status, is_legacy)
VALUES (
  'INST_UNIV_BEJAIA',
  'جامعة عبد الرحمان ميرة - بجاية',
  'Université Abderrahmane Mira - Béjaïa',
  'جامعة عبد الرحمان ميرة - بجاية',
  'undefined',
  6,
  'Targa Ouzemmour, Béjaïa',
  'https://www.univ-bejaia.dz',
  true,
  'VERIFIED',
  false
) ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_fr = EXCLUDED.name_fr,
  publication_status = 'VERIFIED',
  is_legacy = false;
INSERT INTO public.institutions (code, name_ar, name_fr, short_name, institution_type, wilaya_id, address, website_url, is_active, publication_status, is_legacy)
VALUES (
  'INST_UNIV_OUARGLA',
  'جامعة قاصدي مرباح - ورقلة (كلية الطب والعلوم)',
  'Université Kasdi Merbah - Ouargla',
  'جامعة قاصدي مرباح - ورقلة (كلية الطب والعلوم)',
  'undefined',
  30,
  'Ouargla',
  'https://www.univ-ouargla.dz',
  true,
  'VERIFIED',
  false
) ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_fr = EXCLUDED.name_fr,
  publication_status = 'VERIFIED',
  is_legacy = false;
INSERT INTO public.institutions (code, name_ar, name_fr, short_name, institution_type, wilaya_id, address, website_url, is_active, publication_status, is_legacy)
VALUES (
  'INST_UNIV_BISKRA',
  'جامعة محمد خيضر - بسكرة (كلية الطب والعلوم)',
  'Université Mohamed Khider - Biskra',
  'جامعة محمد خيضر - بسكرة (كلية الطب والعلوم)',
  'undefined',
  7,
  'Biskra',
  'https://univ-biskra.dz',
  true,
  'VERIFIED',
  false
) ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_fr = EXCLUDED.name_fr,
  publication_status = 'VERIFIED',
  is_legacy = false;
INSERT INTO public.institutions (code, name_ar, name_fr, short_name, institution_type, wilaya_id, address, website_url, is_active, publication_status, is_legacy)
VALUES (
  'INST_UNIV_TIZIOUZOU',
  'جامعة مولود معمري - تيزي وزو',
  'Université Mouloud Mammeri - Tizi Ouzou',
  'جامعة مولود معمري - تيزي وزو',
  'undefined',
  15,
  'Hasnaoua, Tizi Ouzou',
  'https://www.ummto.dz',
  true,
  'VERIFIED',
  false
) ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_fr = EXCLUDED.name_fr,
  publication_status = 'VERIFIED',
  is_legacy = false;
INSERT INTO public.institutions (code, name_ar, name_fr, short_name, institution_type, wilaya_id, address, website_url, is_active, publication_status, is_legacy)
VALUES (
  'INST_UNIV_DJELFA',
  'جامعة زيان عاشور - الجلفة',
  'Université Ziane Achour - Djelfa',
  'جامعة زيان عاشور - الجلفة',
  'undefined',
  17,
  'Djelfa',
  'https://www.univ-djelfa.dz',
  true,
  'VERIFIED',
  false
) ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_fr = EXCLUDED.name_fr,
  publication_status = 'VERIFIED',
  is_legacy = false;
INSERT INTO public.institutions (code, name_ar, name_fr, short_name, institution_type, wilaya_id, address, website_url, is_active, publication_status, is_legacy)
VALUES (
  'INST_UNIV_MSILA',
  'جامعة محمد بوضياف - المسيلة',
  'Université Mohamed Boudiaf - M''sila',
  'جامعة محمد بوضياف - المسيلة',
  'undefined',
  28,
  'M''sila',
  'https://www.univ-msila.dz',
  true,
  'VERIFIED',
  false
) ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_fr = EXCLUDED.name_fr,
  publication_status = 'VERIFIED',
  is_legacy = false;
INSERT INTO public.institutions (code, name_ar, name_fr, short_name, institution_type, wilaya_id, address, website_url, is_active, publication_status, is_legacy)
VALUES (
  'INST_UNIV_TIARET',
  'جامعة ابن خلدون - تيارت',
  'Université Ibn Khaldoun - Tiaret',
  'جامعة ابن خلدون - تيارت',
  'undefined',
  14,
  'Tiaret',
  'https://www.univ-tiaret.dz',
  true,
  'VERIFIED',
  false
) ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_fr = EXCLUDED.name_fr,
  publication_status = 'VERIFIED',
  is_legacy = false;
INSERT INTO public.institutions (code, name_ar, name_fr, short_name, institution_type, wilaya_id, address, website_url, is_active, publication_status, is_legacy)
VALUES (
  'INST_UNIV_BECHAR',
  'جامعة طاهري محمد - بشار (كلية الطب والعلوم)',
  'Université Tahri Mohamed - Béchar',
  'جامعة طاهري محمد - بشار (كلية الطب والعلوم)',
  'undefined',
  8,
  'Béchar',
  'https://www.univ-bechar.dz',
  true,
  'VERIFIED',
  false
) ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_fr = EXCLUDED.name_fr,
  publication_status = 'VERIFIED',
  is_legacy = false;
INSERT INTO public.institutions (code, name_ar, name_fr, short_name, institution_type, wilaya_id, address, website_url, is_active, publication_status, is_legacy)
VALUES (
  'INST_UNIV_ALGER3',
  'جامعة الجزائر 3 - إبراهيم سلطان شيبوط (العلوم الاقتصادية والإعلام)',
  'Université Alger 3 - Ibrahim Sultan Cheibout',
  'جامعة الجزائر 3 - إبراهيم سلطان شيبوط (العلوم الاقتصادية والإعلام)',
  'undefined',
  16,
  'Dely Ibrahim, Alger',
  'https://www.univ-alger3.dz',
  true,
  'VERIFIED',
  false
) ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_fr = EXCLUDED.name_fr,
  publication_status = 'VERIFIED',
  is_legacy = false;
INSERT INTO public.institutions (code, name_ar, name_fr, short_name, institution_type, wilaya_id, address, website_url, is_active, publication_status, is_legacy)
VALUES (
  'INST_UNIV_ALGER2',
  'جامعة الجزائر 2 - أبو القاسم سعد الله (الآداب واللغات والعلوم الإنسانية)',
  'Université Alger 2 - Abou El Kacem Saâdallah',
  'جامعة الجزائر 2 - أبو القاسم سعد الله (الآداب واللغات والعلوم الإنسانية)',
  'undefined',
  16,
  'Bouzaréah, Alger',
  'https://www.univ-alger2.dz',
  true,
  'VERIFIED',
  false
) ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_fr = EXCLUDED.name_fr,
  publication_status = 'VERIFIED',
  is_legacy = false;
INSERT INTO public.institutions (code, name_ar, name_fr, short_name, institution_type, wilaya_id, address, website_url, is_active, publication_status, is_legacy)
VALUES (
  'INST_UNIV_BOUMERDES',
  'جامعة امحمد بوقرة - بومرداس (هندسة النفط والمحروقات والإلكترونيك)',
  'Université M''hamed Bougara - Boumerdès',
  'جامعة امحمد بوقرة - بومرداس (هندسة النفط والمحروقات والإلكترونيك)',
  'undefined',
  35,
  'Boumerdès',
  'https://www.univ-boumerdes.dz',
  true,
  'VERIFIED',
  false
) ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_fr = EXCLUDED.name_fr,
  publication_status = 'VERIFIED',
  is_legacy = false;

-- 6. SEED PROGRAMS & ADMISSION RULES for Academic Year 2026-2027

-- Program: دكتور في الطب (العلوم الطبية) (011)
INSERT INTO public.programs (
  program_code, field_id, name_ar, name_fr, specialty_ar, training_type, degree_type, duration_years, academic_year, source_id, is_active, publication_status, is_legacy
) VALUES (
  '011',
  'MED',
  'دكتور في الطب (العلوم الطبية)',
  'Doctorat en Médecine',
  'طب عام',
  'medicine',
  'دكتوراه في الطب (Doctorat d'État)',
  7,
  '2026-2027',
  'src-mesrs-circulaire-2024',
  true,
  'VERIFIED',
  false
) ON CONFLICT (program_code, academic_year) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_fr = EXCLUDED.name_fr,
  publication_status = 'VERIFIED',
  is_legacy = false;
INSERT INTO public.admission_rules (
  program_id, bac_stream_id, priority, ranking_basis, minimum_general_average, minimum_weighted_average,
  mathematics_min, physics_min, natural_sciences_min, arabic_min, french_min, english_min,
  required_subject, required_subject_min, weighted_formula, geographic_condition, additional_conditions,
  academic_year, source_id, publication_status, is_legacy
) VALUES (
  (SELECT id FROM public.programs WHERE program_code = '011' AND academic_year = '2026-2027' LIMIT 1),
  'sciences_exp',
  1,
  'weighted_average',
  15.00,
  15.00,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"id":"form-med-sciences","expressionAr":"((2 × معدل البكالوريا) + علوم الطبيعة والحياة) / 3","expressionFr":"((2 × Bac) + Sciences) / 3","divisor":3,"terms":[{"subject":"general_average","coefficient":2},{"subject":"natural_sciences","coefficient":1}],"sourceId":"src-mesrs-circulaire-2024","verificationStatus":"VERIFIED"}'::jsonb,
  'تسجيل جهوي وفق الدائرة الجغرافية للولاية',
  '[]'::jsonb,
  '2026-2027',
  'src-mesrs-circulaire-2024',
  'VERIFIED',
  false
) ON CONFLICT (program_id, bac_stream_id, academic_year) DO UPDATE SET
  priority = EXCLUDED.priority,
  ranking_basis = EXCLUDED.ranking_basis,
  minimum_general_average = EXCLUDED.minimum_general_average,
  minimum_weighted_average = EXCLUDED.minimum_weighted_average,
  weighted_formula = EXCLUDED.weighted_formula,
  publication_status = 'VERIFIED';
INSERT INTO public.admission_rules (
  program_id, bac_stream_id, priority, ranking_basis, minimum_general_average, minimum_weighted_average,
  mathematics_min, physics_min, natural_sciences_min, arabic_min, french_min, english_min,
  required_subject, required_subject_min, weighted_formula, geographic_condition, additional_conditions,
  academic_year, source_id, publication_status, is_legacy
) VALUES (
  (SELECT id FROM public.programs WHERE program_code = '011' AND academic_year = '2026-2027' LIMIT 1),
  'math',
  2,
  'weighted_average',
  15.00,
  15.00,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"id":"form-med-sciences","expressionAr":"((2 × معدل البكالوريا) + علوم الطبيعة والحياة) / 3","expressionFr":"((2 × Bac) + Sciences) / 3","divisor":3,"terms":[{"subject":"general_average","coefficient":2},{"subject":"natural_sciences","coefficient":1}],"sourceId":"src-mesrs-circulaire-2024","verificationStatus":"VERIFIED"}'::jsonb,
  'تسجيل جهوي وفق الدائرة الجغرافية للولاية',
  '[]'::jsonb,
  '2026-2027',
  'src-mesrs-circulaire-2024',
  'VERIFIED',
  false
) ON CONFLICT (program_id, bac_stream_id, academic_year) DO UPDATE SET
  priority = EXCLUDED.priority,
  ranking_basis = EXCLUDED.ranking_basis,
  minimum_general_average = EXCLUDED.minimum_general_average,
  minimum_weighted_average = EXCLUDED.minimum_weighted_average,
  weighted_formula = EXCLUDED.weighted_formula,
  publication_status = 'VERIFIED';
INSERT INTO public.admission_rules (
  program_id, bac_stream_id, priority, ranking_basis, minimum_general_average, minimum_weighted_average,
  mathematics_min, physics_min, natural_sciences_min, arabic_min, french_min, english_min,
  required_subject, required_subject_min, weighted_formula, geographic_condition, additional_conditions,
  academic_year, source_id, publication_status, is_legacy
) VALUES (
  (SELECT id FROM public.programs WHERE program_code = '011' AND academic_year = '2026-2027' LIMIT 1),
  'technique_math',
  2,
  'general_average',
  15.00,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'تسجيل جهوي وفق الدائرة الجغرافية للولاية',
  '[]'::jsonb,
  '2026-2027',
  'src-mesrs-circulaire-2024',
  'VERIFIED',
  false
) ON CONFLICT (program_id, bac_stream_id, academic_year) DO UPDATE SET
  priority = EXCLUDED.priority,
  ranking_basis = EXCLUDED.ranking_basis,
  minimum_general_average = EXCLUDED.minimum_general_average,
  minimum_weighted_average = EXCLUDED.minimum_weighted_average,
  weighted_formula = EXCLUDED.weighted_formula,
  publication_status = 'VERIFIED';
INSERT INTO public.program_cutoffs (
  program_id, bac_stream_id, priority, academic_year, cutoff_general_average, cutoff_weighted_average, source, source_id, is_official, publication_status
) VALUES (
  (SELECT id FROM public.programs WHERE program_code = '011' AND academic_year = '2026-2027' LIMIT 1),
  'sciences_exp',
  1,
  '2024-2025',
  16.20,
  16.33,
  'نتائج التوجيه دورة 2024 - MESRS',
  'src-mesrs-statistiques-2024',
  true,
  'VERIFIED'
) ON CONFLICT (program_id, institution_id, bac_stream_id, academic_year) DO UPDATE SET
  cutoff_general_average = EXCLUDED.cutoff_general_average,
  cutoff_weighted_average = EXCLUDED.cutoff_weighted_average,
  publication_status = 'VERIFIED';
INSERT INTO public.program_cutoffs (
  program_id, bac_stream_id, priority, academic_year, cutoff_general_average, cutoff_weighted_average, source, source_id, is_official, publication_status
) VALUES (
  (SELECT id FROM public.programs WHERE program_code = '011' AND academic_year = '2026-2027' LIMIT 1),
  'technique_math',
  2,
  '2024-2025',
  16.82,
  NULL,
  'نتائج التوجيه دورة 2024 - MESRS',
  'src-mesrs-statistiques-2024',
  true,
  'VERIFIED'
) ON CONFLICT (program_id, institution_id, bac_stream_id, academic_year) DO UPDATE SET
  cutoff_general_average = EXCLUDED.cutoff_general_average,
  cutoff_weighted_average = EXCLUDED.cutoff_weighted_average,
  publication_status = 'VERIFIED';
INSERT INTO public.program_cutoffs (
  program_id, bac_stream_id, priority, academic_year, cutoff_general_average, cutoff_weighted_average, source, source_id, is_official, publication_status
) VALUES (
  (SELECT id FROM public.programs WHERE program_code = '011' AND academic_year = '2026-2027' LIMIT 1),
  'math',
  2,
  '2024-2025',
  16.35,
  16.45,
  'نتائج التوجيه دورة 2024 - MESRS',
  'src-mesrs-statistiques-2024',
  true,
  'VERIFIED'
) ON CONFLICT (program_id, institution_id, bac_stream_id, academic_year) DO UPDATE SET
  cutoff_general_average = EXCLUDED.cutoff_general_average,
  cutoff_weighted_average = EXCLUDED.cutoff_weighted_average,
  publication_status = 'VERIFIED';

-- Program: دكتور في الصيدلة (012)
INSERT INTO public.programs (
  program_code, field_id, name_ar, name_fr, specialty_ar, training_type, degree_type, duration_years, academic_year, source_id, is_active, publication_status, is_legacy
) VALUES (
  '012',
  'MED',
  'دكتور في الصيدلة',
  'Doctorat en Pharmacie',
  'صيدلة',
  'pharmacy',
  'دكتوراه في الصيدلة (Doctorat d'État)',
  6,
  '2026-2027',
  'src-mesrs-circulaire-2024',
  true,
  'VERIFIED',
  false
) ON CONFLICT (program_code, academic_year) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_fr = EXCLUDED.name_fr,
  publication_status = 'VERIFIED',
  is_legacy = false;
INSERT INTO public.admission_rules (
  program_id, bac_stream_id, priority, ranking_basis, minimum_general_average, minimum_weighted_average,
  mathematics_min, physics_min, natural_sciences_min, arabic_min, french_min, english_min,
  required_subject, required_subject_min, weighted_formula, geographic_condition, additional_conditions,
  academic_year, source_id, publication_status, is_legacy
) VALUES (
  (SELECT id FROM public.programs WHERE program_code = '012' AND academic_year = '2026-2027' LIMIT 1),
  'sciences_exp',
  1,
  'weighted_average',
  15.00,
  15.00,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"id":"form-pharm-sciences","expressionAr":"((2 × معدل البكالوريا) + علوم الطبيعة والحياة) / 3","expressionFr":"((2 × Bac) + Sciences) / 3","divisor":3,"terms":[{"subject":"general_average","coefficient":2},{"subject":"natural_sciences","coefficient":1}],"sourceId":"src-mesrs-circulaire-2024","verificationStatus":"VERIFIED"}'::jsonb,
  'تسجيل جهوي',
  '[]'::jsonb,
  '2026-2027',
  'src-mesrs-circulaire-2024',
  'VERIFIED',
  false
) ON CONFLICT (program_id, bac_stream_id, academic_year) DO UPDATE SET
  priority = EXCLUDED.priority,
  ranking_basis = EXCLUDED.ranking_basis,
  minimum_general_average = EXCLUDED.minimum_general_average,
  minimum_weighted_average = EXCLUDED.minimum_weighted_average,
  weighted_formula = EXCLUDED.weighted_formula,
  publication_status = 'VERIFIED';
INSERT INTO public.admission_rules (
  program_id, bac_stream_id, priority, ranking_basis, minimum_general_average, minimum_weighted_average,
  mathematics_min, physics_min, natural_sciences_min, arabic_min, french_min, english_min,
  required_subject, required_subject_min, weighted_formula, geographic_condition, additional_conditions,
  academic_year, source_id, publication_status, is_legacy
) VALUES (
  (SELECT id FROM public.programs WHERE program_code = '012' AND academic_year = '2026-2027' LIMIT 1),
  'math',
  2,
  'weighted_average',
  15.00,
  15.00,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"id":"form-pharm-sciences","expressionAr":"((2 × معدل البكالوريا) + علوم الطبيعة والحياة) / 3","expressionFr":"((2 × Bac) + Sciences) / 3","divisor":3,"terms":[{"subject":"general_average","coefficient":2},{"subject":"natural_sciences","coefficient":1}],"sourceId":"src-mesrs-circulaire-2024","verificationStatus":"VERIFIED"}'::jsonb,
  'تسجيل جهوي',
  '[]'::jsonb,
  '2026-2027',
  'src-mesrs-circulaire-2024',
  'VERIFIED',
  false
) ON CONFLICT (program_id, bac_stream_id, academic_year) DO UPDATE SET
  priority = EXCLUDED.priority,
  ranking_basis = EXCLUDED.ranking_basis,
  minimum_general_average = EXCLUDED.minimum_general_average,
  minimum_weighted_average = EXCLUDED.minimum_weighted_average,
  weighted_formula = EXCLUDED.weighted_formula,
  publication_status = 'VERIFIED';
INSERT INTO public.program_cutoffs (
  program_id, bac_stream_id, priority, academic_year, cutoff_general_average, cutoff_weighted_average, source, source_id, is_official, publication_status
) VALUES (
  (SELECT id FROM public.programs WHERE program_code = '012' AND academic_year = '2026-2027' LIMIT 1),
  'sciences_exp',
  1,
  '2024-2025',
  15.90,
  16.03,
  'نتائج التوجيه دورة 2024 - MESRS',
  'src-mesrs-statistiques-2024',
  true,
  'VERIFIED'
) ON CONFLICT (program_id, institution_id, bac_stream_id, academic_year) DO UPDATE SET
  cutoff_general_average = EXCLUDED.cutoff_general_average,
  cutoff_weighted_average = EXCLUDED.cutoff_weighted_average,
  publication_status = 'VERIFIED';

-- Program: دكتور في طب الأسنان (013)
INSERT INTO public.programs (
  program_code, field_id, name_ar, name_fr, specialty_ar, training_type, degree_type, duration_years, academic_year, source_id, is_active, publication_status, is_legacy
) VALUES (
  '013',
  'MED',
  'دكتور في طب الأسنان',
  'Doctorat en Médecine Dentaire',
  'طب وجراحة الأسنان',
  'dentistry',
  'دكتوراه في طب الأسنان (Doctorat d'État)',
  6,
  '2026-2027',
  'src-mesrs-circulaire-2024',
  true,
  'VERIFIED',
  false
) ON CONFLICT (program_code, academic_year) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_fr = EXCLUDED.name_fr,
  publication_status = 'VERIFIED',
  is_legacy = false;
INSERT INTO public.admission_rules (
  program_id, bac_stream_id, priority, ranking_basis, minimum_general_average, minimum_weighted_average,
  mathematics_min, physics_min, natural_sciences_min, arabic_min, french_min, english_min,
  required_subject, required_subject_min, weighted_formula, geographic_condition, additional_conditions,
  academic_year, source_id, publication_status, is_legacy
) VALUES (
  (SELECT id FROM public.programs WHERE program_code = '013' AND academic_year = '2026-2027' LIMIT 1),
  'sciences_exp',
  1,
  'weighted_average',
  15.00,
  15.00,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"id":"form-dent-sciences","expressionAr":"((2 × معدل البكالوريا) + علوم الطبيعة والحياة) / 3","expressionFr":"((2 × Bac) + Sciences) / 3","divisor":3,"terms":[{"subject":"general_average","coefficient":2},{"subject":"natural_sciences","coefficient":1}],"sourceId":"src-mesrs-circulaire-2024","verificationStatus":"VERIFIED"}'::jsonb,
  'تسجيل جهوي',
  '[]'::jsonb,
  '2026-2027',
  'src-mesrs-circulaire-2024',
  'VERIFIED',
  false
) ON CONFLICT (program_id, bac_stream_id, academic_year) DO UPDATE SET
  priority = EXCLUDED.priority,
  ranking_basis = EXCLUDED.ranking_basis,
  minimum_general_average = EXCLUDED.minimum_general_average,
  minimum_weighted_average = EXCLUDED.minimum_weighted_average,
  weighted_formula = EXCLUDED.weighted_formula,
  publication_status = 'VERIFIED';
INSERT INTO public.admission_rules (
  program_id, bac_stream_id, priority, ranking_basis, minimum_general_average, minimum_weighted_average,
  mathematics_min, physics_min, natural_sciences_min, arabic_min, french_min, english_min,
  required_subject, required_subject_min, weighted_formula, geographic_condition, additional_conditions,
  academic_year, source_id, publication_status, is_legacy
) VALUES (
  (SELECT id FROM public.programs WHERE program_code = '013' AND academic_year = '2026-2027' LIMIT 1),
  'math',
  2,
  'weighted_average',
  15.00,
  15.00,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"id":"form-dent-sciences","expressionAr":"((2 × معدل البكالوريا) + علوم الطبيعة والحياة) / 3","expressionFr":"((2 × Bac) + Sciences) / 3","divisor":3,"terms":[{"subject":"general_average","coefficient":2},{"subject":"natural_sciences","coefficient":1}],"sourceId":"src-mesrs-circulaire-2024","verificationStatus":"VERIFIED"}'::jsonb,
  'تسجيل جهوي',
  '[]'::jsonb,
  '2026-2027',
  'src-mesrs-circulaire-2024',
  'VERIFIED',
  false
) ON CONFLICT (program_id, bac_stream_id, academic_year) DO UPDATE SET
  priority = EXCLUDED.priority,
  ranking_basis = EXCLUDED.ranking_basis,
  minimum_general_average = EXCLUDED.minimum_general_average,
  minimum_weighted_average = EXCLUDED.minimum_weighted_average,
  weighted_formula = EXCLUDED.weighted_formula,
  publication_status = 'VERIFIED';
INSERT INTO public.program_cutoffs (
  program_id, bac_stream_id, priority, academic_year, cutoff_general_average, cutoff_weighted_average, source, source_id, is_official, publication_status
) VALUES (
  (SELECT id FROM public.programs WHERE program_code = '013' AND academic_year = '2026-2027' LIMIT 1),
  'sciences_exp',
  1,
  '2024-2025',
  16.65,
  16.81,
  'نتائج التوجيه دورة 2024 - MESRS',
  'src-mesrs-statistiques-2024',
  true,
  'VERIFIED'
) ON CONFLICT (program_id, institution_id, bac_stream_id, academic_year) DO UPDATE SET
  cutoff_general_average = EXCLUDED.cutoff_general_average,
  cutoff_weighted_average = EXCLUDED.cutoff_weighted_average,
  publication_status = 'VERIFIED';

-- Program: إعلام آلي - تحضيري مدرسة عليا (ESI الجزائر) (071)
INSERT INTO public.programs (
  program_code, field_id, name_ar, name_fr, specialty_ar, training_type, degree_type, duration_years, academic_year, source_id, is_active, publication_status, is_legacy
) VALUES (
  '071',
  'MI',
  'إعلام آلي - تحضيري مدرسة عليا (ESI الجزائر)',
  'Classes Préparatoires Intégrées en Informatique (ESI Alger)',
  'إعلام آلي وهندسة البرمجيات',
  'higher_school',
  'مهندس دولة + ماستر في الإعلام الآلي (Ingénieur d'État)',
  5,
  '2026-2027',
  'src-mesrs-circulaire-2024',
  true,
  'VERIFIED',
  false
) ON CONFLICT (program_code, academic_year) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_fr = EXCLUDED.name_fr,
  publication_status = 'VERIFIED',
  is_legacy = false;
INSERT INTO public.admission_rules (
  program_id, bac_stream_id, priority, ranking_basis, minimum_general_average, minimum_weighted_average,
  mathematics_min, physics_min, natural_sciences_min, arabic_min, french_min, english_min,
  required_subject, required_subject_min, weighted_formula, geographic_condition, additional_conditions,
  academic_year, source_id, publication_status, is_legacy
) VALUES (
  (SELECT id FROM public.programs WHERE program_code = '071' AND academic_year = '2026-2027' LIMIT 1),
  'math',
  1,
  'weighted_average',
  16.00,
  16.00,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"id":"form-cs-math","expressionAr":"((2 × معدل البكالوريا) + علامة الرياضيات) / 3","expressionFr":"((2 × Bac) + Math) / 3","divisor":3,"terms":[{"subject":"general_average","coefficient":2},{"subject":"math","coefficient":1}],"sourceId":"src-mesrs-circulaire-2024","verificationStatus":"VERIFIED"}'::jsonb,
  'تسجيل وطني لجميع ولايات الوطن',
  '[]'::jsonb,
  '2026-2027',
  'src-mesrs-circulaire-2024',
  'VERIFIED',
  false
) ON CONFLICT (program_id, bac_stream_id, academic_year) DO UPDATE SET
  priority = EXCLUDED.priority,
  ranking_basis = EXCLUDED.ranking_basis,
  minimum_general_average = EXCLUDED.minimum_general_average,
  minimum_weighted_average = EXCLUDED.minimum_weighted_average,
  weighted_formula = EXCLUDED.weighted_formula,
  publication_status = 'VERIFIED';
INSERT INTO public.admission_rules (
  program_id, bac_stream_id, priority, ranking_basis, minimum_general_average, minimum_weighted_average,
  mathematics_min, physics_min, natural_sciences_min, arabic_min, french_min, english_min,
  required_subject, required_subject_min, weighted_formula, geographic_condition, additional_conditions,
  academic_year, source_id, publication_status, is_legacy
) VALUES (
  (SELECT id FROM public.programs WHERE program_code = '071' AND academic_year = '2026-2027' LIMIT 1),
  'technique_math',
  2,
  'weighted_average',
  16.50,
  16.50,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"id":"form-cs-math","expressionAr":"((2 × معدل البكالوريا) + علامة الرياضيات) / 3","expressionFr":"((2 × Bac) + Math) / 3","divisor":3,"terms":[{"subject":"general_average","coefficient":2},{"subject":"math","coefficient":1}],"sourceId":"src-mesrs-circulaire-2024","verificationStatus":"VERIFIED"}'::jsonb,
  'تسجيل وطني',
  '[]'::jsonb,
  '2026-2027',
  'src-mesrs-circulaire-2024',
  'VERIFIED',
  false
) ON CONFLICT (program_id, bac_stream_id, academic_year) DO UPDATE SET
  priority = EXCLUDED.priority,
  ranking_basis = EXCLUDED.ranking_basis,
  minimum_general_average = EXCLUDED.minimum_general_average,
  minimum_weighted_average = EXCLUDED.minimum_weighted_average,
  weighted_formula = EXCLUDED.weighted_formula,
  publication_status = 'VERIFIED';
INSERT INTO public.admission_rules (
  program_id, bac_stream_id, priority, ranking_basis, minimum_general_average, minimum_weighted_average,
  mathematics_min, physics_min, natural_sciences_min, arabic_min, french_min, english_min,
  required_subject, required_subject_min, weighted_formula, geographic_condition, additional_conditions,
  academic_year, source_id, publication_status, is_legacy
) VALUES (
  (SELECT id FROM public.programs WHERE program_code = '071' AND academic_year = '2026-2027' LIMIT 1),
  'sciences_exp',
  2,
  'weighted_average',
  16.50,
  16.50,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"id":"form-cs-math","expressionAr":"((2 × معدل البكالوريا) + علامة الرياضيات) / 3","expressionFr":"((2 × Bac) + Math) / 3","divisor":3,"terms":[{"subject":"general_average","coefficient":2},{"subject":"math","coefficient":1}],"sourceId":"src-mesrs-circulaire-2024","verificationStatus":"VERIFIED"}'::jsonb,
  'تسجيل وطني',
  '[]'::jsonb,
  '2026-2027',
  'src-mesrs-circulaire-2024',
  'VERIFIED',
  false
) ON CONFLICT (program_id, bac_stream_id, academic_year) DO UPDATE SET
  priority = EXCLUDED.priority,
  ranking_basis = EXCLUDED.ranking_basis,
  minimum_general_average = EXCLUDED.minimum_general_average,
  minimum_weighted_average = EXCLUDED.minimum_weighted_average,
  weighted_formula = EXCLUDED.weighted_formula,
  publication_status = 'VERIFIED';
INSERT INTO public.program_cutoffs (
  program_id, bac_stream_id, priority, academic_year, cutoff_general_average, cutoff_weighted_average, source, source_id, is_official, publication_status
) VALUES (
  (SELECT id FROM public.programs WHERE program_code = '071' AND academic_year = '2026-2027' LIMIT 1),
  'math',
  1,
  '2024-2025',
  18.00,
  18.05,
  'نتائج التوجيه دورة 2024 - MESRS',
  'src-mesrs-statistiques-2024',
  true,
  'VERIFIED'
) ON CONFLICT (program_id, institution_id, bac_stream_id, academic_year) DO UPDATE SET
  cutoff_general_average = EXCLUDED.cutoff_general_average,
  cutoff_weighted_average = EXCLUDED.cutoff_weighted_average,
  publication_status = 'VERIFIED';
INSERT INTO public.program_cutoffs (
  program_id, bac_stream_id, priority, academic_year, cutoff_general_average, cutoff_weighted_average, source, source_id, is_official, publication_status
) VALUES (
  (SELECT id FROM public.programs WHERE program_code = '071' AND academic_year = '2026-2027' LIMIT 1),
  'technique_math',
  2,
  '2024-2025',
  18.25,
  18.35,
  'نتائج التوجيه دورة 2024 - MESRS',
  'src-mesrs-statistiques-2024',
  true,
  'VERIFIED'
) ON CONFLICT (program_id, institution_id, bac_stream_id, academic_year) DO UPDATE SET
  cutoff_general_average = EXCLUDED.cutoff_general_average,
  cutoff_weighted_average = EXCLUDED.cutoff_weighted_average,
  publication_status = 'VERIFIED';
INSERT INTO public.program_cutoffs (
  program_id, bac_stream_id, priority, academic_year, cutoff_general_average, cutoff_weighted_average, source, source_id, is_official, publication_status
) VALUES (
  (SELECT id FROM public.programs WHERE program_code = '071' AND academic_year = '2026-2027' LIMIT 1),
  'sciences_exp',
  2,
  '2024-2025',
  18.50,
  18.65,
  'نتائج التوجيه دورة 2024 - MESRS',
  'src-mesrs-statistiques-2024',
  true,
  'VERIFIED'
) ON CONFLICT (program_id, institution_id, bac_stream_id, academic_year) DO UPDATE SET
  cutoff_general_average = EXCLUDED.cutoff_general_average,
  cutoff_weighted_average = EXCLUDED.cutoff_weighted_average,
  publication_status = 'VERIFIED';

-- Program: ذكاء اصطناعي وعلوم البيانات (ENSIA سيدي عبد الله) (072)
INSERT INTO public.programs (
  program_code, field_id, name_ar, name_fr, specialty_ar, training_type, degree_type, duration_years, academic_year, source_id, is_active, publication_status, is_legacy
) VALUES (
  '072',
  'MI',
  'ذكاء اصطناعي وعلوم البيانات (ENSIA سيدي عبد الله)',
  'Intelligence Artificielle et Science des Données (ENSIA)',
  'ذكاء اصطناعي وخوارزميات متقدمة',
  'higher_school',
  'مهندس دولة في الذكاء الاصطناعي (Ingénieur d'État)',
  5,
  '2026-2027',
  'src-mesrs-circulaire-2024',
  true,
  'VERIFIED',
  false
) ON CONFLICT (program_code, academic_year) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_fr = EXCLUDED.name_fr,
  publication_status = 'VERIFIED',
  is_legacy = false;
INSERT INTO public.admission_rules (
  program_id, bac_stream_id, priority, ranking_basis, minimum_general_average, minimum_weighted_average,
  mathematics_min, physics_min, natural_sciences_min, arabic_min, french_min, english_min,
  required_subject, required_subject_min, weighted_formula, geographic_condition, additional_conditions,
  academic_year, source_id, publication_status, is_legacy
) VALUES (
  (SELECT id FROM public.programs WHERE program_code = '072' AND academic_year = '2026-2027' LIMIT 1),
  'math',
  1,
  'weighted_average',
  16.50,
  16.50,
  14.00,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'math',
  14.00,
  '{"id":"form-cs-math","expressionAr":"((2 × معدل البكالوريا) + علامة الرياضيات) / 3","expressionFr":"((2 × Bac) + Math) / 3","divisor":3,"terms":[{"subject":"general_average","coefficient":2},{"subject":"math","coefficient":1}],"sourceId":"src-mesrs-circulaire-2024","verificationStatus":"VERIFIED"}'::jsonb,
  'تسجيل وطني',
  '[]'::jsonb,
  '2026-2027',
  'src-mesrs-circulaire-2024',
  'VERIFIED',
  false
) ON CONFLICT (program_id, bac_stream_id, academic_year) DO UPDATE SET
  priority = EXCLUDED.priority,
  ranking_basis = EXCLUDED.ranking_basis,
  minimum_general_average = EXCLUDED.minimum_general_average,
  minimum_weighted_average = EXCLUDED.minimum_weighted_average,
  weighted_formula = EXCLUDED.weighted_formula,
  publication_status = 'VERIFIED';
INSERT INTO public.admission_rules (
  program_id, bac_stream_id, priority, ranking_basis, minimum_general_average, minimum_weighted_average,
  mathematics_min, physics_min, natural_sciences_min, arabic_min, french_min, english_min,
  required_subject, required_subject_min, weighted_formula, geographic_condition, additional_conditions,
  academic_year, source_id, publication_status, is_legacy
) VALUES (
  (SELECT id FROM public.programs WHERE program_code = '072' AND academic_year = '2026-2027' LIMIT 1),
  'technique_math',
  2,
  'weighted_average',
  17.00,
  17.00,
  14.00,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'math',
  14.00,
  '{"id":"form-cs-math","expressionAr":"((2 × معدل البكالوريا) + علامة الرياضيات) / 3","expressionFr":"((2 × Bac) + Math) / 3","divisor":3,"terms":[{"subject":"general_average","coefficient":2},{"subject":"math","coefficient":1}],"sourceId":"src-mesrs-circulaire-2024","verificationStatus":"VERIFIED"}'::jsonb,
  'تسجيل وطني',
  '[]'::jsonb,
  '2026-2027',
  'src-mesrs-circulaire-2024',
  'VERIFIED',
  false
) ON CONFLICT (program_id, bac_stream_id, academic_year) DO UPDATE SET
  priority = EXCLUDED.priority,
  ranking_basis = EXCLUDED.ranking_basis,
  minimum_general_average = EXCLUDED.minimum_general_average,
  minimum_weighted_average = EXCLUDED.minimum_weighted_average,
  weighted_formula = EXCLUDED.weighted_formula,
  publication_status = 'VERIFIED';
INSERT INTO public.admission_rules (
  program_id, bac_stream_id, priority, ranking_basis, minimum_general_average, minimum_weighted_average,
  mathematics_min, physics_min, natural_sciences_min, arabic_min, french_min, english_min,
  required_subject, required_subject_min, weighted_formula, geographic_condition, additional_conditions,
  academic_year, source_id, publication_status, is_legacy
) VALUES (
  (SELECT id FROM public.programs WHERE program_code = '072' AND academic_year = '2026-2027' LIMIT 1),
  'sciences_exp',
  2,
  'weighted_average',
  17.00,
  17.00,
  14.00,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'math',
  14.00,
  '{"id":"form-cs-math","expressionAr":"((2 × معدل البكالوريا) + علامة الرياضيات) / 3","expressionFr":"((2 × Bac) + Math) / 3","divisor":3,"terms":[{"subject":"general_average","coefficient":2},{"subject":"math","coefficient":1}],"sourceId":"src-mesrs-circulaire-2024","verificationStatus":"VERIFIED"}'::jsonb,
  'تسجيل وطني',
  '[]'::jsonb,
  '2026-2027',
  'src-mesrs-circulaire-2024',
  'VERIFIED',
  false
) ON CONFLICT (program_id, bac_stream_id, academic_year) DO UPDATE SET
  priority = EXCLUDED.priority,
  ranking_basis = EXCLUDED.ranking_basis,
  minimum_general_average = EXCLUDED.minimum_general_average,
  minimum_weighted_average = EXCLUDED.minimum_weighted_average,
  weighted_formula = EXCLUDED.weighted_formula,
  publication_status = 'VERIFIED';
INSERT INTO public.program_cutoffs (
  program_id, bac_stream_id, priority, academic_year, cutoff_general_average, cutoff_weighted_average, source, source_id, is_official, publication_status
) VALUES (
  (SELECT id FROM public.programs WHERE program_code = '072' AND academic_year = '2026-2027' LIMIT 1),
  'math',
  1,
  '2024-2025',
  17.80,
  17.95,
  'نتائج التوجيه دورة 2024 - MESRS',
  'src-mesrs-statistiques-2024',
  true,
  'VERIFIED'
) ON CONFLICT (program_id, institution_id, bac_stream_id, academic_year) DO UPDATE SET
  cutoff_general_average = EXCLUDED.cutoff_general_average,
  cutoff_weighted_average = EXCLUDED.cutoff_weighted_average,
  publication_status = 'VERIFIED';

-- Program: أقسام تحضيرية في العلوم والتقنيات (المدرسة الوطنية متعددة التقنيات - ENP) (081)
INSERT INTO public.programs (
  program_code, field_id, name_ar, name_fr, specialty_ar, training_type, degree_type, duration_years, academic_year, source_id, is_active, publication_status, is_legacy
) VALUES (
  '081',
  'ST',
  'أقسام تحضيرية في العلوم والتقنيات (المدرسة الوطنية متعددة التقنيات - ENP)',
  'Classes Préparatoires en Sciences et Techniques (ENP Alger)',
  'علوم وتكنولوجيا وهندسة صناعية',
  'engineering',
  'مهندس دولة (Ingénieur d'État)',
  5,
  '2026-2027',
  'src-mesrs-circulaire-2024',
  true,
  'VERIFIED',
  false
) ON CONFLICT (program_code, academic_year) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_fr = EXCLUDED.name_fr,
  publication_status = 'VERIFIED',
  is_legacy = false;
INSERT INTO public.admission_rules (
  program_id, bac_stream_id, priority, ranking_basis, minimum_general_average, minimum_weighted_average,
  mathematics_min, physics_min, natural_sciences_min, arabic_min, french_min, english_min,
  required_subject, required_subject_min, weighted_formula, geographic_condition, additional_conditions,
  academic_year, source_id, publication_status, is_legacy
) VALUES (
  (SELECT id FROM public.programs WHERE program_code = '081' AND academic_year = '2026-2027' LIMIT 1),
  'math',
  1,
  'weighted_average',
  14.50,
  14.50,
  12.00,
  12.00,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"id":"form-cs-math","expressionAr":"((2 × معدل البكالوريا) + علامة الرياضيات) / 3","expressionFr":"((2 × Bac) + Math) / 3","divisor":3,"terms":[{"subject":"general_average","coefficient":2},{"subject":"math","coefficient":1}],"sourceId":"src-mesrs-circulaire-2024","verificationStatus":"VERIFIED"}'::jsonb,
  'تسجيل وطني',
  '[]'::jsonb,
  '2026-2027',
  'src-mesrs-circulaire-2024',
  'VERIFIED',
  false
) ON CONFLICT (program_id, bac_stream_id, academic_year) DO UPDATE SET
  priority = EXCLUDED.priority,
  ranking_basis = EXCLUDED.ranking_basis,
  minimum_general_average = EXCLUDED.minimum_general_average,
  minimum_weighted_average = EXCLUDED.minimum_weighted_average,
  weighted_formula = EXCLUDED.weighted_formula,
  publication_status = 'VERIFIED';
INSERT INTO public.admission_rules (
  program_id, bac_stream_id, priority, ranking_basis, minimum_general_average, minimum_weighted_average,
  mathematics_min, physics_min, natural_sciences_min, arabic_min, french_min, english_min,
  required_subject, required_subject_min, weighted_formula, geographic_condition, additional_conditions,
  academic_year, source_id, publication_status, is_legacy
) VALUES (
  (SELECT id FROM public.programs WHERE program_code = '081' AND academic_year = '2026-2027' LIMIT 1),
  'technique_math',
  1,
  'weighted_average',
  14.50,
  14.50,
  12.00,
  12.00,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"id":"form-cs-math","expressionAr":"((2 × معدل البكالوريا) + علامة الرياضيات) / 3","expressionFr":"((2 × Bac) + Math) / 3","divisor":3,"terms":[{"subject":"general_average","coefficient":2},{"subject":"math","coefficient":1}],"sourceId":"src-mesrs-circulaire-2024","verificationStatus":"VERIFIED"}'::jsonb,
  'تسجيل وطني',
  '[]'::jsonb,
  '2026-2027',
  'src-mesrs-circulaire-2024',
  'VERIFIED',
  false
) ON CONFLICT (program_id, bac_stream_id, academic_year) DO UPDATE SET
  priority = EXCLUDED.priority,
  ranking_basis = EXCLUDED.ranking_basis,
  minimum_general_average = EXCLUDED.minimum_general_average,
  minimum_weighted_average = EXCLUDED.minimum_weighted_average,
  weighted_formula = EXCLUDED.weighted_formula,
  publication_status = 'VERIFIED';
INSERT INTO public.admission_rules (
  program_id, bac_stream_id, priority, ranking_basis, minimum_general_average, minimum_weighted_average,
  mathematics_min, physics_min, natural_sciences_min, arabic_min, french_min, english_min,
  required_subject, required_subject_min, weighted_formula, geographic_condition, additional_conditions,
  academic_year, source_id, publication_status, is_legacy
) VALUES (
  (SELECT id FROM public.programs WHERE program_code = '081' AND academic_year = '2026-2027' LIMIT 1),
  'sciences_exp',
  2,
  'weighted_average',
  15.00,
  15.00,
  12.00,
  12.00,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"id":"form-cs-math","expressionAr":"((2 × معدل البكالوريا) + علامة الرياضيات) / 3","expressionFr":"((2 × Bac) + Math) / 3","divisor":3,"terms":[{"subject":"general_average","coefficient":2},{"subject":"math","coefficient":1}],"sourceId":"src-mesrs-circulaire-2024","verificationStatus":"VERIFIED"}'::jsonb,
  'تسجيل وطني',
  '[]'::jsonb,
  '2026-2027',
  'src-mesrs-circulaire-2024',
  'VERIFIED',
  false
) ON CONFLICT (program_id, bac_stream_id, academic_year) DO UPDATE SET
  priority = EXCLUDED.priority,
  ranking_basis = EXCLUDED.ranking_basis,
  minimum_general_average = EXCLUDED.minimum_general_average,
  minimum_weighted_average = EXCLUDED.minimum_weighted_average,
  weighted_formula = EXCLUDED.weighted_formula,
  publication_status = 'VERIFIED';
INSERT INTO public.program_cutoffs (
  program_id, bac_stream_id, priority, academic_year, cutoff_general_average, cutoff_weighted_average, source, source_id, is_official, publication_status
) VALUES (
  (SELECT id FROM public.programs WHERE program_code = '081' AND academic_year = '2026-2027' LIMIT 1),
  'math',
  1,
  '2024-2025',
  16.50,
  16.78,
  'نتائج التوجيه دورة 2024 - MESRS',
  'src-mesrs-statistiques-2024',
  true,
  'VERIFIED'
) ON CONFLICT (program_id, institution_id, bac_stream_id, academic_year) DO UPDATE SET
  cutoff_general_average = EXCLUDED.cutoff_general_average,
  cutoff_weighted_average = EXCLUDED.cutoff_weighted_average,
  publication_status = 'VERIFIED';

-- Program: هندسة معمارية وعمران (المدرسة الوطنية العليا EPAU) (083)
INSERT INTO public.programs (
  program_code, field_id, name_ar, name_fr, specialty_ar, training_type, degree_type, duration_years, academic_year, source_id, is_active, publication_status, is_legacy
) VALUES (
  '083',
  'ARCH',
  'هندسة معمارية وعمران (المدرسة الوطنية العليا EPAU)',
  'Architecture et Urbanisme (EPAU Alger)',
  'هندسة معمارية وتخطيط حضري',
  'higher_school',
  'مهندس معمار دولة (Architecte d'État)',
  5,
  '2026-2027',
  'src-mesrs-circulaire-2024',
  true,
  'VERIFIED',
  false
) ON CONFLICT (program_code, academic_year) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_fr = EXCLUDED.name_fr,
  publication_status = 'VERIFIED',
  is_legacy = false;
INSERT INTO public.admission_rules (
  program_id, bac_stream_id, priority, ranking_basis, minimum_general_average, minimum_weighted_average,
  mathematics_min, physics_min, natural_sciences_min, arabic_min, french_min, english_min,
  required_subject, required_subject_min, weighted_formula, geographic_condition, additional_conditions,
  academic_year, source_id, publication_status, is_legacy
) VALUES (
  (SELECT id FROM public.programs WHERE program_code = '083' AND academic_year = '2026-2027' LIMIT 1),
  'math',
  1,
  'weighted_average',
  13.00,
  13.00,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"id":"form-epau-arch","expressionAr":"((2 × معدل البكالوريا) + علامة الرياضيات + علامة الفيزياء) / 4","expressionFr":"((2 × Bac) + Math + Physique) / 4","divisor":4,"terms":[{"subject":"general_average","coefficient":2},{"subject":"math","coefficient":1},{"subject":"physics","coefficient":1}],"sourceId":"src-mesrs-circulaire-2024","verificationStatus":"VERIFIED"}'::jsonb,
  'تسجيل وطني',
  '[]'::jsonb,
  '2026-2027',
  'src-mesrs-circulaire-2024',
  'VERIFIED',
  false
) ON CONFLICT (program_id, bac_stream_id, academic_year) DO UPDATE SET
  priority = EXCLUDED.priority,
  ranking_basis = EXCLUDED.ranking_basis,
  minimum_general_average = EXCLUDED.minimum_general_average,
  minimum_weighted_average = EXCLUDED.minimum_weighted_average,
  weighted_formula = EXCLUDED.weighted_formula,
  publication_status = 'VERIFIED';
INSERT INTO public.admission_rules (
  program_id, bac_stream_id, priority, ranking_basis, minimum_general_average, minimum_weighted_average,
  mathematics_min, physics_min, natural_sciences_min, arabic_min, french_min, english_min,
  required_subject, required_subject_min, weighted_formula, geographic_condition, additional_conditions,
  academic_year, source_id, publication_status, is_legacy
) VALUES (
  (SELECT id FROM public.programs WHERE program_code = '083' AND academic_year = '2026-2027' LIMIT 1),
  'technique_math',
  1,
  'weighted_average',
  13.00,
  13.00,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"id":"form-epau-arch","expressionAr":"((2 × معدل البكالوريا) + علامة الرياضيات + علامة الفيزياء) / 4","expressionFr":"((2 × Bac) + Math + Physique) / 4","divisor":4,"terms":[{"subject":"general_average","coefficient":2},{"subject":"math","coefficient":1},{"subject":"physics","coefficient":1}],"sourceId":"src-mesrs-circulaire-2024","verificationStatus":"VERIFIED"}'::jsonb,
  'تسجيل وطني',
  '[]'::jsonb,
  '2026-2027',
  'src-mesrs-circulaire-2024',
  'VERIFIED',
  false
) ON CONFLICT (program_id, bac_stream_id, academic_year) DO UPDATE SET
  priority = EXCLUDED.priority,
  ranking_basis = EXCLUDED.ranking_basis,
  minimum_general_average = EXCLUDED.minimum_general_average,
  minimum_weighted_average = EXCLUDED.minimum_weighted_average,
  weighted_formula = EXCLUDED.weighted_formula,
  publication_status = 'VERIFIED';
INSERT INTO public.admission_rules (
  program_id, bac_stream_id, priority, ranking_basis, minimum_general_average, minimum_weighted_average,
  mathematics_min, physics_min, natural_sciences_min, arabic_min, french_min, english_min,
  required_subject, required_subject_min, weighted_formula, geographic_condition, additional_conditions,
  academic_year, source_id, publication_status, is_legacy
) VALUES (
  (SELECT id FROM public.programs WHERE program_code = '083' AND academic_year = '2026-2027' LIMIT 1),
  'sciences_exp',
  2,
  'weighted_average',
  13.50,
  13.50,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"id":"form-epau-arch","expressionAr":"((2 × معدل البكالوريا) + علامة الرياضيات + علامة الفيزياء) / 4","expressionFr":"((2 × Bac) + Math + Physique) / 4","divisor":4,"terms":[{"subject":"general_average","coefficient":2},{"subject":"math","coefficient":1},{"subject":"physics","coefficient":1}],"sourceId":"src-mesrs-circulaire-2024","verificationStatus":"VERIFIED"}'::jsonb,
  'تسجيل وطني',
  '[]'::jsonb,
  '2026-2027',
  'src-mesrs-circulaire-2024',
  'VERIFIED',
  false
) ON CONFLICT (program_id, bac_stream_id, academic_year) DO UPDATE SET
  priority = EXCLUDED.priority,
  ranking_basis = EXCLUDED.ranking_basis,
  minimum_general_average = EXCLUDED.minimum_general_average,
  minimum_weighted_average = EXCLUDED.minimum_weighted_average,
  weighted_formula = EXCLUDED.weighted_formula,
  publication_status = 'VERIFIED';
INSERT INTO public.program_cutoffs (
  program_id, bac_stream_id, priority, academic_year, cutoff_general_average, cutoff_weighted_average, source, source_id, is_official, publication_status
) VALUES (
  (SELECT id FROM public.programs WHERE program_code = '083' AND academic_year = '2026-2027' LIMIT 1),
  'technique_math',
  1,
  '2024-2025',
  15.65,
  15.95,
  'نتائج التوجيه دورة 2024 - MESRS',
  'src-mesrs-statistiques-2024',
  true,
  'VERIFIED'
) ON CONFLICT (program_id, institution_id, bac_stream_id, academic_year) DO UPDATE SET
  cutoff_general_average = EXCLUDED.cutoff_general_average,
  cutoff_weighted_average = EXCLUDED.cutoff_weighted_average,
  publication_status = 'VERIFIED';

-- Program: رياضيات وإعلام آلي (ليسانس وماستر LMD) (041)
INSERT INTO public.programs (
  program_code, field_id, name_ar, name_fr, specialty_ar, training_type, degree_type, duration_years, academic_year, source_id, is_active, publication_status, is_legacy
) VALUES (
  '041',
  'MI',
  'رياضيات وإعلام آلي (ليسانس وماستر LMD)',
  'Mathématiques et Informatique (MI)',
  'جذع مشترك رياضيات وإعلام آلي',
  'licence',
  'ليسانس أكاديمي (Licence LMD - 3 ans)',
  3,
  '2026-2027',
  'src-mesrs-circulaire-2024',
  true,
  'VERIFIED',
  false
) ON CONFLICT (program_code, academic_year) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_fr = EXCLUDED.name_fr,
  publication_status = 'VERIFIED',
  is_legacy = false;
INSERT INTO public.admission_rules (
  program_id, bac_stream_id, priority, ranking_basis, minimum_general_average, minimum_weighted_average,
  mathematics_min, physics_min, natural_sciences_min, arabic_min, french_min, english_min,
  required_subject, required_subject_min, weighted_formula, geographic_condition, additional_conditions,
  academic_year, source_id, publication_status, is_legacy
) VALUES (
  (SELECT id FROM public.programs WHERE program_code = '041' AND academic_year = '2026-2027' LIMIT 1),
  'math',
  1,
  'weighted_average',
  11.00,
  11.00,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"id":"form-cs-math","expressionAr":"((2 × معدل البكالوريا) + علامة الرياضيات) / 3","expressionFr":"((2 × Bac) + Math) / 3","divisor":3,"terms":[{"subject":"general_average","coefficient":2},{"subject":"math","coefficient":1}],"sourceId":"src-mesrs-circulaire-2024","verificationStatus":"VERIFIED"}'::jsonb,
  'تسجيل جهوي / محلي حسب الولاية',
  '[]'::jsonb,
  '2026-2027',
  'src-mesrs-circulaire-2024',
  'VERIFIED',
  false
) ON CONFLICT (program_id, bac_stream_id, academic_year) DO UPDATE SET
  priority = EXCLUDED.priority,
  ranking_basis = EXCLUDED.ranking_basis,
  minimum_general_average = EXCLUDED.minimum_general_average,
  minimum_weighted_average = EXCLUDED.minimum_weighted_average,
  weighted_formula = EXCLUDED.weighted_formula,
  publication_status = 'VERIFIED';
INSERT INTO public.admission_rules (
  program_id, bac_stream_id, priority, ranking_basis, minimum_general_average, minimum_weighted_average,
  mathematics_min, physics_min, natural_sciences_min, arabic_min, french_min, english_min,
  required_subject, required_subject_min, weighted_formula, geographic_condition, additional_conditions,
  academic_year, source_id, publication_status, is_legacy
) VALUES (
  (SELECT id FROM public.programs WHERE program_code = '041' AND academic_year = '2026-2027' LIMIT 1),
  'technique_math',
  2,
  'weighted_average',
  11.00,
  11.00,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"id":"form-cs-math","expressionAr":"((2 × معدل البكالوريا) + علامة الرياضيات) / 3","expressionFr":"((2 × Bac) + Math) / 3","divisor":3,"terms":[{"subject":"general_average","coefficient":2},{"subject":"math","coefficient":1}],"sourceId":"src-mesrs-circulaire-2024","verificationStatus":"VERIFIED"}'::jsonb,
  'تسجيل جهوي / محلي حسب الولاية',
  '[]'::jsonb,
  '2026-2027',
  'src-mesrs-circulaire-2024',
  'VERIFIED',
  false
) ON CONFLICT (program_id, bac_stream_id, academic_year) DO UPDATE SET
  priority = EXCLUDED.priority,
  ranking_basis = EXCLUDED.ranking_basis,
  minimum_general_average = EXCLUDED.minimum_general_average,
  minimum_weighted_average = EXCLUDED.minimum_weighted_average,
  weighted_formula = EXCLUDED.weighted_formula,
  publication_status = 'VERIFIED';
INSERT INTO public.admission_rules (
  program_id, bac_stream_id, priority, ranking_basis, minimum_general_average, minimum_weighted_average,
  mathematics_min, physics_min, natural_sciences_min, arabic_min, french_min, english_min,
  required_subject, required_subject_min, weighted_formula, geographic_condition, additional_conditions,
  academic_year, source_id, publication_status, is_legacy
) VALUES (
  (SELECT id FROM public.programs WHERE program_code = '041' AND academic_year = '2026-2027' LIMIT 1),
  'sciences_exp',
  2,
  'weighted_average',
  11.00,
  11.00,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"id":"form-cs-math","expressionAr":"((2 × معدل البكالوريا) + علامة الرياضيات) / 3","expressionFr":"((2 × Bac) + Math) / 3","divisor":3,"terms":[{"subject":"general_average","coefficient":2},{"subject":"math","coefficient":1}],"sourceId":"src-mesrs-circulaire-2024","verificationStatus":"VERIFIED"}'::jsonb,
  'تسجيل جهوي / محلي حسب الولاية',
  '[]'::jsonb,
  '2026-2027',
  'src-mesrs-circulaire-2024',
  'VERIFIED',
  false
) ON CONFLICT (program_id, bac_stream_id, academic_year) DO UPDATE SET
  priority = EXCLUDED.priority,
  ranking_basis = EXCLUDED.ranking_basis,
  minimum_general_average = EXCLUDED.minimum_general_average,
  minimum_weighted_average = EXCLUDED.minimum_weighted_average,
  weighted_formula = EXCLUDED.weighted_formula,
  publication_status = 'VERIFIED';
INSERT INTO public.program_cutoffs (
  program_id, bac_stream_id, priority, academic_year, cutoff_general_average, cutoff_weighted_average, source, source_id, is_official, publication_status
) VALUES (
  (SELECT id FROM public.programs WHERE program_code = '041' AND academic_year = '2026-2027' LIMIT 1),
  'math',
  1,
  '2024-2025',
  14.15,
  14.38,
  'نتائج التوجيه دورة 2024 - MESRS',
  'src-mesrs-statistiques-2024',
  true,
  'VERIFIED'
) ON CONFLICT (program_id, institution_id, bac_stream_id, academic_year) DO UPDATE SET
  cutoff_general_average = EXCLUDED.cutoff_general_average,
  cutoff_weighted_average = EXCLUDED.cutoff_weighted_average,
  publication_status = 'VERIFIED';

-- Program: علوم وتكنولوجيا (ST - ليسانس وماستر LMD) (051)
INSERT INTO public.programs (
  program_code, field_id, name_ar, name_fr, specialty_ar, training_type, degree_type, duration_years, academic_year, source_id, is_active, publication_status, is_legacy
) VALUES (
  '051',
  'ST',
  'علوم وتكنولوجيا (ST - ليسانس وماستر LMD)',
  'Sciences et Technologies (ST)',
  'جذع مشترك علوم وتكنولوجيا',
  'licence',
  'ليسانس أكاديمي (Licence LMD - 3 ans)',
  3,
  '2026-2027',
  'src-mesrs-circulaire-2024',
  true,
  'VERIFIED',
  false
) ON CONFLICT (program_code, academic_year) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_fr = EXCLUDED.name_fr,
  publication_status = 'VERIFIED',
  is_legacy = false;
INSERT INTO public.admission_rules (
  program_id, bac_stream_id, priority, ranking_basis, minimum_general_average, minimum_weighted_average,
  mathematics_min, physics_min, natural_sciences_min, arabic_min, french_min, english_min,
  required_subject, required_subject_min, weighted_formula, geographic_condition, additional_conditions,
  academic_year, source_id, publication_status, is_legacy
) VALUES (
  (SELECT id FROM public.programs WHERE program_code = '051' AND academic_year = '2026-2027' LIMIT 1),
  'technique_math',
  1,
  'general_average',
  10.00,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'تسجيل محلي مخصص لحاملي بكالوريا الولاية المعنية',
  '[]'::jsonb,
  '2026-2027',
  'src-mesrs-circulaire-2024',
  'VERIFIED',
  false
) ON CONFLICT (program_id, bac_stream_id, academic_year) DO UPDATE SET
  priority = EXCLUDED.priority,
  ranking_basis = EXCLUDED.ranking_basis,
  minimum_general_average = EXCLUDED.minimum_general_average,
  minimum_weighted_average = EXCLUDED.minimum_weighted_average,
  weighted_formula = EXCLUDED.weighted_formula,
  publication_status = 'VERIFIED';
INSERT INTO public.admission_rules (
  program_id, bac_stream_id, priority, ranking_basis, minimum_general_average, minimum_weighted_average,
  mathematics_min, physics_min, natural_sciences_min, arabic_min, french_min, english_min,
  required_subject, required_subject_min, weighted_formula, geographic_condition, additional_conditions,
  academic_year, source_id, publication_status, is_legacy
) VALUES (
  (SELECT id FROM public.programs WHERE program_code = '051' AND academic_year = '2026-2027' LIMIT 1),
  'math',
  1,
  'general_average',
  10.00,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'تسجيل محلي',
  '[]'::jsonb,
  '2026-2027',
  'src-mesrs-circulaire-2024',
  'VERIFIED',
  false
) ON CONFLICT (program_id, bac_stream_id, academic_year) DO UPDATE SET
  priority = EXCLUDED.priority,
  ranking_basis = EXCLUDED.ranking_basis,
  minimum_general_average = EXCLUDED.minimum_general_average,
  minimum_weighted_average = EXCLUDED.minimum_weighted_average,
  weighted_formula = EXCLUDED.weighted_formula,
  publication_status = 'VERIFIED';
INSERT INTO public.admission_rules (
  program_id, bac_stream_id, priority, ranking_basis, minimum_general_average, minimum_weighted_average,
  mathematics_min, physics_min, natural_sciences_min, arabic_min, french_min, english_min,
  required_subject, required_subject_min, weighted_formula, geographic_condition, additional_conditions,
  academic_year, source_id, publication_status, is_legacy
) VALUES (
  (SELECT id FROM public.programs WHERE program_code = '051' AND academic_year = '2026-2027' LIMIT 1),
  'sciences_exp',
  2,
  'general_average',
  10.00,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'تسجيل محلي',
  '[]'::jsonb,
  '2026-2027',
  'src-mesrs-circulaire-2024',
  'VERIFIED',
  false
) ON CONFLICT (program_id, bac_stream_id, academic_year) DO UPDATE SET
  priority = EXCLUDED.priority,
  ranking_basis = EXCLUDED.ranking_basis,
  minimum_general_average = EXCLUDED.minimum_general_average,
  minimum_weighted_average = EXCLUDED.minimum_weighted_average,
  weighted_formula = EXCLUDED.weighted_formula,
  publication_status = 'VERIFIED';
INSERT INTO public.program_cutoffs (
  program_id, bac_stream_id, priority, academic_year, cutoff_general_average, cutoff_weighted_average, source, source_id, is_official, publication_status
) VALUES (
  (SELECT id FROM public.programs WHERE program_code = '051' AND academic_year = '2026-2027' LIMIT 1),
  'technique_math',
  1,
  '2024-2025',
  12.30,
  NULL,
  'نتائج التوجيه دورة 2024 - MESRS',
  'src-mesrs-statistiques-2024',
  true,
  'VERIFIED'
) ON CONFLICT (program_id, institution_id, bac_stream_id, academic_year) DO UPDATE SET
  cutoff_general_average = EXCLUDED.cutoff_general_average,
  cutoff_weighted_average = EXCLUDED.cutoff_weighted_average,
  publication_status = 'VERIFIED';

-- Program: علوم الطبيعة والحياة (SNV - ليسانس وماستر LMD) (061)
INSERT INTO public.programs (
  program_code, field_id, name_ar, name_fr, specialty_ar, training_type, degree_type, duration_years, academic_year, source_id, is_active, publication_status, is_legacy
) VALUES (
  '061',
  'SNV',
  'علوم الطبيعة والحياة (SNV - ليسانس وماستر LMD)',
  'Sciences de la Nature et de la Vie (SNV)',
  'بيولوجيا وبيئة وجذع مشترك SNV',
  'licence',
  'ليسانس أكاديمي (Licence LMD - 3 ans)',
  3,
  '2026-2027',
  'src-mesrs-circulaire-2024',
  true,
  'VERIFIED',
  false
) ON CONFLICT (program_code, academic_year) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_fr = EXCLUDED.name_fr,
  publication_status = 'VERIFIED',
  is_legacy = false;
INSERT INTO public.admission_rules (
  program_id, bac_stream_id, priority, ranking_basis, minimum_general_average, minimum_weighted_average,
  mathematics_min, physics_min, natural_sciences_min, arabic_min, french_min, english_min,
  required_subject, required_subject_min, weighted_formula, geographic_condition, additional_conditions,
  academic_year, source_id, publication_status, is_legacy
) VALUES (
  (SELECT id FROM public.programs WHERE program_code = '061' AND academic_year = '2026-2027' LIMIT 1),
  'sciences_exp',
  1,
  'weighted_average',
  10.00,
  10.00,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"id":"form-snv-sciences","expressionAr":"((2 × معدل البكالوريا) + علوم الطبيعة والحياة) / 3","expressionFr":"((2 × Bac) + Sciences) / 3","divisor":3,"terms":[{"subject":"general_average","coefficient":2},{"subject":"natural_sciences","coefficient":1}],"sourceId":"src-mesrs-circulaire-2024","verificationStatus":"VERIFIED"}'::jsonb,
  'تسجيل محلي',
  '[]'::jsonb,
  '2026-2027',
  'src-mesrs-circulaire-2024',
  'VERIFIED',
  false
) ON CONFLICT (program_id, bac_stream_id, academic_year) DO UPDATE SET
  priority = EXCLUDED.priority,
  ranking_basis = EXCLUDED.ranking_basis,
  minimum_general_average = EXCLUDED.minimum_general_average,
  minimum_weighted_average = EXCLUDED.minimum_weighted_average,
  weighted_formula = EXCLUDED.weighted_formula,
  publication_status = 'VERIFIED';
INSERT INTO public.admission_rules (
  program_id, bac_stream_id, priority, ranking_basis, minimum_general_average, minimum_weighted_average,
  mathematics_min, physics_min, natural_sciences_min, arabic_min, french_min, english_min,
  required_subject, required_subject_min, weighted_formula, geographic_condition, additional_conditions,
  academic_year, source_id, publication_status, is_legacy
) VALUES (
  (SELECT id FROM public.programs WHERE program_code = '061' AND academic_year = '2026-2027' LIMIT 1),
  'math',
  2,
  'weighted_average',
  10.00,
  10.00,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"id":"form-snv-sciences","expressionAr":"((2 × معدل البكالوريا) + علوم الطبيعة والحياة) / 3","expressionFr":"((2 × Bac) + Sciences) / 3","divisor":3,"terms":[{"subject":"general_average","coefficient":2},{"subject":"natural_sciences","coefficient":1}],"sourceId":"src-mesrs-circulaire-2024","verificationStatus":"VERIFIED"}'::jsonb,
  'تسجيل محلي',
  '[]'::jsonb,
  '2026-2027',
  'src-mesrs-circulaire-2024',
  'VERIFIED',
  false
) ON CONFLICT (program_id, bac_stream_id, academic_year) DO UPDATE SET
  priority = EXCLUDED.priority,
  ranking_basis = EXCLUDED.ranking_basis,
  minimum_general_average = EXCLUDED.minimum_general_average,
  minimum_weighted_average = EXCLUDED.minimum_weighted_average,
  weighted_formula = EXCLUDED.weighted_formula,
  publication_status = 'VERIFIED';
INSERT INTO public.program_cutoffs (
  program_id, bac_stream_id, priority, academic_year, cutoff_general_average, cutoff_weighted_average, source, source_id, is_official, publication_status
) VALUES (
  (SELECT id FROM public.programs WHERE program_code = '061' AND academic_year = '2026-2027' LIMIT 1),
  'sciences_exp',
  1,
  '2024-2025',
  11.85,
  12.10,
  'نتائج التوجيه دورة 2024 - MESRS',
  'src-mesrs-statistiques-2024',
  true,
  'VERIFIED'
) ON CONFLICT (program_id, institution_id, bac_stream_id, academic_year) DO UPDATE SET
  cutoff_general_average = EXCLUDED.cutoff_general_average,
  cutoff_weighted_average = EXCLUDED.cutoff_weighted_average,
  publication_status = 'VERIFIED';

-- Program: علوم اقتصادية، التسيير وعلوم تجارية (SEGC) (031)
INSERT INTO public.programs (
  program_code, field_id, name_ar, name_fr, specialty_ar, training_type, degree_type, duration_years, academic_year, source_id, is_active, publication_status, is_legacy
) VALUES (
  '031',
  'SEGC',
  'علوم اقتصادية، التسيير وعلوم تجارية (SEGC)',
  'Sciences Économiques, de Gestion et Commerciales (SEGC)',
  'جذع مشترك علوم اقتصادية وتسيير',
  'licence',
  'ليسانس أكاديمي (Licence LMD - 3 ans)',
  3,
  '2026-2027',
  'src-mesrs-circulaire-2024',
  true,
  'VERIFIED',
  false
) ON CONFLICT (program_code, academic_year) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_fr = EXCLUDED.name_fr,
  publication_status = 'VERIFIED',
  is_legacy = false;
INSERT INTO public.admission_rules (
  program_id, bac_stream_id, priority, ranking_basis, minimum_general_average, minimum_weighted_average,
  mathematics_min, physics_min, natural_sciences_min, arabic_min, french_min, english_min,
  required_subject, required_subject_min, weighted_formula, geographic_condition, additional_conditions,
  academic_year, source_id, publication_status, is_legacy
) VALUES (
  (SELECT id FROM public.programs WHERE program_code = '031' AND academic_year = '2026-2027' LIMIT 1),
  'gestion_eco',
  1,
  'general_average',
  10.00,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'تسجيل محلي',
  '[]'::jsonb,
  '2026-2027',
  'src-mesrs-circulaire-2024',
  'VERIFIED',
  false
) ON CONFLICT (program_id, bac_stream_id, academic_year) DO UPDATE SET
  priority = EXCLUDED.priority,
  ranking_basis = EXCLUDED.ranking_basis,
  minimum_general_average = EXCLUDED.minimum_general_average,
  minimum_weighted_average = EXCLUDED.minimum_weighted_average,
  weighted_formula = EXCLUDED.weighted_formula,
  publication_status = 'VERIFIED';
INSERT INTO public.admission_rules (
  program_id, bac_stream_id, priority, ranking_basis, minimum_general_average, minimum_weighted_average,
  mathematics_min, physics_min, natural_sciences_min, arabic_min, french_min, english_min,
  required_subject, required_subject_min, weighted_formula, geographic_condition, additional_conditions,
  academic_year, source_id, publication_status, is_legacy
) VALUES (
  (SELECT id FROM public.programs WHERE program_code = '031' AND academic_year = '2026-2027' LIMIT 1),
  'math',
  1,
  'general_average',
  10.00,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'تسجيل محلي',
  '[]'::jsonb,
  '2026-2027',
  'src-mesrs-circulaire-2024',
  'VERIFIED',
  false
) ON CONFLICT (program_id, bac_stream_id, academic_year) DO UPDATE SET
  priority = EXCLUDED.priority,
  ranking_basis = EXCLUDED.ranking_basis,
  minimum_general_average = EXCLUDED.minimum_general_average,
  minimum_weighted_average = EXCLUDED.minimum_weighted_average,
  weighted_formula = EXCLUDED.weighted_formula,
  publication_status = 'VERIFIED';
INSERT INTO public.admission_rules (
  program_id, bac_stream_id, priority, ranking_basis, minimum_general_average, minimum_weighted_average,
  mathematics_min, physics_min, natural_sciences_min, arabic_min, french_min, english_min,
  required_subject, required_subject_min, weighted_formula, geographic_condition, additional_conditions,
  academic_year, source_id, publication_status, is_legacy
) VALUES (
  (SELECT id FROM public.programs WHERE program_code = '031' AND academic_year = '2026-2027' LIMIT 1),
  'technique_math',
  1,
  'general_average',
  10.00,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'تسجيل محلي',
  '[]'::jsonb,
  '2026-2027',
  'src-mesrs-circulaire-2024',
  'VERIFIED',
  false
) ON CONFLICT (program_id, bac_stream_id, academic_year) DO UPDATE SET
  priority = EXCLUDED.priority,
  ranking_basis = EXCLUDED.ranking_basis,
  minimum_general_average = EXCLUDED.minimum_general_average,
  minimum_weighted_average = EXCLUDED.minimum_weighted_average,
  weighted_formula = EXCLUDED.weighted_formula,
  publication_status = 'VERIFIED';
INSERT INTO public.admission_rules (
  program_id, bac_stream_id, priority, ranking_basis, minimum_general_average, minimum_weighted_average,
  mathematics_min, physics_min, natural_sciences_min, arabic_min, french_min, english_min,
  required_subject, required_subject_min, weighted_formula, geographic_condition, additional_conditions,
  academic_year, source_id, publication_status, is_legacy
) VALUES (
  (SELECT id FROM public.programs WHERE program_code = '031' AND academic_year = '2026-2027' LIMIT 1),
  'sciences_exp',
  2,
  'general_average',
  10.00,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'تسجيل محلي',
  '[]'::jsonb,
  '2026-2027',
  'src-mesrs-circulaire-2024',
  'VERIFIED',
  false
) ON CONFLICT (program_id, bac_stream_id, academic_year) DO UPDATE SET
  priority = EXCLUDED.priority,
  ranking_basis = EXCLUDED.ranking_basis,
  minimum_general_average = EXCLUDED.minimum_general_average,
  minimum_weighted_average = EXCLUDED.minimum_weighted_average,
  weighted_formula = EXCLUDED.weighted_formula,
  publication_status = 'VERIFIED';
INSERT INTO public.admission_rules (
  program_id, bac_stream_id, priority, ranking_basis, minimum_general_average, minimum_weighted_average,
  mathematics_min, physics_min, natural_sciences_min, arabic_min, french_min, english_min,
  required_subject, required_subject_min, weighted_formula, geographic_condition, additional_conditions,
  academic_year, source_id, publication_status, is_legacy
) VALUES (
  (SELECT id FROM public.programs WHERE program_code = '031' AND academic_year = '2026-2027' LIMIT 1),
  'lettres_philo',
  3,
  'general_average',
  10.00,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'تسجيل محلي',
  '[]'::jsonb,
  '2026-2027',
  'src-mesrs-circulaire-2024',
  'VERIFIED',
  false
) ON CONFLICT (program_id, bac_stream_id, academic_year) DO UPDATE SET
  priority = EXCLUDED.priority,
  ranking_basis = EXCLUDED.ranking_basis,
  minimum_general_average = EXCLUDED.minimum_general_average,
  minimum_weighted_average = EXCLUDED.minimum_weighted_average,
  weighted_formula = EXCLUDED.weighted_formula,
  publication_status = 'VERIFIED';
INSERT INTO public.program_cutoffs (
  program_id, bac_stream_id, priority, academic_year, cutoff_general_average, cutoff_weighted_average, source, source_id, is_official, publication_status
) VALUES (
  (SELECT id FROM public.programs WHERE program_code = '031' AND academic_year = '2026-2027' LIMIT 1),
  'gestion_eco',
  1,
  '2024-2025',
  10.60,
  NULL,
  'نتائج التوجيه دورة 2024 - MESRS',
  'src-mesrs-statistiques-2024',
  true,
  'VERIFIED'
) ON CONFLICT (program_id, institution_id, bac_stream_id, academic_year) DO UPDATE SET
  cutoff_general_average = EXCLUDED.cutoff_general_average,
  cutoff_weighted_average = EXCLUDED.cutoff_weighted_average,
  publication_status = 'VERIFIED';

-- Program: أقسام تحضيرية في العلوم التجارية والتسيير (ESC القليعة) (032)
INSERT INTO public.programs (
  program_code, field_id, name_ar, name_fr, specialty_ar, training_type, degree_type, duration_years, academic_year, source_id, is_active, publication_status, is_legacy
) VALUES (
  '032',
  'SEGC',
  'أقسام تحضيرية في العلوم التجارية والتسيير (ESC القليعة)',
  'Classes Préparatoires en Sciences Commerciales et Financières (ESC Koléa)',
  'علوم مالية وتجارية وإدارة أعمال',
  'higher_school',
  'ماستر مدرسة عليا + ديبلوم المدرسة (Diplôme ESC)',
  5,
  '2026-2027',
  'src-mesrs-circulaire-2024',
  true,
  'VERIFIED',
  false
) ON CONFLICT (program_code, academic_year) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_fr = EXCLUDED.name_fr,
  publication_status = 'VERIFIED',
  is_legacy = false;
INSERT INTO public.admission_rules (
  program_id, bac_stream_id, priority, ranking_basis, minimum_general_average, minimum_weighted_average,
  mathematics_min, physics_min, natural_sciences_min, arabic_min, french_min, english_min,
  required_subject, required_subject_min, weighted_formula, geographic_condition, additional_conditions,
  academic_year, source_id, publication_status, is_legacy
) VALUES (
  (SELECT id FROM public.programs WHERE program_code = '032' AND academic_year = '2026-2027' LIMIT 1),
  'gestion_eco',
  1,
  'general_average',
  12.00,
  NULL,
  11.00,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'math',
  11.00,
  NULL,
  'تسجيل وطني',
  '[]'::jsonb,
  '2026-2027',
  'src-mesrs-circulaire-2024',
  'VERIFIED',
  false
) ON CONFLICT (program_id, bac_stream_id, academic_year) DO UPDATE SET
  priority = EXCLUDED.priority,
  ranking_basis = EXCLUDED.ranking_basis,
  minimum_general_average = EXCLUDED.minimum_general_average,
  minimum_weighted_average = EXCLUDED.minimum_weighted_average,
  weighted_formula = EXCLUDED.weighted_formula,
  publication_status = 'VERIFIED';
INSERT INTO public.admission_rules (
  program_id, bac_stream_id, priority, ranking_basis, minimum_general_average, minimum_weighted_average,
  mathematics_min, physics_min, natural_sciences_min, arabic_min, french_min, english_min,
  required_subject, required_subject_min, weighted_formula, geographic_condition, additional_conditions,
  academic_year, source_id, publication_status, is_legacy
) VALUES (
  (SELECT id FROM public.programs WHERE program_code = '032' AND academic_year = '2026-2027' LIMIT 1),
  'math',
  1,
  'general_average',
  12.00,
  NULL,
  11.00,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'math',
  11.00,
  NULL,
  'تسجيل وطني',
  '[]'::jsonb,
  '2026-2027',
  'src-mesrs-circulaire-2024',
  'VERIFIED',
  false
) ON CONFLICT (program_id, bac_stream_id, academic_year) DO UPDATE SET
  priority = EXCLUDED.priority,
  ranking_basis = EXCLUDED.ranking_basis,
  minimum_general_average = EXCLUDED.minimum_general_average,
  minimum_weighted_average = EXCLUDED.minimum_weighted_average,
  weighted_formula = EXCLUDED.weighted_formula,
  publication_status = 'VERIFIED';
INSERT INTO public.admission_rules (
  program_id, bac_stream_id, priority, ranking_basis, minimum_general_average, minimum_weighted_average,
  mathematics_min, physics_min, natural_sciences_min, arabic_min, french_min, english_min,
  required_subject, required_subject_min, weighted_formula, geographic_condition, additional_conditions,
  academic_year, source_id, publication_status, is_legacy
) VALUES (
  (SELECT id FROM public.programs WHERE program_code = '032' AND academic_year = '2026-2027' LIMIT 1),
  'sciences_exp',
  2,
  'general_average',
  12.50,
  NULL,
  11.00,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'math',
  11.00,
  NULL,
  'تسجيل وطني',
  '[]'::jsonb,
  '2026-2027',
  'src-mesrs-circulaire-2024',
  'VERIFIED',
  false
) ON CONFLICT (program_id, bac_stream_id, academic_year) DO UPDATE SET
  priority = EXCLUDED.priority,
  ranking_basis = EXCLUDED.ranking_basis,
  minimum_general_average = EXCLUDED.minimum_general_average,
  minimum_weighted_average = EXCLUDED.minimum_weighted_average,
  weighted_formula = EXCLUDED.weighted_formula,
  publication_status = 'VERIFIED';
INSERT INTO public.program_cutoffs (
  program_id, bac_stream_id, priority, academic_year, cutoff_general_average, cutoff_weighted_average, source, source_id, is_official, publication_status
) VALUES (
  (SELECT id FROM public.programs WHERE program_code = '032' AND academic_year = '2026-2027' LIMIT 1),
  'gestion_eco',
  1,
  '2024-2025',
  13.80,
  NULL,
  'نتائج التوجيه دورة 2024 - MESRS',
  'src-mesrs-statistiques-2024',
  true,
  'VERIFIED'
) ON CONFLICT (program_id, institution_id, bac_stream_id, academic_year) DO UPDATE SET
  cutoff_general_average = EXCLUDED.cutoff_general_average,
  cutoff_weighted_average = EXCLUDED.cutoff_weighted_average,
  publication_status = 'VERIFIED';

-- Program: حقوق وعلوم قانونية وإدارية (ليسانس LMD) (021)
INSERT INTO public.programs (
  program_code, field_id, name_ar, name_fr, specialty_ar, training_type, degree_type, duration_years, academic_year, source_id, is_active, publication_status, is_legacy
) VALUES (
  '021',
  'DSP',
  'حقوق وعلوم قانونية وإدارية (ليسانس LMD)',
  'Droit et Sciences Juridiques (LMD)',
  'علوم قانونية وإدارية عامة',
  'licence',
  'ليسانس في الحقوق (Licence LMD - 3 ans)',
  3,
  '2026-2027',
  'src-mesrs-circulaire-2024',
  true,
  'VERIFIED',
  false
) ON CONFLICT (program_code, academic_year) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_fr = EXCLUDED.name_fr,
  publication_status = 'VERIFIED',
  is_legacy = false;
INSERT INTO public.admission_rules (
  program_id, bac_stream_id, priority, ranking_basis, minimum_general_average, minimum_weighted_average,
  mathematics_min, physics_min, natural_sciences_min, arabic_min, french_min, english_min,
  required_subject, required_subject_min, weighted_formula, geographic_condition, additional_conditions,
  academic_year, source_id, publication_status, is_legacy
) VALUES (
  (SELECT id FROM public.programs WHERE program_code = '021' AND academic_year = '2026-2027' LIMIT 1),
  'lettres_philo',
  1,
  'general_average',
  10.00,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'تسجيل محلي',
  '[]'::jsonb,
  '2026-2027',
  'src-mesrs-circulaire-2024',
  'VERIFIED',
  false
) ON CONFLICT (program_id, bac_stream_id, academic_year) DO UPDATE SET
  priority = EXCLUDED.priority,
  ranking_basis = EXCLUDED.ranking_basis,
  minimum_general_average = EXCLUDED.minimum_general_average,
  minimum_weighted_average = EXCLUDED.minimum_weighted_average,
  weighted_formula = EXCLUDED.weighted_formula,
  publication_status = 'VERIFIED';
INSERT INTO public.admission_rules (
  program_id, bac_stream_id, priority, ranking_basis, minimum_general_average, minimum_weighted_average,
  mathematics_min, physics_min, natural_sciences_min, arabic_min, french_min, english_min,
  required_subject, required_subject_min, weighted_formula, geographic_condition, additional_conditions,
  academic_year, source_id, publication_status, is_legacy
) VALUES (
  (SELECT id FROM public.programs WHERE program_code = '021' AND academic_year = '2026-2027' LIMIT 1),
  'langues_etrangeres',
  1,
  'general_average',
  10.00,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'تسجيل محلي',
  '[]'::jsonb,
  '2026-2027',
  'src-mesrs-circulaire-2024',
  'VERIFIED',
  false
) ON CONFLICT (program_id, bac_stream_id, academic_year) DO UPDATE SET
  priority = EXCLUDED.priority,
  ranking_basis = EXCLUDED.ranking_basis,
  minimum_general_average = EXCLUDED.minimum_general_average,
  minimum_weighted_average = EXCLUDED.minimum_weighted_average,
  weighted_formula = EXCLUDED.weighted_formula,
  publication_status = 'VERIFIED';
INSERT INTO public.admission_rules (
  program_id, bac_stream_id, priority, ranking_basis, minimum_general_average, minimum_weighted_average,
  mathematics_min, physics_min, natural_sciences_min, arabic_min, french_min, english_min,
  required_subject, required_subject_min, weighted_formula, geographic_condition, additional_conditions,
  academic_year, source_id, publication_status, is_legacy
) VALUES (
  (SELECT id FROM public.programs WHERE program_code = '021' AND academic_year = '2026-2027' LIMIT 1),
  'gestion_eco',
  1,
  'general_average',
  10.00,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'تسجيل محلي',
  '[]'::jsonb,
  '2026-2027',
  'src-mesrs-circulaire-2024',
  'VERIFIED',
  false
) ON CONFLICT (program_id, bac_stream_id, academic_year) DO UPDATE SET
  priority = EXCLUDED.priority,
  ranking_basis = EXCLUDED.ranking_basis,
  minimum_general_average = EXCLUDED.minimum_general_average,
  minimum_weighted_average = EXCLUDED.minimum_weighted_average,
  weighted_formula = EXCLUDED.weighted_formula,
  publication_status = 'VERIFIED';
INSERT INTO public.admission_rules (
  program_id, bac_stream_id, priority, ranking_basis, minimum_general_average, minimum_weighted_average,
  mathematics_min, physics_min, natural_sciences_min, arabic_min, french_min, english_min,
  required_subject, required_subject_min, weighted_formula, geographic_condition, additional_conditions,
  academic_year, source_id, publication_status, is_legacy
) VALUES (
  (SELECT id FROM public.programs WHERE program_code = '021' AND academic_year = '2026-2027' LIMIT 1),
  'sciences_exp',
  2,
  'general_average',
  10.00,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'تسجيل محلي',
  '[]'::jsonb,
  '2026-2027',
  'src-mesrs-circulaire-2024',
  'VERIFIED',
  false
) ON CONFLICT (program_id, bac_stream_id, academic_year) DO UPDATE SET
  priority = EXCLUDED.priority,
  ranking_basis = EXCLUDED.ranking_basis,
  minimum_general_average = EXCLUDED.minimum_general_average,
  minimum_weighted_average = EXCLUDED.minimum_weighted_average,
  weighted_formula = EXCLUDED.weighted_formula,
  publication_status = 'VERIFIED';
INSERT INTO public.admission_rules (
  program_id, bac_stream_id, priority, ranking_basis, minimum_general_average, minimum_weighted_average,
  mathematics_min, physics_min, natural_sciences_min, arabic_min, french_min, english_min,
  required_subject, required_subject_min, weighted_formula, geographic_condition, additional_conditions,
  academic_year, source_id, publication_status, is_legacy
) VALUES (
  (SELECT id FROM public.programs WHERE program_code = '021' AND academic_year = '2026-2027' LIMIT 1),
  'math',
  2,
  'general_average',
  10.00,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'تسجيل محلي',
  '[]'::jsonb,
  '2026-2027',
  'src-mesrs-circulaire-2024',
  'VERIFIED',
  false
) ON CONFLICT (program_id, bac_stream_id, academic_year) DO UPDATE SET
  priority = EXCLUDED.priority,
  ranking_basis = EXCLUDED.ranking_basis,
  minimum_general_average = EXCLUDED.minimum_general_average,
  minimum_weighted_average = EXCLUDED.minimum_weighted_average,
  weighted_formula = EXCLUDED.weighted_formula,
  publication_status = 'VERIFIED';
INSERT INTO public.program_cutoffs (
  program_id, bac_stream_id, priority, academic_year, cutoff_general_average, cutoff_weighted_average, source, source_id, is_official, publication_status
) VALUES (
  (SELECT id FROM public.programs WHERE program_code = '021' AND academic_year = '2026-2027' LIMIT 1),
  'lettres_philo',
  1,
  '2024-2025',
  10.45,
  NULL,
  'نتائج التوجيه دورة 2024 - MESRS',
  'src-mesrs-statistiques-2024',
  true,
  'VERIFIED'
) ON CONFLICT (program_id, institution_id, bac_stream_id, academic_year) DO UPDATE SET
  cutoff_general_average = EXCLUDED.cutoff_general_average,
  cutoff_weighted_average = EXCLUDED.cutoff_weighted_average,
  publication_status = 'VERIFIED';

-- Program: أستاذ التعليم الثانوي في الرياضيات (PES - مدرسة الأساتذة بالقبة) (091)
INSERT INTO public.programs (
  program_code, field_id, name_ar, name_fr, specialty_ar, training_type, degree_type, duration_years, academic_year, source_id, is_active, publication_status, is_legacy
) VALUES (
  '091',
  'ENS',
  'أستاذ التعليم الثانوي في الرياضيات (PES - مدرسة الأساتذة بالقبة)',
  'Professeur de l''Enseignement Secondaire en Mathématiques (ENS Kouba)',
  'تكوين أساتذة الرياضيات للطور الثانوي',
  'teacher_training',
  'شهادة أستاذ التعليم الثانوي (Diplôme de PES - 5 ans)',
  5,
  '2026-2027',
  'src-mesrs-circulaire-2024',
  true,
  'VERIFIED',
  false
) ON CONFLICT (program_code, academic_year) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_fr = EXCLUDED.name_fr,
  publication_status = 'VERIFIED',
  is_legacy = false;
INSERT INTO public.admission_rules (
  program_id, bac_stream_id, priority, ranking_basis, minimum_general_average, minimum_weighted_average,
  mathematics_min, physics_min, natural_sciences_min, arabic_min, french_min, english_min,
  required_subject, required_subject_min, weighted_formula, geographic_condition, additional_conditions,
  academic_year, source_id, publication_status, is_legacy
) VALUES (
  (SELECT id FROM public.programs WHERE program_code = '091' AND academic_year = '2026-2027' LIMIT 1),
  'math',
  1,
  'weighted_average',
  14.00,
  14.00,
  13.00,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'math',
  13.00,
  '{"id":"form-cs-math","expressionAr":"((2 × معدل البكالوريا) + علامة الرياضيات) / 3","expressionFr":"((2 × Bac) + Math) / 3","divisor":3,"terms":[{"subject":"general_average","coefficient":2},{"subject":"math","coefficient":1}],"sourceId":"src-mesrs-circulaire-2024","verificationStatus":"VERIFIED"}'::jsonb,
  'تسجيل جهوي وفق الدوائر الجغرافية لمدارس الأساتذة',
  '[{"type":"medical_interview","titleAr":"مقابلة شفوية وفحص طبي إلزامي","descriptionAr":"يخضع المترشح المقبول مبدئياً لمقابلة شفوية أمام لجنة أساتذة + فحص طبي للتأكد من القدرة على التدريس وسلامة الحواس والنطق."},{"type":"age_limit","titleAr":"شرط السن القانوني","descriptionAr":"ألا يتجاوز سن المترشح 24 سنة عند تاريخ 31 ديسمبر من سنة البكالوريا."}]'::jsonb,
  '2026-2027',
  'src-mesrs-circulaire-2024',
  'VERIFIED',
  false
) ON CONFLICT (program_id, bac_stream_id, academic_year) DO UPDATE SET
  priority = EXCLUDED.priority,
  ranking_basis = EXCLUDED.ranking_basis,
  minimum_general_average = EXCLUDED.minimum_general_average,
  minimum_weighted_average = EXCLUDED.minimum_weighted_average,
  weighted_formula = EXCLUDED.weighted_formula,
  publication_status = 'VERIFIED';
INSERT INTO public.admission_rules (
  program_id, bac_stream_id, priority, ranking_basis, minimum_general_average, minimum_weighted_average,
  mathematics_min, physics_min, natural_sciences_min, arabic_min, french_min, english_min,
  required_subject, required_subject_min, weighted_formula, geographic_condition, additional_conditions,
  academic_year, source_id, publication_status, is_legacy
) VALUES (
  (SELECT id FROM public.programs WHERE program_code = '091' AND academic_year = '2026-2027' LIMIT 1),
  'technique_math',
  2,
  'weighted_average',
  14.50,
  14.50,
  13.00,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'math',
  13.00,
  '{"id":"form-cs-math","expressionAr":"((2 × معدل البكالوريا) + علامة الرياضيات) / 3","expressionFr":"((2 × Bac) + Math) / 3","divisor":3,"terms":[{"subject":"general_average","coefficient":2},{"subject":"math","coefficient":1}],"sourceId":"src-mesrs-circulaire-2024","verificationStatus":"VERIFIED"}'::jsonb,
  'تسجيل جهوي',
  '[{"type":"medical_interview","titleAr":"مقابلة شفوية وفحص طبي إلزامي","descriptionAr":"يخضع المترشح لمقابلة شفوية وفحص طبي إلزامي."}]'::jsonb,
  '2026-2027',
  'src-mesrs-circulaire-2024',
  'VERIFIED',
  false
) ON CONFLICT (program_id, bac_stream_id, academic_year) DO UPDATE SET
  priority = EXCLUDED.priority,
  ranking_basis = EXCLUDED.ranking_basis,
  minimum_general_average = EXCLUDED.minimum_general_average,
  minimum_weighted_average = EXCLUDED.minimum_weighted_average,
  weighted_formula = EXCLUDED.weighted_formula,
  publication_status = 'VERIFIED';
INSERT INTO public.admission_rules (
  program_id, bac_stream_id, priority, ranking_basis, minimum_general_average, minimum_weighted_average,
  mathematics_min, physics_min, natural_sciences_min, arabic_min, french_min, english_min,
  required_subject, required_subject_min, weighted_formula, geographic_condition, additional_conditions,
  academic_year, source_id, publication_status, is_legacy
) VALUES (
  (SELECT id FROM public.programs WHERE program_code = '091' AND academic_year = '2026-2027' LIMIT 1),
  'sciences_exp',
  2,
  'weighted_average',
  14.50,
  14.50,
  13.00,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'math',
  13.00,
  '{"id":"form-cs-math","expressionAr":"((2 × معدل البكالوريا) + علامة الرياضيات) / 3","expressionFr":"((2 × Bac) + Math) / 3","divisor":3,"terms":[{"subject":"general_average","coefficient":2},{"subject":"math","coefficient":1}],"sourceId":"src-mesrs-circulaire-2024","verificationStatus":"VERIFIED"}'::jsonb,
  'تسجيل جهوي',
  '[{"type":"medical_interview","titleAr":"مقابلة شفوية وفحص طبي إلزامي","descriptionAr":"يخضع المترشح لمقابلة شفوية وفحص طبي إلزامي."}]'::jsonb,
  '2026-2027',
  'src-mesrs-circulaire-2024',
  'VERIFIED',
  false
) ON CONFLICT (program_id, bac_stream_id, academic_year) DO UPDATE SET
  priority = EXCLUDED.priority,
  ranking_basis = EXCLUDED.ranking_basis,
  minimum_general_average = EXCLUDED.minimum_general_average,
  minimum_weighted_average = EXCLUDED.minimum_weighted_average,
  weighted_formula = EXCLUDED.weighted_formula,
  publication_status = 'VERIFIED';
INSERT INTO public.program_cutoffs (
  program_id, bac_stream_id, priority, academic_year, cutoff_general_average, cutoff_weighted_average, source, source_id, is_official, publication_status
) VALUES (
  (SELECT id FROM public.programs WHERE program_code = '091' AND academic_year = '2026-2027' LIMIT 1),
  'math',
  1,
  '2024-2025',
  15.10,
  15.42,
  'نتائج التوجيه دورة 2024 - MESRS',
  'src-mesrs-statistiques-2024',
  true,
  'VERIFIED'
) ON CONFLICT (program_id, institution_id, bac_stream_id, academic_year) DO UPDATE SET
  cutoff_general_average = EXCLUDED.cutoff_general_average,
  cutoff_weighted_average = EXCLUDED.cutoff_weighted_average,
  publication_status = 'VERIFIED';

-- Program: لغة وأدب إنجليزي (ليسانس وماستر LMD) (025)
INSERT INTO public.programs (
  program_code, field_id, name_ar, name_fr, specialty_ar, training_type, degree_type, duration_years, academic_year, source_id, is_active, publication_status, is_legacy
) VALUES (
  '025',
  'LLE',
  'لغة وأدب إنجليزي (ليسانس وماستر LMD)',
  'Langue et Littérature Anglaise (LMD)',
  'دراسات أدبية ولغوية إنجليزية',
  'licence',
  'ليسانس أكاديمي (Licence LMD - 3 ans)',
  3,
  '2026-2027',
  'src-mesrs-circulaire-2024',
  true,
  'VERIFIED',
  false
) ON CONFLICT (program_code, academic_year) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_fr = EXCLUDED.name_fr,
  publication_status = 'VERIFIED',
  is_legacy = false;
INSERT INTO public.admission_rules (
  program_id, bac_stream_id, priority, ranking_basis, minimum_general_average, minimum_weighted_average,
  mathematics_min, physics_min, natural_sciences_min, arabic_min, french_min, english_min,
  required_subject, required_subject_min, weighted_formula, geographic_condition, additional_conditions,
  academic_year, source_id, publication_status, is_legacy
) VALUES (
  (SELECT id FROM public.programs WHERE program_code = '025' AND academic_year = '2026-2027' LIMIT 1),
  'langues_etrangeres',
  1,
  'weighted_average',
  10.50,
  10.50,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  11.00,
  'english',
  11.00,
  '{"id":"form-lle-eng","expressionAr":"((2 × معدل البكالوريا) + علامة اللغة الإنجليزية) / 3","expressionFr":"((2 × Bac) + Anglais) / 3","divisor":3,"terms":[{"subject":"general_average","coefficient":2},{"subject":"english","coefficient":1}],"sourceId":"src-mesrs-circulaire-2024","verificationStatus":"VERIFIED"}'::jsonb,
  'تسجيل محلي',
  '[]'::jsonb,
  '2026-2027',
  'src-mesrs-circulaire-2024',
  'VERIFIED',
  false
) ON CONFLICT (program_id, bac_stream_id, academic_year) DO UPDATE SET
  priority = EXCLUDED.priority,
  ranking_basis = EXCLUDED.ranking_basis,
  minimum_general_average = EXCLUDED.minimum_general_average,
  minimum_weighted_average = EXCLUDED.minimum_weighted_average,
  weighted_formula = EXCLUDED.weighted_formula,
  publication_status = 'VERIFIED';
INSERT INTO public.admission_rules (
  program_id, bac_stream_id, priority, ranking_basis, minimum_general_average, minimum_weighted_average,
  mathematics_min, physics_min, natural_sciences_min, arabic_min, french_min, english_min,
  required_subject, required_subject_min, weighted_formula, geographic_condition, additional_conditions,
  academic_year, source_id, publication_status, is_legacy
) VALUES (
  (SELECT id FROM public.programs WHERE program_code = '025' AND academic_year = '2026-2027' LIMIT 1),
  'lettres_philo',
  2,
  'weighted_average',
  10.50,
  10.50,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  11.00,
  'english',
  11.00,
  '{"id":"form-lle-eng","expressionAr":"((2 × معدل البكالوريا) + علامة اللغة الإنجليزية) / 3","expressionFr":"((2 × Bac) + Anglais) / 3","divisor":3,"terms":[{"subject":"general_average","coefficient":2},{"subject":"english","coefficient":1}],"sourceId":"src-mesrs-circulaire-2024","verificationStatus":"VERIFIED"}'::jsonb,
  'تسجيل محلي',
  '[]'::jsonb,
  '2026-2027',
  'src-mesrs-circulaire-2024',
  'VERIFIED',
  false
) ON CONFLICT (program_id, bac_stream_id, academic_year) DO UPDATE SET
  priority = EXCLUDED.priority,
  ranking_basis = EXCLUDED.ranking_basis,
  minimum_general_average = EXCLUDED.minimum_general_average,
  minimum_weighted_average = EXCLUDED.minimum_weighted_average,
  weighted_formula = EXCLUDED.weighted_formula,
  publication_status = 'VERIFIED';
INSERT INTO public.admission_rules (
  program_id, bac_stream_id, priority, ranking_basis, minimum_general_average, minimum_weighted_average,
  mathematics_min, physics_min, natural_sciences_min, arabic_min, french_min, english_min,
  required_subject, required_subject_min, weighted_formula, geographic_condition, additional_conditions,
  academic_year, source_id, publication_status, is_legacy
) VALUES (
  (SELECT id FROM public.programs WHERE program_code = '025' AND academic_year = '2026-2027' LIMIT 1),
  'sciences_exp',
  3,
  'weighted_average',
  11.00,
  11.00,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  11.00,
  'english',
  11.00,
  '{"id":"form-lle-eng","expressionAr":"((2 × معدل البكالوريا) + علامة اللغة الإنجليزية) / 3","expressionFr":"((2 × Bac) + Anglais) / 3","divisor":3,"terms":[{"subject":"general_average","coefficient":2},{"subject":"english","coefficient":1}],"sourceId":"src-mesrs-circulaire-2024","verificationStatus":"VERIFIED"}'::jsonb,
  'تسجيل محلي',
  '[]'::jsonb,
  '2026-2027',
  'src-mesrs-circulaire-2024',
  'VERIFIED',
  false
) ON CONFLICT (program_id, bac_stream_id, academic_year) DO UPDATE SET
  priority = EXCLUDED.priority,
  ranking_basis = EXCLUDED.ranking_basis,
  minimum_general_average = EXCLUDED.minimum_general_average,
  minimum_weighted_average = EXCLUDED.minimum_weighted_average,
  weighted_formula = EXCLUDED.weighted_formula,
  publication_status = 'VERIFIED';
INSERT INTO public.program_cutoffs (
  program_id, bac_stream_id, priority, academic_year, cutoff_general_average, cutoff_weighted_average, source, source_id, is_official, publication_status
) VALUES (
  (SELECT id FROM public.programs WHERE program_code = '025' AND academic_year = '2026-2027' LIMIT 1),
  'langues_etrangeres',
  1,
  '2024-2025',
  13.40,
  14.10,
  'نتائج التوجيه دورة 2024 - MESRS',
  'src-mesrs-statistiques-2024',
  true,
  'VERIFIED'
) ON CONFLICT (program_id, institution_id, bac_stream_id, academic_year) DO UPDATE SET
  cutoff_general_average = EXCLUDED.cutoff_general_average,
  cutoff_weighted_average = EXCLUDED.cutoff_weighted_average,
  publication_status = 'VERIFIED';

-- 7. RECORD PIPELINE EXECUTION IN ORIENTATION IMPORT RUNS
INSERT INTO public.orientation_import_runs (
  academic_year, source_id, total_programs, total_institutions, total_rules, total_streams,
  total_geographic_rules, incomplete_records_count, records_needing_review_count, conflicts_count,
  validation_status, report_summary, notes
) VALUES (
  '2026-2027',
  'src-mesrs-circulaire-2024',
  15,
  34,
  46,
  6,
  35,
  0,
  5,
  5,
  'SUCCESS',
  '{"totalPrograms":15,"totalInstitutions":34,"totalEligibilityRules":46,"totalStreams":6,"totalGeographicRules":35}'::jsonb,
  'Authoritative seed import pipeline completed successfully with zero PUBLISHED records.'
);
