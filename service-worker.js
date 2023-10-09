chrome.commands.onCommand.addListener((command) => {
    sendCommand(command);
});

function sendCommand(command) {
    try {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, { action: command });
        });
    }
    catch(error) {}
}