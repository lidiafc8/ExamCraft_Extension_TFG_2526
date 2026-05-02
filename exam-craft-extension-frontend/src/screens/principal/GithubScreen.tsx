import { useState, useEffect } from "react"
import type { GithubUser } from "../../models/GithubUser"
import type { GithubRepo } from "../../models/GithubRepo"
import { GithubService } from "../../services/githubService"
import { Header } from "~src/components/Header"
import './css/GitHub.css';
import '../../css/CommonText.css';

interface Props {
  readonly onBack: () => void
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
    <div>
      <Header 
        onWelcome={onBack} 
        breadcrumbItems={[]} 
        currentStep="GITHUB INFO" 
      />

      <main className="main-content">
        
        <h2 className="main-title">
            Equipo de Desarrollo
        </h2>

        <div className="content-card-github">
          {loading && (
              <div className="subtitle-badge">Obteniendo datos de GitHub...</div>
          )}
    
          {!loading && (
            <div className="profiles-grid">
              <div className="user-card">
                {lidiaUser ? (
                  <>
                    <img src={lidiaUser.avatar_url} alt="Lidia" className="avatar"/>
                    <div className="user-details">
                      <p className="user-name">{lidiaUser.login}</p>
                      <p className="user-repos">Repos: {lidiaUser.public_repos}</p>
                    </div>
                  </>
                ) : (
                  <div className="user-details"><h3>Cargando...</h3></div>
                )}
              </div>

              <div className="user-card">
                {mariaUser ? (
                  <>
                    <img src={mariaUser.avatar_url} alt="Maria" className="avatar"/>
                    <div className="user-details">
                      <p className="user-name">{mariaUser.login}</p>
                      <p className="user-repos">Repos: {mariaUser.public_repos}</p>
                    </div>
                  </>
                ) : (
                  <div className="user-details"><h3>Cargando...</h3></div>
                )}
              </div>
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