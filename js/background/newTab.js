

const newTab = {
  isNewTab(tab){
    // for the most part, checking the title is enough. Just in the unlikely case where a page
    // on the web is titled "New Tab", then the second check of the url should take care of 
    // that false positve. However, checking only the url is not enough as the tab info is not
    // likely to have the final url when the onCreated event is fired, which is noted here: 
    // https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/onCreated
    return tab.title == "New Tab"
           && (tab.url == "about:newtab" || tab.url == "about:blank");
  },
  async onCreated(tab){
    if (newTab.isNewTab(tab)){
      const defaultUrl = await containerDefaultPages.getDefaultPage(tab.cookieStoreId)
      browser.tabs.update(tab.tabId, {url: defaultUrl});
    }
  },
  init(){

    // this makes sure container default pages are loaded before listening for new tabs
    // TODO: this won't be needed once the hard-coded urls are removed 
    containerDefaultPages.init(); 
    
    browser.tabs.onCreated.addListener(this.onCreated);
  },
}

newTab.init()

// browser.tabs.onCreated.addListener(tab=> {
//   console.log("hello"); 
//   if (tab.title == "New Tab" && tab.url == "about:newtab"){
//     browser.tabs.update(tab.tabId, {url: "https://duckduckgo.com"})
//   }
// });

// function handleCreated(tab) {
//   console.log("background newTab: tab" + tab)
//   browser.tabs.update(tab.tabId, {url: "https://duckduckgo.com"})
// }

// browser.tabs.onCreated.addListener(handleCreated);