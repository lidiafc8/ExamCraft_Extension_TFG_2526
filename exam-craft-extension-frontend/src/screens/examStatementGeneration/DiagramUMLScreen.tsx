import React, { useState, useEffect } from "react"
import extensionPromptMarkdown from "bundle-text:../../prompts/functional-extension-generation/generation_UML_diagram_functional_extension.md"
import { sendToGemini } from "../../services/geminiService"
import { parseMasterPrompt } from "../../utils/promptParser"
import { MermaidViewer } from "../../components/MermaidViewer"
import { Header } from "~src/components/Header"

interface Props {
  readonly domainName: string;
  readonly context: string;
  readonly onBack: () => void;
  readonly onWelcome: () => void;
  readonly onCreateExam: () => void;
  readonly onCreateExamByParts: () => void;
  readonly onFunctionalExtension: () => void;
  readonly onStatementStep1: () => void;
  readonly onFinishExtension: (text:string) => void;
}

export default function DiagramUMLScreen({ 
  domainName, 
  context,
  onBack, 
  onWelcome, 
  onCreateExam, 
  onCreateExamByParts, 
  onFunctionalExtension, 
  onStatementStep1,
  onFinishExtension
}: Props) {

    const [internalStep, setInternalStep] = useState<'input' | 'result'>('input');
    const [promptText, setPromptText] = useState("");
    
    // esto es lo que ve el usuario
    const [hiddenContext, setHiddenContext] = useState("");

    // esto es en bruto lo que devuelve la IA (se muestra en la columna de código)
    const [responseText, setResponseText] = useState("");

    // esto es el código ya limpio que se pasa al MermaidViewer
    const [cleanCode, setCleanCode] = useState("");

    // esto para que se muestre que se está cargando
    const [isLoading, setIsLoading] = useState(false);

    // esto es para unir el codigo mermaid con el contexto del enunciado
    const [extensionComplete, setExtensionComplete] = useState("");

    // se ejecuta al principio, y cuando se cambia el enunciado
    useEffect(() => {
        if (extensionPromptMarkdown && domainName) {
            const { visibleText, hiddenContext } = parseMasterPrompt(extensionPromptMarkdown);
            
            const finalVisible = visibleText.replaceAll("{{DOMAIN}}", domainName);
            
            setPromptText(finalVisible);    
            setHiddenContext(hiddenContext);
        }
    }, [context, domainName]);

    const handleGenerate = async () => {
        setIsLoading(true);
        setResponseText("");
        setCleanCode("");
        try {
            const finalPayload = `
            CONTEXTO Y RECURSOS (Información interna):
            ${hiddenContext}

            ENUNCIADO / EXTENSIÓN FUNCIONAL (Sobre lo que tienes que hacer el diagrama):
            ${context}

            INSTRUCCIONES PRINCIPALES:
            ${promptText}
        `;
            const result = await sendToGemini(finalPayload);

            // 1. Quitamos las etiquetas de bloque de código markdown
            let cleanResult = result.replaceAll(/```mermaid/g, "").replaceAll(/```/g, "");

            // 2. Buscamos dónde empieza realmente el diagrama
            const diagramMatch = cleanResult.match(/(classDiagram|graph|sequenceDiagram|erDiagram|stateDiagram|kanban)[\s\S]*/);
            
            if (diagramMatch) {
                cleanResult = diagramMatch[0].trim();
            } else {
                cleanResult = cleanResult.trim();
            }

            cleanResult = cleanResult
                .replaceAll('\\n', '\n')
                .replaceAll('\\"', '"')
                .replaceAll("\\'", "'")

            // Guardamos el código limpio en ambos estados:
            // - responseText: para mostrarlo en la columna de "Código Mermaid"
            // - cleanCode: para pasarlo DIRECTAMENTE al MermaidViewer sin re-procesar
            setResponseText(cleanResult);
            setCleanCode(cleanResult);
            setInternalStep('result');

            try {
                await fetch("http://localhost:3001/save-log", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        exercise: "diagram_uml_functional_extension",
                        domain: domainName,
                        hiddenContext,
                        statementContext: context,
                        visiblePrompt: promptText,
                        response: cleanResult
                    })
                });
                console.log("Log enviado al servidor local correctamente.");
            } catch (error) {
                console.warn("Servidor de logs apagado. El log no se guardó en el repo.");
            }

        } catch (error) {
            console.error(error);
            alert("Error al generar.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCombinationExtension = async (context: string, responseText: string) => {
        setExtensionComplete("");

        try {
            if (!context || !responseText) {
                console.warn("Falta contexto o código del diagrama");
            }

            const combinedResult = `
${context.trim()}

## Diagrama UML (Código Mermaid):
${responseText.trim()}`.trim();

            setExtensionComplete(combinedResult);
            onFinishExtension(combinedResult);

        } catch (error) {
            console.error("Error al combinar contexto y diagrama UML:", error);
            alert("Ocurrió un error al procesar la combinación final.");
        }
    };

    const breadcrumbItems = [
        { label: 'INICIO', action: onWelcome },
        { label: 'CREAR EXAMEN', action: onCreateExam },
        { label: 'POR PARTES', action: onCreateExamByParts },
        { label: 'EXTENSIÓN FUNCIONAL', action: onFunctionalExtension },
        { label: domainName.toUpperCase(), action: onStatementStep1 },
    ];

    const currentTitle = "DIAGRAMA UML";
    
  return (
    <div className="exam-app">
        <Header 
            onWelcome={onWelcome} 
            breadcrumbItems={breadcrumbItems} 
            currentStep={currentTitle} 
        />

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
                        <div style={{ 
                            display: 'flex', 
                            gap: '20px',
                            width: '200%',
                            maxWidth: '1600px',
                            height: '105vh', 
                            alignItems: 'stretch',
                            padding: '0 20px', 
                            boxSizing: 'border-box'
                        }}>
        
                        {/* COLUMNA 1: PROMPT */}
                        <div className="wf-column" style={{ flex: '1', display: 'flex', flexDirection: 'column', minWidth: '0' }}>
                            <span className="wf-column-title" style={{ fontSize: '16px', fontWeight: '700', marginBottom: '10px', textAlign: 'center' }}>
                                Prompt de Generación del Diagrama UML
                            </span>
                            <div style={{ flex: '1', display: 'flex', flexDirection: 'column', backgroundColor: '#fff', borderRadius: '15px', border: '1px solid #ddd', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                                <textarea 
                                    className="wf-textarea" 
                                    value={promptText} 
                                    onChange={(e) => setPromptText(e.target.value)}
                                    style={{ flex: '1', border: 'none', padding: '20px', fontSize: '14px', resize: 'none', outline: 'none', lineHeight: '1.5' }}
                                />
                                <button onClick={handleGenerate} className="btn-step secondary" style={{ margin: '15px', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                                    Volver a generar
                                </button>
                            </div>
                        </div>                        

                        {/* COLUMNA 2: VISUALIZACIÓN */}
                        <div className="wf-column" style={{ flex: '1', display: 'flex', flexDirection: 'column', minWidth: '0' }}>
                            <span className="wf-column-title" style={{ fontSize: '16px', fontWeight: '700', marginBottom: '10px', textAlign: 'center' }}>
                                Extensión Funcional con Diagrama UML
                            </span>
                            <div style={{ 
                                flex: '1', 
                                backgroundColor: '#fff', 
                                border: '1px solid #ddd', 
                                borderRadius: '15px', 
                                display: 'flex',
                                flexDirection: 'column', 
                                overflow: 'hidden', 
                                boxShadow: '0 8px 25px rgba(0,0,0,0.1)' 
                            }}>
                                {/* ENUNCIADO */}
                                <div style={{ 
                                    fontSize: '13px', 
                                    padding: '18px', 
                                    background: '#f8f9fa', 
                                    borderBottom: '1px solid #eee', 
                                    color: '#333',
                                    height: 'auto',
                                    flexShrink: 0 
                                }}>
                                    <div style={{ marginBottom: '8px', fontWeight: 'bold', color: '#666' }}>📌 Enunciado completo:</div>
                                    {context} 
                                </div>
                                
                                {/* ÁREA DEL DIAGRAMA */}
                                <div style={{ 
                                    flex: '1', 
                                    overflow: 'auto', 
                                    padding: '10px', 
                                    display: 'flex', 
                                    flexDirection: 'column',
                                    justifyContent: 'flex-start',
                                    alignItems: 'center',
                                    backgroundColor: '#fff'
                                }}>
                                    {cleanCode ? (
                                        <div style={{ 
                                            width: '100%', 
                                            transform: 'scale(1)', 
                                            transformOrigin: 'top center'
                                        }}>
                                            {/* ✅ Se usa cleanCode directamente, sin re-limpiar */}
                                            <MermaidViewer chartCode={cleanCode} />
                                        </div>
                                    ) : (
                                        <div style={{fontSize: '13px', color: '#aaa', marginTop: '20px'}}>Renderizando...</div>
                                    )}
                                </div>

                                {/* BOTÓN CONFIRMAR */}
                                <button  
                                    className="btn-step primary"
                                    onClick={() => handleCombinationExtension(context, responseText)}
                                >
                                    Confirmar Diagrama UML
                                </button>
                            </div>
                        </div>

                        {/* COLUMNA 3: CÓDIGO MERMAID */}
                        <div className="wf-column" style={{ flex: '1', display: 'flex', flexDirection: 'column', minWidth: '0' }}>
                            <span className="wf-column-title" style={{ fontSize: '16px', fontWeight: '700', marginBottom: '10px', textAlign: 'center' }}>
                                Código Mermaid
                            </span>
                            <div style={{ flex: '1', backgroundColor: '#1e1e1e', borderRadius: '15px', border: '1px solid #333', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                                <pre style={{ flex: '1', color: '#9cdcfe', padding: '20px', fontSize: '12px', overflow: 'auto', margin: '0', lineHeight: '1.4' }}>
                                    <code>{responseText || "// Esperando..."}</code>
                                </pre>
                            </div>
                        </div>
                    </div>
                    )}
                </div>
            </div>
        </main>

    </div>
  )
}