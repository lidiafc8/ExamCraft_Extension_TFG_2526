import React from "react";
import 'highlight.js/styles/github.css';
import { Header } from "~src/components/Header";
import { parseJavaFiles } from "~src/utils/codeUtils";
import { JavaCodeBlock } from "~src/components/JavaCodeBlock";

export interface GeneratedCodeScreenProps {
    selectedProject: any;
    selectedDomainFolder: string;
    logoExamCraft: string;
    
    onWelcome: () => void;
    onBack: () => void;
    onGoToExams: () => void;
    onGoToFolders: () => void;
}

export const GeneratedCodeScreen: React.FC<GeneratedCodeScreenProps> = ({
    selectedProject,
    selectedDomainFolder,
    logoExamCraft,
    onWelcome,
    onBack,
    onGoToExams,
    onGoToFolders
}) => {
    const rawTests = selectedProject.javaTests;

    let tests: any[] = [];
    if (Array.isArray(rawTests)) {
        tests = rawTests;
    } else if (rawTests) {
        tests = [rawTests];
    }

    const parsedBaseClasses = parseJavaFiles(selectedProject.baseClasses || '');
                        
    const breadcrumbItems = [
        { label: 'INICIO', action: onWelcome },
        { label: 'EXÁMENES ANTERIORES', action: onGoToFolders },
        { label: selectedDomainFolder?.toUpperCase(), action: onGoToExams },
        { label: selectedProject.customName || `Examen de ${selectedProject.domainName}`, action: onBack },
    ];
    
    const currentTitle = "CÓDIGO EXAMEN";

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
                        Clases Base
                    </h2>
                </div>
                <div className="section-block" style={{ width: '200%', marginBottom: '40px' }}>
                    <div className="content-card" style={{ padding: '20px' }}>
                        {parsedBaseClasses.length > 0 ? (
                            parsedBaseClasses.map((block) => (
                                <JavaCodeBlock 
                                    key={block.path} 
                                    filename={block.filename} 
                                    code={block.code} 
                                />
                            ))
                        ) : (
                            <p style={{ color: '#888', fontStyle: 'italic', textAlign: 'center', margin: '30px 0' }}>
                                Aún no se han generado las clases base para este examen.
                            </p>
                        )}
                    </div>
                </div>

                <div className="section-block" style={{ marginBottom: '1px' }}>
                    <h2 style={{ borderBottom: '2px solid #b08968', paddingBottom: '10px', marginBottom: '1px' }}>
                        Tests de Java
                    </h2>
                </div>
                <div className="section-block" style={{ width: '200%', marginBottom: '50px' }}>
                    <div className="content-card" style={{ padding: '20px' }}>
                        {tests.length > 0 ? (
                            tests.map((test, i) => {
                                const cleanCode = test.trim()
                                    .replace(/^```[a-z]*\r?\n/i, '')
                                    .replace(/\r?\n```$/i, '')
                                    .trim();
                                
                                return (
                                    <JavaCodeBlock 
                                        key={`test-${i}`} 
                                        filename={`Test${i + 1}.java`} 
                                        code={cleanCode} 
                                    />
                                );
                            })
                        ) : (
                            <p style={{ color: '#888', fontStyle: 'italic', textAlign: 'center', margin: '30px 0' }}>
                                Aún no se han generado los tests para este examen.
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