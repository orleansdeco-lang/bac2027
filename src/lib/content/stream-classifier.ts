import { StreamId, ExtendedStreamId, SubjectId } from "@/types/education";
import { ALL_SUBJECTS, ALGERIAN_BAC_STREAMS, EXTENDED_ALGERIAN_BAC_STREAMS, STREAM_BRANCHES } from "@/lib/constants/streams";

export interface ClassifiedContentItem {
  streamId: ExtendedStreamId;
  streamName: string;
  subjectId: SubjectId;
  subjectName: string;
  branchId?: string;
  branchName?: string;
}

/**
 * Robust Canonical Classifier for Algerian Educational Materials (BAC / BEM)
 * Accurately maps raw titles, subjects, and streams into canonical streamId, subjectId, and branchId.
 */
export function classifyContentItem(raw: {
  title?: string;
  subject?: string;
  stream?: string;
  category?: string;
  url?: string;
}): ClassifiedContentItem {
  const title = (raw.title || "").toLowerCase();
  const rawSubject = (raw.subject || "").toLowerCase();
  const rawStream = (raw.stream || "").toLowerCase();
  const rawUrl = (raw.url || "").toLowerCase();
  const combined = `${title} ${rawSubject} ${rawStream} ${rawUrl}`;

  let streamId: ExtendedStreamId = "sciences_exp";
  let subjectId: SubjectId = "math";
  let branchId: string | undefined = undefined;

  // =========================================================================
  // 1. TECHNIQUE MATH ENGINEERING BRANCHES (الفروع الهندسية لتقني رياضي)
  // =========================================================================
  if (
    rawSubject.includes("مدنية") ||
    rawSubject.includes("civil") ||
    combined.includes("هندسة مدنية") ||
    combined.includes("génie civil")
  ) {
    streamId = "technique_math";
    subjectId = "civil_eng";
    branchId = "civil_eng";
  } else if (
    rawSubject.includes("ميكانيكية") ||
    rawSubject.includes("mecanique") ||
    rawSubject.includes("mécanique") ||
    combined.includes("هندسة ميكانيكية") ||
    combined.includes("génie mécanique")
  ) {
    streamId = "technique_math";
    subjectId = "mechanical_eng";
    branchId = "mechanical_eng";
  } else if (
    rawSubject.includes("كهربائية") ||
    rawSubject.includes("electrique") ||
    rawSubject.includes("électrique") ||
    combined.includes("هندسة كهربائية") ||
    combined.includes("génie électrique")
  ) {
    streamId = "technique_math";
    subjectId = "electrical_eng";
    branchId = "electrical_eng";
  } else if (
    rawSubject.includes("طرائق") ||
    rawSubject.includes("procedes") ||
    rawSubject.includes("procédés") ||
    combined.includes("هندسة الطرائق") ||
    combined.includes("génie des procédés")
  ) {
    streamId = "technique_math";
    subjectId = "process_eng";
    branchId = "process_eng";
  }

  // =========================================================================
  // 2. FOREIGN LANGUAGES THIRD LANGUAGE BRANCHES (اللغات الأجنبية - اللغة الثالثة)
  // =========================================================================
  else if (
    rawSubject.includes("ألمان") ||
    rawSubject.includes("deutsch") ||
    rawSubject.includes("german") ||
    rawSubject.includes("allemand") ||
    combined.includes("لغة ألمانية") ||
    combined.includes("اللغة الألمانية")
  ) {
    streamId = "langues_etrangeres";
    subjectId = "third_language_de";
    branchId = "allemand";
  } else if (
    rawSubject.includes("إسبان") ||
    rawSubject.includes("اسبان") ||
    rawSubject.includes("espanol") ||
    rawSubject.includes("español") ||
    rawSubject.includes("spanish") ||
    combined.includes("لغة إسبانية") ||
    combined.includes("اللغة الإسبانية")
  ) {
    streamId = "langues_etrangeres";
    subjectId = "third_language_es";
    branchId = "espagnol";
  } else if (
    rawSubject.includes("إيطال") ||
    rawSubject.includes("ايطال") ||
    rawSubject.includes("italien") ||
    rawSubject.includes("italian") ||
    combined.includes("لغة إيطالية") ||
    combined.includes("اللغة الإيطالية")
  ) {
    streamId = "langues_etrangeres";
    subjectId = "third_language_it";
    branchId = "italien";
  }

  // =========================================================================
  // 3. ARTS STREAM & BRANCHES (شعبة الفنون وفروعها)
  // =========================================================================
  else if (
    combined.includes("سينما") ||
    combined.includes("سمعي بصري") ||
    combined.includes("audiovisuel")
  ) {
    streamId = "arts";
    subjectId = "art_specialty";
    branchId = "cinema_audiovisuel";
  } else if (
    combined.includes("فنون تشكيلية") ||
    combined.includes("arts plastiques")
  ) {
    streamId = "arts";
    subjectId = "art_specialty";
    branchId = "arts_plastiques";
  } else if (
    combined.includes("موسيقى") ||
    combined.includes("musique")
  ) {
    streamId = "arts";
    subjectId = "art_specialty";
    branchId = "musique";
  } else if (
    combined.includes("مسرح") ||
    combined.includes("théâtre") ||
    combined.includes("theatre")
  ) {
    streamId = "arts";
    subjectId = "art_specialty";
    branchId = "theatre";
  }

  // =========================================================================
  // 4. GESTION & ECONOMIE SPECIALIZED SUBJECTS (مواد التسيير والاقتصاد)
  // =========================================================================
  else if (
    rawSubject.includes("محاسب") ||
    rawSubject.includes("تسيير مالي") ||
    rawSubject.includes("compta")
  ) {
    streamId = "gestion_eco";
    subjectId = "accounting_finance";
  } else if (
    rawSubject.includes("اقتصاد") ||
    rawSubject.includes("مناجمنت") ||
    rawSubject.includes("management")
  ) {
    streamId = "gestion_eco";
    subjectId = "economics_management";
  } else if (
    rawSubject.includes("قانون") ||
    rawSubject.includes("droit")
  ) {
    streamId = "gestion_eco";
    subjectId = "law";
  }

  // =========================================================================
  // 5. NATURAL SCIENCES (علوم الطبيعة والحياة)
  // =========================================================================
  else if (
    rawSubject.includes("طبيعة") ||
    rawSubject.includes("علوم طبيعية") ||
    rawSubject.includes("snv") ||
    rawSubject.includes("biologie")
  ) {
    subjectId = "natural_sciences";
    if (rawStream.includes("رياضيات") || title.includes("شعبة رياضيات")) {
      streamId = "math";
    } else {
      streamId = "sciences_exp";
    }
  }

  // =========================================================================
  // 6. PHYSICS & CHEMISTRY (العلوم الفيزيائية)
  // =========================================================================
  else if (
    rawSubject.includes("فيزياء") ||
    rawSubject.includes("physique")
  ) {
    subjectId = "physics";
    if (rawStream.includes("تقني") || title.includes("تقني رياضي")) {
      streamId = "technique_math";
    } else if (rawStream.includes("رياضيات") || title.includes("شعبة رياضيات")) {
      streamId = "math";
    } else {
      streamId = "sciences_exp";
    }
  }

  // =========================================================================
  // 7. PHILOSOPHY (الفلسفة)
  // =========================================================================
  else if (
    rawSubject.includes("فلسفة") ||
    rawSubject.includes("philo")
  ) {
    subjectId = "philosophy";
    if (rawStream.includes("آداب") || rawStream.includes("اداب") || title.includes("آداب وفلسفة")) {
      streamId = "lettres_philo";
    } else if (rawStream.includes("لغات") || title.includes("لغات أجنبية")) {
      streamId = "langues_etrangeres";
    } else if (rawStream.includes("تسيير") || title.includes("تسيير واقتصاد")) {
      streamId = "gestion_eco";
    } else if (rawStream.includes("تقني") || title.includes("تقني رياضي")) {
      streamId = "technique_math";
    } else if (rawStream.includes("رياضيات") || title.includes("شعبة رياضيات")) {
      streamId = "math";
    } else if (rawStream.includes("علمي") || rawStream.includes("علوم تجريبية")) {
      streamId = "sciences_exp";
    } else {
      streamId = "lettres_philo";
    }
  }

  // =========================================================================
  // 8. MATHEMATICS (الرياضيات)
  // =========================================================================
  else if (
    rawSubject.includes("رياضيات") ||
    rawSubject.includes("math")
  ) {
    subjectId = "math";
    if (rawStream.includes("تقني") || title.includes("تقني رياضي")) {
      streamId = "technique_math";
    } else if (rawStream.includes("تسيير") || title.includes("تسيير واقتصاد")) {
      streamId = "gestion_eco";
    } else if (rawStream.includes("آداب") || rawStream.includes("اداب") || title.includes("آداب وفلسفة")) {
      streamId = "lettres_philo";
    } else if (rawStream.includes("لغات") || title.includes("لغات أجنبية")) {
      streamId = "langues_etrangeres";
    } else if (rawStream.includes("رياضيات") || title.includes("شعبة رياضيات")) {
      streamId = "math";
    } else {
      streamId = "sciences_exp";
    }
  }

  // =========================================================================
  // 9. ARABIC LANGUAGE & LITERATURE (اللغة العربية وآدابها)
  // =========================================================================
  else if (
    rawSubject.includes("عربية") ||
    rawSubject.includes("arabe")
  ) {
    subjectId = "arabic";
    if (rawStream.includes("آداب") || rawStream.includes("اداب") || title.includes("آداب وفلسفة")) {
      streamId = "lettres_philo";
    } else if (rawStream.includes("لغات") || title.includes("لغات أجنبية")) {
      streamId = "langues_etrangeres";
    } else if (rawStream.includes("تسيير") || title.includes("تسيير واقتصاد")) {
      streamId = "gestion_eco";
    } else if (rawStream.includes("تقني") || title.includes("تقني رياضي")) {
      streamId = "technique_math";
    } else if (rawStream.includes("رياضيات") || title.includes("شعبة رياضيات")) {
      streamId = "math";
    } else {
      streamId = "sciences_exp";
    }
  }

  // =========================================================================
  // 10. HISTORY & GEOGRAPHY (التاريخ والجغرافيا)
  // =========================================================================
  else if (
    rawSubject.includes("تاريخ") ||
    rawSubject.includes("جغرافيا") ||
    rawSubject.includes("اجتماعيات") ||
    rawSubject.includes("histoire") ||
    rawSubject.includes("géographie")
  ) {
    subjectId = "history_geography";
    if (rawStream.includes("آداب") || rawStream.includes("اداب") || title.includes("آداب وفلسفة")) {
      streamId = "lettres_philo";
    } else if (rawStream.includes("تسيير") || title.includes("تسيير واقتصاد")) {
      streamId = "gestion_eco";
    } else if (rawStream.includes("لغات") || title.includes("لغات أجنبية")) {
      streamId = "langues_etrangeres";
    } else if (rawStream.includes("تقني") || title.includes("تقني رياضي")) {
      streamId = "technique_math";
    } else if (rawStream.includes("رياضيات") || title.includes("شعبة رياضيات")) {
      streamId = "math";
    } else {
      streamId = "sciences_exp";
    }
  }

  // =========================================================================
  // 11. ISLAMIC STUDIES (العلوم الإسلامية)
  // =========================================================================
  else if (
    rawSubject.includes("إسلامية") ||
    rawSubject.includes("اسلامية") ||
    rawSubject.includes("شرعية") ||
    rawSubject.includes("islamique")
  ) {
    subjectId = "islamic_studies";
    if (rawStream.includes("آداب") || rawStream.includes("اداب")) {
      streamId = "lettres_philo";
    } else if (rawStream.includes("تسيير")) {
      streamId = "gestion_eco";
    } else if (rawStream.includes("لغات")) {
      streamId = "langues_etrangeres";
    } else if (rawStream.includes("تقني")) {
      streamId = "technique_math";
    } else if (rawStream.includes("رياضيات")) {
      streamId = "math";
    } else {
      streamId = "sciences_exp";
    }
  }

  // =========================================================================
  // 12. FRENCH LANGUAGE (اللغة الفرنسية)
  // =========================================================================
  else if (
    rawSubject.includes("فرنسية") ||
    rawSubject.includes("francais") ||
    rawSubject.includes("français")
  ) {
    subjectId = "french";
    if (rawStream.includes("لغات") || title.includes("لغات أجنبية")) {
      streamId = "langues_etrangeres";
    } else if (rawStream.includes("آداب") || title.includes("آداب وفلسفة")) {
      streamId = "lettres_philo";
    } else if (rawStream.includes("تسيير") || title.includes("تسيير واقتصاد")) {
      streamId = "gestion_eco";
    } else if (rawStream.includes("تقني") || title.includes("تقني رياضي")) {
      streamId = "technique_math";
    } else if (rawStream.includes("رياضيات") || title.includes("شعبة رياضيات")) {
      streamId = "math";
    } else {
      streamId = "sciences_exp";
    }
  }

  // =========================================================================
  // 13. ENGLISH LANGUAGE (اللغة الإنجليزية)
  // =========================================================================
  else if (
    rawSubject.includes("انجليزية") ||
    rawSubject.includes("إنجليزية") ||
    rawSubject.includes("anglais") ||
    rawSubject.includes("english")
  ) {
    subjectId = "english";
    if (rawStream.includes("لغات") || title.includes("لغات أجنبية")) {
      streamId = "langues_etrangeres";
    } else if (rawStream.includes("آداب") || title.includes("آداب وفلسفة")) {
      streamId = "lettres_philo";
    } else if (rawStream.includes("تسيير") || title.includes("تسيير واقتصاد")) {
      streamId = "gestion_eco";
    } else if (rawStream.includes("تقني") || title.includes("تقني رياضي")) {
      streamId = "technique_math";
    } else if (rawStream.includes("رياضيات") || title.includes("شعبة رياضيات")) {
      streamId = "math";
    } else {
      streamId = "sciences_exp";
    }
  }

  // =========================================================================
  // 14. TAMAZIGHT (اللغة الأمازيغية)
  // =========================================================================
  else if (
    rawSubject.includes("أمازيغية") ||
    rawSubject.includes("امازيغية") ||
    rawSubject.includes("tamazight")
  ) {
    subjectId = "tamazight";
    streamId = "sciences_exp";
  }

  // =========================================================================
  // Resolve localized names
  // =========================================================================
  const streamMeta = (EXTENDED_ALGERIAN_BAC_STREAMS as any)[streamId] || (ALGERIAN_BAC_STREAMS as any)[streamId];
  const streamName = streamMeta?.name_ar || "شعبة عامة";

  const subjectMeta = ALL_SUBJECTS[subjectId];
  const subjectName = subjectMeta?.name_ar || raw.subject || "مادة تعليمية";

  let branchName: string | undefined = undefined;
  if (branchId) {
    const branches = STREAM_BRANCHES[streamId] || [];
    const foundBranch = branches.find((b) => b.id === branchId || b.code.toLowerCase() === branchId?.toLowerCase());
    branchName = foundBranch?.name_ar;
  }

  return {
    streamId,
    streamName,
    subjectId,
    subjectName,
    branchId,
    branchName,
  };
}
