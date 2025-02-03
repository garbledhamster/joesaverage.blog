// commands.js

commandInput.addEventListener("input", handleCommandInputInput);
commandInput.addEventListener("keydown", handleCommandInput);

let justAcceptedSuggestion = false;
let currentSuggestionMode = null;

function handleCommandInputInput(event) {
  if (justAcceptedSuggestion) {
    justAcceptedSuggestion = false;
    return;
  }
  const text = commandInput.value;
  if (text.startsWith("/")) {
    const commandText = text.substring(1).split(" ")[0].trim().toLowerCase();
    const exactMatch = availableCommands.some(
      (cmd) => cmd.name.toLowerCase() === commandText
    );
    if (exactMatch) {
      hideSuggestionBox();
      currentSuggestionMode = null;
    } else {
      showCommandSuggestions(commandText);
      currentSuggestionMode = "command";
    }
  } else {
    if (currentSuggestionMode === "command") {
      hideSuggestionBox();
      currentSuggestionMode = null;
    }
    searchQuery = text.toLowerCase();
    currentPage = 1;
    displayPages();
    setupPagination();
  }
}

function handleCommandInput(event) {
  if (
    currentSuggestionMode === "command" &&
    suggestionBox.style.display === "block"
  ) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      moveSelection(1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      moveSelection(-1);
    } else if (
      event.key === "Enter" ||
      event.key === "Tab" ||
      event.key === " "
    ) {
      event.preventDefault();
      const selected = suggestionBox.querySelector(".suggestion-item.selected");
      if (selected) {
        acceptCommandSuggestion(selected.dataset.command, event.shiftKey);
      } else {
        hideSuggestionBox();
        currentSuggestionMode = null;
      }
    }
  } else if (event.key === "Enter") {
    event.preventDefault();
    executeCommandFromInput();
  }
}

function acceptCommandSuggestion(commandName, isShiftKey) {
  const cmd = availableCommands.find((c) => c.name === commandName);
  if (!cmd) return;
  commandInput.value = cmd.example;
  const startHighlight = cmd.example.indexOf("[");
  const endHighlight = cmd.example.indexOf("]") + 1;
  commandInput.focus();
  commandInput.setSelectionRange(startHighlight, endHighlight);
  hideSuggestionBox();
  currentSuggestionMode = null;
  justAcceptedSuggestion = true;
}

function executeCommandFromInput() {
  const inputValue = commandInput.value.trim();
  if (inputValue.startsWith("/")) {
    const commandParts = inputValue.substring(1).split(" ");
    const commandName = commandParts[0].toLowerCase();
    const argsString = commandParts.slice(1).join(" ");
    const parsedArgs = parseCommandArguments(argsString);
    switch (commandName) {
      case "createpost":
        handleCreatePostCommand(parsedArgs);
        break;
      case "saveapikey":
        handleSaveApiKeyCommand(parsedArgs);
        break;
      case "clearapikey":
        handleClearApiKeyCommand();
        break;
      case "generatepost":
        handlegeneratepostCommand(parsedArgs);
        break;
      default:
        showStatusMessage("Unknown command.");
        break;
    }
  }
}

function parseCommandArguments(argsString) {
  const args = {};
  const regex = /'([^']*)'/g;
  let match;
  while ((match = regex.exec(argsString)) !== null) {
    args.value = match[1] || "";
  }
  return args;
}

function handleCreatePostCommand(args) {
  if (args.value) {
    showForm();
    document.getElementById("title").value = args.value;
    commandInput.value = "";
  } else {
    showStatusMessage(
      "Please provide the title using '/createpost 'Your title here''"
    );
  }
}

function handleSaveApiKeyCommand(args) {
  if (args.value) {
    const apiKey = args.value;
    localStorage.setItem("openai_api_key", apiKey);
    showStatusMessage("API key registered successfully.");
    commandInput.value = "";
  } else {
    showStatusMessage(
      "Please provide the API key using '/saveapikey 'your_api_key''"
    );
  }
}

function handleClearApiKeyCommand() {
  const apiKey = localStorage.getItem("openai_api_key");
  if (apiKey) {
    localStorage.removeItem("openai_api_key");
    showStatusMessage("API key removed successfully.");
  } else {
    showStatusMessage("No API key is currently registered.");
  }
  commandInput.value = "";
}

function handlegeneratepostCommand(args) {
  if (args.value) {
    const prompt = args.value;
    const apiKey = localStorage.getItem("openai_api_key");
    if (!apiKey) {
      commandInput.value = "/saveapikey '[REPLACE ME WITH YOUR API KEY]'";
      commandInput.focus();
      commandInput.setSelectionRange(11, 11);
      showStatusMessage(
        "API key not configured. Please register your API key."
      );
    } else {
      generatepost(prompt, apiKey);
    }
  } else {
    showStatusMessage(
      "Please provide a prompt using '/generatepost 'Your prompt here''"
    );
  }
}
