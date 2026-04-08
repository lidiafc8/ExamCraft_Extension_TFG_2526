import React, { useState, useEffect } from "react"
import logoExamCraft from "../../assets/icon512.png"
import extensionPromptMarkdown from "bundle-text:../prompts/functional-extension-generation/generation_UML_diagram_functional_extension.md"
import { sendToGemini } from "../services/geminiService"
import { parseMasterPrompt } from "../utils/promptParser"
import { MermaidDiagram } from "../components/MermaidDiagram"

interface Props {
  domainName: string;
  statementText: string;
  onBack: () => void;
  onWelcome: () => void;
  onCreateExam: () => void;
  onCreateExamByParts: () => void;
  onFunctionalExtension: () => void;
  onStatementStep1: () => void;
  onGoToUML: (finalText: string) => void;
  finishFunctionalExtension: (finalText: string) => void;
}

export default function CreateExamExtensionStep2Screen({ 
  domainName, 
  statementText, 
  onBack, 
  onWelcome, 
  onCreateExam, 
  onCreateExamByParts, 
  onFunctionalExtension, 
  onGoToUML,
  onStatementStep1,
  finishFunctionalExtension 
}: Props) {
  const [currentStep, setCurrentStep] = useState(2);
  const [internalStep, setInternalStep] = useState<'input' | 'result'>('input');
  
  const [promptText, setPromptText] = useState("");
  const [hiddenContext, setHiddenContext] = useState("");

  const [responseText, setResponseText] = useState("");
  const [cleanedCode, setCleanedCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // ESTADO PARA EL MODAL
  const [isModalOpen, setIsModalOpen] = useState(false);

  const cleanMermaidCode = (text: string) => {
    if (!text) return "";

    let code = text.replace(/```(?:mermaid)?\s*([\s\S]*?)\s*```/, "$1"); // NOSONAR javascript:S5852

    if (code === text) {
      code = text.replace(/```mermaid/gi, "").replace(/```/g, "");
    }

    const startKeywordIndex = code.search(/classDiagram|graph|stateDiagram|erDiagram/);
    if (startKeywordIndex !== -1) {
      code = code.substring(startKeywordIndex);
    }

    // eliminar definiciones de estilos 
    code = code.replace(/^\s*classDef.*$/gm, ""); // NOSONAR javascript:S5852

    // eliminar solo asignaciones de estilos (class X redClass)
    code = code.replace(/^\s*class\s+\w+\s+\w+\s*$/gm, ""); // NOSONAR javascript:S5852

    // eliminar estilos de nodos o enlaces
    code = code.replace(/^\s*(style|linkStyle).*$/gm, ""); // NOSONAR javascript:S5852

    // eliminar propiedades de color
    code = code.replace(/fill:\s*[^,;]+/gi, "");
    code = code.replace(/stroke:\s*[^,;]+/gi, "");
    code = code.replace(/color:\s*[^,;]+/gi, "");
    code = code.replace(/#[0-9a-fA-F]{3,6}/g, "");

    // limpiar líneas vacías
    code = code.replace(/\n\s*\n/g, "\n");

    return code.trim();
  };

  useEffect(() => {
    if (extensionPromptMarkdown) {
      const { visibleText, hiddenContext } = parseMasterPrompt(extensionPromptMarkdown);
      const finalVisible = visibleText.replaceAll("{{DOMAIN}}", domainName);
      setPromptText(finalVisible);    
      setHiddenContext(hiddenContext);
    }
  }, [domainName]);

  useEffect(() => {
    if (responseText) {
        setCleanedCode(cleanMermaidCode(responseText));
    }
  }, [responseText]);

  const handleGenerate = async () => {
    setIsLoading(true);
    setResponseText("");
    setCleanedCode(""); 
    try {
      const finalPayload = `
        CONTEXTO Y RECURSOS (Información interna):
        ${hiddenContext}
        INSTRUCCIONES PRINCIPALES:
        ${promptText}
      `;
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
          <span className="logo-icon" onClick={onWelcome} style={{cursor: 'pointer'}}>
            <img src={logoExamCraft} alt="Logo" width="60" height="60" />
          </span> 
          <nav className="breadcrumb-nav">
            <span className="breadcrumb-link" onClick={onWelcome}>INICIO</span>
            <span className="breadcrumb-separator">{'>'}</span>
            <span className="breadcrumb-link" onClick={onCreateExam}>CREAR EXAMEN</span>
            <span className="breadcrumb-separator">{'>'}</span>
            <span className="breadcrumb-link" onClick={onCreateExamByParts}>POR PARTES</span>
            <span className="breadcrumb-separator">{'>'}</span>
            <span className="breadcrumb-link" onClick={onFunctionalExtension}>EXTENSIÓN FUNCIONAL</span>
            <span className="breadcrumb-separator">{'>'}</span>
            <span className="breadcrumb-link" onClick={onStatementStep1}>{domainName.toUpperCase()}</span>
            <span className="breadcrumb-separator">{'>'}</span>
            <span className="breadcrumb-current">DIAGRAMA UML</span>
          </nav>
        </div>
      </header>

      <main className="main-content"> 
        <div className="wf-layout-container">
            <div className="stepper-container">
                <div className={`step-wrapper step-completed`}>
                    <div className="step-circle">1</div>
                    <span className="step-label">Texto de enunciado</span>
                </div>
                <div className="step-line" style={{ background: '#4CAF50' }}></div>
                <div className={`step-wrapper step-active`}>
                    <div className="step-circle">2</div>
                    <span className="step-label">Diagrama UML</span>
                </div>
            </div>

            <div className="wf-wide-wrapper">
                {internalStep === 'input' && (
                <div className="content-card" style={{ maxWidth: '800px', width: '100%', margin: '0 auto' }}>
                    <h2 className="main-title small">{domainName.toUpperCase()}: Diagrama UML</h2>
                    <textarea 
                      className="wf-textarea" 
                      value={promptText}
                      onChange={(e) => setPromptText(e.target.value)}
                    />
                    <div className="wf-actions-row">
                        <button onClick={onBack} className="btn-step secondary">Volver</button>
                        <button onClick={handleGenerate} className="btn-step primary" disabled={isLoading}>
                            {isLoading ? 'Generando...' : 'Generar Diagrama UML'}
                        </button>
                    </div>
                </div>
                )}

                {internalStep === 'result' && (
                  <div style={{ display: 'flex', gap: '20px', width: '100%', alignItems: 'stretch' }}>
                    
                    {/* Columna 1 */}
                    <div className="wf-column" style={{ flex: '1' }}>
                        <span className="wf-column-title">Prompt enviado</span>
                        <textarea 
                          className="wf-textarea" 
                          value={promptText} 
                          readOnly 
                          style={{ height: '350px' }}
                        />
                        <button onClick={handleGenerate} className="btn-step primary" disabled={isLoading} style={{ width: '100%' }}>
                            {isLoading ? 'Generando...' : 'Volver a generar'}
                        </button>
                    </div>

                    {/* Columna 2: Visualización con funcionalidad de Modal */}
                    <div className="wf-column" style={{ flex: '1.5' }}>
                      <span className="wf-column-title">Extensión funcional (Click para ampliar)</span>
                      
                      <div 
                        className="wf-result-box" 
                        onClick={() => cleanedCode && setIsModalOpen(true)}
                        style={{ 
                          backgroundColor: '#ffffff', 
                          border: '1px solid #e0e0e0', 
                          borderRadius: '8px', 
                          minHeight: '350px', 
                          maxHeight: '500px', 
                          display: 'flex', 
                          flexDirection: 'column', 
                          overflow: 'auto', 
                          padding: '15px',
                          cursor: cleanedCode ? 'zoom-in' : 'default' 
                        }}
                      >
                        <div style={{ paddingBottom: '15px', marginBottom: '15px', borderBottom: '1px solid #eee', whiteSpace: 'pre-wrap', fontSize: '14px', color: '#333' }}>
                          <strong>Enunciado Base:</strong>{"\n"}
                          {statementText || <em>No se ha proporcionado el texto.</em>}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexGrow: 1, minHeight: '200px' }}>
                          {isLoading ? (
                            <div className="loading-container">Generando diagrama...</div>
                          ) : (
                            cleanedCode ? <MermaidDiagram chartCode={cleanedCode} /> : <span>Esperando código...</span>
                          )}
                        </div>
                      </div>
                      
                      <button onClick={() => finishFunctionalExtension(cleanedCode)} className="btn-step primary" style={{ marginTop: '15px', width: '100%' }}>
                        Confirmar Diagrama
                      </button>
                    </div> 

                    {/* Columna 3 */}
                    <div className="wf-column" style={{ flex: '1' }}>
                        <span className="wf-column-title">Código Mermaid</span>
                        <textarea 
                          className="wf-textarea" 
                          value={responseText} 
                          readOnly 
                          style={{ height: '350px', backgroundColor: '#f5f5f5', color: '#555', fontFamily: 'monospace' }} 
                        />
                    </div>
                  </div>
                )}

                {internalStep === 'result' && !isLoading && (
                  <div className="wf-actions-row" style={{ marginTop: '20px', justifyContent: 'center' }}>
                    <button onClick={() => setInternalStep('input')} className="btn-step secondary">Volver al Prompt</button>
                  </div>
                )}
            </div>
        </div>
      </main>

      {/* --- MODAL DE AMPLIACIÓN --- */}
      {isModalOpen && (
        <div 
          onClick={() => setIsModalOpen(false)}
          style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1000,
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            cursor: 'zoom-out'
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'white', padding: '30px', borderRadius: '12px',
              maxWidth: '90%', maxHeight: '90%', overflow: 'auto',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)', position: 'relative'
            }}
          >
            <button 
              onClick={() => setIsModalOpen(false)}
              style={{
                position: 'absolute', top: '10px', right: '10px',
                border: 'none', background: '#333', color: 'white',
                borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer'
              }}
            >✕</button>
            <div style={{ transform: 'scale(1.2)', transformOrigin: 'top center', padding: '20px' }}>
               <MermaidDiagram chartCode={cleanedCode} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}