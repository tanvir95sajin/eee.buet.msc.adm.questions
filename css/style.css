// ---------------------------------------------------------------
// Course Details page — reads data/courses.json (+ counts from
// data/questions.json). Edit courses.json to fill in names/books/
// topics, this file doesn't need to change.
// Each course card is collapsed by default; clicking it expands
// to show the books + topics lists.
// ---------------------------------------------------------------

init();

async function init() {
  try {
    const [courses, questions] = await Promise.all([
      fetchJSON("data/courses.json"),
      fetchJSON("data/questions.json")
    ]);

    const counts = {};
    questions.forEach(q => { counts[q.course] = (counts[q.course] || 0) + 1; });

    const grid = document.getElementById("courseGrid");
    grid.innerHTML = "";

    Object.keys(courses).sort().forEach(code => {
      grid.appendChild(renderCourseCard(code, courses[code], counts[code] || 0));
    });
  } catch (err) {
    showLoadError(err);
  }
}

async function fetchJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load ${path}`);
  return res.json();
}

function showLoadError(err) {
  const main = document.querySelector("main");
  const box = document.createElement("div");
  box.className = "load-error";
  box.innerHTML = `<strong>Couldn't load the course data.</strong>
    <p>${err.message}</p>
    <p>Most often this means one of the files in <code>data/</code> isn't valid JSON —
    a trailing comma after the last field in an object is the usual culprit.
    Paste the file's contents into a JSON validator to find the exact spot.</p>`;
  main.prepend(box);
}

function renderCourseCard(code, course, questionCount) {
  const card = document.createElement("article");
  card.className = "course-card";

  // --- collapsed header (always visible, click to expand) ---
  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "course-toggle";
  toggle.setAttribute("aria-expanded", "false");

  const head = document.createElement("span");
  head.className = "course-card-head";
  head.innerHTML = `<span class="tag tag-course">${code}</span>`;
  toggle.appendChild(head);

  const name = document.createElement("span");
  const hasName = course.name && course.name.trim() !== "";
  name.className = "course-name" + (hasName ? "" : " is-placeholder");
  name.textContent = hasName ? course.name : "No title added yet — edit data/courses.json";
  toggle.appendChild(name);

  const meta = document.createElement("span");
  meta.className = "course-meta";
  meta.textContent = `${questionCount} question${questionCount === 1 ? "" : "s"} archived`;
  toggle.appendChild(meta);

  const chevron = document.createElement("span");
  chevron.className = "course-chevron";
  chevron.setAttribute("aria-hidden", "true");
  chevron.textContent = "\u203A"; // ›
  toggle.appendChild(chevron);

  card.appendChild(toggle);

  // --- expandable details (books + topics) ---
  const details = document.createElement("div");
  details.className = "course-details";

  const booksLabel = document.createElement("p");
  booksLabel.className = "course-books-label";
  booksLabel.textContent = "Suggested Books";
  details.appendChild(booksLabel);

  const books = course.books || [];
  if (books.length === 0) {
    const empty = document.createElement("p");
    empty.className = "course-books-empty";
    empty.textContent = "None listed yet.";
    details.appendChild(empty);
  } else {
    const list = document.createElement("ul");
    list.className = "course-books-list";
    books.forEach(book => {
      const li = document.createElement("li");
      li.textContent = book;
      list.appendChild(li);
    });
    details.appendChild(list);
  }

  const topicsLabel = document.createElement("p");
  topicsLabel.className = "course-topics-label";
  topicsLabel.textContent = "Important Topics";
  details.appendChild(topicsLabel);

  const topics = course.topics || [];
  if (topics.length === 0) {
    const empty = document.createElement("p");
    empty.className = "course-topics-empty";
    empty.textContent = "None listed yet.";
    details.appendChild(empty);
  } else {
    const list = document.createElement("ul");
    list.className = "course-topics-list";
    topics.forEach(topic => {
      const li = document.createElement("li");
      li.textContent = topic;
      list.appendChild(li);
    });
    details.appendChild(list);
  }

  card.appendChild(details);

  toggle.addEventListener("click", () => {
    const isOpen = details.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  return card;
}
