import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Admin from "./Admin";
import * as api from "../services/api";

const navegarMock = vi.fn();

vi.mock("react-router-dom", async () => {
  const original = await vi.importActual("react-router-dom");
  return {
    ...original,
    useNavigate: () => navegarMock,
  };
});

describe("Pruebas del panel administrativo", () => {
  beforeEach(() => {
    localStorage.clear();
    navegarMock.mockClear();
    vi.restoreAllMocks();
    vi.spyOn(api, "listarServicios").mockResolvedValue([]);
    vi.spyOn(api, "listarConsultas").mockResolvedValue([]);
  });

  it("muestra el título del panel administrativo", async () => {
    render(
      <MemoryRouter>
        <Admin />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Panel de administración" })
      ).toBeInTheDocument();
    });
  });

  it("muestra las secciones de gestión de servicios y consultas", async () => {
    render(
      <MemoryRouter>
        <Admin />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Nuevo servicio nutricional")).toBeInTheDocument();
    });

    expect(
      screen.getByRole("heading", { name: /Servicios registrados/i })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: /Consultas de pacientes/i })
    ).toBeInTheDocument();
  });

  it("elimina la sesión al cerrar sesión", async () => {
    localStorage.setItem(
      "nutrividaAuth",
      JSON.stringify({ token: "jwt-admin", nombre: "Admin", rol: "ADMIN" })
    );

    render(
      <MemoryRouter>
        <Admin />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Cerrar sesión" })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "Cerrar sesión" }));

    expect(localStorage.getItem("nutrividaAuth")).toBeNull();
    expect(navegarMock).toHaveBeenCalledWith("/login", { replace: true });
  });
});