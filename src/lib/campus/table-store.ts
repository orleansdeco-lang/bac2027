import { MajlisTable } from "@/types/campus";

// Global in-memory cache for synchronous Majlis tables across dev route handlers
const globalForTables = globalThis as unknown as {
  majlisTableStore?: Map<string, MajlisTable>;
};

const globalTables: Map<string, MajlisTable> =
  globalForTables.majlisTableStore || new Map<string, MajlisTable>();

globalForTables.majlisTableStore = globalTables;

// Seed default tables for development / initial runtime
const SEED_TABLES: MajlisTable[] = [
  {
    id: "table-sciences-rc",
    title: "تحدي تمرين الدارة RC — بكالوريا 2022 بالتوقيت الصارم",
    creatorId: "user-ali",
    creatorName: "علي المنصوري",
    stream: "sciences_exp",
    subjectId: "physics",
    lesson: "ثنائي القطب RC (شحن وتفريغ مكثفة)",
    mode: "PAPER_PRACTICE",
    capacity: 6,
    status: "ACTIVE",
    currentPhase: "READING_SOLVING",
    timeRemainingSeconds: 780,
    durationMinutes: 25,
    createdAt: new Date().toISOString(),
    seats: [
      {
        seatIndex: 0,
        studentId: "user-ali",
        studentName: "علي المنصوري",
        avatar: "👨‍🎓",
        stream: "sciences_exp",
        status: "SOLVING",
        statusPill: "يحل الآن ✍️",
        timerSeconds: 720,
        joinedAt: new Date().toISOString(),
      },
      null,
      null,
      null,
      null,
      null,
    ],
    activeMaterial: {},
  },
  {
    id: "table-math-quiz",
    title: "كويز تفاعلي سريع: أسرار التزايد المقارن والمستقيمات المقاربة",
    creatorId: "user-tarek",
    creatorName: "طارق بلقاسم",
    stream: "math",
    subjectId: "math",
    lesson: "الدوال الأسية واللوغاريتمية",
    mode: "DIGITAL_QUIZ",
    capacity: 4,
    status: "ACTIVE",
    currentPhase: "QUESTION_ACTIVE",
    timeRemainingSeconds: 30,
    durationMinutes: 15,
    createdAt: new Date().toISOString(),
    seats: [
      {
        seatIndex: 0,
        studentId: "user-tarek",
        studentName: "طارق بلقاسم",
        avatar: "📐",
        stream: "math",
        status: "SOLVING",
        statusPill: "يحل الآن ✍️",
        timerSeconds: 25,
        quizScore: 20,
        joinedAt: new Date().toISOString(),
      },
      null,
      null,
      null,
    ],
    activeMaterial: {},
  },
];

for (const t of SEED_TABLES) {
  globalTables.set(t.id, t);
}

export const TableStore = {
  get(id: string): MajlisTable | undefined {
    return globalTables.get(id);
  },
  set(id: string, table: MajlisTable): void {
    globalTables.set(id, table);
  },
  getAll(): MajlisTable[] {
    return Array.from(globalTables.values());
  },
};
