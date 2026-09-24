# alexandre-pinoteau.fr

Source of [alexandre-pinoteau.fr](https://alexandre-pinoteau.fr/).

Hand-written HTML and CSS in [`site/`](site/). There is no framework, no build step, no web fonts and
no trackers. On every push to `main`, [`.github/workflows/pages.yml`](.github/workflows/pages.yml)
uploads `site/` to GitHub Pages as it is.

Preview locally: `python3 -m http.server -d site 8000`.
