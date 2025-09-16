
# Procurement Dashboard Pro

An interactive, client-side dashboard to upload, normalize, and analyze multi-sheet procurement Excel workbooks. This tool features header auto-detection, data consolidation, dynamic filtering, key metrics, and visualizations—all running entirely in your browser with no backend required.

![Dashboard Screenshot](https://i.imgur.com/your-screenshot-url.png) <!-- It's a good idea to add a screenshot of your app here -->

## ✨ Key Features

- **Excel File Parsing**: Upload and process `.xlsx` and `.xls` files directly in the browser.
- **Multi-Sheet Consolidation**: Automatically combines data from all sheets in a workbook into a single dataset.
- **Smart Header Detection**: Intelligently finds the header row in each sheet, even if it's not the first row.
- **Synonym Mapping**: Maps various column names (e.g., "PO No", "Purchase Order") to a consistent, canonical schema.
- **Data Normalization**: Cleans and standardizes data, correctly parsing dates, currency, and numbers.
- **Interactive Dashboard**: A clean and responsive interface to explore your data.
- **Powerful Filtering & Search**: Filter by date range, marketer, and status. A dynamic search bar filters across all key fields in real-time.
- **At-a-Glance Metrics**: Key performance indicators (KPIs) are displayed in clear, concise cards.
- **Paginated & Sortable Table**: View grouped and aggregated data in a table with pagination and column sorting.
- **Data Visualization**: A bar chart visualizes PO counts by marketer for quick insights.
- **CSV Export**: Export the currently filtered and sorted view to a `.csv` file with one click.
- **100% Client-Side**: All processing is done in your browser. Your data remains private and is never sent to a server.

## 🚀 How to Use

Follow these simple steps to analyze your procurement data:

1.  **Upload File**:
    -   Navigate to the **Upload** page.
    -   Click the "Upload a file" button or drag and drop your Excel workbook into the designated area.

2.  **Preview Headers (Optional but Recommended)**:
    -   After selecting a file, click the **"Preview Headers"** button.
    -   This shows you which row the application identified as the header and how it will map the columns. This is useful for debugging files with unusual formatting.

3.  **Parse & Open Dashboard**:
    -   Click the **"Parse & Open Dashboard"** button.
    -   The application will process the file and automatically navigate you to the dashboard.

4.  **Interact with the Dashboard**:
    -   **Use Filters**: Set a start date, enter marketer names (separated by commas), or select a status to narrow down your data.
    -   **Search**: Use the search bar at the top to instantly find records across all fields.
    -   **Sort Table**: Click on any column header in the table to sort the data.
    -   **Toggle View**: Switch between the data table and the chart view using the icons in the top-right of the "Analysis" section.

5.  **Export Data**:
    -   Click the **"Export CSV"** button to download the current data view as a CSV file.

## 🛠️ Technical Stack

-   **Frontend**: React, TypeScript
-   **Styling**: Tailwind CSS
-   **Excel Parsing**: [SheetJS (xlsx)](https://sheetjs.com/)
-   **Charts**: [Chart.js](https://www.chartjs.org/)
-   **Routing**: React Router

## 🌐 Deployment on GitHub Pages (GUI Method)

You can host this application for free on GitHub Pages. Here’s how:

#### Step 1: Create a GitHub Repository

1.  Log in to your GitHub account.
2.  Click the `+` icon in the top-right corner and select **"New repository"**.
3.  Give it a name (e.g., `procurement-dashboard`).
4.  Select **"Public"** (GitHub Pages for free accounts requires a public repository).
5.  Click **"Create repository"**.

#### Step 2: Upload Project Files

1.  On your new repository's page, click the **"Add file"** button and then **"Upload files"**.
2.  Open your project folder on your computer. It should have the following structure:
    ```
    your-project-folder/
    ├── components/
    ├── pages/
    ├── services/
    ├── utils/
    ├── App.tsx
    ├── constants.ts
    ├── index.html
    ├── index.tsx
    ├── metadata.json
    └── types.ts
    ```
3.  Drag and drop all of these files and folders into the GitHub upload window.
4.  Wait for the files to finish uploading, then add a commit message (e.g., "Initial commit") and click **"Commit changes"**.

#### Step 3: Enable GitHub Pages

1.  In your repository, click on the **"Settings"** tab.
2.  In the left sidebar, click on **"Pages"**.
3.  Under the "Build and deployment" section, for the "Source", select **"Deploy from a branch"**.
4.  Set the "Branch" to **`main`** and the folder to **`/ (root)`**.
5.  Click **"Save"**.

#### Step 4: Access Your Live App

-   Wait a few minutes for GitHub to build and deploy your site.
-   A green banner will appear on the **Settings -> Pages** screen with your live URL. It will look like this:
    `https://YOUR_USERNAME.github.io/YOUR_REPOSITORY_NAME/`
-   Click the link to visit your live web application!

## ⚠️ Troubleshooting

-   **Parsing Errors**: If you see a "Failed to parse file" error, try re-saving your file as a fresh `.xlsx` in Microsoft Excel or Google Sheets. This often resolves issues with file corruption or unsupported legacy formats.
-   **No Data Found**: The app requires columns that can be mapped to **`poNumber`** and **`creationDate`**. If these are missing, rows will be skipped. Use the "Preview Headers" feature on the Upload page to ensure your key columns are being detected.
-   **Incorrect Header Detection**: The app scans the first 8 rows of each sheet to find the best header match. If your headers are located further down, the detection may fail. Please ensure headers are near the top of the sheet.

---

Crafted by Nofda Abrar
