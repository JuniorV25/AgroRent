// ============================================================================
// Maquinaria — catálogo semilla (contexto: agricultura de La Libertad, Perú)
// ============================================================================
import type { Machine, ImplementType } from "./types";
import { implementRate, seedHourlyRates } from "./pricing";

// SVG "foto" premium generada inline por marca (evita dependencias de red).
const tractorSvg = (a: string, b: string, accent: string) =>
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
  <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 400'>
    <defs>
      <linearGradient id='sky' x1='0' y1='0' x2='0' y2='1'>
        <stop offset='0' stop-color='${a}'/><stop offset='1' stop-color='${b}'/>
      </linearGradient>
    </defs>
    <rect width='640' height='400' fill='url(#sky)'/>
    <ellipse cx='320' cy='360' rx='300' ry='40' fill='#000' opacity='0.12'/>
    <g transform='translate(140,150)'>
      <rect x='120' y='40' width='150' height='80' rx='12' fill='${accent}'/>
      <rect x='150' y='0' width='90' height='55' rx='10' fill='${accent}' opacity='0.85'/>
      <rect x='160' y='8' width='70' height='40' rx='6' fill='#dbeafe' opacity='0.9'/>
      <circle cx='150' cy='140' r='55' fill='#1f2937'/>
      <circle cx='150' cy='140' r='26' fill='#9ca3af'/>
      <circle cx='260' cy='150' r='38' fill='#1f2937'/>
      <circle cx='260' cy='150' r='16' fill='#9ca3af'/>
      <rect x='95' y='70' width='30' height='40' rx='4' fill='#111827'/>
    </g>
  </svg>`);

export const BRAND_IMG: Record<string, string> = {
  "John Deere": tractorSvg("#bbf7d0", "#4ade80", "#166534"),
  "Massey Ferguson": tractorSvg("#fecaca", "#f87171", "#991b1b"),
  "New Holland": tractorSvg("#bfdbfe", "#60a5fa", "#1e3a8a"),
  Kubota: tractorSvg("#fed7aa", "#fb923c", "#c2410c"),
  "Case IH": tractorSvg("#fecaca", "#ef4444", "#7f1d1d"),
  Valtra: tractorSvg("#fef08a", "#facc15", "#854d0e"),
};

export const BRANDS = ["John Deere", "Massey Ferguson", "New Holland", "Kubota", "Case IH", "Valtra"] as const;
export const IMPLEMENTS: ImplementType[] = [
  "Arado de discos", "Rastra", "Cosechadora", "Fumigadora", "Sembradora",
  "Cargador frontal", "Cisterna", "Subsolador", "Portabín", "Grada pequeña",
  "Grada", "Lampón de nivelación", "Carreta", "Carreta grande", "Rufa", "Guaneadora",
];

// ---------------------------------------------------------------------------
// Fotos reales (Wikimedia Commons, dominio público / licencia libre CC) —
// asignadas por marca y rango de potencia para que cada unidad se vea
// coherente con su modelo real.
// ---------------------------------------------------------------------------
const wm = (file: string) => `https://commons.wikimedia.org/wiki/Special:FilePath/${file}`;

const REAL_PHOTO = {
  jdUtility1: wm("John_Deere_6410_Traktor_HD.JPG"),       // JD serie 6000, ~95-115 HP
  jdUtility2: wm("John_Deere_6800.jpg"),                  // JD serie 6000, ~90-110 HP
  jdRowCrop: wm("John_Deere_8200.jpg"),                   // JD serie 8000, 175-230+ HP
  jdCombine: wm("John_Deere_S660.JPG"),                   // Cosechadora JD serie S
  mfCompact: wm("Massey_Ferguson_3060_tractor.jpg"),      // MF serie 3000, ~60-95 HP
  mfMid: wm("Massey_Ferguson_4345.jpg"),                  // MF serie 4300, ~85-100 HP
  mf6713: wm("Massey_Ferguson_6713_tractor_1.jpg"),       // MF 6713, ~130 HP
  mfLarge: wm("Massey_Ferguson_8470_tractor.jpg"),        // MF 8470, ~270 HP
  mfXLarge: wm("Massey_Ferguson_S_7726_tractor.jpg"),     // MF S 7726, ~270-300 HP
  nhUtility: wm("New_Holland_TD5.110_tractor_3.jpg"),     // NH TD5, ~90-110 HP
  nhMid: wm("New_Holland_T6020_tractor.jpg"),             // NH T6000, ~110-145 HP
  nhLarge: wm("New_Holland_T7.245_(54895979541).jpg"),    // NH T7.245, 245 HP
  nhXLarge: wm("New_Holland_T7.270_blue.jpg"),            // NH T7.270, 270 HP
  nhCombine: wm("New_Holland_CR9060,_Beatrice,_NE.jpg"),  // Cosechadora NH CR9060
  kubSmall: wm("Kubota_Small_Tractor_-_Flickr_-_mick_-_Lumix.jpg"), // Kubota compacto <70 HP
  kubMid: wm("Kubota_M8200_tractor_MD1.jpg"),              // Kubota M8200, ~82 HP
  kubLarge: wm("Kubota_Tractor_M6-142_20200915.jpg"),      // Kubota M6-142, 142 HP
  kubM9000: wm("Kubota_M9000_tractor.jpg"),                // Kubota M9000, ~90-95 HP
  cihCompact: wm("Case_IH_JX95_tractor_(18867911078).jpg"), // Case IH JX95, 95 HP
  cihMid: wm("Case_IH_MAXXUM_140_tractor.jpg"),            // Case IH Maxxum 140, 140 HP
  cihLarge: wm("Case_IH_Magnum_275.jpg"),                  // Case IH Magnum 275, 275 HP
  cihXLarge: wm("IMG_7675_Case_IH_Steiger_485_Tractor.jpg"), // Case IH Steiger 485, 485 HP 4WD articulado
  valMid: wm("Valtra_N101_tractor_with_Kverneland_LD_100_plough.jpg"), // Valtra N101, 101 HP
  valLarge: wm("Valtra_T171_tractor.jpg"),                 // Valtra T171, 171 HP
  valXLarge: wm("Valtra_S_Series_tractor.jpg"),            // Valtra serie S, 270-400+ HP
};

// ---------------------------------------------------------------------------
// Flota — potencias e implementos coherentes con agricultura real. Los datos
// "crudos" siguen declarando un único `implement` y no llevan precio: el
// precio/hora (seca y operada) y el implemento con su tarifa se derivan
// automáticamente más abajo con `seedHourlyRates` / `implementRate`, según
// la tabla real de tarifas por HP (`src/modules/machinery/pricing.ts`).
// ---------------------------------------------------------------------------
type RawMachineSeed = Omit<Machine, "implements" | "pricePerHourSeca" | "pricePerHourOperada"> & {
  implement: ImplementType;
  // Precios "crudos" heredados del dataset anterior (por día / hectárea) —
  // ya no se usan: se ignoran al derivar el precio real por hora más abajo.
  pricePerDay: number;
  pricePerHectare: number;
};

const RAW_MACHINES: RawMachineSeed[] = [
  {
    id: "mac-1", providerId: "prov-1", brand: "John Deere", model: "6110M", year: 2022,
    horsepower: 110, implement: "Arado de discos", district: "Virú",
    pricePerDay: 850, pricePerHectare: 190, status: "operativo",
    imageUrl: BRAND_IMG["John Deere"], rating: 4.9, totalJobs: 214,
    telemetry: { hourmeter: 3120, fuelLevel: 78, engineTemp: 89, nextServiceInHours: 80, activeAlerts: [] },
    specs: { transmission: "PowrQuad Plus 20/20", fuelTank: 250, weight: 4800, tractionType: "4WD" },
  },
  {
    id: "mac-2", providerId: "prov-1", brand: "New Holland", model: "T7.245", year: 2021,
    horsepower: 245, implement: "Subsolador", district: "Virú",
    pricePerDay: 1650, pricePerHectare: 260, status: "operativo",
    imageUrl: BRAND_IMG["New Holland"], rating: 4.7, totalJobs: 168,
    telemetry: { hourmeter: 5240, fuelLevel: 41, engineTemp: 93, nextServiceInHours: 22, activeAlerts: ["Filtro de aire al 70%"] },
    specs: { transmission: "Auto Command CVT", fuelTank: 470, weight: 7200, tractionType: "4WD" },
  },
  {
    id: "mac-3", providerId: "prov-2", brand: "Massey Ferguson", model: "MF 4707", year: 2020,
    horsepower: 75, implement: "Fumigadora", district: "Moche",
    pricePerDay: 560, pricePerHectare: 120, status: "mantenimiento",
    imageUrl: BRAND_IMG["Massey Ferguson"], rating: 4.4, totalJobs: 302,
    telemetry: { hourmeter: 6890, fuelLevel: 15, engineTemp: 78, nextServiceInHours: 6, activeAlerts: ["Cambio de aceite pendiente", "Nivel de combustible bajo"] },
    specs: { transmission: "8x8 Sincronizada", fuelTank: 110, weight: 2900, tractionType: "4WD" },
  },
  {
    id: "mac-4", providerId: "prov-2", brand: "Kubota", model: "M7-172", year: 2023,
    horsepower: 172, implement: "Sembradora", district: "Moche",
    pricePerDay: 1280, pricePerHectare: 210, status: "operativo",
    imageUrl: BRAND_IMG["Kubota"], rating: 4.8, totalJobs: 97,
    telemetry: { hourmeter: 1450, fuelLevel: 92, engineTemp: 85, nextServiceInHours: 150, activeAlerts: [] },
    specs: { transmission: "K-VT Continua", fuelTank: 330, weight: 6100, tractionType: "4WD" },
  },
  {
    id: "mac-5", providerId: "prov-3", brand: "John Deere", model: "S770", year: 2019,
    horsepower: 473, implement: "Cosechadora", district: "Laredo",
    pricePerDay: 3200, pricePerHectare: 340, status: "operativo",
    imageUrl: BRAND_IMG["John Deere"], rating: 4.6, totalJobs: 143,
    telemetry: { hourmeter: 4110, fuelLevel: 63, engineTemp: 96, nextServiceInHours: 45, activeAlerts: ["Presión hidráulica variable"] },
    specs: { transmission: "ProDrive 40 km/h", fuelTank: 1250, weight: 15800, tractionType: "2WD" },
  },
  {
    id: "mac-6", providerId: "prov-4", brand: "New Holland", model: "TD5.90", year: 2022,
    horsepower: 90, implement: "Rastra", district: "Salaverry",
    pricePerDay: 690, pricePerHectare: 145, status: "operativo",
    imageUrl: BRAND_IMG["New Holland"], rating: 4.5, totalJobs: 188,
    telemetry: { hourmeter: 2760, fuelLevel: 55, engineTemp: 87, nextServiceInHours: 95, activeAlerts: [] },
    specs: { transmission: "Synchro Shuttle 12x12", fuelTank: 130, weight: 3400, tractionType: "4WD" },
  },
  {
    id: "mac-7", providerId: "prov-4", brand: "Massey Ferguson", model: "MF 7724", year: 2021,
    horsepower: 240, implement: "Cargador frontal", district: "Salaverry",
    pricePerDay: 1580, pricePerHectare: 250, status: "fuera_servicio",
    imageUrl: BRAND_IMG["Massey Ferguson"], rating: 4.3, totalJobs: 121,
    telemetry: { hourmeter: 8320, fuelLevel: 8, engineTemp: 74, nextServiceInHours: 0, activeAlerts: ["Falla en sensor de embrague", "Mantenimiento correctivo requerido"] },
    specs: { transmission: "Dyna-6 24x24", fuelTank: 400, weight: 7800, tractionType: "4WD" },
  },
  {
    id: "mac-8", providerId: "prov-4", brand: "Kubota", model: "M5-111", year: 2023,
    horsepower: 111, implement: "Cisterna", district: "Salaverry",
    pricePerDay: 780, pricePerHectare: 160, status: "operativo",
    imageUrl: BRAND_IMG["Kubota"], rating: 4.7, totalJobs: 64,
    telemetry: { hourmeter: 980, fuelLevel: 84, engineTemp: 82, nextServiceInHours: 170, activeAlerts: [] },
    specs: { transmission: "36x36 Hi-Lo", fuelTank: 175, weight: 4200, tractionType: "4WD" },
  },

  // ==========================================================================
  // Flota ampliada — 5 proveedores nuevos (10 unidades c/u), fotos reales de
  // Wikimedia Commons asignadas por marca/rango de potencia.
  // ==========================================================================

  // --- prov-5 · SERTMAC S.A.C. (Laredo) — flota 100% John Deere ---
  {
    id: "mac-9", providerId: "prov-5", brand: "John Deere", model: "5075E", year: 2023,
    horsepower: 75, implement: "Arado de discos", district: "Laredo",
    pricePerDay: 470, pricePerHectare: 105, status: "operativo",
    imageUrl: REAL_PHOTO.jdUtility1, rating: 4.7, totalJobs: 58,
    telemetry: { hourmeter: 620, fuelLevel: 88, engineTemp: 82, nextServiceInHours: 210, activeAlerts: [] },
    specs: { transmission: "PowrReverser 12x12", fuelTank: 87, weight: 3300, tractionType: "4WD" },
  },
  {
    id: "mac-10", providerId: "prov-5", brand: "John Deere", model: "5090E", year: 2023,
    horsepower: 90, implement: "Rastra", district: "Laredo",
    pricePerDay: 560, pricePerHectare: 120, status: "operativo",
    imageUrl: REAL_PHOTO.jdUtility2, rating: 4.6, totalJobs: 74,
    telemetry: { hourmeter: 890, fuelLevel: 71, engineTemp: 85, nextServiceInHours: 160, activeAlerts: [] },
    specs: { transmission: "PowrReverser 12x12", fuelTank: 87, weight: 3450, tractionType: "4WD" },
  },
  {
    id: "mac-11", providerId: "prov-5", brand: "John Deere", model: "6110M", year: 2022,
    horsepower: 110, implement: "Sembradora", district: "Laredo",
    pricePerDay: 830, pricePerHectare: 185, status: "operativo",
    imageUrl: REAL_PHOTO.jdUtility1, rating: 4.8, totalJobs: 132,
    telemetry: { hourmeter: 2340, fuelLevel: 65, engineTemp: 88, nextServiceInHours: 90, activeAlerts: [] },
    specs: { transmission: "PowrQuad Plus 20/20", fuelTank: 250, weight: 4800, tractionType: "4WD" },
  },
  {
    id: "mac-12", providerId: "prov-5", brand: "John Deere", model: "6130M", year: 2021,
    horsepower: 130, implement: "Fumigadora", district: "Laredo",
    pricePerDay: 960, pricePerHectare: 205, status: "mantenimiento",
    imageUrl: REAL_PHOTO.jdUtility2, rating: 4.4, totalJobs: 201,
    telemetry: { hourmeter: 5410, fuelLevel: 22, engineTemp: 79, nextServiceInHours: 8, activeAlerts: ["Cambio de aceite pendiente"] },
    specs: { transmission: "PowrQuad Plus 20/20", fuelTank: 250, weight: 5000, tractionType: "4WD" },
  },
  {
    id: "mac-13", providerId: "prov-5", brand: "John Deere", model: "6155M", year: 2022,
    horsepower: 155, implement: "Cargador frontal", district: "Laredo",
    pricePerDay: 1140, pricePerHectare: 220, status: "operativo",
    imageUrl: REAL_PHOTO.jdRowCrop, rating: 4.7, totalJobs: 96,
    telemetry: { hourmeter: 1680, fuelLevel: 80, engineTemp: 86, nextServiceInHours: 140, activeAlerts: [] },
    specs: { transmission: "AutoQuad Plus 20/20", fuelTank: 280, weight: 5400, tractionType: "4WD" },
  },
  {
    id: "mac-14", providerId: "prov-5", brand: "John Deere", model: "6195M", year: 2023,
    horsepower: 195, implement: "Subsolador", district: "Laredo",
    pricePerDay: 1420, pricePerHectare: 240, status: "operativo",
    imageUrl: REAL_PHOTO.jdRowCrop, rating: 4.9, totalJobs: 41,
    telemetry: { hourmeter: 410, fuelLevel: 95, engineTemp: 83, nextServiceInHours: 240, activeAlerts: [] },
    specs: { transmission: "AutoQuad Plus 20/20", fuelTank: 280, weight: 5900, tractionType: "4WD" },
  },
  {
    id: "mac-15", providerId: "prov-5", brand: "John Deere", model: "7230R", year: 2021,
    horsepower: 230, implement: "Arado de discos", district: "Laredo",
    pricePerDay: 1720, pricePerHectare: 260, status: "operativo",
    imageUrl: REAL_PHOTO.jdRowCrop, rating: 4.6, totalJobs: 178,
    telemetry: { hourmeter: 4890, fuelLevel: 48, engineTemp: 91, nextServiceInHours: 30, activeAlerts: [] },
    specs: { transmission: "AutoPowr IVT", fuelTank: 415, weight: 8200, tractionType: "4WD" },
  },
  {
    id: "mac-16", providerId: "prov-5", brand: "John Deere", model: "8245R", year: 2020,
    horsepower: 245, implement: "Rastra", district: "Laredo",
    pricePerDay: 1880, pricePerHectare: 275, status: "operativo",
    imageUrl: REAL_PHOTO.jdRowCrop, rating: 4.5, totalJobs: 233,
    telemetry: { hourmeter: 6720, fuelLevel: 36, engineTemp: 94, nextServiceInHours: 12, activeAlerts: ["Presión hidráulica variable"] },
    specs: { transmission: "e23 PowerShift", fuelTank: 662, weight: 11000, tractionType: "4WD" },
  },
  {
    id: "mac-17", providerId: "prov-5", brand: "John Deere", model: "8310R", year: 2019,
    horsepower: 310, implement: "Cisterna", district: "Laredo",
    pricePerDay: 2380, pricePerHectare: 300, status: "fuera_servicio",
    imageUrl: REAL_PHOTO.jdRowCrop, rating: 4.2, totalJobs: 289,
    telemetry: { hourmeter: 9150, fuelLevel: 5, engineTemp: 71, nextServiceInHours: 0, activeAlerts: ["Falla en sensor de embrague", "Mantenimiento correctivo requerido"] },
    specs: { transmission: "e23 PowerShift", fuelTank: 662, weight: 11500, tractionType: "4WD" },
  },
  {
    id: "mac-18", providerId: "prov-5", brand: "John Deere", model: "S770", year: 2020,
    horsepower: 473, implement: "Cosechadora", district: "Laredo",
    pricePerDay: 3150, pricePerHectare: 335, status: "operativo",
    imageUrl: REAL_PHOTO.jdCombine, rating: 4.8, totalJobs: 112,
    telemetry: { hourmeter: 2980, fuelLevel: 70, engineTemp: 90, nextServiceInHours: 60, activeAlerts: [] },
    specs: { transmission: "ProDrive 40 km/h", fuelTank: 1250, weight: 15800, tractionType: "2WD" },
  },

  // --- prov-6 · TerraFuerza Maquinarias S.A.C. (Virú) ---
  {
    id: "mac-19", providerId: "prov-6", brand: "Massey Ferguson", model: "MF 3706", year: 2022,
    horsepower: 75, implement: "Arado de discos", district: "Virú",
    pricePerDay: 460, pricePerHectare: 105, status: "operativo",
    imageUrl: REAL_PHOTO.mfCompact, rating: 4.5, totalJobs: 87,
    telemetry: { hourmeter: 1320, fuelLevel: 76, engineTemp: 84, nextServiceInHours: 120, activeAlerts: [] },
    specs: { transmission: "Dyna-4 16x16", fuelTank: 120, weight: 3600, tractionType: "4WD" },
  },
  {
    id: "mac-20", providerId: "prov-6", brand: "Massey Ferguson", model: "MF 6713", year: 2021,
    horsepower: 130, implement: "Sembradora", district: "Virú",
    pricePerDay: 970, pricePerHectare: 200, status: "operativo",
    imageUrl: REAL_PHOTO.mf6713, rating: 4.6, totalJobs: 154,
    telemetry: { hourmeter: 3450, fuelLevel: 58, engineTemp: 87, nextServiceInHours: 75, activeAlerts: [] },
    specs: { transmission: "Dyna-6 24x24", fuelTank: 300, weight: 5600, tractionType: "4WD" },
  },
  {
    id: "mac-21", providerId: "prov-6", brand: "New Holland", model: "TD5.90", year: 2022,
    horsepower: 90, implement: "Rastra", district: "Virú",
    pricePerDay: 690, pricePerHectare: 145, status: "operativo",
    imageUrl: REAL_PHOTO.nhUtility, rating: 4.5, totalJobs: 102,
    telemetry: { hourmeter: 1980, fuelLevel: 66, engineTemp: 85, nextServiceInHours: 110, activeAlerts: [] },
    specs: { transmission: "Synchro Shuttle 12x12", fuelTank: 130, weight: 3400, tractionType: "4WD" },
  },
  {
    id: "mac-22", providerId: "prov-6", brand: "New Holland", model: "T6.145", year: 2023,
    horsepower: 145, implement: "Fumigadora", district: "Virú",
    pricePerDay: 1080, pricePerHectare: 215, status: "operativo",
    imageUrl: REAL_PHOTO.nhMid, rating: 4.8, totalJobs: 39,
    telemetry: { hourmeter: 380, fuelLevel: 92, engineTemp: 81, nextServiceInHours: 230, activeAlerts: [] },
    specs: { transmission: "Electro Command 24x24", fuelTank: 190, weight: 5800, tractionType: "4WD" },
  },
  {
    id: "mac-23", providerId: "prov-6", brand: "Kubota", model: "M7060", year: 2022,
    horsepower: 71, implement: "Cisterna", district: "Virú",
    pricePerDay: 520, pricePerHectare: 115, status: "operativo",
    imageUrl: REAL_PHOTO.kubSmall, rating: 4.6, totalJobs: 118,
    telemetry: { hourmeter: 2260, fuelLevel: 59, engineTemp: 83, nextServiceInHours: 100, activeAlerts: [] },
    specs: { transmission: "Hydrostatic HST+", fuelTank: 92, weight: 3100, tractionType: "4WD" },
  },
  {
    id: "mac-24", providerId: "prov-6", brand: "Kubota", model: "M7-172", year: 2023,
    horsepower: 172, implement: "Subsolador", district: "Virú",
    pricePerDay: 1280, pricePerHectare: 210, status: "operativo",
    imageUrl: REAL_PHOTO.kubLarge, rating: 4.9, totalJobs: 22,
    telemetry: { hourmeter: 190, fuelLevel: 97, engineTemp: 80, nextServiceInHours: 245, activeAlerts: [] },
    specs: { transmission: "K-VT Continua", fuelTank: 330, weight: 6100, tractionType: "4WD" },
  },
  {
    id: "mac-25", providerId: "prov-6", brand: "Case IH", model: "Farmall JX95", year: 2021,
    horsepower: 95, implement: "Cargador frontal", district: "Virú",
    pricePerDay: 640, pricePerHectare: 140, status: "operativo",
    imageUrl: REAL_PHOTO.cihCompact, rating: 4.4, totalJobs: 167,
    telemetry: { hourmeter: 4120, fuelLevel: 44, engineTemp: 88, nextServiceInHours: 35, activeAlerts: [] },
    specs: { transmission: "12x12 Sincronizada", fuelTank: 150, weight: 3800, tractionType: "4WD" },
  },
  {
    id: "mac-26", providerId: "prov-6", brand: "Case IH", model: "Maxxum 140", year: 2022,
    horsepower: 140, implement: "Arado de discos", district: "Virú",
    pricePerDay: 1020, pricePerHectare: 205, status: "mantenimiento",
    imageUrl: REAL_PHOTO.cihMid, rating: 4.3, totalJobs: 205,
    telemetry: { hourmeter: 5680, fuelLevel: 18, engineTemp: 77, nextServiceInHours: 4, activeAlerts: ["Nivel de combustible bajo"] },
    specs: { transmission: "Powershift 19x6", fuelTank: 285, weight: 6300, tractionType: "4WD" },
  },
  {
    id: "mac-27", providerId: "prov-6", brand: "Case IH", model: "Magnum 275", year: 2020,
    horsepower: 275, implement: "Rastra", district: "Virú",
    pricePerDay: 2050, pricePerHectare: 285, status: "operativo",
    imageUrl: REAL_PHOTO.cihLarge, rating: 4.7, totalJobs: 148,
    telemetry: { hourmeter: 3980, fuelLevel: 62, engineTemp: 89, nextServiceInHours: 55, activeAlerts: [] },
    specs: { transmission: "Full Powershift 19x6", fuelTank: 545, weight: 11200, tractionType: "4WD" },
  },
  {
    id: "mac-28", providerId: "prov-6", brand: "Valtra", model: "T171", year: 2023,
    horsepower: 171, implement: "Sembradora", district: "Virú",
    pricePerDay: 1260, pricePerHectare: 225, status: "operativo",
    imageUrl: REAL_PHOTO.valLarge, rating: 4.8, totalJobs: 51,
    telemetry: { hourmeter: 610, fuelLevel: 85, engineTemp: 82, nextServiceInHours: 190, activeAlerts: [] },
    specs: { transmission: "Direct Powershift", fuelTank: 380, weight: 7400, tractionType: "4WD" },
  },

  // --- prov-7 · AgroPotencia del Norte E.I.R.L. (Moche) ---
  {
    id: "mac-29", providerId: "prov-7", brand: "John Deere", model: "5090E", year: 2022,
    horsepower: 90, implement: "Rastra", district: "Moche",
    pricePerDay: 560, pricePerHectare: 120, status: "operativo",
    imageUrl: REAL_PHOTO.jdUtility1, rating: 4.6, totalJobs: 95,
    telemetry: { hourmeter: 2010, fuelLevel: 69, engineTemp: 85, nextServiceInHours: 105, activeAlerts: [] },
    specs: { transmission: "PowrReverser 12x12", fuelTank: 87, weight: 3450, tractionType: "4WD" },
  },
  {
    id: "mac-30", providerId: "prov-7", brand: "John Deere", model: "6120M", year: 2021,
    horsepower: 120, implement: "Fumigadora", district: "Moche",
    pricePerDay: 890, pricePerHectare: 195, status: "operativo",
    imageUrl: REAL_PHOTO.jdUtility2, rating: 4.5, totalJobs: 176,
    telemetry: { hourmeter: 4560, fuelLevel: 40, engineTemp: 90, nextServiceInHours: 25, activeAlerts: [] },
    specs: { transmission: "PowrQuad Plus 20/20", fuelTank: 250, weight: 4900, tractionType: "4WD" },
  },
  {
    id: "mac-31", providerId: "prov-7", brand: "Massey Ferguson", model: "MF 4707", year: 2020,
    horsepower: 85, implement: "Arado de discos", district: "Moche",
    pricePerDay: 600, pricePerHectare: 130, status: "operativo",
    imageUrl: REAL_PHOTO.mfMid, rating: 4.4, totalJobs: 224,
    telemetry: { hourmeter: 6210, fuelLevel: 30, engineTemp: 86, nextServiceInHours: 15, activeAlerts: [] },
    specs: { transmission: "Dyna-4 16x16", fuelTank: 130, weight: 3900, tractionType: "4WD" },
  },
  {
    id: "mac-32", providerId: "prov-7", brand: "Massey Ferguson", model: "MF 8470", year: 2022,
    horsepower: 270, implement: "Cargador frontal", district: "Moche",
    pricePerDay: 2020, pricePerHectare: 280, status: "operativo",
    imageUrl: REAL_PHOTO.mfLarge, rating: 4.8, totalJobs: 62,
    telemetry: { hourmeter: 1120, fuelLevel: 82, engineTemp: 88, nextServiceInHours: 150, activeAlerts: [] },
    specs: { transmission: "Dyna-VT CVT", fuelTank: 480, weight: 8900, tractionType: "4WD" },
  },
  {
    id: "mac-33", providerId: "prov-7", brand: "New Holland", model: "T7.245", year: 2022,
    horsepower: 245, implement: "Subsolador", district: "Moche",
    pricePerDay: 1650, pricePerHectare: 260, status: "operativo",
    imageUrl: REAL_PHOTO.nhLarge, rating: 4.7, totalJobs: 141,
    telemetry: { hourmeter: 3760, fuelLevel: 53, engineTemp: 91, nextServiceInHours: 45, activeAlerts: [] },
    specs: { transmission: "Auto Command CVT", fuelTank: 470, weight: 7200, tractionType: "4WD" },
  },
  {
    id: "mac-34", providerId: "prov-7", brand: "New Holland", model: "T7.270", year: 2023,
    horsepower: 270, implement: "Cisterna", district: "Moche",
    pricePerDay: 1820, pricePerHectare: 270, status: "operativo",
    imageUrl: REAL_PHOTO.nhXLarge, rating: 4.9, totalJobs: 33,
    telemetry: { hourmeter: 290, fuelLevel: 96, engineTemp: 80, nextServiceInHours: 245, activeAlerts: [] },
    specs: { transmission: "Auto Command CVT", fuelTank: 470, weight: 7500, tractionType: "4WD" },
  },
  {
    id: "mac-35", providerId: "prov-7", brand: "Kubota", model: "M6-142", year: 2021,
    horsepower: 142, implement: "Sembradora", district: "Moche",
    pricePerDay: 1050, pricePerHectare: 205, status: "mantenimiento",
    imageUrl: REAL_PHOTO.kubLarge, rating: 4.3, totalJobs: 197,
    telemetry: { hourmeter: 5340, fuelLevel: 20, engineTemp: 78, nextServiceInHours: 6, activeAlerts: ["Cambio de aceite pendiente"] },
    specs: { transmission: "Powershift 24x24", fuelTank: 260, weight: 5700, tractionType: "4WD" },
  },
  {
    id: "mac-36", providerId: "prov-7", brand: "Kubota", model: "M9000", year: 2022,
    horsepower: 95, implement: "Rastra", district: "Moche",
    pricePerDay: 660, pricePerHectare: 145, status: "operativo",
    imageUrl: REAL_PHOTO.kubM9000, rating: 4.6, totalJobs: 108,
    telemetry: { hourmeter: 2450, fuelLevel: 62, engineTemp: 85, nextServiceInHours: 95, activeAlerts: [] },
    specs: { transmission: "Powershift 16x16", fuelTank: 175, weight: 4600, tractionType: "4WD" },
  },
  {
    id: "mac-37", providerId: "prov-7", brand: "Valtra", model: "N101", year: 2023,
    horsepower: 101, implement: "Arado de discos", district: "Moche",
    pricePerDay: 760, pricePerHectare: 160, status: "operativo",
    imageUrl: REAL_PHOTO.valMid, rating: 4.8, totalJobs: 47,
    telemetry: { hourmeter: 540, fuelLevel: 88, engineTemp: 82, nextServiceInHours: 200, activeAlerts: [] },
    specs: { transmission: "HiTech 24x24", fuelTank: 200, weight: 5100, tractionType: "4WD" },
  },
  {
    id: "mac-38", providerId: "prov-7", brand: "Case IH", model: "Steiger 485", year: 2019,
    horsepower: 485, implement: "Subsolador", district: "Moche",
    pricePerDay: 3400, pricePerHectare: 350, status: "operativo",
    imageUrl: REAL_PHOTO.cihXLarge, rating: 4.6, totalJobs: 163,
    telemetry: { hourmeter: 4780, fuelLevel: 55, engineTemp: 93, nextServiceInHours: 40, activeAlerts: ["Presión hidráulica variable"] },
    specs: { transmission: "PowerDrive 16x2", fuelTank: 984, weight: 19500, tractionType: "4WD" },
  },

  // --- prov-8 · Motoagro Perú S.A.C. (Salaverry) ---
  {
    id: "mac-39", providerId: "prov-8", brand: "John Deere", model: "6155M", year: 2022,
    horsepower: 155, implement: "Sembradora", district: "Salaverry",
    pricePerDay: 1140, pricePerHectare: 220, status: "operativo",
    imageUrl: REAL_PHOTO.jdUtility2, rating: 4.7, totalJobs: 89,
    telemetry: { hourmeter: 1750, fuelLevel: 74, engineTemp: 86, nextServiceInHours: 130, activeAlerts: [] },
    specs: { transmission: "AutoQuad Plus 20/20", fuelTank: 280, weight: 5400, tractionType: "4WD" },
  },
  {
    id: "mac-40", providerId: "prov-8", brand: "John Deere", model: "7230R", year: 2020,
    horsepower: 230, implement: "Rastra", district: "Salaverry",
    pricePerDay: 1720, pricePerHectare: 260, status: "operativo",
    imageUrl: REAL_PHOTO.jdRowCrop, rating: 4.5, totalJobs: 199,
    telemetry: { hourmeter: 5980, fuelLevel: 34, engineTemp: 92, nextServiceInHours: 18, activeAlerts: [] },
    specs: { transmission: "AutoPowr IVT", fuelTank: 415, weight: 8200, tractionType: "4WD" },
  },
  {
    id: "mac-41", providerId: "prov-8", brand: "Massey Ferguson", model: "MF 3060", year: 2023,
    horsepower: 75, implement: "Cisterna", district: "Salaverry",
    pricePerDay: 470, pricePerHectare: 108, status: "operativo",
    imageUrl: REAL_PHOTO.mfCompact, rating: 4.6, totalJobs: 63,
    telemetry: { hourmeter: 830, fuelLevel: 79, engineTemp: 83, nextServiceInHours: 170, activeAlerts: [] },
    specs: { transmission: "8x8 Sincronizada", fuelTank: 110, weight: 2900, tractionType: "4WD" },
  },
  {
    id: "mac-42", providerId: "prov-8", brand: "Massey Ferguson", model: "MF S 7726", year: 2023,
    horsepower: 300, implement: "Cargador frontal", district: "Salaverry",
    pricePerDay: 2280, pricePerHectare: 290, status: "operativo",
    imageUrl: REAL_PHOTO.mfXLarge, rating: 4.9, totalJobs: 18,
    telemetry: { hourmeter: 140, fuelLevel: 98, engineTemp: 79, nextServiceInHours: 248, activeAlerts: [] },
    specs: { transmission: "Dyna-VT CVT", fuelTank: 570, weight: 10200, tractionType: "4WD" },
  },
  {
    id: "mac-43", providerId: "prov-8", brand: "New Holland", model: "TD5.110", year: 2022,
    horsepower: 110, implement: "Fumigadora", district: "Salaverry",
    pricePerDay: 820, pricePerHectare: 175, status: "operativo",
    imageUrl: REAL_PHOTO.nhUtility, rating: 4.5, totalJobs: 121,
    telemetry: { hourmeter: 2870, fuelLevel: 51, engineTemp: 87, nextServiceInHours: 80, activeAlerts: [] },
    specs: { transmission: "Synchro Shuttle 12x12", fuelTank: 130, weight: 3600, tractionType: "4WD" },
  },
  {
    id: "mac-44", providerId: "prov-8", brand: "New Holland", model: "CR9060", year: 2019,
    horsepower: 473, implement: "Cosechadora", district: "Salaverry",
    pricePerDay: 3100, pricePerHectare: 330, status: "operativo",
    imageUrl: REAL_PHOTO.nhCombine, rating: 4.6, totalJobs: 156,
    telemetry: { hourmeter: 4230, fuelLevel: 47, engineTemp: 92, nextServiceInHours: 38, activeAlerts: [] },
    specs: { transmission: "Twin Rotor CR", fuelTank: 1100, weight: 16700, tractionType: "2WD" },
  },
  {
    id: "mac-45", providerId: "prov-8", brand: "Kubota", model: "M7060", year: 2021,
    horsepower: 71, implement: "Arado de discos", district: "Salaverry",
    pricePerDay: 520, pricePerHectare: 115, status: "fuera_servicio",
    imageUrl: REAL_PHOTO.kubSmall, rating: 4.1, totalJobs: 267,
    telemetry: { hourmeter: 8890, fuelLevel: 3, engineTemp: 70, nextServiceInHours: 0, activeAlerts: ["Falla en sensor de embrague", "Mantenimiento correctivo requerido"] },
    specs: { transmission: "Hydrostatic HST+", fuelTank: 92, weight: 3100, tractionType: "4WD" },
  },
  {
    id: "mac-46", providerId: "prov-8", brand: "Kubota", model: "M8200", year: 2022,
    horsepower: 82, implement: "Rastra", district: "Salaverry",
    pricePerDay: 600, pricePerHectare: 130, status: "operativo",
    imageUrl: REAL_PHOTO.kubMid, rating: 4.7, totalJobs: 92,
    telemetry: { hourmeter: 1560, fuelLevel: 77, engineTemp: 84, nextServiceInHours: 135, activeAlerts: [] },
    specs: { transmission: "Glide Shift 8x8", fuelTank: 155, weight: 4300, tractionType: "4WD" },
  },
  {
    id: "mac-47", providerId: "prov-8", brand: "Case IH", model: "Farmall JX95", year: 2022,
    horsepower: 95, implement: "Sembradora", district: "Salaverry",
    pricePerDay: 640, pricePerHectare: 140, status: "operativo",
    imageUrl: REAL_PHOTO.cihCompact, rating: 4.5, totalJobs: 84,
    telemetry: { hourmeter: 1240, fuelLevel: 68, engineTemp: 84, nextServiceInHours: 115, activeAlerts: [] },
    specs: { transmission: "12x12 Sincronizada", fuelTank: 150, weight: 3800, tractionType: "4WD" },
  },
  {
    id: "mac-48", providerId: "prov-8", brand: "Valtra", model: "S294", year: 2023,
    horsepower: 294, implement: "Subsolador", district: "Salaverry",
    pricePerDay: 2200, pricePerHectare: 285, status: "operativo",
    imageUrl: REAL_PHOTO.valXLarge, rating: 4.8, totalJobs: 29,
    telemetry: { hourmeter: 320, fuelLevel: 91, engineTemp: 81, nextServiceInHours: 220, activeAlerts: [] },
    specs: { transmission: "Versu CVT", fuelTank: 620, weight: 11500, tractionType: "4WD" },
  },

  // --- prov-9 · Norte Tracción Industrial S.A.C. (Virú) ---
  {
    id: "mac-49", providerId: "prov-9", brand: "John Deere", model: "5075E", year: 2022,
    horsepower: 75, implement: "Rastra", district: "Virú",
    pricePerDay: 470, pricePerHectare: 105, status: "operativo",
    imageUrl: REAL_PHOTO.jdUtility1, rating: 4.5, totalJobs: 101,
    telemetry: { hourmeter: 2190, fuelLevel: 60, engineTemp: 85, nextServiceInHours: 100, activeAlerts: [] },
    specs: { transmission: "PowrReverser 12x12", fuelTank: 87, weight: 3300, tractionType: "4WD" },
  },
  {
    id: "mac-50", providerId: "prov-9", brand: "John Deere", model: "6130M", year: 2021,
    horsepower: 130, implement: "Cisterna", district: "Virú",
    pricePerDay: 960, pricePerHectare: 205, status: "operativo",
    imageUrl: REAL_PHOTO.jdUtility2, rating: 4.6, totalJobs: 143,
    telemetry: { hourmeter: 3670, fuelLevel: 55, engineTemp: 88, nextServiceInHours: 65, activeAlerts: [] },
    specs: { transmission: "PowrQuad Plus 20/20", fuelTank: 250, weight: 5000, tractionType: "4WD" },
  },
  {
    id: "mac-51", providerId: "prov-9", brand: "Massey Ferguson", model: "MF 4345", year: 2020,
    horsepower: 100, implement: "Fumigadora", district: "Virú",
    pricePerDay: 740, pricePerHectare: 165, status: "mantenimiento",
    imageUrl: REAL_PHOTO.mfMid, rating: 4.3, totalJobs: 218,
    telemetry: { hourmeter: 6540, fuelLevel: 12, engineTemp: 76, nextServiceInHours: 3, activeAlerts: ["Nivel de combustible bajo"] },
    specs: { transmission: "12x12 Sincronizada", fuelTank: 140, weight: 4100, tractionType: "4WD" },
  },
  {
    id: "mac-52", providerId: "prov-9", brand: "Massey Ferguson", model: "MF 6713", year: 2022,
    horsepower: 130, implement: "Cargador frontal", district: "Virú",
    pricePerDay: 970, pricePerHectare: 200, status: "operativo",
    imageUrl: REAL_PHOTO.mf6713, rating: 4.7, totalJobs: 77,
    telemetry: { hourmeter: 1340, fuelLevel: 81, engineTemp: 86, nextServiceInHours: 145, activeAlerts: [] },
    specs: { transmission: "Dyna-6 24x24", fuelTank: 300, weight: 5600, tractionType: "4WD" },
  },
  {
    id: "mac-53", providerId: "prov-9", brand: "New Holland", model: "T6020", year: 2021,
    horsepower: 110, implement: "Arado de discos", district: "Virú",
    pricePerDay: 820, pricePerHectare: 175, status: "operativo",
    imageUrl: REAL_PHOTO.nhMid, rating: 4.5, totalJobs: 133,
    telemetry: { hourmeter: 3120, fuelLevel: 49, engineTemp: 88, nextServiceInHours: 60, activeAlerts: [] },
    specs: { transmission: "Range Command 20x20", fuelTank: 230, weight: 6100, tractionType: "4WD" },
  },
  {
    id: "mac-54", providerId: "prov-9", brand: "New Holland", model: "T7.245", year: 2022,
    horsepower: 245, implement: "Sembradora", district: "Virú",
    pricePerDay: 1650, pricePerHectare: 260, status: "operativo",
    imageUrl: REAL_PHOTO.nhLarge, rating: 4.8, totalJobs: 66,
    telemetry: { hourmeter: 980, fuelLevel: 83, engineTemp: 84, nextServiceInHours: 160, activeAlerts: [] },
    specs: { transmission: "Auto Command CVT", fuelTank: 470, weight: 7200, tractionType: "4WD" },
  },
  {
    id: "mac-55", providerId: "prov-9", brand: "Kubota", model: "M6-142", year: 2023,
    horsepower: 142, implement: "Subsolador", district: "Virú",
    pricePerDay: 1050, pricePerHectare: 205, status: "operativo",
    imageUrl: REAL_PHOTO.kubLarge, rating: 4.9, totalJobs: 24,
    telemetry: { hourmeter: 210, fuelLevel: 94, engineTemp: 81, nextServiceInHours: 235, activeAlerts: [] },
    specs: { transmission: "Powershift 24x24", fuelTank: 260, weight: 5700, tractionType: "4WD" },
  },
  {
    id: "mac-56", providerId: "prov-9", brand: "Kubota", model: "M9000", year: 2022,
    horsepower: 95, implement: "Rastra", district: "Virú",
    pricePerDay: 660, pricePerHectare: 145, status: "operativo",
    imageUrl: REAL_PHOTO.kubM9000, rating: 4.6, totalJobs: 87,
    telemetry: { hourmeter: 1890, fuelLevel: 64, engineTemp: 85, nextServiceInHours: 105, activeAlerts: [] },
    specs: { transmission: "Powershift 16x16", fuelTank: 175, weight: 4600, tractionType: "4WD" },
  },
  {
    id: "mac-57", providerId: "prov-9", brand: "Case IH", model: "Maxxum 140", year: 2021,
    horsepower: 140, implement: "Cisterna", district: "Virú",
    pricePerDay: 1020, pricePerHectare: 205, status: "operativo",
    imageUrl: REAL_PHOTO.cihMid, rating: 4.4, totalJobs: 174,
    telemetry: { hourmeter: 4990, fuelLevel: 42, engineTemp: 89, nextServiceInHours: 30, activeAlerts: [] },
    specs: { transmission: "Powershift 19x6", fuelTank: 285, weight: 6300, tractionType: "4WD" },
  },
  {
    id: "mac-58", providerId: "prov-9", brand: "Valtra", model: "N101", year: 2023,
    horsepower: 101, implement: "Fumigadora", district: "Virú",
    pricePerDay: 760, pricePerHectare: 160, status: "operativo",
    imageUrl: REAL_PHOTO.valMid, rating: 4.7, totalJobs: 55,
    telemetry: { hourmeter: 730, fuelLevel: 78, engineTemp: 83, nextServiceInHours: 185, activeAlerts: [] },
    specs: { transmission: "HiTech 24x24", fuelTank: 200, weight: 5100, tractionType: "4WD" },
  },
];

// Deriva el catálogo final: precio/hora real (seca y operada) según el rango
// de HP, e implemento con su tarifa según el tamaño de la unidad — a partir
// de la tabla real de precios (ver `pricing.ts`), sin tener que escribir
// manualmente el precio de cada uno de los tractores del catálogo semilla.
export const machines: Machine[] = RAW_MACHINES.map((raw) => {
  const { implement, pricePerDay: _pricePerDay, pricePerHectare: _pricePerHectare, ...rest } = raw;
  return {
    ...rest,
    implements: [{ type: implement, pricePerHour: implementRate(implement, raw.horsepower) }],
    ...seedHourlyRates(raw.horsepower),
  };
});
