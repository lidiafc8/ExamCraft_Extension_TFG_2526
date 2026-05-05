import React, { useState, useEffect } from "react"
import carpeta from "../../../assets/images/archive.png"
import examen from "../../../assets/images/exam.png"
import generationExamBaseClassesPrompt from "bundle-text:../../prompts/generation-exam-repository/exam/generation_exam_base_classes.md"
import { parseMasterPrompt } from "~src/utils/promptParser"
import { PromptEditor, SplitResultView } from "~src/components/WorkflowComponents"
import { useGeminiGeneration } from "~src/components/GeminiGeneration"
import { Header } from "~src/components/Header";
import "../../css/Cards.css"
import "../storage/css/FoldersGridScreen.css";
import { ConfirmModal } from "../../components/modals/ConfirmModal";
import { SuccessModal } from "../../components/modals/SuccessModal";

declare var chrome: any

interface Props {
  readonly initialProject?: any
  readonly fromAttributes?: boolean
  readonly onGoToTests?: (projectData: any) => void
  readonly onBack: () => void
  readonly onWelcome: () => void
  readonly onCreateExam: () => void
  readonly onCreateExamByParts: () => void
  readonly onCodeGeneration: () => void
}

const CLASES_POR_DEFECTO: Record<string, string> = {
  "clínica veterinaria": `
- BaseEntity
- NamedEntity
- Person
- Owner
- Vet
- Pet
- PetType
- Specialty
- Visit
- Clinic
- PricingPlan
- ClinicOwner
- User
- Authorities`,
  "ajedrez": `
- BaseEntity
- NamedEntity
- Authorities
- User
- ChessMatch
- ChessBoard
- Piece`,
}

const ALLOWED_FOLDERS = ["clínica veterinaria", "ajedrez"]
const STORAGE_KEY = "baseClasses"
const DOWNLOAD_PREFIX = "Clases_Base"

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

  const [projects, setProjects] = useState<any[]>([])
  const [selectedDomainFolder, setSelectedDomainFolder] = useState<string | null>(null)
  const [selectedProject, setSelectedProject] = useState<any>(initialProject ?? null)

  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [savedData, setSavedData] = useState<{ project: any; result: string } | null>(null)

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

  const visibleFolders = ALLOWED_FOLDERS.filter((folderName) =>
    projects.some((p) => p.domainName?.toLowerCase() === folderName.toLowerCase())
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
        const projectList = Object.keys(items)
          .filter((key) => key.startsWith("project_"))
          .map((key) => ({ id: key, ...items[key] }))
        setProjects(projectList)
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

  const projectsInFolder = projects.filter(
    (p) =>
      p.domainName &&
      selectedDomainFolder &&
      p.domainName.toLowerCase() === selectedDomainFolder.toLowerCase()
  )

  const projectDisplayName = (proj: any) =>
    proj?.customName || `Examen de ${proj?.domainName}`

  const buildPrompt = (project: any): { visibleText: string; hiddenContext: string } => {
    try {
      const { visibleText, hiddenContext } = parseMasterPrompt(generationExamBaseClassesPrompt)
      const rawDominio = project?.domainName || project?.name || project?.customName || ""
      const dominioNormalizado = rawDominio.trim()
      const clasesExistentes =
        CLASES_POR_DEFECTO[dominioNormalizado.toLowerCase()] ||
        "No hay clases base registradas para este dominio."
      const baseTemplate =
        visibleText?.trim().length > 0
          ? visibleText
          : "Genera las clases base en Java para el dominio {dominio}. Clases a incluir: {clases_existentes}"
      return {
        visibleText: baseTemplate
          .replaceAll("{dominio}", dominioNormalizado || "el examen")
          .replaceAll("{clases_existentes}", clasesExistentes),
        hiddenContext: hiddenContext || "",
      }
    } catch (error) {
      console.error("Error en buildPrompt:", error)
      return {
        visibleText: "Error al preparar el prompt. Por favor, revisa el dominio seleccionado.",
        hiddenContext: "",
      }
    }
  }

  const handleSelectFolder = (folderName: string) => {
    setSelectedDomainFolder(folderName)
    setSelectionStep("exams")
  }

  const handleSelectProject = (project: any) => {
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

      [RECURSOS ESTÁTICOS Y EJEMPLOS]:
      ${hiddenContext}

      [ENUNCIADO Y DIAGRAMA DEL EXAMEN SELECCIONADO]:
      ${selectedProject.extensionFinish}

      INSTRUCCIONES PRINCIPALES:
      ${promptText}
    `
    const result = await generate(finalPayload)
    if (result) setInternalStep("result")
  }

  const handleSaveToChrome = () => {
    if (globalThis.chrome?.storage?.local) {
      if (!selectedProject?.id) {
        alert("Error: No hay un examen válido seleccionado para actualizar.")
        return
      }
      const updatedExamData = {
        ...selectedProject,
        [STORAGE_KEY]: responseText,
        updatedAt: new Date().toISOString(),
      }
      chrome.storage.local.set({ [selectedProject.id]: updatedExamData }, () => {
        if (chrome.runtime.lastError) {
          console.error("Error al actualizar:", chrome.runtime.lastError)
          alert("No se pudo actualizar el examen en el almacenamiento local.")
        } else {
          setSelectedProject(updatedExamData)
          const data = { project: updatedExamData, result: responseText }
          setSavedData(data)
          setShowSuccessModal(true)
        }
      })
    } else {
      alert("Esta funcionalidad solo está disponible dentro de la Extensión de Chrome.")
    }
  }

  const handleDownload = () => {
    if (!selectedProject || !responseText) return
    const defaultName = `${DOWNLOAD_PREFIX}_${selectedProject.customName}`
    const userChosenName = prompt("Introduce el nombre para el archivo a descargar:", defaultName)
    if (userChosenName === null) return
    let finalFileName = userChosenName.trim() || defaultName
    if (!finalFileName.toLowerCase().endsWith(".md")) finalFileName += ".md"
    const downloadTitle = `Clases Base - ${selectedProject.customName || selectedProject.domainName}`
    const markdownContent = `# ${downloadTitle}\n\n${responseText}`
    const blob = new Blob([markdownContent], { type: "text/markdown;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = finalFileName
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  const handleSuccessPrimary = () => {
    if (!savedData) return
    setShowSuccessModal(false)
    const finalProjectData = {
      ...savedData.project,
      id: savedData.project.id || initialProject?.id,
    }
    if (fromAttributes && onGoToTests) {
      onGoToTests(finalProjectData)
    } else {
      onCodeGeneration()
    }
  }

  const handleSuccessSecondary = () => {
    setShowSuccessModal(false)
    onWelcome()
  }

  const confirmWarning = (project: any): string | null => {
    if (project?.[STORAGE_KEY]) {
      return "Este examen ya tiene clases base generadas. Si continúas, se sobreescribirán al guardar."
    }
    return null
  }

  return (
    <div>
      {showConfirmModal && selectedProject && (
        <ConfirmModal
          title="Confirmar Examen"
          message={`¿Deseas utilizar ${projectDisplayName(selectedProject)} como base para generar las clases base del examen?`}
          warning={confirmWarning(selectedProject)}
          onConfirm={handleConfirmSelection}
          onCancel={() => { setShowConfirmModal(false); setSelectedProject(null) }}
        />
      )}

      {showSuccessModal && savedData && (
        <SuccessModal
          title="¡Guardado correctamente!"
          message={`Las clases base de ${projectDisplayName(savedData.project)} han sido actualizadas correctamente.`}
          actions={[
            {
              label: fromAttributes ? "Continuar con Generación de Tests" : "Volver",
              onClick: handleSuccessPrimary,
              variant: "primary",
            }
          ]}
        />
      )}

      <Header
        onWelcome={onWelcome}
        breadcrumbItems={breadcrumbItems}
        currentStep="CLASES BASE"
      />

      <main className="main-content">

        {selectionStep === "folders" && (
          <div>
            <h1 className="main-title">MIS EXÁMENES</h1>
            <div className="subtitle-badge">Selecciona un dominio</div>

            <div className="cards-container">
              {visibleFolders.length === 0 ? (
                <div className="empty-container">
                  <p>No hay exámenes creados todavía.</p>
                  <p className="empty-subtext">Crea tu primer examen para verlo aquí.</p>
                </div>
              ) : (
                visibleFolders.map((folderName) => {
                  const count = projects.filter(
                    (p) => p.domainName?.toLowerCase() === folderName.toLowerCase()
                  ).length
                  return (
                    <button
                      key={folderName}
                      type="button"
                      className="action-card"
                      onClick={() => handleSelectFolder(folderName)}
                    >
                      <span>
                        <img src={carpeta} alt="Carpeta" className="card-icon" />
                      </span>
                      <span className="card-label">{folderName.toUpperCase()}</span>
                      <span className="card-count">
                        {count} {count === 1 ? "EXAMEN" : "EXÁMENES"}
                      </span>
                    </button>
                  )
                })
              )}
            </div>

            <button onClick={onBack} className="btn-back" style={{ marginTop: "20px" }}>
              Volver
            </button>
          </div>
        )}

        {selectionStep === "exams" && selectedDomainFolder && (
          <div>
            <h1 className="main-title">
              Exámenes de {selectedDomainFolder.toUpperCase()}
            </h1>
            <div className="subtitle-badge">
              Selecciona el examen que deseas utilizar como contexto.
            </div>

            <div className="cards-container">
              {projectsInFolder.map((proj) => {
                const displayName = projectDisplayName(proj)
                return (
                  <div key={proj.id} className="action-card">
                    <button
                      className="btn-icon"
                      onClick={() => handleSelectProject(proj)}
                      title="Abrir examen"
                    >
                      <img src={examen} alt="Abrir examen" />
                    </button>
                    <span className="card-label">{displayName}</span>
                  </div>
                )
              })}
            </div>

            <button
              onClick={() => setSelectionStep("folders")}
              className="btn-back"
              style={{ marginTop: "20px" }}
            >
              Volver
            </button>
          </div>
        )}

        {selectionStep === "workflow" && selectedProject && (
          <div className="wf-layout-container">
            <div className="wf-wide-wrapper">
              {internalStep === "input" && (
                <PromptEditor
                  title="Clases Base del Examen"
                  description={
                    <>
                      Este es el prompt que se usará para generar las clases base del examen seleccionado.
                      Puedes revisar o modificar cualquier información que veas conveniente.
                      Al terminar, pulsa en <strong>"Generar"</strong>.
                    </>
                  }
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
                    <div className="wf-actions-row finish-extension-actions">
                      <button onClick={handleDownload} className="btn-step btn-download">
                        Descargar (.md)
                      </button>
                      <button onClick={handleSaveToChrome} className="btn-step primary">
                        Guardar
                      </button>
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