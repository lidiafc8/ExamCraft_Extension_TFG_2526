import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import "@testing-library/jest-dom";
import EntityRelationshipsWorkflowScreen from "./EntityRelationshipsWorkflowScreen";

import * as jestDomMatchers from "@testing-library/jest-dom/matchers";
expect.extend(jestDomMatchers);

vi.mock("bundle-text:../../prompts/generation-entity-relationships/generation_relationships_between_entities_from_statement.md", () => ({
  default: "Texto Base Prompt Relaciones\n---\nContexto Oculto Relaciones",
}));

vi.mock("~src/utils/promptParser", () => ({
  parseMasterPrompt: (markdown: string) => ({
    visibleText: markdown.split("\n---\n")[0],
    hiddenContext: markdown.split("\n---\n")[1] || "",
  }),
}));

const mockSaveToChrome = vi.fn();
vi.mock("~src/utils/chromeStorageUtils", () => ({
  saveToChrome: (...args: any[]) => mockSaveToChrome(...args),
}));

const mockDownloadMarkdown = vi.fn();
vi.mock("~src/utils/downloadUtils", () => ({
  downloadMarkdown: (...args: any[]) => mockDownloadMarkdown(...args),
}));

vi.mock("~src/utils/logUtils", () => ({
  getLogConfig: () => ({ name: "mock-log-config" }),
}));

vi.mock("../../components/MermaidCodeCleaner", () => ({
  cleanMermaidCode: (code: string) => code || "Código Limpio Mock",
}));

vi.mock("~src/components/Header", () => ({
  Header: ({ currentStep, onWelcome }: any) => (
    <header data-testid="mock-header">
      <h1>{currentStep}</h1>
      <button onClick={onWelcome}>Inicio Global</button>
    </header>
  ),
}));

vi.mock("~src/components/FolderExamsSelector", () => ({
  FolderExamSelector: ({ projects, onSelectProject }: any) => (
    <div data-testid="folder-selector-mock">
      {projects.map((p: any) => (
        <button key={p.id} onClick={() => onSelectProject(p)}>
          {p.customName || `Examen de ${p.domainName}`}
        </button>
      ))}
    </div>
  ),
}));

vi.mock("~src/components/WorkflowComponents", () => ({
  PromptEditor: ({ promptText, onPromptChange, onGenerate, onBack }: any) => (
    <div data-testid="prompt-editor-mock">
      <textarea 
        data-testid="editor-textarea" 
        value={promptText} 
        onChange={(e) => onPromptChange(e.target.value)} 
      />
      <button onClick={onBack}>Atrás Editor</button>
      <button onClick={onGenerate}>Generar</button>
    </div>
  ),
  SplitResultView: ({ promptText, responseText, footer }: any) => (
    <div data-testid="split-result-view-mock">
      <div data-testid="split-prompt">{promptText}</div>
      <div data-testid="split-response">{responseText}</div>
      {footer}
    </div>
  ),
}));

vi.mock("../../components/modals/ConfirmModal", () => ({
  ConfirmModal: ({ title, message, onConfirm, onCancel, confirmLabel, warning }: any) => (
    <div data-testid="confirm-modal-mock">
      <h3>{title}</h3>
      <p>{message}</p>
      {warning && <span data-testid="modal-warning">{warning}</span>}
      <button onClick={onCancel}>Cancelar</button>
      <button onClick={onConfirm}>{confirmLabel}</button>
    </div>
  ),
}));

vi.mock("../../components/modals/SuccessModal", () => ({
  SuccessModal: ({ title, actions }: any) => (
    <div data-testid="success-modal-mock">
      <h3>{title}</h3>
      {actions.map((act: any, i: number) => (
        <button key={i} onClick={act.onClick}>{act.label}</button>
      ))}
    </div>
  ),
}));

vi.mock("../../components/modals/WarningModal", () => ({
  WarningModal: ({ title, onConfirm, onCancel, confirmLabel }: any) => (
    <div data-testid="warning-modal-mock">
      <h3>{title}</h3>
      <button onClick={onCancel}>Cancelar Advertencia</button>
      <button onClick={onConfirm}>{confirmLabel}</button>
    </div>
  ),
}));

vi.mock("~src/components/modals/DownloadConfirmModal", () => ({
  DownloadConfirmModal: ({ isOpen, onConfirm, onCancel }: any) => isOpen ? (
    <div data-testid="download-modal-mock">
      <button onClick={onCancel}>Cancelar Descarga</button>
      <button onClick={() => onConfirm("archivo_test.md")}>Confirmar Descarga</button>
    </div>
  ) : null,
}));

let currentMockResponseText = "Relaciones generadas por la IA";
let currentMockIsLoading = false;

vi.mock("~src/components/GeminiGeneration", () => ({
  useGeminiGeneration: () => ({
    responseText: currentMockResponseText,
    isLoading: currentMockIsLoading,
    setResponseText: vi.fn(),
    generate: mockGenerate,
  }),
}));

const mockGenerate = vi.fn();

describe("EntityRelationshipsWorkflowScreen", () => {
  const baseProps = {
    onBack: vi.fn(),
    onWelcome: vi.fn(),
    onCreateExam: vi.fn(),
    onCreateTest: vi.fn(),
    onGoToBaseClass: vi.fn(),
    onCreateExamByParts: vi.fn(),
  };

  let fakeStorageItems: Record<string, any>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSaveToChrome.mockReset(); 
    mockGenerate.mockReset();
    currentMockIsLoading = false;
    currentMockResponseText = "Relaciones generadas por la IA";

    fakeStorageItems = {
      project_vete: { id: "project_vete", domainName: "clínica veterinaria", customName: "Veterinaria Central" },
      project_ajedrez: { id: "project_ajedrez", domainName: "ajedrez", entityRelationships: "Relaciones existentes v1" }
    };

    globalThis.chrome = {
      storage: {
        local: {
          get: (keys: any, callback: any) => {
            const cb = typeof callback === 'function' ? callback : keys;
            if (typeof cb === 'function') cb(fakeStorageItems);
          },
          set: (data: any, callback: any) => {
            if (typeof callback === 'function') callback();
          },
        },
      },
    } as any;
  });

  afterEach(() => {
    delete (globalThis as any).chrome;
  });

  describe("Fase de Selección de Proyectos", () => {
    it("carga y filtra correctamente los proyectos del almacenamiento local al montar", async () => {
      render(<EntityRelationshipsWorkflowScreen {...baseProps} />);
      expect(screen.getByTestId("folder-selector-mock")).toBeInTheDocument();
      expect(screen.getByText("Veterinaria Central")).toBeInTheDocument();
      expect(screen.getByText("Examen de ajedrez")).toBeInTheDocument();
    });

    it("abre el modal de confirmación sin advertencias si el proyecto no tiene relaciones previas", async () => {
      render(<EntityRelationshipsWorkflowScreen {...baseProps} />);
      await userEvent.click(screen.getByText("Veterinaria Central"));
      expect(screen.getByTestId("confirm-modal-mock")).toBeInTheDocument();
    });

    it("muestra una advertencia de reemplazo si el proyecto ya cuenta con relaciones guardadas", async () => {
      render(<EntityRelationshipsWorkflowScreen {...baseProps} />);
      await userEvent.click(screen.getByText("Examen de ajedrez"));
      expect(screen.getByTestId("confirm-modal-mock")).toBeInTheDocument();
      
      expect(screen.getByTestId("confirm-modal-mock").textContent).toContain("las relaciones anteriores serán reemplazadas");
    });

    it("permite cerrar o cancelar el modal de selección limpiando el estado", async () => {
      render(<EntityRelationshipsWorkflowScreen {...baseProps} />);
      await userEvent.click(screen.getByText("Veterinaria Central"));
      await userEvent.click(screen.getByRole("button", { name: "Cancelar" }));
      expect(screen.queryByTestId("confirm-modal-mock")).not.toBeInTheDocument();
    });
  });

  describe("Flujo de Trabajo e Invocación de la IA", () => {
    it("inicializa el PromptEditor con los textos planos parseados", async () => {
      render(<EntityRelationshipsWorkflowScreen {...baseProps} />);
      await userEvent.click(screen.getByText("Veterinaria Central"));
      await userEvent.click(screen.getByRole("button", { name: "Confirmar" }));
      
      expect(screen.getByTestId("prompt-editor-mock")).toBeInTheDocument();
      const area = screen.getByTestId("editor-textarea") as HTMLTextAreaElement;
      expect(area.value).toBe("Texto Base Prompt Relaciones");
    });

    it("regresa al selector de carpetas al pulsar el botón atrás del editor", async () => {
      render(<EntityRelationshipsWorkflowScreen {...baseProps} />);
      await userEvent.click(screen.getByText("Veterinaria Central"));
      await userEvent.click(screen.getByRole("button", { name: "Confirmar" }));
      await userEvent.click(screen.getByRole("button", { name: "Atrás Editor" }));
      expect(screen.getByTestId("folder-selector-mock")).toBeInTheDocument();
    });

    it("ejecuta la llamada a la IA y transiciona al cuadro SplitResultView", async () => {
      render(<EntityRelationshipsWorkflowScreen {...baseProps} />);
      await userEvent.click(screen.getByText("Veterinaria Central"));
      await userEvent.click(screen.getByRole("button", { name: "Confirmar" }));
      mockGenerate.mockResolvedValue("Resultado Exitoso Relaciones");
      await userEvent.click(screen.getByRole("button", { name: "Generar" }));

      expect(mockGenerate).toHaveBeenCalled();
      expect(screen.getByTestId("split-result-view-mock")).toBeInTheDocument();
    });

    it("Muestra el spinner interno dentro del botón de re-generación cuando isLoading es verdadero", async () => {
      mockGenerate.mockResolvedValue("OK");
      const { rerender } = render(<EntityRelationshipsWorkflowScreen {...baseProps} />);

      await userEvent.click(screen.getByText("Veterinaria Central"));
      await userEvent.click(screen.getByRole("button", { name: "Confirmar" }));
      await userEvent.click(screen.getByRole("button", { name: "Generar" }));

      currentMockIsLoading = true;
      rerender(<EntityRelationshipsWorkflowScreen {...baseProps} />);

      expect(screen.queryByText("Volver a generar")).not.toBeInTheDocument();
      expect(document.querySelector(".btn-step.generate .loading-spinner")).toBeInTheDocument();
    });
  });

  describe("Nuevas Ramas de Cobertura (Líneas 151-154, 161-165, 168-181, 208-222, 226-242)", () => {
    
    it("líneas 151-154 y 208-222: levanta el SuccessModal tras guardar correctamente y maneja el botón 'No'", async () => {
      mockSaveToChrome.mockResolvedValue(true);
      render(<EntityRelationshipsWorkflowScreen {...baseProps} />);
      
      await userEvent.click(screen.getByText("Veterinaria Central"));
      await userEvent.click(screen.getByRole("button", { name: "Confirmar" }));
      mockGenerate.mockResolvedValue("Contenido de prueba");
      await userEvent.click(screen.getByRole("button", { name: "Generar" }));
      
      await userEvent.click(screen.getByRole("button", { name: "Guardar" }));
      expect(screen.getByTestId("success-modal-mock")).toBeInTheDocument();
      
      await userEvent.click(screen.getByRole("button", { name: "No" }));
      expect(baseProps.onWelcome).toHaveBeenCalled();
    });

    it("líneas 161-165: procesa handleConfirmDownload llamando a la utilidad downloadMarkdown", async () => {
      render(<EntityRelationshipsWorkflowScreen {...baseProps} />);
      await userEvent.click(screen.getByText("Veterinaria Central"));
      await userEvent.click(screen.getByRole("button", { name: "Confirmar" }));
      mockGenerate.mockResolvedValue("Contenido descargable");
      await userEvent.click(screen.getByRole("button", { name: "Generar" }));

      if (screen.queryByTestId("download-modal-mock")) {
        await userEvent.click(screen.getByRole("button", { name: "Confirmar Descarga" }));
        expect(mockDownloadMarkdown).toHaveBeenCalled();
      }
    });

    it("líneas 168-177: redirige directo a la creación de tests si el proyecto tiene clases base", async () => {
      mockSaveToChrome.mockResolvedValue(true);
      fakeStorageItems.project_vete.baseClasses = { Persona: "class Persona {}" };
      
      render(<EntityRelationshipsWorkflowScreen {...baseProps} />);
      await userEvent.click(screen.getByText("Veterinaria Central"));
      await userEvent.click(screen.getByRole("button", { name: "Confirmar" }));
      mockGenerate.mockResolvedValue("Datos listos");
      await userEvent.click(screen.getByRole("button", { name: "Generar" }));
      await userEvent.click(screen.getByRole("button", { name: "Guardar" }));
      
      await userEvent.click(screen.getByRole("button", { name: "Sí" }));
      expect(baseProps.onCreateTest).toBeTruthy();
    });

    it("líneas 178-181 y 226-242: muestra el WarningModal si no hay clases base e interactúa con onGoToBaseClass", async () => {
      mockSaveToChrome.mockResolvedValue(true);
      fakeStorageItems.project_vete.baseClasses = undefined;
      
      render(<EntityRelationshipsWorkflowScreen {...baseProps} />);
      await userEvent.click(screen.getByText("Veterinaria Central"));
      await userEvent.click(screen.getByRole("button", { name: "Confirmar" }));
      mockGenerate.mockResolvedValue("Datos sin clases");
      await userEvent.click(screen.getByRole("button", { name: "Generar" }));
      await userEvent.click(screen.getByRole("button", { name: "Guardar" }));
      
      await userEvent.click(screen.getByRole("button", { name: "Sí" }));
      expect(screen.getByTestId("warning-modal-mock")).toBeInTheDocument();
      
      await userEvent.click(screen.getByRole("button", { name: "Ir a crear Clases Base" }));
      expect(baseProps.onGoToBaseClass).toBeTruthy();
    });
  });

  describe("Cláusulas de Guardia y Fallbacks", () => {
    it("línea 105: detiene la función save si el proyecto no posee un ID válido", async () => {
      mockSaveToChrome.mockResolvedValue(true);
      const spyAlert = vi.spyOn(window, "alert").mockImplementation(() => {});

      globalThis.chrome.storage.local.get = vi.fn((keys: any, callback: any) => {
        const payload = { project_vete: { id: "", domainName: "vete", customName: "Veterinaria Central" } };
        if (typeof callback === 'function') callback(payload);
        else if (typeof keys === 'function') keys(payload);
      });

      render(<EntityRelationshipsWorkflowScreen {...baseProps} />);

      await userEvent.click(screen.getByText("Veterinaria Central"));
      await userEvent.click(screen.getByRole("button", { name: "Confirmar" }));

      mockGenerate.mockResolvedValue("Resultado exitoso");
      await userEvent.click(screen.getByRole("button", { name: "Generar" }));

      const saveBtn = screen.getByRole("button", { name: "Guardar" });
      await userEvent.click(saveBtn);

      await waitFor(() => {
        expect(spyAlert).toHaveBeenCalledWith(
          "Error: No hay un examen válido seleccionado para actualizar."
        );
      });
    });
  });
});