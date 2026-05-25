import React from "react"

import { Header } from "~src/components/Header"

import "../../css/Vertical.css"

interface Props {
  readonly onBack: () => void
  readonly onWelcome: () => void
  readonly onCreateExamByParts: () => void
  readonly onFunctionalExtension: () => void
  readonly onAttributesConstraints: () => void
  readonly onEntityRelationships: () => void
}

export default function StatementPartSelectionScreen({
  onBack,
  onWelcome,
  onCreateExamByParts,
  onFunctionalExtension,
  onAttributesConstraints,
  onEntityRelationships
}: Props) {
  return (
    <div className="exam-app">
      <Header
        onWelcome={onWelcome}
        breadcrumbItems={[
          { label: "INICIO", action: onWelcome },
          { label: "CREAR EXAMEN", action: onBack },
          { label: "POR PARTES", action: onCreateExamByParts }
        ]}
        currentStep="ENUNCIADO"
      />

      <main className="main-content">
        <h1 className="main-title">GENERACIÓN DE ENUNCIADO</h1>

        <div className="subtitle-badge">
          ¿Qué parte del enunciado te gustaría generar primero?
        </div>

        <div className="vertical-menu-container">
          <button className="menu-btn" onClick={onFunctionalExtension}>
            Extensión funcional
          </button>

          <button className="menu-btn" onClick={onAttributesConstraints}>
            Restricciones de atributos
          </button>

          <button className="menu-btn" onClick={onEntityRelationships}>
            Relaciones entre entidades
          </button>
        </div>

        <button onClick={onBack} className="btn-back">
          Volver
        </button>
      </main>
    </div>
  )
}
