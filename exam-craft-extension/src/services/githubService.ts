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
  },

  /**
   * Crea un nuevo repositorio basado en una plantilla (template)
   * @param token Personal Access Token de GitHub con permisos de repo
   * @param templateOwner El dueño del fork/plantilla
   * @param templateRepo El nombre del repositorio fork/plantilla
   * @param newRepoName Nombre del nuevo repositorio a crear
   */
  async createRepoFromTemplate(
    token: string,
    templateOwner: string,
    templateRepo: string,
    newRepoName: string
  ): Promise<any> {
    const response = await fetch(
      `https://api.github.com/repos/${templateOwner}/${templateRepo}/generate`,
      {
        method: "POST",
        headers: {
          "Authorization": `token ${token}`,
          "Accept": "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: newRepoName,
          private: true
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text(); 
      throw new Error(`Error GitHub (${response.status}): ${errorText}`);
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await response.json();
    } else {
      return { success: true, message: "Repo creado (sin respuesta JSON)" };
    }
  },

async createOrUpdateFile(
    token: string,
    owner: string,
    repo: string,
    path: string,
    content: string,
    message: string
  ): Promise<any> {
    const base64Content = btoa(unescape(encodeURIComponent(content)));

    let sha = undefined;
    try {
      const getResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
        {
          headers: {
            "Authorization": `token ${token}`,
            "Accept": "application/vnd.github+json"
          }
        }
      );

      if (getResponse.ok) {
        const fileData = await getResponse.json();
        sha = fileData.sha; 
      }
    } catch (e) {
      console.log(`El archivo ${path} no existe previamente, se creará uno nuevo.`);
    }

    const body: any = {
      message: message,
      content: base64Content
    };

    if (sha) {
      body.sha = sha;
    }

    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
      {
        method: "PUT",
        headers: {
          "Authorization": `token ${token}`,
          "Accept": "application/vnd.github+json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Error subiendo ${path}: ${errorData.message}`);
    }

    return await response.json();
  }

}