

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
    let isNew = tab.openerTabId === undefined;
    // TODO?:: is there a case where a newly created tab is new but does not have a parent tab?!
    // if (tab.status == "complete" &&
    //    !(tab.title == "New Tab") || 
    //    (tab.url == "about:newtab" &&
    //     tab.url == "about:blank")){
    //       isNew = false;
    // }
    // TODO?: may add onUpdated listener here for edge case
    return isNew;
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
