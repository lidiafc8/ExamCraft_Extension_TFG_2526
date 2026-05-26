import React from "react"

import { Header } from "~src/components/Header"

import chess from "../../../assets/images/chess.png"
import comingSoon from "../../../assets/images/comingSoon.png"
import petClinic from "../../../assets/images/petclinic.png"

interface Props {
  readonly onBack: () => void
  readonly onWelcome: () => void
  readonly onSelectDomain: (domainName: string) => void
  readonly onCreateExam: () => void
  readonly onCreateExamByParts: () => void
}

export default function FunctionalExtensionScreen({
  onBack,
  onWelcome,
  onSelectDomain,
  onCreateExam,
  onCreateExamByParts
}: Props) {
  const breadcrumbItems = [
    { label: "INICIO", action: onWelcome },
    { label: "CREAR EXAMEN", action: onCreateExam },
    { label: "POR PARTES", action: onCreateExamByParts },
    { label: "ENUNCIADO", action: onBack }
  ]

  const currentTitle = "EXTENSIÓN FUNCIONAL"

  return (
    <div className="exam-app">
      <Header
        onWelcome={onWelcome}
        breadcrumbItems={breadcrumbItems}
        currentStep={currentTitle}
      />

      <main className="main-content">
        <h1 className="main-title">CREAR EXTENSIÓN FUNCIONAL</h1>

        <div className="subtitle-badge">
          Selecciona un dominio de todos los disponibles para generar la
          extensión funcional
        </div>

        <div className="cards-container">
          <button
            className="action-card"
            onClick={() => onSelectDomain("Clínica Veterinaria")}>
            <span className="petclinic-icon">
              <img
                src={petClinic}
                alt="Icono clínica veterinaria"
                className="card-icon"
              />
            </span>
            <span className="card-label">Clínica Veterinaria</span>
          </button>

          <button
            className="action-card"
            onClick={() => onSelectDomain("Ajedrez")}>
            <span className="chess-icon">
              <img src={chess} alt="Icono ajedrez" className="card-icon" />
            </span>
            <span className="card-label">Ajedrez</span>
          </button>

          <button className="action-card disabled-card" disabled>
            <span className="soon-icon">
              <img
                src={comingSoon}
                alt="Icono comingSoon"
                className="card-icon"
              />
            </span>
            <span className="card-label">Crear nuevo dominio</span>
          </button>
        </div>

        <button onClick={onBack} className="btn-back">
          Volver
        </button>
      </main>
    </div>
  )
}
