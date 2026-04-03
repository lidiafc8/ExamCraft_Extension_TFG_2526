/**
 * 1. Definición de Regex fuera de las funciones.
 * Esto evita que se recompilen en cada llamada, mejorando el rendimiento.
 */
const HTML_TAGS_REGEX = /<[^>]*>?/gm;
const NBSP_REGEX = /&nbsp;/g;
const SEPARATOR_REGEX = /-{5,}|={5,}/;
const MERMAID_TYPE_REGEX = /classDiagram|graph/i;
const MERMAID_CONTENT_REGEX = /(classDiagram|graph)[\s\S]*/i;

// Regex específicas para sanitización (sin escapes innecesarios)
const BR_TAG_REGEX = /<br\s*\/?>/gi;
const P_TAG_REGEX = /<\/?p[^>]*>/gi;
const DIV_TAG_REGEX = /<\/?div[^>]*>/gi;
const SPAN_TAG_REGEX = /<\/?span[^>]*>/gi;

/**
 * Limpia etiquetas HTML y entidades básicas de un bloque de código.
 */
export const cleanMermaidCode = (code: string) => {
    if (!code) {
        return '';
    }
    // SonarCloud prefiere replaceAll con strings o Regex globales para mayor claridad
    return code
        .replaceAll(HTML_TAGS_REGEX, '')
        .replaceAll(NBSP_REGEX, ' ')
        .trim();
};

/**
 * Extrae el bloque de código Mermaid de un texto con separadores.
 */
export const extractMermaidCode = (fullText: string) => {
    // Siempre usar llaves en el if para evitar errores de ejecución incondicional
    if (!fullText) {
        return "";
    }
    
    const parts = fullText.split(SEPARATOR_REGEX);
    const diagramPart = parts.find(p => 
        p.toLowerCase().includes("classdiagram") || 
        p.toLowerCase().includes("graph")
    ) || "";
    
    // Se cambia .match() por .exec() según la recomendación de SonarCloud
    const match = MERMAID_TYPE_REGEX.exec(diagramPart);
    
    // Verificamos match y accedemos al index de forma segura
    return (match && typeof match.index === 'number') 
        ? diagramPart.slice(match.index).trim() 
        : diagramPart.trim();
};

/**
 * Prepara el código Mermaid para mostrarlo en un modal, convirtiendo HTML a texto plano.
 */
export const sanitizeMermaidForModal = (code: string) => {
    if (!code) {
        return '';
    }

    // Uso de .exec() para encontrar el inicio del diagrama
    const match = MERMAID_CONTENT_REGEX.exec(code);
    if (!match) {
        return '';
    }
    
    // match[0] contiene toda la coincidencia encontrada
    let clean = match[0];
    
    // Reemplazos en cadena usando replaceAll para evitar avisos de mantenibilidad
    clean = clean
        .replaceAll(BR_TAG_REGEX, '\n')
        .replaceAll(P_TAG_REGEX, '\n')
        .replaceAll(DIV_TAG_REGEX, '\n')
        .replaceAll(SPAN_TAG_REGEX, '')
        .replaceAll('&nbsp;', ' ')
        .replaceAll('&lt;', '<')
        .replaceAll('&gt;', '>');
        
    return clean.trim();
};