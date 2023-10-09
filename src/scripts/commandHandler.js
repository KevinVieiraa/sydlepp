//TODO: Comentar arquivo

const COMMANDS_MAP = {
    "Abrir classe": cmdOpenSearchClass,
    "Listar classe": cmdOpenClassListing,

    "Editar objeto": cmdClickEditButton,
    "Salvar objeto": cmdClickSaveButton,
    "Cancelar edição": cmdClickCancelButton,
    
    "Duplicar objeto": cmdClickDuplicateButton,
    "Histórico do objeto": cmdClickHistoryButton,
    "Campos do objeto": cmdClickFieldsButton,

    "Id do objeto": cmdShowObjectIdWindow,
    "Json do objeto": cmdShowObjectJsonWindow,

    "Abrir aba de detalhes": cmdOpenTabDetails,
    "Abrir aba de dados": cmdOpenTabData,
    "Abrir aba de timeline": cmdOpenTabTimeline,

    "Proxima sugestão": cmdNextSuggestion,
    "Sugestão anterior": cmdPreviousSuggestion,

    "Abrir Janela de Snippet": cmdShowSnippetWindow
}

function cmdOpenSearchClass() {
    openClassSearchPrompt("Abrir classe", "show");
}

function cmdOpenClassListing() {
    openClassSearchPrompt("Listar objetos", "list");
}

function openClassSearchPrompt(title, view) {
    Swal.fire({
        title: title,
        input: 'text',
        inputAttributes: {
            autocapitalize: 'off'
        },
        showCancelButton: false,
        confirmButtonText: title.split(" ")[0],
        confirmButtonColor: '#1C3C2E',
        showLoaderOnConfirm: true,
        preConfirm: (search) => {
            return search;
        },
        allowOutsideClick: () => !Swal.isLoading()
    })
    .then((search) => {
        resetAutocompleteClasses();

        if(!search.value)
            return;

        let match = searchClass(search.value, view);
    });

    getAutocompleteClasses();
}

//TODO: Refatorar. A função busca E redireciona para a classe
function searchClass(search, view) {
    let classTree = JSON.parse(localStorage.getItem('classTree'));
    let cSearch = removeSpecials(search);
    let match = false;
    
    match = classTree.find(p => {
        let found = p.packageClasses.find(c => {
            let idf = removeSpecials(c.identifier);
            let id = removeSpecials(c._id);
            let name = removeSpecials(c.name);

            if (idf == cSearch || id == cSearch || name == cSearch) {
                return true;
            }
            return false;
        });

        if (found) {
            clickClass({
                packageName: p.packageName,
                className: found.name
            });
            listObjects(found._id)
            if (view == "show") openClass(found._id);
        }

        return Boolean(found);
    });

    if(match) 
        return Boolean(match);

    match = classTree.find(p => {
        let found = p.packageClasses.find(c => {
            let idf = removeSpecials(c.identifier);
            let id = removeSpecials(c._id);
            let name = removeSpecials(c.name);

            if (idf.indexOf(cSearch) != -1 || id.indexOf(cSearch) != -1 || name.indexOf(cSearch) != -1) {
                return true;
            }
            return false;
        });

        if (found) {
            clickClass({
                packageName: p.packageName,
                className: found.name
            });
            listObjects(found._id);
            if (view == "show") openClass(found._id);
        }

        return Boolean(found);
    });
    

    return Boolean(match);
}

//TODO: avaliar se deve estar em outro arquivo
function clickClass(config) {
    let packageName = config.packageName;
    let className = config.className;
    let doc = window.parent ? window.parent.document : window.document;
    let packageMenu = Array.from(doc.querySelector('iframe[slotname=explorer_class_listing]').contentDocument.querySelectorAll('span')).find(el => el.innerText === packageName);
    let classeMenu = Array.from(doc.querySelector('iframe[slotname=explorer_class_listing]').contentDocument.querySelectorAll('span')).find(el => el.innerText === className);

    if (!classeMenu && packageMenu) {
        packageMenu.click();
        classeMenu = Array.from(doc.querySelector('iframe[slotname=explorer_class_listing]').contentDocument.querySelectorAll('span')).find(el => el.innerText === className);
    }

    if (classeMenu) {
        classeMenu.click();
        setTimeout(function () {
            if (config.search) {
                doc.querySelector('iframe[slotname=explorer_object_listing]').contentDocument.querySelector('.list-search').value = config.search;
                let eventObj = doc.querySelector('iframe[slotname=explorer_object_listing]').contentDocument.createEvent('HTMLEvents');
                eventObj.initEvent('input', true, true)
                doc.querySelector('iframe[slotname=explorer_object_listing]').contentDocument.querySelector('.list-search').dispatchEvent(eventObj)
                doc.querySelector('iframe[slotname=explorer_object_listing]').contentDocument.querySelector('.search-button').click();
                setTimeout(function () {
                    let cards = doc.querySelector('iframe[slotname=explorer_object_listing]').contentDocument.querySelector('.card-item .card-item .card');
                    let card = cards && cards.length > 0 ? cards[0] : cards;

 

                    if (card) {
                        card.click();
                    }
                }, 1000)
            }
            
            // doc.querySelector('iframe[slotname=explorer_object_listing]').contentDocument.querySelector('.list-search').focus();
        }, 500);
    }
}

function listObjects(cid) {
    open('explorer_object_listing', cid);
}

function openClass(cid) {
    open('explorer_object_details', '000000000000000000000000', cid);
}

function openObject(cid, id) {
    open('explorer_object_details', cid, id);
}

function open(view, cid, id) {
    let body = {
        "view": view,
        "stack": null,
        "queryParameters": {
            "cid": cid
        }
    };

    if (id) {
        body.queryParameters.id = id;
    }

    let recipient = {
        "slot": view,
        "target": "_workspace"
    };

    this.sendMessage('_open', body, recipient);
}

function sendMessage(subject, body, recipient = null) {
    recipient = recipient || {
        "slot": null,
        "target": null
    };

    let message = {
        "source": "SYDLE_EXPLORER",
        "subject": subject,
        "delay": 0,
        "body": body,
        "recipient": recipient
    };

    window.postMessage(JSON.stringify(message), '*');
}

function resetAutocompleteClasses() {
    $(function() {
        $("#swal2-input").autocomplete({})
    });
}

function getAutocompleteClasses() {
    $(function() {
        let autocompleteOptions = [];
        let classTree = JSON.parse(localStorage.getItem('classTree'));

        classTree.forEach(p => p.packageClasses.forEach(c => autocompleteOptions.push(c.name)));

        $("#swal2-input").autocomplete({
            source: autocompleteOptions
        })
    });
}

function cmdClickEditButton() {
    let doc = window.parent ? window.parent.document : window.document;
    try{ 
        let iFrame = doc.querySelector('iframe[slotname=explorer_object_details]')  || doc.querySelector('iframe[slotname=permalink-workspace-slot]');

        let editButton = iFrame.contentDocument.querySelector('button[title=Editar]');
        let updateButton = iFrame.contentDocument.querySelector('button[title=Atualizar]');
        let editButtonFullView = iFrame.contentDocument.querySelector('button[title=Editar]');
        let editButtonScript = iFrame.contentDocument.querySelector('button[title=Editar script]');
        
        let button = editButtonScript || editButton || updateButton || editButtonFullView;
        button.click();
    }
    catch(error) {}
}

function cmdClickSaveButton() {
    let doc = window.parent ? window.parent.document : window.document;
    try{ 
        let iFrame = doc.querySelector('iframe[slotname=explorer_object_details]') || doc.querySelector('iframe[slotname=permalink-workspace-slot]');

        let confirmButton = iFrame.contentDocument.querySelector('button[title=Confirmar]');
        let publishButton = iFrame.contentDocument.querySelector('button[title=Publicar]');
        let confirmButtonFullView = iFrame.contentDocument.querySelector('button[title=Publicar]');

        let button = confirmButton || publishButton || confirmButtonFullView;
        button.click();
    }
    catch(error) {}
}

function cmdClickCancelButton() {
    let doc = window.parent ? window.parent.document : window.document;
    try{
        let iFrame = doc.querySelector('iframe[slotname=explorer_object_details]') || doc.querySelector('iframe[slotname=permalink-workspace-slot]');

        let cancelButton = iFrame.contentDocument.querySelector('button[title=Cancelar]');
        let cancelButtonFullView = iFrame.contentDocument.querySelector('button[title=Cancelar]');

        let button = cancelButton || cancelButtonFullView;
        button.click();
    }
    catch(error) {}
}

function clickMenuOptions(option) {
    let doc = window.parent ? window.parent.document : window.document;

    let iFrame = doc.querySelector('iframe[slotname=explorer_object_details]');

    if(!iFrame)
        iFrame = doc.querySelector('iframe[slotname=permalink-workspace-slot]');

    let queryResult = iFrame.contentDocument.querySelectorAll('li a span[class=item-label]');
    let button = Array.from(queryResult).find(result => result.outerText && result.outerText === option);

    button.click();
}

function cmdClickDuplicateButton() {
    clickMenuOptions("Duplicar")
}

function cmdClickHistoryButton() {
    clickMenuOptions("Histórico")
}

function cmdClickFieldsButton() {
    clickMenuOptions("Campos do sistema")
}

function cmdShowObjectIdWindow() {
    let objectId = getActiveObjectIds().id;

    Swal.fire({
        title: "Id copiado!",
        text: objectId,
        showConfirmButton: false,
        showCancelButton: false
    });
}

function cmdShowObjectJsonWindow() {
    let info = getActiveObjectIds();

    getObjectJson(info.id, info.cid)
    .then((json) => {
        if(!json)
            return;

        console.log(renderjson(json));

        renderjson.set_show_to_level(1);

        Swal.fire({
            title: "JSON copiado!",
            html: renderjson(json),
            showConfirmButton: false,
            showCancelButton: false,
            width: '50%'
        });

        setTimeout(async ()=> {
            await window.navigator.clipboard.writeText(JSON.stringify(json));
        }, 250);
    });
}

function getActiveObjectIds() {
    let doc = window.parent ? window.parent.document : window.document;
    let iFrame = doc.querySelector('iframe[slotname=explorer_object_details]') || doc.querySelector('iframe[slotname=permalink-workspace-slot]');

    let objectDetails = iFrame;

    if(!objectDetails || !objectDetails.src)
        return "";

    let queryString = objectDetails.src.split('?')[1];

    let urlParams = new URLSearchParams(queryString);
    let id = urlParams.get("id");
    let cid = urlParams.get("cid");

    setTimeout(async ()=> {
        await window.navigator.clipboard.writeText(id);
    }, 250);

    return {id: id, cid: cid};
}

async function getObjectJson(id, cid) {
    let tokenStorage = JSON.parse(localStorage.getItem('explorer_user_map'));

    if(!tokenStorage || !tokenStorage.main) 
        return null;

    let token = tokenStorage.main.users[0].accessToken.token;
    let reqResult = await $.ajax(`/api/1/main/_classId/${cid}/_get/${id}?accessToken=${token}`);

    return reqResult;
}

function cmdOpenTabDetails() {
    clickObjectTab("Detalhes");
}

function cmdOpenTabData() {
    clickObjectTab("Dados");
}

function cmdOpenTabTimeline() {
    clickObjectTab("Timeline");
}

function clickObjectTab(tabName) {
    let doc = window.parent ? window.parent.document : window.document;
    let queryResult = doc.querySelector('iframe[slotname=explorer_object_details]').contentDocument.querySelectorAll('li a span');
    
    let button = Array.from(queryResult).find(result => result.outerText && result.outerText === tabName);
    button.click();
}

function cmdNextSuggestion() {
    updateSuggestion(1);
}

function cmdPreviousSuggestion() {
    updateSuggestion(-1);
}

function searchSnippet(field, value) {
    let snippet = getSnippets().find(snippet => snippet[field] === value);

    return snippet;
}

function cmdShowSnippetWindow(snippetName) {
    let snippet = searchSnippet("name", snippetName);
    let isNewSnippet = snippet === null || snippet === undefined;

    let title = isNewSnippet ? "Novo Snippet" : "Editar Snippet";

    let name = isNewSnippet ? `""` : `"${snippet.name}"`;
    let shortcut = isNewSnippet ? `""` : `"${snippet.shortcut}"`;
    let value = isNewSnippet ? "" : snippet.value;

    //Permite usar o Tab no campo do snippet
    let onKeyDown = `"if(event.keyCode===9){
        event.preventDefault();
        event.stopImmediatePropagation();
        document.execCommand('insertText', false, '\t');
    }"`;
    
    Swal.fire({
        title: title,
        html: `<input id="original-name-input" value=${name} type="hidden">` +
              `<input id="create-snippet-input" value=${isNewSnippet} type="hidden">` +
              `<input id="name-input" class="swal2-input" placeholder="Nome" value=${name}>` +
              `<input id="shortcut-input" class="swal2-input" placeholder="Atalho" value=${shortcut}>` + 
              `<textarea id="value-input" class="swal2-textarea" placeholder="//Insira o snippet aqui" onkeydown=${onKeyDown}>${value}</textarea>`,
        showConfirmButton: true,
        showDenyButton: !isNewSnippet,
        showCancelButton: true,
        confirmButtonText:'<i class="fa fa-check"></i> Salvar',
        confirmButtonColor: '#429767',
        cancelButtonText: 'Cancelar',
        cancelButtonColor: '#9e9e9e',
        denyButtonText: `<i class="fa fa-trash-o"></i> Apagar`,
        denyButtonColor: `#941c24`,
        reverseButtons: true,
        width: '800px',
        preConfirm: () => {
            let nameInput = Swal.getPopup().querySelector('#name-input').value;
            let shortcutInput = Swal.getPopup().querySelector('#shortcut-input').value;
            let valueInput = Swal.getPopup().querySelector('#value-input').value;
            let isNewSnippet = Swal.getPopup().querySelector('#create-snippet-input').value === "true";

            if (!nameInput || !shortcutInput || !valueInput) {
                Swal.showValidationMessage(`Por favor, preencha todos os campos`);
            }

            if(isNewSnippet && searchSnippet("name", nameInput)) {
                Swal.showValidationMessage(`Já existe um snippet com esse nome`);
            }

            if(isNewSnippet && searchSnippet("shortcut", shortcutInput)) {
                Swal.showValidationMessage(`Já existe um snippet com esse atalho`);
            }

            return { snippet: { name: nameInput, shortcut: shortcutInput, value: valueInput} , isNew: isNewSnippet };
        }
    })
    .then((result) => {
        let snippets = getSnippets();

        if(result.isConfirmed) {
            if(result.value.isNew) {
                snippets.push(result.value.snippet);
                setSnippets({"snippets": snippets});
                return;
            }
            
            let snippetIndex = snippets.findIndex(snippet => snippet.shortcut === result.value.snippet.shortcut);
            snippets[snippetIndex] = result.value.snippet;
            setSnippets({"snippets": snippets});
            chrome.runtime.sendMessage({ action: "Reload Snippets" });
        }
        else if(result.isDenied) {
            let nameInput = Swal.getPopup().querySelector('#original-name-input').value;

            snippets = snippets.filter(snippet => snippet.name !== nameInput);
            setSnippets({"snippets": snippets});
            chrome.runtime.sendMessage({ action: "Reload Snippets" });
        }
    });
}

function initializeCommands() {
    chrome.runtime.onMessage.addListener((message) => {
        if(!message.parameters){
            COMMANDS_MAP[message.action]();
            return;
        }

        COMMANDS_MAP[message.action].apply(this, message.parameters);
    });
}