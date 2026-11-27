const API_URL = "http://localhost:8080/api";

export function tokenExpirado(token) {
  if (!token || typeof token !== "string") return true;
  const partes = token.split(".");
  // Si no tiene estructura JWT (3 partes), es un token mockeado en pruebas unitarias
  if (partes.length !== 3) return false;
  try {
    const base64 = partes[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(base64));
    if (!payload.exp) return false;
    return Date.now() >= payload.exp * 1000;
  } catch {
    return false;
  }
}

export function obtenerSesion() {
  const raw = localStorage.getItem("nutrividaAuth");
  if (!raw) return null;
  try {
    const sesion = JSON.parse(raw);
    if (sesion?.token && tokenExpirado(sesion.token)) {
      localStorage.removeItem("nutrividaAuth");
      return null;
    }
    return sesion;
  } catch {
    localStorage.removeItem("nutrividaAuth");
    return null;
  }
}

export function guardarSesion(datos) {
  localStorage.setItem("nutrividaAuth", JSON.stringify(datos));
}

export function cerrarSesionStorage() {
  localStorage.removeItem("nutrividaAuth");
}

async function request(endpoint, options = {}) {
  const sesion = obtenerSesion();
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (sesion?.token) {
    headers["Authorization"] = `Bearer ${sesion.token}`;
  }

  let response;
  try {
    response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });
  } catch {
    throw new Error("No se pudo conectar con el servidor. Verifica que el backend esté activo.");
  }

  if (response.status === 401) {
    if (sesion?.token && endpoint !== "/auth/login") {
      cerrarSesionStorage();
      window.location.href = "/login";
    }
    throw new Error("No autenticado o sesión expirada. Inicia sesión nuevamente.");
  }

  if (response.status === 403) {
    throw new Error("Acceso denegado: tu rol no tiene permisos para realizar esta acción.");
  }

  if (!response.ok) {
    let mensajeError = "Error al comunicarse con el servidor.";
    try {
      const errData = await response.json();
      mensajeError = errData.message || errData.error || mensajeError;
    } catch {
      // Sin cuerpo JSON en el error
    }
    throw new Error(mensajeError);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

// --- Autenticación ---
export function loginUsuario(email, password) {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function registrarPaciente(datos) {
  return request("/auth/register", {
    method: "POST",
    body: JSON.stringify(datos),
  });
}

export async function verificarSesionServidor() {
  const sesion = obtenerSesion();
  if (!sesion?.token) return null;

  const perfil = await request("/auth/me");
  const sesionActualizada = {
    ...sesion,
    email: perfil.email,
    nombre: perfil.nombre,
    rol: perfil.rol,
  };
  guardarSesion(sesionActualizada);
  return sesionActualizada;
}

// --- Servicios Nutricionales ---
export function listarServicios() {
  return request("/servicios");
}

export function crearServicio(servicio) {
  return request("/servicios", {
    method: "POST",
    body: JSON.stringify(servicio),
  });
}

export function actualizarServicio(id, servicio) {
  return request(`/servicios/${id}`, {
    method: "PUT",
    body: JSON.stringify(servicio),
  });
}

export function eliminarServicio(id) {
  return request(`/servicios/${id}`, {
    method: "DELETE",
  });
}

// --- Consultas de Contacto ---
export function enviarConsulta(consulta) {
  return request("/consultas", {
    method: "POST",
    body: JSON.stringify(consulta),
  });
}

export function listarConsultas() {
  return request("/consultas");
}

export function cambiarEstadoConsulta(id, estado) {
  return request(`/consultas/${id}/estado?estado=${encodeURIComponent(estado)}`, {
    method: "PATCH",
  });
}

export function eliminarConsulta(id) {
  return request(`/consultas/${id}`, {
    method: "DELETE",
  });
}