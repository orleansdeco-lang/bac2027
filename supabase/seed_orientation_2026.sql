-- ==============================================================================
-- 028_seed_orientation_2026.sql
-- Seed Data for Algerian Higher Education Orientation Subsystem (MESRS)
-- Academic Year: 2026-2027 & Historical Data 2025/2024
-- Source: circulaire.mesrs.dz (Ministère de l'Enseignement Supérieur et de la Recherche Scientifique)
-- ==============================================================================

-- 1. ORIENTATION VERSIONS
INSERT INTO public.orientation_versions (id, academic_year, version_name, source_url, source_document, source_type, is_current, verified_at)
VALUES 
  ('11111111-1111-1111-1111-111111111111', '2026-2027', 'المنشور الوزاري لتوجيه حاملي شهادة البكالوريا دورة 2026', 'https://circulaire.mesrs.dz/', 'المنشور رقم 01 المؤرخ في جويلية 2024 والمحيّن لدورة 2026', 'OFFICIAL_CIRCULAR', true, now()),
  ('22222222-2222-2222-2222-222222222222', '2025-2026', 'المنشور الوزاري لدورة 2025 (معدلات القبول السابقة)', 'https://circulaire.mesrs.dz/', 'المنشور رقم 01 دورة 2025', 'HISTORICAL_REPORT', false, now()),
  ('33333333-3333-3333-3333-333333333333', '2024-2025', 'المنشور الوزاري لدورة 2024 (معدلات القبول السابقة)', 'https://circulaire.mesrs.dz/', 'المنشور رقم 01 دورة 2024', 'HISTORICAL_REPORT', false, now())
ON CONFLICT (academic_year) DO UPDATE 
SET version_name = EXCLUDED.version_name, is_current = EXCLUDED.is_current;

-- 2. BAC STREAMS (6 Official Streams)
INSERT INTO public.bac_streams (id, code, name_ar, name_fr, short_name, is_active)
VALUES
  ('sciences_exp', 'SE', 'علوم تجريبية', 'Sciences Expérimentales', 'علوم', true),
  ('math', 'M', 'رياضيات', 'Mathématiques', 'رياضيات', true),
  ('technique_math', 'TM', 'تقني رياضي', 'Technique Mathématiques', 'تقني', true),
  ('gestion_eco', 'GE', 'تسيير واقتصاد', 'Gestion et Économie', 'تسيير', true),
  ('lettres_philo', 'LP', 'آداب وفلسفة', 'Lettres et Philosophie', 'فلسفة', true),
  ('langues_etrangeres', 'LE', 'لغات أجنبية', 'Langues Étrangères', 'لغات', true)
ON CONFLICT (id) DO NOTHING;

-- 3. FIELDS (Domaines de formation MESRS)
INSERT INTO public.fields (id, code, name_ar, name_fr, icon)
VALUES
  ('MED', 'MED', 'العلوم الطبية والصحية', 'Sciences Médicales et de la Santé', 'Stethoscope'),
  ('MI', 'MI', 'رياضيات وإعلام آلي وذكاء اصطناعي', 'Mathématiques, Informatique et IA', 'Binary'),
  ('ST', 'ST', 'علوم وتكنولوجيا وهندسة', 'Sciences et Technologies', 'Cpu'),
  ('SNV', 'SNV', 'علوم الطبيعة والحياة', 'Sciences de la Nature et de la Vie', 'Dna'),
  ('SM', 'SM', 'علوم المادة (فيزياء وكيمياء)', 'Sciences de la Matière', 'Atom'),
  ('SEGC', 'SEGC', 'علوم اقتصادية والتسيير وعلوم تجارية', 'Sciences Économiques, de Gestion et Commerciales', 'TrendingUp'),
  ('DSP', 'DSP', 'حقوق وعلوم سياسية', 'Droit et Sciences Politiques', 'Scale'),
  ('LLE', 'LLE', 'آداب ولغات أجنبية', 'Lettres et Langues Étrangères', 'Languages'),
  ('HUM', 'HUM', 'علوم إنسانية واجتماعية وإسلامية', 'Sciences Humaines, Sociales et Islamiques', 'BookOpen'),
  ('ARCH', 'ARCH', 'هندسة معمارية وعمران ومشاريع المدن', 'Architecture et Urbanisme', 'Building2'),
  ('VET', 'VET', 'علوم بيطرية وفلاحية', 'Sciences Vétérinaires et Agronomiques', 'PawPrint'),
  ('ENS', 'ENS', 'المدارس العليا للأساتذة (تكوين الأساتذة)', 'Écoles Normales Supérieures', 'GraduationCap'),
  ('STAPS', 'STAPS', 'علوم وتقنيات النشاطات البدنية والرياضية', 'STAPS', 'Activity'),
  ('ART', 'ART', 'فنون وثقافة وإعلام', 'Arts, Culture et Communication', 'Palette')
ON CONFLICT (id) DO NOTHING;

-- 4. 58 OFFICIAL WILAYAS
INSERT INTO public.wilayas (id, code, name_ar, name_fr, phone_code)
VALUES
  (1, '01', 'أدرار', 'Adrar', '049'),
  (2, '02', 'الشلف', 'Chlef', '027'),
  (3, '03', 'الأغواط', 'Laghouat', '029'),
  (4, '04', 'أم البواقي', 'Oum El Bouaghi', '032'),
  (5, '05', 'باتنة', 'Batna', '033'),
  (6, '06', 'بجاية', 'Béjaïa', '034'),
  (7, '07', 'بسكرة', 'Biskra', '033'),
  (8, '08', 'بشار', 'Béchar', '049'),
  (9, '09', 'البليدة', 'Blida', '025'),
  (10, '10', 'البويرة', 'Bouira', '026'),
  (11, '11', 'تمنراست', 'Tamanrasset', '029'),
  (12, '12', 'تبسة', 'Tébessa', '037'),
  (13, '13', 'تلمسان', 'Tlemcen', '043'),
  (14, '14', 'تيارت', 'Tiaret', '046'),
  (15, '15', 'تيزي وزو', 'Tizi Ouzou', '026'),
  (16, '16', 'الجزائر', 'Alger', '021'),
  (17, '17', 'الجلفة', 'Djelfa', '027'),
  (18, '18', 'جيجل', 'Jijel', '034'),
  (19, '19', 'سطيف', 'Sétif', '036'),
  (20, '20', 'سعيدة', 'Saïda', '048'),
  (21, '21', 'سكيكدة', 'Skikda', '038'),
  (22, '22', 'سيدي بلعباس', 'Sidi Bel Abbès', '048'),
  (23, '23', 'عنابة', 'Annaba', '038'),
  (24, '24', 'قالمة', 'Guelma', '037'),
  (25, '25', 'قسنطينة', 'Constantine', '031'),
  (26, '26', 'المدية', 'Médéa', '025'),
  (27, '27', 'مستغانم', 'Mostaganem', '045'),
  (28, '28', 'المسيلة', 'M''sila', '035'),
  (29, '29', 'معسكر', 'Mascara', '045'),
  (30, '30', 'ورقلة', 'Ouargla', '029'),
  (31, '31', 'وهران', 'Oran', '041'),
  (32, '32', 'البيض', 'El Bayadh', '049'),
  (33, '33', 'إليزي', 'Illizi', '029'),
  (34, '34', 'برج بوعريريج', 'Bordj Bou Arreridj', '035'),
  (35, '35', 'بومرداس', 'Boumerdès', '024'),
  (36, '36', 'الطارف', 'El Tarf', '038'),
  (37, '37', 'تندوف', 'Tindouf', '049'),
  (38, '38', 'تيسمسيلت', 'Tissemsilt', '046'),
  (39, '39', 'الوادي', 'El Oued', '032'),
  (40, '40', 'خنشلة', 'Khenchela', '032'),
  (41, '41', 'سوق أهراس', 'Souk Ahras', '037'),
  (42, '42', 'تيبازة', 'Tipaza', '024'),
  (43, '43', 'ميلة', 'Mila', '031'),
  (44, '44', 'عين الدفلى', 'Aïn Defla', '027'),
  (45, '45', 'النعامة', 'Naâma', '049'),
  (46, '46', 'عين تموشنت', 'Aïn Témouchent', '043'),
  (47, '47', 'غرداية', 'Ghardaïa', '029'),
  (48, '48', 'غليزان', 'Relizane', '046'),
  (49, '49', 'تيميمون', 'Timimoun', '049'),
  (50, '50', 'برج باجي مختار', 'Bordj Badji Mokhtar', '049'),
  (51, '51', 'أولاد جلال', 'Ouled Djellal', '033'),
  (52, '52', 'بني عباس', 'Béni Abbès', '049'),
  (53, '53', 'عين صالح', 'In Salah', '029'),
  (54, '54', 'عين قزام', 'In Guezzam', '029'),
  (55, '55', 'توقرت', 'Touggourt', '029'),
  (56, '56', 'جانت', 'Djanet', '029'),
  (57, '57', 'المغير', 'El M''Ghair', '032'),
  (58, '58', 'المنيعة', 'El Meniaa', '029')
ON CONFLICT (id) DO UPDATE SET name_ar = EXCLUDED.name_ar, name_fr = EXCLUDED.name_fr;
