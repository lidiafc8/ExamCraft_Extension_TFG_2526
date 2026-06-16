import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach } from "vitest";
import "@testing-library/jest-dom";
import FinishFunctionalExtensionScreen from "./FinishFunctionalExtensionScreen";

import * as jestDomMatchers from "@testing-library/jest-dom/matchers";
expect.extend(jestDomMatchers);

vi.mock("~src/components/Header", () => ({
  Header: ({ currentStep, onWelcome, breadcrumbItems }: any) => (
    <header data-testid="mock-header">
      <h1>{currentStep}</h1>
      <button onClick={onWelcome}>Inicio Global</button>
      <div data-testid="breadcrumbs">
        {breadcrumbItems?.map((b: any, i: number) => (
          <button key={i} onClick={b.action}>{b.label}</button>
        ))}
      </div>
    </header>
  ),
}));

vi.mock("../../components/WorkflowComponents", () => ({
  StepperHeader: ({ steps, currentStep }: any) => (
    <div data-testid="stepper-header-mock">
      <span>Paso Actual: {currentStep}</span>
      <span>Total Pasos: {steps.length}</span>
    </div>
  ),
}));

vi.mock("../../components/MermaidViewer", () => ({
  MermaidViewer: ({ chartCode }: any) => (
    <div data-testid="mermaid-viewer-mock">
      <pre>{chartCode}</pre>
    </div>
  ),
}));

const mockDownloadMarkdown = vi.fn();
vi.mock("~src/utils/downloadUtils", () => ({
  downloadMarkdown: (...args: any[]) => mockDownloadMarkdown(...args),
}));

vi.mock("~src/components/modals/DownloadConfirmModal", () => ({
  DownloadConfirmModal: ({ isOpen, defaultFileName, onConfirm, onCancel }: any) => isOpen ? (
    <div data-testid="download-modal-mock">
      <span data-testid="default-filename">{defaultFileName}</span>
      <button onClick={onCancel}>Cancelar Descarga</button>
      <button onClick={() => onConfirm("archivo_personalizado.md")}>Confirmar Descarga</button>
    </div>
  ) : null,
}));

vi.mock("../../components/modals/SaveModal", () => ({
  SaveModal: ({ domainName, onSuccess, onClose, buildPayload }: any) => (
    <div data-testid="save-modal-mock">
      <h2>Guardar {domainName}</h2>
      <button onClick={onClose}>Cerrar Guardado</button>
      <button onClick={() => {
        const payload = buildPayload("Mi Examen Custom");
        if (payload && typeof payload === "object") {
          onSuccess();
        }
      }}>
        Confirmar Guardado
      </button>
    </div>
  ),
}));

describe("FinishFunctionalExtensionScreen", () => {
  const baseProps = {
    domainName: "sistema bancario",
    extensionStatement: "El usuario podrá realizar transferencias interbancarias.",
    extensionMermaid: "classDiagram\nclass Banco {\n+transferir()\n}",
    onBack: vi.fn(),
    onWelcome: vi.fn(),
    onCreateExam: vi.fn(),
    onCreateExamByParts: vi.fn(),
    onFunctionalExtension: vi.fn(),
    onStatementStep1: vi.fn(),
    onComponents: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Renderizado Inicial y Casos Positivos", () => {
    it("renderiza correctamente los textos estructurales, breadcrumbs y el visor Mermaid", () => {
      render(<FinishFunctionalExtensionScreen {...baseProps} />);

      expect(screen.getByTestId("mock-header")).toBeInTheDocument();
      expect(screen.getByText("SISTEMA BANCARIO: Resultado Final")).toBeInTheDocument();
      
      const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
      expect(textarea.value).toBe(baseProps.extensionStatement);
      
      expect(screen.getByTestId("mermaid-viewer-mock")).toBeInTheDocument();
      expect(screen.getByText(/class Banco/i)).toBeInTheDocument();
    });

    it("ejecuta de manera exitosa todas las acciones de navegación de los Breadcrumbs", async () => {
      render(<FinishFunctionalExtensionScreen {...baseProps} />);
      
      await userEvent.click(screen.getByRole("button", { name: "INICIO" }));
      expect(baseProps.onWelcome).toHaveBeenCalled();

      await userEvent.click(screen.getByRole("button", { name: "CREAR EXAMEN" }));
      expect(baseProps.onCreateExam).toHaveBeenCalled();

      await userEvent.click(screen.getByRole("button", { name: "POR PARTES" }));
      expect(baseProps.onCreateExamByParts).toHaveBeenCalled();

      await userEvent.click(screen.getByRole("button", { name: "ENUNCIADO" }));
      expect(baseProps.onComponents).toHaveBeenCalled();

      await userEvent.click(screen.getByRole("button", { name: "EXTENSIÓN FUNCIONAL" }));
      expect(baseProps.onFunctionalExtension).toHaveBeenCalled();

      await userEvent.click(screen.getByRole("button", { name: "SISTEMA BANCARIO" }));
      expect(baseProps.onStatementStep1).toHaveBeenCalled();
    });

    it("vuelve a la pantalla anterior al presionar el botón 'Volver a UML'", async () => {
      render(<FinishFunctionalExtensionScreen {...baseProps} />);
      
      await userEvent.click(screen.getByRole("button", { name: "Volver a UML" }));
      expect(baseProps.onBack).toHaveBeenCalled();
    });
  });

  describe("Casos Negativos y Comportamiento de Fallbacks", () => {
    it("muestra un mensaje alternativo si el código Mermaid está vacío o no se generó", () => {
      render(
        <FinishFunctionalExtensionScreen 
          {...baseProps} 
          extensionMermaid="" 
        />
      );

      expect(screen.queryByTestId("mermaid-viewer-mock")).not.toBeInTheDocument();
      expect(screen.getByText("No se pudo extraer el diagrama del texto.")).toBeInTheDocument();
    });

    it("gestiona la descarga con un fallback de texto si el enunciado no está definido", async () => {
      render(
        <FinishFunctionalExtensionScreen 
          {...baseProps} 
          extensionStatement="" 
        />
      );

      await userEvent.click(screen.getByRole("button", { name: "Descargar (.md)" }));
      
      await userEvent.click(screen.getByRole("button", { name: "Confirmar Descarga" }));

      expect(mockDownloadMarkdown).toHaveBeenCalledWith(
        expect.stringContaining("No hay texto de enunciado."),
        "archivo_personalizado.md"
      );
    });

    it("gestiona la descarga con una indicación explícita si falta el código Mermaid", async () => {
      render(
        <FinishFunctionalExtensionScreen 
          {...baseProps} 
          extensionMermaid="" 
        />
      );

      await userEvent.click(screen.getByRole("button", { name: "Descargar (.md)" }));
      await userEvent.click(screen.getByRole("button", { name: "Confirmar Descarga" }));

      expect(mockDownloadMarkdown).toHaveBeenCalledWith(
        expect.stringContaining("*No se generó código Mermaid*"),
        "archivo_personalizado.md"
      );
    });

    it("línea 148: ejecuta buildPayload con éxito procesando el fallback vacío cuando extensionMermaid no existe", async () => {
      render(
        <FinishFunctionalExtensionScreen 
          {...baseProps} 
          extensionMermaid="" 
        />
      );

      await userEvent.click(screen.getByRole("button", { name: "Guardar" }));
      expect(screen.getByTestId("save-modal-mock")).toBeInTheDocument();

      await userEvent.click(screen.getByRole("button", { name: "Confirmar Guardado" }));

      expect(baseProps.onWelcome).toHaveBeenCalled();
    });
  });

  describe("Valores Límite y Reglas de Formateo", () => {
    it("reemplaza los espacios múltiples del domainName por guiones bajos en el nombre de archivo sugerido", async () => {
      render(
        <FinishFunctionalExtensionScreen 
          {...baseProps} 
          domainName="  mi   nombre   con   espacios  " 
        />
      );

      await userEvent.click(screen.getByRole("button", { name: "Descargar (.md)" }));
      
      const suggestedName = screen.getByTestId("default-filename").textContent;
      expect(suggestedName).toBe("Extension_Funcional__mi_nombre_con_espacios_");
    });
  });

  describe("Flujo de Modales y Verificación de Datos de Persistencia (Payload)", () => {
    it("abre, cierra y confirma de forma asíncrona la descarga cerrando el modal al finalizar", async () => {
      render(<FinishFunctionalExtensionScreen {...baseProps} />);
      
      expect(screen.queryByTestId("download-modal-mock")).not.toBeInTheDocument();

      await userEvent.click(screen.getByRole("button", { name: "Descargar (.md)" }));
      expect(screen.getByTestId("download-modal-mock")).toBeInTheDocument();

      await userEvent.click(screen.getByRole("button", { name: "Cancelar Descarga" }));
      expect(screen.queryByTestId("download-modal-mock")).not.toBeInTheDocument();

      await userEvent.click(screen.getByRole("button", { name: "Descargar (.md)" }));
      await userEvent.click(screen.getByRole("button", { name: "Confirmar Descarga" }));
      
      expect(mockDownloadMarkdown).toHaveBeenCalled();
      expect(screen.queryByTestId("download-modal-mock")).not.toBeInTheDocument();
    });

    it("abre el modal de guardado, cancela el flujo y ejecuta buildPayload correctamente", async () => {
      render(<FinishFunctionalExtensionScreen {...baseProps} />);

      expect(screen.queryByTestId("save-modal-mock")).not.toBeInTheDocument();

      await userEvent.click(screen.getByRole("button", { name: "Guardar" }));
      expect(screen.getByTestId("save-modal-mock")).toBeInTheDocument();

      await userEvent.click(screen.getByRole("button", { name: "Cerrar Guardado" }));
      expect(screen.queryByTestId("save-modal-mock")).not.toBeInTheDocument();

      await userEvent.click(screen.getByRole("button", { name: "Guardar" }));
      
      await userEvent.click(screen.getByRole("button", { name: "Confirmar Guardado" }));
      
      expect(baseProps.onWelcome).toHaveBeenCalled();
    });
  });
});