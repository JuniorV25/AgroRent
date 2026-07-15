// ============================================================================
// Utilidades genéricas de presentación (sin conocimiento de dominio)
// ============================================================================

export const soles = (n: number) =>
  new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN", maximumFractionDigits: 0 }).format(n);

export const uid = (p = "id") => `${p}-${Math.random().toString(36).slice(2, 9)}`;

export const cx = (...parts: (string | false | null | undefined)[]) =>
  parts.filter(Boolean).join(" ");
