import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  obtenerSesion,
  cerrarSesionStorage,
  listarServicios,
  crearServicio,
  actualizarServicio,
  eliminarServicio,
  listarConsultas,
  cambiarEstadoConsulta,
  eliminarConsulta,
} from "../services/api";

const FORM_INICIAL = {
  nombre: "",
  descripcion: "",
  precio: "",
  duracionMinutos: "",
  especialidad: "",
  activo: true,
};

function Admin() {
  const navigate = useNavigate();
  const sesion = obtenerSesion();

  const [servicios, setServicios] = useState([]);
  const [consultas, setConsultas] = useState([]);
  const [form, setForm] = useState(FORM_INICIAL);
  const [editandoId, setEditandoId] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const cargarDatos = async () => {
    try {
      const [listaServ, listaCons] = await Promise.all([
        listarServicios(),
        listarConsultas(),
      ]);
      setServicios(listaServ);
      setConsultas(listaCons);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const cerrarSesion = () => {
    cerrarSesionStorage();
    navigate("/login", { replace: true });
  };

  const manejarGuardarServicio = async (e) => {
    e.preventDefault();
    setMensaje("");
    setError("");

    const payload = {
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim(),
      precio: Number(form.precio),
      duracionMinutos: Number(form.duracionMinutos),
      especialidad: form.especialidad.trim(),
      activo: true,
    };

    try {
      if (editandoId) {
        await actualizarServicio(editandoId, payload);
        setMensaje("Servicio nutricional actualizado.");
      } else {
        await crearServicio(payload);
        setMensaje("Servicio nutricional creado.");
      }
      setForm(FORM_INICIAL);
      setEditandoId(null);
      await cargarDatos();
    } catch (err) {
      setError(err.message);
    }
  };

  const seleccionarEdicion = (srv) => {
    setEditandoId(srv.id);
    setForm({
      nombre: srv.nombre,
      descripcion: srv.descripcion,
      precio: srv.precio,
      duracionMinutos: srv.duracionMinutos,
      especialidad: srv.especialidad,
      activo: srv.activo,
    });
    setMensaje("");
    setError("");
  };

  const manejarEliminarServicio = async (id) => {
    try {
      await eliminarServicio(id);
      setMensaje("Servicio eliminado.");
      await cargarDatos();
    } catch (err) {
      setError(err.message);
    }
  };

  const manejarEstadoConsulta = async (id, estado) => {
    try {
      await cambiarEstadoConsulta(id, estado);
      await cargarDatos();
    } catch (err) {
      setError(err.message);
    }
  };

  const manejarEliminarConsulta = async (id) => {
    try {
      await eliminarConsulta(id);
      await cargarDatos();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <main className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">Panel de administración</h2>
          <p className="text-muted mb-0">
            Sesión activa: <strong>{sesion?.nombre}</strong> ({sesion?.rol})
          </p>
        </div>
        <button type="button" className="btn btn-danger" onClick={cerrarSesion}>
          Cerrar sesión
        </button>
      </div>

      {mensaje && <div className="alert alert-success">{mensaje}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {/* Formulario CRUD de Servicios */}
      <div className="card shadow-sm mb-5">
        <div className="card-header bg-success text-white fw-semibold">
          {editandoId ? `Editar servicio #${editandoId}` : "Nuevo servicio nutricional"}
        </div>
        <div className="card-body">
          <form onSubmit={manejarGuardarServicio} className="row g-3">
            <div className="col-md-4">
              <label className="form-label">Nombre del servicio</label>
              <input
                type="text"
                className="form-control"
                required
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              />
            </div>

            <div className="col-md-4">
              <label className="form-label">Especialidad</label>
              <input
                type="text"
                className="form-control"
                placeholder="Ej: Nutrición Clínica"
                required
                value={form.especialidad}
                onChange={(e) => setForm({ ...form, especialidad: e.target.value })}
              />
            </div>

            <div className="col-md-2">
              <label className="form-label">Precio ($)</label>
              <input
                type="number"
                className="form-control"
                min="1000"
                required
                value={form.precio}
                onChange={(e) => setForm({ ...form, precio: e.target.value })}
              />
            </div>

            <div className="col-md-2">
              <label className="form-label">Duración (min)</label>
              <input
                type="number"
                className="form-control"
                min="15"
                max="180"
                required
                value={form.duracionMinutos}
                onChange={(e) =>
                  setForm({ ...form, duracionMinutos: e.target.value })
                }
              />
            </div>

            <div className="col-12">
              <label className="form-label">Descripción</label>
              <input
                type="text"
                className="form-control"
                required
                value={form.descripcion}
                onChange={(e) =>
                  setForm({ ...form, descripcion: e.target.value })
                }
              />
            </div>

            <div className="col-12 d-flex gap-2">
              <button type="submit" className="btn btn-success">
                {editandoId ? "Guardar cambios" : "Crear servicio"}
              </button>
              {editandoId && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setEditandoId(null);
                    setForm(FORM_INICIAL);
                  }}
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Tabla de Servicios */}
      <h4 className="mb-3">Servicios registrados ({servicios.length})</h4>
      <div className="table-responsive mb-5">
        <table className="table table-bordered align-middle">
          <thead className="table-light">
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Especialidad</th>
              <th>Duración</th>
              <th>Precio</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {servicios.map((srv) => (
              <tr key={srv.id}>
                <td>{srv.id}</td>
                <td>{srv.nombre}</td>
                <td>{srv.especialidad}</td>
                <td>{srv.duracionMinutos} min</td>
                <td>${Number(srv.precio).toLocaleString("es-CL")}</td>
                <td className="d-flex gap-2">
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => seleccionarEdicion(srv)}
                  >
                    Editar
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => manejarEliminarServicio(srv.id)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {servicios.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center text-muted">
                  No hay servicios registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Tabla de Consultas recibidas */}
      <h4 className="mb-3">Consultas de pacientes ({consultas.length})</h4>
      <div className="table-responsive">
        <table className="table table-bordered align-middle">
          <thead className="table-light">
            <tr>
              <th>Paciente</th>
              <th>Contacto</th>
              <th>Mensaje</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {consultas.map((c) => (
              <tr key={c.id}>
                <td>{c.nombrePaciente}</td>
                <td>
                  <div>{c.email}</div>
                  <small className="text-muted">{c.telefono}</small>
                </td>
                <td>{c.mensaje}</td>
                <td>
                  <span
                    className={`badge ${
                      c.estado === "RESPONDIDA" ? "bg-success" : "bg-warning text-dark"
                    }`}
                  >
                    {c.estado}
                  </span>
                </td>
                <td className="d-flex gap-2">
                  {c.estado !== "RESPONDIDA" && (
                    <button
                      className="btn btn-sm btn-outline-success"
                      onClick={() => manejarEstadoConsulta(c.id, "RESPONDIDA")}
                    >
                      Marcar respondida
                    </button>
                  )}
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => manejarEliminarConsulta(c.id)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {consultas.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center text-muted">
                  No hay consultas recibidas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}

export default Admin;