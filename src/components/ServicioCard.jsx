function ServicioCard({ titulo, descripcion, precio, duracionMinutos, especialidad }) {
  return (
    <div className="card h-100 shadow-sm tarjeta-servicio">
      <div className="card-body d-flex flex-column">
        {especialidad && (
          <span className="badge bg-success-subtle text-success align-self-start mb-2">
            {especialidad}
          </span>
        )}
        <h3 className="card-title h5 text-success">{titulo}</h3>
        <p className="card-text flex-grow-1">{descripcion}</p>
        {(precio !== undefined || duracionMinutos !== undefined) && (
          <div className="border-top pt-2 mt-2 d-flex justify-content-between small text-muted">
            {duracionMinutos && <span>⏱ {duracionMinutos} min</span>}
            {precio && <strong>${Number(precio).toLocaleString("es-CL")}</strong>}
          </div>
        )}
      </div>
    </div>
  );
}

export default ServicioCard;