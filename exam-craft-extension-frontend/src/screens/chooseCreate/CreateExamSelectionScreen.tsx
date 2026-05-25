import React from "react"

import { Header } from "~src/components/Header"

import completeExamIcon from "../../../assets/images/complete_exam.png"
import partsExamIcon from "../../../assets/images/parts_exam.png"

interface Props {
  readonly onBack: () => void
  readonly onCreateExamByParts: () => void
}

export default function CreateExamScreen({
  onBack,
  onCreateExamByParts
}: Props) {
  return (
    <div className="exam-app">
      <Header
        onWelcome={onBack}
        breadcrumbItems={[{ label: "INICIO", action: onBack }]}
        currentStep="CREAR EXAMEN"
      />

      <main className="main-content">
        <h1 className="main-title">CREAR NUEVO EXAMEN</h1>

        <div className="subtitle-badge">
          Selecciona la modalidad de creación
        </div>

        <div className="cards-container">
          <button className="action-card" onClick={onCreateExamByParts}>
            <span className="parts-exam-icon">
              <img
                src={partsExamIcon}
                alt="Icono examen"
                className="card-icon"
              />
            </span>
            <span className="card-label">Crear examen por partes</span>
          </button>

          <button className="action-card disabled-card" disabled>
            <span className="complete-exam-icon">
              <img
                src={completeExamIcon}
                alt="Icono archivo"
                className="card-icon"
              />
            </span>
            <span className="card-label">Crear examen completo</span>
          </button>
        </div>

        <button onClick={onBack} className="btn-back">
          Volver
        </button>
      </main>
    </div>
  )
}
