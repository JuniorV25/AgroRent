import { useState } from "react";
import { MessageCircle, X, Send, Sparkles, ChevronLeft } from "lucide-react";
import { useStore } from "../../../store/useStore";
import type { Reservation } from "../types";
import type { Role } from "../../users/types";
import { cx, soles } from "../../../core/utils/format";

// Chat B2B flotante: una conversación por reserva + resumen automático generado por IA.
export default function ChatWidget({ role, reservations }: { role: Role; reservations: Reservation[] }) {
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const machines = useStore((s) => s.machines);
  const chatMessages = useStore((s) => s.chatMessages);

  const active = reservations.find((r) => r.id === activeId) ?? null;
  const unreadTotal = reservations.length; // demo: badge simple con # de conversaciones activas

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open && (
        <div className="glass mb-3 w-[22rem] max-w-[92vw] h-[30rem] rounded-2xl shadow-float flex flex-col overflow-hidden animate-fade-in-up">
          {!active ? (
            <ConversationList
              reservations={reservations}
              machines={machines}
              onSelect={setActiveId}
              onClose={() => setOpen(false)}
            />
          ) : (
            <ConversationThread
              reservation={active}
              role={role}
              machineLabel={(() => {
                const m = machines.find((mm) => mm.id === active.machineId);
                return m ? `${m.brand} ${m.model}` : active.machineId;
              })()}
              messages={chatMessages.filter((m) => m.reservationId === active.id)}
              onBack={() => setActiveId(null)}
              onClose={() => setOpen(false)}
            />
          )}
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        className="w-14 h-14 rounded-2xl bg-gradient-to-br from-agua-500 to-agua-600 text-white shadow-glow grid place-items-center hover:-translate-y-0.5 transition relative"
        title="Chat B2B"
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
        {!open && unreadTotal > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-[20px] px-1 rounded-full bg-terra-500 text-white text-[11px] font-bold grid place-items-center">
            {unreadTotal}
          </span>
        )}
      </button>
    </div>
  );
}

function ConversationList({
  reservations, machines, onSelect, onClose,
}: {
  reservations: Reservation[];
  machines: ReturnType<typeof useStore.getState>["machines"];
  onSelect: (id: string) => void;
  onClose: () => void;
}) {
  return (
    <>
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/40">
        <p className="font-display font-bold text-slate-800 text-sm">Chat B2B · Reservas</p>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {reservations.length === 0 ? (
          <p className="text-sm text-slate-400 text-center px-4 py-10">
            Aún no tienes reservas activas. El chat se habilita al solicitar una reserva.
          </p>
        ) : (
          reservations.map((r) => {
            const m = machines.find((mm) => mm.id === r.machineId);
            return (
              <button
                key={r.id}
                onClick={() => onSelect(r.id)}
                className="w-full text-left rounded-xl px-3 py-2.5 hover:bg-white/70 transition flex items-center gap-3"
              >
                <div className="w-9 h-9 rounded-lg bg-agua-500/10 grid place-items-center text-agua-600 shrink-0">
                  <MessageCircle size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-800 truncate">{m ? `${m.brand} ${m.model}` : r.machineId}</p>
                  <p className="text-xs text-slate-400 truncate">Reserva {r.id} · {soles(r.estimatedCost)}</p>
                </div>
              </button>
            );
          })
        )}
      </div>
    </>
  );
}

function ConversationThread({
  reservation, role, machineLabel, messages, onBack, onClose,
}: {
  reservation: Reservation;
  role: Role;
  machineLabel: string;
  messages: ReturnType<typeof useStore.getState>["chatMessages"];
  onBack: () => void;
  onClose: () => void;
}) {
  const [text, setText] = useState("");
  const addChatMessage = useStore((s) => s.addChatMessage);
  const generateAiSummary = useStore((s) => s.generateAiSummary);

  const send = () => {
    if (!text.trim()) return;
    addChatMessage(reservation.id, role, text.trim());
    setText("");
  };

  return (
    <>
      <div className="flex items-center gap-2 px-3 py-3 border-b border-white/40">
        <button onClick={onBack} className="text-slate-400 hover:text-slate-600"><ChevronLeft size={18} /></button>
        <div className="min-w-0 flex-1">
          <p className="font-display font-bold text-slate-800 text-sm truncate">{machineLabel}</p>
          <p className="text-[11px] text-slate-400">Reserva {reservation.id}</p>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {messages.map((m) => (
          <div key={m.id} className={cx("flex", m.sender === role ? "justify-end" : "justify-start")}>
            <div
              className={cx(
                "max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-snug",
                m.sender === "ia"
                  ? "bg-earth-100 text-earth-400 ring-1 ring-earth-300/40 flex items-start gap-1.5"
                  : m.sender === role
                  ? "bg-agua-500 text-white"
                  : "bg-slate-100 text-slate-700"
              )}
            >
              {m.sender === "ia" && <Sparkles size={13} className="mt-0.5 shrink-0" />}
              <span>{m.text}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="p-2.5 border-t border-white/40 space-y-2">
        <button
          onClick={() => generateAiSummary(reservation.id)}
          className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-earth-400 bg-earth-100/70 hover:bg-earth-100 rounded-lg py-2 transition"
        >
          <Sparkles size={13} /> Generar resumen del acuerdo con IA
        </button>
        <div className="flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Escribe un mensaje…"
            className="flex-1 rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-sm outline-none focus:border-agua-400 focus:ring-4 focus:ring-agua-400/15"
          />
          <button onClick={send} className="w-9 h-9 grid place-items-center rounded-xl bg-agua-500 text-white shrink-0 hover:bg-agua-600 transition">
            <Send size={15} />
          </button>
        </div>
      </div>
    </>
  );
}
