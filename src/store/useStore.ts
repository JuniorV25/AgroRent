// ============================================================================
// Estado global (pub/sub) con persistencia en localStorage — Zustand
// Compone el estado de cada módulo de dominio (machinery, fields, users,
// providers, rentals, notifications). Este es el único punto de acceso a
// datos de la UI; al migrar a Supabase, solo este archivo cambia.
// ============================================================================
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Machine } from "../modules/machinery/types";
import { machines as seedMachines } from "../modules/machinery/data";
import type { Field } from "../modules/fields/types";
import { fields as seedFields } from "../modules/fields/data";
import type { User, Role, AccountType } from "../modules/users/types";
import { demoUsers } from "../modules/users/data";
import type { Provider } from "../modules/providers/types";
import { providers as seedProviders } from "../modules/providers/data";
import type { Reservation, ReservationStatus, ChatMessage } from "../modules/rentals/types";
import type { Notification } from "../modules/notifications/types";
import type { District } from "../core/constants/districts";
import { uid } from "../core/utils/format";
import {
  validateEmail,
  validatePhone,
  validatePassword,
  validateFullName,
  validateDni,
  validateRuc,
  validateCompanyName,
} from "../core/utils/validators";

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: Role;
  accountType: AccountType;
  company: string; // solo si accountType === "empresa"
  ruc: string; // solo si accountType === "empresa"
  dni?: string; // solo si accountType === "individual"
  district?: District; // requerido si role === "proveedor"
}

// Código de verificación simulado para "olvidé mi contraseña". Esta app no
// tiene backend de envío de correos, así que el código se genera y se
// muestra en la propia UI (como si fuera el contenido del correo recibido).
interface PasswordReset {
  code: string;
  expiresAt: number;
}

interface AppState {
  // --- Sesión / Auth real (simulada en frontend, sin backend) ---
  user: User | null;
  users: User[];
  registerUser: (input: RegisterInput) => { ok: boolean; error?: string };
  loginWithCredentials: (email: string, password: string) => { ok: boolean; error?: string };
  loginDemo: (role: Role) => void; // acceso rápido con las cuentas demo del README
  logout: () => void;
  updateUser: (id: string, patch: Partial<User>) => void;

  // --- Recuperación de contraseña (código simulado, sin servidor de correo) ---
  passwordResets: Record<string, PasswordReset>;
  requestPasswordReset: (email: string) => { ok: boolean; error?: string; code?: string };
  confirmPasswordReset: (email: string, code: string, newPassword: string) => { ok: boolean; error?: string };

  // --- Proveedores (ficha comercial, crece con cada registro) ---
  providers: Provider[];

  // --- Flota (Proveedor) ---
  machines: Machine[];
  addMachine: (m: Machine) => void;
  updateMachine: (id: string, patch: Partial<Machine>) => void;
  removeMachine: (id: string) => void;

  // --- Campos (Cliente) ---
  fields: Field[];
  addField: (f: Field) => void;
  updateField: (id: string, patch: Partial<Field>) => void;
  removeField: (id: string) => void;

  // --- Reservas (motor de reservas + contrato digital) ---
  reservations: Reservation[];
  requestReservation: (r: Omit<Reservation, "status" | "updatedAt">) => void;
  setReservationStatus: (id: string, status: ReservationStatus) => void;

  // --- Chat B2B por reserva ---
  chatMessages: ChatMessage[];
  addChatMessage: (reservationId: string, sender: ChatMessage["sender"], text: string) => void;
  generateAiSummary: (reservationId: string) => void;

  // --- Notificaciones in-app (por usuario real) ---
  notifications: Notification[];
  addNotification: (n: Omit<Notification, "id" | "createdAt" | "read">) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: (forUserId: string) => void;

  // --- Comparador de máquinas (Cliente) — hasta MAX_COMPARE unidades a la vez ---
  compareIds: string[];
  toggleCompare: (id: string) => void;
  clearCompare: () => void;
}

// Límite de unidades que el cliente puede comparar a la vez: evita tablas y
// gráficos ilegibles, y sobrecargar el render con demasiadas columnas.
export const MAX_COMPARE = 3;

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // --- Auth ---
      user: null,
      users: demoUsers,
      registerUser: (input) => {
        const email = input.email.trim().toLowerCase();

        const nameCheck = validateFullName(input.name);
        if (!nameCheck.ok) return { ok: false, error: nameCheck.error };

        const emailCheck = validateEmail(email);
        if (!emailCheck.ok) return { ok: false, error: emailCheck.error };

        const passCheck = validatePassword(input.password);
        if (!passCheck.ok) return { ok: false, error: passCheck.error };

        const phoneCheck = validatePhone(input.phone);
        if (!phoneCheck.ok) return { ok: false, error: phoneCheck.error };

        if (input.accountType === "empresa") {
          const companyCheck = validateCompanyName(input.company);
          if (!companyCheck.ok) return { ok: false, error: companyCheck.error };
          const rucCheck = validateRuc(input.ruc);
          if (!rucCheck.ok) return { ok: false, error: rucCheck.error };
        } else {
          const dniCheck = validateDni(input.dni ?? "");
          if (!dniCheck.ok) return { ok: false, error: dniCheck.error };
        }

        if (get().users.some((u) => u.email.toLowerCase() === email)) {
          return { ok: false, error: "Ya existe una cuenta con ese correo." };
        }

        let providerId: string | undefined;
        if (input.role === "proveedor") {
          const provider: Provider = {
            id: uid("prov"),
            companyName: input.accountType === "empresa" ? input.company : input.name,
            ruc: input.accountType === "empresa" ? input.ruc : (input.dni ?? "—"),
            verified: false,
            district: input.district ?? "Moche",
            rating: 0,
            fleetSize: 0,
            responseTimeHrs: 4,
          };
          set((s) => ({ providers: [provider, ...s.providers] }));
          providerId = provider.id;
        }
        const newUser: User = {
          id: uid("user"),
          name: input.name.trim(),
          email,
          password: input.password,
          phone: input.phone.trim(),
          role: input.role,
          accountType: input.accountType,
          company: input.accountType === "empresa" ? input.company.trim() : "—",
          ruc: input.accountType === "empresa" ? input.ruc.trim() : "—",
          dni: input.accountType === "individual" ? input.dni?.trim() : undefined,
          verified: false,
          avatarColor: input.role === "cliente" ? "#0d9488" : "#c2410c",
          providerId,
        };
        set((s) => ({ users: [...s.users, newUser], user: newUser }));
        return { ok: true };
      },
      loginWithCredentials: (email, password) => {
        const match = get().users.find(
          (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password
        );
        if (!match) return { ok: false, error: "Correo o contraseña incorrectos." };
        set({ user: match });
        return { ok: true };
      },
      loginDemo: (role) => set({ user: get().users.find((u) => u.role === role) ?? null }),
      logout: () => set({ user: null }),
      updateUser: (id, patch) =>
        set((s) => ({
          users: s.users.map((u) => (u.id === id ? { ...u, ...patch } : u)),
          user: s.user && s.user.id === id ? { ...s.user, ...patch } : s.user,
        })),

      passwordResets: {},
      requestPasswordReset: (email) => {
        const normalized = email.trim().toLowerCase();
        const emailCheck = validateEmail(normalized);
        if (!emailCheck.ok) return { ok: false, error: emailCheck.error };
        const exists = get().users.some((u) => u.email.toLowerCase() === normalized);
        if (!exists) return { ok: false, error: "No existe ninguna cuenta con ese correo." };
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        set((s) => ({
          passwordResets: { ...s.passwordResets, [normalized]: { code, expiresAt: Date.now() + 10 * 60 * 1000 } },
        }));
        return { ok: true, code };
      },
      confirmPasswordReset: (email, code, newPassword) => {
        const normalized = email.trim().toLowerCase();
        const entry = get().passwordResets[normalized];
        if (!entry) return { ok: false, error: "Solicita un código nuevo." };
        if (Date.now() > entry.expiresAt) return { ok: false, error: "El código expiró. Solicita uno nuevo." };
        if (entry.code !== code.trim()) return { ok: false, error: "Código incorrecto." };
        const passCheck = validatePassword(newPassword);
        if (!passCheck.ok) return { ok: false, error: passCheck.error };
        const userExists = get().users.some((u) => u.email.toLowerCase() === normalized);
        if (!userExists) return { ok: false, error: "No existe ninguna cuenta con ese correo." };
        set((s) => ({
          users: s.users.map((u) => (u.email.toLowerCase() === normalized ? { ...u, password: newPassword } : u)),
          passwordResets: Object.fromEntries(Object.entries(s.passwordResets).filter(([k]) => k !== normalized)),
        }));
        return { ok: true };
      },

      providers: seedProviders,

      machines: seedMachines,
      addMachine: (m) => set((s) => ({ machines: [m, ...s.machines] })),
      updateMachine: (id, patch) =>
        set((s) => ({
          machines: s.machines.map((m) => (m.id === id ? { ...m, ...patch } : m)),
        })),
      removeMachine: (id) =>
        set((s) => ({ machines: s.machines.filter((m) => m.id !== id) })),

      fields: seedFields,
      addField: (f) => set((s) => ({ fields: [f, ...s.fields] })),
      updateField: (id, patch) =>
        set((s) => ({
          fields: s.fields.map((f) => (f.id === id ? { ...f, ...patch } : f)),
        })),
      removeField: (id) =>
        set((s) => ({ fields: s.fields.filter((f) => f.id !== id) })),

      // --- Reservas ---
      reservations: [],
      requestReservation: (r) => {
        const now = new Date().toISOString();
        const reservation: Reservation = { ...r, status: "borrador", updatedAt: now };
        set((s) => ({ reservations: [reservation, ...s.reservations] }));

        const providerUser = get().users.find((u) => u.providerId === r.providerId);
        if (providerUser) {
          get().addNotification({
            forUserId: providerUser.id,
            type: "reserva",
            title: "Nueva solicitud de reserva",
            message: `Un cliente solicitó reservar la unidad ${r.machineId} por ${r.days} día(s).`,
            reservationId: r.id,
          });
        }
        const modeLabel = r.serviceMode === "operada" ? "máquina operada (proveedor incluye operador y combustible)" : "máquina seca (cliente pone operador y combustible)";
        get().addChatMessage(
          r.id,
          "ia",
          `Se abrió una nueva solicitud de reserva · modalidad: ${modeLabel} · implemento: ${r.implementType} · ${r.days} día(s). Costo estimado: S/ ${(r.estimatedCost ?? 0).toFixed(0)}. Pueden coordinar los detalles del trabajo por este chat.`
        );
      },
      setReservationStatus: (id, status) => {
        const res = get().reservations.find((r) => r.id === id);
        if (!res) return;
        const now = new Date().toISOString();
        set((s) => ({
          reservations: s.reservations.map((r) => (r.id === id ? { ...r, status, updatedAt: now } : r)),
        }));
        const labels: Record<ReservationStatus, string> = {
          borrador: "en borrador",
          confirmada: "confirmada por el proveedor",
          en_curso: "en curso en campo",
          finalizada: "finalizada",
          cancelada: "cancelada",
        };
        get().addNotification({
          forUserId: res.clientId,
          type: "reserva",
          title: "Actualización de tu reserva",
          message: `Tu reserva ${id} ahora está ${labels[status]}.`,
          reservationId: id,
        });
        get().addChatMessage(id, "ia", `Estado de la reserva actualizado: ${labels[status]}.`);
      },

      // --- Chat ---
      chatMessages: [],
      addChatMessage: (reservationId, sender, text) =>
        set((s) => ({
          chatMessages: [
            ...s.chatMessages,
            { id: uid("msg"), reservationId, sender, text, createdAt: new Date().toISOString() },
          ],
        })),
      generateAiSummary: (reservationId) => {
        const res = get().reservations.find((r) => r.id === reservationId);
        if (!res) return;
        const modeLabel = res.serviceMode === "operada" ? "máquina operada" : "máquina seca";
        const summary =
          `Resumen del acuerdo — Reserva ${res.id}: ${res.days} día(s) de alquiler, modalidad ${modeLabel}, ` +
          `implemento ${res.implementType}, ${res.hectares} ha de trabajo, costo estimado S/ ${(res.estimatedCost ?? 0).toFixed(0)} (IGV incluido). ` +
          `Estado actual: ${res.status}. Contrato digital ${res.contractAccepted ? "aceptado" : "pendiente"} por el cliente.`;
        get().addChatMessage(reservationId, "ia", summary);
      },

      // --- Notificaciones ---
      notifications: [],
      addNotification: (n) =>
        set((s) => ({
          notifications: [
            { ...n, id: uid("ntf"), read: false, createdAt: new Date().toISOString() },
            ...s.notifications,
          ],
        })),
      markNotificationRead: (id) =>
        set((s) => ({
          notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
        })),
      markAllNotificationsRead: (forUserId) =>
        set((s) => ({
          notifications: s.notifications.map((n) => (n.forUserId === forUserId ? { ...n, read: true } : n)),
        })),

      // --- Comparador ---
      compareIds: [],
      toggleCompare: (id) =>
        set((s) => {
          if (s.compareIds.includes(id)) return { compareIds: s.compareIds.filter((x) => x !== id) };
          if (s.compareIds.length >= MAX_COMPARE) return s; // ya alcanzó el máximo permitido
          return { compareIds: [...s.compareIds, id] };
        }),
      clearCompare: () => set({ compareIds: [] }),
    }),
    {
      // v6: nuevo modelo de precios (S/ por hora, "seca"/"operada") e implementos
      // múltiples por unidad -> se cambia la clave para no rehidratar máquinas o
      // reservas con el esquema anterior desde localStorage (causaba pantalla en
      // blanco: los componentes esperaban `machine.implements[]` y quedaba
      // `undefined` con datos viejos).
      name: "agrorent-store-v6",
      storage: createJSONStorage(() => localStorage),
      // Persistimos todo el dominio para simular backend real.
    }
  )
);

// Selectores derivados (pub/sub — se recomputan al cambiar el estado)
export const selectFleetByProvider = (providerId: string) => (s: AppState) =>
  s.machines.filter((m) => m.providerId === providerId);

export const selectMyFields = (ownerId: string) => (s: AppState) =>
  s.fields.filter((f) => f.ownerId === ownerId);

export const selectReservationsByClient = (clientId: string) => (s: AppState) =>
  s.reservations.filter((r) => r.clientId === clientId);

export const selectReservationsByProvider = (providerId: string) => (s: AppState) =>
  s.reservations.filter((r) => r.providerId === providerId);

export const selectChatByReservation = (reservationId: string) => (s: AppState) =>
  s.chatMessages.filter((m) => m.reservationId === reservationId);

export const selectNotificationsByUser = (forUserId: string) => (s: AppState) =>
  s.notifications.filter((n) => n.forUserId === forUserId);
