import type { GithubRepo } from "~src/models/GithubRepo"
import type { GithubUser } from "../models/GithubUser"

export const GithubService = {
  
  async getUser(username: string): Promise<GithubUser | null> {
    try {
      const response = await fetch(`https://api.github.com/users/${username}`)
      
      if (!response.ok) {
        throw new Error("Usuario no encontrado")
      }

      const data = await response.json()
      
      return {
        login: data.login,
        avatar_url: data.avatar_url,
        public_repos: data.public_repos,
        bio: data.bio
      }
    } catch (error) {
      console.error("Error fetching github user:", error)
      return null
    }
  },


  async getMyRepo(owner: string, repoName: string): Promise<GithubRepo | null> {
    try {
      const response = await fetch(`https://api.github.com/repos/${owner}/${repoName}`)
      
      if (!response.ok) {
        throw new Error("Repositorio no encontrado")
      }

      const data = await response.json()
      
      return {
        name: data.name,
        description: data.description,
        html_url: data.html_url,
        stargazers_count: data.stargazers_count
      }
    } catch (error) {
      console.error("Error en el servicio de GitHub:", error)
      return null
    }
  }

}