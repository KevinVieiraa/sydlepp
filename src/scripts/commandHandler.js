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

    "Renomear tab": cmdChangeTabTitle
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
            try {
                clickClass({
                    packageName: p.packageName,
                    className: found.name
                });
            } catch(e) {}
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
            try {
                clickClass({
                    packageName: p.packageName,
                    className: found.name
                });
            } catch(e) {}
            listObjects(found._id);
            if (view == "show") openClass(found._id);
        }

        return Boolean(found);
    });

    return Boolean(match);
}


function getElements(root) {
    return Array.from(root.querySelectorAll('*')).flatMap(item => (item.shadowRoot ? [item, ...getElements(item.shadowRoot)] : [item]));
}

//TODO: avaliar se deve estar em outro arquivo
function clickClass(config) {
    let packageName = config.packageName;
    let className = config.className;
    
    let doc = window.parent ? window.parent.document : window.document;

    let elements = getElements(doc);

    let tree = elements.find(element => element.localName === "sy-tree" && element["s-hn"] === "SY-ONE-CLASS-LIST-TREE");

    let packageNode = Array.from(tree.childNodes).find(node => node.firstChild && node.firstChild.innerText === packageName);

    let classList = Array.from(packageNode.childNodes);

    let classNode = classList.find(node => node.localName === "sy-tree-node" && node.innerText === className);

    if(!classNode && packageNode) {
        packageNode.click();
        classList = Array.from(packageNode.childNodes);
        classNode = classList.find(node => node.innerText === className);
    }

    if (classNode) {
        classNode.click();
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

/**
 * Abre uma classe a partir do objeto atualmente ativo
 * Combina a obtenção do ID/classId com a abertura da classe
 */
function openClassFromActiveObject() {
    const objectInfo = getActiveObjectIds();
    
    if (!objectInfo.cid) {
        console.warn("Nenhuma classe ID encontrada para o objeto ativo");
        return;
    }
    
    openClass(objectInfo.cid);
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
    let objectInfo = getActiveObjectIds();

    Swal.fire({
        title: "ID copiado!",
        html: `<p><b>_id:</b> ${objectInfo.id}</p>` +
              `<p><b>_classId:</b> ${objectInfo.cid}</p>`,
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
    let doc = window.document;
    let elements = getElements(doc);
    let objectViews = elements.filter(element => element.localName === "sy-one-object-view" || element.localName === "sy-one-process-instance-view" || element.localName === "sy-one-user-task-view");
    
    let object = objectViews[objectViews.length - 1];

    if(!object)
        return {id: "", cid: ""}

    let id = object.getAttribute("object-id");
    let cid = object.getAttribute("class-id");

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

function changeDocumentTitle(name){
    document.title = name
}

function openChangeTabTitlePrompt(){
    Swal.fire({
        title: "Digite o novo nome para a sua tab",
        input: 'text',
        inputAttributes: {
            autocapitalize: 'off'
        },
        showCancelButton: false,
        confirmButtonText: "Alterar",
        confirmButtonColor: '#1C3C2E',
        showLoaderOnConfirm: true,
        preConfirm: (name) => {
            return name;
        },
        allowOutsideClick: () => !Swal.isLoading()
    })
    .then((name) => {
        const valueName = name.value

        if(!valueName)
            return;

            changeDocumentTitle(valueName)
    });
}

function cmdChangeTabTitle(){
    openChangeTabTitlePrompt()
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

