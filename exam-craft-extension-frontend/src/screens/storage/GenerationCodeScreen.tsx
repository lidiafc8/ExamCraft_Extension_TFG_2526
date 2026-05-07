import React, { useState } from "react";
import 'highlight.js/styles/github.css';
import { Header } from "~src/components/Header";
import { parseJavaFiles } from "~src/utils/codeUtils";
import { JavaCodeBlock } from "~src/components/JavaCodeBlock";
import { DeleteConfirmationModal } from "~src/components/modals/DeleteConfirmationModal";
import "./css/StorageScreen.css";
import "./css/GeneratedCodeScreen.css";
import "../../css/CommonText.css";

export interface GeneratedCodeScreenProps {
    selectedProject: any;
    selectedDomainFolder: string;
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
    onWelcome,
    onBack,
    onGoToExams,
    onGoToFolders,
    onDeleteSection,
    onDeleteTest,
}) => {
    const [itemToDelete, setItemToDelete] = useState<{ type: 'section' | 'test'; key: string; name: string } | null>(null);

    const testPartsMap: Record<string, { fileName: string; code: string }> =
        selectedProject.testPartsMap || {};

    const tests = Object.entries(testPartsMap)
        .map(([key, part]) => ({ mapKey: key, ...part }))
        .filter((part) => part?.fileName && part?.code)
        .sort((a, b) => a.fileName.localeCompare(b.fileName));

    const parsedBaseClasses = parseJavaFiles(selectedProject.baseClasses || '');

    const breadcrumbItems = [
        { label: 'INICIO',              action: onWelcome },
        { label: 'EXÁMENES ANTERIORES', action: onGoToFolders },
        { label: selectedDomainFolder?.toUpperCase(), action: onGoToExams },
        { label: selectedProject.customName || `Examen de ${selectedProject.domainName}`, action: onBack },
    ];

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
        <div>
            <Header
                onWelcome={onWelcome}
                breadcrumbItems={breadcrumbItems}
                currentStep="CÓDIGO EXAMEN"
            />
            <div className="main-content">
                <main className="storage-main">

                    <div className="storage-section-heading">
                        <h2>Clases Base</h2>
                        {parsedBaseClasses.length > 0 && (
                            <button
                                type="button"
                                className="storage-delete-btn"
                                onClick={() => setItemToDelete({ type: 'section', key: 'baseClasses', name: 'Clases Base' })}
                                title="Eliminar Clases Base"
                            >
                                ✕
                            </button>
                        )}
                    </div>

                    <div className="storage-section-content">
                        <div className="wide-card">
                            <div className="card-header">
                                <h3>Archivos de Clases Base</h3>
                            </div>
                            <div className="content-card">
                                {parsedBaseClasses.length > 0 ? (
                                    parsedBaseClasses.map((block) => (
                                        <JavaCodeBlock
                                            key={block.path}
                                            filename={block.filename}
                                            code={block.code}
                                        />
                                    ))
                                ) : (
                                    <p className="storage-empty-state">
                                        Aún no se han generado las clases base para este examen.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="storage-section-heading">
                        <h2>Tests de Java</h2>
                    </div>

                    <div className="storage-section-content storage-section-content--tests">
                        <div className="wide-card">
                            <div className="card-header">
                                <h3>Archivos de Test</h3>
                            </div>
                            <div className="content-card">
                                {tests.length > 0 ? (
                                    tests.map((part) => (
                                        <div key={part.mapKey} className="generated-test-item">
                                            <div className="generated-test-item-actions">
                                                <button
                                                    type="button"
                                                    className="storage-delete-btn"
                                                    onClick={() => setItemToDelete({ type: 'test', key: part.mapKey, name: part.fileName })}
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
                                    <p className="storage-empty-state">
                                        Aún no se han generado los tests para este examen.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="storage-bottom-actions">
                        <button type="button" onClick={onBack} className="btn-back">
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
        </div>
    );
};