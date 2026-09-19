-- ==============================================================================
-- 015_high_school_selection_and_verification.sql
-- Migration: SHATER High School Selection and Verification System
-- ==============================================================================

-- 1. Create Helper Function for String Normalization (Arabic & French)
CREATE OR REPLACE FUNCTION public.normalize_school_name(txt TEXT)
RETURNS TEXT AS $$
DECLARE
    cleaned TEXT;
BEGIN
    IF txt IS NULL THEN
        RETURN '';
    END IF;

    cleaned := lower(trim(txt));

    -- Remove common prefixes like 'ثانوية' or 'lycee' / 'lycée'
    cleaned := regexp_replace(cleaned, '^(ثانوية|ثانويه|lycee|lycée)\s+', '', 'i');

    -- Remove Arabic diacritics / tashkeel
    cleaned := regexp_replace(cleaned, '[\u064B-\u065F\u0670]', '', 'g');

    -- Remove tatweel (kashida)
    cleaned := regexp_replace(cleaned, 'ـ+', '', 'g');

    -- Normalize Arabic Alefs: أ, إ, آ, ٱ -> ا
    cleaned := regexp_replace(cleaned, '[أإآٱ]', 'ا', 'g');

    -- Normalize Taa Marbuta and Haa: ة -> ه
    cleaned := regexp_replace(cleaned, 'ة', 'ه', 'g');

    -- Normalize Yaa: ى -> ي
    cleaned := regexp_replace(cleaned, 'ى', 'ي', 'g');

    -- Normalize French accents
    cleaned := replace(cleaned, 'é', 'e');
    cleaned := replace(cleaned, 'è', 'e');
    cleaned := replace(cleaned, 'ê', 'e');
    cleaned := replace(cleaned, 'ë', 'e');
    cleaned := replace(cleaned, 'à', 'a');
    cleaned := replace(cleaned, 'â', 'a');
    cleaned := replace(cleaned, 'ô', 'o');
    cleaned := replace(cleaned, 'î', 'i');
    cleaned := replace(cleaned, 'ï', 'i');
    cleaned := replace(cleaned, 'ù', 'u');
    cleaned := replace(cleaned, 'û', 'u');
    cleaned := replace(cleaned, 'ç', 'c');

    -- Remove punctuation and collapse whitespace
    cleaned := regexp_replace(cleaned, '[\-_.,()''"\/]', ' ', 'g');
    cleaned := regexp_replace(cleaned, '\s+', ' ', 'g');

    RETURN trim(cleaned);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 2. Create Table: public.high_schools (Official Verified High Schools)
CREATE TABLE IF NOT EXISTS public.high_schools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    name_fr TEXT,
    name_normalized TEXT NOT NULL,
    wilaya_code TEXT NOT NULL,
    wilaya_name_ar TEXT NOT NULL,
    commune_name_ar TEXT NOT NULL,
    is_verified BOOLEAN NOT NULL DEFAULT TRUE,
    verification_status TEXT NOT NULL DEFAULT 'verified' CHECK (verification_status IN ('verified', 'pending', 'rejected')),
    source TEXT NOT NULL DEFAULT 'ministry_directory' CHECK (source IN ('ministry_directory', 'user_submission', 'admin_import')),
    source_ref TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Create Table: public.high_school_submissions (User Additions Waiting Verification)
CREATE TABLE IF NOT EXISTS public.high_school_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submitted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    proposed_name TEXT NOT NULL,
    proposed_name_normalized TEXT NOT NULL,
    wilaya_code TEXT NOT NULL,
    wilaya_name_ar TEXT NOT NULL,
    commune_name_ar TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'duplicate')),
    admin_note TEXT,
    reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Fast Indexes for Filtering and Duplicate Detection
CREATE INDEX IF NOT EXISTS idx_high_schools_wilaya_commune ON public.high_schools(wilaya_code, commune_name_ar);
CREATE INDEX IF NOT EXISTS idx_high_schools_normalized ON public.high_schools(name_normalized);
CREATE INDEX IF NOT EXISTS idx_high_schools_verification ON public.high_schools(is_verified, verification_status);

CREATE INDEX IF NOT EXISTS idx_high_school_submissions_status ON public.high_school_submissions(status);
CREATE INDEX IF NOT EXISTS idx_high_school_submissions_wilaya_commune ON public.high_school_submissions(wilaya_code, commune_name_ar);
CREATE INDEX IF NOT EXISTS idx_high_school_submissions_normalized ON public.high_school_submissions(proposed_name_normalized);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.high_schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.high_school_submissions ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies for public.high_schools
-- Public / authenticated SELECT: Students can ONLY read verified high schools
CREATE POLICY "Anyone can view verified high schools"
    ON public.high_schools
    FOR SELECT
    USING (is_verified = true AND verification_status = 'verified');

-- INSERT / UPDATE / DELETE restricted to Service Role and Admins
CREATE POLICY "Only service_role can manage high schools"
    ON public.high_schools
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- 7. RLS Policies for public.high_school_submissions
-- Authenticated users can insert their own submission with status 'pending' strictly
CREATE POLICY "Authenticated students can submit high school for review"
    ON public.high_school_submissions
    FOR INSERT
    TO authenticated
    WITH CHECK (
        (auth.uid() = submitted_by OR submitted_by IS NULL) AND
        status = 'pending'
    );

-- Authors can view their own submissions
CREATE POLICY "Students can view their own submissions"
    ON public.high_school_submissions
    FOR SELECT
    TO authenticated
    USING (auth.uid() = submitted_by);

-- Service Role / Operators have full access to review submissions
CREATE POLICY "Service role can manage all submissions"
    ON public.high_school_submissions
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- 8. Transactional Approval Function: public.approve_high_school_submission
CREATE OR REPLACE FUNCTION public.approve_high_school_submission(
    target_submission_id UUID,
    reviewer_user_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    sub_record RECORD;
    new_school_id UUID;
BEGIN
    -- 1. Fetch target pending submission
    SELECT * INTO sub_record
    FROM public.high_school_submissions
    WHERE id = target_submission_id AND status = 'pending'
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Submission not found or already reviewed.';
    END IF;

    -- 2. Insert into official high_schools
    INSERT INTO public.high_schools (
        name,
        name_fr,
        name_normalized,
        wilaya_code,
        wilaya_name_ar,
        commune_name_ar,
        is_verified,
        verification_status,
        source,
        source_ref
    ) VALUES (
        sub_record.proposed_name,
        NULL,
        sub_record.proposed_name_normalized,
        sub_record.wilaya_code,
        sub_record.wilaya_name_ar,
        sub_record.commune_name_ar,
        TRUE,
        'verified',
        'user_submission',
        sub_record.id::text
    )
    RETURNING id INTO new_school_id;

    -- 3. Mark submission as approved
    UPDATE public.high_school_submissions
    SET
        status = 'approved',
        reviewed_by = reviewer_user_id,
        reviewed_at = now()
    WHERE id = target_submission_id;

    RETURN new_school_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Seed Initial Curated Official High Schools Across Algeria
INSERT INTO public.high_schools (
    name, name_fr, name_normalized, wilaya_code, wilaya_name_ar, commune_name_ar, is_verified, verification_status, source
) VALUES
-- 02 - الشلف
('ثانوية العقيد لطفي', 'Lycée Colonel Lotfi', public.normalize_school_name('ثانوية العقيد لطفي'), '02', 'الشلف', 'الشلف', true, 'verified', 'ministry_directory'),
('ثانوية السلام', 'Lycée Es-Salem', public.normalize_school_name('ثانوية السلام'), '02', 'الشلف', 'الشلف', true, 'verified', 'ministry_directory'),
('ثانوية عبد الحميد بن باديس', 'Lycée Abdelhamid Ben Badis', public.normalize_school_name('ثانوية عبد الحميد بن باديس'), '02', 'الشلف', 'الشلف', true, 'verified', 'ministry_directory'),
('ثانوية الأمير عبد القادر', 'Lycée Emir Abdelkader', public.normalize_school_name('ثانوية الأمير عبد القادر'), '02', 'الشلف', 'الشلف', true, 'verified', 'ministry_directory'),
('ثانوية وادي الفضة الجديدة', 'Lycée Oued Fodda Nouveau', public.normalize_school_name('ثانوية وادي الفضة الجديدة'), '02', 'الشلف', 'وادي الفضة', true, 'verified', 'ministry_directory'),
('ثانوية حسيبة بن بوعلي', 'Lycée Hassiba Ben Bouali', public.normalize_school_name('ثانوية حسيبة بن بوعلي'), '02', 'الشلف', 'بوقادير', true, 'verified', 'ministry_directory'),
('ثانوية أحمد باي', 'Lycée Ahmed Bey', public.normalize_school_name('ثانوية أحمد باي'), '02', 'الشلف', 'تنس', true, 'verified', 'ministry_directory'),

-- 16 - الجزائر
('ثانوية الرياضيات بالقبة', 'Lycée des Mathématiques Kouba', public.normalize_school_name('ثانوية الرياضيات بالقبة'), '16', 'الجزائر', 'القبة', true, 'verified', 'ministry_directory'),
('ثانوية المقراني', 'Lycée El Mokrani', public.normalize_school_name('ثانوية المقراني'), '16', 'الجزائر', 'بن عكنون', true, 'verified', 'ministry_directory'),
('ثانوية العقيد لطفي باب الواد', 'Lycée Colonel Lotfi Bab El Oued', public.normalize_school_name('ثانوية العقيد لطفي باب الواد'), '16', 'الجزائر', 'باب الوادي', true, 'verified', 'ministry_directory'),
('ثانوية الأمير عبد القادر', 'Lycée Emir Abdelkader', public.normalize_school_name('ثانوية الأمير عبد القادر'), '16', 'الجزائر', 'باب الوادي', true, 'verified', 'ministry_directory'),
('ثانوية عمر راسم', 'Lycée Omar Racim', public.normalize_school_name('ثانوية عمر راسم'), '16', 'الجزائر', 'الجزائر الوسطى', true, 'verified', 'ministry_directory'),
('ثانوية حسيبة بن بوعلي', 'Lycée Hassiba Ben Bouali', public.normalize_school_name('ثانوية حسيبة بن بوعلي'), '16', 'الجزائر', 'سيدي امحمد', true, 'verified', 'ministry_directory'),
('ثانوية فرانتز فانون', 'Lycée Frantz Fanon', public.normalize_school_name('ثانوية فرانتز فانون'), '16', 'الجزائر', 'باب الزوار', true, 'verified', 'ministry_directory'),
('متقن بئر خادم التقني', 'Technicum Birkhadem', public.normalize_school_name('متقن بئر خادم التقني'), '16', 'الجزائر', 'بئر خادم', true, 'verified', 'ministry_directory'),
('ثانوية الثعالبية', 'Lycée Thaalibia', public.normalize_school_name('ثانوية الثعالبية'), '16', 'الجزائر', 'حسين داي', true, 'verified', 'ministry_directory'),

-- 31 - وهران
('ثانوية العقيد لطفي', 'Lycée Colonel Lotfi', public.normalize_school_name('ثانوية العقيد لطفي'), '31', 'وهران', 'وهران', true, 'verified', 'ministry_directory'),
('ثانوية باستور', 'Lycée Pasteur', public.normalize_school_name('ثانوية باستور'), '31', 'وهران', 'وهران', true, 'verified', 'ministry_directory'),
('ثانوية عبد الحميد بن باديس', 'Lycée Ben Badis', public.normalize_school_name('ثانوية عبد الحميد بن باديس'), '31', 'وهران', 'وهران', true, 'verified', 'ministry_directory'),
('ثانوية زرقة الشيخ', 'Lycée Zerga Cheikh', public.normalize_school_name('ثانوية زرقة الشيخ'), '31', 'وهران', 'السانية', true, 'verified', 'ministry_directory'),
('ثانوية المجاهد حمو بوتليليس', 'Lycée Hamou Boutlelis', public.normalize_school_name('ثانوية المجاهد حمو بوتليليس'), '31', 'وهران', 'بئر الجير', true, 'verified', 'ministry_directory'),

-- 25 - قسنطينة
('ثانوية عبد الحميد بن باديس', 'Lycée Abdelhamid Ben Badis', public.normalize_school_name('ثانوية عبد الحميد بن باديس'), '25', 'قسنطينة', 'قسنطينة', true, 'verified', 'ministry_directory'),
('ثانوية ابن الهيثم التقنية', 'Lycée Ibn El Haytham', public.normalize_school_name('ثانوية ابن الهيثم التقنية'), '25', 'قسنطينة', 'قسنطينة', true, 'verified', 'ministry_directory'),
('ثانوية رضا حوحو', 'Lycée Redha Houhou', public.normalize_school_name('ثانوية رضا حوحو'), '25', 'قسنطينة', 'قسنطينة', true, 'verified', 'ministry_directory'),
('ثانوية زيغود يوسف', 'Lycée Zighoud Youcef', public.normalize_school_name('ثانوية زيغود يوسف'), '25', 'قسنطينة', 'الخروب', true, 'verified', 'ministry_directory'),
('ثانوية علي منجلي 1', 'Lycée Ali Mendjeli 1', public.normalize_school_name('ثانوية علي منجلي 1'), '25', 'قسنطينة', 'الخروب', true, 'verified', 'ministry_directory'),

-- 19 - سطيف
('ثانوية مالك بن نبي', 'Lycée Malek Bennabi', public.normalize_school_name('ثانوية مالك بن نبي'), '19', 'سطيف', 'سطيف', true, 'verified', 'ministry_directory'),
('ثانوية محمد قيرواني', 'Lycée Mohamed Kerouani', public.normalize_school_name('ثانوية محمد قيرواني'), '19', 'سطيف', 'سطيف', true, 'verified', 'ministry_directory'),
('ثانوية أبي ذر الغفاري', 'Lycée Abi Dhar Al Ghafari', public.normalize_school_name('ثانوية أبي ذر الغفاري'), '19', 'سطيف', 'العلمة', true, 'verified', 'ministry_directory'),

-- 05 - باتنة
('ثانوية مصطفى بن بولعيد', 'Lycée Mostefa Ben Boulaïd', public.normalize_school_name('ثانوية مصطفى بن بولعيد'), '05', 'باتنة', 'باتنة', true, 'verified', 'ministry_directory'),
('ثانوية الإخوة عمراني', 'Lycée Frères Amrani', public.normalize_school_name('ثانوية الإخوة عمراني'), '05', 'باتنة', 'باتنة', true, 'verified', 'ministry_directory'),
('ثانوية أحمد عروة', 'Lycée Ahmed Aroua', public.normalize_school_name('ثانوية أحمد عروة'), '05', 'باتنة', 'بريكة', true, 'verified', 'ministry_directory'),

-- 09 - البليدة
('ثانوية الفتح', 'Lycée El Feth', public.normalize_school_name('ثانوية الفتح'), '09', 'البليدة', 'البليدة', true, 'verified', 'ministry_directory'),
('ثانوية ابن رشد', 'Lycée Ibn Rochd', public.normalize_school_name('ثانوية ابن رشد'), '09', 'البليدة', 'البليدة', true, 'verified', 'ministry_directory'),
('ثانوية عمر بن الخطاب', 'Lycée Omar Ibn El Khattab', public.normalize_school_name('ثانوية عمر بن الخطاب'), '09', 'البليدة', 'بوفاريك', true, 'verified', 'ministry_directory'),

-- 15 - تيزي وزو
('ثانوية العقيد عميروش', 'Lycée Colonel Amirouche', public.normalize_school_name('ثانوية العقيد عميروش'), '15', 'تيزي وزو', 'تيزي وزو', true, 'verified', 'ministry_directory'),
('ثانوية فاطمة نسومر', 'Lycée Lalla Fatma N Soumer', public.normalize_school_name('ثانوية فاطمة نسومر'), '15', 'تيزي وزو', 'تيزي وزو', true, 'verified', 'ministry_directory'),
('ثانوية الإخوة حنيفي', 'Lycée Frères Hanifi', public.normalize_school_name('ثانوية الإخوة حنيفي'), '15', 'تيزي وزو', 'ذراع بن خدة', true, 'verified', 'ministry_directory'),

-- 23 - عنابة
('ثانوية القديس أوغسطين (ابن خلدون)', 'Lycée Ibn Khaldoun', public.normalize_school_name('ثانوية ابن خلدون'), '23', 'عنابة', 'عنابة', true, 'verified', 'ministry_directory'),
('ثانوية العقيد لطفي', 'Lycée Colonel Lotfi', public.normalize_school_name('ثانوية العقيد لطفي'), '23', 'عنابة', 'عنابة', true, 'verified', 'ministry_directory'),
('ثانوية البوني مختلطة', 'Lycée El Bouni', public.normalize_school_name('ثانوية البوني مختلطة'), '23', 'عنابة', 'البوني', true, 'verified', 'ministry_directory'),

-- 13 - تلمسان
('ثانوية مليحة حميدو', 'Lycée Meliha Hamidou', public.normalize_school_name('ثانوية مليحة حميدو'), '13', 'تلمسان', 'تلمسان', true, 'verified', 'ministry_directory'),
('ثانوية ابن مريم', 'Lycée Ibn Meriem', public.normalize_school_name('ثانوية ابن مريم'), '13', 'تلمسان', 'تلمسان', true, 'verified', 'ministry_directory'),
('ثانوية الأمير عبد القادر', 'Lycée Emir Abdelkader', public.normalize_school_name('ثانوية الأمير عبد القادر'), '13', 'تلمسان', 'مغنية', true, 'verified', 'ministry_directory')
ON CONFLICT DO NOTHING;
