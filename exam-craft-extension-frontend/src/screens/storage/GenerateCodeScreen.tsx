import React from "react";

import hljs from 'highlight.js/lib/core';
import java from 'highlight.js/lib/languages/java';
import 'highlight.js/styles/github.css';
import { Header } from "~src/components/Header";

hljs.registerLanguage('java', java);

export interface GeneratedCodeScreenProps {
    selectedProject: any;
    selectedDomainFolder: string;
    logoExamCraft: string;
    
    onWelcome: () => void;
    onBack: () => void;
    onGoToExams: () => void;
    onGoToFolders: () => void;
}

const parseBaseClasses = (rawText: string) => {
    if (!rawText) return [];
    const results = [];
    
    const regex = /([a-z0-9.\-/]+\.java)\s*[:;]?\s*```[a-z]*\s*\n((?=([\s\S]*?))\3)```/gi; // NOSONAR javascript:S5852
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

    const parsedBaseClasses = parseBaseClasses(selectedProject.baseClasses || '');
                        
    const breadcrumbItems = [
        { label: 'INICIO', action: onWelcome },
        { label: 'EXÁMENES ANTERIORES', action: onGoToFolders },
        { label: selectedDomainFolder?.toUpperCase(), action: onGoToExams },
        { label: selectedProject.customName || `Examen de ${selectedProject.domainName}`, action: onBack },
    ];
    
    const currentTitle = "CÓDIGO GENERADO";

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
                        Clases Base Generadas
                    </h2>
                </div>
                <div className="section-block" style={{ width: '200%', marginBottom: '40px' }}>
                    <div className="content-card" style={{ padding: '20px' }}>
                        {parsedBaseClasses.length > 0 ? (
                            parsedBaseClasses.map((block, i) => {
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
                                
                                const highlighted = hljs.highlight(cleanCode, { language: 'java' }).value;
                                
                                return (
                                    <div key={test.substring(0, 20)} style={{ marginBottom: '24px' }}>
                                        <h4 style={{ marginBottom: '8px', color: '#555', fontFamily: 'monospace' }}>
                                            Test{i + 1}.java
                                        </h4>
                                        <pre style={{ margin: 0, borderRadius: '8px', overflow: 'auto', fontSize: '13px', maxHeight: '500px', backgroundColor: '#f6f8fa', padding: '20px', border: '1px solid #e1e4e8' }}>
                                            <code className="hljs language-java" dangerouslySetInnerHTML={{ __html: highlighted }} />
                                        </pre>
                                    </div>
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