import { afterEach, describe, expect, it, vi } from "vitest"

import { buildStandardLogPayload, getLogConfig } from "./logUtils"

interface LogProject {
  domainName?: string
  extensionFinish?: string
  [key: string]: any
}

describe("Logger Utilities", () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  describe("buildStandardLogPayload", () => {
    describe("Casos positivos", () => {
      it("mapea correctamente las propiedades cuando el project tiene un domainName de tipo string", () => {
        const project: LogProject = {
          domainName: "mi-dominio.com",
          extensionFinish: "Examen Final"
        }
        const result = buildStandardLogPayload(
          "Éxito",
          project,
          "contexto_a",
          "prompt_b"
        )

        expect(result).toEqual({
          dominio: "mi-dominio.com",
          contextoOculto: "contexto_a",
          examenSeleccionado: "Examen Final",
          promptVisible: "prompt_b",
          respuesta: "Éxito"
        })
      })

      it("une con guiones un domainName que es un Array de strings", () => {
        const project: LogProject = {
          domainName: ["sub", "dominio", "principal"] as any,
          extensionFinish: "Parcial 1"
        }
        const result = buildStandardLogPayload("OK", project, "ctx", "prmt")

        expect(result.dominio).toBe("sub-dominio-principal")
      })

      it("retorna 'unknown' si el project viene como null", () => {
        const result = buildStandardLogPayload("OK", null, "ctx", "prmt")
        expect(result.dominio).toBe("unknown")
        expect(result.examenSeleccionado).toBeUndefined()
      })

      it("asigna correctamente el string de respuesta (result) incluso si es plano o extenso", () => {
        const longResult = "A".repeat(1000)
        const payload = buildStandardLogPayload(longResult, null, "", "")
        expect(payload.respuesta).toBe(longResult)
      })
    })

    describe("Casos negativos", () => {
      it("devuelve 'unknown' si el domainName no está presente en el objeto project", () => {
        const project: LogProject = { extensionFinish: "Test" }
        const result = buildStandardLogPayload("OK", project, "ctx", "prmt")
        expect(result.dominio).toBe("unknown")
      })

      it("maneja de forma segura valores de project que no cumplen con la interfaz en runtime", () => {
        const result = buildStandardLogPayload(
          "OK",
          "no_soy_un_objeto" as any,
          "ctx",
          "prmt"
        )
        expect(result.dominio).toBe("unknown")
        expect(result.examenSeleccionado).toBeUndefined()
      })
    })

    describe("Casos límite", () => {
      it("retorna 'unknown' si el domainName es un string vacío", () => {
        const project: LogProject = { domainName: "" }
        const result = buildStandardLogPayload("OK", project, "ctx", "prmt")
        expect(result.dominio).toBe("unknown")
      })

      it("une los elementos correctamente si el domainName es un array de un solo elemento", () => {
        const project: LogProject = { domainName: ["single"] as any }
        const result = buildStandardLogPayload("OK", project, "ctx", "prmt")
        expect(result.dominio).toBe("single")
      })

      it("retorna un string con guiones si el array de domainName contiene strings vacíos", () => {
        const project: LogProject = { domainName: ["", "", ""] as any }
        const result = buildStandardLogPayload("OK", project, "ctx", "prmt")
        expect(result.dominio).toBe("--")
      })

      it("acepta caracteres especiales, emojis y unicode en todas las entradas de texto", () => {
        const project: LogProject = {
          domainName: "🌐-domain",
          extensionFinish: "📝-exam"
        }
        const result = buildStandardLogPayload(
          "🚀-res",
          project,
          "🥷-ctx",
          "💬-prmt"
        )

        expect(result).toEqual({
          dominio: "🌐-domain",
          contextoOculto: "🥷-ctx",
          examenSeleccionado: "📝-exam",
          promptVisible: "💬-prmt",
          respuesta: "🚀-res"
        })
      })
    })
  })

  describe("getLogConfig", () => {
    describe("Casos positivos", () => {
      it("inicializa el objeto de configuración con el nombre del ejercicio correcto", () => {
        const config = getLogConfig("Matematicas_101", null, "ctx", "prmt")
        expect(config.logExerciseName).toBe("Matematicas_101")
      })

      it("expone una función buildLogPayload en el objeto de retorno", () => {
        const config = getLogConfig("Test", null, "ctx", "prmt")
        expect(config.buildLogPayload).toBeInstanceOf(Function)
      })
    })

    describe("Flujo e Integración (Closure Capture)", () => {
      it("captura por clausura los argumentos iniciales y los inyecta al ejecutar buildLogPayload", () => {
        const projectMock: LogProject = {
          domainName: "educacion.org",
          extensionFinish: "Quiz 2"
        }

        const config = getLogConfig(
          "Historia_Universal",
          projectMock,
          "contexto_secreto",
          "pregunta_visible"
        )

        const payloadFinal = config.buildLogPayload(
          "Esta es la respuesta del usuario"
        )

        expect(payloadFinal).toEqual({
          dominio: "educacion.org",
          contextoOculto: "contexto_secreto",
          examenSeleccionado: "Quiz 2",
          promptVisible: "pregunta_visible",
          respuesta: "Esta es la respuesta del usuario"
        })
      })

      it("mantiene el aislamiento de datos si se generan múltiples instancias concurrentes", () => {
        const configA = getLogConfig(
          "Examen_A",
          { domainName: "a.com" },
          "ctx_a",
          "prompt_a"
        )
        const configB = getLogConfig(
          "Examen_B",
          { domainName: "b.com" },
          "ctx_b",
          "prompt_b"
        )

        const payloadA = configA.buildLogPayload("res_a")
        const payloadB = configB.buildLogPayload("res_b")

        expect(payloadA.dominio).toBe("a.com")
        expect(payloadA.promptVisible).toBe("prompt_a")

        expect(payloadB.dominio).toBe("b.com")
        expect(payloadB.promptVisible).toBe("prompt_b")
      })
    })
  })
})
