// Proveedores semilla (TraktorRent)
import type { Provider } from "./types";

export const providers: Provider[] = [
  { id: "prov-4", companyName: "Salaverry AgroServicios",     ruc: "20487654321", verified: true,  district: "Salaverry", rating: 4.9, fleetSize: 3,  responseTimeHrs: 1 },

  // --- Proveedores nuevos (flota real de 10 unidades cada uno, ver machinery/data.ts) ---
  { id: "prov-5", companyName: "SERTMAC S.A.C.",                       ruc: "20601122334", verified: true, district: "Laredo",    rating: 4.7, fleetSize: 10, responseTimeHrs: 2 },
  { id: "prov-6", companyName: "TerraFuerza Maquinarias S.A.C.",       ruc: "20602233445", verified: true, district: "Virú",      rating: 4.6, fleetSize: 10, responseTimeHrs: 3 },
  { id: "prov-7", companyName: "AgroPotencia del Norte E.I.R.L.",      ruc: "20603344556", verified: true, district: "Moche",     rating: 4.7, fleetSize: 10, responseTimeHrs: 2 },
  { id: "prov-8", companyName: "Motoagro Perú S.A.C.",                 ruc: "20604455667", verified: true, district: "Salaverry", rating: 4.5, fleetSize: 10, responseTimeHrs: 4 },
  { id: "prov-9", companyName: "Norte Tracción Industrial S.A.C.",     ruc: "20605566778", verified: true, district: "Virú",      rating: 4.6, fleetSize: 10, responseTimeHrs: 3 },
];
