import { Locale } from "./config";

export interface Dictionary {
  common: {
    appName: string;
    tagline: string;
    subTagline: string;
    startJourney: string;
    discoverMethod: string;
    selectLanguage: string;
    foundationPhaseBadge: string;
    mobileFirstBadge: string;
    zeroCostBadge: string;
  };
  pillars: {
    title: string;
    subtitle: string;
    studyTitle: string;
    studyDesc: string;
    progressTitle: string;
    progressDesc: string;
    mindTitle: string;
    mindDesc: string;
    futureTitle: string;
    futureDesc: string;
  };
  loop: {
    title: string;
    subtitle: string;
    steps: {
      goal: string;
      diagnostic: string;
      gap: string;
      roadmap: string;
      mission: string;
      study: string;
      practice: string;
      error: string;
      repair: string;
      mastery: string;
    };
  };
  streams: {
    title: string;
    subtitle: string;
    agnosticBadge: string;
    bemReadyBadge: string;
    items: {
      sciences_exp: string;
      math: string;
      technique_math: string;
      gestion_eco: string;
      lettres_philo: string;
      langues_etrangeres: string;
    };
  };
  aiBridge: {
    badge: string;
    title: string;
    desc: string;
    copyPromptCta: string;
  };
  footer: {
    builtForAlgeria: string;
    constitutionNotice: string;
  };
  onboarding: {
    nav: {
      back: string;
      next: string;
      stepOf: string;
      finish: string;
    };
    welcome: {
      tagline: string;
      subTagline: string;
      cta: string;
    };
    educationLevel: {
      question: string;
      subtitle: string;
      bacOption: string;
      bemNotice: string;
    };
    stream: {
      question: string;
      subtitle: string;
      specialtyQuestion: string;
      specialtySubtitle: string;
      specialties: {
        civil_eng: string;
        mechanical_eng: string;
        electrical_eng: string;
        process_eng: string;
      };
    };
    targetScore: {
      question: string;
      subtitle: string;
      exactLabel: string;
      customInputPlaceholder: string;
      encouragement: string;
      ranges: {
        r10_11: string;
        r12_13: string;
        r14_15: string;
        r16_17: string;
        r18_20: string;
      };
    };
    levelEstimation: {
      title: string;
      subtitle: string;
      disclaimer: string;
      coreBadge: string;
      scale: {
        l1: string;
        l2: string;
        l3: string;
        l4: string;
        l5: string;
      };
    };
    availableTime: {
      question: string;
      subtitle: string;
      options: {
        less_than_5: string;
        h5_to_8: string;
        h8_to_12: string;
        h12_to_18: string;
        h18_to_25: string;
        h25_plus: string;
        not_sure: string;
      };
    };
    futureObjective: {
      question: string;
      subtitle: string;
      customPlaceholder: string;
      options: {
        specific_university_field: string;
        higher_school_ens_esi: string;
        specific_profession: string;
        open_more_doors: string;
        prove_to_myself: string;
        not_decided_yet: string;
      };
    };
    obstacles: {
      question: string;
      subtitle: string;
      options: {
        dont_know_where_to_start: string;
        start_and_stop: string;
        time_management: string;
        understand_but_fail_exercises: string;
        memorize_and_forget: string;
        waste_time: string;
        fear_of_bac: string;
        big_backlog: string;
        lack_of_confidence: string;
        other: string;
      };
    };
    studyState: {
      question: string;
      subtitle: string;
      options: {
        good: string;
        normal: string;
        tired: string;
        stressed: string;
      };
    };
    summary: {
      title: string;
      subtitle: string;
      streamLabel: string;
      specialtyLabel: string;
      targetLabel: string;
      estimateLabel: string;
      timeLabel: string;
      futureLabel: string;
      obstaclesLabel: string;
      energyLabel: string;
      editButton: string;
      buildButton: string;
    };
    errors: {
      selectEducationLevel: string;
      selectStream: string;
      selectSpecialty: string;
      validTargetScore: string;
      selectStreamFirst: string;
      rateAllCoreSubjects: string;
      selectAvailableTime: string;
      selectFutureObjective: string;
      selectAtLeastOneObstacle: string;
      selectStudyEnergy: string;
    };
  };
  roadmap: {
    title: string;
    subtitle: string;
    streamTag: string;
    targetLabel: string;
    estimateLabel: string;
    gapLabel: string;
    gapUnit: string;
    bottleneckTitle: string;
    firstMissionTitle: string;
    diagnosticNotice: string;
    startDiagnosticCta: string;
    editProfileCta: string;
    noProfileTitle: string;
    noProfileDesc: string;
    startOnboardingCta: string;
    secondaryBottlenecksTitle: string;
    firstMissionNotice: string;
    levelSourceObserved: string;
    levelSourceEstimate: string;
    roadmapConfidenceInitial: string;
    viewDiagnosticResultsCta: string;
    currentMissionBadge: string;
    startCurrentMissionCta: string;
    errorLabLinkCta: string;
    activeMissionTitle: string;
    repairStatusLabel: string;
    pageTitle: string;
    whyThisMission: string;
    startMissionAction: string;
    noMissionsLeft: string;
    mapTitle: string;
    stages: {
      fix: { title: string; desc: string };
      verify: { title: string; desc: string };
      demonstrate: { title: string; desc: string };
      move_forward: { title: string; desc: string };
    };
    nextTitle: string;
    nextSubtitle: string;
    queuedBadge: string;
    progressTitle: string;
    categories: {
      demonstrated: string;
      emerging: string;
      needs_work: string;
      not_assessed: string;
    };
    pilotCoverageNotice: string;
    curriculumMapTitle?: string;
    curriculumMapSubtitle?: string;
    topicsCountLabel?: string;
    skillsCountLabel?: string;
    prerequisitesLabel?: string;
    difficultyLabel?: string;
    limitationsTitle: string;
    limitationsText: string;
  };
  diagnostic: {
    title: string;
    phaseBadge: string;
    subtitle: string;
    desc: string;
    honestBaselineNotice: string;
    honestBaselineSub: string;
    dimensionsHeading: string;
    dimensions: {
      knowledge: string;
      understanding: string;
      application: string;
      methodology: string;
      speed: string;
      confidence: string;
    };
    returnCta: string;
    startCta: string;
    resumeCta: string;
    restartCta: string;
    questionLabel: string;
    ofLabel: string;
    timeSpentLabel: string;
    confidencePrompt: string;
    confidenceLevels: {
      1: string;
      2: string;
      3: string;
      4: string;
      5: string;
    };
    nextButton: string;
    prevButton: string;
    submitButton: string;
    results: {
      title: string;
      subtitle: string;
      mandatoryDisclaimer: string;
      observedScoreLabel: string;
      accuracyLabel: string;
      coreSignalLabel: string;
      coreSignalDisclaimer: string;
      coverageNotice: string;
      calibrationTitle: string;
      discrepancyTitle: string;
      misconceptionsTitle: string;
      noMisconceptions: string;
      bottleneckTitle: string;
      bottleneckCandidateNotice: string;
      missionTitle: string;
      missionDuration: string;
      startMissionCta: string;
      updateRoadmapCta: string;
      retakeCta: string;
      subjectBreakdownTitle: string;
      dimensionsBreakdownTitle: string;
    };
  };
  mission: {
    phaseBadge: string;
    backToRoadmap: string;
    objectiveLabel: string;
    estimatedDuration: string;
    practiceMode: string;
    retestMode: string;
    questionProgress: string;
    confidencePrompt: string;
    confidenceLevels: {
      1: string;
      2: string;
      3: string;
      4: string;
      5: string;
    };
    submitAnswer: string;
    correctTitle: string;
    correctMessage: string;
    explanationTitle: string;
    repairHintTitle: string;
    retestBannerTitle: string;
    retestBannerSubtitle: string;
    startRetestButton: string;
    masteryAchievedTitle: string;
    masteryAchievedMessage: string;
    returnToRoadmap: string;
    viewErrorLab: string;
    notFoundTitle: string;
    notFoundDesc: string;
    positiveEvidenceTitle: string;
    positiveEvidenceDesc: string;
    verifyRetestCta: string;
    needsMoreWorkTitle: string;
    needsMoreWorkDesc: string;
    retestFailedTitle: string;
    retestFailedDesc: string;
    retryRepairCta: string;
    masteryStatusBadges: {
      not_yet: string;
      emerging: string;
      demonstrated: string;
    };
  };
  errorLab: {
    title: string;
    badge: string;
    subtitle: string;
    recurringBannerTitle: string;
    recurringBannerDesc: string;
    stats: {
      open: string;
      recurring: string;
      remediated: string;
    };
    diagnosisHeader: string;
    diagnosisSub: string;
    diagnosisQuestion: string;
    suggestedCauseHint: string;
    confirmAttributionCta: string;
    repairPlanHeader: string;
    repairPlanSub: string;
    repairStrategyTitle: string;
    repairStepsTitle: string;
    completeRepairCta: string;
    repairCompletedNotice: string;
    readyForRetestCta: string;
    historyTitle: string;
    historySubtitle: string;
    emptyErrorsNotice: string;
    returnToRoadmap: string;
    returnToMission: string;
    statusBadges: {
      identified: string;
      repair_started: string;
      repair_completed: string;
      retest_passed: string;
      retest_failed: string;
    };
    errorTypes: {
      forgot_information: string;
      misunderstood_concept: string;
      methodology_error: string;
      calculation_error: string;
      misread_question: string;
      rushed: string;
      lack_of_practice: string;
      time_management: string;
      attention_error: string;
      unknown: string;
    };
  };
}

export const dictionaries: Record<Locale, Dictionary> = {
  ar: {
    common: {
      appName: "BAC Mastery",
      tagline: "ماشي واش تقرا. كيفاش توصل.",
      subTagline: "من مستواك الحالي إلى معدل أحلامك عبر مسار مخصص، مع الحفاظ على طاقتك وراحتك وبناء مستقبلك.",
      startJourney: "ابدأ المسار الدراسي",
      discoverMethod: "اكتشف منهجية النظام",
      selectLanguage: "اللغة",
      foundationPhaseBadge: "المرحلة 02 — التوجيه الاستراتيجي",
      mobileFirstBadge: "تجربة مخصصة للهاتف",
      zeroCostBadge: "0 دج تكلفة تشغيل",
    },
    pillars: {
      title: "الأركان الأربعة المتوازنة",
      subtitle: "نظام لا يكتفي بقول «اقرأ أكثر»، بل يبني نجاحك الأكاديمي والذهني بشكل متكامل.",
      studyTitle: "1. الدراسة (Study)",
      studyDesc: "منهجية استرجاع نشط، فهم الآليات، وحل نموذجي وفق معايير التصحيح الوزاري الجزائري.",
      progressTitle: "2. التقدّم (Progress)",
      progressDesc: "تحديد نقطة الاختناق الكبرى بدقة، وتفكيك الثغرات عبر تحليل الأخطاء بدلاً من التكرار العشوائي.",
      mindTitle: "3. الراحة والذهن (Mind)",
      mindDesc: "متابعة يومية لمستوى الطاقة والتوتر. الراحة ركن أساسي في الخطة وليست مكافأة مؤجلة.",
      futureTitle: "4. المستقبل (Future)",
      futureDesc: "ربط الجهد اليومي بالتخصص الجامعي المنشود (طب، إعلام آلي ESI، مدارس عليا، بوليتكنيك، اقتصاد).",
    },
    loop: {
      title: "محرك النجاح المركزي",
      subtitle: "دورة منتظمة ومغلقة تضمن تحويل كل خطأ إلى تمكّن حقيقي.",
      steps: {
        goal: "الهدف الاستراتيجي",
        diagnostic: "التشخيص المعرفي",
        gap: "تحليل الفجوة والعوائق",
        roadmap: "المسار المخصص",
        mission: "مهمة اليوم المركزة",
        study: "بناء المفهوم",
        practice: "تطبيق متدرج",
        error: "مختبر تصنيف الأخطاء",
        repair: "مهمة المعالجة الفورية",
        mastery: "التمكن وإعادة الاختبار",
      },
    },
    streams: {
      title: "شامل لجميع الشعب الجزائرية",
      subtitle: "محرك موحد يعمل بدقة مع معاملات ومناهج كل شعبة دون استثناء.",
      agnosticBadge: "محرك مرن ومستقل",
      bemReadyBadge: "جاهز للتوسع لشهادة BEM",
      items: {
        sciences_exp: "علوم تجريبية (Sciences Expérimentales)",
        math: "رياضيات (Mathématiques)",
        technique_math: "تقني رياضي (Technique Math)",
        gestion_eco: "تسيير واقتصاد (Gestion & Économie)",
        lettres_philo: "آداب وفلسفة (Lettres & Philosophie)",
        langues_etrangeres: "لغات أجنبية (Langues Étrangères)",
      },
    },
    aiBridge: {
      badge: "جسر الذكاء الاصطناعي الخارجي",
      title: "تقرير الذكاء الدراسي (Student Intelligence Report)",
      desc: "تصدير فوري لتقرير أدائك وأخطائك المتكررة كـ Prompt جاهز لـ ChatGPT أو Claude أو Gemini لتحليل نقاط ضعفك مجاناً وبأعلى خصوصية.",
      copyPromptCta: "معاينة نموذج التقرير",
    },
    footer: {
      builtForAlgeria: "صُمم خصيصاً لطلبة البكالوريا في الجزائر",
      constitutionNotice: "ملتزمون بدستور المنتج الأكاديمي — لا لتكديس المهام ولا للإرهاق غير المدروس.",
    },
    onboarding: {
      nav: {
        back: "السابق",
        next: "متابعة",
        stepOf: "الخطوة {current} من {total}",
        finish: "بناء الخريطة",
      },
      welcome: {
        tagline: "ماشي واش تقرا. كيفاش توصل.",
        subTagline: "نعرفو مستواك الحالي، نحددو هدفك، ونبنو لك الطريق اللي بيناتهم.",
        cta: "نبداو",
      },
      educationLevel: {
        question: "واش راك تحضر؟",
        subtitle: "حدد المستوى الدراسي لتخصيص محرك المسار والمعاملات الرسمية.",
        bacOption: "شهادة البكالوريا (BAC)",
        bemNotice: "نظامنا مصمم لدعم شهادة التعليم المتوسط (BEM) قريباً بنفس المعايير.",
      },
      stream: {
        question: "شعبة البكالوريا تاعك؟",
        subtitle: "اختر شعبتك بدقة لاحتساب المعاملات الرسمية والمواد الأساسية.",
        specialtyQuestion: "التخصص التقني؟",
        specialtySubtitle: "اختر فرع الهندسة الخاص بك لتطبيق المعامل 7 على المادة التخصصية.",
        specialties: {
          civil_eng: "هندسة مدنية (Génie Civil)",
          mechanical_eng: "هندسة ميكانيكية (Génie Mécanique)",
          electrical_eng: "هندسة كهربائية (Génie Électrique)",
          process_eng: "هندسة الطرائق (Génie des Procédés)",
        },
      },
      targetScore: {
        question: "شحال حاب تجيب في الباك؟",
        subtitle: "حدد المعدل الذي تطمح إليه بصدق لبناء حجم الجهد المطلوب بدقة.",
        exactLabel: "المعدل المحدد بدقة:",
        customInputPlaceholder: "أدخل المعدل (مثلاً 16.50)",
        encouragement: "هدف واضح = طريق أوضح.",
        ranges: {
          r10_11: "10 – 11 (النجاح والتثبيت)",
          r12_13: "12 – 13 (توسيع الخيارات)",
          r14_15: "14 – 15 (المدارس العليا والتخصصات الممتازة)",
          r16_17: "16 – 17 (الطب والمدارس الوطنية العليا ESI)",
          r18_20: "18 – 20 (القمة والامتياز الوطني)",
        },
      },
      levelEstimation: {
        title: "وين تشوف روحك حالياً؟",
        subtitle: "قيّم مستواك التقريبي في المواد الأساسية لشعبتك.",
        disclaimer: "هذا غير تقديرك الأولي. من بعد نديرو تشخيص حقيقي باش نعرفو مستواك بدقة.",
        coreBadge: "مادة أساسية",
        scale: {
          l1: "1 — ضعيف جداً",
          l2: "2 — ضعيف",
          l3: "3 — متوسط",
          l4: "4 — مليح",
          l5: "5 — قوي",
        },
      },
      availableTime: {
        question: "قداش تقدر تقرا في الأسبوع بانتظام؟",
        subtitle: "الوقت الفعلي خارج ساعات الثانوية. الخطة لازم تكون واقعية باش تقدر تستمر.",
        options: {
          less_than_5: "أقل من 5 ساعات (وتيرة خفيفة)",
          h5_to_8: "5 إلى 8 ساعات أسبوعياً",
          h8_to_12: "8 إلى 12 ساعة أسبوعياً",
          h12_to_18: "12 إلى 18 ساعة أسبوعياً",
          h18_to_25: "18 إلى 25 ساعة أسبوعياً",
          h25_plus: "أكثر من 25 ساعة أسبوعياً",
          not_sure: "ما نيش متأكد حالياً",
        },
      },
      futureObjective: {
        question: "علاش حاب تجيب هاد المعدل؟",
        subtitle: "الباك ليس نهاية العالم، بل جسر نحو هدف أكبر. ما هو دافعك؟",
        customPlaceholder: "أو اكتب هدفك الخاص هنا (مثلاً: الالتحاق بكلية الطب بالجزائر)...",
        options: {
          specific_university_field: "تخصص جامعي محدد (طب، صيدلة، هندسة معمارية...)",
          higher_school_ens_esi: "مدرسة عليا (ESI، ENS، بوليتكنيك...)",
          specific_profession: "مهنة محددة أحلم بممارستها",
          open_more_doors: "نحب نفتح اختيارات أكثر في التوجيه الجامعي",
          prove_to_myself: "نحب نثبت لروحي ولعائلتي أني أستطيع التفوق",
          not_decided_yet: "مازال ما قررتش بدقة، لكن حاب نجيب أعلى معدل ممكن",
        },
      },
      obstacles: {
        question: "وش أكثر حاجة حابسة تقدمك؟",
        subtitle: "يمكنك اختيار أكثر من عائق لتكييف طبيعة المهام اليومية مع مشاكلك الحقيقية.",
        options: {
          dont_know_where_to_start: "ما نعرفش منين نبدا وواش نقرا كل يوم",
          start_and_stop: "نبدأ بحماس ونحبس بعد يومين (مشكل الاستمرارية)",
          time_management: "ما نعرفش ننظم وقتي بين الثانوية والمراجعة",
          understand_but_fail_exercises: "نفهم الدرس مليح بصح نغلط في حل التمارين",
          memorize_and_forget: "نحفظ بزاف ومن بعد ننسى المعلومات بسرعة",
          waste_time: "نضيع وقت بزاف في الهاتف ووسائل التواصل",
          fear_of_bac: "الخوف والضغط النفسي من امتحان الباك",
          big_backlog: "عندي تراكم كبير من دروس الفصل الأول والسنوات السابقة",
          lack_of_confidence: "ما عنديش ثقة في قدرتي على نيل معدل عالي",
          other: "عائق آخر خاص بي",
        },
      },
      studyState: {
        question: "كيفاش راهي طاقتك هاد الأيام؟",
        subtitle: "فحص بسيط للحالة النفسية والذهنية لتكييف حجم المهام دون إرهاق.",
        options: {
          good: "🟢 مليح (طاقتي ممتازة وجاهز للعمل المركّز)",
          normal: "🟡 عادي (وتيرة مستقرة ومستعد للدراسة)",
          tired: "🟠 تعبان (أشعر بالإرهاق وأحتاج مهاماً قصيرة ومحددة)",
          stressed: "🔴 مضغوط (أحس بضغط نفسي كبير وأحتاج إعادة ضبط)",
        },
      },
      summary: {
        title: "ملخص ملفك الاستراتيجي",
        subtitle: "راجع خياراتك قبل بناء خريطتك الدراسية المخصصة.",
        streamLabel: "شعبتك:",
        specialtyLabel: "تخصصك التقني:",
        targetLabel: "هدفك في البكالوريا:",
        estimateLabel: "مستواك التقديري الأولي:",
        timeLabel: "الوقت الأسبوعي المتاح:",
        futureLabel: "الوجهة المستقبلية:",
        obstaclesLabel: "أهم العوائق:",
        energyLabel: "حالة الطاقة الحالية:",
        editButton: "نبدل بعض الخيارات",
        buildButton: "نبني خريطتي الاستراتيجية",
      },
      errors: {
        selectEducationLevel: "يرجى اختيار المستوى الدراسي للمتابعة.",
        selectStream: "يرجى تحديد شعبتك الدراسية.",
        selectSpecialty: "يرجى تحديد فرع الهندسة لشعبة تقني رياضي.",
        validTargetScore: "يرجى إدخال معدل هدف صحيح بين 10.00 و 20.00.",
        selectStreamFirst: "يرجى تحديد الشعبة أولاً.",
        rateAllCoreSubjects: "يرجى تقييم مستواك في جميع المواد الأساسية لشعبتك.",
        selectAvailableTime: "يرجى تحديد وقت الدراسة الأسبوعي المتاح.",
        selectFutureObjective: "يرجى اختيار هدفك المستقبلي أو كتابته.",
        selectAtLeastOneObstacle: "يرجى تحديد عائق واحد على الأقل.",
        selectStudyEnergy: "يرجى تحديد مستوى طاقتك الحالية.",
      },
    },
    roadmap: {
      title: "هذي هي خريطتك.",
      subtitle: "من مستواك الحالي إلى هدفك — خطوة بخطوة وبدون تشتت.",
      streamTag: "الشعبة:",
      targetLabel: "الهدف الاستراتيجي",
      estimateLabel: "مستواك الحالي — تقديرك",
      gapLabel: "المسافة التقريبية نحو الهدف",
      gapUnit: "نقاط",
      bottleneckTitle: "أول حاجة لازم نخدمو عليها (نقطة الاختناق الكبرى)",
      firstMissionTitle: "أول مهمة في مسارك المقترح",
      diagnosticNotice: "هذا المسار مبني على تقديرك الأولي. التشخيص الحقيقي القادم راح يحدد البداية والتمارين بدقة متناهية.",
      startDiagnosticCta: "نبدأ التشخيص الأكاديمي",
      editProfileCta: "تعديل الملف الاستراتيجي",
      noProfileTitle: "لم تبنِ خريطتك بعد!",
      noProfileDesc: "يرجى إكمال الاستبيان الاستراتيجي القصير لحساب الفجوة وتحديد نقطة الاختناق.",
      startOnboardingCta: "ابدأ الاستبيان الآن",
      secondaryBottlenecksTitle: "عوائق ثانوية في الحسبان:",
      firstMissionNotice: "مهمة أولى مقترحة لكسر حاجز البداية:",
      levelSourceObserved: "مؤشر التشخيص الأولي",
      levelSourceEstimate: "تقدير ذاتي أولي",
      roadmapConfidenceInitial: "ثقة المسار: أولية (عينة تجريبية)",
      viewDiagnosticResultsCta: "عرض تفاصيل التشخيص ومعايرة الثقة",
      currentMissionBadge: "مهمتك الموصى بها الآن",
      startCurrentMissionCta: "ابدأ المهمة الآن",
      errorLabLinkCta: "سجل مختبر الأخطاء والترميم",
      activeMissionTitle: "المهمة النشطة الحالية",
      repairStatusLabel: "حالة الترميم:",
      pageTitle: "هذي هي خريطتك",
      whyThisMission: "علاش هذي المهمة بالذات؟",
      startMissionAction: "ابدأ المهمة الآن",
      noMissionsLeft: "أتممت جميع مهام المرحلة التجريبية بنجاح! أحسنت.",
      mapTitle: "موقعك الحالي في مسار التعلم",
      stages: {
        fix: { title: "الترميم", desc: "معالجة الخلل المنهجي أولاً" },
        verify: { title: "التحقق", desc: "إعادة الاختبار التوأمي" },
        demonstrate: { title: "الإثبات", desc: "إثبات التمكن ونقل الفهم" },
        move_forward: { title: "التقدم", desc: "الانتقال للمحطة التالية" },
      },
      nextTitle: "المحطات القادمة في خطتك",
      nextSubtitle: "ترتيب المهام يتغير تلقائياً وفق أدلة أدائك ومختبر الأخطاء (Adaptive Learning).",
      queuedBadge: "في قائمة الانتظار",
      progressTitle: "سجل التمكن والمواد",
      categories: {
        demonstrated: "تم إثبات التحكم",
        emerging: "في طور التحسن",
        needs_work: "تحتاج مراجعة لاحقة",
        not_assessed: "لم تُقيّم بعد",
      },
      pilotCoverageNotice: "المواد الأساسية المدعومة في المرحلة التجريبية",
      curriculumMapTitle: "خريطة المنهاج الموسعة (Sciences Expérimentales)",
      curriculumMapSubtitle: "استكشف 31 مهارة و14 محوراً دراسياً في المواد الأساسية الثلاث، مع تتبع حالة كل كفاءة.",
      topicsCountLabel: "محاور المنهاج:",
      skillsCountLabel: "المهارات المستهدفة:",
      prerequisitesLabel: "المتطلبات المسبقة:",
      difficultyLabel: "مستوى الصعوبة:",
      limitationsTitle: "إشعار الشفافية والحدود التجريبية",
      limitationsText: "الخريطة الحالية مبنية على بيانات تشخيص تجريبية محدودة في المواد الأساسية الثلاث (الرياضيات، العلوم الفيزيائية، علوم الطبيعة والحياة). بقية مواد البكالوريا غير مشمولة في هذه المرحلة.",
    },
    diagnostic: {
      title: "محرك التشخيص الأولي والمنهجي",
      phaseBadge: "المرحلة 03 — التشخيص التجريبي",
      subtitle: "إشارة استطلاعية حول المهارات الأكاديمية وأولويات الانطلاق.",
      desc: "التشخيص في BAC Mastery يوفر مؤشراً استطلاعياً أولياً حول أبعاد الإجابة في البكالوريا الجزائرية:",
      honestBaselineNotice: "جاوب بصدق وهدوء — هذا تشخيص حقيقي مش امتحان باش تدي 20.",
      honestBaselineSub: "الهدف هو كشف الفجوة بدقة لمعالجتها قبل البكالوريا، وليس إعطاء رقم مزيف للتطمين.",
      dimensionsHeading: "الأبعاد الستة للتشخيص:",
      dimensions: {
        knowledge: "1. استرجاع المعارف (استحضار القواعد والتعاريف)",
        understanding: "2. الفهم والتفسير (تحليل الظواهر واستخراج العلاقات)",
        application: "3. التطبيق والحساب (استخدام القوانين دون أخطاء حسابية)",
        methodology: "4. إشارة المنهجية والصياغة (طريقة الإجابة وفق روح مواضيع البكالوريا)",
        speed: "5. السرعة وإدارة الوقت (زمن حل تقديري متوقع)",
        confidence: "6. مؤشر ثقة التلميذ (التمييز بين اليقين والتخمين)",
      },
      returnCta: "الرجوع إلى الخريطة الاستراتيجية",
      startCta: "ابدأ التشخيص الأولي (15 سؤالاً)",
      resumeCta: "متابعة التشخيص الحالي",
      restartCta: "إعادة التشخيص من البداية",
      questionLabel: "سؤال",
      ofLabel: "من",
      timeSpentLabel: "الوقت المستغرق:",
      confidencePrompt: "ما مدى ثقتك في صحة إجابتك قبل الانتقال؟",
      confidenceLevels: {
        1: "ما كنتش واثق (تخمين)",
        2: "ثقة ضعيفة",
        3: "متوسط",
        4: "واثق",
        5: "واثق بزاف",
      },
      nextButton: "السؤال التالي",
      prevButton: "السؤال السابق",
      submitButton: "إنهاء التشخيص وتحليل النتائج",
      results: {
        title: "نتائج التشخيص الأولي التجريبي",
        subtitle: "تحليل تشخيصي استطلاعي: نقاط القوة، الأفخاخ المحتملة، ومعايرة اليقين.",
        mandatoryDisclaimer: "هذا التشخيص يعطيك صورة أولية مبنية على إجاباتك، وليس توقعًا دقيقًا لعلامة البكالوريا.",
        observedScoreLabel: "مؤشر التشخيص الأولي",
        accuracyLabel: "نسبة الدقة في العينة",
        coreSignalLabel: "مؤشر التشخيص الأولي (المواد الأساسية)",
        coreSignalDisclaimer: "المؤشر مبني على المواد التي تم تشخيصها فقط.",
        coverageNotice: "تشخيص أولي للمواد الأساسية (عينة تجريبية)",
        calibrationTitle: "مؤشر معايرة الثقة واليقين",
        discrepancyTitle: "مقارنة التقدير الذاتي مع إشارة التشخيص",
        misconceptionsTitle: "أفخاخ مفاهيمية محتملة تم رصدها (تستحق الانتباه)",
        noMisconceptions: "ممتاز! لم تسجل أي فخ مفاهيمي حرج في هذه العينة.",
        bottleneckTitle: "أول نقطة اختناق مرشحة للعمل",
        bottleneckCandidateNotice: "عائق مرشح للبدء به كأولوية مرحلية وليس حكماً نهائياً.",
        missionTitle: "المهمة الأولى المقترحة للترميم",
        missionDuration: "المدة المقدرة:",
        startMissionCta: "بدء مهمة الترميم الآن",
        updateRoadmapCta: "تحديث الخريطة الاستراتيجية بالبيانات الحقيقية",
        retakeCta: "إعادة التشخيص",
        subjectBreakdownTitle: "تفصيل الأداء حسب المواد الأساسية",
        dimensionsBreakdownTitle: "إشارات الأداء حسب الأبعاد المعرفية الستة",
      },
    },
    mission: {
      phaseBadge: "المرحلة 04 — التدريب العملي ومختبر الأخطاء",
      backToRoadmap: "العودة إلى الخريطة",
      objectiveLabel: "الهدف الأكاديمي للمهمة:",
      estimatedDuration: "المدة المقدرة:",
      practiceMode: "تدريب تطبيقي مركز",
      retestMode: "إعادة اختبار التمكن (Retest)",
      questionProgress: "تمرين {current} من {total}",
      confidencePrompt: "ما مدى ثقتك في إجابتك قبل التأكيد؟",
      confidenceLevels: {
        1: "تخمين (غير متأكد)",
        2: "شك كبير",
        3: "متوسط",
        4: "واثق",
        5: "واثق جداً",
      },
      submitAnswer: "تأكيد الإجابة وفحص الأداء",
      correctTitle: "إجابة صحيحة ومثبتة!",
      correctMessage: "أحسنت! أظهرت فهماً دقيقاً للمفهوم دون الوقوع في الأفخاخ الشائعة.",
      explanationTitle: "الشرح المنهجي وطريقة الحل النموذجية:",
      repairHintTitle: "إشارة التثبيت والترميم:",
      retestBannerTitle: "إعادة اختبار التمكن (Retest)",
      retestBannerSubtitle: "لتثبيت التمكن بدليل عملي، أجب على هذا التمرين المماثل.",
      startRetestButton: "بدء إعادة الاختبار للتمكن",
      masteryAchievedTitle: "تم تحقيق التمكن المعرفي بنجاح! 🎯",
      masteryAchievedMessage: "دليل تمكن مثبت: تم التعرف على الخطأ، وتطبيق خطوات الترميم، واجتياز إعادة الاختبار بنجاح.",
      returnToRoadmap: "العودة إلى الخريطة الدراسية",
      viewErrorLab: "فتح سجل الأخطاء والترميم",
      notFoundTitle: "المهمة غير موجودة!",
      notFoundDesc: "لم يتم العثور على المهمة المطلوبة. يرجى العودة إلى الخريطة لاختيار مهمتك النشطة.",
      positiveEvidenceTitle: "نتيجة إيجابية في طور التحسن",
      positiveEvidenceDesc: "أحسنت! إجابة صحيحة في التمرين الأولي. في BAC Mastery لا نعتبر إجابة واحدة تحكماً مثبتاً، بل إشارة إيجابية واعدة. يمكنك تأكيد تحكمك باختبار توأمي أو مواصلة المسار.",
      verifyRetestCta: "إجراء اختبار توأمي لتأكيد التمكن",
      needsMoreWorkTitle: "تحتاج هذه النقطة إلى عمل إضافي",
      needsMoreWorkDesc: "استنفذنا محاولات إعادة الاختبار المباشرة لهذه الجلسة. لحماية طاقتك ومنع الإحباط، تم تسجيل المهارة للمراجعة لاحقاً، ويمكنك الانتقال إلى مهمة أخرى.",
      retestFailedTitle: "لم يتم اجتياز إعادة الاختبار هذه المرة",
      retestFailedDesc: "وقعت في خطأ خلال إعادة الاختبار. راجع خطوات الترميم العملية ثم أعد المحاولة لتثبيت المفهوم.",
      retryRepairCta: "إعادة مراجعة خطوات الترميم",
      masteryStatusBadges: {
        not_yet: "لم نثبتها بعد",
        emerging: "في طور التحسن",
        demonstrated: "تم إثبات التحكم ✓",
      },
    },
    errorLab: {
      title: "مختبر تحليل الأخطاء والترميم",
      badge: "Error Lab — التشخيص الذاتي",
      subtitle: "الخطأ ليس نهاية المطاف، بل هو المادة الخام للتمكن الحقيقي.",
      recurringBannerTitle: "تنبيه: خطأ متكرر مرصود",
      recurringBannerDesc: "نفس النوع من الخطأ تكرر أكثر من مرة. الأفضل نصلح السبب بدل ما نزيدو تمارين.",
      stats: {
        open: "أخطاء مفتوحة",
        recurring: "أخطاء متكررة",
        remediated: "تم إصلاحها",
      },
      diagnosisHeader: "الجواب غير صحيح — خلينا نفهم علاش.",
      diagnosisSub: "التشخيص الذاتي الدقيق هو الخطوة الأولى لتجنب تكرار الخطأ في البكالوريا.",
      diagnosisQuestion: "واش تحس كان السبب الرئيسي في هذا الخطأ؟",
      suggestedCauseHint: "إشارة النظام المقترحة بناءً على اختيارك:",
      confirmAttributionCta: "تثبيت التشخيص وبدء خطة الترميم",
      repairPlanHeader: "خطة الترميم الفوري (5-10 دقائق)",
      repairPlanSub: "إليك الإجراءات العملية الدقيقة لترميم هذا الخلل قبل الانتقال إلى إعادة الاختبار.",
      repairStrategyTitle: "استراتيجية العلاج:",
      repairStepsTitle: "خطوات التنفيذ العملية:",
      completeRepairCta: "أتممت خطوات الترميم وفهمت الفكرة",
      repairCompletedNotice: "تم تسجيل إتمام الترميم! حان وقت التحقق عبر إعادة الاختبار.",
      readyForRetestCta: "الانتقال إلى إعادة الاختبار (Retest)",
      historyTitle: "سجل الأخطاء ومسارات الترميم",
      historySubtitle: "تتبع تقدمك في تفكيك نقاط الضعف وتحويلها إلى أدلة تمكن مثبتة.",
      emptyErrorsNotice: "لا توجد أخطاء مسجلة بعد. أكمل تمارين المهام وستظهر تحليلاتك هنا.",
      returnToRoadmap: "العودة إلى الخريطة",
      returnToMission: "العودة إلى المهمة",
      statusBadges: {
        identified: "تم رصد الخطأ",
        repair_started: "قيد الترميم",
        repair_completed: "اكتمل الترميم",
        retest_passed: "تم اجتياز الاختبار بنجاح",
        retest_failed: "يحتاج مراجعة إضافية",
      },
      errorTypes: {
        forgot_information: "نسيت المعلومة / القانون",
        misunderstood_concept: "ما فهمتش الفكرة أصلاً",
        methodology_error: "عرفت الفكرة بصح ما عرفتش نطبقها منهجياً",
        calculation_error: "غلطت في الحساب / الإشارة",
        misread_question: "ما قريتش السؤال مليح / تسرعت",
        rushed: "استعجلت في اختيار الإجابة",
        lack_of_practice: "نحتاج تمارين أكثر لتثبيت الفكرة",
        time_management: "مشكل في تنظيم الوقت",
        attention_error: "قلة تركيز وسهو",
        unknown: "ما علاباليش بالضبط",
      },
    },
  },
  fr: {
    common: {
      appName: "BAC Mastery",
      tagline: "Ce n'est pas seulement quoi réviser. C'est comment y arriver.",
      subTagline: "De votre niveau actuel à votre objectif BAC grâce à une feuille de route adaptative, tout en préservant votre énergie et votre avenir.",
      startJourney: "Démarrer le parcours",
      discoverMethod: "Découvrir la méthode",
      selectLanguage: "Langue",
      foundationPhaseBadge: "Phase 02 — Orientation Stratégique",
      mobileFirstBadge: "Expérience Mobile-First",
      zeroCostBadge: "0 DZD Coût Infrastructure",
    },
    pillars: {
      title: "Les 4 Piliers Équilibrés",
      subtitle: "Un système qui ne dit pas simplement « étudie plus », mais structure votre réussite globale.",
      studyTitle: "1. Étude (Study)",
      studyDesc: "Rappel actif, compréhension des mécanismes et résolution conforme aux critères officiels du BAC.",
      progressTitle: "2. Progression (Progress)",
      progressDesc: "Identification du goulet d'étranglement majeur et réparation ciblée des erreurs.",
      mindTitle: "3. Mental & Repos (Mind)",
      mindDesc: "Gestion quotidienne de l'énergie et du stress. Le repos fait partie intégrante de la feuille de route.",
      futureTitle: "4. Avenir (Future)",
      futureDesc: "Connexion de l'effort aux filières universitaires cibles (Médecine, ESI, ENS, Polytech, Économie).",
    },
    loop: {
      title: "La Boucle Centrale du Produit",
      subtitle: "Un moteur continu qui transforme chaque erreur en maîtrise démontrée.",
      steps: {
        goal: "Objectif Stratégique",
        diagnostic: "Diagnostic Cognitif",
        gap: "Analyse d'Écart",
        roadmap: "Feuille de Route",
        mission: "Mission Quotidienne",
        study: "Compréhension",
        practice: "Pratique Ciblée",
        error: "Laboratoire d'Erreurs",
        repair: "Mission de Réparation",
        mastery: "Maîtrise & Re-test",
      },
    },
    streams: {
      title: "Conçu pour Toutes les Filières du BAC",
      subtitle: "Une architecture agnostique s'adaptant aux coefficients et spécificités de chaque filière.",
      agnosticBadge: "Moteur Agnostique",
      bemReadyBadge: "Évolutif vers le BEM",
      items: {
        sciences_exp: "Sciences Expérimentales",
        math: "Mathématiques",
        technique_math: "Technique Mathématiques",
        gestion_eco: "Gestion & Économie",
        lettres_philo: "Lettres & Philosophie",
        langues_etrangeres: "Langues Étrangères",
      },
    },
    aiBridge: {
      badge: "Pont IA Externe",
      title: "Rapport d'Intelligence Étudiante",
      desc: "Générez un rapport structuré de vos points de blocage prêt à être analysé gratuitement dans ChatGPT, Claude ou Gemini.",
      copyPromptCta: "Aperçu du format du rapport",
    },
    footer: {
      builtForAlgeria: "Conçu spécialement pour les candidats au BAC en Algérie",
      constitutionNotice: "Conforme à la constitution du produit — respect de l'effort et préservation de l'énergie.",
    },
    onboarding: {
      nav: {
        back: "Retour",
        next: "Continuer",
        stepOf: "Étape {current} sur {total}",
        finish: "Construire ma carte",
      },
      welcome: {
        tagline: "Ce n'est pas seulement quoi réviser. C'est comment y arriver.",
        subTagline: "Nous identifions votre niveau actuel, fixons votre objectif, et traçons le chemin entre les deux.",
        cta: "Commencer",
      },
      educationLevel: {
        question: "Que préparez-vous ?",
        subtitle: "Sélectionnez votre examen pour calibrer les coefficients officiels.",
        bacOption: "Baccalauréat Algérien (BAC)",
        bemNotice: "Notre architecture prendra bientôt en charge le Brevet (BEM) avec la même rigueur.",
      },
      stream: {
        question: "Quelle est votre filière au BAC ?",
        subtitle: "Choisissez votre filière exacte pour charger les matières clés et coefficients.",
        specialtyQuestion: "Quelle est votre spécialité technique ?",
        specialtySubtitle: "Le coefficient 7 s'appliquera sur la matière d'ingénierie sélectionnée.",
        specialties: {
          civil_eng: "Génie Civil",
          mechanical_eng: "Génie Mécanique",
          electrical_eng: "Génie Électrique",
          process_eng: "Génie des Procédés",
        },
      },
      targetScore: {
        question: "Quel score visez-vous au BAC ?",
        subtitle: "Définissez honnêtement votre cible pour calibrer l'intensité du parcours.",
        exactLabel: "Score exact visé :",
        customInputPlaceholder: "Saisir la note (ex: 16.50)",
        encouragement: "Un objectif clair = un chemin plus direct.",
        ranges: {
          r10_11: "10 – 11 (Succès et consolidation)",
          r12_13: "12 – 13 (Élargissement des choix)",
          r14_15: "14 – 15 (Grandes Écoles et filières sélectives)",
          r16_17: "16 – 17 (Médecine, ESI, Polytech)",
          r18_20: "18 – 20 (Excellence nationale)",
        },
      },
      levelEstimation: {
        title: "Où vous situez-vous actuellement ?",
        subtitle: "Estimez approximativement votre niveau dans les matières de votre filière.",
        disclaimer: "Ceci n'est qu'une estimation préliminaire. Un diagnostic réel suivra pour mesurer votre niveau exact.",
        coreBadge: "Matière clé",
        scale: {
          l1: "1 — Très faible",
          l2: "2 — Faible",
          l3: "3 — Moyen",
          l4: "4 — Bon",
          l5: "5 — Fort",
        },
      },
      availableTime: {
        question: "Combien d'heures pouvez-vous étudier par semaine ?",
        subtitle: "Temps d'étude régulier en dehors du lycée. Le planning doit être réaliste.",
        options: {
          less_than_5: "Moins de 5 heures (Rythme léger)",
          h5_to_8: "5 à 8 heures par semaine",
          h8_to_12: "8 à 12 heures par semaine",
          h12_to_18: "12 à 18 heures par semaine",
          h18_to_25: "18 à 25 heures par semaine",
          h25_plus: "Plus de 25 heures par semaine",
          not_sure: "Je ne suis pas encore sûr(e)",
        },
      },
      futureObjective: {
        question: "Pourquoi voulez-vous obtenir ce résultat ?",
        subtitle: "Le BAC est un pont vers votre avenir. Quelle est votre motivation profonde ?",
        customPlaceholder: "Ou écrivez votre objectif spécifique ici (ex: Faculté de Médecine d'Alger)...",
        options: {
          specific_university_field: "Une filière universitaire précise (Médecine, Pharmacie, Architecture...)",
          higher_school_ens_esi: "Une Grande École (ESI, ENS, Polytech...)",
          specific_profession: "Un métier précis dont je rêve",
          open_more_doors: "Ouvrir un maximum de choix d'orientation",
          prove_to_myself: "Prouver mes capacités à moi-même et à ma famille",
          not_decided_yet: "Pas encore fixé(e), mais je veux maximiser mes chances",
        },
      },
      obstacles: {
        question: "Qu'est-ce qui bloque le plus votre progression ?",
        subtitle: "Vous pouvez sélectionner plusieurs obstacles pour adapter la nature des missions.",
        options: {
          dont_know_where_to_start: "Je ne sais pas par quoi commencer chaque jour",
          start_and_stop: "Je commence avec énergie puis j'abandonne (manque de constance)",
          time_management: "Je n'arrive pas à gérer mon temps entre lycée et révision",
          understand_but_fail_exercises: "Je comprends le cours mais je perds mes points aux exercices",
          memorize_and_forget: "J'apprends par cœur mais j'oublie très rapidement",
          waste_time: "Je perds trop de temps sur les écrans et réseaux sociaux",
          fear_of_bac: "Le stress et l'anxiété liés au BAC",
          big_backlog: "J'ai accumulé un retard important sur les chapitres passés",
          lack_of_confidence: "Je manque de confiance en mes chances de réussir",
          other: "Un autre obstacle personnel",
        },
      },
      studyState: {
        question: "Comment évaluez-vous votre énergie ces jours-ci ?",
        subtitle: "Indication pour adapter le volume d'étude sans provoquer de surmenage.",
        options: {
          good: "🟢 En forme (Excellente énergie, prêt pour un travail intensif)",
          normal: "🟡 Normal (Rythme régulier et disponible)",
          tired: "🟠 Fatigué (Besoin de sessions plus courtes et ciblées)",
          stressed: "🔴 Sous pression (Besoin d'apaisement et de clarté)",
        },
      },
      summary: {
        title: "Résumé de votre profil stratégique",
        subtitle: "Vérifiez vos choix avant de générer votre feuille de route.",
        streamLabel: "Filière :",
        specialtyLabel: "Spécialité technique :",
        targetLabel: "Score BAC visé :",
        estimateLabel: "Niveau estimé initial :",
        timeLabel: "Temps hebdomadaire :",
        futureLabel: "Objectif futur :",
        obstaclesLabel: "Obstacles identifiés :",
        energyLabel: "État d'énergie :",
        editButton: "Modifier",
        buildButton: "Construire ma feuille de route",
      },
      errors: {
        selectEducationLevel: "Veuillez choisir un niveau d'examen.",
        selectStream: "Veuillez sélectionner votre filière.",
        selectSpecialty: "Veuillez sélectionner votre spécialité en Technique Maths.",
        validTargetScore: "Veuillez saisir un score cible valide entre 10.00 et 20.00.",
        selectStreamFirst: "Veuillez sélectionner votre filière d'abord.",
        rateAllCoreSubjects: "Veuillez évaluer toutes les matières clés de votre filière.",
        selectAvailableTime: "Veuillez indiquer votre disponibilité hebdomadaire.",
        selectFutureObjective: "Veuillez choisir ou préciser votre objectif futur.",
        selectAtLeastOneObstacle: "Veuillez sélectionner au moins un obstacle.",
        selectStudyEnergy: "Veuillez indiquer votre état d'énergie actuel.",
      },
    },
    roadmap: {
      title: "Voici votre feuille de route.",
      subtitle: "De votre niveau actuel vers votre objectif — étape par étape, sans dispersion.",
      streamTag: "Filière :",
      targetLabel: "Objectif Stratégique",
      estimateLabel: "Votre niveau actuel — estimation",
      gapLabel: "Distance approximative vers la cible",
      gapUnit: "points",
      bottleneckTitle: "Le premier verrou à débloquer (Goulet d'étranglement majeur)",
      firstMissionTitle: "Première mission recommandée",
      diagnosticNotice: "Cette feuille de route repose sur votre estimation préliminaire. Le véritable diagnostic déterminera le point de départ exact.",
      startDiagnosticCta: "Démarrer le diagnostic académique",
      editProfileCta: "Modifier mon profil stratégique",
      noProfileTitle: "Feuille de route non générée !",
      noProfileDesc: "Veuillez compléter le court questionnaire stratégique pour calculer l'écart et le verrou principal.",
      startOnboardingCta: "Commencer le questionnaire",
      secondaryBottlenecksTitle: "Points secondaires à surveiller :",
      firstMissionNotice: "Première mission pour lancer la dynamique :",
      levelSourceObserved: "Signal diagnostique initial",
      levelSourceEstimate: "Auto-évaluation préliminaire",
      roadmapConfidenceInitial: "Confiance de la feuille de route : Initiale (échantillon pilote)",
      viewDiagnosticResultsCta: "Voir les résultats détaillés et la calibration",
      currentMissionBadge: "Votre mission recommandée actuellement",
      startCurrentMissionCta: "Démarrer la mission",
      errorLabLinkCta: "Laboratoire d'erreurs & Remédiation",
      activeMissionTitle: "Mission Active",
      repairStatusLabel: "Statut de réparation :",
      pageTitle: "Voici votre feuille de route",
      whyThisMission: "Pourquoi cette mission en priorité ?",
      startMissionAction: "Démarrer la mission",
      noMissionsLeft: "Toutes les missions pilotes sont complétées avec succès ! Félicitations.",
      mapTitle: "Votre position actuelle dans le parcours",
      stages: {
        fix: { title: "Réparation", desc: "Traitement prioritaire de l'erreur" },
        verify: { title: "Vérification", desc: "Re-test jumeau de validation" },
        demonstrate: { title: "Démonstration", desc: "Preuve de maîtrise et transfert" },
        move_forward: { title: "Progression", desc: "Passage à l'étape suivante" },
      },
      nextTitle: "Prochaines étapes prévues",
      nextSubtitle: "L'ordre s'adapte automatiquement selon vos résultats et erreurs (Apprentissage Adaptatif).",
      queuedBadge: "En attente",
      progressTitle: "Progression des notions et matières",
      categories: {
        demonstrated: "Maîtrise démontrée",
        emerging: "En progression",
        needs_work: "À réviser ultérieurement",
        not_assessed: "Non encore évaluée",
      },
      pilotCoverageNotice: "Matières fondamentales couvertes dans la phase pilote",
      curriculumMapTitle: "Carte d'apprentissage du programme (Sciences Expérimentales)",
      curriculumMapSubtitle: "Explorez les 31 compétences et 14 chapitres des 3 matières fondamentales avec suivi d'état.",
      topicsCountLabel: "Chapitres du programme :",
      skillsCountLabel: "Compétences ciblées :",
      prerequisitesLabel: "Prérequis :",
      difficultyLabel: "Niveau de difficulté :",
      limitationsTitle: "Note de transparence et limites pilotes",
      limitationsText: "Cette feuille de route repose sur des données diagnostiques pilotes ciblées sur les 3 matières principales (Mathématiques, Physique-Chimie, SVT). Les autres matières du BAC ne sont pas encore évaluées dans cette version.",
    },
    diagnostic: {
      title: "Moteur de Diagnostic Initial & Méthodologique",
      phaseBadge: "Phase 03 — Diagnostic Pilote",
      subtitle: "Signal préliminaire sur vos acquis académiques et priorités de départ.",
      desc: "Dans BAC Mastery, le diagnostic fournit un signal préliminaire sur les compétences clés de l'épreuve du BAC :",
      honestBaselineNotice: "Répondez avec sincérité et calme — ceci est un diagnostic, pas un examen pour décrocher un 20.",
      honestBaselineSub: "L'objectif est d'identifier vos véritables lacunes avant le BAC pour les corriger avec précision.",
      dimensionsHeading: "Les six dimensions mesurées :",
      dimensions: {
        knowledge: "1. Rappel des connaissances (Formules, définitions et propriétés)",
        understanding: "2. Compréhension (Analyse des mécanismes et liaisons logiques)",
        application: "3. Application et calcul (Exécution sans erreurs arithmétiques)",
        methodology: "4. Signal méthodologique BAC (Méthode de réponse conforme à l'esprit du BAC)",
        speed: "5. Vitesse et gestion du temps (Temps de résolution estimé)",
        confidence: "6. Signal de calibration métacognitive (Distinction entre certitude et hasard)",
      },
      returnCta: "Retour à la feuille de route",
      startCta: "Commencer le diagnostic initial (15 questions)",
      resumeCta: "Continuer le diagnostic en cours",
      restartCta: "Recommencer le diagnostic",
      questionLabel: "Question",
      ofLabel: "sur",
      timeSpentLabel: "Temps écoulé :",
      confidencePrompt: "Quel est votre degré de certitude avant de valider ?",
      confidenceLevels: {
        1: "Pas sûr du tout (hasard)",
        2: "Faible certitude",
        3: "Moyennement sûr",
        4: "Confiant",
        5: "Très confiant",
      },
      nextButton: "Question suivante",
      prevButton: "Question précédente",
      submitButton: "Terminer et analyser mes résultats",
      results: {
        title: "Résultats du Diagnostic Pilote",
        subtitle: "Analyse diagnostique préliminaire : points d'appui, pièges potentiels et calibration de certitude.",
        mandatoryDisclaimer: "Ce diagnostic fournit une première estimation basée sur vos réponses. Il ne prédit pas votre note réelle au baccalauréat.",
        observedScoreLabel: "Signal diagnostique initial",
        accuracyLabel: "Précision sur l'échantillon",
        coreSignalLabel: "Indicateur du diagnostic initial (matières fondamentales)",
        coreSignalDisclaimer: "L'indicateur repose uniquement sur les matières ayant fait l'objet du diagnostic.",
        coverageNotice: "Diagnostic initial des matières fondamentales (échantillon pilote)",
        calibrationTitle: "Signal de calibration métacognitive et de certitude",
        discrepancyTitle: "Comparaison entre auto-évaluation et signal diagnostique",
        misconceptionsTitle: "Pièges conceptuels potentiels détectés (Vigilance)",
        noMisconceptions: "Bravo ! Aucun piège conceptuel critique n'a été détecté dans cet échantillon.",
        bottleneckTitle: "Premier candidat au goulet d'étranglement",
        bottleneckCandidateNotice: "Verrou candidat à travailler en priorité d'étape, et non un verdict définitif.",
        missionTitle: "Première Mission de Remédiation",
        missionDuration: "Durée estimée :",
        startMissionCta: "Lancer la mission de réparation",
        updateRoadmapCta: "Actualiser ma feuille de route avec ces résultats",
        retakeCta: "Repasser le diagnostic",
        subjectBreakdownTitle: "Détail par matière fondamentale",
        dimensionsBreakdownTitle: "Signaux de performance selon les six dimensions cognitives",
      },
    },
    mission: {
      phaseBadge: "Phase 04 — Pratique Ciblée & Laboratoire d'Erreurs",
      backToRoadmap: "Retour à la feuille de route",
      objectiveLabel: "Objectif académique de la mission :",
      estimatedDuration: "Durée estimée :",
      practiceMode: "Entraînement ciblé",
      retestMode: "Test de validation (Re-test)",
      questionProgress: "Exercice {current} sur {total}",
      confidencePrompt: "Quel est votre degré de certitude avant de valider ?",
      confidenceLevels: {
        1: "Hasard (non certain)",
        2: "Faible certitude",
        3: "Moyennement sûr",
        4: "Confiant",
        5: "Très confiant",
      },
      submitAnswer: "Valider la réponse et vérifier",
      correctTitle: "Réponse exacte et confirmée !",
      correctMessage: "Excellent travail ! Vous avez démontré une compréhension solide du concept sans tomber dans les pièges.",
      explanationTitle: "Explication méthodologique et correction détaillée :",
      repairHintTitle: "Signal de consolidation :",
      retestBannerTitle: "Validation de la maîtrise (Re-test)",
      retestBannerSubtitle: "Pour consolider votre maîtrise avec une preuve concrète, résolvez cet exercice jumeau.",
      startRetestButton: "Lancer le re-test de validation",
      masteryAchievedTitle: "Maîtrise validée avec succès ! 🎯",
      masteryAchievedMessage: "Preuve de maîtrise établie : erreur identifiée, plan de remédiation appliqué et re-test validé.",
      returnToRoadmap: "Retour à la feuille de route",
      viewErrorLab: "Ouvrir le laboratoire d'erreurs",
      notFoundTitle: "Mission introuvable !",
      notFoundDesc: "La mission demandée n'existe pas. Veuillez retourner à votre feuille de route pour choisir une mission active.",
      positiveEvidenceTitle: "Signal positif en cours de progression",
      positiveEvidenceDesc: "Bien joué ! Réponse correcte à l'exercice initial. Chez BAC Mastery, un seul succès ne suffit pas pour déclarer la maîtrise : c'est un signal prometteur. Vous pouvez valider votre maîtrise avec un re-test jumeau ou continuer votre feuille de route.",
      verifyRetestCta: "Passer le re-test pour valider la maîtrise",
      needsMoreWorkTitle: "Cette notion nécessite du travail supplémentaire",
      needsMoreWorkDesc: "Les tentatives de re-test pour cette session sont terminées. Pour préserver votre énergie et éviter la frustration, cette notion est programmée pour révision ultérieure.",
      retestFailedTitle: "Le re-test n'a pas été validé",
      retestFailedDesc: "Une erreur a été commise lors du re-test. Révisez les étapes méthodologiques puis réessayez pour ancrer la notion.",
      retryRepairCta: "Revoir les étapes de remédiation",
      masteryStatusBadges: {
        not_yet: "Pas encore démontrée",
        emerging: "En progression",
        demonstrated: "Maîtrise démontrée ✓",
      },
    },
    errorLab: {
      title: "Laboratoire d'Erreurs & Remédiation",
      badge: "Error Lab — Auto-diagnostic",
      subtitle: "L'erreur n'est pas un échec, c'est la matière première de la véritable maîtrise.",
      recurringBannerTitle: "Attention : Erreur récurrente détectée",
      recurringBannerDesc: "Le même type d'erreur s'est répété. Il vaut mieux corriger la cause avant d'ajouter d'autres exercices.",
      stats: {
        open: "Erreurs ouvertes",
        recurring: "Erreurs récurrentes",
        remediated: "Remédiées",
      },
      diagnosisHeader: "Réponse incorrecte — analysons pourquoi.",
      diagnosisSub: "L'auto-diagnostic précis est le premier pas pour éviter de reproduire cette erreur au BAC.",
      diagnosisQuestion: "Quelle est la cause principale selon vous ?",
      suggestedCauseHint: "Signal suggéré par le système selon votre réponse :",
      confirmAttributionCta: "Confirmer le diagnostic et lancer la remédiation",
      repairPlanHeader: "Plan de remédiation immédiat (5-10 min)",
      repairPlanSub: "Voici les actions méthodologiques concrètes pour combler cette lacune avant le re-test.",
      repairStrategyTitle: "Stratégie de remédiation :",
      repairStepsTitle: "Étapes pratiques d'exécution :",
      completeRepairCta: "J'ai complété les étapes de remédiation",
      repairCompletedNotice: "Remédiation enregistrée ! Il est temps de valider vos acquis par un re-test.",
      readyForRetestCta: "Passer au re-test de validation",
      historyTitle: "Historique des erreurs et remédiations",
      historySubtitle: "Suivez votre progression dans l'élimination des verrous méthodologiques.",
      emptyErrorsNotice: "Aucune erreur enregistrée pour le moment. Vos analyses apparaîtront ici après vos exercices.",
      returnToRoadmap: "Retour à la feuille de route",
      returnToMission: "Retour à la mission",
      statusBadges: {
        identified: "Erreur identifiée",
        repair_started: "Remédiation en cours",
        repair_completed: "Remédiation terminée",
        retest_passed: "Re-test validé",
        retest_failed: "Nécessite révision",
      },
      errorTypes: {
        forgot_information: "Oubli de la formule ou du cours",
        misunderstood_concept: "Incompréhension du concept fondamental",
        methodology_error: "Concept compris mais difficulté d'application méthodologique",
        calculation_error: "Erreur de calcul ou de signe",
        misread_question: "Consigne mal lue ou incomprise",
        rushed: "Précipitation dans le choix de la réponse",
        lack_of_practice: "Besoin de plus d'entraînement",
        time_management: "Problème de gestion du temps",
        attention_error: "Manque d'attention ponctuel",
        unknown: "Cause indéterminée",
      },
    },
  },
};
