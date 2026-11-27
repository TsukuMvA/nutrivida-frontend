import { useState, useEffect } from "react";
import ServicioCard from "../components/ServicioCard";
import { listarServicios } from "../services/api";

function Servicios() {
  const [busqueda, setBusqueda] = useState("");
  const [servicios, setServicios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargar = async () => {
      try {
        const data = await listarServicios();
        setServicios(data);
      } catch (err) {
        setError("No se pudieron cargar los servicios desde el servidor.");
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, []);

  const serviciosFiltrados = servicios.filter((servicio) =>
    servicio.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    servicio.especialidad.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <main className="container py-5">
      <h2 className="text-center mb-3">Nuestros servicios nutricionales</h2>
      <p className="text-center mb-4">
        Conoce los servicios disponibles en NutriVida.
      </p>

      <div className="row justify-content-center mb-4">
        <div className="col-12 col-md-6">
          <input
            type="text"
            className="form-control"
            placeholder="Buscar por nombre o especialidad..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </div>

      {cargando && <p className="text-center">Cargando servicios...</p>}

      {error && (
        <div className="alert alert-danger text-center" role="alert">
          {error}
        </div>
      )}

      <div className="row g-4">
        {serviciosFiltrados.map((servicio) => (
          <div className="col-12 col-md-6 col-lg-4" key={servicio.id}>
            <ServicioCard
              titulo={servicio.nombre}
              descripcion={servicio.descripcion}
              precio={servicio.precio}
              duracionMinutos={servicio.duracionMinutos}
              especialidad={servicio.especialidad}
            />
          </div>
        ))}
      </div>

      {!cargando && !error && serviciosFiltrados.length === 0 && (
        <p className="text-center mt-4">No se encontraron servicios.</p>
      )}
    </main>
  );
}

export default Servicios;