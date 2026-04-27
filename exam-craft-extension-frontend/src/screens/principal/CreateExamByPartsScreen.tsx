import React from "react"
import logoExamCraft from "../../../assets/icon512.png"

interface Props {
  readonly onBack: () => void
  readonly onWelcome: () => void
  readonly onFunctionalExtension: () => void
  readonly onAttributesConstraints: () => void
  readonly onEntityRelationships: () => void
  readonly onCodeGeneration: () => void
}

export default function CreateExamByPartsScreen({ onBack, onWelcome, onFunctionalExtension, onAttributesConstraints,onEntityRelationships, onCodeGeneration }: Props) {
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

                <span className="breadcrumb-current">
                POR PARTES
                </span>
                
            </nav>
            </div>
        <div className="header-right">
        </div>
      </header>

      <main className="main-content" style={{ overflowY: 'auto', paddingBottom: '40px', paddingTop: '100px' }}>
        
        <h1 className="main-title">CREAR EXAMEN POR PARTES</h1>
        
        <div className="subtitle-badge">
          ¿Qué parte te gustaría generar primero?
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

          <button className="menu-btn1" onClick={onCodeGeneration}>
            Generación de código
          </button>

        </div>

        <button onClick={onBack} className="btn-back">
            Volver
        </button>
      </main>

      
    </div>
  )
}
