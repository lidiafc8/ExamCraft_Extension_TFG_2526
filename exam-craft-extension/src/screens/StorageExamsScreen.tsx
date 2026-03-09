import React, { useEffect, useState } from "react"
import logoExamCraft from "../../assets/icon512.png"
import carpeta from "../../assets/images/carpeta.png"
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
    // ESTADOS
    const [projects, setProjects] = useState<any[]>([]);
    const [selectedProject, setSelectedProject] = useState<any | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [tempName, setTempName] = useState("");

    // 1. CARGAR DATOS (Solo al montar el componente)
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
    const handleRename = (id: string, e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!tempName.trim()) {
            setEditingId(null);
            return;
        }

        const projectToUpdate = projects.find(p => p.id === id);
        if (!projectToUpdate) return;

        const { id: _, ...dataToSave } = projectToUpdate;
        const updatedData = { ...dataToSave, domainName: tempName };

        if (typeof chrome !== "undefined" && chrome.storage?.local) {
            chrome.storage.local.set({ [id]: updatedData }, () => {
                setProjects(projects.map(p => p.id === id ? { ...p, domainName: tempName } : p));
                setEditingId(null);
            });
        }
    };

    // --- VISTA A: DETALLE DEL EXAMEN SELECCIONADO ---
    if (selectedProject) {
        const mermaidCode = extractMermaidCode(selectedProject.extensionFinish);

        return (
            <div className="exam-app">
                <header className="app-header">
                    <div className="header-left">
                        <span className="logo-icon" onClick={() => setSelectedProject(null)} style={{ cursor: 'pointer' }}>
                            <img src={logoExamCraft} alt="Logo" width="50" height="50" />
                        </span>
                        <nav className="breadcrumb-nav">
                            <span className="breadcrumb-link" onClick={onWelcome}>INICIO</span>
                            <span className="breadcrumb-separator">{'>'}</span>
                            <span className="breadcrumb-link" onClick={() => setSelectedProject(null)}> EXÁMENES ALMACENADOS</span>
                            <span className="breadcrumb-separator">{'>'}</span>
                            <span className="breadcrumb-current">{selectedProject.domainName.toUpperCase()}</span>
                        </nav>
                    </div>
                </header>

                <main className="main-content" style={{ padding: '30px' }}>
                    <div style={{ display: 'flex', gap: '20px', height: '65vh' }}>
                        {/* Columna Texto */}
                        <div className="content-card" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <h3 style={{ marginBottom: '10px' }}>Enunciado Generado</h3>
                            <textarea 
                                className="wf-textarea" 
                                readOnly 
                                value={selectedProject.extensionFinish} 
                                style={{ flex: 1, resize: 'none', padding: '15px', fontSize: '14px' }}
                            />
                        </div>
                        {/* Columna Diagrama */}
                        <div className="content-card" style={{ flex: 1.5, backgroundColor: '#fff', display: 'flex', flexDirection: 'column' }}>
                            <h3 style={{ marginBottom: '10px' }}>Modelo UML</h3>
                            <div style={{ flex: 1, overflow: 'auto', border: '1px solid #eee', borderRadius: '8px' }}>
                                <MermaidViewer chartCode={cleanMermaidCode(mermaidCode)} />
                            </div>
                        </div>
                    </div>
                    <div style={{ marginTop: '20px', textAlign: 'center' }}>
                        <button onClick={() => setSelectedProject(null)} className="btn-step secondary">
                            Volver al Listado
                        </button>
                    </div>
                </main>
            </div>
        );
    }

    // --- VISTA B: GRID DE CARPETAS ---
    return (
        <div className="exam-app">
            <header className="app-header">
                <div className="header-left">
                    <span className="logo-icon" onClick={onWelcome} style={{ cursor: 'pointer' }}>
                        <img src={logoExamCraft} alt="Logo" width="50" height="50" />
                    </span> 
                    <nav className="breadcrumb-nav">
                        <span className="breadcrumb-link" onClick={onWelcome}>INICIO</span>
                        <span className="breadcrumb-separator">{'>'}</span>
                        <span className="breadcrumb-current">EXÁMENES ALMACENADOS</span>
                    </nav>
                </div>
            </header>

            <main className="main-content">
                <h1 className="main-title">MIS EXÁMENES</h1>

                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', 
                    gap: '40px', 
                    marginTop: '40px',
                    padding: '0 50px'
                }}>
                    {projects.length > 0 ? (
                        projects.map((proj) => (
                            <div key={proj.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                {/* Clic en la carpeta abre el examen */}
                                <img 
                                    src={carpeta} 
                                    alt="Carpeta" 
                                    width="110" 
                                    style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
                                    onClick={() => setSelectedProject(proj)}
                                    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                                    onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                />

                                {/* Lógica de Nombre / Edición */}
                                {editingId === proj.id ? (
                                    <input
                                        autoFocus
                                        value={tempName}
                                        onChange={(e) => setTempName(e.target.value)}
                                        onBlur={() => handleRename(proj.id)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleRename(proj.id)}
                                        style={{
                                            marginTop: '10px',
                                            textAlign: 'center',
                                            width: '140px',
                                            fontWeight: 'bold',
                                            border: '1px solid #b08968'
                                        }}
                                    />
                                ) : (
                                    <span 
                                        style={{ marginTop: '10px', fontWeight: 'bold', fontSize: '16px', color: '#4a3728', cursor: 'text' }}
                                        onClick={() => {
                                            setEditingId(proj.id);
                                            setTempName(proj.domainName);
                                        }}
                                    >
                                        {proj.domainName || "Sin nombre"}
                                    </span>
                                )}
                            </div>
                        ))
                    ) : (
                        <p style={{ gridColumn: '1/-1', textAlign: 'center', color: '#888' }}>
                            Aún no has guardado ningún examen.
                        </p>
                    )}
                </div>

                <div style={{ position: 'fixed', bottom: '30px', left: '30px' }}>
                    <button onClick={onWelcome} className="btn-step secondary">
                        ⬅ Volver
                    </button>
                </div>
            </main>
        </div>
    );
}