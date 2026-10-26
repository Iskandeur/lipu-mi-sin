# alexandre-pinoteau.fr

Source of [alexandre-pinoteau.fr](https://alexandre-pinoteau.fr/).

Hand-written HTML, CSS and a little JavaScript in [`site/`](site/) (one blog post also uses three.js, served from
[`site/blog/vendor/`](site/blog/vendor/)). There is no framework, no build step and no web fonts. Cloudflare, in front of
the domain, adds its cookieless Web Analytics script to the pages. On every push to `main`, [`.github/workflows/pages.yml`](.github/workflows/pages.yml)
uploads `site/` to GitHub Pages as it is.

[`site/age/`](site/age/) is a separate game ("Quel âge ?", served at `/age/`): a generated build of a private project, copied here as is
(`node scripts/build.mjs --public` there), so edit it in its own repository rather than by hand.

Preview locally: `python3 -m http.server -d site 8000`.

## Writing a post (rule: five languages, or a ticket that says which are missing)

A post is born in French (`site/blog/<slug>.html`, the canonical file) together with its four translations
(`<slug>.en.html`, `.es`, `.it`, `.id`), all in the same pull request. Start from [`modeles/article.html`](modeles/article.html),
whose header comment is the checklist:

1. the five files, each with its own `lang`, title and `window.__ARTICLE`;
2. one `<li>` at the top of the `#posts` list in `site/index.html`, with `data-post` / `data-langs` and the title as `data-i="post_<slug>"`;
3. `"post_<slug>"` added to the `en`, `fr`, `es`, `it` and `id` blocks of `site/i18n.js`. The home page then shows the title in
   the visitor's language and links straight to the matching version (ru, ar, ja, zh and the tenth language fall back to French);
4. any text a post's own script prints (like `site/blog/ombres-txt.js`) translated too.

If a translation cannot ship with the post, open a ticket that names the missing languages and put `data-langs` to what exists:
the home page then falls back to the French page for the others.

Check before merging: load the home page and one post with `navigator.languages = ["en-US"]` and see English titles and the English
article (a headless Chromium on the local server is enough).
