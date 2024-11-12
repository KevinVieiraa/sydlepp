function sendCommand(command, parameters) {
    try {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, { action: command, parameters: parameters });
        });
    }
    catch(error) {}
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

function init() {
    Array.from(document.getElementsByClassName("tab")).forEach(element => element.addEventListener("click", openSection));
    document.getElementById("shortcuts-button").addEventListener("click", openShortcuts);
    
    document.getElementById("default-tab").click();
}

init();