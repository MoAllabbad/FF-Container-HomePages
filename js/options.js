
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
      const containerUrlBoxId = Utils.containerUrlBoxId(identity.cookieStoreId);

      const div = document.createElement('div');
      const span = document.createElement('span');

      span.innerHTML = Utils.escaped`
        <div class="row">
          <div class="identity-info-wrapper">
            <div class="identity-icon"
              data-identity-icon="${identity.icon}"
              data-identity-color="${identity.color}">
            </div>
            <span class="identity-name">
              ${identity.name}
            </span>
          </div>
          <form id="${containerFormId}">
            <input type="url" placeholder="https://example.com" id="${containerUrlBoxId}">
          </form>
        </div>`;
      
      div.appendChild(span);
      fragment.appendChild(div);

      this.getContainerDefaultPage(identity.cookieStoreId)
        .then((contextUrl)=> document.getElementById(containerUrlBoxId).value = contextUrl? contextUrl : "")
        .catch((contextUrl)=> document.getElementById(containerUrlBoxId).value = contextUrl? contextUrl : "error..");
    }
    identitiesTable.appendChild(fragment);
      // identitiesTable.appendChild(hr);
  },

  addUrlInputListeners(){
    for (const identity of this.identities){
      const containerFormId = Utils.containerFormId(identity.cookieStoreId);
      const defaultPageForm = document.getElementById(containerFormId);
      const containerUrlBoxId = Utils.containerUrlBoxId(identity.cookieStoreId);
      // TODO?: additional url validity could be done here
      defaultPageForm.addEventListener("submit", (event) => {
        event.preventDefault(); // this prevents reloading the page every time user presses enter to input something
        const defaultPageUrl = document.getElementById(containerUrlBoxId).value
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
