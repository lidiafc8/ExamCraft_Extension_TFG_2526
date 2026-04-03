import React from "react"
import { Header } from "~src/components/Header"

interface Props {
  readonly onBack: () => void
  readonly onWelcome: () => void
  readonly onGenerateTest: () => void
  readonly onCreateExamByParts: () => void
  readonly onGenerateBaseClasses: () => void
}

export default function CreateExamByPartsScreen({ onBack, onWelcome, onGenerateTest, onCreateExamByParts, onGenerateBaseClasses }: Props
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
          Elige la parte del código que quieres generar primero
        </div>

        <div className="vertical-menu-container">

          <button className="menu-btn" onClick={onGenerateBaseClasses}>
            Generación clases base
          </button>

          <button className="menu-btn" onClick={onGenerateTest}>
            Generación tests
          </button>

        </div>

        <button onClick={onBack} className="btn-back">
            Volver
        </button>
      </main>

      
    </div>
  )
}