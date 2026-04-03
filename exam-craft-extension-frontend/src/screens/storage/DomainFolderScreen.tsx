import React from "react";
import examen from "../../../assets/images/exam.png";
import { Header } from "~src/components/Header";

export interface DomainFolderScreenProps {
    selectedDomainFolder: string;
    projectsInFolder: any[];
    logoExamCraft: string;
    editingId: string | null;
    tempName: string;
    onWelcome: () => void;
    onBack: () => void;
    onSelectProject: (project: any) => void;
    onDeleteProject: (id: string, e?: React.MouseEvent) => void;
    onRenameProject: (id: string) => void;
    setEditingId: (id: string | null) => void;
    setTempName: (name: string) => void;
}

export const DomainFolderScreen: React.FC<DomainFolderScreenProps> = ({
    selectedDomainFolder,
    projectsInFolder,
    logoExamCraft,
    editingId,
    tempName,
    onWelcome,
    onBack,
    onSelectProject, 
    onDeleteProject,
    onRenameProject,
    setEditingId,
    setTempName
}) => {
            
    const breadcrumbItems = [
        { label: 'INICIO', action: onWelcome },
        { label: 'EXÁMENES ANTERIORES', action: onBack },
    ];

    const currentTitle = selectedDomainFolder.toUpperCase();

    return (
        <div className="exam-app">
            <Header 
                onWelcome={onWelcome} 
                breadcrumbItems={breadcrumbItems} 
                currentStep={currentTitle} 
            />
            <main className="main-content">
                <h1 className="main-title">CARPETA: {selectedDomainFolder.toUpperCase()}</h1>
                <div className="subtitle-badge">
                    Selecciona un examen para visualizar su contenido
                </div>
                
                <div className="cards-container">
                    {projectsInFolder.length > 0 ? (
                        projectsInFolder.map((proj) => (
                            <div key={proj.id} className="action-card" style={{ position: 'relative', cursor: 'default' }}>
                                
                                <button 
                                    onClick={(e) => onDeleteProject(proj.id, e)} 
                                    title="Borrar examen"
                                    style={{ position: 'absolute', top: '-10px', right: '-10px', backgroundColor: '#ff4d4f', color: 'white', border: 'none', borderRadius: '50%', width: '28px', height: '28px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                >
                                    ×
                                </button>
                                
                                <button
                                    className="parts-exam-icon"
                                    style={{ cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '110px', width: '100%', background: 'none', border: 'none', padding: 0 }}
                                    onClick={() => onSelectProject(proj)}
                                    title="Abrir examen"
                                >
                                    <img src={examen} alt="Abrir examen" width="80" height="80" />
                                </button>

                                {editingId === proj.id ? (
                                    <input 
                                        autoFocus 
                                        value={tempName}
                                        onChange={(e) => setTempName(e.target.value)}
                                        onBlur={() => onRenameProject(proj.id)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') { 
                                                e.preventDefault(); 
                                                onRenameProject(proj.id); 
                                            } else if (e.key === 'Escape') {
                                                setEditingId(null);
                                            }
                                        }}
                                        style={{ marginTop: '10px', textAlign: 'center', width: '90%', fontSize: '14px', padding: '5px', borderRadius: '4px', border: '2px solid #b08968', outline: 'none' }} 
                                    />
                                ) : (
                                    <button
                                        className="card-label"
                                        style={{ cursor: 'text', marginTop: '10px', padding: '5px 10px', width: '100%', display: 'block', textAlign: 'center', border: '2px solid transparent', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', background: '#f5ede3', borderRadius: '20px' }}
                                        onClick={(e) => { 
                                            e.stopPropagation(); 
                                            setEditingId(proj.id); 
                                            setTempName(proj.customName || `Examen de ${proj.domainName}`); 
                                        }}
                                        title={proj.customName || `Examen de ${proj.domainName}`}
                                    >
                                        {proj.customName || `Examen de ${proj.domainName}`}
                                    </button>
                                )}
                            </div>
                        ))
                    ) : (
                        <p style={{ textAlign: 'center', color: '#888', marginTop: '40px' }}>
                            La carpeta está vacía. Genera un examen de este dominio para verlo aquí.
                        </p>
                    )}
                </div>
                
                <button onClick={onBack} className="btn-back">Volver</button>
            </main>
        </div>
    );
};