import React, { useState, useEffect } from "react"
import entityRelationshipsPromptMarkdown from "bundle-text:../../prompts/generation-entity-relationships/generation_relationships_between_entities_from_statement.md"
import { parseMasterPrompt } from "~src/utils/promptParser"
import { useGeminiGeneration } from "~src/components/GeminiGeneration"
import { Header } from "~src/components/Header"
import { PromptEditor, SplitResultView } from "~src/components/WorkflowComponents"
import { FolderExamSelector } from "~src/components/FolderExamsSelector"
import { ConfirmModal } from "../../components/modals/ConfirmModal"
import { SuccessModal } from "../../components/modals/SuccessModal"
import { WarningModal } from "../../components/modals/WarningModal"
import { downloadMarkdown } from "~src/utils/downloadUtils"
import { saveToChrome } from "~src/utils/chromeStorageUtils"
import "../../css/Cards.css"

declare var chrome: any

interface Project {
  id: string
  domainName: string
  customName?: string
  extensionFinish?: string
  entityRelationships?: string
  attributeConstraints?: string
  baseClasses?: string
  updatedAt?: string
}

interface Props {
  readonly onBack: () => void
  readonly onWelcome: () => void
  readonly onCreateExam: () => void
  readonly onCreateTest: (data: { project: any; constraints: string; entityRelationships: string; baseClass: string; targetPart?: string }) => void
  readonly onGoToBaseClass: (project?: any) => void
}

const ALLOWED_FOLDERS = ["clínica veterinaria", "ajedrez"]
const STORAGE_KEY = "entityRelationships"
const DOWNLOAD_PREFIX = "Relaciones_Entidades"

const projectDisplayName = (proj: any) =>
  proj?.customName || `Examen de ${proj?.domainName}`

export default function EntityRelationshipsWorkflowScreen({
  onBack,
  onWelcome,
  onCreateExam,
  onCreateTest,
  onGoToBaseClass,
}: Props) {
  const [step, setStep] = useState<"selection" | "workflow">("selection")
  const [internalStep, setInternalStep] = useState<"input" | "result">("input")

  const [projects, setProjects] = useState<Project[]>([])
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [savedData, setSavedData] = useState<{ project: any; result: string } | null>(null)
  const [pendingProjectForBaseClass, setPendingProjectForBaseClass] = useState<any>(null)

  const [promptText, setPromptText] = useState("")
  const [hiddenContext, setHiddenContext] = useState("")

  const { responseText, isLoading, setResponseText, generate } = useGeminiGeneration({
    logExerciseName: "entity_relationships",
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
      const { visibleText, hiddenContext: hc } = parseMasterPrompt(entityRelationshipsPromptMarkdown)
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

      [RECURSOS ESTÁTICOS Y EJEMPLOS]:
      ${hiddenContext}

      [ENUNCIADO Y DIAGRAMA DEL EXAMEN SELECCIONADO]:
      ${selectedProject?.extensionFinish}

      INSTRUCCIONES PRINCIPALES:
      ${promptText}
    `
    const result = await generate(finalPayload)
    if (result) setInternalStep("result")
  }

  const handleSave = async () => {
    if (!selectedProject?.id) {
      alert("Error: No hay un examen válido seleccionado para actualizar.")
      return
    }
    const updatedProject = {
      ...selectedProject,
      [STORAGE_KEY]: responseText,
      updatedAt: new Date().toISOString(),
    }
    try {
      await saveToChrome(selectedProject.id, updatedProject)
      setSelectedProject(updatedProject)
      const data = { project: updatedProject, result: responseText }
      setSavedData(data)
      setShowSuccessModal(true)
    } catch (error) {
      alert(error instanceof Error ? error.message : "No se pudo guardar.")
    }
  }

  const handleDownload = () => {
    if (!selectedProject || !responseText) return
    downloadMarkdown(
      `# Relaciones entre Entidades - ${selectedProject.customName || selectedProject.domainName}\n\n${responseText}`,
      `${DOWNLOAD_PREFIX}_${selectedProject.customName}`
    )
  }

  const handlePrimarySuccess = () => {
    if (!savedData) return
    setShowSuccessModal(false)
    if (savedData.project.baseClasses) {
      onCreateTest({
        project: savedData.project,
        constraints: savedData.project.attributeConstraints || "",
        entityRelationships: savedData.result,
        baseClass: savedData.project.baseClasses,
        targetPart: "test2_relationships",
      })
    } else {
      setPendingProjectForBaseClass(savedData.project)
    }
  }

  const confirmWarning = selectedProject?.entityRelationships
    ? "Este examen ya tiene relaciones entre entidades generadas.\nSi continúas, las relaciones anteriores serán reemplazadas por las nuevas."
    : null

  return (
    <div className="exam-app">

      {/* Modal: confirmar selección */}
      {showConfirmModal && selectedProject && (
        <ConfirmModal
          title="Confirmar Contexto"
          message={`¿Deseas utilizar ${projectDisplayName(selectedProject)} como base para generar el ejercicio de relaciones entre entidades?`}
          warning={confirmWarning ?? undefined}
          onConfirm={handleConfirmSelection}
          onCancel={() => { setShowConfirmModal(false); setSelectedProject(null) }}
          confirmLabel={selectedProject.entityRelationships ? "Continuar y reemplazar" : "Confirmar"}
        />
      )}

      {/* Modal: guardado con éxito */}
      {showSuccessModal && savedData && (
        <SuccessModal
          title="¡Guardado correctamente!"
          message={`Las relaciones entre entidades de ${projectDisplayName(savedData.project)} han sido actualizadas correctamente.\n\n¿Deseas continuar y generar los tests para estas relaciones ahora mismo?`}
          actions={[
            { label: "No", onClick: () => { setShowSuccessModal(false); onWelcome() }, variant: "secondary" },
            { label: "Sí", onClick: handlePrimarySuccess, variant: "primary" },
          ]}
        />
      )}

      {/* Modal: faltan clases base */}
      {pendingProjectForBaseClass && (
        <WarningModal
          title="Faltan las Clases Base"
          message={<>Para poder generar los tests de relaciones, primero es necesario generar las <strong>Clases Base</strong> del examen.</>}
          confirmLabel="Ir a crear Clases Base"
          cancelLabel="Cancelar"
          onConfirm={() => {
            const project = pendingProjectForBaseClass
            setPendingProjectForBaseClass(null)
            onGoToBaseClass(project)
          }}
          onCancel={() => setPendingProjectForBaseClass(null)}
        />
      )}

      <Header
        onWelcome={onWelcome}
        breadcrumbItems={[
          { label: "INICIO", action: onWelcome },
          { label: "CREAR EXAMEN", action: onCreateExam },
          { label: "POR PARTES", action: onBack },
        ]}
        currentStep="RELACIONES ENTRE ENTIDADES"
      />

      <main className="main-content">

        {step === "selection" && (
        <FolderExamSelector
          projects={projects}
          allowedFolders={ALLOWED_FOLDERS}
          selectedFolder={selectedFolder}
          onSelectFolder={(folder) => setSelectedFolder(folder)}
          onSelectProject={handleSelectProject}
          onBack={onBack}
          displayName={projectDisplayName}
          filterProject={(p) => !!p.baseClasses}
          emptyFoldersMessage="No hay exámenes con clases base generadas. Genera primero las clases base."
          emptyProjectsMessage="Ningún examen de esta carpeta tiene clases base generadas todavía."
        />
      )}

        {step === "workflow" && selectedProject && (
          <div className="wf-layout-container">
            <div className="wf-wide-wrapper">
              {internalStep === "input" && (
                <PromptEditor
                  title="Relaciones entre Entidades"
                  description={
                    <>
                      Este es el prompt que se usará para generar las relaciones entre entidades del examen
                      seleccionado, puede revisar o modificar cualquier información que vea conveniente.
                      Al terminar, pulse en <strong>"Generar"</strong>.
                    </>
                  }
                  promptText={promptText}
                  isLoading={isLoading}
                  onPromptChange={setPromptText}
                  onGenerate={handleGenerate}
                  onBack={() => setStep("selection")}
                />
              )}

              {internalStep === "result" && (
                <SplitResultView
                  promptText={promptText}
                  isLoading={isLoading}
                  responseText={responseText}
                  rightTitle={`Generar Relaciones: ${projectDisplayName(selectedProject)}`}
                  onPromptChange={setPromptText}
                  onRegenerate={handleGenerate}
                  onResponseChange={setResponseText}
                  footer={
                    <div className="wf-actions-row">
                      <button onClick={handleDownload} className="btn-step btn-download">Descargar (.md)</button>
                      <button onClick={handleSave} className="btn-step primary">Guardar</button>
                    </div>
                  }
                />
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}