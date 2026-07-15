// ============================================================================
// Identidad del proveedor (empresa o persona individual) que alquila la
// maquinaria — se muestra en la tarjeta y en la ficha de cada tractor, tal
// como lo ve el cliente al elegir con quién está contratando.
// ============================================================================
import { Building2, User, Star, BadgeCheck } from "lucide-react";
import { useStore } from "../../../store/useStore";

function useProviderIdentity(providerId: string) {
  const provider = useStore((s) => s.providers.find((p) => p.id === providerId));
  const ownerUser = useStore((s) => s.users.find((u) => u.providerId === providerId));
  const isCompany = ownerUser ? ownerUser.accountType === "empresa" : true;
  return { provider, isCompany };
}

// Versión compacta — para la tarjeta del catálogo
export function ProviderChip({ providerId, className }: { providerId: string; className?: string }) {
  const { provider, isCompany } = useProviderIdentity(providerId);
  if (!provider) return null;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs text-slate-500 min-w-0 ${className ?? ""}`}>
      {isCompany ? <Building2 size={13} className="shrink-0 text-slate-400" /> : <User size={13} className="shrink-0 text-slate-400" />}
      <span className="truncate">{provider.companyName}</span>
      {provider.verified && <BadgeCheck size={13} className="text-agua-500 shrink-0" />}
    </span>
  );
}

// Versión detallada — para la ficha del tractor (quién alquila la máquina)
export function ProviderPanel({ providerId }: { providerId: string }) {
  const { provider, isCompany } = useProviderIdentity(providerId);
  if (!provider) return null;
  return (
    <div className="rounded-xl bg-slate-50/70 p-3 flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl grid place-items-center bg-white ring-1 ring-slate-200 text-slate-500 shrink-0">
        {isCompany ? <Building2 size={18} /> : <User size={18} />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-800 truncate flex items-center gap-1">
          {provider.companyName} {provider.verified && <BadgeCheck size={13} className="text-agua-500 shrink-0" />}
        </p>
        <p className="text-[11px] text-slate-400 flex items-center gap-1 flex-wrap">
          <span>{isCompany ? "Empresa proveedora" : "Proveedor independiente"}</span>
          <span>· {provider.district}</span>
          <span className="inline-flex items-center gap-0.5"><Star size={10} className="text-amber-500" fill="currentColor" /> {provider.rating.toFixed(1)}</span>
        </p>
      </div>
    </div>
  );
}
