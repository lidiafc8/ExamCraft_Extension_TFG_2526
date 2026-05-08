import React, { useEffect, useState } from "react";
import hljs from 'highlight.js/lib/core';
import java from 'highlight.js/lib/languages/java';
import 'highlight.js/styles/github.css';
import { downloadProjectAsMarkdown } from "~src/utils/exportUtils";
import { FoldersGridScreen } from "./FoldersGridScreen";
import { DomainFolderScreen } from "./DomainFolderScreen";
import { ExamDetailScreen } from "./ExamDetailScreen";
import { GeneratedCodeScreen } from "./GenerationCodeScreen";
import { VisualSolutionCodeScreen } from "./VisualSolutionCodeScreen";
import { GithubService } from "~src/services/githubService";

declare var chrome: any;

hljs.registerLanguage('java', java);

interface Props {
    readonly onWelcome: () => void;
}

export default function StorageExamsIndex({ onWelcome }: Props) {
    const [projects, setProjects] = useState<any[]>([]);
    const [selectedDomainFolder, setSelectedDomainFolder] = useState<string | null>(null);
    const [selectedProject, setSelectedProject] = useState<any>(null);

    const [editingId, setEditingId] = useState<string | null>(null);
    const [tempName, setTempName] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const [showGeneratedCode, setShowGeneratedCode] = useState(false);
    const [showSolutionGeneratedCode, setShowSolutionGeneratedCode] = useState(false);

    const allowedFolders = ["clínica veterinaria", "ajedrez"];
    const projectsInFolder = projects.filter(p =>
        p.domainName && selectedDomainFolder && p.domainName.toLowerCase() === selectedDomainFolder.toLowerCase()
    );

    useEffect(() => {
        if (globalThis.chrome?.storage?.local) {
            chrome.storage.local.get(null, (items) => {
                const projectList = Object.keys(items)
                    .filter(key => key.startsWith('project_'))
                    .map(key => ({ id: key, ...items[key] }));
                setProjects(projectList);
            });
        }
    }, []);

    const applyRenameToState = (id: string, newName: string) => {
        setProjects(prevProjects =>
            prevProjects.map(p => (p.id === id ? { ...p, customName: newName } : p))
        );
        setEditingId(null);
    };

    const handleRename = (id: string) => {
        if (!tempName.trim()) { setEditingId(null); return; }
        const projectToUpdate = projects.find(p => p.id === id);
        if (!projectToUpdate) return;
        const newName = tempName.trim();
        const updatedData = { ...projectToUpdate, customName: newName };

        if (globalThis.chrome?.storage?.local) {
            chrome.storage.local.set({ [id]: updatedData }, () => {
                applyRenameToState(id, newName);
            });
        }
    };

    const handleDelete = (id: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        const confirmDelete = globalThis.confirm("¿Estás seguro de que quieres borrar este examen? Esta acción no se puede deshacer.");
        if (confirmDelete) {
            if (globalThis.chrome?.storage?.local) {
                chrome.storage.local.remove(id, () => {
                    setProjects(prevProjects => prevProjects.filter(p => p.id !== id));
                    if (selectedProject?.id === id) setSelectedProject(null);
                });
            }
        }
    };

    const handleDeleteSection = (sectionKey: string) => {
        if (!selectedProject) return;

        const updatedProject = { ...selectedProject, [sectionKey]: "" };

        const updateProjectsList = (prevProjects: any[]) => 
            prevProjects.map(p => (p.id === selectedProject.id ? updatedProject : p));

        if (globalThis.chrome?.storage?.local) {
            chrome.storage.local.set({ [selectedProject.id]: updatedProject }, () => {
                setProjects(updateProjectsList);
                setSelectedProject(updatedProject);
            });
        }
    };

    const handleDeleteTest = (testKey: string) => {
        if (!selectedProject?.id) return;

        const updatedProject = { ...selectedProject };
        const updatedTestMap = { ...(updatedProject.testPartsMap || {}) };

        delete updatedTestMap[testKey];
        updatedProject.testPartsMap = updatedTestMap;

        setSelectedProject(updatedProject);

        if (chrome?.storage?.local) {
            chrome.storage.local.set({ [selectedProject.id]: updatedProject }, () => {
                console.log(`Test ${testKey} eliminado correctamente.`);
            });
        }
    };

    

    const handleDownload = () => {
        if (!selectedProject) return;
        downloadProjectAsMarkdown(selectedProject);
    };

    const getRepoConfig = (domain: string) => {
    const isPetClinic = domain.includes("clínica veterinaria") || domain.includes("veterinaria");
    return {
        TEMPLATE_OWNER: "lidiafc8",
        TEMPLATE_REPO: isPetClinic ? "DP1-petClinic-template-exam" : "DP1-chess-template-exam",
        TEST_BASE_PATH: isPetClinic
            ? "src/test/java/org/springframework/samples/petclinic/grooming/"
            : "src/test/java/es/us/dp1/chess/tournament/"
    };
};

    const getOrPromptGitHubToken = (): string | null => {
        const existingToken = localStorage.getItem("github_token");
        if (existingToken) return existingToken;

        const newToken = globalThis.prompt(
            "Para crear repositorios en GitHub necesitas un Token de acceso (Personal Access Token).\n\n" +
            "Por favor, pégalo aquí (se guardará de forma segura en tu navegador para la próxima vez):"
        );

        if (!newToken) {
            alert("Operación cancelada. Se requiere un token de GitHub para continuar.");
            return null;
        }

        localStorage.setItem("github_token", newToken);
        return newToken;
    };

    const buildUploadList = (project: any): string => {
        const items = ["- README.md (Actualizado con el enunciado)"];
        
        const testParts = Object.values(project.testPartsMap || {})
            .filter((p: any) => p?.fileName && p?.code);

        if (testParts.length > 0) {
            items.push(`- Tests de Java: ${testParts.map((p: any) => p.fileName).join(', ')}`);
        }

        if (project.baseClasses?.trim()) {
            items.push("- Clases base para la extensión creada.");
        }
        
        if (project.fullSolution?.trim()) {
            const solvedParts = [];
            if (project.attributeConstraints?.trim()) solvedParts.push("restricciones de atributos");
            if (project.entityRelationships?.trim()) solvedParts.push("relaciones entre entidades");

            const detailText = solvedParts.length > 0 ? ` (${solvedParts.join(" y ")})` : "";
            items.push(`- Rama 'solution' con las clases resueltas${detailText}.`);
        }

        return items.join("\n");
    };

    const handleDeployError = (error: any) => {
        console.error("Error al desplegar:", error);
        const msg = error.message || "";
        const isAuthError = msg.includes("Bad credentials") || msg.includes("401") || msg.includes("Requires authentication");

        if (isAuthError) {
            localStorage.removeItem("github_token");
            alert("El token de GitHub ha caducado, es inválido o no tiene permisos. Vuelve a intentarlo para introducir uno nuevo.");
        } else {
            alert(`Error: ${msg}`);
        }
    };

   const handleGitHubDeploy = async () => {

        const cleanProjectName = selectedProject.domainName
            .normalize("NFD")
            .replaceAll(/[\u0300-\u036f]/g, "")
            .replaceAll(/[^a-z0-9]/gi, '-')
            .toLowerCase();

        const cleanCustomName = selectedProject.customName 
            ? selectedProject.customName
                .normalize("NFD")
                .replaceAll(/[\u0300-\u036f]/g, "")
                .replaceAll(/[^a-z0-9]/gi, '-')
                .toLowerCase()
            : "";

        const now = new Date();
        const formattedDate = 
            `${String(now.getDate()).padStart(2, '0')}` +
            `${String(now.getMonth() + 1).padStart(2, '0')}` +
            `${now.getFullYear()}` +
            `${String(now.getHours()).padStart(2, '0')}` +
            `${String(now.getMinutes()).padStart(2, '0')}`;

        const newRepoName = `examen-${cleanProjectName}-${cleanCustomName}-${formattedDate}`;
        
        const { TEMPLATE_OWNER, TEMPLATE_REPO, TEST_BASE_PATH } = getRepoConfig(selectedProject.domainName.toLowerCase());

        const MY_TOKEN = getOrPromptGitHubToken();
        if (!MY_TOKEN) return;

        const uploadListString = buildUploadList(selectedProject);
        const confirmacion = globalThis.confirm(
            `¿Confirmas la creación del examen en GitHub?\n\n` +
            `Dominio detectado: ${selectedProject.domainName}\n` +
            `Plantilla seleccionada: ${TEMPLATE_OWNER}/${TEMPLATE_REPO}\n` +
            `Nombre del repositorio a subir: ${newRepoName}\n\n` +
            `Archivos a subir:\n${uploadListString}`
        );
        if (!confirmacion) return;

        setIsCreating(true);
        try {
            const newRepoUrl = await GithubService.deployExam(
                MY_TOKEN,
                selectedProject,
                newRepoName,
                TEMPLATE_OWNER,
                TEMPLATE_REPO,
                TEST_BASE_PATH
            );
            alert("¡Repositorio creado y todos los archivos subidos con éxito!");
            globalThis.open(newRepoUrl, '_blank');
        } catch (error: any) {
            handleDeployError(error);
        } finally {
            setIsCreating(false);
        }
    };

    if (selectedProject && showGeneratedCode) {
        return (
            <GeneratedCodeScreen
                selectedProject={selectedProject}
                selectedDomainFolder={selectedDomainFolder || ""}
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
                onDeleteSection={handleDeleteSection}
                onDeleteTest={handleDeleteTest}  
            />
        );
    }

    if (selectedProject && showSolutionGeneratedCode) {
        return (
            <VisualSolutionCodeScreen          
                selectedProject={selectedProject}
                selectedDomainFolder={selectedDomainFolder || ""}
                onWelcome={onWelcome}
                onBack={() => setShowSolutionGeneratedCode(false)}  
                onGoToExams={() => {
                    setShowSolutionGeneratedCode(false);            
                    setSelectedProject(null);
                }}
                onGoToFolders={() => {
                    setShowSolutionGeneratedCode(false);             
                    setSelectedProject(null);
                    setSelectedDomainFolder(null);
                }}
                onDeleteSection={handleDeleteSection}
            />
        );
    }

    if (selectedProject && !showGeneratedCode) {
        return (
            <ExamDetailScreen
                selectedProject={selectedProject}
                selectedDomainFolder={selectedDomainFolder || ""}
                isCreating={isCreating}
                onWelcome={onWelcome}
                onBack={() => setSelectedProject(null)}
                onGoToFolders={() => {
                    setSelectedProject(null);
                    setSelectedDomainFolder(null);
                }}
                onDownload={handleDownload}
                onGitHubDeploy={handleGitHubDeploy}
                onShowGeneratedCode={() => setShowGeneratedCode(true)}
                onShowSolutionGeneratedCode={() => setShowSolutionGeneratedCode(true)}
                onDeleteProject={handleDelete}
                onDeleteSection={handleDeleteSection}
            />
        );
    }

    if (selectedDomainFolder) {
        return (
            <DomainFolderScreen
                selectedDomainFolder={selectedDomainFolder}
                projectsInFolder={projectsInFolder}
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
            onWelcome={onWelcome}
            onSelectFolder={(folderName) => setSelectedDomainFolder(folderName)}
        />
    );
}