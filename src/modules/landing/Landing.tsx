import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search, Tractor, ShieldCheck, BadgeCheck, Sparkles, ArrowRight, MapPin, Handshake, FileCheck2, Leaf,
  Scale, Wallet,
} from "lucide-react";
import { Button, Badge, Logo } from "../../core/ui";

// ============================================================================
// Hook: revela elementos con .reveal / .reveal-scale al entrar en viewport
// ============================================================================
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>(".reveal, .reveal-scale");
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in-view");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

export default function Landing() {
  const nav = useNavigate();
  useReveal();

  return (
    <div className="min-h-screen overflow-x-clip">
      {/* NAVBAR — pastilla circular, glassmorphism, flota sobre el hero */}
      <header className="fixed top-0 inset-x-0 z-40 px-3 sm:px-4">
        <nav className="glass mx-auto mt-4 max-w-6xl rounded-full pl-3 pr-2 sm:pr-3 py-2 flex items-center justify-between shadow-float">
          <div className="flex items-center gap-2.5">
            <Logo />
            <p className="font-display font-extrabold text-slate-800 tracking-tight text-lg">
              Traktor<span className="text-agua-500">Rent</span>
            </p>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Button variant="ghost" size="sm" pill onClick={() => nav("/login", { state: { mode: "login" } })}>
              Ingresar
            </Button>
            <Button size="sm" pill onClick={() => nav("/login", { state: { mode: "register" } })}>
              Registrarse
            </Button>
          </div>
        </nav>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden min-h-[600px] sm:min-h-[640px] lg:min-h-[720px]">
        {/* Foto real de tractor con degradado hacia el fondo crema */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1717702576954-c07131c54169?auto=format&fit=crop&w=2000&q=80"
            alt="Tractor trabajando en un campo agrícola al atardecer"
            className="absolute inset-0 h-full w-full object-cover object-[50%_38%]"
            loading="eager"
            decoding="async"
          />
          <div className="absolute inset-0 hero-photo-fade" />
          <div className="absolute inset-0 hero-photo-fade-b" />
        </div>

        <div className="mx-auto max-w-6xl px-5 pt-28 sm:pt-32 lg:pt-36 pb-20 sm:pb-28 lg:pb-36 relative z-10">
          <div className="max-w-2xl lg:max-w-xl mx-auto lg:mx-0 text-center lg:text-left">
            <Badge tone="agua" className="mx-auto lg:mx-0 animate-fade-in-up">
              <Sparkles size={13} /> +40 unidades disponibles hoy en La Libertad y Lambayeque
            </Badge>
            <h1 className="mt-5 font-display font-black text-4xl sm:text-6xl leading-[1.05] text-slate-900 animate-fade-in-up">
              La flota agrícola de tu campo,
              <span className="block bg-gradient-to-r from-agua-600 via-agua-500 to-earth-400 bg-clip-text text-transparent text-shimmer">
                a un clic de distancia
              </span>
            </h1>
            <p
              className="mt-5 max-w-2xl lg:max-w-none mx-auto lg:mx-0 text-lg font-medium text-slate-800 animate-fade-in-up"
              style={{ textShadow: "0 1px 16px rgba(251,250,247,0.85)" }}
            >
              Conectamos <b className="text-agua-700">fundos y agroexportadoras</b> con <b className="text-agua-700">proveedores verificados</b> de tractores e
              implementos. Reserva por día o por hectárea, con telemetría y contratos digitales.
            </p>

            {/* Dual CTA */}
            <div className="mt-8 flex flex-col sm:flex-row items-center lg:items-stretch justify-center lg:justify-start gap-3 animate-fade-in-up">
              <Button size="lg" pill onClick={() => nav("/login", { state: { mode: "register" } })} className="group">
                <Search size={20} /> Quiero buscar maquinaria
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="lg" variant="secondary" pill onClick={() => nav("/login", { state: { mode: "register" } })} className="group">
                <Tractor size={20} /> Quiero ofrecer mi maquinaria
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>

            {/* Trust badges */}
            <div
              className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 text-sm font-bold text-slate-800 animate-fade-in-up"
              style={{ textShadow: "0 1px 14px rgba(251,250,247,0.85)" }}
            >
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck size={16} className="text-agua-600" /> Empresa verificada
              </span>
              <span className="inline-flex items-center gap-1.5">
                <BadgeCheck size={16} className="text-agua-600" /> RUC validado por SUNAT
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Sparkles size={16} className="text-earth-400" /> Telemetría en tiempo real
              </span>
            </div>
          </div>
        </div>

        {/* Íconos decorativos flotantes */}
        <Leaf size={26} className="hidden md:block absolute z-10 top-24 left-[8%] text-agua-300/70 animate-float-slow" />
        <Leaf size={20} className="hidden md:block absolute z-10 top-40 right-[10%] text-earth-300/70 animate-float-slow" style={{ animationDelay: "1.4s" }} />
      </section>

      {/* CÓMO FUNCIONA — capa clara teñida de agua */}
      <ComoFunciona />

      {/* ORIGEN — capa oscura de contraste, esquinas redondeadas y bordes rectos */}
      <Origen />

      {/* Métricas — vuelve a la capa crema, transición recta con esquinas redondeadas */}
      <section className="relative bg-[#fbfaf7]">
        <div className="mx-auto max-w-6xl px-5 pt-16 sm:pt-20 pb-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { k: "40+", v: "Unidades activas" },
              { k: "2", v: "Regiones cubiertas" },
              { k: "98%", v: "Reservas cumplidas" },
              { k: "<2h", v: "Tiempo de respuesta" },
            ].map((x, i) => (
              <div
                key={x.v}
                className="reveal-scale glass rounded-2xl p-5 text-center"
                style={{ transitionDelay: `${i * 0.08}s` }}
              >
                <p className="font-display font-black text-3xl text-agua-600">{x.k}</p>
                <p className="text-sm text-slate-500 font-medium mt-1">{x.v}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-100 py-8 text-center text-sm text-slate-400 bg-[#fbfaf7]">
        TraktorRent — Marketplace B2B · La Libertad · Lambayeque
      </footer>
    </div>
  );
}

// ============================================================================
// Cómo funciona — tabs Cliente / Proveedor con 4 pasos, capa clara teñida
// ============================================================================
function ComoFunciona() {
  const [tab, setTab] = useState<"cliente" | "proveedor">("cliente");
  const clienteRef = useRef<HTMLButtonElement>(null);
  const proveedorRef = useRef<HTMLButtonElement>(null);
  const [thumb, setThumb] = useState({ left: 4, width: 0 });
  const stepsRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    const btn = tab === "cliente" ? clienteRef.current : proveedorRef.current;
    if (btn) setThumb({ left: btn.offsetLeft, width: btn.offsetWidth });
  }, [tab]);

  // Al cambiar de pestaña, React vuelve a crear los cuadros (cambia la key) y el
  // IntersectionObserver global de useReveal ya no los ve (solo observó al montar).
  // Forzamos aquí que los cuadros del tab activo se muestren de inmediato.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const els = stepsRef.current?.querySelectorAll<HTMLElement>(".reveal");
    els?.forEach((el) => el.classList.add("in-view"));
  }, [tab]);

  const steps = {
    cliente: [
      { n: "01", icon: <MapPin size={18} />, title: "Busca maquinaria disponible en tu distrito", desc: "Filtra por tipo de tractor, implemento y fechas." },
      { n: "02", icon: <Scale size={18} />, title: "Compara proveedores y tarifas", desc: "Revisa precios, calificaciones y disponibilidad real." },
      { n: "03", icon: <FileCheck2 size={18} />, title: "Reserva y coordina la entrega", desc: "Confirma el alquiler y define el punto de entrega." },
      { n: "04", icon: <Tractor size={18} />, title: "Trabaja tu campo a tiempo", desc: "Recibe la máquina y cumple tu calendario agrícola." },
    ],
    proveedor: [
      { n: "01", icon: <Tractor size={18} />, title: "Publica tus tractores y tarifas", desc: "Registra tu flota, precios y disponibilidad por distrito." },
      { n: "02", icon: <Handshake size={18} />, title: "Recibe solicitudes de tu zona", desc: "Clientes verificados de tu zona te contactan directo." },
      { n: "03", icon: <FileCheck2 size={18} />, title: "Confirma y coordina la entrega", desc: "Acepta la solicitud y define hora y punto de entrega." },
      { n: "04", icon: <Wallet size={18} />, title: "Genera ingresos con tu flota", desc: "Cobra por día o hectárea y da seguimiento con telemetría." },
    ],
  };

  return (
    <section className="relative overflow-hidden rounded-t-[2.5rem] sm:rounded-t-[3.5rem] bg-gradient-to-b from-agua-100/70 via-agua-50/50 to-white">
      {/* Íconos decorativos de fondo para dar profundidad a la capa */}
      <div className="pointer-events-none absolute -top-10 -right-16 w-72 h-72 rounded-full bg-agua-300/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 -left-20 w-64 h-64 rounded-full bg-earth-200/30 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-6xl px-5 pt-14 sm:pt-16 pb-20">
        <div className="text-center reveal">
          <Badge tone="earth" className="mx-auto">Proceso</Badge>
          <h2 className="mt-4 font-display font-black text-3xl sm:text-4xl text-slate-900">Cómo funciona</h2>
          <p className="mt-2 text-slate-600 max-w-xl mx-auto">Cuatro pasos simples, ya seas cliente o proveedor de maquinaria.</p>
        </div>

        {/* Selector segmentado Cliente/Proveedor */}
        <div className="reveal mt-7 flex justify-center" style={{ transitionDelay: "0.08s" }}>
          <div className="segmented inline-flex bg-white/70 ring-1 ring-slate-200 rounded-full p-1">
            <div
              className="segmented-thumb"
              style={{ left: 0, transform: `translateX(${thumb.left}px)`, width: thumb.width || undefined }}
            />
            <button
              ref={clienteRef}
              onClick={() => setTab("cliente")}
              className={`relative z-10 px-6 py-2.5 rounded-full text-sm font-display font-bold transition-colors duration-300 ${
                tab === "cliente" ? "text-white" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Soy Cliente
            </button>
            <button
              ref={proveedorRef}
              onClick={() => setTab("proveedor")}
              className={`relative z-10 px-6 py-2.5 rounded-full text-sm font-display font-bold transition-colors duration-300 ${
                tab === "proveedor" ? "text-white" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Soy Proveedor
            </button>
          </div>
        </div>

        {/* Pasos */}
        <div ref={stepsRef} className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {steps[tab].map((s, i) => (
            <div
              key={`${tab}-${s.n}`}
              className="reveal rounded-2xl bg-white/90 border border-white shadow-float p-6 relative overflow-hidden hover:-translate-y-1 transition-transform duration-300"
              style={{ transitionDelay: `${i * 0.1}s` }}
            >
              <span className="absolute -top-3 -right-1 font-display font-black text-6xl text-agua-500/10 select-none">
                {s.n}
              </span>
              <div className="relative z-10">
                <div className="w-11 h-11 rounded-full grid place-items-center bg-gradient-to-br from-agua-500 to-agua-600 text-white shadow-glow mb-4">
                  {s.icon}
                </div>
                <p className="text-xs font-bold text-agua-600 tracking-widest mb-1">Paso {s.n}</p>
                <h3 className="font-display font-bold text-base text-slate-800 leading-snug">{s.title}</h3>
                <p className="mt-1.5 text-sm text-slate-500">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Detalles adicionales de confianza */}
        <div className="reveal mt-8 flex flex-wrap justify-center gap-3" style={{ transitionDelay: "0.3s" }}>
          {["Sin intermediarios ocultos", "Pagos y contratos protegidos", "Soporte en español 7 días"].map((t) => (
            <span key={t} className="text-xs font-semibold text-agua-700 bg-white/80 ring-1 ring-agua-400/30 rounded-full px-3.5 py-1.5">
              {t}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// Origen — historia de TraktorRent, capa oscura de contraste
// ============================================================================
function Origen() {
  return (
    <section className="relative overflow-hidden rounded-[2.5rem] sm:rounded-[3.5rem] bg-gradient-to-br from-slate-800 via-[#1a2f2c] to-[#16302c]">
      {/* Textura decorativa: hojas y resplandor */}
      <div className="pointer-events-none absolute top-10 right-[6%] w-80 h-80 rounded-full bg-agua-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 left-[4%] w-72 h-72 rounded-full bg-earth-400/10 blur-3xl" />
      <Leaf size={140} className="pointer-events-none absolute -bottom-6 -right-6 text-white/[0.04] rotate-12" />

      <div className="relative z-10 mx-auto max-w-6xl px-5 py-20 sm:py-24">
        <div className="grid md:grid-cols-[auto,1fr] gap-8 items-center reveal">
          <div className="justify-self-center md:justify-self-start">
            <div className="w-16 h-16 rounded-full grid place-items-center bg-gradient-to-br from-earth-300 to-earth-400 text-white shadow-float animate-float-slow">
              <Leaf size={28} />
            </div>
          </div>
          <div>
            <Badge tone="earth">Origen</Badge>
            <h2 className="mt-4 font-display font-black text-2xl sm:text-3xl text-white">
              De un problema operativo a una plataforma B2B
            </h2>
            <p className="mt-4 text-slate-300 leading-relaxed max-w-3xl">
              TraktorRent nace en 2026 en La Libertad, Perú, tras identificar que clientes y proveedores de
              tractores agrícolas dependían de contactos informales y opciones limitadas. Hoy centralizamos ese
              proceso en una sola plataforma digital, con cobertura en La Libertad y Lambayeque.
            </p>

            <div className="mt-6 flex flex-wrap gap-x-8 gap-y-3">
              {[
                { k: "2026", v: "Año de fundación" },
                { k: "2", v: "Regiones con cobertura" },
                { k: "La Libertad", v: "Región de origen" },
              ].map((x) => (
                <div key={x.v}>
                  <p className="font-display font-black text-xl text-agua-300">{x.k}</p>
                  <p className="text-xs text-slate-400 font-medium">{x.v}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
