import React from "react"
import { MermaidViewer } from "../../components/MermaidViewer"
import { Header } from "~src/components/Header"
import { StepperHeader } from "../../components/WorkflowComponents"
import "../../css/WorkFlowParts.css"
import { downloadMarkdown } from "~src/utils/downloadUtils"
import { saveToChrome } from "~src/utils/chromeStorageUtils"

declare var chrome: any

interface Props {
  readonly domainName: string
  readonly extensionStatement: string
  readonly extensionMermaid: string
  readonly onBack: () => void
  readonly onWelcome: () => void
  readonly onCreateExam: () => void
  readonly onCreateExamByParts: () => void
  readonly onFunctionalExtension: () => void
  readonly onStatementStep1: () => void
}

const STEPS = [{ label: "Texto de enunciado" }, { label: "Diagrama UML" }]

export default function FinishFunctionalExtensionScreen({
  domainName,
  extensionStatement,
  extensionMermaid,
  onBack,
  onWelcome,
  onCreateExam,
  onCreateExamByParts,
  onFunctionalExtension,
  onStatementStep1,
}: Props) {

  const handleSaveToChrome = async () => {
    const userChosenName = prompt("Introduce el nombre para guardar este examen:", `Examen de ${domainName}`)
    if (userChosenName === null) return
    const finalName = userChosenName.trim() || `Examen de ${domainName}`
    const extensionFinish = `${extensionStatement}\n\n${
      extensionMermaid ? `\`\`\`mermaid\n${extensionMermaid}\n\`\`\`` : ""
    }`.trim()

    try {
      await saveToChrome(`project_${Date.now()}`, {
        domainName, customName: finalName,
        extensionStatement, extensionMermaid, extensionFinish,
        savedAt: new Date().toISOString(),
      })
      alert(`¡Examen "${finalName}" guardado con éxito!`)
      onWelcome()
    } catch (error) {
      alert(error instanceof Error ? error.message : "No se pudo guardar.")
    }
  }

  const handleDownload = () => {
    const content = `# Extensión Funcional - ${domainName}\n\n## Enunciado\n${extensionStatement || "No hay texto de enunciado."}\n\n${
      extensionMermaid ? `\`\`\`mermaid\n${extensionMermaid}\n\`\`\`` : "*No se generó código Mermaid*"
    }\n`
    downloadMarkdown(content, `Extension_Funcional_${domainName}`)
  }

  const breadcrumbItems = [
    { label: "INICIO", action: onWelcome },
    { label: "CREAR EXAMEN", action: onCreateExam },
    { label: "POR PARTES", action: onCreateExamByParts },
    { label: "EXTENSIÓN FUNCIONAL", action: onFunctionalExtension },
    { label: domainName.toUpperCase(), action: onStatementStep1 },
  ]

  return (
    <div className="exam-app">
      <Header
        onWelcome={onWelcome}
        breadcrumbItems={breadcrumbItems}
        currentStep="EXTENSION FUNCIONAL COMPLETA"
      />

      <main className="main-content">
        <div className="wf-layout-container">

          <StepperHeader steps={STEPS} currentStep={3} />

          <div className="wf-wide-wrapper">
            <h2 className="main-title small">
              {domainName.toUpperCase()}: Resultado Final
            </h2>

            <div className="finish-extension-columns">

              <div className="wf-column-three">
                <div className="wf-column-title">
                  Contexto
                </div>
                <textarea
                  className="wf-textarea-input"
                  value={extensionStatement}
                  readOnly
                />
              </div>

              <div className="wf-column-three">
                <div className="wf-column-title">
                  Visualización del Modelo UML
                </div>
                <div className="wf-diagram-area">
                  {extensionMermaid
                    ? <div><MermaidViewer chartCode={extensionMermaid} /></div>
                    : <div>No se pudo extraer el diagrama del texto.</div>
                  }
                </div>
              </div>

            </div>

            <div className="wf-actions-row ">
              <button onClick={onBack} className="btn-back">
                Volver a UML
              </button>
              <button onClick={handleDownload} className="btn-step btn-download">
                Descargar (.md)
              </button>
              <button onClick={handleSaveToChrome} className="btn-step primary">
                Guardar
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}