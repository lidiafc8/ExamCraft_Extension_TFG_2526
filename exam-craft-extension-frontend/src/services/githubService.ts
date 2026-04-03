import type { GithubRepo } from "~src/models/GithubRepo"
import type { GithubUser } from "../models/GithubUser"
import { sanitizeMermaidForModal } from "~src/utils/mermaidUtils"

const extractFilesForGitHub = (rawText: string) => {
    if (!rawText) return [];
    const filesToUpload: { path: string, content: string }[] = [];
    
    const regex = /([a-zA-Z0-9_.\/\-]+\.java);?[ \t]*(?:\r?\n[ \t]*)?\`\`\`[a-z]*\r?\n([\s\S]*?)\`\`\`/gi;
    let match;

    while ((match = regex.exec(rawText)) !== null) {
        const fullPath = match[1]; 
        const cleanCode = match[2].trim(); 
        
        filesToUpload.push({
            path: fullPath,
            content: cleanCode
        });
    }

    return filesToUpload;
};

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
  },

  async updateReadmeWithDescription(
    token: string,
    owner: string,
    repo: string,
    description: string
  ): Promise<any> {
    try {
      const getResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/README.md`,
        {
          headers: {
            "Authorization": `token ${token}`,
            "Accept": "application/vnd.github+json"
          }
        }
      );

      if (!getResponse.ok) {
        throw new Error("No se pudo obtener el README.md del repositorio");
      }

      const fileData = await getResponse.json();
      
      const currentContent = decodeURIComponent(escape(atob(fileData.content)));

      const targetHeader = "## Descripción control check a realizar";
      const placeholderText = "*(Aquí puedes añadir los detalles o la lista de comprobaciones que se deben realizar en el control)*";
      
      let newContent = currentContent;

      if (currentContent.includes(placeholderText)) {
        newContent = currentContent.replace(placeholderText, description);
      } else if (currentContent.includes(targetHeader)) {
        newContent = currentContent.replace(
          targetHeader, 
          `${targetHeader}\n\n${description}`
        );
      } else {
        newContent = `${currentContent}\n\n${targetHeader}\n${description}`;
      }

      return await this.createOrUpdateFile(
        token,
        owner,
        repo,
        "README.md",
        newContent,
        "docs: actualiza descripción del control check en README"
      );
    } catch (error) {
      console.error("Error actualizando el README:", error);
      throw error;
    }
  },

  async deployExam(
        token: string, 
        project: any, 
        newRepoName: string, 
        templateRepo: string, 
        testBasePath: string
    ): Promise<string> {
        
        const userResponse = await fetch("https://api.github.com/user", {
            headers: { Authorization: `token ${token}` }
        });
        if (!userResponse.ok) throw new Error("Token inválido o caducado (Requires authentication)");

        const userData = await userResponse.json();
        const TARGET_OWNER = userData.login;
        const TEMPLATE_OWNER = "lidiafc8";

        const newRepo = await this.createRepoFromTemplate(token, TEMPLATE_OWNER, templateRepo, newRepoName);
        
        await new Promise(resolve => setTimeout(resolve, 2000));

         // 1. Readme
        const title = `Examen Completo: ${project.customName || project.domainName}`;
        const fullText = project.extensionFinish || '';
        const mermaidMatch = fullText.match(/(classDiagram|graph)[\s\S]*/i);
        
        let introText = fullText;
        let finalMermaidCode = '';
        
        if (mermaidMatch) {
            introText = fullText.substring(0, mermaidMatch.index).trim();
            finalMermaidCode = sanitizeMermaidForModal(fullText);
        }

        const markdownContent = `### ${title}\n\n` +
            `#### 1. Extensión Funcional\n${introText || "No hay datos de extensión funcional."}\n\n` +
            (finalMermaidCode ? `\`\`\`mermaid\n${finalMermaidCode}\n\`\`\`\n\n` : '') +
            `#### 2. Restricciones de Atributos\n${project.attributeConstraints || "No se crearon restricciones de atributos para este examen."}\n\n` +
            `#### 3. Relaciones entre Entidades\n${project.entityRelations || "No se crearon relaciones entre entidades para este examen."}\n`;

        await this.updateReadmeWithDescription(token, TARGET_OWNER, newRepoName, markdownContent);

        // 2. Tests
        if (project.javaTests) {
            const tests = Array.isArray(project.javaTests)
                ? project.javaTests
                : [project.javaTests];

            for (let i = 0; i < tests.length; i++) {
                let fileContent = tests[i].trim()
                    .replace(/^```[a-z]*\r?\n/i, '')
                    .replace(/\r?\n```$/i, '')
                    .trim();

                const fileName = `Test${i + 1}.java`;
                await this.createOrUpdateFile(
                    token, 
                    TARGET_OWNER, 
                    newRepoName,
                    `${testBasePath}${fileName}`,
                    fileContent,
                    `Añadir test automático: ${fileName}`
                );
            }
        }

        // 3. Clases Base
        if (project.baseClasses) {
            const baseClassesFiles = extractFilesForGitHub(project.baseClasses);
            
            for (const file of baseClassesFiles) {
                const fileName = file.path.split('/').pop() || 'clase';
                
                await this.createOrUpdateFile(
                    token,
                    TARGET_OWNER,
                    newRepoName,
                    file.path,
                    file.content,
                    `Añadir clase base generada: ${fileName}`
                );
            }
        }

        return newRepo.html_url;
    }
};