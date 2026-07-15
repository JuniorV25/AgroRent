import type { MonthlyMetric } from "./types";

// Historial de métricas por proveedor (últimos 6 meses) — panel de métricas
export const monthlyMetrics: Record<string, MonthlyMetric[]> = {
  "prov-4": [
    { month: "Feb", revenue: 18400, jobs: 21, utilization: 62 },
    { month: "Mar", revenue: 21900, jobs: 26, utilization: 68 },
    { month: "Abr", revenue: 19850, jobs: 23, utilization: 64 },
    { month: "May", revenue: 26300, jobs: 31, utilization: 79 },
    { month: "Jun", revenue: 24100, jobs: 28, utilization: 74 },
    { month: "Jul", revenue: 28950, jobs: 34, utilization: 85 },
  ],
};
