// ---------------------------------------------------------------
// Course Details page — reads data/courses.json (+ counts from
// data/questions.json). Edit courses.json to fill in names/books,
// this file doesn't need to change.
// ---------------------------------------------------------------

init();

async function init() {
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
}

async function fetchJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load ${path}`);
  return res.json();
}

function renderCourseCard(code, course, questionCount) {
  const card = document.createElement("article");
  card.className = "course-card";

  const head = document.createElement("div");
  head.className = "course-card-head";
  head.innerHTML = `<span class="tag tag-course">${code}</span>`;
  card.appendChild(head);

  const name = document.createElement("h2");
  const hasName = course.name && course.name.trim() !== "";
  name.className = "course-name" + (hasName ? "" : " is-placeholder");
  name.textContent = hasName ? course.name : "No title added yet — edit data/courses.json";
  card.appendChild(name);

  const meta = document.createElement("p");
  meta.className = "course-meta";
  meta.textContent = `${questionCount} question${questionCount === 1 ? "" : "s"} archived`;
  card.appendChild(meta);

  const booksLabel = document.createElement("p");
  booksLabel.className = "course-books-label";
  booksLabel.textContent = "Suggested Books";
  card.appendChild(booksLabel);

  const books = course.books || [];
  if (books.length === 0) {
    const empty = document.createElement("p");
    empty.className = "course-books-empty";
    empty.textContent = "None listed yet.";
    card.appendChild(empty);
  } else {
    const list = document.createElement("ul");
    list.className = "course-books-list";
    books.forEach(book => {
      const li = document.createElement("li");
      li.textContent = book;
      list.appendChild(li);
    });
    card.appendChild(list);
  }

  return card;
}
