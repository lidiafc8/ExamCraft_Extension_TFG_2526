import React, { useState, useEffect, useRef } from "react";
import logoExamCraft from "../../assets/icon512.png";
import extensionPromptMarkdown from "bundle-text:../prompts/functional-extension-generation/generation_UML_diagram_functional_extension.md";
import { sendToGemini } from "../services/geminiService";
import { parseMasterPrompt } from "../utils/promptParser";
import { MermaidDiagram } from "../components/MermaidDiagram";

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
}

export default function FinishFunctionalExtensionScreen({ 
  domainName, 
  statementText, 
  onBack, 
  onWelcome, 
  onCreateExam, 
  onCreateExamByParts, 
  onFunctionalExtension, 
  onGoToUML,
  onStatementStep1 
}: Props) {
  const [internalStep, setInternalStep] = useState<'input' | 'result'>('input');
  const [promptText, setPromptText] = useState("");
  const [hiddenContext, setHiddenContext] = useState("");
  const [responseText, setResponseText] = useState("");
  const [cleanedCode, setCleanedCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const modalContentRef = useRef<HTMLDivElement>(null);

  // --- Lógica de limpieza de código Mermaid ---
  const cleanMermaidCode = (text: string) => {
    if (!text) return "";
    let code = text.replace(/```(?:mermaid)?\s*([\s\S]*?)\s*```/, '$1');
    if (code === text) {
        code = text.replace(/```mermaid/gi, '').replace(/```/g, '');
    }
    const startKeywordIndex = code.search(/classDiagram|graph|stateDiagram|erDiagram/);
    if (startKeywordIndex !== -1) {
        code = code.substring(startKeywordIndex);
    }
    code = code.replace(/^\s*(style|classDef|linkStyle)\b.*$/gm, '');
    code = code.replace(/color:\s*(?:#[0-9a-fA-F]{3,6}|[a-zA-Z]+);?/gi, '');
    code = code.replace(/\n\s*\n/g, '\n');
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

  const handleDownload = () => {
    // Aquí podrías implementar la descarga real a archivo .md o imagen
    alert("Iniciando descarga del archivo Markdown...");
  };

  // --- FUNCIÓN DE GUARDADO CORREGIDA ---
  const handleSave = () => {
    const dataToSave = {
      id: Date.now(),
      domain: domainName,
      title: `Extensión: ${domainName.toUpperCase()}`,
      statement: statementText, // Texto generado/enunciado
      mermaidCode: cleanedCode, // Diagrama UML
      date: new Date().toLocaleString()
    };

    // Verificamos si estamos en el entorno de la extensión de Chrome
    if (typeof chrome !== "undefined" && chrome.storage) {
      chrome.storage.local.get({ savedProjects: [] }, (result) => {
        const updatedList = [dataToSave, ...result.savedProjects];
        
        chrome.storage.local.set({ savedProjects: updatedList }, () => {
          alert("✅ Guardado correctamente en la extensión.");
          setIsModalOpen(false);
        });
      });
    } else {
      // Fallback para desarrollo en navegador normal
      console.log("Datos que se guardarían:", dataToSave);
      alert("Modo desarrollo: Datos mostrados en consola (Storage no detectado).");
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
                <div className="step-wrapper step-completed">
                    <div className="step-circle">1</div>
                    <span className="step-label">Texto de enunciado</span>
                </div>
                <div className="step-line" style={{ background: '#4CAF50' }}></div>
                <div className="step-wrapper step-finish">
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
                    <div className="wf-column" style={{ flex: '1' }}>
                        <span className="wf-column-title">Prompt enviado</span>
                        <textarea className="wf-textarea" value={promptText} readOnly style={{ height: '350px' }} />
                        <button onClick={handleGenerate} className="btn-step primary" disabled={isLoading} style={{ width: '100%' }}>
                            {isLoading ? 'Generando...' : 'Volver a generar'}
                        </button>
                    </div>

                    <div className="wf-column" style={{ flex: '1.5' }}>
                      <span className="wf-column-title">Visualización Ampliada (Click para detalle)</span>
                      <div 
                        className="wf-result-box" 
                        onClick={() => cleanedCode && setIsModalOpen(true)}
                        style={{ 
                          backgroundColor: '#ffffff', border: '1px solid #e0e0e0', borderRadius: '8px', 
                          minHeight: '350px', maxHeight: '500px', display: 'flex', flexDirection: 'column', 
                          padding: '15px', cursor: cleanedCode ? 'zoom-in' : 'default', overflow: 'auto'
                        }}
                      >
                        <div style={{ paddingBottom: '15px', marginBottom: '15px', borderBottom: '1px solid #eee', fontSize: '13px' }}>
                          <strong>Enunciado Base:</strong> {statementText?.substring(0, 150)}...
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexGrow: 1 }}>
                          {isLoading ? "Generando..." : (cleanedCode && <MermaidDiagram chartCode={cleanedCode} />)}
                        </div>
                      </div>
                      <button onClick={() => onGoToUML(cleanedCode)} className="btn-step primary" style={{ marginTop: '15px', width: '100%' }}>
                        Confirmar Diagrama
                      </button>
                    </div> 

                    <div className="wf-column" style={{ flex: '1' }}>
                        <span className="wf-column-title">Código Mermaid</span>
                        <textarea className="wf-textarea" value={responseText} readOnly style={{ height: '350px', backgroundColor: '#f5f5f5', fontFamily: 'monospace' }} />
                        <button onClick={onBack} className="btn-step secondary" style={{ width: '100%', marginTop: '10px' }}>Volver al Prompt</button>
                    </div>
                  </div>
                )}
            </div>
        </div>
      </main>

      {/* --- MODAL DE REVISIÓN Y GUARDADO --- */}
      {isModalOpen && (
        <div 
          onClick={() => setIsModalOpen(false)}
          style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1000,
            display: 'flex', justifyContent: 'center', alignItems: 'center'
          }}
        >
          <div 
            ref={modalContentRef}
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'white', padding: '40px', borderRadius: '12px',
              width: '85%', maxHeight: '90%', overflow: 'auto', position: 'relative'
            }}
          >
            <div style={{ 
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              borderBottom: '2px solid #eee', marginBottom: '20px', paddingBottom: '10px'
            }}>
              <h2 style={{ margin: 0, color: '#333' }}>Revisión: {domainName.toUpperCase()}</h2>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={handleDownload} style={{ padding: '8px 15px', borderRadius: '6px', cursor: 'pointer', border: '1px solid #ccc', background: '#f8f9fa' }}>📥 Descargar MD</button>
                <button onClick={handleSave} style={{ padding: '8px 15px', borderRadius: '6px', cursor: 'pointer', border: '1px solid #4CAF50', background: '#e8f5e9', color: '#2e7d32', fontWeight: 'bold' }}>💾 Guardar en Extensión</button>
                <button onClick={() => setIsModalOpen(false)} style={{ background: '#ff4444', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer' }}>Cerrar</button>
              </div>
            </div>

            <div style={{ backgroundColor: '#fafafa', padding: '20px', borderRadius: '8px', marginBottom: '25px', borderLeft: '4px solid #4CAF50' }}>
              <h4 style={{ marginTop: 0, color: '#4CAF50' }}>Enunciado Detallado</h4>
              <p style={{ whiteSpace: 'pre-wrap', fontSize: '15px', lineHeight: '1.5' }}>{statementText}</p>
            </div>

            <div style={{ textAlign: 'center', padding: '20px', border: '1px dashed #ccc', borderRadius: '8px', background: 'white' }}>
              <h4 style={{ marginBottom: '20px', color: '#666' }}>Diagrama de Clases UML</h4>
              <div style={{ transform: 'scale(1.1)', transformOrigin: 'top center' }}>
                <MermaidDiagram chartCode={cleanedCode} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}