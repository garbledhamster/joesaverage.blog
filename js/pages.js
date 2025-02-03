// pages.js

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
      if (page.Date) {
        const parsedDate = new Date(page.Date);
        if (isNaN(parsedDate)) {
          date.textContent = "Invalid Date";
        } else {
          const hasTime = page.Date.includes("T");
          date.textContent = hasTime
            ? parsedDate.toLocaleString()
            : parsedDate.toLocaleDateString();
        }
      } else {
        date.textContent = "No Date Provided";
      }
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
  
      const seriesButton = document.createElement("button");
      seriesButton.className = "series-button";
      seriesButton.innerHTML = "📚";
      seriesButton.title = "Generate a series post 📚";
      seriesButton.addEventListener("click", (e) => {
        e.stopPropagation();
        handleGenerateSeriesPost(actualIndex);
      });
  
      cardActions.appendChild(seriesButton);
  
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
  
  function handleGenerateSeriesPost(index) {
    const apiKey = localStorage.getItem("openai_api_key");
    if (!apiKey) {
      commandInput.value = "/saveapikey '[REPLACE ME WITH YOUR API KEY]'";
      commandInput.focus();
      commandInput.setSelectionRange(13, 13);
      showStatusMessage("API key not configured. Please register your API key.");
      return;
    }
    const currentPage = pages[index];
    if (!currentPage) {
      showStatusMessage("Page not found!");
      return;
    }
    const prompt = `Based on the previous blog post titled "${currentPage.Title}", without losing the information from the last article apply any knowledge and or wisdom someone can gain from it be subtle when rewriting the post. The previous post content was: "${currentPage.Body}". Add the previous blog posts title to the end of the document wrapped in brackets like ""[[${currentPage.Title}]]" Ignore any html that and only focus on the content of the prevoius post.  Always write, complete paragraphs, lists, and posts`;
    generatepost(prompt, apiKey);
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
  
  function handleCardScroll(expandedCard) {
    const isAtBottom =
      expandedCard.scrollHeight - expandedCard.scrollTop <=
      expandedCard.clientHeight + 1;
    expandedCard.style.boxShadow = isAtBottom
      ? "none"
      : "inset 0px -10px 10px -10px rgba(0, 0, 0, 1)";
  }
  
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
  