import React from "react"

import archiveIcon from "../../../assets/images/archive.png"
import examIcon from "../../../assets/images/exam.png"

import "../../components/css/Header.css"
import "../../css/CommonText.css"
import "../../css/Cards.css"
import "./css/GitHub.css"

import { Header } from "~src/components/Header"

interface Props {
  readonly onStart: () => void
  readonly onCreateExam: () => void
  readonly onBack: () => void
  readonly onStorage: () => void
}

export default function WelcomeScreen({
  onStart,
  onCreateExam,
  onBack,
  onStorage
}: Props) {
  return (
    <div>
      <Header onWelcome={onBack} breadcrumbItems={[]} currentStep="INICIO" />

      <main className="main-content">
        <h1 className="main-title">¡BIENVENIDO A EXAMCRAFT!</h1>

        <div className="subtitle-badge">¿Qué desea hacer?</div>

        <div className="cards-container">
          <button className="action-card" onClick={onCreateExam}>
            <img src={examIcon} alt="Icono examen" className="card-icon" />
            <span className="card-label">Crear examen</span>
          </button>

          <button className="action-card" onClick={onStorage}>
            <img src={archiveIcon} alt="Icono archivo" className="card-icon" />
            <span className="card-label">Consultar exámenes anteriores</span>
          </button>
        </div>
      </main>

      <button onClick={onStart} className="btn-floating-github">
        GitHub Info
      </button>
    </div>
  )
}
