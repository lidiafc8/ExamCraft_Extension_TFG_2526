import React from "react"
import carpeta from "../../assets/images/archive.png"
import examen from "../../assets/images/exam.png"
import "../../src/css/Cards.css"

interface Project {
  id: string
  domainName: string
  customName?: string
}

interface FolderExamSelectorProps {
  projects: Project[]
  allowedFolders: string[]
  selectedFolder: string | null
  onSelectFolder: (folder: string) => void
  onSelectProject: (project: Project) => void
  onBack: () => void
  displayName: (proj: Project) => string
  filterProject?: (project: Project) => boolean
  emptyFoldersMessage?: string
  emptyProjectsMessage?: string
}

// --- FUNCIONES DE UTILIDAD (Extraídas para bajar complejidad) ---

const getProjectsInFolder = (projects: Project[], folder: string | null) => {
  if (!folder) return [];
  return projects.filter(
    (p) => p.domainName?.toLowerCase() === folder.toLowerCase()
  );
};

export const FolderExamSelector: React.FC<FolderExamSelectorProps> = ({
  projects,
  allowedFolders,
  selectedFolder,
  onSelectFolder,
  onSelectProject,
  onBack,
  displayName,
  filterProject,
  emptyFoldersMessage = "No hay exámenes creados todavía.",
  emptyProjectsMessage = "No hay exámenes en esta carpeta.",
}) => {
  // 1. Aplicamos filtrado inicial
  const filteredProjects = filterProject ? projects.filter(filterProject) : projects

  // 2. Uso de Optional Chaining para simplificar la lectura (Corrige imagen 3)
  const visibleFolders = allowedFolders.filter((f) =>
    filteredProjects.some((p) => p.domainName?.toLowerCase() === f.toLowerCase())
  )

  const projectsInFolder = getProjectsInFolder(filteredProjects, selectedFolder);

  // --- RENDERIZADO DE CARPETAS ---
  if (!selectedFolder) {
    return (
      <div>
        <h1 className="main-title">MIS EXÁMENES</h1>
        <div className="subtitle-badge">Selecciona un dominio</div>
        <div className="cards-container">
          {visibleFolders.length === 0 ? (
            <div className="empty-container">
              <p>{emptyFoldersMessage}</p>
            </div>
          ) : (
            visibleFolders.map((folderName) => {
              // Simplificamos el conteo
              const count = filteredProjects.filter(
                (p) => p.domainName?.toLowerCase() === folderName.toLowerCase()
              ).length
              
              return (
                <button key={folderName} type="button" className="action-card" onClick={() => onSelectFolder(folderName)}>
                  <span><img src={carpeta} alt="Carpeta" className="card-icon" /></span>
                  <span className="card-label">{folderName.toUpperCase()}</span>
                  <span className="card-count">{count} {count === 1 ? "EXAMEN" : "EXÁMENES"}</span>
                </button>
              )
            })
          )}
        </div>
        <button onClick={onBack} className="btn-back" style={{ marginTop: "20px" }}>Volver</button>
      </div>
    )
  }

  // --- RENDERIZADO DE EXÁMENES EN CARPETA ---
  return (
    <div>
      <h1 className="main-title">Exámenes de {selectedFolder.toUpperCase()}</h1>
      <div className="subtitle-badge">Selecciona el examen que deseas utilizar como contexto.</div>
      <div className="cards-container">
        {projectsInFolder.length === 0 ? (
          <div className="empty-container">
            <p>{emptyProjectsMessage}</p>
          </div>
        ) : (
          projectsInFolder.map((proj) => (
            <div key={proj.id} className="action-card">
              <button className="btn-icon" onClick={() => onSelectProject(proj)} title="Abrir examen">
                <img src={examen} alt="Abrir examen" />
              </button>
              <span className="card-label">{displayName(proj)}</span>
            </div>
          ))
        )}
      </div>
      <button onClick={() => onSelectFolder("")} className="btn-back" style={{ marginTop: "20px" }}>Volver</button>
    </div>
  )
}