import React, { useEffect, useState } from "react"

import "highlight.js/styles/github.css"

import { Header } from "~src/components/Header"
import { JavaCodeBlock } from "~src/components/JavaCodeBlock"
import { DeleteConfirmationModal } from "~src/components/modals/DeleteConfirmationModal"
import { parseJavaFiles } from "~src/utils/codeUtils"

import "./css/StorageScreen.css"
import "./css/GeneratedCodeScreen.css"
import "../../css/CommonText.css"

export interface VisualSolutionCodeScreenProps {
  selectedProject: any
  selectedDomainFolder: string
  onWelcome: () => void
  onBack: () => void
  onGoToExams: () => void
  onGoToFolders: () => void
  onDeleteSection: (sectionKey: string) => void
  onUpdateProject?: (updatedProject: any) => Promise<void>
}

export const VisualSolutionCodeScreen: React.FC<
  VisualSolutionCodeScreenProps
> = ({
  selectedProject,
  selectedDomainFolder,
  onWelcome,
  onBack,
  onGoToExams,
  onGoToFolders,
  onDeleteSection,
  onUpdateProject
}) => {
  const [sectionToDelete, setSectionToDelete] = useState<{
    key: string
    name: string
  } | null>(null)
  const [editingFullSolution, setEditingFullSolution] = useState(false)
  const [fullSolutionRaw, setFullSolutionRaw] = useState<string>(
    selectedProject?.fullSolution || ""
  )
  const [isSaving, setIsSaving] = useState(false)
  const isDirty = fullSolutionRaw !== (selectedProject?.fullSolution || "")

  const handleSave = async () => {
    if (!selectedProject?.id || !onUpdateProject) return
    setIsSaving(true)
    try {
      await onUpdateProject({
        ...selectedProject,
        fullSolution: fullSolutionRaw,
        updatedAt: new Date().toISOString()
      })
      setEditingFullSolution(false)
    } catch (err) {
      alert(err instanceof Error ? err.message : "No se pudo guardar.")
    } finally {
      setIsSaving(false)
    }
  }

  useEffect(() => {
    setFullSolutionRaw(selectedProject?.fullSolution || "")
  }, [selectedProject])

  const parsedFullSolution = parseJavaFiles(fullSolutionRaw)

  const breadcrumbItems = [
    { label: "INICIO", action: onWelcome },
    { label: "EXÁMENES ANTERIORES", action: onGoToFolders },
    { label: (selectedDomainFolder || "").toUpperCase(), action: onGoToExams },
    {
      label:
        selectedProject?.customName ||
        `Examen de ${selectedProject?.domainName || ""}`,
      action: onBack
    }
  ]

  const confirmDelete = () => {
    if (sectionToDelete) {
      onDeleteSection(sectionToDelete.key)
      setSectionToDelete(null)
    }
  }

  return (
    <div className="visual-solution-screen">
      <Header
        onWelcome={onWelcome}
        breadcrumbItems={breadcrumbItems}
        currentStep="CÓDIGO SOLUCIÓN"
      />
      <div className="main-content">
        <main className="storage-main">
          <div className="storage-section-heading">
            <h2>Solución Completa</h2>
            <div className="section-heading-actions">
              {parsedFullSolution.length > 0 && (
                <button
                  type="button"
                  className={`btn-edit-toggle ${editingFullSolution ? "btn-edit-toggle--active" : ""}`}
                  onClick={() => setEditingFullSolution((prev) => !prev)}>
                  {editingFullSolution ? "✎ Editando" : "🔒 No editable"}
                </button>
              )}
              {parsedFullSolution.length > 0 && (
                <button
                  type="button"
                  className="storage-delete-btn"
                  onClick={() =>
                    setSectionToDelete({
                      key: "fullSolution",
                      name: "Solución Completa"
                    })
                  }
                  title="Eliminar Solución Completa">
                  ✕
                </button>
              )}
            </div>
          </div>

          <div className="storage-section-content">
            <div className="wide-card">
              <div className="card-header">
                <h3>Archivos de Solución</h3>
              </div>
              <div className="storage-content-card storage-content-card--grid">
                {parsedFullSolution.length > 0 ? (
                  editingFullSolution ? (
                    <textarea
                      className="wide-textarea"
                      value={fullSolutionRaw}
                      onChange={(e) => setFullSolutionRaw(e.target.value)}
                    />
                  ) : (
                    parsedFullSolution.map((block) => (
                      <JavaCodeBlock
                        key={block.filename}
                        filename={block.filename}
                        code={block.code}
                      />
                    ))
                  )
                ) : (
                  <p className="storage-empty-state">
                    Aún no se ha generado una solución completa para este
                    examen.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="storage-bottom-actions">
            <button type="button" onClick={onBack} className="btn-back">
              Volver
            </button>
            {isDirty && (
              <button
                type="button"
                className="btn-save-changes"
                onClick={handleSave}
                disabled={isSaving}>
                {isSaving ? "Guardando..." : "Guardar cambios"}
              </button>
            )}
          </div>

          <DeleteConfirmationModal
            isOpen={!!sectionToDelete}
            itemName={sectionToDelete?.name || ""}
            onConfirm={confirmDelete}
            onCancel={() => setSectionToDelete(null)}
          />
        </main>
      </div>
    </div>
  )
}
