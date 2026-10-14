# Jocelyne Audrey Tando: Portfolio

An illustrated, interactive one-page portfolio plus a searchable projects page. Plain HTML/CSS/JS, no build step.

- `index.html`: home (interactive bedroom, About, Education & Organizations, Projects by category, Contact in her living room)
- `projects.html` + `projects.js`: all projects with category tabs, search and a Team / Individual filter (`?cat=game&q=unity&collab=team`)
- `shared.js`: project data (`projects`, `TOOLS`, `TEAM`), helpers, the project popup and the theme switch, used by both pages
- `script.js`: home-page logic (project categories, organizations, search palette, scroll progress)
- `world.js` + `world.css`: the illustrated scenes and the chibi Celyne + poodle
- `style.css`: design tokens and layout
- `img/`: thumbnails, `me.jpg`, `tools/` (software logos), `logos/` (school and organization logos)

Videos stream from the desk-version portfolio (see `MEDIA` in `shared.js`).
To add or edit a project, change `projects` in `shared.js`; mark team projects in `TEAM`.
