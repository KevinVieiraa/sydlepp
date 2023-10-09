//TODO: Comentar arquivo

//TODO: ver erro ao iniciar em algumas telas
function loadClassTree() {
    let tokenStorage = JSON.parse(localStorage.getItem('explorer_user_map'));

    if(!tokenStorage || !tokenStorage.main) return;
    
    let token = tokenStorage.main.users[0].accessToken.token;
    try {
        $.ajax(`/api/1/main/_system/_workspace/getClassList?accessToken=${token}`)
        .done(function (response) {
            let classTree = response.result;
            localStorage.setItem('classTree', JSON.stringify(classTree));
        });
    }
    catch(error) {}
}

function getSnippets() {
    let snippets = JSON.parse(localStorage.getItem('snippets'));
    return snippets.snippets;
}

function setSnippets(snippets) {
    chrome.storage.local.set({
        snippets
    })
    .then(() => {
        localStorage.setItem('snippets', JSON.stringify(snippets));
    });
}

function loadDefaultUserSnippets() {
    let snippets = CONFIG.default_snippets;
    
    setSnippets(snippets);
}

function loadUserSnippets() {
    chrome.storage.local.get(["snippets"])
    .then(result => {
        if(!result.snippets)
            loadDefaultUserSnippets();

        localStorage.setItem('snippets', JSON.stringify(result.snippets));
    });
}