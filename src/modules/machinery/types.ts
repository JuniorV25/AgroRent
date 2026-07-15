// ============================================================================
// Dominio: Maquinaria (flota agrícola — tractores e implementos)
// ============================================================================
import type { District } from "../../core/constants/districts";

export type MachineStatus = "operativo" | "mantenimiento" | "fuera_servicio";
// operativo -> Verde | mantenimiento -> Amarillo | fuera_servicio -> Terracota

export type Brand = "John Deere" | "Massey Ferguson" | "New Holland" | "Kubota" | "Case IH" | "Valtra";

// Modalidad de servicio elegida por el CLIENTE al reservar (el proveedor no la
// escoge: solo define el precio/hora de cada modalidad para su unidad).
// "seca"    -> el cliente pone el operador y el combustible
// "operada" -> el proveedor incluye operador y combustible
export type ServiceMode = "seca" | "operada";

export type ImplementType =
  | "Arado de discos"
  | "Rastra"
  | "Cosechadora"
  | "Fumigadora"
  | "Sembradora"
  | "Cargador frontal"
  | "Cisterna"
  | "Subsolador"
  | "Portabín"
  | "Grada pequeña"
  | "Grada"
  | "Lampón de nivelación"
  | "Carreta"
  | "Carreta grande"
  | "Rufa"
  | "Guaneadora";

// Implemento que puede montar la unidad, con su propio precio por hora
// (el proveedor define uno o más al crear/editar la ficha del tractor).
export interface MachineImplement {
  type: ImplementType;
  pricePerHour: number; // S/ por hora de uso de este implemento
}

export interface Telemetry {
  hourmeter: number;        // horómetro acumulado (h)
  fuelLevel: number;        // % combustible
  engineTemp: number;       // °C
  nextServiceInHours: number; // horas restantes para mantenimiento preventivo
  activeAlerts: string[];   // alertas activas
}

export interface Machine {
  id: string;
  providerId: string;
  brand: Brand;
  model: string;
  year: number;
  horsepower: number;       // HP
  implements: MachineImplement[]; // implementos disponibles para esta unidad, c/u con su precio/hora
  district: District;
  pricePerHourSeca: number;    // S/ por hora — máquina seca (cliente pone operador y combustible)
  pricePerHourOperada: number; // S/ por hora — máquina operada (proveedor incluye todo)
  status: MachineStatus;
  imageUrl: string;
  rating: number;
  totalJobs: number;
  telemetry: Telemetry;
  specs: {
    transmission: string;
    fuelTank: number;       // litros
    weight: number;         // kg
    tractionType: string;
  };
}
