import React, { useEffect, useState } from "react";
import hljs from 'highlight.js/lib/core';
import java from 'highlight.js/lib/languages/java';
import 'highlight.js/styles/github.css';
import { downloadProjectAsMarkdown } from "~src/utils/exportUtils";
import { FoldersGridScreen } from "./FoldersGridScreen";
import { DomainFolderScreen } from "./ExamSelectionScreen";
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

    const handleRename = (id: string, newName: string) => {
        const nameToSet = newName.trim();
        if (!nameToSet) { 
            setEditingId(null); 
            return; 
        }

        const projectToUpdate = projects.find(p => p.id === id);
        if (!projectToUpdate) return;
        
        const updatedData = { ...projectToUpdate, customName: nameToSet };

        if (globalThis.chrome?.storage?.local) {
            chrome.storage.local.set({ [id]: updatedData }, () => {
                applyRenameToState(id, nameToSet);
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
        if (globalThis.chrome?.storage?.local) {
            chrome.storage.local.set({ [selectedProject.id]: updatedProject }, () => {
                setProjects(prev => prev.map(p => (p.id === selectedProject.id ? updatedProject : p)));
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
            chrome.storage.local.set({ [selectedProject.id]: updatedProject });
        }
    };
    const handleDownload = (fileName: string) => {
        if (!selectedProject) return;
        downloadProjectAsMarkdown(selectedProject, fileName);
    };

    const handleGitHubDeploy = async (token: string, project: any) => {
        const isPetClinic = project.domainName.toLowerCase().includes("veterinaria") || 
                            project.domainName.toLowerCase().includes("clínica");

        const cleanDomain = project.domainName
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]/gi, '-').toLowerCase();

        const uniqueRepoName = `examen-${cleanDomain}-${Date.now()}`;

        const config = {
            owner: "lidiafc8",
            repo: isPetClinic ? "DP1-petClinic-template-exam" : "DP1-chess-template-exam",
            path: isPetClinic 
                ? "src/test/java/org/springframework/samples/petclinic/grooming/" 
                : "src/test/java/es/us/dp1/chess/tournament/"
        };

        return await GithubService.deployExam(
            token,
            project,
            uniqueRepoName,
            config.owner,
            config.repo,
            config.path
        );
    };
    


    if (selectedProject && showGeneratedCode) {
        return (
            <GeneratedCodeScreen
                selectedProject={selectedProject}
                selectedDomainFolder={selectedDomainFolder || ""}
                onWelcome={onWelcome}
                onBack={() => setShowGeneratedCode(false)}
                onGoToExams={() => { setShowGeneratedCode(false); setSelectedProject(null); }}
                onGoToFolders={() => { setShowGeneratedCode(false); setSelectedProject(null); setSelectedDomainFolder(null); }}
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
                onGoToExams={() => { setShowSolutionGeneratedCode(false); setSelectedProject(null); }}
                onGoToFolders={() => { setShowSolutionGeneratedCode(false); setSelectedProject(null); setSelectedDomainFolder(null); }}
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
                onGoToFolders={() => { setSelectedProject(null); setSelectedDomainFolder(null); }}
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