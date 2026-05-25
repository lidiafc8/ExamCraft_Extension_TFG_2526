import React from "react"

const getStepStateClass = (stepNumber: number, currentStep: number): string => {
  if (stepNumber < currentStep) return "step-completed"
  if (stepNumber === currentStep) return "step-active"
  return "step-inactive"
}

const getLineBackground = (stepNumber: number, currentStep: number): string => {
  return stepNumber < currentStep ? "#4CAF50" : "#e0e0e0"
}

interface StepDef {
  label: string
}

interface StepperHeaderProps {
  steps: StepDef[]
  currentStep: number
}

export function StepperHeader({ steps, currentStep }: StepperHeaderProps) {
  return (
    <div className="stepper-container">
      {steps.map((step, i) => {
        const n = i + 1
        const stateClass = getStepStateClass(n, currentStep)

        return (
          <React.Fragment key={step.label}>
            <div className={`step-wrapper ${stateClass}`}>
              <div className="step-circle">{n}</div>
              <span className="step-label">{step.label}</span>
            </div>
            {i < steps.length - 1 && (
              <div
                className="step-line"
                style={{ background: getLineBackground(n, currentStep) }}
              />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

interface PromptEditorProps {
  title?: string
  description?: React.ReactNode
  promptText: string
  isLoading: boolean
  generateLabel?: string
  onPromptChange: (v: string) => void
  onGenerate: () => void
  onBack?: () => void
}

export function PromptEditor({
  title,
  description,
  promptText,
  isLoading,
  generateLabel = "Generar",
  onPromptChange,
  onGenerate,
  onBack
}: PromptEditorProps) {
  return (
    <div className="content-card-wf">
      {title && <h2 className="main-title small">{title}</h2>}
      {description && <p className="wf-instruction-text">{description}</p>}

      <textarea
        className="wf-textarea-input"
        value={promptText}
        onChange={(e) => onPromptChange(e.target.value)}
      />

      <div className="wf-actions-row">
        {onBack && (
          <button onClick={onBack} className="btn-back">
            Volver
          </button>
        )}
        <button
          onClick={onGenerate}
          className="btn-step primary"
          disabled={isLoading}>
          {isLoading ? <div className="loading-spinner" /> : generateLabel}
        </button>
      </div>
    </div>
  )
}

interface SplitResultViewProps {
  promptText: string
  isLoading: boolean
  responseText: string
  leftTitle?: string
  rightTitle?: string
  regenerateLabel?: string
  onPromptChange: (v: string) => void
  onRegenerate: () => void
  onResponseChange: (v: string) => void
  rightContent?: React.ReactNode
  rightActions?: React.ReactNode
  footer?: React.ReactNode
}

export function SplitResultView({
  promptText,
  isLoading,
  responseText,
  leftTitle = "Prompt enviado",
  rightTitle = "Propuesta del modelo",
  onPromptChange,
  onResponseChange,
  rightContent,
  rightActions,
  footer
}: SplitResultViewProps) {
  return (
    <>
      <div className="wf-split-view-two">
        <div className="wf-column">
          <span className="wf-column-title">{leftTitle}</span>
          <textarea
            className="wf-textarea-input"
            value={promptText}
            onChange={(e) => onPromptChange(e.target.value)}
          />
        </div>

        <div className="wf-column">
          <span className="wf-column-title">{rightTitle}</span>

          {rightContent ??
            (isLoading ? (
              <div className="wf-result-box">Generando...</div>
            ) : (
              <textarea
                className="wf-result-box"
                value={responseText}
                onChange={(e) => onResponseChange(e.target.value)}
              />
            ))}

          {rightActions && (
            <div style={{ marginTop: "10px" }}>{rightActions}</div>
          )}
        </div>
      </div>

      {footer && <div className="wf-actions-row">{footer}</div>}
    </>
  )
}

export default { StepperHeader, PromptEditor, SplitResultView }
