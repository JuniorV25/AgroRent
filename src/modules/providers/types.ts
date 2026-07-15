// ============================================================================
// Dominio: Proveedores (ficha comercial TractorLink)
// ============================================================================
import type { District } from "../../core/constants/districts";

export interface Provider {
  id: string;
  companyName: string;      // marca comercial TractorLink
  ruc: string;
  verified: boolean;
  district: District;
  rating: number;
  fleetSize: number;
  responseTimeHrs: number;
}
