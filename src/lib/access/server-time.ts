/**
 * BAC Mastery - Server-Authoritative Time Service
 * Fetches authoritative server time to prevent local client clock tampering.
 */

let serverOffsetMs: number = 0;
let lastSyncedAt: number = 0;
const SYNC_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

export async function syncServerTime(): Promise<number> {
  try {
    const t0 = Date.now();
    const res = await fetch("/api/server-time", { cache: "no-store" });
    const t1 = Date.now();

    if (res.ok) {
      const data = await res.json();
      const serverTimestamp = data.timestamp || new Date(data.now).getTime();
      // Round-trip latency estimation (half RTT)
      const latency = (t1 - t0) / 2;
      serverOffsetMs = serverTimestamp + latency - t1;
      lastSyncedAt = t1;
    }
  } catch (err) {
    // If offline or during static build, fall back to 0 offset
    console.warn("Could not sync server time, using local clock baseline:", err);
  }
  return serverOffsetMs;
}

/**
 * Returns current Date adjusted with authoritative server offset
 */
export function getServerAuthoritativeDate(): Date {
  // If never synced or sync expired, trigger background sync if in browser
  if (typeof window !== "undefined" && Date.now() - lastSyncedAt > SYNC_INTERVAL_MS) {
    syncServerTime().catch(() => {});
  }
  return new Date(Date.now() + serverOffsetMs);
}
