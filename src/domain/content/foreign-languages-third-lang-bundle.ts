/**
 * BAC 2026/2027 Production Foreign Languages & Literature Bundle
 * Stream: Langues Étrangères & Lettres et Philosophie (Batch 05)
 * Subjects: Arabic Literature, Spanish, German, Advanced Philosophy
 * File: src/domain/content/foreign-languages-third-lang-bundle.ts
 */

import { Skill } from "./types";
import { StreamId, SubjectId } from "@/types/education";

export interface Batch5LiteratureLanguagesPayload {
  skillId: string;
  subject: string;
  subjectNameAr: string;
  stream: string;
  coefficient: number;
  direction: 'rtl' | 'ltr';
  unitAr: string;
  titleAr: string;
  bloomLevel: 'apply' | 'analyze' | 'evaluate';
  theory: {
    summary: string;
    keyTakeaways: string[];
    commonPitfalls: string[];
  };
  practice: {
    question: string;
    options: Array<{ id: string; text: string; isCorrect: boolean }>;
    explanationStepByStep: string;
  };
  isomorphicRetest: {
    question: string;
    options: Array<{ id: string; text: string; isCorrect: boolean }>;
    repairGuide: string;
  };
}

export type SkillLearningBundle = Batch5LiteratureLanguagesPayload;

export const BATCH5_LITERATURE_LANGUAGES_BUNDLE: Record<string, Batch5LiteratureLanguagesPayload> = {
  "ar_poetry_commit_liberation": {
    "skillId": "ar_poetry_commit_liberation",
    "subject": "arabic",
    "subjectNameAr": "اللغة العربية وآدابها",
    "stream": "lettres_langues",
    "coefficient": 6,
    "direction": "rtl",
    "unitAr": "قضايا الشعر العربي المعاصر: التحرر والسياسة",
    "titleAr": "ظاهرة الالتزام والشعر السياسي والقومي التحرري (مفدي زكريا، محمود درويش)",
    "bloomLevel": "analyze",
    "theory": {
      "summary": "الالتزام هو أن يسخر الأديب قلمه وفكره لمعالجة قضايا وطنه وأمته سياسياً واجتماعياً، فيتبنى هموم شعبه، يشاركهم آلامهم وآمالهم، ويقترح الحلول ويدعو للتغيير متحملاً كامل المسؤولية. يكثر في الشعر الثوري التحرري (الثورة الجزائرية والقضية الفلسطينية) مع توظيف النبرة الحماسية وضمائر الجمع (نحن، نا الفاعلين).",
      "keyTakeaways": [
        "مفهوم الالتزام: تسخير الشاعر فنه لخدمة قضايا مجتمعه وأمته بدافع الواجب والمسؤولية الأخلاقية والوطنية.",
        "مظاهر الالتزام في النص: 1) معالجة قضية تحررية سياسية، 2) هيمنة ضمير المتكلم الجمعي (نحن، نا) الدال على الانصهار في الشعب، 3) الكشف عن آلام الشعب والدعوة للثورة ومقاومة المستعمر، 4) اقتراح الحلول ورسم أفق النصر والحرية.",
        "الفرق بين الالتزام والإلزام: الالتزام نابع من إرادة الأديب وحريته واقتناعه الذاتي؛ أما الإلزام فهو إكراه وضغط خارجي تفرضه السلطة أو جهة خارجية.",
        "رواد الشعر التحرري المقرّرون: مفدي زكريا، محمد الصالح باوية، سليمان العيسى، محمود درويش، وسميح القاسم."
      ],
      "commonPitfalls": [
        "الخلط بين مفهوم 'الالتزام' ومجرد 'العاطفة الوطنية'؛ فالشاعر الملتزم لا يكتفي بوصف حبه لوطنه، بل يشارك في الصراع، يدين الاستعمار، ويقدم خطة خلاص لشعبه.",
        "إغفال ذكر القرائن النصية (مثل الأفعال الدالة على الثورة وضمائر الجمع) عند الإجابة عن سؤال: 'هل الشاعر ملتزم؟ علل'."
      ]
    },
    "practice": {
      "question": "يقول مفدي زكريا في إلياذة الجزائر:\n«شَغَلْنَا الوَرَى، ومَلأْنَا الدُّنَى ... بشِعْرٍ نُرَدِّدُهُ كالصَّلاَة\nتَسَامَى يُعَانِقُ هَامَ السَّحَابِ ... ويَهْزَأُ بالصَّاعِقَاتِ الرِّمَام\nوعَقْدُ العَزِيمَةِ أَنْ تَحْيَا الجَزَائِرُ ... فَاشْهَدُوا... فَاشْهَدُوا... فَاشْهَدُوا!»\nما هي أبرز قرينة دالة على ظاهرة الالتزام في هذه الأبيات؟",
      "options": [
        {
          "id": "opt_a",
          "text": "هيمنة ضمير المتكلم الجمعي (نا) في (شغلنا، ملأنا، عقدنا) للتعبير عن انصهار ذات الشاعر في إرادة أمته وتقرير مصيرها الثوري.",
          "isCorrect": true
        },
        {
          "id": "opt_b",
          "text": "استعمال الشاعر للمحسنات البديعية اللفظية بغرض إمتاع القارئ موسيقياً فقط.",
          "isCorrect": false
        },
        {
          "id": "opt_c",
          "text": "مدح القادة والزعماء التاريخيين للحصول على المكانة السياسية في الدولة.",
          "isCorrect": false
        },
        {
          "id": "opt_d",
          "text": "الهروب إلى الطبيعة واستنطاق عناصرها بحثاً عن الطمأنينة الفردية.",
          "isCorrect": false
        }
      ],
      "explanationStepByStep": "1) الشاعر لا يتحدث بصيغة الأنا الفردية المعزولة، بل بصيغة الجمع 'نا' (شغلنا، ملأنا).\n2) هذا التوظيف يثبت انصهار الشاعر الملتزم في ضمير الجماعة الوطنية وتبنيه الكامل لقضية تحرير الجزائر، مع القسم الحاسم 'أن تحيا الجزائر' الذي يمثل غاية الالتزام النضالي."
    },
    "isomorphicRetest": {
      "question": "في سؤال البكالوريا: 'هل ترى الشاعر ملتزماً بقضايا أمته؟ وكيف تعلل ذلك؟' أي الإجابات التالية هي الإجابة النموذجية المعتمدة في التصحيح الوزاري؟",
      "options": [
        {
          "id": "iso_a",
          "text": "نعم، الشاعر ملتزم لأنه سخر قلمه لتبني قضية شعبه العادلة، والدليل توظيفه ضمير الجمع، واقتراحه التحرر بالثورة حلاً حتمياً.",
          "isCorrect": true
        },
        {
          "id": "iso_b",
          "text": "نعم، الشاعر ملزم لأن المستعمر فرض عليه كتابة هذه القصيدة تحت التهديد العسكري.",
          "isCorrect": false
        },
        {
          "id": "iso_c",
          "text": "لا، ليس ملتزماً لأن الشعر الحقيقي يجب أن يكون ذاتياً ووجدانياً بعيداً عن القضايا القومية.",
          "isCorrect": false
        },
        {
          "id": "iso_d",
          "text": "الشاعر ملتزم فقط إذا كان النص نثرياً خالياً من الوزن والقافية الخليليين.",
          "isCorrect": false
        }
      ],
      "repairGuide": "في البكالوريا الجزائرية، التعليل الكامل للالتزام يتطلب ذكر أربعة عناصر: 1) القضية المعالجة (وطنية أو قومية)، 2) موقف الشاعر منها (المساندة والدفاع)، 3) ضمائر الجمع الدالة على الانتماء، 4) الهدف والحل المرتجى (النصر والتحرر)."
    }
  },
  "ar_rhetoric_cohesion_coherence": {
    "skillId": "ar_rhetoric_cohesion_coherence",
    "subject": "arabic",
    "subjectNameAr": "اللغة العربية وآدابها",
    "stream": "lettres_langues",
    "coefficient": 6,
    "direction": "rtl",
    "unitAr": "البناء اللغوي: مظاهر الاتساق والانسجام والإحالة النصية",
    "titleAr": "مظاهر الاتساق والانسجام، الروابط المنطقية والإحالة النصية بنوعيها",
    "bloomLevel": "apply",
    "theory": {
      "summary": "الاتساق هو التماسك اللفظي والتركيبي بين جمل النص وعناصره عبر وسائل لغوية (حروف العطف، أسماء الإشارة، الأسماء الموصولة، والضمائر). أما الانسجام فهو التماسك الدلالي والمعنوي بين أفكار النص ووحدته الموضوعية والعضوية. الإحالة تنقسم إلى: إحالة قبلية (العودة إلى عنصر مذكور سابقاً) وإحالة بعدية (الإشارة إلى عنصر يذكر لاحقاً).",
      "keyTakeaways": [
        "أدوات الاتساق اللغوي: 1) الربط النحوي بالحروف (العطف، الجر، التوكيد)، 2) الربط بالإحالة (الضمائر المتصلة والمنفصلة والمستترة، أسماء الإشارة، الأسماء الموصولة)، 3) الربط المعجمي (التكرار والترادف والتضاد والحقول الدلالية).",
        "أنواع الإحالة النصية: إحالة قبلية (تذكر اللفظ ثم تعود عليه بضمير أو اسم إشارة)، وإحالة بعدية (تذكر اسم الإشارة أو الضمير ثم يليه الاسم المفسر له مثل: هذا الوطنُ).",
        "دور الإحالة والاتساق: تفادي التكرار الممل، تثبيت المعنى في ذهن المتلقي، والمساهمة في تحقيق اللحمة النصية والترابط البنيوي.",
        "الانسجام: يتحقق بالوحدة الموضوعية (موضوع واحد)، والوحدة الفكرية (تسلسل الأفكار منطقياً وفق مبدأ السبب والنتيجة والإجمال ثم التفصيل)."
      ],
      "commonPitfalls": [
        "الخلط بين الإحالة القبلية والبعدية؛ تذكر دائماً: القبلية تشير إلى كلمة 'سبقت في النص'، والبعدية تشير إلى كلمة 'ستأتي بعدها مباشرة'."
      ]
    },
    "practice": {
      "question": "تأمل العبارة التالية: «إنَّ الثَّوْرَةَ الجَزَائِرِيَّةَ صَنَعَتْ مَجْدَهَا بِتَضْحِيَاتِ الشُّهَدَاءِ، وَهَذِهِ التَّضْحِيَاتُ هِيَ مَنَارُ الأَجْيَالِ». ما نوع الإحالة في كلمة 'هَذِهِ' وما دورها البلاغي؟",
      "options": [
        {
          "id": "opt_a",
          "text": "إحالة بعدية لفظية تشير إلى كلمة 'التَّضْحِيَاتُ' المذكورة بعدها مباشرة، ودورها ترسيخ الفكرة وتوثيق الاتساق التركيبي.",
          "isCorrect": true
        },
        {
          "id": "opt_b",
          "text": "إحالة قبلية معنوية تعود على لفظة 'الثورة' فقط دون ما بعدها.",
          "isCorrect": false
        },
        {
          "id": "opt_c",
          "text": "إحالة خارجية مقامية لا علاقة لها بما كُتب في النص.",
          "isCorrect": false
        },
        {
          "id": "opt_d",
          "text": "مجرد رابط شرطي جازم يفيد السببية.",
          "isCorrect": false
        }
      ],
      "explanationStepByStep": "1) اسم الإشارة 'هذه' أشار مباشرة إلى الاسم المعرف بعده 'التضحيات'.\n2) ما دام المشار إليه وقع بعد اسم الإشارة في سياق الكلام، فإن نوع الإحالة نصياً هو: 'إحالة بعدية' (Cataphore)، ودورها الإسهام في الاتساق والترابط النحوي وتجنب التشتت الدلالي."
    },
    "isomorphicRetest": {
      "question": "في جملة: «العِلْمُ وَحْدَهُ يَبْنِي الأُمَمَ، وَهُوَ الحِصْنُ المَنِيعُ لَهَا». إلى أين يعود الضمير المنفصل 'هُوَ' وما نوع إحالته؟",
      "options": [
        {
          "id": "iso_a",
          "text": "يعود على كلمة 'العِلْمُ' ونوع الإحالة قبلية (Anaphore) لمنع تكرار اللفظ وضمان اتساق الجملتين.",
          "isCorrect": true
        },
        {
          "id": "iso_b",
          "text": "يعود على كلمة 'الأمم' ونوع الإحالة بعدية.",
          "isCorrect": false
        },
        {
          "id": "iso_c",
          "text": "يعود على 'الحصن' ونوع الإحالة إحالة خارجية سياقية.",
          "isCorrect": false
        },
        {
          "id": "iso_d",
          "text": "لا توجد إحالة لكون الضمير يعرب مفعولاً به مقدماً.",
          "isCorrect": false
        }
      ],
      "repairGuide": "الضمير العائد على اسم سبق ذكره في الجملة (العلم ← وهو) يشكل دائماً 'إحالة قبلية'، ووظيفته النحوية والبلاغية ربط الجملة اللاحقة بالسابقة وتفادي التكرار اللفظي."
    }
  },
  "esp_subjuntivo_deseo_duda": {
    "skillId": "esp_subjuntivo_deseo_duda",
    "subject": "spanish",
    "subjectNameAr": "اللغة الإسبانية (Español)",
    "stream": "langues_etrangeres",
    "coefficient": 5,
    "direction": "ltr",
    "unitAr": "Gramática: El Modo Subjuntivo y la expresión de la subjetividad",
    "titleAr": "El Presente de Subjuntivo: Expresión de Deseo, Duda, y Petición (Ojalá, Querer que, Dudar que)",
    "bloomLevel": "apply",
    "theory": {
      "summary": "El Modo Subjuntivo se utiliza en español para expresar acciones no reales, deseos, dudas, hipótesis, emociones y mandatos indirectos. La alternancia modal (Indicativo vs Subjuntivo) depende del verbo de la oración principal y de los nexos introductores.",
      "keyTakeaways": [
        "Regla de conjugación del Presente de Subjuntivo: Verbos en -AR toman terminaciones en -E (hable, hables, hable, hablemos, habléis, hablen). Verbos en -ER/-IR toman terminaciones en -A (coma, comas, coma, comamos, comáis, coman).",
        "Expresión de deseo y voluntad: 'Querer / Desear / Esperar + QUE + Subjuntivo' (con dos sujetos distintos: Yo quiero que tú estudies).",
        "Ojalá: Siempre rige subjuntivo ('¡Ojalá apruebes el examen de selectividad!').",
        "Duda y negación: 'Dudar que / No creer que / No pensar que + Subjuntivo' (en cambio: 'Creer que / Pensar que + Indicativo')."
      ],
      "commonPitfalls": [
        "Usar subjuntivo cuando los dos sujetos son idénticos (ejemplo incorrecto: *'Quiero que yo viaje'*; lo correcto es infinitivo: 'Quiero viajar').",
        "Confundir 'Creo que' (exige Indicativo) con 'No creo que' (exige Subjuntivo)."
      ]
    },
    "practice": {
      "question": "Elige la opción correcta para completar la frase según las normas gramaticales del BAC:\n«El profesor exige que los alumnos .................... (llegar) puntuales a la clase.»",
      "options": [
        {
          "id": "opt_a",
          "text": "lleguen (Presente de Subjuntivo de llegar)",
          "isCorrect": true
        },
        {
          "id": "opt_b",
          "text": "llegan (Presente de Indicativo)",
          "isCorrect": false
        },
        {
          "id": "opt_c",
          "text": "llegaron (Pretérito Indefinido)",
          "isCorrect": false
        },
        {
          "id": "opt_d",
          "text": "llegarían (Condicional Simple)",
          "isCorrect": false
        }
      ],
      "explanationStepByStep": "1) El verbo principal 'exigir' expresa mandato e influencia sobre otra persona.\n2) Hay dos sujetos diferentes (El profesor ≠ los alumnos) unidos por la conjunción 'que'.\n3) Por tanto, el verbo subordinado debe conjugarse obligatoriamente en Presente de Subjuntivo: ellos lleguen (con cambio ortográfico g → gu)."
    },
    "isomorphicRetest": {
      "question": "¿Cuál de las siguientes oraciones requiere el verbo en Modo Subjuntivo?",
      "options": [
        {
          "id": "iso_a",
          "text": "No creo que la crisis económica se .................... (solucionar) rápidamente.",
          "isCorrect": true
        },
        {
          "id": "iso_b",
          "text": "Es seguro que nosotros .................... (tener) mucho éxito este año.",
          "isCorrect": false
        },
        {
          "id": "iso_c",
          "text": "Pienso que mi amigo .................... (decir) siempre la verdad.",
          "isCorrect": false
        },
        {
          "id": "iso_d",
          "text": "Todos saben que Madrid .................... (ser) la capital de España.",
          "isCorrect": false
        }
      ],
      "repairGuide": "'No creo que' expresa duda y niega una certeza, por lo que exige Subjuntivo ('se solucione'). Las expresiones de certeza absoluta ('es seguro que', 'pienso que', 'sé que') exigen siempre Indicativo."
    }
  },
  "esp_oraciones_condicionales_si": {
    "skillId": "esp_oraciones_condicionales_si",
    "subject": "spanish",
    "subjectNameAr": "اللغة الإسبانية (Español)",
    "stream": "langues_etrangeres",
    "coefficient": 5,
    "direction": "ltr",
    "unitAr": "Gramática: Las Oraciones Condicionales con 'SI'",
    "titleAr": "Las Estructuras Condicionales: Condición Real e Improbable (Si + Presente / Si + Imperfecto de Subjuntivo)",
    "bloomLevel": "apply",
    "theory": {
      "summary": "Las oraciones condicionales introducidas por la conjunción 'SI' expresan un requisito indispensable para que se cumpla la acción principal. Existen tres esquemas fundamentales evaluados en el examen de Baccalauréat.",
      "keyTakeaways": [
        "Tipo 1 (Condición Real / Posible): SI + Presente de Indicativo → Futuro Simple / Presente / Imperativo (Ej: 'Si estudias con regularidad, aprobarás el examen').",
        "Tipo 2 (Condición Improbable / Hipotética en el presente): SI + Pretérito Imperfecto de Subjuntivo (-ra / -se) → Condicional Simple (Ej: 'Si tuviera dinero, compraría un coche nuevo').",
        "¡Regla de oro absoluta!: La conjunción 'SI' NUNCA va seguida directamente de Futuro ni de Condicional ni de Presente de Subjuntivo (*'Si vendré'* o *'Si tenga'* son errores graves)."
      ],
      "commonPitfalls": [
        "Colocar el condicional directamente بعد 'Si' (*'Si yo tendría tiempo, te ayudaría'* es un error intolerable; lo correcto es 'Si yo tuviera tiempo, te ayudaría')."
      ]
    },
    "practice": {
      "question": "Transforma la frase según el modelo de condición hipotética (Tipo 2):\n«Si el gobierno .................... (invertir) más en las energías renovables, nosotros .................... (reducir) la contaminación.»",
      "options": [
        {
          "id": "opt_a",
          "text": "invirtiera / reduciríamos",
          "isCorrect": true
        },
        {
          "id": "opt_b",
          "text": "invertiría / redujéramos",
          "isCorrect": false
        },
        {
          "id": "opt_c",
          "text": "invierta / reduciremos",
          "isCorrect": false
        },
        {
          "id": "opt_d",
          "text": "invertirá / reduciríamos",
          "isCorrect": false
        }
      ],
      "explanationStepByStep": "1) El esquema de condición improbable exige en la prótasis: Si + Imperfecto de Subjuntivo ('invirtiera' o 'invirtiese').\n2) En la apódosis exige Condicional Simple ('reduciríamos')."
    },
    "isomorphicRetest": {
      "question": "Completa la frase condicional real (Tipo 1): «Si nosotros .................... (cuidar) el medio ambiente, las generaciones futuras .................... (vivir) en paz.»",
      "options": [
        {
          "id": "iso_a",
          "text": "cuidamos (Presente) / vivirán (Futuro)",
          "isCorrect": true
        },
        {
          "id": "iso_b",
          "text": "cuidemos / vivan",
          "isCorrect": false
        },
        {
          "id": "iso_c",
          "text": "cuidaríamos / vivirían",
          "isCorrect": false
        },
        {
          "id": "iso_d",
          "text": "cuidáramos / vivirán",
          "isCorrect": false
        }
      ],
      "repairGuide": "En la condición de tipo 1 (realidad alcanzable), la oración subordinada lleva Presente de Indicativo ('cuidamos') y la consecuencia lleva Futuro Simple ('vivirán')."
    }
  },
  "all_passiv_modalverben": {
    "skillId": "all_passiv_modalverben",
    "subject": "german",
    "subjectNameAr": "اللغة الألمانية (Deutsch)",
    "stream": "langues_etrangeres",
    "coefficient": 5,
    "direction": "ltr",
    "unitAr": "Grammatik: Das Passiv (Vorgangspassiv mit Modalverben)",
    "titleAr": "Das Vorgangspassiv mit Modalverben im Präsens und Präteritum",
    "bloomLevel": "apply",
    "theory": {
      "summary": "Das Vorgangspassiv stellt die Handlung und das Objekt in den Mittelpunkt, während der Urheber (Täter) in den Hintergrund tritt oder mit 'von + Dativ' (Personen) bzw. 'durch + Akkusativ' (Mittel/Ursachen) genannt wird. Mit Modalverben steht das konjugierte Modalverb auf Position 2 und am Satzende steht 'Partizip II + werden'.",
      "keyTakeaways": [
        "Passiv mit Modalverben im Präsens: Subjekt + konjugiertes Modalverb (Präsens) + ... + Partizip II + WERDEN (Infinitiv am Ende). Beispiel: 'Der Text MUSS übersetzt WERDEN.'",
        "Passiv mit Modalverben im Präteritum: Subjekt + konjugiertes Modalverb (Präteritum: musste, konnte, durfte, sollte) + ... + Partizip II + WERDEN. Beispiel: 'Das Gesetz MUSSTE reformiert WERDEN.'",
        "Akkusativobjekt des Aktivsatzes wird zum Subjekt (Nominativ) des Passivsatzes.",
        "Agens: Von + Dativ (Lebewesen/Institutionen), Durch + Akkusativ (Mittel/Werkzeuge/Kräfte)."
      ],
      "commonPitfalls": [
        "Konjugieren von 'werden' statt des Modalverbs am Satzende (falsch: *'Das Haus muss gebaut wird'*; richtig: 'Das Haus muss gebaut werden').",
        "Vergessen der Akkusativ-zu-Nominativ-Umwandlung des neuen Subjekts."
      ]
    },
    "practice": {
      "question": "Transformieren Sie den folgenden Aktivsatz ins Passiv:\n«Die Bürger müssen die Umweltgesetze respektieren.»",
      "options": [
        {
          "id": "opt_a",
          "text": "Die Umweltgesetze müssen von den Bürgern respektiert werden.",
          "isCorrect": true
        },
        {
          "id": "opt_b",
          "text": "Die Umweltgesetze wird von den Bürgern respektiert müssen.",
          "isCorrect": false
        },
        {
          "id": "opt_c",
          "text": "Die Bürger müssen respektiert von den Umweltgesetzen werden.",
          "isCorrect": false
        },
        {
          "id": "opt_d",
          "text": "Die Umweltgesetze müssen respektieren worden sind.",
          "isCorrect": false
        }
      ],
      "explanationStepByStep": "1) Das Akkusativobjekt 'die Umweltgesetze' (Plural) wird Subjekt im Nominativ.\n2) Das Modalverb 'müssen' steht an Position 2 konjugiert für Plural: 'müssen'.\n3) Der Täter wird mit Dativ eingefügt: 'von den Bürgern'.\n4) Am Satzende steht das Partizip II des Vollverbs gefolgt von 'werden': 'respektiert werden'."
    },
    "isomorphicRetest": {
      "question": "Welcher Satz steht im korrekten Passiv mit Modalverb im Präteritum?",
      "options": [
        {
          "id": "iso_a",
          "text": "Die historische Altstadt konnte von den Touristen besichtigt werden.",
          "isCorrect": true
        },
        {
          "id": "iso_b",
          "text": "Die historische Altstadt kann von den Touristen besichtigt werden.",
          "isCorrect": false
        },
        {
          "id": "iso_c",
          "text": "Die historische Altstadt wurde besichtigt können.",
          "isCorrect": false
        },
        {
          "id": "iso_d",
          "text": "Die Touristen konnten die historische Altstadt besichtigen.",
          "isCorrect": false
        }
      ],
      "repairGuide": "Präteritum des Modalverbs 'können' ist 'konnte/konnten'. Der Satzbau verlangt: 'konnte ... besichtigt werden'."
    }
  },
  "all_nebensaetze_weil_dass_wenn": {
    "skillId": "all_nebensaetze_weil_dass_wenn",
    "subject": "german",
    "subjectNameAr": "اللغة الألمانية (Deutsch)",
    "stream": "langues_etrangeres",
    "coefficient": 5,
    "direction": "ltr",
    "unitAr": "Grammatik: Die Satzstruktur der Nebensätze (KBF-Regel)",
    "titleAr": "Kausale und Konditionale Nebensätze: weil, dass, wenn und Verbstellung am Satzende",
    "bloomLevel": "apply",
    "theory": {
      "summary": "Im deutschen Nebensatz (eingeleitet durch Konjunktionen wie 'weil', 'dass', 'obwohl', 'wenn') gilt die eiserne Regel der Endstellung: Das finite (konjugierte) Verb wird an das absolute Ende des Nebensatzes verschoben. Wenn der Nebensatz zuerst steht, beginnt der Hauptsatz sofort mit dem konjugierten Verb (Inversion / V-S).",
      "keyTakeaways": [
        "Kausalsatz mit WEIL (Grund / Ursache): Hauptsatz, weil + Subjekt + ... + konjugiertes Verb am Ende. ('Er lernt fleißig, weil er das Abitur bestehen WILL.')",
        "Objektsatz mit DASS: ('Der Lehrer weiß, dass die Schüler fleißig SIND.')",
        "Konditionalsatz mit WENN (Bedingung): ('Wenn es morgen regnet, BLEIBE ich zu Hause.')",
        "Koma-Regel: Zwischen Hauptsatz und Nebensatz steht IMMER ein Komma."
      ],
      "commonPitfalls": [
        "Beibehalten der normalen Verb-Position auf Platz 2 nach 'weil' oder 'dass' (falsch: *'weil er will lernen'*; richtig: 'weil er lernen will').",
        "Vergessen der Inversion im Hauptsatz, wenn der Nebensatz am Satzanfang steht."
      ]
    },
    "practice": {
      "question": "Verbinden Sie die beiden Sätze mit der Konjunktion «weil»:\nSatz 1: Viele Jugendliche treiben Sport.\nSatz 2: Sie wollen gesund bleiben.",
      "options": [
        {
          "id": "opt_a",
          "text": "Viele Jugendliche treiben Sport, weil sie gesund bleiben wollen.",
          "isCorrect": true
        },
        {
          "id": "opt_b",
          "text": "Viele Jugendliche treiben Sport, weil sie wollen gesund bleiben.",
          "isCorrect": false
        },
        {
          "id": "opt_c",
          "text": "Weil viele Jugendliche Sport treiben, sie wollen gesund bleiben.",
          "isCorrect": false
        },
        {
          "id": "opt_d",
          "text": "Viele Jugendliche treiben Sport, dass sie gesund bleiben wollen.",
          "isCorrect": false
        }
      ],
      "explanationStepByStep": "1) Konjunktion 'weil' einfügen nach dem Komma.\n2) Das konjugierte Modalverb 'wollen' wandert an das allerletzte Satzende hinter den Infinitiv 'bleiben'.\n3) Richtiges Ergebnis: '..., weil sie gesund bleiben wollen.'"
    },
    "isomorphicRetest": {
      "question": "Welcher Satz hat die richtige Wortstellung, wenn der «Wenn-Satz» an erster Stelle steht?",
      "options": [
        {
          "id": "iso_a",
          "text": "Wenn man regelmäßig lernt, besteht man die Prüfungen ohne Probleme.",
          "isCorrect": true
        },
        {
          "id": "iso_b",
          "text": "Wenn man lernt regelmäßig, man besteht die Prüfungen ohne Probleme.",
          "isCorrect": false
        },
        {
          "id": "iso_c",
          "text": "Wenn man regelmäßig lernt, man wird die Prüfungen bestehen.",
          "isCorrect": false
        },
        {
          "id": "iso_d",
          "text": "Wenn lernt man regelmäßig, besteht man die Prüfungen.",
          "isCorrect": false
        }
      ],
      "repairGuide": "Wenn der Nebensatz voransteht ('Wenn man regelmäßig lernt,'), zählt dieser ganze Satz als Position 1. Daher MUSS der folgende Hauptsatz sofort mit dem konjugierten Verb beginnen ('besteht man...')."
    }
  },
  "phil_epistemology_biology_determinism": {
    "skillId": "phil_epistemology_biology_determinism",
    "subject": "philosophy",
    "subjectNameAr": "الفلسفة المتقدمة",
    "stream": "lettres_philo",
    "coefficient": 6,
    "direction": "rtl",
    "unitAr": "فلسفة العلوم: الإبستيمولوجيا ومناهج البحث العلمي",
    "titleAr": "المنهج التجريبي في البيولوجيا: عوائق تطبيق التجريب على المادة الحية وإشكالية الحتمية والغائية",
    "bloomLevel": "evaluate",
    "theory": {
      "summary": "تبحث هذه المقالة الفلسفية الكبرى في مدى إمكانية نقل وتطبيق خطوات المنهج التجريبي الاستقرائي (الملاحظة، الفرضية، التجربة) من المادة الجامدة إلى المادة الحية (علم الأحياء/البيولوجيا). يرى الاتجاه الكلاسيكي وجود عوائق إبستيمولوجية تحول دون ذلك (عائق التشابك والتعقيد، فكرة الغائية، وتبدل العضوية عند العزل)، بينما أثبت كلود برنارد وإبستيمولوجيو العصر الحديث إمكانية التجريب مع مراعاة خصوصية الكائن الحي.",
      "keyTakeaways": [
        "العوائق الإبستيمولوجية (موقف كوفييه وبونوا): 1) التعقيد والتشابك العضوي (الأعضاء متساندة وتؤدي وظيفة كلية مشتركة)، 2) عائق العزل والموت (عزل العضو لدراسته مخبرياً يفسده أو يميته)، 3) مبدأ الغائية (الكائن الحي موجه نحو غاية حفظ البقاء والتكاثر، عكس الآلية المادية الصرفة)، 4) العائق الأخلاقي والإنساني (حرمة التجريب على البشر).",
        "تجاوز العوائق وإمكانية التجريب (كلود برنارد ولويس باستور): كلود برنارد في كتابه 'المدخل إلى دراسة الطب التجريبي' أثبت خضوع الكائن الحي لنفس الحتمية الفيزيوكيميائية، وابتكر تقنيات التخدير والزرع والأجهزة الدقيقة لدراسة البيئة الداخلية (Milieu intérieur).",
        "التركيب الفلسفي المعاصر: الحتمية في البيولوجيا نسبية ومرنة، والمادة الحية تتكامل فيها القوانين الكيميائية مع البنية الوظيفية الكلية (النظرة العضوية الهيولية المنفتحة)."
      ],
      "commonPitfalls": [
        "نفي إمكانية التجريب على المادة الحية نطقاً مطلقاً؛ كلود برنارد بيّن أن الصعوبة منهجية ونسبية وليست مستحيلة، بدليل التطور الهائل للطب المعاصر والهندسة الوراثية."
      ]
    },
    "practice": {
      "question": "يقول العالم الفرنسي جورج كوفييه: «إن سائر أجزاء الجسم الحي مرتبطة فيما بينها، فهي لا تستطيع الحركة إلا بقدر ما تتحرك معاً، والرغبة في فصل جزء من الكتلة معناه نقله إلى نظام الجثث الميتة». ما هي الحجة الرئيسية التي يستند إليها كوفييه في هذا النص؟",
      "options": [
        {
          "id": "opt_a",
          "text": "استحالة تشريح وعزل أعضاء الكائن الحي تجريبياً لأن ذلك يفقدها صفتها الحيوية ويقودها إلى الموت.",
          "isCorrect": true
        },
        {
          "id": "opt_b",
          "text": "تطابق المادة الحية مع المادة الجامدة في سهولة القياس الرياضي الدقيق.",
          "isCorrect": false
        },
        {
          "id": "opt_c",
          "text": "أن الأحياء تخضع لقوانين ميكانيكية حتمية صارمة كحركة عقارب الساعة.",
          "isCorrect": false
        },
        {
          "id": "opt_d",
          "text": "جواز إجراء التجارب الجراحية الخطيرة على الكائنات الحية دون ضوابط بيولوجية.",
          "isCorrect": false
        }
      ],
      "explanationStepByStep": "كوفييه يمثل تيار العوائق الإبستيمولوجية؛ حجته تنطلق من مبدأ 'الكلية والتساند الوظيفي' للأعضاء (Solidarité fonctionnelle)، حيث يرى أن عزل العضو لدراسته مخبرياً كما يفعل الفيزيائي يجرده من وظيفته الحيوية ويحوله إلى مادة ميتة."
    },
    "isomorphicRetest": {
      "question": "ما هو الإنجاز المنهجي التاريخي الذي حققه كلود برنارد (Claude Bernard) لتأسيس البيولوجيا كعلم تجريبي؟",
      "options": [
        {
          "id": "iso_a",
          "text": "إثبات أن المادة الحية تخضع لنفس الحتمية الصارمة للفيزياء والكيمياء عبر مفهوم استقرار 'البيئة الداخلية'.",
          "isCorrect": true
        },
        {
          "id": "iso_b",
          "text": "الاعتماد الحصري على التأمل الفلسفي الميتافيزيقي ورفض المخابر والتحاليل.",
          "isCorrect": false
        },
        {
          "id": "iso_c",
          "text": "إلغاء الملاحظة والفرضية وتعويضهما بالاستنتاج الرياضي المجرد فقط.",
          "isCorrect": false
        },
        {
          "id": "iso_d",
          "text": "تأكيد أن الكائنات الحية تسيرها قوى غيبية خارقة لا يمكن تفسيرها علمياً.",
          "isCorrect": false
        }
      ],
      "repairGuide": "كلود برنارد هو مؤسس الطب التجريبي؛ برهن أن الظواهر الحيوية ليست فوضوية بل تحكمها شروط بيئية وفيزيائية محددة، مما جعل البيولوجيا علماً استقرائياً قائماً بذاته."
    }
  },
  "phil_ethics_justice_equality_merit": {
    "skillId": "phil_ethics_justice_equality_merit",
    "subject": "philosophy",
    "subjectNameAr": "الفلسفة المتقدمة",
    "stream": "lettres_philo",
    "coefficient": 6,
    "direction": "rtl",
    "unitAr": "فلسفة الأخلاق والحق والسياسة: إشكالية العدالة الاجتماعية",
    "titleAr": "العدالة الاجتماعية: بين مبدأ المساواة المطلقة ومبدأ التفاوت والاستحقاق والكفاءة",
    "bloomLevel": "evaluate",
    "theory": {
      "summary": "تعالج هذه القضية الفلسفية جوهر العدالة وقاعدتها الأخلاقية والقانونية في المجتمع: هل تتحقق العدالة بتطبيق المساواة التامة بين سائر أفراد المجتمع دون تمييز (أنصار القانون الطبيعي والاشتراكية)، أم تتحقق باحترام التفاوت الطبيعي ومجازاة كل فرد بحسب كفاءته وجهده واستحقاقه الفردي (أنصار المذهب الرأسمالي وأفلاطون وأرسطو)؟",
      "keyTakeaways": [
        "الأطروحة الأولى (العدالة في المساواة): شيشرون، جون لوك، وكارل ماركس. الناس متساوون بالطبيعة في الكرامة الإنسانية والعقل؛ والتفاوت مصدر الطبقية والاستغلال. شعارها: 'لكل بحسب حاجته'.",
        "الأطروحة الثانية (العدالة في التفاوت والاستحقاق): أفلاطون (تقسيم المجتمع لطبقات حسب الفضيلة: حكام، جند، عمال)، ألكسيس كاريل، ونيتشه. مساواة المجتهد بالكسول والموهوب بالعاجز ظلم فادح وتثبيط للإبداع والتنافس الشريف.",
        "التركيب المعاصر (نظرية العدالة كإنصاف - جون رولز John Rawls): التوفيق عبر مبدأين: 1) المساواة التامة في الحريات والحقوق السياسية الأساسية للجميع، 2) قبول التفاوت الاقتصادي والاجتماعي بشرطين: تكافؤ الفرص، وأن يؤول التفاوت لمنفعة الفئات الأكثر هشاشة وضعفاً في المجتمع."
      ],
      "commonPitfalls": [
        "اعتبار المساواة المطلقة خيراً محضاً دون نقد آثارها السلبية (المساواة الحرفية بين غير المتساوين في الجهد كفاءة تلغي التحفيز وتورث التواكل).",
        "إغفال نظرية 'جون رولز' التي أصبحت المعيار المنهجي المعتمد لتركيب هذه المقالة في البكالوريا."
      ]
    },
    "practice": {
      "question": "يقول الجراح الفرنسي ألكسيس كاريل: «بدلاً من أن نشجع المواهب الحقيقية نساوي بين الجميع، إن المساواة الديمقراطية تسلب المتفوقين حقوقهم الطبيعية لصالح غير الأكفاء». يتبنى هذا القول أطروحة تؤكد على أن:",
      "options": [
        {
          "id": "opt_a",
          "text": "العدالة الحقيقية تتأسس على مراعاة التفاوت الطبيعي والمكافأة بحسب الجدارة والكفاءة والجهد الفردي.",
          "isCorrect": true
        },
        {
          "id": "opt_b",
          "text": "المساواة الحسابية المطلقة هي السبيل الحصري الوحيد لنهضة الأمم اقتصادياً.",
          "isCorrect": false
        },
        {
          "id": "opt_c",
          "text": "القضاء على الملكية الخاصة وحظر جميع أشكال التنافس في الأسواق الحرة.",
          "isCorrect": false
        },
        {
          "id": "opt_d",
          "text": "أن الكرامة الإنسانية تقتضي توزيع الثروات الوطنية بنسب متماثلة بين الكسول والمجتهد.",
          "isCorrect": false
        }
      ],
      "explanationStepByStep": "ألكسيس كاريل ينتمي لموقف التفاوت الطبيعي؛ يرى أن الطبيعة لم توزع الذكاء والمواهب والقدرات بالتساوي، وبالتالي فإن فرض مساواة حسابية جامدة هو ظلم للمبدعين والمتفوقين، والعدل يقتضي معاملة الأفراد حسب عطائهم واستحقاقهم الفعلي."
    },
    "isomorphicRetest": {
      "question": "كيف وفّق الفيلسوف المعاصر جون رولز (John Rawls) بين فكرتي المساواة والتفاوت في نظريته للعدالة كإنصاف (Justice as Fairness)؟",
      "options": [
        {
          "id": "iso_a",
          "text": "ضمن المساواة الكاملة في الحقوق والحريات السياسية الأساسية، وسمح بالتفاوت الاقتصادي المشروط بتكافؤ الفرص ونفع الفئات الأقل حظاً.",
          "isCorrect": true
        },
        {
          "id": "iso_b",
          "text": "ألغى جميع الفوارق الاقتصادية وفرض توزيعاً إجبارياً متطابقاً للأجور على سائر المواطنين.",
          "isCorrect": false
        },
        {
          "id": "iso_c",
          "text": "أعطى الأثرياء كامل السلطة التشريعية دون أي التزام اجتماعي تجاه الفقراء.",
          "isCorrect": false
        },
        {
          "id": "iso_d",
          "text": "قصر مفهوم العدالة على المجال العسكري وتوزيع الأراضي المسترجعة فقط.",
          "isCorrect": false
        }
      ],
      "repairGuide": "جون رولز يقدم التركيب الفلسفي الأحدث: حرية ومساواة مطلقة في المبادئ الدستورية للمواطنة، وتفاوت اقتصادي مقبول شرط ألا يحرم أحداً من تكافؤ الفرص وأن يخدم مصلحة الفئات الضعيفة والمحرومة."
    }
  }
};

export function getBatch5LiteratureLanguagesBundle(skillId: string): Batch5LiteratureLanguagesPayload | null {
  return BATCH5_LITERATURE_LANGUAGES_BUNDLE[skillId] || null;
}

export function getAllBatch5Skills(): Skill[] {
  return Object.values(BATCH5_LITERATURE_LANGUAGES_BUNDLE).map((payload, idx) => {
    let subjectId: SubjectId = "arabic";
    let streamId: StreamId = "lettres_philo";

    if (payload.subject === "spanish" || payload.subject === "german") {
      subjectId = "third_language";
      streamId = "langues_etrangeres";
    } else if (payload.subject === "philosophy") {
      subjectId = "philosophy";
      streamId = "lettres_philo";
    } else {
      subjectId = "arabic";
      streamId = "lettres_philo";
    }

    return {
      id: payload.skillId,
      topicId: `topic_${payload.skillId}`,
      subjectId,
      streamId,
      title_ar: payload.titleAr,
      title_fr: payload.titleAr,
      description_ar: payload.theory.summary,
      description_fr: payload.theory.summary,
      prerequisites: [],
      cognitiveDimensions: ["understanding", "application"],
      difficulty: 2,
      order: idx + 1,
      repairStrategy_ar: payload.theory.keyTakeaways.join(" | "),
      repairStrategy_fr: "",
      repairSteps_ar: payload.theory.commonPitfalls,
      repairSteps_fr: [],
      academicYear: "2026-2027",
      sourceId: "src-ministry-curriculum-3as",
      sourceType: "official_curriculum",
      rightsStatus: "official_reference",
      verificationStatus: "verified",
      isActive: true,
    };
  });
}

export function getBatch5SkillsForStream(streamId: StreamId): Skill[] {
  return getAllBatch5Skills().filter((skill) => {
    if (streamId === "lettres_philo") {
      return skill.subjectId === "arabic" || skill.subjectId === "philosophy";
    }
    if (streamId === "langues_etrangeres") {
      return skill.subjectId === "arabic" || skill.subjectId === "third_language";
    }
    return false;
  });
}

export const FOREIGN_LANGUAGES_THIRD_LANG_BUNDLE = BATCH5_LITERATURE_LANGUAGES_BUNDLE;
export const getForeignLanguagesThirdLangBundle = getBatch5LiteratureLanguagesBundle;

