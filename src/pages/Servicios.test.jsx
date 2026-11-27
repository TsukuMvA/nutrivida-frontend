import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Servicios from "./Servicios";
import * as api from "../services/api";

const SERVICIOS_MOCK = [
  {
    id: 1,
    nombre: "Evaluación nutricional",
    descripcion: "Conoce tu estado nutricional mediante una evaluación personalizada.",
    precio: 30000,
    duracionMinutos: 45,
    especialidad: "Nutrición Clínica",
  },
  {
    id: 2,
    nombre: "Planes alimenticios",
    descripcion: "Recibe orientación alimentaria adaptada a tus necesidades.",
    precio: 35000,
    duracionMinutos: 60,
    especialidad: "Nutrición Deportiva",
  },
  {
    id: 3,
    nombre: "Seguimiento nutricional",
    descripcion: "Realiza un seguimiento de tus avances y objetivos nutricionales.",
    precio: 25000,
    duracionMinutos: 30,
    especialidad: "Control de Peso",
  },
];

describe("Pruebas de la página Servicios", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(api, "listarServicios").mockResolvedValue(SERVICIOS_MOCK);
  });

  it("Debe mostrar los tres servicios disponibles desde la API", async () => {
    render(<Servicios />);

    await waitFor(() => {
      expect(screen.getByText("Evaluación nutricional")).toBeInTheDocument();
    });
    expect(screen.getByText("Planes alimenticios")).toBeInTheDocument();
    expect(screen.getByText("Seguimiento nutricional")).toBeInTheDocument();
  });

  it("Debe filtrar los servicios al escribir en el buscador", async () => {
    render(<Servicios />);

    await waitFor(() => {
      expect(screen.getByText("Planes alimenticios")).toBeInTheDocument();
    });

    const buscador = screen.getByPlaceholderText("Buscar por nombre o especialidad...");
    fireEvent.change(buscador, { target: { value: "Planes" } });

    expect(screen.getByText("Planes alimenticios")).toBeInTheDocument();
    expect(screen.queryByText("Evaluación nutricional")).not.toBeInTheDocument();
    expect(screen.queryByText("Seguimiento nutricional")).not.toBeInTheDocument();
  });

  it("Debe mostrar un mensaje cuando no existen resultados", async () => {
    render(<Servicios />);

    await waitFor(() => {
      expect(screen.getByText("Evaluación nutricional")).toBeInTheDocument();
    });

    const buscador = screen.getByPlaceholderText("Buscar por nombre o especialidad...");
    fireEvent.change(buscador, { target: { value: "Servicio inexistente" } });

    expect(screen.getByText("No se encontraron servicios.")).toBeInTheDocument();
  });
});