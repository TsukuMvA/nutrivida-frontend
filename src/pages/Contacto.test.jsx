import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Contacto from "./Contacto";
import * as api from "../services/api";

describe("Pruebas del formulario de Contacto", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(api, "enviarConsulta").mockResolvedValue({ id: 1, estado: "PENDIENTE" });
  });

  it("Debe mostrar los campos del formulario", () => {
    render(<Contacto />);

    expect(screen.getByLabelText("Nombre completo")).toBeInTheDocument();
    expect(screen.getByLabelText("Correo electrónico")).toBeInTheDocument();
    expect(screen.getByLabelText("Teléfono de contacto")).toBeInTheDocument();
    expect(screen.getByLabelText("Mensaje o motivo de consulta")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Enviar mensaje" })).toBeInTheDocument();
  });

  it("Debe mostrar un error si los campos están vacíos", () => {
    render(<Contacto />);

    fireEvent.click(screen.getByRole("button", { name: "Enviar mensaje" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Todos los campos son obligatorios.");
  });

  it("Debe mostrar un error si el correo no es válido", () => {
    render(<Contacto />);

    fireEvent.change(screen.getByLabelText("Nombre completo"), { target: { value: "Camila" } });
    fireEvent.change(screen.getByLabelText("Correo electrónico"), { target: { value: "correo-invalido" } });
    fireEvent.change(screen.getByLabelText("Teléfono de contacto"), { target: { value: "+56912345678" } });
    fireEvent.change(screen.getByLabelText("Mensaje o motivo de consulta"), {
      target: { value: "Necesito información nutricional" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Enviar mensaje" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Ingresa un correo electrónico válido.");
  });

  it("Debe mostrar una confirmación y limpiar los campos si los datos son correctos", async () => {
    render(<Contacto />);

    fireEvent.change(screen.getByLabelText("Nombre completo"), { target: { value: "Camila" } });
    fireEvent.change(screen.getByLabelText("Correo electrónico"), { target: { value: "camila@gmail.com" } });
    fireEvent.change(screen.getByLabelText("Teléfono de contacto"), { target: { value: "+56912345678" } });
    fireEvent.change(screen.getByLabelText("Mensaje o motivo de consulta"), {
      target: { value: "Quiero conocer los servicios" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Enviar mensaje" }));

    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent(
        "Tu consulta fue registrada correctamente en NutriVida."
      );
    });

    expect(screen.getByLabelText("Nombre completo")).toHaveValue("");
    expect(screen.getByLabelText("Correo electrónico")).toHaveValue("");
    expect(screen.getByLabelText("Teléfono de contacto")).toHaveValue("");
    expect(screen.getByLabelText("Mensaje o motivo de consulta")).toHaveValue("");
  });
});