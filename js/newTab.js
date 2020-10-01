

browser.runtime.sendMessage({
  // extensionId,             // optional string
  method: "loadIdentities"      // any
  // options                  // optional object
}).then((identities)=>{
    var url = identities[0].newTabUrl
    browser.tabs.update({url: url})
})
// browser.tabs.update({url: "https://developer.mozilla.org"})
