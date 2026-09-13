# Flagship Techs — static site

Plain HTML, CSS and JavaScript. No build step, no framework, no
dependencies to install.

## Files

| File | What it is |
| --- | --- |
| `index.html` | The whole page. All text and images live here. |
| `styles.css` | All styling. Design tokens are the `:root` block at the top. |
| `script.js` | Menu, scroll reveals, laptop filter, quick view. Enhancement only. |
| `favicon.svg`, `logo.svg` | Brand marks. |
| `.nojekyll` | Tells GitHub Pages to serve the files as-is. Leave it. |

## Viewing it

Double-click `index.html`. It opens in your browser and works —
no server needed.

## Editing it

Everything is where you'd expect:

- **Prices, specs, product names** — search `index.html` for the text
  and change it. A system's quick-view specs are the `data-` attributes
  on its card button, so edit them in the same place as the card.
- **Colours, fonts, spacing** — the `:root` block at the top of
  `styles.css`. Change `--copper` and the accent updates everywhere.
- **Photos** — the `src` and `srcset` on each `<img>`. They currently
  point at Unsplash. To use your own, drop files next to `index.html`
  and use a relative path like `images/hero.jpg`. Use `./` or a bare
  relative path, never a leading `/`, so the site keeps working when
  it is served from a subfolder.

## Publishing to GitHub Pages

Two ways, pick one.

**Automatic.** Push this repo to GitHub, then set
**Settings → Pages → Source** to **GitHub Actions**. The workflow in
`.github/workflows/deploy.yml` publishes this folder on every push.

**Manual.** Upload the *contents* of this folder (not the folder
itself) to the repo root, then set **Settings → Pages → Source** to
**Deploy from a branch → main → / (root)**.

Either way, `index.html` must end up at the top level of what Pages
serves, with `styles.css`, `script.js` and the SVGs beside it.

## Notes

- Every path in `index.html` is relative, so the site works at a
  domain root *and* under a project subpath
  (`username.github.io/repo/`).
- If `script.js` fails to load, the page still renders and reads
  completely — it just stops animating. All content is real HTML.
