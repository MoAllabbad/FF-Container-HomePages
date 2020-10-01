containerDefaultPages = {
  storageArea: {
    area: browser.storage.local,

    // These are here to check later if there are inconsistinsies between exsiting identities and ones in store.

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
      return false; // TODO: verify api
    },

    set(cookieStoreId, data) {
      // if (this.isValidUrl(url)){ // look further later into api design of where this verification should go
      //   if (this.isCurrentlyUsedIdentity(cookieStoreId)){// look further later into api design of where this verification should go
      const storeKey = this.getContainerStoreKey(cookieStoreId);
      return this.area.set({
        [storeKey]: data
      });
    },

    async remove(cookieStoreId) {
      // TODO: disabled util Utils is implemented
      // const storeKey = this.getContainerStoreKey(cookieStoreId);
      // return this.area.remove([storeKey]);
    },

    // async isCurrentlyUsedIdentity(cookieStoreId){
    //   const identities = await browser.contextualIdentities.query({});
    //   const isMatch = identities.some(
    //     (identity) => identity.cookieStoreId === cookieStoreId
    //   );
    //   return isMatch;
    // },

    // // this one might be redundant. Could use get() instead
    // isInStorage(cookieStoreId){
    //   const storeKey = this.getContainerStoreKey(cookieStoreId);
    //   const storageResponse = await this.area.get([storeKey]);
    //   if (storageResponse && storeKey in storageResponse) {
    //     return true;
    //   }
    //   else{
    //     false; // TODO: verify api
    //   }
    // },

  },

  async getDefaultPage(cookieStoreId) {
    // TODO: disabled util Utils is implemented
    // if(Utils.isValidCookieStoreId(cookieStoreId)){
    //   return await this.storageArea.get(cookieStoreId);
    // }
    // return false; // TODO: verify api
  },

  async getAllDefaultPages() {
    let identities = await browser.contextualIdentities.query({});
    for (identity of identities){
      identity.newTabUrl = await this.storageArea.get(identity.cookieStoreId);
    }
    // TODO: currently all identities are set to hardcoded url, so look into the case when url has not been set
    // in that case, it is currently set to false by the called function.
    return identities;
  },

  // this is hardcoded for initial testing
  async setDefaultUrls() {
    const hardCodedUrlTest = "https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions";
    let identities = await browser.contextualIdentities.query({});
    identities.forEach(identity => {
      this.storageArea.set(identity.cookieStoreId, hardCodedUrlTest);
    });
  },

  async removeDefaultPage(cookieStoreId) {
    // TODO: disabled util Utils is implemented
    // if(Utils.isValidCookieStoreId(cookieStoreId)){
    //   return await this.storageArea.get(cookieStoreId);
    // }
    // return false; // TODO: verify api
  },

  init() {
    // TODO: add lister for removing containers
    // TODO: also check if updating container info changes its cookieId and so needs a listener

    // this temporarily hardcoded
    this.setDefaultUrls();
    // this.getAllDefaultPages();

  }
};

containerDefaultPages.init();

// .catch((e) => {
//   throw e;
// });