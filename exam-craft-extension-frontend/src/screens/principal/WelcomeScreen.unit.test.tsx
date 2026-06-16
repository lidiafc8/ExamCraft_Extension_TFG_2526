import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach } from "vitest";
import "@testing-library/jest-dom";
import WelcomeScreen from "./WelcomeScreen";

// === EXTENDER MATCHERS PARA JEST-DOM ===
import * as jestDomMatchers from "@testing-library/jest-dom/matchers";
expect.extend(jestDomMatchers);

// --- MOCK DE COMPONENTES AUXILIARES ---
vi.mock("~src/components/Header", () => ({
  Header: ({ currentStep, onWelcome }: any) => (
    <header data-testid="mock-header">
      <h1>{currentStep}</h1>
      <button onClick={onWelcome}>Botón Welcome Header</button>
    </header>
  ),
}));

// --- MOCK DE ASSETS DE IMÁGENES ---
// Esto previene fallos de resolución de empaquetadores en entornos de test puros
vi.mock("../../../assets/images/exam.png", () => ({ default: "mock-exam-icon.png" }));
vi.mock("../../../assets/images/archive.png", () => ({ default: "mock-archive-icon.png" }));

describe("WelcomeScreen", () => {
  const baseProps = {
    onStart: vi.fn(),
    onCreateExam: vi.fn(),
    onBack: vi.fn(),
    onStorage: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Casos Positivos y Renderizado Estructural", () => {
    it("renderiza correctamente el título principal, las insignias de texto y el subcomponente Header", () => {
      render(<WelcomeScreen {...baseProps} />);

      // Verificar que el Header simulado se monta con los atributos correctos
      expect(screen.getByTestId("mock-header")).toBeInTheDocument();
      expect(screen.getByRole("heading", { name: "INICIO" })).toBeInTheDocument();

      // Verificar títulos de bienvenida de la pantalla central
      expect(screen.getByRole("heading", { level: 1, name: "¡BIENVENIDO A EXAMCRAFT!" })).toBeInTheDocument();
      expect(screen.getByText("¿Qué desea hacer?")).toBeInTheDocument();
    });

    it("renderiza las tarjetas de acción con sus respectivas etiquetas de texto e imágenes alternativas (alt)", () => {
      render(<WelcomeScreen {...baseProps} />);

      // Verificar botón "Crear examen" e icono asociado
      const imgExamen = screen.getByAltText("Icono examen") as HTMLImageElement;
      expect(imgExamen).toBeInTheDocument();
      expect(screen.getByText("Crear examen")).toBeInTheDocument();

      // Verificar botón "Consultar exámenes anteriores" e icono asociado
      const imgArchivo = screen.getByAltText("Icono archivo") as HTMLImageElement;
      expect(imgArchivo).toBeInTheDocument();
      expect(screen.getByText("Consultar exámenes anteriores")).toBeInTheDocument();

      // Verificar botón flotante de GitHub Info
      expect(screen.getByRole("button", { name: "GitHub Info" })).toBeInTheDocument();
    });
  });

  describe("Flujo de Lógica e Interacciones del Usuario (Callbacks)", () => {
    it("dispara onCreateExam de forma exitosa al hacer clic sobre la tarjeta de creación de exámenes", async () => {
      render(<WelcomeScreen {...baseProps} />);

      const btnCrearExamen = screen.getByRole("button", { name: /Icono examen Crear examen/i });
      await userEvent.click(btnCrearExamen);

      expect(baseProps.onCreateExam).toHaveBeenCalledTimes(1);
    });

    it("dispara onStorage de forma exitosa al hacer clic sobre la tarjeta de consulta de históricos", async () => {
      render(<WelcomeScreen {...baseProps} />);

      const btnConsultar = screen.getByRole("button", { name: /Icono archivo Consultar exámenes anteriores/i });
      await userEvent.click(btnConsultar);

      expect(baseProps.onStorage).toHaveBeenCalledTimes(1);
    });

    it("dispara onStart de forma exitosa al hacer clic sobre el botón flotante informativo de GitHub", async () => {
      render(<WelcomeScreen {...baseProps} />);

      const btnGithub = screen.getByRole("button", { name: "GitHub Info" });
      await userEvent.click(btnGithub);

      expect(baseProps.onStart).toHaveBeenCalledTimes(1);
    });

    it("dispara el callback onBack a través de la propiedad onWelcome delegada al Header", async () => {
      render(<WelcomeScreen {...baseProps} />);

      // El Header recibe `onBack` bajo la prop `onWelcome`
      const btnHeaderWelcome = screen.getByRole("button", { name: "Botón Welcome Header" });
      await userEvent.click(btnHeaderWelcome);

      expect(baseProps.onBack).toHaveBeenCalledTimes(1);
    });
  });

  describe("Casos Límite y Robustez de Estilos", () => {
    it("garantiza que las tarjetas e imágenes conserven inalteradas sus clases CSS de maquetación estructural", () => {
      const { container } = render(<WelcomeScreen {...baseProps} />);

      // Verificar contenedores de CSS flexbox/grid requeridos por las hojas de estilos importadas
      expect(container.querySelector(".cards-container")).toBeInTheDocument();
      expect(container.querySelector(".action-card")).toBeInTheDocument();
      expect(container.querySelector(".btn-floating-github")).toBeInTheDocument();

      // Asegurar que las imágenes conserven la clase de dimensiones estandarizadas
      const imagenes = container.querySelectorAll(".card-icon");
      expect(imagenes).toHaveLength(2);
    });
  });
});