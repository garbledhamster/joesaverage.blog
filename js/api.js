// api.js

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
  
  function generatepost(prompt, apiKey) {
    showStatusMessage("Generating content feel free to keep using the site...");
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
            'Follow these instructions. You are a helpful AI assistant. Make sure to write the post in an informative, conversational tone that avoids jargon. Don\'t use "Conclusion"; use "To Wrap-Up" instead. Use one of these four emojis to categorize the post: 🧠 Mind, 💪 Body, 👻 Spirit, 👼 Life. Add the emoji to the front of the title like "👼🧠 The Five Day Work Week is Over", "🧠 Meditation Can Be Practical", "👻 What Do Jesus and Buddha Have in Common?", or "Somatics and Calisthenics: The Perfect Way to Rebuild Your Body. 💪🧠 " always add at least one of these four emojis to the front of the posts title to categorize it.'
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
        document.getElementById("date").value = new Date().toISOString();
      })
      .catch((error) => {
        console.error("Fetch Error:", error.message);
        hideStatusMessage();
        showStatusMessage(`An error occurred: ${error.message}`);
      });
  }
  