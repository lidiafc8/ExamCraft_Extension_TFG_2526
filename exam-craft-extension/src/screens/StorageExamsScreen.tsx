import React, { useEffect, useState } from "react"
import logoExamCraft from "../../assets/icon512.png"
import carpeta from "../../assets/images/archive.png"
import examen from "../../assets/images/exam.png"
import { MermaidViewer } from "../components/MermaidViewer"

interface Props {
    onWelcome: () => void;
}

const cleanMermaidCode = (code: string) => {
    if (!code) return '';
    return code.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ').trim();
};

const extractMermaidCode = (fullText: string) => {
    if (!fullText) return "";
    const separatorRegex = /-{5,}|={5,}/; 
    const parts = fullText.split(separatorRegex);
    const diagramPart = parts.find(p => p.toLowerCase().includes("classdiagram") || p.toLowerCase().includes("graph")) || "";
    return diagramPart.replace(/.*?(classDiagram|graph)/is, "$1").trim();
};

export default function StorageExamsScreen({ onWelcome }: Props) {
    // --- ESTADOS ---
    const [projects, setProjects] = useState<any[]>([]);
    const [selectedDomainFolder, setSelectedDomainFolder] = useState<string | null>(null);
    const [selectedProject, setSelectedProject] = useState<any | null>(null);
    
    // Estados para la edición del nombre del archivo
    const [editingId, setEditingId] = useState<string | null>(null);
    const [tempName, setTempName] = useState("");

    // 1. CARGAR DATOS
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
    }, []);

    // 2. FUNCIÓN PARA RENOMBRAR
    const handleRename = (id: string) => {
        if (!tempName.trim()) {
            setEditingId(null);
            return;
        }

        const projectToUpdate = projects.find(p => p.id === id);
        if (!projectToUpdate) return;


        const updatedData = { ...projectToUpdate, customName: tempName.trim() };

        if (typeof chrome !== "undefined" && chrome.storage?.local) {
            chrome.storage.local.set({ [id]: updatedData }, () => {
                setProjects(prevProjects => prevProjects.map(p => 
                    p.id === id ? { ...p, customName: tempName.trim() } : p
                ));
                setEditingId(null); 
            });
        }
    };

    // 3. FUNCIÓN PARA BORRAR UN EXAMEN
    const handleDelete = (id: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation(); 
        
        const confirmDelete = window.confirm("¿Estás seguro de que quieres borrar este examen? Esta acción no se puede deshacer.");
        
        if (confirmDelete) {
            if (typeof chrome !== "undefined" && chrome.storage?.local) {
                chrome.storage.local.remove(id, () => {
                    setProjects(prevProjects => prevProjects.filter(p => p.id !== id));
                    if (selectedProject && selectedProject.id === id) {
                        setSelectedProject(null);
                    }
                });
            }
        }
    };

    // --- LÓGICA DE CARPETAS ESTRICTA ---
    const allowedFolders = ["clínica veterinaria", "ajedrez"];
    const projectsInFolder = projects.filter(p => 
        p.domainName && selectedDomainFolder && p.domainName.toLowerCase() === selectedDomainFolder.toLowerCase()
    );

    // =========================================================
    // VISTA A: DETALLE DEL EXAMEN SELECCIONADO (Nivel 3)
    // =========================================================
    if (selectedProject) {
        const mermaidCode = extractMermaidCode(selectedProject.extensionFinish);

        return (
            <div className="exam-app" style={{ minHeight: '100vh', height: 'auto', overflow: 'visible', display: 'flex', flexDirection: 'column' }}>
                
                <header className="app-header" style={{ position: 'sticky', top: 0, zIndex: 100 }}>
                    <div className="header-left">
                        <span className="logo-icon" onClick={() => setSelectedProject(null)} style={{ cursor: 'pointer' }}>
                            <img src={logoExamCraft} alt="Logo" width="60" height="60" />
                        </span>
                        <nav className="breadcrumb-nav">
                            <span className="breadcrumb-link" onClick={onWelcome}>INICIO</span>
                            <span className="breadcrumb-separator">{'>'}</span>
                            <span className="breadcrumb-link" onClick={() => { setSelectedProject(null); setSelectedDomainFolder(null); }}>EXÁMENES ANTERIORES</span>
                            <span className="breadcrumb-separator">{'>'}</span>
                            <span className="breadcrumb-link" onClick={() => setSelectedProject(null)}>{selectedDomainFolder?.toUpperCase()}</span>
                            <span className="breadcrumb-separator">{'>'}</span>
                            <span className="breadcrumb-current">{selectedProject.customName || `Examen de ${selectedProject.domainName}`}</span>
                        </nav>
                    </div>
                </header>

                <main className="main-content" style={{ padding: '30px', paddingBottom: '100px', height: 'auto', overflow: 'visible', flex: 1 }}>
                    
                    <div className="section-block" style={{ marginBottom: '50px' }}>
                        <h2 style={{ borderBottom: '2px solid #b08968', paddingBottom: '10px', marginBottom: '20px' }}>
                            Extensión Funcional
                        </h2>
                        
                        <div style={{ display: 'flex', gap: '20px', height: '500px' }}>
                            <div className="content-card" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <h3 style={{ marginBottom: '10px' }}>Enunciado Generado</h3>
                                <textarea className="wf-textarea" readOnly value={selectedProject.extensionFinish} style={{ flex: 1, resize: 'none', padding: '15px', fontSize: '14px' }} />
                            </div>
                            <div className="content-card" style={{ flex: 1.5, backgroundColor: '#fff', display: 'flex', flexDirection: 'column' }}>
                                <h3 style={{ marginBottom: '10px' }}>Modelo UML</h3>
                                <div style={{ flex: 1, overflow: 'auto', border: '1px solid #eee', borderRadius: '8px' }}>
                                    <MermaidViewer chartCode={cleanMermaidCode(mermaidCode)} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="section-block" style={{ marginBottom: '50px' }}>
                        <h2 style={{ borderBottom: '2px solid #b08968', paddingBottom: '10px', marginBottom: '20px' }}>
                            Restricciones de Atributos
                        </h2>
                        
                        <div className="content-card" style={{ padding: '20px' }}>
                            {selectedProject.attributeConstraints ? (
                                <textarea 
                                    className="wf-textarea" 
                                    readOnly 
                                    value={selectedProject.attributeConstraints} 
                                    style={{ width: '100%', minHeight: '200px', resize: 'vertical', padding: '15px', fontSize: '14px' }} 
                                />
                            ) : (
                                <p style={{ color: '#888', fontStyle: 'italic', textAlign: 'center', margin: '30px 0' }}>
                                    Aún no se han creado las restricciones de atributos para este examen.
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="section-block" style={{ marginBottom: '50px' }}>
                        <h2 style={{ borderBottom: '2px solid #b08968', paddingBottom: '10px', marginBottom: '20px' }}>
                            Relaciones entre Entidades
                        </h2>
                        
                        <div className="content-card" style={{ padding: '20px' }}>
                            {selectedProject.entityRelations ? (
                                <textarea 
                                    className="wf-textarea" 
                                    readOnly 
                                    value={selectedProject.entityRelations} 
                                    style={{ width: '100%', minHeight: '200px', resize: 'vertical', padding: '15px', fontSize: '14px' }} 
                                />
                            ) : (
                                <p style={{ color: '#888', fontStyle: 'italic', textAlign: 'center', margin: '30px 0' }}>
                                    Aún no se han creado las relaciones entre entidades para este examen.
                                </p>
                            )}
                        </div>
                    </div>

                    <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '15px' }}>
                        <button onClick={() => setSelectedProject(null)} className="btn-back" style={{ position: 'relative', margin: 0 }}>
                            Volver a la carpeta
                        </button>
                        <button 
                            onClick={(e) => handleDelete(selectedProject.id, e as unknown as React.MouseEvent)} 
                            className="btn-back"
                            style={{ position: 'relative', margin: 0, backgroundColor: '#ff4d4f', color: 'white' }}
                        >
                            Borrar Examen
                        </button>
                    </div>
                </main>
            </div>
        );
    }

    // =========================================================
    // VISTA B: DENTRO DE UNA CARPETA DE DOMINIO (Nivel 2)
    // =========================================================
    if (selectedDomainFolder) {
        return (
            <div className="exam-app">
                <header className="app-header">
                    <div className="header-left">
                        <span className="logo-icon" onClick={() => setSelectedDomainFolder(null)} style={{ cursor: 'pointer' }}>
                            <img src={logoExamCraft} alt="Logo" width="60" height="60" />
                        </span> 
                        <nav className="breadcrumb-nav">
                            <span className="breadcrumb-link" onClick={onWelcome}>INICIO</span>
                            <span className="breadcrumb-separator">{'>'}</span>
                            <span className="breadcrumb-link" onClick={() => setSelectedDomainFolder(null)}>EXÁMENES ANTERIORES</span>
                            <span className="breadcrumb-separator">{'>'}</span>
                            <span className="breadcrumb-current">{selectedDomainFolder.toUpperCase()}</span>
                        </nav>
                    </div>
                </header>

                <main className="main-content">
                    <h1 className="main-title">CARPETA: {selectedDomainFolder.toUpperCase()}</h1>
                    
                    <div className="subtitle-badge">
                        Selecciona un examen para visualizarlo o haz clic en su nombre para editarlo
                    </div>

                    <div className="cards-container">
                        {projectsInFolder.length > 0 ? (
                            projectsInFolder.map((proj) => (
                                <div key={proj.id} className="action-card" style={{ position: 'relative', cursor: 'default' }}>
                                    
                                    <button
                                        onClick={(e) => handleDelete(proj.id, e)}
                                        title="Borrar examen"
                                        style={{
                                            position: 'absolute', top: '-10px', right: '-10px', backgroundColor: '#ff4d4f', color: 'white',
                                            border: 'none', borderRadius: '50%', width: '28px', height: '28px', fontWeight: 'bold', fontSize: '16px',
                                            cursor: 'pointer', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                        }}
                                    >
                                        ×
                                    </button>

                                    {/* Icono de archivo que abre el examen */}
                                    <span 
                                        className="parts-exam-icon" 
                                        style={{ cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '110px', width: '100%' }}
                                        onClick={() => setSelectedProject(proj)}
                                        title="Abrir examen"
                                    >
                                        <img 
                                            src={examen} 
                                            alt="Abrir examen" 
                                            width="80" 
                                            height="80" 
                                            style={{ transition: 'transform 0.2s' }} 
                                            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                                            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                        />
                                    </span>

                                    {/* LÓGICA DE EDICIÓN DEL NOMBRE */}
                                    {editingId === proj.id ? (
                                        <input
                                            autoFocus
                                            value={tempName}
                                            onChange={(e) => setTempName(e.target.value)}
                                            onBlur={() => handleRename(proj.id)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    handleRename(proj.id);
                                                } else if (e.key === 'Escape') {
                                                    setEditingId(null); 
                                                }
                                            }}
                                            style={{ 
                                                marginTop: '10px', textAlign: 'center', width: '90%', fontSize: '14px', 
                                                padding: '5px', borderRadius: '4px', border: '2px solid #b08968', outline: 'none'
                                            }}
                                        />
                                    ) : (
                                        <span 
                                            className="card-label" 
                                            style={{ 
                                                cursor: 'text', marginTop: '10px', padding: '5px', 
                                                width: '100%', display: 'block', textAlign: 'center',
                                                border: '2px solid transparent' 
                                            }}
                                            onClick={(e) => { 
                                                e.stopPropagation(); 
                                                setEditingId(proj.id); 
                                                setTempName(proj.customName || `Examen de ${proj.domainName}`); 
                                            }}
                                            title="Haz clic para renombrar"
                                        >
                                            {proj.customName || `Examen de ${proj.domainName}`}
                                        </span>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p style={{ textAlign: 'center', color: '#888', marginTop: '40px' }}>
                                La carpeta está vacía. Genera un examen de este dominio para verlo aquí.
                            </p>
                        )}
                    </div>

                    <button onClick={() => setSelectedDomainFolder(null)} className="btn-back">
                        Volver
                    </button>
                </main>
            </div>
        );
    }

    // =========================================================
    // VISTA C: GRID DE CARPETAS PRINCIPALES (Nivel 1 ESTRICTO)
    // =========================================================
    return (
        <div className="exam-app">
            <header className="app-header">
                <div className="header-left">
                    <span className="logo-icon" onClick={onWelcome} style={{ cursor: 'pointer' }}>
                        <img src={logoExamCraft} alt="Logo" width="60" height="60" />
                    </span> 
                    <nav className="breadcrumb-nav">
                        <span className="breadcrumb-link" onClick={onWelcome}>INICIO</span>
                        <span className="breadcrumb-separator">{'>'}</span>
                        <span className="breadcrumb-current">EXÁMENES ANTERIORES</span>
                    </nav>
                </div>
            </header>

            <main className="main-content">
                <h1 className="main-title">MIS EXÁMENES</h1>
                
                <div className="subtitle-badge">
                    Selecciona una carpeta para ver sus exámenes
                </div>

                <div className="cards-container">
                    {allowedFolders.map((folderName) => {
                        const count = projects.filter(p => p.domainName && p.domainName.toLowerCase() === folderName).length;

                        return (
                            <button 
                                key={folderName} 
                                className="action-card" 
                                onClick={() => setSelectedDomainFolder(folderName)}
                            >
                                <span className="complete-exam-icon">
                                    <img src={carpeta} alt="Carpeta" width="110" height="110" />
                                </span>
                                
                                <span className="card-label" style={{ textTransform: 'capitalize' }}>
                                    {folderName}
                                </span>
                                
                                <span style={{ fontSize: '13px', color: '#000000', marginTop: '5px' }}>
                                    {count} {count === 1 ? 'examen' : 'exámenes'}
                                </span>
                            </button>
                        )
                    })}
                </div>

                <button onClick={onWelcome} className="btn-back">
                    Volver
                </button>
            </main>
        </div>
    );
}