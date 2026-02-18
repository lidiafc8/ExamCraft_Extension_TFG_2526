import React from "react"
import logoExamCraft from "../../assets/icon512.png"

interface Props {
  onBack: () => void
  onWelcome: () => void
  onFunctionalExtension: () => void
}

export default function CreateExamByPartsScreen({ onBack, onWelcome, onFunctionalExtension }: Props) {
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
              INICIO {'>'} CREAR EXAMEN {'>'} POR PARTES
          </span>
        </div>
        <div className="header-right">
        </div>
      </header>

      {/* --- CONTENIDO CENTRAL --- */}
      <main className="main-content">
        
        <h1 className="main-title">CREAR EXAMEN POR PARTES</h1>
        
        <div className="subtitle-badge">
          ¿Qué parte le gustaría generar primero?
        </div>

        <div className="vertical-menu-container">
          
          <button className="menu-btn" onClick={onFunctionalExtension}>
            Extensión funcional
          </button>

          <button className="menu-btn">
            Restricciones de atributos
          </button>

          <button className="menu-btn">
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