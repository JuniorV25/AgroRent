import type React from "react";
import { Fuel, Thermometer, Wrench, AlertTriangle, Activity } from "lucide-react";
import type { Machine } from "../types";
import { Gauge, Card, Badge } from "../../../core/ui";

export default function TelemetryPanel({ machine }: { machine: Machine }) {
  const t = machine.telemetry ?? { hourmeter: 0, fuelLevel: 0, engineTemp: 0, nextServiceInHours: 0, activeAlerts: [] };
  const fuelWarn = t.fuelLevel < 20;
  const serviceWarn = t.nextServiceInHours <= 24;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-xs font-semibold text-agua-600 uppercase tracking-wide flex items-center gap-1.5">
            <Activity size={14} /> Telemetría simulada · en vivo
          </p>
          <h3 className="font-display font-bold text-lg text-slate-800">{machine.brand} {machine.model}</h3>
        </div>
        <Badge tone="slate">ID {machine.id}</Badge>
      </div>

      {/* Medidores circulares */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 place-items-center">
        <Gauge value={t.hourmeter % 1000 / 10} label="Horómetro" unit="%" color="#0d9488" />
        <Gauge value={t.fuelLevel} label="Combustible" unit="%" warn={fuelWarn} color="#0d9488" />
        <Gauge value={100 - Math.min(100, t.nextServiceInHours / 2)} label="Mantenimiento" unit="%" warn={serviceWarn} color="#c19a5b" />
      </div>

      {/* Indicadores lineales */}
      <div className="mt-5 grid grid-cols-2 gap-3">
        <Metric icon={<Fuel size={15} />} label="Nivel de combustible" value={`${t.fuelLevel}%`} bar={t.fuelLevel} warn={fuelWarn} />
        <Metric icon={<Thermometer size={15} />} label="Temp. motor" value={`${t.engineTemp}°C`} bar={(t.engineTemp / 120) * 100} warn={t.engineTemp > 95} />
        <Metric icon={<Wrench size={15} />} label="Próx. servicio" value={`${t.nextServiceInHours} h`} bar={100 - Math.min(100, t.nextServiceInHours / 2)} warn={serviceWarn} />
        <Metric icon={<Activity size={15} />} label="Horómetro total" value={`${t.hourmeter.toLocaleString()} h`} bar={(t.hourmeter / 10000) * 100} />
      </div>

      {/* Alertas de mantenimiento preventivo */}
      <div className="mt-5">
        <p className="text-xs font-semibold text-slate-500 mb-2">Alertas preventivas</p>
        {t.activeAlerts.length === 0 ? (
          <Badge tone="agua">Sin alertas · equipo óptimo</Badge>
        ) : (
          <div className="space-y-2">
            {t.activeAlerts.map((a) => (
              <div key={a} className="flex items-center gap-2 text-sm text-amber-800 bg-amber-50 ring-1 ring-amber-400/30 rounded-lg px-3 py-2">
                <AlertTriangle size={15} className="text-amber-500 shrink-0" /> {a}
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

function Metric({ icon, label, value, bar, warn }: { icon: React.ReactNode; label: string; value: string; bar: number; warn?: boolean }) {
  return (
    <div className="rounded-xl bg-slate-50/70 p-3">
      <div className="flex items-center justify-between text-xs">
        <span className="inline-flex items-center gap-1.5 text-slate-500 font-medium">{icon} {label}</span>
        <span className={`font-display font-bold ${warn ? "text-amber-600" : "text-slate-700"}`}>{value}</span>
      </div>
      <div className="mt-2 h-1.5 rounded-full bg-slate-200 overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-1000 ${warn ? "bg-amber-500" : "bg-agua-500"}`} style={{ width: `${Math.min(100, Math.max(3, bar))}%` }} />
      </div>
    </div>
  );
}
