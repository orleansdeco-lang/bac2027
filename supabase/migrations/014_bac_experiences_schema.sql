-- ==============================================================================
-- 014_bac_experiences_schema.sql
-- Migration: "بنك التجارب والعِبر" (Bac Experience & Alum Wisdom Hub)
-- ==============================================================================

-- 1. Create enum/check-compliant table: public.bac_experiences
CREATE TABLE IF NOT EXISTS public.bac_experiences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    author_name TEXT NOT NULL,
    author_role TEXT NOT NULL CHECK (author_role IN ('top_achiever', 'repeater_success', 'student')),
    stream_id TEXT NOT NULL,
    final_grade NUMERIC(4,2),
    initial_grade NUMERIC(4,2),
    target_major TEXT,
    biggest_trap TEXT NOT NULL,
    winning_routine TEXT NOT NULL,
    best_resources TEXT,
    upvotes_count INTEGER NOT NULL DEFAULT 0,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Create table: public.experience_upvotes
CREATE TABLE IF NOT EXISTS public.experience_upvotes (
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    experience_id UUID NOT NULL REFERENCES public.bac_experiences(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, experience_id)
);

-- 3. Helpful indexes for fast querying & ranking
CREATE INDEX IF NOT EXISTS idx_bac_experiences_stream_id ON public.bac_experiences(stream_id);
CREATE INDEX IF NOT EXISTS idx_bac_experiences_author_role ON public.bac_experiences(author_role);
CREATE INDEX IF NOT EXISTS idx_bac_experiences_upvotes_count ON public.bac_experiences(upvotes_count DESC);
CREATE INDEX IF NOT EXISTS idx_bac_experiences_created_at ON public.bac_experiences(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_experience_upvotes_experience_id ON public.experience_upvotes(experience_id);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.bac_experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experience_upvotes ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for public.bac_experiences
-- Public SELECT for everyone (both authenticated and guests)
CREATE POLICY "Public experiences are viewable by everyone"
    ON public.bac_experiences
    FOR SELECT
    USING (true);

-- Authenticated users can insert their own experience
CREATE POLICY "Authenticated users can submit experience"
    ON public.bac_experiences
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = author_id OR author_id IS NULL);

-- Authors can update their own experience
CREATE POLICY "Authors can update their own experience"
    ON public.bac_experiences
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = author_id)
    WITH CHECK (auth.uid() = author_id);

-- Authors can delete their own experience
CREATE POLICY "Authors can delete their own experience"
    ON public.bac_experiences
    FOR DELETE
    TO authenticated
    USING (auth.uid() = author_id);

-- 6. RLS Policies for public.experience_upvotes
-- Everyone can view upvote records
CREATE POLICY "Upvotes are viewable by everyone"
    ON public.experience_upvotes
    FOR SELECT
    USING (true);

-- Authenticated users can upvote
CREATE POLICY "Users can manage their own upvotes"
    ON public.experience_upvotes
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own upvotes"
    ON public.experience_upvotes
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- 7. Trigger Function to automatically keep upvotes_count in sync
CREATE OR REPLACE FUNCTION public.handle_experience_upvote_sync()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE public.bac_experiences
        SET upvotes_count = upvotes_count + 1
        WHERE id = NEW.experience_id;
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE public.bac_experiences
        SET upvotes_count = GREATEST(0, upvotes_count - 1)
        WHERE id = OLD.experience_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_sync_experience_upvotes ON public.experience_upvotes;
CREATE TRIGGER trg_sync_experience_upvotes
    AFTER INSERT OR DELETE ON public.experience_upvotes
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_experience_upvote_sync();

-- 8. Seed Curated Authentic Algerian BAC Experiences (Seed Data)
INSERT INTO public.bac_experiences (
    id, author_name, author_role, stream_id, final_grade, initial_grade, target_major,
    biggest_trap, winning_routine, best_resources, upvotes_count, is_verified
) VALUES
(
    '00000000-0000-0000-0000-000000000001',
    'ياسمين. ب (ولاية قسنطينة)',
    'top_achiever',
    'sciences',
    18.64,
    NULL,
    'طب بشري (Faculté de Médecine)',
    'الفخ الأكبر كان تكديس الكراريس وحفظ حلول التمارين بدل فهم منهجية التحليل والاستدلال العلمي في العلوم. كنت أظن أن حفظ 50 تمريناً سيضمن لي 20، بينما الامتحان فاجأنا بوضعية مركبة تتطلب الربط بين المعطيات وصياغة فرضية منطقية.',
    'روتين 3 ساعات يومياً لحل تمارين البكالوريا السابقة فقط وفق سلم التنقيط الوزاري الرسمي، مع كتابة محاولتي كاملة قبل النظر للحل وتحديد الكلمات المفتاحية في الاسترجاع المنظم للمعارف.',
    'الأستاذ بوالريش في العلوم الطبيعية، الأستاذ نور الدين في الرياضيات، وكتاب المراجعة النهائية في الفيزياء.',
    142,
    true
),
(
    '00000000-0000-0000-0000-000000000002',
    'أكرم. م (ولاية الجزائر)',
    'repeater_success',
    'math',
    17.85,
    11.40,
    'المدرسة الوطنية العليا للإعلام الآلي (ESI Alger)',
    'في البكالوريا الأولى كنت أدرس 12 ساعة عشوائياً، أسهر طويلاً وأهمل المواد الأدبية (اللغة العربية، الفلسفة والفرنسية) معتقداً أن الرياضيات والفيزياء ستنقذاني وحدهما. سقطت بسبب معامل اللغة العربية والفلسفة.',
    'النوم المنضبط الساعة 22:30 والاستيقاظ في الفجر. خصصت أول ساعتين كل صباح لحفظ وفهم مادة حفظ واحدة يومياً بالتناوب، فارتفعت علامة الفلسفة من 08 إلى 15.5 والعربية من 09 إلى 16.',
    'الأستاذ طيبي في الرياضيات (ثانوية الرياضيات بالقبة)، الأستاذ قزوري في الفيزياء، وقناة خليل سعيداني في الفلسفة.',
    289,
    true
),
(
    '00000000-0000-0000-0000-000000000003',
    'أيمن. ك (ولاية باتنة)',
    'top_achiever',
    'technique_math',
    18.12,
    NULL,
    'المدرسة الوطنية العليا للذكاء الاصطناعي (ENSIA)',
    'الانجراف وراء التمارين المعقدة والخارجة تماماً عن المنهاج الوزاري والنزول في دوامة الإحباط. مواضيع البكالوريا الرسمية أسهل بكثير وأكثر دقة مما يضعه بعض الأساتذة الخصوصيين لإبهار الطلاب.',
    'التركيز على فهم درس التكنولوجيا (هندسة ميكانيكية) ومطابقته بدقة مع مخططات أوتوكاد وسلسلة الأبعاد. قمت بحل جميع بكالوريات التكنولوجيا من 2008 إلى 2024 مرتين.',
    'سلاسل الأستاذ بومعزة في الهندسة الميكانيكية، وموقع بنك مواضيع DzExams للتقني رياضي.',
    98,
    true
),
(
    '00000000-0000-0000-0000-000000000004',
    'خولة. س (ولاية سطيف)',
    'repeater_success',
    'gestion_economie',
    16.74,
    10.22,
    'المدرسة العليا للتجارة (ESC Alger)',
    'حفظ قيود اليومية دون فهم مبدأ القيد المزدوج والمنطق المحاسبي، وإهمال مادة الرياضيات والتاريخ والجغرافيا لأنني كنت أظن المحاسبة وحدها تكفي للنجاح.',
    'كل يوم جمعة كنت أنجز ميزانية وظيفية وجدول حسابات النتائج كاملاً بيدي دون آلة حاسبة معقدة، مع حفظ مصطلحات الاقتصاد بالخرائط الذهنية وتلخيص الشخصيات والتواريخ في بطاقات جيب ملونة.',
    'الأستاذ بوعبد الله في التسيير المحاسبي والمالي، وتطبيقات الخرائط الذهنية في الجغرافيا.',
    175,
    true
),
(
    '00000000-0000-0000-0000-000000000005',
    'مريم. ر (ولاية وهران)',
    'top_achiever',
    'lettres_philo',
    16.92,
    NULL,
    'المدرسة العليا للأساتذة - لغة عربية وآدابها (ENS)',
    'حفظ مقالات الفلسفة كلمة بكلمة كالببغاء! عندما غيّروا صيغة السؤال في البكالوريا ارتبك زملاؤي لأنهم لم يتعلموا التفكيك المفهومي للسؤال والمقارنة الجدلية.',
    'صناعة مخطط المقالة بنفسي (المقدمة، الموقف الأول وحججه، النقد، الموقف الثاني وحججه، النقد، والتركيب الشخصي المؤسس). هذا جعلني أكتب مقالة فلسفية أصيلة نلت عليها 17/20.',
    'الأستاذ شريفي خليل في الفلسفة، والأستاذ حيقون في الأدب العربي.',
    124,
    true
),
(
    '00000000-0000-0000-0000-000000000006',
    'سليم. ن (ولاية تيزي وزو)',
    'top_achiever',
    'langues_etrangeres',
    17.40,
    NULL,
    'ترجمة ولغات تطبيقية (Université d Alger)',
    'إهمال مهارة التعبير الكتابي (Production Écrite) والتركيز فقط على أسئلة النص وقواعد النحو، بينما التعبير يمثل ثلث النقطة الكاملة في اللغات الأجنبية.',
    'كتابة فقرة باللغة الإسبانية والفرنسية كل يومين وعرضها على أستاذ التصحيح لتصحيح الأخطاء المتكررة في التصريف واستعمال أدوات الربط (Connecteurs logiques).',
    'مواضيع البكالوريات الأجنبية وقنوات البودكاست التعليمية باللغات الإسبانية والإنجليزية.',
    88,
    true
)
ON CONFLICT (id) DO NOTHING;
