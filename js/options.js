
const Options = {

  identities: [],

  // send message to background script to set container default URL
  async setContainerDefaultPage(url, cookieStoreId) {
    browser.runtime.sendMessage({
      method: "setDefaultPage",
      url: url, 
      cookieStoreId: cookieStoreId
    });
  },

  // send message to background script to get container default URL
  async getContainerDefaultPage(cookieStoreId) {
    return await browser.runtime.sendMessage({
    method: "getDefaultPage",
    cookieStoreId: cookieStoreId
    });
  },

  async setupContainerTable () {
    const body = document.createElement("body");
    body.innerHTML = Utils.escaped`
      <h3>Set a home page next to each container:</h3>
      <div id="identities" 
          aria-label="Menu for Containers and their input boxes for default URL">
      </div>
      <br>
      <p>
        <em>Hint</em>: a valid link starts with something like <strong>https://</strong><br>
      </p>`;
    document.body = body;

    const identitiesTable = document.getElementById("identities");

    // fragment is created with element being added to it then it finally added
    // to the page, to avoid immature page loading.
    const fragment = document.createDocumentFragment();

    for (const identity of this.identities){
      const formId = Utils.containerFormId(identity.cookieStoreId);
      const urlBoxId = Utils.containerUrlBoxId(identity.cookieStoreId);
      const buttonId = Utils.containerButtonId(identity.cookieStoreId);

      const div = document.createElement('div');
      // we are creating several rows, one for each identity. Each row
      // has two wrappers, one for identity info (having icon and name)
      // and for the input (having input box and save button).
      // having the wrappers enables aligning both wrappers as a whole
      // to most left and right with CSS flex-box.
      // more css-related info in options.css
      div.innerHTML = Utils.escaped`
        <div class="row" aria-label="Row for ${identity.name}">
          <div class="identity-info-wrapper">
            <div class="identity-icon"
              data-identity-icon="${identity.icon}"
              data-identity-color="${identity.color}">
            </div>
            <span class="identity-name">${identity.name}</span>
          </div>
          <form class="input-wrapper" id="${formId}">
            <label for="URL Input Box"></label>
            <input type="url" aria-label="Input Default URL" 
              placeholder="Type default URL for container 
              ${identity.name} then press enter" id="${urlBoxId}">
            <input type="submit" aria-label="save-button"
              value="Saved" id="${buttonId}">
          </form>
        </div>`;
      
      fragment.appendChild(div);

      // add a line beak (Horizontal Rule) after each row except the last.
      // this is not only visual, it also makes it easier to separate content
      // for accessibility when using screen readers.
      if (!(this.identities.indexOf(identity) === this.identities.length -1)){
        fragment.appendChild(document.createElement('hr'));
      }

      // get url and show it in input box if it exists
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

      // Form submission event is fired whenever any of its input children are invoked
      // here it's fired either by hitting enter in the input box or pressing the save button.
      defaultPageForm.addEventListener("submit", (event) => {

        // this prevents reloading the page every time user submits the form
        event.preventDefault(); 

        // save url // TODO?: additional url validation could be done here
        const defaultPageUrl = document.getElementById(urlBoxId).value;
        this.setContainerDefaultPage(defaultPageUrl, identity.cookieStoreId);

        // update value and style
        saveBtnId.value = "Saved";
        saveBtnId.classList.remove("save-button");

      });

      // whenever user updates in the input box, replace "Saved" button by "Save" button 
      // and update class for css.
      urlBox.oninput = (input) => {
        // console.log(input);
        saveBtnId.value = "Save";
        saveBtnId.classList.add("save-button");
      }
    }
  },

  loadNoContainers(){
    const body = document.createElement("body");
    body.classList.add("no-containers");

    const h3 = document.createElement("h3");
    const p = document.createElement("p");
    h3.innerHTML = "Oops ...";
    p.innerHTML = "Well, it's empty here. Try creating some containers, then come back here to set their home pages"
    
    body.appendChild(h3);
    body.appendChild(p);
    document.body = body;
  },

  async init(){
    this.identities = await browser.contextualIdentities.query({})
    noContainter = { name: "No Container (if no container is selected)", cookieStoreId: "firefox-default"},
    this.identities.push(noContainter)

    await this.setupContainerTable (); // await so listeners are added to existing elements
    this.addUrlInputListeners();
  }
}

Options.init();
