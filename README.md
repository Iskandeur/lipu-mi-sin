# alexandre-pinoteau.fr

Source of [alexandre-pinoteau.fr](https://alexandre-pinoteau.fr/).

Hand-written HTML, CSS and a little JavaScript in [`site/`](site/) (one blog post also uses three.js, served from
[`site/blog/vendor/`](site/blog/vendor/)). There is no framework, no build step and no web fonts. Cloudflare, in front of
the domain, adds its cookieless Web Analytics script to the pages. On every push to `main`, [`.github/workflows/pages.yml`](.github/workflows/pages.yml)
uploads `site/` to GitHub Pages as it is.

Preview locally: `python3 -m http.server -d site 8000`.

## Writing a post (rule: nine languages, or a ticket that says which are missing)

A post is born in French (`site/blog/<slug>.html`, the canonical file) together with its eight translations
(`<slug>.en.html`, `.es`, `.it`, `.ru`, `.ar`, `.ja`, `.zh`, `.id`), all in the same pull request. Start from
[`modeles/article.html`](modeles/article.html), whose header comment is the checklist:

1. the nine files, each with its own `lang`, title and `window.__ARTICLE` (whose `langs` lists the nine languages). Arabic is
   right-to-left: `<html lang="ar" dir="rtl">`, and Latin-script fragments wrapped in `<bdi dir="ltr">`; `blog/blog.css` already
   adjusts ar, ja and zh. The existing posts (`brixhub.<lang>.html`) show each language's conventions;
2. one `<li>` at the top of the `#posts` list in `site/index.html`, with `data-post` / `data-langs` and the title as `data-i="post_<slug>"`;
3. `"post_<slug>"` added to the `en`, `fr`, `es`, `it`, `ru`, `ar`, `ja`, `zh` and `id` blocks of `site/i18n.js`, then the `?v=` of
   `i18n.js` raised in `site/index.html`. The home page then shows the title in the visitor's language and links straight to the
   matching version (the tenth language of the home page, toki pona, falls back to French);
4. any text a post's own script prints (like `site/blog/ombres-txt.js`) translated too, plural forms included.

If a translation cannot ship with the post, open a ticket that names the missing languages and put `data-langs` to what exists:
the home page then falls back to the French page for the others.

Check before merging: load the home page and one post with `navigator.languages = ["en-US"]` and see English titles and the English
article (a headless Chromium on the local server is enough).
