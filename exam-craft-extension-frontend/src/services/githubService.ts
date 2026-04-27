import type { GithubRepo } from "~src/models/GithubRepo";
import type { GithubUser } from "../models/GithubUser";

export const extractFilesForGitHub = (rawText: string) => {
    if (!rawText) return [];
    const filesToUpload: { path: string, content: string }[] = [];
    
    const blockRegex = /```[a-zA-Z]*\r?\n([\s\S]*?)```/gi; // NOSONAR javascript:S5852
    let match;
    let lastIndex = 0;

    while ((match = blockRegex.exec(rawText)) !== null) {
        const blockStart = match.index;
        let rawCode = match[1];
        let fullPath = '';

        const textBefore = rawText.slice(lastIndex, blockStart);
      
        const pathsBefore = [...textBefore.matchAll(/(?:\/\/[\s\wáéíóú]*[:\s-]*)?([a-zA-Z0-9_./\-]+\.java)/gi)]; // NOSONAR javascript:S5852
        
        if (pathsBefore.length > 0) {
            fullPath = pathsBefore[pathsBefore.length - 1][1];
        } else {

            const pathInsideMatch = rawCode.match(/^[\s*/]*(?:Archivo|Path)?[\s:]*([a-zA-Z0-9_./\-]+\.java)/i); // NOSONAR javascript:S5852
            
            if (pathInsideMatch) {
                fullPath = pathInsideMatch[1];
                const matchedStr = pathInsideMatch[0];
                rawCode = rawCode.substring(matchedStr.length).trim();
            }
        }

        const cleanPath = fullPath.trim();

        if (cleanPath) {
            filesToUpload.push({
                path: cleanPath,
                content: rawCode.trim()
            });
        } else {
            const fallbackName = `src/main/java/generated/ClaseGenerada_${Date.now()}.java`;
            filesToUpload.push({
                path: fallbackName,
                content: rawCode.trim()
            });
        }

        lastIndex = blockRegex.lastIndex;
    }

    return filesToUpload;
};

export const GithubService = {
  
  async getUser(username: string): Promise<GithubUser | null> {
    try {
      const response = await fetch(`https://api.github.com/users/${username}`);
      
      if (!response.ok) {
        throw new Error("Usuario no encontrado");
      }

      const data = await response.json();
      
      return {
        login: data.login,
        avatar_url: data.avatar_url,
        public_repos: data.public_repos,
        bio: data.bio
      };
    } catch (error) {
      console.error("Error fetching github user:", error);
      return null;
    }
  },

  async getMyRepo(owner: string, repoName: string): Promise<GithubRepo | null> {
    try {
      const response = await fetch(`https://api.github.com/repos/${owner}/${repoName}`);
      
      if (!response.ok) {
        throw new Error("Repositorio no encontrado");
      }

      const data = await response.json();
      
      return {
        name: data.name,
        description: data.description,
        html_url: data.html_url,
        stargazers_count: data.stargazers_count
      };
    } catch (error) {
      console.error("Error en el servicio de GitHub:", error);
      return null;
    }
  },

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
    if (contentType?.includes("application/json")) {
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
    } catch {
      console.log(`El archivo ${path} no existe previamente, se creará uno nuevo.`);
    }

    const body: any = {
      message: message,
      content: base64Content,
      ...(sha && { sha })
    };

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
      let getResponse;
      let retries = 5; 

      while (retries > 0) {
        getResponse = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/contents/README.md`,
          {
            headers: {
              "Authorization": `token ${token}`,
              "Accept": "application/vnd.github+json"
            }
          }
        );

        if (getResponse.ok) {
          break;
        }

        if (getResponse.status === 404) {
          await new Promise(resolve => setTimeout(resolve, 2000));
          retries--;
        } else {
          break; 
        }
      }

      if (!getResponse || !getResponse.ok) {
        throw new Error("No se pudo obtener el README.md (GitHub está tardando demasiado en generar la plantilla)");
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

  async _uploadTests(
      token: string, 
      owner: string, 
      repo: string, 
      testPartsMap: Record<string, { fileName: string; code: string }>, 
      testBasePath: string
  ) {
      const parts = Object.values(testPartsMap)
          .filter(p => p?.fileName && p?.code?.trim())
          .sort((a, b) => a.fileName.localeCompare(b.fileName));

      for (const part of parts) {
          await this.createOrUpdateFile(
              token, owner, repo,
              `${testBasePath}${part.fileName}`,
              part.code.trim(),
              `test: añadir ${part.fileName}`
          );
      }
  },

  async _uploadBaseClasses(token: string, owner: string, repo: string, baseClasses: string) {
      const files = extractFilesForGitHub(baseClasses);
      for (const file of files) {
          const fileName = file.path.split('/').pop() || 'clase';
          await this.createOrUpdateFile(token, owner, repo,
              file.path, file.content, `Añadir clase base generada: ${fileName}`);
      }
  },

  async _uploadSolutionBranch(token: string, owner: string, repo: string, baseClasses: string, solutionRaw: string) {
      const baseFiles = extractFilesForGitHub(baseClasses);
      const solutionFiles = extractFilesForGitHub(solutionRaw);
      if (solutionFiles.length === 0 || baseFiles.length === 0) return;

      await new Promise(resolve => setTimeout(resolve, 1500));
      const mainSha = await this.getMainBranchSha(token, owner, repo);
      await this.createBranch(token, owner, repo, "solution", mainSha);

      for (let i = 0; i < solutionFiles.length; i++) {
          const path = baseFiles[i]?.path || solutionFiles[i].path;
          const fileName = path.split('/').pop() || 'solution';
          await this.createOrUpdateFileOnBranch(token, owner, repo,
              path, solutionFiles[i].content, `solution: clase resuelta: ${fileName}`, "solution");
      }
  },

  async deployExam(token, project, newRepoName, templateRepo, testBasePath): Promise<string> {
      const userResponse = await fetch("https://api.github.com/user", {
          headers: { Authorization: `token ${token}` }
      });
      if (!userResponse.ok) throw new Error("Token inválido o caducado (Requires authentication)");

      const { login: TARGET_OWNER } = await userResponse.json();
      const newRepo = await this.createRepoFromTemplate(token, "lidiafc8", templateRepo, newRepoName);
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 1. README
      const introText = project?.extensionStatement || '';
      const finalMermaidCode = project?.extensionMermaid || '';

      const markdownContent =
          `### Examen Completo: ${project?.customName || project?.domainName}\n\n` +
          `#### 1. Extensión Funcional\n${introText || "No hay datos de extensión funcional."}\n\n` +
          (finalMermaidCode ? `\`\`\`mermaid\n${finalMermaidCode}\n\`\`\`\n\n` : '') +
          `#### 2. Restricciones de Atributos\n${project?.attributeConstraints || "No se crearon restricciones de atributos."}\n\n` +
          `#### 3. Relaciones entre Entidades\n${project?.entityRelationships || "No se crearon relaciones entre entidades."}\n`;

      await this.updateReadmeWithDescription(token, TARGET_OWNER, newRepoName, markdownContent);

      // 2. Tests
      if (project?.testPartsMap) {
        await this._uploadTests(token, TARGET_OWNER, newRepoName, project.testPartsMap, testBasePath);
      }

      // 3. Clases base
      if (project?.baseClasses) await this._uploadBaseClasses(token, TARGET_OWNER, newRepoName, project.baseClasses);

      // 4. Rama solution
      if (project?.attributeConstraintsSolution?.trim() && project?.baseClasses) {
          await this._uploadSolutionBranch(token, TARGET_OWNER, newRepoName, project.baseClasses, project.attributeConstraintsSolution);
      }

      return newRepo.html_url;
  },

  async getMainBranchSha(
      token: string,
      owner: string,
      repo: string
  ): Promise<string> {
      const response = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/git/ref/heads/main`,
          {
              headers: {
                  "Authorization": `token ${token}`,
                  "Accept": "application/vnd.github+json"
              }
          }
      );
      if (!response.ok) throw new Error("No se pudo obtener el SHA de main");
      const data = await response.json();
      return data.object.sha;
  },

  async createBranch(
      token: string,
      owner: string,
      repo: string,
      branchName: string,
      fromSha: string
  ): Promise<void> {
      const response = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/git/refs`,
          {
              method: "POST",
              headers: {
                  "Authorization": `token ${token}`,
                  "Accept": "application/vnd.github+json",
                  "Content-Type": "application/json"
              },
              body: JSON.stringify({
                  ref: `refs/heads/${branchName}`,
                  sha: fromSha
              })
          }
      );
      if (!response.ok) {
          const err = await response.json();
          throw new Error(`Error creando rama ${branchName}: ${err.message}`);
      }
  },

  async createOrUpdateFileOnBranch(
      token: string,
      owner: string,
      repo: string,
      path: string,
      content: string,
      message: string,
      branch: string
  ): Promise<any> {
      const base64Content = btoa(encodeURIComponent(content).replaceAll(/%([0-9A-F]{2})/g, (_, p1) => String.fromCodePoint(Number.parseInt(p1, 16))));

      let sha = undefined;
      try {
          const getResponse = await fetch(
              `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`,
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
      } catch {
        
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
              body: JSON.stringify({
                  message,
                  content: base64Content,
                  branch,
                  ...(sha && { sha })
              })
          }
      );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Error subiendo ${path} a rama ${branch}: ${errorData.message}`);
        }

        return await response.json();
    }

};
