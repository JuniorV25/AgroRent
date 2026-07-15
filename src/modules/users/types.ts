// ============================================================================
// Dominio: Usuarios / Clientes (cuentas y autenticación)
// ============================================================================
export type Role = "cliente" | "proveedor";
export type AccountType = "individual" | "empresa";

export interface User {
  id: string;
  name: string; // individual: nombre completo · empresa: nombre del contacto
  email: string;
  password: string; // demo: autenticación simulada en frontend, sin backend real
  phone: string; // celular peruano, 9 dígitos
  role: Role;
  accountType: AccountType;
  company: string; // razón social si accountType === "empresa", "—" si individual
  ruc: string; // 11 dígitos si accountType === "empresa", "—" si individual
  dni?: string; // 8 dígitos, solo si accountType === "individual"
  verified: boolean;
  avatarColor: string;
  avatarUrl?: string; // foto de perfil (data URL) subida por el usuario
  description?: string; // biografía / descripción del perfil, manual o redactada por IA
  providerId?: string; // solo si role === "proveedor": vincula su ficha en Provider[]
}
