import React, { useState, useEffect } from "react"
import carpeta from "../../../assets/images/archive.png"
import examen from "../../../assets/images/exam.png"
import generationExamBaseClassesPrompt from "bundle-text:../../prompts/generation-exam-repository/exam/generation_exam_base_classes.md"
import { parseMasterPrompt } from "~src/utils/promptParser"
import { PromptEditor, SplitResultView } from "~src/components/WorkflowComponents"
import { useGeminiGeneration } from "~src/components/GeminiGeneration"
import { Header } from "~src/components/Header"
import { ConfirmModal } from "../../components/modals/ConfirmModal"
import { SuccessModal } from "../../components/modals/SuccessModal"
import { downloadMarkdown } from "~src/utils/downloadUtils"
import { saveToChrome } from "~src/utils/chromeStorageUtils"
import "../../css/Cards.css"
import "../storage/css/FoldersGridScreen.css"
import { FolderExamSelector } from "~src/components/FolderExamsSelector"

declare var chrome: any

interface Project {
  id: string
  domainName: string
  customName?: string
  extensionFinish?: string
  baseClasses?: string
  updatedAt?: string
}

interface Props {
  readonly initialProject?: Project
  readonly fromAttributes?: boolean
  readonly onGoToTests?: (projectData: Project) => void
  readonly onBack: () => void
  readonly onWelcome: () => void
  readonly onCreateExam: () => void
  readonly onCreateExamByParts: () => void
  readonly onCodeGeneration: () => void
}

const CLASES_POR_DEFECTO: Record<string, string> = {
  "clínica veterinaria": `
- BaseEntity\n- NamedEntity\n- Person\n- Owner\n- Vet\n- Pet\n- PetType
- Specialty\n- Visit\n- Clinic\n- PricingPlan\n- ClinicOwner\n- User\n- Authorities`,
  "ajedrez": `
- BaseEntity\n- NamedEntity\n- Authorities\n- User\n- ChessMatch\n- ChessBoard\n- Piece`,
}

const ALLOWED_FOLDERS = ["clínica veterinaria", "ajedrez"]
const STORAGE_KEY = "baseClasses"
const DOWNLOAD_PREFIX = "Clases_Base"

const displayName = (proj: Project) =>
  proj.customName || `Examen de ${proj.domainName}`

const warningMessage = (proj: Project): string | null =>
  proj[STORAGE_KEY]
    ? "Este examen ya tiene clases base generadas. Si continúas, se sobreescribirán al guardar."
    : null

function buildPrompt(project: Project): { visibleText: string; hiddenContext: string } {
  try {
    const { visibleText, hiddenContext } = parseMasterPrompt(generationExamBaseClassesPrompt)
    const dominio = (project.domainName || project.customName || "").trim()
    const clases = CLASES_POR_DEFECTO[dominio.toLowerCase()] || "No hay clases base registradas para este dominio."
    const base = visibleText?.trim().length > 0
      ? visibleText
      : "Genera las clases base en Java para el dominio {dominio}. Clases a incluir: {clases_existentes}"
    return {
      visibleText: base.replaceAll("{dominio}", dominio || "el examen").replaceAll("{clases_existentes}", clases),
      hiddenContext: hiddenContext || "",
    }
  } catch (error) {
    console.error("Error en buildPrompt:", error)
    return { visibleText: "Error al preparar el prompt.", hiddenContext: "" }
  }
}

export default function GenerationBaseClassesScreen({
  initialProject,
  fromAttributes,
  onGoToTests,
  onBack,
  onWelcome,
  onCreateExam,
  onCreateExamByParts,
  onCodeGeneration,
}: Props) {
  const [selectionStep, setSelectionStep] = useState<"folders" | "exams" | "workflow">("folders")
  const [internalStep, setInternalStep] = useState<"input" | "result">("input")
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  const [selectedProject, setSelectedProject] = useState<Project | null>(initialProject ?? null)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [savedData, setSavedData] = useState<{ project: Project; result: string } | null>(null)
  const [promptText, setPromptText] = useState("")
  const [hiddenContext, setHiddenContext] = useState("")

  const { responseText, isLoading, setResponseText, generate } = useGeminiGeneration({
    logExerciseName: "base_classes_code_generation",
    buildLogPayload: (result) => ({
      domain: selectedProject?.domainName,
      hiddenContext,
      selectedExam: selectedProject?.extensionFinish,
      visiblePrompt: promptText,
      response: result,
    }),
  })

  const visibleFolders = ALLOWED_FOLDERS.filter((f) =>
    projects.some((p) => p.domainName?.toLowerCase() === f.toLowerCase())
  )

  const projectsInFolder = projects.filter(
    (p) => p.domainName && selectedFolder && p.domainName.toLowerCase() === selectedFolder.toLowerCase()
  )

  const breadcrumbItems = fromAttributes
    ? [
        { label: "INICIO", action: onWelcome },
        { label: "CREAR EXAMEN", action: onCreateExam },
        { label: "POR PARTES", action: onCreateExamByParts },
        { label: "ATRIBUTOS", action: onBack },
      ]
    : [
        { label: "INICIO", action: onWelcome },
        { label: "CREAR EXAMEN", action: onCreateExam },
        { label: "POR PARTES", action: onCreateExamByParts },
        { label: "CÓDIGO", action: onCodeGeneration },
      ]

  useEffect(() => {
    if (globalThis.chrome?.storage?.local) {
      chrome.storage.local.get(null, (items: Record<string, any>) => {
        const list = Object.keys(items)
          .filter((k) => k.startsWith("project_"))
          .map((k) => ({ id: k, ...items[k] } as Project))
        setProjects(list)
      })
    }
  }, [])

  useEffect(() => {
    if (selectedProject?.domainName) {
      const { visibleText, hiddenContext: hc } = buildPrompt(selectedProject)
      setPromptText(visibleText)
      setHiddenContext(hc)
    }
  }, [selectedProject])

  const handleSelectFolder = (folderName: string) => {
    setSelectedFolder(folderName)
    setSelectionStep("exams")
  }

  const handleSelectProject = (project: Project) => {
    setSelectedProject(project)
    setShowConfirmModal(true)
  }

  const handleConfirmSelection = () => {
    setShowConfirmModal(false)
    setSelectionStep("workflow")
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

  const handleDownload = () => {
    if (!selectedProject || !responseText) return
    const title = `Clases Base - ${selectedProject.customName || selectedProject.domainName}`
    downloadMarkdown(`# ${title}\n\n${responseText}`, `${DOWNLOAD_PREFIX}_${selectedProject.customName}`)
  }

  const handleSuccessPrimary = () => {
    if (!savedData) return
    setShowSuccessModal(false)
    const final = { ...savedData.project, id: savedData.project.id || initialProject?.id }
    if (fromAttributes && onGoToTests) onGoToTests(final as Project)
    else onCodeGeneration()
  }

  return (
    <div>
      {showConfirmModal && selectedProject && (
        <ConfirmModal
          title="Confirmar Examen"
          message={`¿Deseas utilizar ${displayName(selectedProject)} como base para generar las clases base del examen?`}
          warning={warningMessage(selectedProject)}
          onConfirm={handleConfirmSelection}
          onCancel={() => { setShowConfirmModal(false); setSelectedProject(null) }}
        />
      )}

      {showSuccessModal && savedData && (
        <SuccessModal
          title="¡Guardado correctamente!"
          message={`Las clases base de ${displayName(savedData.project)} han sido actualizadas correctamente.`}
          actions={[{
            label: fromAttributes ? "Continuar con Generación de Tests" : "Volver",
            onClick: () => { setShowSuccessModal(false); onWelcome() },
            variant: "primary",
          }]}
        />
      )}

      <Header onWelcome={onWelcome} breadcrumbItems={breadcrumbItems} currentStep="CLASES BASE" />

      <main className="main-content">

        {(selectionStep === "folders" || selectionStep === "exams") && (
          <FolderExamSelector
            projects={projects}
            allowedFolders={ALLOWED_FOLDERS}
            selectedFolder={selectionStep === "exams" ? selectedFolder : null}
            onSelectFolder={(folder) => {
              setSelectedFolder(folder)
              setSelectionStep("exams")
            }}
            onSelectProject={handleSelectProject}
            onBack={onBack}
            displayName={displayName}
          />
        )}

        {selectionStep === "exams" && selectedFolder && (
          <div>
            <h1 className="main-title">Exámenes de {selectedFolder.toUpperCase()}</h1>
            <div className="subtitle-badge">Selecciona el examen que deseas utilizar como contexto.</div>
            <div className="cards-container">
              {projectsInFolder.map((proj) => (
                <div key={proj.id} className="action-card">
                  <button className="btn-icon" onClick={() => handleSelectProject(proj)} title="Abrir examen">
                    <img src={examen} alt="Abrir examen" />
                  </button>
                  <span className="card-label">{displayName(proj)}</span>
                </div>
              ))}
            </div>
            <button onClick={() => setSelectionStep("folders")} className="btn-back" style={{ marginTop: "20px" }}>Volver</button>
          </div>
        )}

        {selectionStep === "workflow" && selectedProject && (
          <div className="wf-layout-container">
            <div className="wf-wide-wrapper">
              {internalStep === "input" && (
                <PromptEditor
                  title="Clases Base del Examen"
                  description={<>Este es el prompt que se usará para generar las clases base. Puedes modificar lo que veas conveniente. Al terminar, pulsa <strong>"Generar"</strong>.</>}
                  promptText={promptText}
                  isLoading={isLoading}
                  onPromptChange={setPromptText}
                  onGenerate={handleGenerate}
                  onBack={() => setSelectionStep("exams")}
                />
              )}
              {internalStep === "result" && (
                <SplitResultView
                  promptText={promptText}
                  isLoading={isLoading}
                  responseText={responseText}
                  onPromptChange={setPromptText}
                  onRegenerate={handleGenerate}
                  onResponseChange={setResponseText}
                  rightTitle="Propuesta del código de las clases bases"
                  footer={
                    <div className="wf-actions-row">
                      <button onClick={handleDownload} className="btn-step btn-download">Descargar (.md)</button>
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
  )
}