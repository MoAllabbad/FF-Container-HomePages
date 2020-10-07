
async function setupContainerTable () {
  // browser.runtime.sendMessage({ method: "loadIdentities" });
  identities = await browser.contextualIdentities.query({}) // .then(m=>console.log(m))
  const identitiesTable = document.getElementById("identities");
  const fragment = document.createDocumentFragment();

  // for (const identity of identities){
  //       // tr.appendChild(hr);

  //   const tr = document.createElement('tr');
  //   const tdIcon = document.createElement('td');
  //   const tdName = document.createElement('td');

  //   const svg = document.createElement('svg');
  //   const use = document.createElement('use');
  //   use.setAttribute("href", identity.iconUrl);
  //   use.setAttribute("fill", identity.color); // fill color is not accurate by name, could use a func with macros

  //   svg.appendChild(use);
  //   tdIcon.appendChild(svg);
  //   // tr.appendChild(img);
  //   const name = document.createTextNode(identity.name);
  //   // tr.appendChild(name);
  //   // fragment.appendChild(tr);
  //   tdName.appendChild(name);

  //   tr.appendChild(tdIcon);
  //   tr.appendChild(tdName);
  //   fragment.appendChild(tr);
 

  // }
  for (const identity of identities){
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
          <input type="url" placeholder="https://example.com">
          </span>
        </div>`;
    
    tr.appendChild(td);
  
    fragment.appendChild(tr);
    // const hr = document.createElement('hr');
    // fragment.appendChild(hr);

  }
  identitiesTable.appendChild(fragment);
    // identitiesTable.appendChild(hr);


}

setupContainerTable ()
// document.body.onload = setupContainerTable;
