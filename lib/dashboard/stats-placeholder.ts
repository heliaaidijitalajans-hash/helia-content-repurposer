/** Replace with real aggregates when analytics exist. */
export function getDashboardStatsPlaceholder() {
  return { total: 12, thisMonth: 5 } as const;
}
