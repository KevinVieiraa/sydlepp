//TODO: Comentar arquivo

//TODO: buscar as palavras reservadas e funções do js via função
const JS_KEYWORDS = [
    "boolean",
    "break",
    "case",
    "catch",
    "char",
    "class",
    "const",
    "continue",
    "default",
    "do",
    "double",	
    "else",	
    "eval",
    "false",
    "finally",	
    "float",	
    "for",	
    "function",
    "goto",	
    "if",
    "in",	
    "instanceof",	
    "int",
    "length",
    "let",
    "long",
    "null",
    "new",
    "return",
    "switch",
    "this",
    "throw",
    "true",
    "try",
    "typeof",
    "var",
    "void",
    "while"
]

let autocompleteBuffer = "";
let keepBufferUntilNextUpdate = false;

let currentSelectedSuggestion = 1;
let suggestions = 0;
let suggestionElementsCounter = 0;

function nextSuggestion() {
    updateSuggestion(1);
}

function previousSuggestion() {
    updateSuggestion(-1);
}

function firstSuggestion() {
    if(suggestions === 0)
        return;

    currentSelectedSuggestion = 1;
    let doc = window.parent ? window.parent.document : window.document;

    try{ 
        let iFrame = doc.querySelector('iframe[slotname=explorer_object_details]') || doc.querySelector('iframe[slotname=explorer_object_details]') || doc.querySelector('iframe[slotname=permalink-workspace-slot]');
        let suggestionButton = iFrame.contentDocument.getElementById("suggestion-" + currentSelectedSuggestion);
        
        suggestionButton.focus();
    }
    catch(error) {
        throw error;
    }
}

function updateSuggestion(value) {
    if(suggestions === 0)
        return;

    currentSelectedSuggestion += value;

    if(currentSelectedSuggestion > suggestions)
        currentSelectedSuggestion = 1;

    if(currentSelectedSuggestion < 1)
        currentSelectedSuggestion = suggestions;

    let doc = window.parent ? window.parent.document : window.document;

    try{ 
        let iFrame = doc.querySelector('iframe[slotname=explorer_object_details]') || doc.querySelector('iframe[slotname=explorer_object_details]') || doc.querySelector('iframe[slotname=permalink-workspace-slot]');
        let suggestionButton = iFrame.contentDocument.getElementById("suggestion-" + currentSelectedSuggestion);
        
        suggestionButton.focus();
    }
    catch(error) {
        throw error;
    }
}

function addTextOnEditor(text) {
    let doc = window.parent ? window.parent.document : window.document;
    try{ 
        let iFrame = doc.querySelector('iframe[slotname=explorer_object_details]') || doc.querySelector('iframe[slotname=explorer_object_details]') || doc.querySelector('iframe[slotname=permalink-workspace-slot]');

        let textarea = iFrame.contentDocument.querySelector('textarea[class=ace_text-input]');
        
        if(!textarea) return;

        let startPos = textarea.selectionStart;
        let endPos = textarea.selectionEnd;

        textarea.value = `${textarea.value.substring(0, startPos)}${text}${textarea.value.substring(endPos, textarea.value.length)}`;
        var event = new Event('input');
        textarea.dispatchEvent(event);
    }
    catch(error) {}
}

function updateAutoCompleteBuffer(value, clear, erase) {
    if(clear && !keepBufferUntilNextUpdate) 
        autocompleteBuffer = "";

    if(erase && !keepBufferUntilNextUpdate) 
        autocompleteBuffer = autocompleteBuffer.substring(0, autocompleteBuffer.length - 1);
    
    autocompleteBuffer += value;
    autocompleteBuffer = autocompleteBuffer.replace(/[,;.?]$/,'');
    
    keepBufferUntilNextUpdate = false;

    
    if(autocompleteBuffer.length)
    listAutocompleteSuggestions(autocompleteBuffer);

    let displayValue = !autocompleteBuffer || autocompleteBuffer.length === 0 || suggestions === 0 ? "none": "flex";

    updateAutoCompleteWindowPosition();
    setSuggestionWindowDisplay(displayValue);
}

function setSuggestionWindowDisplay(displayValue) {
    let doc = window.parent ? window.parent.document : window.document;
    try{ 
        let iFrame = doc.querySelector('iframe[slotname=explorer_object_details]') || doc.querySelector('iframe[slotname=explorer_object_details]') || doc.querySelector('iframe[slotname=permalink-workspace-slot]');
        let windowElement = iFrame.contentDocument.getElementById("editor-autocomplete-window");

        windowElement.style.display = displayValue;
    }
    catch(error) {

    }
}

function listAutocompleteSuggestions(currentText) {
    clearAutocompleteSuggestions();
    let suggestionsList = [];
    suggestions = 0;

    //Filtrar snippets
    let snippets = getSnippets();
    snippets = snippets.filter(snippet => snippet.shortcut.includes(currentText))                
    snippets.forEach(snippet => suggestionsList.push({"content": snippet.shortcut, "type": "snippet", "value": snippet.value}));

    //Filtrar palavras reservadas JS
    let keywords = JS_KEYWORDS.filter(keyword => keyword.includes(currentText) && keyword !==currentText)
    keywords.forEach(keyword => suggestionsList.push({"content": keyword, "type": "key", "value":keyword}));

    //TODO: sydle tree

    //identifiers
    let identifiers = getAllScriptIdentifiers();
    identifiers = identifiers.filter(identifier => identifier.includes(currentText) && identifier !== currentText)
    identifiers.forEach(identifier => suggestionsList.push({"content": identifier, "type": "id", "value":identifier}));


    let functionIdentifiers = getAllScriptFunctions();
    functionIdentifiers = functionIdentifiers.filter(identifier => identifier.includes(currentText))
    functionIdentifiers.forEach(identifier => suggestionsList.push({"content": identifier, "type": "{}", "value": identifier + "(params);"}));

    suggestionsList = suggestionsList.sort((s1, s2) => {
        let s1Starts = s1.content.toLowerCase().startsWith(currentText);
        let s2Starts = s2.content.toLowerCase().startsWith(currentText);
        if (s1Starts && s2Starts) return s1.content.localeCompare(s2.content);
        if (s1Starts && !s2Starts) return -1;
        if (!s1Starts && s2Starts) return 1;
        return s1.content.localeCompare(s2.content);
    });


    suggestionsList.forEach(suggestion => addAutocompleteSuggestion(suggestion.content, suggestion.type, suggestion.value));

    suggestions = suggestionsList.length;

    if(suggestions === 0)
        setSuggestionWindowDisplay("none");
    else
        setTimeout(() => firstSuggestion(), 80);
}

function getAllScriptIdentifiers() {
    let doc = window.parent ? window.parent.document : window.document;
    try{ 
        let iFrame = doc.querySelector('iframe[slotname=explorer_object_details]') || doc.querySelector('iframe[slotname=explorer_object_details]') || doc.querySelector('iframe[slotname=permalink-workspace-slot]');
        let identifiers = Array.from(iFrame.contentDocument.querySelectorAll('span[class=ace_identifier]'));

        identifiersText = identifiers.map(identifier => identifier.outerText);

        let uniqueIdentifiers = [];
        identifiersText.forEach(identifier => {
            if(uniqueIdentifiers.indexOf(identifier) < 0)
                uniqueIdentifiers.push(identifier);
        });

        return uniqueIdentifiers;
    }
    catch(error) {
    }
}

function getAllScriptFunctions() {
    let doc = window.parent ? window.parent.document : window.document;
    try{ 
        let iFrame = doc.querySelector('iframe[slotname=explorer_object_details]') || doc.querySelector('iframe[slotname=explorer_object_details]') || doc.querySelector('iframe[slotname=permalink-workspace-slot]');
        let identifiers = Array.from(iFrame.contentDocument.querySelectorAll("span[class='ace_entity ace_name ace_function']"));

        identifiersText = identifiers.map(identifier => identifier.outerText);
        
        let uniqueIdentifiers = [];
        identifiersText.forEach(identifier => {
            if(uniqueIdentifiers.indexOf(identifier) < 0)
                uniqueIdentifiers.push(identifier);
        });

        return uniqueIdentifiers;
    }
    catch(error) {
    }
}

function addAutocompleteSuggestion(contentText, typeText, valueText) {
    let doc = window.parent ? window.parent.document : window.document;

    try{ 
        let iFrame = doc.querySelector('iframe[slotname=explorer_object_details]') || doc.querySelector('iframe[slotname=explorer_object_details]') || doc.querySelector('iframe[slotname=permalink-workspace-slot]');
        let windowElement = iFrame.contentDocument.getElementById("editor-autocomplete-window");

        suggestionElementsCounter += 1;

        let suggestion = doc.createElement("button");
        suggestion.setAttribute("class", "autocomplete-suggestion");
        suggestion.setAttribute("id", "suggestion-" + suggestionElementsCounter);
        
        let content = doc.createElement("h1");
        let type = doc.createElement("h2");
        
        content.innerHTML = contentText;
        type.innerHTML = typeText;

        suggestion.appendChild(content);
        suggestion.appendChild(type);
        
        windowElement.appendChild(suggestion);
        
        suggestion.addEventListener("click", (event) => {
            deleteBufferOnEditor();
            addTextOnEditor(valueText);
            updateAutoCompleteBuffer("", true, false);
            focusTextArea();
        });

        suggestion.addEventListener("keydown", (event) => {
            if(!event.key)
                return;

            switch(event.key) {
                case "Enter":
                case "Tab":
                    event.target.click();
                    return;
                case "ArrowUp":
                    previousSuggestion();
                    event.preventDefault();
                    return;
                case "ArrowDown":
                    nextSuggestion();
                    event.preventDefault();
                    return;
                case "Backspace":
                    updateAutoCompleteBuffer("", false, true);
                    keepBufferUntilNextUpdate = true;
                    sendKeyToTextarea(8, 1);
                    focusTextArea();
                    event.preventDefault();
                    return;
                default:
                    event.preventDefault();
                    if(event.key.length === 1 && !event.metaKey && !event.altKey && !event.ctrlKey && !event.shiftKey) {
                        updateAutoCompleteBuffer(event.key, false, false);
                        keepBufferUntilNextUpdate = true;
                        addTextOnEditor(event.key);
                    }
                    focusTextArea();
                    return;
            }
        });
    }
    catch(error) {
        throw error;
    }
}

function deleteBufferOnEditor() {
    sendKeyToTextarea(8, autocompleteBuffer.length);
}

function sendKeyToTextarea(keycode, amount) {
    let doc = window.parent ? window.parent.document : window.document;
    try{ 
        let iFrame = doc.querySelector('iframe[slotname=explorer_object_details]') || doc.querySelector('iframe[slotname=explorer_object_details]') || doc.querySelector('iframe[slotname=permalink-workspace-slot]');

        for(let i = 1; i <= amount; i++) {
            let textarea = iFrame.contentDocument.querySelector('textarea[class=ace_text-input]');
            textarea.dispatchEvent(new KeyboardEvent('keydown', {'keyCode': keycode}));
            
            var event = new Event('input');
            textarea.dispatchEvent(event);
        }
    }
    catch(error) {
        throw error;
    }
}



function clearAutocompleteSuggestions() {
    let doc = window.parent ? window.parent.document : window.document;

    try{ 
        let iFrame = doc.querySelector('iframe[slotname=explorer_object_details]') || doc.querySelector('iframe[slotname=explorer_object_details]') || doc.querySelector('iframe[slotname=permalink-workspace-slot]');
        let windowElement = iFrame.contentDocument.getElementById("editor-autocomplete-window");
        
        var child = windowElement.lastElementChild;  
        while (child) { 
            windowElement.removeChild(child); 
            child = windowElement.lastElementChild; 
        } 

        suggestionElementsCounter = 0;
        currentSelectedSuggestion = 0;
    }
    catch(error) {
        throw error;
    }
}

function updateAutoCompleteWindowPosition() {
    let doc = window.parent ? window.parent.document : window.document;
    try{ 
        let iFrame = doc.querySelector('iframe[slotname=explorer_object_details]') || doc.querySelector('iframe[slotname=explorer_object_details]') || doc.querySelector('iframe[slotname=permalink-workspace-slot]');
        let cursor = iFrame.contentDocument.querySelector('div[class=ace_cursor]');

        let windowElement = iFrame.contentDocument.getElementById("editor-autocomplete-window");

        windowElement.style.left = (parseInt(cursor.style.left.replace("px", "")) + 65) + "px";
        windowElement.style.top = (parseInt(cursor.style.top.replace("px", "")) + 18) + "px";
    }
    catch(error) {
        throw error;
    }
}

function focusTextArea() {
    let doc = window.parent ? window.parent.document : window.document;
    try{ 
        let iFrame = doc.querySelector('iframe[slotname=explorer_object_details]') || doc.querySelector('iframe[slotname=explorer_object_details]') || doc.querySelector('iframe[slotname=permalink-workspace-slot]');
        let textarea = iFrame.contentDocument.querySelector('textarea[class=ace_text-input]');
        textarea.focus();
        setTimeout(() => {
            textarea.focus();
        }, 50);
    }
    catch(error) {
        throw error;
    }
}



function existsAutocompleteWindow() {
    let doc = window.parent ? window.parent.document : window.document;

    try{ 
        let iFrame = doc.querySelector('iframe[slotname=explorer_object_details]') || doc.querySelector('iframe[slotname=explorer_object_details]') || doc.querySelector('iframe[slotname=permalink-workspace-slot]');
        let windowElement = iFrame.contentDocument.getElementById("editor-autocomplete-window");
        
        return windowElement;
    }
    catch(error) {
        throw error;
    }
}

function getScriptBlockElement() {
    let doc = window.parent ? window.parent.document : window.document;
    try{ 
        let iFrame = doc.querySelector('iframe[slotname=explorer_object_details]') || doc.querySelector('iframe[slotname=explorer_object_details]') || doc.querySelector('iframe[slotname=permalink-workspace-slot]');

        let textarea = iFrame.contentDocument.querySelector('textarea[class=ace_text-input]');
        return textarea.parentNode.parentNode;
    }
    catch(error) {}
}

function initAutocompleteWindow () {
    let doc = window.parent ? window.parent.document : window.document;

    if(existsAutocompleteWindow()) {
        updateAutoCompleteWindowPosition();
        return;
    }

    try{ 
        let iFrame = doc.querySelector('iframe[slotname=explorer_object_details]') || doc.querySelector('iframe[slotname=explorer_object_details]') || doc.querySelector('iframe[slotname=permalink-workspace-slot]');
        let scriptBlock = iFrame.contentDocument.querySelector('div[class=script-block]');

        let autocompleteWindow = doc.createElement("div");
        autocompleteWindow.setAttribute("id", "editor-autocomplete-window");

        scriptBlock.appendChild(autocompleteWindow);
        updateAutoCompleteBuffer("", true, false);
        updateAutoCompleteWindowPosition();

        let textarea = iFrame.contentDocument.querySelector('textarea[class=ace_text-input]');
        textarea.addEventListener("input", (event) => {
            if(!event.data || event.data === " ") {
                updateAutoCompleteBuffer("", true, false);
                return;
            }

            updateAutoCompleteBuffer(event.data, false, false);
        });

        textarea.addEventListener("keydown", (event) => {
            if(!event.key)
                return;

            if (event.ctrlKey && (event.key === 'z' || event.key === 'y')) {
                updateAutoCompleteBuffer("", true, false);
            }

            switch(event.key) {
                case ",":
                case ".":
                case ";":
                case ":":
                case "ArrowLeft":
                case "ArrowRight":
                case "ArrowUp":
                case "ArrowDown":
                case "Tab":
                case "Enter":
                    updateAutoCompleteBuffer("", true, false);
                    return;
                case "Backspace":
                    updateAutoCompleteBuffer("", false, true);
                    return;
                default: 
                    updateAutoCompleteWindowPosition();
                    return;
            }
        });

        textarea.addEventListener("select", (event) => {
            updateAutoCompleteWindowPosition();
        });

        let editorElement = scriptBlock.firstChild;

        editorElement.addEventListener("mousewheel", (event) => {
            updateAutoCompleteWindowPosition();
        });

        editorElement.addEventListener("click", (event) => {
            updateAutoCompleteBuffer("", true, false);
        })
    }
    catch(error) {

    }
}