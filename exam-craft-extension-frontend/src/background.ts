export {}
 
console.log("Background service worker cargado.")
 
chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({
    url: "tabs/index.html" 
  })
})