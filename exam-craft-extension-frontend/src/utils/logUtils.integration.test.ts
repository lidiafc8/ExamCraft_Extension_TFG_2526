import { describe, expect, it } from "vitest"

import { buildStandardLogPayload, getLogConfig } from "./logUtils"

describe("Log Utilities Tests", () => {
  describe("buildStandardLogPayload", () => {
    it("debería construir el payload correctamente con datos planos estándar", () => {
      const mockProject = {
        domainName: "Java-Generics",
        extensionFinish: "Examen de refactorización completo"
      }

      const result = buildStandardLogPayload(
        "Respuesta de la IA",
        mockProject,
        "Contexto oculto del sistema",
        "Prompt visible enviado"
      )

      expect(result).toEqual({
        dominio: "Java-Generics",
        contextoOculto: "Contexto oculto del sistema",
        examenSeleccionado: "Examen de refactorización completo",
        promptVisible: "Prompt visible enviado",
        respuesta: "Respuesta de la IA"
      })
    })

    it("debería unificar el dominio con guiones si es un Array", () => {
      const mockProject: any = {
        domainName: ["Diseño", "Patrones", "Fábrica"],
        extensionFinish: "Enunciado del examen"
      }

      const result = buildStandardLogPayload(
        "Resultado",
        mockProject,
        "Ctx",
        "Prompt"
      )

      expect(result.dominio).toBe("Diseño-Patrones-Fábrica")
    })

    it("debería aplicar valores por defecto de 'unknown' o undefined si el proyecto es nulo", () => {
      const result = buildStandardLogPayload("Resultado", null, "Ctx", "Prompt")

      expect(result).toEqual({
        dominio: "unknown",
        contextoOculto: "Ctx",
        examenSeleccionado: undefined,
        promptVisible: "Prompt",
        respuesta: "Resultado"
      })
    })

    it("debería aplicar 'unknown' si domainName no está definido en el objeto project", () => {
      const mockProject = {
        extensionFinish: "Examen sin dominio explícito"
      }

      const result = buildStandardLogPayload(
        "Resultado",
        mockProject,
        "Ctx",
        "Prompt"
      )
      expect(result.dominio).toBe("unknown")
    })
  })

  describe("getLogConfig", () => {
    it("debería retornar el nombre del ejercicio y una función buildLogPayload operativa", () => {
      const mockProject = {
        domainName: "Programación Web",
        extensionFinish: "Examen Frontend"
      }

      const config = getLogConfig(
        "Ejercicio_01_Prueba",
        mockProject,
        "System Context",
        "User Prompt"
      )

      expect(config.logExerciseName).toBe("Ejercicio_01_Prueba")
      expect(typeof config.buildLogPayload).toBe("function")

      const payloadResult = config.buildLogPayload("Código Java Generado")

      expect(payloadResult).toEqual({
        dominio: "Programación Web",
        contextoOculto: "System Context",
        examenSeleccionado: "Examen Frontend",
        promptVisible: "User Prompt",
        respuesta: "Código Java Generado"
      })
    })
  })
})
