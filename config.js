/* STEP 1: In your Google Sheet click Share > General access > "Anyone with the link" > Viewer.
   STEP 2: Copy the Sheet ID from its address bar: docs.google.com/spreadsheets/d/<THIS-PART>/edit
   STEP 3: Paste it between the quotes below and upload this file to GitHub. Tabs must be named: books, videos, posters.
   Columns: books = b_id, title, book_link, img_link | posters = p_id, title, image | videos = v_id, title, youtube_link, img_link */
window.EJ_SHEET_ID="1VcD3p9tqkm48J7gpIsy-wnPXOuXR-k-GERZyusl37ys";
/* Optional: instead of the ID you can paste a "Publish to web" CSV link per tab */
window.EJ_SHEETS={books:"",videos:"",posters:""};

/* Tirthankar pictures: upload images named tirthankar-1.jpg ... tirthankar-24.jpg next to this file, then change false to true. Until then emoji emblems are shown. */
window.EJ_TIRTHANKAR_IMAGES=false;

/* Scan & Learn on the home page: paste each YouTube playlist link between the quotes to show an "Open playlist" button under its QR code. */
window.EJ_PLAYLIST_LINKS={
  youth:"https://youtube.com/playlist?list=PLPTSjQB3W8-0",
  istopdesh:"https://youtube.com/playlist?list=PLBxcFahAUerfk5u4Nfg6Nyj680ZrwxaCq",
  puja:"https://youtube.com/playlist?list=PLBxcFahAUerdZquAu9vcAi_bYr0YqNZQS",
  ratnakar:"https://youtube.com/playlist?list=PLBxcFahAUeremcsopNf-S5nWzW7FWBCIV",
  chah:"https://youtube.com/playlist?list=PLBxcFahAUerfHJPUlSXmWaezDlC83-H15",
  dravya:"https://youtube.com/playlist?list=PLBxcFahAUerdwvkwVAhqqvRCNlAPXG54n"
};

/* Show or hide items: add a column with a checkbox (Insert > Checkbox) named "toggle button" to the books, videos and posters tabs.
   Only rows whose checkbox is ticked appear on the website. A tab without that column shows every row. */
