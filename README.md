# jobayer-hosen.github.io

My portfolio website: https://jobayer-hosen.github.io

It is a plain website (HTML, CSS and a little JavaScript). There is nothing to install or build.
Whatever is on the `main` branch on GitHub is the live site, usually within a minute or two of a change.

## Where everything is

```
index.html                  Home page: opening, about, education, skills, projects, experience, contact
journal.html                Journal page (its posts come from journal/entries.js)
404.html                    "Page not found" page; also forwards old links to their new address

projects/                   One page per project
  wind-speed-mapping.html     Thesis: risk-based wind speed mapping of Bangladesh
  buriganga-zone.html         Multipurpose zone near Buriganga
  urban-metabolism.html       The Urban Metabolism Project
  mohrs-circle.html           Interactive Mohr's Circle

journal/
  entries.js                Every journal post, the districts map and the Goodreads link
  photos/                   Journal photos, one folder per trip

assets/
  css/site.css              The look of the whole site (has a list of contents at the top)
  js/site.js                Menus, photo viewer, wind animation, scroll effects (list of contents at the top)
  js/journal.js             Builds the journal from journal/entries.js
  js/tailwind-config.js     Colours and fonts for the Tailwind classes used in the pages
  images/
    favicon.svg             The small icon in the browser tab
    about/portrait.jpg      My photo in the About section
    logos/                  Logos used in the Experience section
    projects/               Project pictures, one folder per project

CLAUDE.md                   Notes for Claude, so it knows how this project works on any device
```

## Common changes

| I want to... | Where |
|---|---|
| Change the About text | `index.html`, the part marked `About` |
| Change my About photo | Replace `assets/images/about/portrait.jpg` with a new photo of the same name |
| Change the photo behind my name | `index.html`, the line with `opening-photo` |
| Add a skill | `index.html`, the part marked `Skills`: copy one line and change the name |
| Add a project | Copy a page in `projects/`, then copy one card in `index.html` under `Projects` |
| Add education or experience | `index.html`, the parts marked `Education` and `Experience & Activities` |
| Write a journal post or add photos | `journal/entries.js` (instructions are at the top of that file) |
| Update the districts map | Replace `journal/photos/bangladesh-map.jpg` and its caption in `journal/entries.js` |
| Change colours | The top of `assets/css/site.css` and `assets/js/tailwind-config.js` |

Photos straight from a phone are very large. Shrink them to about 2000 px wide before adding them.

## Working on it from another device

The project lives in this GitHub repository, so it can be opened from any device:

- **With Claude:** open the Code tab in the Claude app (or claude.ai/code), choose this repository, and say what to change.
- **By hand:** every file can be opened and edited on github.com.

Changes only reach the live site once they are on the `main` branch.
