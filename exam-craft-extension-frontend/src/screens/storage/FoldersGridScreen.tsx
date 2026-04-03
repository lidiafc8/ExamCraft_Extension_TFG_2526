import React from "react";
import carpeta from "../../../assets/images/archive.png";


export interface FoldersGridScreenProps {
    allowedFolders: string[];
    projects: any[];
    logoExamCraft: string;
    onWelcome: () => void;
    onSelectFolder: (folderName: string) => void;
}

export const FoldersGridScreen: React.FC<FoldersGridScreenProps> = ({
    allowedFolders,
    projects,
    logoExamCraft,
    onWelcome,
    onSelectFolder
}) => {

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
    ];

    return (
        <div className="exam-app">
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
                        <span className="breadcrumb-current">EXÁMENES ANTERIORES</span>
                    </nav>
                </div>
            </header>
            
            <main className="main-content">
                <h1 className="main-title">MIS EXÁMENES</h1>
                <div className="subtitle-badge">Selecciona un dominio</div>
                
                <div className="cards-container">
                    {allowedFolders.map((folderName) => {
                        const count = projects.filter(p => p.domainName && p.domainName.toLowerCase() === folderName).length;
                        return (
                            <button 
                                key={folderName} 
                                className="action-card" 
                                onClick={() => onSelectFolder(folderName)}
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
                        );
                    })}
                </div>
                
                <button onClick={onWelcome} className="btn-back">Volver</button>
            </main>
        </div>
    );
};