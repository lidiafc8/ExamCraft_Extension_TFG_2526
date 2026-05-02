import React from "react"
import { MermaidViewer } from "../../components/MermaidViewer"
import { Header } from "~src/components/Header"
import { StepperHeader } from "../../components/WorkflowComponents"
import "../../css/WorkFlowParts.css"

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

  const handleSaveToChrome = () => {
    if (!globalThis.chrome?.storage?.local) {
      alert("Esta funcionalidad solo está disponible dentro de la Extensión de Chrome.")
      return
    }
    const userChosenName = prompt("Introduce el nombre para guardar este examen:", `Examen de ${domainName}`)
    if (userChosenName === null) return
    const finalName = userChosenName.trim() || `Examen de ${domainName}`
    const extensionFinish = `${extensionStatement}\n\n${extensionMermaid ? `\`\`\`mermaid\n${extensionMermaid}\n\`\`\`` : ""}`.trim()
    const dataToSave = {
      domainName, customName: finalName,
      extensionStatement, extensionMermaid, extensionFinish,
      savedAt: new Date().toISOString(),
    }
    chrome.storage.local.set({ [`project_${Date.now()}`]: dataToSave }, () => {
      if (chrome.runtime.lastError) {
        alert("No se pudo guardar en el almacenamiento local.")
      } else {
        alert(`¡Examen "${finalName}" guardado con éxito en la carpeta de ${domainName.toUpperCase()}!`)
        onWelcome()
      }
    })
  }

  const handleDownload = () => {
    const defaultName = `Extension_Funcional_${domainName}`
    const userChosenName = prompt("Introduce el nombre para el archivo a descargar:", defaultName)
    if (userChosenName === null) return
    let finalFileName = userChosenName.trim() || defaultName
    if (!finalFileName.toLowerCase().endsWith(".md")) finalFileName += ".md"
    const markdownContent = `# Extensión Funcional - ${domainName}\n\n## Enunciado\n${extensionStatement || "No hay texto de enunciado."}\n\n${
      extensionMermaid ? `\`\`\`mermaid\n${extensionMermaid}\n\`\`\`` : "*No se generó código Mermaid*"
    }\n`
    const blob = new Blob([markdownContent], { type: "text/markdown;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = Object.assign(document.createElement("a"), { href: url, download: finalFileName })
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
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

            <div className="wf-actions-row finish-extension-actions">
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