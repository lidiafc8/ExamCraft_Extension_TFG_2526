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

export function getAllFromChrome(): Promise<Record<string, any>[]> {
  return new Promise((resolve, reject) => {
    if (!globalThis.chrome?.storage?.local) {
      resolve([])
      return
    }
    chrome.storage.local.get(null, (items: Record<string, any>) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError)
      } else {
        resolve(Object.entries(items).map(([key, value]) => ({ ...value, _key: key })))
      }
    })
  })
}