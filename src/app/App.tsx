import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useStore } from "../store/useStore";
import type { Role } from "../modules/users/types";
import Landing from "../modules/landing/Landing";
import Login from "../modules/users/pages/Login";
import ProviderDashboard from "../modules/dashboard/provider/ProviderDashboard";
import ClientDashboard from "../modules/dashboard/client/ClientDashboard";

// -------- RequireAuth: rutas protegidas y roles mutuamente excluyentes --------
function RequireAuth({ role, children }: { role: Role; children: JSX.Element }) {
  const user = useStore((s) => s.user);
  const location = useLocation();
  if (!user) return <Navigate to="/login" state={{ from: location, role }} replace />;
  if (user.role !== role) {
    // Un proveedor no puede entrar al panel de cliente y viceversa.
    return <Navigate to={user.role === "proveedor" ? "/proveedor" : "/cliente"} replace />;
  }
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/proveedor"
        element={
          <RequireAuth role="proveedor">
            <ProviderDashboard />
          </RequireAuth>
        }
      />
      <Route
        path="/cliente"
        element={
          <RequireAuth role="cliente">
            <ClientDashboard />
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
