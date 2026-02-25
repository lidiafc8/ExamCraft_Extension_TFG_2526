import React, { useState, useEffect } from "react"
import logoExamCraft from "../../assets/icon512.png"
import extensionPromptMarkdown from "bundle-text:../prompts/functional-extension-generation/generation_statement_functional_extension.md"
import { sendToGemini } from "../services/geminiService"
import { parseMasterPrompt } from "../utils/promptParser"

interface Props {
  domainName: string;
  onBack: () => void;
  onWelcome: () => void;
  onCreateExam: () => void;
  onCreateExamByParts: () => void;
  onFunctionalExtension: () => void;
  onGoToUML: (text) => void;
}

export default function DomainWorkflowScreen({ domainName, onBack, onWelcome, onCreateExam, onCreateExamByParts, onFunctionalExtension, onGoToUML }: Props) {
  const [currentStep, setCurrentStep] = useState(1);
  const [internalStep, setInternalStep] = useState<'input' | 'result'>('input');
  
  const [promptText, setPromptText] = useState("");
  const [hiddenContext, setHiddenContext] = useState("");

  const [responseText, setResponseText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  
  useEffect(() => {
    if (extensionPromptMarkdown) {
        const { visibleText, hiddenContext } = parseMasterPrompt(extensionPromptMarkdown);

        const finalVisible = visibleText.replaceAll("{{DOMAIN}}", domainName);
        
        setPromptText(finalVisible);    
        setHiddenContext(hiddenContext);
    }
  }, [domainName]);


  const handleGenerate = async () => {
    setIsLoading(true);
    setResponseText("");

    try {
        
        const finalPayload = `
        CONTEXTO Y RECURSOS (Información interna):
        ${hiddenContext}

        INSTRUCCIONES PRINCIPALES:
        ${promptText}
        `;

        console.log("Enviando a Gemini:", finalPayload);

        const result = await sendToGemini(finalPayload);
        
        setResponseText(result);
        setInternalStep('result');

    } catch (error) {
        console.error(error);
        alert("Error al generar.");
    } finally {
        setIsLoading(false);
    }
  };

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

                <span className="breadcrumb-link" onClick={onCreateExam}>
                CREAR EXAMEN
                </span>

                <span className="breadcrumb-separator">{'>'}</span>

                <span className="breadcrumb-link" onClick={onCreateExamByParts}>
                POR PARTES
                </span>

                <span className="breadcrumb-separator">{'>'}</span>

                <span className="breadcrumb-link" onClick={onFunctionalExtension}>
                    EXTENSIÓN FUNCIONAL
                </span>

                <span className="breadcrumb-separator">{'>'}</span>

                <span className="breadcrumb-current">
                {domainName.toUpperCase()}
                </span>
                
            </nav>
            </div>
      </header>

      <div className="main-content"> 
          <div className="wf-layout-container">
            <div className="stepper-container">
                <div className={`step-wrapper ${currentStep === 1 ? 'step-active' : 'step-completed'}`}>
                    <div className="step-circle">1</div>
                    <span className="step-label">Texto de enunciado</span>
                </div>
                <div className="step-line" style={{ background: currentStep === 2 ? '#4CAF50' : '#e0e0e0' }}></div>
                <div className={`step-wrapper ${currentStep === 2 ? 'step-active' : 'step-inactive'}`}>
                    <div className="step-circle">2</div>
                    <span className="step-label">Diagrama UML</span>
                </div>
            </div>

            <div className="wf-wide-wrapper">
                {currentStep === 1 && internalStep === 'input' && (
                    <div className="content-card" style={{ maxWidth: '800px', width: '100%' }}>
                        <h2 className="main-title small">{domainName.toUpperCase()}: Texto de enunciado</h2>
                        <p className="wf-instruction-text">
                            Este es el prompt que se usará para generar el texto del enunciado del examen, puede revisar o modificar cualquier información que vea conveniente. Al terminar, pulse en <strong>"Generar Enunciado"</strong>.
                        </p>                        
                        <textarea 
                            className="wf-textarea" 
                            value={promptText}
                            onChange={(e) => setPromptText(e.target.value)}
                        />
                        <div className="wf-actions-row">
                            <button onClick={onBack} className="btn-step secondary">Volver</button>
                            <button onClick={handleGenerate} className="btn-step primary">
                                {isLoading ? <div className="loading-spinner"></div> : 'Generar Enunciado'}
                            </button>
                        </div>
                    </div>
                )}

                {currentStep === 1 && internalStep === 'result' && (
                    <div className="wf-split-view">
                        <div className="wf-column">
                            <span className="wf-column-title">Prompt enviado</span>
                            <textarea 
                            className="wf-textarea" 
                            value={promptText}
                            onChange={(e) => setPromptText(e.target.value)}
                        />
                            <button onClick={handleGenerate} className="btn-step primary" disabled={isLoading}>
                                {isLoading ? '...' : 'Volver a generar'}
                            </button>
                        </div>
                        <div className="wf-column">
                            <span className="wf-column-title">Propuesta de texto de enunciado</span>
                            <div className="wf-result-box" style={{whiteSpace: 'pre-wrap'}}>
                                {isLoading ? 'Generando...' : responseText}
                            </div>
                            <button onClick={() => setCurrentStep(2)} className="btn-step primary">
                                Confirmar y Continuar
                            </button>
                        </div>
                    </div> 
                )}
                
                {currentStep === 1 && internalStep === 'result' && (
                     <div className="wf-actions-row" style={{ marginTop: '20px' }}>
                        <button onClick={() => setInternalStep('input')} className="btn-step secondary">Volver</button>
                    </div>
                )}

                {currentStep === 2 && (
                    <div className="content-card">
                        <h2 className="main-title small">Confirmación</h2>
                        <p className="wf-instruction-text">
                            ¿Está seguro que desea usar el texto de enunciado generado? Una vez confirmado, se generará el diagrama UML en base a él y no podrá modificarlo.                        </p> 
                        <div className="wf-actions-row">
                            <button onClick={() => setCurrentStep(1)} className="btn-step secondary">
                                Cancelar y seguir editando enunciado
                            </button>
                            <button onClick={() => onGoToUML(responseText)} className="btn-step success">
                                Confirmar y pasar al paso 2 (Diagrama UML)
                            </button>
                        </div>
                    </div>
                )}
            </div>
          </div>
      </div>
    </div>
  )
}