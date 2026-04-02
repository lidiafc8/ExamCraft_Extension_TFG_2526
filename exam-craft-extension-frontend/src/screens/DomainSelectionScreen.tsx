import React from "react"
import logoExamCraft from "../../assets/icon512.png"
import petClinic from "../../assets/images/petclinic.png"
import chess from "../../assets/images/chess.png"
import comingSoon from "../../assets/images/comingSoon.png"

interface Props {
  readonly onBack: () => void
  readonly onWelcome: () => void
  readonly onSelectDomain: (domainName: string) => void
  readonly onCreateExam: () => void
}

export default function FunctionalExtensionScreen({ onBack, onWelcome, onSelectDomain, onCreateExam }: Props) {
  return (
    <div className="exam-app">
      
      {/* --- HEADER --- */}   
      <header className="app-header">
        <div className="header-left">
              
                    <span className="logo-icon" onClick={onWelcome}>
                        <img src={logoExamCraft} alt="Logo" width="60" height="60" />
                    </span> 
                 
                    <nav className="breadcrumb-nav">
                        <span 
                            className="breadcrumb-link" 
                            onClick={onWelcome}
                            title="Volver al inicio"
                            >
                            INICIO
                        </span>
        
                        <span className="breadcrumb-separator">{'>'}</span>
        
                        <span className="breadcrumb-link" onClick={onCreateExam}>
                        CREAR EXAMEN
                        </span>
        
                        <span className="breadcrumb-separator">{'>'}</span>
        
                        <span className="breadcrumb-link" onClick={onBack}>
                        POR PARTES
                        </span>
        
                        <span className="breadcrumb-separator">{'>'}</span>
        
                        <span className="breadcrumb-current">
                        EXTENSIÓN FUNCIONAL
                        </span>
                        
                    </nav>
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

          <button className="action-card">
              <span className="soon-icon"><img src={comingSoon} alt="Icono comingSoon" width="120" height="120" /></span>
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