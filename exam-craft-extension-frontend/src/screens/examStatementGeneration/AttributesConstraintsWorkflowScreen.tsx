import React, { useState, useEffect } from "react"
import attributesConstraintsPromptMarkdown from "bundle-text:../../prompts/generation-constraints-attributes/generation_attribute_constraints_from_statement.md"
import { parseMasterPrompt } from "~src/utils/promptParser"
import { Header } from "~src/components/Header"
import { ConfirmModal } from "~src/components/modals/ConfirmModal"
import { SuccessModal } from "~src/components/modals/SuccessModal"
import { useGeminiGeneration } from "~src/components/GeminiGeneration"
import { PromptEditor, SplitResultView } from "~src/components/WorkflowComponents"
import { downloadMarkdown } from "~src/utils/downloadUtils"
import { saveToChrome } from "~src/utils/chromeStorageUtils"
import "../../css/Cards.css"
import "../storage/css/FoldersGridScreen.css"
import { WarningModal } from "~src/components/modals/WarningModal"
import { FolderExamSelector } from "~src/components/FolderExamsSelector"
import { DownloadConfirmModal } from "~src/components/modals/DownloadConfirmModal"

declare var chrome: any

interface Project {
  id: string
  domainName: string
  customName?: string
  extensionFinish?: string
  attributeConstraints?: string
  entityRelationships?: string
  baseClasses?: string
  updatedAt?: string
}

interface Props {
  readonly onBack: () => void
  readonly onWelcome: () => void
  readonly onCreateExam: () => void
  readonly onCreateTest: (data: { project: Project; constraints: string; entityRelationships: string; baseClass: string }) => void
  readonly onGoToBaseClass: (project?: Project) => void
  readonly onCreateExamByParts: () => void
}

const ALLOWED_FOLDERS = ["clínica veterinaria", "ajedrez"]
const STORAGE_KEY = "attributeConstraints"
const DOWNLOAD_PREFIX = "Restricciones_Atributos"

const displayName = (proj: Project) =>
  proj.customName || `Examen de ${proj.domainName}`

const warningMessage = (proj: Project): string | null =>
  proj.attributeConstraints
    ? "Este examen ya tiene restricciones de atributos generadas.\nSi continúas, las restricciones anteriores serán reemplazadas por las nuevas."
    : null

export default function AttributesConstraintsWorkflowScreen({
  onBack,
  onWelcome,
  onCreateExam,
  onCreateTest,
  onGoToBaseClass,
  onCreateExamByParts,
}: Props) {
  const [step, setStep] = useState<"selection" | "workflow">("selection")
  const [internalStep, setInternalStep] = useState<"input" | "result">("input")
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedDomainFolder, setSelectedDomainFolder] = useState<string | null>(null)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showDownloadModal, setShowDownloadModal] = useState(false)
  const [savedData, setSavedData] = useState<{ project: Project; result: string } | null>(null)
  const [promptText, setPromptText] = useState("")
  const [hiddenContext, setHiddenContext] = useState("")
  const [pendingProjectForBaseClass, setPendingProjectForBaseClass] = useState<Project | null>(null)

  const { responseText, isLoading, setResponseText, generate } = useGeminiGeneration({
    logExerciseName: "attributes_constraints",
    buildLogPayload: (result) => ({
      domain: selectedProject?.domainName,
      hiddenContext,
      selectedExam: selectedProject?.extensionFinish,
      visiblePrompt: promptText,
      response: result,
    }),
  })

  useEffect(() => {
    if (step === "selection" && globalThis.chrome?.storage?.local) {
      chrome.storage.local.get(null, (items: Record<string, any>) => {
        const list = Object.keys(items)
          .filter((k) => k.startsWith("project_"))
          .map((k) => ({ id: k, ...items[k] } as Project))
        setProjects(list)
      })
    }
  }, [step])

  useEffect(() => {
    if (selectedProject?.domainName) {
      const { visibleText, hiddenContext: hc } = parseMasterPrompt(attributesConstraintsPromptMarkdown)
      setPromptText(visibleText)
      setHiddenContext(hc)
    }
  }, [selectedProject])

  const handleSelectProject = (project: Project) => {
    setSelectedProject(project)
    setShowConfirmModal(true)
  }

  const handleConfirmSelection = () => {
    setShowConfirmModal(false)
    setStep("workflow")
    setInternalStep("input")
  }

  const handleGenerate = async () => {
    const finalPayload = `
      CONTEXTO Y RECURSOS (Información interna):
      [RECURSOS ESTÁTICOS Y EJEMPLOS]: ${hiddenContext}
      [ENUNCIADO Y DIAGRAMA DEL EXAMEN SELECCIONADO]: ${selectedProject?.extensionFinish}
      INSTRUCCIONES PRINCIPALES: ${promptText}
    `
    const result = await generate(finalPayload)
    if (result) setInternalStep("result")
  }

  const handleSaveToChrome = async () => {
    if (!selectedProject?.id) {
      alert("Error: No hay un examen válido seleccionado para actualizar.")
      return
    }
    const updated: Project = {
      ...selectedProject,
      [STORAGE_KEY]: responseText,
      updatedAt: new Date().toISOString(),
    }
    try {
      await saveToChrome(selectedProject.id, updated)
      setSelectedProject(updated)
      setSavedData({ project: updated, result: responseText })
      setShowSuccessModal(true)
    } catch (error) {
      alert(error instanceof Error ? error.message : "No se pudo actualizar el examen.")
    }
  }

  const handleConfirmDownload = (fileName: string) => {
    if (!selectedProject || !responseText) return
    const title = `Restricciones de Atributos - ${displayName(selectedProject)}`
    downloadMarkdown(`# ${title}\n\n${responseText}`, fileName)
    setShowDownloadModal(false)
  }

  const handleSuccessPrimary = () => {
    if (!savedData) return
    setShowSuccessModal(false)
    if (savedData.project.baseClasses) {
      onCreateTest({
        project: savedData.project,
        constraints: savedData.result,
        entityRelationships: savedData.project.entityRelationships || "",
        baseClass: savedData.project.baseClasses,
      })
    } else {
      setPendingProjectForBaseClass(savedData.project)
    }
  }

  const breadcrumbItems = [
    { label: "INICIO", action: onWelcome },
    { label: "CREAR EXAMEN", action: onCreateExam },
    { label: "POR PARTES", action: onCreateExamByParts },
    { label: 'ENUNCIADO', action: onBack },
  ]

  return (
    <>
      {showConfirmModal && selectedProject && (
        <ConfirmModal
          title="Confirmar Contexto"
          message={`¿Deseas utilizar ${displayName(selectedProject)} como base para generar el ejercicio de restricciones?`}
          warning={warningMessage(selectedProject)}
          onConfirm={handleConfirmSelection}
          onCancel={() => { setShowConfirmModal(false); setSelectedProject(null) }}
          confirmLabel={selectedProject.attributeConstraints ? "Continuar y reemplazar" : "Confirmar"}
        />
      )}

      {showSuccessModal && savedData && (
        <SuccessModal
          title="¡Guardado correctamente!"
          message={`Las restricciones de atributos de ${displayName(savedData.project)} han sido actualizadas correctamente.\n\n¿Deseas continuar y generar los tests para estas restricciones ahora mismo?`}
          actions={[
            {
              label: "No",
              onClick: () => { setShowSuccessModal(false); onWelcome() },
              variant: "secondary",
            },
            {
              label: "Sí",
              onClick: handleSuccessPrimary,
              variant: "primary",
            },
          ]}
        />
      )}

      <div className="exam-app">
        <Header
          onWelcome={onWelcome}
          breadcrumbItems={breadcrumbItems}
          currentStep="RESTRICCIONES DE ATRIBUTOS"
        />

        <main className="main-content">

          {step === "selection" && (
            <FolderExamSelector
              projects={projects}
              allowedFolders={ALLOWED_FOLDERS}
              selectedFolder={selectedDomainFolder}
              onSelectFolder={setSelectedDomainFolder}
              onSelectProject={handleSelectProject}
              onBack={onBack}
              displayName={displayName}
            />
          )}

          {step === "workflow" && selectedProject && (
            <div className="wf-layout-container">
              <div className="wf-wide-wrapper">
                {internalStep === "input" && (
                  <PromptEditor
                    title="Restricciones de Atributos"
                    description={
                      <>
                        Este es el prompt que se usará para generar las restricciones de atributos del examen
                        seleccionado, puede revisar o modificar cualquier información que vea conveniente.
                        Al terminar, pulse en <strong>"Generar"</strong>.
                      </>
                    }
                    promptText={promptText}
                    isLoading={isLoading}
                    onPromptChange={setPromptText}
                    onGenerate={handleGenerate}
                    onBack={onBack}
                  />
                )}

                {internalStep === "result" && (
                  <SplitResultView
                    promptText={promptText}
                    isLoading={isLoading}
                    responseText={responseText}
                    leftTitle="Prompt enviado"
                    rightTitle={`Generar Restricciones: ${displayName(selectedProject)}`}
                    onPromptChange={setPromptText}
                    onRegenerate={handleGenerate}
                    onResponseChange={setResponseText}
                    footer={
                      <div className="wf-actions-row">
                        <button
                          onClick={handleGenerate}
                          className="btn-step generate"
                          disabled={isLoading}
                        >
                          {isLoading ? <div className="loading-spinner" /> : "Volver a generar"}
                        </button>
                        <button
                          onClick={() => setShowDownloadModal(true)}
                          className="btn-step btn-download"
                        >
                          Descargar (.md)
                        </button>
                        <button onClick={handleSaveToChrome} className="btn-step primary">Guardar</button>
                      </div>
                    }
                  />
                )}
              </div>
            </div>
          )}

        </main>
      </div>

      <DownloadConfirmModal
        isOpen={showDownloadModal}
        defaultFileName={`${DOWNLOAD_PREFIX}_${displayName(selectedProject || {} as Project).replace(/\s+/g, "_")}`}
        onConfirm={handleConfirmDownload}
        onCancel={() => setShowDownloadModal(false)}
      />

      {pendingProjectForBaseClass && (
        <WarningModal
          title="Faltan las Clases Base"
          message={<>Para poder generar los tests de restricciones, primero es necesario generar las <strong>Clases Base</strong> del examen.</>}
          confirmLabel="Ir a crear Clases Base"
          onConfirm={() => {
            const p = pendingProjectForBaseClass
            setPendingProjectForBaseClass(null)
            onGoToBaseClass(p)
          }}
          onCancel={() => { setPendingProjectForBaseClass(null); onWelcome() }}
        />
      )}
    </>
  )
}