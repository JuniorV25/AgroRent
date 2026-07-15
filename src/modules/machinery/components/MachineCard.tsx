import { memo } from "react";
import { Star, Gauge as GaugeIcon, MapPin, Zap, Scale } from "lucide-react";
import type { Machine } from "../types";
import { statusMeta } from "../status";
import { soles } from "../../../core/utils/format";
import { Badge } from "../../../core/ui";
import { ProviderChip } from "../../providers/components/ProviderInfo";
import { useStore, MAX_COMPARE } from "../../../store/useStore";

// Memoizado: el catálogo puede renderizar hasta 15 tarjetas por página, y esta
// tarjeta no necesita volver a renderizarse si su `machine`/`onClick` no cambian.
// `showCompare` habilita el ícono de "Comparar" sobre la ficha (solo vistas de cliente).
function MachineCard({ machine, onClick, showCompare }: { machine: Machine; onClick?: () => void; showCompare?: boolean }) {
  const s = statusMeta[machine.status];
  const compareIds = useStore((st) => st.compareIds);
  const toggleCompare = useStore((st) => st.toggleCompare);
  const inCompare = compareIds.includes(machine.id);
  const compareFull = !inCompare && compareIds.length >= MAX_COMPARE;

  return (
    <div
      onClick={onClick}
      className="group cursor-pointer rounded-2xl bg-white/90 border border-slate-100 overflow-hidden shadow-float transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_28px_70px_-20px_rgba(13,148,136,.45)]"
    >
      <div className="relative h-40 overflow-hidden">
        <img src={machine.imageUrl} alt={machine.model} loading="lazy" decoding="async" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        {/* Semáforo de estado */}
        <div className={`absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-white/85 backdrop-blur px-2.5 py-1 text-xs font-semibold ring-1 ${s.ring} ${s.text}`}>
          <span className={`w-2 h-2 rounded-full ${s.dot} animate-pulse`} />
          {s.label}
        </div>
        <div className="absolute top-3 right-3">
          <Badge tone="slate" className="bg-white/85 backdrop-blur">
            <Zap size={12} /> {machine.horsepower} HP
          </Badge>
        </div>
        {showCompare && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); if (!compareFull) toggleCompare(machine.id); }}
            disabled={compareFull}
            title={inCompare ? "Quitar de comparar" : compareFull ? `Ya elegiste ${MAX_COMPARE} unidades (máximo)` : "Agregar a comparar"}
            className={`absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-semibold shadow-float backdrop-blur transition ${
              inCompare
                ? "bg-agua-500 text-white"
                : compareFull
                ? "bg-white/70 text-slate-300 cursor-not-allowed"
                : "bg-white/90 text-slate-600 hover:text-agua-600"
            }`}
          >
            <Scale size={13} /> {inCompare ? "Comparando" : "Comparar"}
          </button>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-agua-600 uppercase tracking-wide">{machine.brand}</p>
            <h4 className="font-display font-bold text-slate-800 leading-tight">{machine.model}</h4>
          </div>
          <div className="flex items-center gap-1 text-amber-500 text-sm font-semibold">
            <Star size={14} fill="currentColor" /> {machine.rating}
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1"><MapPin size={13} /> {machine.district}</span>
          <span className="inline-flex items-center gap-1"><GaugeIcon size={13} /> {(machine.telemetry?.hourmeter ?? 0).toLocaleString()} h</span>
        </div>
        <div className="mt-2">
          <ProviderChip providerId={machine.providerId} />
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {machine.implements?.[0] && <Badge tone="earth">{machine.implements[0].type}</Badge>}
          {(machine.implements?.length ?? 0) > 1 && <Badge tone="slate">+{machine.implements.length - 1} más</Badge>}
        </div>
        <div className="mt-4 flex items-end justify-between border-t border-slate-100 pt-3">
          <div>
            <p className="font-display font-extrabold text-lg text-slate-800">{soles(machine.pricePerHourSeca)}<span className="text-xs font-semibold text-slate-400">/h</span></p>
            <p className="text-[11px] text-slate-400 -mt-0.5">seca · {soles(machine.pricePerHourOperada)}/h operada</p>
          </div>
          <span className="text-xs font-semibold text-agua-600 group-hover:translate-x-1 transition-transform">Ver ficha →</span>
        </div>
      </div>
    </div>
  );
}

export default memo(MachineCard);
