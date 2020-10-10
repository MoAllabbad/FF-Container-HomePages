
const Options = {

  identities: [],

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
      const formId = Utils.containerFormId(identity.cookieStoreId);
      const urlBoxId = Utils.containerUrlBoxId(identity.cookieStoreId);
      const buttonId = Utils.containerButtonId(identity.cookieStoreId);

      const div = document.createElement('div');

      div.innerHTML = Utils.escaped`
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
          <form class="input-wrapper" id="${formId}">
            <input type="url" placeholder="https://example.com" id="${urlBoxId}">
            <input type="submit" class="save-btn" value="Saved" id="${buttonId}">
          </form>
        </div>`;
      
      fragment.appendChild(div);

      if (!(this.identities.indexOf(identity) === this.identities.length -1)){
        fragment.appendChild(document.createElement('hr'));
      }

      this.getContainerDefaultPage(identity.cookieStoreId)
        .then((url)=> document.getElementById(urlBoxId).value = url? url : "")
        .catch((err)=> console.log(err));
    }
    identitiesTable.appendChild(fragment);
  },

  addUrlInputListeners(){
    for (const identity of this.identities){

      const formId = Utils.containerFormId(identity.cookieStoreId);
      const defaultPageForm = document.getElementById(formId);

      const urlBoxId = Utils.containerUrlBoxId(identity.cookieStoreId);
      const urlBox = document.getElementById(urlBoxId)

      const buttonId = Utils.containerButtonId(identity.cookieStoreId);
      const saveBtnId = document.getElementById(buttonId);

      defaultPageForm.addEventListener("submit", (event) => {

        // this prevents reloading the page every time user submits the form
        event.preventDefault(); 

        // save url // TODO?: additional url validity could be done here
        const defaultPageUrl = document.getElementById(urlBoxId).value;
        this.setContainerDefaultPage(defaultPageUrl, identity.cookieStoreId);

        // update value and style
        saveBtnId.value = "Saved";
        saveBtnId.classList.remove("save-btn");
        saveBtnId.classList.add("saved-btn");

      });

      // replace "Saved" button by "Save" button whenever user types something in the input
      // box and update class for css-style.
      urlBox.addEventListener("keydown", (e) => {
        console.log(e);
        saveBtnId.value = "Save";
        saveBtnId.classList.remove("saved-btn");
        saveBtnId.classList.add("save-btn");
      });
    }
  },

  async init(){
      this.identities = await browser.contextualIdentities.query({})
      await this.setupContainerTable (); // await so listeners are added to existing elements
      this.addUrlInputListeners();
  }

}

Options.init();
