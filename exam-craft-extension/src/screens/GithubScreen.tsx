import { useState, useEffect } from "react"
import type { GithubUser } from "../models/GithubUser"
import type { GithubRepo } from "../models/GithubRepo"
import { GithubService } from "../services/githubService"
import logoExamCraft from "../../assets/images/icon512.png"

interface Props {
  onBack: () => void
}

export default function GithubScreen({ onBack }: Props) {
  const [lidiaUser, setLidiaUser] = useState<GithubUser | null>(null)
  const [mariaUser, setMariaUser] = useState<GithubUser | null>(null)
  const [repo, setRepo] = useState<GithubRepo | null>(null)
  const [loading, setLoading] = useState(false)

  const LIDIA_USER = "lidiafc8"
  const MARIA_USER = "mery16q"
  const REPO = "ExamCraft_Extension_TFG_2526"

  const cargarDatos = async () => {
    setLoading(true)
    try {
      const lidiaUserData = await GithubService.getUser(LIDIA_USER)
      const mariaUserData = await GithubService.getUser(MARIA_USER)
      const datosRepo = await GithubService.getMyRepo(LIDIA_USER, REPO)
      setLidiaUser(lidiaUserData)
      setMariaUser(mariaUserData)
      setRepo(datosRepo)
    } catch (error) {
      console.error("Error cargando datos", error)
    }
    setLoading(false)
  }

  useEffect(() => { cargarDatos() }, [])

  return (
    <div className="exam-app">

      {/* --- HEADER --- */}   
      <header className="app-header">
        <div className="header-left">
          
          <span 
            className="logo-icon" 
            onClick={onBack} 
            style={{ cursor: 'pointer' }} 
            title="Volver al Inicio"
          >
            <img src={logoExamCraft} alt="Logo ExamCraft" width="60" height="60" />
          </span> 
          
          <span>
              GITHUB INFO
          </span>
        </div>
        <div className="header-right">
        </div>
      </header>

      {/* --- CONTENIDO CENTRAL --- */}
      <main className="main-content">
        
        <h2 className="main-title small">
            Equipo de Desarrollo
        </h2>

        <div className="content-card">
            
            {loading && (
                <div className="loading-text">Obteniendo datos de GitHub...</div>
            )}
      
            {!loading && (
                <div className="profiles-grid">

                    {lidiaUser && (
                        <div className="user-card">
                            <img src={lidiaUser.avatar_url} alt="Lidia" className="avatar" width="60" height="60" />
                            <div className="user-details">
                                <h3>{lidiaUser.login}</h3>
                                <small>Repos: {lidiaUser.public_repos}</small>
                            </div>
                        </div>
                    )}

                    {mariaUser && (
                        <div className="user-card">
                            <img src={mariaUser.avatar_url} alt="Maria" className="avatar" width="60" height="60" />
                            <div className="user-details">
                                <h3>{mariaUser.login}</h3>
                                <small>Repos: {mariaUser.public_repos}</small>
                            </div>
                        </div>
                    )}
                </div>
            )}

  
            {!loading && repo && (
              <div className="repo-card">
                <h3>Proyecto Actual</h3>
                
             
                <div className="repo-name">
                  {repo.name}
                </div>
                
          
                <p className="repo-desc">
                  "{repo.description || "TFG Universidad de Sevilla"}"
                </p>
                
         
                <div className="repo-stars">
                  ⭐ Estrellas: {repo.stargazers_count}
                </div>

                <br /> 
                
  
                <a 
                  href={repo.html_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="repo-link"
                >
                  Ver en GitHub 🔗
                </a>
              </div>
            )}
        </div>


        <button onClick={onBack} className="btn-back">
            Volver
        </button>

      </main>
    </div>
  )
}