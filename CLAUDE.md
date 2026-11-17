# Notes for Claude

This is Jobayer Hosen's personal portfolio, a static site served by GitHub Pages from the `main` branch
(https://jobayer-hosen.github.io). No build step. README.md has the map of files.

## Working with Jobayer

- Jobayer is a civil engineering student, not a programmer, and is not familiar with git terms.
  Explain results in plain words ("saved", "live on your site") and handle branches and commits yourself.
- Work on a branch, check the result, then ask one plain question: "Publish this to your live site?"
  Publishing means merging into `main` and pushing. Never publish without a yes.
- Do not invent facts about Jobayer (skills, dates, achievements). Use what is on the site or what Jobayer tells you.
- Keep page text short. Jobayer prefers fewer words.

## Design rules

- Minimal and calm: dark background, one mint accent (`#64ffda`), Space Grotesk for headings, Inter for text,
  JetBrains Mono for small labels. No multi-colour gradients, glows, badges or a different style on one page.
- Jobayer likes motion that follows scrolling. The chosen effects are the name zoom opening, projects that slide
  sideways, self-drawing timeline lines, the flowing wind animation, and the moving sea in the opening photo
  ("Live sea" in `assets/js/site.js`; its mask is `assets/images/opening/shore-water.png`, white = water that moves). Reuse the "Scroll scenes" helpers in
  `assets/js/site.js` for anything new.
- Everything must work on phones as well as desktop. Check both sizes before saying it is done.
- Contact links stay in the side rails on large screens and in the footer.

## Technical notes

- Pages share the same header, phone menu, side rails and footer, copied into each HTML file. When one changes,
  change all six pages (`index.html`, `journal.html`, `projects/*.html`). Pages in `projects/` use `../` paths.
- Keep `overflow-x: clip` on `html` only. Putting overflow on `body` stops the pinned scroll sections sticking.
- Journal content lives in `journal/entries.js`. Jobayer does not want lists that need counting or updating;
  the "Reading now" card uses the Goodreads widget so it updates by itself.
- Renamed pages are forwarded from their old addresses in `404.html`. Add to that list if a page is renamed.
- Shrink new photos to about 1600–2000 px on the long side before adding them.
