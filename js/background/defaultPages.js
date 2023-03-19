containerDefaultPages = {
  storageArea: {
    area: browser.storage.local,

    getContainerStoreKey(cookieStoreId) {
      const storagePrefix = "CDP@@_";
      return `${storagePrefix}${cookieStoreId}`;
    },

    async get(cookieStoreId) {
      const storeKey = this.getContainerStoreKey(cookieStoreId);
      const storageResponse = await this.area.get([storeKey]); 
      if (storageResponse && storeKey in storageResponse) {
        return storageResponse[storeKey];
      }
      return false;
    },

    set(cookieStoreId, data) {
      const storeKey = this.getContainerStoreKey(cookieStoreId);
      return this.area.set({
        [storeKey]: data
      });
    },

    async remove(cookieStoreId) {
      const storeKey = this.getContainerStoreKey(cookieStoreId);
      return this.area.remove(storeKey);
    },

  },

  async isValidCookieStoreId(cookieStoreId){
    const identities = await browser.contextualIdentities.query({});
    if(identities.some((identity) => identity.cookieStoreId === cookieStoreId)){
      return true;
    }
    if (cookieStoreId == "firefox-default"){
      return true;
    }
    return false;
  },

  async getDefaultPage(cookieStoreId) {
    try{
      if(await this.isValidCookieStoreId(cookieStoreId)){
        return await this.storageArea.get(cookieStoreId);
      }
      return false;
    }catch(e){
      console.log(e);
      return false;
    }
  },

  async setDefaultPage(cookieStoreId, url) {
    try{
      if(await this.isValidCookieStoreId(cookieStoreId)){
        this.storageArea.set(cookieStoreId, url);
      }
      // return false; // TODO?: currently no indication if set fails. 
      // Would also need some work in frontend
    }catch(e){
      console.log(e);
    }
  },

  // currently not used, kept for external messages but could be used to have one backend call.
  async getAllDefaultPages() {
    let identities = await browser.contextualIdentities.query({});
    let defaultUrls = {};
    for (identity of identities){
      defaultUrls[identity.cookieStoreId] = await this.getDefaultPage(identity.cookieStoreId);
    }
    return defaultUrls;
  },

  // currently not used, kept for external messages but could be used to have one backend call.
  async getIdentitiesWithDefaultPages() {
    let identities = await browser.contextualIdentities.query({});
    for (identity of identities){
      identity.newTabUrl = await this.getDefaultPage(identity.cookieStoreId);
    }
    return identities;
  },

  // this is hardcoded for initial testing. This is currently disabled.
  async setDefaultUrls() {
    const hardCodedUrlTest = "https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/";
    let identities = await browser.contextualIdentities.query({});
    identities.forEach(identity => {
      this.storageArea.set(identity.cookieStoreId, hardCodedUrlTest);
    });
  },


  init() {
    browser.contextualIdentities.onRemoved.addListener(changeInfo =>
      this.storageArea.remove(changeInfo.contextualIdentity.cookieStoreId));
      // This is to prevent permanent memory storage. Could also do cross check but
      // there yet to exist a case of memory leak, where this is not sufficient.
  }
};

containerDefaultPages.init();
