import React, { useState, useEffect } from "react"
import { Header } from "~src/components/Header"
import extensionPromptMarkdown from "bundle-text:../../prompts/functional-extension-generation/generation_statement_functional_extension.md"
import { sendToGemini } from "../../services/geminiService"
import { parseMasterPrompt } from "../../utils/promptParser"
import "../../css/WorkFlowParts.css"
import "../../css/CommonText.css"

declare var chrome: any;

interface Props {
  readonly domainName: string;
  readonly onBack: () => void;
  readonly onWelcome: () => void;
  readonly onCreateExam: () => void;
  readonly onCreateExamByParts: () => void;
  readonly onFunctionalExtension: () => void;
  readonly onCreateDiagram: (text: string) => void;
}

export default function ContextWorkflowScreen({ domainName, onBack, onWelcome, onCreateExam, onCreateExamByParts, onFunctionalExtension, onCreateDiagram }: Props) {
  const [currentStep, setCurrentStep] = useState(1);
  const [internalStep, setInternalStep] = useState<'input' | 'result'>('input');
  
  const [promptText, setPromptText] = useState("");
  const [hiddenContext, setHiddenContext] = useState("");

  const [responseText, setResponseText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [previousExtensions, setPreviousExtensions] = useState<string>("");

    useEffect(() => {
        if (globalThis.chrome?.storage?.local) {
            chrome.storage.local.get(null, (items) => {
            const extensions = Object.keys(items)
                .filter(key => key.startsWith('project_'))
                .map(key => items[key])
                .filter(project =>
                project.domainName?.toLowerCase() === domainName.toLowerCase() &&
                project.extensionFinish
                )
                .map((project, i) =>
                `# EXTENSIÓN FUNCIONAL PREVIA ${i + 1} (${project.customName || project.domainName})\n${project.extensionFinish}`
                )
                .join("\n\n");

            setPreviousExtensions(extensions);
            });
        }
        }, [domainName]);

  
  useEffect(() => {
    if (extensionPromptMarkdown) {
        const { visibleText, hiddenContext: parsedHidden } = parseMasterPrompt(extensionPromptMarkdown);

        const finalVisible = visibleText.replaceAll("{{DOMAIN}}", domainName);
        
        setPromptText(finalVisible);    
        setHiddenContext(parsedHidden);
    }
  }, [domainName]);


  const handleGenerate = async () => {
    setIsLoading(true);
    setResponseText("");

    try {
        const finalPayload = `
        CONTEXTO Y RECURSOS (Información interna):
        ${hiddenContext}

        [RECURSOS ESTÁTICOS Y EJEMPLOS]:
        ${hiddenContext}

        ${previousExtensions ? `[EXTENSIONES FUNCIONALES YA CREADAS PARA EL DOMINIO "${domainName}" - LA SOLUCIÓN DEVUELTA DEBERÁ EVITAR REPETIR ESTAS EXTENSIONES:\n
        ${previousExtensions}` : ""}

        INSTRUCCIONES PRINCIPALES:
        ${promptText}
        `;

        console.log("Enviando a Gemini:", finalPayload);

        const result = await sendToGemini(finalPayload);
        
        setResponseText(result);
        setInternalStep('result');

        try {
            await fetch("http://localhost:3001/save-log", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    exercise: "statement_functional_extension",
                    domain: domainName,
                    hiddenContext,
                    previousExtensions,
                    visiblePrompt: promptText,
                    response: result
                })
            });
            console.log("Log enviado al servidor local correctamente.");
        } catch (error) {
            console.warn("Servidor de logs apagado. El log no se guardó en el repo.", error);
        }

    } catch (error) {
        console.error(error);
        alert("Error al generar.");
    } finally {
        setIsLoading(false);
    }
  };

    const breadcrumbItems = [
        { label: 'INICIO', action: onWelcome },
        { label: 'CREAR EXAMEN', action: onCreateExam },
        { label: 'POR PARTES', action: onCreateExamByParts },
        { label: 'EXTENSIÓN FUNCIONAL', action: onFunctionalExtension },
    ];

  return (
    <div>
      <Header 
        onWelcome={onWelcome} 
        breadcrumbItems={breadcrumbItems} 
        currentStep={domainName.toUpperCase()} 
      />

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
                    <div className="content-card-wf">
                        <h2 className="main-title small">{domainName.toUpperCase()}: Texto de enunciado</h2>
                        <p className="wf-instruction-text">
                            Este es el prompt que se usará para generar el texto del enunciado del examen, puede revisar o modificar cualquier información que vea conveniente. Al terminar, pulse en <strong>"Generar Enunciado"</strong>.
                        </p>                        
                        <textarea 
                            className="wf-textarea-input" 
                            value={promptText}
                            onChange={(e) => setPromptText(e.target.value)}
                        />
                        <div className="wf-actions-row">
                            <button onClick={onBack} className="btn-back">Volver</button>
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
                            className="wf-textarea-input" 
                            value={promptText}
                            onChange={(e) => setPromptText(e.target.value)}
                        />
                            <button onClick={handleGenerate} className="btn-step primary" disabled={isLoading}>
                                {isLoading ? <div className="loading-spinner"></div> : 'Volver a generar'}
                            </button>
                        </div>
                        <div className="wf-column">
                            <span className="wf-column-title">Propuesta de texto de enunciado</span>
                            
                            {isLoading ? (
                                <div className="wf-result-box" >
                                    Generando...
                                </div>
                            ) : (
                                <textarea 
                                    className="wf-result-box"
                                    value={responseText}
                                    onChange={(e) => setResponseText(e.target.value)}
                                />
                            )}
                            
                            <button onClick={() => setCurrentStep(2)} className="btn-step success">
                                Confirmar y Continuar
                            </button>
                        </div>
                    </div> 
                )}
                
                {currentStep === 1 && internalStep === 'result' && (
                     <div className="wf-actions-row">
                        <button onClick={onBack} className="btn-back">Volver</button>
                    </div>
                )}

                {currentStep === 2 && (
                    <div className="content-card-wf">
                        <h2 className="main-title small">Confirmación</h2>
                        <p className="wf-instruction-text">
                            ¿Está seguro que desea usar el texto de enunciado generado? Una vez confirmado, se generará el diagrama UML en base a él y no podrá modificarlo.                        </p> 
                        <div className="wf-actions-row">
                            <button onClick={() => setCurrentStep(1)} className="btn-step secondary">
                                Cancelar y seguir editando enunciado
                            </button>
                            <button onClick={() => onCreateDiagram(responseText)} className="btn-step success">
                                Confirmar y pasar al paso 2  <br/>  (Diagrama UML)
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