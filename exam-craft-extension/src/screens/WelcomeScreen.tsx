
interface Props {
  onStart: () => void
}

export default function WelcomeScreen({ onStart }: Props) {
  return (
    <div className="container" style={{ textAlign: "center", position: "relative", height: "100vh" }}>
      
      {/* Contenido Central */}
      <div style={{ marginTop: "100px" }}>
        <h1>¡Bienvenido a ExamCraft!</h1>
        <p>Herramienta de ayuda para la generación automática de exámenes de la asignatura Diseño y Pruebas I</p>
      </div>

      {/* EL BOTÓN EN LA ESQUINA */}
      <button 
        onClick={onStart} 
        className="btn-primary"
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
          padding: "10px 20px",
          fontSize: "14px"
        }}
      >
        Acceder a GitHub
      </button>

    </div>
  )
}