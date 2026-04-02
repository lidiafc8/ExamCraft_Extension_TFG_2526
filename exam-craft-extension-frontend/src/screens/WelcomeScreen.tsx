import React from "react"
import logoExamCraft from "../../assets/icon512.png"
import examIcon from "../../assets/images/exam.png"
import archiveIcon from "../../assets/images/archive.png"

interface Props {
  readonly onStart: () => void
  readonly onCreateExam: () => void
  readonly onBack: () => void
  readonly onStorage: () => void
}

export default function WelcomeScreen({ onStart, onCreateExam, onBack, onStorage }: Props) {
  return (
    <div className="exam-app">
      
      {/* --- HEADER --- */}
      <header className="app-header">
        <div className="header-left">
          
          <span 
            className="logo-icon" 
            onClick={onBack} 
            style={{ cursor: 'pointer' }} 
            title="Volver al Inicio"
          >
            <img src={logoExamCraft} alt="Logo ExamCraft" width="60" height="60" />
          </span> 
          
          <span>
              INICIO
          </span>
        </div>
        <div className="header-right">
        </div>
      </header>

      {/* --- CONTENIDO CENTRAL --- */}
      <main className="main-content">
        
        <h1 className="main-title">¡BIENVENIDO A EXAMCRAFT!</h1>
        
        <div className="subtitle-badge">
          ¿Qué desea hacer?
        </div>

        <div className="cards-container">
          
          <button className="action-card" onClick={onCreateExam}>
            <span className="exam-icon"><img src={examIcon} alt="Icono examen" width="100" height="100" /></span> 
            <span className="card-label">Crear examen</span>
          </button>

          <button className="action-card" onClick={onStorage}>
              <span className="archive-icon"><img src={archiveIcon} alt="Icono archivo" width="100" height="100" /></span> {/* Icono carpeta */}
            <span className="card-label">Consultar exámenes <br/> anteriores</span>
          </button>

        </div>

      </main>

      <button onClick={onStart} className="btn-floating-github">
         GitHub Info
      </button>
    </div>
  )
}