// ============================================================================
// Taxonomía geográfica compartida entre módulos de negocio
// (maquinaria, campos, proveedores y usuarios operan todos por distrito)
// ============================================================================

export type District = "Moche" | "Virú" | "Laredo" | "Salaverry";

export const DISTRICTS = ["Moche", "Virú", "Laredo", "Salaverry"] as const;
