// ---------------------------------------------------------------
// EEE M.Sc. Question Archive — vanilla JS, no build step.
// Data lives in /data/*.json — see README.md for the field guide.
// ---------------------------------------------------------------

const DIMENSIONS = ["year", "course", "major"];
const MARKS_KEY = "eee-qbank-marked";

const state = {
  config: null,
  courses: null,
  questions: null,
  activeView: "year",      // which dimension the primary rail is browsing
  primary: {                // primary.year / primary.course / primary.major
    year: null,
    course: null,
    major: null
  },
  secondary: {               // narrow-further multi-select sets, per dimension
    year: new Set(),
    course: new Set(),
    major: new Set()
  },
  marked: loadMarks(),       // set of question ids the user flagged as hard
  markedOnly: false
};

function loadMarks() {
  try {
    const raw = localStorage.getItem(MARKS_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set(); // localStorage unavailable (private browsing, etc.) — marks just won't persist
  }
}

function saveMarks() {
  try {
    localStorage.setItem(MARKS_KEY, JSON.stringify([...state.marked]));
  } catch {
    // ignore — nothing we can do if storage is blocked
  }
}

const el = {
  viewTabs: document.querySelectorAll(".view-tab"),
  valueChips: document.getElementById("valueChips"),
  secondaryFilters: document.getElementById("secondaryFilters"),
  secondaryChipRow: document.getElementById("secondaryChipRow"),
  booksPanel: document.getElementById("booksPanel"),
  booksList: document.getElementById("booksList"),
  booksEmpty: document.getElementById("booksEmpty"),
  resultsMeta: document.getElementById("resultsMeta"),
  markedOnlyToggle: document.getElementById("markedOnlyToggle"),
  questionGrid: document.getElementById("questionGrid"),
  emptyState: document.getElementById("emptyState")
};

init();

async function init() {
  try {
    const [config, courses, questions] = await Promise.all([
      fetchJSON("data/config.json"),
      fetchJSON("data/courses.json"),
      fetchJSON("data/questions.json")
    ]);
    state.config = config;
    state.courses = courses;
    state.questions = questions;

    el.viewTabs.forEach(tab => {
      tab.addEventListener("click", () => setActiveView(tab.dataset.view));
    });

    el.markedOnlyToggle.addEventListener("click", () => {
      state.markedOnly = !state.markedOnly;
      el.markedOnlyToggle.classList.toggle("is-active", state.markedOnly);
      el.markedOnlyToggle.setAttribute("aria-pressed", String(state.markedOnly));
      el.markedOnlyToggle.textContent = state.markedOnly ? "★ Marked only" : "☆ Marked only";
      renderResults();
    });

    renderAll();
  } catch (err) {
    showLoadError(err);
  }
}

function showLoadError(err) {
  const main = document.querySelector("main");
  const box = document.createElement("div");
  box.className = "load-error";
  box.innerHTML = `<strong>Couldn't load the question data.</strong>
    <p>${err.message}</p>
    <p>Most often this means one of the files in <code>data/</code> isn't valid JSON —
    a trailing comma after the last field in an object is the usual culprit.
    Paste the file's contents into a JSON validator to find the exact spot.</p>`;
  main.prepend(box);
}

async function fetchJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load ${path}`);
  return res.json();
}

// ---------------------------------------------------------------
// View / filter state changes
// ---------------------------------------------------------------

function setActiveView(view) {
  state.activeView = view;
  el.viewTabs.forEach(tab => {
    const isActive = tab.dataset.view === view;
    tab.classList.toggle("is-active", isActive);
    tab.setAttribute("aria-selected", String(isActive));
  });
  renderAll();
}

function valuesForDimension(dim) {
  if (dim === "year") return [...state.config.years].sort((a, b) => b - a);
  if (dim === "course") return Object.keys(state.courses).sort();
  if (dim === "major") return [...state.config.majors];
  return [];
}

function togglePrimary(dim, value) {
  state.primary[dim] = state.primary[dim] === value ? null : value;
  renderAll();
}

function toggleSecondary(dim, value) {
  const set = state.secondary[dim];
  set.has(value) ? set.delete(value) : set.add(value);
  renderAll();
}

// ---------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------

function renderAll() {
  renderValueChips();
  renderSecondaryFilters();
  renderBooksPanel();
  renderResults();
}

function renderValueChips() {
  const dim = state.activeView;
  const values = valuesForDimension(dim);

  el.valueChips.innerHTML = "";
  const allChip = makeChip("All", state.primary[dim] === null, () => {
    state.primary[dim] = null;
    renderAll();
  });
  el.valueChips.appendChild(allChip);

  values.forEach(value => {
    const chip = makeChip(String(value), state.primary[dim] === value, () => togglePrimary(dim, value));
    el.valueChips.appendChild(chip);
  });
}

function renderSecondaryFilters() {
  const otherDims = DIMENSIONS.filter(d => d !== state.activeView);
  el.secondaryChipRow.innerHTML = "";

  otherDims.forEach(dim => {
    const values = valuesForDimension(dim);
    values.forEach(value => {
      const isActive = state.secondary[dim].has(value);
      const chip = makeChip(String(value), isActive, () => toggleSecondary(dim, value));
      chip.classList.add(`chip-${dim}`);
      el.secondaryChipRow.appendChild(chip);
    });
  });

  el.secondaryFilters.hidden = false;
}

function makeChip(label, isActive, onClick) {
  const btn = document.createElement("button");
  btn.className = "chip" + (isActive ? " is-active" : "");
  btn.type = "button";
  btn.textContent = label;
  btn.addEventListener("click", onClick);
  return btn;
}

function renderBooksPanel() {
  const showBooks = state.activeView === "course" && state.primary.course !== null;
  el.booksPanel.hidden = !showBooks;
  if (!showBooks) return;

  const course = state.courses[state.primary.course];
  const books = (course && course.books) || [];
  el.booksList.innerHTML = "";

  if (books.length === 0) {
    el.booksEmpty.hidden = false;
  } else {
    el.booksEmpty.hidden = true;
    books.forEach(book => {
      const li = document.createElement("li");
      li.textContent = book;
      el.booksList.appendChild(li);
    });
  }
}

function filteredQuestions() {
  return state.questions.filter(q => {
    for (const dim of DIMENSIONS) {
      const primaryVal = state.primary[dim];
      if (primaryVal !== null && String(q[dim]) !== String(primaryVal)) return false;

      const secondarySet = state.secondary[dim];
      if (secondarySet.size > 0 && !secondarySet.has(String(q[dim]))) return false;
    }
    if (state.markedOnly && !state.marked.has(q.id)) return false;
    return true;
  });
}

function renderResults() {
  const results = filteredQuestions();
  el.resultsMeta.textContent = `${results.length} question${results.length === 1 ? "" : "s"}`;
  el.questionGrid.innerHTML = "";
  el.emptyState.hidden = results.length !== 0;

  results.forEach(q => el.questionGrid.appendChild(renderCard(q)));
}

function renderCard(q) {
  const card = document.createElement("article");
  card.className = "q-card";

  const isMarked = state.marked.has(q.id);
  const markBtn = document.createElement("button");
  markBtn.type = "button";
  markBtn.className = "mark-btn" + (isMarked ? " is-marked" : "");
  markBtn.textContent = isMarked ? "\u2605" : "\u2606"; // ★ / ☆
  markBtn.setAttribute("aria-pressed", String(isMarked));
  markBtn.setAttribute("aria-label", isMarked ? "Remove mark" : "Mark as hard — review later");
  markBtn.addEventListener("click", () => {
    const nowMarked = !state.marked.has(q.id);
    if (nowMarked) state.marked.add(q.id); else state.marked.delete(q.id);
    saveMarks();
    markBtn.classList.toggle("is-marked", nowMarked);
    markBtn.textContent = nowMarked ? "\u2605" : "\u2606";
    markBtn.setAttribute("aria-pressed", String(nowMarked));
    markBtn.setAttribute("aria-label", nowMarked ? "Remove mark" : "Mark as hard — review later");
    if (state.markedOnly && !nowMarked) renderResults(); // card no longer belongs in this view
  });
  card.appendChild(markBtn);

  const tags = document.createElement("div");
  tags.className = "q-tags";
  tags.innerHTML = `
    <span class="tag tag-year">${q.year}</span>
    <span class="tag tag-course">${q.course}</span>
    <span class="tag tag-major">${q.major}</span>
  `;
  card.appendChild(tags);

  const body = document.createElement("div");
  body.className = "q-body";
  let bodyHtml = "";
  if (q.questionText) bodyHtml += `<div class="q-text">${q.questionText}</div>`;
  if (q.questionImage) bodyHtml += `<img src="${q.questionImage}" alt="Question ${q.id}" loading="lazy">`;
  if (q.kmap) bodyHtml += `<div class="kmap-wrap">${buildKmapHtml(q.kmap)}</div>`;
  body.innerHTML = bodyHtml;
  card.appendChild(body);

  const btn = document.createElement("button");
  btn.className = "show-answer-btn";
  btn.type = "button";
  btn.textContent = "Show Answer";

  const answerPanel = document.createElement("div");
  answerPanel.className = "answer-panel";
  let answerHtml = "";
  if (q.answerText) answerHtml += `<div class="a-text">${q.answerText}</div>`;
  if (q.answerImage) answerHtml += `<img src="${q.answerImage}" alt="Answer for ${q.id}" loading="lazy">`;
  answerPanel.innerHTML = answerHtml || `<p><em>No answer added yet.</em></p>`;

  btn.addEventListener("click", () => {
    const isOpen = answerPanel.classList.toggle("is-open");
    btn.classList.toggle("is-open", isOpen);
    btn.textContent = isOpen ? "Hide Answer" : "Show Answer";
  });

  card.appendChild(btn);
  card.appendChild(answerPanel);
  return card;
}
