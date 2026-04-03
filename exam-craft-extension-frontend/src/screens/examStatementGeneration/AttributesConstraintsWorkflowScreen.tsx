import React, { useState, useEffect } from "react"
import logoExamCraft from "../../../assets/icon512.png"
import carpeta from "../../../assets/images/archive.png"
import examen from "../../../assets/images/exam.png"
import attributesConstraintsPromptMarkdown from "bundle-text:../../prompts/generation-constraints-attributes/generation_attribute_constraints_from_statement.md"
import { parseMasterPrompt } from "~src/utils/promptParser"
import { sendToGemini } from "~src/services/geminiService"

interface Props {
  readonly onBack: () => void
  readonly onWelcome: () => void
  readonly onCreateExam: () => void
  readonly onCreateTest: (data: { project: any, constraints: string }) => void; 
}

export default function AttributesConstraintsWorkflowScreen({ onBack, onWelcome, onCreateExam, onCreateTest }: Props) {

    const [step, setStep] = useState<'selection' | 'workflow'>('selection');
    const [internalStep, setInternalStep] = useState<'input' | 'result'>('input');
    
    const [projects, setProjects] = useState<any[]>([]);
    const [selectedDomainFolder, setSelectedDomainFolder] = useState<string | null>(null);
    const [selectedProject, setSelectedProject] = useState<any>(null);
    
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const [promptText, setPromptText] = useState("");
    const [hiddenContext, setHiddenContext] = useState("");
    const [responseText, setResponseText] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [savedData, setSavedData] = useState<{ project: any, constraints: string } | null>(null);

  useEffect(() => {
    if (typeof chrome !== "undefined" && chrome.storage?.local) {
      chrome.storage.local.get(null, (items) => {
        const projectList = Object.keys(items)
          .filter(key => key.startsWith('project_'))
          .map(key => ({
            id: key,
            ...items[key]
          }));
        setProjects(projectList);
      });
    }
  }, [step]);


  const allowedFolders = ["clínica veterinaria", "ajedrez"];
  const projectsInFolder = projects.filter(p => 
      p.domainName && selectedDomainFolder && p.domainName.toLowerCase() === selectedDomainFolder.toLowerCase()
  );

  const handleSelectProject = (project: any) => {
      setSelectedProject(project);
      setShowConfirmModal(true);
  };

  const handleConfirmSelection = () => {
      setShowConfirmModal(false);
      setStep('workflow');
      setInternalStep('input');
  };

  const handleSaveToChrome = () => {
    if (typeof chrome !== "undefined" && chrome.storage?.local) {
        
        if (!selectedProject?.id) {
            alert("Error: No hay un examen válido seleccionado para actualizar.");
            return;
        }

        const updatedExamData = {
            ...selectedProject, 
            attributeConstraints: responseText,
            updatedAt: new Date().toISOString()
        };

        chrome.storage.local.set({ [selectedProject.id]: updatedExamData }, () => {
            if (chrome.runtime.lastError) {
                console.error("Error al actualizar:", chrome.runtime.lastError);
                alert("No se pudo actualizar el examen en el almacenamiento local.");
            } else {
                setSelectedProject(updatedExamData);
                setSavedData({ project: updatedExamData, constraints: responseText });
                setShowSuccessModal(true); 
            }
        });
    } else {
        alert("Esta funcionalidad solo está disponible dentro de la Extensión de Chrome.");
    }
};

  useEffect(() => {
    if (attributesConstraintsPromptMarkdown && selectedProject?.domainName) {
        const { visibleText, hiddenContext } = parseMasterPrompt(attributesConstraintsPromptMarkdown);
        
        setPromptText(visibleText);    
        setHiddenContext(hiddenContext);
    }
  }, [selectedProject]);


  const handleGenerate = async () => {
    setIsLoading(true);
    setResponseText("");

    try {
        const finalPayload = `
        CONTEXTO Y RECURSOS (Información interna):
        
        [RECURSOS ESTÁTICOS Y EJEMPLOS]:
        ${hiddenContext}

        [ENUNCIADO Y DIAGRAMA DEL EXAMEN SELECCIONADO]:
        ${selectedProject.extensionFinish}

        INSTRUCCIONES PRINCIPALES:
        ${promptText}
        `;

        const result = await sendToGemini(finalPayload);
        
        setResponseText(result);
        setInternalStep('result');

        try {
            await fetch("http://localhost:3001/save-log", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    exercise: "attributes_constraints",
                    domain: selectedProject.domainName,
                    hiddenContext,
                    selectedExam: selectedProject.extensionFinish,
                    visiblePrompt: promptText,
                    response: result
                })
            });
        } catch (error) {
            console.warn("Servidor de logs apagado.", error);
        }

    } catch (error) {
        console.error(error);
        alert("Error al generar.");
    } finally {
        setIsLoading(false);
    }
  };

  const handleDownload = () => {
      if (!selectedProject || !responseText) return;

      const defaultName = `Restricciones_Atributos_${selectedProject.customName}`;
      const userChosenName = prompt("Introduce el nombre para el archivo a descargar:", defaultName);
      
      if (userChosenName === null) return; 
      
      let finalFileName = userChosenName.trim() || defaultName;
      
      if (!finalFileName.toLowerCase().endsWith('.md')) {
          finalFileName += '.md';
      }

      const title = `Restricciones de Atributos - ${selectedProject.customName || selectedProject.domainName}`;
      
      const markdownContent = `# ${title}\n\n${responseText}`;

      const blob = new Blob([markdownContent], { type: "text/markdown;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = url;
      link.download = finalFileName;
      
      document.body.appendChild(link);
      link.click();
      
      link.remove();
      URL.revokeObjectURL(url);
  };

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
          { label: 'CREAR EXAMEN', action: onCreateExam },
          { label: 'POR PARTES', action: onBack },
      ];

  return (
    <div className="exam-app" style={{ position: 'relative' }}>
      
      {showConfirmModal && selectedProject && (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            zIndex: 1000 
        }}>
            <div className="content-card" style={{ maxWidth: '400px', width: '90%', padding: '30px', textAlign: 'center', backgroundColor: '#fff', borderRadius: '12px' }}>
                <h3 className="main-title small" style={{ marginBottom: '15px', color: '#4a3728' }}>Confirmar Contexto</h3>
                
                <p style={{ marginBottom: selectedProject.attributeConstraints ? '15px' : '25px', color: '#555', fontSize: '15px' }}>
                    ¿Deseas utilizar <strong>{selectedProject.customName || `Examen de ${selectedProject.domainName}`}</strong> como base para generar el ejercicio de restricciones?
                </p>

                {selectedProject.attributeConstraints && (
                    <div style={{
                        backgroundColor: '#fff8e1',
                        border: '1px solid #f9a825',
                        borderRadius: '8px',
                        padding: '12px 15px',
                        marginBottom: '20px',
                        textAlign: 'left',
                        fontSize: '13px',
                        color: '#7a5800'
                    }}>
                        <strong>Este examen ya tiene restricciones de atributos generadas.</strong>
                        <br />
                        Si continúas, las restricciones anteriores serán reemplazadas por las nuevas.
                    </div>
                )}

                <div className="wf-actions-row" style={{ justifyContent: 'center', gap: '15px' }}>
                    <button 
                        onClick={() => { setShowConfirmModal(false); setSelectedProject(null); }} 
                        className="btn-step secondary"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={handleConfirmSelection} 
                        className="btn-step primary"
                    >
                        {selectedProject.attributeConstraints ? 'Continuar y reemplazar' : 'Confirmar'}
                    </button>
                </div>
            </div>
        </div>
    )}

      {showSuccessModal && savedData && (
          <div style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.6)',
              display: 'flex', justifyContent: 'center', alignItems: 'center',
              zIndex: 1000
          }}>
              <div className="content-card" style={{ maxWidth: '400px', width: '90%', padding: '30px', textAlign: 'center', backgroundColor: '#fff', borderRadius: '12px' }}>
                  <div style={{ fontSize: '48px', marginBottom: '15px' }}>✅</div>
                  <h3 className="main-title small" style={{ marginBottom: '10px', color: '#4a3728' }}>
                      ¡Guardado correctamente!
                  </h3>
                  <p style={{ marginBottom: '25px', color: '#555', fontSize: '15px' }}>
                      Las restricciones de atributos de <strong>{savedData.project.customName || savedData.project.domainName}</strong> han sido actualizadas correctamente.
                  </p>
                  <button
                      onClick={() => {
                          setShowSuccessModal(false);
                          onCreateTest(savedData);
                      }}
                      className="btn-step primary"
                      style={{ width: '100%' }}
                  >
                      Continuar
                  </button>
              </div>
          </div>
      )}

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
                <span className="breadcrumb-current">RESTRICCIONES DE ATRIBUTOS</span>
            </nav>
        </div>
      </header>

      <main className="main-content">

        {step === 'selection' && (
            <div className="content-card" style={{ width: '100%', maxWidth: '900px' }}>
                {!selectedDomainFolder ? (
                    <>
                        <h2 className="main-title small">Exámenes de {selectedDomainFolder.toUpperCase()}</h2>
                        <p className="wf-instruction-text" style={{ textAlign: 'center' }}>
                            Haz clic en el examen específico que deseas utilizar como contexto.
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '30px', marginTop: '30px', padding: '20px' }}>
                            {projectsInFolder.length > 0 ? (
                                projectsInFolder.map((proj) => (
                                    <div key={proj.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <span
                                            className="parts-exam-icon"
                                            role="button"
                                            tabIndex={0}
                                            style={{ 
                                                cursor: 'pointer', 
                                                display: 'flex', 
                                                justifyContent: 'center', 
                                                alignItems: 'center', 
                                                height: '110px', 
                                                width: '100%' 
                                            }}
                                            onClick={() => handleSelectProject(proj)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault(); 
                                                handleSelectProject(proj);
                                                }
                                            }}
                                            >
                                            <img
                                                src={examen}
                                                alt="Abrir"
                                                width="80"
                                                height="80"
                                                style={{ transition: 'transform 0.2s' }}
                                                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                                                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                                onFocus={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                                                onBlur={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                            />
                                            </span>
                                        <span style={{ marginTop: '10px', fontWeight: 'bold', fontSize: '14px', color: '#4a3728', textAlign: 'center' }}>
                                            {proj.customName || `Examen de ${proj.domainName}`}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <p style={{ gridColumn: '1/-1', textAlign: 'center', color: '#888' }}>No hay exámenes.</p>
                            )}
                        </div>

                        <div className="wf-actions-row" style={{ marginTop: '30px' }}>
                            <button onClick={() => setSelectedDomainFolder(null)} className="btn-step secondary">Volver</button>
                        </div>
                    </>

        
                ) : (
                    <>
                        <h2 className="main-title small">Selecciona un dominio</h2>
                        <p className="wf-instruction-text" style={{ textAlign: 'center' }}>
                            Para generar el ejercicio "Restricciones de Atributos" es necesario elegir un examen ya creado y almacenado previamente en el sistema. Haz clic en la carpeta del dominio que quieres usar como base para este ejercicio.
                        </p>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '30px', marginTop: '30px', padding: '20px' }}>
                            {allowedFolders.map((folderName) => (
                                <div key={folderName} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <button
                                        type="button"
                                        style={{ 
                                            background: 'none', 
                                            border: 'none', 
                                            padding: 0, 
                                            cursor: 'pointer',
                                            transition: 'transform 0.2s',
                                            outline: 'none',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center'
                                        }}
                                        onClick={() => setSelectedDomainFolder(folderName)}
                                        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                                        onFocus={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                                        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                        onBlur={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                    >
                                        <img 
                                            src={carpeta} 
                                            alt={`Carpeta del dominio ${folderName}`} 
                                            width="90" 
                                        />
                                    </button>
                                    <span style={{ marginTop: '10px', fontWeight: 'bold', fontSize: '14px', color: '#4a3728', textAlign: 'center', textTransform: 'capitalize' }}>
                                        {folderName}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="wf-actions-row" style={{ marginTop: '30px' }}>
                            <button onClick={onBack} className="btn-step secondary">Volver</button>
                        </div>
                    </>
                    
                )}
            </div>
        )}

        {step === 'workflow' && selectedProject && (
            <div className="content-card" style={{ width: '100%', maxWidth: '1000px', maxHeight: '85vh', overflowY: 'auto' }}>
                <h2 className="main-title small">
                    {internalStep === 'input' ? 'Restricciones de Atributos' : `Generar Restricciones: ${selectedProject.customName || selectedProject.domainName.toUpperCase()}`}
                </h2>
                
                <div className="wf-wide-wrapper">
                {internalStep === 'input' && (
                    <>
                        <p className="wf-instruction-text">
                            Este es el prompt que se usará para generar las restricciones de atributos del examen seleccionado, puede revisar o modificar cualquier información que vea conveniente. Al terminar, pulse en <strong>"Generar"</strong>.
                        </p>
                        <textarea 
                            className="wf-textarea" 
                            value={promptText}
                            onChange={(e) => setPromptText(e.target.value)}
                        />
                        <div className="wf-actions-row" style={{ marginTop: '20px' }}>
                            <button onClick={onBack} className="btn-step secondary">Volver</button>
                            <button onClick={handleGenerate} className="btn-step primary">
                                {isLoading ? <div className="loading-spinner"></div> : 'Generar'}
                            </button>
                        </div>
                    </>
                )}

                {internalStep === 'result' && (
                    <>
                        <div className="wf-split-view">
                            <div className="wf-column">
                                <span className="wf-column-title">Prompt enviado</span>
                                <textarea 
                                    className="wf-textarea" 
                                    value={promptText}
                                    onChange={(e) => setPromptText(e.target.value)}
                                />
                                <button onClick={handleGenerate} className="btn-step primary" disabled={isLoading}>
                                    Volver a generar
                                </button>
                            </div>
                            <div className="wf-column">
                                <span className="wf-column-title">Propuesta del modelo</span>
                                <textarea 
                                    className="wf-result-box"
                                    value={responseText}
                                    onChange={(e) => setResponseText(e.target.value)}
                                />
                                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                    <button onClick={handleDownload} className="btn-step secondary" style={{ flex: 1, backgroundColor: '#4a90e2', color: 'white' }}>
                                        Descargar (.md)
                                    </button>

                                    <button onClick={handleSaveToChrome} className="btn-step primary" style={{ flex: 1 }}>
                                        Guardar y Continuar
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                                            <polyline points="17 21 17 13 7 13 7 21" />
                                            <polyline points="7 3 7 8 15 8" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="wf-actions-row" style={{ marginTop: '20px' }}>
                            <button onClick={() => setInternalStep('input')} className="btn-step secondary">Volver al editor</button>
                        </div>
                    </>
                )}
                </div>
            </div>
        )}
      </main>      
    </div>
  )
}