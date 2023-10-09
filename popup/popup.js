function loadDefaultUserSnippets() {
    //TODO: ler de config.json
    let snippets = { "snippets": [
        { "name": "Stringify", "shortcut": "stringify", "value": "_utils.stringifyAsJson(object);" },
        { "name": "Get Method", "shortcut": "getMethod", "value": '_utils.getMethod("_classId", classIdentifier, methodIdentifier)(params)' },
        { "name": "Função", "shortcut": "function", "value": "function name(parameters) {\n\n}\n" },
        { "name": "For", "shortcut": "for", "value": "for (let index = 0; index < array.length; index++) {\n\tconst element = array[index];\n\n}" },
        { "name": "While", "shortcut": "while", "value": "while (param) {\n\n}\n" },
        { "name": "Query", "shortcut": "query", "value": 'let query = {\n\t"query": {\n\t\t\n\t}\n};\n' },
        { "name": "Query Hits", "shortcut": "hits", "value": "hits.hits.map(hit => hit._source);" },
    ]}
    
    chrome.storage.local.set({ snippets });
    localStorage.setItem('snippets', JSON.stringify(snippets));
}

async function loadUserSnippets() {
    let result = await chrome.storage.local.get(["snippets"]); 

    if(!result.snippets)
        loadDefaultUserSnippets();

    localStorage.setItem('snippets', JSON.stringify(result.snippets));
    return result.snippets;
}

function sendCommand(command, parameters) {
    try {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, { action: command, parameters: parameters });
        });
    }
    catch(error) {}
}

function getSnippets() {
    let snippets = JSON.parse(localStorage.getItem('snippets'));
    return snippets.snippets;
}

function openSection(event) {
    tabcontent = document.getElementsByClassName("section");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    
    tablinks = document.getElementsByClassName("tab");
    for (i = 0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    
    event.currentTarget.className += " active";

    let buttonData = document.getElementsByClassName("tab active")[0].dataset;
    let sectionId = buttonData.sectiontarget;

    document.getElementById(sectionId).style.display = "block";
}

function openShortcuts() {
    chrome.tabs.create({
        url: 'chrome://extensions/shortcuts',
        active: true
    })
}

function createSnippetButton(parentElement, name, index) {
    let snippetButton = document.createElement("button");
    snippetButton.setAttribute("class", "link-button");
    snippetButton.setAttribute("id", "snippet-button-" + index);

    let snippetIcon = document.createElement("i");
    snippetIcon.setAttribute("class", "fa fa-file-code-o");
    
    let snippetText = document.createElement("p");
    snippetText.innerHTML = name;

    snippetButton.appendChild(snippetIcon);
    snippetButton.appendChild(snippetText);
    parentElement.appendChild(snippetButton);

    snippetButton.addEventListener("click", () => onSnippetClick(name));
}

function onSnippetClick(name) {
    sendCommand("Abrir Janela de Snippet", [name]);
}

function loadSnippets() {
    loadUserSnippets()
    .then((result) => {
        let buttonsParent = document.getElementById("snippets-button-group");

        let child = buttonsParent.lastElementChild;
        while(child) {
            buttonsParent.removeChild(child); 
            child = buttonsParent.lastElementChild;
        }
        
        result.snippets.forEach((snippet, i) => {
            createSnippetButton(buttonsParent, snippet.name, i);
        });
    });
}

function init() {
    Array.from(document.getElementsByClassName("tab")).forEach(element => element.addEventListener("click", openSection));
    document.getElementById("shortcuts-button").addEventListener("click", openShortcuts);
    document.getElementById("snippets-tab").addEventListener("click", loadSnippets);
    document.getElementById("new-snippet-button").addEventListener("click", () => onSnippetClick(""));

    chrome.runtime.onMessage.addListener((message) => {
        if(message.action === "Reload Snippets")
            loadSnippets();
    });
    
    document.getElementById("default-tab").click();
}

init();