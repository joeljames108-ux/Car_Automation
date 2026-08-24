/**
 * Formats a lap time in seconds to mm:ss.sss or ss.sss format.
 * Returns '—' for null, undefined, or non-positive values.
 */
export function formatLap(seconds: number | null | undefined): string {
  if (seconds == null || isNaN(seconds) || seconds <= 0) {
    return "—";
  }
  if (seconds >= 60) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toFixed(3).padStart(6, "0")}`;
  }
  return `${seconds.toFixed(3)}s`;
}
