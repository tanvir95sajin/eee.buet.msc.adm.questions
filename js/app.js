// ---------------------------------------------------------------
// EEE M.Sc. Question Archive — vanilla JS, no build step.
// Data lives in /data/*.json — see README.md for the field guide.
// ---------------------------------------------------------------

const DIMENSIONS = ["year", "course", "major"];

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
  }
};

const el = {
  viewTabs: document.querySelectorAll(".view-tab"),
  valueChips: document.getElementById("valueChips"),
  secondaryFilters: document.getElementById("secondaryFilters"),
  secondaryChipRow: document.getElementById("secondaryChipRow"),
  booksPanel: document.getElementById("booksPanel"),
  booksList: document.getElementById("booksList"),
  booksEmpty: document.getElementById("booksEmpty"),
  resultsMeta: document.getElementById("resultsMeta"),
  questionGrid: document.getElementById("questionGrid"),
  emptyState: document.getElementById("emptyState")
};

init();

async function init() {
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

  renderAll();
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
  if (q.questionType === "image" && q.questionImage) {
    body.innerHTML = `<img src="${q.questionImage}" alt="Question ${q.id}" loading="lazy">`;
  } else {
    body.innerHTML = q.questionText || "";
  }
  card.appendChild(body);

  const btn = document.createElement("button");
  btn.className = "show-answer-btn";
  btn.type = "button";
  btn.textContent = "Show Answer";

  const answerPanel = document.createElement("div");
  answerPanel.className = "answer-panel";
  if (q.answerImage) {
    answerPanel.innerHTML = `<img src="${q.answerImage}" alt="Answer for ${q.id}" loading="lazy">`;
  } else {
    answerPanel.innerHTML = `<p><em>No answer image added yet.</em></p>`;
  }

  btn.addEventListener("click", () => {
    const isOpen = answerPanel.classList.toggle("is-open");
    btn.classList.toggle("is-open", isOpen);
    btn.textContent = isOpen ? "Hide Answer" : "Show Answer";
  });

  card.appendChild(btn);
  card.appendChild(answerPanel);
  return card;
}
