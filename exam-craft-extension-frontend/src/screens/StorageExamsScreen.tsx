import React, { useEffect, useState } from "react"
import { marked } from 'marked';
import DOMPurify from 'dompurify';

import logoExamCraft from "../../assets/icon512.png"
import carpeta from "../../assets/images/archive.png"
import examen from "../../assets/images/exam.png"
import { MermaidViewer } from "../components/MermaidViewer"
import { GithubService } from "~src/services/githubService";

interface Props {
    readonly onWelcome: () => void;
}


const cleanMermaidCode = (code: string) => {
    if (!code) return '';
    return code.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ').trim();
};

const extractMermaidCode = (fullText: string) => {
    if (!fullText) return "";
    const separatorRegex = /-{5,}|={5,}/; 
    const parts = fullText.split(separatorRegex);
    const diagramPart = parts.find(p => p.toLowerCase().includes("classdiagram") || p.toLowerCase().includes("graph")) || "";
    return diagramPart.replace(/.*?(classDiagram|graph)/is, "$1").trim();
};

const sanitizeMermaidForModal = (code: string) => {
    if (!code) return '';
    
    const match = code.match(/(classDiagram|graph)[\s\S]*/i);
    if (!match) return ''; 

    let clean = match[0];

    clean = clean
        .replace(/<br\s*[\/]?>/gi, '\n')      
        .replace(/<\/?p[^>]*>/gi, '\n')       
        .replace(/<\/?div[^>]*>/gi, '\n')      
        .replace(/<\/?span[^>]*>/gi, '')      
        .replace(/&nbsp;/g, ' ')               
        .replace(/&lt;/g, '<')                
        .replace(/&gt;/g, '>');                

    return clean.trim();
};

export default function StorageExamsScreen({ onWelcome }: Props) {

    const [projects, setProjects] = useState<any[]>([]);
    const [selectedDomainFolder, setSelectedDomainFolder] = useState<string | null>(null);
    const [selectedProject, setSelectedProject] = useState<any | null>(null);
    
    const [editingId, setEditingId] = useState<string | null>(null);
    const [tempName, setTempName] = useState("");
    
    const [showPreviewModal, setShowPreviewModal] = useState(false);

    const [isCreating, setIsCreating] = useState(false)

    useEffect(() => {
        if (typeof chrome !== "undefined" && chrome.storage?.local) {
            chrome.storage.local.get(null, (items) => {
                const projectList = Object.keys(items)
                    .filter(key => key.startsWith('project_'))
                    .map(key => ({
                        id: key,
                        ...items[key]
                    }));
                setProjects(projectList);
            });
        }
    }, []);

    const handleRename = (id: string) => {
        if (!tempName.trim()) {
            setEditingId(null);
            return;
        }

        const projectToUpdate = projects.find(p => p.id === id);
        if (!projectToUpdate) return;


        const updatedData = { ...projectToUpdate, customName: tempName.trim() };

        if (typeof chrome !== "undefined" && chrome.storage?.local) {
            chrome.storage.local.set({ [id]: updatedData }, () => {
                setProjects(prevProjects => prevProjects.map(p => 
                    p.id === id ? { ...p, customName: tempName.trim() } : p
                ));
                setEditingId(null); 
            });
        }
    };

    const handleDelete = (id: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation(); 
        
        const confirmDelete = window.confirm("¿Estás seguro de que quieres borrar este examen? Esta acción no se puede deshacer.");
        
        if (confirmDelete) {
            if (typeof chrome !== "undefined" && chrome.storage?.local) {
                chrome.storage.local.remove(id, () => {
                    setProjects(prevProjects => prevProjects.filter(p => p.id !== id));
                    if (selectedProject && selectedProject.id === id) {
                        setSelectedProject(null);
                    }
                });
            }
        }
    };

    const handleDownload = () => {
        if (!selectedProject) return;

        const title = `Examen_Completo_${selectedProject.customName}` || `Examen de ${selectedProject.domainName}`;
        
        const fullText = selectedProject.extensionFinish || '';
        const mermaidMatch = fullText.match(/(classDiagram|graph)[\s\S]*/i);
        
        let introText = fullText;
        let finalMermaidCode = '';

        if (mermaidMatch) {
            introText = fullText.substring(0, mermaidMatch.index).trim();
            finalMermaidCode = sanitizeMermaidForModal(fullText); 
        }

        const markdownContent = `# ${title}

## 1. Extensión Funcional
${introText || "No hay datos de extensión funcional."}

${finalMermaidCode ? `\`\`\`mermaid\n${finalMermaidCode}\n\`\`\`` : ''}

## 2. Restricciones de Atributos
${selectedProject.attributeConstraints || "No se crearon restricciones de atributos para este examen."}

## 3. Relaciones entre Entidades
${selectedProject.entityRelations || "No se crearon relaciones entre entidades para este examen."}

## 4. Tests de Java (JUnit)
\`\`\`java
${selectedProject.javaTests || "// No hay tests generados para este examen."}
\`\`\`
`;

        const defaultName = title.replace(/[^a-z0-9áéíóúñ]/gi, '_').toLowerCase();
        
        const userChosenName = prompt("Introduce el nombre para el archivo a descargar:", defaultName);
        
        if (userChosenName === null) return; 
        
        let finalFileName = userChosenName.trim() || defaultName;
        if (!finalFileName.toLowerCase().endsWith('.md')) {
            finalFileName += '.md';
        }

        const blob = new Blob([markdownContent], { type: "text/markdown;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement("a");
        link.href = url;
        link.download = finalFileName;
        
        document.body.appendChild(link);
        link.click();
        
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleGitHubDeploy = async () => {
        const cleanProjectName = selectedProject.domainName
            .normalize("NFD") // Separa las letras de sus tildes (ej: í -> i + ´)
            .replace(/[\u0300-\u036f]/g, "") // Elimina los caracteres de las tildes
            .replace(/[^a-zA-Z0-9]/g, '-') 
            .toLowerCase();
        
        const newRepoName = `examen-${cleanProjectName}-${Date.now()}`;

        let TEMPLATE_REPO = "";
        let TEST_BASE_PATH = "";
        const domain = selectedProject.domainName.toLowerCase();

        if (domain.includes("ajedrez")) {
            TEMPLATE_REPO = "DP1-chess-template-exam";
            TEST_BASE_PATH = "src/test/java/es/us/dp1/chess/tournament/";
        } 
        else if (domain.includes("clínica veterinaria") || domain.includes("veterinaria")) { 
            TEMPLATE_REPO = "DP1-petClinic-template-exam";       
            TEST_BASE_PATH = "src/test/java/org/springframework/samples/petclinic/grooming/"; 
        } 
        else {
            TEMPLATE_REPO = "DP1-chess-template-exam";
            TEST_BASE_PATH = "src/test/java/es/us/dp1/chess/tournament/";
        }

        // --- LÓGICA DE TOKEN SEGURA ---
        let MY_TOKEN = localStorage.getItem("github_token");

        if (!MY_TOKEN) {
            MY_TOKEN = window.prompt(
                "Para crear repositorios en GitHub necesitas un Token de acceso (Personal Access Token).\n\n" +
                "Por favor, pégalo aquí (se guardará de forma segura en tu navegador para la próxima vez):"
            );

            if (!MY_TOKEN) {
                alert("Operación cancelada. Se requiere un token de GitHub para continuar.");
                return;
            }

            localStorage.setItem("github_token", MY_TOKEN);
        }

        const confirmacion = window.confirm(
            `¿Confirmas la creación del examen?\n\n` +
            `Dominio detectado: ${selectedProject.domainName}\n` +
            `Plantilla seleccionada: lidiafc8/${TEMPLATE_REPO}\n` +
            `Nuevo Repo: ${newRepoName}\n\n` +
            `Se subirán:\n- descripcion_control_check.md\n- Todos los tests de Java detectados.`
        );

        if (!confirmacion) return;

        setIsCreating(true);

        try {
            const userResponse = await fetch("https://api.github.com/user", {
                headers: { Authorization: `token ${MY_TOKEN}` }
            });

            if (!userResponse.ok) {
                throw new Error("Token inválido o caducado (Requires authentication)");
            }

            const userData = await userResponse.json();
            const TARGET_OWNER = userData.login; 
            const TEMPLATE_OWNER = "lidiafc8";  

            const newRepo = await GithubService.createRepoFromTemplate(
                MY_TOKEN,
                TEMPLATE_OWNER, 
                TEMPLATE_REPO, 
                newRepoName
            );

            await new Promise(resolve => setTimeout(resolve, 2000));

            const title = `Examen_Completo_${selectedProject.customName || selectedProject.domainName}`;
            const fullText = selectedProject.extensionFinish || '';
            const mermaidMatch = fullText.match(/(classDiagram|graph)[\s\S]*/i);
            
            let introText = fullText;
            let finalMermaidCode = '';

            if (mermaidMatch) {
                introText = fullText.substring(0, mermaidMatch.index).trim();
                finalMermaidCode = sanitizeMermaidForModal(fullText); 
            }

            const markdownContent = `# ${title}\n\n` +
                `## 1. Extensión Funcional\n${introText || "No hay datos de extensión funcional."}\n\n` +
                (finalMermaidCode ? `\`\`\`mermaid\n${finalMermaidCode}\n\`\`\`\n\n` : '') +
                `## 2. Restricciones de Atributos\n${selectedProject.attributeConstraints || "No se crearon restricciones de atributos para este examen."}\n\n` +
                `## 3. Relaciones entre Entidades\n${selectedProject.entityRelations || "No se crearon relaciones entre entidades para este examen."}\n`;

            await GithubService.createOrUpdateFile(
                MY_TOKEN,
                TARGET_OWNER, 
                newRepoName,
                "descripcion_control_check.md", 
                markdownContent,
                "Añadir enunciado y restricciones del control check" 
            );

            if (selectedProject.javaTests) {
                const allTestsCode = selectedProject.javaTests;

                const regex = /###\s*`?([a-zA-Z0-9_]+\.java)`?\s*([\s\S]*?)(?=###\s*`?[a-zA-Z0-9_]+\.java`?|$)/gi;
                const matches = [...allTestsCode.matchAll(regex)];

                if (matches.length > 0) {
                    for (const match of matches) {
                        const fileName = match[1]; 
                        let fileContent = match[2].trim();

                        fileContent = fileContent.replace(/^```[a-z]*\n/i, '').replace(/```$/i, '').trim();

                        const filePath = `${TEST_BASE_PATH}${fileName}`;

                        await GithubService.createOrUpdateFile(
                            MY_TOKEN,
                            TARGET_OWNER,
                            newRepoName,
                            filePath,
                            fileContent, 
                            `Añadir test automático: ${fileName}`
                        );
                    }
                } else {
                    console.warn("No se detectaron marcas de archivos separadas. Subiendo todo junto.");
                    
                    let fallbackContent = allTestsCode.trim();
                    fallbackContent = fallbackContent.replace(/^```[a-z]*\n/i, '').replace(/```$/i, '').trim();

                    const fallbackPath = `${TEST_BASE_PATH}Test1Extension.java`;

                    await GithubService.createOrUpdateFile(
                        MY_TOKEN,
                        TARGET_OWNER, 
                        newRepoName,
                        fallbackPath,
                        fallbackContent, 
                        "Añadir tests automáticos (Fallback)"
                    );
                }
            }

            alert("¡Repositorio creado y todos los archivos subidos con éxito!");
            window.open(newRepo.html_url, '_blank');

        } catch (error: any) {
            console.error("Error al desplegar:", error);
            
            if (error.message.includes("Bad credentials") || error.message.includes("401") || error.message.includes("Requires authentication")) {
                localStorage.removeItem("github_token");
                alert("El token de GitHub ha caducado, es inválido o no tiene permisos. Vuelve a intentarlo para introducir uno nuevo.");
            } else {
                alert(`Error: ${error.message}`);
            }
        } finally {
            setIsCreating(false);
        }
    };

        const allowedFolders = ["clínica veterinaria", "ajedrez"];
        const projectsInFolder = projects.filter(p => 
            p.domainName && selectedDomainFolder && p.domainName.toLowerCase() === selectedDomainFolder.toLowerCase()
        );

    // =========================================================
    // VISTA A: DETALLE DEL EXAMEN SELECCIONADO (Nivel 3)
    // =========================================================
    if (selectedProject) {
        const mermaidCode = extractMermaidCode(selectedProject.extensionFinish);
        
        const fullText = selectedProject.extensionFinish || '';
        const mermaidMatch = fullText.match(/(classDiagram|graph)[\s\S]*/i);
        
        let introText = fullText;
        let modalMermaidCode = '';

        if (mermaidMatch) {
            introText = fullText.substring(0, mermaidMatch.index).trim();
            modalMermaidCode = sanitizeMermaidForModal(fullText);
        }

        const examFullMarkdown = `
# Examen ${selectedProject.domainName}: ${selectedProject.customName || `Examen de ${selectedProject.domainName}`}

## 1. Extensión Funcional y Diagrama UML
${introText || '*Sin extensión funcional*'}

${modalMermaidCode ? `\`\`\`mermaid\n${modalMermaidCode}\n\`\`\`` : ''}

## 2. Restricciones de Atributos
${selectedProject.attributeConstraints || '*Sin restricciones para atributos definidas*'}

## 3. Relaciones entre Entidades
${selectedProject.entityRelations || '*Sin relaciones entre entidades definidas*'}
        `.trim();

        const rawHtml = marked.parse(examFullMarkdown) as string;
        const safeHtml = DOMPurify.sanitize(rawHtml);

        return (
            <div className="exam-app" style={{ minHeight: '100vh', height: 'auto', overflow: 'visible', display: 'flex', flexDirection: 'column' }}>
                
                <header className="app-header" style={{ position: 'sticky', top: 0, zIndex: 100 }}>
                    <div className="header-left">
                        <span className="logo-icon" onClick={() => setSelectedProject(null)} style={{ cursor: 'pointer' }}>
                            <img src={logoExamCraft} alt="Logo" width="60" height="60" />
                        </span>
                        <nav className="breadcrumb-nav">
                            <span className="breadcrumb-link" onClick={onWelcome}>INICIO</span>
                            <span className="breadcrumb-separator">{'>'}</span>
                            <span className="breadcrumb-link" onClick={() => { setSelectedProject(null); setSelectedDomainFolder(null); }}>EXÁMENES ANTERIORES</span>
                            <span className="breadcrumb-separator">{'>'}</span>
                            <span className="breadcrumb-link" onClick={() => setSelectedProject(null)}>{selectedDomainFolder?.toUpperCase()}</span>
                            <span className="breadcrumb-separator">{'>'}</span>
                            <span className="breadcrumb-current">{selectedProject.customName || `Examen de ${selectedProject.domainName}`}</span>
                        </nav>
                    </div>
                </header>

                <main className="main-content" style={{ padding: '30px', paddingBottom: '100px', height: 'auto', overflow: 'visible', flex: 1 }}>
                    
                    <div className="section-block" style={{marginBottom: '1px' }}>
                        <h2 style={{ borderBottom: '2px solid #b08968', paddingBottom: '10px', marginBottom: '20px' }}>
                            Extensión Funcional
                        </h2>
                    </div>
                        
                    <div className="section-block" style={{ width: '80%',marginBottom: '0px' }}>
                        <div style={{ display: 'flex', gap: '10px', height: '600px' }}>
                            <div className="content-card" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <h3 style={{ marginBottom: '10px' }}>ENUNCIADO Y CÓDIGO DIAGRAMA UML</h3>
                                <textarea className="wf-textarea" readOnly value={selectedProject.extensionFinish} style={{ flex: 1, resize: 'none', padding: '15px', fontSize: '14px' }} />
                            </div>
                            <div className="content-card" style={{ flex: 1.5, backgroundColor: '#fff', display: 'flex', flexDirection: 'column' }}>
                                <h3 style={{ marginBottom: '10px' }}>ILUSTRACIÓN DIAGRAMA UML</h3>
                                <div style={{ flex: 1, overflow: 'auto', border: '1px solid #eee', borderRadius: '8px' }}>
                                    <MermaidViewer chartCode={cleanMermaidCode(mermaidCode)} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="section-block" style={{marginBottom: '1px', marginTop: '40px' }}>
                        <h2 style={{ borderBottom: '2px solid #b08968', paddingBottom: '10px', marginBottom: '1px' }}>
                            Restricciones de Atributos
                        </h2>
                    </div>

                    <div className="section-block" style={{ width: '200%',marginBottom: '50px' }}>
                        <div className="content-card" style={{ padding: '20px' }}>
                            {selectedProject.attributeConstraints ? (
                                <textarea 
                                    className="wf-textarea" 
                                    readOnly 
                                    value={selectedProject.attributeConstraints} 
                                    style={{ width: '100%', minHeight: '500px', resize: 'vertical', padding: '15px', fontSize: '14px' }} 
                                />
                            ) : (
                                <p style={{ color: '#888', fontStyle: 'italic', textAlign: 'center', margin: '30px 0' }}>
                                    Aún no se han creado las restricciones de atributos para este examen.
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="section-block" style={{marginBottom: '1px' }}>
                        <h2 style={{ borderBottom: '2px solid #b08968', paddingBottom: '10px', marginBottom: '1px' }}>
                            Relaciones entre Entidades
                        </h2>
                    </div>
                        
                    <div className="section-block" style={{ width: '200%',marginBottom: '50px' }}>
                        <div className="content-card" style={{ padding: '20px' }}>
                            {selectedProject.entityRelations ? (
                                <textarea 
                                    className="wf-textarea" 
                                    readOnly 
                                    value={selectedProject.entityRelations} 
                                    style={{ width: '100%', minHeight: '200px', resize: 'vertical', padding: '15px', fontSize: '14px' }} 
                                />
                            ) : (
                                <p style={{ color: '#888', fontStyle: 'italic', textAlign: 'center', margin: '30px 0' }}>
                                    Aún no se han creado las relaciones entre entidades para este examen.
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="section-block" style={{marginBottom: '1px', marginTop: '40px' }}>
                        <h2 style={{ borderBottom: '2px solid #b08968', paddingBottom: '10px', marginBottom: '1px' }}>
                            Tests de Java
                        </h2>
                    </div>
                        
                    <div className="section-block" style={{ width: '200%', marginBottom: '50px' }}>
                        <div className="content-card" style={{ padding: '20px' }}>
                            {selectedProject.javaTests ? (
                                <textarea 
                                    className="wf-textarea" 
                                    readOnly 
                                    value={selectedProject.javaTests} 
                                    style={{ 
                                        width: '100%', 
                                        minHeight: '400px', 
                                        resize: 'vertical', 
                                        padding: '15px', 
                                        fontSize: '13px', 
                                        fontFamily: 'monospace', 
                                        backgroundColor: '#f9f9f9' 
                                    }} 
                                />
                            ) : (
                                <p style={{ color: '#888', fontStyle: 'italic', textAlign: 'center', margin: '30px 0' }}>
                                    Aún no se han generado los tests para este examen.
                                </p>
                            )}
                        </div>
                    </div>

                    <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '15px' }}>
                        <button onClick={() => setSelectedProject(null)} className="btn-back" style={{ position: 'relative', margin: 0 }}>
                            Volver
                        </button>
                        
                        <button 
                            onClick={() => setShowPreviewModal(true)} 
                            className="btn-back"
                            style={{ position: 'relative', margin: 0, backgroundColor: '#2e7d32', color: 'white' }}
                        >
                            Previsualizar
                        </button>

                        <button 
                            onClick={handleDownload} 
                            className="btn-back"
                            style={{ position: 'relative', margin: 0, backgroundColor: '#4a90e2', color: 'white', borderColor: '#4a90e2' }}
                        >
                            Descargar (.md)
                        </button>

                        <button 
                            onClick={(e) => handleDelete(selectedProject.id, e as unknown as React.MouseEvent)} 
                            className="btn-back"
                            style={{ position: 'relative', margin: 0, backgroundColor: '#ff4d4f', color: 'white' }}
                        >
                            Eliminar
                        </button>

                        <button 
                            onClick={handleGitHubDeploy} 
                            disabled={isCreating}
                            className="btn-back"
                            style={{ 
                                backgroundColor: isCreating ? "#666" : "#24292e", 
                                color: "white",
                                cursor: isCreating ? "not-allowed" : "pointer"
                            }}
                        >
                            {isCreating ? "Generando Repositorio..." : "Crear repositorio GitHub"}
                        </button>
                    </div>

                    {showPreviewModal && (
                        <div style={{
                            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                            backgroundColor: 'rgba(0, 0, 0, 0.7)',
                            zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center',
                            padding: '40px'
                        }}>
                            <div style={{
                                backgroundColor: '#fff', width: '100%', maxWidth: '900px',
                                height: '100%', maxHeight: '85vh', borderRadius: '12px',
                                display: 'flex', flexDirection: 'column', boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                            }}>
                                <div style={{
                                    padding: '20px', borderBottom: '2px solid #b08968', 
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                }}>
                                    <h2 style={{ margin: 0 }}>Previsualización del Examen</h2>
                                    <button 
                                        onClick={() => setShowPreviewModal(false)}
                                        style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#666' }}
                                        title="Cerrar previsualización"
                                    >
                                        ✖
                                    </button>
                                </div>

                                <div style={{ padding: '30px', overflowY: 'auto', flex: 1, backgroundColor: '#fafafa' }}>
                                    <div 
                                        className="content-card exam-markdown-container" 
                                        style={{ 
                                            padding: '40px', 
                                            backgroundColor: '#fff', 
                                            textAlign: 'left',
                                            lineHeight: '1.6',
                                            fontSize: '16px',
                                            color: '#333'
                                        }}
                                        dangerouslySetInnerHTML={{ __html: safeHtml }} 
                                    />
                                </div>
                                <div style={{ padding: '20px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'flex-end' }}>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        );
    }

    // =========================================================
    // VISTA B: DENTRO DE UNA CARPETA DE DOMINIO (Nivel 2)
    // =========================================================
    if (selectedDomainFolder) {
        return (
            <div className="exam-app">
                <header className="app-header">
                    <div className="header-left">
                        <span className="logo-icon" onClick={() => setSelectedDomainFolder(null)} style={{ cursor: 'pointer' }}>
                            <img src={logoExamCraft} alt="Logo" width="60" height="60" />
                        </span> 
                        <nav className="breadcrumb-nav">
                            <span className="breadcrumb-link" onClick={onWelcome}>INICIO</span>
                            <span className="breadcrumb-separator">{'>'}</span>
                            <span className="breadcrumb-link" onClick={() => setSelectedDomainFolder(null)}>EXÁMENES ANTERIORES</span>
                            <span className="breadcrumb-separator">{'>'}</span>
                            <span className="breadcrumb-current">{selectedDomainFolder.toUpperCase()}</span>
                        </nav>
                    </div>
                </header>

                <main className="main-content">
                    <h1 className="main-title">CARPETA: {selectedDomainFolder.toUpperCase()}</h1>
                    
                    <div className="subtitle-badge">
                        Selecciona un examen para visualizarlo o haz clic en su nombre para editarlo
                    </div>

                    <div className="cards-container">
                        {projectsInFolder.length > 0 ? (
                            projectsInFolder.map((proj) => (
                                <div key={proj.id} className="action-card" style={{ position: 'relative', cursor: 'default' }}>
                                    
                                    <button
                                        onClick={(e) => handleDelete(proj.id, e)}
                                        title="Borrar examen"
                                        style={{
                                            position: 'absolute', top: '-10px', right: '-10px', backgroundColor: '#ff4d4f', color: 'white',
                                            border: 'none', borderRadius: '50%', width: '28px', height: '28px', fontWeight: 'bold', fontSize: '16px',
                                            cursor: 'pointer', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                        }}
                                    >
                                        ×
                                    </button>

                                    <span 
                                        className="parts-exam-icon" 
                                        style={{ cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '110px', width: '100%' }}
                                        onClick={() => setSelectedProject(proj)}
                                        title="Abrir examen"
                                    >
                                        <img 
                                            src={examen} 
                                            alt="Abrir examen" 
                                            width="80" 
                                            height="80" 
                                            style={{ transition: 'transform 0.2s' }} 
                                            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                                            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                        />
                                    </span>

                                    {editingId === proj.id ? (
                                        <input
                                            autoFocus
                                            value={tempName}
                                            onChange={(e) => setTempName(e.target.value)}
                                            onBlur={() => handleRename(proj.id)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    handleRename(proj.id);
                                                } else if (e.key === 'Escape') {
                                                    setEditingId(null); 
                                                }
                                            }}
                                            style={{ 
                                                marginTop: '10px', 
                                                textAlign: 'center', 
                                                width: '90%', 
                                                fontSize: '14px', 
                                                padding: '5px', 
                                                borderRadius: '4px', 
                                                border: '2px solid #b08968', 
                                                outline: 'none',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden'
                                            }}
                                        />
                                    ) : (
                                        <span 
                                            className="card-label" 
                                            style={{ 
                                                cursor: 'text', 
                                                marginTop: '10px', 
                                                padding: '5px', 
                                                width: '100%', 
                                                display: 'block', 
                                                textAlign: 'center',
                                                border: '2px solid transparent',
                                                whiteSpace: 'nowrap',       
                                                overflow: 'hidden',         
                                                textOverflow: 'ellipsis',    
                                                boxSizing: 'border-box'      
                                            }}
                                            onClick={(e) => { 
                                                e.stopPropagation(); 
                                                setEditingId(proj.id); 
                                                setTempName(proj.customName || `Examen de ${proj.domainName}`); 
                                            }}
                                            title= {`${proj.customName || `Examen de ${proj.domainName}`}`}
                                        >
                                            {proj.customName || `Examen de ${proj.domainName}`}
                                        </span>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p style={{ textAlign: 'center', color: '#888', marginTop: '40px' }}>
                                La carpeta está vacía. Genera un examen de este dominio para verlo aquí.
                            </p>
                        )}
                    </div>

                    <button onClick={() => setSelectedDomainFolder(null)} className="btn-back">
                        Volver
                    </button>
                </main>
            </div>
        );
    }

    // =========================================================
    // VISTA C: GRID DE CARPETAS PRINCIPALES (Nivel 1 ESTRICTO)
    // =========================================================
    return (
        <div className="exam-app">
            <header className="app-header">
                <div className="header-left">
                    <span className="logo-icon" onClick={onWelcome} style={{ cursor: 'pointer' }}>
                        <img src={logoExamCraft} alt="Logo" width="60" height="60" />
                    </span> 
                    <nav className="breadcrumb-nav">
                        <span className="breadcrumb-link" onClick={onWelcome}>INICIO</span>
                        <span className="breadcrumb-separator">{'>'}</span>
                        <span className="breadcrumb-current">EXÁMENES ANTERIORES</span>
                    </nav>
                </div>
            </header>

            <main className="main-content">
                <h1 className="main-title">MIS EXÁMENES</h1>
                
                <div className="subtitle-badge">
                    Selecciona una carpeta para ver sus exámenes
                </div>

                <div className="cards-container">
                    {allowedFolders.map((folderName) => {
                        const count = projects.filter(p => p.domainName && p.domainName.toLowerCase() === folderName).length;

                        return (
                            <button 
                                key={folderName} 
                                className="action-card" 
                                onClick={() => setSelectedDomainFolder(folderName)}
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
                        )
                    })}
                </div>

                <button onClick={onWelcome} className="btn-back">
                    Volver
                </button>
            </main>
        </div>
    );
}