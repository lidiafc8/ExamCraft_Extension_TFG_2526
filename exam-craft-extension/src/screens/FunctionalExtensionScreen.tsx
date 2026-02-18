import React from "react"
import logoExamCraft from "../../assets/icon512.png"
import petClinic from "../../assets/petclinic.png"
import chess from "../../assets/chess.png"

interface Props {
  onBack: () => void
  onWelcome: () => void
  onSelectDomain: (domainName: string) => void
}

export default function FunctionalExtensionScreen({ onBack, onWelcome, onSelectDomain }: Props) {
  return (
    <div className="exam-app">
      
      {/* --- HEADER --- */}   
      <header className="app-header">
        <div className="header-left">
          
          <span 
            className="logo-icon" 
            onClick={onWelcome} 
            style={{ cursor: 'pointer' }} 
            title="Volver al Inicio"
          >
            <img src={logoExamCraft} alt="Logo ExamCraft" width="60" height="60" />
          </span> 
          
          <span>
              INICIO {'>'} CREAR EXAMEN {'>'} POR PARTES {'>'} EXTENSIÓN FUNCIONAL
          </span>
        </div>
        <div className="header-right">
        </div>
      </header>

      {/* --- CONTENIDO CENTRAL --- */}
      <main className="main-content">
        
        <h1 className="main-title">CREAR EXTENSIÓN FUNCIONAL</h1>
        
        <div className="subtitle-badge">
          Selecciona un dominio de todos los disponibles para generar la extensión funcional
        </div>

        <div className="cards-container">
          
          <button className="action-card" onClick={() => onSelectDomain("Clínica Veterinaria")}>
            <span className="petclinic-icon"><img src={petClinic} alt="Icono clínica veterinaria" width="110" height="110" /></span> 
            <span className="card-label">Clínica Veterinaria</span>
          </button>

          <button className="action-card" onClick={() => onSelectDomain("Ajedrez")}>
              <span className="chess-icon"><img src={chess} alt="Icono ajedrez" width="120" height="120" /></span>
            <span className="card-label">Ajedrez</span>
          </button>

        </div>

        <button onClick={onBack} className="btn-back">
            Volver
        </button>
      </main>

      
    </div>
  )
}