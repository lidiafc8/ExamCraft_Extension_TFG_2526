import React, { useState } from "react";
import 'highlight.js/styles/github.css';
import { Header } from "~src/components/Header";
import { parseJavaFiles } from "~src/utils/codeUtils";
import { JavaCodeBlock } from "~src/components/JavaCodeBlock";
import { DeleteConfirmationModal } from "~src/components/DeleteConfirmationModal";

export interface GeneratedCodeScreenProps {
    selectedProject: any;
    selectedDomainFolder: string;
    logoExamCraft: string;
    
    onWelcome: () => void;
    onBack: () => void;
    onGoToExams: () => void;
    onGoToFolders: () => void;
    onDeleteSection: (sectionKey: string) => void;
    onDeleteTest?: (testKey: string) => void; 
}

export const GeneratedCodeScreen: React.FC<GeneratedCodeScreenProps> = ({
    selectedProject,
    selectedDomainFolder,
    logoExamCraft,
    onWelcome,
    onBack,
    onGoToExams,
    onGoToFolders,
    onDeleteSection,
    onDeleteTest
}) => {
    const [itemToDelete, setItemToDelete] = useState<{ type: 'section' | 'test', key: string, name: string } | null>(null);

    const testPartsMap: Record<string, { fileName: string; code: string }> =
        selectedProject.testPartsMap || {};

    const tests = Object.entries(testPartsMap)
        .map(([key, part]) => ({ mapKey: key, ...part }))
        .filter((part) => part?.fileName && part?.code)
        .sort((a, b) => a.fileName.localeCompare(b.fileName));

    const parsedBaseClasses = parseJavaFiles(selectedProject.baseClasses || '');
                        
    const breadcrumbItems = [
        { label: 'INICIO', action: onWelcome },
        { label: 'EXÁMENES ANTERIORES', action: onGoToFolders },
        { label: selectedDomainFolder?.toUpperCase(), action: onGoToExams },
        { label: selectedProject.customName || `Examen de ${selectedProject.domainName}`, action: onBack },
    ];
    
    const currentTitle = "CÓDIGO EXAMEN";

    const confirmDelete = () => {
        if (itemToDelete) {
            if (itemToDelete.type === 'section') {
                onDeleteSection(itemToDelete.key);
            } else if (itemToDelete.type === 'test') {
                if (onDeleteTest) {
                    onDeleteTest(itemToDelete.key);
                } else {
                    onDeleteSection(`testPart:${itemToDelete.key}`);
                }
            }
            setItemToDelete(null);
        }
    };

    return (
        <div className="exam-app" style={{ minHeight: '100vh', height: 'auto', overflow: 'visible', display: 'flex', flexDirection: 'column' }}>
            <Header 
                onWelcome={onWelcome} 
                breadcrumbItems={breadcrumbItems} 
                currentStep={currentTitle} 
            />

            <main className="main-content" style={{ padding: '30px', paddingBottom: '100px', height: 'auto', overflow: 'visible', flex: 1 }}>
                
                {/* SECCIÓN: CLASES BASE */}
                <div className="section-block" style={{ marginBottom: '1px', marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '2px solid #b08968', paddingBottom: '10px' }}>
                    <h2 style={{ borderBottom: 'none', paddingBottom: '0', marginBottom: '0' }}>
                        Clases Base
                    </h2>
                    {parsedBaseClasses.length > 0 && (
                        <button type="button" onClick={() => setItemToDelete({ type: 'section', key: 'baseClasses', name: 'Clases Base' })} style={{ background: 'none', border: 'none', color: '#ff4d4f', cursor: 'pointer', fontSize: '18px', fontWeight: 'bold', padding: '0 5px' }} title="Eliminar Clases Base">
                            ✕
                        </button>
                    )}
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

                {/* SECCIÓN: TESTS DE JAVA */}
                <div className="section-block" style={{ marginBottom: '1px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '2px solid #b08968', paddingBottom: '10px' }}>
                    <h2 style={{ borderBottom: 'none', paddingBottom: '0', marginBottom: '0' }}>
                        Tests de Java
                    </h2>
                </div>
                
                <div className="section-block" style={{ width: '200%', marginBottom: '50px' }}>
                    <div className="content-card" style={{ padding: '20px' }}>
                        {tests.length > 0 ? (
                            tests.map((part) => (
                                <div key={part.mapKey} style={{ marginBottom: '30px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '5px' }}>
                                        <button 
                                            type="button" 
                                            onClick={() => setItemToDelete({ type: 'test', key: part.mapKey, name: part.fileName })} 
                                            style={{ background: 'none', border: 'none', color: '#ff4d4f', cursor: 'pointer', fontSize: '18px', fontWeight: 'bold', padding: '0 5px' }} 
                                            title={`Eliminar ${part.fileName}`}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                    <JavaCodeBlock
                                        filename={part.fileName}   
                                        code={part.code}          
                                    />
                                </div>
                            ))
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

                <DeleteConfirmationModal 
                    isOpen={!!itemToDelete}
                    itemName={itemToDelete?.name || ''}
                    onConfirm={confirmDelete}
                    onCancel={() => setItemToDelete(null)}
                />

            </main>
        </div>
    );
};