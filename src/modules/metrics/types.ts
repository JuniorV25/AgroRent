// ============================================================================
// Dominio: Métricas históricas (panel de proveedor)
// ============================================================================
export interface MonthlyMetric {
  month: string;   // "Ene", "Feb"...
  revenue: number; // S/ facturados
  jobs: number;    // trabajos completados
  utilization: number; // % de utilización de flota (0-100)
}
