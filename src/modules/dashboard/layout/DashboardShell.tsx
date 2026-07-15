import type React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tractor, LogOut, BadgeCheck, Pencil, TriangleAlert } from "lucide-react";
import { useStore } from "../../../store/useStore";
import { cx } from "../../../core/utils/format";
import NotificationBell from "../../notifications/components/NotificationBell";
import EditProfileModal from "../../users/components/EditProfileModal";
import { Modal, Button } from "../../../core/ui";

export interface NavItem { id: string; label: string; icon: React.ReactNode; }

export default function DashboardShell({
  nav, active, onNav, accent, children,
}: {
  nav: NavItem[]; active: string; onNav: (id: string) => void;
  accent: "agua" | "earth"; children: React.ReactNode;
}) {
  const navigate = useNavigate();
  const user = useStore((s) => s.user);
  const logout = useStore((s) => s.logout);
  const accentBg = accent === "agua" ? "from-agua-500 to-agua-600" : "from-earth-400 to-earth-300";
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [editProfile, setEditProfile] = useState(false);

  const doLogout = () => {
    setConfirmLogout(false);
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex">
      {/* Campanita de notificaciones: fija en la esquina superior derecha de toda la
          pantalla (no dentro del sidebar), así nunca queda sobrepuesta ni recortada. */}
      {user && (
        <div className="fixed top-4 right-4 z-40">
          <NotificationBell forUserId={user.id} />
        </div>
      )}

      {/* Sidebar flotante — fija en pantalla, no se desplaza con el catálogo */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 p-4 gap-4 md:sticky md:top-0 md:h-screen md:overflow-y-auto">
        <div className="glass rounded-2xl p-4 shadow-float shrink-0">
          <div className="flex items-center gap-2">
            <div className={cx("grid place-items-center w-9 h-9 rounded-xl text-white bg-gradient-to-br shadow-glow", accentBg)}>
              <Tractor size={18} />
            </div>
            <div className="leading-none flex-1 min-w-0">
              <p className="font-display font-extrabold text-slate-800 text-sm">{accent === "agua" ? "AgroRent" : "TractorLink"}</p>
              <p className="text-[10px] text-slate-400 font-semibold">{accent === "agua" ? "PANEL CLIENTE" : "PANEL PROVEEDOR"}</p>
            </div>
          </div>
        </div>

        <nav className="glass rounded-2xl p-2 shadow-float flex-1 min-h-0 overflow-y-auto">
          {nav.map((n) => (
            <button key={n.id} onClick={() => onNav(n.id)}
              className={cx(
                "w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all mb-0.5",
                active === n.id
                  ? (accent === "agua" ? "bg-agua-500 text-white shadow-glow" : "bg-earth-400 text-white shadow-float")
                  : "text-slate-600 hover:bg-white/70"
              )}>
              {n.icon} {n.label}
            </button>
          ))}
        </nav>

        {/* Bloque de usuario + empresa + cerrar sesión: siempre visible al pie */}
        <div className="glass rounded-2xl p-3 shadow-float shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 grid place-items-center text-white font-bold text-sm" style={{ background: user?.avatarColor }}>
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user?.name.split(" ").map((s) => s[0]).slice(0, 2).join("")
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate flex items-center gap-1">
                {user?.name} {user?.verified && <BadgeCheck size={13} className="text-agua-500" />}
              </p>
              <p className="text-[11px] text-slate-400 truncate">{user?.company}</p>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-1.5">
            <button onClick={() => setEditProfile(true)}
              className="flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-agua-600 py-2 rounded-lg hover:bg-white/70 transition">
              <Pencil size={13} /> Editar perfil
            </button>
            <button onClick={() => setConfirmLogout(true)}
              className="flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-terra-500 py-2 rounded-lg hover:bg-white/70 transition">
              <LogOut size={14} /> Cerrar sesión
            </button>
          </div>
        </div>
      </aside>

      {/* Área de trabajo */}
      <main className="flex-1 p-4 md:p-6 min-w-0">
        {/* Topbar móvil */}
        <div className="md:hidden glass rounded-2xl p-2 mb-4 pr-14 flex items-center gap-1.5 overflow-x-auto shadow-float">
          {nav.map((n) => (
            <button key={n.id} onClick={() => onNav(n.id)}
              className={cx("flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap",
                active === n.id ? (accent === "agua" ? "bg-agua-500 text-white" : "bg-earth-400 text-white") : "text-slate-600")}>
              {n.icon} {n.label}
            </button>
          ))}
          <div className="ml-auto shrink-0 flex items-center gap-1">
            <button onClick={() => setEditProfile(true)} className="w-8 h-8 grid place-items-center rounded-lg text-slate-500 hover:text-agua-600 hover:bg-white/70 transition" title="Editar perfil">
              <Pencil size={15} />
            </button>
            <button onClick={() => setConfirmLogout(true)} className="w-8 h-8 grid place-items-center rounded-lg text-slate-500 hover:text-terra-500 hover:bg-white/70 transition" title="Cerrar sesión">
              <LogOut size={15} />
            </button>
          </div>
        </div>
        {children}
      </main>

      {/* Confirmación de cierre de sesión */}
      <Modal open={confirmLogout} onClose={() => setConfirmLogout(false)}>
        <div className="text-center">
          <div className="w-14 h-14 rounded-full bg-terra-500/10 grid place-items-center mx-auto mb-3">
            <TriangleAlert size={26} className="text-terra-500" />
          </div>
          <h3 className="font-display font-bold text-xl text-slate-800">¿Seguro que quieres salir?</h3>
          <p className="text-sm text-slate-500 mt-1.5">Se cerrará tu sesión actual y volverás a la página de inicio.</p>
          <div className="flex gap-2 mt-6">
            <Button variant="ghost" className="flex-1" onClick={() => setConfirmLogout(false)}>Cancelar</Button>
            <Button variant="danger" className="flex-1" onClick={doLogout}>Confirmar</Button>
          </div>
        </div>
      </Modal>

      {user && <EditProfileModal open={editProfile} onClose={() => setEditProfile(false)} />}
    </div>
  );
}
