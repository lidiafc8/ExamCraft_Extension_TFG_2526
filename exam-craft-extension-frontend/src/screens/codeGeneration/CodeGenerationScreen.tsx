import React from "react"
import logoExamCraft from "../../../assets/icon512.png"

interface Props {
  readonly onBack: () => void
  readonly onWelcome: () => void
  readonly onGenerateTest: () => void
  readonly onCreateExamByParts: () => void
  readonly onGenerateBaseClasses: () => void
}

export default function CreateExamByPartsScreen({ onBack, onWelcome, onGenerateTest, onCreateExamByParts, onGenerateBaseClasses }: Props) {
  return (
    <div className="exam-app">
       
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

                <span className="breadcrumb-link" onClick={onBack}>
                CREAR EXAMEN
                </span>

                <span className="breadcrumb-separator">{'>'}</span>

                <span className="breadcrumb-link" onClick={onCreateExamByParts}>
                POR PARTES
                </span>

                <span className="breadcrumb-separator">{'>'}</span>

                <span className="breadcrumb-current">
                CÓDIGO
                </span>
                
            </nav>
            </div>
        <div className="header-right">
        </div>
      </header>

      <main className="main-content">
        
        <h1 className="main-title">GENERACIÓN DE CÓDIGO</h1>
        
        <div className="subtitle-badge">
          Elige la parte del código que quieres generar primero
        </div>

        <div className="vertical-menu-container">

          <button className="menu-btn" onClick={onGenerateTest}>
            Generación tests
          </button>

          <button className="menu-btn" onClick={onGenerateBaseClasses}>
            Generación clases base
          </button>

        </div>

        <button onClick={onBack} className="btn-back">
            Volver
        </button>
      </main>

      
    </div>
  )
}