// « Chacun ne voit qu'une ombre » : objets en voxels, leurs ombres, et la reconstruction d'un objet à partir
// des ombres de plusieurs témoins (sculpture de l'enveloppe visuelle). Canvas 2D, aucune dépendance.
(function () {
  'use strict';
  var N = 24, S = 2 / N, N2 = N * N, NN = N2 * N;
  var REDUCE = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  var X = new Float32Array(NN), Y = new Float32Array(NN), Z = new Float32Array(NN);
  for (var k0 = 0, n0 = 0; k0 < N; k0++) for (var j0 = 0; j0 < N; j0++) for (var i0 = 0; i0 < N; i0++, n0++) {
    X[n0] = -1 + (i0 + .5) * S; Y[n0] = -1 + (j0 + .5) * S; Z[n0] = -1 + (k0 + .5) * S;
  }

  var SHAPES = {
    cylindre: function (x, y, z) { return x * x + z * z <= .4 && Math.abs(y) <= .63; },
    cone: function (x, y, z) { if (y < -.7 || y > .7) return false; var r = .75 * (.7 - y) / 1.4; return x * x + z * z <= r * r; },
    tasse: function (x, y, z) { var r2 = x * x + z * z; if (Math.abs(y) > .62 || r2 > .5) return false; return !(r2 < .26 && y > -.38); },
    tore: function (x, y, z) { var q = Math.sqrt(x * x + z * z) - .6; return q * q + y * y <= .065; }
  };
  var NAMES = { cylindre: 'un cylindre', cone: 'un cône', tasse: 'une tasse', tore: 'un tore (un donut)' };

  // ---------- math ----------
  function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
  function norm(a) { var l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; }
  // Rotation: yaw about y, then pitch about x (row-major 3x3).
  function rot(yaw, pitch) {
    var cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
    return [cy, 0, sy, sp * sy, cp, -sp * cy, -cp * sy, sp, cp * cy];
  }
  function mul(A, B) {
    var C = new Array(9);
    for (var r = 0; r < 3; r++) for (var c = 0; c < 3; c++) C[r * 3 + c] = A[r * 3] * B[c] + A[r * 3 + 1] * B[3 + c] + A[r * 3 + 2] * B[6 + c];
    return C;
  }
  var L = norm([-.45, .65, .62]);

  // ---------- voxels ----------
  function voxelize(f) { var a = new Uint8Array(NN); for (var n = 0; n < NN; n++) a[n] = f(X[n], Y[n], Z[n]) ? 1 : 0; return a; }
  function count(a) { var c = 0; for (var n = 0; n < NN; n++) c += a[n]; return c; }
  // Surface voxels (a face touches empty space) with a smooth normal taken from the empty 3x3x3 neighbourhood.
  function surface(occ) {
    var idx = [], nx = [], ny = [], nz = [];
    for (var k = 0, n = 0; k < N; k++) for (var j = 0; j < N; j++) for (var i = 0; i < N; i++, n++) {
      if (!occ[n]) continue;
      var a = 0, b = 0, c = 0, open = false;
      for (var dk = -1; dk <= 1; dk++) for (var dj = -1; dj <= 1; dj++) for (var di = -1; di <= 1; di++) {
        var ii = i + di, jj = j + dj, kk = k + dk;
        if (ii >= 0 && jj >= 0 && kk >= 0 && ii < N && jj < N && kk < N && occ[n + di + dj * N + dk * N2]) continue;
        a += di; b += dj; c += dk;
        if (Math.abs(di) + Math.abs(dj) + Math.abs(dk) === 1) open = true;
      }
      if (!open) continue;
      var l = Math.sqrt(a * a + b * b + c * c);
      if (l < 1e-6) { a = 0; b = 1; c = 0; l = 1; }
      idx.push(n); nx.push(a / l); ny.push(b / l); nz.push(c / l);
    }
    return { idx: Int32Array.from(idx), nx: Float32Array.from(nx), ny: Float32Array.from(ny), nz: Float32Array.from(nz) };
  }
  function pick(s, keep) {
    var idx = [], nx = [], ny = [], nz = [];
    for (var t = 0; t < s.idx.length; t++) if (keep(s.idx[t])) { idx.push(s.idx[t]); nx.push(s.nx[t]); ny.push(s.ny[t]); nz.push(s.nz[t]); }
    return { idx: Int32Array.from(idx), nx: Float32Array.from(nx), ny: Float32Array.from(ny), nz: Float32Array.from(nz) };
  }
  var CACHE = {};
  function solid(name) {
    if (!CACHE[name]) { var occ = voxelize(SHAPES[name]); CACHE[name] = { occ: occ, surf: surface(occ), vol: count(occ) }; }
    return CACHE[name];
  }

  // ---------- drawing ----------
  function ramp(r, g, b) { var a = []; for (var i = 0; i <= 32; i++) { var s = i / 32; a.push('rgb(' + (r * s | 0) + ',' + (g * s | 0) + ',' + (b * s | 0) + ')'); } return a; }
  var SUN = ramp(255, 201, 119), CREAM = ramp(241, 234, 217), TEAL = ramp(111, 227, 204), HOT = ramp(255, 143, 82);

  var BUF = { d: new Float32Array(0) };
  // Paints voxel groups ({idx, nx?, ramp, alpha?, stroke?}) through matrix M, back to front.
  function paint(ctx, cam, M, groups) {
    var total = 0, gi, t, m = 0;
    for (gi = 0; gi < groups.length; gi++) total += groups[gi].idx.length;
    if (BUF.d.length < total) {
      var cap = total + 2048;
      BUF = { d: new Float32Array(cap), x: new Float32Array(cap), y: new Float32Array(cap), s: new Uint8Array(cap), g: new Uint8Array(cap) };
    }
    var D = BUF.d, PX = BUF.x, PY = BUF.y, SH = BUF.s, G = BUF.g;
    for (gi = 0; gi < groups.length; gi++) {
      var g = groups[gi], idx = g.idx;
      for (t = 0; t < idx.length; t++, m++) {
        var n = idx[t], x = X[n], y = Y[n], z = Z[n], s = .8;
        PX[m] = cam.cx + (M[0] * x + M[1] * y + M[2] * z) * cam.sc;
        PY[m] = cam.cy - (M[3] * x + M[4] * y + M[5] * z) * cam.sc;
        D[m] = M[6] * x + M[7] * y + M[8] * z;
        if (g.nx) {
          var a = g.nx[t], b = g.ny[t], c = g.nz[t];
          var l = (M[0] * a + M[1] * b + M[2] * c) * L[0] + (M[3] * a + M[4] * b + M[5] * c) * L[1] + (M[6] * a + M[7] * b + M[8] * c) * L[2];
          s = .3 + .7 * Math.max(0, l);
        }
        SH[m] = Math.round(s * 32); G[m] = gi;
      }
    }
    var order = new Uint32Array(m);
    for (t = 0; t < m; t++) order[t] = t;
    order.sort(function (p, q) { return D[p] - D[q]; });
    var q = S * cam.sc * 1.15, h = q / 2, last = -1;
    ctx.lineWidth = Math.max(1, cam.dpr * .8);
    for (t = 0; t < m; t++) {
      var k = order[t], gr = groups[G[k]];
      if (G[k] !== last) { last = G[k]; ctx.globalAlpha = gr.alpha == null ? 1 : gr.alpha; }
      if (gr.stroke) { ctx.strokeStyle = gr.ramp[SH[k]]; ctx.strokeRect(PX[k] - h + 1, PY[k] - h + 1, q - 2, q - 2); }
      else { ctx.fillStyle = gr.ramp[SH[k]]; ctx.fillRect(PX[k] - h, PY[k] - h, q, q); }
    }
    ctx.globalAlpha = 1;
  }

  function fit(cv) {
    var r = cv.getBoundingClientRect(), d = Math.min(2, window.devicePixelRatio || 1);
    var w = Math.max(1, Math.round(r.width * d)), h = Math.max(1, Math.round(r.height * d));
    if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
    return { w: w, h: h, dpr: d };
  }
  // Runs frame(dt) on every animation frame while el is on screen.
  function run(el, frame) {
    var vis = false, raf = 0, last = 0;
    function tick(t) {
      var dt = last ? Math.min(.05, (t - last) / 1000) : 0;
      last = t; frame(dt);
      if (vis) raf = requestAnimationFrame(tick); else { raf = 0; last = 0; }
    }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { vis = es[0].isIntersecting; if (vis && !raf) raf = requestAnimationFrame(tick); }, { rootMargin: '80px' }).observe(el);
    } else { vis = true; raf = requestAnimationFrame(tick); }
  }
  function drag(el, move, start, end) {
    var p = null;
    el.addEventListener('pointerdown', function (e) { p = [e.clientX, e.clientY]; try { el.setPointerCapture(e.pointerId); } catch (x) {} if (start) start(); });
    el.addEventListener('pointermove', function (e) { if (!p) return; move(e.clientX - p[0], e.clientY - p[1]); p = [e.clientX, e.clientY]; });
    function up() { if (p && end) end(); p = null; }
    el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
  }
  function press(buttons, attr, value) {
    buttons.forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute(attr) === value)); });
  }

  // =====================================================================================
  // Figure 1 : un objet, une lampe, un mur.
  // =====================================================================================
  function figOmbre(root) {
    var cv = root.querySelector('canvas.scene'), flat = root.querySelector('canvas.flat');
    var ctx = cv.getContext('2d'), fx = flat.getContext('2d');
    var btns = [].slice.call(root.querySelectorAll('[data-shape]'));
    var obj = solid('cylindre'), yaw = .5, pitch = .45, held = false;
    var CAM = rot(-.62, .28), WX = -1.7, E = 1.25, R = 40, P = 2 * E / R, mask = new Uint8Array(R * R);
    btns.forEach(function (b) { b.addEventListener('click', function () { obj = solid(b.getAttribute('data-shape')); press(btns, 'data-shape', b.getAttribute('data-shape')); }); });
    drag(cv, function (dx, dy) { yaw += dx * .012; pitch = Math.max(-1.4, Math.min(1.4, pitch + dy * .012)); }, function () { held = true; }, function () { held = false; });

    function frame(dt) {
      if (!held && !REDUCE) yaw += dt * .4;
      var f = fit(cv), w = f.w, h = f.h, Ro = rot(yaw, pitch), M = mul(CAM, Ro);
      var sc = Math.min(w / 4.2, h / 3.25), cam = { cx: w / 2 + .15 * sc, cy: h / 2 + .275 * sc, sc: sc, dpr: f.dpr };
      function pt(x, y, z) { return [cam.cx + (CAM[0] * x + CAM[1] * y + CAM[2] * z) * sc, cam.cy - (CAM[3] * x + CAM[4] * y + CAM[5] * z) * sc]; }
      // shadow on the wall: light travels along -x, so the shadow keeps (y, z)
      mask.fill(0);
      var s = obj.surf, hh = S * .72, t, a, b, c;
      for (t = 0; t < s.idx.length; t++) {
        var n = s.idx[t], wy = Ro[3] * X[n] + Ro[4] * Y[n] + Ro[5] * Z[n], wz = Ro[6] * X[n] + Ro[7] * Y[n] + Ro[8] * Z[n];
        var c0 = Math.max(0, Math.floor((wz - hh + E) / P)), c1 = Math.min(R - 1, Math.floor((wz + hh + E) / P));
        var r0 = Math.max(0, Math.floor((wy - hh + E) / P)), r1 = Math.min(R - 1, Math.floor((wy + hh + E) / P));
        for (a = r0; a <= r1; a++) for (b = c0; b <= c1; b++) mask[a * R + b] = 1;
      }
      ctx.clearRect(0, 0, w, h);
      // lamp glow
      var lp = pt(2.25, .3, .2), gl = ctx.createRadialGradient(lp[0], lp[1], 0, lp[0], lp[1], sc * 1.6);
      gl.addColorStop(0, 'rgba(255,201,119,.55)'); gl.addColorStop(.12, 'rgba(255,201,119,.16)'); gl.addColorStop(1, 'rgba(255,201,119,0)');
      ctx.fillStyle = gl; ctx.fillRect(0, 0, w, h);
      // wall
      var q1 = pt(WX, -E, -E), q2 = pt(WX, -E, E), q3 = pt(WX, E, E), q4 = pt(WX, E, -E);
      var wg = ctx.createLinearGradient(q2[0], 0, q1[0], 0);
      wg.addColorStop(0, '#2a3246'); wg.addColorStop(1, '#1b2232');
      ctx.beginPath(); ctx.moveTo(q1[0], q1[1]); ctx.lineTo(q2[0], q2[1]); ctx.lineTo(q3[0], q3[1]); ctx.lineTo(q4[0], q4[1]); ctx.closePath();
      ctx.fillStyle = wg; ctx.fill(); ctx.strokeStyle = 'rgba(241,234,217,.18)'; ctx.lineWidth = f.dpr; ctx.stroke();
      ctx.beginPath();
      for (a = 0; a < R; a++) for (b = 0; b < R; b++) {
        if (!mask[a * R + b]) continue;
        var y0 = -E + a * P, z0 = -E + b * P, p1 = pt(WX, y0, z0), p2 = pt(WX, y0, z0 + P), p3 = pt(WX, y0 + P, z0 + P), p4 = pt(WX, y0 + P, z0);
        ctx.moveTo(p1[0], p1[1]); ctx.lineTo(p2[0], p2[1]); ctx.lineTo(p3[0], p3[1]); ctx.lineTo(p4[0], p4[1]); ctx.closePath();
      }
      ctx.fillStyle = '#07090e'; ctx.fill();
      ctx.strokeStyle = '#07090e'; ctx.lineWidth = .6 * f.dpr; ctx.stroke();
      paint(ctx, cam, M, [{ idx: s.idx, nx: s.nx, ny: s.ny, nz: s.nz, ramp: SUN }]);
      // the flat view: what someone facing the wall sees (their right is -z)
      var g2 = fit(flat), cw = g2.w / R;
      fx.fillStyle = '#262e41'; fx.fillRect(0, 0, g2.w, g2.h);
      fx.fillStyle = '#07090e';
      for (a = 0; a < R; a++) for (b = 0; b < R; b++) if (mask[a * R + b]) fx.fillRect((R - 1 - b) * cw, (R - 1 - a) * cw, cw + .6, cw + .6);
    }
    run(root, frame);
  }

  // =====================================================================================
  // Figure 2 : deux ombres qui se contredisent.
  // =====================================================================================
  function circlePoly(r) { var p = []; for (var i = 0; i < 120; i++) { var a = i / 120 * 2 * Math.PI; p.push([r * Math.cos(a), r * Math.sin(a)]); } return p; }
  function radial(poly, a) {
    var dx = Math.cos(a), dy = Math.sin(a), best = 0;
    for (var i = 0; i < poly.length; i++) {
      var p = poly[i], q = poly[(i + 1) % poly.length], ex = q[0] - p[0], ey = q[1] - p[1], den = dx * ey - dy * ex;
      if (Math.abs(den) < 1e-9) continue;
      var t = (p[0] * ey - p[1] * ex) / den, s = (p[0] * dy - p[1] * dx) / den;
      if (t > 0 && s >= -1e-9 && s <= 1 + 1e-9 && t > best) best = t;
    }
    return best;
  }
  function pathOf(poly) { return 'M' + poly.map(function (p) { return p[0].toFixed(3) + ' ' + p[1].toFixed(3); }).join('L') + 'Z'; }
  function average(A, B) {
    var p = [];
    for (var i = 0; i < 180; i++) { var a = i / 180 * 2 * Math.PI, r = (radial(A, a) + radial(B, a)) / 2; p.push([r * Math.cos(a), r * Math.sin(a)]); }
    return p;
  }
  var PAIRS = {
    cylindre: { a: circlePoly(.63), b: [[-.63, -.63], [.63, -.63], [.63, .63], [-.63, .63]], la: 'disque', lb: 'carré',
      v: 'Un <strong>cylindre</strong>. Vu d’en haut : un disque. Vu de côté : un carré. Ana et Ben avaient raison tous les deux.' },
    cone: { a: circlePoly(.75), b: [[0, -.7], [.75, .7], [-.75, .7]], la: 'disque', lb: 'triangle',
      v: 'Un <strong>cône</strong>. Vu d’en haut : un disque. Vu de côté : un triangle. Ana et Ben avaient raison tous les deux.' }
  };
  function figDeux(root) {
    var cv = root.querySelector('canvas'), ctx = cv.getContext('2d');
    var pa = root.querySelector('[data-a]'), pb = root.querySelector('[data-b]'), pv = root.querySelector('[data-avg]');
    var la = root.querySelector('[data-la]'), lb = root.querySelector('[data-lb]'), verdict = root.querySelector('[data-v]');
    var sb = [].slice.call(root.querySelectorAll('[data-go]')), pbtn = [].slice.call(root.querySelectorAll('[data-pair]'));
    var pair = 'cylindre', state = 'ombres', yaw = .3, held = false, pitch = .5;
    var TXT = {
      ombres: 'Chacun a la preuve sous les yeux. Qui a raison ?',
      moyenne: 'Le compromis : la moyenne des deux ombres. Ça a l’air raisonnable, mais personne ne voit cette forme-là. <strong>Fausse pour les deux.</strong>'
    };
    function show() {
      var P = PAIRS[pair];
      pa.setAttribute('d', pathOf(P.a)); pb.setAttribute('d', pathOf(P.b)); pv.setAttribute('d', pathOf(average(P.a, P.b)));
      la.textContent = P.la; lb.textContent = P.lb;
      root.setAttribute('data-state', state);
      verdict.innerHTML = state === 'objet' ? P.v : TXT[state];
      press(sb, 'data-go', state); press(pbtn, 'data-pair', pair);
    }
    sb.forEach(function (b) { b.addEventListener('click', function () { var s = b.getAttribute('data-go'); state = state === s ? 'ombres' : s; show(); }); });
    pbtn.forEach(function (b) { b.addEventListener('click', function () { pair = b.getAttribute('data-pair'); state = 'ombres'; show(); }); });
    drag(cv, function (dx, dy) { yaw += dx * .012; pitch = Math.max(-1.4, Math.min(1.4, pitch + dy * .012)); }, function () { held = true; }, function () { held = false; });
    show();
    run(root, function (dt) {
      if (state !== 'objet') return;
      if (!held && !REDUCE) yaw += dt * .5;
      var f = fit(cv), sc = Math.min(f.w, f.h) / 2.5, o = solid(pair);
      ctx.clearRect(0, 0, f.w, f.h);
      paint(ctx, { cx: f.w / 2, cy: f.h / 2, sc: sc, dpr: f.dpr }, rot(yaw, pitch), [{ idx: o.surf.idx, nx: o.surf.nx, ny: o.surf.ny, nz: o.surf.nz, ramp: SUN }]);
    });
  }

  // =====================================================================================
  // Figure 3 : reconstruire l'objet à partir des ombres des témoins.
  // =====================================================================================
  var RES = 40, EXT = 1.8, PIX = 2 * EXT / RES;
  function basis(d) {
    var u = Math.abs(d[1]) > .985 ? [1, 0, 0] : norm(cross([0, 1, 0], d));
    return [u, cross(d, u)];
  }
  // A witness's shadow (mask) and, for every voxel of the grid, whether it falls inside it.
  function shadow(occ, d, lie) {
    var b = basis(d), u = b[0], v = b[1], mask = new Uint8Array(RES * RES), h = S * .72, n, pu, pv, i, j;
    for (n = 0; n < NN; n++) {
      if (!occ[n]) continue;
      pu = u[0] * X[n] + u[1] * Y[n] + u[2] * Z[n]; pv = v[0] * X[n] + v[1] * Y[n] + v[2] * Z[n];
      if (lie) { pu = pu * lie.k + lie.du; pv = pv * lie.k + lie.dv; }
      var i0 = Math.max(0, Math.floor((pu - h + EXT) / PIX)), i1 = Math.min(RES - 1, Math.floor((pu + h + EXT) / PIX));
      var j0 = Math.max(0, Math.floor((pv - h + EXT) / PIX)), j1 = Math.min(RES - 1, Math.floor((pv + h + EXT) / PIX));
      for (j = j0; j <= j1; j++) for (i = i0; i <= i1; i++) mask[j * RES + i] = 1;
    }
    var ins = new Uint8Array(NN);
    for (n = 0; n < NN; n++) {
      pu = u[0] * X[n] + u[1] * Y[n] + u[2] * Z[n]; pv = v[0] * X[n] + v[1] * Y[n] + v[2] * Z[n];
      i = Math.floor((pu + EXT) / PIX); j = Math.floor((pv + EXT) / PIX);
      ins[n] = i >= 0 && j >= 0 && i < RES && j < RES ? mask[j * RES + i] : 0;
    }
    return { mask: mask, ins: ins };
  }
  function dirOf(az, el) { return [Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el)]; }

  function figTemoins(root) {
    var cv = root.querySelector('canvas.hull'), ctx = cv.getContext('2d');
    var ring = root.querySelector('svg.ring'), dots = root.querySelector('[data-o="dots"]'), thumbs = root.querySelector('[data-o="thumbs"]');
    var out = {}; [].forEach.call(root.querySelectorAll('[data-o]'), function (e) { out[e.getAttribute('data-o')] = e; });
    var objBtns = [].slice.call(root.querySelectorAll('[data-obj]'));
    var ORDER = { 1: 'tore', 2: 'cone', 3: 'tasse' };
    var name = 'tore', obj = solid(name), views = [], tol = 1, kept = new Uint8Array(NN), keptSurf = null, groupsHidden = null, groupsShown = null;
    var fades = [], revealed = false, yaw = -.5, pitch = .42, held = false, toi = null;

    function add(az, el, kind) {
      if (views.length >= 40) return;
      var d = dirOf(az, el), lie = null;
      if (kind === 'menteur') lie = { k: .55 + Math.random() * .1, du: (Math.random() < .5 ? -1 : 1) * (.2 + Math.random() * .15), dv: (Math.random() - .5) * .3 };
      var sh = shadow(obj.occ, d, lie);
      var v = { az: az, el: el, d: d, kind: kind, mask: sh.mask, ins: sh.ins };
      views.push(v);
      if (kind === 'toi') toi = v;
      thumb(v);
      update(true);
    }
    function thumb(v) {
      var c = document.createElement('canvas'), g = c.getContext('2d');
      c.width = c.height = RES * 2; c.className = 'th' + (v.kind === 'menteur' ? ' liar' : '') + (v.kind === 'toi' ? ' me' : '');
      c.title = v.kind === 'toi' ? 'ton ombre' : 'une ombre';
      g.fillStyle = '#262e41'; g.fillRect(0, 0, c.width, c.height); g.fillStyle = '#07090e';
      for (var j = 0; j < RES; j++) for (var i = 0; i < RES; i++) if (v.mask[j * RES + i]) g.fillRect(i * 2, (RES - 1 - j) * 2, 2, 2);
      thumbs.appendChild(c); thumbs.scrollLeft = thumbs.scrollWidth;
    }
    function update(animate) {
      var n, nv = views.length, need = nv ? Math.max(1, Math.ceil(tol * nv - 1e-9)) : 0, prev = kept;
      var cnt = new Uint8Array(NN);
      views.forEach(function (v) { for (var n = 0; n < NN; n++) cnt[n] += v.ins[n]; });
      kept = new Uint8Array(NN);
      var inter = 0, extra = 0, lost = 0, removed = [];
      for (n = 0; n < NN; n++) {
        kept[n] = cnt[n] >= need ? 1 : 0;
        if (kept[n] && obj.occ[n]) inter++; else if (kept[n]) extra++; else if (obj.occ[n]) lost++;
        if (animate && prev[n] && !kept[n]) removed.push(n);
      }
      if (removed.length) fades.push({ idx: Int32Array.from(removed), t: 0 });
      keptSurf = surface(kept);
      var ks = keptSurf;
      groupsHidden = [{ idx: ks.idx, nx: ks.nx, ny: ks.ny, nz: ks.nz, ramp: CREAM }];
      var bad = pick(ks, function (n) { return !obj.occ[n]; });
      var miss = pick(obj.surf, function (n) { return !kept[n]; });
      // revealed: the object itself in teal (lost parts outlined), the excess as a thin orange veil around it
      var core = pick(obj.surf, function (n) { return kept[n]; });
      groupsShown = [
        { idx: core.idx, nx: core.nx, ny: core.ny, nz: core.nz, ramp: TEAL },
        { idx: miss.idx, nx: miss.nx, ny: miss.ny, nz: miss.nz, ramp: TEAL, alpha: .6, stroke: true },
        { idx: bad.idx, nx: bad.nx, ny: bad.ny, nz: bad.nz, ramp: HOT, alpha: .16 }
      ];
      var iou = inter / (inter + extra + lost);
      out.iou.textContent = Math.round(iou * 100) + ' %';
      var trop = extra / obj.vol, perdu = lost / obj.vol;
      out.trop.style.width = Math.min(100, trop * 50) + '%'; out.tropn.textContent = '+' + Math.round(trop * 100) + ' %';
      out.perdu.style.width = Math.min(100, perdu * 100) + '%'; out.perdun.textContent = '−' + Math.round(perdu * 100) + ' %';
      out.n.textContent = nv + (nv > 1 ? ' ombres' : ' ombre');
      out.tolv.textContent = nv ? need + ' sur ' + nv : '–';
      drawDots();
    }
    function drawDots() {
      var html = '';
      views.forEach(function (v) {
        var x = v.d[0], y = v.d[2], cls = 'dot ' + v.kind + (v.el < 0 ? ' below' : '');
        html += '<circle class="' + cls + '" cx="' + x.toFixed(3) + '" cy="' + y.toFixed(3) + '" r="' + (v.kind === 'toi' ? .09 : .06) + '"/>';
      });
      if (toi) html += '<text class="me" x="' + toi.d[0].toFixed(3) + '" y="' + (toi.d[2] + .24).toFixed(3) + '">toi</text>';
      dots.innerHTML = html;
    }
    function reset(newName) {
      if (newName) { name = newName; obj = solid(name); }
      views = []; fades = []; toi = null; thumbs.innerHTML = ''; kept = new Uint8Array(NN).fill(1);
      revealed = false; root.classList.remove('revealed'); out.name.textContent = 'Objet mystère'; out.reveal.textContent = 'Révéler l’objet';
      add(.55, .12, 'toi');
    }
    function setReveal(on) {
      revealed = on; root.classList.toggle('revealed', on);
      out.name.textContent = on ? 'C’était ' + NAMES[name] + '.' : 'Objet mystère';
      out.reveal.textContent = on ? 'Cacher l’objet' : 'Révéler l’objet';
    }

    ring.addEventListener('click', function (e) {
      var r = ring.getBoundingClientRect(), x = ((e.clientX - r.left) / r.width - .5) * 2.5, y = ((e.clientY - r.top) / r.height - .5) * 2.5;
      var rr = Math.min(1, Math.hypot(x, y));
      add(Math.atan2(x, y), Math.acos(rr), 'temoin');
    });
    root.querySelector('[data-do="voisin"]').addEventListener('click', function () {
      var base = toi || { az: 0, el: .1 };
      add(base.az + (Math.random() - .5) * .3, Math.max(-.2, Math.min(1.4, base.el + (Math.random() - .5) * .16)), 'voisin');
    });
    root.querySelector('[data-do="inconnu"]').addEventListener('click', function () {
      add(Math.random() * 2 * Math.PI, Math.asin(Math.random() * 1.3 - .3), 'inconnu');
    });
    root.querySelector('[data-do="menteur"]').addEventListener('click', function () {
      add(Math.random() * 2 * Math.PI, Math.asin(Math.random() * 1.1 - .2), 'menteur');
    });
    root.querySelector('[data-do="reset"]').addEventListener('click', function () { reset(); });
    out.reveal.addEventListener('click', function () { setReveal(!revealed); });
    out.tol.addEventListener('input', function () { tol = out.tol.value / 100; out.tolp.textContent = out.tol.value + ' %'; update(false); });
    objBtns.forEach(function (b) {
      b.addEventListener('click', function () { press(objBtns, 'data-obj', b.getAttribute('data-obj')); reset(ORDER[b.getAttribute('data-obj')]); });
    });
    drag(cv, function (dx, dy) { yaw += dx * .012; pitch = Math.max(-1.4, Math.min(1.4, pitch + dy * .012)); }, function () { held = true; }, function () { held = false; });

    reset();
    run(root, function (dt) {
      if (!held && !REDUCE) yaw += dt * .3;
      var f = fit(cv), sc = Math.min(f.w, f.h) / 2.9, M = rot(yaw, pitch), gs = (revealed ? groupsShown : groupsHidden).slice();
      fades = fades.filter(function (fd) { fd.t += dt / .8; return fd.t < 1; });
      fades.forEach(function (fd) { gs.push({ idx: fd.idx, ramp: HOT, alpha: (1 - fd.t) * .9 }); });
      ctx.clearRect(0, 0, f.w, f.h);
      paint(ctx, { cx: f.w / 2, cy: f.h / 2, sc: sc, dpr: f.dpr }, M, gs);
    });
  }

  var a = document.getElementById('fig-ombre'), b = document.getElementById('fig-deux'), c = document.getElementById('fig-temoins');
  if (a) figOmbre(a);
  if (b) figDeux(b);
  if (c) figTemoins(c);
})();
