
const Options = {

  identities: [],
  launched: false,

  async setContainerDefaultPage(url, cookieStoreId) {
    browser.runtime.sendMessage({
      method: "setDefaultPage",
      url: url, 
      cookieStoreId: cookieStoreId
    });
  },

  async getContainerDefaultPage(cookieStoreId) {
    return await browser.runtime.sendMessage({
    method: "getDefaultPage",
    cookieStoreId: cookieStoreId
    });
  },

  async setupContainerTable () {
    const identitiesTable = document.getElementById("identities");
    const fragment = document.createDocumentFragment();

    for (const identity of this.identities){
      const containerFormId = Utils.containerFormId(identity.cookieStoreId);
      const containerInputId = Utils.containerInputId(identity.cookieStoreId);

      const tr = document.createElement('tr');
      // tr.classList.add("menu-item");
      const td = document.createElement('td');

      td.innerHTML = Utils.escaped`
          <div class="menu-item-name">
            <div class="menu-icon">
              <div class="usercontext-icon"
                data-identity-icon="${identity.icon}"
                data-identity-color="${identity.color}">
              </div>
            </div>
            <span class="menu-text">${identity.name}</span>
            <span class="menu-box">
              <form id="${containerFormId}">
                <input type="url" placeholder="https://example.com" id="${containerInputId}">
              </form>
            </span>
          </div>`;
      
      tr.appendChild(td);
      fragment.appendChild(tr);

      this.getContainerDefaultPage(identity.cookieStoreId)
        .then((contextUrl)=> document.getElementById(containerInputId).value = contextUrl? contextUrl : "")
        .catch((contextUrl)=> document.getElementById(containerInputId).value = contextUrl? contextUrl : "error..");
    }
    identitiesTable.appendChild(fragment);
      // identitiesTable.appendChild(hr);
  },

  addUrlInputListeners(){
    for (const identity of this.identities){
      const containerFormId = Utils.containerFormId(identity.cookieStoreId);
      const defaultPageForm = document.getElementById(containerFormId);
      const containerInputId = Utils.containerInputId(identity.cookieStoreId);
      // TODO?: additional url validity could be done here
      defaultPageForm.addEventListener("submit", () => {
        const defaultPageUrl = document.getElementById(containerInputId).value
        this.setContainerDefaultPage(defaultPageUrl, identity.cookieStoreId);
      });
    }
  },

  async init(){
    if (!this.launched){
      this.identities = await browser.contextualIdentities.query({})
      await this.setupContainerTable (); // await so listeners are added to existing elements
      this.addUrlInputListeners();

      this.launched = true; // TODO?: elementary way to prevent reloading
      // currently still loads every time with white flash
    }

  }
}

Options.init();


