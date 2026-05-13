export function downloadMarkdown(content: string, fileName: string) {
  let finalFileName = fileName.trim();

  if (!finalFileName.toLowerCase().endsWith(".md")) {
    finalFileName += ".md";
  }
  
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  
  link.href = url;
  link.download = finalFileName;
  
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}