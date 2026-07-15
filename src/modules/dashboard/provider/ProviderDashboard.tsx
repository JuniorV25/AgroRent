import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import {
  LayoutDashboard, Boxes, Activity, Plus, Trash2, Sparkles,
  ClipboardList, BarChart3, Check, Ban, PlayCircle, FlagTriangleRight, ImagePlus, X,
  Eye, Pencil, RefreshCw, MapPin, Wrench, Gauge as GaugeIcon, BadgeCheck, Building2, User as UserIcon, Phone, Sprout,
} from "lucide-react";
import { useStore, selectReservationsByProvider } from "../../../store/useStore";
import type { Machine, MachineStatus, MachineImplement, ImplementType } from "../../machinery/types";
import type { ReservationStatus } from "../../rentals/types";
import type { Field as FarmField } from "../../fields/types";
import { BRANDS, IMPLEMENTS, BRAND_IMG } from "../../machinery/data";
import { rateBracketForHp, implementRate } from "../../machinery/pricing";
import { DISTRICTS } from "../../../core/constants/districts";
import { monthlyMetrics } from "../../metrics/data";
import { statusMeta } from "../../machinery/status";
import { reservationStatusMeta } from "../../rentals/status";
import { soles, uid } from "../../../core/utils/format";
import { closestMatch, isTypoOf } from "../../../core/utils/fuzzyMatch";
import DashboardShell, { NavItem } from "../layout/DashboardShell";
import { Card, Button, Badge, Field, inputCls, SectionWatermark } from "../../../core/ui";
import MachineCard from "../../machinery/components/MachineCard";
import TelemetryPanel from "../../machinery/components/TelemetryPanel";
import ChatWidget from "../../rentals/components/ChatWidget";

const NAV: NavItem[] = [
  { id: "resumen", label: "Resumen", icon: <LayoutDashboard size={18} /> },
  { id: "catalogo", label: "Mi catálogo", icon: <Boxes size={18} /> },
  { id: "reservas", label: "Reservas", icon: <ClipboardList size={18} /> },
  { id: "telemetria", label: "Telemetría", icon: <Activity size={18} /> },
  { id: "metricas", label: "Métricas", icon: <BarChart3 size={18} /> },
];

// Multi-usuario real: cada proveedor ve únicamente su propia flota, reservas y métricas.
function useProviderId() {
  return useStore((s) => s.user?.providerId ?? "");
}

export default function ProviderDashboard() {
  const [tab, setTab] = useState("resumen");
  const PROVIDER_ID = useProviderId();
  const machines = useStore((s) => s.machines);
  const fleet = useMemo(() => machines.filter((m) => m.providerId === PROVIDER_ID), [machines, PROVIDER_ID]);
  const reservations = useStore(selectReservationsByProvider(PROVIDER_ID));

  return (
    <>
      <DashboardShell nav={NAV} active={tab} onNav={setTab} accent="earth">
        {tab === "resumen" && <Resumen fleet={fleet} onGo={setTab} />}
        {tab === "catalogo" && <Catalogo fleet={fleet} />}
        {tab === "reservas" && <Reservas />}
        {tab === "telemetria" && <Telemetria fleet={fleet} />}
        {tab === "metricas" && <Metricas />}
      </DashboardShell>
      <ChatWidget role="proveedor" reservations={reservations} />
    </>
  );
}

// -------------------- RESUMEN --------------------
function Resumen({ fleet, onGo }: { fleet: Machine[]; onGo: (t: string) => void }) {
  const operativos = fleet.filter((m) => m.status === "operativo").length;
  const enMant = fleet.filter((m) => m.status === "mantenimiento").length;
  const revenue = fleet.reduce((a, m) => a + (((m.pricePerHourSeca ?? 0) + (m.pricePerHourOperada ?? 0)) / 2) * 8 * (m.totalJobs ?? 0) * 0.02, 0);
  const alerts = fleet.flatMap((m) => m.telemetry?.activeAlerts ?? []);
  const company = useStore((s) => s.user?.company) ?? "";

  return (
    <div className="relative">
      <SectionWatermark tone="earth" />
      <div className="stagger space-y-6 relative z-10">
        <Header title="Panel del Proveedor" sub={`TractorLink · ${company}`} />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Stat k={String(fleet.length)} v="Unidades en flota" tone="earth" />
          <Stat k={String(operativos)} v="Operativas" tone="agua" />
          <Stat k={String(enMant)} v="En mantenimiento" tone="amber" />
          <Stat k={soles(revenue)} v="Ingresos estimados / mes" tone="earth" />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-slate-800">Estado de la flota</h3>
              <Button size="sm" variant="secondary" onClick={() => onGo("catalogo")}>Gestionar catálogo</Button>
            </div>
            <div className="space-y-2">
              {fleet.map((m) => {
                const s = statusMeta[m.status];
                return (
                  <div key={m.id} className="flex items-center gap-3 rounded-xl bg-slate-50/70 p-2.5">
                    <img src={m.imageUrl} loading="lazy" decoding="async" className="w-14 h-11 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{m.brand} {m.model}</p>
                      <p className="text-xs text-slate-400">{(m.implements ?? []).map((i) => i.type).join(", ")} · {m.horsepower} HP</p>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${s.text}`}>
                      <span className={`w-2 h-2 rounded-full ${s.dot}`} /> {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-display font-bold text-slate-800 mb-1">Alertas preventivas</h3>
            <p className="text-xs text-slate-400 mb-4">Mantenimiento antes de la falla</p>
            {alerts.length === 0 ? (
              <Badge tone="agua">Todo en orden</Badge>
            ) : (
              <div className="space-y-2">
                {alerts.map((a, i) => (
                  <div key={i} className="text-sm text-amber-800 bg-amber-50 ring-1 ring-amber-400/30 rounded-lg px-3 py-2">{a}</div>
                ))}
              </div>
            )}
            <Button className="w-full mt-4" size="sm" onClick={() => onGo("telemetria")}><Activity size={15} /> Ver telemetría</Button>
          </Card>
        </div>
      </div>
    </div>
  );
}

// -------------------- CATÁLOGO (CRUD + preview en vivo + brochure IA) --------------------
function Catalogo({ fleet }: { fleet: Machine[] }) {
  const [formOpen, setFormOpen] = useState(false);
  const [editingMachine, setEditingMachine] = useState<Machine | null>(null);
  const [detailMachine, setDetailMachine] = useState<Machine | null>(null);
  const removeMachine = useStore((s) => s.removeMachine);
  const updateMachine = useStore((s) => s.updateMachine);

  const cycleStatus = (m: Machine) => {
    const order: MachineStatus[] = ["operativo", "mantenimiento", "fuera_servicio"];
    const next = order[(order.indexOf(m.status) + 1) % order.length];
    updateMachine(m.id, { status: next });
  };

  const openNew = () => { setEditingMachine(null); setFormOpen(true); };
  const openEdit = (m: Machine) => { setDetailMachine(null); setEditingMachine(m); setFormOpen(true); };

  return (
    <div className="stagger space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Header title="Mi catálogo" sub="Gestiona tu flota con previsualización en vivo" />
        <Button onClick={openNew}><Plus size={18} /> Nueva unidad</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {fleet.map((m) => {
          const s = statusMeta[m.status];
          return (
            <div key={m.id} className="space-y-2">
              <MachineCard machine={m} onClick={() => setDetailMachine(m)} />
              {/* Fila de acciones — debajo de la tarjeta, sin superponer "Ver ficha" */}
              <div className="flex items-center gap-1.5">
                <button onClick={() => setDetailMachine(m)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-white shadow-float ring-1 ring-slate-100 text-xs font-semibold text-slate-600 hover:text-agua-600 py-2 transition">
                  <Eye size={14} /> Ver ficha
                </button>
                <button onClick={() => openEdit(m)} title="Editar unidad"
                  className="w-9 h-9 shrink-0 grid place-items-center rounded-xl bg-white shadow-float ring-1 ring-slate-100 text-slate-600 hover:text-agua-600 transition">
                  <Pencil size={14} />
                </button>
                <button onClick={() => cycleStatus(m)} title={`Cambiar estado · actual: ${s.label}`}
                  className="w-9 h-9 shrink-0 grid place-items-center rounded-xl bg-white shadow-float ring-1 ring-slate-100 text-slate-600 hover:text-earth-400 transition">
                  <RefreshCw size={14} />
                </button>
                <button onClick={() => removeMachine(m.id)} title="Eliminar unidad"
                  className="w-9 h-9 shrink-0 grid place-items-center rounded-xl bg-white shadow-float ring-1 ring-slate-100 text-slate-600 hover:text-terra-500 transition">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <MachineFormModal open={formOpen} onClose={() => setFormOpen(false)} machine={editingMachine} />
      {detailMachine && (
        <MachineDetailModal machine={detailMachine} onClose={() => setDetailMachine(null)} onEdit={() => openEdit(detailMachine)} />
      )}
    </div>
  );
}

// Formulario único para crear o editar una unidad (según se le pase `machine`)
function MachineFormModal({ open, onClose, machine }: { open: boolean; onClose: () => void; machine?: Machine | null }) {
  const addMachine = useStore((s) => s.addMachine);
  const updateMachine = useStore((s) => s.updateMachine);
  const PROVIDER_ID = useProviderId();
  const isEdit = !!machine;
  const [photo, setPhoto] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    brand: "John Deere", model: "", horsepower: 100, hourmeter: 0,
    district: "Salaverry", pricePerHourSeca: 65, pricePerHourOperada: 105, status: "operativo" as MachineStatus,
  });
  const [implementsList, setImplementsList] = useState<MachineImplement[]>([]);
  const [newImplementText, setNewImplementText] = useState("");
  const [newImplementPrice, setNewImplementPrice] = useState(implementRate(IMPLEMENTS[0], 100));
  const set = (k: string, v: string | number) => setForm((f) => ({ ...f, [k]: v }));

  // Al abrir en modo edición, precarga los datos de la unidad seleccionada (incluido el
  // horómetro real); al abrir en modo creación, reinicia el formulario.
  useEffect(() => {
    if (!open) return;
    if (machine) {
      setForm({
        brand: machine.brand, model: machine.model, horsepower: machine.horsepower,
        hourmeter: machine.telemetry?.hourmeter ?? 0,
        district: machine.district, pricePerHourSeca: machine.pricePerHourSeca,
        pricePerHourOperada: machine.pricePerHourOperada, status: machine.status,
      });
      setImplementsList(machine.implements ?? []);
      setPhoto(machine.imageUrl);
    } else {
      setForm({ brand: "John Deere", model: "", horsepower: 100, hourmeter: 0, district: "Salaverry", pricePerHourSeca: 65, pricePerHourOperada: 105, status: "operativo" });
      setImplementsList([{ type: "Arado de discos", pricePerHour: implementRate("Arado de discos", 100) }]);
      setPhoto(null);
    }
    setNewImplementText("");
  }, [open, machine]);

  // Valida el implemento escrito a mano contra la lista real: coincidencia exacta
  // (ignorando mayúsculas) -> reconocido; parecido pero no exacto -> probable error
  // de tipeo, se sugiere la palabra correcta.
  const normalized = newImplementText.trim().toLowerCase();
  const exactMatch = IMPLEMENTS.find((i) => i.toLowerCase() === normalized) ?? null;
  const closest = !exactMatch && normalized ? closestMatch(normalized, IMPLEMENTS) : null;
  const suggestion = closest && isTypoOf(closest.distance, closest.match.length) ? closest.match : null;
  const recognizedType: ImplementType | null = exactMatch;

  // Sugiere el precio ya establecido para ese implemento en cuanto se reconoce un tipo válido
  useEffect(() => {
    if (recognizedType) setNewImplementPrice(implementRate(recognizedType, Number(form.horsepower) || 0));
  }, [recognizedType, form.horsepower]);

  const addImplement = () => {
    if (!recognizedType) return;
    setImplementsList((list) => {
      if (list.some((i) => i.type === recognizedType)) {
        return list.map((i) => (i.type === recognizedType ? { ...i, pricePerHour: newImplementPrice } : i));
      }
      return [...list, { type: recognizedType, pricePerHour: newImplementPrice }];
    });
    setNewImplementText("");
  };
  const removeImplementAt = (idx: number) => setImplementsList((list) => list.filter((_, i) => i !== idx));
  const updateImplementPrice = (idx: number, price: number) =>
    setImplementsList((list) => list.map((it, i) => (i === idx ? { ...it, pricePerHour: price } : it)));

  // Sube una foto real de la unidad (JPG/PNG) desde el equipo -> se guarda como
  // data URL, así queda visible al instante sin depender de un servidor de archivos.
  const onPickPhoto = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result as string);
    reader.readAsDataURL(file);
  };

  const save = () => {
    if (implementsList.length === 0) return;
    if (isEdit && machine) {
      updateMachine(machine.id, {
        brand: form.brand as Machine["brand"], model: form.model || machine.model,
        horsepower: Number(form.horsepower), implements: implementsList,
        district: form.district as Machine["district"], pricePerHourSeca: Number(form.pricePerHourSeca),
        pricePerHourOperada: Number(form.pricePerHourOperada), status: form.status,
        imageUrl: photo ?? machine.imageUrl,
        telemetry: { ...machine.telemetry, hourmeter: Number(form.hourmeter) || 0 },
      });
    } else {
      const m: Machine = {
        id: uid("mac"), providerId: PROVIDER_ID,
        brand: form.brand as Machine["brand"], model: form.model || "Modelo nuevo",
        year: 2024, horsepower: Number(form.horsepower), implements: implementsList,
        district: form.district as Machine["district"],
        pricePerHourSeca: Number(form.pricePerHourSeca), pricePerHourOperada: Number(form.pricePerHourOperada),
        status: "operativo", imageUrl: photo ?? BRAND_IMG[form.brand], rating: 5, totalJobs: 0,
        telemetry: { hourmeter: Number(form.hourmeter) || 0, fuelLevel: 100, engineTemp: 80, nextServiceInHours: 250, activeAlerts: [] },
        specs: { transmission: "—", fuelTank: 200, weight: 4500, tractionType: "4WD" },
      };
      addMachine(m); // pub/sub -> aparece al instante en toda la app
    }
    setPhoto(null);
    onClose();
  };

  const previewImplements = implementsList.length > 0 ? implementsList : [{ type: (recognizedType ?? IMPLEMENTS[0]) as ImplementType, pricePerHour: newImplementPrice }];
  const preview: Machine = machine ? {
    ...machine,
    brand: form.brand as Machine["brand"], model: form.model || machine.model,
    horsepower: Number(form.horsepower), implements: previewImplements,
    district: form.district as Machine["district"], pricePerHourSeca: Number(form.pricePerHourSeca),
    pricePerHourOperada: Number(form.pricePerHourOperada), status: form.status, imageUrl: photo ?? machine.imageUrl,
    telemetry: { ...machine.telemetry, hourmeter: Number(form.hourmeter) || 0 },
  } : {
    id: "preview", providerId: PROVIDER_ID, brand: form.brand as Machine["brand"],
    model: form.model || "Vista previa", year: 2024, horsepower: Number(form.horsepower),
    implements: previewImplements, district: form.district as Machine["district"],
    pricePerHourSeca: Number(form.pricePerHourSeca), pricePerHourOperada: Number(form.pricePerHourOperada),
    status: "operativo", imageUrl: photo ?? BRAND_IMG[form.brand], rating: 5, totalJobs: 0,
    telemetry: { hourmeter: Number(form.hourmeter) || 0, fuelLevel: 100, engineTemp: 80, nextServiceInHours: 250, activeAlerts: [] },
    specs: { transmission: "—", fuelTank: 200, weight: 4500, tractionType: "4WD" },
  };

  const bracket = rateBracketForHp(Number(form.horsepower) || 0);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="glass relative w-full max-w-4xl rounded-2xl shadow-float p-6 animate-fade-in-up max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold text-xl text-slate-800">{isEdit ? `Editar ${machine!.brand} ${machine!.model}` : "Registrar nueva unidad"}</h3>
          <button onClick={onClose} className="w-8 h-8 shrink-0 grid place-items-center rounded-lg hover:bg-slate-100 text-slate-500 hover:text-terra-500" title="Cerrar">
            <X size={16} />
          </button>
        </div>

        <div className="grid md:grid-cols-5 gap-6">
          {/* Datos de la unidad */}
          <div className="md:col-span-3 space-y-3">
            <div className="grid sm:grid-cols-2 gap-3">
              {/* Foto real de la unidad */}
              <div>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onPickPhoto} />
                {photo ? (
                  <div className="relative rounded-xl overflow-hidden border border-slate-200 h-full min-h-[8.5rem]">
                    <img src={photo} alt="Foto de la unidad" className="w-full h-full object-cover" />
                    <button
                      onClick={() => { setPhoto(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                      className="absolute top-2 right-2 w-7 h-7 grid place-items-center rounded-lg bg-white/90 shadow-float text-slate-600 hover:text-terra-500"
                      title="Quitar foto"
                    >
                      <X size={14} />
                    </button>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-2 right-2 text-[11px] font-semibold bg-white/90 rounded-lg px-2 py-1 shadow-float text-slate-600 hover:text-agua-600"
                    >
                      Cambiar foto
                    </button>
                  </div>
                ) : (
                  <button onClick={() => fileInputRef.current?.click()}
                    className="w-full h-full min-h-[8.5rem] flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-earth-300 bg-earth-50/60 text-sm font-semibold text-earth-500 hover:bg-earth-50 transition">
                    <ImagePlus size={18} /> Subir foto real de la unidad
                  </button>
                )}
                <p className="text-[11px] text-slate-400 mt-1">JPG o PNG. Si no subes una foto, se usa una imagen genérica de la marca.</p>
              </div>

              <div className="space-y-3">
                <Field label="Marca">
                  <select className={inputCls} value={form.brand} onChange={(e) => set("brand", e.target.value)}>
                    {BRANDS.map((b) => <option key={b}>{b}</option>)}
                  </select>
                </Field>
                <Field label="Modelo"><input className={inputCls} value={form.model} onChange={(e) => set("model", e.target.value)} placeholder="Ej. 6155M" /></Field>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Potencia (HP)"><input type="number" className={inputCls} value={form.horsepower} onChange={(e) => set("horsepower", +e.target.value)} /></Field>
              <Field label="Horómetro (h)">
                <div className="relative">
                  <GaugeIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="number" min={0} className={`${inputCls} pl-8`} value={form.hourmeter} onChange={(e) => set("hourmeter", +e.target.value)} />
                </div>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Distrito">
                <select className={inputCls} value={form.district} onChange={(e) => set("district", e.target.value)}>
                  {DISTRICTS.map((d) => <option key={d}>{d}</option>)}
                </select>
              </Field>
              {isEdit && (
                <Field label="Estado">
                  <select className={inputCls} value={form.status} onChange={(e) => set("status", e.target.value)}>
                    <option value="operativo">Operativo</option>
                    <option value="mantenimiento">Mantenimiento</option>
                    <option value="fuera_servicio">Fuera de servicio</option>
                  </select>
                </Field>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Precio/h · máquina seca (S/)"><input type="number" className={inputCls} value={form.pricePerHourSeca} onChange={(e) => set("pricePerHourSeca", +e.target.value)} /></Field>
              <Field label="Precio/h · máquina operada (S/)"><input type="number" className={inputCls} value={form.pricePerHourOperada} onChange={(e) => set("pricePerHourOperada", +e.target.value)} /></Field>
            </div>
            <p className="text-[11px] text-slate-400 -mt-1">
              Sugerido para {bracket.label}: S/ {bracket.range.secaMin}–{bracket.range.secaMax} (seca) · S/ {bracket.range.operadaMin}–{bracket.range.operadaMax} (operada).
              El cliente elige la modalidad al reservar; tú solo fijas el precio de cada una.
            </p>
          </div>

          {/* Previsualización en vivo */}
          <div className="md:col-span-2">
            <p className="text-xs font-semibold text-slate-500 mb-2 flex items-center gap-1.5"><Sparkles size={13} className="text-agua-500" /> Previsualización en vivo</p>
            <MachineCard machine={preview} />
          </div>
        </div>

        {/* Implementos y su precio/hora — sección centrada */}
        <div className="mt-6 max-w-xl mx-auto">
          <div className="rounded-xl border border-slate-200 p-4 space-y-3">
            <p className="text-xs font-semibold text-slate-500 flex items-center justify-center gap-1.5"><Wrench size={13} /> Implementos y precio/hora</p>

            {implementsList.length > 0 && (
              <div className="space-y-1.5">
                {implementsList.map((imp, idx) => (
                  <div key={`${imp.type}-${idx}`} className="flex items-center gap-2 rounded-lg bg-slate-50/70 px-2.5 py-1.5">
                    <span className="flex-1 text-xs font-semibold text-slate-700 truncate">{imp.type}</span>
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-[11px] text-slate-400">S/</span>
                      <input
                        type="number" min={0} value={imp.pricePerHour}
                        onChange={(e) => updateImplementPrice(idx, +e.target.value)}
                        className="w-16 rounded-lg border border-slate-200 px-1.5 py-1 text-xs text-right focus:outline-none focus:ring-1 focus:ring-agua-400"
                        title="Editar precio/hora"
                      />
                      <span className="text-[11px] text-slate-400">/h</span>
                      <button type="button" onClick={() => removeImplementAt(idx)} className="text-slate-400 hover:text-terra-500 ml-1" title="Quitar implemento">
                        <X size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <input
                  list="implement-suggestions"
                  className={`${inputCls} flex-1 py-1.5 text-xs`}
                  value={newImplementText}
                  onChange={(e) => setNewImplementText(e.target.value)}
                  placeholder="Escribe un implemento (ej. Fumigadora)"
                />
                <datalist id="implement-suggestions">
                  {IMPLEMENTS.map((i) => <option key={i} value={i} />)}
                </datalist>
                <input type="number" min={0} className={`${inputCls} w-20 py-1.5 text-xs`} value={newImplementPrice} onChange={(e) => setNewImplementPrice(+e.target.value)} />
                <button type="button" onClick={addImplement} disabled={!recognizedType} title="Agregar implemento"
                  className="w-8 h-8 shrink-0 grid place-items-center rounded-lg bg-agua-500 text-white hover:bg-agua-600 disabled:opacity-40 disabled:hover:bg-agua-500 transition">
                  <Plus size={14} />
                </button>
              </div>
              {suggestion && (
                <p className="text-[11px] text-amber-600 text-center">
                  ¿Quisiste decir "{suggestion}"?{" "}
                  <button type="button" onClick={() => setNewImplementText(suggestion)} className="underline font-semibold">Usar sugerencia</button>
                </p>
              )}
              {!recognizedType && !suggestion && normalized && (
                <p className="text-[11px] text-terra-500 text-center">No reconocemos ese implemento. Verifica la ortografía o elige uno de la lista.</p>
              )}
            </div>

            {implementsList.length === 0 && <p className="text-[11px] text-terra-500 text-center">Agrega al menos un implemento para poder publicar la unidad.</p>}
          </div>
        </div>

        <div className="flex gap-2 mt-6 max-w-xl mx-auto">
          <Button variant="ghost" className="flex-1" onClick={onClose}>Cancelar</Button>
          <Button className="flex-1" disabled={implementsList.length === 0} onClick={save}>{isEdit ? "Guardar cambios" : "Publicar unidad"}</Button>
        </div>
      </div>
    </div>
  );
}

// -------------------- FICHA DE LA UNIDAD (solo lectura, vista proveedor) --------------------
function MachineDetailModal({ machine, onClose, onEdit }: { machine: Machine; onClose: () => void; onEdit: () => void }) {
  const s = statusMeta[machine.status];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="glass relative w-full max-w-3xl rounded-2xl shadow-float overflow-hidden animate-fade-in-up max-h-[92vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-3 right-3 z-10 w-8 h-8 grid place-items-center rounded-lg bg-white/80 text-slate-600 hover:text-terra-500"><X size={16} /></button>
        <div className="grid md:grid-cols-2">
          <div>
            <img src={machine.imageUrl} className="w-full h-48 md:h-full object-cover" />
          </div>
          <div className="p-6">
            <p className="text-xs font-semibold text-earth-400 uppercase">{machine.brand}</p>
            <h3 className="font-display font-black text-2xl text-slate-900">{machine.model}</h3>
            <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
              <span className={`inline-flex items-center gap-1.5 font-semibold ${s.text}`}><span className={`w-2 h-2 rounded-full ${s.dot}`} /> {s.label}</span>
              <span className="inline-flex items-center gap-1"><MapPin size={13} /> {machine.district}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4 text-sm">
              <SpecBox l="Potencia" v={`${machine.horsepower} HP`} />
              <SpecBox l="Transmisión" v={machine.specs?.transmission ?? "—"} />
              <SpecBox l="Tanque" v={`${machine.specs?.fuelTank ?? "—"} L`} />
              <SpecBox l="Peso" v={`${machine.specs?.weight ?? "—"} kg`} />
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              <div className="rounded-xl bg-slate-50/70 p-3">
                <p className="text-[11px] text-slate-400">Máquina seca / hora</p>
                <p className="font-display font-bold text-slate-800">{soles(machine.pricePerHourSeca)}</p>
              </div>
              <div className="rounded-xl bg-slate-50/70 p-3">
                <p className="text-[11px] text-slate-400">Máquina operada / hora</p>
                <p className="font-display font-bold text-slate-800">{soles(machine.pricePerHourOperada)}</p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-[11px] font-semibold text-slate-500 mb-1.5 flex items-center gap-1"><Wrench size={12} /> Implementos disponibles</p>
              <div className="flex flex-wrap gap-1.5">
                {(machine.implements ?? []).map((i) => (
                  <Badge key={i.type} tone="earth">{i.type} · {soles(i.pricePerHour)}/h</Badge>
                ))}
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <Button variant="ghost" className="flex-1" onClick={onClose}>Cerrar</Button>
              <Button className="flex-1" onClick={onEdit}><Pencil size={15} /> Editar unidad</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
function SpecBox({ l, v }: { l: string; v: string }) {
  return (<div className="rounded-lg bg-slate-50/70 px-3 py-2"><p className="text-[11px] text-slate-400">{l}</p><p className="text-sm font-semibold text-slate-700">{v}</p></div>);
}

// -------------------- TELEMETRÍA --------------------
function Telemetria({ fleet }: { fleet: Machine[] }) {
  const [sel, setSel] = useState(fleet[0]?.id);
  const machine = fleet.find((m) => m.id === sel) ?? fleet[0];
  return (
    <div className="relative">
      <SectionWatermark tone="earth" />
      <div className="stagger space-y-6 relative z-10">
        <Header title="Telemetría de flota" sub="Monitoreo simulado en tiempo real" />
        <div className="flex gap-2 flex-wrap">
          {fleet.map((m) => (
            <button key={m.id} onClick={() => setSel(m.id)}
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition ${sel === m.id ? "bg-earth-400 text-white shadow-float" : "bg-white/70 text-slate-600 hover:bg-white"}`}>
              {m.model}
            </button>
          ))}
        </div>
        {machine && <TelemetryPanel machine={machine} />}
      </div>
    </div>
  );
}

// -------------------- RESERVAS (gestión de solicitudes entrantes) --------------------
function Reservas() {
  const PROVIDER_ID = useProviderId();
  const reservations = useStore(selectReservationsByProvider(PROVIDER_ID));
  const machines = useStore((s) => s.machines);
  const users = useStore((s) => s.users);
  const fields = useStore((s) => s.fields);
  const setReservationStatus = useStore((s) => s.setReservationStatus);

  const nextActions: Partial<Record<ReservationStatus, { label: string; icon: JSX.Element; to: ReservationStatus; variant: "primary" | "secondary" | "danger" }[]>> = {
    borrador: [
      { label: "Confirmar", icon: <Check size={14} />, to: "confirmada", variant: "primary" },
      { label: "Rechazar", icon: <Ban size={14} />, to: "cancelada", variant: "danger" },
    ],
    confirmada: [
      { label: "Iniciar trabajo", icon: <PlayCircle size={14} />, to: "en_curso", variant: "primary" },
      { label: "Cancelar", icon: <Ban size={14} />, to: "cancelada", variant: "danger" },
    ],
    en_curso: [
      { label: "Finalizar", icon: <FlagTriangleRight size={14} />, to: "finalizada", variant: "primary" },
    ],
  };

  return (
    <div className="relative">
      <SectionWatermark tone="earth" />
      <div className="stagger space-y-6 relative z-10">
        <Header title="Reservas" sub="Confirma, inicia y cierra las solicitudes de tus clientes" />
        {reservations.length === 0 ? (
          <Card className="p-8 text-center text-sm text-slate-400">Aún no tienes solicitudes de reserva.</Card>
        ) : (
          <div className="space-y-3">
            {reservations.map((r) => {
              const m = machines.find((mm) => mm.id === r.machineId);
              const client = users.find((u) => u.id === r.clientId);
              const field: FarmField | undefined = fields.find((f) => f.id === r.fieldId);
              const st = reservationStatusMeta[r.status];
              const actions = nextActions[r.status] ?? [];
              const isCompany = client?.accountType === "empresa";
              return (
                <Card key={r.id} className="p-4 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <img src={m?.imageUrl} loading="lazy" decoding="async" className="w-16 h-12 rounded-lg object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800">{m ? `${m.brand} ${m.model}` : r.machineId}</p>
                      <p className="text-xs text-slate-400">{r.days} día(s) · {r.serviceMode === "operada" ? "Máquina operada" : "Máquina seca"} · {r.implementType} · {soles(r.estimatedCost)}</p>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${st.text} shrink-0`}>
                      <span className={`w-2 h-2 rounded-full ${st.dot}`} /> {st.label}
                    </span>
                  </div>

                  {/* Datos de quien solicita — visibles antes de confirmar o rechazar */}
                  <div className="rounded-xl bg-slate-50/70 p-3 grid sm:grid-cols-2 gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 grid place-items-center text-white font-bold text-xs" style={{ background: client?.avatarColor ?? "#94a3b8" }}>
                        {client?.avatarUrl ? (
                          <img src={client.avatarUrl} alt={client.name} className="w-full h-full object-cover" />
                        ) : (
                          client?.name.split(" ").map((s) => s[0]).slice(0, 2).join("") ?? "?"
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-800 truncate flex items-center gap-1">
                          {client?.name ?? "Cliente"} {client?.verified && <BadgeCheck size={12} className="text-agua-500 shrink-0" />}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate flex items-center gap-1">
                          {isCompany ? <Building2 size={11} className="shrink-0" /> : <UserIcon size={11} className="shrink-0" />}
                          {isCompany ? client?.company : "Cliente individual"}
                        </p>
                        <p className="text-[11px] text-slate-400 flex items-center gap-1"><Phone size={11} className="shrink-0" /> {client?.phone ?? "—"}</p>
                      </div>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold text-slate-500 flex items-center gap-1"><MapPin size={11} /> Campo de trabajo</p>
                      <p className="text-xs text-slate-700 font-medium truncate">{field ? `${field.name} · ${field.district}` : "—"}</p>
                      <p className="text-[11px] text-slate-400 flex items-center gap-1"><Sprout size={11} className="shrink-0" /> {field ? `${field.hectares} ha · ${field.crop}` : "Sin datos del campo"}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end">
                    {actions.map((a) => (
                      <Button key={a.label} size="sm" variant={a.variant} onClick={() => setReservationStatus(r.id, a.to)}>
                        {a.icon} {a.label}
                      </Button>
                    ))}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// -------------------- MÉTRICAS HISTÓRICAS --------------------
function Metricas() {
  const PROVIDER_ID = useProviderId();
  const history = monthlyMetrics[PROVIDER_ID] ?? [];
  const maxRevenue = Math.max(...history.map((h) => h.revenue), 1);
  const totalRevenue = history.reduce((a, h) => a + h.revenue, 0);
  const totalJobs = history.reduce((a, h) => a + h.jobs, 0);
  const avgUtil = Math.round(history.reduce((a, h) => a + h.utilization, 0) / (history.length || 1));

  if (history.length === 0) {
    return (
      <div className="relative">
        <SectionWatermark tone="earth" />
        <div className="stagger space-y-6 relative z-10">
          <Header title="Métricas históricas" sub="Desempeño de tu flota en los últimos 6 meses" />
          <Card className="p-8 text-center text-sm text-slate-400">
            Aún no tienes historial de operación. Las métricas aparecerán aquí una vez completes tus primeros trabajos.
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <SectionWatermark tone="earth" />
      <div className="stagger space-y-6 relative z-10">
        <Header title="Métricas históricas" sub="Desempeño de tu flota en los últimos 6 meses" />
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <Stat k={soles(totalRevenue)} v="Ingresos acumulados" tone="earth" />
          <Stat k={String(totalJobs)} v="Trabajos completados" tone="agua" />
          <Stat k={`${avgUtil}%`} v="Utilización promedio de flota" tone="amber" />
        </div>

        <Card className="p-6">
          <h3 className="font-display font-bold text-slate-800 mb-5">Ingresos mensuales (S/)</h3>
          <div className="flex items-end gap-4 h-48">
            {history.map((h) => (
              <div key={h.month} className="flex-1 flex flex-col items-center justify-end h-full gap-2">
                <span className="text-xs font-semibold text-slate-600">{soles(h.revenue)}</span>
                <div
                  className="w-full rounded-t-lg bg-gradient-to-t from-earth-400 to-earth-200 transition-all duration-700"
                  style={{ height: `${Math.max(6, (h.revenue / maxRevenue) * 100)}%` }}
                />
                <span className="text-xs font-semibold text-slate-400">{h.month}</span>
              </div>
            ))}
          </div>
        </Card>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="font-display font-bold text-slate-800 mb-4">Utilización de flota</h3>
            <div className="space-y-3">
              {history.map((h) => (
                <div key={h.month}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-500">{h.month}</span>
                    <span className="font-semibold text-agua-600">{h.utilization}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full rounded-full bg-agua-500 transition-all duration-700" style={{ width: `${h.utilization}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-display font-bold text-slate-800 mb-4">Trabajos por mes</h3>
            <div className="space-y-3">
              {history.map((h) => (
                <div key={h.month} className="flex items-center gap-3">
                  <span className="w-8 text-xs font-semibold text-slate-400 shrink-0">{h.month}</span>
                  <div className="flex-1 h-2.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-earth-400 transition-all duration-700"
                      style={{ width: `${(h.jobs / Math.max(...history.map((x) => x.jobs), 1)) * 100}%` }}
                    />
                  </div>
                  <span className="w-6 text-xs font-semibold text-slate-600 text-right shrink-0">{h.jobs}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// -------------------- helpers UI --------------------
function Header({ title, sub }: { title: string; sub: string }) {
  return (
    <div>
      <h1 className="font-display font-black text-2xl sm:text-3xl text-slate-900">{title}</h1>
      <p className="text-slate-500 text-sm mt-0.5">{sub}</p>
    </div>
  );
}
function Stat({ k, v, tone }: { k: string; v: string; tone: "agua" | "earth" | "amber" }) {
  const c = { agua: "text-agua-600", earth: "text-earth-400", amber: "text-amber-600" }[tone];
  return (
    <Card className="p-5" hover>
      <p className={`font-display font-black text-2xl sm:text-3xl ${c}`}>{k}</p>
      <p className="text-sm text-slate-500 font-medium mt-1">{v}</p>
    </Card>
  );
}
