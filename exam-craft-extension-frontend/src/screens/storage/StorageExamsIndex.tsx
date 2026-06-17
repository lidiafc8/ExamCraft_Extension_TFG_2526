import hljs from "highlight.js/lib/core"
import java from "highlight.js/lib/languages/java"
import React, { useCallback, useEffect, useState } from "react"

import "highlight.js/styles/github.css"

import { DeleteConfirmationModal } from "~src/components/modals/DeleteConfirmationModal"
import { GithubService } from "~src/services/githubService"
import { downloadProjectAsMarkdown } from "~src/utils/exportUtils"

import { ExamDetailScreen } from "./ExamDetailScreen"
import { DomainFolderScreen } from "./ExamSelectionScreen"
import { FoldersGridScreen } from "./FoldersGridScreen"
import { GeneratedCodeScreen } from "./GenerationCodeScreen"
import { VisualSolutionCodeScreen } from "./VisualSolutionCodeScreen"

declare var chrome: any
hljs.registerLanguage("java", java)

interface Props {
  readonly onWelcome: () => void
}

export default function StorageExamsIndex({ onWelcome }: Props) {
  const [projects, setProjects] = useState<any[]>([])
  const [selectedDomainFolder, setSelectedDomainFolder] = useState<
    string | null
  >(null)
  const [selectedProject, setSelectedProject] = useState<any>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [tempName, setTempName] = useState("")
  const [showGeneratedCode, setShowGeneratedCode] = useState(false)
  const [showSolutionGeneratedCode, setShowSolutionGeneratedCode] =
    useState(false)
  const [deleteModal, setDeleteModal] = useState<{
    id: string
    name: string
  } | null>(null)

  const allowedFolders = ["clínica veterinaria", "ajedrez"]

  useEffect(() => {
    if (!globalThis.chrome?.storage?.local) return

    chrome.storage.local.get(null, (items: Record<string, any>) => {
      const projectList = Object.keys(items)
        .filter((key) => key.startsWith("project_"))
        .map((key) => ({ id: key, ...items[key] }))
      setProjects(projectList)
    })
  }, [])

  const updateProjectInState = (id: string, updatedData: any) => {
    setProjects((prev) => prev.map((p) => (p.id === id ? updatedData : p)))
    if (selectedProject?.id === id) setSelectedProject(updatedData)
  }

  const removeProjectFromState = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id))
    if (selectedProject?.id === id) setSelectedProject(null)
  }

  const handleRename = (id: string, newName: string) => {
    const nameToSet = newName.trim()
    if (!nameToSet) return setEditingId(null)

    const project = projects.find((p) => p.id === id)
    if (!project || !globalThis.chrome?.storage?.local) return

    const updatedData = { ...project, customName: nameToSet }
    chrome.storage.local.set({ [id]: updatedData }, () => {
      updateProjectInState(id, updatedData)
      setEditingId(null)
    })
  }

  const handleUpdateProject = async (updatedProject: any) => {
    if (!globalThis.chrome?.storage?.local) return
    return new Promise<void>((resolve, reject) => {
      chrome.storage.local.set({ [updatedProject.id]: updatedProject }, () => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message))
        } else {
          updateProjectInState(updatedProject.id, updatedProject)
          resolve()
        }
      })
    })
  }

  const handleDeleteDirect = (id: string) => {
    if (!globalThis.chrome?.storage?.local) return
    chrome.storage.local.remove(id, () => removeProjectFromState(id))
  }

  const handleConfirmDelete = () => {
    if (!deleteModal || !globalThis.chrome?.storage?.local) return
    chrome.storage.local.remove(deleteModal.id, () => {
      removeProjectFromState(deleteModal.id)
      setDeleteModal(null)
    })
  }

  const handleDeleteSection = (sectionKey: string) => {
    if (!selectedProject || !globalThis.chrome?.storage?.local) return
    const updatedProject = { ...selectedProject, [sectionKey]: "" }
    chrome.storage.local.set({ [selectedProject.id]: updatedProject }, () => {
      updateProjectInState(selectedProject.id, updatedProject)
    })
  }

  const handleDeleteTest = (testKey: string) => {
    if (!selectedProject?.id) return

    const updatedProject = { ...selectedProject }
    const updatedTestMap = { ...(updatedProject.testPartsMap || {}) }

    delete updatedTestMap[testKey]
    updatedProject.testPartsMap = updatedTestMap

    setSelectedProject(updatedProject)

    if (chrome?.storage?.local) {
      chrome.storage.local.set({ [selectedProject.id]: updatedProject }, () => {
        console.log(`Test ${testKey} eliminado correctamente.`)
      })
    }
  }

  const handleGitHubDeploy = async (token: string, project: any) => {
    const isPetClinic = project.domainName
      .toLowerCase()
      .match(/veterinaria|clínica/)
    const cleanDomain = project.domainName
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/gi, "-")
      .toLowerCase()

    const config = {
      owner: "lidiafc8",
      repo: isPetClinic
        ? "DP1-petClinic-template-exam"
        : "DP1-chess-template-exam",
      path: isPetClinic
        ? "src/test/java/org/springframework/samples/petclinic/grooming/"
        : "src/test/java/es/us/dp1/chess/tournament/"
    }

    return await GithubService.deployExam(
      token,
      project,
      `examen-${cleanDomain}-${Date.now()}`,
      config.owner,
      config.repo,
      config.path
    )
  }

  const renderActiveExamScreen = () => {
    if (showGeneratedCode) {
      return (
        <GeneratedCodeScreen
          selectedProject={selectedProject}
          selectedDomainFolder={selectedDomainFolder!}
          onWelcome={onWelcome}
          onBack={() => setShowGeneratedCode(false)}
          onGoToExams={() => {
            setShowGeneratedCode(false)
            setSelectedProject(null)
          }}
          onGoToFolders={() => {
            setShowGeneratedCode(false)
            setSelectedProject(null)
            setSelectedDomainFolder(null)
          }}
          onDeleteSection={handleDeleteSection}
          onDeleteTest={handleDeleteTest}
          onUpdateProject={handleUpdateProject}
        />
      )
    }
    if (showSolutionGeneratedCode) {
      return (
        <VisualSolutionCodeScreen
          selectedProject={selectedProject}
          selectedDomainFolder={selectedDomainFolder!}
          onWelcome={onWelcome}
          onBack={() => setShowSolutionGeneratedCode(false)}
          onGoToExams={() => {
            setShowSolutionGeneratedCode(false)
            setSelectedProject(null)
          }}
          onGoToFolders={() => {
            setShowSolutionGeneratedCode(false)
            setSelectedProject(null)
            setSelectedDomainFolder(null)
          }}
          onDeleteSection={handleDeleteSection}
          onUpdateProject={handleUpdateProject}
        />
      )
    }
    return (
      <ExamDetailScreen
        selectedProject={selectedProject}
        selectedDomainFolder={selectedDomainFolder!}
        isCreating={false}
        onWelcome={onWelcome}
        onBack={() => setSelectedProject(null)}
        onGoToFolders={() => {
          setSelectedProject(null)
          setSelectedDomainFolder(null)
        }}
        onDownload={(name) => downloadProjectAsMarkdown(selectedProject, name)}
        onGitHubDeploy={handleGitHubDeploy}
        onShowGeneratedCode={() => setShowGeneratedCode(true)}
        onShowSolutionGeneratedCode={() => setShowSolutionGeneratedCode(true)}
        onDeleteProject={(id) =>
          setDeleteModal({ id, name: selectedProject.customName })
        }
        onDeleteSection={handleDeleteSection}
        onUpdateProject={handleUpdateProject}
      />
    )
  }

  const renderFolderContent = () => {
    if (selectedDomainFolder) {
      const projectsInFolder = projects.filter(
        (p) =>
          p.domainName?.toLowerCase() === selectedDomainFolder.toLowerCase()
      )
      return (
        <DomainFolderScreen
          selectedDomainFolder={selectedDomainFolder}
          projectsInFolder={projectsInFolder}
          editingId={editingId}
          tempName={tempName}
          onWelcome={onWelcome}
          onBack={() => setSelectedDomainFolder(null)}
          onSelectProject={setSelectedProject}
          onDeleteProject={handleDeleteDirect}
          onRenameProject={handleRename}
          setEditingId={setEditingId}
          setTempName={setTempName}
        />
      )
    }
    return (
      <FoldersGridScreen
        allowedFolders={allowedFolders}
        projects={projects}
        onWelcome={onWelcome}
        onSelectFolder={setSelectedDomainFolder}
      />
    )
  }

  return (
    <>
      {selectedProject ? renderActiveExamScreen() : renderFolderContent()}
      <DeleteConfirmationModal
        isOpen={deleteModal !== null}
        itemName={deleteModal?.name ?? ""}
        isExam
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModal(null)}
      />
    </>
  )
}
