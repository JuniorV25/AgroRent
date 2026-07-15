// Simulador de costos: precio por hora (según modalidad "seca" u "operada",
// elegida por el cliente) + precio por hora del implemento elegido, más
// traslado interdistrital. La jornada estándar es de 8 h/día.
export const HOURS_PER_DAY = 8;

export function estimateCost(opts: {
  hourlyRate: number;       // S/ por hora del tractor, según la modalidad elegida
  implementRate: number;    // S/ por hora del implemento elegido
  days: number;
  sameDistrict: boolean;
  hoursPerDay?: number;
}) {
  const hoursPerDay = opts.hoursPerDay ?? HOURS_PER_DAY;
  const totalHours = opts.days * hoursPerDay;
  const machineCost = opts.hourlyRate * totalHours;
  const implementCost = opts.implementRate * totalHours;
  const transport = opts.sameDistrict ? 0 : 480; // traslado interdistrital
  const subtotal = machineCost + implementCost + transport;
  const igv = subtotal * 0.18;
  return { totalHours, machineCost, implementCost, transport, subtotal, igv, total: subtotal + igv };
}
