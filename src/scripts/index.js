injectStylesheet("lib/jquery-ui.min.css", document.getElementsByTagName("head")[0]);
injectStylesheet("src/styles/styles.css", document.getElementsByTagName("head")[0]);

initializeIFrameObservers(["src/styles/styles.css"]);

injectScript('lib/sweetalert2.all.min.js');

initializeCommands();

loadUserSnippets();

loadClassTree();