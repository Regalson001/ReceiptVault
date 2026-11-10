
// ==================================================
// RECEIPTVAULT — RECEIPT FINDER & EXPENSE MANAGER
// ==================================================

const STORAGE_KEY = "receiptvault_records_v1";

const CATEGORIES = [
  "Shopping",
  "Food",
  "Transport",
  "Bills",
  "Health",
  "Other"
];

const CATEGORY_ICONS = {
  Shopping: "🛍",
  Food: "☕",
  Transport: "🚕",
  Bills: "⚡",
  Health: "✚",
  Other: "▤"
};

const CATEGORY_COLORS = {
  Shopping: "#a78bfa",
  Food: "#ffad6a",
  Transport: "#6fb5ff",
  Bills: "#54d7a2",
  Health: "#f27fb0",
  Other: "#94a3b8"
};

const state = {
  receipts: loadReceipts(),
  activeReceiptId: null,
  editingId: null,
  selectedImage: "",
  currentView: "dashboard",
  currentCategory: "",
  search: "",
  categoryFilter: "",
  sort: "newest",
  toastTimer: null
};

// ==================================================
// DOM REFERENCES
// ==================================================

const $ = id => document.getElementById(id);

const ui = {
  sidebar: $("sidebar"),
  dashboardView: $("dashboardView"),
  receiptsView: $("receiptsView"),
  breadcrumbTitle: $("breadcrumbTitle"),
  todayLabel: $("todayLabel"),
  currentDate: $("currentDate"),

  totalExpenses: $("totalExpenses"),
  totalReceipts: $("totalReceipts"),
  averageExpense: $("averageExpense"),
  monthlyExpenses: $("monthlyExpenses"),

  recentReceipts: $("recentReceipts"),
  dashboardEmpty: $("dashboardEmpty"),
  categoryBreakdown: $("categoryBreakdown"),

  receiptGrid: $("receiptGrid"),
  listEmpty: $("listEmpty"),
  listTitle: $("listTitle"),
  receiptResultCount: $("receiptResultCount"),

  receiptSearch: $("receiptSearch"),
  categoryFilter: $("categoryFilter"),
  sortFilter: $("sortFilter"),

  receiptModal: $("receiptModal"),
  detailModal: $("detailModal"),
  receiptForm: $("receiptForm"),

  formTitle: $("formTitle"),
  merchant: $("merchant"),
  amount: $("amount"),
  purchaseDate: $("purchaseDate"),
  receiptCategory: $("receiptCategory"),
  paymentMethod: $("paymentMethod"),
  receiptNumber: $("receiptNumber"),
  receiptNotes: $("receiptNotes"),
  receiptImage: $("receiptImage"),
  imagePreview: $("imagePreview"),
  removeImage: $("removeImage"),
  receiptFavorite: $("receiptFavorite"),
  saveReceiptButton: $("saveReceiptButton"),

  detailTitle: $("detailTitle"),
  detailAmount: $("detailAmount"),
  detailDate: $("detailDate"),
  detailImageWrap: $("detailImageWrap"),
  detailImage: $("detailImage"),
  detailFields: $("detailFields"),
  detailFavorite: $("detailFavorite"),
  detailEdit: $("detailEdit"),
  detailDelete: $("detailDelete"),

  toast: $("toast")
};

// ==================================================
// STORAGE
// ==================================================

function loadReceipts() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));

    if (!Array.isArray(stored)) return [];

    return stored.filter(item =>
      item &&
      typeof item.id === "string" &&
      typeof item.merchant === "string" &&
      Number.isFinite(Number(item.amount))
    );
  } catch (error) {
    console.error("Could not load receipts:", error);
    return [];
  }
}

function saveReceipts() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.receipts));
    return true;
  } catch (error) {
    console.error("Storage error:", error);

    showToast(
      "Storage is full. Try using a smaller image or deleting old receipts."
    );

    return false;
  }
}

// ==================================================
// GENERAL HELPERS
// ==================================================

function createId() {
  if (window.crypto && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `receipt-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

function formatMoney(amount) {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(Number(amount) || 0);
}

function formatDate(date) {
  if (!date) return "Date unavailable";

  const parsed = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) return "Date unavailable";

  return parsed.toLocaleDateString("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

function todayString() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function getMonthKey(date) {
  return date ? date.slice(0, 7) : "";
}

function getCurrentMonthKey() {
  return todayString().slice(0, 7);
}

function getReceipt(id) {
  return state.receipts.find(receipt => receipt.id === id);
}

function showToast(message) {
  ui.toast.textContent = message;
  ui.toast.classList.add("show");

  clearTimeout(state.toastTimer);

  state.toastTimer = setTimeout(() => {
    ui.toast.classList.remove("show");
  }, 2800);
}

function categoryIcon(category) {
  return CATEGORY_ICONS[category] || CATEGORY_ICONS.Other;
}

function getSortedReceipts(receipts) {
  const result = [...receipts];

  switch (state.sort) {
    case "oldest":
      return result.sort((a, b) => a.date.localeCompare(b.date));

    case "highest":
      return result.sort((a, b) => b.amount - a.amount);

    case "lowest":
      return result.sort((a, b) => a.amount - b.amount);

    case "newest":
    default:
      return result.sort((a, b) => b.date.localeCompare(a.date));
  }
}

// ==================================================
// DASHBOARD STATISTICS
// ==================================================

function updateDashboard() {
  const receipts = state.receipts;

  const total = receipts.reduce(
    (sum, receipt) => sum + Number(receipt.amount),
    0
  );

  const count = receipts.length;
  const average = count ? total / count : 0;

  const monthTotal = receipts
    .filter(receipt => getMonthKey(receipt.date) === getCurrentMonthKey())
    .reduce((sum, receipt) => sum + Number(receipt.amount), 0);

  ui.totalExpenses.textContent = formatMoney(total);
  ui.totalReceipts.textContent = count.toLocaleString("en-KE");
  ui.averageExpense.textContent = formatMoney(average);
  ui.monthlyExpenses.textContent = formatMoney(monthTotal);

  renderRecentReceipts();
  renderCategoryBreakdown();
}

// ==================================================
// RECENT RECEIPTS
// ==================================================

function renderRecentReceipts() {
  const recent = getSortedReceipts(state.receipts).slice(0, 5);

  ui.dashboardEmpty.hidden = recent.length !== 0;

  ui.recentReceipts.innerHTML = recent.map(receipt => `
    <div class="receipt-row" data-open-receipt="${escapeHTML(receipt.id)}">
      <div class="receipt-symbol">
        ${categoryIcon(receipt.category)}
      </div>

      <div class="receipt-row-main">
        <div class="receipt-name">${escapeHTML(receipt.merchant)}</div>
        <div class="receipt-meta">
          <span>${escapeHTML(receipt.category)}</span>
          <span>•</span>
          <span>${formatDate(receipt.date)}</span>
        </div>
      </div>

      <div class="receipt-row-amount">
        ${formatMoney(receipt.amount)}
      </div>
    </div>
  `).join("");
}

// ==================================================
// CATEGORY SPENDING BREAKDOWN
// ==================================================

function renderCategoryBreakdown() {
  const totals = {};

  state.receipts.forEach(receipt => {
    const category = receipt.category || "Other";
    totals[category] = (totals[category] || 0) + Number(receipt.amount);
  });

  const entries = Object.entries(totals)
    .sort((a, b) => b[1] - a[1]);

  const overall = entries.reduce((sum, item) => sum + item[1], 0);

  if (!entries.length || overall === 0) {
    ui.categoryBreakdown.innerHTML = `
      <p class="no-breakdown">Your category breakdown will appear here after you add receipts.</p>
    `;
    return;
  }

  ui.categoryBreakdown.innerHTML = entries.map(([category, amount]) => {
    const percentage = (amount / overall) * 100;
    const color = CATEGORY_COLORS[category] || CATEGORY_COLORS.Other;

    return `
      <div class="breakdown-item">
        <div class="breakdown-top">
          <span>${categoryIcon(category)} ${escapeHTML(category)}</span>
          <span>${formatMoney(amount)} · ${percentage.toFixed(1)}%</span>
        </div>
        <div class="progress-track">
          <div class="progress-fill"
            style="width:${percentage}%;background:${color}">
          </div>
        </div>
      </div>
    `;
  }).join("");
}

// ==================================================
// RECEIPT CARDS
// ==================================================

function renderReceiptCards(receipts) {
  ui.receiptGrid.innerHTML = receipts.map(receipt => `
    <article class="receipt-card"
      data-open-receipt="${escapeHTML(receipt.id)}">

      <div class="card-top">
        <div class="card-merchant">
          <span class="receipt-symbol">${categoryIcon(receipt.category)}</span>
          <strong>${escapeHTML(receipt.merchant)}</strong>
        </div>
        ${receipt.favorite ? '<span class="favorite-mark" title="Favorite">♥</span>' : ""}
      </div>

      <div class="card-amount">${formatMoney(receipt.amount)}</div>

      <div class="card-details">
        <span class="category-badge">${escapeHTML(receipt.category)}</span>
        <span class="card-date">${formatDate(receipt.date)}</span>
      </div>
    </article>
  `).join("");
}

// ==================================================
// SEARCH, FILTER AND SORT
// ==================================================

function getFilteredReceipts() {
  let receipts = [...state.receipts];

  if (state.currentView === "favorites") {
    receipts = receipts.filter(receipt => receipt.favorite);
  }

  if (state.currentCategory) {
    receipts = receipts.filter(
      receipt => receipt.category === state.currentCategory
    );
  }

  if (state.categoryFilter) {
    receipts = receipts.filter(
      receipt => receipt.category === state.categoryFilter
    );
  }

  const query = state.search.toLowerCase().trim();

  if (query) {
    receipts = receipts.filter(receipt => {
      const searchable = [
        receipt.merchant,
        receipt.number,
        receipt.category,
        receipt.payment,
        receipt.notes,
        receipt.date,
        receipt.amount
      ].join(" ").toLowerCase();

      return searchable.includes(query);
    });
  }

  return getSortedReceipts(receipts);
}

function renderReceiptList() {
  const receipts = getFilteredReceipts();

  renderReceiptCards(receipts);

  ui.receiptResultCount.textContent =
    `${receipts.length} ${receipts.length === 1 ? "receipt" : "receipts"}`;

  ui.listEmpty.hidden = receipts.length !== 0;
}

function clearFilters() {
  state.search = "";
  state.categoryFilter = "";
  state.currentCategory = "";

  ui.receiptSearch.value = "";
  ui.categoryFilter.value = "";

  document.querySelectorAll("[data-category]").forEach(button => {
    button.classList.remove("active");
  });

  renderReceiptList();
}

// ==================================================
// NAVIGATION
// ==================================================

function setView(view) {
  state.currentView = view;
  state.currentCategory = "";

  ui.dashboardView.hidden = view !== "dashboard";
  ui.receiptsView.hidden = view === "dashboard";

  const titles = {
    dashboard: "Dashboard",
    receipts: "All receipts",
    favorites: "Favorites"
  };

  ui.breadcrumbTitle.textContent = titles[view] || "Dashboard";

  ui.listTitle.textContent =
    view === "favorites" ? "Favorite receipts" : "All receipts";

  document.querySelectorAll(".side-link[data-view]").forEach(button => {
    button.classList.toggle("active", button.dataset.view === view);
  });

  document.querySelectorAll(".side-link[data-category]").forEach(button => {
    button.classList.remove("active");
  });

  ui.sidebar.classList.remove("open");

  if (view !== "dashboard") {
    renderReceiptList();
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showCategory(category) {
  state.currentCategory = category;
  state.currentView = "receipts";
  state.search = "";
  state.categoryFilter = "";

  ui.receiptSearch.value = "";
  ui.categoryFilter.value = "";

  ui.dashboardView.hidden = true;
  ui.receiptsView.hidden = false;

  ui.breadcrumbTitle.textContent = category;
  ui.listTitle.textContent = `${category} receipts`;

  document.querySelectorAll(".side-link").forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.category === category
    );
  });

  renderReceiptList();
  ui.sidebar.classList.remove("open");
}

// ==================================================
// ADD / EDIT FORM
// ==================================================

function resetImagePreview() {
  ui.imagePreview.src = "";
  ui.imagePreview.hidden = true;
  ui.removeImage.hidden = true;
}

function openFormModal(receipt = null) {
  ui.receiptForm.reset();

  state.editingId = receipt ? receipt.id : null;
  state.selectedImage = receipt?.image || "";

  ui.formTitle.textContent = receipt
    ? "Edit receipt"
    : "Add a new receipt";

  ui.saveReceiptButton.textContent = receipt
    ? "Update receipt"
    : "Save receipt";

  ui.purchaseDate.value = receipt?.date || todayString();
  ui.merchant.value = receipt?.merchant || "";
  ui.amount.value = receipt?.amount ?? "";
  ui.receiptCategory.value = receipt?.category || "";
  ui.paymentMethod.value = receipt?.payment || "M-Pesa";
  ui.receiptNumber.value = receipt?.number || "";
  ui.receiptNotes.value = receipt?.notes || "";
  ui.receiptFavorite.checked = Boolean(receipt?.favorite);

  resetImagePreview();

  if (state.selectedImage) {
    ui.imagePreview.src = state.selectedImage;
    ui.imagePreview.hidden = false;
    ui.removeImage.hidden = false;
  }

  ui.receiptModal.hidden = false;
  document.body.style.overflow = "hidden";

  setTimeout(() => ui.merchant.focus(), 50);
}

function closeFormModal() {
  ui.receiptModal.hidden = true;
  document.body.style.overflow = "";
  state.editingId = null;
  state.selectedImage = "";
}

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Could not read this image."));

    reader.readAsDataURL(file);
  });
}

// Resize and compress uploaded images to reduce local storage usage.
async function compressImage(file) {
  const dataURL = await readFileAsDataURL(file);

  const image = new Image();

  await new Promise((resolve, reject) => {
    image.onload = resolve;
    image.onerror = () => reject(new Error("Invalid image file."));
    image.src = dataURL;
  });

  const maxDimension = 1200;
  const scale = Math.min(
    1,
    maxDimension / Math.max(image.width, image.height)
  );

  const canvas = document.createElement("canvas");

  canvas.width = Math.max(1, Math.round(image.width * scale));
  canvas.height = Math.max(1, Math.round(image.height * scale));

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Image processing is not supported by this browser.");
  }

  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  return canvas.toDataURL("image/jpeg", 0.72);
}

// ==================================================
// IMAGE UPLOAD
// ==================================================

ui.receiptImage.addEventListener("change", async () => {
  const file = ui.receiptImage.files[0];

  if (!file) return;

  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

  if (!allowedTypes.includes(file.type)) {
    showToast("Please choose a JPG, PNG or WebP image.");
    ui.receiptImage.value = "";
    return;
  }

  if (file.size > 8 * 1024 * 1024) {
    showToast("Image is too large. Choose an image under 8 MB.");
    ui.receiptImage.value = "";
    return;
  }

  try {
    showToast("Processing your receipt image...");

    const compressed = await compressImage(file);

    state.selectedImage = compressed;
    ui.imagePreview.src = compressed;
    ui.imagePreview.hidden = false;
    ui.removeImage.hidden = false;

    showToast("Receipt image added successfully.");

  } catch (error) {
    showToast(error.message);
  }
});

ui.removeImage.addEventListener("click", event => {
  event.preventDefault();
  event.stopPropagation();

  state.selectedImage = "";
  ui.receiptImage.value = "";
  resetImagePreview();

  showToast("Receipt image removed.");
});

// ==================================================
// SAVE RECEIPT
// ==================================================

ui.receiptForm.addEventListener("submit", event => {
  event.preventDefault();

  const merchant = ui.merchant.value.trim();
  const amount = Number(ui.amount.value);
  const date = ui.purchaseDate.value;
  const category = ui.receiptCategory.value;

  if (!merchant || !date || !category || !Number.isFinite(amount) || amount <= 0) {
    showToast("Please complete all required fields correctly.");
    return;
  }

  if (date > todayString()) {
    showToast("Purchase date cannot be in the future.");
    return;
  }

  const previous = state.editingId
    ? getReceipt(state.editingId)
    : null;

  const receipt = {
    id: state.editingId || createId(),
    merchant,
    amount,
    date,
    category,
    payment: ui.paymentMethod.value,
    number: ui.receiptNumber.value.trim(),
    notes: ui.receiptNotes.value.trim(),
    image: state.selectedImage,
    favorite: ui.receiptFavorite.checked,
    createdAt: previous?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const previousReceipts = [...state.receipts];

  if (state.editingId) {
    state.receipts = state.receipts.map(item =>
      item.id === state.editingId ? receipt : item
    );
  } else {
    state.receipts.unshift(receipt);
  }

  if (!saveReceipts()) {
    state.receipts = previousReceipts;
    return;
  }

  closeFormModal();
  refreshApp();

  showToast(
    previous
      ? "Receipt updated successfully."
      : "Receipt saved successfully."
  );
});

// ==================================================
// RECEIPT DETAILS
// ==================================================

function openDetails(id) {
  const receipt = getReceipt(id);

  if (!receipt) return;

  state.activeReceiptId = id;

  ui.detailTitle.textContent = receipt.merchant;
  ui.detailAmount.textContent = formatMoney(receipt.amount);
  ui.detailDate.textContent = formatDate(receipt.date);

  ui.detailImageWrap.hidden = !receipt.image;

  if (receipt.image) {
    ui.detailImage.src = receipt.image;
  } else {
    ui.detailImage.removeAttribute("src");
  }

  const fields = [
    ["Category", receipt.category],
    ["Payment method", receipt.payment || "Not specified"],
    ["Receipt number", receipt.number || "Not provided"],
    ["Purchase date", formatDate(receipt.date)],
    ["Notes", receipt.notes || "No notes added"]
  ];

  ui.detailFields.innerHTML = fields.map(([label, value]) => `
    <div class="detail-field">
      <span>${escapeHTML(label)}</span>
      <strong>${escapeHTML(value)}</strong>
    </div>
  `).join("");

  updateDetailFavoriteButton();

  ui.detailModal.hidden = false;
  document.body.style.overflow = "hidden";
}

function closeDetails() {
  ui.detailModal.hidden = true;
  document.body.style.overflow = "";
  state.activeReceiptId = null;
}

function updateDetailFavoriteButton() {
  const receipt = getReceipt(state.activeReceiptId);

  if (!receipt) return;

  ui.detailFavorite.textContent = receipt.favorite
    ? "♥ Remove favorite"
    : "♡ Add favorite";
}

// ==================================================
// FAVORITES
// ==================================================

function toggleFavorite(id) {
  const receipt = getReceipt(id);

  if (!receipt) return;

  const previous = receipt.favorite;
  receipt.favorite = !receipt.favorite;
  receipt.updatedAt = new Date().toISOString();

  if (!saveReceipts()) {
    receipt.favorite = previous;
    return;
  }

  updateDashboard();

  if (state.currentView !== "dashboard") {
    renderReceiptList();
  }

  if (state.activeReceiptId === id) {
    updateDetailFavoriteButton();
  }

  showToast(
    receipt.favorite
      ? "Added to favorites."
      : "Removed from favorites."
  );
}

// ==================================================
// DELETE RECEIPT
// ==================================================

function deleteReceipt(id) {
  const receipt = getReceipt(id);

  if (!receipt) return;

  const confirmed = window.confirm(
    `Delete the receipt from ${receipt.merchant}? This cannot be undone.`
  );

  if (!confirmed) return;

  const previousReceipts = [...state.receipts];

  state.receipts = state.receipts.filter(item => item.id !== id);

  if (!saveReceipts()) {
    state.receipts = previousReceipts;
    return;
  }

  closeDetails();
  refreshApp();

  showToast("Receipt deleted.");
}

// ==================================================
// CSV EXPORT
// ==================================================

function exportCSV() {
  if (!state.receipts.length) {
    showToast("There are no receipts to export yet.");
    return;
  }

  const headers = [
    "Merchant",
    "Amount (KES)",
    "Purchase Date",
    "Category",
    "Payment Method",
    "Receipt Number",
    "Notes",
    "Favorite"
  ];

  const rows = state.receipts.map(receipt => [
    receipt.merchant,
    receipt.amount,
    receipt.date,
    receipt.category,
    receipt.payment,
    receipt.number,
    receipt.notes,
    receipt.favorite ? "Yes" : "No"
  ]);

  const csv = [headers, ...rows]
    .map(row => row.map(value => {
      // Prevent spreadsheet formula injection from text fields.
      let text = String(value ?? "");

      if (/^[\s]*[=+\-@]/.test(text)) {
        text = "'" + text;
      }

      return `"${text.replace(/"/g, '""')}"`;
    }).join(","))
    .join("\r\n");

  const blob = new Blob(["\uFEFF" + csv], {
    type: "text/csv;charset=utf-8;"
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `receiptvault-export-${todayString()}.csv`;

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);

  showToast("Your CSV export is ready.");
}

// ==================================================
// REFRESH APP
// ==================================================

function refreshApp() {
  updateDashboard();

  if (state.currentView !== "dashboard") {
    renderReceiptList();
  }
}

// ==================================================
// EVENT LISTENERS
// ==================================================

$("addReceiptButton").addEventListener("click", () => openFormModal());
$("sidebarAddButton").addEventListener("click", () => openFormModal());
$("listAddButton").addEventListener("click", () => openFormModal());
$("tipAddButton").addEventListener("click", () => openFormModal());
$("emptyAddButton").addEventListener("click", () => openFormModal());

$("closeFormModal").addEventListener("click", closeFormModal);
$("cancelForm").addEventListener("click", closeFormModal);

$("closeDetailModal").addEventListener("click", closeDetails);

ui.receiptModal.addEventListener("click", event => {
  if (event.target === ui.receiptModal) closeFormModal();
});

ui.detailModal.addEventListener("click", event => {
  if (event.target === ui.detailModal) closeDetails();
});

$("viewAllButton").addEventListener("click", () => {
  state.search = "";
  state.categoryFilter = "";
  state.currentCategory = "";

  ui.receiptSearch.value = "";
  ui.categoryFilter.value = "";

  setView("receipts");
});

$("exportButton").addEventListener("click", exportCSV);

$("mobileMenu").addEventListener("click", () => {
  ui.sidebar.classList.toggle("open");
});

document.querySelectorAll(".side-link[data-view]").forEach(button => {
  button.addEventListener("click", () => {
    setView(button.dataset.view);
  });
});

document.querySelectorAll(".side-link[data-category]").forEach(button => {
  button.addEventListener("click", () => {
    showCategory(button.dataset.category);
  });
});

ui.receiptSearch.addEventListener("input", event => {
  state.search = event.target.value;
  renderReceiptList();
});

ui.categoryFilter.addEventListener("change", event => {
  state.categoryFilter = event.target.value;
  state.currentCategory = "";
  renderReceiptList();
});

ui.sortFilter.addEventListener("change", event => {
  state.sort = event.target.value;
  renderReceiptList();
});

$("clearFilters").addEventListener("click", clearFilters);
$("clearEmptyFilters").addEventListener("click", clearFilters);

ui.recentReceipts.addEventListener("click", event => {
  const row = event.target.closest("[data-open-receipt]");
  if (row) openDetails(row.dataset.openReceipt);
});

ui.receiptGrid.addEventListener("click", event => {
  const card = event.target.closest("[data-open-receipt]");
  if (card) openDetails(card.dataset.openReceipt);
});

ui.detailFavorite.addEventListener("click", () => {
  if (state.activeReceiptId) {
    toggleFavorite(state.activeReceiptId);
  }
});

ui.detailEdit.addEventListener("click", () => {
  const receipt = getReceipt(state.activeReceiptId);

  if (!receipt) return;

  closeDetails();
  openFormModal(receipt);
});

ui.detailDelete.addEventListener("click", () => {
  if (state.activeReceiptId) {
    deleteReceipt(state.activeReceiptId);
  }
});

// Keyboard shortcuts
document.addEventListener("keydown", event => {
  const isTyping = ["INPUT", "TEXTAREA", "SELECT"].includes(
    document.activeElement?.tagName
  );

  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    setView("receipts");
    ui.receiptSearch.focus();
  }

  if (event.key === "Escape") {
    if (!ui.detailModal.hidden) closeDetails();
    if (!ui.receiptModal.hidden) closeFormModal();
    ui.sidebar.classList.remove("open");
  }

  if (
    (event.ctrlKey || event.metaKey) &&
    event.key.toLowerCase() === "n" &&
    !isTyping
  ) {
    event.preventDefault();
    openFormModal();
  }
});

// ==================================================
// INITIALIZE
// ==================================================

function initializeApp() {
  const now = new Date();

  ui.todayLabel.textContent = now.toLocaleDateString("en-KE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  ui.currentDate.textContent = now.toLocaleDateString("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });

  $("footerYear").textContent = now.getFullYear();

  updateDashboard();
  setView("dashboard");
}

initializeApp();
