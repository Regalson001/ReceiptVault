# ReceiptVault — Modern Receipt Finder & Expense Manager

ReceiptVault is a modern, responsive receipt management application designed to help users organize transaction records, track expenses, upload receipt images, and quickly find saved purchases.

Built using HTML5, CSS3 and Vanilla JavaScript, the application provides a clean dashboard, searchable receipt collection, spending summaries and local browser storage.

## ✨ Features

- **Receipt Management:** Add, view, edit and delete receipt records.
- **Image Uploads:** Attach receipt photos and scanned images.
- **Smart Search:** Search by merchant, receipt number, transaction details, category and notes.
- **Category Organization:** Organize receipts into Shopping, Food, Transport, Bills, Health and Other.
- **Expense Dashboard:** View total expenses, receipt count, average spending and monthly expenses.
- **Spending Breakdown:** Visualize expenses by category.
- **Favorites:** Save important receipts for quick access.
- **Sorting & Filtering:** Sort by date or amount and filter by category.
- **CSV Export:** Download receipt records for spreadsheets and reporting.
- **Persistent Storage:** Keep receipt records in browser localStorage.
- **Responsive Interface:** Designed for desktop, tablet and mobile devices.

## 🛠️ Technologies

| Technology | Purpose |
|---|---|
| HTML5 | Application structure |
| CSS3 | Responsive styling and interface design |
| JavaScript ES6+ | Application functionality and state management |
| LocalStorage | Browser-based data persistence |
| FileReader API | Receipt image processing |
| Canvas API | Image resizing and compression |
| Blob API | CSV export generation |

## 📂 Project Structure

```text
receipt-vault/
│
├── index.html
├── style.css
├── script.js
└── README.md
```

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Regalson001/receipt-vault.git
```

### 2. Open the project

```bash
cd receipt-vault
```

### 3. Launch the application

Open `index.html` in your browser or use the VS Code Live Server extension.

No package installation or build process is required.

## 📖 How to Use

1. Open ReceiptVault in your browser.
2. Select **Add receipt**.
3. Enter the merchant, transaction amount, purchase date and category.
4. Add a receipt number, payment method or notes if available.
5. Upload an image of the receipt.
6. Save the record.
7. Use the search and filtering tools to find receipts.
8. Export your records as CSV when needed.

## 💾 Data Storage & Privacy

ReceiptVault uses browser localStorage to store receipt records and compressed receipt images.

- Records remain available after refreshing the page in the same browser.
- Data is not automatically synchronized between devices.
- Clearing browser storage can remove saved receipts.
- Uploaded receipt images are stored locally in the browser.
- Export your records regularly to keep an external copy.

## 🔒 Current Limitations

This is a front-end portfolio project. It does not currently include:

- Automatic receipt text extraction (OCR).
- Cloud storage or account synchronization.
- User authentication.
- Online database integration.
- Automated bank or payment provider connections.

## 🧠 Skills Demonstrated

- Front-end application architecture.
- Responsive web interface development.
- DOM manipulation and event handling.
- JavaScript state management.
- CRUD operations.
- Search, filtering and sorting algorithms.
- Browser storage management.
- Image processing with JavaScript.
- CSV generation and file downloads.
- Form validation and user experience design.

## 🔮 Future Improvements

- OCR-powered receipt scanning.
- Cloud database integration.
- User authentication and account management.
- Monthly and yearly spending analytics.
- PDF receipt reports.
- Advanced expense charts.
- Multi-currency support.
- Data backup and restoration.

## 👨‍💻 Developer

**Stephen Oyugi**

Front-End Developer | AI Automation Engineer | Machine Learning Practitioner

- GitHub: [Regalson001](https://github.com/Regalson001)
- LinkedIn: [Stephen Oyugi](https://linkedin.com/in/stephenoyugi001)

## 📄 License

This project is available for learning and portfolio demonstration. Add an MIT `LICENSE` file if you intend to distribute it under the MIT License.

---

**ReceiptVault — Every receipt. One organized place.**
