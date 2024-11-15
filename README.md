# Make a Blog

![Logo](./screenshots/logo.png)  
*[INPUT SCREENSHOT HERE]*

Welcome to **Make a Blog**, a simple yet powerful web application that allows you to create, manage, and export your blog pages effortlessly. Whether you're a seasoned blogger or just starting out, Make a Blog provides an intuitive interface to help you organize your thoughts and share them with the world.

## Table of Contents

- [Features](#features)
- [Screenshots](#screenshots)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Usage](#usage)
  - [Adding a New Page](#adding-a-new-page)
  - [Editing a Page](#editing-a-page)
  - [Deleting a Page](#deleting-a-page)
  - [Exporting Your Blog](#exporting-your-blog)
  - [Importing Your Blog](#importing-your-blog)
  - [Using Commands](#using-commands)
  - [Zooming and Sorting](#zooming-and-sorting)
  - [Clearing All Data](#clearing-all-data)
- [Command Reference](#command-reference)
- [Contributing](#contributing)
- [License](#license)

## Features

- **Add, Edit, and Delete Pages:** Create rich blog pages with images, descriptions, dates, and markdown-supported body content.
- **Export and Import JSON:** Easily backup your blog data or transfer it to another instance.
- **Command Autocomplete:** Utilize intuitive commands to streamline your blogging workflow.
- **Zoom and Sort:** Customize the view with zoom levels and sort your pages by date, name, or color.
- **Search Functionality:** Quickly find pages using the search bar with support for exact and partial matches.
- **Responsive Design:** Access and manage your blog from any device with a clean and responsive interface.

## Screenshots

### Home Page

![Home Page](./screenshots/home.png)  
*[INPUT SCREENSHOT HERE]*

### Add New Page Form

![Add Page Form](./screenshots/add-page-form.png)  
*[INPUT SCREENSHOT HERE]*

### Editing a Page

![Edit Page](./screenshots/edit-page.png)  
*[INPUT SCREENSHOT HERE]*

### Exporting JSON

![Export JSON](./screenshots/export-json.png)  
*[INPUT SCREENSHOT HERE]*

### Importing JSON

![Import JSON](./screenshots/import-json.png)  
*[INPUT SCREENSHOT HERE]*

### Command Autocomplete

![Command Autocomplete](./screenshots/command-autocomplete.png)  
*[INPUT SCREENSHOT HERE]*

### Zoom and Sort Controls

![Zoom and Sort](./screenshots/zoom-sort.png)  
*[INPUT SCREENSHOT HERE]*

## Getting Started

Follow these instructions to set up and run Make a Blog on your local machine.

### Prerequisites

- **Web Browser:** A modern web browser such as Chrome, Firefox, Edge, or Safari.
- **Text Editor:** (Optional) For modifying the code, use editors like VS Code, Sublime Text, or Atom.

### Installation

1. **Clone the Repository**

   ```bash
   git clone https://github.com/your-username/make-a-blog.git
   ```

2. **Navigate to the Project Directory**

   ```bash
   cd make-a-blog
   ```

3. **Open the Application**

   Simply open the `index.html` file in your preferred web browser.

   - **Option 1:** Double-click the `index.html` file.
   - **Option 2:** Use the command line:

     ```bash
     open index.html
     ```

     *(Replace `open` with `xdg-open` on Linux if necessary.)*

## Usage

### Adding a New Page

1. **Open the Add Page Form**

   Click on the **➕ Add New Page** button located in the control panel.

   ![Open Add Page Form](./screenshots/open-add-page-form.png)  
   *[INPUT SCREENSHOT HERE]*

2. **Fill in the Page Details**

   - **Picture URL:** Enter the URL of an image to associate with the page. If left blank, a random image will be assigned automatically.
   - **Background Color:** Choose a background color for the image container.
   - **Title:** Provide a title for your page.
   - **Description:** Enter a brief description.
   - **Date:** Input the date in `MM/DD/YYYY` format. Defaults to today's date if not specified.
   - **Body:** Write your content using Markdown syntax.

   ![Fill Page Details](./screenshots/fill-page-details.png)  
   *[INPUT SCREENSHOT HERE]*

3. **Save the Page**

   Click the **💾 Save Page** button to add the page to your blog.

   ![Save Page](./screenshots/save-page.png)  
   *[INPUT SCREENSHOT HERE]*

### Editing a Page

1. **Locate the Page**

   Find the page you wish to edit in the **Latest Grid**.

2. **Open the Edit Form**

   Click on the **✏️ Edit Page** button associated with the page.

   ![Edit Page Button](./screenshots/edit-page-button.png)  
   *[INPUT SCREENSHOT HERE]*

3. **Modify the Details**

   Update the desired fields in the form.

4. **Save Changes**

   Click the **💾 Save Page** button to apply the changes.

### Deleting a Page

1. **Locate the Page**

   Find the page you wish to delete in the **Latest Grid**.

2. **Delete the Page**

   Click on the **🗑️ Delete Page** button associated with the page.

   ![Delete Page Button](./screenshots/delete-page-button.png)  
   *[INPUT SCREENSHOT HERE]*

3. **Confirm Deletion**

   A confirmation prompt will appear. Click **OK** to proceed.

### Exporting Your Blog

1. **Click the Export Button**

   Click on the **📥 Export JSON** button in the control panel.

   ![Export JSON Button](./screenshots/export-json-button.png)  
   *[INPUT SCREENSHOT HERE]*

2. **Download the JSON File**

   A JSON file containing your blog data will be downloaded to your device.

   ![Export Successful](./screenshots/export-success.png)  
   *[INPUT SCREENSHOT HERE]*

### Importing Your Blog

1. **Click the Import Button**

   Click on the **📂 Load JSON** button in the control panel.

   ![Load JSON Button](./screenshots/load-json-button.png)  
   *[INPUT SCREENSHOT HERE]*

2. **Select the JSON File**

   Choose the previously exported JSON file from your device.

   ![Select JSON File](./screenshots/select-json-file.png)  
   *[INPUT SCREENSHOT HERE]*

3. **Import and View Your Blog**

   The application will load the data, and your pages will appear in the **Latest Grid**.

   ![Import Successful](./screenshots/import-success.png)  
   *[INPUT SCREENSHOT HERE]*

### Using Commands

Make a Blog supports various commands to enhance your blogging experience. To access commands, type `/` in the **Command Input** field.

1. **Open Command Input**

   Click on the **Command Input** field and type `/` to see available commands.

   ![Command Input](./screenshots/command-input.png)  
   *[INPUT SCREENSHOT HERE]*

2. **Select a Command**

   As you type, a suggestion box will appear. Use the arrow keys or mouse to select a command.

   ![Command Suggestions](./screenshots/command-suggestions.png)  
   *[INPUT SCREENSHOT HERE]*

3. **Execute the Command**

   Press **Enter** to execute the selected command.

### Zooming and Sorting

**Zooming:**

- Click the **🔍 Zoom** button to cycle through different zoom levels (75%, 100%, 125%, 150%).

  ![Zoom Button](./screenshots/zoom-button.png)  
  *[INPUT SCREENSHOT HERE]*

**Sorting:**

- Click the **🚫 Sort** button to cycle through sorting options:
  - **🚫 No Sorting**
  - **🗓️ Sort by Date**
  - **🔡 Sort by Name**
  - **🎨 Sort by Color**

  ![Sort Button](./screenshots/sort-button.png)  
  *[INPUT SCREENSHOT HERE]*

### Clearing All Data

1. **Click the Clear Button**

   Click on the **🧹 Clear All** button in the control panel.

   ![Clear Button](./screenshots/clear-button.png)  
   *[INPUT SCREENSHOT HERE]*

2. **Confirm Clearing**

   A confirmation prompt will appear. Click **OK** to remove all data from local storage.

## Command Reference

Make a Blog supports the following commands to streamline your blogging process. Access them by typing `/` in the **Command Input** field.

### `/createpost 'Your Title Here'`

**Description:** Creates a new blog post with the provided title.

**Example:**

```
/createpost 'My First Blog Post'
```

### `/generatepost 'Your Prompt Here'`

**Description:** Generates blog content based on the provided prompt using OpenAI's API.

**Example:**

```
/generatepost 'Write a blog post about the benefits of remote work.'
```

### `/saveapikey 'Your_API_Key_Here'`

**Description:** Registers your OpenAI API key for content generation.

**Example:**

```
/saveapikey 'sk-XXXXXXXXXXXXXXXXXXXXXXXXXXXX'
```

### `/clearapikey`

**Description:** Removes the currently registered OpenAI API key.

**Example:**

```
/clearapikey
```

## Contributing

Contributions are welcome! If you'd like to improve Make a Blog, please follow these steps:

1. **Fork the Repository**

   Click the **Fork** button at the top-right corner of the repository page.

2. **Clone Your Fork**

   ```bash
   git clone https://github.com/your-username/make-a-blog.git
   cd make-a-blog
   ```

3. **Create a New Branch**

   ```bash
   git checkout -b feature/YourFeatureName
   ```

4. **Make Your Changes**

   Implement your feature or bug fix.

5. **Commit Your Changes**

   ```bash
   git commit -m "Add feature: YourFeatureName"
   ```

6. **Push to Your Fork**

   ```bash
   git push origin feature/YourFeatureName
   ```

7. **Create a Pull Request**

   Go to your forked repository on GitHub and click **Compare & pull request**.

## License

This project is licensed under the [MIT License](./LICENSE).

---

*Made with ❤️ by [Your Name](https://github.com/your-username)*
