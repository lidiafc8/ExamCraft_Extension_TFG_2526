import { useEffect, useRef, useState } from "react"
import mermaid from "mermaid"

interface Props {
  chartCode: string
}

let mermaidInitialized = false

/**
 * Última barrera de limpieza justo antes de renderizar.
 * Corrige los problemas más comunes que genera Gemini:
 *  - Multiplicidades entre comillas: "1" --> "0..n"  →  1 --> 0..n
 *  - Comentarios %% que rompen el parser dentro de bloques de relaciones
 */
function sanitizeForRender(code: string): string {
  if (!code) return ""

  let result = code

  // Quitar comillas alrededor de multiplicidades
  // Ejemplos: "1", "0..n", "0..*", "1..*"
  result = result.replace(/"(\d[\d.*]*(?:\.\.[*\d]+)?)"/g, "$1")

  // Quitar líneas de comentario %%
  result = result
    .split("\n")
    .filter(line => !line.trim().startsWith("%%"))
    .join("\n")

  return result.trim()
}

export function MermaidViewer({ chartCode }: Props) {
  const [svg, setSvg] = useState("")
  const [error, setError] = useState("")
  const [scale, setScale] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const isPanning = useRef(false)
  const startPos = useRef({ mx: 0, my: 0, px: 0, py: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!chartCode) return
    setError("")
    setSvg("")

    const render = async () => {
      try {
        if (!mermaidInitialized) {
          mermaid.initialize({
            startOnLoad: false,
            theme: "base",
            securityLevel: "loose",
          })
          mermaidInitialized = true
        }

        // Sanitizamos aquí como última barrera, por si el código
        // llega con comillas en multiplicidades o comentarios %%
        const safeCode = sanitizeForRender(chartCode)

        console.log("=== MermaidViewer recibe ===")
        console.log(safeCode)
        console.log("============================")

        const id = "mermaid-render-" + Date.now()
        const { svg: renderedSvg } = await mermaid.render(id, safeCode)

        if (!renderedSvg) throw new Error("No se generó SVG")

        setSvg(renderedSvg)
        setScale(1)
        setPan({ x: 0, y: 0 })
      } catch (e: any) {
        console.error("Mermaid render error:", e)
        setError("Error renderizando: " + (e?.message ?? String(e)))
      }
    }

    render()
  }, [chartCode])

  const zoomBy = (delta: number) =>
    setScale(s => Math.max(0.15, Math.min(5, s + delta)))

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    zoomBy(e.deltaY > 0 ? -0.1 : 0.1)
  }

  const onMouseDown = (e: React.MouseEvent) => {
    isPanning.current = true
    startPos.current = { mx: e.clientX, my: e.clientY, px: pan.x, py: pan.y }
  }

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isPanning.current) return
    setPan({
      x: startPos.current.px + e.clientX - startPos.current.mx,
      y: startPos.current.py + e.clientY - startPos.current.my,
    })
  }

  const onMouseUp = () => { isPanning.current = false }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
      <div style={{ display: "flex", gap: 8, alignItems: "center", padding: "4px 8px" }}>
        <button onClick={() => zoomBy(-0.2)} style={btnStyle}>− Zoom</button>
        <span style={{ fontSize: 13, color: "#666", minWidth: 48, textAlign: "center" }}>
          {Math.round(scale * 100)}%
        </span>
        <button onClick={() => zoomBy(0.2)} style={btnStyle}>+ Zoom</button>
        <button onClick={() => { setScale(1); setPan({ x: 0, y: 0 }) }} style={btnStyle}>
          ⟳ Reset
        </button>
      </div>

      <div ref={containerRef} style={{ display: "none" }} />

      <div
        onWheel={handleWheel}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        style={{
          overflow: "hidden",
          cursor: "grab",
          border: "1px solid #e0e0e0",
          borderRadius: 10,
          background: "#fafafa",
          minHeight: 300,
          width: "100%",
          position: "relative",
        }}
      >
        {error ? (
          <div style={{ color: "red", padding: 16, fontSize: 13 }}>
            <div>{error}</div>
            <details style={{ marginTop: 12 }}>
              <summary style={{ cursor: "pointer", color: "#888" }}>Ver código que falló</summary>
              <pre style={{ fontSize: 11, color: "#555", marginTop: 8, overflow: "auto", whiteSpace: "pre-wrap" }}>
                {sanitizeForRender(chartCode)}
              </pre>
            </details>
          </div>
        ) : svg ? (
          <div
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
              transformOrigin: "top left",
              display: "inline-block",
              padding: 16,
            }}
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        ) : (
          <div style={{ padding: 20, color: "#aaa", fontSize: 13 }}>
            Renderizando...
          </div>
        )}
      </div>
    </div>
  )
}

const btnStyle: React.CSSProperties = {
  padding: "4px 10px",
  fontSize: 13,
  borderRadius: 6,
  border: "1px solid #ccc",
  background: "#fff",
  cursor: "pointer",
}