containerDefaultPages = {
  storageArea: {
    area: browser.storage.local,

    // These are here to check later if there are inconsistencies between exiting identities and ones in store. i.e garbage collection.
    // The alternative is to keep track of container removals with listeners which might be easier.

    // identityNumStoreKey: "CDP@@_numIdentitiesInStore",

    // incrementIdentitiesInStore(){
    //   // const storeKey = "CDP@@_numIdentitiesInStore";
    //   let numIdentitiesInStore = await this.area.get([this.identityNumStoreKey]);
    //   if (!numIdentitiesInStore[storeKey]){ // is this correct? does it return an object?
    //     numIdentitiesInStore[storeKey] = 1;
    //   }
    //   return this.area.set({ //look into the return
    //     [storeKey]: ++numIdentitiesInStore[storeKey]
    //   });
    // },

    // decrementIdentitiesInStore(){
    //   let numIdentitiesInStore = await this.area.get([this.identityNumStoreKey]);
    //   if (!numIdentitiesInStore[storeKey]){ // is this correct? does it return an object?
    //     numIdentitiesInStore[storeKey] = 0;
    //   }
    //   else{
    //     return this.area.set({ //look into the return, and if this (parent) then should an async function
    //       [storeKey]: --numIdentitiesInStore
    //     });
    //   }
    // },

    getContainerStoreKey(cookieStoreId) {
      const storagePrefix = "CDP@@_";
      return `${storagePrefix}${cookieStoreId}`;
    },

    async get(cookieStoreId) {
      const storeKey = this.getContainerStoreKey(cookieStoreId);
      const storageResponse = await this.area.get([storeKey]); // if no key, undefined is returned? https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/storage/StorageArea/get

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
      // TODO?: In case needed
    },

  },

  async isValidCookieStoreId(cookieStoreId){
    const identities = await browser.contextualIdentities.query({});
    if(identities.some((identity) => identity.cookieStoreId === cookieStoreId)){
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
      // return false; // TODO?: verify api
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
  async loadIdentitiesWithDefaultPages() {
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
    // TODO: add lister for removing containers; needed for extension storage cleanup
          // but not needed for loading containers in option.html as they are currently loaded at frontend level
          // an alternative is to do a cross check on every launch/close and do cleanup then.

  }
};

// containerDefaultPages.init();
