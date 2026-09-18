"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n/context";
import { useAuth } from "@/lib/auth/context";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { AppShell } from "@/components/ui/AppShell";
import { Logo, ShaterIcon } from "@/components/ui/Logo";
import { StudentService } from "@/lib/services";
import { StudentProfile } from "@/types/student";
import { trackEvent } from "@/lib/analytics";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  Target,
  Brain,
  RotateCcw,
  Clock,
  Heart,
  ChevronDown,
  Compass,
  GraduationCap,
  Award,
  Sliders,
  Check,
  X,
  Layers,
  HelpCircle,
  MessageCircle,
  BookOpen,
  FileText,
  PenTool,
  CheckSquare,
  AlertTriangle,
  Lightbulb,
  Crosshair,
  TrendingUp,
  UserCheck,
  ChevronRight,
  ChevronLeft,
  Info,
  Laptop,
} from "lucide-react";

// ============================================================================
// 1. UNIVERSITY SPECIALTY CALCULATOR DATA (Ground Truth Algerian Baccalaureate)
// ============================================================================

export type StreamKey =
  | "sciences_exp"
  | "math"
  | "technique_math"
  | "gestion_eco"
  | "lettres_philo"
  | "langues_etrangeres";

interface StreamOption {
  id: StreamKey;
  labelAr: string;
  labelFr: string;
  badge: string;
}

export const STREAMS_LIST: StreamOption[] = [
  { id: "sciences_exp", labelAr: "علوم تجريبية", labelFr: "Sciences Expérimentales", badge: "علمي" },
  { id: "math", labelAr: "رياضيات", labelFr: "Mathématiques", badge: "علمي دقيق" },
  { id: "technique_math", labelAr: "تقني رياضي", labelFr: "Technique Mathématiques", badge: "هندسة" },
  { id: "gestion_eco", labelAr: "تسيير واقتصاد", labelFr: "Gestion & Économie", badge: "اقتصاد" },
  { id: "lettres_philo", labelAr: "آداب وفلسفة", labelFr: "Lettres & Philosophie", badge: "أدبي" },
  { id: "langues_etrangeres", labelAr: "لغات أجنبية", labelFr: "Langues Étrangères", badge: "لغات" },
];

interface UniversityTierResult {
  minScore: number;
  maxScore: number;
  tierTitleAr: string;
  tierTitleFr: string;
  badgeAr: string;
  badgeFr: string;
  adviceAr: string;
  adviceFr: string;
  facultiesAr: string[];
  facultiesFr: string[];
}

const STREAM_UNIVERSITY_DATA: Record<StreamKey, UniversityTierResult[]> = {
  sciences_exp: [
    {
      minScore: 10.0,
      maxScore: 11.99,
      tierTitleAr: "عتبة القبول الجامعي الأساسي (LMD)",
      tierTitleFr: "Accès Universitaire Fondamental (LMD)",
      badgeAr: "مقبول",
      badgeFr: "Admis",
      adviceAr: "ركز على تثبيت المفاهيم القاعدية في العلوم والفيزياء لرفع المعدل وتجنب ضياع النقاط السهلة.",
      adviceFr: "Consolidez les bases pour viser les mentions supérieures.",
      facultiesAr: [
        "علوم الطبيعة والحياة (SNV LMD)",
        "علوم المادة (SM — كيمياء وفيزياء أساسية)",
        "علوم الأرض والكون (STU - جيولوجيا)",
        "العلوم الاقتصادية وعلوم التسيير",
        "العلوم الإنسانية والاجتماعية",
        "ليسانس لغة فرنسية / إنجليزية",
      ],
      facultiesFr: [
        "Sciences de la Nature et de la Vie (SNV LMD)",
        "Sciences de la Matière (SM)",
        "Sciences de la Terre et de l'Univers (STU)",
        "Sciences Économiques & Gestion",
        "Sciences Humaines & Sociales",
        "Langues Vivantes (Français / Anglais)",
      ],
    },
    {
      minScore: 12.0,
      maxScore: 13.49,
      tierTitleAr: "عتبة التخصصات البيولوجية والتطبيقية",
      tierTitleFr: "Filières Biologiques & Appliquées",
      badgeAr: "مستوى مستقر",
      badgeFr: "Niveau Stable",
      adviceAr: "العمل على المنهجية الدقيقة لسلم التنقيط الوزاري في العلوم الطبيعية يقفز بك مباشرة لعتبة المدارس العليا.",
      adviceFr: "La rigueur méthodologique en sciences vous ouvrira les grandes écoles.",
      facultiesAr: [
        "البيوتكنولوجيا والعلوم الغذائية (LMD)",
        "معاهد التمريض والشبه طبي (Paramédical)",
        "العلوم الفلاحية والتنمية الريفية",
        "الهندسة البيئية والمخبرية",
        "علوم الإعلام الآلي والتسيير الآلي",
      ],
      facultiesFr: [
        "Biotechnologie & Agro-alimentaire",
        "Instituts Paramédicaux & Soins",
        "Sciences Agronomiques",
        "Génie Environnemental & Laboratoires",
        "Informatique de Gestion",
      ],
    },
    {
      minScore: 13.5,
      maxScore: 14.99,
      tierTitleAr: "عتبة المدارس العليا والهندسة المعمارية",
      tierTitleFr: "Grandes Écoles & Architecture",
      badgeAr: "امتياز واعد",
      badgeFr: "Mention Bien",
      adviceAr: "أنت قريب جداً من النخبة الطبية! ركز في معمل الأخطاء على معالجة هفوات الصياغة والحسابات الفيزيائية.",
      adviceFr: "Le pôle médical est à portée de main avec une remédiation ciblée.",
      facultiesAr: [
        "الهندسة المعمارية والعمران (EPAU الحراش)",
        "المدرسة الوطنية العليا للبيوتكنولوجيا (ENSB قسنطينة)",
        "المدرسة الوطنية العليا للفلاحة (ENSA)",
        "كليات العلوم البيطرية (Vétérinaire)",
        "معاهد الشبه طبي المتخصصة وقبالة",
      ],
      facultiesFr: [
        "Architecture & Urbanisme (EPAU)",
        "École Nationale de Biotechnologie (ENSB)",
        "École Nationale Supérieure d'Agronomie (ENSA)",
        "Sciences Vétérinaires",
        "Paramédical Spécialisé & Maïeutique",
      ],
    },
    {
      minScore: 15.0,
      maxScore: 16.49,
      tierTitleAr: "عتبة كليات الصيدلة والأسنان والمدارس العليا للأساتذة",
      tierTitleFr: "Pharmacie, Dentaire & ENS",
      badgeAr: "امتياز عالي",
      badgeFr: "Très Bien",
      adviceAr: "إتقان كامل لمنهجية المسعى العلمي في العلوم والحصول على 17+ في الرياضيات يضمن لك كليات الطب مباشرة.",
      adviceFr: "Maîtrisez la démarche scientifique pour sécuriser la médecine.",
      facultiesAr: [
        "كليات الصيدلة (Pharmacie)",
        "كليات طب الأسنان (Chirurgie Dentaire)",
        "المدارس العليا للأساتذة (ENS علوم طبيعية / رياضيات للطور الثانوي)",
        "الأقسام التحضيرية في البيوتكنولوجيا والعلوم الصحية",
        "المدارس العليا للتكنولوجيا الحيوية",
      ],
      facultiesFr: [
        "Faculté de Pharmacie",
        "Chirurgie Dentaire",
        "Écoles Normales Supérieures (ENS Secondaire)",
        "Classes Préparatoires Santé & Biotech",
        "Écoles Supérieures de Technologie",
      ],
    },
    {
      minScore: 16.5,
      maxScore: 20.0,
      tierTitleAr: "قمة النخبة الوطنية: كليات الطب والذكاء الاصطناعي",
      tierTitleFr: "Élite Nationale : Médecine & IA",
      badgeAr: "نخبة الجزائر 🇩🇿",
      badgeFr: "Élite Nationale 🇩🇿",
      adviceAr: "استمر في حل المواضيع التجريبية المركبة مع مؤقت زمني لترسيخ الهدوء الذهني وحصد المراتب الأولى وطنياً.",
      adviceFr: "Entraînement sous contrainte temporelle pour viser les premiers rangs nationaux.",
      facultiesAr: [
        "كليات الطب البشري (Faculté de Médecine)",
        "المدرسة الوطنية العليا للذكاء الاصطناعي (ENSIA سيدي عبد الله)",
        "المدرسة الوطنية العليا للإعلام الآلي (ESI Alger)",
        "كليات طب الأسنان والصيدلة (اختيار أول بأريحية تامة)",
        "المدارس العليا للأمن السيبراني والأنظمة الذكية",
      ],
      facultiesFr: [
        "Faculté de Médecine",
        "École Nationale d'Intelligence Artificielle (ENSIA)",
        "École Supérieure d'Informatique (ESI)",
        "Dentaire & Pharmacie (Choix garanti)",
        "Cybersécurité & Systèmes Intelligents",
      ],
    },
  ],

  math: [
    {
      minScore: 10.0,
      maxScore: 11.99,
      tierTitleAr: "عتبة العلوم والتكنولوجيا والإعلام الآلي",
      tierTitleFr: "Sciences, Technologie & Informatique LMD",
      badgeAr: "مقبول",
      badgeFr: "Admis",
      adviceAr: "معامل الرياضيات (7) والفيزياء (6) هما سلاحك الأول. رفع نقطتين فيهما ينقلك إلى معدل 13+.",
      adviceFr: "Les forts coefficients Maths et Physique sont votre plus grand levier.",
      facultiesAr: [
        "رياضيات وإعلام آلي (MI LMD)",
        "علوم وتكنولوجيا (ST LMD)",
        "علوم المادة (فيزياء وكيمياء)",
        "العلوم الاقتصادية والتسيير التجاري",
        "علوم الطيران والملاحة",
      ],
      facultiesFr: [
        "Maths & Informatique (MI LMD)",
        "Sciences & Technologies (ST)",
        "Sciences de la Matière",
        "Sciences Économiques",
        "Aéronautique LMD",
      ],
    },
    {
      minScore: 12.0,
      maxScore: 13.49,
      tierTitleAr: "عتبة المعاهد التكنولوجية والهندسة",
      tierTitleFr: "Instituts Technologiques & Ingénierie",
      badgeAr: "مستوى جيد",
      badgeFr: "Bon Niveau",
      adviceAr: "تحكم في براهين المتتاليات والدوال المعقدة لسد أي ثغرة وضمان الانتقال إلى مصاف المدارس الوطنية.",
      adviceFr: "Perfectionnez les démonstrations pour accéder aux écoles nationales.",
      facultiesAr: [
        "الأقسام التحضيرية في العلوم والتقنيات (CPST)",
        "المعاهد الوطنية للإلكترونيك والإعلام الآلي",
        "الهندسة المعمارية والعمران (EPAU)",
        "علوم وتقنيات الاتصال والشبكات",
      ],
      facultiesFr: [
        "Classes Préparatoires Sciences & Techniques (CPST)",
        "Instituts d'Électronique et Informatique",
        "Architecture (EPAU)",
        "Télécommunications & Réseaux",
      ],
    },
    {
      minScore: 13.5,
      maxScore: 14.99,
      tierTitleAr: "عتبة المدارس العليا للإعلام الآلي والبوليتكنيك",
      tierTitleFr: "Écoles d'Informatique & Polytechnique",
      badgeAr: "امتياز واعد",
      badgeFr: "Mention Bien",
      adviceAr: "أنت في مدار الصفوة الهندسية. تجنب الأخطاء الحسابية المتسرعة في معمل الأخطاء للوصول لعتبة 16+.",
      adviceFr: "Éliminez les fautes d'inattention pour franchir le seuil des 16/20.",
      facultiesAr: [
        "المدرسة العليا للإعلام الآلي (ESI سيدي بلعباس)",
        "الأقسام التحضيرية في المدارس الكبرى للهندسة (ENP/ENSH)",
        "المدرسة الوطنية العليا للذكاء الاصطناعي (أولوية أولى بشعبة الرياضيات)",
        "كليات العلوم الطبية (بأفضلية معامل التوجيه لشعبة الرياضيات)",
      ],
      facultiesFr: [
        "École Supérieure d'Informatique (ESI Sidi Bel Abbès)",
        "Classes Prépa Grandes Écoles d'Ingénieurs",
        "Intelligence Artificielle (Priorité Mathématiques)",
        "Facultés Médicales (Priorité coefficientaire)",
      ],
    },
    {
      minScore: 15.0,
      maxScore: 16.49,
      tierTitleAr: "عتبة البوليتكنيك والمدارس العليا الكبرى",
      tierTitleFr: "Polytechnique & Grandes Écoles",
      badgeAr: "امتياز عالي",
      badgeFr: "Très Bien",
      adviceAr: "أنت تنافس على مقاعد الهندسة الأكثر ندرة واعترافاً دولياً في الجزائر.",
      adviceFr: "Vous êtes aux portes des filières d'excellence les plus réputées.",
      facultiesAr: [
        "المدرسة الوطنية المتعددة التقنيات بالجزائر (Polytechnique ENP)",
        "المدرسة الوطنية العليا للإعلام الآلي (ESI Alger)",
        "المدرسة الوطنية العليا للرياضيات (ENSM سيدي عبد الله)",
        "كليات الطب البشري وطب الأسنان والصيدلة",
      ],
      facultiesFr: [
        "École Nationale Polytechnique (ENP Alger)",
        "École Supérieure d'Informatique (ESI Alger)",
        "École Nationale de Mathématiques (ENSM)",
        "Médecine, Dentaire & Pharmacie",
      ],
    },
    {
      minScore: 16.5,
      maxScore: 20.0,
      tierTitleAr: "قمة النخبة الوطنية: الذكاء الاصطناعي والرياضيات والطب",
      tierTitleFr: "Sommet National : ENSIA, ESI & Médecine",
      badgeAr: "نخبة الجزائر 🇩🇿",
      badgeFr: "Élite Nationale 🇩🇿",
      adviceAr: "أفضلية شعبة الرياضيات تمنحك الأولوية رقم 1 وطنياً في جميع بطاقات الرغبات بدون استثناء.",
      adviceFr: "La filière Mathématiques vous confère la priorité absolue au choix.",
      facultiesAr: [
        "المدرسة الوطنية العليا للذكاء الاصطناعي (ENSIA — المرتبة الأولى)",
        "المدرسة الوطنية العليا للإعلام الآلي (ESI Alger)",
        "المدرسة الوطنية المتعددة التقنيات (ENP)",
        "كليات الطب البشري (Faculté de Médecine)",
        "المدرسة الوطنية العليا للأمن السيبراني والأنظمة الذكية",
      ],
      facultiesFr: [
        "École Nationale d'IA (ENSIA — Rang 1)",
        "École Supérieure d'Informatique (ESI)",
        "Polytechnique Alger (ENP)",
        "Faculté de Médecine",
        "Cybersécurité & Systèmes Autonomes",
      ],
    },
  ],

  technique_math: [
    {
      minScore: 10.0,
      maxScore: 11.99,
      tierTitleAr: "عتبة العلوم والتكنولوجيا والهندسة التطبيقية",
      tierTitleFr: "Sciences, Technologie & Génie Appliqué",
      badgeAr: "مقبول",
      badgeFr: "Admis",
      adviceAr: "مادة التخصص الهندسي معاملها 7! التمكن منها ومن الرياضيات يضمن لك معدل ممتاز في البكالوريا.",
      adviceFr: "Votre matière de spécialité a un coefficient 7 : faites-en votre moteur.",
      facultiesAr: [
        "علوم وتكنولوجيا (ST LMD — جميع فروع الهندسة)",
        "هندسة ميكانيكية وهندسة مدنية LMD",
        "إلكتروتقنيك وإلكترونيك صناعية",
        "علوم المادة والطاقات المتجددة",
        "العلوم الاقتصادية والتسيير التجاري",
      ],
      facultiesFr: [
        "Sciences & Technologies (ST LMD)",
        "Génie Mécanique & Civil",
        "Électrotechnique & Électronique Industrielle",
        "Sciences de la Matière & Énergies Renouvelables",
        "Sciences Économiques",
      ],
    },
    {
      minScore: 12.0,
      maxScore: 13.49,
      tierTitleAr: "عتبة الأقسام التحضيرية في الهندسة",
      tierTitleFr: "Classes Préparatoires d'Ingénieurs",
      badgeAr: "مستوى جيد",
      badgeFr: "Bon Niveau",
      adviceAr: "استمر في تدريبات الفيزياء والرياضيات لرفع معدل التوجيه الخاص بالأقسام التحضيرية العليا.",
      adviceFr: "Poussez en physique-chimie pour décrocher les prépas intégrées.",
      facultiesAr: [
        "الأقسام التحضيرية في العلوم والتقنيات (CPST)",
        "الهندسة المعمارية والعمران (EPAU)",
        "معاهد الإلكترونيك والإعلام الآلي",
        "المدرسة العليا في الهندسة الكهربائية والطاقوية",
      ],
      facultiesFr: [
        "Classes Préparatoires Sciences & Techniques (CPST)",
        "Architecture (EPAU)",
        "Instituts d'Électronique et Informatique Industrielle",
        "Génie Électrique & Énergétique",
      ],
    },
    {
      minScore: 13.5,
      maxScore: 14.99,
      tierTitleAr: "عتبة المدارس الوطنية للمناجم والمعادن والتكنولوجيا",
      tierTitleFr: "Écoles des Mines, Métallurgie & Technologie",
      badgeAr: "امتياز واعد",
      badgeFr: "Mention Bien",
      adviceAr: "أنت تنافس بقوة على المدارس العليا للأساتذة في التعليم التقني والمدارس الوطنية للهندسة.",
      adviceFr: "Vous êtes bien positionné pour les grandes écoles d'ingénieurs.",
      facultiesAr: [
        "المدرسة الوطنية العليا للمناجم والمعادن (عنابة)",
        "المدرسة الوطنية للأشغال العمومية (ENSTP القبة)",
        "المدارس العليا لأساتذة التعليم التقني (ENSET)",
        "المدرسة الوطنية العليا للري والبيئة (ENSH)",
      ],
      facultiesFr: [
        "École Nationale des Mines et de la Métallurgie",
        "École Nationale Supérieure des Travaux Publics (ENSTP)",
        "Écoles Normales Supérieures Techniques (ENSET)",
        "Hydraulique & Environnement (ENSH)",
      ],
    },
    {
      minScore: 15.0,
      maxScore: 16.49,
      tierTitleAr: "عتبة البوليتكنيك والإعلام الآلي",
      tierTitleFr: "Polytechnique & Informatique",
      badgeAr: "امتياز عالي",
      badgeFr: "Très Bien",
      adviceAr: "خريج تقني رياضي بمعدل 15+ يعتبر من أمهر مهندسي المستقبل بالمدارس الوطنية الكبرى.",
      adviceFr: "Votre profil pratique et analytique est très recherché à l'ENP et à l'ESI.",
      facultiesAr: [
        "المدرسة الوطنية المتعددة التقنيات (ENP Alger / Oran)",
        "المدرسة الوطنية العليا للإعلام الآلي (ESI Alger / Sidi Bel Abbès)",
        "المدرسة العليا للتكنولوجيا (EST Alger)",
        "المدرسة الوطنية للأمن السيبراني",
      ],
      facultiesFr: [
        "École Nationale Polytechnique (ENP Alger/Oran)",
        "École Supérieure d'Informatique (ESI)",
        "École Supérieure de Technologie (EST)",
        "École Nationale de Cybersécurité",
      ],
    },
    {
      minScore: 16.5,
      maxScore: 20.0,
      tierTitleAr: "قمة النخبة الهندسية والذكاء الاصطناعي",
      tierTitleFr: "Sommet de l'Ingénierie & IA",
      badgeAr: "نخبة الجزائر 🇩🇿",
      badgeFr: "Élite Nationale 🇩🇿",
      adviceAr: "أعلى تخصصات التكنولوجيا العالمية في متناول يدك مع ضمان المنح والتفوق الوطني.",
      adviceFr: "Accès garanti à l'ENSIA, à l'ENP et aux bourses d'excellence.",
      facultiesAr: [
        "المدرسة الوطنية العليا للذكاء الاصطناعي (ENSIA)",
        "المدرسة الوطنية المتعددة التقنيات (Polytechnique ENP)",
        "المدرسة الوطنية العليا للإعلام الآلي (ESI Alger)",
        "المدرسة الوطنية للطاقات المتجددة وهندسة الفضاء",
      ],
      facultiesFr: [
        "École Nationale d'IA (ENSIA)",
        "École Nationale Polytechnique (ENP)",
        "École Supérieure d'Informatique (ESI)",
        "Énergies Renouvelables & Ingénierie Spatiale",
      ],
    },
  ],

  gestion_eco: [
    {
      minScore: 10.0,
      maxScore: 11.99,
      tierTitleAr: "عتبة العلوم الاقتصادية والتسيير التجاري (LMD)",
      tierTitleFr: "Sciences Économiques & Gestion (LMD)",
      badgeAr: "مقبول",
      badgeFr: "Admis",
      adviceAr: "المحاسبة والاقتصاد هما عصب هذه الشعبة. حل التمارين المزدوجة بانتظام يضمن لك القفز مباشرة لعتبة 13+.",
      adviceFr: "Comptabilité et Économie sont vos atouts majeurs : consolidez-les.",
      facultiesAr: [
        "علوم اقتصادية وعلوم التسيير والعلوم التجارية LMD",
        "ليسانس محاسبة وجباية",
        "كليات الحقوق والعلوم القانونية",
        "العلوم السياسية والعلاقات الدولية",
        "علوم الإعلام والاتصال",
      ],
      facultiesFr: [
        "Sciences Économiques, Gestion & Commerce LMD",
        "Comptabilité & Fiscalité",
        "Droit & Sciences Juridiques",
        "Sciences Politiques & Relations Internationales",
        "Information & Communication",
      ],
    },
    {
      minScore: 12.0,
      maxScore: 13.49,
      tierTitleAr: "عتبة المالية والبنوك والتجارة الدولية",
      tierTitleFr: "Finance, Banque & Commerce International",
      badgeAr: "مستوى جيد",
      badgeFr: "Bon Niveau",
      adviceAr: "اهتم بالرياضيات واللغة الفرنسية إلى جانب المحاسبة لحصد نقاط التفوق في كشوف النقاط.",
      adviceFr: "Soignez les maths et les langues pour maximiser votre score d'orientation.",
      facultiesAr: [
        "تخصصات المالية والبنوك والتأمين",
        "إدارة الأعمال والتسويق الرقمي",
        "التجارة الدولية وسلاسل الإمداد (Logistique)",
        "المدرسة العليا للعلوم التطبيقية في التسيير",
      ],
      facultiesFr: [
        "Finance, Banque & Assurances",
        "Management & Marketing Digital",
        "Commerce International & Logistique",
        "Sciences de Gestion Appliquées",
      ],
    },
    {
      minScore: 13.5,
      maxScore: 14.99,
      tierTitleAr: "عتبة المدارس العليا للتجارة والتسيير",
      tierTitleFr: "Grandes Écoles de Commerce & Gestion",
      badgeAr: "امتياز واعد",
      badgeFr: "Mention Bien",
      adviceAr: "أنت أمام بوابات أرقى مدارس إدارة الأعمال في الجزائر: HEC وESC.",
      adviceFr: "Vous êtes aux portes des meilleures écoles de commerce : HEC et ESC.",
      facultiesAr: [
        "المدرسة العليا للتجارة (ESC القليعة)",
        "المدرسة العليا لعلوم التسيير (HEC الجزائر)",
        "المدرسة العليا للمصارف والبنوك (ESB)",
        "المدرسة العليا للإدارة والتسيير",
      ],
      facultiesFr: [
        "École Supérieure de Commerce (ESC Kolea)",
        "Hautes Études Commerciales (HEC Alger)",
        "École Supérieure de Banque (ESB)",
        "École de Management & Gestion",
      ],
    },
    {
      minScore: 15.0,
      maxScore: 16.49,
      tierTitleAr: "عتبة المدرسة الوطنية للإحصاء والاقتصاد التطبيقي",
      tierTitleFr: "Statistique & Économie Appliquée (ENSSEA)",
      badgeAr: "امتياز عالي",
      badgeFr: "Très Bien",
      adviceAr: "تحكم استثنائي يؤهلك للمناصب الاستراتيجية في المالية الحكومية والمؤسسات الكبرى.",
      adviceFr: "Profil d'excellence pour l'expertise financière et la statistique appliquée.",
      facultiesAr: [
        "المدرسة الوطنية العليا للإحصاء والاقتصاد التطبيقي (ENSSEA)",
        "المدرسة العليا للدراسات المالية والمحاسبية (EHEC)",
        "المدارس العليا للأساتذة (ENS تسيير واقتصاد للتعليم الثانوي)",
        "الترجمة الفورية التخصصية في الاقتصاد والمالية",
      ],
      facultiesFr: [
        "École Nationale de Statistique & Économie Appliquée (ENSSEA)",
        "Hautes Études Financières & Comptables (EHEC)",
        "ENS Enseignement Économique Secondaire",
        "Traduction Économique & Financière",
      ],
    },
    {
      minScore: 16.5,
      maxScore: 20.0,
      tierTitleAr: "قمة النخبة الاقتصادية الوطنية",
      tierTitleFr: "Élite Nationale en Gestion & Économie",
      badgeAr: "نخبة الجزائر 🇩🇿",
      badgeFr: "Élite Nationale 🇩🇿",
      adviceAr: "المراتب الأولى وطنيا تضمن لك مقاعد القيادة في البنوك المركزية والمؤسسات الاستراتيجية.",
      adviceFr: "Leadership économique et orientation prioritaire absolue.",
      facultiesAr: [
        "المدرسة العليا لعلوم التسيير (HEC — اختيار أول)",
        "المدرسة الوطنية العليا للإحصاء والاقتصاد التطبيقي (ENSSEA)",
        "المدارس العليا للأساتذة (ENS)",
        "منح التفوق الرئاسية والتمثيل الاقتصادي الدولي",
      ],
      facultiesFr: [
        "HEC Alger (Choix numéro 1 garanti)",
        "ENSSEA Statistique & Décision",
        "Écoles Normales Supérieures (ENS)",
        "Bourses d'excellence et finance internationale",
      ],
    },
  ],

  lettres_philo: [
    {
      minScore: 10.0,
      maxScore: 11.99,
      tierTitleAr: "عتبة العلوم الإنسانية والقانونية (LMD)",
      tierTitleFr: "Sciences Humaines & Juridiques (LMD)",
      badgeAr: "مقبول",
      badgeFr: "Admis",
      adviceAr: "معامل الفلسفة (6) واللغة العربية (6) هما مفتاح ارتقاء المعدل. تدرب على منهجية المقالة الفلسفية باحتراف.",
      adviceFr: "Philosophie et Arabe (Coeff 6) sont décisifs : soignez la méthodologie de dissertation.",
      facultiesAr: [
        "كليات الحقوق والعلوم القانونية والإدارية LMD",
        "ليسانس اللغة والأدب العربي",
        "العلوم الإنسانية (تاريخ، علم الآثار، فلسفة)",
        "العلوم الاجتماعية (علم النفس، علم الاجتماع)",
        "علوم التربية والتوجيه المدرسي",
      ],
      facultiesFr: [
        "Faculté de Droit & Sciences Juridiques",
        "Langue & Littérature Arabes",
        "Sciences Humaines (Histoire, Philosophie)",
        "Sciences Sociales (Psychologie, Sociologie)",
        "Sciences de l'Éducation",
      ],
    },
    {
      minScore: 12.0,
      maxScore: 13.49,
      tierTitleAr: "عتبة علوم الإعلام والاتصال والعلوم السياسية",
      tierTitleFr: "Information, Communication & Sciences Politiques",
      badgeAr: "مستوى جيد",
      badgeFr: "Bon Niveau",
      adviceAr: "تثبيت التواريخ والمصطلحات الدقيقة في التاريخ والجغرافيا يضمن حصد نقاط ثمينة.",
      adviceFr: "Assurez les points en Histoire-Géographie pour consolider votre mention.",
      facultiesAr: [
        "علوم الإعلام والاتصال والصحافة LMD",
        "العلوم السياسية والعلاقات الدولية",
        "الفنون والمسرح والسينما والتراث",
        "التوثيق وإدارة المكتبات والأرشيف",
      ],
      facultiesFr: [
        "Information, Communication & Journalisme",
        "Sciences Politiques & Relations Internationales",
        "Arts, Théâtre & Patrimoine",
        "Documentation & Gestion d'Archives",
      ],
    },
    {
      minScore: 13.5,
      maxScore: 14.99,
      tierTitleAr: "عتبة معاهد الترجمة والعلوم الإدارية المعمقة",
      tierTitleFr: "Traduction & Sciences Administratives",
      badgeAr: "امتياز واعد",
      badgeFr: "Mention Bien",
      adviceAr: "أنت قريب جداً من المدرسة العليا للأساتذة! تحسين لغة المقالة الفلسفية يضمن لك القبول.",
      adviceFr: "L'ENS Lettres est à votre portée avec une expression philosophique soignée.",
      facultiesAr: [
        "معاهد الترجمة الفورية والتحريرية (عربية - فرنسية - إنجليزية)",
        "كليات الحقوق والعلوم الجنائية المعمقة",
        "العلوم السياسية والدراسات الإقليمية",
      ],
      facultiesFr: [
        "Instituts de Traduction & Interprétariat",
        "Droit Pénal & Sciences Criminelles",
        "Études Politiques & Stratégiques",
      ],
    },
    {
      minScore: 15.0,
      maxScore: 16.49,
      tierTitleAr: "عتبة المدارس العليا للأساتذة (ENS)",
      tierTitleFr: "Écoles Normales Supérieures (ENS)",
      badgeAr: "امتياز عالي",
      badgeFr: "Très Bien",
      adviceAr: "المدرسة العليا للأساتذة تضمن التوظيف المباشر والمكانة الأكاديمية الرفيعة بعد التخرج.",
      adviceFr: "L'ENS garantit un statut prestigieux et une carrière immédiate.",
      facultiesAr: [
        "المدارس العليا للأساتذة (ENS لغة عربية للتعليم الثانوي والمتوسط)",
        "المدارس العليا للأساتذة (ENS فلسفة للتعليم الثانوي)",
        "المدارس العليا للأساتذة (ENS تاريخ وجغرافيا)",
        "المدرسة الوطنية العليا للصحافة وعلوم الإعلام",
      ],
      facultiesFr: [
        "ENS Langue Arabe (Secondaire & Moyen)",
        "ENS Philosophie (Secondaire)",
        "ENS Histoire-Géographie",
        "École Supérieure de Journalisme",
      ],
    },
    {
      minScore: 16.5,
      maxScore: 20.0,
      tierTitleAr: "قمة النخبة الأدبية الوطنية",
      tierTitleFr: "Élite Nationale en Lettres & Philosophie",
      badgeAr: "نخبة الجزائر 🇩🇿",
      badgeFr: "Élite Nationale 🇩🇿",
      adviceAr: "معدل استثنائي في شعبة الآداب يضعك على رأس قوائم التوجيه الوطني والدبلوماسية الأكاديمية.",
      adviceFr: "Excellence littéraire ouvrant la voie à la diplomatie et aux hautes fonctions.",
      facultiesAr: [
        "المدارس العليا للأساتذة (ENS برتبة أستاذ ثانوي باختيار أول)",
        "المدرسة الوطنية العليا للصحافة والإعلام الدولي",
        "الترجمة الدبلوماسية والعلاقات الدولية الاستراتيجية",
        "منح التفوق الوطنية",
      ],
      facultiesFr: [
        "ENS (Enseignement Secondaire — Rang 1)",
        "École Supérieure de Journalisme & Médias Internationaux",
        "Traduction Diplomatique & Relations Extérieures",
        "Bourses Nationales d'Excellence",
      ],
    },
  ],

  langues_etrangeres: [
    {
      minScore: 10.0,
      maxScore: 11.99,
      tierTitleAr: "عتبة اللغات الحية والترجمة (LMD)",
      tierTitleFr: "Langues Vivantes & Traduction (LMD)",
      badgeAr: "مقبول",
      badgeFr: "Admis",
      adviceAr: "اللغات الثلاث (الفرنسية، الإنجليزية، واللغة الثالثة) تملك الحصة الأكبر من المعاملات. تدرب يومياً على التعبير الكتابي.",
      adviceFr: "Français, Anglais et 3ème langue forment le socle : pratiquez l'expression écrite.",
      facultiesAr: [
        "ليسانس لغة إنجليزية LMD",
        "ليسانس لغة فرنسية LMD",
        "ليسانس لغة إسبانية / ألمانية / إيطالية / روسية",
        "كليات الحقوق والعلوم القانونية",
        "علوم الإعلام والاتصال",
      ],
      facultiesFr: [
        "Licence d'Anglais LMD",
        "Licence de Français LMD",
        "Espagnol / Allemand / Italien / Russe",
        "Faculté de Droit",
        "Information & Communication",
      ],
    },
    {
      minScore: 12.0,
      maxScore: 13.49,
      tierTitleAr: "عتبة اللغات التطبيقية والسياحة الدولية",
      tierTitleFr: "Langues Appliquées & Tourisme",
      badgeAr: "مستوى جيد",
      badgeFr: "Bon Niveau",
      adviceAr: "ارفع درجتك في اللغة العربية والفلسفة ليتحسن معدلك العام بقفزة نوعية نحو عتبة المدارس العليا.",
      adviceFr: "Consolidez l'Arabe et la Philosophie pour bondir vers le seuil supérieur.",
      facultiesAr: [
        "اللغات الأجنبية المطبقة (LEA)",
        "الإعلام والاتصال الدولي متعدد اللغات",
        "السياحة الفندقية والتسويق الدولي",
        "الترجمة التجارية والتقنية",
      ],
      facultiesFr: [
        "Langues Étrangères Appliquées (LEA)",
        "Communication Internationale Multilingue",
        "Tourisme & Hôtellerie Internationale",
        "Traduction Commerciale & Technique",
      ],
    },
    {
      minScore: 13.5,
      maxScore: 14.99,
      tierTitleAr: "عتبة معاهد الترجمة الفورية واللسانيات",
      tierTitleFr: "Instituts de Traduction & Linguistique",
      badgeAr: "امتياز واعد",
      badgeFr: "Mention Bien",
      adviceAr: "أنت تنافس على مقاعد الترجمة الفورية بالجامعات الكبرى والمدارس العليا للأساتذة.",
      adviceFr: "L'interprétariat de haut niveau et l'ENS sont à votre portée.",
      facultiesAr: [
        "معاهد الترجمة الفورية (Interprétariat الجزائر / وهران / قسنطينة)",
        "اللسانيات التطبيقية واللغات الحية المتقدمة",
        "العلوم السياسية والعلاقات الدولية متعددة اللغات",
      ],
      facultiesFr: [
        "Instituts de Traduction & Interprétariat",
        "Linguistique Appliquée Avancée",
        "Relations Internationales Multilingues",
      ],
    },
    {
      minScore: 15.0,
      maxScore: 16.49,
      tierTitleAr: "عتبة المدارس العليا للأساتذة (ENS لغات)",
      tierTitleFr: "Écoles Normales Supérieures (ENS Langues)",
      badgeAr: "امتياز عالي",
      badgeFr: "Très Bien",
      adviceAr: "المدرسة العليا للأساتذة تضمن لك استقراراً مهنياً ومكانة تربوية رفيعة فور التخرج.",
      adviceFr: "L'ENS Langues vous offre sécurité professionnelle et excellence pédagogique.",
      facultiesAr: [
        "المدرسة العليا للأساتذة (ENS لغة إنجليزية للتعليم الثانوي)",
        "المدرسة العليا للأساتذة (ENS لغة فرنسية للتعليم الثانوي)",
        "المدارس العليا للأساتذة (ENS لغة ألمانية / إسبانية)",
        "الترجمة التخصصية في المنظمات الدولية",
      ],
      facultiesFr: [
        "ENS Anglais (Secondaire)",
        "ENS Français (Secondaire)",
        "ENS Espagnol / Allemand",
        "Traduction en Organisations Internationales",
      ],
    },
    {
      minScore: 16.5,
      maxScore: 20.0,
      tierTitleAr: "قمة النخبة اللغوية والدبلوماسية",
      tierTitleFr: "Élite Nationale Linguistique & Diplomatique",
      badgeAr: "نخبة الجزائر 🇩🇿",
      badgeFr: "Élite Nationale 🇩🇿",
      adviceAr: "أنت ضمن نخبة اللغات في الجزائر: مقاعد الترجمة الدبلوماسية والمؤتمرات الدولية تنتظرك.",
      adviceFr: "Le sommet des études linguistiques : diplomatie, conférences et recherche internationale.",
      facultiesAr: [
        "المدرسة العليا للأساتذة (ENS لغات باختيار أول بأريحية تامة)",
        "الترجمة الدبلوماسية والتعاون الدولي في الهيئات الرسمية",
        "المدرسة العليا للصحافة والإعلام الدولي",
        "منح التفوق للدراسات اللغوية المتقدمة",
      ],
      facultiesFr: [
        "ENS Langues (Rang 1 Absolu)",
        "Traduction Diplomatique & Coopération Internationale",
        "Journalisme & Médias Internationaux",
        "Bourses d'excellence linguistique",
      ],
    },
  ],
};

function getTierForStreamAndScore(stream: StreamKey, score: number): UniversityTierResult {
  const tiers = STREAM_UNIVERSITY_DATA[stream] || STREAM_UNIVERSITY_DATA.sciences_exp;
  const clampedScore = Math.max(10.0, Math.min(20.0, score));
  const found = tiers.find(
    (t) => clampedScore >= t.minScore && clampedScore <= t.maxScore
  );
  return found || tiers[tiers.length - 1];
}

// ============================================================================
// 2. INTERACTIVE UNIVERSITY SPECIALTY CALCULATOR COMPONENT
// ============================================================================

export function UniversitySpecialtyCalculator({ isAr }: { isAr: boolean }) {
  const [selectedStream, setSelectedStream] = useState<StreamKey>("sciences_exp");
  const [score, setScore] = useState<number>(14.5);
  const [hasCalculated, setHasCalculated] = useState<boolean>(true);

  const activeStreamMeta = useMemo(() => {
    return STREAMS_LIST.find((s) => s.id === selectedStream) || STREAMS_LIST[0];
  }, [selectedStream]);

  const activeResult = useMemo(() => {
    return getTierForStreamAndScore(selectedStream, score);
  }, [selectedStream, score]);

  const handleScoreChange = (val: number) => {
    setScore(Math.round(val * 100) / 100);
    setHasCalculated(true);
  };

  return (
    <div className="rounded-[32px] border border-theme bg-card/95 backdrop-blur-md p-6 sm:p-10 shadow-clay">
      <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 bg-[var(--color-primary-soft)] text-[var(--color-primary)] text-xs font-bold">
          <GraduationCap className="w-4 h-4" />
          <span>{isAr ? "بعد الباك... واش تقدر تقرا؟" : "Après le BAC... Quelles filières s'ouvrent à vous ?"}</span>
        </div>
        <h3 className="text-2xl sm:text-3xl font-black text-theme-text font-sans">
          {isAr ? "حاسبة التخصصات الجامعية حسب الشعبة والمعدل" : "Simulateur d'Orientation Universitaire"}
        </h3>
        <p className="text-xs sm:text-sm text-theme-secondary leading-relaxed">
          {isAr
            ? "اكتشف الكليات والمدارس العليا المتوافقة مع شعبتك ومعدلك المتوقع وفق المنشور الوزاري للتوجيه."
            : "Explorez les facultés et grandes écoles adaptées à votre filière et à votre moyenne prévisionnelle."}
        </p>
      </div>

      {/* Step-by-Step Inputs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Controls Column */}
        <div className="lg:col-span-5 space-y-6 bg-surface p-5 sm:p-7 rounded-2xl border border-theme">
          
          {/* Step 1: Choose Stream */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold uppercase tracking-wider text-theme-secondary flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-[var(--color-primary)] text-white inline-flex items-center justify-center text-[10px] font-mono">
                  1
                </span>
                <span>{isAr ? "اختار شعبتك" : "Choisissez votre filière"}</span>
              </label>
              <Badge variant="outline" size="sm" className="text-[10px] text-[var(--color-primary)] font-mono">
                {activeStreamMeta.badge}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {STREAMS_LIST.map((str) => {
                const isSelected = selectedStream === str.id;
                return (
                  <button
                    key={str.id}
                    onClick={() => setSelectedStream(str.id)}
                    className={`text-start p-2.5 rounded-xl border text-xs font-bold transition-all flex flex-col justify-between min-h-[58px] ${
                      isSelected
                        ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-sm scale-[1.02]"
                        : "bg-card text-theme-text border-theme hover:border-[var(--color-primary)]/40 hover:bg-surface"
                    }`}
                  >
                    <span className="leading-snug">{isAr ? str.labelAr : str.labelFr}</span>
                    <span className={`text-[10px] font-normal ${isSelected ? "text-white/80" : "text-theme-muted"}`}>
                      {str.badge}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Input Grade */}
          <div className="pt-2 border-t border-theme/60">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-theme-secondary flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-[var(--color-primary)] text-white inline-flex items-center justify-center text-[10px] font-mono">
                  2
                </span>
                <span>{isAr ? "دخل معدلك المتوقع" : "Votre moyenne prévisionnelle"}</span>
              </label>
              <div className="text-xl sm:text-2xl font-black text-[var(--color-primary)] font-mono px-3 py-1 rounded-xl bg-card border border-theme">
                {score.toFixed(2)}
                <span className="text-xs text-theme-muted font-normal ms-1">/ 20</span>
              </div>
            </div>

            {/* Range Slider from 10.00 to 20.00 */}
            <div className="space-y-2 pt-2">
              <input
                type="range"
                min="10.00"
                max="20.00"
                step="0.10"
                value={score}
                onChange={(e) => handleScoreChange(parseFloat(e.target.value))}
                className="w-full accent-[var(--color-primary)] cursor-pointer h-2 bg-theme-border rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-theme-muted font-mono">
                <span>10.00 (مقبول)</span>
                <span>13.00</span>
                <span>15.00</span>
                <span>17.00</span>
                <span>20.00 (امتياز)</span>
              </div>
            </div>

            {/* Quick Benchmark Presets */}
            <div className="flex flex-wrap gap-1.5 pt-3">
              <span className="text-[11px] text-theme-muted font-medium w-full mb-0.5">
                {isAr ? "معدلات شائعة للتجربة:" : "Moyennes repères :"}
              </span>
              {[10.5, 12.5, 14.2, 16.0, 17.5].map((preset) => (
                <button
                  key={preset}
                  onClick={() => handleScoreChange(preset)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border transition-all ${
                    Math.abs(score - preset) < 0.05
                      ? "bg-[var(--color-primary-soft)] text-[var(--color-primary)] border-[var(--color-primary)]"
                      : "bg-card border-theme text-theme-secondary hover:text-theme-text"
                  }`}
                >
                  {preset.toFixed(2)}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => setHasCalculated(true)}
              className="w-full py-3 px-4 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isAr ? "تحديث التخصصات المقترحة" : "Actualiser les filières"}</span>
            </button>
          </div>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 sm:p-7 rounded-2xl border border-theme bg-surface relative overflow-hidden space-y-5">
            {/* Header Badge & Title */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-theme pb-4">
              <div>
                <span className="text-[11px] font-bold text-theme-muted uppercase tracking-wider block mb-1">
                  {isAr ? "نتيجة التوجيه الإرشادي" : "Orientation Prévisionnelle"}
                </span>
                <h4 className="text-lg sm:text-xl font-black text-theme-text">
                  {isAr ? activeResult.tierTitleAr : activeResult.tierTitleFr}
                </h4>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-[var(--color-primary-soft)] text-[var(--color-primary)] text-xs font-black font-sans border border-[var(--color-primary)]/20">
                  {isAr ? activeResult.badgeAr : activeResult.badgeFr}
                </span>
              </div>
            </div>

            {/* Dynamic Summary Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-card border border-theme">
                <span className="text-[10px] font-bold text-theme-muted block">{isAr ? "الشعبة" : "Filière"}</span>
                <span className="text-xs sm:text-sm font-black text-theme-text">
                  {isAr ? activeStreamMeta.labelAr : activeStreamMeta.labelFr}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-card border border-theme">
                <span className="text-[10px] font-bold text-theme-muted block">{isAr ? "المعدل المحسوب" : "Moyenne"}</span>
                <span className="text-xs sm:text-sm font-black text-[var(--color-primary)] font-mono">
                  {score.toFixed(2)} / 20
                </span>
              </div>
            </div>

            {/* Suggested Faculties List */}
            <div className="space-y-2.5">
              <span className="text-xs font-bold text-theme-text block flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-[var(--color-primary)]" />
                <span>{isAr ? "الكليات والمدارس المتاحة في هذا النطاق:" : "Filières et écoles accessibles :"}</span>
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(isAr ? activeResult.facultiesAr : activeResult.facultiesFr).map((fac, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-card border border-theme/80 flex items-start gap-2 text-xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-[var(--color-primary)] shrink-0 mt-0.5" />
                    <span className="font-medium text-theme-text leading-tight">{fac}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pedagogical Roadmap Advice */}
            <div className="p-3.5 rounded-xl bg-[var(--color-primary-soft)]/60 border border-[var(--color-primary)]/20 text-xs text-theme-secondary flex items-start gap-2.5">
              <Lightbulb className="w-4 h-4 text-[var(--color-primary)] shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <strong className="text-theme-text block font-bold mb-0.5">
                  {isAr ? "نصيحة الشاطر للوصول لهذا المعدل:" : "Conseil pédagogique SHATER :"}
                </strong>
                <span>{isAr ? activeResult.adviceAr : activeResult.adviceFr}</span>
              </div>
            </div>

            {/* Official Ministerial Disclaimer */}
            <div className="pt-2 flex items-start gap-2 text-[10px] text-theme-muted border-t border-theme/60">
              <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-theme-muted" />
              <p className="leading-relaxed">
                {isAr
                  ? "ملاحظة هامة: هذه التخصصات إرشادية مبنية على معدلات القبول السنوية الرسمية، وتخضع للشروط السنوية للمنشور الوزاري للتوجيه ورغبات المترشحين وعتبات التنافس."
                  : "Note : Résultats indicatifs basés sur les historiques d'orientation ministériels officiels, soumis aux conditions annuelles et aux seuils de concours."}
              </p>
            </div>

            {/* Contextual CTA */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 bg-card p-4 rounded-xl border border-theme">
              <div className="text-start">
                <span className="text-xs font-bold text-theme-text block">
                  {isAr ? "حاب تعرف واش راه ناقصك باش تلحق لهذا المعدل؟" : "Prêt à combler vos lacunes pour cette moyenne ?"}
                </span>
                <span className="text-[11px] text-theme-secondary">
                  {isAr ? "ابدأ التشخيص المجاني في 15 دقيقة فقط." : "Diagnostic initial sans engagement en 15 minutes."}
                </span>
              </div>
              <Link href="/diagnostic" className="w-full sm:w-auto shrink-0">
                <Button variant="primary" size="sm" className="w-full sm:w-auto rounded-xl font-bold text-xs gap-1.5">
                  <span>{isAr ? "ابدأ التشخيص الآن" : "Faire mon diagnostic"}</span>
                  {isAr ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 3. COUNTDOWN TIMER COMPONENT (Subtle, Motivating, Calm)
// ============================================================================

export function BacCountdownSection({ isAr }: { isAr: boolean }) {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 260,
    hours: 12,
    minutes: 40,
    seconds: 0,
  });

  useEffect(() => {
    // Projected BAC date: June 7th, 2027
    const targetDate = new Date("2027-06-07T08:00:00+01:00").getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const distance = Math.max(0, targetDate - now);

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-8 bg-surface/80 border-y border-theme">
      <Container size="lg">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-start space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--color-primary)]">
              <Clock className="w-3.5 h-3.5 animate-pulse" />
              <span>{isAr ? "الوقت يجري بهدوء" : "Le compte à rebours est lancé"}</span>
            </div>
            <h4 className="text-lg sm:text-xl font-black text-theme-text">
              {isAr ? "باقي على امتحان BAC 2027" : "Jours restants avant le BAC 2027"}
            </h4>
            <p className="text-xs text-theme-secondary">
              {isAr ? "كل يوم تحل فيه تمرين بتركيز، يصنع الفارق في النتيجة النهائية." : "Chaque session quotidienne méthodique construit votre réussite."}
            </p>
          </div>

          {/* Minimalist Clock Boxes */}
          <div className="flex items-center gap-2.5 sm:gap-4">
            <div className="flex flex-col items-center bg-card border border-theme px-3.5 py-2.5 rounded-2xl min-w-[64px] shadow-sm">
              <span className="text-2xl sm:text-3xl font-black text-[var(--color-primary)] font-mono">
                {timeLeft.days}
              </span>
              <span className="text-[10px] text-theme-muted font-medium">{isAr ? "يوم" : "Jours"}</span>
            </div>
            <span className="text-theme-muted font-mono font-bold text-xl">:</span>
            <div className="flex flex-col items-center bg-card border border-theme px-3.5 py-2.5 rounded-2xl min-w-[64px] shadow-sm">
              <span className="text-2xl sm:text-3xl font-black text-theme-text font-mono">
                {String(timeLeft.hours).padStart(2, "0")}
              </span>
              <span className="text-[10px] text-theme-muted font-medium">{isAr ? "ساعة" : "Heures"}</span>
            </div>
            <span className="text-theme-muted font-mono font-bold text-xl">:</span>
            <div className="flex flex-col items-center bg-card border border-theme px-3.5 py-2.5 rounded-2xl min-w-[64px] shadow-sm">
              <span className="text-2xl sm:text-3xl font-black text-theme-text font-mono">
                {String(timeLeft.minutes).padStart(2, "0")}
              </span>
              <span className="text-[10px] text-theme-muted font-medium">{isAr ? "دقيقة" : "Min"}</span>
            </div>
            <span className="text-theme-muted font-mono font-bold text-xl">:</span>
            <div className="flex flex-col items-center bg-card border border-theme px-3.5 py-2.5 rounded-2xl min-w-[64px] shadow-sm">
              <span className="text-2xl sm:text-3xl font-black text-[var(--color-accent)] font-mono">
                {String(timeLeft.seconds).padStart(2, "0")}
              </span>
              <span className="text-[10px] text-theme-muted font-medium">{isAr ? "ثانية" : "Sec"}</span>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

// ============================================================================
// 4. REAL PRODUCT SCREENSHOTS & STORIES CAROUSEL/TABS
// ============================================================================

export function RealProductStoriesSection({ isAr }: { isAr: boolean }) {
  const [activeTab, setActiveTab] = useState<number>(0);

  const stories = [
    {
      id: "library",
      tabTitleAr: "01 — المكتبة الحرة",
      tabTitleFr: "01 — Bibliothèque Libre",
      headlineAr: "حاب تقرا وحدك؟",
      headlineFr: "Envie de réviser en toute liberté ?",
      subAr: "افتح المادة، اختار واش تحتاج، وابدا على راحتك وبلا أي ضغط.",
      subFr: "Accédez à tous les cours, résumés, exercices et sujets sans contrainte.",
      badgeAr: "الدراسة الحرة",
      badgeFr: "Mode Libre",
      icon: BookOpen,
      preview: {
        title: "المكتبة التعليمية الشاملة — الرياضيات & الفيزياء & العلوم",
        items: [
          { label: "دروس وشروحات مفصلة بالبرنامج الرسمي 2026/2027", count: "120+ درس" },
          { label: "ملخصات مركزة وقوانين المادة مع الخرائط الذهنية", count: "85 ملخص" },
          { label: "بنك التمارين المتدرجة من البسيط إلى المركب", count: "1400+ تمرين" },
          { label: "مواضيع البكالوريا الرسمية والامتحانات التجريبية بالحل النموذجي", count: "15 سنة سابقة" },
        ],
        ctaText: isAr ? "تصفح المكتبة الآن" : "Explorer la bibliothèque",
        ctaHref: "/curriculum",
      },
    },
    {
      id: "diagnostic",
      tabTitleAr: "02 — التشخيص الذكي",
      tabTitleFr: "02 — Diagnostic Précis",
      headlineAr: "ما تعرفش واش ناقصك؟",
      headlineFr: "Vous ne savez pas par où commencer ?",
      subAr: "جاوب على أسئلة التشخيص، ونشوفو وين راه مستواك الحقيقي ونحددو ثغراتك.",
      subFr: "Un bilan rapide et sans concession pour cibler vos verrous méthodologiques.",
      badgeAr: "التشخيص العلمي",
      badgeFr: "Diagnostic",
      icon: Crosshair,
      preview: {
        title: "تقرير تشخيص المكتسبات والمهارات الأساسية",
        items: [
          { label: "قياس المعرفة الأساسية وسرعة الاسترجاع", count: "دقة 94%" },
          { label: "فحص فهم القوانين والتمثيل البياني", count: "تحليل فوري" },
          { label: "اختبار التطبيق والتعامل مع المعطيات الجديدة", count: "كشف الثغرات" },
          { label: "تقييم المنهجية وصياغة الإجابة وسلم التنقيط", count: "توجيه وزاري" },
        ],
        ctaText: isAr ? "ابدأ التشخيص مجاناً" : "Commencer le diagnostic",
        ctaHref: "/diagnostic",
      },
    },
    {
      id: "mission",
      tabTitleAr: "03 — المهمة اليومية",
      tabTitleFr: "03 — Micro-Missions",
      headlineAr: "عرفت واش تحتاج؟",
      headlineFr: "Vos priorités sont identifiées ?",
      subAr: "الآن خدم على الحاجة اللي راح تحركك لقدام خطوة بخطوة، بين 20 إلى 40 دقيقة يومياً.",
      subFr: "Passez à l'action avec une feuille de route adaptée à votre rythme.",
      badgeAr: "العمل الموجه",
      badgeFr: "Action Ciblée",
      icon: Target,
      preview: {
        title: "المهمة القادمة: اشتقاق الدوال المركبة ودراسة التغيرات",
        items: [
          { label: "فيديو توجيهي مركز ومختصر يشرح المفتاح الأساسي", count: "7 دقائق" },
          { label: "تمرين تطبيقي مستهدف مع تقييم الثقة في الحل", count: "3 أسئلة" },
          { label: "تصحيح فوري وشرح خطوة بخطوة بالمنهجية الرسمية", count: "فوري" },
          { label: "تسجيل تقدمك في لوحة القيادة وحساب نسبة الجاهزية", count: "+4% تقدم" },
        ],
        ctaText: isAr ? "دخول لوحة التلميذ" : "Aller à la mission",
        ctaHref: "/dashboard",
      },
    },
    {
      id: "error-lab",
      tabTitleAr: "04 — معمل الأخطاء",
      tabTitleFr: "04 — Error Lab & Retest",
      headlineAr: "غلطت؟ مليح. الغلط يعطينا معلومة.",
      headlineFr: "Une erreur ? C'est le début de la compréhension.",
      subAr: "ما نقولولكش غير غلطت. نفهمو علاش، نصلحو السبب، ونعطوك تمرين توأم للتأكد.",
      subFr: "Comprenez la racine de l'erreur, appliquez la remédiation et validez par le retest.",
      badgeAr: "الترميم وإعادة الاختبار",
      badgeFr: "Remédiation",
      icon: RotateCcw,
      preview: {
        title: "مخبر ترميم الأخطاء: مهارة قراءة المطلوب وتحديد المعطيات",
        items: [
          { label: "تشخيص السبب الجذري (تسرع / سوء فهم السؤال / خطأ حسابي)", count: "تحليل دقيق" },
          { label: "خطوات المعالجة والتنبيه على الفخاخ الوزارية المعتادة", count: "دليل عملي" },
          { label: "سؤال توأم جديد (نفس المهارة • معطيات مختلفة)", count: "Retest توأم" },
          { label: "إثبات التمكن وتحويل الضعف إلى نقطة قوة دائمة", count: "إتقان مؤكد" },
        ],
        ctaText: isAr ? "استكشف معمل الأخطاء" : "Voir le lab d'erreurs",
        ctaHref: "/error-lab",
      },
    },
  ];

  const current = stories[activeTab];

  return (
    <section className="py-14 sm:py-20 bg-surface border-b border-theme" id="product-stories">
      <Container size="lg" className="space-y-10">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 bg-[var(--color-primary-soft)] text-[var(--color-primary)] text-xs font-bold">
            <Laptop className="w-3.5 h-3.5" />
            <span>{isAr ? "من داخل تجربة الطالب" : "Visite guidée de l'expérience"}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-theme-text font-sans">
            {isAr ? "كيفاش تعيش تجربة القراية في الشاطر؟" : "Comment fonctionne SHATER au quotidien ?"}
          </h2>
          <p className="text-xs sm:text-sm text-theme-secondary leading-relaxed">
            {isAr
              ? "سواء اخترت الدراسة الحرة أو التوجيه الذكي، واجهات واضحة صُممت لتخدم تركيزك وتبعد عنك التشتت."
              : "Quatre étapes clés conçues pour transformer l'incertitude en maîtrise sereine."}
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 rounded-2xl bg-card border border-theme max-w-3xl mx-auto">
          {stories.map((s, idx) => {
            const isActive = activeTab === idx;
            const Icon = s.icon;
            return (
              <button
                key={s.id}
                onClick={() => setActiveTab(idx)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? "bg-[var(--color-primary)] text-white shadow-sm"
                    : "text-theme-secondary hover:text-theme-text hover:bg-surface"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{isAr ? s.tabTitleAr : s.tabTitleFr}</span>
              </button>
            );
          })}
        </div>

        {/* Active Tab Showcase Box */}
        <div className="p-6 sm:p-10 rounded-[32px] border border-theme bg-card shadow-clay grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Narrative Left */}
          <div className="lg:col-span-6 space-y-5 text-start">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-primary-soft)] text-[var(--color-primary)] text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-pulse" />
              <span>{isAr ? current.badgeAr : current.badgeFr}</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-theme-text leading-snug">
              {isAr ? current.headlineAr : current.headlineFr}
            </h3>

            <p className="text-sm sm:text-base text-theme-secondary leading-relaxed">
              {isAr ? current.subAr : current.subFr}
            </p>

            {/* List */}
            <div className="space-y-2.5 pt-2">
              {current.preview.items.map((it, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-surface border border-theme text-xs">
                  <div className="flex items-center gap-2 font-medium text-theme-text">
                    <Check className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                    <span>{it.label}</span>
                  </div>
                  <span className="font-bold text-[var(--color-primary)] font-mono text-[11px] shrink-0 ms-2">
                    {it.count}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-3">
              <Link href={current.preview.ctaHref}>
                <Button variant="primary" size="md" className="rounded-xl font-bold text-xs gap-2">
                  <span>{current.preview.ctaText}</span>
                  {isAr ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                </Button>
              </Link>
            </div>
          </div>

          {/* Interactive UI Mockup Right */}
          <div className="lg:col-span-6">
            <div className="rounded-2xl border border-theme bg-surface shadow-md p-5 sm:p-6 space-y-4">
              {/* Fake Window Header */}
              <div className="flex items-center justify-between border-b border-theme pb-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <span className="text-[10px] text-theme-muted font-mono ms-2">SHATER BAC // {current.id}.dz</span>
                </div>
                <Badge variant="outline" size="sm" className="text-[10px] text-[var(--color-primary)] font-bold">
                  {isAr ? "واجهة تفاعلية" : "Live App"}
                </Badge>
              </div>

              {/* Window Content */}
              <div className="space-y-3 pt-2">
                <div className="p-3.5 rounded-xl bg-card border border-theme/80 text-start space-y-2">
                  <span className="text-[10px] uppercase font-bold text-theme-muted block font-mono">
                    {isAr ? "الحالة الحالية للطالب" : "Progression"}
                  </span>
                  <div className="text-xs sm:text-sm font-bold text-theme-text">
                    {current.preview.title}
                  </div>
                  <div className="w-full bg-surface h-2 rounded-full overflow-hidden border border-theme/60">
                    <div className="bg-[var(--color-primary)] h-full w-3/4 rounded-full" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-3 rounded-xl bg-card border border-theme text-start">
                    <span className="text-[10px] text-theme-muted block">{isAr ? "الهدف" : "Objectif"}</span>
                    <span className="font-black text-theme-text text-sm font-mono">16.00 / 20</span>
                  </div>
                  <div className="p-3 rounded-xl bg-card border border-theme text-start">
                    <span className="text-[10px] text-theme-muted block">{isAr ? "الجاهزية" : "État"}</span>
                    <span className="font-black text-emerald-600 text-sm">{isAr ? "في تحسن مستمر" : "En progrès"}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[var(--color-primary-soft)] border border-[var(--color-primary)]/20 text-start text-xs flex items-center justify-between">
                  <span className="font-medium text-theme-text">
                    {isAr ? "المحتوى متاح ومسارك متزامن" : "Données synchronisées"}
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                </div>
              </div>
            </div>
          </div>

        </div>

      </Container>
    </section>
  );
}

// ============================================================================
// 5. MASTER LANDING VIEW COMPONENT
// ============================================================================

export function LandingView() {
  const { t, locale, direction } = useTranslation();
  const isAr = locale === "ar";
  const Arrow = direction === "rtl" ? ArrowLeft : ArrowRight;
  const { user } = useAuth();
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);

  // FAQ state
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    trackEvent("landing_view", { isLoggedIn: Boolean(user) });
    if (user?.id) {
      StudentService.getProfile(user.id).then((sp) => {
        if (sp) setStudentProfile(sp);
      });
    }
  }, [user]);

  const studentName = studentProfile?.firstName || null;

  return (
    <AppShell showSidebar={false} showFooter={false} noPadding={true}>
      
      {/* Smart Top Greeting Banner for Logged-In Students */}
      {user && (
        <div className="bg-[var(--color-primary)] text-white px-4 py-2.5 text-center text-xs sm:text-sm font-medium flex items-center justify-center gap-3 shadow-sm relative z-20">
          <span>
            {isAr
              ? `مرحباً بك مجدداً ${studentName ? studentName : ""}! خريطتك التعليمية في الشاطر بانتظارك ومسارك محفوظ.`
              : `Bienvenue à nouveau ${studentName ? studentName : ""} ! Votre parcours SHATER vous attend.`}
          </span>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-full text-xs font-bold transition-all shrink-0"
          >
            <span>{isAr ? "لوحة التلميذ" : "Tableau de bord"}</span>
            <Arrow className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* =================================================================== */}
      {/* 01 — HERO SECTION: DUAL-MODE DISCOVERY                             */}
      {/* =================================================================== */}
      <section className="relative pt-8 sm:pt-14 pb-14 sm:pb-20 border-b border-theme overflow-hidden bg-gradient-to-b from-canvas via-surface/60 to-surface">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[450px] bg-[var(--color-primary)]/10 pointer-events-none blur-3xl" />

        <Container size="lg" className="relative z-10 space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* Left Col: Headings & Value Proposition */}
            <div className="lg:col-span-7 text-center lg:text-start space-y-6">
              
              {/* Eyebrow */}
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-primary)]/30 bg-[var(--color-primary-soft)] px-3.5 py-1.5 text-xs font-bold text-[var(--color-primary)]">
                <ShaterIcon size={16} />
                <span>BAC 2027 🇩🇿 — الشاطر للبكالوريا</span>
              </div>

              {/* Main Duality Headline */}
              <div className="space-y-4">
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-theme-text leading-[1.2] font-sans">
                  {isAr ? (
                    <>
                      تحب تقرا وحدك؟ <br />
                      <span className="text-[var(--color-primary)]">كل شيء تلقاه هنا.</span>
                    </>
                  ) : (
                    <>
                      Envie de réviser seul ? <br />
                      <span className="text-[var(--color-primary)]">Tout est disponible ici.</span>
                    </>
                  )}
                </h1>

                <p className="text-sm sm:text-base text-theme-secondary font-medium leading-relaxed max-w-xl mx-auto lg:mx-0">
                  {isAr
                    ? "دروس، ملخصات، تمارين، امتحانات وحلول — اختار واش تحب واقرا على راحتك وبسرعتك."
                    : "Cours, résumés, exercices, annales et corrigés officiels — choisissez votre matière et révisez à votre rythme."}
                </p>

                {/* Transition to Second Side */}
                <div className="p-4 rounded-2xl bg-surface border border-theme/80 max-w-xl mx-auto lg:mx-0 text-start space-y-1">
                  <span className="text-xs font-bold text-[var(--color-primary)] block">
                    {isAr ? "وما تعرفش واش تقرا؟" : "Et si vous ne savez pas par où commencer ?"}
                  </span>
                  <p className="text-xs sm:text-sm text-theme-text font-bold leading-normal">
                    {isAr
                      ? "🎯 SHATER يشخص مستواك ويعاونك تعرف واش ناقصك بالتحديد."
                      : "🎯 SHATER évalue votre niveau et cible exactement vos lacunes."}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4">
                <Link href="/auth/register" className="w-full sm:w-auto">
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full sm:w-auto font-bold shadow-clay px-8 py-6 rounded-2xl flex items-center justify-center gap-2.5 text-base"
                  >
                    <Sparkles className="h-5 w-5" />
                    <span>{isAr ? "ابدأ مجانًا" : "Commencer gratuitement"}</span>
                    <Arrow className="h-4 w-4" />
                  </Button>
                </Link>

                <Link href="#how-it-works" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto px-6 py-6 rounded-2xl font-semibold text-sm hover:bg-card"
                  >
                    <span>{isAr ? "شوف كيفاش يخدم" : "Découvrir le fonctionnement"}</span>
                  </Button>
                </Link>
              </div>

              {/* Brand Philosophy Tag */}
              <div className="pt-1 text-xs text-theme-muted font-semibold">
                « {isAr ? "ماشي واش تقرا. كيفاش توصل." : "Ce n'est pas seulement ce que vous apprenez. C'est comment vous y parvenez."} »
              </div>

              {/* 72h Guarantee Pill */}
              <div className="p-3.5 rounded-2xl bg-[var(--color-primary-soft)]/60 border border-[var(--color-primary)]/20 text-xs text-theme-secondary flex items-center gap-3 max-w-xl">
                <ShieldCheck className="h-5 w-5 text-[var(--color-primary)] shrink-0" />
                <span className="leading-normal font-medium">
                  {isAr
                    ? "✨ 72 ساعة تجربة استكشافية مجانية كاملة (0 دج) دون الحاجة لبطاقة بنكية — ادخل وشوف بنفسك."
                    : "✨ 72 heures d'essai gratuit complet sans carte bancaire — découvrez la plateforme sans engagement."}
                </span>
              </div>
            </div>

            {/* Right Col: Authentic Algerian Student Hero Asset */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative rounded-[36px] overflow-hidden border border-theme bg-card shadow-clay p-2.5 group max-w-md w-full">
                <div className="relative rounded-[30px] overflow-hidden aspect-[4/5] w-full">
                  <Image
                    src="/illustrations/shater-hero.jpg"
                    alt={isAr ? "طالب بكالوريا جزائري يدرس على منصة الشاطر" : "Étudiant algérien préparant le BAC"}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent flex flex-col justify-end p-6 text-white">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--color-primary)]/90 text-white text-[11px] font-bold w-fit mb-2 backdrop-blur-md">
                      <Target className="w-3.5 h-3.5" />
                      <span>{isAr ? "اقرا بطريقتك • أو خلينا نوجهوك" : "À votre rythme • ou guidé"}</span>
                    </div>
                    <h3 className="text-base sm:text-lg font-black leading-tight">
                      {isAr ? "المحتوى كامل بين يديك.. والذكاء يوجهك كي تحتاج" : "Le contenu complet à portée de main, l'intelligence pour vous guider"}
                    </h3>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </Container>
      </section>

      {/* =================================================================== */}
      {/* 02 — EMOTIONAL OPENING: "نعرف هاذ الإحساس"                          */}
      {/* =================================================================== */}
      <section className="py-14 sm:py-20 bg-canvas border-b border-theme">
        <Container size="lg" className="space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-4xl font-black text-theme-text font-sans">
              {isAr ? "نعرف هاذ الإحساس." : "Nous connaissons ce sentiment."}
            </h2>
            <p className="text-xs sm:text-sm text-theme-secondary">
              {isAr ? "كل طالب بكالوريا جاز على هاذ اللحظات من الحيرة والشك." : "Chaque candidat au BAC a traversé ces moments d'incertitude."}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Card 1 */}
            <div className="p-5 rounded-2xl bg-card border border-theme shadow-sm space-y-2 text-start">
              <span className="text-2xl block mb-1">💻</span>
              <h4 className="font-bold text-theme-text text-sm">« نفتح الموقع... »</h4>
              <p className="text-xs text-theme-secondary">وما نعرفش منين نبدأ بين مئات الدروس والملفات.</p>
            </div>

            {/* Card 2 */}
            <div className="p-5 rounded-2xl bg-card border border-theme shadow-sm space-y-2 text-start">
              <span className="text-2xl block mb-1">📖</span>
              <h4 className="font-bold text-theme-text text-sm">« نقرا درس... »</h4>
              <p className="text-xs text-theme-secondary">وبعدها نلقى روحي ما نعرفش نحل التمرين كي يتبدل السياق.</p>
            </div>

            {/* Card 3 */}
            <div className="p-5 rounded-2xl bg-card border border-theme shadow-sm space-y-2 text-start">
              <span className="text-2xl block mb-1">❌</span>
              <h4 className="font-bold text-theme-text text-sm">« نحل... »</h4>
              <p className="text-xs text-theme-secondary">ونعاود نفس الغلط ونضيع النقاط على نفس الجزئية.</p>
            </div>

            {/* Card 4 */}
            <div className="p-5 rounded-2xl bg-card border border-theme shadow-sm space-y-2 text-start">
              <span className="text-2xl block mb-1">🗣️</span>
              <h4 className="font-bold text-theme-text text-sm">« نشوف صحابي... »</h4>
              <p className="text-xs text-theme-secondary">كل واحد راه يقول رقم ومرجع مختلف ونحس روحي متأخر.</p>
            </div>

          </div>

          {/* Punchline */}
          <div className="p-6 rounded-2xl bg-surface border border-theme text-center max-w-xl mx-auto space-y-1">
            <h3 className="text-base sm:text-lg font-black text-theme-text">
              {isAr ? "والباك ماشي ناقصو محتوى." : "Le problème du BAC n'est pas le manque de contenu."}
            </h3>
            <p className="text-sm font-bold text-[var(--color-primary)]">
              {isAr ? "ناقصك تعرف واش يناسبك أنت." : "Ce qui vous manque, c'est de savoir ce qui correspond à vos besoins réels."}
            </p>
          </div>
        </Container>
      </section>

      {/* =================================================================== */}
      {/* 03 — SECOND EMOTIONAL MESSAGE: "عادي. SHATER يعطيك الخيارين"         */}
      {/* =================================================================== */}
      <section className="py-12 bg-surface/50 border-b border-theme">
        <Container size="md" className="text-center space-y-6">
          <div className="space-y-3 text-sm sm:text-base text-theme-secondary leading-relaxed max-w-xl mx-auto">
            <p>ممكن تكون تقرا مليح وعندك قاعدة صحيحة.</p>
            <p>ممكن تكون تحتاج غير شوية تنظيم وخطة ترتبلك وقتك.</p>
            <p>ممكن تكون عندك فجوة صغيرة في مهارة معينة معطلة معدلك.</p>
            <p>وممكن تكون فاهم الدرس بصح ما تعرفش كيفاش تطبقه في التمرين.</p>
            <p>وممكن ببساطة تحب تقرا وحدك وما تحبش واحد يقولك كل مرة واش تدير.</p>
          </div>

          <div className="pt-2">
            <span className="text-xs uppercase font-mono font-bold text-theme-muted tracking-widest block mb-1">
              الخلاصة
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-theme-text font-sans">
              عادي. <span className="text-[var(--color-primary)]">SHATER يعطيك الخيارين.</span>
            </h3>
          </div>
        </Container>
      </section>

      {/* =================================================================== */}
      {/* 04 — TWO WAYS TO LEARN: THE CORE DUALITY                           */}
      {/* =================================================================== */}
      <section className="py-16 sm:py-24 bg-canvas border-b border-theme" id="how-it-works">
        <Container size="lg" className="space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 bg-[var(--color-primary-soft)] text-[var(--color-primary)] text-xs font-bold">
              <Layers className="w-3.5 h-3.5" />
              <span>طريقتين للدراسة في منصة واحدة</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-theme-text font-sans">
              {isAr ? "عندك طريقتك. وإحنا نحترموها." : "Vous avez votre méthode, nous la respectons."}
            </h2>
            <p className="text-sm text-theme-secondary">
              اختر الطريقة التي تناسب مزاجك اليوم.. وبدّل بينهما وقتما تحب.
            </p>
          </div>

          {/* Dual Big Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            
            {/* CARD 01 — Free Learning */}
            <div className="rounded-[32px] border border-theme bg-card p-6 sm:p-10 shadow-clay flex flex-col justify-between space-y-6 text-start hover:border-[var(--color-primary)]/50 transition-all">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[var(--color-primary-soft)] text-[var(--color-primary)] flex items-center justify-center text-2xl">
                  📚
                </div>
                <div>
                  <Badge variant="outline" size="sm" className="mb-2 text-[10px] font-mono text-[var(--color-primary)]">
                    MODE 01 — حرية تامة
                  </Badge>
                  <h3 className="text-2xl sm:text-3xl font-black text-theme-text">
                    نقرا وحدي
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-theme-secondary leading-relaxed">
                  نعرف واش نحتاج. نختار المادة والدرس والتمرين ونقرا على راحتي وبلا ما يفرض عليا حتى واحد مسار معين.
                </p>

                {/* Content Checklist */}
                <div className="grid grid-cols-2 gap-2.5 pt-2 text-xs font-medium text-theme-text">
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-surface border border-theme/60">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>الدروس والشروحات</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-surface border border-theme/60">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>الملخصات المركزة</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-surface border border-theme/60">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>بنك التمارين</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-surface border border-theme/60">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>الامتحانات التجريبية</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-surface border border-theme/60">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>مواضيع البكالوريا</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-surface border border-theme/60">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>الحلول وسلالم التنقيط</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-theme/60">
                <Link href="/curriculum" className="w-full">
                  <Button variant="outline" size="lg" className="w-full rounded-xl font-bold text-sm gap-2">
                    <span>تصفح المحتوى الآن</span>
                    <Arrow className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* CARD 02 — Smart Guided Learning */}
            <div className="rounded-[32px] border-2 border-[var(--color-primary)] bg-card p-6 sm:p-10 shadow-clay flex flex-col justify-between space-y-6 text-start relative overflow-hidden">
              <div className="absolute top-0 right-0 left-0 h-1.5 bg-[var(--color-primary)]" />
              
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[var(--color-primary)] text-white flex items-center justify-center text-2xl shadow-sm">
                  🎯
                </div>
                <div>
                  <Badge variant="primary" size="sm" className="mb-2 text-[10px] font-mono bg-[var(--color-primary)] text-white">
                    MODE 02 — توجيه ذكي مخصص
                  </Badge>
                  <h3 className="text-2xl sm:text-3xl font-black text-theme-text">
                    نحب SHATER يوجّهني
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-theme-secondary leading-relaxed">
                  ما نعرفش واش ناقصني. نحب نعرف مستوايا الحقيقي ونخدم على الحاجة اللي تحتاجها فعلاً باش نتحسن بسرعة.
                </p>

                {/* Pipeline Checklist */}
                <div className="grid grid-cols-2 gap-2.5 pt-2 text-xs font-medium text-theme-text">
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-surface border border-theme/60">
                    <Check className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                    <span>تشخيص دقيق للمستوى</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-surface border border-theme/60">
                    <Check className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                    <span>اكتشاف الفجوات الخفية</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-surface border border-theme/60">
                    <Check className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                    <span>تدريب مهارات موجه</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-surface border border-theme/60">
                    <Check className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                    <span>معمل تحليل الأخطاء</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-surface border border-theme/60">
                    <Check className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                    <span>خطوات الإصلاح الفوري</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-surface border border-theme/60">
                    <Check className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                    <span>Retest توأم لتأكيد الإتقان</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-theme/60">
                <Link href="/diagnostic" className="w-full">
                  <Button variant="primary" size="lg" className="w-full rounded-xl font-bold text-sm gap-2 shadow-sm">
                    <span>ابدأ التشخيص الآن</span>
                    <Arrow className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>

          </div>

          {/* Key Unifying Message */}
          <div className="p-6 sm:p-8 rounded-3xl bg-surface border border-theme max-w-2xl mx-auto text-center space-y-2">
            <h4 className="text-base sm:text-lg font-black text-theme-text">
              {isAr ? "ماشي لازم تختار واحد وتنسى الآخر." : "Vous n'avez pas à choisir définitivement."}
            </h4>
            <p className="text-xs sm:text-sm text-theme-secondary leading-relaxed">
              تقدر تدخل وتقرا وحدك بكل راحة.. وتقدر في أي وقت تقول:{" "}
              <strong className="text-theme-text">« SHATER، ساعدني نعرف واش ندير. »</strong>
            </p>
          </div>

        </Container>
      </section>

      {/* =================================================================== */}
      {/* 05 — CONTENT LIBRARY: "كل واش تحتاج للباك، في بلاصة وحدة"           */}
      {/* =================================================================== */}
      <section className="py-16 sm:py-20 bg-surface border-b border-theme" id="content-library">
        <Container size="lg" className="space-y-10">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 bg-[var(--color-primary-soft)] text-[var(--color-primary)] text-xs font-bold">
              <BookOpen className="w-3.5 h-3.5" />
              <span>مكتبة المحتوى الشاملة</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-theme-text font-sans">
              كل واش تحتاج للباك، في بلاصة وحدة.
            </h2>
            <p className="text-xs sm:text-sm text-theme-secondary">
              مرتبة حسب الشعب والمواد والبرنامج الوزاري الرسمي 2026/2027.
            </p>
          </div>

          {/* Category Cards Composition */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            
            <div className="p-6 rounded-2xl bg-card border border-theme shadow-sm space-y-3 text-start hover:border-[var(--color-primary)]/40 transition-all">
              <span className="text-3xl block">📖</span>
              <h3 className="text-lg font-black text-theme-text">الدروس والشروحات</h3>
              <p className="text-xs text-theme-secondary leading-relaxed">
                شرح منظم وبيداغوجي لكل وحدة تعليمية، خطوة بخطوة حسب المنهاج الرسمي.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-theme shadow-sm space-y-3 text-start hover:border-[var(--color-primary)]/40 transition-all">
              <span className="text-3xl block">📝</span>
              <h3 className="text-lg font-black text-theme-text">الملخصات المركزة</h3>
              <p className="text-xs text-theme-secondary leading-relaxed">
                راجع بسرعة قبل الامتحان مع أهم القوانين والمخططات الذهنية لكل درس.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-theme shadow-sm space-y-3 text-start hover:border-[var(--color-primary)]/40 transition-all">
              <span className="text-3xl block">✍️</span>
              <h3 className="text-lg font-black text-theme-text">التمارين المتدرجة</h3>
              <p className="text-xs text-theme-secondary leading-relaxed">
                طبّق ما تعلمته من التمارين التدريبية المباشرة حتى المسائل المركبة والمعقدة.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-theme shadow-sm space-y-3 text-start hover:border-[var(--color-primary)]/40 transition-all">
              <span className="text-3xl block">🎓</span>
              <h3 className="text-lg font-black text-theme-text">مواضيع البكالوريا السابقة</h3>
              <p className="text-xs text-theme-secondary leading-relaxed">
                تدرب في سياق الامتحان الحقيقي مع مواضيع الباك لجميع الدورات السابقة.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-theme shadow-sm space-y-3 text-start hover:border-[var(--color-primary)]/40 transition-all">
              <span className="text-3xl block">🧪</span>
              <h3 className="text-lg font-black text-theme-text">الامتحانات التجريبية</h3>
              <p className="text-xs text-theme-secondary leading-relaxed">
                اختبر مستواك في ظروف قياسية مع مؤقت زمني لمعرفة جاهزيتك النفسية.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-theme shadow-sm space-y-3 text-start hover:border-[var(--color-primary)]/40 transition-all">
              <span className="text-3xl block">✅</span>
              <h3 className="text-lg font-black text-theme-text">الحلول وسلالم التنقيط</h3>
              <p className="text-xs text-theme-secondary leading-relaxed">
                شوف، قارن، وافهم أين توضع أجزاء النقطة حسب تصحيحات وزارة التربية الوطنية.
              </p>
            </div>

          </div>

          <div className="text-center pt-2">
            <Link href="/curriculum">
              <Button variant="outline" size="md" className="rounded-xl font-bold text-xs gap-2">
                <span>ادخل وتصفح المكتبة بنفسك</span>
                <Arrow className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>

        </Container>
      </section>

      {/* =================================================================== */}
      {/* 06 — SMART SYSTEM INTRO: "بصح SHATER ما يوقفش هنا"                 */}
      {/* =================================================================== */}
      <section className="py-14 sm:py-20 bg-canvas border-b border-theme">
        <Container size="md" className="text-center space-y-6">
          <Badge variant="outline" size="sm" className="text-xs font-mono text-[var(--color-primary)]">
            الفارق الجوهري
          </Badge>

          <h2 className="text-3xl sm:text-4xl font-black text-theme-text font-sans">
            بصح SHATER ما يوقفش هنا.
          </h2>

          <p className="text-sm sm:text-base text-theme-secondary leading-relaxed max-w-xl mx-auto">
            لأن وجود المحتوى وحده ما يحلش دائمًا المشكلة.
          </p>

          {/* Dilemma Box */}
          <div className="p-6 sm:p-8 rounded-3xl bg-surface border border-theme text-start max-w-md mx-auto space-y-3 shadow-sm">
            <span className="text-xs font-bold text-theme-muted uppercase font-mono block">المعادلة الواقعية:</span>
            <p className="text-base sm:text-lg font-black text-theme-text">
              عندك 100 تمرين قدامك. <br />
              <span className="text-[var(--color-primary)]">السؤال: أي واحد تحل اليوم؟</span>
            </p>
            <p className="text-xs text-theme-secondary">
              حل التمرين الخطأ يضيع وقتك.. وحل تمرين تعرفه ما يزيدلك والو.
            </p>
          </div>

          <div className="text-base sm:text-lg font-black text-theme-text pt-2">
            هنا يبدأ الفرق.
          </div>
        </Container>
      </section>

      {/* =================================================================== */}
      {/* 07 — THE INTELLIGENT JOURNEY                                       */}
      {/* =================================================================== */}
      <section className="py-16 sm:py-20 bg-surface/50 border-b border-theme">
        <Container size="lg" className="space-y-10">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h3 className="text-2xl sm:text-3xl font-black text-theme-text font-sans">
              مسار التوجيه الذكي في الشاطر
            </h3>
            <p className="text-xs sm:text-sm text-theme-secondary">
              المحتوى موجود كامل.. ولكن لما تحتاج توجيه، SHATER يساعدك تختار الحاجة اللي عندها معنى لمستواك.
            </p>
          </div>

          {/* 10 Steps Pipeline */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 max-w-4xl mx-auto text-center">
            {[
              { num: "01", text: "نعرف مستواك", sub: "تشخيص حقيقي" },
              { num: "02", text: "نكتشف واش ناقصك", sub: "تحديد الفجوة" },
              { num: "03", text: "نحدد المهارة", sub: "أولوية دقيقة" },
              { num: "04", text: "تتعلم", sub: "فيديو مركز" },
              { num: "05", text: "تتدرب", sub: "تطبيق عملي" },
              { num: "06", text: "نفهم الغلط", sub: "تحليل السبب" },
              { num: "07", text: "تصلح", sub: "خطوات واضحة" },
              { num: "08", text: "تعاود", sub: "تمرين توأم" },
              { num: "09", text: "نتأكد بلي تحسنت", sub: "إثبات التمكن" },
              { num: "10", text: "الجاهزية", sub: "ثقة يوم الباك" },
            ].map((step, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-card border border-theme shadow-sm space-y-1">
                <span className="text-[10px] font-mono font-bold text-[var(--color-primary)] block">
                  {step.num}
                </span>
                <span className="text-xs font-bold text-theme-text block">{step.text}</span>
                <span className="text-[10px] text-theme-muted block">{step.sub}</span>
              </div>
            ))}
          </div>

        </Container>
      </section>

      {/* =================================================================== */}
      {/* 08 — WHAT DOES "SHATER" MEAN?                                      */}
      {/* =================================================================== */}
      <section className="py-16 sm:py-20 bg-canvas border-b border-theme" id="why-shater">
        <Container size="md" className="space-y-8 text-center">
          <Badge variant="outline" size="sm" className="text-xs font-mono text-[var(--color-primary)]">
            فلسفة الهوية
          </Badge>

          <h2 className="text-3xl sm:text-4xl font-black text-theme-text font-sans">
            بصح واش معناها « شاطر »؟
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-start max-w-xl mx-auto pt-2">
            <div className="p-5 rounded-2xl bg-surface border border-theme space-y-2 opacity-75">
              <span className="text-xs font-bold text-rose-500 block font-mono">المفهوم القديم المغلوط:</span>
              <h4 className="font-bold text-theme-text text-sm">شخص يحفظ كل شيء أعمى</h4>
              <p className="text-xs text-theme-secondary">
                يقرا ساعات طويلة بدون فهم، وبمجرد ما يتبدل صياغة السؤال في الامتحان يضيع.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-card border-2 border-[var(--color-primary)] space-y-2 shadow-sm">
              <span className="text-xs font-bold text-[var(--color-primary)] block font-mono">الشاطر الحقيقي:</span>
              <h4 className="font-bold text-theme-text text-sm">شخص يعرف كيفاش يتصرف</h4>
              <p className="text-xs text-theme-secondary">
                يفهم المفتاح، يعرف كيفاش يطبق، يعرف أين يخطئ، ويصلح خطأه بسرعة ويوصل للنتيجة.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-surface border border-theme max-w-md mx-auto">
            <div className="text-sm sm:text-base font-black text-[var(--color-primary)] font-sans">
              الشطارة = فهم + تطبيق + تصرف + إتقان
            </div>
          </div>
        </Container>
      </section>

      {/* =================================================================== */}
      {/* 09 — REAL PRODUCT STORIES & SCREENSHOTS                            */}
      {/* =================================================================== */}
      <RealProductStoriesSection isAr={isAr} />

      {/* =================================================================== */}
      {/* 10 — ERROR LAB DEEP DIVE                                           */}
      {/* =================================================================== */}
      <section className="py-16 sm:py-20 bg-canvas border-b border-theme">
        <Container size="lg" className="space-y-10">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 bg-rose-500/10 text-rose-600 text-xs font-bold border border-rose-500/20">
              <RotateCcw className="w-3.5 h-3.5" />
              <span>معمل الأخطاء (Error Lab)</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-theme-text font-sans">
              الغلط ماشي نهاية السؤال.. الغلط بداية الفهم.
            </h2>
            <p className="text-xs sm:text-sm text-theme-secondary">
              المنصات العادية تكتفي بوضع علامة ❌ حمراء.. في الشاطر، نفكك سبب الخطأ لنضمن عدم تكراره.
            </p>
          </div>

          {/* Interactive Error Transformation Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto items-stretch">
            
            {/* The Old Way */}
            <div className="p-6 rounded-3xl bg-surface border border-rose-400/30 text-start space-y-4 opacity-80">
              <div className="flex items-center gap-2 text-rose-600 font-bold text-xs uppercase font-mono">
                <X className="w-4 h-4" />
                <span>الطريقة التقليدية الصادمة</span>
              </div>
              <div className="p-4 rounded-xl bg-card border border-theme text-start space-y-2">
                <span className="text-lg font-black text-rose-600">❌ إجابة خاطئة (0/20)</span>
                <p className="text-xs text-theme-muted">
                  « الإجابة الصحيحة هي: ج » — بدون أي شرح لسبب وقوعك في الفخ!
                </p>
              </div>
              <p className="text-xs text-theme-secondary">
                النتيجة: إحباط، قلق، وتكرار نفس الخطأ في الفرض القادم.
              </p>
            </div>

            {/* The Shater Way */}
            <div className="p-6 rounded-3xl bg-card border-2 border-[var(--color-primary)] text-start space-y-4 shadow-clay">
              <div className="flex items-center gap-2 text-[var(--color-primary)] font-bold text-xs uppercase font-mono">
                <Sparkles className="w-4 h-4" />
                <span>معمل الأخطاء في الشاطر</span>
              </div>
              <div className="p-4 rounded-xl bg-surface border border-theme text-start space-y-2 text-xs">
                <div>
                  <strong className="text-theme-text block font-bold">📍 أين وقع الخطأ؟</strong>
                  <span className="text-theme-secondary">قراءة السؤال واستخراج المعطيات.</span>
                </div>
                <div>
                  <strong className="text-theme-text block font-bold">🔍 لماذا أخطأت؟</strong>
                  <span className="text-theme-secondary">استعملت المعطى الثانوي بدل الأساسي بسبب التسرع في الحساب.</span>
                </div>
                <div>
                  <strong className="text-[var(--color-primary)] block font-bold">🛠️ خطوة الإصلاح:</strong>
                  <span className="text-theme-text">تدرب على تظليل المطلوب قبل البدء، ثم أعد المحاولة في تمرين توأم.</span>
                </div>
              </div>
              <p className="text-xs text-theme-secondary font-medium">
                النتيجة: الفخ الوزاري أصبح مكشوفاً ومعلوماً بالنسبة لك.
              </p>
            </div>

          </div>

        </Container>
      </section>

      {/* =================================================================== */}
      {/* 11 — RADICAL HONESTY: "الباك يحتاج خدمة"                          */}
      {/* =================================================================== */}
      <section className="py-16 sm:py-20 bg-surface/60 border-b border-theme">
        <Container size="md" className="text-center space-y-6">
          <Badge variant="outline" size="sm" className="text-xs font-mono text-[var(--color-primary)]">
            الالتزام الصريح
          </Badge>

          <h2 className="text-3xl sm:text-4xl font-black text-theme-text font-sans">
            نخلوها واضحة من البداية: <br />
            <span className="text-[var(--color-primary)]">الباك يحتاج خدمة.</span>
          </h2>

          <div className="space-y-2 text-sm sm:text-base text-theme-secondary leading-relaxed max-w-xl mx-auto">
            <p>يحتاج دراسة جادة، يحتاج وقت، يحتاج حل تمارين، يحتاج تكرار، ويحتاج صبر.</p>
            <p className="font-bold text-theme-text">وراح تغلط في الطريق.. وهذا أمر طبيعي جداً.</p>
          </div>

          <div className="p-6 rounded-3xl bg-card border border-theme max-w-lg mx-auto text-start space-y-2 shadow-sm text-xs sm:text-sm">
            <p className="text-theme-secondary">
              SHATER ما يقراش في بلاصتك وما عندوش عصا سحرية.. بصح يساعدك تعرف:
            </p>
            <ul className="space-y-1.5 font-bold text-theme-text pt-1">
              <li>✓ واش تقرا بالضبط دون تشتت.</li>
              <li>✓ كيفاش تتدرب بذكاء وبأقل جهد ضائع.</li>
              <li>✓ علاش غلطت وكيفاش تصلح الغلط.</li>
              <li>✓ متى تكون جاهزاً حقيقة للامتحان.</li>
            </ul>
          </div>

          <div className="text-xl font-black text-theme-text pt-2">
            الخدمة عليك.. والطريق نعاونك فيه.
          </div>
        </Container>
      </section>

      {/* =================================================================== */}
      {/* 12 — STUDENT EMOTIONAL STORY TIMELINE                              */}
      {/* =================================================================== */}
      <section className="py-16 sm:py-20 bg-canvas border-b border-theme">
        <Container size="lg" className="space-y-10">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h3 className="text-2xl sm:text-3xl font-black text-theme-text font-sans">
              رحلة الطالب في الشاطر
            </h3>
            <p className="text-xs sm:text-sm text-theme-secondary">
              من مرحلة التشتت والحيرة.. إلى لحظة الهدوء والجاهزية التامة.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 max-w-5xl mx-auto text-center">
            {[
              { icon: "😕", state: "قبل الشاطر", desc: "ما نعرفش واش نقرا" },
              { icon: "🔎", state: "بعد التشخيص", desc: "عرفت مستوايا" },
              { icon: "🎯", state: "بعد كشف الفجوة", desc: "عرفت واش ناقصني" },
              { icon: "✍️", state: "بعد التدريب", desc: "خدمت عليه" },
              { icon: "❌", state: "بعد الغلط", desc: "فهمت السبب" },
              { icon: "🔁", state: "بعد الـ Retest", desc: "عاودت وجبتها" },
              { icon: "💪", state: "بعد الإتقان", desc: "نقدر وحدي" },
              { icon: "🎓", state: "يوم الباك", desc: "أنا جاهز" },
            ].map((st, i) => (
              <div key={i} className="p-3 rounded-2xl bg-surface border border-theme shadow-sm space-y-1 flex flex-col justify-between">
                <span className="text-2xl block">{st.icon}</span>
                <span className="text-[11px] font-bold text-theme-text block">{st.state}</span>
                <span className="text-[10px] text-theme-muted block">{st.desc}</span>
              </div>
            ))}
          </div>

        </Container>
      </section>

      {/* =================================================================== */}
      {/* 13 — PARENTS & FRIENDS SECTIONS                                    */}
      {/* =================================================================== */}
      <section className="py-16 sm:py-20 bg-surface border-b border-theme">
        <Container size="lg" className="space-y-16">
          
          {/* PARENTS ROW */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative rounded-[28px] overflow-hidden aspect-[4/3] w-full max-w-md border border-theme shadow-clay">
                <Image
                  src="/illustrations/shater-parent.jpg"
                  alt="ولي أمر يتابع دراسة ابنه بهدوء وطمأنينة"
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            <div className="lg:col-span-7 text-start space-y-4">
              <Badge variant="outline" size="sm" className="text-xs font-mono text-[var(--color-primary)]">
                رسالة إلى الأولياء
              </Badge>
              <h3 className="text-2xl sm:text-3xl font-black text-theme-text leading-snug font-sans">
                وإذا كنت وليّ أمر...
              </h3>
              <p className="text-sm text-theme-secondary leading-relaxed">
                أنت ما يهمكش فقط: « قداه قرا اليوم؟ ».. أنت تحب تعرف:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-bold text-theme-text">
                <div className="p-2.5 rounded-xl bg-card border border-theme flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                  <span>هل راه يتقدم حقيقة؟</span>
                </div>
                <div className="p-2.5 rounded-xl bg-card border border-theme flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                  <span>واش راه ناقصه بالتحديد؟</span>
                </div>
                <div className="p-2.5 rounded-xl bg-card border border-theme flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                  <span>هل راه يخدم على الحاجة الصح؟</span>
                </div>
                <div className="p-2.5 rounded-xl bg-card border border-theme flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                  <span>هل راه يطور كفاءته؟</span>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-theme-secondary leading-relaxed pt-1">
                SHATER يساعد الطالب يشوف طريقه بوضوح، بدل ما يبقى يدور بين عشرات الدروس والتمارين بلا اتجاه.
              </p>
            </div>
          </div>

          {/* FRIENDS ROW */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-8 border-t border-theme/60">
            <div className="lg:col-span-7 text-start space-y-4 order-2 lg:order-1">
              <Badge variant="outline" size="sm" className="text-xs font-mono text-[var(--color-primary)]">
                تنوع الاحتياجات
              </Badge>
              <h3 className="text-2xl sm:text-3xl font-black text-theme-text leading-snug font-sans">
                ماشي كامل كيف كيف.
              </h3>
              <p className="text-sm text-theme-secondary leading-relaxed">
                في القسم، كل طالب عنده حاجته الخاصة وطريقته اللي تريحه:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-xl bg-card border border-theme text-start">
                  <span className="font-bold text-theme-text block">« أنا مشكلتي في الرياضيات »</span>
                  <span className="text-[11px] text-theme-muted">نحتاج تمارين متدرجة لسد ثغرات الحساب.</span>
                </div>
                <div className="p-3 rounded-xl bg-card border border-theme text-start">
                  <span className="font-bold text-theme-text block">« أنا في منهجية العلوم والفيزياء »</span>
                  <span className="text-[11px] text-theme-muted">نحتاج نفهم سلم التنقيط وصياغة الفرضيات.</span>
                </div>
                <div className="p-3 rounded-xl bg-card border border-theme text-start">
                  <span className="font-bold text-theme-text block">« أنا نعرف نقرا بصح نتشتت »</span>
                  <span className="text-[11px] text-theme-muted">نحتاج خطة يومية تقولي واش نخدم اليوم.</span>
                </div>
                <div className="p-3 rounded-xl bg-card border border-theme text-start">
                  <span className="font-bold text-theme-text block">« أنا نحب نقرا وحدي تماماً »</span>
                  <span className="text-[11px] text-theme-muted">نحتاج المكتبة كاملة ومانحبش حتى واحد يفرض عليا مسار.</span>
                </div>
              </div>
              <p className="text-xs text-[var(--color-primary)] font-bold pt-1">
                ولهذا SHATER ما يفرضش نفس الطريق على الجميع.. أنت تختار الطريقة اللي تناسبك.
              </p>
            </div>

            <div className="lg:col-span-5 flex justify-center order-1 lg:order-2">
              <div className="relative rounded-[28px] overflow-hidden aspect-[4/3] w-full max-w-md border border-theme shadow-clay">
                <Image
                  src="/illustrations/shater-friends.jpg"
                  alt="مجموعة أصدقاء بكالوريا يدرسون معاً في جو إيجابي"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>

        </Container>
      </section>

      {/* =================================================================== */}
      {/* 14 — UNIVERSITY SPECIALTY CALCULATOR SECTION                       */}
      {/* =================================================================== */}
      <section className="py-16 sm:py-24 bg-canvas border-b border-theme" id="university-calculator">
        <Container size="lg">
          <UniversitySpecialtyCalculator isAr={isAr} />
        </Container>
      </section>

      {/* =================================================================== */}
      {/* 15 — COUNTDOWN TO BAC 2027                                         */}
      {/* =================================================================== */}
      <BacCountdownSection isAr={isAr} />

      {/* =================================================================== */}
      {/* 16 — PRICING & TRANSPARENCY                                        */}
      {/* =================================================================== */}
      <section className="py-16 sm:py-24 bg-surface border-b border-theme" id="pricing">
        <Container size="lg" className="space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 bg-[var(--color-primary-soft)] text-[var(--color-primary)] text-xs font-bold">
              <Award className="w-3.5 h-3.5" />
              <span>تسعيرة واضحة وشفافة</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-theme-text font-sans">
              ابدا واكتشف SHATER.
            </h2>
            <p className="text-sm text-theme-secondary">
              فترة استكشافية مجانية كاملة.. واشتراك سنوي واضح دون أي رسوم خفية.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
            
            {/* Free Tier */}
            <div className="p-8 rounded-[32px] bg-card border border-theme shadow-sm flex flex-col justify-between space-y-6 text-start">
              <div className="space-y-4">
                <Badge variant="outline" size="sm" className="text-xs font-mono text-emerald-600">
                  تجربة استكشافية
                </Badge>
                <h3 className="text-2xl font-black text-theme-text">مجانًا (72 ساعة)</h3>
                <div className="flex items-baseline gap-1 font-mono">
                  <span className="text-4xl font-black text-theme-text">0</span>
                  <span className="text-sm font-bold text-theme-muted">دج / بدون بطاقة دفع</span>
                </div>
                <p className="text-xs text-theme-secondary leading-relaxed">
                  افتح حسابك واكتشف خريطتك فوراً دون دفع أي دينار وبدون التزام.
                </p>

                <ul className="space-y-2.5 pt-2 text-xs text-theme-text">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>تشخيص كامل للمكتسبات والمهارات</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>تحديد الفجوات المعرفية ونقاط الضعف</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>تجربة مهمة يومية موجهة كاملة</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>تصفح مكتبة الدروس والملخصات</span>
                  </li>
                </ul>
              </div>

              <div className="pt-4 border-t border-theme/60">
                <Link href="/auth/register" className="w-full">
                  <Button variant="outline" size="lg" className="w-full rounded-xl font-bold text-sm">
                    ابدأ التجربة المجانية (72 ساعة)
                  </Button>
                </Link>
              </div>
            </div>

            {/* Pro Season Pass */}
            <div className="p-8 rounded-[32px] bg-card border-2 border-[var(--color-primary)] shadow-clay flex flex-col justify-between space-y-6 text-start relative overflow-hidden">
              <div className="absolute top-0 right-0 left-0 h-2 bg-[var(--color-primary)]" />
              
              <div className="space-y-4">
                <Badge variant="primary" size="sm" className="text-xs font-mono bg-[var(--color-primary)] text-white">
                  الموسم الكامل 2026/2027
                </Badge>
                <h3 className="text-2xl font-black text-theme-text">SHATER BAC</h3>
                <div className="flex items-baseline gap-1 font-mono">
                  <span className="text-4xl font-black text-[var(--color-primary)]">4,900</span>
                  <span className="text-sm font-bold text-theme-muted">دج / الموسم الدراسي كاملاً</span>
                </div>
                <p className="text-xs text-theme-secondary leading-relaxed">
                  وصول كامل وغير محدود لجميع المواد والشعب حتى آخر يوم في امتحانات البكالوريا.
                </p>

                <ul className="space-y-2.5 pt-2 text-xs text-theme-text">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[var(--color-primary)] shrink-0" />
                    <span>كل ميزات المنظومة الحرة والموجهة</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[var(--color-primary)] shrink-0" />
                    <span>معمل الأخطاء اللامحدود مع اختبارات توأم</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[var(--color-primary)] shrink-0" />
                    <span>تحديثات مستمرة حسب مواضيع البكالوريا التجريبية</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[var(--color-primary)] shrink-0" />
                    <span>دفع آمن وسهل عبر بريدي موب (BaridiMob) و CCP</span>
                  </li>
                </ul>
              </div>

              <div className="pt-4 border-t border-theme/60">
                <Link href="/subscribe" className="w-full">
                  <Button variant="primary" size="lg" className="w-full rounded-xl font-bold text-sm shadow-sm">
                    تفعيل الاشتراك الكامل
                  </Button>
                </Link>
              </div>
            </div>

          </div>

        </Container>
      </section>

      {/* =================================================================== */}
      {/* 17 — FAQ SECTION                                                   */}
      {/* =================================================================== */}
      <section className="py-16 sm:py-20 bg-canvas border-b border-theme" id="faq">
        <Container size="md" className="space-y-10">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-4xl font-black text-theme-text font-sans">
              الأسئلة الشائعة
            </h2>
            <p className="text-xs sm:text-sm text-theme-secondary">
              إجابات مباشرة وصريحة بدون تعقيد.
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                q: "واش نلقى داخل SHATER؟",
                a: "تجد مكتبة كاملة للدراسة الحرة (دروس، ملخصات، تمارين، امتحانات سابقة، وحلول نموذجية)، إضافة إلى النظام الذكي الموجه الذي يشخص مستواك ويحدد فجواتك ويدربك على معمل الأخطاء خطوة بخطوة.",
              },
              {
                q: "لازم نمشي حسب المسار اللي يعطيني SHATER؟",
                a: "لا إطلاقاً. تقدر تقرا بحرية تامة وتختار المادة والدرس اللي تحتاجه وحدك. وإذا حسيت روحك تائه أو ما عرفتش واش تقرا، SHATER يقدر يساعدك ويوجهك لمستواك الحقيقي.",
              },
              {
                q: "هل SHATER يعوض الأستاذ في القسم؟",
                a: "لا. المنظومة وسيلة مرافقة وممارسة وتدريب مكثف تساعدك على الفهم والتطبيق وسد الثغرات، ولا تلغي دور الأستاذ أو الجهد الشخصي الجاد.",
              },
              {
                q: "هل لازم نكون قوي وممتاز باش نستعمله؟",
                a: "بالعكس. المنظومة تبدأ من أي مستوى، سواء كنت تبحث عن تثبيت الأساسيات والحصول على المعدل، أو كنت متفوقاً وتبحث عن مرتبة الشرف الأولى وكليات النخبة.",
              },
              {
                q: "هل يضمنلي معدل معين في الباك؟",
                a: "لا نبيع الوهم. النجاح يحتاج دراستك وجهدك وصبرك. الشاطر يضمن لك وضوح الرؤية، استثمار وقتك في الحاجة اللي تهمك، ومعالجة أخطائك بدقة متناهية.",
              },
              {
                q: "واش هي الشعب المتوفرة حالياً؟",
                a: "المنظومة تغطي الشعب الست للبكالوريا الجزائرية: علوم تجريبية، رياضيات، تقني رياضي (بفروعه الأربعة)، تسيير واقتصاد، آداب وفلسفة، ولغات أجنبية.",
              },
            ].map((item, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-theme bg-card overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-5 text-start font-bold text-sm sm:text-base text-theme-text flex items-center justify-between gap-4"
                  >
                    <span>{item.q}</span>
                    <ChevronDown className={`w-4 h-4 text-theme-muted transition-transform duration-200 shrink-0 ${isOpen ? "rotate-180 text-[var(--color-primary)]" : ""}`} />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs sm:text-sm text-theme-secondary leading-relaxed border-t border-theme/40 pt-3">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </Container>
      </section>

      {/* =================================================================== */}
      {/* 18 — FINAL EMOTIONAL CTA: "ماشي لازم تمشي وحدك"                     */}
      {/* =================================================================== */}
      <section className="py-16 sm:py-24 bg-surface relative overflow-hidden border-b border-theme">
        <div className="absolute top-0 right-1/2 translate-x-1/2 w-full max-w-4xl h-[300px] bg-[var(--color-primary)]/10 pointer-events-none blur-3xl" />

        <Container size="md" className="relative z-10 text-center space-y-8">
          
          <div className="relative rounded-[32px] overflow-hidden aspect-[16/9] max-w-lg mx-auto border border-theme shadow-clay">
            <Image
              src="/illustrations/shater-confidence.jpg"
              alt="طالب بكالوريا هادئ وواثق بعد حل مسألة صعبة"
              fill
              className="object-cover"
            />
          </div>

          <div className="space-y-4 max-w-xl mx-auto">
            <h2 className="text-3xl sm:text-5xl font-black text-theme-text font-sans leading-tight">
              الباك ماشي رحلة سهلة.. <br />
              <span className="text-[var(--color-primary)]">بصح ما لازمكش تمشي وحدك.</span>
            </h2>

            <div className="space-y-2 text-sm text-theme-secondary leading-relaxed">
              <p>راح تقرا، راح تغلط، راح تعاود، وراح تكون أيام تحس فيها بالضغط.</p>
              <p>اقرا وحدك إذا هذا اللي يناسبك.. وإذا ما عرفتش واش تحتاج، خلّي SHATER يعاونك.</p>
            </div>

            <div className="p-4 rounded-2xl bg-card border border-theme text-xs font-bold text-theme-text max-w-md mx-auto space-y-1">
              <div>من « ما نعرفش واش نقرا » ← إلى « نعرف واش ناقصني »</div>
              <div>ومن « واش راح ندير؟ » ← إلى « أنا جاهز »</div>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth/register" className="w-full sm:w-auto">
              <Button
                variant="primary"
                size="lg"
                className="w-full sm:w-auto font-bold shadow-clay px-10 py-6 rounded-2xl text-base gap-2"
              >
                <span>ابدأ رحلتك مع SHATER</span>
                <Arrow className="w-4 h-4" />
              </Button>
            </Link>

            <Link href="/curriculum" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto px-8 py-6 rounded-2xl font-bold text-sm"
              >
                <span>تصفح المحتوى أولاً</span>
              </Button>
            </Link>
          </div>

          <div className="text-xs text-theme-muted">
            0 دج للتجربة الاستكشافية • بدون التزام • وصول فوري
          </div>
        </Container>
      </section>

      {/* =================================================================== */}
      {/* 19 — BRAND CLOSING & SITEMAP FOOTER                                */}
      {/* =================================================================== */}
      <section className="py-10 bg-canvas border-b border-theme text-center">
        <Container size="md" className="space-y-2">
          <h3 className="text-xl sm:text-2xl font-black text-theme-text font-sans">
            الشاطر | SHATER
          </h3>
          <p className="text-xs sm:text-sm text-theme-secondary font-medium">
            نبني الإنسان الشاطر، ونبدأ بالباكالوريا.
          </p>
          <div className="text-xs text-[var(--color-primary)] font-bold pt-1">
            « ماشي واش تقرا. كيفاش توصل. »
          </div>
        </Container>
      </section>

      <ShaterFooter isAr={isAr} />

    </AppShell>
  );
}

// ============================================================================
// 20. SHATER FOOTER
// ============================================================================

export function ShaterFooter({ isAr }: { isAr: boolean }) {
  return (
    <footer className="border-t border-theme bg-surface py-12 text-xs text-theme-secondary">
      <Container size="lg" className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          <div className="md:col-span-5 space-y-3 text-start">
            <Logo size="md" showTagline={false} />
            <p className="text-xs text-theme-secondary max-w-sm leading-relaxed">
              منظومة ذكية للتعلم والتدريب وبناء الكفاءة. تجمع بين حرية التعلم الذاتي وتوجيه الذكاء التكيفي لمساعدة طلبة البكالوريا في الجزائر على بلوغ أهدافهم.
            </p>
            <div className="text-[11px] font-medium text-theme-muted">
              « ماشي واش تقرا. كيفاش توصل. »
            </div>
          </div>

          <div className="md:col-span-4 grid grid-cols-2 gap-4 text-start">
            <div className="space-y-2.5">
              <span className="text-[11px] font-mono uppercase font-bold text-theme-text block">
                المنظومة
              </span>
              <ul className="space-y-2 text-xs">
                <li><Link href="/" className="hover:text-[var(--color-primary)] transition-colors">الرئيسية</Link></li>
                <li><Link href="/curriculum" className="hover:text-[var(--color-primary)] transition-colors">المكتبة الحرة</Link></li>
                <li><Link href="/diagnostic" className="hover:text-[var(--color-primary)] transition-colors">التشخيص الذكي</Link></li>
                <li><Link href="#pricing" className="hover:text-[var(--color-primary)] transition-colors">الأسعار</Link></li>
                <li><Link href="#faq" className="hover:text-[var(--color-primary)] transition-colors">الأسئلة الشائعة</Link></li>
              </ul>
            </div>

            <div className="space-y-2.5">
              <span className="text-[11px] font-mono uppercase font-bold text-theme-text block">
                الدخول والتسجيل
              </span>
              <ul className="space-y-2 text-xs">
                <li><Link href="/auth" className="hover:text-[var(--color-primary)] transition-colors">تسجيل الدخول</Link></li>
                <li><Link href="/auth/register" className="hover:text-[var(--color-primary)] transition-colors">فتح حساب (72 سا مجاناً)</Link></li>
                <li><Link href="/subscribe" className="hover:text-[var(--color-primary)] transition-colors">تفعيل الاشتراك</Link></li>
              </ul>
            </div>
          </div>

          <div className="md:col-span-3 space-y-3 text-start">
            <span className="text-[11px] font-mono uppercase font-bold text-theme-text block">
              المساعدة والتواصل
            </span>
            <p className="text-xs text-theme-secondary">
              فريق الدعم الفني متواجد لمرافقتك والإجابة عن استفساراتك حول المنصة والاشتراكات.
            </p>
            <a
              href={`https://wa.me/213550853234?text=${encodeURIComponent("مرحباً، أحتاج إلى استفسار حول منصة الشاطر للبكالوريا.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[var(--color-primary-soft)] text-[var(--color-primary)] font-bold text-xs hover:bg-[var(--color-primary)] hover:text-white transition-all shadow-sm"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp: +213 550 85 32 34</span>
            </a>
          </div>

        </div>

        <div className="border-t border-theme/60 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-theme-muted">
          <span>
            الشاطر | SHATER © {new Date().getFullYear()} — جميع الحقوق محفوظة.
          </span>
          <span className="text-theme-secondary">
            منظومة ذكية للتعلم وبناء الكفاءة 🇩🇿
          </span>
        </div>
      </Container>
    </footer>
  );
}
