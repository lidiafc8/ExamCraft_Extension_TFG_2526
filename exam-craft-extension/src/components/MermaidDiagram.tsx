import React, { useEffect, useState, useRef } from 'react';
import mermaid from 'mermaid';

// Configuración para un look profesional y limpio
mermaid.initialize({
  startOnLoad: false,
  theme: 'base', // Usamos base para personalizar colores
  themeVariables: {
    primaryColor: '#e8eaf6', // Color de fondo de las cajas (lavanda suave)
    primaryBorderColor: '#5c6bc0', // Bordes azules
    primaryTextColor: '#1a237e', // Texto oscuro
    lineColor: '#7986cb', // Color de las flechas
    fontFamily: 'Segoe UI, Roboto, sans-serif',
    fontSize: '14px'
  },
  securityLevel: 'loose',
});

interface MermaidDiagramProps {
  chartCode: string;
}

export const MermaidDiagram = ({ chartCode }: MermaidDiagramProps) => {
  const [svgContent, setSvgContent] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartCode) return;

    const renderDiagram = async () => {
      try {
        setErrorMessage(null);
        const id = `mermaid-svg-${Math.random().toString(36).substr(2, 9)}`;
        
        // Evitamos el error de tipado con 'any'
        const result: any = await mermaid.render(id, chartCode);
        const svgText = typeof result === 'string' ? result : result.svg;
        
        setSvgContent(svgText);
      } catch (error: any) {
        setErrorMessage(error?.message || "Error en el código UML");
      }
    };

    renderDiagram();
  }, [chartCode]);

  if (errorMessage) {
    return (
      <div style={{ color: '#d32f2f', padding: '10px', fontSize: '12px' }}>
        <strong>Error de renderizado:</strong> {errorMessage}
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      dangerouslySetInnerHTML={{ __html: svgContent }} 
      style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
    />
  );
};