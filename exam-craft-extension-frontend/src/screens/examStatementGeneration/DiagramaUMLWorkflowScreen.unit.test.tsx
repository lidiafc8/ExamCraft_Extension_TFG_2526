import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach } from "vitest";
import "@testing-library/jest-dom";
import DiagramUMLWorkflowScreen from "./DiagramaUMLWorkflowScreen";

// === EXTENDER MATCHERS PARA JEST-DOM ===
import * as jestDomMatchers from "@testing-library/jest-dom/matchers";
expect.extend(jestDomMatchers);

// --- CONTROLADOR DINÁMICO PARA EL LIMPIADOR MERMAID ---
const mockCleanerControl = {
  forcedValue: undefined as string | undefined,
};

// --- MOCK DE DEPENDENCIAS ESTÁTICAS ---
vi.mock("bundle-text:../../prompts/functional-extension-generation/generation_UML_diagram_functional_extension.md", () => ({
  default: "Texto base del Prompt UML para {{DOMAIN}}\n---\nContexto Secreto UML",
}));

vi.mock("../../utils/promptParser", () => ({
  parseMasterPrompt: (markdown: string) => ({
    visibleText: markdown.split("\n---\n")[0],
    hiddenContext: markdown.split("\n---\n")[1] || "",
  }),
}));

// Mock seguro de MermaidCodeCleaner sin requerir 'require'
vi.mock("../../components/MermaidCodeCleaner", () => ({
  cleanMermaidCode: (code: string) => {
    if (mockCleanerControl.forcedValue !== undefined) {
      return mockCleanerControl.forcedValue;
    }
    return `classDiagram\n  class ${code}Cleaned`;
  }
}));

// --- MOCKS DE COMPONENTES AUXILIARES ---
vi.mock("~src/components/Header", () => ({
  Header: ({ currentStep, onWelcome, breadcrumbItems }: any) => (
    <header data-testid="mock-header">
      <h1>{currentStep}</h1>
      <button onClick={onWelcome}>Inicio Global</button>
      <div data-testid="breadcrumbs">
        {breadcrumbItems?.map((item: any, idx: number) => (
          <button key={idx} onClick={item.action}>
            {item.label}
          </button>
        ))}
      </div>
    </header>
  ),
}));

vi.mock("../../components/MermaidViewer", () => ({
  MermaidViewer: ({ chartCode }: { chartCode: string }) => (
    <div data-testid="mermaid-viewer-mock">{chartCode}</div>
  ),
}));

vi.mock("../../components/WorkflowComponents", () => ({
  StepperHeader: ({ currentStep }: any) => (
    <div data-testid="mock-stepper">Paso: {currentStep}</div>
  ),
  PromptEditor: ({ title, promptText, onPromptChange, onGenerate, onBack, isLoading }: any) => (
    <div data-testid="prompt-editor-mock">
      <h2>{title}</h2>
      {isLoading && <div className="loading-spinner" />}
      <textarea 
        data-testid="editor-textarea" 
        value={promptText} 
        onChange={(e) => onPromptChange(e.target.value)} 
      />
      <button onClick={onBack}>Volver</button>
      <button onClick={onGenerate}>Generar Diagrama UML</button>
    </div>
  ),
}));

// --- SCENARIO MANAGEMENT PARA LA IA ---
const geminiMockControl = {
  responseText: "classDiagram\n  class Init",
  isLoading: false,
};

const mockGenerate = vi.fn();
const mockSetResponseText = vi.fn();

vi.mock("../../components/GeminiGeneration", () => ({
  useGeminiGeneration: (config: any) => {
    if (config?.buildLogPayload) {
      config.buildLogPayload("Prueba de Payload UML");
    }
    return {
      responseText: geminiMockControl.responseText,
      isLoading: geminiMockControl.isLoading,
      setResponseText: mockSetResponseText,
      generate: mockGenerate,
    };
  },
}));

// --- CONFIGURACIÓN DE PROPS BASE ---
describe("DiagramUMLWorkflowScreen", () => {
  const baseProps = {
    domainName: "Veterinaria",
    context: "El sistema debe permitir gestionar citas médicas de mascotas.",
    onBack: vi.fn(),
    onWelcome: vi.fn(),
    onCreateExam: vi.fn(),
    onCreateExamByParts: vi.fn(),
    onFunctionalExtension: vi.fn(),
    onStatementStep1: vi.fn(),
    onFinishExtension: vi.fn(),
    onComponents: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    geminiMockControl.isLoading = false;
    geminiMockControl.responseText = "classDiagram\n  class Init";
    mockCleanerControl.forcedValue = undefined; // Reseteamos el limpiador
  });

  describe("Renderizado e Inicialización Básica", () => {
    it("inicializa correctamente el componente y parsea el prompt reemplazando la plantilla", () => {
      render(<DiagramUMLWorkflowScreen {...baseProps} />);

      expect(screen.getByTestId("mock-header")).toBeInTheDocument();
      expect(screen.getByText("DIAGRAMA UML")).toBeInTheDocument();
      
      const textarea = screen.getByTestId("editor-textarea") as HTMLTextAreaElement;
      expect(textarea.value).toContain("Texto base del Prompt UML para Veterinaria");
    });

    it("ejecuta los flujos de navegación desde los elementos del Breadcrumb", async () => {
      render(<DiagramUMLWorkflowScreen {...baseProps} />);

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

      await userEvent.click(screen.getByRole("button", { name: "VETERINARIA" }));
      expect(baseProps.onStatementStep1).toHaveBeenCalled();
    });

    it("invoca la acción onBack al pulsar el botón Volver del Editor", async () => {
      render(<DiagramUMLWorkflowScreen {...baseProps} />);
      await userEvent.click(screen.getByRole("button", { name: "Volver" }));
      expect(baseProps.onBack).toHaveBeenCalled();
    });
  });

  describe("Flujo de Generación de Diagramas e Interfaz de Resultados", () => {
    it("genera el diagrama UML, limpia el código y cambia al panel split de resultados de 3 columnas", async () => {
      mockGenerate.mockResolvedValue("RawMermaidCode");
      render(<DiagramUMLWorkflowScreen {...baseProps} />);

      const textarea = screen.getByTestId("editor-textarea");
      await userEvent.clear(textarea);
      await userEvent.type(textarea, "Prompt Modificado por Usuario");

      await userEvent.click(screen.getByRole("button", { name: "Generar Diagrama UML" }));

      expect(mockGenerate).toHaveBeenCalled();
      expect(mockSetResponseText).toHaveBeenCalledWith("classDiagram\n  class RawMermaidCodeCleaned");

      expect(screen.getByText("Prompt de Generación del Diagrama UML")).toBeInTheDocument();
      expect(screen.getByText("Extensión Funcional con Diagrama UML")).toBeInTheDocument();
      expect(screen.getByText("Código Mermaid")).toBeInTheDocument();
      expect(screen.getByTestId("mermaid-viewer-mock")).toBeInTheDocument();
    });

    it("permite confirmar la especificación final del diagrama UML enviando los datos limpios", async () => {
      mockGenerate.mockResolvedValue("RawMermaidCode");
      render(<DiagramUMLWorkflowScreen {...baseProps} />);

      await userEvent.click(screen.getByRole("button", { name: "Generar Diagrama UML" }));

      const confirmBtn = screen.getByRole("button", { name: "Confirmar Diagrama UML" });
      await userEvent.click(confirmBtn);

      expect(baseProps.onFinishExtension).toHaveBeenCalledWith(
        baseProps.context.trim(),
        "classDiagram\n  class Init"
      );
    });

    it("permite re-encadenar peticiones a la IA mediante el botón Volver a generar", async () => {
      mockGenerate.mockResolvedValue("Code2");
      render(<DiagramUMLWorkflowScreen {...baseProps} />);

      await userEvent.click(screen.getByRole("button", { name: "Generar Diagrama UML" }));
      
      const regenerarBtn = screen.getByRole("button", { name: "Volver a generar" });
      await userEvent.click(regenerarBtn);

      expect(mockGenerate).toHaveBeenCalledTimes(2);
    });
  });

  describe("Cobertura de Líneas y Ramas Condicionales (Spinners y Cláusulas)", () => {
    it("cláusula de guardia de inicialización: interrumpe el efecto si domainName no está presente", () => {
      render(<DiagramUMLWorkflowScreen {...baseProps} domainName="" />);
      const textarea = screen.queryByTestId("editor-textarea") as HTMLTextAreaElement;
      expect(textarea.value).toBe("");
    });

    it("renderiza el spinner de carga en el workflow inicial mientras la IA genera", async () => {
      let resolverPromesa: (value: any) => void = () => {};
      mockGenerate.mockImplementation(() => {
        geminiMockControl.isLoading = true;
        return new Promise((resolve) => { resolverPromesa = resolve; });
      });

      const { rerender } = render(<DiagramUMLWorkflowScreen {...baseProps} />);
      await userEvent.click(screen.getByRole("button", { name: "Generar Diagrama UML" }));
      
      rerender(<DiagramUMLWorkflowScreen {...baseProps} />);
      expect(document.querySelector(".loading-spinner")).toBeInTheDocument();

      geminiMockControl.isLoading = false;
      resolverPromesa("OK");
    });

    it("Muestra el spinner interno dentro del botón de re-generación cuando isLoading es verdadero", async () => {
      mockGenerate.mockResolvedValue("OK");
      const { rerender } = render(<DiagramUMLWorkflowScreen {...baseProps} />);

      await userEvent.click(screen.getByRole("button", { name: "Generar Diagrama UML" }));

      geminiMockControl.isLoading = true;
      rerender(<DiagramUMLWorkflowScreen {...baseProps} />);

      expect(screen.queryByText("Volver a generar")).not.toBeInTheDocument();
      expect(document.querySelector(".btn-step.generate .loading-spinner")).toBeInTheDocument();
    });

    // === SOLUCIÓN AL ERROR DE MODULE_NOT_FOUND (LÍNEA 246) ===
    it("Muestra el texto 'Renderizando...' en el área del diagrama si cleanCode se encuentra vacío", async () => {
      // 1. Hacemos que la IA responda algo válido para cambiar de pantalla exitosamente
      mockGenerate.mockResolvedValue("CodigoCrudoDeLaIA"); 
      
      // 2. Forzamos que el limpiador intercepte ese código y devuelva vacío ""
      mockCleanerControl.forcedValue = "";

      render(<DiagramUMLWorkflowScreen {...baseProps} />);
      
      // 3. Gatillamos la generación para movernos a la vista de resultados
      await userEvent.click(screen.getByRole("button", { name: "Generar Diagrama UML" }));

      // 4. Ahora sí, el componente estará en modo "result" y el else pintará el texto esperado
      expect(screen.getByText("Renderizando...")).toBeInTheDocument();
    });
  });
});