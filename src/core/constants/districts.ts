// ============================================================================
// Taxonomía geográfica compartida entre módulos de negocio
// (maquinaria, campos, proveedores y usuarios operan todos por distrito)
//
// TraktorRent opera en 2 regiones reales del norte del Perú, elegidas por su
// peso agrícola/agroexportador: La Libertad (origen de la empresa, zona del
// proyecto Chavimochic — Camposol, Virú S.A., Arato Perú, etc.) y Lambayeque
// (valle Chancay-Lambayeque, agroindustria azucarera y el polo agroexportador
// en expansión de Olmos). Cada distrito listado tiene presencia real de
// empresas agrícolas/agroexportadoras y/o chacras y pequeños agricultores
// individuales, para cubrir tanto cuentas "empresa" como "individual".
// ============================================================================

export const REGIONS = ["La Libertad", "Lambayeque"] as const;
export type Region = (typeof REGIONS)[number];

// Provincia -> región a la que pertenece
export const PROVINCES_BY_REGION: Record<Region, string[]> = {
  "La Libertad": ["Trujillo", "Virú", "Ascope", "Pacasmayo"],
  Lambayeque: ["Chiclayo", "Lambayeque", "Ferreñafe"],
};

// Distrito -> provincia a la que pertenece (agrupación real, no exhaustiva:
// se listan los distritos con actividad agrícola relevante en cada provincia)
export const DISTRICTS_BY_PROVINCE: Record<string, string[]> = {
  // --- La Libertad ---
  Trujillo: ["Trujillo", "Moche", "Laredo", "Salaverry", "Huanchaco", "Víctor Larco Herrera"],
  Virú: ["Virú", "Chao", "Guadalupito"],
  Ascope: ["Casa Grande", "Ascope", "Chicama", "Paiján", "Magdalena de Cao"],
  Pacasmayo: ["Pacasmayo", "San Pedro de Lloc", "Guadalupe"],
  // --- Lambayeque ---
  Chiclayo: ["Chiclayo", "Pátapo", "Pucalá", "Pomalca", "Tumán", "Reque"],
  Lambayeque: ["Lambayeque", "Mochumí", "Túcume", "Mórrope", "Olmos"],
  Ferreñafe: ["Ferreñafe", "Pítipo", "Mesones Muro"],
};

// Provincia -> región (derivado, para no repetir la relación a mano)
export const REGION_OF_PROVINCE: Record<string, Region> = Object.fromEntries(
  REGIONS.flatMap((region) => PROVINCES_BY_REGION[region].map((prov) => [prov, region]))
) as Record<string, Region>;

// Distrito -> provincia (derivado)
export const PROVINCE_OF_DISTRICT: Record<string, string> = Object.fromEntries(
  Object.entries(DISTRICTS_BY_PROVINCE).flatMap(([prov, districts]) => districts.map((d) => [d, prov]))
);

// Distrito -> región (derivado, atajo útil para filtros)
export const REGION_OF_DISTRICT: Record<string, Region> = Object.fromEntries(
  Object.entries(PROVINCE_OF_DISTRICT).map(([district, prov]) => [district, REGION_OF_PROVINCE[prov]])
) as Record<string, Region>;

export function regionOfDistrict(district: string): Region | undefined {
  return REGION_OF_DISTRICT[district];
}
export function provinceOfDistrict(district: string): string | undefined {
  return PROVINCE_OF_DISTRICT[district];
}

// Lista plana de todos los distritos (para selects simples y compatibilidad
// con el código existente que solo necesita "un distrito cualquiera").
export const DISTRICTS = Object.values(DISTRICTS_BY_PROVINCE).flat();

// Unión estricta de todos los distritos válidos — se mantiene como tipo (no
// se afloja a `string`) para conservar el chequeo de tipos en formularios,
// pero ahora cubre las 2 regiones en vez de los 4 distritos originales.
export type District = (typeof DISTRICTS)[number];

// Distritos por región, ya en el orden de sus provincias — útil para selects
// agrupados (<optgroup>) en los formularios de búsqueda y registro.
export function districtsByRegion(region: Region): { province: string; districts: string[] }[] {
  return PROVINCES_BY_REGION[region].map((province) => ({ province, districts: DISTRICTS_BY_PROVINCE[province] }));
}
