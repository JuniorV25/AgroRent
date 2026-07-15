// Semáforo de estado de reserva -> color, etiqueta
import type { ReservationStatus } from "./types";

export const reservationStatusMeta: Record<ReservationStatus, { label: string; dot: string; text: string; bg: string }> = {
  borrador:    { label: "Pendiente de confirmación", dot: "bg-slate-400",   text: "text-slate-600",   bg: "bg-slate-50" },
  confirmada:  { label: "Confirmada",                dot: "bg-agua-500",    text: "text-agua-600",    bg: "bg-agua-50" },
  en_curso:    { label: "En curso",                  dot: "bg-amber-500",   text: "text-amber-700",   bg: "bg-amber-50" },
  finalizada:  { label: "Finalizada",                dot: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50" },
  cancelada:   { label: "Cancelada",                 dot: "bg-orange-700",  text: "text-orange-800",  bg: "bg-orange-50" },
};
