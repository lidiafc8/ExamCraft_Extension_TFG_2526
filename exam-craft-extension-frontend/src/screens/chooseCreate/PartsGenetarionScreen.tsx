import React from "react"
import { Header } from "~src/components/Header"
import "../../css/Vertical.css"

interface Props {
  readonly onBack: () => void
  readonly onWelcome: () => void
  readonly onPartsGeneration: () => void
  readonly onFunctionalExtension: () => void
  readonly onAttributesConstraints: () => void
  readonly onEntityRelationships: () => void
}

export default function CreateExamByPartsScreen({ onBack, onWelcome, onFunctionalExtension, onAttributesConstraints, onEntityRelationships, onPartsGeneration }: Props) {
  return (
    <div className="exam-app">
       
      <Header
        onWelcome={onWelcome}
        breadcrumbItems={[
            { label: 'INICIO',        action: onWelcome },
            { label: 'CREAR EXAMEN',  action: onBack },
            { label: 'POR PARTES',  action: onPartsGeneration },
        ]}
        currentStep="COMPONENTES"
      />

      <main className="main-content">
        
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

        </div>

        <button onClick={onBack} className="btn-back">
            Volver
        </button>
      </main>
    </div>
  )
}
