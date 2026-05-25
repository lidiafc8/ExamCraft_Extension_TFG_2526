import React from "react"

import { Header } from "~src/components/Header"

import carpeta from "../../../assets/images/archive.png"

import "./css/FoldersGridScreen.css"
import "../../css/Cards.css"

export interface FoldersGridScreenProps {
  allowedFolders: string[]
  projects: any[]
  onWelcome: () => void
  onSelectFolder: (folderName: string) => void
}

export const FoldersGridScreen: React.FC<FoldersGridScreenProps> = ({
  allowedFolders,
  projects,
  onWelcome,
  onSelectFolder
}) => {
  const breadcrumbItems = [{ label: "INICIO", action: onWelcome }]

  const currentTitle = "EXÁMENES ANTERIORES"

  const visibleFolders = allowedFolders.filter((folderName) =>
    projects.some(
      (p) => p.domainName?.toUpperCase() === folderName.toUpperCase()
    )
  )

  return (
    <div>
      <Header
        onWelcome={onWelcome}
        breadcrumbItems={breadcrumbItems}
        currentStep={currentTitle}
      />

      <main className="main-content">
        <h1 className="main-title">MIS EXÁMENES</h1>
        <div className="subtitle-badge">Selecciona un dominio</div>

        <div className="cards-container">
          {visibleFolders.length === 0 ? (
            <div className="empty-container">
              <p>Todavía no tienes ningún examen guardado.</p>
              <p className="empty-subtext">
                Crea tu primer examen para verlo aquí.
              </p>
            </div>
          ) : (
            visibleFolders.map((folderName) => {
              const count = projects.filter(
                (p) => p.domainName?.toUpperCase() === folderName.toUpperCase()
              ).length

              return (
                <button
                  key={folderName}
                  className="action-card"
                  onClick={() => onSelectFolder(folderName)}>
                  <span>
                    <img src={carpeta} alt="Carpeta" className="card-icon" />
                  </span>
                  <span className="card-label">{folderName.toUpperCase()}</span>
                  <span className="card-count">
                    {count} {count === 1 ? "EXAMEN" : "EXÁMENES"}
                  </span>
                </button>
              )
            })
          )}
        </div>

        <button onClick={onWelcome} className="btn-back">
          Volver
        </button>
      </main>
    </div>
  )
}
