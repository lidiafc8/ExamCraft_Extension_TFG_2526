import React from "react"
import logoExamCraft from "../../../assets/icon512.png"

interface Props {
  readonly onBack: () => void
  readonly onWelcome: () => void
  readonly onGenerateTest: () => void
  readonly onCreateExamByParts: () => void
  readonly onGenerateBaseClasses: () => void
}

export default function CreateExamByPartsScreen({ onBack, onWelcome, onGenerateTest, onCreateExamByParts, onGenerateBaseClasses }: Props
) {
  const breadcrumbButtonStyle: React.CSSProperties = {
          background: 'none',
          border: 'none',
          padding: 0,
          margin: 0,
          font: 'inherit',
          color: '#4a3728',
          cursor: 'pointer',
          display: 'inline',
          outline: 'none'
      };
  const breadcrumbItems = [
      { label: 'INICIO', action: onWelcome },
      { label: 'CREAR EXAMEN', action: onBack },
      { label: 'POR PARTES', action: onCreateExamByParts },
  ];

  return (
    <div className="exam-app">
       
      <header className="app-header">
        <div className="header-left">
      
            <button 
                type="button"
                className="logo-icon" 
                onClick={onWelcome} 
                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', outline: 'none' }}
                aria-label="Ir a inicio"
            >
                <img src={logoExamCraft} alt="Logo ExamCraft" width="60" height="60" />
            </button>
         
            <nav className="breadcrumb-nav">
                {breadcrumbItems.map((item) => (
                    <React.Fragment key={item.label}>
                        <button type="button" style={breadcrumbButtonStyle} onClick={item.action}>
                            {item.label}
                        </button>
                        <span className="breadcrumb-separator">{' > '}</span>
                    </React.Fragment>
                ))}
                <span className="breadcrumb-current">CÓDIGO</span>
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