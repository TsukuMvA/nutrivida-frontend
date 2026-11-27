import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUsuario, guardarSesion } from "../services/api";

function Login() {
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const navigate = useNavigate();

  const manejarEnvio = async (e) => {
    e.preventDefault();
    setError("");

    if (correo.trim() === "" || contrasena.trim() === "") {
      setError("Todos los campos son obligatorios.");
      return;
    }

    const formatoCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formatoCorreo.test(correo.trim())) {
      setError("Ingresa un correo electrónico válido.");
      return;
    }

    try {
      setCargando(true);
      const data = await loginUsuario(correo.trim(), contrasena);
      guardarSesion(data);

      setCorreo("");
      setContrasena("");

      if (data.rol === "ADMIN") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/servicios", { replace: true });
      }
    } catch (err) {
      setError(err.message || "Correo o contraseña incorrectos.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <main className="container py-5">
      <h2 className="text-center mb-4">Iniciar sesión</h2>

      <p className="text-center mb-4">
        Accede a la plataforma de NutriVida con tu cuenta de administrador o paciente.
      </p>

      <form
        className="mx-auto"
        style={{ maxWidth: "450px" }}
        onSubmit={manejarEnvio}
        noValidate
      >
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <div className="mb-3">
          <label htmlFor="correo" className="form-label">
            Correo electrónico
          </label>
          <input
            type="email"
            id="correo"
            className="form-control"
            placeholder="Ej: admin@nutrivida.cl"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label htmlFor="contrasena" className="form-label">
            Contraseña
          </label>
          <input
            type="password"
            id="contrasena"
            className="form-control"
            placeholder="Ingresa tu contraseña"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
          />
        </div>

        <button
          type="submit"
          className="btn btn-success w-100"
          disabled={cargando}
        >
          {cargando ? "Validando..." : "Iniciar sesión"}
        </button>

        <div className="mt-3 p-3 bg-light rounded small text-muted">
          <strong>Cuentas de prueba:</strong>
          <div>Admin: <code>admin@nutrivida.cl</code> / <code>admin123</code></div>
          <div>Paciente: <code>paciente@nutrivida.cl</code> / <code>paciente123</code></div>
        </div>
      </form>
    </main>
  );
}

export default Login;