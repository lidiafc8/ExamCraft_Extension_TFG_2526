export {}

declare var chrome: any;

chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({
    url: "tabs/index.html" 
  })
})