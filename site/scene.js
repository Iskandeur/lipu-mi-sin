/* The scene breathes: depth that follows the mouse (or the phone's tilt), lanterns that glow when you
   come near and ring when you touch them, light travelling along the threads, embers in front. */
(function () {
  "use strict";
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches || /[?&]still/.test(location.search);
  var yard = document.getElementById("yard"), box = document.getElementById("artbox"), img = document.getElementById("art");
  var cv = document.getElementById("sky"), cx = cv.getContext("2d");
  var IW = 5504, IH = 3072, W = 0, H = 0, dpr = 1, map = { s: 1, ox: 0, oy: 0 };
  /* where the lanterns sit in the picture (fractions of the image) */
  var L = [[.165, .52], [.268, .445], [.44, .445], [.545, .425], [.615, .445], [.64, .485], [.708, .425], [.77, .445],
    [.8, .43], [.865, .5], [.772, .545], [.675, .68], [.85, .61], [.51, .545]];
  var LINKS = [[13, 3], [13, 6], [13, 9], [3, 6], [6, 8], [8, 9], [13, 10], [10, 11], [10, 12], [1, 2], [2, 13], [0, 1], [4, 5], [5, 13]];
  var SCREEN = [.33, .59];
  var lamps = L.map(function (p, i) { return { fx: p[0], fy: p[1], glow: 0, ph: Math.random() * 6.28, i: i }; });
  var pulses = [], embers = [], stars = [];
  var mx = 0, my = 0, tx = 0, ty = 0, near = -1, pointer = null, visible = true;

  function layout() {
    var r = yard.getBoundingClientRect(), b = box.getBoundingClientRect();
    W = r.width; H = r.height; dpr = Math.min(devicePixelRatio || 1, W > 1600 ? 1 : 2);
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); cx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var bw = box.offsetWidth, bh = box.offsetHeight, s = Math.max(bw / IW, bh / IH);
    var pos = getComputedStyle(img).objectPosition.split(" ").map(function (v) { return parseFloat(v) / 100; });
    map = { s: s, ox: box.offsetLeft + (bw - IW * s) * (pos[0] || .5), oy: box.offsetTop + (bh - IH * s) * (pos[1] || .5) };
    stars = []; for (var i = 0; i < 46; i++) stars.push({ fx: Math.random(), fy: Math.random() * .2, ph: Math.random() * 6.28, sp: .6 + Math.random() * 1.6 });
    if (!embers.length) for (var k = 0; k < 18; k++) embers.push(ember(true));
  }
  function ember(anywhere) {
    return { x: Math.random() * (W || 1000), y: anywhere ? Math.random() * (H || 600) : (H || 600) + 10, r: .8 + Math.random() * 1.8,
      v: .15 + Math.random() * .45, sway: Math.random() * 6.28, d: .5 + Math.random() };
  }
  function at(fx, fy, depth) { return { x: map.ox + fx * IW * map.s - mx * 14 * depth, y: map.oy + fy * IH * map.s - my * 10 * depth }; }

  /* depth: the picture drifts a little against the pointer; lights ride with it, embers move more */
  function setPointer(nx, ny) { tx = Math.max(-1, Math.min(1, nx)); ty = Math.max(-1, Math.min(1, ny)); }
  yard.addEventListener("pointermove", function (e) {
    var r = yard.getBoundingClientRect();
    setPointer((e.clientX - r.left) / r.width * 2 - 1, (e.clientY - r.top) / r.height * 2 - 1);
    pointer = { x: e.clientX - r.left, y: e.clientY - r.top };
  }, { passive: true });
  yard.addEventListener("pointerleave", function () { pointer = null; tx = ty = 0; });
  addEventListener("deviceorientation", function (e) {
    if (e.gamma == null) return;
    setPointer(e.gamma / 25, (e.beta - 45) / 30);
  }, { passive: true });

  function hitLamp(x, y) {
    var best = -1, bd = 34 * 34;
    lamps.forEach(function (l, i) { var p = at(l.fx, l.fy, 1), d = (p.x - x) * (p.x - x) + (p.y - y) * (p.y - y); if (d < bd) { bd = d; best = i; } });
    return best;
  }
  function send(from) {
    LINKS.forEach(function (k) {
      if (k[0] === from || k[1] === from) pulses.push({ a: from, b: k[0] === from ? k[1] : k[0], t: 0, hop: 0 });
    });
  }
  /* a tap on a lantern lights the graph instead of dropping a letter (app.js asks first) */
  window.SCENE = {
    tap: function (x, y) {
      var i = hitLamp(x, y); if (i < 0) return false;
      lamps[i].glow = 1.6; send(i); if (window.SOUND) SOUND.pulse(i); if (reduce) stillPulse(); else kick(); return true;
    },
    over: function (x, y) { return hitLamp(x, y) >= 0; }
  };

  function draw(t) {
    cx.clearRect(0, 0, W, H);
    mx += (tx - mx) * .06; my += (ty - my) * .06;
    if (!reduce) box.style.transform = "translate3d(" + (-mx * 14).toFixed(2) + "px," + (-my * 10).toFixed(2) + "px,0)";
    var s = t / 1000;
    /* stars */
    stars.forEach(function (st) {
      var p = at(st.fx, st.fy, .6), a = .25 + .55 * Math.max(0, Math.sin(s * st.sp + st.ph));
      cx.fillStyle = "rgba(255,244,214," + a.toFixed(3) + ")"; cx.fillRect(Math.round(p.x), Math.round(p.y), 2, 2);
    });
    /* the laptop screen breathes */
    var sp = at(SCREEN[0], SCREEN[1], 1), sg = cx.createRadialGradient(sp.x, sp.y, 0, sp.x, sp.y, 70 * map.s * 9);
    sg.addColorStop(0, "rgba(111,227,204," + (.12 + .06 * Math.sin(s * 1.7)).toFixed(3) + ")"); sg.addColorStop(1, "rgba(111,227,204,0)");
    cx.fillStyle = sg; cx.fillRect(sp.x - 400, sp.y - 400, 800, 800);
    /* lanterns: a slow flicker, brighter when the pointer comes close */
    var hov = pointer ? hitLamp(pointer.x, pointer.y) : -1;
    if (hov !== near) { near = hov; if (hov >= 0 && window.SOUND) SOUND.lantern(hov); }
    cx.globalCompositeOperation = "lighter";
    lamps.forEach(function (l, i) {
      var target = i === hov ? 1 : 0; l.glow += (target - l.glow) * .08;
      var p = at(l.fx, l.fy, 1), fl = .5 + .5 * Math.sin(s * 2.3 + l.ph) * Math.sin(s * 3.7 + l.ph * 2);
      var r = (14 + 10 * fl + 26 * Math.max(0, l.glow)) * Math.max(.6, map.s * 3.2);
      var g = cx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
      g.addColorStop(0, "rgba(255,170,90," + (.22 + .1 * fl + .4 * Math.min(1, l.glow)).toFixed(3) + ")"); g.addColorStop(1, "rgba(255,120,60,0)");
      cx.fillStyle = g; cx.beginPath(); cx.arc(p.x, p.y, r, 0, 6.29); cx.fill();
    });
    /* hovering a lantern: a thread reaches for the pointer */
    if (hov >= 0 && pointer) {
      var hp = at(lamps[hov].fx, lamps[hov].fy, 1);
      cx.strokeStyle = "rgba(255,180,110,.5)"; cx.setLineDash([3, 5]); cx.lineWidth = 1.5;
      cx.beginPath(); cx.moveTo(hp.x, hp.y); cx.lineTo(pointer.x, pointer.y); cx.stroke(); cx.setLineDash([]);
    }
    /* light travelling along the threads, hop by hop */
    for (var k = pulses.length - 1; k >= 0; k--) {
      var q = pulses[k]; q.t += .025;
      var a = at(lamps[q.a].fx, lamps[q.a].fy, 1), b = at(lamps[q.b].fx, lamps[q.b].fy, 1);
      var x = a.x + (b.x - a.x) * q.t, y = a.y + (b.y - a.y) * q.t;
      var pg = cx.createRadialGradient(x, y, 0, x, y, 12); pg.addColorStop(0, "rgba(255,230,170,.95)"); pg.addColorStop(1, "rgba(255,160,80,0)");
      cx.fillStyle = pg; cx.beginPath(); cx.arc(x, y, 12, 0, 6.29); cx.fill();
      if (q.t >= 1) {
        pulses.splice(k, 1); lamps[q.b].glow = Math.max(lamps[q.b].glow, 1.1);
        if (q.hop < 1) LINKS.forEach(function (ln) { var o = ln[0] === q.b ? ln[1] : ln[1] === q.b ? ln[0] : -1; if (o >= 0 && o !== q.a) pulses.push({ a: q.b, b: o, t: 0, hop: q.hop + 1 }); });
        if (window.SOUND) SOUND.tick();
      }
    }
    /* embers rising in front, the closest layer */
    embers.forEach(function (e, n) {
      e.y -= e.v; e.sway += .01;
      var x = e.x + Math.sin(e.sway) * 12 - mx * 30 * e.d, y = e.y - my * 18 * e.d;
      cx.fillStyle = "rgba(255,150,80," + (.35 + .3 * Math.sin(e.sway * 3)).toFixed(3) + ")";
      cx.fillRect(Math.round(x), Math.round(y), e.r * 1.5, e.r * 1.5);
      if (e.y < -10) embers[n] = ember(false);
    });
    cx.globalCompositeOperation = "source-over";
  }
  var running = false;
  function loop(t) { if (!visible || document.hidden) { running = false; return; } draw(t); requestAnimationFrame(loop); }
  function kick() { if (reduce) { draw(performance.now()); return; } if (!running) { running = true; requestAnimationFrame(loop); } }
  if ("IntersectionObserver" in window) new IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (visible) kick(); }).observe(yard);
  document.addEventListener("visibilitychange", kick);
  addEventListener("resize", function () { layout(); kick(); });
  function start() { layout(); kick(); }
  if (img.complete) start(); else img.addEventListener("load", start);
  start();
  /* reduced motion: one still frame, lanterns still answer a tap */
  var still = null;
  function stillPulse() { if (still) return; still = setInterval(function () { draw(performance.now()); if (!pulses.length) { clearInterval(still); still = null; } }, 40); }
})();
