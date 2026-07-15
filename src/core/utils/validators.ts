// ============================================================================
// Validadores de campos de texto — Login / Registro
// Centraliza las reglas de formato para que Login.tsx (y cualquier otro
// formulario) valide de forma consistente sin duplicar regex.
// ============================================================================

// Dominios de correo aceptados. El objetivo es filtrar correos claramente
// inventados o mal escritos; una verificación real de "correo existente"
// (buzón activo) requiere un backend que envíe un enlace/código de
// confirmación — ver requestPasswordReset en useStore para el flujo que
// simula esa confirmación dentro de esta app sin servidor de correo.
export const ALLOWED_EMAIL_DOMAINS = [
  "gmail.com",
  "hotmail.com",
  "outlook.com",
  "yahoo.com",
  "live.com",
  "icloud.com",
  "protonmail.com",
];

const EMAIL_RE = /^[a-z0-9][a-z0-9._%+-]*@[a-z0-9.-]+\.[a-z]{2,}$/i;

export function validateEmail(raw: string): { ok: boolean; error?: string } {
  const email = raw.trim().toLowerCase();
  if (!email) return { ok: false, error: "El correo es obligatorio." };
  if (!EMAIL_RE.test(email)) return { ok: false, error: "Formato de correo inválido." };
  const domain = email.split("@")[1];
  if (!ALLOWED_EMAIL_DOMAINS.includes(domain)) {
    return { ok: false, error: `Usa un correo de un proveedor conocido (${ALLOWED_EMAIL_DOMAINS.slice(0, 3).join(", ")}, etc.).` };
  }
  return { ok: true };
}

// Celular peruano: 9 dígitos, empieza en 9.
const PHONE_RE = /^9\d{8}$/;
export function validatePhone(raw: string): { ok: boolean; error?: string } {
  const phone = raw.trim();
  if (!phone) return { ok: false, error: "El teléfono es obligatorio." };
  if (!PHONE_RE.test(phone)) return { ok: false, error: "Debe tener 9 dígitos y empezar en 9." };
  return { ok: true };
}
// Filtro de escritura: solo dígitos, máximo 9.
export const sanitizePhoneInput = (v: string) => v.replace(/\D/g, "").slice(0, 9);

// DNI peruano: 8 dígitos.
const DNI_RE = /^\d{8}$/;
export function validateDni(raw: string): { ok: boolean; error?: string } {
  const dni = raw.trim();
  if (!dni) return { ok: false, error: "El DNI es obligatorio." };
  if (!DNI_RE.test(dni)) return { ok: false, error: "Debe tener 8 dígitos." };
  return { ok: true };
}
export const sanitizeDniInput = (v: string) => v.replace(/\D/g, "").slice(0, 8);

// RUC peruano: 11 dígitos, prefijo válido (10 persona natural con negocio,
// 15/17 asociaciones, 16 sociedad conyugal, 20 persona jurídica).
const RUC_RE = /^(10|15|16|17|20)\d{9}$/;
export function validateRuc(raw: string): { ok: boolean; error?: string } {
  const ruc = raw.trim();
  if (!ruc) return { ok: false, error: "El RUC es obligatorio." };
  if (!/^\d{11}$/.test(ruc)) return { ok: false, error: "Debe tener 11 dígitos." };
  if (!RUC_RE.test(ruc)) return { ok: false, error: "Prefijo de RUC inválido (debe iniciar en 10, 15, 16, 17 o 20)." };
  return { ok: true };
}
export const sanitizeRucInput = (v: string) => v.replace(/\D/g, "").slice(0, 11);

// Nombres: solo letras (con tildes/ñ) y espacios, mínimo 2 palabras.
const NAME_RE = /^[a-záéíóúñü]+(\s[a-záéíóúñü]+)+$/i;
export function validateFullName(raw: string): { ok: boolean; error?: string } {
  const name = raw.trim();
  if (!name) return { ok: false, error: "El nombre es obligatorio." };
  if (name.length < 4) return { ok: false, error: "Nombre demasiado corto." };
  if (!NAME_RE.test(name)) return { ok: false, error: "Escribe nombre y apellido, solo letras." };
  return { ok: true };
}
export const sanitizeNameInput = (v: string) => v.replace(/[^a-záéíóúñü\s]/gi, "");

// Razón social: letras, números y algunos signos comunes (S.A.C., &, etc.)
const COMPANY_RE = /^[a-z0-9áéíóúñü.,&\s-]{3,}$/i;
export function validateCompanyName(raw: string): { ok: boolean; error?: string } {
  const name = raw.trim();
  if (!name) return { ok: false, error: "La razón social es obligatoria." };
  if (!COMPANY_RE.test(name)) return { ok: false, error: "Nombre de empresa inválido." };
  return { ok: true };
}

// Contraseña: mínimo 8, al menos una letra y un número.
export function validatePassword(raw: string): { ok: boolean; error?: string } {
  if (!raw) return { ok: false, error: "La contraseña es obligatoria." };
  if (raw.length < 8) return { ok: false, error: "Mínimo 8 caracteres." };
  if (!/[a-z]/i.test(raw) || !/\d/.test(raw)) return { ok: false, error: "Debe incluir letras y números." };
  return { ok: true };
}
