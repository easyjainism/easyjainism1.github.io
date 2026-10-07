/* Easy Jainism - site script (plain JavaScript, no libraries). */
(function () {
  "use strict";

  /* ---------- helpers ---------- */
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  function store(key, value) {            // safe localStorage (works even if blocked)
    try {
      if (value === undefined) return localStorage.getItem(key);
      localStorage.setItem(key, value);
    } catch (e) { return null; }
  }

  function make(tag, className, text) {   // create an element safely (no innerHTML)
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text) el.textContent = text;
    return el;
  }

  const page = document.body.dataset.page;

  /* ---------- site data ---------- */
  const SEARCH_INDEX = [
    ["Home", "./home.html"], ["About", "./about.html"], ["Books", "./books.html"],
    ["Tirthankars", "./tirthankar.html"], ["Tirthankara emblems (chinha)", "./tirthankar.html"],
    ["Tirthankaras", "./about.html#tirthankars"], ["Tirthankara emblems (chinha)", "./about.html#tirthankars"],
    ["YouTube playlists (QR codes)", "./home.html#scan"],
    ["Videos", "./videos.html"], ["Paathshala", "./paathshala.html"], ["Posters", "./poster.html"],
    ["Ask Queries", "./ask-queries.html"], ["Sankalp & Confessions", "./sankalp-confessions.html"],
    ["Ahimsa", "./about.html#ahimsa"], ["Anekantavada", "./about.html#anekant"],
    ["Aparigraha", "./about.html#aparigraha"], ["Karma", "./about.html#karma"],
    ["Moksha", "./about.html#moksha"], ["Mahavir", "./about.html#mahavir"],
    ["Kids quiz", "./paathshala.html"], ["Sankalp vows", "./sankalp-confessions.html"],
    ["FAQ", "./ask-queries.html"]
  ];

  const QUOTES = [
    "Live and let live.", "Truth has many sides.", "Control anger, practice forgiveness.",
    "Own less, give more.", "Every soul is equal.", "Do not hurt any living being.",
    "Forgiveness is the ornament of the strong."
  ];

  const QUIZ = [
    { q: "How many Tirthankaras are there in this era?", options: ["12", "24", "36"], answer: 1 },
    { q: "What does Ahimsa mean?", options: ["Non-violence", "Charity", "Fasting"], answer: 0 },
    { q: "Who was the 24th Tirthankara?", options: ["Rishabhdev", "Parshvanath", "Mahavir"], answer: 2 },
    { q: "Anekantavada says truth has...", options: ["One side", "Many sides", "No sides"], answer: 1 },
    { q: "Aparigraha means...", options: ["Honesty", "Non-possessiveness", "Silence"], answer: 1 }
  ];

  /* ---------- mobile menu (drawer) ---------- */
  const nav = $("#nav");
  const scrim = $("#scrim");
  const burger = $("#burger");

  function setMenu(open) {
    nav.classList.toggle("open", open);
    scrim.hidden = !open;
    burger.setAttribute("aria-expanded", String(open));
    document.body.style.overflow = open ? "hidden" : "";
  }
  burger.addEventListener("click", () => setMenu(!nav.classList.contains("open")));
  scrim.addEventListener("click", () => setMenu(false));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });
  $$("#nav a").forEach((a) => a.addEventListener("click", () => setMenu(false)));

  /* ---------- active menu link ---------- */
  $$("#nav a").forEach((a) => {
    if (a.dataset.p === page) {
      a.classList.add("active");
      a.setAttribute("aria-current", "page");
    }
  });

  /* ---------- dark / light mode ---------- */
  $("#theme").addEventListener("click", () => {
    const root = document.documentElement;
    const wasDark = root.dataset.theme === "dark";
    if (wasDark) delete root.dataset.theme; else root.dataset.theme = "dark";
    store("theme", wasDark ? "light" : "dark");
  });

  /* ---------- search ---------- */
  const searchBtn = $("#searchBtn");
  const searchBox = $("#searchBox");
  const searchInput = $("#q");
  const results = $("#results");

  searchBtn.addEventListener("click", () => {
    searchBox.hidden = !searchBox.hidden;
    searchBtn.setAttribute("aria-expanded", String(!searchBox.hidden));
    if (!searchBox.hidden) searchInput.focus();
  });

  searchInput.addEventListener("input", () => {
    const term = searchInput.value.trim().toLowerCase();
    results.innerHTML = "";
    if (!term) return;
    const matches = SEARCH_INDEX.filter((item) => item[0].toLowerCase().includes(term));
    if (!matches.length) { results.appendChild(make("li", "", "No match. Try another word.")); return; }
    matches.forEach(([label, href]) => {
      const li = make("li");
      const a = make("a", "", label);
      a.href = href;
      li.appendChild(a);
      results.appendChild(li);
    });
  });

  /* ---------- language: Google Translate translates the whole page ---------- */
  const langSelect = $("#lang");
  const savedLang = store("lang") || "en";
  let translatorLoaded = false;

  function setTranslateCookie(lang) {
    document.cookie = `googtrans=/en/${lang};path=/`;
    document.cookie = `googtrans=/en/${lang};path=/;domain=.${location.hostname}`;
  }
  function clearTranslateCookie() {
    ["", `domain=${location.hostname};`, `domain=.${location.hostname};`].forEach((d) => {
      document.cookie = `googtrans=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;${d}`;
    });
  }

  function loadTranslator() {                      // downloads Google's script only when a language is in use
    if (translatorLoaded) return;
    translatorLoaded = true;
    const holder = make("div", "gt-hold");
    holder.id = "google_translate_element";
    holder.setAttribute("aria-hidden", "true");
    document.body.appendChild(holder);
    window.googleTranslateElementInit = () => {
      new google.translate.TranslateElement(
        { pageLanguage: "en", includedLanguages: "hi,gu,kn,ta,mr", autoDisplay: false },
        "google_translate_element"
      );
    };
    const tag = document.createElement("script");
    tag.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    tag.async = true;
    document.head.appendChild(tag);
    setTimeout(() => {                             // tell the visitor if Google Translate never arrived
      if ($(".goog-te-combo")) return;
      const note = make("div", "tour-nudge", "Translation could not load. Please check your internet connection and try again.");
      document.body.appendChild(note);
      setTimeout(() => note.remove(), 9000);
    }, 10000);
  }

  function chooseLanguage(lang) {                  // backup: pick the language in Google's hidden dropdown if the cookie was not enough
    let tries = 0;
    const timer = setInterval(() => {
      const combo = $(".goog-te-combo");
      tries++;
      if (combo) {
        clearInterval(timer);
        const apply = () => {
          combo.value = lang;
          const event = document.createEvent("HTMLEvents");
          event.initEvent("change", true, true);
          combo.dispatchEvent(event);
        };
        if (combo.value !== lang) apply();
        setTimeout(() => { if (!/translated-/.test(document.documentElement.className)) apply(); }, 2500);   // try again if nothing changed
      } else if (tries > 60) clearInterval(timer);
    }, 200);
  }

  function useLanguage(lang) {                     // runs on every page load
    setTranslateCookie(lang);
    loadTranslator();
    chooseLanguage(lang);
  }

  if (langSelect) {
    langSelect.value = savedLang;
    langSelect.addEventListener("change", () => {
      const lang = langSelect.value;
      store("lang", lang);
      if (lang === "en") clearTranslateCookie(); else setTranslateCookie(lang);
      if (lang !== "en" || savedLang !== "en") location.reload();   // reload: Google Translate then reads the cookie and translates the page
    });
  }
  if (savedLang !== "en") useLanguage(savedLang);

  /* ---------- read more / read less ---------- */
  $$("[data-more]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const extra = $(".more", btn.parentNode);
      const opening = extra.hidden;
      extra.hidden = !opening;
      btn.textContent = opening ? "Read less" : "Read more";
      btn.setAttribute("aria-expanded", String(opening));
    });
  });

  /* ---------- FAQ accordion ---------- */
  $$(".faq button").forEach((btn) => {
    btn.addEventListener("click", () => {
      const panel = btn.nextElementSibling;
      const opening = panel.hidden;
      panel.hidden = !opening;
      btn.setAttribute("aria-expanded", String(opening));
    });
  });

  /* ---------- random quote + copy ---------- */
  const quoteEl = $("#quote");
  if (quoteEl) {
    $("#newQuote").addEventListener("click", () => {
      quoteEl.textContent = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    });
    $("#copyQuote").addEventListener("click", () => {
      const note = $("#copied");
      const copy = navigator.clipboard ? navigator.clipboard.writeText(quoteEl.textContent) : Promise.reject();
      copy.then(
        () => { note.textContent = "Copied!"; },
        () => { note.textContent = "Copy failed. Select the text and copy it."; }
      );
    });
  }

  /* ---------- scroll to top ---------- */
  const topBtn = $("#top");
  window.addEventListener("scroll", () => { topBtn.hidden = window.scrollY < 400; }, { passive: true });
  topBtn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  /* ---------- Ask Queries form: the question goes to our team's email ---------- */
  const ASK_EMAIL = "jainatwa1008@gmail.com";
  const askForm = $("#askForm");
  if (askForm) {
    const subject = "Question for Easy Jainism";
    const message = () => {
      const name = ($("#aname").value || "").trim();
      return $("#aq").value.trim() + (name ? "\n\nFrom: " + name : "");
    };
    askForm.addEventListener("submit", (e) => {            // opens the visitor's email app
      e.preventDefault();
      location.href = "mailto:" + ASK_EMAIL + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(message());
    });
    $("#askGmail").addEventListener("click", () => {       // for people who use Gmail in the browser
      if (!askForm.reportValidity()) return;
      window.open("https://mail.google.com/mail/?view=cm&fs=1&to=" + ASK_EMAIL + "&su=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(message()), "_blank", "noopener");
    });
  }

  /* ---------- kids quiz ---------- */
  const quizBox = $("#quiz");
  if (quizBox) {
    let index = 0, score = 0;

    const showQuestion = () => {
      quizBox.innerHTML = "";
      if (index >= QUIZ.length) {
        quizBox.appendChild(make("h3", "", `You scored ${score} out of ${QUIZ.length}`));
        const again = make("button", "btn", "Play again");
        again.addEventListener("click", () => { index = 0; score = 0; showQuestion(); });
        quizBox.appendChild(again);
        return;
      }
      const item = QUIZ[index];
      quizBox.appendChild(make("h3", "", `${index + 1}/${QUIZ.length}. ${item.q}`));

      item.options.forEach((text, i) => {
        const opt = make("button", "opt", text);
        opt.addEventListener("click", () => {
          $$(".opt", quizBox).forEach((b, j) => {
            b.disabled = true;
            if (j === item.answer) b.classList.add("ok");
          });
          if (i === item.answer) score++; else opt.classList.add("no");
          const next = make("button", "btn", index < QUIZ.length - 1 ? "Next" : "See score");
          next.addEventListener("click", () => { index++; showQuestion(); });
          quizBox.appendChild(next);
          next.focus();
        });
        quizBox.appendChild(opt);
      });
    };
    showQuestion();
  }

  /* ---------- links to the current page: scroll instead of reloading ---------- */
  const currentFile = location.pathname.split("/").pop() || "index.html";
  $$("a[href]").forEach((a) => {
    const href = a.getAttribute("href");
    if (/^(#|https?:|mailto:)/.test(href)) return;
    const [file, hash] = href.replace("./", "").split("#");
    if (file !== currentFile) return;
    a.addEventListener("click", (e) => {
      e.preventDefault();
      const target = hash ? document.getElementById(hash) : null;
      if (target) target.scrollIntoView({ behavior: "smooth" });
      else window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });

  /* ---------- back button ---------- */
  $$("[data-back]").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (history.length > 1 && document.referrer) history.back();
      else location.assign("home.html");
    });
  });

  /* ---------- click ripple + reveal on scroll ---------- */
  $$(".btn, .card, .opt, .rm, .faq button").forEach((el) => {
    el.addEventListener("pointerdown", (e) => {
      const box = el.getBoundingClientRect();
      const dot = make("span", "rip");
      dot.style.left = e.clientX - box.left + "px";
      dot.style.top = e.clientY - box.top + "px";
      el.appendChild(dot);
      setTimeout(() => dot.remove(), 600);
    });
  });

  function revealOnScroll() {
    const items = $$(".sec h2, .sec .card, .sec p, .poster, .feat, .quote");
    items.forEach((el) => el.classList.add("rv"));
    if (!("IntersectionObserver" in window)) { items.forEach((el) => el.classList.add("in")); return; }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add("in"); observer.unobserve(entry.target); }
      });
    }, { threshold: 0.1 });
    items.forEach((el) => observer.observe(el));
  }
  revealOnScroll();

  /* =====================================================================
     GOOGLE SHEET -> Books / Videos / Posters pages
     Sheet ID and tab names: set in config.js. Tabs: books, videos, posters.
     ===================================================================== */
  const SHEET_ID = window.EJ_SHEET_ID;
  const TAB = { books: "books", videos: "videos", poster: "posters" }[page];
  const grid = $("main .grid");

  /* --- read a CSV text into an array of {header: value} objects --- */
  function parseCsv(text) {
    const rows = [];
    let row = [], cell = "", inQuotes = false;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (inQuotes) {
        if (ch === '"') {
          if (text[i + 1] === '"') { cell += '"'; i++; } else inQuotes = false;
        } else cell += ch;
      } else if (ch === '"') inQuotes = true;
      else if (ch === ",") { row.push(cell); cell = ""; }
      else if (ch === "\n" || ch === "\r") {
        if (ch === "\r" && text[i + 1] === "\n") i++;
        row.push(cell); rows.push(row); row = []; cell = "";
      } else cell += ch;
    }
    if (cell || row.length) { row.push(cell); rows.push(row); }
    if (!rows.length) return [];
    const headers = rows.shift().map((h) => h.trim().toLowerCase());
    return rows
      .filter((r) => r.join("").trim())
      .map((r) => Object.fromEntries(headers.map((h, i) => [h, (r[i] || "").trim()])));
  }

  /* --- way 1: CSV through fetch --- */
  function loadCsv(id, tab) {
    const url = `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:csv&headers=1&sheet=${tab}`;
    return fetch(url).then((r) => { if (!r.ok) throw new Error("HTTP " + r.status); return r.text(); }).then(parseCsv);
  }

  /* --- way 2 (backup): same data through a <script> tag, which needs no CORS --- */
  function loadScript(id, tab) {
    return new Promise((resolve, reject) => {
      const callback = "ejSheet" + Date.now();
      const tag = document.createElement("script");
      window[callback] = (res) => {
        tag.remove(); delete window[callback];
        if (!res || res.status === "error") return reject(new Error("sheet error"));
        const headers = res.table.cols.map((c) => (c.label || "").trim().toLowerCase());
        resolve(res.table.rows.map((r) => Object.fromEntries(
          headers.map((h, i) => [h, r.c[i] && r.c[i].v != null ? String(r.c[i].v).trim() : ""])
        )));
      };
      tag.onerror = () => { tag.remove(); reject(new Error("script blocked")); };
      tag.src = `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?headers=1&sheet=${tab}&tqx=responseHandler:${callback}`;
      document.head.appendChild(tag);
    });
  }

  /* --- accept several column names so the sheet is easy to fill --- */
  function tidy(row) {
    // a checkbox column (named toggle, show, visible, publish or display) decides what appears on the site;
    // a tab without such a column shows every row
    const toggle = Object.keys(row).find((k) => /toggle|show|visible|publish|display/.test(k));
    return {
      visible: toggle === undefined || /^(true|yes|1|on|y)$/i.test((row[toggle] || "").trim()),
      title: row.title || row.name || "",
      description: row.description || row.author || "",
      link: row.link || row.url || row.youtube_link || row.yt_link || row.book_link || row.video_link || row.v_link || "",
      image: row.image || row.img_link || row.img || row.poster_link || ""
    };
  }

  const isWebLink = (u) => /^https?:\/\//i.test(u || "");

  function driveImage(url, width) {           // turn a Google Drive share link into a displayable image
    const m = (url || "").match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:export=\w+&)?id=)([\w-]+)/);
    return m ? `https://drive.google.com/thumbnail?id=${m[1]}&sz=w${width || 1200}` : url;
  }

  function addImage(card, url, alt, extraClass) {
    if (!isWebLink(driveImage(url))) return;
    const img = make("img", "pimg " + (extraClass || ""));
    img.src = driveImage(url);
    img.alt = alt || "";
    img.loading = "lazy";
    img.onerror = () => img.remove();   // hide the picture if it cannot be loaded
    card.appendChild(img);
  }

  function openButton(card, url, label) {
    if (!isWebLink(url)) return;
    const a = make("a", "btn", label || "Open");
    a.href = url; a.target = "_blank"; a.rel = "noopener";
    card.appendChild(a);
  }

  /* --- build one card per row --- */
  function bookCard(item) {
    const card = make("article", "card");
    addImage(card, item.image, item.title, "cover");
    card.appendChild(make("h3", "", item.title));
    if (item.description) card.appendChild(make("p", "", item.description));
    openButton(card, item.link, "Open book");
    return card;
  }

  function videoCard(item) {
    const card = make("article", "card");
    const link = item.link;
    const video = link.match(/(?:youtu\.be\/|[?&]v=|embed\/|shorts\/)([\w-]{11})/);
    const playlist = link.match(/[?&]list=([\w-]+)/);
    const drive = link.match(/drive\.google\.com\/file\/d\/([\w-]+)/);
    const youtube = video ? "https://www.youtube.com/embed/" + video[1] + "?autoplay=1&rel=0"
                  : playlist ? "https://www.youtube.com/embed/videoseries?list=" + playlist[1] + "&autoplay=1&rel=0" : "";

    if (youtube) {                                  // thumbnail + play button; the player loads only when tapped
      const play = make("button", "play");
      play.type = "button";
      play.setAttribute("aria-label", "Play video: " + (item.title || "video"));
      const picture = item.image || (video ? `https://i.ytimg.com/vi/${video[1]}/hqdefault.jpg` : "");
      if (picture) addImage(play, picture, item.title || "Video");
      play.appendChild(make("span", "tri", "\u25b6"));
      play.addEventListener("click", () => {
        const frame = make("iframe", "vid");
        frame.src = youtube;
        frame.title = item.title || "Video";
        frame.referrerPolicy = "strict-origin-when-cross-origin";
        frame.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
        frame.allowFullscreen = true;
        play.replaceWith(frame);
      });
      card.appendChild(play);
    } else if (drive) {                             // a Google Drive video: play it on the page
      const frame = make("iframe", "vid");
      frame.src = "https://drive.google.com/file/d/" + drive[1] + "/preview";
      frame.title = item.title || "Video"; frame.loading = "lazy"; frame.allowFullscreen = true;
      card.appendChild(frame);
    } else if (isWebLink(link) && item.image) {     // a channel link: show the thumbnail, click opens YouTube
      const thumb = make("a", "thumb");
      thumb.href = link; thumb.target = "_blank"; thumb.rel = "noopener";
      card.appendChild(thumb);
      addImage(thumb, item.image, item.title);
    }
    card.appendChild(make("h3", "", item.title));
    if (item.description) card.appendChild(make("p", "", item.description));
    if (!drive) openButton(card, link, /youtu/.test(link) ? "Watch on YouTube" : "Watch");   // always a way out if embedding is blocked
    return card;
  }

  /* --- poster viewer: a clicked poster opens in a pop-up with a close button --- */
  let viewer = null, lastFocus = null;

  function closeViewer() {
    viewer.hidden = true;
    $("img", viewer).removeAttribute("src");
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  }

  function buildViewer() {
    viewer = make("div", "modal");
    viewer.hidden = true;
    viewer.setAttribute("role", "dialog");
    viewer.setAttribute("aria-modal", "true");
    viewer.setAttribute("aria-label", "Poster viewer");
    const close = make("button", "close", "\u00d7");
    close.type = "button";
    close.setAttribute("aria-label", "Close");
    viewer.append(close, make("img"), make("p", "cap"));
    viewer.addEventListener("click", (e) => { if (e.target === viewer || e.target === close) closeViewer(); });
    document.addEventListener("keydown", (e) => {
      if (viewer.hidden) return;
      if (e.key === "Escape") closeViewer();
      if (e.key === "Tab") { e.preventDefault(); close.focus(); }   // keep focus inside the pop-up
    });
    document.body.appendChild(viewer);
  }

  function openViewer(src, title, opener) {
    if (!viewer) buildViewer();
    const img = $("img", viewer);
    img.src = src;
    img.alt = title || "Poster";
    $(".cap", viewer).textContent = title || "";
    lastFocus = opener;
    viewer.hidden = false;
    document.body.style.overflow = "hidden";
    $(".close", viewer).focus();
  }

  function posterCard(item) {
    const full = driveImage(item.image, 1800);
    if (isWebLink(full)) {
      const card = make("figure", "card");
      const zoom = make("button", "zoom");
      zoom.type = "button";
      zoom.setAttribute("aria-label", "View poster: " + (item.title || "poster"));
      zoom.addEventListener("click", () => openViewer(full, item.title, zoom));
      card.appendChild(zoom);
      addImage(zoom, item.image, item.title || "Poster");
      if (item.title) card.appendChild(make("h3", "", item.title));
      return card;
    }
    const quote = make("figure", "poster");              // no image: show the title as a quote poster
    quote.appendChild(make("blockquote", "", item.title));
    return quote;
  }

  const statusEl = $("#status");
  const say = (text) => { if (statusEl) statusEl.textContent = text; };

  if (TAB && grid) {
    if (!SHEET_ID) {
      say("Content is not connected yet.");
    } else {
      loadCsv(SHEET_ID, TAB)
        .catch(() => loadScript(SHEET_ID, TAB))
        .then((rows) => {
          const items = rows.map(tidy).filter((i) => i.visible && (i.title || i.link || i.image));
          if (!items.length) { say("Nothing here yet. Please check back soon."); return; }
          const build = { books: bookCard, videos: videoCard, poster: posterCard }[page];
          grid.innerHTML = "";
          items.forEach((item) => grid.appendChild(build(item)));
          say("");
        })
        .catch(() => say("Could not load content right now. Please try again later."));
    }
  }
  /* ---------- open a question when its link (about.html#karma) is used ---------- */
  if (location.hash) {
    const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (target && target.classList.contains("faq")) {
      $("button", target).click();
      setTimeout(() => target.scrollIntoView(), 80);
    }
  }

  /* ---------- numbers that count up when they come into view ---------- */
  $$("[data-count]").forEach((el) => {
    const end = Number(el.dataset.count);
    if (!("IntersectionObserver" in window) || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    el.textContent = "0";
    const watcher = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) return;
      watcher.disconnect();
      const start = performance.now();
      (function tick(now) {
        const t = Math.min((now - start) / 1200, 1);
        el.textContent = String(Math.round(end * (1 - Math.pow(1 - t, 3))));
        if (t < 1) requestAnimationFrame(tick);
      })(start);
    });
    watcher.observe(el);
  });

  /* ---------- About page: 24 Tirthankaras (cards, search, guessing game) ---------- */
  const SS = "Sammed Shikharji";
  const TIRTHANKARS = [                                   // [name, chinha (emblem), picture, birthplace, nirvana place]
    ["Rishabhanatha (Adinatha)", "Bull", "\ud83d\udc02", "Ayodhya", "Ashtapad"],
    ["Ajitanatha", "Elephant", "\ud83d\udc18", "Ayodhya", SS],
    ["Sambhavanatha", "Horse", "\ud83d\udc0e", "Shravasti", SS],
    ["Abhinandananatha", "Monkey", "\ud83d\udc12", "Ayodhya", SS],
    ["Sumatinatha", "Heron (Krauncha)", "\ud83d\udc26", "Ayodhya", SS],
    ["Padmaprabha", "Lotus", "\ud83e\udeb7", "Kaushambi", SS],
    ["Suparshvanatha", "Swastika", "\u5350", "Varanasi", SS],
    ["Chandraprabha", "Crescent moon", "\ud83c\udf19", "Chandrapuri", SS],
    ["Suvidhinatha (Pushpadanta)", "Crocodile (Makara)", "\ud83d\udc0a", "Kakandi", SS],
    ["Shitalanatha", "Shrivatsa", "\u2756", "Bhaddilpur", SS],
    ["Shreyamsanatha", "Rhinoceros", "\ud83e\udd8f", "Simhapuri (Sarnath)", SS],
    ["Vasupujya", "Buffalo", "\ud83d\udc03", "Champapuri", "Champapuri"],
    ["Vimalanatha", "Boar", "\ud83d\udc17", "Kampilya", SS],
    ["Anantanatha", "Falcon or Bear", "\ud83e\udd85", "Ayodhya", SS],
    ["Dharmanatha", "Vajra (thunderbolt)", "\u26a1", "Ratnapuri", SS],
    ["Shantinatha", "Deer", "\ud83e\udd8c", "Hastinapur", SS],
    ["Kunthunatha", "Goat", "\ud83d\udc10", "Hastinapur", SS],
    ["Aranatha", "Nandyavarta or Fish", "\ud83d\udc1f", "Hastinapur", SS],
    ["Mallinatha", "Kalasha (water pot)", "\ud83c\udffa", "Mithila", SS],
    ["Munisuvratanatha", "Tortoise", "\ud83d\udc22", "Rajagriha", SS],
    ["Naminatha", "Blue lotus", "\ud83c\udf3c", "Mithila", SS],
    ["Neminatha (Arishtanemi)", "Conch shell", "\ud83d\udc1a", "Shauripur", "Girnar"],
    ["Parshvanatha", "Serpent", "\ud83d\udc0d", "Varanasi", SS],
    ["Mahavira (Vardhamana)", "Lion", "\ud83e\udd81", "Kshatriyakund", "Pavapuri"]
  ];
  const shuffle = (list) => list.slice().sort(() => Math.random() - 0.5);

  const tgrid = $("#tgrid");
  if (tgrid) {
    TIRTHANKARS.forEach(([name, chinha, icon, born, nirvana], i) => {
      const card = make("article", "tcard");
      const emblem = make("div", "emb");
      emblem.setAttribute("aria-hidden", "true");
      if (window.EJ_TIRTHANKAR_IMAGES) {                   // real pictures if you uploaded them, else the emoji emblem
        const img = make("img");
        img.src = `./tirthankar-${i + 1}.jpg`;
        img.alt = "";
        img.loading = "lazy";
        img.addEventListener("error", () => { img.remove(); emblem.textContent = icon; });
        emblem.appendChild(img);
      } else emblem.textContent = icon;
      card.append(make("span", "num", String(i + 1)), emblem, make("h3", "", name), make("p", "", "Chinha: " + chinha),
        make("p", "small", "Born: " + born), make("p", "small", "Nirvana: " + nirvana));
      tgrid.appendChild(card);
    });
    $("#tfilter").addEventListener("input", (e) => {       // live search by name, emblem or place
      const word = e.target.value.trim().toLowerCase();
      let shown = 0;
      $$(".tcard", tgrid).forEach((card) => {
        const match = card.textContent.toLowerCase().indexOf(word) !== -1;
        card.hidden = !match;
        if (match) shown++;
      });
      $("#tnone").hidden = shown > 0;
    });

    const box = $("#game");
    const pool = TIRTHANKARS.filter((t) => t[1].indexOf(" or ") === -1);   // skip emblems that differ by tradition
    let right = 0, asked = 0;
    const round = () => {
      box.innerHTML = "";
      const answer = pool[Math.floor(Math.random() * pool.length)];
      const choices = shuffle([answer].concat(shuffle(pool.filter((t) => t !== answer)).slice(0, 3)));
      const picture = make("p", "big", answer[2]);
      picture.setAttribute("aria-hidden", "true");
      box.append(picture, make("p", "ask", "Which Tirthankara has this emblem: " + answer[1] + "?"));
      const score = make("p", "score", `Score: ${right} / ${asked}`);
      score.setAttribute("role", "status");
      const buttons = choices.map((c) => {
        const b = make("button", "opt", c[0]);
        b.type = "button";
        b.addEventListener("click", () => {
          asked++;
          if (c === answer) right++;
          buttons.forEach((x, k) => { x.disabled = true; if (choices[k] === answer) x.classList.add("ok"); });
          if (c !== answer) b.classList.add("no");
          score.textContent = `Score: ${right} / ${asked}`;
          const more = make("button", "btn", "Next emblem");
          more.type = "button";
          more.addEventListener("click", round);
          box.appendChild(more);
          more.focus();
        });
        box.appendChild(b);
        return b;
      });
      box.appendChild(score);
    };
    round();
  }

  /* ---------- clean web address: show /poster instead of /poster.html on GitHub Pages ---------- */
  if (/\.github\.io$/.test(location.hostname) && /\.html$/.test(location.pathname) && history.replaceState) {
    history.replaceState(null, "", location.pathname.replace(/\.html$/, "") + location.search + location.hash);
    $$("a[href]").forEach((a) => {                         // menu and page links also become /about, /books ...
      const href = a.getAttribute("href");
      if (/^(\.\/)?[\w-]+\.html(#.*)?$/.test(href)) a.setAttribute("href", href.replace(".html", ""));
    });
  }

  /* ---------- tap an image marked data-zoom to see it large (QR codes, the paathshala poster) ---------- */
  $$("[data-zoom]").forEach((el) => {
    const pic = el.matches("img") ? el : $("img", el);
    if (el === pic) { el.tabIndex = 0; el.setAttribute("role", "button"); }
    const open = () => openViewer(pic.currentSrc || pic.src, el.dataset.caption || pic.alt, el);
    el.addEventListener("click", open);
    el.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } });
  });

  /* ---------- real, scannable QR codes made from the playlist links in config.js ---------- */
  function qrPicture(text) {                              // a crisp black-and-white QR as a small SVG picture
    const qr = qrcode(0, "M");                            // "M" = medium error correction
    qr.addData(text);
    qr.make();
    const n = qr.getModuleCount(), quiet = 4;             // 4 blank squares around the code, as scanners expect
    let path = "";
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (qr.isDark(r, c)) path += `M${c + quiet} ${r + quiet}h1v1h-1z`;
    const size = n + quiet * 2;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges">` +
      `<rect width="${size}" height="${size}" fill="#fff"/><path d="${path}" fill="#2b1208"/></svg>`;
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  }

  $$("[data-pl]").forEach((a) => {                        // the playlist button, and the QR code above it
    const url = (window.EJ_PLAYLIST_LINKS || {})[a.dataset.pl];
    if (!url || !/^https?:\/\//.test(url)) return;      // no link yet: the old picture stays
    a.href = url;
    a.hidden = false;
    const pic = $(".qr img", a.closest(".qrcard"));
    if (pic && window.qrcode) {
      pic.src = qrPicture(url);
      pic.alt = "QR code for the " + (a.closest(".qrcard").querySelector("figcaption").textContent) + " YouTube playlist. Scan it to open the playlist.";
    }
  });

  /* ---------- Margdarshak: a short guided tour of the site, in the Jain way ---------- */
  const TOUR = [
    { title: "Jai Jinendra! \ud83d\ude4f", text: "I am your Margdarshak (guide). Walk with me through this site in a few calm steps, like a small yatra. Press Next to begin." },
    { sel: ".ticker", title: "Mantra band", text: "Holy words keep flowing here: the Navkar lines, Ahimsa Paramo Dharma and Jai Jinendra. Hover to pause." },
    { sel: "#navkarBox", title: "Navkar Mantra", text: "The supreme salutation to the five holy beings, shining line by line, with its meaning." },
    { sel: "#principles", title: "Five principles", text: "Ahimsa, Satya, Asteya, Brahmacharya and Aparigraha: the five vows at the heart of Jain life." },
    { sel: "#scan", title: "Scan & Learn", text: "Scan a code with your phone camera to open a YouTube playlist. Tap a code to see it larger." },
    { sel: "#lang", title: "Your language", text: "Choose Hindi, Gujarati, Kannada, Tamil or Marathi. Jain teachings are for everyone, in the language of the heart." },
    { sel: "#searchBtn", title: "Khoj (search)", text: "Looking for ahimsa, karma or the quiz? Type it here and go straight there." },
    { sel: "#theme", title: "Day and night", text: "Switch to the soft dark mode for your evening swadhyay." },
    { sel: '#nav a[data-p="home"]', title: "Home: Darshan", text: "Your starting point, with the principles, the Navkar Mantra and a first look around." },
    { sel: '#nav a[data-p="about"]', title: "About: Gyan", text: "The basics of Jain thought, in simple questions and answers. Tap a question to open it." },
    { sel: '#nav a[data-p="books"]', title: "Books: Swadhyay", text: "Self-study. Easy books to read and open. Our team adds new ones, so visit often." },
    { sel: '#nav a[data-p="videos"]', title: "Videos: Pravachan", text: "Listen to talks and explainers. Tap a video to play it right on the page." },
    { sel: '#nav a[data-p="paathshala"]', title: "Paathshala", text: "Join the Online Paathshala on WhatsApp or the Offline one through a form. Children can try the quiz too." },
    { sel: '#nav a[data-p="poster"]', title: "Posters", text: "Tap any poster to see it large, then close it with the \u00d7 button." },
    { sel: '#nav a[data-p="ask-queries"]', title: "Ask Queries: Jigyasa", text: "Curious about something? Read common questions or send us your own." },
    { sel: '#nav a[data-p="sankalp-confessions"]', title: "Sankalp & Confessions", text: "An anonymous form for honest reflection (alochana) and new resolves (sankalp)." },
    { title: "Micchami Dukkadam \ud83d\ude4f", text: "If I missed anything, please forgive me, and ask us in Ask Queries. May your learning bring peace. Jai Jinendra!" }
  ];

  const tourBtn = make("button", "tour-btn", "\u2741 Margdarshak");
  tourBtn.type = "button";
  tourBtn.setAttribute("aria-label", "Start the guided tour of this website");
  document.body.appendChild(tourBtn);

  let nudge = null;
  function hideNudge() { if (nudge) { nudge.remove(); nudge = null; } }
  if (page === "home" && !store("tourSeen")) {            // a gentle hint, only for first-time visitors
    nudge = make("div", "tour-nudge", "Jai Jinendra! New here? Let me guide you around.");
    document.body.appendChild(nudge);
    setTimeout(hideNudge, 12000);
  }

  tourBtn.addEventListener("click", () => {
    hideNudge();
    const steps = TOUR.filter((s) => !s.sel || $(s.sel));  // skip steps for things this page does not have
    let at = 0;
    const root = make("div", "tour");
    const spot = make("div", "tour-spot");
    const card = make("div", "tour-card");
    card.setAttribute("role", "dialog");
    card.setAttribute("aria-modal", "true");
    card.setAttribute("aria-label", "Website guide");
    root.append(spot, card);
    document.body.appendChild(root);

    function place() {                                      // put the glowing frame and the card in the right spot
      const step = steps[at];
      const el = step.sel && $(step.sel);
      const r = el && el.getBoundingClientRect();
      const cw = card.offsetWidth, ch = card.offsetHeight;
      if (!r || (!r.width && !r.height)) {                  // no target: centre the card
        spot.style.cssText = "top:50%;left:50%;width:0;height:0;border-color:transparent";
        card.style.top = Math.max(12, (innerHeight - ch) / 2) + "px";
        card.style.left = (innerWidth - cw) / 2 + "px";
        return;
      }
      const pad = 6;
      spot.style.cssText = `top:${r.top - pad}px;left:${r.left - pad}px;width:${r.width + pad * 2}px;height:${r.height + pad * 2}px`;
      let top;
      if (innerHeight - r.bottom > ch + 24) top = r.bottom + 14;          // below the target
      else if (r.top > ch + 24) top = r.top - ch - 14;                    // above it
      else top = innerHeight - ch - 12;                                   // big target: card at the bottom
      card.style.top = top + "px";
      card.style.left = Math.min(Math.max(12, r.left + r.width / 2 - cw / 2), innerWidth - cw - 12) + "px";
    }

    function show(i) {
      at = i;
      const step = steps[i];
      const inMenu = !!step.sel && step.sel.indexOf("#nav") === 0 && getComputedStyle(burger).display !== "none";
      const wasOpen = nav.classList.contains("open");
      setMenu(inMenu);                                       // on phones the links live in the drawer
      card.innerHTML = "";
      const foot = make("div", "tour-foot");
      const btns = make("span");
      const prev = make("button", "tour-prev", "Back"); prev.type = "button";
      const next = make("button", "tour-next", i === steps.length - 1 ? "Jai Jinendra" : "Next"); next.type = "button";
      const skip = make("button", "tour-skip", "End tour"); skip.type = "button";
      prev.addEventListener("click", () => show(at - 1));
      next.addEventListener("click", () => (at === steps.length - 1 ? finish() : show(at + 1)));
      skip.addEventListener("click", finish);
      if (i > 0) btns.appendChild(prev);
      btns.appendChild(next);
      foot.append(i === steps.length - 1 ? make("span") : skip, btns);
      card.append(make("p", "count", `${i + 1} / ${steps.length}`), make("h3", "", step.title), make("p", "", step.text), foot);
      const el = step.sel && $(step.sel);
      if (el && !el.closest("header") && !el.closest("nav")) el.scrollIntoView({ block: "center", behavior: "instant" });
      setTimeout(() => { place(); next.focus({ preventScroll: true }); }, inMenu !== wasOpen ? 350 : 60);
    }

    function onKey(e) {
      if (e.key === "Escape") finish();
      else if (e.key === "ArrowRight" && at < steps.length - 1) show(at + 1);
      else if (e.key === "ArrowLeft" && at > 0) show(at - 1);
      else if (e.key === "Tab") {                            // keep keyboard focus inside the guide
        const b = $$("button", card), first = b[0], last = b[b.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }

    function finish() {
      document.removeEventListener("keydown", onKey, true);
      removeEventListener("resize", place);
      removeEventListener("scroll", place, true);
      root.remove();
      setMenu(false);
      store("tourSeen", "1");
      tourBtn.focus();
    }

    document.addEventListener("keydown", onKey, true);
    addEventListener("resize", place);
    addEventListener("scroll", place, true);
    show(0);
  });
})();
