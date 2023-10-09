//TODO: Comentar arquivo

function removeSpecials(str) {
    var lower = str.toLowerCase();
    var upper = str.toUpperCase();

    var res = "";
    for (var i = 0; i < lower.length; ++i) {
        if (lower[i] != upper[i] || lower[i].trim() === '' || lower[i] == '_')
            res += str[i];
    }
    return removePunctuation(res).toLowerCase();
}

function removePunctuation(str) {
    let com_acento = "ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝŔÞßàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿŕ";
    let sem_acento = "AAAAAAACEEEEIIIIDNOOOOOOUUUUYRsBaaaaaaaceeeeiiiionoooooouuuuybyr";
    let novastr = "";
    for (let i = 0; i < str.length; i++) {
        let troca = false;
        for (let a = 0; a < com_acento.length; a++) {
            if (str.substr(i, 1) == com_acento.substr(a, 1)) {
                novastr += sem_acento.substr(a, 1);
                troca = true;
                break;
            }
        }
        if (troca == false) {
            novastr += str.substr(i, 1);
        }
    }
    return novastr;
}