import React from "react"
import logoExamCraft from "../../assets/icon512.png"
import completeExamIcon from "../../assets/complete_exam.png"
import partsExamIcon from "../../assets/parts_exam.png"

interface Props {
  onBack: () => void
  onCreateExamByParts: () => void
}

export default function CreateExamScreen({ onBack, onCreateExamByParts }: Props) {
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
              INICIO {'>'} CREAR EXAMEN
          </span>
        </div>
        <div className="header-right">
        </div>
      </header>

      {/* --- CONTENIDO CENTRAL --- */}
      <main className="main-content">
        
        <h1 className="main-title">CREAR NUEVO EXAMEN</h1>
        
        <div className="subtitle-badge">
          Selecciona la modalidad de creación
        </div>

        <div className="cards-container">
          
          <button className="action-card" onClick={onCreateExamByParts}>
            <span className="parts-exam-icon"><img src={partsExamIcon} alt="Icono examen" width="110" height="110" /></span> 
            <span className="card-label">Crear examen por partes</span>
          </button>

          <button className="action-card">
              <span className="complete-exam-icon"><img src={completeExamIcon} alt="Icono archivo" width="110" height="110" /></span> {/* Icono carpeta */}
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