import React from "react"

import { Header } from "~src/components/Header"

interface Props {
  readonly onBack: () => void
  readonly onWelcome: () => void
  readonly onCreateExamByParts: () => void
  readonly onGenerateBaseClasses: (project: any) => void
  readonly onGenerateTest: () => void
  readonly onGenerateSolutionCode: () => void
}

export default function CodeSelectionGenerateScreen({
  onBack,
  onWelcome,
  onCreateExamByParts,
  onGenerateBaseClasses,
  onGenerateTest,
  onGenerateSolutionCode
}: Props) {
  const breadcrumbItems = [
    { label: "INICIO", action: onWelcome },
    { label: "CREAR EXAMEN", action: onBack },
    { label: "POR PARTES", action: onCreateExamByParts }
  ]

  const currentTitle = "CÓDIGO"

  return (
    <div className="exam-app">
      <Header
        onWelcome={onWelcome}
        breadcrumbItems={breadcrumbItems}
        currentStep={currentTitle}
      />

      <main className="main-content">
        <h1 className="main-title">GENERACIÓN DE CÓDIGO</h1>

        <div className="subtitle-badge">
          ¿Qué parte de código te gustaría generar primero?
        </div>

        <div className="vertical-menu-container">
          <button className="menu-btn" onClick={onGenerateBaseClasses}>
            Clases base
          </button>

          <button className="menu-btn" onClick={onGenerateTest}>
            Tests
          </button>

          <button className="menu-btn" onClick={onGenerateSolutionCode}>
            Solución
          </button>
        </div>

        <button onClick={onBack} className="btn-back">
          Volver
        </button>
      </main>
    </div>
  )
}
