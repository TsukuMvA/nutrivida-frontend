import { Navigate } from "react-router-dom";
import { obtenerSesion } from "../services/api";

function RutaProtegida({ children, rolRequerido = "ADMIN" }) {
  const sesion = obtenerSesion();

  if (!sesion || !sesion.token) {
    return <Navigate to="/login" replace />;
  }

  if (rolRequerido && sesion.rol !== rolRequerido) {
    return <Navigate to="/servicios" replace />;
  }

  return children;
}

export default RutaProtegida;