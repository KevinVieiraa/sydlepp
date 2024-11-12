//TODO: Comentar arquivo

function injectStylesheet (filename, parent) {
    var link = document.createElement("link");
    link.href = chrome.runtime.getURL(filename);
    console.log(link.href);
    link.type = "text/css";
    link.rel = "stylesheet";
    link.id = "elosydle";
    
    parent.appendChild(link);
}

function injectScript (filename, callback) {
    url = chrome.runtime.getURL(filename);
    var script = document.createElement("script")
    script.type = "text/javascript";
    script.src = url;
    document.getElementsByTagName("head")[0].appendChild(script);
}

function onLoadIFrame(iFrame, stylesPaths) {
    // iFrame.addEventListener('load', () => {
    //     stylesPaths.forEach(path => injectStylesheet(path, iFrame.contentDocument.head))
    // });
}

let alreadyUpdatedIFrames = [];

function initializeIFrameObservers(stylesPaths) {
    const observer = new MutationObserver(() => {
        let foundIFrames = Array.from(document.getElementsByTagName("iframe"));
        let newIFrames = foundIFrames.filter(iFrame => !alreadyUpdatedIFrames.find(foundiFrame => foundiFrame.src === iFrame.src));
    
        newIFrames.forEach(iFrame => onLoadIFrame(iFrame, stylesPaths));
    
        alreadyUpdatedIFrames = foundIFrames;
    });
    
    observer.observe(document, { childList: true, subtree: true });
}