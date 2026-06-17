import React from "react"
import { vi } from "vitest"

const e = React.createElement

// Asegúrate de que estas declaraciones estén dentro de tu archivo centralizado de mocks:

vi.mock("./FoldersGridScreen", () => ({
  FoldersGridScreen: ({ onSelectFolder, onWelcome }: any) =>
    e(
      "div",
      { "data-testid": "screen-folders-grid" },
      e(
        "button",
        { onClick: () => onSelectFolder("ajedrez") },
        "Ir a carpeta Ajedrez"
      ),
      e(
        "button",
        { onClick: () => onSelectFolder("clínica veterinaria") },
        "Ir a carpeta Veterinaria"
      ),
      e("button", { onClick: onWelcome }, "Ir a Bienvenida")
    )
}))

vi.mock("./ExamSelectionScreen", () => ({
  DomainFolderScreen: ({
    onSelectProject,
    onBack,
    onDeleteProject,
    onRenameProject,
    setEditingId,
    setTempName,
    projectsInFolder
  }: any) =>
    e(
      "div",
      { "data-testid": "screen-domain-folder" },
      e("button", { onClick: onBack }, "Volver a Carpetas"),
      projectsInFolder.map((p: any) =>
        e(
          "div",
          { key: p.id, "data-testid": `project-item-${p.id}` },
          e("span", null, p.customName || p.domainName),
          e("button", { onClick: () => onSelectProject(p) }, "Ver Detalle"),
          e(
            "button",
            { onClick: () => onDeleteProject(p.id) },
            "Eliminar Directo"
          ),
          e(
            "button",
            {
              onClick: () => {
                setEditingId(p.id)
                setTempName("Nuevo Nombre")
                onRenameProject(p.id, "Nuevo Nombre")
              }
            },
            "Renombrar"
          )
        )
      )
    )
}))

vi.mock("./ExamDetailScreen", () => ({
  ExamDetailScreen: ({
    onShowGeneratedCode,
    onShowSolutionGeneratedCode,
    onBack,
    onDownload,
    onGitHubDeploy,
    onDeleteProject,
    selectedProject
  }: any) =>
    e(
      "div",
      { "data-testid": "screen-exam-detail" },
      e("button", { onClick: onBack }, "Volver a Selección"),
      e("button", { onClick: onShowGeneratedCode }, "Ver Código Generado"),
      e(
        "button",
        { onClick: onShowSolutionGeneratedCode },
        "Ver Código Solución"
      ),
      e(
        "button",
        { onClick: () => onDownload("fichero-exportacion") },
        "Exportar Markdown"
      ),
      e(
        "button",
        { onClick: () => onGitHubDeploy("mock-token", selectedProject) },
        "Desplegar GitHub"
      ),
      e(
        "button",
        { onClick: () => onDeleteProject(selectedProject.id) },
        "Disparar Borrado Modal"
      )
    )
}))

vi.mock("./GenerationCodeScreen", () => ({
  GeneratedCodeScreen: ({
    onBack,
    onDeleteSection,
    onDeleteTest,
    onUpdateProject,
    selectedProject
  }: any) =>
    e(
      "div",
      { "data-testid": "screen-generated-code" },
      e("button", { onClick: onBack }, "Volver de Código"),
      e(
        "button",
        { onClick: () => onDeleteSection("baseClasses") },
        "Borrar Clases Base"
      ),
      e(
        "button",
        { onClick: () => onDeleteTest("test-1") },
        "Borrar Test Individual"
      ),
      e(
        "button",
        {
          onClick: () =>
            onUpdateProject({
              ...selectedProject,
              baseClasses: "CuerpoModificado"
            })
        },
        "Actualizar Proyecto Async"
      )
    )
}))

vi.mock("./VisualSolutionCodeScreen", () => ({
  VisualSolutionCodeScreen: ({ onBack }: any) =>
    e(
      "div",
      { "data-testid": "screen-visual-solution" },
      e("button", { onClick: onBack }, "Volver de Solución")
    )
}))

vi.mock("~src/components/modals/DeleteConfirmationModal", () => ({
  DeleteConfirmationModal: ({ isOpen, itemName, onConfirm, onCancel }: any) => {
    if (!isOpen) return null
    return e(
      "div",
      { "data-testid": "delete-confirmation-modal" },
      e("p", null, `¿Borrar ${itemName}?`),
      e("button", { onClick: onConfirm }, "Confirmar Operación"),
      e("button", { onClick: onCancel }, "Cancelar Operación")
    )
  }
}))
