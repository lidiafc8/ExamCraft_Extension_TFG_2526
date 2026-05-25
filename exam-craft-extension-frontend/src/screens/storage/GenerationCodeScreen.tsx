import React, { useEffect, useState } from "react"

import "highlight.js/styles/github.css"

import { Header } from "~src/components/Header"
import { JavaCodeBlock } from "~src/components/JavaCodeBlock"
import { DeleteConfirmationModal } from "~src/components/modals/DeleteConfirmationModal"
import { parseJavaFiles } from "~src/utils/codeUtils"

import "./css/StorageScreen.css"
import "./css/GeneratedCodeScreen.css"
import "../../css/CommonText.css"

export interface GeneratedCodeScreenProps {
  selectedProject: any
  selectedDomainFolder: string
  onWelcome: () => void
  onBack: () => void
  onGoToExams: () => void
  onGoToFolders: () => void
  onDeleteSection: (sectionKey: string) => void
  onDeleteTest?: (testKey: string) => void
  onUpdateProject?: (updatedProject: any) => Promise<void>
}

export const GeneratedCodeScreen: React.FC<GeneratedCodeScreenProps> = ({
  selectedProject,
  selectedDomainFolder,
  onWelcome,
  onBack,
  onGoToExams,
  onGoToFolders,
  onDeleteSection,
  onDeleteTest,
  onUpdateProject
}) => {
  const [itemToDelete, setItemToDelete] = useState<{
    type: "section" | "test"
    key: string
    name: string
  } | null>(null)

  const [editingBaseClasses, setEditingBaseClasses] = useState(false)
  const [editingTestKey, setEditingTestKey] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const [baseClassesRaw, setBaseClassesRaw] = useState<string>(
    selectedProject.baseClasses || ""
  )
  const [testCodesMap, setTestCodesMap] = useState<Record<string, string>>(
    () => {
      const map: Record<string, string> = {}
      const tpm: Record<string, { fileName: string; code: string }> =
        selectedProject.testPartsMap || {}
      for (const [key, part] of Object.entries(tpm)) {
        map[key] = part.code || ""
      }
      return map
    }
  )

  useEffect(() => {
    setBaseClassesRaw(selectedProject.baseClasses || "")
    const map: Record<string, string> = {}
    const tpm: Record<string, { fileName: string; code: string }> =
      selectedProject.testPartsMap || {}
    for (const [key, part] of Object.entries(tpm)) {
      map[key] = part.code || ""
    }
    setTestCodesMap(map)
  }, [selectedProject])

  const testPartsMap: Record<string, { fileName: string; code: string }> =
    selectedProject.testPartsMap || {}

  const tests = Object.entries(testPartsMap)
    .map(([key, part]) => ({ mapKey: key, ...part }))
    .filter((part) => part?.fileName && part?.code)
    .sort((a, b) => a.fileName.localeCompare(b.fileName))

  const parsedBaseClasses = parseJavaFiles(selectedProject.baseClasses || "")

  const isBaseClassesDirty =
    baseClassesRaw !== (selectedProject.baseClasses || "")
  const isTestsDirty = Object.entries(testCodesMap).some(
    ([key, code]) => code !== (testPartsMap[key]?.code || "")
  )
  const isDirty = isBaseClassesDirty || isTestsDirty

  const breadcrumbItems = [
    { label: "INICIO", action: onWelcome },
    { label: "EXÁMENES ANTERIORES", action: onGoToFolders },
    { label: (selectedDomainFolder || "").toUpperCase(), action: onGoToExams },
    {
      label:
        selectedProject.customName ||
        `Examen de ${selectedProject.domainName || ""}`,
      action: onBack
    }
  ]

  const confirmDelete = () => {
    if (itemToDelete) {
      if (itemToDelete.type === "section") {
        onDeleteSection(itemToDelete.key)
      } else if (itemToDelete.type === "test") {
        if (onDeleteTest) {
          onDeleteTest(itemToDelete.key)
        } else {
          onDeleteSection(`testPart:${itemToDelete.key}`)
        }
      }
      setItemToDelete(null)
    }
  }

  const handleSave = async () => {
    if (!selectedProject?.id || !onUpdateProject) return
    setIsSaving(true)
    try {
      const updatedTestPartsMap: Record<
        string,
        { fileName: string; code: string }
      > = {}
      for (const [key, part] of Object.entries(testPartsMap)) {
        updatedTestPartsMap[key] = {
          ...part,
          code: testCodesMap[key] ?? part.code
        }
      }
      await onUpdateProject({
        ...selectedProject,
        baseClasses: baseClassesRaw,
        testPartsMap: updatedTestPartsMap,
        updatedAt: new Date().toISOString()
      })
      setEditingBaseClasses(false)
      setEditingTestKey(null)
    } catch (err) {
      alert(err instanceof Error ? err.message : "No se pudo guardar.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="generated-code-screen">
      <Header
        onWelcome={onWelcome}
        breadcrumbItems={breadcrumbItems}
        currentStep="CÓDIGO EXAMEN"
      />
      <div className="main-content">
        <main className="storage-main">
          <div className="storage-section-heading">
            <h2>Clases Base</h2>
            <div className="section-heading-actions">
              {parsedBaseClasses.length > 0 && (
                <button
                  type="button"
                  className={`btn-edit-toggle ${editingBaseClasses ? "btn-edit-toggle--active" : ""}`}
                  onClick={() => setEditingBaseClasses((prev) => !prev)}>
                  {editingBaseClasses ? "✎ Editando" : "🔒 No editable"}
                </button>
              )}
              {parsedBaseClasses.length > 0 && (
                <button
                  type="button"
                  className="storage-delete-btn"
                  onClick={() =>
                    setItemToDelete({
                      type: "section",
                      key: "baseClasses",
                      name: "Clases Base"
                    })
                  }
                  title="Eliminar Clases Base">
                  ✕
                </button>
              )}
            </div>
          </div>

          <div className="storage-section-content">
            <div className="wide-card">
              <div className="card-header">
                <h3>Archivos de Clases Base</h3>
              </div>
              <div className="storage-content-card storage-content-card--grid">
                {parsedBaseClasses.length > 0 ? (
                  editingBaseClasses ? (
                    <textarea
                      className="wide-textarea"
                      value={baseClassesRaw}
                      onChange={(e) => setBaseClassesRaw(e.target.value)}
                    />
                  ) : (
                    parsedBaseClasses.map((block) => (
                      <JavaCodeBlock
                        key={block.path}
                        filename={block.filename}
                        code={block.code}
                      />
                    ))
                  )
                ) : (
                  <p className="storage-empty-state">
                    Aún no se han generado las clases base para este examen.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="storage-section-heading">
            <h2>Tests de Java</h2>
          </div>

          <div className="storage-section-content storage-section-content--tests">
            <div className="wide-card">
              <div className="card-header">
                <h3>Archivos de Test</h3>
              </div>
              <div className="storage-content-card storage-content-card--list">
                {tests.length > 0 ? (
                  tests.map((part) => (
                    <div key={part.mapKey} className="generated-test-item">
                      <div className="generated-test-item-actions">
                        <button
                          type="button"
                          className={`btn-edit-toggle ${editingTestKey === part.mapKey ? "btn-edit-toggle--active" : ""}`}
                          onClick={() =>
                            setEditingTestKey((prev) =>
                              prev === part.mapKey ? null : part.mapKey
                            )
                          }>
                          {editingTestKey === part.mapKey
                            ? "✎ Editando"
                            : "🔒 No editable"}
                        </button>
                        <button
                          type="button"
                          className="storage-delete-btn"
                          onClick={() =>
                            setItemToDelete({
                              type: "test",
                              key: part.mapKey,
                              name: part.fileName
                            })
                          }
                          title={`Eliminar ${part.fileName}`}>
                          ✕
                        </button>
                      </div>
                      {editingTestKey === part.mapKey ? (
                        <textarea
                          className="wide-textarea"
                          value={testCodesMap[part.mapKey] ?? part.code}
                          onChange={(e) =>
                            setTestCodesMap((prev) => ({
                              ...prev,
                              [part.mapKey]: e.target.value
                            }))
                          }
                        />
                      ) : (
                        <JavaCodeBlock
                          filename={part.fileName}
                          code={testCodesMap[part.mapKey] ?? part.code}
                        />
                      )}
                    </div>
                  ))
                ) : (
                  <p className="storage-empty-state">
                    Aún no se han generado los tests para este examen.
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
            isOpen={!!itemToDelete}
            itemName={itemToDelete?.name || ""}
            onConfirm={confirmDelete}
            onCancel={() => setItemToDelete(null)}
          />
        </main>
      </div>
    </div>
  )
}
