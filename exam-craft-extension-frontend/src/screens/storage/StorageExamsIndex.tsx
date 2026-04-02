import React, { useEffect, useState } from "react";
import logoExamCraft from "../../../assets/icon512.png";
import { GithubService } from "~src/services/githubService";
import hljs from 'highlight.js/lib/core';
import java from 'highlight.js/lib/languages/java';
import 'highlight.js/styles/github.css';
import { downloadProjectAsMarkdown } from "~src/utils/exportUtils";
import { FoldersGridScreen } from "./FoldersGridScreen";
import { DomainFolderScreen } from "./DomainFolderScreen";
import { ExamDetailScreen } from "./ExamDetailScreen";
import { GeneratedCodeScreen } from "./GenerateCodeScreen";

hljs.registerLanguage('java', java);

interface Props {
    readonly onWelcome: () => void;
}

export default function StorageExamsIndex({ onWelcome }: Props) {
    const [projects, setProjects] = useState<any[]>([]);
    const [selectedDomainFolder, setSelectedDomainFolder] = useState<string | null>(null);
    const [selectedProject, setSelectedProject] = useState<any | null>(null);

    const [editingId, setEditingId] = useState<string | null>(null);
    const [tempName, setTempName] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const [showGeneratedCode, setShowGeneratedCode] = useState(false);

    const allowedFolders = ["clínica veterinaria", "ajedrez"];
    const projectsInFolder = projects.filter(p =>
        p.domainName && selectedDomainFolder && p.domainName.toLowerCase() === selectedDomainFolder.toLowerCase()
    );

    useEffect(() => {
        if (typeof chrome !== "undefined" && chrome.storage?.local) {
            chrome.storage.local.get(null, (items) => {
                const projectList = Object.keys(items)
                    .filter(key => key.startsWith('project_'))
                    .map(key => ({ id: key, ...items[key] }));
                setProjects(projectList);
            });
        }
    }, []);

    const handleRename = (id: string) => {
        if (!tempName.trim()) { setEditingId(null); return; }
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
                    if (selectedProject?.id === id) setSelectedProject(null);
                });
            }
        }
    };

    const handleDownload = () => {
        if (!selectedProject) return;
        downloadProjectAsMarkdown(selectedProject);
    };

    const handleGitHubDeploy = async () => {
        const cleanProjectName = selectedProject.domainName
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-zA-Z0-9]/g, '-')
            .toLowerCase();

        const newRepoName = `examen-${cleanProjectName}-${Date.now()}`;
        const domain = selectedProject.domainName.toLowerCase();
        
        let TEMPLATE_REPO = "DP1-chess-template-exam";
        let TEST_BASE_PATH = "src/test/java/es/us/dp1/chess/tournament/";

        if (domain.includes("clínica veterinaria") || domain.includes("veterinaria")) {
            TEMPLATE_REPO = "DP1-petClinic-template-exam";
            TEST_BASE_PATH = "src/test/java/org/springframework/samples/petclinic/grooming/";
        }

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

        let itemsToUpload = ["- README.md (Actualizado con el enunciado)"];
        if (selectedProject.javaTests && selectedProject.javaTests.length > 0) {
            itemsToUpload.push("- Todos los tests de Java detectados.");
        }
        if (selectedProject.baseClasses && selectedProject.baseClasses.trim() !== "") {
            itemsToUpload.push("- Clases base para la extensión creada.");
        }

        const uploadListString = itemsToUpload.join("\n");
        const confirmacion = window.confirm(
            `¿Confirmas la creación del examen?\n\n` +
            `Dominio detectado: ${selectedProject.domainName}\n` +
            `Plantilla seleccionada: lidiafc8/${TEMPLATE_REPO}\n` +
            `Nuevo Repo: ${newRepoName}\n\n` +
            `Se subirán:\n${uploadListString}`
        );
        if (!confirmacion) return;

        setIsCreating(true);

        try {
            const newRepoUrl = await GithubService.deployExam(
                MY_TOKEN, 
                selectedProject, 
                newRepoName, 
                TEMPLATE_REPO, 
                TEST_BASE_PATH
            );

            alert("¡Repositorio creado y todos los archivos subidos con éxito!");
            window.open(newRepoUrl, '_blank');

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

 
    if (selectedProject && showGeneratedCode) {
        return (
            <GeneratedCodeScreen
                selectedProject={selectedProject}
                selectedDomainFolder={selectedDomainFolder || ""}
                logoExamCraft={logoExamCraft}
                onWelcome={onWelcome}
                onBack={() => setShowGeneratedCode(false)}
                onGoToExams={() => {
                    setShowGeneratedCode(false);
                    setSelectedProject(null);
                }}
                onGoToFolders={() => {
                    setShowGeneratedCode(false);
                    setSelectedProject(null);
                    setSelectedDomainFolder(null);
                }}
            />
        );
    }

    if (selectedProject && !showGeneratedCode) {
        return (
            <ExamDetailScreen
                selectedProject={selectedProject}
                selectedDomainFolder={selectedDomainFolder || ""}
                isCreating={isCreating}
                logoExamCraft={logoExamCraft}
                onWelcome={onWelcome}
                onBack={() => setSelectedProject(null)}
                onGoToFolders={() => { 
                    setSelectedProject(null); 
                    setSelectedDomainFolder(null); 
                }}
                onDownload={handleDownload}
                onGitHubDeploy={handleGitHubDeploy}
                onShowGeneratedCode={() => setShowGeneratedCode(true)}
                onDeleteProject={handleDelete}
            />
        );
    }

    if (selectedDomainFolder) {
        return (
            <DomainFolderScreen 
                selectedDomainFolder={selectedDomainFolder}
                projectsInFolder={projectsInFolder}
                logoExamCraft={logoExamCraft}
                editingId={editingId}
                tempName={tempName}
                onWelcome={onWelcome} 
                onBack={() => setSelectedDomainFolder(null)}
                onSelectProject={(project) => setSelectedProject(project)}
                onDeleteProject={handleDelete}
                onRenameProject={handleRename}
                setEditingId={setEditingId}
                setTempName={setTempName}
            />
        );
    }

    return (
        <FoldersGridScreen
            allowedFolders={allowedFolders}
            projects={projects}
            logoExamCraft={logoExamCraft}
            onWelcome={onWelcome}
            onSelectFolder={(folderName) => setSelectedDomainFolder(folderName)}
        />
    );
}