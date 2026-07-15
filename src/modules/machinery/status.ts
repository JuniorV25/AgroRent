// Semáforo de estado de la maquinaria -> color, etiqueta y anillo
import type { MachineStatus } from "./types";

export const statusMeta: Record<MachineStatus, { label: string; dot: string; ring: string; text: string; bg: string }> = {
  operativo:      { label: "Operativo",     dot: "bg-emerald-500", ring: "ring-emerald-400/40", text: "text-emerald-700", bg: "bg-emerald-50" },
  mantenimiento:  { label: "Mantenimiento", dot: "bg-amber-500",   ring: "ring-amber-400/40",   text: "text-amber-700",   bg: "bg-amber-50" },
  fuera_servicio: { label: "Fuera de servicio", dot: "bg-orange-700", ring: "ring-orange-700/30", text: "text-orange-800", bg: "bg-orange-50" },
};
