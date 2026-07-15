import type { User } from "./types";

// Usuarios demo para login simulado
export const demoUsers: User[] = [
  {
    id: "user-cliente", name: "Junior Vásquez", email: "cliente@gmail.com", password: "demo1234",
    phone: "987654321", role: "cliente", accountType: "empresa",
    company: "Agrícola Valle Verde S.A.C.", ruc: "20556677889", verified: true, avatarColor: "#0d9488",
  },
  {
    id: "user-proveedor", name: "Marisol Chávez", email: "proveedor@gmail.com", password: "demo1234",
    phone: "976543210", role: "proveedor", accountType: "empresa",
    company: "Salaverry AgroServicios", ruc: "20487654321", verified: true, avatarColor: "#c2410c", providerId: "prov-4",
  },

  // ==========================================================================
  // Empresas clientes (10) — nombres inspirados en agroexportadoras reales de
  // La Libertad, con variaciones para no coincidir con razones sociales reales.
  // ==========================================================================
  {
    id: "user-cli-1", name: "Rosa Delgado", email: "arato.agro@gmail.com", password: "Arato2026",
    phone: "987001001", role: "cliente", accountType: "empresa",
    company: "ARATO S.A.C.", ruc: "20701122331", verified: true, avatarColor: "#0d9488",
  },
  {
    id: "user-cli-2", name: "Jorge Paredes", email: "viru.sa.agro@gmail.com", password: "Virusa2026",
    phone: "987001002", role: "cliente", accountType: "empresa",
    company: "Virú S.A.", ruc: "20701122332", verified: true, avatarColor: "#0d9488",
  },
  {
    id: "user-cli-3", name: "Lucía Fernández", email: "agroberry.peru@gmail.com", password: "Agroberry26",
    phone: "987001003", role: "cliente", accountType: "empresa",
    company: "AgroBerry Perú S.A.C.", ruc: "20701122333", verified: true, avatarColor: "#0d9488",
  },
  {
    id: "user-cli-4", name: "Martín Solano", email: "blueberry.fields@gmail.com", password: "Blueberry26",
    phone: "987001004", role: "cliente", accountType: "empresa",
    company: "Blueberry Fields S.A.C.", ruc: "20701122334", verified: true, avatarColor: "#0d9488",
  },
  {
    id: "user-cli-5", name: "Carla Rojas", email: "danfresh.sac@gmail.com", password: "Danfresh26",
    phone: "987001005", role: "cliente", accountType: "empresa",
    company: "Danfresh S.A.C.", ruc: "20701122335", verified: true, avatarColor: "#0d9488",
  },
  {
    id: "user-cli-6", name: "Renzo Ibáñez", email: "camposur.agro@gmail.com", password: "Camposur26",
    phone: "987001006", role: "cliente", accountType: "empresa",
    company: "Camposur Agroindustrial S.A.C.", ruc: "20701122336", verified: true, avatarColor: "#0d9488",
  },
  {
    id: "user-cli-7", name: "Diana Castillo", email: "talfrut.norte@gmail.com", password: "Talfrut2026",
    phone: "987001007", role: "cliente", accountType: "empresa",
    company: "Talfrut del Norte S.A.C.", ruc: "20701122337", verified: true, avatarColor: "#0d9488",
  },
  {
    id: "user-cli-8", name: "Fernando Quiroz", email: "cerroalto.export@gmail.com", password: "Cerroalto26",
    phone: "987001008", role: "cliente", accountType: "empresa",
    company: "Agroexport Cerro Alto S.A.C.", ruc: "20701122338", verified: true, avatarColor: "#0d9488",
  },
  {
    id: "user-cli-9", name: "Milagros Vera", email: "hortiperu.fresh@gmail.com", password: "Hortiperu26",
    phone: "987001009", role: "cliente", accountType: "empresa",
    company: "Hortiperú Fresh S.A.C.", ruc: "20701122339", verified: true, avatarColor: "#0d9488",
  },
  {
    id: "user-cli-10", name: "Andrés Salazar", email: "paltanorte.export@gmail.com", password: "Paltanorte26",
    phone: "987001010", role: "cliente", accountType: "empresa",
    company: "PaltaNorte Export S.A.C.", ruc: "20701122340", verified: true, avatarColor: "#0d9488",
  },

  // ==========================================================================
  // Empresas proveedoras (5) — cada una vinculada a su ficha en providers/data.ts
  // y a su flota real en machinery/data.ts.
  // ==========================================================================
  {
    id: "user-prov-1", name: "Héctor Vega", email: "sertmac.tractores@gmail.com", password: "Sertmac2026",
    phone: "976001001", role: "proveedor", accountType: "empresa",
    company: "SERTMAC S.A.C.", ruc: "20601122334", verified: true, avatarColor: "#c2410c", providerId: "prov-5",
  },
  {
    id: "user-prov-2", name: "Patricia León", email: "terrafuerza.maq@gmail.com", password: "Terrafuerza26",
    phone: "976001002", role: "proveedor", accountType: "empresa",
    company: "TerraFuerza Maquinarias S.A.C.", ruc: "20602233445", verified: true, avatarColor: "#c2410c", providerId: "prov-6",
  },
  {
    id: "user-prov-3", name: "Ricardo Núñez", email: "agropotencia.norte@gmail.com", password: "Agropotencia26",
    phone: "976001003", role: "proveedor", accountType: "empresa",
    company: "AgroPotencia del Norte E.I.R.L.", ruc: "20603344556", verified: true, avatarColor: "#c2410c", providerId: "prov-7",
  },
  {
    id: "user-prov-4", name: "Silvia Campos", email: "motoagro.peru@gmail.com", password: "Motoagro2026",
    phone: "976001004", role: "proveedor", accountType: "empresa",
    company: "Motoagro Perú S.A.C.", ruc: "20604455667", verified: true, avatarColor: "#c2410c", providerId: "prov-8",
  },
  {
    id: "user-prov-5", name: "Manuel Ortiz", email: "nortetraccion.ind@gmail.com", password: "Nortetraccion26",
    phone: "976001005", role: "proveedor", accountType: "empresa",
    company: "Norte Tracción Industrial S.A.C.", ruc: "20605566778", verified: true, avatarColor: "#c2410c", providerId: "prov-9",
  },
];
