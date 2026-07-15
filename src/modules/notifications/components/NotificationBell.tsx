import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Bell, CheckCheck } from "lucide-react";
import { useStore, selectNotificationsByUser } from "../../../store/useStore";
import { cx } from "../../../core/utils/format";

// Campanita de notificaciones in-app: reservas, alertas de flota, sistema.
// Alcance por usuario real (no por rol), para que cada cuenta vea solo lo suyo.
export default function NotificationBell({ forUserId }: { forUserId: string }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; right: number } | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const notifications = useStore(selectNotificationsByUser(forUserId));
  const markRead = useStore((s) => s.markNotificationRead);
  const markAllRead = useStore((s) => s.markAllNotificationsRead);
  const unread = notifications.filter((n) => !n.read).length;

  // Calcula la posición del panel según el botón real en pantalla, y lo
  // renderiza en un portal a document.body — así nunca queda recortado ni
  // superpuesto por el sidebar (que ahora es sticky/con scroll propio) o por
  // la barra móvil con overflow-x.
  const place = () => {
    const r = btnRef.current?.getBoundingClientRect();
    if (!r) return;
    setPos({ top: r.bottom + 8, right: Math.max(12, window.innerWidth - r.right) });
  };

  const toggle = () => {
    if (!open) place();
    setOpen((o) => !o);
  };

  useEffect(() => {
    if (!open) return;
    const onReflow = () => place();
    window.addEventListener("resize", onReflow);
    window.addEventListener("scroll", onReflow, true);
    return () => {
      window.removeEventListener("resize", onReflow);
      window.removeEventListener("scroll", onReflow, true);
    };
  }, [open]);

  return (
    <div className="relative">
      <button
        ref={btnRef}
        onClick={toggle}
        className="relative w-10 h-10 grid place-items-center rounded-xl bg-white/80 shadow-float text-slate-600 hover:text-agua-600 transition"
        title="Notificaciones"
      >
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-terra-500 text-white text-[10px] font-bold grid place-items-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && pos && createPortal(
        <>
          <div className="fixed inset-0 z-[60]" onClick={() => setOpen(false)} />
          <div
            className="glass fixed w-80 max-w-[calc(100vw-24px)] max-h-96 overflow-y-auto rounded-2xl shadow-float p-2 z-[70] animate-fade-in-up"
            style={{ top: pos.top, right: pos.right }}
          >
            <div className="flex items-center justify-between px-2 py-1.5">
              <p className="text-sm font-display font-bold text-slate-800">Notificaciones</p>
              {unread > 0 && (
                <button
                  onClick={() => markAllRead(forUserId)}
                  className="text-xs font-semibold text-agua-600 hover:text-agua-700 flex items-center gap-1"
                >
                  <CheckCheck size={13} /> Marcar todas
                </button>
              )}
            </div>
            {notifications.length === 0 ? (
              <p className="text-sm text-slate-400 px-2 py-6 text-center">Sin notificaciones por ahora.</p>
            ) : (
              <div className="space-y-1">
                {notifications.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => markRead(n.id)}
                    className={cx(
                      "w-full text-left rounded-xl px-3 py-2.5 transition",
                      n.read ? "bg-transparent hover:bg-slate-50/70" : "bg-agua-50/70 hover:bg-agua-50"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-agua-500 shrink-0" />}
                      <p className="text-xs font-semibold text-slate-800 truncate">{n.title}</p>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 leading-snug">{n.message}</p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      {new Date(n.createdAt).toLocaleString("es-PE", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </>,
        document.body
      )}
    </div>
  );
}
