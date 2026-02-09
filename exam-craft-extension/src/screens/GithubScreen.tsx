import { useState, useEffect } from "react"
import type { GithubUser } from "../models/GithubUser"
import type { GithubRepo } from "../models/GithubRepo"
import { GithubService } from "../services/githubService"

interface Props {
  onBack: () => void
}

export default function GithubScreen({ onBack }: Props) {
  const [user, setUser] = useState<GithubUser | null>(null)
  const [repo, setRepo] = useState<GithubRepo | null>(null)
  const [loading, setLoading] = useState(false)

  // Configuración
  const MI_USUARIO = "lidiafc8"
  const MI_REPO = "ExamCraft_Extension_TFG_2526" 

  const cargarDatos = async () => {
    setLoading(true)
    const datosUser = await GithubService.getUser(MI_USUARIO)
    const datosRepo = await GithubService.getMyRepo(MI_USUARIO, MI_REPO)
    setUser(datosUser)
    setRepo(datosRepo)
    setLoading(false)
  }

  useEffect(() => { cargarDatos() }, [])

  return (
    <div className="container">
      {/* Cabecera con botón de volver */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button onClick={onBack} className="btn-secondary">Volver</button>
        <h2>Panel de GitHub</h2>
      </div>
      <hr />

      <div className="card">
        {loading && <p>Cargando datos...</p>}
        
        {!loading && user && (
          <div className="user-info">
             <img src={user.avatar_url} alt="Avatar" className="avatar" width="50" />
             <div>
                <h3>{user.login}</h3>
                <small>Repositorios: {user.public_repos}</small>
             </div>
          </div>
        )}

        {!loading && repo && (
          <div className="repo-info" style={{ marginTop: "20px", background: "#f9f9f9", padding: "10px", borderRadius: "8px" }}>
            <h3>Proyecto Actual: {repo.name}</h3>
            <p>{repo.description || "Sin descripción"}</p>
            <span>Estrellas: {repo.stargazers_count}</span>
          </div>
        )}
      </div>
    </div>
  )
}