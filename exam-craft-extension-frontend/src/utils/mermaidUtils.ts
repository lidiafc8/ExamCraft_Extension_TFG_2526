export const cleanMermaidCode = (code: string) => {
    if (!code) return '';
    return code.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ').trim();
};

export const extractMermaidCode = (fullText: string) => {
    if (!fullText) return "";
    const separatorRegex = /-{5,}|={5,}/;
    const parts = fullText.split(separatorRegex);
    const diagramPart = parts.find(p => p.toLowerCase().includes("classdiagram") || p.toLowerCase().includes("graph")) || "";
    return diagramPart.replace(/.*?(classDiagram|graph)/is, "$1").trim();
};

export const sanitizeMermaidForModal = (code: string) => {
    if (!code) return '';
    const match = code.match(/(classDiagram|graph)[\s\S]*/i);
    if (!match) return '';
    let clean = match[0];
    clean = clean
        .replace(/<br\s*[\/]?>/gi, '\n')
        .replace(/<\/?p[^>]*>/gi, '\n')
        .replace(/<\/?div[^>]*>/gi, '\n')
        .replace(/<\/?span[^>]*>/gi, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>');
    return clean.trim();
};