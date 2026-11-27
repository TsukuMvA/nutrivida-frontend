import { NavLink, useNavigate } from "react-router-dom";
import { obtenerSesion, cerrarSesionStorage } from "../services/api";

function Header() {
  const navigate = useNavigate();
  const sesion = obtenerSesion();

  const manejarLogout = () => {
    cerrarSesionStorage();
    navigate("/login", { replace: true });
  };

  return (
    <header className="navbar navbar-expand-md bg-white shadow-sm">
      <div className="container">
        <NavLink className="navbar-brand fw-bold text-success" to="/">
          🌿 NutriVida
        </NavLink>

        <nav className="d-flex flex-wrap align-items-center gap-3">
          <NavLink className="nav-link" to="/">
            Inicio
          </NavLink>

          <NavLink className="nav-link" to="/servicios">
            Servicios
          </NavLink>

          <NavLink className="nav-link" to="/contacto">
            Contacto
          </NavLink>

          {sesion?.rol === "ADMIN" && (
            <NavLink className="nav-link fw-semibold text-success" to="/admin">
              Panel Admin
            </NavLink>
          )}

          {sesion ? (
            <div className="d-flex align-items-center gap-2">
              <span className="badge bg-success-subtle text-success border border-success">
                {sesion.nombre} ({sesion.rol})
              </span>
              <button
                type="button"
                className="btn btn-outline-danger btn-sm"
                onClick={manejarLogout}
              >
                Salir
              </button>
            </div>
          ) : (
            <NavLink className="nav-link" to="/login">
              Iniciar sesión
            </NavLink>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;