import React from "react";
import 'highlight.js/styles/github.css';
import { Header } from "~src/components/Header";
import { parseJavaFiles } from "~src/utils/codeUtils";
import { JavaCodeBlock } from "~src/components/JavaCodeBlock";

export interface GeneratedSolutionCodeScreenProps {
    selectedProject: any;
    selectedDomainFolder: string;
    logoExamCraft: string;
    onWelcome: () => void;
    onBack: () => void;
    onGoToExams: () => void;
    onGoToFolders: () => void;
}

export const GeneratedSolutionCodeScreen: React.FC<GeneratedSolutionCodeScreenProps> = ({
    selectedProject,
    selectedDomainFolder,
    onWelcome,
    onBack,
    onGoToExams,
    onGoToFolders
}) => {
    const parsedAttributesConstraintsSolution = parseJavaFiles(selectedProject?.attributeConstraintsSolution || '');

    const breadcrumbItems = [
        { label: 'INICIO', action: onWelcome },
        { label: 'EXÁMENES ANTERIORES', action: onGoToFolders },
        { label: selectedDomainFolder?.toUpperCase(), action: onGoToExams },
        { label: selectedProject?.customName || `Examen de ${selectedProject?.domainName}`, action: onBack },
    ];

    return (
        <div className="exam-app" style={{ minHeight: '100vh', height: 'auto', overflow: 'visible', display: 'flex', flexDirection: 'column' }}>
            <Header onWelcome={onWelcome} breadcrumbItems={breadcrumbItems} currentStep="CÓDIGO SOLUCIÓN" />

            <main className="main-content" style={{ padding: '30px', paddingBottom: '100px', height: 'auto', overflow: 'visible', flex: 1 }}>
                <div className="section-block" style={{ marginBottom: '1px', marginTop: '20px' }}>
                    <h2 style={{ borderBottom: '2px solid #b08968', paddingBottom: '10px', marginBottom: '1px' }}>
                        Solución de Restricciones de Atributos
                    </h2>
                </div>

                <div className="section-block" style={{ width: '200%', marginBottom: '40px' }}>
                    <div className="content-card" style={{ padding: '20px' }}>
                        {parsedAttributesConstraintsSolution.length > 0 ? (
                            parsedAttributesConstraintsSolution.map((block) => (
                                <JavaCodeBlock key={block.filename} filename={block.filename} code={block.code} />
                            ))
                        ) : (
                            <p style={{ color: '#888', fontStyle: 'italic', textAlign: 'center', margin: '30px 0' }}>
                                Aún no se han generado la solución del ejercicio "Restricciones de Atributos" para este examen.
                            </p>
                        )}
                    </div>
                </div>

                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '15px' }}>
                    <button onClick={onBack} className="btn-back" style={{ position: 'relative', margin: 0 }}>
                        Volver
                    </button>
                </div>
            </main>
        </div>
    );
};