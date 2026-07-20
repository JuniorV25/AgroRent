import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  LayoutDashboard, Search, Sprout, Plus, Trash2, MapPin, SlidersHorizontal, Calculator, X,
  ClipboardList, ShieldCheck, CheckCircle2, Wrench, Scale, Trophy,
} from "lucide-react";
import { useStore, selectReservationsByClient, MAX_COMPARE } from "../../../store/useStore";
import type { Machine, ServiceMode, ImplementType } from "../../machinery/types";
import type { Field as FieldT } from "../../fields/types";
import { BRANDS } from "../../machinery/data";
import { CROPS } from "../../fields/data";
import { REGIONS, regionOfDistrict, type Region } from "../../../core/constants/districts";
import { CONTRACT_CLAUSES } from "../../rentals/data";
import { statusMeta } from "../../machinery/status";
import { reservationStatusMeta } from "../../rentals/status";
import { estimateCost } from "../../rentals/pricing";
import { soles, uid } from "../../../core/utils/format";
import DashboardShell, { NavItem } from "../layout/DashboardShell";
import { Card, Button, Badge, Field, inputCls, Modal, Pagination, DistrictOptions } from "../../../core/ui";
import MachineCard from "../../machinery/components/MachineCard";
import ChatWidget from "../../rentals/components/ChatWidget";
import { ProviderPanel, ProviderChip } from "../../providers/components/ProviderInfo";

const NAV: NavItem[] = [
  { id: "resumen", label: "Resumen", icon: <LayoutDashboard size={18} /> },
  { id: "buscar", label: "Buscar maquinaria", icon: <Search size={18} /> },
  { id: "comparar", label: "Comparar máquinas", icon: <Scale size={18} /> },
  { id: "campos", label: "Mis campos", icon: <Sprout size={18} /> },
  { id: "reservas", label: "Mis reservas", icon: <ClipboardList size={18} /> },
];

// Multi-usuario real: cada cliente ve únicamente sus propios campos y reservas.
function useOwnerId() {
  return useStore((s) => s.user?.id ?? "");
}

export default function ClientDashboard() {
  const [tab, setTab] = useState("resumen");
  const OWNER = useOwnerId();
  const reservations = useStore(selectReservationsByClient(OWNER));
  return (
    <>
      <DashboardShell nav={NAV} active={tab} onNav={setTab} accent="agua">
        {tab === "resumen" && <Resumen onGo={setTab} />}
        {tab === "buscar" && <Buscar />}
        {tab === "comparar" && <Comparar onGo={setTab} />}
        {tab === "campos" && <Campos />}
        {tab === "reservas" && <MisReservas />}
      </DashboardShell>
      <ChatWidget role="cliente" reservations={reservations} />
    </>
  );
}

// -------------------- RESUMEN --------------------
function Resumen({ onGo }: { onGo: (t: string) => void }) {
  const OWNER = useOwnerId();
  const company = useStore((s) => s.user?.company) ?? "";
  const fields = useStore((s) => s.fields).filter((f) => f.ownerId === OWNER);
  const machines = useStore((s) => s.machines);
  const totalHa = fields.reduce((a, f) => a + f.hectares, 0);
  const disponibles = machines.filter((m) => m.status === "operativo").length;

  return (
    <div className="stagger space-y-6">
      <Header title="Panel del Cliente" sub={`TraktorRent · ${company}`} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat k={String(fields.length)} v="Campos registrados" />
        <Stat k={`${totalHa} ha`} v="Superficie total" />
        <Stat k={String(disponibles)} v="Máquinas disponibles" />
        <Stat k="2" v="Regiones con cobertura" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-slate-800">Recomendado para tus cultivos</h3>
            <Button size="sm" variant="secondary" onClick={() => onGo("buscar")}>Ver todo</Button>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {machines.filter((m) => m.status === "operativo").slice(0, 2).map((m) => (
              <MachineCard key={m.id} machine={m} onClick={() => onGo("buscar")} showCompare />
            ))}
          </div>
        </Card>
        <Card className="p-6">
          <h3 className="font-display font-bold text-slate-800 mb-4">Mis campos</h3>
          <div className="space-y-2">
            {fields.map((f) => (
              <div key={f.id} className="flex items-center gap-3 rounded-xl bg-slate-50/70 p-2.5">
                <div className="w-9 h-9 grid place-items-center rounded-lg bg-agua-500 text-white"><Sprout size={16} /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{f.name}</p>
                  <p className="text-xs text-slate-400">{f.hectares} ha · {f.crop}</p>
                </div>
              </div>
            ))}
          </div>
          <Button className="w-full mt-4" size="sm" onClick={() => onGo("campos")}><Plus size={15} /> Gestionar campos</Button>
        </Card>
      </div>
    </div>
  );
}

// -------------------- BUSCADOR INTELIGENTE --------------------
function Buscar() {
  const machines = useStore((s) => s.machines);
  const [q, setQ] = useState("");
  const [brand, setBrand] = useState("Todas");
  const [region, setRegion] = useState<Region | "Todas">("Todas");
  const [district, setDistrict] = useState("Todos");
  const [maxPrice, setMaxPrice] = useState(400);
  const [minHp, setMinHp] = useState(0);
  const [selected, setSelected] = useState<Machine | null>(null);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 15;

  // Al cambiar de región, el distrito elegido puede quedar fuera de esa
  // región: se reinicia a "Todos" para no filtrar por error a 0 resultados.
  const onRegionChange = (r: Region | "Todas") => {
    setRegion(r);
    setDistrict("Todos");
  };

  const results = useMemo(() => machines.filter((m) =>
    (brand === "Todas" || m.brand === brand) &&
    (region === "Todas" || regionOfDistrict(m.district) === region) &&
    (district === "Todos" || m.district === district) &&
    (m.pricePerHourSeca ?? 0) <= maxPrice && m.horsepower >= minHp &&
    (q === "" || `${m.brand} ${m.model} ${(m.implements ?? []).map((i) => i.type).join(" ")}`.toLowerCase().includes(q.toLowerCase()))
  ), [machines, brand, region, district, maxPrice, minHp, q]);

  const totalPages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const pageSafe = Math.min(page, totalPages);
  const paged = results.slice((pageSafe - 1) * PAGE_SIZE, pageSafe * PAGE_SIZE);

  // Reinicia a la página 1 cada vez que cambian los filtros de búsqueda
  useEffect(() => setPage(1), [q, brand, region, district, maxPrice, minHp]);

  return (
    <div className="space-y-6">
      <Header title="Buscar maquinaria" sub="Filtros avanzados + simulador de costos por campo" />

      {/* Barra de filtros glass */}
      <Card className="p-4">
        <div className="grid md:grid-cols-4 gap-3">
          <div className="md:col-span-2 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por marca, modelo o implemento…"
              className={`${inputCls} pl-9`} />
          </div>
          <select className={inputCls} value={brand} onChange={(e) => setBrand(e.target.value)}>
            <option>Todas</option>{BRANDS.map((b) => <option key={b}>{b}</option>)}
          </select>
          <select className={inputCls} value={region} onChange={(e) => onRegionChange(e.target.value as Region | "Todas")}>
            <option value="Todas">Todas las regiones</option>
            {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div className="mt-3">
          <select className={inputCls} value={district} onChange={(e) => setDistrict(e.target.value)}>
            <option value="Todos">Todos los distritos{region !== "Todas" ? ` de ${region}` : ""}</option>
            <DistrictOptions region={region === "Todas" ? undefined : region} />
          </select>
        </div>
        <div className="grid sm:grid-cols-2 gap-6 mt-4">
          <label className="text-xs font-semibold text-slate-500">
            <span className="flex items-center gap-1.5 mb-1"><SlidersHorizontal size={13} /> Precio máx / hora (seca): <b className="text-agua-600">{soles(maxPrice)}</b></span>
            <input type="range" min={30} max={400} step={5} value={maxPrice} onChange={(e) => setMaxPrice(+e.target.value)} className="w-full accent-agua-500" />
          </label>
          <label className="text-xs font-semibold text-slate-500">
            <span className="flex items-center gap-1.5 mb-1">Potencia mín: <b className="text-agua-600">{minHp} HP</b></span>
            <input type="range" min={0} max={480} step={10} value={minHp} onChange={(e) => setMinHp(+e.target.value)} className="w-full accent-agua-500" />
          </label>
        </div>
      </Card>

      <p className="text-sm text-slate-500 font-medium">
        {results.length} unidades encontradas{totalPages > 1 && ` · página ${pageSafe} de ${totalPages}`}
      </p>
      <div className="stagger grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {paged.map((m) => <MachineCard key={m.id} machine={m} onClick={() => setSelected(m)} showCompare />)}
      </div>

      <Pagination page={pageSafe} totalPages={totalPages} onChange={setPage} accent="agua" />

      {selected && <MachineDetail machine={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

// -------------------- COMPARAR MÁQUINAS --------------------
const COMPARE_COLORS = ["#0d9488", "#c19a5b", "#f59e0b"]; // agua · earth · amber (hasta MAX_COMPARE)

function Comparar({ onGo }: { onGo: (t: string) => void }) {
  const machines = useStore((s) => s.machines);
  const compareIds = useStore((s) => s.compareIds);
  const toggleCompare = useStore((s) => s.toggleCompare);
  const clearCompare = useStore((s) => s.clearCompare);
  const [q, setQ] = useState("");

  const selected = compareIds.map((id) => machines.find((m) => m.id === id)).filter((m): m is Machine => !!m);
  const full = selected.length >= MAX_COMPARE;

  // Búsqueda rápida para agregar sin salir de esta pestaña — solo se calcula y
  // se muestra cuando hay texto escrito, y se limita a pocos resultados, así
  // no se vuelve a renderizar el catálogo completo (eso era lento y poco práctico).
  const suggestions = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return [];
    return machines
      .filter((m) => !compareIds.includes(m.id) && `${m.brand} ${m.model}`.toLowerCase().includes(query))
      .slice(0, 5);
  }, [machines, q, compareIds]);

  // Determina qué unidad "gana" en cada indicador, para resaltarla en la tabla
  const bestId = (metric: (m: Machine) => number, dir: "min" | "max") => {
    if (selected.length === 0) return null;
    return selected.reduce((best, m) => {
      const v = metric(m), bv = metric(best);
      return (dir === "min" ? v < bv : v > bv) ? m : best;
    }, selected[0]).id;
  };
  const bestSeca = bestId((m) => m.pricePerHourSeca ?? 0, "min");
  const bestOperada = bestId((m) => m.pricePerHourOperada ?? 0, "min");
  const bestHp = bestId((m) => m.horsepower, "max");
  const bestRating = bestId((m) => m.rating, "max");

  // "Mejor opción" general: normaliza precio (menor = mejor), potencia y
  // valoración (mayor = mejor) entre 0 y 1 y combina con pesos, para elegir
  // un ganador aunque ninguna unidad lidere en todos los indicadores.
  const range = (vals: number[]) => {
    const min = Math.min(...vals), max = Math.max(...vals);
    return { min, max, span: max - min || 1 };
  };
  const priceOf = (m: Machine) => ((m.pricePerHourSeca ?? 0) + (m.pricePerHourOperada ?? 0)) / 2;
  const priceRange = range(selected.map(priceOf));
  const hpRange = range(selected.map((m) => m.horsepower));
  const ratingRange = range(selected.map((m) => m.rating));
  const overallScore = (m: Machine) => {
    const priceScore = 1 - (priceOf(m) - priceRange.min) / priceRange.span;
    const hpScore = (m.horsepower - hpRange.min) / hpRange.span;
    const ratingScore = (m.rating - ratingRange.min) / ratingRange.span;
    return priceScore * 0.4 + hpScore * 0.3 + ratingScore * 0.3;
  };
  const winner = selected.length > 0
    ? selected.reduce((best, m) => (overallScore(m) > overallScore(best) ? m : best), selected[0])
    : null;
  const winnerReasons: string[] = [];
  if (winner) {
    if (winner.id === bestSeca) winnerReasons.push("el precio más bajo en máquina seca");
    if (winner.id === bestOperada) winnerReasons.push("el precio más bajo en máquina operada");
    if (winner.id === bestHp) winnerReasons.push("la mayor potencia");
    if (winner.id === bestRating) winnerReasons.push("la mejor valoración");
  }
  const winnerReasonText = winnerReasons.length === 0
    ? "Ofrece el mejor equilibrio general entre precio, potencia y valoración, aunque otra unidad lidere en algún indicador puntual."
    : winnerReasons.length === 1
    ? `Tiene ${winnerReasons[0]} entre las unidades comparadas.`
    : `Tiene ${winnerReasons.slice(0, -1).join(", ")} y ${winnerReasons[winnerReasons.length - 1]} entre las unidades comparadas.`;

  return (
    <div className="stagger space-y-6">
      <Header title="Comparar máquinas" sub={`Toca "Comparar" en cualquier ficha del catálogo · hasta ${MAX_COMPARE} unidades a la vez`} />

      <Card className="p-4">
        <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
          <p className="text-xs font-semibold text-slate-500">{selected.length}/{MAX_COMPARE} unidades seleccionadas</p>
          {selected.length > 0 && (
            <button onClick={clearCompare} className="text-xs font-semibold text-slate-400 hover:text-terra-500 transition">Vaciar selección</button>
          )}
        </div>

        {selected.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {selected.map((m, i) => (
              <span key={m.id} className="inline-flex items-center gap-2 rounded-xl bg-slate-50/80 ring-1 ring-slate-100 pl-1.5 pr-2 py-1.5">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: COMPARE_COLORS[i] }} />
                <img src={m.imageUrl} className="w-8 h-6 rounded object-cover shrink-0" />
                <span className="text-xs font-semibold text-slate-700 truncate max-w-[9rem]">{m.brand} {m.model}</span>
                <button onClick={() => toggleCompare(m.id)} className="text-slate-400 hover:text-terra-500 shrink-0" title="Quitar"><X size={13} /></button>
              </span>
            ))}
          </div>
        )}

        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={q} onChange={(e) => setQ(e.target.value)}
            placeholder={full ? `Ya elegiste ${MAX_COMPARE} unidades (máximo)` : "Buscar marca o modelo para agregar…"}
            disabled={full}
            className={`${inputCls} pl-9 disabled:opacity-50 disabled:cursor-not-allowed`}
          />
        </div>
        {suggestions.length > 0 && (
          <div className="mt-2 space-y-1.5">
            {suggestions.map((m) => (
              <button key={m.id} type="button" onClick={() => { toggleCompare(m.id); setQ(""); }}
                className="w-full flex items-center gap-2.5 rounded-xl bg-white ring-1 ring-slate-100 hover:ring-agua-300 px-2.5 py-1.5 transition text-left">
                <img src={m.imageUrl} className="w-9 h-7 rounded object-cover shrink-0" />
                <span className="flex-1 min-w-0 text-xs font-semibold text-slate-700 truncate">{m.brand} {m.model} · {m.horsepower} HP</span>
                <Plus size={14} className="text-agua-500 shrink-0" />
              </button>
            ))}
          </div>
        )}
        {q.trim() && suggestions.length === 0 && !full && (
          <p className="text-[11px] text-slate-400 mt-2">Sin resultados para "{q}".</p>
        )}
      </Card>

      {selected.length === 0 ? (
        <Card className="p-8 text-center text-sm text-slate-400 space-y-3">
          <p>Aún no elegiste ninguna unidad. Ve al catálogo y toca el ícono <span className="inline-flex items-center gap-1 font-semibold text-slate-500"><Scale size={13} className="inline" /> Comparar</span> en la ficha de cada tractor.</p>
          <Button size="sm" onClick={() => onGo("buscar")}>Ir a Buscar maquinaria</Button>
        </Card>
      ) : selected.length < 2 ? (
        <Card className="p-8 text-center text-sm text-slate-400">
          Elige al menos 1 unidad más (máx. {MAX_COMPARE}) para ver la comparación.
        </Card>
      ) : (
        <>
          {/* Tabla comparativa */}
          <Card className="p-4 overflow-x-auto">
            <table className="w-full text-sm min-w-[560px]">
              <thead>
                <tr>
                  <th className="text-left text-xs font-semibold text-slate-400 pb-2 pr-3">Unidad</th>
                  {selected.map((m, i) => (
                    <th key={m.id} className="text-left pb-2 px-3 min-w-[9rem]">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: COMPARE_COLORS[i] }} />
                        <div className="min-w-0">
                          <p className="font-display font-bold text-slate-800 truncate">{m.brand}</p>
                          <p className="text-xs text-slate-400 truncate">{m.model}</p>
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <CompareRow label="Proveedor" cells={selected.map((m) => <ProviderChip key={m.id} providerId={m.providerId} />)} />
                <CompareRow label="Distrito" cells={selected.map((m) => m.district)} />
                <CompareRow label="Potencia" cells={selected.map((m) => `${m.horsepower} HP`)} highlight={selected.map((m) => m.id === bestHp)} />
                <CompareRow label="Precio · seca" cells={selected.map((m) => `${soles(m.pricePerHourSeca)}/h`)} highlight={selected.map((m) => m.id === bestSeca)} />
                <CompareRow label="Precio · operada" cells={selected.map((m) => `${soles(m.pricePerHourOperada)}/h`)} highlight={selected.map((m) => m.id === bestOperada)} />
                <CompareRow label="Valoración" cells={selected.map((m) => `★ ${m.rating.toFixed(1)}`)} highlight={selected.map((m) => m.id === bestRating)} />
                <CompareRow label="Horómetro" cells={selected.map((m) => `${(m.telemetry?.hourmeter ?? 0).toLocaleString()} h`)} />
                <CompareRow label="Implementos" cells={selected.map((m) => (m.implements ?? []).map((i) => i.type).join(", ") || "—")} />
                <CompareRow label="Estado" cells={selected.map((m) => statusMeta[m.status].label)} />
              </tbody>
            </table>
            <p className="text-[11px] text-slate-400 mt-3 flex items-center gap-1"><CheckCircle2 size={12} className="text-agua-500" /> Resaltado en verde: el mejor valor de cada indicador entre las unidades elegidas.</p>
          </Card>

          {/* Gráficos comparativos tipo dashboard: 2 circulares + 2 de barras */}
          <div className="grid md:grid-cols-2 gap-6">
            <CompareDonut title="Precio por hora · máquina seca (S/)" data={selected.map((m, i) => ({ label: `${m.brand} ${m.model}`, value: m.pricePerHourSeca, color: COMPARE_COLORS[i] }))} />
            <CompareDonut title="Potencia (HP)" data={selected.map((m, i) => ({ label: `${m.brand} ${m.model}`, value: m.horsepower, color: COMPARE_COLORS[i] }))} />
            <CompareChart title="Precio por hora · máquina operada (S/)" data={selected.map((m, i) => ({ label: `${m.brand} ${m.model}`, value: m.pricePerHourOperada, color: COMPARE_COLORS[i] }))} />
            <CompareChart title="Valoración (sobre 5)" data={selected.map((m, i) => ({ label: `${m.brand} ${m.model}`, value: m.rating, color: COMPARE_COLORS[i] }))} max={5} />
          </div>

          {/* Recomendación: mejor opción entre las unidades comparadas */}
          {winner && (
            <Card className="p-6 bg-gradient-to-br from-agua-50/80 to-white">
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 shrink-0 rounded-xl bg-agua-500 text-white grid place-items-center shadow-glow">
                  <Trophy size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-agua-600 uppercase tracking-wide">Mejor opción</p>
                  <h4 className="font-display font-black text-lg text-slate-800">{winner.brand} {winner.model}</h4>
                  <p className="text-sm text-slate-500 mt-1">{winnerReasonText}</p>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {winner.id === bestSeca && <Badge tone="agua">Precio más bajo · seca</Badge>}
                    {winner.id === bestOperada && <Badge tone="agua">Precio más bajo · operada</Badge>}
                    {winner.id === bestHp && <Badge tone="earth">Mayor potencia</Badge>}
                    {winner.id === bestRating && <Badge tone="amber">Mejor valorada</Badge>}
                  </div>
                </div>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

function CompareRow({ label, cells, highlight }: { label: string; cells: ReactNode[]; highlight?: boolean[] }) {
  return (
    <tr>
      <td className="text-xs font-semibold text-slate-500 py-2.5 pr-3 whitespace-nowrap align-top">{label}</td>
      {cells.map((c, i) => (
        <td key={i} className={`py-2.5 px-3 text-sm align-top ${highlight?.[i] ? "font-bold text-agua-600" : "text-slate-700"}`}>
          <span className="inline-flex items-center gap-1">{c} {highlight?.[i] && <CheckCircle2 size={13} className="text-agua-500 shrink-0" />}</span>
        </td>
      ))}
    </tr>
  );
}

function CompareDonut({ title, data }: { title: string; data: { label: string; value: number; color: string }[] }) {
  const total = data.reduce((a, d) => a + d.value, 0) || 1;
  let acc = 0;
  const stops = data.map((d) => {
    const start = (acc / total) * 100;
    acc += d.value;
    const end = (acc / total) * 100;
    return `${d.color} ${start}% ${end}%`;
  }).join(", ");

  return (
    <Card className="p-5">
      <h4 className="font-display font-bold text-slate-800 text-sm mb-4">{title}</h4>
      <div className="flex items-center gap-5">
        <div className="w-28 h-28 rounded-full shrink-0 grid place-items-center" style={{ background: `conic-gradient(${stops})` }}>
          <div className="w-16 h-16 rounded-full bg-white grid place-items-center text-center">
            <span className="text-[10px] font-semibold text-slate-400 leading-tight">Total<br />{Number.isInteger(total) ? total : total.toFixed(1)}</span>
          </div>
        </div>
        <div className="flex-1 min-w-0 space-y-1.5">
          {data.map((d) => (
            <div key={d.label} className="flex items-center gap-2 text-xs">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.color }} />
              <span className="flex-1 min-w-0 truncate text-slate-600 font-medium">{d.label}</span>
              <span className="font-semibold text-slate-700 shrink-0">{Math.round((d.value / total) * 100)}%</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

function CompareChart({ title, data, max }: { title: string; data: { label: string; value: number; color: string }[]; max?: number }) {
  const top = max ?? Math.max(...data.map((d) => d.value), 1);
  return (
    <Card className="p-5">
      <h4 className="font-display font-bold text-slate-800 text-sm mb-4">{title}</h4>
      <div className="space-y-3">
        {data.map((d) => (
          <div key={d.label}>
            <div className="flex justify-between text-xs mb-1 gap-2">
              <span className="font-semibold text-slate-600 truncate">{d.label}</span>
              <span className="font-semibold text-slate-500 shrink-0">{Number.isInteger(d.value) ? d.value : d.value.toFixed(1)}</span>
            </div>
            <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.max(4, (d.value / top) * 100)}%`, background: d.color }} />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// -------------------- FICHA + SIMULADOR DE COSTOS --------------------
function MachineDetail({ machine, onClose }: { machine: Machine; onClose: () => void }) {
  const OWNER = useOwnerId();
  const fields = useStore((s) => s.fields).filter((f) => f.ownerId === OWNER);
  const [fieldId, setFieldId] = useState(fields[0]?.id ?? "");
  const [days, setDays] = useState(5);
  const [serviceMode, setServiceMode] = useState<ServiceMode>("seca");
  const [implementType, setImplementType] = useState<ImplementType>(machine.implements?.[0]?.type ?? "Arado de discos");
  const [contractOpen, setContractOpen] = useState(false);
  const field = fields.find((f) => f.id === fieldId);
  const s = statusMeta[machine.status];

  const machineImplements = machine.implements ?? [];
  const chosenImplement = machineImplements.find((i) => i.type === implementType) ?? machineImplements[0];
  const hourlyRate = serviceMode === "operada" ? machine.pricePerHourOperada : machine.pricePerHourSeca;

  const est = field ? estimateCost({
    hourlyRate, implementRate: chosenImplement?.pricePerHour ?? 0,
    days, sameDistrict: field.district === machine.district,
  }) : null;

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
            <p className="text-xs font-semibold text-agua-600 uppercase">{machine.brand}</p>
            <h3 className="font-display font-black text-2xl text-slate-900">{machine.model}</h3>
            <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
              <span className={`inline-flex items-center gap-1.5 font-semibold ${s.text}`}><span className={`w-2 h-2 rounded-full ${s.dot}`} /> {s.label}</span>
              <span className="inline-flex items-center gap-1"><MapPin size={13} /> {machine.district}</span>
            </div>

            <div className="mt-3">
              <ProviderPanel providerId={machine.providerId} />
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4 text-sm">
              <Spec l="Potencia" v={`${machine.horsepower} HP`} />
              <Spec l="Transmisión" v={machine.specs?.transmission ?? "—"} />
              <Spec l="Tanque" v={`${machine.specs?.fuelTank ?? "—"} L`} />
              <Spec l="Máquina seca" v={`${soles(machine.pricePerHourSeca)}/h`} />
              <Spec l="Máquina operada" v={`${soles(machine.pricePerHourOperada)}/h`} />
            </div>

            <div className="mt-3">
              <p className="text-[11px] font-semibold text-slate-500 mb-1.5 flex items-center gap-1"><Wrench size={12} /> Implementos disponibles</p>
              <div className="flex flex-wrap gap-1.5">
                {machineImplements.map((i) => (
                  <Badge key={i.type} tone="earth">{i.type} · {soles(i.pricePerHour)}/h</Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Simulador de costos dinámico */}
        <div className="p-6 border-t border-white/40 bg-white/40">
          <h4 className="font-display font-bold text-slate-800 flex items-center gap-2"><Calculator size={18} className="text-agua-500" /> Simulador de costos</h4>
          {fields.length === 0 ? (
            <p className="text-sm text-slate-500 mt-2">Registra un campo en "Mis campos" para simular costos.</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-5 mt-4">
              <div className="space-y-3">
                <Field label="Aplicar a mi campo">
                  <select className={inputCls} value={fieldId} onChange={(e) => setFieldId(e.target.value)}>
                    {fields.map((f) => <option key={f.id} value={f.id}>{f.name} · {f.hectares} ha · {f.crop}</option>)}
                  </select>
                </Field>
                <Field label={`Días de alquiler: ${days} (${days * 8} h a jornada de 8h/día)`}>
                  <input type="range" min={1} max={30} value={days} onChange={(e) => setDays(+e.target.value)} className="w-full accent-agua-500" />
                </Field>

                <Field label="Modalidad de servicio">
                  <div className="grid grid-cols-2 gap-2">
                    {(["seca", "operada"] as ServiceMode[]).map((mode) => {
                      const active = serviceMode === mode;
                      const price = mode === "operada" ? machine.pricePerHourOperada : machine.pricePerHourSeca;
                      return (
                        <button key={mode} type="button" onClick={() => setServiceMode(mode)}
                          className={`text-left rounded-xl p-2.5 ring-1 transition ${active ? "bg-agua-500 text-white ring-agua-500 shadow-glow" : "bg-white ring-slate-200 text-slate-600 hover:ring-agua-300"}`}>
                          <p className="text-xs font-bold">{mode === "operada" ? "Máquina operada" : "Máquina seca"}</p>
                          <p className={`text-[10px] mt-0.5 leading-snug ${active ? "text-white/80" : "text-slate-400"}`}>
                            {mode === "operada" ? "El proveedor pone operador y combustible" : "Tú pones el operador y el combustible"}
                          </p>
                          <p className="text-sm font-display font-extrabold mt-1">{soles(price)}/h</p>
                        </button>
                      );
                    })}
                  </div>
                </Field>

                {machineImplements.length > 1 && (
                  <Field label="Implemento a usar">
                    <select className={inputCls} value={implementType} onChange={(e) => setImplementType(e.target.value as ImplementType)}>
                      {machineImplements.map((i) => <option key={i.type} value={i.type}>{i.type} · {soles(i.pricePerHour)}/h</option>)}
                    </select>
                  </Field>
                )}

                {field && field.district !== machine.district && (
                  <Badge tone="amber">Incluye traslado interdistrital ({machine.district} → {field.district})</Badge>
                )}
              </div>

              {est && (
                <div className="rounded-xl bg-white p-4 ring-1 ring-slate-100">
                  <Row l={`Tractor (${est.totalHours} h)`} v={soles(est.machineCost)} />
                  <Row l={`Implemento (${chosenImplement?.type ?? "—"})`} v={soles(est.implementCost)} />
                  <Row l="Traslado" v={soles(est.transport)} />
                  <Row l="IGV (18%)" v={soles(est.igv)} />
                  <div className="border-t border-slate-100 mt-2 pt-2 flex justify-between items-center">
                    <span className="font-display font-bold text-slate-800">Total estimado</span>
                    <span className="font-display font-black text-xl text-agua-600">{soles(est.total)}</span>
                  </div>
                  <Button className="w-full mt-3" disabled={machine.status !== "operativo"} onClick={() => setContractOpen(true)}>
                    {machine.status === "operativo" ? "Solicitar reserva" : "No disponible"}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {est && field && chosenImplement && (
        <ContractModal
          open={contractOpen}
          onClose={() => setContractOpen(false)}
          machine={machine}
          field={field}
          days={days}
          serviceMode={serviceMode}
          implementType={chosenImplement.type}
          total={est.total}
          onDone={onClose}
        />
      )}
    </div>
  );
}

// -------------------- MOTOR DE RESERVAS: contrato digital --------------------
function ContractModal({
  open, onClose, machine, field, days, serviceMode, implementType, total, onDone,
}: {
  open: boolean; onClose: () => void; machine: Machine; field: FieldT; days: number;
  serviceMode: ServiceMode; implementType: ImplementType; total: number; onDone: () => void;
}) {
  const requestReservation = useStore((s) => s.requestReservation);
  const OWNER = useOwnerId();
  const [checks, setChecks] = useState<boolean[]>(CONTRACT_CLAUSES.map(() => false));
  const [sent, setSent] = useState(false);
  const allChecked = checks.every(Boolean);

  const toggle = (i: number) => setChecks((c) => c.map((v, idx) => (idx === i ? !v : v)));

  const confirm = () => {
    requestReservation({
      id: uid("res"),
      machineId: machine.id,
      fieldId: field.id,
      clientId: OWNER,
      providerId: machine.providerId,
      days,
      hectares: field.hectares,
      serviceMode,
      implementType,
      estimatedCost: total,
      contractAccepted: true,
      createdAt: new Date().toISOString(),
    });
    setSent(true);
  };

  const close = () => {
    setChecks(CONTRACT_CLAUSES.map(() => false));
    setSent(false);
    onClose();
    if (sent) onDone();
  };

  return (
    <Modal open={open} onClose={close} title={sent ? "Solicitud enviada" : "Contrato digital de alquiler"}>
      {sent ? (
        <div className="text-center py-4">
          <div className="w-14 h-14 rounded-full bg-agua-50 grid place-items-center mx-auto mb-3">
            <CheckCircle2 size={28} className="text-agua-500" />
          </div>
          <p className="font-display font-bold text-slate-800">Tu solicitud quedó en estado "borrador"</p>
          <p className="text-sm text-slate-500 mt-1">
            {machine.brand} {machine.model} notificará al proveedor. Verás la confirmación en "Mis reservas". Usa el chat B2B para coordinar los detalles del trabajo con el proveedor.
          </p>
          <Button className="w-full mt-5" onClick={close}>Entendido</Button>
        </div>
      ) : (
        <>
          <div className="rounded-xl bg-slate-50/70 p-3 mb-4 text-sm">
            <Row l="Unidad" v={`${machine.brand} ${machine.model}`} />
            <Row l="Campo" v={`${field.name} (${field.hectares} ha)`} />
            <Row l="Duración" v={`${days} día(s)`} />
            <Row l="Modalidad" v={serviceMode === "operada" ? "Máquina operada" : "Máquina seca"} />
            <Row l="Implemento" v={implementType} />
            <div className="border-t border-slate-200 mt-2 pt-2 flex justify-between">
              <span className="font-display font-bold text-slate-800">Total a confirmar</span>
              <span className="font-display font-black text-agua-600">{soles(total)}</span>
            </div>
          </div>
          <p className="text-xs font-semibold text-slate-500 mb-2 flex items-center gap-1.5"><ShieldCheck size={14} /> Cláusulas del contrato</p>
          <div className="space-y-2">
            {CONTRACT_CLAUSES.map((c, i) => (
              <label key={i} className="flex items-start gap-2.5 rounded-xl bg-white ring-1 ring-slate-100 p-3 cursor-pointer">
                <input type="checkbox" checked={checks[i]} onChange={() => toggle(i)} className="mt-0.5 accent-agua-500 w-4 h-4 shrink-0" />
                <span className="text-xs text-slate-600 leading-snug">{c}</span>
              </label>
            ))}
          </div>
          <div className="flex gap-2 mt-5">
            <Button variant="ghost" className="flex-1" onClick={close}>Cancelar</Button>
            <Button className="flex-1" disabled={!allChecked} onClick={confirm}>Aceptar y enviar solicitud</Button>
          </div>
        </>
      )}
    </Modal>
  );
}

// -------------------- MIS RESERVAS --------------------
function MisReservas() {
  const OWNER = useOwnerId();
  const reservations = useStore(selectReservationsByClient(OWNER));
  const machines = useStore((s) => s.machines);
  const fields = useStore((s) => s.fields);

  return (
    <div className="stagger space-y-6">
      <Header title="Mis reservas" sub="Estado de tus solicitudes de alquiler, en tiempo real" />
      {reservations.length === 0 ? (
        <Card className="p-8 text-center text-sm text-slate-400">
          Aún no has solicitado ninguna reserva. Ve a "Buscar maquinaria" y simula un costo para empezar.
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {reservations.map((r) => {
            const m = machines.find((mm) => mm.id === r.machineId);
            const f = fields.find((ff) => ff.id === r.fieldId);
            const st = reservationStatusMeta[r.status];
            return (
              <Card key={r.id} className="p-5" hover>
                <div className="flex items-center justify-between">
                  <p className="font-display font-bold text-slate-800 text-sm">{m ? `${m.brand} ${m.model}` : r.machineId}</p>
                  <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${st.text}`}>
                    <span className={`w-2 h-2 rounded-full ${st.dot}`} /> {st.label}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">{f?.name ?? r.fieldId} · {r.days} día(s) · {r.serviceMode === "operada" ? "Operada" : "Seca"} · {r.implementType}</p>
                <div className="flex items-center justify-between mt-3 border-t border-slate-100 pt-3">
                  <span className="text-xs text-slate-400">Total estimado</span>
                  <span className="font-display font-bold text-agua-600">{soles(r.estimatedCost)}</span>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

// -------------------- CRUD MIS CAMPOS --------------------
function Campos() {
  const OWNER = useOwnerId();
  const fields = useStore((s) => s.fields).filter((f) => f.ownerId === OWNER);
  const addField = useStore((s) => s.addField);
  const removeField = useStore((s) => s.removeField);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", district: "Virú", hectares: 50, crop: "Espárrago", soilType: "Franco arenoso" });
  const set = (k: string, v: string | number) => setForm((f) => ({ ...f, [k]: v }));

  const save = () => {
    const f: FieldT = {
      id: uid("fld"), ownerId: OWNER, name: form.name || "Nuevo campo",
      district: form.district as FieldT["district"], hectares: Number(form.hectares),
      crop: form.crop as FieldT["crop"], soilType: form.soilType,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    addField(f);
    setForm({ name: "", district: "Virú", hectares: 50, crop: "Espárrago", soilType: "Franco arenoso" });
    setOpen(false);
  };

  return (
    <div className="stagger space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Header title="Mis campos" sub="Registra tus fundos, hectáreas y cultivos" />
        <Button onClick={() => setOpen(true)}><Plus size={18} /> Nuevo campo</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {fields.map((f) => (
          <Card key={f.id} className="p-5 group" hover>
            <div className="flex items-start justify-between">
              <div className="w-11 h-11 grid place-items-center rounded-xl bg-gradient-to-br from-agua-500 to-agua-600 text-white shadow-glow"><Sprout size={20} /></div>
              <button onClick={() => removeField(f.id)} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-terra-500 transition"><Trash2 size={17} /></button>
            </div>
            <h4 className="font-display font-bold text-slate-800 mt-3">{f.name}</h4>
            <p className="text-xs text-slate-400 flex items-center gap-1"><MapPin size={12} /> {f.district} · {f.soilType}</p>
            <div className="flex gap-2 mt-3">
              <Badge tone="agua">{f.hectares} ha</Badge>
              <Badge tone="earth">{f.crop}</Badge>
            </div>
          </Card>
        ))}
        <button onClick={() => setOpen(true)}
          className="rounded-2xl border-2 border-dashed border-slate-200 grid place-items-center text-slate-400 hover:border-agua-300 hover:text-agua-500 transition min-h-[168px]">
          <span className="flex flex-col items-center gap-1 text-sm font-semibold"><Plus size={22} /> Agregar campo</span>
        </button>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Registrar campo">
        <div className="space-y-3">
          <Field label="Nombre del campo"><input className={inputCls} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Ej. Fundo Santa Rosa" /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Distrito">
              <select className={inputCls} value={form.district} onChange={(e) => set("district", e.target.value)}><DistrictOptions /></select>
            </Field>
            <Field label="Hectáreas"><input type="number" className={inputCls} value={form.hectares} onChange={(e) => set("hectares", +e.target.value)} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Cultivo">
              <select className={inputCls} value={form.crop} onChange={(e) => set("crop", e.target.value)}>{CROPS.map((c) => <option key={c}>{c}</option>)}</select>
            </Field>
            <Field label="Tipo de suelo"><input className={inputCls} value={form.soilType} onChange={(e) => set("soilType", e.target.value)} /></Field>
          </div>
        </div>
        <div className="flex gap-2 mt-6">
          <Button variant="ghost" className="flex-1" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button className="flex-1" onClick={save}>Guardar campo</Button>
        </div>
      </Modal>
    </div>
  );
}

// -------------------- helpers --------------------
function Header({ title, sub }: { title: string; sub: string }) {
  return (<div><h1 className="font-display font-black text-2xl sm:text-3xl text-slate-900">{title}</h1><p className="text-slate-500 text-sm mt-0.5">{sub}</p></div>);
}
function Stat({ k, v }: { k: string; v: string }) {
  return (<Card className="p-5" hover><p className="font-display font-black text-2xl sm:text-3xl text-agua-600">{k}</p><p className="text-sm text-slate-500 font-medium mt-1">{v}</p></Card>);
}
function Spec({ l, v }: { l: string; v: string }) {
  return (<div className="rounded-lg bg-slate-50/70 px-3 py-2"><p className="text-[11px] text-slate-400">{l}</p><p className="text-sm font-semibold text-slate-700">{v}</p></div>);
}
function Row({ l, v }: { l: string; v: string }) {
  return (<div className="flex justify-between text-sm py-0.5"><span className="text-slate-500">{l}</span><span className="font-semibold text-slate-700">{v}</span></div>);
}
