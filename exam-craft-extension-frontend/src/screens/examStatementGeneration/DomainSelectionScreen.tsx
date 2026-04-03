import React from "react"
import logoExamCraft from "../../../assets/icon512.png"
import petClinic from "../../../assets/images/petclinic.png"
import chess from "../../../assets/images/chess.png"
import comingSoon from "../../../assets/images/comingSoon.png"

interface Props {
  readonly onBack: () => void
  readonly onWelcome: () => void
  readonly onSelectDomain: (domainName: string) => void
  readonly onCreateExam: () => void
}

export default function FunctionalExtensionScreen({ onBack, onWelcome, onSelectDomain, onCreateExam }: Props) {
  const breadcrumbButtonStyle: React.CSSProperties = {
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    margin: 0,
                    font: 'inherit',
                    color: '#4a3728',
                    cursor: 'pointer',
                    display: 'inline',
                    outline: 'none'
                };
  
  const breadcrumbItems = [
      { label: 'INICIO', action: onWelcome },
      { label: 'CREAR EXAMEN', action: onCreateExam },
      { label: 'POR PARTES', action: onBack },
  ];

  return (
    <div className="exam-app">
      
      {/* --- HEADER --- */}   
      <header className="app-header">
        <div className="header-left">
              
          <button 
              type="button"
              className="logo-icon" 
              onClick={onWelcome} 
              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', outline: 'none' }}
              aria-label="Ir a inicio"
          >
              <img src={logoExamCraft} alt="Logo ExamCraft" width="60" height="60" />
          </button>
          
          <nav className="breadcrumb-nav">
              {breadcrumbItems.map((item) => (
                  <React.Fragment key={item.label}>
                      <button type="button" style={breadcrumbButtonStyle} onClick={item.action}>
                          {item.label}
                      </button>
                      <span className="breadcrumb-separator">{' > '}</span>
                  </React.Fragment>
              ))}
              <span className="breadcrumb-current">EXTENSIÓN FUNCIONAL</span>
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