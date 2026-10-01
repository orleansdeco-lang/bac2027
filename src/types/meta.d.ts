export {};

declare global {
  interface Window {
    fbq?: (
      command: "track" | "trackCustom" | "init" | "consent",
      eventNameOrPixelId: string,
      params?: Record<string, unknown>,
      options?: { eventID?: string }
    ) => void;
    _fbq?: unknown;
  }
}
