# alexandre-pinoteau.fr

Source of [alexandre-pinoteau.fr](https://alexandre-pinoteau.fr/).

Hand-written HTML, CSS and a little JavaScript in [`site/`](site/) (one blog post also uses three.js, served from
[`site/blog/vendor/`](site/blog/vendor/)). There is no framework, no build step and no web fonts. Cloudflare, in front of
the domain, adds its cookieless Web Analytics script to the pages. On every push to `main`, [`.github/workflows/pages.yml`](.github/workflows/pages.yml)
uploads `site/` to GitHub Pages as it is.

Preview locally: `python3 -m http.server -d site 8000`.
