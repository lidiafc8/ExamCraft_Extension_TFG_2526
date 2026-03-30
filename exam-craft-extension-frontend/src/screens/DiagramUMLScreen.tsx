import React, { useState, useEffect } from "react"
import logoExamCraft from "../../assets/icon512.png"
import extensionPromptMarkdown from "bundle-text:../prompts/functional-extension-generation/generation_UML_diagram_functional_extension.md"
import { sendToGemini } from "../services/geminiService"
import { parseMasterPrompt } from "../utils/promptParser"
import { MermaidViewer } from "../components/MermaidViewer"

interface Props {
  domainName: string;
  context: string;
  onBack: () => void;
  onWelcome: () => void;
  onCreateExam: () => void;
  onCreateExamByParts: () => void;
  onFunctionalExtension: () => void;
  onStatementStep1: () => void;
  onFinishExtension: (text:string) => void;
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
    
    //esto es lo que ve el usuario
    const [hiddenContext, setHiddenContext] = useState("");

    //esto es en bruto lo que devuelve la IA
    const [responseText, setResponseText] = useState("");

    //esto es cuando está preparado para dibujarlo, quitando todo
    const [cleanedCode, setCleanedCode] = useState("");

    //esto para que se muestre, que se está cargando, para no dar todo el tiempo y se gaste la cuota
    const [isLoading, setIsLoading] = useState(false);

    //esto es para unir el codigo mermaid con el contexto del enunciado
    const [extensionComplete, setExtensionComplete] = useState("");

    //se ejecuta al principio, y cuando se cambia el enunciado 
    //FUNCIONALIDAD DEL MÉTODO ---> es separar el prompt

    useEffect(() => {
        if (extensionPromptMarkdown && domainName) {
            const { visibleText, hiddenContext } = parseMasterPrompt(extensionPromptMarkdown);
            
            const finalVisible = visibleText.replaceAll("{{DOMAIN}}", domainName);
            
            setPromptText(finalVisible);    
            setHiddenContext(hiddenContext);
        }
    }, [context, domainName]);

    const cleanMermaidCode = (code) => {
        if (!code) return '';
        
        return code
            // 1. Elimina etiquetas HTML (<span>, <div>, etc.)
            .replace(/<[^>]*>?/gm, '') 
            // 2. Elimina entidades HTML comunes (como &nbsp;)
            .replace(/&nbsp;/g, ' ')
            // 3. Limpia líneas que queden vacías o con solo espacios
            .split('\n')
            .map(line => line.trimEnd())
            .join('\n');
    };

    const handleGenerate = async () => {
        setIsLoading(true);
        setResponseText("");
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

            // --- NUEVA LÓGICA DE LIMPIEZA ---
            // 1. Quitamos primero las etiquetas de bloque de código markdown
            let cleanResult = result.replace(/```mermaid/g, "").replace(/```/g, "");

            // 2. Buscamos dónde empieza realmente el diagrama (ej: classDiagram, graph TD, etc.)
            // Esto ignora cualquier texto introductorio de la IA
            const diagramMatch = cleanResult.match(/(classDiagram|graph|sequenceDiagram|erDiagram|stateDiagram|kanban)[\s\S]*/);
            
            if (diagramMatch) {
                cleanResult = diagramMatch[0].trim();
            } else {
                cleanResult = cleanResult.trim(); // Fallback por si no encuentra el match
            }

            setResponseText(cleanResult);
            setInternalStep('result');

            try {
                await fetch("http://localhost:3001/save-log", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        exercise: "diagram_uml_functional_extension",
                        domain: domainName,               
                        hiddenContext: hiddenContext,     
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

    const handleCombinationExtension = async (context, responseText) => {
        // 1. Limpiamos el estado previo (opcional, dependiendo de tu UI)
        setExtensionComplete("");

        try {
            // 2. Validamos que tengamos ambos datos para evitar strings vacíos
            if (!context || !responseText) {
                console.warn("Falta contexto o código del diagrama");
            }

            // 3. Creamos la combinación en una constante local
            // Usamos .trim() para limpiar espacios innecesarios
            const combinedResult = `
${context.trim()}

## Diagrama UML (Código Mermaid):
${responseText.trim()}`.trim();

            // 4. Actualizamos el estado para la interfaz (si lo necesitas mostrar en pantalla)
            setExtensionComplete(combinedResult);

            // 5. ¡ESTA ES LA CLAVE! 
            // Enviamos 'combinedResult' directamente, NO 'extensionComplete'
            // Así nos aseguramos de que el padre reciba la información nueva al momento.
            onFinishExtension(combinedResult);

        } catch (error) {
            console.error("Error al combinar contexto y diagrama UML:", error);
            alert("Ocurrió un error al procesar la combinación final.");
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
                        <div style={{ 
                            display: 'flex', 
                            gap: '20px', //espacio entre cada componente
                            width: '200%',          // Ocupa la mayoría del ancho disponible
                            maxWidth: '1600px',    // Pero no se estira infinitamente en monitores 4K
                            height: '105vh', 
                            alignItems: 'stretch',  //para ponerlos en fila  
                            padding: '0 20px', 
                            boxSizing: 'border-box'
                        }}>
        
                        {/* COLUMNA 1: PROMPT (Flex 1 para igualdad) */}
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
                                {/* ENUNCIADO: Se ve entero, sin cortes */}
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
                                
                                {/* ÁREA DEL DIAGRAMA: Ahora sin scale pequeño, usando todo el ancho */}
                                <div style={{ 
                                    flex: '1', 
                                    overflow: 'auto', 
                                    padding: '10px', 
                                    display: 'flex', 
                                    flexDirection: 'column', // Cambiado para apilar correctamente
                                    justifyContent: 'flex-start', // Empieza desde arriba
                                    alignItems: 'center',
                                    backgroundColor: '#fff'
                                }}>
                                    {responseText ? (
                                        <div style={{ 
                                            width: '100%', 
                                            /* Eliminamos el scale(0.6) o (0.8) que lo hacía minúsculo */
                                            transform: 'scale(1)', 
                                            transformOrigin: 'top center'
                                        }}>
                                            <MermaidViewer 
                                                chartCode={cleanMermaidCode(responseText)}
                                            />
                                        </div>
                                    ) : (
                                        <div style={{fontSize: '13px', color: '#aaa', marginTop: '20px'}}>Renderizando...</div>
                                    )}
                                </div>

                                {/* BOTÓN: Pegado abajo sin margen blanco */}
                                <button  
                                    className="btn-step primary"
                                    onClick={() => handleCombinationExtension(context, responseText)}
                                >
                                    Confirmar Diagrama UML
                                </button>
                            </div>
                        </div>

                        {/* COLUMNA 3: CÓDIGO (Flex 1 para igualdad) */}
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