import React from "react";
import hljs from 'highlight.js/lib/core';
import java from 'highlight.js/lib/languages/java';
import 'highlight.js/styles/github.css';

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
    const tests = Array.isArray(rawTests) ? rawTests : rawTests ? [rawTests] : [];

    return (
        <div className="exam-app" style={{ minHeight: '100vh', height: 'auto', overflow: 'visible', display: 'flex', flexDirection: 'column' }}>
            <header className="app-header" style={{ position: 'sticky', top: 0, zIndex: 100 }}>
                <div className="header-left">
                    <span className="logo-icon" onClick={onGoToExams} style={{ cursor: 'pointer' }}>
                        <img src={logoExamCraft} alt="Logo" width="60" height="60" />
                    </span>
                    <nav className="breadcrumb-nav">
                        <span className="breadcrumb-link" onClick={onWelcome}>INICIO</span>
                        <span className="breadcrumb-separator">{'>'}</span>
                        <span className="breadcrumb-link" onClick={onGoToFolders}>EXÁMENES ANTERIORES</span>
                        <span className="breadcrumb-separator">{'>'}</span>
                        <span className="breadcrumb-link" onClick={onGoToExams}>{selectedDomainFolder?.toUpperCase()}</span>
                        <span className="breadcrumb-separator">{'>'}</span>
                        <span className="breadcrumb-link" onClick={onBack}>{selectedProject.customName || `Examen de ${selectedProject.domainName}`}</span>
                        <span className="breadcrumb-separator">{'>'}</span>
                        <span className="breadcrumb-current">CÓDIGO GENERADO</span>
                    </nav>
                </div>
            </header>

            <main className="main-content" style={{ padding: '30px', paddingBottom: '100px', height: 'auto', overflow: 'visible', flex: 1 }}>
                
                <div className="section-block" style={{ marginBottom: '1px', marginTop: '20px' }}>
                    <h2 style={{ borderBottom: '2px solid #b08968', paddingBottom: '10px', marginBottom: '1px' }}>
                        Clases Base Generadas
                    </h2>
                </div>
                <div className="section-block" style={{ width: '200%', marginBottom: '40px' }}>
                    <div className="content-card" style={{ padding: '20px' }}>
                        {selectedProject.baseClasses ? (
                            <textarea className="wf-textarea" readOnly value={selectedProject.baseClasses}
                                style={{ width: '100%', minHeight: '300px', resize: 'vertical', padding: '15px', fontSize: '14px', backgroundColor: '#f6f8fa', fontFamily: 'monospace' }} />
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