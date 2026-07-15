// ============================================================================
// Dominio: Alquileres (motor de reservas + chat B2B por reserva)
// ============================================================================
import type { ImplementType, ServiceMode } from "../machinery/types";

export type ReservationStatus =
  | "borrador"      // solicitada por el cliente, esperando confirmación del proveedor
  | "confirmada"    // aceptada por el proveedor
  | "en_curso"      // trabajo en campo iniciado
  | "finalizada"    // servicio completado
  | "cancelada";    // rechazada o cancelada por cualquiera de las partes

export interface Reservation {
  id: string;
  machineId: string;
  fieldId: string;
  clientId: string;
  providerId: string;
  days: number;
  hectares: number;
  serviceMode: ServiceMode;       // "seca" (cliente pone operador y combustible) u "operada" (proveedor incluye todo)
  implementType: ImplementType;   // implemento elegido para el trabajo
  estimatedCost: number;
  contractAccepted: boolean;
  status: ReservationStatus;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Chat B2B por reserva
// ---------------------------------------------------------------------------
export type ChatSender = "cliente" | "proveedor" | "ia";

export interface ChatMessage {
  id: string;
  reservationId: string;
  sender: ChatSender;
  text: string;
  createdAt: string;
}
