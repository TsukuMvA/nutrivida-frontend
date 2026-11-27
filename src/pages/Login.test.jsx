import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Login from "./Login";
import * as api from "../services/api";

const navegarMock = vi.fn();

vi.mock("react-router-dom", async () => {
  const original = await vi.importActual("react-router-dom");
  return {
    ...original,
    useNavigate: () => navegarMock,
  };
});

describe("Pruebas de Login", () => {
  beforeEach(() => {
    localStorage.clear();
    navegarMock.mockClear();
    vi.restoreAllMocks();
  });

  it("muestra el formulario de inicio de sesión", () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { name: "Iniciar sesión" })).toBeInTheDocument();
    expect(screen.getByLabelText("Correo electrónico")).toBeInTheDocument();
    expect(screen.getByLabelText("Contraseña")).toBeInTheDocument();
  });

  it("muestra error cuando los campos están vacíos", () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: "Iniciar sesión" }));
    expect(screen.getByText("Todos los campos son obligatorios.")).toBeInTheDocument();
  });

  it("muestra error cuando el correo es inválido", () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText("Correo electrónico"), {
      target: { value: "correo-invalido" },
    });
    fireEvent.change(screen.getByLabelText("Contraseña"), {
      target: { value: "admin123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Iniciar sesión" }));

    expect(screen.getByText("Ingresa un correo electrónico válido.")).toBeInTheDocument();
  });

  it("muestra error cuando las credenciales son incorrectas", async () => {
    vi.spyOn(api, "loginUsuario").mockRejectedValueOnce(
      new Error("Correo o contraseña incorrectos.")
    );

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText("Correo electrónico"), {
      target: { value: "usuario@correo.cl" },
    });
    fireEvent.change(screen.getByLabelText("Contraseña"), {
      target: { value: "ClaveIncorrecta" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Iniciar sesión" }));

    await waitFor(() => {
      expect(screen.getByText("Correo o contraseña incorrectos.")).toBeInTheDocument();
    });
    expect(localStorage.getItem("nutrividaAuth")).toBeNull();
  });

  it("guarda la sesión JWT y redirige al administrador", async () => {
    vi.spyOn(api, "loginUsuario").mockResolvedValueOnce({
      token: "jwt-token-admin",
      nombre: "Dra. Camila Soto",
      email: "admin@nutrivida.cl",
      rol: "ADMIN",
    });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText("Correo electrónico"), {
      target: { value: "admin@nutrivida.cl" },
    });
    fireEvent.change(screen.getByLabelText("Contraseña"), {
      target: { value: "admin123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Iniciar sesión" }));

    await waitFor(() => {
      expect(navegarMock).toHaveBeenCalledWith("/admin", { replace: true });
    });

    const sesion = JSON.parse(localStorage.getItem("nutrividaAuth"));
    expect(sesion.token).toBe("jwt-token-admin");
    expect(sesion.rol).toBe("ADMIN");
  });
});