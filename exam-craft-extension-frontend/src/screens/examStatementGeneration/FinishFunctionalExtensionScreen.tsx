import React, { useState } from "react"
import { MermaidViewer } from "../../components/MermaidViewer"
import { Header } from "~src/components/Header"
import { StepperHeader } from "../../components/WorkflowComponents"
import "../../css/WorkFlowParts.css"
import { downloadMarkdown } from "~src/utils/downloadUtils"
import { SaveModal } from "~src/components/modals/SaveModal"
import { DownloadConfirmModal } from "~src/components/modals/DownloadConfirmModal" 

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
  readonly onComponents: () => void
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
  onComponents
}: Props) {
  const [showSave, setShowSave] = useState(false)
  const [showDownloadModal, setShowDownloadModal] = useState(false) 

  const handleConfirmDownload = (fileName: string) => {
    const content = `# Extensión Funcional - ${domainName}\n\n## Enunciado\n${
      extensionStatement || "No hay texto de enunciado."
    }\n\n${
      extensionMermaid
        ? `\`\`\`mermaid\n${extensionMermaid}\n\`\`\``
        : "*No se generó código Mermaid*"
    }\n`
    
    downloadMarkdown(content, fileName) 
    setShowDownloadModal(false) 
  }

  const breadcrumbItems = [
    { label: "INICIO", action: onWelcome },
    { label: "CREAR EXAMEN", action: onCreateExam },
    { label: "POR PARTES", action: onCreateExamByParts },
    { label: 'ENUNCIADO', action: onComponents },
    { label: "EXTENSIÓN FUNCIONAL", action: onFunctionalExtension },
    { label: domainName.toUpperCase(), action: onStatementStep1 },
  ]

  return (
    <div className="exam-app">
      <Header
        onWelcome={onWelcome}
        breadcrumbItems={breadcrumbItems}
        currentStep="PROPUESTA FINAL"
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
                <div className="wf-column-title">Contexto</div>
                <textarea
                  className="wf-textarea-input"
                  value={extensionStatement}
                  readOnly
                />
              </div>

              <div className="wf-column-three">
                <div className="wf-column-title">Visualización del Modelo UML</div>
                <div className="wf-diagram-area">
                  {extensionMermaid ? (
                    <div>
                      <MermaidViewer chartCode={extensionMermaid} />
                    </div>
                  ) : (
                    <div>No se pudo extraer el diagrama del texto.</div>
                  )}
                </div>
              </div>
            </div>

            <div className="wf-actions-row">
              <button onClick={onBack} className="btn-back">
                Volver a UML
              </button>
              <button
                onClick={() => setShowDownloadModal(true)}
                className="btn-step btn-download"
              >
                Descargar (.md)
              </button>
              <button onClick={() => setShowSave(true)} className="btn-step primary">
                Guardar
              </button>
            </div>
          </div>
        </div>
      </main>

      <DownloadConfirmModal
        isOpen={showDownloadModal}
        defaultFileName={`Extension_Funcional_${domainName.replace(/\s+/g, "_")}`}
        onConfirm={handleConfirmDownload}
        onCancel={() => setShowDownloadModal(false)}
      />

      {showSave && (
        <SaveModal
          domainName={domainName}
          onSuccess={onWelcome}
          onClose={() => setShowSave(false)}
          buildPayload={(finalName) => ({
            domainName,
            customName: finalName,
            extensionStatement,
            extensionMermaid,
            extensionFinish: `${extensionStatement}\n\n${
              extensionMermaid ? `\`\`\`mermaid\n${extensionMermaid}\n\`\`\`` : ""
            }`.trim(),
            savedAt: new Date().toISOString(),
          })}
        />
      )}
    </div>
  )
}