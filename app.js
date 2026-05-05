const STORAGE_KEY = "antenaeum_reading_desk_v1";

const SHELVES = {
  law: "Law",
  economic: "Economic",
  philosophy: "Philosophy",
  "book-summaries": "Book Summaries"
};

const starterDoc = {
  id: "starter",
  title: "Antenaeum Reading Desk",
  author: "Personal Knowledge Library",
  shelf: "book-summaries",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  html: `
    <h2>A Better Way To Keep Words</h2>
    <p>Antenaeum is a quiet reading desk for saving the words and passages that matter. Select a word, save it, and it stays connected to the text where you found it.</p>
    <p>The point is not to interrupt reading. The point is to let small discoveries become a personal library: vocabulary, quotes, highlights, and notes in one place.</p>
    <blockquote>When a word keeps its source, memory has somewhere to return.</blockquote>
    <p>Try selecting the word precision, or select this whole sentence to save it as a quote.</p>
  `.trim()
};

let state = loadState();
let activeView = "reader";
let activeShelf = "book-summaries";
let selectionSnapshot = null;
let editorMode = "edit";
let saveTimer = null;

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

const els = {
  app: $("#app"),
  docList: $("#docList"),
  reader: $("#reader"),
  docTitle: $("#docTitle"),
  docAuthor: $("#docAuthor"),
  searchInput: $("#searchInput"),
  selectionPopover: $("#selectionPopover"),
  libraryCount: $("#libraryCount"),
  wordCount: $("#wordCount"),
  quoteCount: $("#quoteCount"),
  highlightCount: $("#highlightCount"),
  recentWords: $("#recentWords"),
  lastCapture: $("#lastCapture"),
  wordsGrid: $("#wordsGrid"),
  quotesGrid: $("#quotesGrid"),
  highlightsGrid: $("#highlightsGrid"),
  editorDialog: $("#editorDialog"),
  dialogTitle: $("#dialogTitle"),
  docTitleInput: $("#docTitleInput"),
  docAuthorInput: $("#docAuthorInput"),
  docShelfInput: $("#docShelfInput"),
  docEditor: $("#docEditor"),
  deleteDocBtn: $("#deleteDocBtn"),
  importFile: $("#importFile"),
  toast: $("#toast")
};

init();

function init() {
  ensureStarterState();
  setActiveDocument(state.activeDocId || state.docs[0].id, false);
  bindEvents();
  renderAll();
}

function ensureStarterState() {
  if (!Array.isArray(state.docs) || state.docs.length === 0) {
    state.docs = [starterDoc];
    state.activeDocId = starterDoc.id;
  }
  state.docs.forEach((doc) => {
    if (!doc.shelf || !SHELVES[doc.shelf]) doc.shelf = "book-summaries";
  });
  state.words = Array.isArray(state.words) ? state.words : [];
  state.quotes = Array.isArray(state.quotes) ? state.quotes : [];
  state.highlights = Array.isArray(state.highlights) ? state.highlights : [];
  state.settings = { highlightColor: "gold", ...(state.settings || {}) };
  activeShelf = state.activeShelf && SHELVES[state.activeShelf] ? state.activeShelf : "book-summaries";
  state.activeShelf = activeShelf;
}

function loadState() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (stored && typeof stored === "object") return stored;
  } catch (error) {
    return {};
  }
  return {};
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function bindEvents() {
  const toggleRail = () => {
    els.app.classList.toggle("rail-closed");
  };
  $("#toggleRailBtn").addEventListener("click", toggleRail);
  $("#reopenRailBtn").addEventListener("click", toggleRail);

  $$(".menu-item").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.dataset.shelf) setShelf(button.dataset.shelf);
      if (button.dataset.view) setView(button.dataset.view);
    });
  });

  $$("[data-jump]").forEach((button) => {
    button.addEventListener("click", () => setView(button.dataset.jump));
  });

  $("#newDocBtn").addEventListener("click", () => openEditor("new"));
  $("#editDocBtn").addEventListener("click", () => openEditor("edit"));
  $("#quickSaveBtn").addEventListener("click", saveCurrentSelection);
  $("#exportBtn").addEventListener("click", exportLibrary);
  $("#importBtn").addEventListener("click", () => els.importFile.click());
  els.importFile.addEventListener("change", importLibrary);
  $("#copyWordsBtn").addEventListener("click", () => copyCollection("words"));
  $("#copyQuotesBtn").addEventListener("click", () => copyCollection("quotes"));
  $("#clearHighlightsBtn").addEventListener("click", clearHighlights);

  els.searchInput.addEventListener("input", renderCollections);

  els.reader.addEventListener("input", scheduleReaderSave);
  els.reader.addEventListener("mouseup", () => scheduleSelectionPopover(70));
  els.reader.addEventListener("keyup", () => scheduleSelectionPopover(70));
  els.reader.addEventListener("touchend", () => scheduleSelectionPopover(240));
  document.addEventListener("selectionchange", () => scheduleSelectionPopover(150));
  document.addEventListener("pointerdown", handlePointerDown, true);

  els.selectionPopover.addEventListener("mousedown", (event) => event.preventDefault());
  els.selectionPopover.addEventListener("click", handleSelectionAction);

  $$(".swatch").forEach((button) => {
    button.addEventListener("click", () => {
      state.settings.highlightColor = button.dataset.color;
      persist();
      renderSwatches();
    });
  });

  $("#closeDialogBtn").addEventListener("click", closeEditor);
  $("#cancelDialogBtn").addEventListener("click", closeEditor);
  $("#saveDocBtn").addEventListener("click", saveEditorDocument);
  els.deleteDocBtn.addEventListener("click", deleteActiveDocument);

  $$(".format-bar button").forEach((button) => {
    button.addEventListener("click", () => {
      els.docEditor.focus();
      document.execCommand(button.dataset.format, false, button.dataset.value || null);
    });
  });

  els.wordsGrid.addEventListener("input", handleWordNoteInput);
  els.wordsGrid.addEventListener("click", handleWordCardClick);
  els.quotesGrid.addEventListener("click", handleQuoteCardClick);
  els.highlightsGrid.addEventListener("click", handleHighlightCardClick);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") hideSelectionPopover();
  });
}

function renderAll() {
  updateMenuState();
  renderDocumentList();
  renderReaderHeader();
  renderSwatches();
  renderCounts();
  renderRecentWords();
  renderLastCapture();
  renderCollections();
}

function activeDocument() {
  return state.docs.find((doc) => doc.id === state.activeDocId) || state.docs[0];
}

function setActiveDocument(id, rerender = true) {
  const doc = state.docs.find((item) => item.id === id) || state.docs[0];
  state.activeDocId = doc.id;
  activeShelf = doc.shelf || activeShelf;
  state.activeShelf = activeShelf;
  els.reader.innerHTML = doc.html || "";
  persist();
  if (rerender) renderAll();
}

function setView(view) {
  activeView = view;
  updateMenuState();
  $$("[data-panel]").forEach((panel) => {
    panel.classList.toggle("active", panel.dataset.panel === view);
  });
  hideSelectionPopover();
  renderCollections();
}

function setShelf(shelf) {
  if (!SHELVES[shelf]) return;
  activeShelf = shelf;
  state.activeShelf = shelf;
  activeView = "reader";

  const matchingDocs = state.docs.filter((doc) => doc.shelf === shelf);
  const activeDoc = activeDocument();
  if (matchingDocs.length && activeDoc.shelf !== shelf) {
    state.activeDocId = matchingDocs[0].id;
    els.reader.innerHTML = matchingDocs[0].html || "";
  }

  persist();
  $$("[data-panel]").forEach((panel) => {
    panel.classList.toggle("active", panel.dataset.panel === "reader");
  });
  hideSelectionPopover();
  renderAll();
}

function updateMenuState() {
  $$(".menu-item").forEach((button) => {
    const isShelfActive = activeView === "reader" && button.dataset.shelf === activeShelf;
    const isViewActive = button.dataset.view === activeView;
    button.classList.toggle("active", isShelfActive || isViewActive);
  });
}

function renderDocumentList() {
  els.docList.innerHTML = "";
  const visibleDocs = state.docs.filter((doc) => doc.shelf === activeShelf);
  if (!visibleDocs.length) {
    els.docList.innerHTML = `<div class="empty-state rail-empty">No ${SHELVES[activeShelf]} texts yet.</div>`;
    return;
  }

  visibleDocs.forEach((doc) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `doc-tab${doc.id === state.activeDocId ? " active" : ""}`;
    button.innerHTML = `
      <strong>${escapeHTML(doc.title || "Untitled")}</strong>
      <span>${escapeHTML(doc.author || "Unknown author")}</span>
      <em>${escapeHTML(SHELVES[doc.shelf] || "Text")}</em>
    `;
    button.addEventListener("click", () => setActiveDocument(doc.id));
    els.docList.appendChild(button);
  });
}

function renderReaderHeader() {
  const doc = activeDocument();
  els.docTitle.textContent = doc.title || "Untitled";
  els.docAuthor.textContent = `${SHELVES[doc.shelf] || "Reading Desk"} | ${doc.author || "Unknown author"} | ${formatDate(doc.updatedAt || doc.createdAt)}`;
}

function renderSwatches() {
  $$(".swatch").forEach((button) => {
    button.classList.toggle("active", button.dataset.color === state.settings.highlightColor);
  });
}

function renderCounts() {
  const total = state.words.length + state.quotes.length + state.highlights.length;
  els.libraryCount.textContent = `${total} saved`;
  els.wordCount.textContent = state.words.length;
  els.quoteCount.textContent = state.quotes.length;
  els.highlightCount.textContent = state.highlights.length;
}

function renderRecentWords() {
  els.recentWords.innerHTML = "";
  if (!state.words.length) {
    els.recentWords.innerHTML = `<div class="empty-state">No saved words yet.</div>`;
    return;
  }
  state.words.slice(0, 5).forEach((word) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "mini-card";
    button.innerHTML = `
      <strong>${escapeHTML(word.text)}</strong>
      <span>${escapeHTML(word.sourceTitle || "Unknown source")}</span>
    `;
    button.addEventListener("click", () => {
      setView("words");
      els.searchInput.value = word.text;
      renderCollections();
    });
    els.recentWords.appendChild(button);
  });
}

function renderCollections() {
  renderWords();
  renderQuotes();
  renderHighlights();
}

function scheduleReaderSave() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(saveReaderDocument, 260);
}

function saveReaderDocument() {
  const doc = activeDocument();
  if (!doc) return;
  doc.html = sanitizeHTML(els.reader.innerHTML);
  doc.updatedAt = new Date().toISOString();
  persist();
  renderReaderHeader();
  renderDocumentList();
}

function sanitizeHTML(html) {
  const template = document.createElement("template");
  template.innerHTML = html || "";
  $$("script, style, iframe, object, embed", template.content).forEach((node) => node.remove());
  $$("*", template.content).forEach((node) => {
    [...node.attributes].forEach((attr) => {
      if (/^on/i.test(attr.name)) node.removeAttribute(attr.name);
    });
  });
  return template.innerHTML.trim();
}

function getSelectionData() {
  const selection = window.getSelection();
  if (!selection || !selection.rangeCount || selection.isCollapsed) return null;
  const text = clean(selection.toString());
  if (!text) return null;

  const anchor = parentElement(selection.anchorNode);
  const focus = parentElement(selection.focusNode);
  if (!anchor || !focus || (!els.reader.contains(anchor) && !els.reader.contains(focus))) return null;

  const range = selection.getRangeAt(0);
  const rects = Array.from(range.getClientRects()).filter((rect) => rect.width > 0 && rect.height > 0);
  const rect = rects[0] || range.getBoundingClientRect();
  if (!rect || (!rect.width && !rect.height)) return null;

  return {
    text,
    range: range.cloneRange(),
    rect,
    context: captureContext(range, text)
  };
}

function parentElement(node) {
  if (!node) return null;
  return node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
}

function captureContext(range, text) {
  const parent = parentElement(range.commonAncestorContainer);
  const source = clean(parent?.innerText || parent?.textContent || text);
  const index = source.toLowerCase().indexOf(clean(text).toLowerCase());
  if (index < 0) return source.slice(0, 180);
  const start = Math.max(0, index - 80);
  const end = Math.min(source.length, index + text.length + 100);
  return source.slice(start, end);
}

function scheduleSelectionPopover(delay) {
  clearTimeout(window.__antenaeumSelectionTimer);
  window.__antenaeumSelectionTimer = setTimeout(showSelectionPopover, delay);
}

function showSelectionPopover() {
  const data = getSelectionData();
  if (!data || activeView !== "reader") {
    hideSelectionPopover();
    return;
  }

  selectionSnapshot = data;
  const saveLabel = $('[data-selection-action="save"] span', els.selectionPopover);
  saveLabel.textContent = isWordSelection(data.text) ? "Save Word" : "Save Quote";

  const popover = els.selectionPopover;
  popover.classList.add("open");
  popover.setAttribute("aria-hidden", "false");
  popover.style.visibility = "hidden";

  const viewportWidth = window.visualViewport?.width || window.innerWidth;
  const viewportHeight = window.visualViewport?.height || window.innerHeight;
  const width = popover.offsetWidth || 380;
  const height = popover.offsetHeight || 48;

  let left = data.rect.left + data.rect.width / 2 - width / 2;
  left = clamp(left, 8, viewportWidth - width - 8);

  let top = data.rect.top - height - 10;
  if (top < 76) top = data.rect.bottom + 10;
  top = clamp(top, 8, viewportHeight - height - 8);

  popover.style.left = `${left}px`;
  popover.style.top = `${top}px`;
  popover.style.visibility = "visible";
}

function hideSelectionPopover() {
  els.selectionPopover.classList.remove("open");
  els.selectionPopover.setAttribute("aria-hidden", "true");
}

function handlePointerDown(event) {
  if (els.selectionPopover.contains(event.target) || els.reader.contains(event.target)) return;
  hideSelectionPopover();
}

function handleSelectionAction(event) {
  const button = event.target.closest("[data-selection-action]");
  if (!button) return;
  const action = button.dataset.selectionAction;

  if (action === "save") saveCurrentSelection();
  if (action === "highlight") highlightSelection();
  if (action === "copy") copyToClipboard(currentSelectionText());
  if (action === "speak") speak(currentSelectionText());

  hideSelectionPopover();
}

function currentSelectionText() {
  const live = getSelectionData();
  if (live) selectionSnapshot = live;
  return clean(selectionSnapshot?.text || "");
}

function isWordSelection(text) {
  const value = clean(text);
  if (!value) return false;
  if (/[.!?,;:()[\]{}"']/g.test(value)) return false;
  const parts = value.split(/\s+/).filter(Boolean);
  return parts.length === 1 || (parts.length === 2 && value.length <= 34);
}

function saveCurrentSelection() {
  const live = getSelectionData();
  if (live) selectionSnapshot = live;
  if (!selectionSnapshot?.text) {
    toast("Select a word or passage first.");
    return;
  }

  if (isWordSelection(selectionSnapshot.text)) saveWord(selectionSnapshot);
  else saveQuote(selectionSnapshot);
}

function saveWord(selection) {
  const value = clean(selection.text);
  const exists = state.words.some((word) => clean(word.text).toLowerCase() === value.toLowerCase());
  if (exists) {
    toast("Word already saved.");
    return;
  }

  const doc = activeDocument();
  const item = {
    id: uid(),
    text: value,
    note: "",
    context: selection.context || "",
    sourceTitle: doc.title,
    sourceAuthor: doc.author,
    docId: doc.id,
    createdAt: new Date().toISOString()
  };
  state.words.unshift(item);
  state.lastCapture = { type: "word", text: value };
  persist();
  renderAll();
  renderLastCapture();
  toast("Word saved.");
}

function saveQuote(selection) {
  const value = clean(selection.text);
  const exists = state.quotes.some((quote) => clean(quote.text).toLowerCase() === value.toLowerCase());
  if (exists) {
    toast("Quote already saved.");
    return;
  }

  const doc = activeDocument();
  state.quotes.unshift({
    id: uid(),
    text: value,
    sourceTitle: doc.title,
    sourceAuthor: doc.author,
    docId: doc.id,
    createdAt: new Date().toISOString()
  });
  state.lastCapture = { type: "quote", text: value };
  persist();
  renderAll();
  renderLastCapture();
  toast("Quote saved.");
}

function highlightSelection() {
  const live = getSelectionData();
  if (live) selectionSnapshot = live;
  if (!selectionSnapshot?.range || !selectionSnapshot.text) {
    toast("Select text first.");
    return;
  }

  const id = uid();
  const color = state.settings.highlightColor || "gold";
  const mark = document.createElement("mark");
  mark.className = `reader-highlight highlight-${color}`;
  mark.dataset.highlightId = id;
  mark.dataset.color = color;

  try {
    const contents = selectionSnapshot.range.extractContents();
    mark.appendChild(contents);
    selectionSnapshot.range.insertNode(mark);
    window.getSelection()?.removeAllRanges();
  } catch (error) {
    toast("This selection cannot be highlighted cleanly.");
    return;
  }

  const doc = activeDocument();
  state.highlights.unshift({
    id,
    text: selectionSnapshot.text,
    color,
    context: selectionSnapshot.context || "",
    sourceTitle: doc.title,
    sourceAuthor: doc.author,
    docId: doc.id,
    createdAt: new Date().toISOString()
  });
  state.lastCapture = { type: "highlight", text: selectionSnapshot.text };
  saveReaderDocument();
  persist();
  renderAll();
  renderLastCapture();
  toast("Highlight saved.");
}

function renderLastCapture() {
  if (!state.lastCapture) {
    els.lastCapture.textContent = "Select a word or passage in the reader.";
    return;
  }
  const label = state.lastCapture.type === "word" ? "Word" : state.lastCapture.type === "quote" ? "Quote" : "Highlight";
  els.lastCapture.innerHTML = `<strong>${label}</strong><br>${escapeHTML(state.lastCapture.text)}`;
}

function renderWords() {
  const items = filterItems(state.words);
  els.wordsGrid.innerHTML = "";

  if (!items.length) {
    els.wordsGrid.innerHTML = `<div class="empty-state">No saved words match this search.</div>`;
    return;
  }

  items.forEach((word) => {
    const card = document.createElement("article");
    card.className = "collection-card";
    card.dataset.id = word.id;
    card.innerHTML = `
      <span class="card-label">Word</span>
      <h3>${escapeHTML(word.text)}</h3>
      <p>${escapeHTML(word.context || "No context saved.")}</p>
      <span class="card-meta">${escapeHTML(word.sourceTitle || "Unknown source")} | ${formatDate(word.createdAt)}</span>
      <textarea class="word-note" data-note-id="${escapeHTML(word.id)}" placeholder="Add your note...">${escapeHTML(word.note || "")}</textarea>
      <div class="card-actions">
        <button class="tool-button" type="button" data-card-action="copy" data-id="${escapeHTML(word.id)}"><svg><use href="#icon-copy"></use></svg>Copy</button>
        <button class="tool-button" type="button" data-card-action="speak" data-id="${escapeHTML(word.id)}"><svg><use href="#icon-sound"></use></svg>Listen</button>
        <button class="tool-button danger" type="button" data-card-action="remove" data-id="${escapeHTML(word.id)}"><svg><use href="#icon-trash"></use></svg>Remove</button>
      </div>
    `;
    els.wordsGrid.appendChild(card);
  });
}

function renderQuotes() {
  const items = filterItems(state.quotes);
  els.quotesGrid.innerHTML = "";

  if (!items.length) {
    els.quotesGrid.innerHTML = `<div class="empty-state">No saved quotes match this search.</div>`;
    return;
  }

  items.forEach((quote) => {
    const card = document.createElement("article");
    card.className = "collection-card";
    card.dataset.id = quote.id;
    card.innerHTML = `
      <span class="card-label">Quote</span>
      <p>${escapeHTML(quote.text)}</p>
      <span class="card-meta">${escapeHTML(quote.sourceTitle || "Unknown source")} | ${formatDate(quote.createdAt)}</span>
      <div class="card-actions">
        <button class="tool-button" type="button" data-card-action="copy" data-id="${escapeHTML(quote.id)}"><svg><use href="#icon-copy"></use></svg>Copy</button>
        <button class="tool-button" type="button" data-card-action="speak" data-id="${escapeHTML(quote.id)}"><svg><use href="#icon-sound"></use></svg>Listen</button>
        <button class="tool-button danger" type="button" data-card-action="remove" data-id="${escapeHTML(quote.id)}"><svg><use href="#icon-trash"></use></svg>Remove</button>
      </div>
    `;
    els.quotesGrid.appendChild(card);
  });
}

function renderHighlights() {
  const items = filterItems(state.highlights);
  els.highlightsGrid.innerHTML = "";

  if (!items.length) {
    els.highlightsGrid.innerHTML = `<div class="empty-state">No highlights match this search.</div>`;
    return;
  }

  items.forEach((highlight) => {
    const card = document.createElement("article");
    card.className = "collection-card highlight-card";
    card.dataset.id = highlight.id;
    card.dataset.color = highlight.color || "gold";
    card.innerHTML = `
      <span class="card-label">Highlight</span>
      <p>${escapeHTML(highlight.text)}</p>
      <span class="card-meta">${escapeHTML(highlight.sourceTitle || "Unknown source")} | ${formatDate(highlight.createdAt)}</span>
      <div class="card-actions">
        <button class="tool-button" type="button" data-card-action="open" data-id="${escapeHTML(highlight.id)}"><svg><use href="#icon-book"></use></svg>Open</button>
        <button class="tool-button" type="button" data-card-action="copy" data-id="${escapeHTML(highlight.id)}"><svg><use href="#icon-copy"></use></svg>Copy</button>
        <button class="tool-button danger" type="button" data-card-action="remove" data-id="${escapeHTML(highlight.id)}"><svg><use href="#icon-trash"></use></svg>Remove</button>
      </div>
    `;
    els.highlightsGrid.appendChild(card);
  });
}

function filterItems(items) {
  const query = clean(els.searchInput.value).toLowerCase();
  if (!query) return items;
  return items.filter((item) => {
    return [item.text, item.context, item.note, item.sourceTitle, item.sourceAuthor]
      .some((value) => clean(value).toLowerCase().includes(query));
  });
}

function handleWordNoteInput(event) {
  const area = event.target.closest("[data-note-id]");
  if (!area) return;
  const word = state.words.find((item) => item.id === area.dataset.noteId);
  if (!word) return;
  word.note = area.value;
  persist();
}

function handleWordCardClick(event) {
  const button = event.target.closest("[data-card-action]");
  if (!button) return;
  const word = state.words.find((item) => item.id === button.dataset.id);
  if (!word) return;
  if (button.dataset.cardAction === "copy") copyToClipboard(formatWord(word));
  if (button.dataset.cardAction === "speak") speak(word.text);
  if (button.dataset.cardAction === "remove") removeItem("words", word.id);
}

function handleQuoteCardClick(event) {
  const button = event.target.closest("[data-card-action]");
  if (!button) return;
  const quote = state.quotes.find((item) => item.id === button.dataset.id);
  if (!quote) return;
  if (button.dataset.cardAction === "copy") copyToClipboard(formatQuote(quote));
  if (button.dataset.cardAction === "speak") speak(quote.text);
  if (button.dataset.cardAction === "remove") removeItem("quotes", quote.id);
}

function handleHighlightCardClick(event) {
  const button = event.target.closest("[data-card-action]");
  if (!button) return;
  const highlight = state.highlights.find((item) => item.id === button.dataset.id);
  if (!highlight) return;
  if (button.dataset.cardAction === "open") focusHighlight(highlight.id);
  if (button.dataset.cardAction === "copy") copyToClipboard(highlight.text);
  if (button.dataset.cardAction === "remove") removeHighlight(highlight.id);
}

function removeItem(collection, id) {
  state[collection] = state[collection].filter((item) => item.id !== id);
  persist();
  renderAll();
  toast("Removed.");
}

function focusHighlight(id) {
  const highlight = state.highlights.find((item) => item.id === id);
  if (!highlight) return;
  if (highlight.docId && highlight.docId !== state.activeDocId) setActiveDocument(highlight.docId);
  setView("reader");
  setTimeout(() => {
    const mark = $(`[data-highlight-id="${cssEscape(id)}"]`, els.reader);
    if (!mark) return;
    mark.scrollIntoView({ behavior: "smooth", block: "center" });
    mark.animate([
      { outline: "0 solid rgba(52,127,109,0)" },
      { outline: "3px solid rgba(52,127,109,0.75)" },
      { outline: "0 solid rgba(52,127,109,0)" }
    ], { duration: 1300, iterations: 1 });
  }, 80);
}

function removeHighlight(id) {
  const highlight = state.highlights.find((item) => item.id === id);
  const doc = state.docs.find((item) => item.id === highlight?.docId);
  if (doc) {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = doc.id === state.activeDocId ? els.reader.innerHTML : doc.html;
    $$(`[data-highlight-id="${cssEscape(id)}"]`, wrapper).forEach(unwrapNode);
    doc.html = wrapper.innerHTML;
    if (doc.id === state.activeDocId) els.reader.innerHTML = doc.html;
  }
  state.highlights = state.highlights.filter((item) => item.id !== id);
  persist();
  renderAll();
  toast("Highlight removed.");
}

function clearHighlights() {
  if (!state.highlights.length) {
    toast("No highlights to clear.");
    return;
  }
  if (!window.confirm("Remove all highlights?")) return;
  state.docs.forEach((doc) => {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = doc.html;
    $$("mark.reader-highlight", wrapper).forEach(unwrapNode);
    doc.html = wrapper.innerHTML;
  });
  state.highlights = [];
  setActiveDocument(state.activeDocId);
  persist();
  renderAll();
  toast("Highlights cleared.");
}

function unwrapNode(node) {
  const parent = node.parentNode;
  while (node.firstChild) parent.insertBefore(node.firstChild, node);
  parent.removeChild(node);
  parent.normalize();
}

function openEditor(mode) {
  editorMode = mode;
  const doc = mode === "new"
    ? { title: "", author: "", shelf: activeShelf, html: "<p></p>" }
    : activeDocument();

  els.dialogTitle.textContent = mode === "new" ? "New Text" : "Edit Text";
  els.docTitleInput.value = doc.title || "";
  els.docAuthorInput.value = doc.author || "";
  els.docShelfInput.value = doc.shelf || activeShelf || "book-summaries";
  els.docEditor.innerHTML = doc.html || "<p></p>";
  els.deleteDocBtn.hidden = mode === "new" || state.docs.length <= 1;

  if (typeof els.editorDialog.showModal === "function") els.editorDialog.showModal();
  else els.editorDialog.setAttribute("open", "");
}

function closeEditor() {
  if (typeof els.editorDialog.close === "function") els.editorDialog.close();
  else els.editorDialog.removeAttribute("open");
}

function saveEditorDocument() {
  const title = clean(els.docTitleInput.value) || "Untitled Text";
  const author = clean(els.docAuthorInput.value) || "Unknown author";
  const shelf = SHELVES[els.docShelfInput.value] ? els.docShelfInput.value : "book-summaries";
  const html = sanitizeHTML(els.docEditor.innerHTML || "<p></p>");
  const now = new Date().toISOString();

  if (editorMode === "new") {
    const doc = { id: uid(), title, author, shelf, html, createdAt: now, updatedAt: now };
    state.docs.unshift(doc);
    state.activeDocId = doc.id;
  } else {
    const doc = activeDocument();
    doc.title = title;
    doc.author = author;
    doc.shelf = shelf;
    doc.html = html;
    doc.updatedAt = now;
  }

  activeShelf = shelf;
  state.activeShelf = shelf;
  persist();
  setActiveDocument(state.activeDocId);
  closeEditor();
  toast("Text saved.");
}

function deleteActiveDocument() {
  if (state.docs.length <= 1) return;
  const doc = activeDocument();
  if (!window.confirm(`Delete "${doc.title}"?`)) return;
  state.docs = state.docs.filter((item) => item.id !== doc.id);
  state.words = state.words.filter((item) => item.docId !== doc.id);
  state.quotes = state.quotes.filter((item) => item.docId !== doc.id);
  state.highlights = state.highlights.filter((item) => item.docId !== doc.id);
  state.activeDocId = state.docs[0].id;
  persist();
  setActiveDocument(state.activeDocId);
  closeEditor();
  toast("Text deleted.");
}

function exportLibrary() {
  saveReaderDocument();
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `antenaeum-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  toast("Export ready.");
}

function importLibrary(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (!Array.isArray(data.docs)) throw new Error("Invalid library file");
      state = data;
      ensureStarterState();
      persist();
      setActiveDocument(state.activeDocId || state.docs[0].id);
      toast("Import complete.");
    } catch (error) {
      toast("Import failed.");
    } finally {
      event.target.value = "";
    }
  };
  reader.readAsText(file);
}

function copyCollection(collection) {
  const items = collection === "words" ? state.words : state.quotes;
  if (!items.length) {
    toast(collection === "words" ? "No words saved." : "No quotes saved.");
    return;
  }
  const text = items.map((item) => collection === "words" ? formatWord(item) : formatQuote(item)).join("\n\n");
  copyToClipboard(text);
}

function formatWord(word) {
  const note = clean(word.note) ? `\nNote: ${clean(word.note)}` : "";
  const context = clean(word.context) ? `\nContext: ${clean(word.context)}` : "";
  return `Word: ${word.text}${note}${context}\nSource: ${word.sourceTitle || "Unknown source"}`;
}

function formatQuote(quote) {
  return `Quote: ${quote.text}\nSource: ${quote.sourceTitle || "Unknown source"}`;
}

function copyToClipboard(text) {
  const value = clean(text);
  if (!value) {
    toast("Nothing to copy.");
    return;
  }
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(value)
      .then(() => toast("Copied."))
      .catch(() => fallbackCopy(value));
  } else {
    fallbackCopy(value);
  }
}

function fallbackCopy(text) {
  const area = document.createElement("textarea");
  area.value = text;
  area.style.position = "fixed";
  area.style.left = "-999px";
  document.body.appendChild(area);
  area.focus();
  area.select();
  try {
    document.execCommand("copy");
    toast("Copied.");
  } catch (error) {
    toast("Copy failed.");
  }
  area.remove();
}

function speak(text) {
  const value = clean(text);
  if (!value || !("speechSynthesis" in window)) {
    toast("Speech is unavailable.");
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(value);
  utterance.lang = /[\u0600-\u06ff]/.test(value) ? "ar" : "en";
  window.speechSynthesis.speak(utterance);
}

function toast(message) {
  els.toast.textContent = message;
  els.toast.style.display = "block";
  clearTimeout(window.__antenaeumToast);
  window.__antenaeumToast = setTimeout(() => {
    els.toast.style.display = "none";
  }, 1800);
}

function clean(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function escapeHTML(value) {
  return clean(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(value, max));
}

function uid() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function cssEscape(value) {
  if (window.CSS?.escape) return CSS.escape(value);
  return String(value).replace(/["\\]/g, "\\$&");
}

function formatDate(value) {
  if (!value) return "Today";
  try {
    return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
  } catch (error) {
    return "Today";
  }
}
