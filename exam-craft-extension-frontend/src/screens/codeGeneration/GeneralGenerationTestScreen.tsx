import React, { useState } from "react"
import { useGeminiGeneration } from "../../components/GeminiGeneration"
import { saveToChrome } from "~src/utils/chromeStorageUtils"
import { StepperHeader, PromptEditor, SplitResultView } from "../../components/WorkflowComponents"
import { SuccessModal } from "../../components/modals/SuccessModal"
import { ConfirmModal } from "../../components/modals/ConfirmModal"
import logoExamCraft from "../../../assets/icon512.png"

interface GeneralTestProps {
  project: any
  constraints: string
  entityRelationships: string
  baseClass: string
  targetType?: "attributes" | "entityRelationships"
  onBack: () => void
  onWelcome: () => void
}

const STEPS = [{ label: "Prompt" }, { label: "Resultado" }]

const buildInitialPrompt = (
  targetType: "attributes" | "entityRelationships",
  baseClass: string,
  constraints: string,
  entityRelationships: string
) => {
  const isAttributes = targetType === "attributes"
  const targetContent = isAttributes ? constraints : entityRelationships
  const targetLabel = isAttributes ? "restricciones de atributos" : "relaciones entre entidades"

  return `Eres un experto en bases de datos y generación de exámenes académicos.

A continuación se te proporciona el código base de un modelo de dominio y sus ${targetLabel}.

**Código base:**
${baseClass}

**${isAttributes ? "Restricciones de atributos" : "Relaciones entre entidades"}:**
${targetContent}

Genera un test de evaluación completo con preguntas variadas (verdadero/falso, opción múltiple, preguntas cortas) sobre los conceptos de ${targetLabel} presentes en el modelo. Incluye la solución al final.`
}

export default function GeneralTest({
  project,
  constraints,
  entityRelationships,
  baseClass,
  targetType = "attributes",
  onBack,
  onWelcome,
}: GeneralTestProps) {
  const partKey = targetType === "attributes" ? "test1_attributes" : "test2_relationships"
  const partLabel = targetType === "attributes" ? "Restricciones de Atributos" : "Relaciones entre Entidades"

  const [currentStep, setCurrentStep] = useState(1)
  const [promptText, setPromptText] = useState(() =>
    buildInitialPrompt(targetType, baseClass, constraints, entityRelationships)
  )
  const [saveState, setSaveState] = useState<"idle" | "saving" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")

  const { responseText, isLoading, setResponseText, generate } = useGeminiGeneration({
    logExerciseName: `GeneralTest_${partKey}`,
    buildLogPayload: (result) => ({
      targetType,
      projectId: project.id,
      result,
    }),
  })

  const handleGenerate = async () => {
    const result = await generate(promptText)
    if (result) setCurrentStep(2)
  }

  const handleSave = async () => {
    setSaveState("saving")
    try {
      const updatedTestPartsMap = {
        ...(project.testPartsMap || {}),
        [partKey]: { code: responseText },
      }
      const { id, ...rest } = project
      await saveToChrome(id, {
        ...rest,
        testPartsMap: updatedTestPartsMap,
      })
      setSaveState("success")
    } catch (e: any) {
      setErrorMessage(e?.message ?? "No se pudo guardar.")
      setSaveState("error")
    }
  }

  const breadcrumbButtonStyle: React.CSSProperties = {
    background: "none", border: "none", padding: 0, margin: 0,
    font: "inherit", color: "#4a3728", cursor: "pointer", display: "inline", outline: "none",
  }

  if (saveState === "success") {
    return (
      <SuccessModal
        title="¡Test guardado con éxito!"
        message={`El test de "${partLabel}" se ha guardado correctamente en el examen.`}
        actions={[
          { label: "Volver al inicio", onClick: onWelcome, variant: "primary" },
          { label: "Seguir editando", onClick: () => setSaveState("idle"), variant: "secondary" },
        ]}
      />
    )
  }

  if (saveState === "error") {
    return (
      <ConfirmModal
        title="Error al guardar"
        message={errorMessage}
        onConfirm={() => setSaveState("idle")}
        onCancel={onWelcome}
        confirmLabel="Reintentar"
        cancelLabel="Volver al inicio"
      />
    )
  }

  return (
    <div className="exam-app" style={{ position: "relative" }}>
      <header className="app-header">
        <div className="header-left">
          <button
            type="button"
            onClick={onWelcome}
            style={{ background: "none", border: "none", padding: 0, cursor: "pointer", outline: "none" }}
            aria-label="Ir a inicio"
          >
            <img src={logoExamCraft} alt="Logo ExamCraft" width="60" height="60" />
          </button>

          <nav className="breadcrumb-nav">
            {[
              { label: "INICIO", action: onWelcome },
              { label: "CREAR EXAMEN", action: onBack },
              { label: "TESTS", action: onBack },
            ].map((item) => (
              <React.Fragment key={item.label}>
                <button type="button" style={breadcrumbButtonStyle} onClick={item.action}>
                  {item.label}
                </button>
                <span className="breadcrumb-separator">{" > "}</span>
              </React.Fragment>
            ))}
            <span className="breadcrumb-current">{partLabel.toUpperCase()}</span>
          </nav>
        </div>
      </header>

      <main className="main-content">
        <div className="content-card-wf" style={{ width: "100%", maxWidth: "900px" }}>
          <StepperHeader steps={STEPS} currentStep={currentStep} />

          <h2 className="main-title small" style={{ marginTop: "20px" }}>
            Test de {partLabel}
          </h2>
          <p className="wf-instruction-text">
            {currentStep === 1
              ? "Revisa y edita el prompt antes de generar el test."
              : "Revisa el test generado y guárdalo cuando estés listo."}
          </p>

          {currentStep === 1 && (
            <PromptEditor
              promptText={promptText}
              isLoading={isLoading}
              generateLabel="Generar Test"
              onPromptChange={setPromptText}
              onGenerate={handleGenerate}
              onBack={onBack}
            />
          )}

          {currentStep === 2 && (
            <SplitResultView
              promptText={promptText}
              isLoading={isLoading}
              responseText={responseText}
              leftTitle="Prompt enviado"
              rightTitle="Test generado"
              onPromptChange={setPromptText}
              onRegenerate={handleGenerate}
              onResponseChange={setResponseText}
              footer={
                <>
                  <button onClick={() => setCurrentStep(1)} className="btn-step secondary">
                    Volver al prompt
                  </button>
                  <button onClick={handleGenerate} className="btn-step secondary" disabled={isLoading}>
                    {isLoading ? <div className="loading-spinner" /> : "Regenerar"}
                  </button>
                  <button
                    onClick={handleSave}
                    className="btn-step primary"
                    disabled={isLoading || !responseText.trim()}
                  >
                    {saveState === "saving" ? <div className="loading-spinner" /> : "Guardar Test"}
                  </button>
                </>
              }
            />
          )}
        </div>
      </main>
    </div>
  )
}