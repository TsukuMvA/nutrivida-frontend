import { useState } from "react";
import { enviarConsulta } from "../services/api";

function Contacto() {
  const [nombrePaciente, setNombrePaciente] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [enviando, setEnviando] = useState(false);

  const manejarEnvio = async (e) => {
    e.preventDefault();
    setError("");
    setExito("");

    if (
      nombrePaciente.trim() === "" ||
      email.trim() === "" ||
      telefono.trim() === "" ||
      mensaje.trim() === ""
    ) {
      setError("Todos los campos son obligatorios.");
      return;
    }

    const formatoCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formatoCorreo.test(email.trim())) {
      setError("Ingresa un correo electrónico válido.");
      return;
    }

    try {
      setEnviando(true);
      await enviarConsulta({
        nombrePaciente: nombrePaciente.trim(),
        email: email.trim(),
        telefono: telefono.trim(),
        mensaje: mensaje.trim(),
      });

      setExito("Tu consulta fue registrada correctamente en NutriVida.");
      setNombrePaciente("");
      setEmail("");
      setTelefono("");
      setMensaje("");
    } catch (err) {
      setError(err.message || "Error al registrar la consulta.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <main className="container py-5">
      <h2 className="text-center mb-4">Contacto</h2>

      <p className="text-center mb-4">
        ¿Tienes alguna consulta sobre nuestros servicios nutricionales? Envíanos un mensaje.
      </p>

      <form
        className="mx-auto"
        style={{ maxWidth: "600px" }}
        onSubmit={manejarEnvio}
        noValidate
      >
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {exito && (
          <div className="alert alert-success" role="status">
            {exito}
          </div>
        )}

        <div className="mb-3">
          <label htmlFor="nombre" className="form-label">
            Nombre completo
          </label>
          <input
            type="text"
            id="nombre"
            className="form-control"
            placeholder="Ingresa tu nombre"
            value={nombrePaciente}
            onChange={(e) => setNombrePaciente(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label htmlFor="correo" className="form-label">
            Correo electrónico
          </label>
          <input
            type="email"
            id="correo"
            className="form-control"
            placeholder="Ingresa tu correo"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label htmlFor="telefono" className="form-label">
            Teléfono de contacto
          </label>
          <input
            type="tel"
            id="telefono"
            className="form-control"
            placeholder="Ej: +56 9 1234 5678"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label htmlFor="mensaje" className="form-label">
            Mensaje o motivo de consulta
          </label>
          <textarea
            id="mensaje"
            className="form-control"
            rows="4"
            placeholder="Escribe tu consulta"
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
          />
        </div>

        <button type="submit" className="btn btn-success" disabled={enviando}>
          {enviando ? "Enviando..." : "Enviar mensaje"}
        </button>
      </form>
    </main>
  );
}

export default Contacto;