import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import RutaProtegida from "./RutaProtegida";

describe("Pruebas de RutaProtegida", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("permite el acceso cuando existe token y rol ADMIN", () => {
    localStorage.setItem(
      "nutrividaAuth",
      JSON.stringify({ token: "jwt-demo", rol: "ADMIN", nombre: "Admin" })
    );

    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <Routes>
          <Route
            path="/admin"
            element={
              <RutaProtegida>
                <h1>Panel privado</h1>
              </RutaProtegida>
            }
          />
          <Route path="/login" element={<h1>Login</h1>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Panel privado")).toBeInTheDocument();
  });

  it("redirige a Login cuando no existe una sesión", () => {
    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <Routes>
          <Route
            path="/admin"
            element={
              <RutaProtegida>
                <h1>Panel privado</h1>
              </RutaProtegida>
            }
          />
          <Route path="/login" element={<h1>Login</h1>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Login")).toBeInTheDocument();
    expect(screen.queryByText("Panel privado")).not.toBeInTheDocument();
  });

  it("redirige a Servicios cuando el rol no es ADMIN", () => {
    localStorage.setItem(
      "nutrividaAuth",
      JSON.stringify({ token: "jwt-paciente", rol: "PACIENTE", nombre: "Juan" })
    );

    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <Routes>
          <Route
            path="/admin"
            element={
              <RutaProtegida>
                <h1>Panel privado</h1>
              </RutaProtegida>
            }
          />
          <Route path="/servicios" element={<h1>Catálogo Servicios</h1>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Catálogo Servicios")).toBeInTheDocument();
    expect(screen.queryByText("Panel privado")).not.toBeInTheDocument();
  });
});