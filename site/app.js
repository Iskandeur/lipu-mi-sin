/* building stuff. — a title you can knock over. Vanilla, no dependencies. */
(function () {
  "use strict";
  var I = window.I18N, T = I.T;
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s) { return document.querySelector(s); };
  var toastT;
  function toast(msg) {
    var t = $("#toast"); t.textContent = msg; t.classList.add("on");
    clearTimeout(toastT); toastT = setTimeout(function () { t.classList.remove("on"); }, 4200);
  }

  /* ---------- language ---------- */
  var sel = $("#lang"), prev = "en";
  function setLang(l, save) {
    if (l !== "tok") prev = l;
    I.apply(l);
    if (l !== "tok") sel.value = l;
    if (save) I.keep("lang", l === "tok" ? undefined : l);
    updateCount();
  }
  sel.addEventListener("change", function () { setLang(sel.value, true); });

  /* the greeting goes around his languages; five quick taps open the eleventh */
  var greet = $("#greet"), order = ["en", "fr", "es", "it", "ru", "ar", "he", "ja", "zh", "id"], gi = 0, taps = [];
  function showGreet(l) {
    greet.classList.add("flip");
    setTimeout(function () { greet.textContent = T[l].greet; greet.lang = l; greet.dir = I.RTL[l] ? "rtl" : "ltr"; greet.classList.remove("flip"); }, reduce ? 0 : 250);
  }
  function enterToki() { setLang("tok"); greet.textContent = "toki"; greet.lang = "tok"; greet.dir = "ltr"; toast(T.tok.found); }
  greet.addEventListener("click", function () {
    if (I.lang === "tok") { setLang(prev); return; }
    var now = Date.now(); taps = taps.filter(function (t) { return now - t < 1600; }); taps.push(now);
    if (taps.length >= 5) { taps = []; enterToki(); return; }
    gi = (gi + 1) % order.length; showGreet(order[gi]);
  });
  if (!reduce) setInterval(function () {
    if (I.lang === "tok" || document.hidden) return;
    gi = (gi + 1) % order.length; showGreet(order[gi]);
  }, 2400);

  /* ---------- the yard ---------- */
  var yard = $("#yard"), cv = $("#blocks"), cx = cv.getContext("2d");
  var W = 0, H = 0, dpr = 1, blocks = [], grab = null, knocked = 0, fontFam;
  var PAL = ["#f3ecdc", "#ff7a3d", "#7fc8f8", "#9be38c", "#ffd166"];
  var EXTRA = "ЖЯФжあん字你好龍عبשאñçàßΩ★?!&@#".split("");
  var TITLE = "building stuff.";
  fontFam = getComputedStyle(document.body).fontFamily;

  function measure(ch, size) { cx.font = "900 " + size + "px " + fontFam; return cx.measureText(ch).width; }
  function Block(ch, x, y, w, h, color, home) {
    return { ch: ch, x: x, y: y, w: w, h: h, vx: 0, vy: 0, color: color, home: home, sleep: !!home, size: h * .78, rot: 0 };
  }
  function layout() {
    var r = yard.getBoundingClientRect();
    W = r.width; H = r.height; dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    cx.setTransform(dpr, 0, 0, dpr, 0, 0);
    blocks = [];
    var rows = W < 640 ? ["stuff.", "building"] : [TITLE.replace(" ", " ")];
    var longest = rows.reduce(function (a, b) { return a.length > b.length ? a : b; });
    var size = 100, gap = 0;
    var wAt = function (s) { var t = 0; for (var i = 0; i < longest.length; i++) t += measure(longest[i], s) + gap; return t; };
    size = Math.min(size * (W * .96) / wAt(size), H / (rows.length * 1.18 + .2));
    var bh = size * 1.12, ground = H, colorI = 0;
    rows.forEach(function (row, ri) {
      var y = ground - bh * (ri + 1);
      var x = Math.max(4, (W - wAt(size) * row.length / longest.length) * 0) + 4;
      for (var i = 0; i < row.length; i++) {
        var ch = row[i], cw = measure(ch, size);
        if (ch === " ") { x += cw * 1.1; continue; }
        var b = Block(ch, x, y, cw, bh, ri === 0 && rows.length > 1 ? PAL[0] : PAL[0], { x: x, y: y });
        b.size = size; b.idx = colorI++;
        blocks.push(b); x += cw + gap;
      }
    });
    blocks.forEach(function (b) { b.supp = supported(b); });
    yard.classList.add("live");
    knocked = 0; updateCount();
  }
  function spawn(ch, x) {
    var size = Math.max(34, Math.min(80, W / 9));
    var w = measure(ch, size) * .9 + size * .2, h = size * 1.12;
    var b = Block(ch, Math.max(0, Math.min(W - w, x - w / 2)), -h - 10, w, h, PAL[1 + (blocks.length % 4)], null);
    b.size = size; b.vy = 2; b.vx = (Math.random() - .5) * 4;
    blocks.push(b);
    if (blocks.length > 90) { var k = blocks.findIndex(function (q) { return !q.home; }); if (k >= 0) blocks.splice(k, 1); }
  }
  function overlap(a, b) { return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y; }
  function supported(a) {
    if (a.y + a.h >= H - 1) return true;
    for (var i = 0; i < blocks.length; i++) {
      var o = blocks[i]; if (o === a) continue;
      if (o.x < a.x + a.w - 2 && o.x + o.w > a.x + 2 && Math.abs(a.y + a.h - o.y) < 3) return true;
    }
    return false;
  }
  function step() {
    var G = .55, n = blocks.length, i, j;
    for (i = 0; i < n; i++) {
      var b = blocks[i];
      if (b === grab) continue;
      if (b.sleep) { if (b.supp && !supported(b)) b.sleep = false; else continue; }
      b.vy = Math.min(b.vy + G, 28); b.vx *= .995;
      b.x += b.vx; b.y += b.vy;
      if (b.y + b.h > H) { b.y = H - b.h; b.vy *= -.25; b.vx *= .82; if (Math.abs(b.vy) < 1) b.vy = 0; }
      if (b.x < 0) { b.x = 0; b.vx *= -.5; }
      if (b.x + b.w > W) { b.x = W - b.w; b.vx *= -.5; }
      b.rot += (b.vx * .004 - b.rot) * .2;
    }
    for (var it = 0; it < 4; it++) for (i = 0; i < n; i++) for (j = i + 1; j < n; j++) {
      var a = blocks[i], c = blocks[j];
      if (!overlap(a, c)) continue;
      var fa = a.sleep && a !== grab, fc = c.sleep && c !== grab;
      var moving = Math.abs(a.vx) + Math.abs(a.vy) + Math.abs(c.vx) + Math.abs(c.vy);
      if (fa && moving > 3) { a.sleep = fa = false; }
      if (fc && moving > 3) { c.sleep = fc = false; }
      if (a === grab) fa = true; if (c === grab) fc = true;
      if (fa && fc) continue;
      var ox = Math.min(a.x + a.w, c.x + c.w) - Math.max(a.x, c.x);
      var oy = Math.min(a.y + a.h, c.y + c.h) - Math.max(a.y, c.y);
      var wa = fa ? 0 : (fc ? 1 : .5), wc = 1 - wa;
      if (fc && !fa) { wa = 1; wc = 0; }
      if (ox < oy) {
        var sx = a.x < c.x ? -1 : 1;
        a.x += sx * ox * wa; c.x -= sx * ox * wc;
        var vx = (a.vx * (fc ? 0 : 1) + c.vx * (fa ? 0 : 1)) / ((fa || fc) ? 1 : 2);
        if (!fa) a.vx = fc ? -a.vx * .3 + c.vx : vx; if (!fc) c.vx = fa ? -c.vx * .3 + a.vx : vx;
      } else {
        var sy = a.y < c.y ? -1 : 1;
        a.y += sy * oy * wa; c.y -= sy * oy * wc;
        var top = sy < 0 ? a : c, bot = top === a ? c : a;
        if (top !== grab && !(top.sleep)) { top.vy = Math.min(top.vy, bot.vy) * (bot === grab ? 1 : .2); top.vx += (bot.vx - top.vx) * .3; }
        if (bot !== grab && !bot.sleep && top.vy > bot.vy) bot.vy = top.vy * .4;
      }
    }
    var k = 0;
    for (i = 0; i < n; i++) { var q = blocks[i]; if (q.home && (Math.abs(q.x - q.home.x) > q.w * .6 || Math.abs(q.y - q.home.y) > q.h * .5)) k++; }
    if (k !== knocked) { knocked = k; updateCount(); }
  }
  function rr(x, y, w, h, r) { cx.beginPath(); cx.moveTo(x + r, y); cx.arcTo(x + w, y, x + w, y + h, r); cx.arcTo(x + w, y + h, x, y + h, r); cx.arcTo(x, y + h, x, y, r); cx.arcTo(x, y, x + w, y, r); cx.closePath(); }
  function draw() {
    cx.clearRect(0, 0, W, H);
    cx.textAlign = "center"; cx.textBaseline = "middle";
    for (var i = 0; i < blocks.length; i++) {
      var b = blocks[i], awake = !b.sleep;
      cx.save(); cx.translate(b.x + b.w / 2, b.y + b.h / 2); cx.rotate(b.rot);
      if (awake || b === grab) { rr(-b.w / 2, -b.h / 2, b.w, b.h, Math.min(12, b.w * .18)); cx.fillStyle = b.home ? "#f3ecdc" : b.color; cx.fill(); cx.fillStyle = "#14110d"; }
      else cx.fillStyle = "#f3ecdc";
      cx.font = "900 " + b.size + "px " + fontFam;
      cx.fillText(b.ch, 0, b.h * .04);
      cx.restore();
    }
  }
  var running = false, last = 0;
  function loop(t) {
    var steps = last ? Math.min(3, Math.round((t - last) / 16.7)) || 1 : 1; last = t;
    while (steps--) step();
    draw();
    var busy = grab || blocks.some(function (b) { return !b.sleep && (Math.abs(b.vx) > .05 || Math.abs(b.vy) > .05 || b.y + b.h < H - 1 && !supported(b)) || (b.sleep && b.supp && !supported(b)); }) || rebuilding;
    if (busy) requestAnimationFrame(loop); else { running = false; last = 0; }
  }
  function kick() { if (!running) { running = true; requestAnimationFrame(loop); } }

  /* pointer: grab and fling a block, or tap the empty sky to drop a letter */
  var px = 0, py = 0, hist = [];
  function pos(e) { var r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
  cv.addEventListener("pointerdown", function (e) {
    var p = pos(e); rebuilding = false;
    for (var i = blocks.length - 1; i >= 0; i--) {
      var b = blocks[i];
      if (p.x >= b.x - 6 && p.x <= b.x + b.w + 6 && p.y >= b.y - 6 && p.y <= b.y + b.h + 6) {
        grab = b; b.sleep = false; b.vx = b.vy = 0; px = p.x - b.x; py = p.y - b.y; hist = [{ x: p.x, y: p.y, t: e.timeStamp }];
        cv.setPointerCapture(e.pointerId); kick(); return;
      }
    }
    tapAt = { x: p.x, y: p.y };
  });
  /* a finger on a letter grabs it; a finger on the sky still scrolls the page */
  function hit(p) {
    for (var i = blocks.length - 1; i >= 0; i--) { var b = blocks[i];
      if (p.x >= b.x - 6 && p.x <= b.x + b.w + 6 && p.y >= b.y - 6 && p.y <= b.y + b.h + 6) return b; }
    return null;
  }
  cv.addEventListener("touchstart", function (e) {
    var t = e.touches[0], r = cv.getBoundingClientRect();
    if (hit({ x: t.clientX - r.left, y: t.clientY - r.top })) e.preventDefault();
  }, { passive: false });
  cv.addEventListener("pointermove", function (e) {
    if (!grab) return;
    var p = pos(e);
    grab.x = Math.max(0, Math.min(W - grab.w, p.x - px)); grab.y = Math.min(H - grab.h, p.y - py);
    hist.push({ x: p.x, y: p.y, t: e.timeStamp }); if (hist.length > 5) hist.shift();
  });
  var tapAt = null;
  cv.addEventListener("pointerup", function (e) {
    if (!tapAt) return; var p = pos(e);
    if (Math.abs(p.x - tapAt.x) + Math.abs(p.y - tapAt.y) < 12) { spawn(EXTRA[(Math.random() * EXTRA.length) | 0], p.x); kick(); }
    tapAt = null;
  });
  cv.addEventListener("pointercancel", function () { tapAt = null; });
  function drop() {
    if (!grab) return;
    var a = hist[0], z = hist[hist.length - 1], dt = Math.max(16, z.t - a.t) / 16.7;
    grab.vx = Math.max(-40, Math.min(40, (z.x - a.x) / dt)); grab.vy = Math.max(-40, Math.min(40, (z.y - a.y) / dt));
    grab = null; kick();
  }
  cv.addEventListener("pointerup", drop); cv.addEventListener("pointercancel", drop);

  /* rebuild: everyone walks home */
  var rebuilding = false;
  $("#rebuild").addEventListener("click", function () {
    blocks = blocks.filter(function (b) { return b.home; });
    blocks.forEach(function (b) { b.sleep = true; b.vx = b.vy = 0; });
    rebuilding = true;
    var t0 = performance.now(), from = blocks.map(function (b) { return { x: b.x, y: b.y, r: b.rot }; });
    (function home(t) {
      var k = reduce ? 1 : Math.min(1, (t - t0) / 700), e = 1 - Math.pow(1 - k, 3);
      blocks.forEach(function (b, i) { b.x = from[i].x + (b.home.x - from[i].x) * e; b.y = from[i].y + (b.home.y - from[i].y) * e; b.rot = from[i].r * (1 - e); });
      draw();
      if (k < 1 && rebuilding) requestAnimationFrame(home); else { rebuilding = false; knocked = 0; updateCount(); }
    })(t0);
  });

  function updateCount() {
    var el = $("#count"); if (!el) return;
    el.textContent = knocked ? (T[I.lang] || T.en).count.replace("{n}", knocked) : "";
  }

  /* typing drops letters too; typing t-o-k-i opens the eleventh language */
  var typed = "";
  document.addEventListener("keydown", function (e) {
    if (e.ctrlKey || e.metaKey || e.altKey || e.key.length !== 1) return;
    var tg = e.target.tagName; if (tg === "SELECT" || tg === "INPUT" || tg === "TEXTAREA") return;
    typed = (typed + e.key.toLowerCase()).slice(-4);
    if (typed === "toki" && I.lang !== "tok") enterToki();
    var r = yard.getBoundingClientRect();
    if (e.key !== " " && r.bottom > 0 && r.top < innerHeight) { spawn(e.key, Math.random() * W); kick(); }
  });

  var rw = 0;
  window.addEventListener("resize", function () { var w = yard.getBoundingClientRect().width; if (Math.abs(w - rw) > 40) { rw = w; layout(); draw(); } });

  setLang(I.lang, false);
  showGreet(I.lang === "tok" ? "en" : I.lang); gi = Math.max(0, order.indexOf(I.lang));
  rw = yard.getBoundingClientRect().width; layout(); draw();

  /* #chaos: arrive after the earthquake */
  function chaos() {
    blocks.forEach(function (b) { b.sleep = false; b.vx = (Math.random() - .5) * 26; b.vy = -6 - Math.random() * 14; });
    for (var i = 0; i < 8; i++) spawn(EXTRA[(Math.random() * EXTRA.length) | 0], Math.random() * W);
    kick();
  }
  if (location.hash === "#chaos") setTimeout(chaos, 400);
  window.addEventListener("hashchange", function () { if (location.hash === "#chaos") chaos(); });

  console.log("%cbuilding stuff.", "font:900 28px system-ui;color:#ff7a3d", "\nYou opened the console. Nothing is minified, help yourself. Try typing a word on the page.");
})();
