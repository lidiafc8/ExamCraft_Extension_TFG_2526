import React from "react";

import hljs from 'highlight.js/lib/core';
import java from 'highlight.js/lib/languages/java';
import 'highlight.js/styles/github.css';
import { Header } from "~src/components/Header";

hljs.registerLanguage('java', java);

export interface GeneratedSolutionCodeScreenProps {
    selectedProject: any;
    selectedDomainFolder: string;
    logoExamCraft: string;
    
    onWelcome: () => void;
    onBack: () => void;
    onGoToExams: () => void;
    onGoToFolders: () => void;
}

const parseAttributesConstraintsSolutionCode = (rawText: string) => {
    if (!rawText) return [];
    const results = [];
    
    const regex = /([a-zA-Z0-9_./\-]+\.java);?\s*```[a-z]*\r?\n([\s\S]*?)```/gi; // NOSONAR javascript:S5852
    let match;

    while ((match = regex.exec(rawText)) !== null) {
        const path = match[1];
        const code = match[2].trim();
        const filename = path.split('/').pop() || 'Archivo.java';
        
        results.push({ filename, code });
    }

    if (results.length === 0 && rawText.trim() !== '') {
        return [{ filename: 'Código Generado (Formato Irregular)', code: rawText }];
    }

    return results;
};

export const GeneratedSolutionCodeScreen: React.FC<GeneratedSolutionCodeScreenProps> = ({
    selectedProject,
    selectedDomainFolder,
    logoExamCraft,
    onWelcome,
    onBack,
    onGoToExams,
    onGoToFolders
}) => {

    const parsedAttributesConstraintsSolution = parseAttributesConstraintsSolutionCode(selectedProject.attributeConstraintsSolution || '');
                        
    const breadcrumbItems = [
        { label: 'INICIO', action: onWelcome },
        { label: 'EXÁMENES ANTERIORES', action: onGoToFolders },
        { label: selectedDomainFolder?.toUpperCase(), action: onGoToExams },
        { label: selectedProject.customName || `Examen de ${selectedProject.domainName}`, action: onBack },
    ];
    
    const currentTitle = "CÓDIGO SOLUCIÓN";

    return (
        <div className="exam-app" style={{ minHeight: '100vh', height: 'auto', overflow: 'visible', display: 'flex', flexDirection: 'column' }}>
            <Header 
                onWelcome={onWelcome} 
                breadcrumbItems={breadcrumbItems} 
                currentStep={currentTitle} 
            />

            <main className="main-content" style={{ padding: '30px', paddingBottom: '100px', height: 'auto', overflow: 'visible', flex: 1 }}>
                
                <div className="section-block" style={{ marginBottom: '1px', marginTop: '20px' }}>
                    <h2 style={{ borderBottom: '2px solid #b08968', paddingBottom: '10px', marginBottom: '1px' }}>
                        Solución de Restricciones de Atributos
                    </h2>
                </div>
                <div className="section-block" style={{ width: '200%', marginBottom: '40px' }}>
                    <div className="content-card" style={{ padding: '20px' }}>
                        {parsedAttributesConstraintsSolution.length > 0 ? (
                            parsedAttributesConstraintsSolution.map((block, i) => {
                                const highlighted = hljs.highlight(block.code, { language: 'java' }).value;
                                return (
                                    <div key={block.path} style={{ marginBottom: '24px' }}>
                                        <h4 style={{ marginBottom: '8px', color: '#555', fontFamily: 'monospace' }}>
                                            {block.filename}
                                        </h4>
                                        <pre style={{ margin: 0, borderRadius: '8px', overflow: 'auto', fontSize: '13px', maxHeight: '500px', backgroundColor: '#f6f8fa', padding: '20px', border: '1px solid #e1e4e8' }}>
                                            <code className="hljs language-java" dangerouslySetInnerHTML={{ __html: highlighted }} />
                                        </pre>
                                    </div>
                                );
                            })
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