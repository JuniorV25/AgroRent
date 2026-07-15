// ============================================================================
// Tarifas reales de referencia (S/ por hora) — basadas en la lista de precios
// del proveedor: por rango de potencia (HP) y por tipo de implemento, según
// el tamaño de la unidad. Se usan para sugerir precios en el formulario del
// proveedor y para poblar el catálogo semilla con valores realistas.
// ============================================================================
import type { ImplementType } from "./types";

export interface HourlyRateRange {
  secaMin: number;
  secaMax: number;
  operadaMin: number;
  operadaMax: number;
}

export interface HpBracket {
  maxHp: number;
  label: string;
  range: HourlyRateRange;
}

// Los dos primeros tramos (≤90 HP y 91-160 HP) derivan directamente de la
// lista de precios real (75 HP, 110 HP y 130-140 HP); los siguientes
// extrapolan la misma progresión para las unidades de mayor potencia del
// catálogo (hasta cosechadoras/articulados de 470+ HP).
export const HP_BRACKETS: HpBracket[] = [
  { maxHp: 90, label: "Chica / frutera (hasta 90 HP)", range: { secaMin: 45, secaMax: 50, operadaMin: 80, operadaMax: 85 } },
  { maxHp: 120, label: "Mediana (91–120 HP)", range: { secaMin: 60, secaMax: 70, operadaMin: 100, operadaMax: 110 } },
  { maxHp: 160, label: "Grande (121–160 HP)", range: { secaMin: 100, secaMax: 110, operadaMin: 120, operadaMax: 130 } },
  { maxHp: 220, label: "Muy grande (161–220 HP)", range: { secaMin: 130, secaMax: 155, operadaMin: 155, operadaMax: 185 } },
  { maxHp: 280, label: "Alta potencia (221–280 HP)", range: { secaMin: 180, secaMax: 215, operadaMin: 215, operadaMax: 255 } },
  { maxHp: 350, label: "Articulada (281–350 HP)", range: { secaMin: 235, secaMax: 275, operadaMin: 275, operadaMax: 320 } },
  { maxHp: Infinity, label: "Cosechadora / articulada grande (351+ HP)", range: { secaMin: 310, secaMax: 370, operadaMin: 370, operadaMax: 440 } },
];

export function rateBracketForHp(hp: number): HpBracket {
  return HP_BRACKETS.find((b) => hp <= b.maxHp) ?? HP_BRACKETS[HP_BRACKETS.length - 1];
}

// Genera un precio determinístico (no aleatorio en cada render) dentro del
// rango sugerido para un HP dado — se usa para poblar el catálogo semilla
// con variedad realista sin tener que escribir 58 precios a mano.
export function seedHourlyRates(hp: number): { pricePerHourSeca: number; pricePerHourOperada: number } {
  const { range } = rateBracketForHp(hp);
  const t = ((hp * 2654435761) % 1000) / 1000; // pseudo-aleatorio determinístico 0..1
  return {
    pricePerHourSeca: Math.round(range.secaMin + (range.secaMax - range.secaMin) * t),
    pricePerHourOperada: Math.round(range.operadaMin + (range.operadaMax - range.operadaMin) * t),
  };
}

// Precios de referencia por implemento (S/ por hora), según el tamaño del
// tractor que lo monta (≤90 HP = tractor chico, >90 HP = tractor grande),
// tal como en la lista real: "PARA TRACTORES CHICOS" vs "TRAC GRANDE".
export const IMPLEMENT_RATES: Record<ImplementType, { small: number; large: number }> = {
  "Fumigadora": { small: 42, large: 55 },
  "Portabín": { small: 35, large: 45 },
  "Grada pequeña": { small: 32, large: 40 },
  "Lampón de nivelación": { small: 32, large: 40 },
  "Carreta": { small: 27, large: 35 },
  "Grada": { small: 45, large: 55 },
  "Arado de discos": { small: 45, large: 60 },
  "Rufa": { small: 55, large: 70 },
  "Guaneadora": { small: 35, large: 50 },
  "Subsolador": { small: 55, large: 75 },
  "Carreta grande": { small: 32, large: 45 },
  "Sembradora": { small: 50, large: 70 },
  "Cargador frontal": { small: 45, large: 65 },
  "Cisterna": { small: 40, large: 60 },
  "Cosechadora": { small: 90, large: 140 },
  "Rastra": { small: 40, large: 55 },
};

export function implementRate(type: ImplementType, hp: number): number {
  const size = hp <= 90 ? "small" : "large";
  return IMPLEMENT_RATES[type][size];
}
