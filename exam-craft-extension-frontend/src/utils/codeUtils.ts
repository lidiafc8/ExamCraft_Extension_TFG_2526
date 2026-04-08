export const parseJavaFiles = (rawText: string) => {
    if (!rawText) return [];

    const regex = /([a-zA-Z0-9_./\-]+\.java);?\s*```[a-z]*\r?\n([\s\S]*?)```/gi; // NOSONAR javascript:S5852
    const results = [];
    let match;

    while ((match = regex.exec(rawText)) !== null) {
        const path = match[1];
        const code = match[2].trim();
        const filename = path.split('/').pop() || 'Archivo.java';
        results.push({ filename, code });
    }

    if (results.length === 0 && rawText.trim() !== '') {
        return [{ filename: 'Código Generado (Formato Irregular)', code: rawText }];
    }

    return results;
};