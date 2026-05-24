/// <reference types="vitest/globals" />
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Header } from "./Header";

// Mock para que no rompa la importación del asset .png del logo
vi.mock("../../assets/icon512.png", () => ({ default: "mock-logo-path" }));

const mockBreadcrumbItems = [
  { label: "Inicio", action: vi.fn() },
  { label: "Configuración", action: vi.fn() },
];

const baseProps = {
  onWelcome: vi.fn(),
  breadcrumbItems: mockBreadcrumbItems,
  currentStep: "Paso Final",
};

beforeEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("Header – Renderizado Estático", () => {
  it("renderiza correctamente el logo con sus atributos de accesibilidad", () => {
    render(<Header {...baseProps} />);

    const logoImg = screen.getByAltText("Logo ExamCraft");
    expect(logoImg).toBeInTheDocument();
    expect(logoImg).toHaveAttribute("src", "mock-logo-path");
    expect(logoImg).toHaveAttribute("width", "60");
    expect(logoImg).toHaveAttribute("height", "60");
  });

  it("renderiza la estructura de las migas de pan (breadcrumbs) con sus separadores", () => {
    render(<Header {...baseProps} />);

    // Verifica que los textos de navegación están presentes
    expect(screen.getByText("Inicio")).toBeInTheDocument();
    expect(screen.getByText("Configuración")).toBeInTheDocument();
    
    // Verifica el paso actual (que no es un botón clickable)
    expect(screen.getByText("Paso Final")).toBeInTheDocument();

    // Busca los separadores en el documento (debe haber tantos como elementos en la lista)
    const separadores = screen.getAllByText(">");
    expect(separadores).toHaveLength(mockBreadcrumbItems.length);
  });

  it("funciona correctamente cuando la lista de breadcrumbItems viene vacía", () => {
    render(<Header {...baseProps} breadcrumbItems={[]} />);

    // Solo debe verse el paso actual directamente en el nav
    expect(screen.getByText("Paso Final")).toBeInTheDocument();
    expect(screen.queryByText("Inicio")).not.toBeInTheDocument();
    expect(screen.queryByText(">")).not.toBeInTheDocument();
  });
});

describe("Header – Interacciones de Usuario", () => {
  it("ejecuta onWelcome al hacer click sobre el botón del logo", async () => {
    render(<Header {...baseProps} />);

    // Buscamos el botón mediante su rol accesible o label
    const btnLogo = screen.getByRole("button", { name: "Ir a inicio" });
    await userEvent.click(btnLogo);

    expect(baseProps.onWelcome).toHaveBeenCalledTimes(1);
  });

  it("ejecuta la acción correspondiente al hacer click sobre un elemento específico del breadcrumb", async () => {
    render(<Header {...baseProps} />);

    // Buscamos el botón de la miga de pan por su texto exacto
    const btnInicio = screen.getByRole("button", { name: "Inicio" });
    await userEvent.click(btnInicio);

    // Debe haberse disparado el callback asociado a ese elemento
    expect(mockBreadcrumbItems[0].action).toHaveBeenCalledTimes(1);
    expect(mockBreadcrumbItems[1].action).not.toHaveBeenCalled();
  });
});