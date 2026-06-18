# 🎓 University Expense Tracker

This is a simple, lightweight expense tracker built entirely with vanilla JavaScript, HTML, and CSS. I designed it to help university students manage their daily spending across different campus categories, set a budget, and look at their weekly spending habits without needing any external libraries or heavy frameworks.

---

### 🚀 Milestone 1 Submission Links
* **🌐 Live Website Link:** [https://nathannduati.github.io/student-finance-tracker/](https://nathannduati.github.io/student-finance-tracker/)
* **🎥 Video Walkthrough (Unlisted):** [https://youtu.be/WeNwLY2SP5c?si=ZrHeD1TqKcoVR8Su](https://youtu.be/WeNwLY2SP5c?si=ZrHeD1TqKcoVR8Su)

---

## 🛠️ Features Implemented & How It Works

### 1. State Management & Local Storage
* **File Structure:** I separated the code into clear modules to keep it organized (`state.js` handles data, `ui.js` handles updating the page, and `storage.js` handles saving).
* **Data Persistence:** Everything saves directly to `localStorage`. If you refresh the page or close your browser, your expenses and budget settings stay exactly as you left them.

### 2. Live Regex Search & Crash Prevention
* **Regular Expressions:** The search bar on the History tab uses active RegExp to filter through the table rows instantly as you type.
* **Error Handling (`try/catch`):** I wrapped the search logic in a `try/catch` block. If a user accidentally types an incomplete expression character (like a single backslash `\`), the app handles the error quietly behind the scenes instead of breaking or freezing the website.

### 3. Layout & Mobile Responsiveness
* **Semantic HTML:** I used accessible HTML5 structural tags like `<header>`, `<main>`, `<section>`, `<nav>`, and `<footer>` so screen readers can navigate the page cleanly.
* **CSS Flexbox & Grid:** The dashboard summary cards use Flexbox to shift cleanly into a vertical list on smaller screens. The 7-day trend chart uses native CSS to adjust the bar heights dynamically depending on your spending.

### 4. Data Export & Import
* **Backup System:** On the Settings page, you can click "Export Data to JSON" to download your local data as a text file. You can also use "Import Data JSON" to upload a configuration file (like the included `seed.json`), which parses, validates the structure, and instantly refreshes the UI.

---

## 📦 My Files
* `index.html` - The main user interface and navigation menu layout.
* `seed.json` - Sample file containing 10 mock campus expenses for testing.
* `wireframe.png` - The initial hand-drawn layout sketch mapping the application views.
* `scripts/app.js` - The main controller that bootstraps the application when it loads.
* `scripts/state.js` - Handles calculations and updates the array of expenses.
* `scripts/ui.js` - Controls switching tabs and rendering tables/charts dynamically.
* `scripts/search.js` - Processes the live search bar inputs safely.
* `scripts/storage.js` - Handles fetching and saving data to local storage.
* `styles/main.css` - Custom styling rules, variables, and responsive breakpoints.

---
*Student Finance Project Ecosystem — June 2026*