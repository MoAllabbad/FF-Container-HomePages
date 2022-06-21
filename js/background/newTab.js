

const newTab = {
  isNewTab(tab){
    // checking openerTabId this way prevents loading default url to links that are directed to new tabs
    // such as "Open in New Tab". Otherwise, checking only the tab title and url is not enough as both 
    // will keep updating while the tab status changes from "loading" to "complete".
    // https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/onCreated
    // We could wait for the tab to finish loading and check the title and the url but that's time wasted.
    // There yet to exist a legitimate case where checking openerTabId does not work. 
    // known issue: this won't work in case of opening "about:newtab" link as "Open in New Tab"
    // but arguably that's not a real use case.

    // this used to only check the openerTabId and worked for most cases, but caused a conflict with the MAC ext. issue #1
    // so checking the URL was added which requires the tab permission. 
    // Checking the URL alone should be enough but keeping the openerTabId check should not cause issues.
    let isNew = tab.openerTabId === undefined && (tab.url === "about:newtab" || tab.url === "about:blank");
    return isNew;
  },
  async onCreated(tab){
    if (newTab.isNewTab(tab)){
      try{
        const defaultUrl = await containerDefaultPages.getDefaultPage(tab.cookieStoreId)
        if(defaultUrl){
          browser.tabs.update(tab.tabId, {url: defaultUrl});
        }
      }catch(e){
        console.log(e)
      }
    }
  },
  init(){
    browser.tabs.onCreated.addListener(this.onCreated);
  },
}

newTab.init()
