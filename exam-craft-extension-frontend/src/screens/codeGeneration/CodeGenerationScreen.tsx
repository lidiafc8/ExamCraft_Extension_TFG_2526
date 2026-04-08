import React from "react"
import { Header } from "~src/components/Header"
import studentIcon from "~assets/images/student.png"
import teacherIcon from "~assets/images/teacher.png"

interface Props {
  readonly onBack: () => void
  readonly onWelcome: () => void
  readonly onCreateExamByParts: () => void
  readonly onExamCodeGeneration: () => void
  readonly onSolutionCodeGeneration: () => void
}

export default function CodeGenerationScreen({ onBack, onWelcome, onCreateExamByParts, onExamCodeGeneration, onSolutionCodeGeneration }: Props
) {
  
  const breadcrumbItems = [
      { label: 'INICIO', action: onWelcome },
      { label: 'CREAR EXAMEN', action: onBack },
      { label: 'POR PARTES', action: onCreateExamByParts },
  ];

  const currentTitle = "CÓDIGO";

  return (
    <div className="exam-app">
       
      <Header 
          onWelcome={onWelcome} 
          breadcrumbItems={breadcrumbItems} 
          currentStep={currentTitle} 
      />

      <main className="main-content">
        
        <h1 className="main-title">GENERACIÓN DE CÓDIGO</h1>
        
        <div className="subtitle-badge">
          Elige si quieres generar el código de un examen o bien el código de la solución del mismo
        </div>

        <div className="cards-container">
          
          <button className="action-card" onClick={onExamCodeGeneration}>
            <span className="exam-icon"><img src={studentIcon} alt="Icono estudiante" width="120" height="130" /></span> 
            <span className="card-label">Código examen</span>
          </button>

          <button className="action-card" onClick={onSolutionCodeGeneration}>
              <span className="archive-icon"><img src={teacherIcon} alt="Icono profesor" width="130" height="130" /></span>
            <span className="card-label">Código solución</span>
          </button>

        </div>

        <button onClick={onBack} className="btn-back">
            Volver
        </button>
      </main>

      
    </div>
  )
}