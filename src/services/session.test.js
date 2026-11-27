import { describe, it, expect, beforeEach } from "vitest";
import {
  guardarSesion,
  obtenerSesion,
  cerrarSesionStorage,
  tokenExpirado,
} from "./api";

function crearJwtConExp(expSegundos) {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = btoa(JSON.stringify({ sub: "paciente@nutrivida.cl", rol: "PACIENTE", exp: expSegundos }));
  return `${header}.${payload}.firmaSimulada`;
}

describe("Gestión de sesión y expiración JWT (Semana 15)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("guarda y recupera una sesión válida con JWT vigente", () => {
    const expFuturo = Math.floor(Date.now() / 1000) + 3600;
    const tokenValido = crearJwtConExp(expFuturo);

    guardarSesion({
      token: tokenValido,
      email: "paciente@nutrivida.cl",
      nombre: "Juan Pérez",
      rol: "PACIENTE",
    });

    const sesion = obtenerSesion();
    expect(sesion).not.toBeNull();
    expect(sesion.email).toBe("paciente@nutrivida.cl");
    expect(sesion.rol).toBe("PACIENTE");
    expect(tokenExpirado(tokenValido)).toBe(false);
  });

  it("detecta un JWT expirado, limpia localStorage y retorna null", () => {
    const expPasado = Math.floor(Date.now() / 1000) - 60;
    const tokenVencido = crearJwtConExp(expPasado);

    guardarSesion({
      token: tokenVencido,
      email: "paciente@nutrivida.cl",
      rol: "PACIENTE",
    });

    expect(tokenExpirado(tokenVencido)).toBe(true);
    expect(obtenerSesion()).toBeNull();
    expect(localStorage.getItem("nutrividaAuth")).toBeNull();
  });

  it("elimina completamente la sesión al ejecutar cerrarSesionStorage (logout)", () => {
    const expFuturo = Math.floor(Date.now() / 1000) + 3600;
    guardarSesion({
      token: crearJwtConExp(expFuturo),
      email: "admin@nutrivida.cl",
      rol: "ADMIN",
    });

    cerrarSesionStorage();
    expect(obtenerSesion()).toBeNull();
  });
});