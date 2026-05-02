import React from "react"
import { Header } from "~src/components/Header"
import "../../css/Vertical.css"
import statementIcon from "../../../assets/images/statement.png"
import codeIcon from "../../../assets/images/code.png"

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

         <div className="cards-container">
          
          <button className="action-card" onClick={onComponents}>
            <span className="parts-exam-icon"><img src={statementIcon} alt="Icono examen" className="card-icon" /></span> 
            <span className="card-label">Enunciado</span>
          </button>

          <button className="action-card" onClick={onCodeGeneration}>
              <span className="complete-exam-icon"><img src={codeIcon} alt="Icono archivo" className="card-icon" /></span>
            <span className="card-label">Código</span>
          </button>

        </div>

        <button onClick={onBack} className="btn-back">
            Volver
        </button>
      </main>
    </div>
  )
}
