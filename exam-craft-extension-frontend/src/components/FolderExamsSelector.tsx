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
}

export const FolderExamSelector: React.FC<FolderExamSelectorProps> = ({
  projects,
  allowedFolders,
  selectedFolder,
  onSelectFolder,
  onSelectProject,
  onBack,
  displayName,
}) => {
  const visibleFolders = allowedFolders.filter((f) =>
    projects.some((p) => p.domainName?.toLowerCase() === f.toLowerCase())
  )

  const projectsInFolder = projects.filter(
    (p) => p.domainName && selectedFolder &&
      p.domainName.toLowerCase() === selectedFolder.toLowerCase()
  )

  if (!selectedFolder) {
    return (
      <div>
        <h1 className="main-title">MIS EXÁMENES</h1>
        <div className="subtitle-badge">Selecciona un dominio</div>
        <div className="cards-container">
          {visibleFolders.length === 0 ? (
            <div className="empty-container">
              <p>No hay exámenes creados todavía.</p>
              <p className="empty-subtext">Crea tu primer examen para verlo aquí.</p>
            </div>
          ) : (
            visibleFolders.map((folderName) => {
              const count = projects.filter(
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

  return (
    <div>
      <h1 className="main-title">Exámenes de {selectedFolder.toUpperCase()}</h1>
      <div className="subtitle-badge">Selecciona el examen que deseas utilizar como contexto.</div>
      <div className="cards-container">
        {projectsInFolder.length === 0 ? (
          <div className="empty-container">
            <p>No hay exámenes en esta carpeta.</p>
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