import React from "react"
import { Header } from "~src/components/Header"

interface Props {
  readonly onBack: () => void
  readonly onWelcome: () => void
  readonly onCreateExamByParts: () => void
  readonly onGenerateAttributesConstraintsSolutionCode: () => void
  readonly onGenerateEntityRelationshipsSolutionCode: () => void
  readonly onCodeGeneration: () => void
  
}

export default function SolutionCodeGenerationScreen({ onBack, onWelcome, onCreateExamByParts, onGenerateAttributesConstraintsSolutionCode, onGenerateEntityRelationshipsSolutionCode, onCodeGeneration }: Props
) {
  
  const breadcrumbItems = [
      { label: 'INICIO', action: onWelcome },
      { label: 'CREAR EXAMEN', action: onBack },
      { label: 'POR PARTES', action: onCreateExamByParts },
      { label: 'CÓDIGO', action: onCodeGeneration },
  ];

  const currentTitle = "SOLUCIÓN";

  return (
    <div className="exam-app">
       
      <Header 
          onWelcome={onWelcome} 
          breadcrumbItems={breadcrumbItems} 
          currentStep={currentTitle} 
      />

      <main className="main-content">
        
        <h1 className="main-title">GENERACIÓN DE CÓDIGO SOLUCIÓN</h1>
        
        <div className="subtitle-badge">
          Elige la parte del código que quieres generar primero
        </div>

        <div className="vertical-menu-container">

          <button className="menu-btn" onClick={onGenerateAttributesConstraintsSolutionCode}>
            Solución Restricción de atributos
          </button>

          <button className="menu-btn" onClick={onGenerateEntityRelationshipsSolutionCode}>
            Solución Relaciones entre entidades
          </button>

        </div>

        <button onClick={onBack} className="btn-back">
            Volver
        </button>
      </main>

      
    </div>
  )
}