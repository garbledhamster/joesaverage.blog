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

/* ========================================= */
/*          GITHUB JSON CONFIGURATION        */
/* ========================================= */

const GITHUB_JSON_URL =
  "https://raw.githubusercontent.com/garbledhamster/MiniBlogAdmin/refs/heads/main/posts.json";

/* ========================================= */
/*               GLOBAL VARIABLES            */
/* ========================================= */
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
const sortOrder = ["🚫", "date", "name", "color"];
let currentSortIndex = 0;
let currentSort = sortOrder[currentSortIndex];
let nextPageId = 1;
let searchQuery = "";
let blogTitle = "Make a Blog";

/* ========================================= */
/*        AUTOCOMPLETE VARIABLES            */
/* ========================================= */
// Create a single suggestion box for both command and page link autocompletion
const suggestionBox = document.createElement("div");
suggestionBox.className = "suggestion-box";
document.body.appendChild(suggestionBox);
suggestionBox.style.display = "none";

// Current suggestion mode: 'command' or 'page'
let currentSuggestionMode = null;

// Flag to prevent immediate re-triggering of suggestions after selection
let justAcceptedSuggestion = false;

// Define available commands with their help texts and examples
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

/* ========================================= */
/*        INITIALIZATION AND EVENTS         */
/* ========================================= */

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
      alert("Data loaded successfully from local storage.");
    } catch (error) {
      console.error("Error parsing pages from localStorage:", error);
      pages = [];
      displayPages();
    }
  } else {
    displayPages();
  }
}

// Load pages from localStorage on DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
  // Attempt to fetch JSON from GitHub
  fetchGitHubJson()
    .then((fetched) => {
      if (fetched) {
        // Successfully fetched from GitHub
        displayPages();
        setupPagination();
        showStatusMessage("Data loaded successfully from GitHub.");
      } else {
        // Failed to fetch from GitHub, fallback to localStorage
        loadFromLocalStorage();
        showStatusMessage("Data loaded from local storage.");
      }
    })
    .catch((error) => {
      console.error("Initialization Error:", error);
      // As a last resort, attempt to load from localStorage
      loadFromLocalStorage();
      showStatusMessage("Data loaded from local storage.");
    });

  // Load blog title from localStorage
  const storedTitle = localStorage.getItem("blogTitle");
  if (storedTitle) {
    blogTitle = storedTitle;
    mainTitle.textContent = blogTitle;
  }
  updateExportButtonTitle();
});

// Update export button title based on blog title
function updateExportButtonTitle() {
  exportJsonButton.title = `Export JSON 📥 (${blogTitle})`;
}

// Event listener for double-click on main title to edit
mainTitle.addEventListener("dblclick", () => {
  editMainTitle();
});

// Function to edit main title
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

// Function to preload images
function preloadImage(url) {
  if (!imageCache.has(url)) {
    const img = new Image();
    img.src = url;
    imageCache.set(url, true);
  }
}

// Event listener for opening the form
if (openFormButton) {
  openFormButton.addEventListener("click", () => {
    showForm();
  });
}

// Function to show the form
function showForm() {
  addPageForm.style.display = "block";
  formTitle.textContent = "Add New Page";
  pageForm.reset();
  currentEditIndex = null;
  addOverlay();
  addPageForm.scrollIntoView({ behavior: "smooth" });
}

// Event listener for closing the form
if (closeFormButton) {
  closeFormButton.addEventListener("click", () => {
    hideForm();
  });
}

// Function to hide the form
function hideForm() {
  addPageForm.style.display = "none";
  pageForm.reset();
  currentEditIndex = null;
  // Only remove overlay if no expanded post is open
  if (expandedPageId === null) {
    removeOverlay();
  }
}

// Event listener for clicking the overlay
overlay.addEventListener("click", (e) => {
  if (e.target === overlay) {
    closeAllModals();
  }
});

// Function to close both the form and the expanded post
function closeAllModals() {
  // Close the edit form if it's open
  if (addPageForm.style.display === "block") {
    hideForm();
  }
  // Close the expanded post if it's open
  if (expandedPageId !== null) {
    expandedPageId = null;
    displayPages();
    setupPagination();
    window.scrollTo({ top: expandedScrollPosition, behavior: "smooth" });
  }
  // Remove the overlay after closing modals
  removeOverlay();
}

// Event listener for the clear button
if (clearButton) {
  clearButton.addEventListener("click", () => {
    if (confirm("Are you sure you want to clear all configurations?")) {
      localStorage.removeItem("pages");
      localStorage.removeItem("blogTitle");
      localStorage.removeItem("openai_api_key"); // Remove API key as well
      pages = [];
      blogTitle = "Make a Blog";
      mainTitle.textContent = blogTitle;
      imageCache.clear();
      expandedPageId = null;
      currentPage = 1;
      totalPages = 1;
      searchQuery = ""; // Reset search query
      commandInput.value = ""; // Clear input field
      bodyTextarea.value = ""; // Clear body textarea
      displayPages();
      setupPagination();
      updateExportButtonTitle();
    }
  });
}

/* ========================================= */
/*        FORM SUBMISSION HANDLER            */
/* ========================================= */
pageForm.addEventListener("submit", (e) => {
  e.preventDefault();

  // Retrieve and trim the picture URL from the form
  let picture = document.getElementById("picture").value.trim();

  // If no picture URL is provided, assign a random image from Lorem Picsum
  if (!picture) {
    picture = `https://picsum.photos/300/200?random=${Math.floor(
      Math.random() * 1000
    )}`;
  }

  const bgColor = document.getElementById("bg-color").value;
  const title = document.getElementById("title").value.trim();
  const description = document.getElementById("description").value.trim();
  const date = document.getElementById("date").value.trim();
  const body = document.getElementById("body").value.trim();

  if (!title || !description || !body) {
    alert("Please fill in all required fields.");
    return;
  }

  // Preload the image (either user-provided or randomly assigned)
  preloadImage(picture);

  const pageData = {
    id: currentEditIndex !== null ? pages[currentEditIndex].id : nextPageId++,
    Picture: picture,
    BgColor: bgColor,
    Title: title,
    Description: description,
    Date: new Date().toISOString().split("T")[0], // Automatically set to today's date
    Body: body
  };

  // Add new page or update the current page
  if (currentEditIndex === null) {
    pages.push(pageData);
  } else {
    pages[currentEditIndex] = pageData;
  }

  // Validate and update backlinks for all pages before saving
  pages.forEach((page) => {
    const backlinksMatch = page.Body.match(/backlinks:\s*([\s\S]*)/i);
    if (backlinksMatch) {
      const currentBacklinks = backlinksMatch[1].split(/\s+/);
      currentBacklinks.forEach((backlink) => {
        const linkedPage = pages.find(
          (p) => p.Title === backlink.replace(/\[\[|\]\]/g, "")
        );
        if (linkedPage) {
          const backlinkToLinked = `[[${page.Title}]]`;
          if (!linkedPage.Body.includes(backlinkToLinked)) {
            linkedPage.Body += ` ${backlinkToLinked}`;
          }
        }
      });
    }
  });

  // Save the updated pages to localStorage
  localStorage.setItem("pages", JSON.stringify(pages));
  totalPages = Math.ceil(pages.length / itemsPerPage);
  if (currentPage > totalPages) {
    currentPage = totalPages;
  }

  searchQuery = ""; // Reset search query
  commandInput.value = ""; // Clear input field
  bodyTextarea.value = ""; // Clear body textarea
  displayPages();
  setupPagination();

  saveButton.textContent = "✅";
  saveButton.disabled = true;
  setTimeout(() => {
    saveButton.textContent = "💾";
    saveButton.disabled = false;
  }, 2000);
});

/* ========================================= */
/*       COMMAND INPUT AUTOCOMPLETE          */
/* ========================================= */

// Event listeners for the command input field to handle commands on Enter key and other interactions
commandInput.addEventListener("input", handleCommandInputInput);
commandInput.addEventListener("keydown", handleCommandInput);

/* ========================================= */
/*        AUTOCOMPLETE FUNCTIONS             */
/* ========================================= */

function handleCommandInputInput(event) {
  if (justAcceptedSuggestion) {
    justAcceptedSuggestion = false;
    return;
  }

  const text = commandInput.value;
  // Ensure '/' is the first character
  if (text.startsWith("/")) {
    const commandText = text.substring(1).split(" ")[0].trim().toLowerCase();
    const exactMatch = availableCommands.some(
      (cmd) => cmd.name.toLowerCase() === commandText
    );

    if (exactMatch) {
      // If the input exactly matches a command, hide the suggestion box
      hideSuggestionBox();
      currentSuggestionMode = null;
    } else {
      // Show suggestions only if the input is a partial command
      showCommandSuggestions(commandText);
      currentSuggestionMode = "command";
    }
  } else {
    if (currentSuggestionMode === "command") {
      // Only hide if currently in 'command' mode
      hideSuggestionBox();
      currentSuggestionMode = null;
    }
    searchQuery = text.toLowerCase();
    currentPage = 1;
    displayPages();
    setupPagination();
  }
}

// Function to handle keydown events in the command input field
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
      // Added space key
      event.preventDefault();
      const selected = suggestionBox.querySelector(".suggestion-item.selected");
      if (selected) {
        acceptCommandSuggestion(selected.dataset.command, event.shiftKey);
      } else {
        hideSuggestionBox(); // Hide if no suggestion is selected
        currentSuggestionMode = null;
      }
    }
  } else if (event.key === "Enter") {
    event.preventDefault();
    executeCommandFromInput();
  }
}

// Function to accept a selected command suggestion
function acceptCommandSuggestion(commandName, isShiftKey) {
  const cmd = availableCommands.find((c) => c.name === commandName);
  if (!cmd) return;

  commandInput.value = cmd.example;

  // Adjust to select everything between the brackets
  const startHighlight = cmd.example.indexOf("[");
  const endHighlight = cmd.example.indexOf("]") + 1;

  commandInput.focus();
  commandInput.setSelectionRange(startHighlight, endHighlight);
  hideSuggestionBox(); // Hide after accepting suggestion
  currentSuggestionMode = null;
  justAcceptedSuggestion = true;
}

// Function to execute command from input
function executeCommandFromInput() {
  const inputValue = commandInput.value.trim();
  if (inputValue.startsWith("/")) {
    const commandParts = inputValue.substring(1).split(" ");
    const commandName = commandParts[0].toLowerCase(); // Ensure command matching is case-insensitive
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
        alert("Unknown command.");
        break;
    }
  }
}

// Function to parse command arguments
function parseCommandArguments(argsString) {
  const args = {};
  const regex = /'([^']*)'/g; // Match content within single quotes
  let match;
  while ((match = regex.exec(argsString)) !== null) {
    args.value = match[1] || "";
  }
  return args;
}

// Command handlers
function handleCreatePostCommand(args) {
  if (args.value) {
    showForm();
    document.getElementById("title").value = args.value;
    commandInput.value = "";
  } else {
    alert("Please provide the title using '/createpost 'Your title here''");
  }
}

function handleSaveApiKeyCommand(args) {
  if (args.value) {
    const apiKey = args.value;
    localStorage.setItem("openai_api_key", apiKey);
    alert("API key registered successfully.");
    commandInput.value = "";
  } else {
    alert("Please provide the API key using '/saveapikey 'your_api_key''");
  }
}

function handleClearApiKeyCommand() {
  const apiKey = localStorage.getItem("openai_api_key");
  if (apiKey) {
    localStorage.removeItem("openai_api_key");
    alert("API key removed successfully.");
  } else {
    alert("No API key is currently registered.");
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
      alert("API key not configured. Please register your API key.");
    } else {
      generatepost(prompt, apiKey);
    }
  } else {
    alert("Please provide a prompt using '/generatepost 'Your prompt here''");
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
        content:
          'Generate a title, description, and body for JavaScript. Always use \'<br><br>\' for line breaks to keep the code clean based on the user\'s prompt. Return the response in the following JSON format: { "title": "...", "description": "...", "body": "..." }. This is not a conversation.<br><br>**Objective**:<br><br>Create a concise, engaging summary card that captures the main insights from the provided content. The card should be clear, motivating, and accessible to enhance understanding and spark curiosity.<br><br>**Goals**:<br><br>- **Clarity**: Make the information easy to follow.<br>- **Inspiration**: Highlight impactful and motivational points.<br>- **Engagement**: Simplify the content while preserving its core message to maintain interest.<br><br>---<br><br>**OUTPUT FORMAT**:<br><br>Follow this structure for consistency:<br><br>{{PAGE TITLE}}<br><br>🔗 KEYWORDS: {{KEYWORDS}}<br><br>📃 SUMMARY: {{BRIEF SUMMARY OF CONTENT}}<br><br>KEY POINTS:<br>- {{EMOJI}} {{KEYPOINT TITLE}}: {{KEYPOINT DESCRIPTION}}<br>- {{EMOJI}} {{KEYPOINT TITLE}}: {{KEYPOINT DESCRIPTION}}<br>- {{ADDITIONAL KEYPOINTS}}<br><br>SOURCES:<br>- 📚 *"{{BOOK TITLE}}"* - {{AUTHOR}} - {{DESCRIPTION OF SOURCE}}<br>- 📰 *"{{ARTICLE TITLE}}"* - {{PUBLICATION}} - {{DESCRIPTION OF SOURCE}}<br>- {{ADDITIONAL SOURCES}}<br><br>**INSTRUCTIONS FOR EACH SECTION**:<br><br>1. **Title**: Choose a clear title that summarizes the main idea.<br>   - Example: “Building Resilience Through Habits.”<br><br>2. **🔗 Keywords**: Identify 3-5 keywords relevant to the content.<br>   - Example: "resilience, habits, self-improvement, growth."<br><br>3. **📃 Summary**: Provide a brief overview (1-2 sentences) capturing the core insight.<br>   - Example: "Developing resilience relies on forming small, consistent habits that support mental and emotional growth."<br><br>4. **Key Points**:<br>   - Use emojis to represent the type of point (🧠 for ideas, 🔑 for main points, ⚡ for breakthroughs).<br>   - Make key point titles concise, and the descriptions actionable or reflective.<br>   - Example:<br>     - 🧠 **Consistent Practice**: Regular habits build resilience over time.<br>     - 🔑 **Self-Reflection**: Examining reactions helps build emotional strength.<br><br>5. **Sources**:<br>   - Template placeholders for books, articles, or other resources.<br>   - Example:<br>     - 📚 *"{{BOOK TITLE}}"* - {{AUTHOR}} - Explores the principles of habit formation.<br>     - 📰 *"{{ARTICLE TITLE}}"* - {{PUBLICATION}} - Analyzes recent research on resilience-building habits.<br><br>This format maintains consistency, clarity, and engagement across various platforms.'
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
      // Log the raw response as text before attempting to parse it
      return response.text().then((text) => {
        try {
          const data = JSON.parse(text);
          if (!response.ok) {
            console.error("API Error:", data);
            throw new Error(data.error.message || "API request failed");
          }
          return data; // Return parsed JSON if it's valid
        } catch (err) {
          // Handle cases where response is not valid JSON
          console.error("Non-JSON response received:", text);
          throw new Error("Received invalid JSON response from the server.");
        }
      });
    })
    .then((data) => {
      // Process the JSON data here
      console.log("Data received:", data);
      const assistantResponse = data.choices[0].message.content;
      const responseObj = JSON.parse(assistantResponse); // Parse response content as JSON
      showForm();
      document.getElementById("title").value = responseObj.title;
      document.getElementById("description").value = responseObj.description;
      document.getElementById("body").value = responseObj.body;
      commandInput.value = "";
      hideStatusMessage();

      // Set today's date
      document.getElementById("date").value = new Date()
        .toISOString()
        .split("T")[0];
    })
    .catch((error) => {
      console.error("Fetch Error:", error.message);
      hideStatusMessage();
      alert(`An error occurred: ${error.message}`);
    });
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
}

function hideStatusMessage() {
  const statusMessage = document.getElementById("status-message");
  if (statusMessage) {
    statusMessage.style.display = "none";
  }
}

// Function to show command suggestions
function showCommandSuggestions(commandText) {
  if (!suggestionBox) return;

  suggestionBox.innerHTML = "";

  // Filter commands based on the current input (case-insensitive)
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
      // Ensure clicking a command hides the suggestion box
      e.preventDefault();
      acceptCommandSuggestion(cmd.name, e.shiftKey);
    });

    suggestionBox.appendChild(item);
  });

  if (filteredCommands.length > 0) {
    // Only show if there are matching commands
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

/* ========================================= */
/*        BODY TEXTAREA AUTOCOMPLETE          */
/* ========================================= */

bodyTextarea.addEventListener("input", handleBodyAutocomplete);
bodyTextarea.addEventListener("keydown", handleBodyKeyDown);

// Function to handle input in the body textarea for [[LINK]] autocomplete
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

      // Log to confirm Shift key status
      console.log("Shift key pressed:", event.shiftKey);

      if (selected) {
        insertPageLink(selected.dataset.title, event.shiftKey);
      }
    }
  }
}

// Function to insert the selected page link into the textarea
function insertPageLink(title, isShiftKey) {
  const cursorPos = bodyTextarea.selectionStart;
  const text = bodyTextarea.value;

  // Insert link at cursor if Shift is not held
  if (!isShiftKey) {
    const startPos = text.lastIndexOf("[[");
    const before = text.substring(0, startPos + 2);
    const after = text.substring(cursorPos);

    bodyTextarea.value = before + title + "]]" + after;
    bodyTextarea.selectionStart = startPos + 2 + title.length + 2;
    bodyTextarea.selectionEnd = startPos + 2 + title.length + 2;
  } else {
    // Handle backlinks if Shift is held
    const currentPage = pages[currentEditIndex];
    const selectedPage = pages.find((page) => page.Title === title.trim());

    if (selectedPage && currentPage) {
      const backlink = `[[${currentPage.Title}]]`;

      // Ensure the selected page has a backlinks section
      const backlinksSection = /backlinks:\s*([\s\S]*)/i;
      const backlinksMatch = selectedPage.Body.match(backlinksSection);
      if (backlinksMatch) {
        // Append backlink if it doesn't already exist
        if (!backlinksMatch[1].includes(backlink)) {
          selectedPage.Body = selectedPage.Body.replace(
            backlinksSection,
            `backlinks: ${backlinksMatch[1].trim()} ${backlink}`
          );
        }
      } else {
        // Add backlinks section at the end if missing
        selectedPage.Body += `\n\nbacklinks: ${backlink}`;
      }

      // Ensure the current page has a backlinks section
      const backlinkToCurrent = `[[${title}]]`;
      const backlinksMatchCurrent = currentPage.Body.match(
        /backlinks:\s*([\s\S]*)/i
      );
      if (backlinksMatchCurrent) {
        // Append backlink if it doesn't already exist
        if (!backlinksMatchCurrent[1].includes(backlinkToCurrent)) {
          currentPage.Body = currentPage.Body.replace(
            /backlinks:\s*([\s\S]*)/i,
            `backlinks: ${backlinksMatchCurrent[1].trim()} ${backlinkToCurrent}`
          );
        }
      } else {
        // Add backlinks section at the end if missing
        currentPage.Body += `\n\nbacklinks: ${backlinkToCurrent}`;
      }

      // Save the updated pages to localStorage
      localStorage.setItem("pages", JSON.stringify(pages));
    }
  }

  bodyTextarea.focus();
  currentSuggestionMode = null;
  hideSuggestionBox();
}

// Function to show page suggestions
function showPageSuggestions(query) {
  if (!suggestionBox) return;

  suggestionBox.innerHTML = "";

  // Filter pages based on query
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

  // Sort suggestions alphabetically
  suggestions.sort((a, b) => a.localeCompare(b));

  // Create suggestion items
  suggestions.forEach((suggestion) => {
    const item = document.createElement("div");
    item.className = "suggestion-item";
    item.dataset.title = suggestion;
    item.title = `Insert link to "${suggestion}"`;

    const titleSpan = document.createElement("span");
    titleSpan.textContent = suggestion;

    item.appendChild(titleSpan);

    // Mouse events for selection
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

/* ========================================= */
/*        DISPLAY FUNCTIONS                  */
/* ========================================= */

// Function to display pages
function displayPages() {
  latestGrid.innerHTML = "";

  if (pages.length === 0) {
    const noPagesMessage = document.createElement("p");
    noPagesMessage.textContent = "No pages available. Please add a new page.";
    latestGrid.appendChild(noPagesMessage);
    paginationContainer.innerHTML = "";
    return;
  }

  // Filter pages by searchQuery
  let filteredPages = pages;
  if (searchQuery !== "") {
    const isExactMatch =
      searchQuery.startsWith('"') && searchQuery.endsWith('"');
    const query = isExactMatch
      ? searchQuery.slice(1, -1).toLowerCase() // Remove quotes for exact match
      : searchQuery.toLowerCase();

    filteredPages = pages.filter((page) => {
      const titleMatch = page.Title.toLowerCase().includes(query);
      const bodyMatch = page.Body.toLowerCase().includes(query);

      if (isExactMatch) {
        // Search for an exact phrase in both Title and Body
        return (
          page.Title.toLowerCase().includes(query) ||
          page.Body.toLowerCase().includes(query)
        );
      } else {
        // Flexible search without quotes (can be separated words or partial matches)
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

  // Sort the filtered pages
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

// Function to process [[PAGE NAME]] links
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

// Event listener for page links in body content
document.addEventListener("click", (e) => {
  if (e.target && e.target.classList.contains("page-link")) {
    e.preventDefault();
    const pageId = parseInt(e.target.dataset.pageId);
    if (!pageId) return;
    // Close any open modals
    closeAllModals();
    // Open the page with the given id
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

// Function to handle card scroll
function handleCardScroll(expandedCard) {
  const isAtBottom =
    expandedCard.scrollHeight - expandedCard.scrollTop <=
    expandedCard.clientHeight + 1;

  expandedCard.style.boxShadow = isAtBottom
    ? "none"
    : "inset 0px -10px 10px -10px rgba(0, 0, 0, 1)";
}

// Function to delete a page
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

// Function to edit a page
function editPage(index) {
  const page = pages[index];
  if (!page) {
    alert("Page not found!");
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

// Function to set up pagination
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

// Function to scroll to the top
function scrollToTop() {
  latestGrid.scrollIntoView({ behavior: "smooth" });
}

// Event listener for the zoom button
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

// Event listener for the sort button
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

// Function to add the overlay
function addOverlay() {
  overlay.style.display = "block";
  overlay.style.pointerEvents = "auto";
  document.body.classList.add("no-scroll");
}

// Function to remove the overlay
function removeOverlay() {
  overlay.style.display = "none";
  overlay.style.pointerEvents = "none";
  document.body.classList.remove("no-scroll");
}

/* ========================================= */
/*        SUGGESTION BOX NAVIGATION          */
/* ========================================= */

// Function to clear current selection
function clearSelection() {
  const selected = suggestionBox.querySelector(".suggestion-item.selected");
  if (selected) {
    selected.classList.remove("selected");
  }
}

// Function to move selection up or down
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

// Function to position the suggestion box relative to a given input field
function positionSuggestionBox(inputElement) {
  if (!suggestionBox) return;
  const rect = inputElement.getBoundingClientRect();
  suggestionBox.style.left = `${rect.left + window.scrollX}px`;
  suggestionBox.style.top = `${rect.bottom + window.scrollY}px`;
  suggestionBox.style.width = `${rect.width}px`;
}

// Function to hide the suggestion box
function hideSuggestionBox() {
  if (suggestionBox) {
    suggestionBox.style.display = "none";
    suggestionBox.innerHTML = "";
  }
  currentSuggestionMode = null;
}

// Function to handle click outside to close suggestion box
document.addEventListener("click", function (e) {
  if (
    !commandInput.contains(e.target) &&
    !bodyTextarea.contains(e.target) &&
    !suggestionBox.contains(e.target)
  ) {
    hideSuggestionBox();
  }
});

/* ========================================= */
/*        IMPORT BUTTON EVENT LISTENER       */
/* ========================================= */
if (loadJsonButton) {
  loadJsonButton.addEventListener("click", () => {
    jsonFileInput.click(); // Trigger the hidden file input
  });
}
/* ========================================= */
/*            IMPORT FUNCTIONALITY           */
/* ========================================= */

// Event listener for JSON file input change
if (jsonFileInput) {
  jsonFileInput.addEventListener("change", handleJsonImport);
}

// Function to handle JSON import
function handleJsonImport(event) {
  const file = event.target.files[0];
  if (!file) {
    alert("No file selected for import.");
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const importedData = JSON.parse(e.target.result);

      // Validate the imported data structure
      if (!importedData.pages || !Array.isArray(importedData.pages)) {
        throw new Error("Invalid JSON format: 'pages' array is missing.");
      }

      // Optional: Import blogTitle if present
      if (
        importedData.blogTitle &&
        typeof importedData.blogTitle === "string"
      ) {
        blogTitle = importedData.blogTitle;
        mainTitle.textContent = blogTitle;
        localStorage.setItem("blogTitle", blogTitle);
        updateExportButtonTitle();
      }

      // Assign imported pages
      pages = importedData.pages.map((page, index) => {
        // Ensure each page has a unique ID
        if (!page.id) {
          page.id = nextPageId++;
        } else {
          nextPageId = Math.max(nextPageId, page.id + 1);
        }

        // Preload images
        if (page.Picture) {
          preloadImage(page.Picture);
        }

        return page;
      });

      // Update localStorage with imported pages
      localStorage.setItem("pages", JSON.stringify(pages));

      // Update pagination
      totalPages = Math.ceil(pages.length / itemsPerPage);
      currentPage = 1; // Reset to first page

      // Refresh the UI
      displayPages();
      setupPagination();

      alert("Import successful!");
    } catch (error) {
      console.error("Import Error:", error);
      alert(`Failed to import JSON: ${error.message}`);
    }
  };

  reader.onerror = function () {
    console.error("File reading failed.");
    alert("An error occurred while reading the file.");
  };

  reader.readAsText(file);

  // Reset the file input value to allow re-importing the same file if needed
  jsonFileInput.value = "";
}

/* ========================================= */
/*          GITHUB JSON FETCH FUNCTION       */
/* ========================================= */

/**
 * Attempts to fetch JSON data from the specified GitHub URL.
 * If successful, updates the application state and caches the data.
 * Returns true if data was fetched and loaded, false otherwise.
 */
async function fetchGitHubJson() {
  if (!GITHUB_JSON_URL) return false;

  try {
    const response = await fetch(GITHUB_JSON_URL);
    if (!response.ok) {
      console.warn(`GitHub fetch failed with status: ${response.status}`);
      return false;
    }
    const importedData = await response.json();

    // Validate the imported data structure
    if (!importedData.pages || !Array.isArray(importedData.pages)) {
      console.error("Invalid JSON format: 'pages' array is missing.");
      return false;
    }

    // Optional: Import blogTitle if present
    if (importedData.blogTitle && typeof importedData.blogTitle === "string") {
      blogTitle = importedData.blogTitle;
      mainTitle.textContent = blogTitle;
      localStorage.setItem("blogTitle", blogTitle);
    }

    // Assign imported pages
    pages = importedData.pages.map((page) => {
      // Ensure each page has a unique ID
      if (!page.id) {
        page.id = nextPageId++;
      } else {
        nextPageId = Math.max(nextPageId, page.id + 1);
      }

      // Preload images
      if (page.Picture) {
        preloadImage(page.Picture);
      }

      return page;
    });

    // Update localStorage with imported pages
    localStorage.setItem("pages", JSON.stringify(pages));

    // Update pagination
    totalPages = Math.ceil(pages.length / itemsPerPage);
    currentPage = 1; // Reset to first page

    // Refresh the UI
    displayPages();
    setupPagination();

    alert("Data loaded successfully from GitHub.");
    return true;
  } catch (error) {
    console.error("Error fetching GitHub JSON:", error);
    alert(
      "Failed to load data from GitHub. Loading from local storage if available."
    );
    return false;
  }
}

/* ========================================= */
/*        STATUS MESSAGE FUNCTIONS           */
/* ========================================= */

/**
 * Displays a status message to the user.
 * @param {string} message - The message to display.
 */
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

  // Automatically hide the message after 5 seconds
  setTimeout(() => {
    statusMessage.style.display = "none";
  }, 5000);
}

/**
 * Hides the status message.
 */
function hideStatusMessage() {
  const statusMessage = document.getElementById("status-message");
  if (statusMessage) {
    statusMessage.style.display = "none";
  }
}
/* ========================================= */
/*        EXPORT BUTTON EVENT LISTENER       */
/* ========================================= */

if (exportJsonButton) {
  exportJsonButton.addEventListener("click", exportToJson);
}

/* ========================================= */
/*        EXPORT FUNCTION DEFINITION         */
/* ========================================= */

/**
 * Exports the current blog data to a JSON file.
 */
function exportToJson() {
  try {
    // Gather the data to be exported
    const data = {
      blogTitle: blogTitle,
      pages: pages
    };

    // Convert the data to a JSON string with indentation for readability
    const jsonString = JSON.stringify(data, null, 2);

    // Create a Blob from the JSON string
    const blob = new Blob([jsonString], { type: "application/json" });

    // Create a temporary URL for the Blob
    const url = URL.createObjectURL(blob);

    // Create a temporary anchor element to trigger the download
    const a = document.createElement("a");
    a.href = url;
    a.download = `${sanitizeFilename(blogTitle)}_data.json`; // e.g., "My_Blog_data.json"
    document.body.appendChild(a); // Append to the DOM to make it clickable
    a.click(); // Trigger the download
    document.body.removeChild(a); // Clean up the DOM

    // Revoke the temporary URL to free up resources
    URL.revokeObjectURL(url);

    // Optional: Notify the user of a successful export
    showStatusMessage("Exported data successfully!");
  } catch (error) {
    console.error("Export Error:", error);
    alert(`Failed to export data: ${error.message}`);
  }
}

/**
 * Sanitizes a string to be used as a filename by replacing or removing invalid characters.
 * @param {string} filename - The original filename string.
 * @returns {string} - The sanitized filename string.
 */
function sanitizeFilename(filename) {
  return filename.replace(/[^a-z0-9_\-]/gi, "_");
}
