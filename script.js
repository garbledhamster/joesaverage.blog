const openFormButton = document.getElementById("open-form-button");
const closeFormButton = document.getElementById("close-form-button");
const addPageForm = document.getElementById("add-page-form");
const pageForm = document.getElementById("page-form");
const latestGrid = document.getElementById("latest-grid");
const loadJsonButton = document.getElementById("load-json-button");
const exportJsonButton = document.getElementById("export-json-button");
const clearButton = document.getElementById("clear-button");
const jsonFileInput = document.getElementById("json-file-input");
const formTitle = document.getElementById("form-title");
const paginationContainer = document.getElementById("pagination");
const zoomButton = document.getElementById("zoom-button");
const sortButton = document.getElementById("sort-button");
const saveButton = document.getElementById("save-button");
const overlay = document.getElementById("expanded-overlay");
const commandInput = document.getElementById("command-input");
const bodyTextarea = document.getElementById("body");
let mainTitle = document.getElementById("main-title");
let titleSaved = false;
const GITHUB_JSON_URL =
  "#https://raw.githubusercontent.com/garbledhamster/MiniBlogAdmin/refs/heads/main/posts.json";
let pages = [];
let currentEditIndex = null;
let expandedPageId = null;
let expandedScrollPosition = 0;
const imageCache = new Map();
const itemsPerPage = 10;
let currentPage = 1;
let totalPages = 10;
const zoomLevels = [75, 100, 125, 150];
let currentZoomLevelIndex = 1;
const sortOrder = ["date", "name", "color", "🚫"];
let currentSortIndex = 0;
let currentSort = sortOrder[currentSortIndex];
let nextPageId = 1;
let searchQuery = "";
let blogTitle = "Make a Blog";
const suggestionBox = document.createElement("div");
suggestionBox.className = "suggestion-box";
document.body.appendChild(suggestionBox);
suggestionBox.style.display = "none";
let currentSuggestionMode = null;
let justAcceptedSuggestion = false;
const availableCommands = [
  {
    name: "generatepost",
    description: "Generates blog content based on a provided prompt.",
    example: "/generatepost '[REPLACE ME WITH YOUR PROMPT]'"
  },
  {
    name: "createpost",
    description: "Creates a new blog post with the provided title.",
    example: "/createpost '[REPLACE ME WITH YOUR POSTS TITLE]'"
  },
  {
    name: "saveapikey",
    description: "Registers your OpenAI API key for content generation.",
    example: "/saveapikey '[REPLACE ME WITH YOUR OPENAI KEY]'"
  },
  {
    name: "clearapikey",
    description: "Removes the currently registered OpenAI API key.",
    example: "/clearapikey"
  }
];
function loadFromLocalStorage() {
  const storedPages = localStorage.getItem("pages");
  if (storedPages) {
    try {
      pages = JSON.parse(storedPages);
      pages.forEach((page) => {
        if (!page.id) {
          page.id = nextPageId++;
        } else {
          nextPageId = Math.max(nextPageId, page.id + 1);
        }
        if (page.Picture) {
          preloadImage(page.Picture);
        }
      });
      totalPages = Math.ceil(pages.length / itemsPerPage);
      displayPages();
      setupPagination();
      showStatusMessage("Data loaded successfully from local storage.");
    } catch (error) {
      console.error("Error parsing pages from localStorage:", error);
      pages = [];
      displayPages();
    }
  } else {
    displayPages();
  }
}
document.addEventListener("DOMContentLoaded", () => {
  fetchGitHubJson()
    .then((fetched) => {
      if (fetched) {
        displayPages();
        setupPagination();
        showStatusMessage("Data loaded successfully from GitHub.");
      } else {
        loadFromLocalStorage();
        showStatusMessage("Data loaded from local storage.");
      }
    })
    .catch((error) => {
      console.error("Initialization Error:", error);
      loadFromLocalStorage();
      showStatusMessage("Data loaded from local storage.");
    });
  const storedTitle = localStorage.getItem("blogTitle");
  if (storedTitle) {
    blogTitle = storedTitle;
    mainTitle.textContent = blogTitle;
  }
  updateExportButtonTitle();
});
function updateExportButtonTitle() {
  exportJsonButton.title = `Export JSON 📥 (${blogTitle})`;
}
mainTitle.addEventListener("dblclick", () => {
  editMainTitle();
});
function editMainTitle() {
  const input = document.createElement("input");
  input.type = "text";
  input.value = mainTitle.textContent;
  input.id = "main-title-input";
  input.style.fontFamily = "'Space Mono', monospace";
  input.style.fontSize = "2rem";
  input.style.textAlign = "center";
  input.style.border = "none";
  input.style.outline = "none";
  input.style.width = "100%";
  input.style.background = "transparent";
  input.style.margin = "1rem 0";
  input.style.padding = "0";
  input.style.cursor = "default";
  mainTitle.replaceWith(input);
  input.focus();
  let titleSavedFlag = false;
  const saveTitle = () => {
    if (titleSavedFlag) return;
    titleSavedFlag = true;
    blogTitle = input.value.trim() || "Untitled Blog";
    localStorage.setItem("blogTitle", blogTitle);
    const newTitle = document.createElement("h1");
    newTitle.className = "latest";
    newTitle.id = "main-title";
    newTitle.textContent = blogTitle;
    newTitle.addEventListener("dblclick", editMainTitle);
    input.replaceWith(newTitle);
    mainTitle = newTitle;
    updateExportButtonTitle();
  };
  input.addEventListener("blur", saveTitle);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      saveTitle();
    }
  });
}
function preloadImage(url) {
  if (!imageCache.has(url)) {
    const img = new Image();
    img.src = url;
    imageCache.set(url, true);
  }
}
if (openFormButton) {
  openFormButton.addEventListener("click", () => {
    showForm();
  });
}
function showForm() {
  addPageForm.style.display = "block";
  formTitle.textContent = "Add New Page";
  pageForm.reset();
  currentEditIndex = null;
  addOverlay();
  addPageForm.scrollIntoView({ behavior: "smooth" });
}
if (closeFormButton) {
  closeFormButton.addEventListener("click", () => {
    hideForm();
  });
}
function hideForm() {
  addPageForm.style.display = "none";
  pageForm.reset();
  currentEditIndex = null;
  if (expandedPageId === null) {
    removeOverlay();
  }
}
overlay.addEventListener("click", (e) => {
  if (e.target === overlay) {
    closeAllModals();
  }
});
function closeAllModals() {
  if (addPageForm.style.display === "block") {
    hideForm();
  }
  if (expandedPageId !== null) {
    expandedPageId = null;
    displayPages();
    setupPagination();
    window.scrollTo({ top: expandedScrollPosition, behavior: "smooth" });
  }
  removeOverlay();
}
if (clearButton) {
  clearButton.addEventListener("click", () => {
    if (confirm("Are you sure you want to clear all configurations?")) {
      localStorage.removeItem("pages");
      localStorage.removeItem("blogTitle");
      localStorage.removeItem("openai_api_key");
      pages = [];
      blogTitle = "Make a Blog";
      mainTitle.textContent = blogTitle;
      imageCache.clear();
      expandedPageId = null;
      currentPage = 1;
      totalPages = 1;
      searchQuery = "";
      commandInput.value = "";
      bodyTextarea.value = "";
      displayPages();
      setupPagination();
      updateExportButtonTitle();
    }
  });
}
pageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  let picture = document.getElementById("picture").value.trim();
  if (!picture) {
    picture = `https://picsum.photos/300/200?random=${
      Math.floor(Math.random() * 99999) + 1
    }`;
  }
  const bgColor = document.getElementById("bg-color").value;
  const title = document.getElementById("title").value.trim();
  const description = document.getElementById("description").value.trim();
  const date = document.getElementById("date").value.trim();
  const body = document.getElementById("body").value.trim();
  if (!title || !description || !body) {
    showStatusMessage("Please fill in all required fields.");
    return;
  }
  preloadImage(picture);
  const processedMarkdown = processMarkdown(body);
  const pageData = {
    id: currentEditIndex !== null ? pages[currentEditIndex].id : nextPageId++,
    Picture: picture,
    BgColor: bgColor,
    Title: title,
    Description: description,
    Date: date || new Date().toISOString().split("T")[0],
    Body: processedMarkdown
  };
  if (currentEditIndex === null) {
    pages.push(pageData);
  } else {
    pages[currentEditIndex] = pageData;
  }
  const linkedTitles = extractLinks(processedMarkdown);
  const currentPageTitle = title;
  linkedTitles.forEach((linkedTitle) => {
    const linkedPageIndex = pages.findIndex(
      (page) => page.Title === linkedTitle
    );
    if (linkedPageIndex !== -1) {
      const linkedPage = pages[linkedPageIndex];
      addBacklink(linkedPage, currentPageTitle);
      pages[linkedPageIndex] = linkedPage;
    } else {
      console.warn(`Linked page with title "${linkedTitle}" not found.`);
    }
  });
  localStorage.setItem("pages", JSON.stringify(pages));
  totalPages = Math.ceil(pages.length / itemsPerPage);
  if (currentPage > totalPages) currentPage = totalPages;
  searchQuery = "";
  commandInput.value = "";
  bodyTextarea.value = "";
  displayPages();
  setupPagination();
  saveButton.textContent = "✅";
  saveButton.disabled = true;
  setTimeout(() => {
    saveButton.textContent = "💾";
    saveButton.disabled = false;
  }, 2000);
  hideForm();
});
commandInput.addEventListener("input", handleCommandInputInput);
commandInput.addEventListener("keydown", handleCommandInput);
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
  const regex = /'([^']*)'/g; // Match content within single quotes
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
function generatepost(prompt, apiKey) {
  showStatusMessage("Generating content...");
  const url = "https://api.openai.com/v1/chat/completions";
  const headers = {
    "Content-Type": "application/json",
    Authorization: "Bearer " + apiKey
  };
  const body = {
    model: "gpt-4o-mini",
    messages: [
      {
        role: "user",
        content: prompt
      },
      {
        role: "system",
        content: "You are a helpful ai assistant."
      }
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "formatted_response",
        strict: true,
        schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            description: { type: "string" },
            body: { type: "string" }
          },
          required: ["title", "description", "body"],
          additionalProperties: false
        }
      }
    }
  };
  fetch(url, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(body)
  })
    .then((response) => {
      return response.text().then((text) => {
        try {
          const data = JSON.parse(text);
          if (!response.ok) {
            console.error("API Error:", data);
            throw new Error(data.error.message || "API request failed");
          }
          return data;
        } catch (err) {
          console.error("Non-JSON response received:", text);
          throw new Error("Received invalid JSON response from the server.");
        }
      });
    })
    .then((data) => {
      console.log("Data received:", data);
      const assistantResponse = data.choices[0].message.content;
      const responseObj = JSON.parse(assistantResponse);
      showForm();
      document.getElementById("title").value = responseObj.title;
      document.getElementById("description").value = responseObj.description;
      document.getElementById("body").value = responseObj.body;
      commandInput.value = "";
      hideStatusMessage();
      document.getElementById("date").value = new Date()
        .toISOString()
        .split("T")[0];
    })
    .catch((error) => {
      console.error("Fetch Error:", error.message);
      hideStatusMessage();
      showStatusMessage(`An error occurred: ${error.message}`);
    });
}
function showStatusMessage(message) {
  let statusMessage = document.getElementById("status-message");
  if (!statusMessage) {
    statusMessage = document.createElement("div");
    statusMessage.id = "status-message";
    document.body.appendChild(statusMessage);
  }
  statusMessage.className = "";
  const lowerCaseMessage = message.toLowerCase();
  if (
    lowerCaseMessage.includes("error") ||
    lowerCaseMessage.includes("issue") ||
    lowerCaseMessage.includes("failed")
  ) {
    statusMessage.classList.add("error");
  } else if (
    lowerCaseMessage.includes("success") ||
    lowerCaseMessage.includes("worked") ||
    lowerCaseMessage.includes("completed")
  ) {
    statusMessage.classList.add("success");
  } else {
    statusMessage.classList.add("neutral");
  }
  statusMessage.textContent = message;
  statusMessage.style.display = "block";
  setTimeout(() => {
    statusMessage.style.display = "none";
  }, 5000);
}
function hideStatusMessage() {
  const statusMessage = document.getElementById("status-message");
  if (statusMessage) {
    statusMessage.style.display = "none";
  }
}
function showCommandSuggestions(commandText) {
  if (!suggestionBox) return;
  suggestionBox.innerHTML = "";
  const filteredCommands = availableCommands.filter((cmd) =>
    cmd.name.toLowerCase().startsWith(commandText.toLowerCase())
  );
  filteredCommands.forEach((cmd) => {
    const item = document.createElement("div");
    item.className = "suggestion-item";
    item.dataset.command = cmd.name;
    item.title = `${cmd.description}\nExample: ${cmd.example}`;
    const commandName = document.createElement("span");
    commandName.className = "command-name";
    commandName.textContent = `/${cmd.name}`;
    const commandDesc = document.createElement("span");
    commandDesc.className = "command-description";
    commandDesc.textContent = ` - ${cmd.description}`;
    item.appendChild(commandName);
    item.appendChild(commandDesc);
    item.addEventListener("mouseover", () => {
      clearSelection();
      item.classList.add("selected");
    });
    item.addEventListener("mousedown", (e) => {
      e.preventDefault();
      acceptCommandSuggestion(cmd.name, e.shiftKey);
    });
    suggestionBox.appendChild(item);
  });
  if (filteredCommands.length > 0) {
    const firstItem = suggestionBox.querySelector(".suggestion-item");
    if (firstItem) {
      firstItem.classList.add("selected");
    }
    positionSuggestionBox(commandInput);
    suggestionBox.style.display = "block";
  } else {
    hideSuggestionBox();
    currentSuggestionMode = null;
  }
}
bodyTextarea.addEventListener("input", handleBodyAutocomplete);
bodyTextarea.addEventListener("keydown", handleBodyKeyDown);
function handleBodyAutocomplete(e) {
  const cursorPos = bodyTextarea.selectionStart;
  const text = bodyTextarea.value;
  const textUpToCursor = text.substring(0, cursorPos);
  const lastTwoChars = textUpToCursor.slice(-2);
  if (lastTwoChars === "[[") {
    currentSuggestionMode = "page";
    showPageSuggestions("");
  } else if (currentSuggestionMode === "page") {
    const afterStart = text.substring(
      textUpToCursor.lastIndexOf("[[") + 2,
      cursorPos
    );
    if (afterStart.includes("]]") || afterStart.includes("\n")) {
      hideSuggestionBox();
      currentSuggestionMode = null;
      return;
    }
    showPageSuggestions(afterStart);
  }
}
function handleBodyKeyDown(event) {
  if (
    currentSuggestionMode === "page" &&
    suggestionBox.style.display === "block"
  ) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      moveSelection(1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      moveSelection(-1);
    } else if (event.key === "Enter") {
      event.preventDefault();
      const selected = suggestionBox.querySelector(".suggestion-item.selected");
      console.log("Shift key pressed:", event.shiftKey);
      if (selected) {
        insertPageLink(selected.dataset.title, event.shiftKey);
      }
    }
  }
}
function insertPageLink(title, isShiftKey) {
  const cursorPos = bodyTextarea.selectionStart;
  const text = bodyTextarea.value;
  if (!isShiftKey) {
    const startPos = text.lastIndexOf("[[");
    const before = text.substring(0, startPos + 2);
    const after = text.substring(cursorPos);
    bodyTextarea.value = before + title + "]]" + after;
    bodyTextarea.selectionStart = startPos + 2 + title.length + 2;
    bodyTextarea.selectionEnd = startPos + 2 + title.length + 2;
  } else {
    const currentPage = pages[currentEditIndex];
    const selectedPage = pages.find((page) => page.Title === title.trim());
    if (selectedPage && currentPage) {
      const backlink = `[[${currentPage.Title}]]`;
      const backlinksSection = /backlinks:\s*([\s\S]*)/i;
      const backlinksMatch = selectedPage.Body.match(backlinksSection);
      if (backlinksMatch) {
        if (!backlinksMatch[1].includes(backlink)) {
          selectedPage.Body = selectedPage.Body.replace(
            backlinksSection,
            `backlinks: ${backlinksMatch[1].trim()} ${backlink}`
          );
        }
      } else {
        selectedPage.Body += `\n\nbacklinks: ${backlink}`;
      }
      const backlinkToCurrent = `[[${title}]]`;
      const backlinksMatchCurrent = currentPage.Body.match(
        /backlinks:\s*([\s\S]*)/i
      );
      if (backlinksMatchCurrent) {
        if (!backlinksMatchCurrent[1].includes(backlinkToCurrent)) {
          currentPage.Body = currentPage.Body.replace(
            /backlinks:\s*([\s\S]*)/i,
            `backlinks: ${backlinksMatchCurrent[1].trim()} ${backlinkToCurrent}`
          );
        }
      } else {
        currentPage.Body += `\n\nbacklinks: ${backlinkToCurrent}`;
      }
      localStorage.setItem("pages", JSON.stringify(pages));
    }
  }
  bodyTextarea.focus();
  currentSuggestionMode = null;
  hideSuggestionBox();
}
function showPageSuggestions(query) {
  if (!suggestionBox) return;
  suggestionBox.innerHTML = "";
  let suggestions = pages.map((page) => page.Title);
  if (query) {
    const lowerQuery = query.toLowerCase();
    suggestions = suggestions.filter((title) =>
      title.toLowerCase().includes(lowerQuery)
    );
  }
  if (suggestions.length === 0) {
    hideSuggestionBox();
    return;
  }
  suggestions.sort((a, b) => a.localeCompare(b));
  suggestions.forEach((suggestion) => {
    const item = document.createElement("div");
    item.className = "suggestion-item";
    item.dataset.title = suggestion;
    item.title = `Insert link to "${suggestion}"`;
    const titleSpan = document.createElement("span");
    titleSpan.textContent = suggestion;
    item.appendChild(titleSpan);
    item.addEventListener("mouseover", () => {
      clearSelection();
      item.classList.add("selected");
    });
    item.addEventListener("mousedown", (e) => {
      e.preventDefault();
      insertPageLink(suggestion, e.shiftKey);
    });
    suggestionBox.appendChild(item);
  });
  const firstItem = suggestionBox.querySelector(".suggestion-item");
  if (firstItem) {
    firstItem.classList.add("selected");
  }
  positionSuggestionBox(bodyTextarea);
  suggestionBox.style.display = "block";
}
function displayPages() {
  latestGrid.innerHTML = "";
  if (pages.length === 0) {
    const noPagesMessage = document.createElement("p");
    noPagesMessage.textContent = "No pages available. Please add a new page.";
    latestGrid.appendChild(noPagesMessage);
    paginationContainer.innerHTML = "";
    return;
  }
  let filteredPages = pages;
  if (searchQuery !== "") {
    const isExactMatch =
      searchQuery.startsWith('"') && searchQuery.endsWith('"');
    const query = isExactMatch
      ? searchQuery.slice(1, -1).toLowerCase()
      : searchQuery.toLowerCase();
    filteredPages = pages.filter((page) => {
      const titleMatch = page.Title.toLowerCase().includes(query);
      const bodyMatch = page.Body.toLowerCase().includes(query);
      if (isExactMatch) {
        return (
          page.Title.toLowerCase().includes(query) ||
          page.Body.toLowerCase().includes(query)
        );
      } else {
        return titleMatch || bodyMatch;
      }
    });
  }
  if (filteredPages.length === 0) {
    const noResultsMessage = document.createElement("p");
    noResultsMessage.textContent = "No pages found matching your search.";
    latestGrid.appendChild(noResultsMessage);
    paginationContainer.innerHTML = "";
    return;
  }
  const sortedPages = [...filteredPages].sort((a, b) => {
    if (currentSort === "date") {
      const dateA = new Date(a.Date);
      const dateB = new Date(b.Date);
      return dateB - dateA;
    } else if (currentSort === "name") {
      return a.Title.localeCompare(b.Title);
    } else if (currentSort === "color") {
      return a.BgColor.localeCompare(b.BgColor);
    }
    return 0;
  });
  if (expandedPageId !== null) {
    const expandedPageIndex = sortedPages.findIndex(
      (page) => page.id === expandedPageId
    );
    if (expandedPageIndex > -1) {
      const pageOfExpandedPage =
        Math.floor(expandedPageIndex / itemsPerPage) + 1;
      currentPage = pageOfExpandedPage;
    }
  }
  totalPages = Math.ceil(sortedPages.length / itemsPerPage);
  if (currentPage > totalPages) currentPage = totalPages;
  if (currentPage < 1) currentPage = 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, sortedPages.length);
  const currentPages = sortedPages.slice(startIndex, endIndex);
  currentPages.forEach((page) => {
    const item = document.createElement("div");
    item.className = "latest-grid-item";
    item.id = `page-${page.id}`;
    if (expandedPageId === page.id) {
      item.classList.add("expanded");
      item.addEventListener("scroll", () => handleCardScroll(item));
    }
    const imgContainer = document.createElement("div");
    imgContainer.className = "image-container";
    imgContainer.style.backgroundColor = page.BgColor || "#FFFF00";
    if (page.Picture) {
      const img = document.createElement("img");
      img.src = page.Picture;
      img.alt = page.Title;
      img.onerror = function () {
        this.style.display = "none";
      };
      imgContainer.appendChild(img);
    }
    item.appendChild(imgContainer);
    const cardHeader = document.createElement("div");
    cardHeader.className = "card-header";
    const title = document.createElement("h2");
    title.textContent = page.Title;
    title.setAttribute("title", page.Title);
    cardHeader.appendChild(title);
    item.appendChild(cardHeader);
    const desc = document.createElement("h4");
    desc.className = "description";
    desc.textContent = page.Description;
    item.appendChild(desc);
    const date = document.createElement("h5");
    date.className = "date";
    date.textContent = page.Date || "No Date Provided";
    item.appendChild(date);
    const body = document.createElement("div");
    body.className = "body-content";
    const rawHTML = marked.parse(page.Body);
    const processedHTML = processLinks(rawHTML);
    body.innerHTML = DOMPurify.sanitize(processedHTML);
    item.appendChild(body);
    const cardActions = document.createElement("div");
    cardActions.className = "card-actions";
    const actualIndex = pages.findIndex((p) => p.id === page.id);
    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-button";
    deleteButton.innerHTML = "🗑️";
    deleteButton.title = "Delete Page 🗑️";
    deleteButton.addEventListener("click", (e) => {
      e.stopPropagation();
      deletePage(actualIndex);
    });
    cardActions.appendChild(deleteButton);
    const editButton = document.createElement("button");
    editButton.className = "edit-button";
    editButton.innerHTML = "✏️";
    editButton.title = "Edit Page ✏️";
    editButton.addEventListener("click", (e) => {
      e.stopPropagation();
      editPage(actualIndex);
    });
    cardActions.appendChild(editButton);
    const processMarkdownButton = document.createElement("button");
    processMarkdownButton.className = "process-markdown-button";
    processMarkdownButton.innerHTML = "🧼";
    processMarkdownButton.title = "Clean Markdown 🧼";
    processMarkdownButton.addEventListener("click", (e) => {
      e.stopPropagation();
      const page = pages[actualIndex];
      if (!page) return;
      const cleanedMarkdown = processMarkdown(page.Body);
      page.Body = cleanedMarkdown;
      localStorage.setItem("pages", JSON.stringify(pages));
      const bodyElement = item.querySelector(".body-content");
      const rawHTML = marked.parse(page.Body);
      const processedHTML = processLinks(rawHTML);
      bodyElement.innerHTML = DOMPurify.sanitize(processedHTML);
      showStatusMessage("Markdown processed and updated successfully.");
    });
    item.appendChild(cardActions);
    cardHeader.addEventListener("click", () => {
      if (expandedPageId === page.id) {
        expandedPageId = null;
        removeOverlay();
        displayPages();
        setupPagination();
        window.scrollTo({ top: expandedScrollPosition, behavior: "smooth" });
      } else {
        expandedScrollPosition = window.scrollY || window.pageYOffset;
        expandedPageId = page.id;
        addOverlay();
        displayPages();
        setupPagination();
        setTimeout(() => {
          const expandedCard = document.getElementById(`page-${page.id}`);
          if (expandedCard) {
            expandedCard.scrollIntoView({
              behavior: "smooth",
              block: "center",
              inline: "nearest"
            });
          }
        }, 100);
      }
    });
    latestGrid.appendChild(item);
  });
}
function processLinks(html) {
  return html.replace(/\[\[([^\]]+)\]\]/g, (match, p1) => {
    const page = pages.find((page) => page.Title === p1.trim());
    if (page) {
      return `<a href="#" class="page-link" data-page-id="${
        page.id
      }">${p1.trim()}</a>`;
    } else {
      return `<span class="missing-page">${p1.trim()}</span>`;
    }
  });
}
document.addEventListener("click", (e) => {
  if (e.target && e.target.classList.contains("page-link")) {
    e.preventDefault();
    const pageId = parseInt(e.target.dataset.pageId);
    if (!pageId) return;
    closeAllModals();
    expandedPageId = pageId;
    expandedScrollPosition = window.scrollY || window.pageYOffset;
    addOverlay();
    displayPages();
    setupPagination();
    setTimeout(() => {
      const expandedCard = document.getElementById(`page-${pageId}`);
      if (expandedCard) {
        expandedCard.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "nearest"
        });
      }
    }, 100);
  }
});
function processMarkdown(markdown) {
  const linksSet = new Set();
  const lines = markdown.split("\n");
  const cleanedLines = [];
  let i = 0;
  const backlinksSectionStartRegex = /^<hr>\s*$/i;
  const backlinksLineRegex = /^backlinks:\s*(\[\[.+?\]\](?:\s*\|\s*\[\[.+?\]\])*)$/i;
  const standaloneBacklinkRegex = /^(\- )?\[\[.+?\]\](?:\s*\|\s*\[\[.+?\]\])*$/;
  while (i < lines.length) {
    const line = lines[i].trim();
    if (
      backlinksSectionStartRegex.test(line) &&
      backlinksLineRegex.test(lines[i + 1]?.trim())
    ) {
      const backlinksLine = lines[i + 1].trim();
      const matches = backlinksLine.match(backlinksLineRegex);
      if (matches) {
        const backlinks = matches[1]
          .split(/\s*\|\s*/)
          .map((link) => link.slice(2, -2));
        backlinks.forEach((link) => linksSet.add(link));
      }
      i += 2;
      continue;
    }
    if (standaloneBacklinkRegex.test(line)) {
      const links = line
        .match(/\[\[(.+?)\]\]/g)
        .map((link) => link.slice(2, -2));
      links.forEach((link) => linksSet.add(link));
      i++;
      continue;
    }
    const inlineLinks = line.match(/\[\[(.+?)\]\]/g);
    if (inlineLinks) {
      inlineLinks.forEach((link) => linksSet.add(link.slice(2, -2)));
    }
    cleanedLines.push(lines[i]);
    i++;
  }
  let cleanedText = cleanedLines.join("\n").replace(/\n{3,}/g, "\n\n");
  cleanedText = cleanedText
    .replace(/<hr>\s*backlinks:\s*(\[\[.+?\]\](?:\s*\|\s*\[\[.+?\]\])*)/i, "")
    .trim();
  const backlinksArray = Array.from(linksSet).sort();
  if (backlinksArray.length > 0) {
    const backlinksSection = `\n<hr>\nbacklinks: ${backlinksArray
      .map((link) => `[[${link}]]`)
      .join(" | ")}`;
    cleanedText += backlinksSection;
  }
  return cleanedText.trim();
}
function handleCardScroll(expandedCard) {
  const isAtBottom =
    expandedCard.scrollHeight - expandedCard.scrollTop <=
    expandedCard.clientHeight + 1;
  expandedCard.style.boxShadow = isAtBottom
    ? "none"
    : "inset 0px -10px 10px -10px rgba(0, 0, 0, 1)";
}
function deletePage(index) {
  if (confirm("Are you sure you want to delete this page?")) {
    const deletedPageId = pages[index].id;
    pages.splice(index, 1);
    localStorage.setItem("pages", JSON.stringify(pages));
    if (expandedPageId === deletedPageId) {
      expandedPageId = null;
    }
    totalPages = Math.ceil(pages.length / itemsPerPage);
    if (currentPage > totalPages) {
      currentPage = totalPages;
    }
    displayPages();
    setupPagination();
    updateExportButtonTitle();
  }
}
function editPage(index) {
  const page = pages[index];
  if (!page) {
    showStatusMessage("Page not found!");
    return;
  }
  expandedScrollPosition = window.scrollY || window.pageYOffset;
  addPageForm.style.display = "block";
  formTitle.textContent = "Edit Page";
  document.getElementById("picture").value = page.Picture || "";
  document.getElementById("bg-color").value = page.BgColor || "#FFFF00";
  document.getElementById("title").value = page.Title;
  document.getElementById("description").value = page.Description;
  document.getElementById("date").value = page.Date;
  document.getElementById("body").value = page.Body;
  currentEditIndex = index;
  addOverlay();
  addPageForm.scrollIntoView({ behavior: "smooth" });
}
function setupPagination() {
  paginationContainer.innerHTML = "";
  if (totalPages <= 1) return;
  const prevButton = document.createElement("button");
  prevButton.textContent = "⬅️";
  prevButton.disabled = currentPage === 1;
  prevButton.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      expandedPageId = null;
      displayPages();
      setupPagination();
      scrollToTop();
    }
  });
  paginationContainer.appendChild(prevButton);
  for (let i = 1; i <= totalPages; i++) {
    const pageButton = document.createElement("button");
    pageButton.textContent = i;
    if (i === currentPage) {
      pageButton.classList.add("active");
    }
    pageButton.addEventListener("click", () => {
      currentPage = i;
      expandedPageId = null;
      displayPages();
      setupPagination();
      scrollToTop();
    });
    paginationContainer.appendChild(pageButton);
  }
  const nextButton = document.createElement("button");
  nextButton.textContent = "➡️";
  nextButton.disabled = currentPage === totalPages;
  nextButton.addEventListener("click", () => {
    if (currentPage < totalPages) {
      currentPage++;
      expandedPageId = null;
      displayPages();
      setupPagination();
      scrollToTop();
    }
  });
  paginationContainer.appendChild(nextButton);
}
function scrollToTop() {
  latestGrid.scrollIntoView({ behavior: "smooth" });
}
if (zoomButton) {
  zoomButton.addEventListener("click", () => {
    document.body.classList.remove(
      "zoom-75",
      "zoom-100",
      "zoom-125",
      "zoom-150"
    );
    currentZoomLevelIndex = (currentZoomLevelIndex + 1) % zoomLevels.length;
    const zoomClass = `zoom-${zoomLevels[currentZoomLevelIndex]}`;
    document.body.classList.add(zoomClass);
  });
}
if (sortButton) {
  sortButton.addEventListener("click", () => {
    currentSortIndex = (currentSortIndex + 1) % sortOrder.length;
    currentSort = sortOrder[currentSortIndex];
    let icon = "";
    let titleText = "";
    if (currentSort === "date") {
      icon = "🗓️";
      titleText = "Sort by Date Posted 🗓️";
    } else if (currentSort === "name") {
      icon = "🔡";
      titleText = "Sort by Name 🔡";
    } else if (currentSort === "color") {
      icon = "🎨";
      titleText = "Sort by Color 🎨";
    } else {
      icon = "🚫";
      titleText = "No sorting applied";
    }
    sortButton.innerHTML = icon;
    sortButton.title = titleText;
    expandedPageId = null;
    displayPages();
    setupPagination();
  });
}
function addOverlay() {
  overlay.style.display = "block";
  overlay.style.pointerEvents = "auto";
  document.body.classList.add("no-scroll");
}
function removeOverlay() {
  overlay.style.display = "none";
  overlay.style.pointerEvents = "none";
  document.body.classList.remove("no-scroll");
}
function clearSelection() {
  const selected = suggestionBox.querySelector(".suggestion-item.selected");
  if (selected) {
    selected.classList.remove("selected");
  }
}
function moveSelection(direction) {
  const items = Array.from(suggestionBox.querySelectorAll(".suggestion-item"));
  const visibleItems = items.filter((item) => item.style.display !== "none");
  const currentIndex = visibleItems.findIndex((item) =>
    item.classList.contains("selected")
  );
  if (currentIndex === -1) return;
  clearSelection();
  let newIndex = currentIndex + direction;
  if (newIndex < 0) newIndex = visibleItems.length - 1;
  if (newIndex >= visibleItems.length) newIndex = 0;
  const newItem = visibleItems[newIndex];
  if (newItem) {
    newItem.classList.add("selected");
    newItem.scrollIntoView({ block: "nearest" });
  }
}
function positionSuggestionBox(inputElement) {
  if (!suggestionBox) return;
  const rect = inputElement.getBoundingClientRect();
  suggestionBox.style.left = `${rect.left + window.scrollX}px`;
  suggestionBox.style.top = `${rect.bottom + window.scrollY}px`;
  suggestionBox.style.width = `${rect.width}px`;
}
function hideSuggestionBox() {
  if (suggestionBox) {
    suggestionBox.style.display = "none";
    suggestionBox.innerHTML = "";
  }
  currentSuggestionMode = null;
}
document.addEventListener("click", function (e) {
  if (
    !commandInput.contains(e.target) &&
    !bodyTextarea.contains(e.target) &&
    !suggestionBox.contains(e.target)
  ) {
    hideSuggestionBox();
  }
});
if (loadJsonButton) {
  loadJsonButton.addEventListener("click", () => {
    jsonFileInput.click();
  });
}
if (jsonFileInput) {
  jsonFileInput.addEventListener("change", handleJsonImport);
}
function handleJsonImport(event) {
  const file = event.target.files[0];
  if (!file) {
    showStatusMessage("No file selected for import.");
    return;
  }
  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const importedData = JSON.parse(e.target.result);
      if (!importedData.pages || !Array.isArray(importedData.pages)) {
        throw new Error("Invalid JSON format: 'pages' array is missing.");
      }
      if (
        importedData.blogTitle &&
        typeof importedData.blogTitle === "string"
      ) {
        blogTitle = importedData.blogTitle;
        mainTitle.textContent = blogTitle;
        localStorage.setItem("blogTitle", blogTitle);
        updateExportButtonTitle();
      }
      pages = importedData.pages.map((page, index) => {
        if (!page.id) {
          page.id = nextPageId++;
        } else {
          nextPageId = Math.max(nextPageId, page.id + 1);
        }
        if (page.Picture) {
          preloadImage(page.Picture);
        }
        return page;
      });
      localStorage.setItem("pages", JSON.stringify(pages));
      totalPages = Math.ceil(pages.length / itemsPerPage);
      currentPage = 1;
      displayPages();
      setupPagination();
      showStatusMessage("Import successful!");
    } catch (error) {
      console.error("Import Error:", error);
      showStatusMessage(`Failed to import JSON: ${error.message}`);
    }
  };
  reader.onerror = function () {
    console.error("File reading failed.");
    showStatusMessage("An error occurred while reading the file.");
  };
  reader.readAsText(file);
  jsonFileInput.value = "";
}
async function fetchGitHubJson() {
  if (!GITHUB_JSON_URL) return false;
  try {
    const response = await fetch(GITHUB_JSON_URL);
    if (!response.ok) {
      console.warn(`GitHub fetch failed with status: ${response.status}`);
      return false;
    }
    const importedData = await response.json();
    if (!importedData.pages || !Array.isArray(importedData.pages)) {
      console.error("Invalid JSON format: 'pages' array is missing.");
      return false;
    }
    if (importedData.blogTitle && typeof importedData.blogTitle === "string") {
      blogTitle = importedData.blogTitle;
      mainTitle.textContent = blogTitle;
      localStorage.setItem("blogTitle", blogTitle);
    }
    pages = importedData.pages.map((page) => {
      if (!page.id) {
        page.id = nextPageId++;
      } else {
        nextPageId = Math.max(nextPageId, page.id + 1);
      }
      if (page.Picture) {
        preloadImage(page.Picture);
      }
      return page;
    });
    localStorage.setItem("pages", JSON.stringify(pages));
    totalPages = Math.ceil(pages.length / itemsPerPage);
    currentPage = 1;
    displayPages();
    setupPagination();
    showStatusMessage("Data loaded successfully from GitHub.");
    return true;
  } catch (error) {
    console.error("Error fetching GitHub JSON:", error);
    showStatusMessage(
      "Failed to load data from GitHub. Loading from local storage if available."
    );
    return false;
  }
}
function showStatusMessage(message) {
  let statusMessage = document.getElementById("status-message");
  if (!statusMessage) {
    statusMessage = document.createElement("div");
    statusMessage.id = "status-message";
    statusMessage.style.position = "fixed";
    statusMessage.style.top = "10px";
    statusMessage.style.right = "10px";
    statusMessage.style.padding = "10px 20px";
    statusMessage.style.backgroundColor = "#333";
    statusMessage.style.color = "#fff";
    statusMessage.style.borderRadius = "5px";
    statusMessage.style.zIndex = "1000";
    document.body.appendChild(statusMessage);
  }
  statusMessage.textContent = message;
  statusMessage.style.display = "block";
  setTimeout(() => {
    statusMessage.style.display = "none";
  }, 5000);
}
function hideStatusMessage() {
  const statusMessage = document.getElementById("status-message");
  if (statusMessage) {
    statusMessage.style.display = "none";
  }
}
if (exportJsonButton) {
  exportJsonButton.addEventListener("click", exportToJson);
}
function exportToJson() {
  try {
    const data = {
      blogTitle: blogTitle,
      pages: pages
    };
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${sanitizeFilename(blogTitle)}_data.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showStatusMessage("Exported data successfully!");
  } catch (error) {
    console.error("Export Error:", error);
    showStatusMessage(`Failed to export data: ${error.message}`);
  }
}
function sanitizeFilename(filename) {
  return filename.replace(/[^a-z0-9_\-]/gi, "_");
}
function extractLinks(markdown) {
  const linkRegex = /\[\[([^\]]+)\]\]/g;
  const links = new Set();
  let match;
  while ((match = linkRegex.exec(markdown)) !== null) {
    links.add(match[1].trim());
  }
  return Array.from(links);
}
function addBacklink(linkedPage, backlinkTitle) {
  const backlink = `[[${backlinkTitle}]]`;
  const backlinkRegex = /\[\[([^\]]+)\]\]/g;
  const backlinksSet = new Set();
  let match;
  while ((match = backlinkRegex.exec(linkedPage.Body)) !== null) {
    backlinksSet.add(`[[${match[1]}]]`);
  }
  if (!backlinksSet.has(backlink)) {
    backlinksSet.add(backlink);
  }
  let updatedBody = linkedPage.Body.replace(/<hr\s*\/?>/gi, "");
  updatedBody = updatedBody.replace(/backlinks:\s*[\s\S]*/i, "");
  updatedBody = updatedBody.replace(/^.*\[\[.*\]\].*$/gm, "");
  updatedBody = updatedBody.replace(/\n{2,}/g, "\n");
  if (backlinksSet.size > 0) {
    if (!updatedBody.endsWith("\n")) {
      updatedBody += "\n";
    }
    updatedBody += `\n<hr>\nbacklinks: ${Array.from(backlinksSet).join(" | ")}`;
  }
  linkedPage.Body = processMarkdown(updatedBody);
}
