import { useState } from "react"
import WelcomeScreen from "../screens/WelcomeScreen"
import GithubScreen from "../screens/GithubScreen"
import "/assets/main.css"

export default function IndexTab() {
  // Estado: Controla qué pantalla vemos. Empezamos en "welcome"
  const [screen, setScreen] = useState<"welcome" | "github">("welcome")

  return (
    <div>
      {/* 1. Si el estado es "welcome", mostramos la Bienvenida */}
      {screen === "welcome" && (
        <WelcomeScreen onStart={() => setScreen("github")} />
      )}

      {/* 2. Si el estado es "github", mostramos el Panel */}
      {screen === "github" && (
        <GithubScreen onBack={() => setScreen("welcome")} />
      )}
    </div>
  )
}