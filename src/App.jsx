import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./layouts/Layout";
import RutaProtegida from "./components/RutaProtegida";
import { obtenerSesion, verificarSesionServidor } from "./services/api";

import Inicio from "./pages/Inicio";
import Servicios from "./pages/Servicios";
import Contacto from "./pages/Contacto";
import Login from "./pages/Login";
import Admin from "./pages/Admin";

import "./App.css";

function App() {
  const [validandoSesion, setValidandoSesion] = useState(() => Boolean(obtenerSesion()?.token));
  const [errorServidor, setErrorServidor] = useState("");

  const comprobarSesion = async () => {
    const sesion = obtenerSesion();
    if (!sesion?.token) {
      setValidandoSesion(false);
      setErrorServidor("");
      return;
    }

    setValidandoSesion(true);
    setErrorServidor("");
    try {
      await verificarSesionServidor();
    } catch (err) {
      setErrorServidor(err.message || "No se pudo validar la sesión con el servidor.");
    } finally {
      setValidandoSesion(false);
    }
  };

  useEffect(() => {
    comprobarSesion();
  }, []);

  if (validandoSesion) {
    return (
      <div style={{ padding: "3rem", textAlign: "center" }}>
        <p>Verificando sesión con el servidor NutriVida...</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      {errorServidor && (
        <div
          role="alert"
          style={{
            backgroundColor: "#fff3cd",
            color: "#664d03",
            padding: "0.75rem 1rem",
            textAlign: "center",
            borderBottom: "1px solid #ffecb5",
          }}
        >
          <span>{errorServidor} </span>
          <button
            type="button"
            onClick={comprobarSesion}
            style={{ marginLeft: "0.5rem", padding: "0.25rem 0.75rem", cursor: "pointer" }}
          >
            Reintentar
          </button>
        </div>
      )}

      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Inicio />} />
          <Route path="/servicios" element={<Servicios />} />
          <Route path="/contacto" element={<Contacto />} />
          <Route path="/login" element={<Login />} />

          <Route
            path="/admin"
            element={
              <RutaProtegida>
                <Admin />
              </RutaProtegida>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;