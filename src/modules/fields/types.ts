// ============================================================================
// Dominio: Campos del cliente (fundos agrícolas)
// ============================================================================
import type { District } from "../../core/constants/districts";

export type Crop = "Espárrago" | "Palta" | "Arándano" | "Caña de azúcar" | "Maíz amarillo";

export interface Field {
  id: string;
  ownerId: string;
  name: string;
  district: District;
  hectares: number;
  crop: Crop;
  soilType: string;
  createdAt: string;
}
