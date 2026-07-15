import type { Field } from "./types";

export const CROPS = ["Espárrago", "Palta", "Arándano", "Caña de azúcar", "Maíz amarillo"] as const;

// ---------------------------------------------------------------------------
// Campos del cliente (CRUD demo)
// ---------------------------------------------------------------------------
export const fields: Field[] = [
  { id: "fld-1", ownerId: "user-cliente", name: "Proyecto Virú",  district: "Virú",   hectares: 120, crop: "Espárrago", soilType: "Franco arenoso", createdAt: "2026-02-11" },
  { id: "fld-2", ownerId: "user-cliente", name: "Campos Laredo",  district: "Laredo", hectares: 65,  crop: "Palta",     soilType: "Franco arcilloso", createdAt: "2026-03-04" },
  { id: "fld-3", ownerId: "user-cliente", name: "Fundo Moche",    district: "Moche",  hectares: 42,  crop: "Arándano",  soilType: "Franco", createdAt: "2026-04-19" },
];
