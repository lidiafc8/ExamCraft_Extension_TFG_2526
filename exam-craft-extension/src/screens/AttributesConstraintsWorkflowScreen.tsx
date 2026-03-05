import React from "react"
import logoExamCraft from "../../assets/icon512.png"

interface Props {
  onBack: () => void
  onWelcome: () => void
  onCreateExam: () => void
}

export default function AttributesConstraintsWorkflowScreen({ onBack, onWelcome, onCreateExam }: Props) {
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
                        RESTRICCIONES DE ATRIBUTOS
                        </span>
                        
                    </nav>
                    </div>
        <div className="header-right">
        </div>
      </header>

      {/* --- CONTENIDO CENTRAL --- */}
      <main className="main-content">

        <div className="content-card">
          <h2 className="main-title small">¡ATENCIÓN!</h2>
            <p className="wf-instruction-text">Para generar el ejercicio "Restricciones de Atributos" es necesario elegir un examen ya creado y almacenado previamente en el sistema, ¿desea continuar?</p>              
              <div className="wf-actions-row">
                <button onClick={() => onBack()} className="btn-step secondary">
                  No, volver
                </button>
                <button className="btn-step success">
                  Si, proceder a la selección
                </button>
              </div>
        </div>
      </main>      
    </div>
  )
}