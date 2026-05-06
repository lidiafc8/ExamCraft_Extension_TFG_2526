declare var chrome: any

export function saveToChrome(key: string, data: Record<string, any>): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!globalThis.chrome?.storage?.local) {
      reject(new Error("Esta funcionalidad solo está disponible dentro de la Extensión de Chrome."))
      return
    }
    chrome.storage.local.set({ [key]: data }, () => {
      if (chrome.runtime.lastError) reject(chrome.runtime.lastError)
      else resolve()
    })
  })
}