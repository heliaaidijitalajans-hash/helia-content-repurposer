/**
 * Demo metrics until billing / usage APIs drive the dashboard.
 * Values match product spec; replace with live data when ready.
 */
export function getDashboardStatsPlaceholder(): {
  creditsRemaining: number;
  creditsUsed: number;
  totalOutput: number;
  plan: "free" | "pro";
} {
  return {
    creditsRemaining: 120,
    creditsUsed: 30,
    totalOutput: 18,
    plan: "free",
  };
}
