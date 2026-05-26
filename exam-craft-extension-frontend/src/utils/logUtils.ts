interface LogProject {
  domainName?: string
  extensionFinish?: string
  [key: string]: any
}

export const buildStandardLogPayload = (
  result: string,
  project: LogProject | null,
  hiddenContext: string,
  promptText: string
) => {
  return {
    dominio: Array.isArray(project?.domainName)
      ? project.domainName.join("-")
      : project?.domainName || "unknown",
    contextoOculto: hiddenContext,
    examenSeleccionado: project?.extensionFinish,
    promptVisible: promptText,
    respuesta: result
  }
}
