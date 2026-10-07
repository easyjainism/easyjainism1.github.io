# Easy Jainism

A simple, mobile-first website that makes Jain philosophy easy to learn. Built with plain HTML, CSS and JavaScript for GitHub Pages.

## Features
Hamburger drawer, site search, dark/light mode, FAQ accordion, read more/less, random + copyable quotes, scroll-to-top, active nav, back buttons, kids quiz, sankalp picker and a private reflection note (saved in localStorage).

## Pages
home, about, books, videos, paathshala, poster, ask-queries, sankalp-confessions

## Files (flat structure, no folders)
```
easyjainism.github.io/
├── index.html  (redirects to home.html)
├── home.html  about.html  books.html  videos.html
├── paathshala.html  poster.html  ask-queries.html  sankalp-confessions.html
├── 404.html  favicon.ico  README.md
├── style.css  script.js
└── hero.jpg  home.gif  logo.png  arharcyvidyasagar.jpg
```

## Run locally
Open `home.html` in a browser, or run `python3 -m http.server` and visit http://localhost:8000.

## Deploy to GitHub Pages
1. Create a repository named `easyjainism.github.io` (use `easyjain.github.io` if the first name is taken).
2. Upload everything in this folder to the repository root.
3. Settings > Pages > Source: "Deploy from a branch", branch `main`, folder `/ (root)`.
4. Visit https://easyjainism.github.io/ after about a minute.

## Languages
A header dropdown switches the whole site between English (default), Hindi, Gujarati, Kannada, Tamil and Marathi using the free Google Translate widget (loaded only when a language is chosen, so it needs internet). Translation is automatic, so wording may not be perfect.

## Forms and groups
- Sankalp & Confessions embeds a Google Form (edit the iframe address in `sankalp-confessions.html`).
- Paathshala has an Online button (WhatsApp group) and an Offline button (Google Form); change the links in `paathshala.html`.
- Posters open in a pop-up viewer when clicked.

## Add content without code (Google Sheets)
1. Make a Google Sheet with tabs named `books`, `videos`, `posters`.
2. Columns: books = `b_id, title, book_link, img_link` | posters = `p_id, title, image` | videos = `v_id, title, link` (a YouTube link plays on the page).
3. Share the sheet: Share > General access > "Anyone with the link" > Viewer. Do the same for the Drive books and images (Google Drive links work).
4. Copy the Sheet ID from the address bar (`docs.google.com/spreadsheets/d/<ID>/edit`) and paste it into `config.js` as `EJ_SHEET_ID`.
5. Upload `config.js` once. After that, add a row in the sheet and the website shows it after a refresh. If the sheet is empty or unreachable, the sample cards are shown.

## Home page mantras and guide
The home page has a slim running band of Jain mantras and a compact glowing Navkar Mantra banner. Edit the mantras in `home.html`.
A "Margdarshak" button (bottom left on every page) starts a guided tour of the site. Edit its steps in the `TOUR` list in `script.js`.

## Tirthankaras
The About page lists all 24 Tirthankaras with their emblem (chinha), birthplace and nirvana place, a search box and a guessing game. To show real pictures, upload `tirthankar-1.jpg` to `tirthankar-24.jpg` beside `index.html` and set `window.EJ_TIRTHANKAR_IMAGES=true` in `config.js`.

## Ask Queries, QR codes, poster, web addresses
- Questions from the Ask Queries page are emailed to jainatwa1008@gmail.com (change `ASK_EMAIL` in `script.js`).
- The six playlist QR codes on the home page are the `qr-*.png` files. Add each playlist link in `config.js` (`EJ_PLAYLIST_LINKS`) to show an "Open playlist" button.
- The paathshala poster is `paathshala-poster.jpg` (replace the file to update it).
- On GitHub Pages, `/poster.html` also works as `/poster`; the address bar shows the short form automatically.

## Real QR codes
The QR codes in "Scan & Learn" are generated live from the links in `config.js` (`EJ_PLAYLIST_LINKS`) using `qrcode.js` (MIT licence). Change a link there and its QR code and button change with it. The old `qr-*.png` pictures are used only if a link is left empty.
