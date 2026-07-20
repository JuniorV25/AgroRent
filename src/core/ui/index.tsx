// ============================================================================
// Primitivas de UI reutilizables (Modern B2B SaaS)
// ============================================================================
import React, { useState } from "react";
import { Eye, EyeOff, Tractor } from "lucide-react";
import { cx } from "../utils/format";
import { REGIONS, districtsByRegion, type Region } from "../constants/districts";

// ---------- DistrictOptions — <option>/<optgroup> agrupados por región/provincia ----------
// Se usa dentro de cualquier <select> de distrito (registro, campos, catálogo de
// maquinaria, filtros de búsqueda). Si se pasa `region`, solo muestra los
// distritos de esa región; si no, agrupa por las 2 regiones (La Libertad / Lambayeque).
export function DistrictOptions({ region }: { region?: Region }) {
  const regions = region ? [region] : REGIONS;
  return (
    <>
      {regions.map((r) => (
        <optgroup key={r} label={r}>
          {districtsByRegion(r).flatMap(({ province, districts }) =>
            districts.map((d) => (
              <option key={d} value={d}>
                {d} · {province}
              </option>
            ))
          )}
        </optgroup>
      ))}
    </>
  );
}

// ---------- Button ----------
type BtnProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  pill?: boolean;
};
export function Button({ variant = "primary", size = "md", pill = false, className, ...p }: BtnProps) {
  const base =
    "inline-flex items-center justify-center gap-2 font-display font-semibold rounded-xl transition-all duration-300 focus:outline-none disabled:opacity-50 disabled:pointer-events-none active:scale-[.97]";
  const sizes = { sm: "text-sm px-3.5 py-2", md: "px-5 py-2.5", lg: "text-lg px-7 py-3.5" };
  const variants = {
    primary: "text-white bg-gradient-to-br from-agua-500 to-agua-600 shadow-glow hover:shadow-[0_0_0_1px_rgba(13,148,136,.3),0_16px_50px_-12px_rgba(13,148,136,.7)] hover:-translate-y-0.5",
    secondary: "text-earth-400 bg-gradient-to-br from-earth-100 to-earth-200 hover:-translate-y-0.5 hover:shadow-float",
    ghost: "text-slate-600 hover:bg-white/70 hover:text-agua-600",
    danger: "text-white bg-gradient-to-br from-terra-500 to-terra-600 hover:-translate-y-0.5 hover:shadow-float",
  };
  return <button className={cx(base, sizes[size], variants[variant], pill && "!rounded-full", className)} {...p} />;
}

// ---------- Card ----------
export function Card({ className, children, hover = false }: { className?: string; children: React.ReactNode; hover?: boolean }) {
  return (
    <div
      className={cx(
        "rounded-2xl bg-white/90 border border-slate-100 shadow-float",
        hover && "transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_70px_-20px_rgba(13,148,136,.4)]",
        className
      )}
    >
      {children}
    </div>
  );
}

// ---------- Badge ----------
export function Badge({ children, tone = "agua", className }: { children: React.ReactNode; tone?: "agua" | "earth" | "amber" | "terra" | "slate"; className?: string }) {
  const tones = {
    agua: "bg-agua-50 text-agua-600 ring-agua-400/30",
    earth: "bg-earth-50 text-earth-400 ring-earth-300/40",
    amber: "bg-amber-50 text-amber-700 ring-amber-400/30",
    terra: "bg-orange-50 text-orange-800 ring-orange-700/25",
    slate: "bg-slate-100 text-slate-600 ring-slate-300/40",
  };
  return (
    <span className={cx("inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ring-1", tones[tone], className)}>
      {children}
    </span>
  );
}

// ---------- Circular Gauge (telemetría) ----------
export function Gauge({ value, max = 100, label, unit, size = 132, color = "#0d9488", warn }: {
  value: number; max?: number; label: string; unit?: string; size?: number; color?: string; warn?: boolean;
}) {
  const pct = Math.max(0, Math.min(1, value / max));
  const r = size / 2 - 12;
  const c = 2 * Math.PI * r;
  const stroke = warn ? "#f59e0b" : color;
  return (
    <div className="flex flex-col items-center">
      {/* El círculo y su porcentaje comparten la misma caja (porcentaje centrado
          con position:absolute), así nunca se superponen con la etiqueta de abajo */}
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#eef2f1" strokeWidth={11} />
          <circle
            cx={size / 2} cy={size / 2} r={r} fill="none" stroke={stroke} strokeWidth={11}
            strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct)}
            style={{ transition: "stroke-dashoffset 1s cubic-bezier(.16,1,.3,1)" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-display font-extrabold text-2xl text-slate-800">{Math.round(value)}{unit}</span>
        </div>
      </div>
      <span className="mt-2.5 text-xs font-semibold text-slate-500 tracking-wide uppercase text-center">{label}</span>
    </div>
  );
}

// ---------- Watermark decorativo de sección (paleta del sistema) ----------
export function SectionWatermark({ tone = "earth" }: { tone?: "earth" | "agua" }) {
  const blobA = tone === "earth" ? "#c19a5b" : "#2bbfae";
  const blobB = tone === "earth" ? "#2bbfae" : "#c19a5b";
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-[28px]" aria-hidden>
      <div
        className="absolute -top-24 -right-20 w-[26rem] h-[26rem] rounded-full blur-3xl animate-float-slow"
        style={{ background: `radial-gradient(circle at 30% 30%, ${blobA}33, transparent 70%)` }}
      />
      <div
        className="absolute -bottom-28 -left-16 w-96 h-96 rounded-full blur-3xl"
        style={{ background: `radial-gradient(circle at 60% 40%, ${blobB}26, transparent 70%)` }}
      />
      <Tractor
        size={260}
        strokeWidth={1}
        className="absolute -right-6 bottom-0 text-slate-900/[0.04] hidden md:block"
      />
    </div>
  );
}

// ---------- Pagination (catálogo por páginas) ----------
export function Pagination({
  page, totalPages, onChange, accent = "agua",
}: { page: number; totalPages: number; onChange: (p: number) => void; accent?: "agua" | "earth" }) {
  if (totalPages <= 1) return null;
  const active = accent === "agua" ? "bg-agua-500 text-white shadow-glow" : "bg-earth-400 text-white shadow-float";
  return (
    <div className="flex items-center justify-center gap-1.5 flex-wrap pt-2">
      <button
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="px-3 py-2 rounded-xl text-sm font-semibold text-slate-500 hover:bg-white/70 disabled:opacity-40 disabled:pointer-events-none transition"
      >
        ‹
      </button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
        <button
          key={n}
          onClick={() => onChange(n)}
          className={cx(
            "w-9 h-9 rounded-xl text-sm font-semibold transition",
            n === page ? active : "text-slate-600 hover:bg-white/70"
          )}
        >
          {n}
        </button>
      ))}
      <button
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="px-3 py-2 rounded-xl text-sm font-semibold text-slate-500 hover:bg-white/70 disabled:opacity-40 disabled:pointer-events-none transition"
      >
        ›
      </button>
    </div>
  );
}

// ---------- Input / Field ----------
export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-slate-500 mb-1.5 block">{label}</span>
      {children}
    </label>
  );
}
export const inputCls =
  "w-full rounded-xl border border-slate-200 bg-white/80 px-3.5 py-2.5 text-sm text-slate-700 outline-none transition focus:border-agua-400 focus:ring-4 focus:ring-agua-400/15";
export const inputErrorCls =
  "border-terra-500 focus:border-terra-500 focus:ring-terra-500/15";

// ---------- FieldError ----------
export function FieldError({ children }: { children?: string }) {
  if (!children) return null;
  return (
    <p className="mt-1 text-[11px] font-semibold text-terra-500 animate-fade-in-up">{children}</p>
  );
}

// ---------- PasswordInput (con animación de mostrar/ocultar) ----------
export function PasswordInput({
  value, onChange, onBlur, placeholder, className, invalid,
}: {
  value: string; onChange: (v: string) => void; onBlur?: () => void; placeholder?: string; className?: string; invalid?: boolean;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <input
        type={visible ? "text" : "password"}
        className={cx(inputCls, "pr-10 transition-all duration-300", invalid && inputErrorCls, className)}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder ?? "••••••••"}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-agua-600 transition-all duration-300 hover:scale-110 active:scale-90"
        tabIndex={-1}
        aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
      >
        <span className="relative block w-[18px] h-[18px]">
          <Eye size={18} className={cx("absolute inset-0 transition-all duration-300", visible ? "opacity-0 scale-50 rotate-90" : "opacity-100 scale-100 rotate-0")} />
          <EyeOff size={18} className={cx("absolute inset-0 transition-all duration-300", visible ? "opacity-100 scale-100 rotate-0" : "opacity-0 scale-50 -rotate-90")} />
        </span>
      </button>
    </div>
  );
}

// ---------- Logo — insignia TraktorRent: tractor + arco de "flota en alquiler" ----------
export function Logo({ size = 38 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 40 40"
      width={size}
      height={size}
      className="shrink-0 drop-shadow-[0_6px_16px_rgba(13,148,136,0.4)]"
      role="img"
      aria-label="TraktorRent"
    >
      <defs>
        <linearGradient id="logoGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2bbfae" />
          <stop offset="100%" stopColor="#0b7c72" />
        </linearGradient>
      </defs>
      {/* Insignia — esquinas redondeadas, sin borde ni fondo blanco */}
      <rect width="40" height="40" rx="11" fill="url(#logoGrad)" />

      {/* Arco doble de "flota en movimiento / alquiler circular" */}
      <path d="M7.5 14.2A13.4 13.4 0 0 1 29.6 9.6" fill="none" stroke="#eafffb" strokeWidth="2.3" strokeLinecap="round" opacity="0.9" />
      <path d="M28.3 7.6l2.9 1.6-.8 3.2" fill="none" stroke="#eafffb" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
      <path d="M32.5 25.8A13.4 13.4 0 0 1 10.4 30.4" fill="none" stroke="#d9a54a" strokeWidth="2.3" strokeLinecap="round" />
      <path d="M11.7 32.4l-2.9-1.6.8-3.2" fill="none" stroke="#d9a54a" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />

      {/* Tractor */}
      <g fill="#fff">
        <rect x="14.3" y="16.6" width="12.6" height="7.2" rx="2" />
        <rect x="16.3" y="12" width="7.2" height="5.4" rx="1.6" opacity="0.94" />
        <rect x="17.4" y="13" width="5" height="3" rx="0.8" fill="#0b7c72" opacity="0.55" />
        <circle cx="13.8" cy="27.6" r="5" />
        <circle cx="25.6" cy="28.3" r="3.6" />
      </g>
      <circle cx="13.8" cy="27.6" r="2" fill="#0b7c72" />
      <circle cx="25.6" cy="28.3" r="1.4" fill="#0b7c72" />
    </svg>
  );
}

// ---------- Modal (glassmorphism) ----------
export function Modal({ open, onClose, children, title, size = "lg" }: { open: boolean; onClose: () => void; children: React.ReactNode; title?: string; size?: "lg" | "xl" }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-[fadeInUp_.3s_ease]" onClick={onClose} />
      <div className={cx("glass relative w-full rounded-2xl shadow-float p-6 animate-fade-in-up", size === "xl" ? "max-w-xl" : "max-w-lg")}>
        {title && <h3 className="font-display font-bold text-xl text-slate-800 mb-4">{title}</h3>}
        {children}
      </div>
    </div>
  );
}
