import { sanitizeMermaidForModal } from "./mermaidUtils";

export const downloadProjectAsMarkdown = (project: any) => {
        if (!project) return;
        const title = project.customName 
            ? `Examen_Completo_${project.customName}` 
            : `Examen de ${project.domainName}`;
        const fullText = project.extensionFinish || '';
        const mermaidMatch = fullText.match(/(classDiagram|graph)[\s\S]*/i);
        let introText = fullText;
        let finalMermaidCode = '';
        if (mermaidMatch) {
            introText = fullText.substring(0, mermaidMatch.index).trim();
            finalMermaidCode = sanitizeMermaidForModal(fullText);
        }

        const rawTests = project.javaTests;
        let tests;

        if (Array.isArray(rawTests)) {
            tests = rawTests;
        } else {
            tests = rawTests ? [rawTests] : [];
        }

        const testsMarkdown = tests.length > 0
            ? tests.map((t: string, i: number) => {
                const clean = t.trim().replaceAll(/^```[a-z]*\r?\n/i, '').replaceAll(/\r?\n```$/i, '').trim();
                return `### Test${i + 1}.java\n\`\`\`java\n${clean}\n\`\`\``;
            }).join('\n\n')
            : "// No hay tests generados para este examen.";

        const markdownContent = `# ${title}

## 1. Extensión Funcional
${introText || "No hay datos de extensión funcional."}

${finalMermaidCode ? `\`\`\`mermaid\n${finalMermaidCode}\n\`\`\`` : ''}

## 2. Restricciones de Atributos
${project.attributeConstraints || "No se crearon restricciones de atributos para este examen."}

## 3. Relaciones entre Entidades
${project.entityRelations || "No se crearon relaciones entre entidades para este examen."}

## 4. Tests de Java (JUnit)
${testsMarkdown}
`;

        const defaultName = title.replace(/[^a-z0-9áéíóúñ]/gi, '_').toLowerCase();
        const userChosenName = prompt("Introduce el nombre para el archivo a descargar:", defaultName);
        if (userChosenName === null) return;
        let finalFileName = userChosenName.trim() || defaultName;
        if (!finalFileName.toLowerCase().endsWith('.md')) finalFileName += '.md';

        const blob = new Blob([markdownContent], { type: "text/markdown;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = finalFileName;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
    };
