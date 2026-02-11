// background.ts
export {}
 
console.log("Background service worker cargado.")
 
chrome.action.onClicked.addListener(() => {
  // Abre la página que creamos en el paso 1
  chrome.tabs.create({
    url: "tabs/index.html" 
  })
})