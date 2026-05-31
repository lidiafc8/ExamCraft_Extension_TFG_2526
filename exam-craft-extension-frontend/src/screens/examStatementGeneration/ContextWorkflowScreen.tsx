import extensionPromptMarkdown from "bundle-text:../../prompts/functional-extension-generation/generation_statement_functional_extension.md"
import React, { useEffect, useState } from "react"

import { Header } from "~src/components/Header"

import { useGeminiGeneration } from "../../components/GeminiGeneration"
import {
  PromptEditor,
  SplitResultView,
  StepperHeader
} from "../../components/WorkflowComponents"
import { parseMasterPrompt } from "../../utils/promptParser"

import "../../css/WorkFlowParts.css"
import "../../css/CommonText.css"

declare var chrome: any

interface Props {
  readonly domainName: string
  readonly onBack: () => void
  readonly onWelcome: () => void
  readonly onCreateExam: () => void
  readonly onCreateExamByParts: () => void
  readonly onFunctionalExtension: () => void
  readonly onCreateDiagram: (text: string) => void
  readonly onComponents: () => void
}

const STEPS = [{ label: "Texto de enunciado" }, { label: "Diagrama UML" }]

export default function ContextWorkflowScreen({
  domainName,
  onBack,
  onWelcome,
  onCreateExam,
  onCreateExamByParts,
  onFunctionalExtension,
  onCreateDiagram,
  onComponents
}: Props) {
  const [wizardStep, setWizardStep] = useState<1 | 2>(1)
  const [internalStep, setInternalStep] = useState<"input" | "result">("input")
  const [promptText, setPromptText] = useState("")
  const [hiddenContext, setHiddenContext] = useState("")
  const [previousExtensions, setPreviousExtensions] = useState("")

  useEffect(() => {
    if (!globalThis.chrome?.storage?.local) return
    chrome.storage.local.get(null, (items: Record<string, any>) => {
      const extensions = Object.keys(items)
        .filter((key) => key.startsWith("project_"))
        .map((key) => items[key])
        .filter(
          (p) =>
            p.domainName?.toLowerCase() === domainName.toLowerCase() &&
            p.extensionFinish
        )
        .map(
          (p, i) =>
            `# EXTENSIÓN FUNCIONAL PREVIA ${i + 1} (${p.customName || p.domainName})\n${p.extensionFinish}`
        )
        .join("\n\n")
      setPreviousExtensions(extensions)
    })
  }, [domainName])

  useEffect(() => {
    if (!extensionPromptMarkdown) return
    const { visibleText, hiddenContext: parsed } = parseMasterPrompt(
      extensionPromptMarkdown
    )
    setPromptText(visibleText.replaceAll("{{DOMAIN}}", domainName))
    setHiddenContext(parsed)
  }, [domainName])

  const { responseText, isLoading, generate, setResponseText } =
    useGeminiGeneration({
      logExerciseName: "statement-functional-extension",
      buildLogPayload: (result) => ({
        dominio: domainName,
        contextoOculto: hiddenContext,
        extensionesPrevias: previousExtensions,
        promptVisible: promptText,
        respuesta: result
      })
    })

  const handleGenerate = async () => {
    const payload = `
      CONTEXTO Y RECURSOS (Información interna):
      ${hiddenContext}

      [RECURSOS ESTÁTICOS Y EJEMPLOS]:
      ${hiddenContext}

      ${
        previousExtensions
          ? `[EXTENSIONES FUNCIONALES YA CREADAS PARA EL DOMINIO "${domainName}" - LA SOLUCIÓN DEVUELTA DEBERÁ EVITAR REPETIR ESTAS EXTENSIONES:\n${previousExtensions}`
          : ""
      }

      INSTRUCCIONES PRINCIPALES:
      ${promptText}
    `
    const result = await generate(payload)
    if (result) setInternalStep("result")
  }

  const breadcrumbItems = [
    { label: "INICIO", action: onWelcome },
    { label: "CREAR EXAMEN", action: onCreateExam },
    { label: "POR PARTES", action: onCreateExamByParts },
    { label: "ENUNCIADO", action: onComponents },
    { label: "EXTENSIÓN FUNCIONAL", action: onFunctionalExtension }
  ]

  return (
    <div>
      <Header
        onWelcome={onWelcome}
        breadcrumbItems={breadcrumbItems}
        currentStep={domainName.toUpperCase()}
      />

      <div className="main-content">
        <div className="wf-layout-container">
          <StepperHeader steps={STEPS} currentStep={wizardStep} />

          <div className="wf-wide-wrapper">
            {wizardStep === 1 && internalStep === "input" && (
              <PromptEditor
                title={`${domainName.toUpperCase()}: Texto de enunciado`}
                description={
                  <>
                    Este es el prompt que se usará para generar el texto del
                    enunciado del examen, puede revisar o modificar cualquier
                    información que vea conveniente. Al terminar, pulse en{" "}
                    <strong>"Generar Enunciado"</strong>.
                  </>
                }
                promptText={promptText}
                isLoading={isLoading}
                generateLabel="Generar Enunciado"
                onPromptChange={setPromptText}
                onGenerate={handleGenerate}
                onBack={onBack}
              />
            )}

            {wizardStep === 1 && internalStep === "result" && (
              <>
                <SplitResultView
                  promptText={promptText}
                  isLoading={isLoading}
                  responseText={responseText}
                  rightTitle="Propuesta de texto de enunciado"
                  onPromptChange={setPromptText}
                  onRegenerate={handleGenerate}
                  onResponseChange={setResponseText}
                />
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
                  <button onClick={onBack} className="btn-back">
                    Volver
                  </button>
                  <button
                    onClick={() => setWizardStep(2)}
                    className="btn-step success confirm">
                    Confirmar y Continuar
                  </button>
                </div>
              </>
            )}

            {wizardStep === 2 && (
              <div className="content-card-wf">
                <h2 className="main-title small">Confirmación</h2>
                <p className="wf-instruction-text">
                  ¿Está seguro que desea usar el texto de enunciado generado?
                  Una vez confirmado, se generará el diagrama UML en base a él y
                  no podrá modificarlo.
                </p>
                <div className="wf-actions-row">
                  <button
                    onClick={() => setWizardStep(1)}
                    className="btn-step secondary cancel">
                    Cancelar y seguir editando enunciado
                  </button>
                  <button
                    onClick={() => onCreateDiagram(responseText)}
                    className="btn-step success confirm">
                    Confirmar y pasar al paso 2<br />
                    (Diagrama UML)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
