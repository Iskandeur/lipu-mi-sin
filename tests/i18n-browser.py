#!/usr/bin/env python3
"""Renders the home page and every post in headless Chromium with a given browser language and checks that the
post titles, the links and the redirects follow it. No network: the site is mounted read-only in a container
(zenika/alpine-chrome) that has no network at all.

    python3 tests/i18n-browser.py            # all cases
    python3 tests/i18n-browser.py -v         # print what was seen

Needs docker and the image zenika/alpine-chrome. Exit code 1 on the first failed expectation."""
import html
import json
import os
import re
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = os.path.join(ROOT, 'site')
VERBOSE = '-v' in sys.argv

# slug -> title per language, as the home page must show it (read from site/i18n.js, so the test follows the dictionary)
POSTS = {'ombres': 'post_ombres', 'arnaque-vote-whatsapp': 'post_vote', 'brixhub': 'post_brixhub'}
LANGS_WITH_ARTICLES = ['fr', 'en', 'es', 'it', 'id']


def dictionary():
    js = open(os.path.join(SITE, 'i18n.js'), encoding='utf-8').read()
    out = {}
    for lang in LANGS_WITH_ARTICLES:
        block = js[js.index('    %s: {\n' % lang):]
        block = block[:block.index('\n    },')] if '\n    },' in block else block
        out[lang] = {k: json.loads('"' + v + '"') for k, v in re.findall(r'"(post_\w+)": "((?:[^"\\]|\\.)*)"', block)}
    return out


def render(path, lang):
    r = subprocess.run(
        ['docker', 'run', '--rm', '--network', 'none',  '--memory', '1g', '--memory-swap', '1g', '--cpus', '1',
         '--user', '%d:%d' % (os.getuid(), os.getgid()), '-v', SITE + ':/site:ro', 'zenika/alpine-chrome:latest',
         '--no-sandbox', '--disable-gpu', '--allow-file-access-from-files', '--accept-lang=' + lang, '--virtual-time-budget=8000', '--dump-dom',
         'file:///site/' + path],
        capture_output=True, text=True, timeout=120)
    if r.returncode != 0 or '<html' not in r.stdout:
        raise SystemExit('chromium failed on %s (%s): %s' % (path, lang, r.stderr[-400:]))
    return r.stdout


def home_posts(dom):
    items = re.findall(r'<a href="(blog/[^"]+)"[^>]*data-post="([^"]+)"[^>]*>.*?<span[^>]*>(.*?)</span></a>', dom, flags=re.S)
    return {slug: (href, html.unescape(re.sub('<[^>]+>', '', t)).strip()) for href, slug, t in items}


def norm(t):
    return re.sub(r'\s+', ' ', html.unescape(t)).strip()


def scene_texts():
    js = open(os.path.join(SITE, 'blog', 'ombres-txt.js'), encoding='utf-8').read()
    return json.loads(js[js.index('window.OMBRES_TXT = ') + 20:js.rindex('}') + 1])


def main():
    T = scene_texts()
    D = dictionary()
    fails = []

    def expect(cond, msg):
        if not cond:
            fails.append(msg)
            print('FAIL', msg)
        elif VERBOSE:
            print('ok  ', msg)

    # (browser language, language the site must pick for the articles)
    for browser, want in [('en-US', 'en'), ('fr-FR', 'fr'), ('es-ES', 'es'), ('it-IT', 'it'), ('id-ID', 'id'),
                          ('ja-JP', 'fr')]:  # ja has no article translation: the French pages
        dom = render('index.html', browser)
        got = home_posts(dom)
        for slug, key in POSTS.items():
            href, title = got.get(slug, (None, None))
            expect(title == D[want][key], 'home [%s] title of %s: %r' % (browser, slug, title))
            expect(href == 'blog/%s%s.html' % (slug, '' if want == 'fr' else '.' + want),
                   'home [%s] link of %s: %s' % (browser, slug, href))
        # an article opened directly in the "wrong" language lands on the reader's
        for slug in POSTS:
            dom = render('blog/%s.html' % slug, browser)
            lang = re.search(r'<html lang="(\w+)"', dom).group(1)
            expect(lang == want, 'article [%s] %s opens in %s (got %s)' % (browser, slug, want, lang))
            h1 = html.unescape(re.sub('<[^>]+>', '', re.search(r'<h1[^>]*>(.*?)</h1>', dom, flags=re.S).group(1)))
            expect(norm(h1) == norm(D[want][POSTS[slug]]), 'article [%s] %s h1: %r' % (browser, slug, h1))
        # the 3D essay prints its own texts: the dictionary must have been picked up (initial values are rewritten)
        dom = render('blog/ombres.%s.html' % want if want != 'fr' else 'blog/ombres.html', browser)
        verdict = re.search(r'<p class="verdict"[^>]*>(.*?)</p>', dom, flags=re.S)
        expect(verdict and norm(verdict.group(1)) == norm(T[want]['t_ombres']), 'ombres [%s] scene text in %s: %r' % (browser, want, verdict and verdict.group(1)))
    print('FAILED %d' % len(fails) if fails else 'all good')
    sys.exit(1 if fails else 0)


main()
