# EEE M.Sc. Admission Question Archive

A static, dependency-free site for browsing BUET EEE M.Sc. admission test
questions three ways — by year, by course, and by major — with a
click-to-reveal answer image on each question.

No build step. No framework. Everything is plain HTML/CSS/JS plus three
JSON files you edit by hand.

## How it works

There's one flat list of questions in `data/questions.json`. Every question
carries all three tags (`year`, `course`, `major`) at once, so it's
automatically discoverable from any of the three browsing views — you add
it once, not three times. Switching tabs just changes which dimension the
top filter rail is sorting by; the "narrow further" row below it lets you
combine in the other two dimensions.

## Adding a question

Open `data/questions.json` and add an object to the array:

```json
{
  "id": "2019-eee209-01",
  "year": 2019,
  "course": "EEE 209",
  "major": "Power",
  "questionType": "text",
  "questionText": "State and prove Thevenin's theorem...",
  "answerImage": "assets/answers/2019-eee209-01.jpg"
}
```

Or, if the question itself is a screenshot rather than typed text:

```json
{
  "id": "2017-eee305-01",
  "year": 2017,
  "course": "EEE 305",
  "major": "Electronics",
  "questionType": "image",
  "questionImage": "assets/questions/2017-eee305-01.jpg",
  "answerImage": "assets/answers/2017-eee305-01.jpg"
}
```

Field notes:

| Field           | Required | Notes                                                              |
|-----------------|----------|---------------------------------------------------------------------|
| `id`            | yes      | Unique string. Suggested pattern: `year-coursecode-index`.         |
| `year`          | yes      | Number, must be one of the years in `data/config.json`.            |
| `course`        | yes      | Must exactly match a key in `data/courses.json` (e.g. `"EEE 209"`).|
| `major`         | yes      | One of `CSP`, `Electronics`, `Power`, `General`.                   |
| `questionType`  | yes      | `"text"` or `"image"`.                                             |
| `questionText`  | if text  | Plain text (HTML is not escaped specially — keep it plain text).   |
| `questionImage` | if image | Path to the screenshot, relative to the site root.                 |
| `answerImage`   | yes      | Path to the answer screenshot. If omitted, the card says so.       |

Drop image files into `assets/questions/` and `assets/answers/` using the
same filename you reference in the JSON — the naming pattern in the sample
data (`assets/answers/2019-eee209-01.jpg`) keeps things easy to match up
later, but any filename works as long as the path in the JSON is correct.

The four sample entries already in `data/questions.json` exist only to
show the two schema shapes — delete them once you start adding real ones.

## Course names and suggested books

`data/courses.json` holds one entry per course code, with a `name` field
(currently blank — fill in the full course title) and a `books` array for
the "Reference Shelf" panel that shows up when someone filters coursewise
to a single course:

```json
"EEE 209": { "name": "Electrical Circuits II", "books": ["Fundamentals of Electric Circuits — Sadiku"] }
```

## Years and majors

`data/config.json` holds the fixed lists for the other two dimensions —
edit it if a year or major category needs to be added or renamed.

## Previewing locally

Because the app loads JSON via `fetch()`, opening `index.html` directly
from disk won't work (browsers block local file fetches). Run a tiny local
server from the project folder instead:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Deploying to GitHub Pages

1. Push this folder to a new GitHub repo.
2. In the repo's **Settings → Pages**, set the source to the `main` branch,
   root folder.
3. The site will be live at `https://<your-username>.github.io/<repo-name>/`.

No further configuration needed — it's a static site.

## File structure

```
index.html
css/style.css
js/app.js
data/
  config.json      — years, majors
  courses.json      — course names + suggested books
  questions.json     — the actual question bank
assets/
  questions/         — screenshots used as question bodies
  answers/            — screenshots used as answers
```
