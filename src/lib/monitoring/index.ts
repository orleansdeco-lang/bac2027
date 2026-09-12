/**
 * BAC Mastery — Production Error Monitoring & Safety Guard
 * Prompt 17 § 17: Production Safety & Discoverable Runtime Errors
 * 
 * DESIGN PRINCIPLES:
 * 1. Discoverable runtime exceptions without heavy external SDK overhead.
 * 2. Strict sanitization: scrubs JWTs, passwords, secrets, and auth headers.
 * 3. Graceful degradation: never causes an uncaught secondary failure.
 */

export interface CapturedError {
  id: string;
  message: string;
  stack?: string;
  context?: Record<string, unknown>;
  timestamp: string;
  url?: string;
}

export const ERROR_LOG_STORAGE_KEY = "bac_mastery_error_logs";

/**
 * Sanitizes an error message or context to prevent leaking secrets/tokens
 */
function sanitizeString(str: string): string {
  return str
    .replace(/Bearer\s+[A-Za-z0-9-_=.]+/gi, "Bearer [REDACTED]")
    .replace(/key=[A-Za-z0-9-_=.]+/gi, "key=[REDACTED]")
    .replace(/password['"]?\s*[:=\s]\s*['"]?[^'",\s]+/gi, "password=[REDACTED]")
    .replace(/eyJh[A-Za-z0-9-_=.]+/g, "[JWT_REDACTED]");
}

/**
 * Captures a client-side error in a production-safe manner
 */
export function captureClientError(error: unknown, context: Record<string, unknown> = {}): CapturedError {
  const errObj = error instanceof Error ? error : new Error(String(error));
  const sanitizedMessage = sanitizeString(errObj.message || "Unknown error");
  const sanitizedStack = errObj.stack ? sanitizeString(errObj.stack) : undefined;

  const captured: CapturedError = {
    id: `err_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    message: sanitizedMessage,
    stack: sanitizedStack,
    context: Object.fromEntries(
      Object.entries(context).map(([k, v]) => [k, typeof v === "string" ? sanitizeString(v) : v])
    ),
    timestamp: new Date().toISOString(),
    url: typeof window !== "undefined" ? window.location?.pathname : undefined,
  };

  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(ERROR_LOG_STORAGE_KEY);
      const existing: CapturedError[] = raw ? JSON.parse(raw) : [];
      // Keep last 50 client errors
      const updated = [...existing.slice(-49), captured];
      localStorage.setItem(ERROR_LOG_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Ignore
    }
  }

  // Also print cleanly to console in non-production or for CDP observability
  console.error(`[BAC Mastery Monitored Error] ${captured.message}`, captured.context);

  return captured;
}

/**
 * Retrieve captured errors for inspection
 */
export function getCapturedClientErrors(): CapturedError[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(ERROR_LOG_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CapturedError[]) : [];
  } catch {
    return [];
  }
}

/**
 * Clear stored errors
 */
export function clearCapturedClientErrors(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(ERROR_LOG_STORAGE_KEY);
  } catch {
    // Ignore
  }
}
