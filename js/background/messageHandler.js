const messageHandler = {

  init() {
    // Handles messages from webextension code
    browser.runtime.onMessage.addListener(async (m) => {
      let response;

      switch (m.method) {
      case "getDefaultPage":
        response = defaultPages.storageArea.getDefaultPage(m.cookieStoreId);
        break;
      case "setDefaultPage":
        if(m.url === ""){
          defaultPages.storageArea.removeDefaultPage(m.cookieStoreId);
        }
        // TODO: if (Utils.isValid(message.url)) 
        // This should be implemented here so we will handle other extension's messages in this module
        // else return message of invalid url to be displaid in the box
        defaultPages.storageArea.setDefaultPage(m.url, m.cookieStoreId);
        break;
      case "loadIdentities":
        response = defaultPages.storageArea.getAllDefaultPages();
        break;
      };
      return response;
    });

    // Handles external messages from webextensions
    const externalExtensionNotAllowed = {}; // if for any reason an extension is known to causes conflict it can be hardcoded
    browser.runtime.onMessageExternal.addListener(async (message, sender) => {
      if (externalExtensionNoteAllowed[sender.id]) {
        throw new Error("External extension is found in conflicting extensions list");
      }

      // check external extension has permission
      const extensionInfo = await browser.management.get(sender.id);
      if (!extensionInfo.permissions.includes("contextualIdentities")) {
        throw new Error("Missing contextualIdentities permission");
      }

      let response;
      switch (message.method) {
      case "getDefaultPage":
        if(!(this.isValidcookieStoreId(message.cookieStoreId))){ // could be moved to Utils later
          throw new Error("Invalid cookieStoreId from external extension message");
        }
        response = assignManager.storageArea.get(message.url);
        break;
      // setting defaul urls is disabled until url validation is done
      // case "setDefaultPage":
      //   // TODO: if (Utils.isValid(message.url)){
      //   response = assignManager.storageArea.get(message.url);
      //   break;
      //   // }
      default:
        throw new Error("Unknown external message.method");
      }
      return response;
    });

    if (browser.contextualIdentities.onRemoved) {
      browser.contextualIdentities.onRemoved.addListener(({contextualIdentity}) => {
        // remove from storega
        // reload identities. // Maybe this is not needed as they will be reloaded again next time options is launched
      });
    }

  },

};

messageHandler.init();
