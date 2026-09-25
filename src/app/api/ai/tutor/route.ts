import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { TutorRequestBody, TutorResponse, TutorTask, TutorMode } from "@/types/tutor";

// Stream titles in Arabic
const STREAM_TITLES: Record<string, string> = {
  sciences_exp: "شعبة العلوم التجريبية",
  math: "شعبة الرياضيات",
  technique_math: "شعبة تقني رياضي",
  lettres_philo: "شعبة آداب وفلسفة",
  gestion_eco: "شعبة تسيير واقتصاد",
  langues: "شعبة لغات أجنبية",
};

/**
 * Builds the pedagogical system instruction for the Algerian Baccalaureate AI Tutor
 */
function buildSystemInstruction(streamId?: string, mode?: TutorMode, subjectId?: string): string {
  const streamName = streamId ? STREAM_TITLES[streamId] || streamId : "جميع الشعب (الطور الثانوي)";

  return `أنت "الأستاذ الذكي" (Smart Baccalaureate Tutor)، الموجه البيداغوجي المتميز لطلاب شهادة البكالوريا في الجزائر.
الشعبة المستهدفة للطالب حالياً: ${streamName}.
${subjectId ? `المادة المحددة: ${subjectId}.` : ""}
النمط التعليمي النشط: ${mode || "general"}.

مبادئك وقواعدك التعليمية الصارمة:
1. الأسلوب واللغة:
   - تحدث بالعربية الفصحى التعليمية السلسة والمشجعة، المألوفة لدى التلميذ الجزائري.
   - ابتعد تماماً عن الإجابات الطويلة والمملة (لا تكتب جرائد نصوص لا تنتهي).
   - قسّم كلامك دائماً إلى فقرات قصيرة، نقاط محددة (Bullet points)، وعناوين واضحة.

2. المنهجية السقراطية التفاعلية:
   - اشرح خطوة بخطوة بالمنطق والتبسيط قبل التجريد.
   - اختم كلامك دائماً بـ "سؤال التحقق الفوري" (سؤال تفاعلي قصير ومباشر) لتتأكد من استيعاب الطالب قبل الانتقال للخطوة التالية.

3. معايير البكالوريا الجزائرية الرسمية:
   - التزم تماماً بمصطلحات المنهاج الجزائري الرسمي وسلالم التنقيط الوزارية.
   - في العلوم الطبيعية: فرّق بين الأفعال الأدائية (حلل، فسر، صادق على صحة الفرضية، بيّن في نص علمي).
   - في الفلسفة: التزم بخطوات الطرق الرسمية (مقارنة، جدلية، استقصاء بالوضع، تحليل نص).
   - في الرياضيات والفيزياء: شدد على مجموعة التعريف، الوحدات الفيزيائية الدولية، كتابة القوانين الحرفية قبل التعويض العددي.

4. الأنماط التخصصية:
   - [explain]: بسّط الفكرة بمثال ملموس، اربطها بالمنهاج، ونبّه للفخ النمطي.
   - [recite - التسميع الذكي]: اختبر الطالب في تواريخ، شخصيات، مصطلحات جغرافيا، أو آيات وأحكام شريعة، وتأكد من ذكر الكلمات المفتاحية الوزارية وأخبره بما نسيه.
   - [feynman - تقنية فاينمان]: استمع لشرح الطالب لأي مفهوم، ثم قيّم شرحه بنقاط قوة، ونقاط ضعف، وتصحيح للمصطلحات المغلوطة.
   - [quiz - كويز سريع]: اطرح 3 أسئلة دقيقة مباشرة مأخوذة من روح البكالوريات السابقة.
   - [methodology - المنهجية]: فكك هيكل الإجابة النموذجية الوزارية وكيفية كسب النقاط الجزئية في سلم التصحيح.
   - [task]: عيّن مهمة دراسية دقيقة ومحددة لتثبيت الفهم.

5. تعيين المهام العملية المباشرة (Direct Action Task):
   عندما يطلب الطالب مهمة أو عندما ترى أنه يحتاج لتطبيق فوري لتثبيت فكرة معينة، اقترح تمرين محدد جداً من أرشيف البكالوريات الجزائرية أو المنهاج، وضعه في نهاية الرد داخل قالب المهمة التالي حرفياً:
   :::task
   {
     "title": "حل تمرين الدارة RC من بكالوريا 2022 (الموضوع الأول)",
     "subjectId": "physics",
     "minutes": 30,
     "reason": "تثبيت قانون جمع التوترات ورسم المنحنيات البيانية وتعيين ثابت الزمن"
   }
   :::`;
}

/**
 * Parses :::task { ... } ::: block from text
 */
function extractTaskFromReply(text: string): { cleanReply: string; suggestedTask: TutorTask | null } {
  const taskRegex = /:::task\s*([\s\S]*?)\s*:::/;
  const match = text.match(taskRegex);

  if (!match) {
    return { cleanReply: text, suggestedTask: null };
  }

  let suggestedTask: TutorTask | null = null;
  try {
    const rawJson = match[1].trim();
    const parsed = JSON.parse(rawJson);
    if (parsed.title) {
      suggestedTask = {
        title: parsed.title,
        subjectId: parsed.subjectId || "general",
        minutes: Number(parsed.minutes) || 25,
        reason: parsed.reason || "تثبيت ومراجعة المفهوم المطلوب",
      };
    }
  } catch (err) {
    console.warn("[Tutor API] Failed to parse task JSON from LLM output:", err);
  }

  // Remove the raw task block from the visible user reply
  const cleanReply = text.replace(taskRegex, "").trim();

  return { cleanReply, suggestedTask };
}

/**
 * Built-in Algerian Baccalaureate Pedagogical Engine (Fallback when no API key configured)
 */
function generateLocalExpertReply(
  userQuery: string,
  mode: TutorMode = "general",
  streamId: string = "sciences_exp"
): { reply: string; suggestedTask: TutorTask | null } {
  const q = userQuery.toLowerCase();

  // Mode: Recite (التسميع الذكي)
  if (mode === "recite" || q.includes("سمع") || q.includes("تسميع") || q.includes("اختبر حفظي")) {
    if (q.includes("تاريخ") || q.includes("شخصي") || q.includes("مؤتمر") || q.includes("حرب باردة")) {
      return {
        reply: `### 🧠 جلسة التسميع الذكي — مادة التاريخ (الوحدة الأولى)

ممتاز يا بطل! لنتحقق فوراً من الكلمات المفتاحية والتواريخ الوزارية الحاسمة:

1. **ما هو التاريخ الدقيق لمؤتمر يالطا؟ ومن هم القادة الثلاثة الذين حضروه؟**
2. **عرّف مبدأ ترومان (12 مارس 1947) مع ذكر قيمته المالية والهدف الخفي منه.**
3. **ما هي الشخصية السوفياتية صاحبة مبادرة "التعايش السلمي" لعام 1956؟**

✍️ **أجب الآن بنقاط مختصرة وسأقوم بتدقيق كلماتك المفتاحية وإعطائك العلامة الوزارية.**`,
        suggestedTask: {
          title: "حفظ ومراجعة تواريخ الوحدة الأولى (1945-1953)",
          subjectId: "history",
          minutes: 20,
          reason: "تثبيت تواريخ الأزمات والمشاريع الاقتصادية لتفادي الخلط في ورقة الامتحان",
        },
      };
    }

    if (q.includes("شريعة") || q.includes("إسلامية") || q.includes("مقاصد")) {
      return {
        reply: `### 🧠 جلسة التسميع الذكي — العلوم الإسلامية (مقاصد الشريعة)

أهلاً بك! هذا الدرس من أكثر الدروس وروداً في البكالوريا، سأختبرك في المصطلحات والترتيب الأصولي:

1. **عرّف مقاصد الشريعة اصطلاحاً.**
2. **رتّب الكليات الخمس في المقاصد الضرورية ترتيباً تنازلياً حسب الأولوية.**
3. **ما هو المقصد الشرعي من تشريع عقوبة القصاص؟ مع ذكر الدليل.**

✍️ **اكتب إجابتك، وسأدقق معك الكلمات المفتاحية التي يطلبها المصحح الوزاري حرفياً.**`,
        suggestedTask: {
          title: "مراجعة جدول مقاصد الشريعة والضروريات الخمس",
          subjectId: "islamic",
          minutes: 15,
          reason: "حفظ الكليات الخمس والتمييز بين الضروري والحاجي والتحسيني بأدلتها",
        },
      };
    }
  }

  // Mode: Feynman (تقنية فاينمان - اشرحلي ونقيّمك)
  if (mode === "feynman" || q.includes("فاينمان") || q.includes("اشرح لك") || q.includes("قيمني")) {
    return {
      reply: `### 💡 مختبر تقنية فاينمان (The Feynman Challenge)

أهلاً بك يا بطل! أفضل طريقة لتتأكد أنك هضمت الفكرة 100% هي أن **تشرحها لي كأنني طالب مبتدئ يسمع بها لأول مرة**:

- تجنب نسخ ولصق التعريف الحرفي؛ استخدم كلماتك الخاصة ومثالاً ملموساً.
- بعد أن تكتب شرحك، سأقوم بتقييمك على **3 معايير وزارية**:
  1. وضوح الفكرة وبساطتها (هل فهمت جوهرها؟).
  2. الدقة العلمية والمصطلحات الدقيقة المطلوبة في البكالوريا.
  3. كشف أي ثغرة أو وهم فهم (Illusion of competence).

👉 **عن أي درس أو فكرة تريد أن تشرح لي الآن؟ (مثلاً: الانقسام الخيطي، الدارة RC، الميزان التجاري، الحرية والحتمية...)**`,
      suggestedTask: null,
    };
  }

  // Mode: Methodology (المنهجية الرسمية)
  if (mode === "methodology" || q.includes("منهجية") || q.includes("تحليل") || q.includes("استدلال") || q.includes("مقالة")) {
    return {
      reply: `### 🔍 المنهجية الرسمية للبكالوريا الجزائرية (دليل التميز)

لكل مادة مفتاح سري في سلم التنقيط الوزاري، إليك ركائز المنهجية:

1. **العلوم الطبيعية (الاستدلال العلمي والمسعى العلمي):**
   - **التحليل (0.5 إلى 1 ن):** لا تكرر الوثيقة! قسّم الملاحظة إلى معطيات + دلالة، ثم اختم بـ **استنتاج صريح**.
   - **التفسير:** الإجابة عن سؤال "كيف ولماذا؟" بربط الملاحظة بالآلية البيولوجية.
   - **المسعى العلمي (التمرين الثالث 8ن):** اقتراح فرضية دقيقة قابلة للاختبار، ثم استغلال الوثائق بشكل مدمج لمصادقة الفرضية.

2. **الفلسفة (طريقة المقارنة والجدلية):**
   - في الجدلية: احذر السقوط في الموقف الواحد! اعرض الأطروحة بحججها وأمثلتها وأقوال الفلاسفة، ثم النقد المؤسس، ثم نقيض الأطروحة بنقده، وأخيراً **التركيب المبرر**.
   - تجنب إبداء رأي شخصي عاطفي دون تعليل فلسفي دقيق.

🎯 **سؤال التحقق الفوري:** في مادة العلوم، ما هو الفارق الجوهري بين عبارة "التحليل" وعبارة "الاستنتاج" في الوثيقة البيانية؟`,
      suggestedTask: {
        title: "تطبيق منهجية الاستدلال العلمي على تمرين BAC 2023",
        subjectId: "natural_sciences",
        minutes: 35,
        reason: "التدرب على صياغة الاستنتاج وربط المؤشرات البيانية بالسياق البيولوجي",
      },
    };
  }

  // Physics / RC Circuits
  if (q.includes("rc") || q.includes("مكثفة") || q.includes("دارة") || q.includes("تفريغ")) {
    return {
      reply: `### ⚡ فيزياء البكالوريا: ثنائي القطب RC (شحن وتفريغ مكثفة)

أهلاً بك! دارة $RC$ هي تمرين كلاسيكي مضمون النقاط في البكالوريا إذا أتقنت الخطوات المنهجية الثلاث:

#### 1. المعادلة التفاضلية بدلالة توتر المكثفة $u_C(t)$:
- نطبق **قانون جمع التوترات**:
  $$u_R(t) + u_C(t) = E$$
- قانون أوم: $u_R = R \\cdot i$
- وشدة التيار: $i = \\frac{dq}{dt} = C \\cdot \\frac{du_C}{dt}$
- بالتعويض نحصل على المعادلة التفاضلية الشهيرة:
  $$\\frac{du_C}{dt} + \\frac{1}{R \\cdot C} u_C(t) = \\frac{E}{R \\cdot C}$$
- حيث $\\tau = R \\cdot C$ يمثل **ثابت الزمن** (بالثانية $s$).

#### 2. الفخ الوزاري المتكرر ⚠️:
- عند إيجاد $\\tau$ بيانياً: بطريقة المماس عند $t=0$، أو طريقة $0.63 E$ في الشحن، و $0.37 E$ في التفريغ. احذر نسيان تحويل الميلي ثانية $ms$ إلى ثانية $s$!

🎯 **سؤال التحقق الفوري:** أثبت بالتحليل البعدي أن المقدار $\\tau = R \\cdot C$ متجانس مع الزمن وله بعد زمني $[T]$؟`,
      suggestedTask: {
        title: "حل تمرين الدارة RC من بكالوريا 2022 (الموضوع الأول)",
        subjectId: "physics",
        minutes: 30,
        reason: "تثبيت قانون جمع التوترات، التحليل البعدي لثابت الزمن، وقراءة المنحنى البياني",
      },
    };
  }

  // Natural Sciences / Protein Synthesis
  if (q.includes("بروتين") || q.includes("استنساخ") || q.includes("ترجمة") || q.includes("adn") || q.includes("arn")) {
    return {
      reply: `### 🧬 علوم الطبيعة والحياة: آليات تركيب البروتين

تركيب البروتين عند حقيقيات النوى يمر بمرحلتين أساسيتين متتابعتين:

1. **المرحلة الأولى: الاستنساخ (Transcription) — مقرها النواة:**
   - بوجود إنزيم **ARN بوليميراز** والطاقة $ATP$ والنيكليوتيدات الريبية الحرة.
   - يتم قراءة السلسلة الناسخة ($3' \\to 5'$) لتركيب جزيئة $ARNm$ مكملة لها ($5' \\to 3'$).
   - يتم استبدال القاعدة التايمين $T$ باليوراسيل $U$.

2. **المرحلة الثانية: الترجمة (Translation) — مقرها الهيولى:**
   - تتطلب: $ARNm$، ريبوزومات وظيفية، $ARNt$ نوعي حامل للحمض الأميني، وطاقة.
   - تمر بـ 3 أطوار: **الانطلاق** (رامزة البداية $AUG$ حمض الميثيونين)، **الاستطالة** (تشكيل الروابط الببتيدية وإزاحة الريبوزوم بمقدار رامزة)، و**النهاية** (إحدى رامزات التوقف $UAA, UAG, UGA$).

🎯 **سؤال التحقق الفوري:** لماذا يتم تشكيل بولي ريبوزوم (Polysome) في الخلية بدلاً من ريبوزوم مفرد؟ وما هي الفائدة الحيوية منه؟`,
      suggestedTask: {
        title: "رسم مخطط تحصيلي شامل لمرحلتي الاستنساخ والترجمة",
        subjectId: "natural_sciences",
        minutes: 25,
        reason: "التمكن من رسم البيانات العلمية الدقيقة المطلوبة في أسئلة الاسترجاع المنظم للمعرفة",
      },
    };
  }

  // Mathematics / Functions & Limits
  if (q.includes("دوال") || q.includes("رياضيات") || q.includes("لوغاريتم") || q.includes("أسية") || q.includes("نهايات")) {
    return {
      reply: `### 📐 رياضيات البكالوريا: دراسة الدوال الأسية واللوغاريتمية

لكسب العلامة الكاملة في مسألة الدوال (التي تمثل عادة 7 إلى 8 نقاط كاملة):

1. **الخطوة الأولى الإلزامية: مجموعة التعريف $D_f$:**
   - للدالة الأسية $e^{u(x)}$: معرفة حيث $u(x)$ معرفة.
   - للدالة اللوغاريتمية $\\ln(u(x))$: شرط قاطع لا تنازل عنه: $u(x) > 0$ تماماً!

2. **حالات عدم التعيين الأربع:**
   - $\\frac{0}{0}$ ، $\\frac{\\infty}{\\infty}$ ، $0 \\times \\infty$ ، $+\\infty - \\infty$.
   - التخلص منها يتم غالباً بـ: إخراج العامل المشترك، الضرب في المرافق، أو استعمال **التزايد المقارن**:
     $$\\lim_{x \\to +\\infty} \\frac{e^x}{x^n} = +\\infty \\quad , \\quad \\lim_{x \\to +\\infty} \\frac{\\ln x}{x^n} = 0$$

🎯 **سؤال التحقق الفوري:** احسب النهاية التالية مع التعليل: $\\lim_{x \\to 0^+} x \\cdot \\ln(x)$؟`,
      suggestedTask: {
        title: "حل مسألة دالة أسية كاملة من بكالوريا 2021",
        subjectId: "math",
        minutes: 40,
        reason: "التدرب على التزايد المقارن، مبرهنة القيم المتوسطة، والمستقيمات المقاربة المائلة",
      },
    };
  }

  // Default Socratic Response
  return {
    reply: `### 🎓 مرحباً بك يا بطل في فضاء "الأستاذ الذكي"!

أنا هنا لأرافقك خطوة بخطوة نحو معدل التفوق في شهادة البكالوريا (${STREAM_TITLES[streamId] || "الطور الثانوي"}).

ما الذي تريد أن نركز عليه في هذه الجلسة؟
- 🎓 **اشرحلي درس / فكرة صعبة:** تفكيك وتبسيط أي قانون أو مفهوم علمي.
- 🧠 **التسميع الذكي:** اختبار في التواريخ، المصطلحات، أو الشريعة الإسلامية.
- 📝 **مهمة تطبيقية لليوم:** تمرين موجه من أرشيف البكالوريات السابقة لإضافته لمهامك اليومية.
- 🔍 **تدريب على المنهجية:** كيف تصيغ إجابتك لتنال العلامة الكاملة في سلم التصحيح.

👉 **اكتب سؤالك أو موضوع الدرس وسنبدأ فوراً خطوة بخطوة!**`,
    suggestedTask: {
      title: "جلسة مراجعة مركزة وتحديد نقاط الضعف",
      subjectId: "general",
      minutes: 25,
      reason: "تحديد أولويات المذاكرة وبدء أول تمرين منهجي مع الأستاذ الذكي",
    },
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as TutorRequestBody;
    const { messages = [], mode = "general", streamId = "sciences_exp", subjectId, lessonContext, clientApiKey } = body;

    const apiKey =
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_GENAI_API_KEY ||
      clientApiKey ||
      "";

    const lastUserMessage = messages.filter((m) => m.role === "user").pop()?.content || "";

    // 1. Try Gemini API via @google/genai if API key is provided
    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const systemInstruction = buildSystemInstruction(streamId, mode, subjectId);

        // Convert chat messages to gemini format
        const prompt = `${systemInstruction}\n\nالسياق الحالي إن وجد: ${lessonContext || "غير محدد"}\n\nسؤال التلميذ الأخير:\n${lastUserMessage}`;

        const modelName = "gemini-2.5-flash";

        const response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
        });

        const replyText = response.text || "";

        if (replyText.trim().length > 0) {
          const { cleanReply, suggestedTask } = extractTaskFromReply(replyText);
          const result: TutorResponse = {
            reply: cleanReply,
            suggestedTask,
            mode,
            provider: "gemini",
          };
          return NextResponse.json(result);
        }
      } catch (geminiError: any) {
        console.warn("[Tutor API] Gemini call failed, falling back to local pedagogical engine:", geminiError?.message || geminiError);
      }
    }

    // 2. High-Fidelity Local Pedagogical Expert Fallback (Zero-failure guarantee)
    const { reply, suggestedTask } = generateLocalExpertReply(lastUserMessage, mode, streamId);

    const result: TutorResponse = {
      reply,
      suggestedTask,
      mode,
      provider: "local_expert",
    };

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[Tutor API] Global error:", error);
    return NextResponse.json(
      {
        reply: "عذراً يا بطل، حدث خطأ مؤقت في الاتصال بالأستاذ الذكي. يرجى إعادة المحاولة.",
        suggestedTask: null,
        mode: "general",
        provider: "local_expert",
      } as TutorResponse,
      { status: 500 }
    );
  }
}
