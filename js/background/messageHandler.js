const messageHandler = {

  init() {
    // Handles messages from webextension code
    browser.runtime.onMessage.addListener(async (m) => {
      let response;

      switch (m.method) {
      case "getDefaultPage":
        response = containerDefaultPages.getDefaultPage(m.cookieStoreId);
        break;
      case "setDefaultPage":
        // TODO?: if (Utils.isValid(message.url)) 
        // user input validity checks can be done in front end and external inputs can be checked below
        // if the same level of check is done for both, then checking could be done here as this is the 
        // first common api entry point. But if extra checks are needed for security on external inputs
        // then separating is an option. 
        // This could be a common point for validity check plus extra checks for external inputs but then
        // some checks might be redundant. Plus moving validity check for user input to front end might 
        // increase performance.
        containerDefaultPages.setDefaultPage(m.cookieStoreId, m.url);
        // TODO?: currently doesn't return anything. If set operation in defaultPages fails, nothing happens 
        break;
      case "loadIdentities":
        response = containerDefaultPages.getAllDefaultPages();
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
        response = containerDefaultPages.getDefaultPage(message.cookieStoreId);
        break;
      case "getAllDefaultPages":
        response = containerDefaultPages.getAllDefaultPages();
        break;
      case "loadIdentitiesWithDefaultPages":
        response = containerDefaultPages.loadIdentitiesWithDefaultPages();
        break;
      // setting defaul urls is disabled until url validation is done
      // case "setDefaultPage":
      //   // TODO: if (Utils.isValid(message.url)){
      //   response = assignManager.storageArea.get(message.url);
      //   break;
      //   // }
      default:
        throw new Error("Unknown external message");
      }
      return response;
    });

  },

};

messageHandler.init();
