import React from "react"
import { Header } from "~src/components/Header"
import "../../css/Vertical.css"

interface Props {
  readonly onBack: () => void
  readonly onWelcome: () => void
  readonly onCodeGeneration: () => void
  readonly onComponents: () => void
}

export default function CreateExamByPartsScreen({ onBack, onWelcome, onCodeGeneration, onComponents  }: Props) {
  return (
    <div>
       
      <Header
        onWelcome={onWelcome}
        breadcrumbItems={[
            { label: 'INICIO',        action: onWelcome },
            { label: 'CREAR EXAMEN',  action: onBack },
        ]}
        currentStep="POR PARTES"
      />

      <main className="main-content">
        
        <h1 className="main-title">CREAR EXAMEN POR PARTES</h1>
        
        <div className="subtitle-badge">
          ¿Qué parte te gustaría generar primero?
        </div>

        <div className="vertical-menu-container">

          <button className="menu-btn1" onClick={onComponents}>
            Generación de las partes 
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
