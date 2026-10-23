/* Blog i18n — same language model as the home page, for whole articles.
   Each article is one file per language: <slug>.html (French, canonical) and
   <slug>.<lang>.html for the others. This script, loaded in <head> before paint:
     1. picks the language (?lang= > saved choice > browser > French),
     2. redirects to the matching translation if it exists and isn't the one shown,
     3. fills the <select id="blog-lang"> switcher and the hreflang links.
   The saved choice uses the same localStorage key ("lang") as the home page, so a
   language chosen anywhere on the site follows the reader to the articles. */
(function () {
  var NAMES = { en: "EN", fr: "FR", es: "ES", it: "IT", ru: "RU", ar: "AR", ja: "JA", zh: "ZH", id: "ID" };
  var RTL = { ar: 1 };
  var cfg = window.__ARTICLE || {};
  var here = (cfg.lang || document.documentElement.lang || "fr").toLowerCase();
  // Languages this article is actually available in (set per page). Always includes French.
  var langs = (cfg.langs && cfg.langs.length ? cfg.langs : ["fr"]).filter(function (l) { return NAMES[l]; });
  var slug = cfg.slug || location.pathname.split("/").pop().replace(/\.[a-z]{2,3}\.html$/, "").replace(/\.html$/, "");

  function saved(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function keep(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function fileFor(l) { return l === "fr" ? slug + ".html" : slug + "." + l + ".html"; }

  function pick() {
    var q = (location.search.match(/[?&]lang=([a-z]{2,3})/i) || [])[1];
    if (q) { q = q.toLowerCase(); if (NAMES[q]) return q; }
    var s = saved("lang"); if (s && NAMES[s]) return s;
    var list = navigator.languages || [navigator.language || "fr"];
    for (var i = 0; i < list.length; i++) {
      var b = String(list[i]).toLowerCase().split("-")[0];
      if (b === "in") b = "id";
      if (NAMES[b]) return b;
    }
    return "fr";
  }

  // 1 + 2. Redirect to the reader's language when a translation exists and differs
  // from the page currently loaded. ?lang= is an explicit override and always wins.
  // No loop is possible: the target file is served in `avail`, so on it here===avail
  // and this block is skipped (pick() is deterministic for a given browser/choice).
  var want = pick();
  var forced = /[?&]lang=/i.test(location.search);
  var avail = langs.indexOf(want) >= 0 ? want : "fr";
  if (avail !== here) {
    location.replace(fileFor(avail) + location.search + location.hash);
    return;
  }
  // We are staying on this page: remember its language as the site-wide choice only
  // when the reader asked for it explicitly (so auto-detect never overwrites a prior pick).
  if (forced) keep("lang", here);

  document.documentElement.lang = here;
  document.documentElement.dir = RTL[here] ? "rtl" : "ltr";

  // 3. hreflang alternates (built once the head is parsed).
  function addAlternates() {
    var head = document.head; if (!head) return;
    function abs(p) { try { return new URL(p, location.href).href; } catch (e) { return p; } }
    for (var i = 0; i < langs.length; i++) {
      var l = langs[i], link = document.createElement("link");
      link.rel = "alternate"; link.hreflang = l; link.href = abs(fileFor(l));
      head.appendChild(link);
    }
    var x = document.createElement("link");
    x.rel = "alternate"; x.hreflang = "x-default"; x.href = abs(fileFor("fr"));
    head.appendChild(x);
  }
  addAlternates();

  // The switcher is wired once the DOM is ready.
  function wire() {
    var sel = document.getElementById("blog-lang");
    if (!sel) return;
    sel.innerHTML = "";
    for (var i = 0; i < langs.length; i++) {
      var o = document.createElement("option");
      o.value = langs[i]; o.textContent = NAMES[langs[i]];
      if (langs[i] === here) o.selected = true;
      sel.appendChild(o);
    }
    sel.addEventListener("change", function () {
      var l = sel.value;
      keep("lang", l);
      try { sessionStorage.removeItem("blog-redir:" + slug); } catch (e) {}
      location.href = fileFor(l) + location.hash;
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", wire);
  else wire();
})();
