// app.js

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
  