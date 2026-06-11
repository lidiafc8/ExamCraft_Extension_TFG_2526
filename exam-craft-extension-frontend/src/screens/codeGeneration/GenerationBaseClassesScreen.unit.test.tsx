import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import GenerationBaseClassesScreen from "./GenerationBaseClassesScreen";

vi.mock(
  "bundle-text:../../prompts/generation-exam-repository/exam/generation_exam_base_classes.md",
  () => ({ default: "Genera las clases base para {dominio}. Clases: {clases_existentes}" })
);
vi.mock("../../css/Cards.css", () => ({}));
vi.mock("../storage/css/FoldersGridScreen.css", () => ({}));

const mockDownloadMarkdown = vi.fn();
vi.mock("~src/utils/downloadUtils", () => ({ 
  downloadMarkdown: (...args: any[]) => mockDownloadMarkdown(...args) 
}));

vi.mock("~src/utils/promptParser", () => ({
  parseMasterPrompt: vi.fn((text: string) => ({
    visibleText: text || "Texto parseado base por defecto",
    hiddenContext: "contexto oculto de prueba",
  })),
}));

const mockGenerate = vi.fn();
const mockSetResponseText = vi.fn();

let mockResponseTextValue = "";

vi.mock("~src/components/GeminiGeneration", () => ({
  useGeminiGeneration: vi.fn((config?: any) => {
    if (config?.buildLogPayload) {
      config.buildLogPayload("test-result-log");
    }
    return {
      get responseText() { return mockResponseTextValue; },
      isLoading: false,
      setResponseText: mockSetResponseText,
      generate: mockGenerate,
    };
  }),
}));

vi.mock("~src/components/Header", () => ({
  Header: ({ breadcrumbItems, currentStep, onWelcome }: any) => (
    <header data-testid="mock-header">
      <span>Step: {currentStep}</span>
      <button onClick={onWelcome}>Welcome Link</button>
      {breadcrumbItems && breadcrumbItems.map((item: any, index: number) => (
        <button key={index} onClick={item.action}>{item.label}</button>
      ))}
    </header>
  ),
}));

vi.mock("~src/components/modals/DownloadConfirmModal", () => ({
  DownloadConfirmModal: ({ isOpen, onConfirm, onCancel }: any) =>
    isOpen ? (
      <div data-testid="download-modal">
        <button onClick={() => onConfirm("archivo_test")}>Confirmar descarga</button>
        <button onClick={onCancel}>Cancelar descarga</button>
      </div>
    ) : null,
}));

vi.mock("../../components/modals/ConfirmModal", () => ({
  ConfirmModal: ({ title, message, warning, onConfirm, onCancel }: any) => (
    <div data-testid="confirm-modal">
      <span>{title}</span>
      <span>{message}</span>
      {warning && <span data-testid="confirm-warning">{warning}</span>}
      <button onClick={onConfirm}>Confirmar</button>
      <button onClick={onCancel}>Cancelar</button>
    </div>
  ),
}));

vi.mock("../../components/modals/SaveModal", () => ({
  SaveModal: ({ onSuccess, onClose, buildPayload }: any) => (
    <div data-testid="save-modal">
      <button onClick={() => {
        if (buildPayload) buildPayload();
        if (onSuccess) onSuccess();
        if (onClose) onClose(); 
      }}>Guardar y continuar</button>
      <button onClick={onClose}>Cerrar</button>
    </div>
  ),
}));

vi.mock("~src/components/FolderExamsSelector", () => ({
  FolderExamSelector: ({ onSelectFolder, onSelectProject, onBack, projects, allowedFolders }: any) => (
    <div data-testid="folder-exam-selector">
      <button onClick={onBack}>Volver selector</button>
      {allowedFolders && allowedFolders.map((folder: string) => (
        <button key={folder} onClick={() => onSelectFolder(folder)}>
          Carpeta: {folder}
        </button>
      ))}
      {projects && projects.map((p: any) => (
        <button key={p.id} onClick={() => onSelectProject(p)}>
          {p.baseClasses ? "Proyecto con clases" : `Proyecto: ${p.id}`}
        </button>
      ))}
    </div>
  ),
}));

vi.mock("~src/components/WorkflowComponents", () => ({
  PromptEditor: ({ onGenerate, onBack, promptText, isLoading, onPromptChange }: any) => (
    <div data-testid="prompt-editor">
      <span>Prompt: {promptText}</span>
      <input 
        data-testid="prompt-input" 
        value={promptText || ""} 
        onChange={(e) => onPromptChange(e.target.value)} 
      />
      <button onClick={onGenerate} disabled={isLoading}>Generar</button>
      <button onClick={onBack}>Volver editor</button>
    </div>
  ),
  SplitResultView: ({ onRegenerate, footer, responseText, onPromptChange, onResponseChange }: any) => (
    <div data-testid="split-result-view">
      <input 
        data-testid="split-prompt-input" 
        onChange={(e) => onPromptChange(e.target.value)} 
      />
      <input 
        data-testid="split-response-input" 
        onChange={(e) => onResponseChange(e.target.value)} 
      />
      <span>{responseText}</span>
      <button onClick={onRegenerate}>Regenerar</button>
      {footer}
    </div>
  ),
}));

const mockChromeItems = {
  project_1: { domainName: "clínica veterinaria", customName: "Examen Clínica" },
  project_2: { domainName: "ajedrez" },
};

const baseProps = {
  onBack: vi.fn(),
  onWelcome: vi.fn(),
  onCreateExam: vi.fn(),
  onCreateExamByParts: vi.fn(),
  onCodeGeneration: vi.fn(),
  onGoToTests: vi.fn(),
};

const mockProject = {
  id: "project_1",
  domainName: "clínica veterinaria",
  customName: "Examen Clínica",
  extensionFinish: "enunciado de prueba",
};

beforeEach(() => {
  cleanup();
  vi.clearAllMocks();
  mockResponseTextValue = "";
  
  vi.stubGlobal("chrome", {
    storage: {
      local: {
        get: vi.fn((keys, callback) => {
          if (typeof keys === "function") {
            keys(mockChromeItems);
          } else if (callback) {
            callback(mockChromeItems);
          }
        }),
      },
    },
  });
});

describe("GenerationBaseClassesScreen – Pruebas Unitarias", () => {

  it("renderiza el Header con currentStep 'CLASES BASE'", () => {
    render(<GenerationBaseClassesScreen {...baseProps} />);
    expect(screen.getByTestId("mock-header")).toBeInTheDocument();
    expect(screen.getByText("Step: CLASES BASE")).toBeInTheDocument();
  });

  it("muestra el FolderExamSelector cuando no hay proyecto inicial", () => {
    render(<GenerationBaseClassesScreen {...baseProps} />);
    expect(screen.getByTestId("folder-exam-selector")).toBeInTheDocument();
  });

  it("no muestra el PromptEditor ni el SplitResultView en el estado inicial", () => {
    render(<GenerationBaseClassesScreen {...baseProps} />);
    expect(screen.queryByTestId("prompt-editor")).not.toBeInTheDocument();
    expect(screen.queryByTestId("split-result-view")).not.toBeInTheDocument();
  });

  it("no muestra ningún modal al iniciar", () => {
    render(<GenerationBaseClassesScreen {...baseProps} />);
    expect(screen.queryByTestId("confirm-modal")).not.toBeInTheDocument();
    expect(screen.queryByTestId("save-modal")).not.toBeInTheDocument();
    expect(screen.queryByTestId("download-modal")).not.toBeInTheDocument();
  });

  it("muestra directamente el PromptEditor cuando se pasa initialProject", () => {
    render(<GenerationBaseClassesScreen {...baseProps} initialProject={mockProject} />);
    expect(screen.getByTestId("prompt-editor")).toBeInTheDocument();
    expect(screen.queryByTestId("folder-exam-selector")).not.toBeInTheDocument();
  });

  it("muestra breadcrumb 'CÓDIGO' cuando fromAttributes es false", () => {
    render(<GenerationBaseClassesScreen {...baseProps} initialProject={mockProject} />);
    expect(screen.getByRole("button", { name: "CÓDIGO" })).toBeInTheDocument();
  });

  it("muestra breadcrumb 'ATRIBUTOS' cuando fromAttributes es true", () => {
    render(<GenerationBaseClassesScreen {...baseProps} initialProject={mockProject} fromAttributes />);
    expect(screen.getByRole("button", { name: "ATRIBUTOS" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "CÓDIGO" })).not.toBeInTheDocument();
  });

  it("ejecuta onWelcome al pulsar el breadcrumb INICIO", async () => {
    render(<GenerationBaseClassesScreen {...baseProps} />);
    await userEvent.click(screen.getByRole("button", { name: "INICIO" }));
    expect(baseProps.onWelcome).toHaveBeenCalledTimes(1);
  });

  it("ejecuta onCreateExam al pulsar el breadcrumb CREAR EXAMEN", async () => {
    render(<GenerationBaseClassesScreen {...baseProps} />);
    await userEvent.click(screen.getByRole("button", { name: "CREAR EXAMEN" }));
    expect(baseProps.onCreateExam).toHaveBeenCalledTimes(1);
  });

  it("ejecuta onCreateExamByParts al pulsar el breadcrumb POR PARTES", async () => {
    render(<GenerationBaseClassesScreen {...baseProps} />);
    await userEvent.click(screen.getByRole("button", { name: "POR PARTES" }));
    expect(baseProps.onCreateExamByParts).toHaveBeenCalledTimes(1);
  });

  it("ejecuta onCodeGeneration al pulsar el breadcrumb CÓDIGO", async () => {
    render(<GenerationBaseClassesScreen {...baseProps} initialProject={mockProject} />);
    await userEvent.click(screen.getByRole("button", { name: "CÓDIGO" }));
    expect(baseProps.onCodeGeneration).toHaveBeenCalledTimes(1);
  });

  it("ejecuta onWelcome al pulsar Welcome Link del Header", async () => {
    render(<GenerationBaseClassesScreen {...baseProps} />);
    await userEvent.click(screen.getByRole("button", { name: "Welcome Link" }));
    expect(baseProps.onWelcome).toHaveBeenCalledTimes(1);
  });

  it("muestra el ConfirmModal al seleccionar un proyecto", async () => {
    render(<GenerationBaseClassesScreen {...baseProps} />);
    const botonProyecto = await screen.findByText("Proyecto: project_1");
    await userEvent.click(botonProyecto);
    expect(screen.getByTestId("confirm-modal")).toBeInTheDocument();
  });

  it("muestra el PromptEditor tras confirmar la selección del proyecto", async () => {
    render(<GenerationBaseClassesScreen {...baseProps} />);
    const botonProyecto = await screen.findByText("Proyecto: project_1");
    await userEvent.click(botonProyecto);
    await userEvent.click(screen.getByRole("button", { name: "Confirmar" }));
    expect(screen.getByTestId("prompt-editor")).toBeInTheDocument();
  });

  it("cierra el ConfirmModal y vuelve al selector al cancelar", async () => {
    render(<GenerationBaseClassesScreen {...baseProps} />);
    const botonProyecto = await screen.findByText("Proyecto: project_1");
    await userEvent.click(botonProyecto);
    await userEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(screen.queryByTestId("confirm-modal")).not.toBeInTheDocument();
  });

  it("llama a generate al pulsar el botón Generar en el PromptEditor", async () => {
    mockGenerate.mockResolvedValue("resultado de prueba");
    render(<GenerationBaseClassesScreen {...baseProps} initialProject={mockProject} />);
    await userEvent.click(screen.getByRole("button", { name: "Generar" }));
    expect(mockGenerate).toHaveBeenCalledTimes(1);
  });

  it("muestra el SplitResultView tras una generación exitosa", async () => {
    mockGenerate.mockResolvedValue("resultado de prueba");
    render(<GenerationBaseClassesScreen {...baseProps} initialProject={mockProject} />);
    await userEvent.click(screen.getByRole("button", { name: "Generar" }));
    await waitFor(() => expect(screen.getByTestId("split-result-view")).toBeInTheDocument());
  });

  it("abre el DownloadConfirmModal al pulsar 'Descargar (.md)'", async () => {
    mockGenerate.mockResolvedValue("resultado de prueba");
    render(<GenerationBaseClassesScreen {...baseProps} initialProject={mockProject} />);
    await userEvent.click(screen.getByRole("button", { name: "Generar" }));
    await waitFor(() => screen.getByRole("button", { name: "Descargar (.md)" }));
    await userEvent.click(screen.getByRole("button", { name: "Descargar (.md)" }));
    expect(screen.getByTestId("download-modal")).toBeInTheDocument();
  });

  it("abre el SaveModal al pulsar 'Guardar'", async () => {
    mockGenerate.mockResolvedValue("resultado de prueba");
    render(<GenerationBaseClassesScreen {...baseProps} initialProject={mockProject} />);
    await userEvent.click(screen.getByRole("button", { name: "Generar" }));
    await waitFor(() => screen.getByRole("button", { name: "Guardar" }));
    await userEvent.click(screen.getByRole("button", { name: "Guardar" }));
    expect(screen.getByTestId("save-modal")).toBeInTheDocument();
  });

  it("ejecuta onBack desde el FolderExamSelector al pulsar 'Volver selector'", async () => {
    render(<GenerationBaseClassesScreen {...baseProps} />);
    await userEvent.click(screen.getByRole("button", { name: "Volver selector" }));
    expect(baseProps.onBack).toHaveBeenCalledTimes(1);
  });

  it("líneas 89-91: interactúa con los cambios de prompt dentro del PromptEditor actualizando el estado local de la vista", async () => {
    render(<GenerationBaseClassesScreen {...baseProps} initialProject={mockProject} />);
    const inputPrompt = screen.getByTestId("prompt-input");
    await userEvent.clear(inputPrompt);
    await userEvent.type(inputPrompt, "Nueva especificación de prompt personalizada");
    // CORREGIDO: Sintaxis oficial de testing-library/jest-dom (.toHaveValue)
    expect(inputPrompt).toHaveValue("Nueva especificación de prompt personalizada");
  });

  it("líneas 253-255: procesa la cancelación alternativa dentro de los pasos de selección intermedia de carpeta", async () => {
    render(<GenerationBaseClassesScreen {...baseProps} />);
    const botonProyecto = await screen.findByText("Proyecto: project_1");
    await userEvent.click(botonProyecto);
    
    const botonCancelarModal = screen.getByRole("button", { name: "Cancelar" });
    await userEvent.click(botonCancelarModal);
    
    expect(screen.queryByTestId("confirm-modal")).not.toBeInTheDocument();
    expect(screen.getByTestId("folder-exam-selector")).toBeInTheDocument();
  });

  it("línea 300: muta aserciones concurrentes sobre los inputs del SplitResultView", async () => {
    mockGenerate.mockResolvedValue("resultado_exitoso");
    render(<GenerationBaseClassesScreen {...baseProps} initialProject={mockProject} />);
    
    await userEvent.click(screen.getByRole("button", { name: "Generar" }));
    await waitFor(() => expect(screen.getByTestId("split-result-view")).toBeInTheDocument());

    const inputSplitPrompt = screen.getByTestId("split-prompt-input");
    const inputSplitResponse = screen.getByTestId("split-response-input");

    await userEvent.type(inputSplitPrompt, "Modificación prompt partida");
    await userEvent.type(inputSplitResponse, "Modificación respuesta partida");

    expect(mockSetResponseText).toHaveBeenCalled();
  });

  it("líneas 222-225: evalúa la simulación correcta del SaveModal y llamadas condicionales", async () => {
    mockGenerate.mockResolvedValue("resultado");
    render(<GenerationBaseClassesScreen {...baseProps} initialProject={mockProject} />);

    await userEvent.click(screen.getByRole("button", { name: "Generar" }));
    await waitFor(() => screen.getByRole("button", { name: "Guardar" }));
    await userEvent.click(screen.getByRole("button", { name: "Guardar" }));
    
    // Verificamos que se renderiza el modal antes de desmontarlo simulando la confirmación
    expect(screen.getByTestId("save-modal")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Guardar y continuar" }));
  });

  it("líneas 123-128: ejecuta onGoToTests al guardar con éxito si fromAttributes es verdadero", async () => {
    mockGenerate.mockResolvedValue("resultado_exitoso");
    mockResponseTextValue = "codigo_java_generado";
    
    render(<GenerationBaseClassesScreen {...baseProps} initialProject={mockProject} fromAttributes />);

    await userEvent.click(screen.getByRole("button", { name: "Generar" }));
    await waitFor(() => screen.getByRole("button", { name: "Guardar" }));
    await userEvent.click(screen.getByRole("button", { name: "Guardar" }));
    await userEvent.click(screen.getByRole("button", { name: "Guardar y continuar" }));

    expect(baseProps.onGoToTests).toHaveBeenCalledWith(expect.objectContaining({
      id: "project_1",
      baseClasses: "codigo_java_generado"
    }));
  });
});