import { sanitizeMermaidForModal } from "./mermaidUtils";

export const downloadProjectAsMarkdown = (project: any, chosenName: string) => {
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

    const testParts: { fileName: string; code: string }[] = project.testPartsMap
        ? Object.values(project.testPartsMap as Record<string, { fileName: string; code: string }>)
            .filter(p => p?.fileName && p?.code)
            .sort((a, b) => a.fileName.localeCompare(b.fileName))
        : [];

    const testsMarkdown = testParts.length > 0
        ? testParts.map(part =>
            `### ${part.fileName}\n\`\`\`java\n${part.code}\n\`\`\``
        ).join('\n\n')
        : "// No hay tests generados para este examen.";

    const markdownContent = `# ${title}

## 1. Extensión Funcional
${introText || "No hay datos de extensión funcional."}

${finalMermaidCode ? `\`\`\`mermaid\n${finalMermaidCode}\n\`\`\`` : ''}

## 2. Restricciones de Atributos
${project.attributeConstraints || "No se crearon restricciones de atributos para este examen."}

## 3. Relaciones entre Entidades
${project.entityRelationships || "No se crearon relaciones entre entidades para este examen."}

## 4. Tests de Java (JUnit)
${testsMarkdown}
`;

    // --- LÓGICA DE NOMBRE CORREGIDA ---
    // Usamos el nombre que viene del modal (chosenName)
    let finalFileName = chosenName.trim();
    
    // Aseguramos la extensión .md
    if (!finalFileName.toLowerCase().endsWith('.md')) {
        finalFileName += '.md';
    }

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