import generationCodeSolutionPrompt from "bundle-text:../../prompts/generation-exam-repository/solution/generation_code_solution.md"
import React, { useEffect, useState } from "react"

import { FolderExamSelector } from "~src/components/FolderExamsSelector"
import { useGeminiGeneration } from "~src/components/GeminiGeneration"
import { Header } from "~src/components/Header"
import { ConfirmModal } from "~src/components/modals/ConfirmModal"
import { DownloadConfirmModal } from "~src/components/modals/DownloadConfirmModal"
import { SuccessModal } from "~src/components/modals/SuccessModal"
import {
  PromptEditor,
  SplitResultView
} from "~src/components/WorkflowComponents"
import { getAllFromChrome, saveToChrome } from "~src/utils/chromeStorageUtils"
import { downloadMarkdown } from "~src/utils/downloadUtils"
import { parseMasterPrompt } from "~src/utils/promptParser"

import "./css/GenerationSolution.css"

const ALLOWED_FOLDERS = ["clínica veterinaria", "ajedrez"]
const STORAGE_KEY = "fullSolution"
const DOWNLOAD_PREFIX = "Solucion_Completa"

interface Props {
  readonly onBack: () => void
  readonly onWelcome: () => void
  readonly onCreateExam: () => void
  readonly onCreateExamByParts: () => void
  readonly onCodeGeneration: () => void
}

function filterProject(project: any): boolean {
  const hasBaseClasses = !!project.baseClasses?.trim()
  const hasCompleteConstraints =
    !!project.attributeConstraints?.trim() &&
    !!project.testPartsMap?.test1_attributes?.code?.trim()
  const hasCompleteRelationships =
    !!project.entityRelationships?.trim() &&
    !!project.testPartsMap?.test2_relationships?.code?.trim()
  return hasBaseClasses && (hasCompleteConstraints || hasCompleteRelationships)
}

function buildPrompt(project: any): {
  visibleText: string
  hiddenContext: string
} {
  const { visibleText, hiddenContext } = parseMasterPrompt(
    generationCodeSolutionPrompt
  )
  return {
    visibleText: visibleText
      .replaceAll(
        "{enunciado_restricciones}",
        project.attributeConstraints || "No hay restricciones de atributos."
      )
      .replaceAll(
        "{enunciado_relaciones}",
        project.entityRelationships || "No hay relaciones entre entidades."
      )
      .replaceAll(
        "{codigo_tests_restricciones}",
        project.testPartsMap?.test1_attributes?.code ||
          "No se detectaron tests de atributos."
      )
      .replaceAll(
        "{codigo_tests_relaciones}",
        project.testPartsMap?.test2_relationships?.code ||
          "No se detectaron tests de relaciones."
      )
      .replaceAll("{codigo_base_localstorage}", project.baseClasses || ""),
    hiddenContext
  }
}

const displayName = (proj: any) =>
  proj?.customName || `Examen de ${proj?.domainName}`

function InstructionContent({ project }: { project: any }) {
  return (
    <div className="container">
      <p>
        Este es el prompt que se usará para generar el{" "}
        <strong>Código Solución Completo</strong> del examen seleccionado. La IA
        tomará las clases base iniciales y aplicará las soluciones para todas
        las partes detectadas. Al terminar, pulsa en <strong>"Generar"</strong>.
      </p>
      <div className="info-box">
        <p className="info-box-title">Partes detectadas en este proyecto:</p>
        <ul className="info-box-list">
          {project?.attributeConstraints && (
            <li>Enunciado de Restricciones de Atributos</li>
          )}
          {project?.entityRelationships && (
            <li>Enunciado de Relaciones entre Entidades</li>
          )}
        </ul>
      </div>
    </div>
  )
}

export default function GenerationSolutionCodeScreen({
  onBack,
  onWelcome,
  onCreateExam,
  onCreateExamByParts,
  onCodeGeneration
}: Props) {
  const [step, setStep] = useState<"selection" | "workflow">("selection")
  const [internalStep, setInternalStep] = useState<"input" | "result">("input")
  const [projects, setProjects] = useState<any[]>([])
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  const [selectedProject, setSelectedProject] = useState<any>(null)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showDownloadModal, setShowDownloadModal] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [promptText, setPromptText] = useState("")
  const [hiddenContext, setHiddenContext] = useState("")

  const { responseText, isLoading, setResponseText, generate } =
    useGeminiGeneration({
      logExerciseName: "full_solution_generation",
      buildLogPayload: (result) => ({
        dominio: selectedProject?.domainName,
        contextoOculto: hiddenContext,
        examenSeleccionado: selectedProject?.extensionFinish,
        promptVisible: promptText,
        respuesta: result
      })
    })

  const breadcrumbItems = [
    { label: "INICIO", action: onWelcome },
    { label: "CREAR EXAMEN", action: onCreateExam },
    { label: "POR PARTES", action: onCreateExamByParts },
    { label: "CÓDIGO", action: onCodeGeneration }
  ]

  useEffect(() => {
    getAllFromChrome()
      .then((items) =>
        setProjects(items.filter((i) => i._key?.startsWith("project_")))
      )
      .catch(() => setProjects([]))
  }, [])

  useEffect(() => {
    if (selectedProject?.domainName) {
      const { visibleText, hiddenContext: hc } = buildPrompt(selectedProject)
      setPromptText(visibleText)
      setHiddenContext(hc)
    }
  }, [selectedProject])

  const handleConfirmSelection = () => {
    setShowConfirmModal(false)
    setStep("workflow")
    setInternalStep("input")
  }

  const handleCancel = () => {
    setShowConfirmModal(false)
    setSelectedProject(null)
  }

  const handleGenerate = async () => {
    const finalPayload = `
CONTEXTO Y RECURSOS (Información interna):
[RECURSOS ESTÁTICOS Y EJEMPLOS]: ${hiddenContext}
[ENUNCIADO Y DIAGRAMA DEL EXAMEN SELECCIONADO]: ${selectedProject?.extensionFinish}
INSTRUCCIONES PRINCIPALES: ${promptText}
    `.trim()

    const result = await generate(finalPayload)
    if (result) setInternalStep("result")
  }

  const handleSave = async () => {
    if (!selectedProject?.id) return
    try {
      await saveToChrome(selectedProject.id, {
        ...selectedProject,
        [STORAGE_KEY]: responseText,
        updatedAt: new Date().toISOString()
      })
      setShowSuccessModal(true)
    } catch (err: any) {
      setSaveError(err.message ?? "No se pudo guardar.")
    }
  }

  const handleConfirmDownload = (fileName: string) => {
    if (!selectedProject || !responseText) return
    downloadMarkdown(
      `# Solución Completa - ${displayName(selectedProject)}\n\n${responseText}`,
      fileName
    )
    setShowDownloadModal(false)
  }

  return (
    <div className="exam-app">
      <Header
        onWelcome={onWelcome}
        breadcrumbItems={breadcrumbItems}
        currentStep="SOLUCIÓN"
      />

      <main className="main-content">
        {step === "selection" && (
          <FolderExamSelector
            projects={projects.filter(filterProject)}
            allowedFolders={ALLOWED_FOLDERS}
            selectedFolder={selectedFolder}
            onSelectFolder={(folder) => setSelectedFolder(folder || null)}
            onSelectProject={(proj) => {
              setSelectedProject(proj)
              setShowConfirmModal(true)
            }}
            onBack={onBack}
            displayName={displayName}
            emptyFoldersMessage="No hay exámenes con clases base y partes generadas. Genera primero las clases base y al menos una parte del examen."
            emptyProjectsMessage="Ningún examen de esta carpeta tiene clases base y partes generadas todavía."
          />
        )}

        {step === "workflow" && selectedProject && (
          <div className="wf-layout-container">
            <div className="wf-wide-wrapper">
              {internalStep === "input" && (
                <PromptEditor
                  title="Generación de Código Solución"
                  description={<InstructionContent project={selectedProject} />}
                  promptText={promptText}
                  isLoading={isLoading}
                  generateLabel="Generar"
                  onPromptChange={setPromptText}
                  onGenerate={handleGenerate}
                  onBack={() => setStep("selection")}
                />
              )}

              {internalStep === "result" && (
                <>
                  <h2 className="result-title">
                    Generar Solución Completa: {displayName(selectedProject)}
                  </h2>
                  <SplitResultView
                    promptText={promptText}
                    isLoading={isLoading}
                    responseText={responseText}
                    leftTitle="Prompt enviado"
                    rightTitle="Propuesta del modelo"
                    onPromptChange={setPromptText}
                    onRegenerate={handleGenerate}
                    onResponseChange={setResponseText}
                    footer={
                      <div className="wf-actions-row">
                        <button
                          onClick={handleGenerate}
                          className="btn-step generate"
                          disabled={isLoading}>
                          {isLoading ? (
                            <div className="loading-spinner" />
                          ) : (
                            "Volver a generar"
                          )}
                        </button>
                        <button
                          onClick={() => setShowDownloadModal(true)}
                          className="btn-step btn-download">
                          Descargar (.md)
                        </button>
                        <button
                          onClick={handleSave}
                          className="btn-step primary">
                          Guardar
                        </button>
                      </div>
                    }
                  />
                </>
              )}
            </div>
          </div>
        )}
      </main>

      <DownloadConfirmModal
        isOpen={showDownloadModal}
        defaultFileName={`${DOWNLOAD_PREFIX}_${displayName(selectedProject || {}).replace(/\s+/g, "_")}`}
        onConfirm={handleConfirmDownload}
        onCancel={() => setShowDownloadModal(false)}
      />

      {showConfirmModal && selectedProject && (
        <ConfirmModal
          title="Confirmar Generación"
          message={`¿Deseas generar el código solución para el examen ${displayName(selectedProject)}?`}
          warning={
            selectedProject[STORAGE_KEY]
              ? "Este examen ya tiene un código solución. Si continúas, se reemplazará por la nueva versión."
              : undefined
          }
          onConfirm={handleConfirmSelection}
          onCancel={handleCancel}
        />
      )}

      {showSuccessModal && (
        <SuccessModal
          title="¡Solución generada correctamente!"
          message={`El código solución para ${displayName(selectedProject)} ha sido guardado exitosamente.`}
          actions={[
            {
              label: "Volver al inicio",
              onClick: onWelcome,
              variant: "primary"
            }
          ]}
        />
      )}

      {saveError && (
        <ConfirmModal
          title="Error al guardar"
          message={saveError}
          confirmLabel="Reintentar"
          cancelLabel="Volver al inicio"
          onConfirm={() => {
            setSaveError(null)
            handleSave()
          }}
          onCancel={onWelcome}
        />
      )}
    </div>
  )
}
