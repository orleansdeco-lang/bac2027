import { MajlisTable } from "@/types/campus";

// Ephemeral memory cache for active Majlis tables during session
const globalForTables = globalThis as unknown as {
  majlisTableStore?: Map<string, MajlisTable>;
};

const globalTables: Map<string, MajlisTable> =
  globalForTables.majlisTableStore || new Map<string, MajlisTable>();

globalForTables.majlisTableStore = globalTables;

export const TableStore = {
  get(id: string): MajlisTable | undefined {
    return globalTables.get(id);
  },
  set(id: string, table: MajlisTable): void {
    globalTables.set(id, table);
  },
  delete(id: string): void {
    globalTables.delete(id);
  },
  getAll(): MajlisTable[] {
    return Array.from(globalTables.values());
  },
  clear(): void {
    globalTables.clear();
  },
};
