import React, { useState } from "react";
import examen from "../../../assets/images/exam.png";
import { Header } from "~src/components/Header";
import { DeleteConfirmationModal } from "~src/components/modals/DeleteConfirmationModal";
import "../../css/CommonText.css";
import "../../css/Cards.css";

export interface DomainFolderScreenProps {
    selectedDomainFolder: string;
    projectsInFolder: any[];
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
    const [projectToDelete, setProjectToDelete] = useState<{ id: string, name: string } | null>(null);

    const breadcrumbItems = [
        { label: 'INICIO', action: onWelcome },
        { label: 'EXÁMENES ANTERIORES', action: onBack },
    ];

    const currentTitle = selectedDomainFolder.toUpperCase();

    const handleDeleteClick = (id: string, name: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setProjectToDelete({ id, name });
    };

    const confirmDelete = () => {
        if (projectToDelete) {
            onDeleteProject(projectToDelete.id);
            setProjectToDelete(null);
        }
    };

    return (
        <div>
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
                    {projectsInFolder.map((proj) => {
                        const displayName = proj.customName || `Examen de ${proj.domainName}`;

                        return (
                            <div key={proj.id} className="action-card">

                                <button
                                    onClick={(e) => handleDeleteClick(proj.id, displayName, e)}
                                    title="Borrar examen"
                                    className="btn-cross"
                                >
                                    ×
                                </button>

                                <button
                                    className="btn-icon"
                                    onClick={() => onSelectProject(proj)}
                                    title="Abrir examen"
                                >
                                    <img src={examen} alt="Abrir examen" />
                                </button>

                                {editingId === proj.id ? (
                                    <input
                                        autoFocus
                                        className="card-label" 
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
                                    />
                                ) : (
                                    <button
                                        className="card-label"
                                        
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setEditingId(proj.id);
                                            setTempName(displayName);
                                        }}
                                        title={displayName}
                                    >
                                        {displayName}
                                    </button>
                                )}
                            </div>
                        );
                    })
                    }
                </div>

                <button onClick={onBack} className="btn-back">Volver</button>

                <DeleteConfirmationModal
                    isOpen={!!projectToDelete}
                    itemName={projectToDelete?.name || ''}
                    isExam={true}
                    onConfirm={confirmDelete}
                    onCancel={() => setProjectToDelete(null)}
                />
            </main>
        </div>
    );
};