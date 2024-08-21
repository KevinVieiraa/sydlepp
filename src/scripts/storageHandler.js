//TODO: Comentar arquivo

//TODO: ver erro ao iniciar em algumas telas
function loadClassTree() {
    let tokenStorage = JSON.parse(localStorage.getItem('explorer_user_map'));

    if(!tokenStorage || !tokenStorage.main) return;
    
    let token = tokenStorage.main.users[0].accessToken.token;
    try {
        $.ajax(`/api/1/main/_system/_workspace/getClassList?accessToken=${token}&_body=%7B%22_id%22%3A%22000000000000000000000053%22%2C%22viewId%22%3A%22000000000000000000000049%22%7D`)
        .done(function (response) {
            let classTree = response.result;
            localStorage.setItem('classTree', JSON.stringify(classTree));
        });
    }
    catch(error) {}
}
