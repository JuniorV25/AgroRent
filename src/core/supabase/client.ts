// ============================================================================
// Cliente transversal de Supabase
// Único punto de conexión a la base de datos: los módulos de dominio
// (machinery, rentals, providers, users, fields...) consumen este cliente
// sin acoplar su lógica de negocio a los detalles de infraestructura.
// ============================================================================
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // eslint-disable-next-line no-console
  console.warn(
    "[supabase] Faltan VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. " +
      "Copia .env.example a .env y completa tus credenciales del proyecto Supabase."
  );
}

export const supabase = createClient(supabaseUrl ?? "", supabaseAnonKey ?? "");
