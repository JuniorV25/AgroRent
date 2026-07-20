// ============================================================================
// Dominio: Proveedores (ficha comercial TraktorRent)
// ============================================================================
import type { District } from "../../core/constants/districts";

export interface Provider {
  id: string;
  companyName: string;      // razón social del proveedor en TraktorRent
  ruc: string;
  verified: boolean;
  district: District;
  rating: number;
  fleetSize: number;
  responseTimeHrs: number;
}
