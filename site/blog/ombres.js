// « Chacun ne voit qu'une ombre » : trois scènes 3D (Three.js, servi depuis vendor/, aucune requête tierce).
// 1. un objet, une lampe, un mur ; 2. deux ombres qui se contredisent ; 3. reconstruire un objet à partir des
// ombres de plusieurs témoins (sculpture de l'enveloppe visuelle sur une grille de voxels, surface par marching cubes).
import * as T from './vendor/three-ombres.min.js?v=2';

// Textes que le script affiche lui-même, par langue (le reste est dans la page) : ombres-txt.js. Le français sert de repli.
const L = window.OMBRES_TXT;
const LANG = document.documentElement.lang || 'fr';
const tx = (k) => (L[LANG] || L.fr)[k];
const fmt = (k, v) => tx(k).replace(/\{(\w)\}/g, (m, x) => v[x]);
// « one » ou « many » selon les règles de pluriel de la langue (en russe, 21 est un singulier ; en anglais, 0 est un pluriel)
const plural = (n) => { let c = 'other'; try { c = new Intl.PluralRules(LANG).select(n); } catch (e) {} return c === 'one' ? 'one' : 'many'; };

const SUN = 0xffc977, TEAL = 0x6fe3cc, HOT = 0xff8f52, CREAM = 0xf1ead9, WALL = 0xc9bfa9;
const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// ---------- les objets : une géométrie pour l'image, une fonction « dedans ? » pour les mesures ----------
function cup() {
  const p = [[0, -.62], [.68, -.62], [.707, -.595], [.707, .6], [.69, .62], [.53, .62], [.51, .6], [.51, -.35], [.48, -.38], [0, -.38]];
  return new T.LatheGeometry(p.map(([x, y]) => new T.Vector2(x, y)), 96);
}
const SHAPES = {
  cylindre: { get name() { return tx('s_cylindre'); }, geo: () => new T.CylinderGeometry(.63, .63, 1.26, 96, 1), inside: (x, y, z) => x * x + z * z <= .397 && Math.abs(y) <= .63 },
  cone: { get name() { return tx('s_cone'); }, geo: () => new T.ConeGeometry(.75, 1.4, 96, 1), inside: (x, y, z) => y >= -.7 && y <= .7 && Math.hypot(x, z) <= .75 * (.7 - y) / 1.4 },
  tore: { get name() { return tx('s_tore'); }, geo: () => new T.TorusGeometry(.6, .255, 48, 128).rotateX(Math.PI / 2), inside: (x, y, z) => { const q = Math.hypot(x, z) - .6; return q * q + y * y <= .065; } },
  tasse: { get name() { return tx('s_tasse'); }, geo: cup, inside: (x, y, z) => { const r = Math.hypot(x, z); return Math.abs(y) <= .62 && r <= .707 && !(r < .51 && y > -.38); } }
};
const GEO = {};
const geo = (n) => GEO[n] || (GEO[n] = SHAPES[n].geo());
const solidMat = (color, extra) => new T.MeshStandardMaterial(Object.assign({ color, roughness: .42, metalness: .04, side: T.DoubleSide }, extra));

// ---------- plomberie commune ----------
function stage(el, frame) {
  const canvas = el.querySelector('canvas.gl');
  let renderer;
  try { renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: true }); }
  catch (e) { el.classList.add('nogl'); return null; }
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = T.PCFShadowMap;
  renderer.toneMapping = T.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = T.SRGBColorSpace;
  const s = { renderer, canvas, w: 1, h: 1, on: false, onResize: null };
  const resize = () => {
    const r = canvas.getBoundingClientRect();
    s.w = Math.max(1, Math.round(r.width)); s.h = Math.max(1, Math.round(r.height));
    renderer.setSize(s.w, s.h, false); if (s.onResize) s.onResize(s);
  };
  new ResizeObserver(resize).observe(canvas); resize();
  let raf = 0, last = 0;
  const tick = (t) => {
    const dt = last ? Math.min(.05, (t - last) / 1000) : 0; last = t;
    frame(dt, s);
    if (s.on) raf = requestAnimationFrame(tick); else { raf = 0; last = 0; }
  };
  new IntersectionObserver((es) => { s.on = es[0].isIntersecting; if (s.on && !raf) raf = requestAnimationFrame(tick); }, { rootMargin: '120px' }).observe(el);
  return s;
}
// Rotation au doigt : un glissement horizontal tourne (le défilement vertical de la page reste libre),
// la souris tourne aussi en hauteur. Un peu d'inertie, puis une rotation lente si personne ne touche.
function spinner(el, st, o) {
  let p = null;
  el.addEventListener('pointerdown', (e) => { p = { x: e.clientX, y: e.clientY, t: performance.now(), m: e.pointerType === 'mouse' }; st.held = true; st.vel = 0; st.touched = true; try { el.setPointerCapture(e.pointerId); } catch (x) {} });
  el.addEventListener('pointermove', (e) => {
    if (!p) return;
    const now = performance.now(), dx = e.clientX - p.x, dy = e.clientY - p.y;
    st.yaw += dx * .011; st.vel = .6 * st.vel + .4 * (dx * .011) / Math.max(.008, (now - p.t) / 1000);
    if (p.m) st.pitch = clamp(st.pitch + dy * .009, o.pmin, o.pmax);
    p.x = e.clientX; p.y = e.clientY; p.t = now;
  });
  const up = () => { p = null; st.held = false; };
  el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up); el.addEventListener('lostpointercapture', up);
}
function coast(st, dt, auto) {
  if (st.held) return;
  st.yaw += st.vel * dt; st.vel *= Math.exp(-dt * 2.5);
  if (!REDUCE && Math.abs(st.vel) < .3) st.yaw += auto * dt;
}
function glow(color) {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d'), r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  r.addColorStop(0, color); r.addColorStop(.18, color.replace('1)', '.45)')); r.addColorStop(1, color.replace('1)', '0)'));
  g.fillStyle = r; g.fillRect(0, 0, 128, 128);
  return new T.Sprite(new T.SpriteMaterial({ map: new T.CanvasTexture(c), blending: T.AdditiveBlending, depthWrite: false, transparent: true }));
}
function press(btns, attr, v) { btns.forEach((b) => b.setAttribute('aria-pressed', String(b.getAttribute(attr) === v))); }
function wallMesh(w, h) {
  const m = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshStandardMaterial({ color: WALL, roughness: .95 }));
  m.receiveShadow = true; return m;
}
function softShadow(light, half, size) {
  light.castShadow = true;
  const c = light.shadow.camera; c.left = c.bottom = -half; c.right = c.top = half; c.near = .5; c.far = 14;
  light.shadow.mapSize.set(size, size); light.shadow.radius = 4; light.shadow.bias = -.0004; light.shadow.normalBias = .02;
}

// =====================================================================================
// Figure 1 : un objet, une lampe, un mur.
// =====================================================================================
function figOmbre(el) {
  const scene = new T.Scene(), cam = new T.PerspectiveCamera(30, 1, .1, 60);
  const flatCam = new T.OrthographicCamera(-1.35, 1.35, 1.35, -1.35, .1, 20);
  flatCam.position.set(5, 0, 0); flatCam.lookAt(0, 0, 0);
  const wall = wallMesh(3.4, 2.6); wall.rotation.y = Math.PI / 2; wall.position.x = -1.9; scene.add(wall);
  scene.add(new T.HemisphereLight(0x9aa6c4, 0x10141f, .55));
  const sun = new T.DirectionalLight(0xfff1d6, 2.6); sun.position.set(6, 0, 0); softShadow(sun, 1.7, 1024); scene.add(sun);
  const fill = new T.DirectionalLight(0xbcd0ff, .55); fill.position.set(1, 2, 4); scene.add(fill);
  const lamp = new T.Mesh(new T.SphereGeometry(.07, 24, 16), new T.MeshBasicMaterial({ color: 0xfff3d6 }));
  lamp.position.set(2.3, 0, 0); scene.add(lamp);
  const halo = glow('rgba(255,201,119,1)'); halo.scale.setScalar(1.15); halo.position.copy(lamp.position); scene.add(halo);
  const pivot = new T.Group(); scene.add(pivot);
  const mesh = new T.Mesh(geo('cylindre'), solidMat(SUN)); mesh.castShadow = true; mesh.receiveShadow = true; pivot.add(mesh);
  const black = new T.MeshBasicMaterial({ color: 0x07090e, side: T.DoubleSide }), wallColor = new T.Color(WALL).multiplyScalar(.85);
  const frameEl = el.querySelector('.inset');
  const st = { yaw: .6, pitch: .5, vel: 0, held: false };
  const btns = [...el.querySelectorAll('[data-shape]')];
  btns.forEach((b) => b.addEventListener('click', () => { mesh.geometry = geo(b.dataset.shape); press(btns, 'data-shape', b.dataset.shape); }));
  let box = { x: 0, y: 0, s: 1 };
  const s = stage(el, (dt, s) => {
    coast(st, dt, .35);
    if (!st.held && !REDUCE && !st.touched) st.pitch = .5 + .45 * Math.sin(performance.now() / 4200);
    pivot.rotation.set(st.pitch, st.yaw, 0, 'YXZ');
    const r = s.renderer;
    r.setScissorTest(false); r.setViewport(0, 0, s.w, s.h); r.render(scene, cam);
    // l'encart : le mur vu de face, c'est-à-dire la silhouette de l'objet le long de la lumière
    wall.visible = lamp.visible = halo.visible = false; scene.overrideMaterial = black;
    r.setScissorTest(true); r.setScissor(box.x, box.y, box.s, box.s); r.setViewport(box.x, box.y, box.s, box.s);
    r.setClearColor(wallColor, 1); r.clear(); r.render(scene, flatCam);
    r.setClearColor(0x000000, 0); r.setScissorTest(false);
    wall.visible = lamp.visible = halo.visible = true; scene.overrideMaterial = null;
  });
  if (!s) return;
  s.onResize = ({ w, h }) => {
    cam.aspect = w / h;
    const narrow = w < 480;
    cam.position.set(narrow ? 3.9 : 3.3, 1.5, narrow ? 9.6 : 7.8); cam.lookAt(-.5, -.05, 0); cam.updateProjectionMatrix();
    const side = Math.round(Math.min(w, h) * (narrow ? .3 : .27)), m = 10;
    box = { x: w - side - m, y: h - side - m, s: side };
    Object.assign(frameEl.style, { width: side + 'px', height: side + 'px', top: m + 'px', right: m + 'px' });
  };
  s.onResize(s);
  spinner(s.canvas, st, { pmin: -1.4, pmax: 1.4 });
}

// =====================================================================================
// Figure 2 : deux ombres qui se contredisent.
// =====================================================================================
function circlePoly(r) { return Array.from({ length: 120 }, (_, i) => { const a = i / 120 * 2 * Math.PI; return [r * Math.cos(a), r * Math.sin(a)]; }); }
function radial(poly, a) {
  const dx = Math.cos(a), dy = Math.sin(a); let best = 0;
  for (let i = 0; i < poly.length; i++) {
    const p = poly[i], q = poly[(i + 1) % poly.length], ex = q[0] - p[0], ey = q[1] - p[1], den = dx * ey - dy * ex;
    if (Math.abs(den) < 1e-9) continue;
    const t = (p[0] * ey - p[1] * ex) / den, u = (p[0] * dy - p[1] * dx) / den;
    if (t > 0 && u >= -1e-9 && u <= 1 + 1e-9 && t > best) best = t;
  }
  return best;
}
const pathOf = (poly) => 'M' + poly.map((p) => p[0].toFixed(3) + ' ' + p[1].toFixed(3)).join('L') + 'Z';
const average = (A, B) => Array.from({ length: 180 }, (_, i) => { const a = i / 180 * 2 * Math.PI, r = (radial(A, a) + radial(B, a)) / 2; return [r * Math.cos(a), r * Math.sin(a)]; });
const PAIRS = {
  cylindre: { a: circlePoly(.63), b: [[-.63, -.63], [.63, -.63], [.63, .63], [-.63, .63]], la: 'a_disque', lb: 'a_carre', v: 'v_cylindre' },
  cone: { a: circlePoly(.75), b: [[0, -.7], [.75, .7], [-.75, .7]], la: 'a_disque', lb: 'a_triangle', v: 'v_cone' }
};
function figDeux(el) {
  const scene = new T.Scene(), cam = new T.PerspectiveCamera(30, 1, .1, 60);
  const FLOOR = -1.05, BACK = -1.45;
  const floor = wallMesh(3.4, 3.2); floor.rotation.x = -Math.PI / 2; floor.position.set(0, FLOOR, .15); scene.add(floor);
  const back = wallMesh(3.4, 2.5); back.position.set(0, FLOOR + 1.25, BACK); scene.add(back);
  scene.add(new T.HemisphereLight(0x9aa6c4, 0x10141f, .5));
  const top = new T.DirectionalLight(0xfff1d6, 1.7); top.position.set(0, 7, 0); top.shadow.camera.up.set(0, 0, -1); softShadow(top, 1.4, 1024); scene.add(top);
  const front = new T.DirectionalLight(0xfff1d6, 1.7); front.position.set(0, 0, 7); softShadow(front, 1.4, 1024); scene.add(front);
  const mat = solidMat(SUN, { transparent: true, opacity: 0, depthWrite: false });
  const mesh = new T.Mesh(geo('cylindre'), mat); mesh.castShadow = true; scene.add(mesh);
  const pa = el.querySelector('[data-a]'), pb = el.querySelector('[data-b]'), pv = el.querySelector('[data-avg]');
  const la = el.querySelectorAll('[data-la]'), lb = el.querySelectorAll('[data-lb]'), verdict = el.querySelector('[data-v]');
  const tagA = el.querySelector('.tag.a'), tagB = el.querySelector('.tag.b');
  const sb = [...el.querySelectorAll('[data-go]')], pbtn = [...el.querySelectorAll('[data-pair]')];
  const st = { yaw: 0, pitch: 0, vel: 0, held: false };
  let pair = 'cylindre', state = 'ombres', spin = 0;
  function show() {
    const P = PAIRS[pair];
    pa.setAttribute('d', pathOf(P.a)); pb.setAttribute('d', pathOf(P.b)); pv.setAttribute('d', pathOf(average(P.a, P.b)));
    la.forEach((e) => { e.textContent = tx(P.la); }); lb.forEach((e) => { e.textContent = tx(P.lb); });
    mesh.geometry = geo(pair);
    el.dataset.state = state;
    verdict.innerHTML = tx(state === 'objet' ? P.v : 't_' + state);
    press(sb, 'data-go', state); press(pbtn, 'data-pair', pair);
  }
  sb.forEach((b) => b.addEventListener('click', () => { state = state === b.dataset.go ? 'ombres' : b.dataset.go; show(); }));
  pbtn.forEach((b) => b.addEventListener('click', () => { pair = b.dataset.pair; state = 'ombres'; show(); }));
  show();
  const v = new T.Vector3();
  const place = (tag, x, y, z, s) => { v.set(x, y, z).project(cam); tag.style.transform = `translate(${((v.x + 1) / 2 * s.w).toFixed(1)}px, ${((1 - v.y) / 2 * s.h).toFixed(1)}px) translate(-50%, -50%)`; };
  const s = stage(el, (dt, s) => {
    coast(st, dt, 0); st.yaw = clamp(st.yaw, -.75, .75);
    if (!st.held) st.yaw *= Math.exp(-dt * .8);
    const a = .62 + st.yaw, d = s.w < 480 ? 8.4 : 8.6;
    cam.position.set(Math.sin(a) * d, 2.9, Math.cos(a) * d); cam.lookAt(0, -.15, -.3);
    const target = state === 'objet' ? 1 : 0;
    mat.opacity += (target - mat.opacity) * Math.min(1, dt * 5); mat.depthWrite = mat.opacity > .95;
    if (state === 'objet' && !REDUCE) spin += dt * .5;
    mesh.rotation.y = spin;
    s.renderer.render(scene, cam);
    place(tagA, 0, FLOOR + .01, 1.2, s); place(tagB, 0, 1.08, BACK, s);
  });
  if (!s) return;
  s.onResize = ({ w, h }) => { cam.aspect = w / h; cam.fov = w < 480 ? 33 : 29; cam.updateProjectionMatrix(); };
  s.onResize(s);
  spinner(s.canvas, st, { pmin: 0, pmax: 0 });
}

// =====================================================================================
// Figure 3 : reconstruire l'objet à partir des ombres des témoins.
// =====================================================================================
const G = 48, VS = 2 / G, NN = G * G * G, PAD = 2, F = G + 2 * PAD;
const CX = new Float32Array(NN), CY = new Float32Array(NN), CZ = new Float32Array(NN);
for (let k = 0, n = 0; k < G; k++) for (let j = 0; j < G; j++) for (let i = 0; i < G; i++, n++) {
  CX[n] = -1 + (i + .5) * VS; CY[n] = -1 + (j + .5) * VS; CZ[n] = -1 + (k + .5) * VS;
}
const TRUTH = {};
function truth(name) {
  if (!TRUTH[name]) {
    const occ = new Uint8Array(NN); let vol = 0;
    for (let n = 0; n < NN; n++) { occ[n] = SHAPES[name].inside(CX[n], CY[n], CZ[n]) ? 1 : 0; vol += occ[n]; }
    TRUTH[name] = { occ, vol };
  }
  return TRUTH[name];
}
// Distance euclidienne exacte (Felzenszwalb & Huttenlocher), au carré, en pixels.
function edt1(f, n, d, v, z) {
  let k = 0; v[0] = 0; z[0] = -Infinity; z[1] = Infinity;
  for (let q = 1; q < n; q++) {
    let s = ((f[q] + q * q) - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
    while (s <= z[k]) { k--; s = ((f[q] + q * q) - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]); }
    k++; v[k] = q; z[k] = s; z[k + 1] = Infinity;
  }
  k = 0;
  for (let q = 0; q < n; q++) { while (z[k + 1] < q) k++; d[q] = (q - v[k]) * (q - v[k]) + f[v[k]]; }
}
function edt(mask, R, target) {
  const g = new Float64Array(R * R), f = new Float64Array(R), d = new Float64Array(R), v = new Int32Array(R), z = new Float64Array(R + 1);
  for (let i = 0; i < R * R; i++) g[i] = mask[i] === target ? 0 : 1e12;
  for (let x = 0; x < R; x++) { for (let y = 0; y < R; y++) f[y] = g[y * R + x]; edt1(f, R, d, v, z); for (let y = 0; y < R; y++) g[y * R + x] = d[y]; }
  for (let y = 0; y < R; y++) { for (let x = 0; x < R; x++) f[x] = g[y * R + x]; edt1(f, R, d, v, z); for (let x = 0; x < R; x++) g[y * R + x] = d[x]; }
  return g;
}
const dirOf = (az, el) => new T.Vector3(Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el));

function figTemoins(el) {
  const out = {}; el.querySelectorAll('[data-o]').forEach((e) => { out[e.dataset.o] = e; });
  const scene = new T.Scene(), cam = new T.PerspectiveCamera(30, 1, .1, 60);
  scene.add(new T.HemisphereLight(0xa9b4d0, 0x141826, .7));
  const key = new T.DirectionalLight(0xfff4e0, 2.2); key.position.set(2.5, 5, 3); softShadow(key, 1.5, 1024); scene.add(key);
  const rim = new T.DirectionalLight(0x9fdcff, .7); rim.position.set(-3, 1.5, -3); scene.add(rim);
  const ground = new T.Mesh(new T.CircleGeometry(2.4, 64), new T.ShadowMaterial({ opacity: .35 }));
  ground.rotation.x = -Math.PI / 2; ground.position.y = -1.02; ground.receiveShadow = true; scene.add(ground);

  const hullMat = solidMat(CREAM, { roughness: .5, polygonOffset: true, polygonOffsetFactor: 2, polygonOffsetUnits: 2 });
  const mc = new T.MarchingCubes(F, hullMat, false, false, 120000);
  mc.isolation = 0; mc.scale.setScalar(F / G); mc.position.setScalar(1 / G); mc.castShadow = true; mc.frustumCulled = false;
  scene.add(mc);
  const truthMesh = new T.Mesh(geo('tore'), solidMat(TEAL)); truthMesh.visible = false; scene.add(truthMesh);
  const marks = new T.Group(); scene.add(marks);
  const ballGeo = new T.SphereGeometry(1, 20, 14);

  // les ombres : on rend le vrai objet en blanc sur noir, vu de chaque témoin, dans une petite cible
  const R = 160, E = 1.15, rt = new T.WebGLRenderTarget(R, R), px = new Uint8Array(R * R * 4);
  const maskScene = new T.Scene(), maskMesh = new T.Mesh(geo('tore'), new T.MeshBasicMaterial({ color: 0xffffff, side: T.DoubleSide }));
  maskScene.add(maskMesh);
  const maskCam = new T.OrthographicCamera(-E, E, E, -E, .1, 10);

  const ORDER = { 1: 'tore', 2: 'cone', 3: 'tasse' };
  let name = 'tore', tr = truth(name), views = [], tol = 1, kept = new Uint8Array(NN).fill(1), toi = null, revealed = false;
  let fieldNow = new Float32Array(NN).fill(.15), fieldFrom = fieldNow, fieldTo = fieldNow, tween = 1, dirty = true;
  const st = { yaw: -.4, pitch: .42, vel: 0, held: false };
  const s = stage(el, frame);
  if (!s) return;
  s.onResize = ({ w, h }) => { cam.aspect = w / h; cam.updateProjectionMatrix(); };
  s.onResize(s);
  spinner(s.canvas, st, { pmin: -.3, pmax: 1.35 });

  function shadowOf(d) {
    maskCam.position.copy(d).multiplyScalar(4);
    maskCam.up.set(0, 1, 0); if (Math.abs(d.y) > .985) maskCam.up.set(0, 0, -1);
    maskCam.lookAt(0, 0, 0); maskCam.updateMatrixWorld();
    const r = s.renderer, prev = r.getRenderTarget();
    r.setRenderTarget(rt); r.setClearColor(0x000000, 1); r.clear(); r.render(maskScene, maskCam);
    r.readRenderTargetPixels(rt, 0, 0, R, R, px); r.setRenderTarget(prev); r.setClearColor(0x000000, 0);
    const mask = new Uint8Array(R * R);
    for (let i = 0; i < R * R; i++) mask[i] = px[i * 4] > 127 ? 1 : 0;
    // distance signée au bord de l'ombre, en unités du monde (positive dedans) ; une marge d'un pixel
    // compense le maillage, un peu plus petit que l'objet idéal
    const dOut = edt(mask, R, 0), dIn = edt(mask, R, 1), sd = new Float32Array(R * R), PXW = 2 * E / R;
    for (let i = 0; i < R * R; i++) sd[i] = (mask[i] ? Math.sqrt(dOut[i]) - .5 : .5 - Math.sqrt(dIn[i])) * PXW + PXW;
    const e = maskCam.matrixWorld.elements;
    return { mask, sd, right: [e[0], e[1], e[2]], up: [e[4], e[5], e[6]] };
  }
  function add(az, elev, kind) {
    if (views.length >= 40) return;
    const d = dirOf(az, elev), sh = shadowOf(d);
    const lie = kind === 'menteur' ? { k: .55 + Math.random() * .1, du: (Math.random() < .5 ? -1 : 1) * (.2 + Math.random() * .15), dv: (Math.random() - .5) * .3 } : null;
    // pour chaque voxel : sa distance signée à l'ombre de ce témoin (interpolée), < 0 = hors de l'ombre
    const val = new Float32Array(NN), { mask, sd, right: u, up: w } = sh, k = lie ? lie.k : 1;
    for (let n = 0; n < NN; n++) {
      let pu = u[0] * CX[n] + u[1] * CY[n] + u[2] * CZ[n], pv = w[0] * CX[n] + w[1] * CY[n] + w[2] * CZ[n];
      if (lie) { pu = (pu - lie.du) / k; pv = (pv - lie.dv) / k; }
      const x = (pu + E) / (2 * E) * R - .5, y = (pv + E) / (2 * E) * R - .5;
      if (x < 0 || y < 0 || x >= R - 1 || y >= R - 1) { val[n] = -.3; continue; }
      const i = x | 0, j = y | 0, fx = x - i, fy = y - j, o = j * R + i;
      val[n] = k * ((sd[o] * (1 - fx) + sd[o + 1] * fx) * (1 - fy) + (sd[o + R] * (1 - fx) + sd[o + R + 1] * fx) * fy);
    }
    const v = { az, el: elev, d, kind, mask, lie, val };
    views.push(v); if (kind === 'toi') toi = v;
    const ball = new T.Mesh(ballGeo, new T.MeshBasicMaterial({ color: kind === 'toi' ? SUN : kind === 'voisin' ? 0xb9c2d6 : TEAL }));
    ball.scale.setScalar(kind === 'toi' ? .06 : .032); ball.position.copy(d).multiplyScalar(1.7); ball.userData.kind = kind; marks.add(ball);
    thumb(v); update(true);
  }
  function thumb(v) {
    const c = document.createElement('canvas'), Rt = 64, g = c.getContext('2d');
    c.width = c.height = Rt; c.className = 'th' + (v.kind === 'menteur' ? ' liar' : '') + (v.kind === 'toi' ? ' me' : '');
    const img = g.createImageData(Rt, Rt);
    for (let y = 0; y < Rt; y++) for (let x = 0; x < Rt; x++) {
      let pu = ((x + .5) / Rt) * 2 * E - E, pv = ((Rt - 1 - y + .5) / Rt) * 2 * E - E;
      if (v.lie) { pu = (pu - v.lie.du) / v.lie.k; pv = (pv - v.lie.dv) / v.lie.k; }
      const i = Math.floor((pu + E) / (2 * E) * R), j = Math.floor((pv + E) / (2 * E) * R);
      const on = i >= 0 && j >= 0 && i < R && j < R && v.mask[j * R + i], o = (y * Rt + x) * 4;
      img.data[o] = on ? 7 : 201; img.data[o + 1] = on ? 9 : 191; img.data[o + 2] = on ? 14 : 169; img.data[o + 3] = 255;
    }
    g.putImageData(img, 0, 0);
    out.thumbs.appendChild(c); out.thumbs.scrollLeft = out.thumbs.scrollWidth;
  }
  function update(animate) {
    // l'enveloppe : un point reste s'il est dans l'ombre d'au moins « need » témoins, c'est-à-dire si la
    // need-ième plus grande distance signée est positive (need = tous : simple minimum)
    const nv = views.length, need = nv ? Math.max(1, Math.ceil(tol * nv - 1e-9)) : 0, m = nv - need + 1;
    const field = new Float32Array(NN).fill(.3), buf = new Float32Array(m);
    if (nv) for (let n = 0; n < NN; n++) {
      let c = 0;
      for (let t = 0; t < nv; t++) { // garde les m plus petites valeurs, triées
        const x = views[t].val[n];
        if (c < m) { let i = c++; while (i > 0 && buf[i - 1] > x) { buf[i] = buf[i - 1]; i--; } buf[i] = x; }
        else if (x < buf[m - 1]) { let i = m - 1; while (i > 0 && buf[i - 1] > x) { buf[i] = buf[i - 1]; i--; } buf[i] = x; }
      }
      field[n] = Math.max(-.15, Math.min(.15, buf[m - 1]));
    }
    kept = new Uint8Array(NN);
    let inter = 0, extra = 0, lost = 0;
    for (let n = 0; n < NN; n++) {
      kept[n] = field[n] >= 0 ? 1 : 0;
      if (kept[n] && tr.occ[n]) inter++; else if (kept[n]) extra++; else if (tr.occ[n]) lost++;
    }
    fieldFrom = fieldNow; fieldTo = field; tween = animate && !REDUCE ? 0 : 1; dirty = true;
    out.iou.textContent = Math.round(inter / (inter + extra + lost) * 100) + tx('pct');
    const trop = extra / tr.vol, perdu = lost / tr.vol;
    out.trop.style.width = Math.min(100, trop * 40) + '%'; out.tropn.textContent = '+' + Math.round(trop * 100) + tx('pct');
    out.perdu.style.width = Math.min(100, perdu * 100) + '%'; out.perdun.textContent = '−' + Math.round(perdu * 100) + tx('pct');
    out.n.textContent = fmt(plural(nv), { n: nv });
    out.tolv.textContent = nv ? fmt('need', { k: need, n: nv }) : '–';
    dots();
  }
  function dots() {
    let h = '';
    for (const v of views) h += `<circle class="dot ${v.kind}${v.el < 0 ? ' below' : ''}" cx="${v.d.x.toFixed(3)}" cy="${v.d.z.toFixed(3)}" r="${v.kind === 'toi' ? .1 : .07}"/>`;
    if (toi) h += `<text class="me" x="${toi.d.x.toFixed(3)}" y="${(toi.d.z + .27).toFixed(3)}">${tx('me')}</text>`;
    out.dots.innerHTML = h;
  }
  function reveal(on) {
    revealed = on; el.classList.toggle('revealed', on); truthMesh.visible = on;
    Object.assign(hullMat, on ? { transparent: true, opacity: .32, depthWrite: false } : { transparent: false, opacity: 1, depthWrite: true });
    hullMat.color.set(on ? HOT : CREAM); hullMat.needsUpdate = true;
    mc.scale.setScalar(F / G * (on ? .975 : 1)); // là où l'enveloppe colle à l'objet, l'objet passe devant
    mc.castShadow = !on; truthMesh.castShadow = on;
    marks.children.forEach((b) => { if (b.userData.kind === 'menteur') b.material.color.set(on ? HOT : TEAL); });
    out.name.textContent = on ? fmt('was', { o: SHAPES[name].name }) : tx('mystery');
    out.reveal.textContent = on ? tx('hide') : tx('reveal');
  }
  function reset(newName) {
    if (newName) { name = newName; tr = truth(name); truthMesh.geometry = maskMesh.geometry = geo(name); }
    views = []; toi = null; out.thumbs.innerHTML = ''; marks.clear(); kept = new Uint8Array(NN).fill(1);
    fieldNow = new Float32Array(NN).fill(.15); reveal(false);
    add(.55, .12, 'toi');
  }
  function frame(dt, s) {
    coast(st, dt, .22);
    const d = 6.1;
    cam.position.set(Math.sin(st.yaw) * Math.cos(st.pitch) * d, Math.sin(st.pitch) * d - .1, Math.cos(st.yaw) * Math.cos(st.pitch) * d);
    cam.lookAt(0, -.08, 0);
    if (tween < 1) {
      tween = Math.min(1, tween + dt / .7);
      const e = 1 - Math.pow(1 - tween, 3), a = fieldFrom, b = fieldTo, f = new Float32Array(NN);
      for (let n = 0; n < NN; n++) f[n] = a[n] + (b[n] - a[n]) * e;
      fieldNow = f; dirty = true;
    } else if (fieldNow !== fieldTo) { fieldNow = fieldTo; dirty = true; }
    if (dirty) {
      const fld = mc.field; fld.fill(-.15);
      for (let k = 0, n = 0; k < G; k++) for (let j = 0; j < G; j++) {
        const row = (k + PAD) * F * F + (j + PAD) * F + PAD;
        for (let i = 0; i < G; i++, n++) fld[row + i] = fieldNow[n];
      }
      mc.update(); dirty = false;
    }
    s.renderer.render(scene, cam);
  }

  el.querySelector('svg.ring').addEventListener('click', (e) => {
    const r = e.currentTarget.getBoundingClientRect(), x = ((e.clientX - r.left) / r.width - .5) * 2.5, y = ((e.clientY - r.top) / r.height - .5) * 2.5;
    add(Math.atan2(x, y), Math.acos(Math.min(1, Math.hypot(x, y))), 'temoin');
  });
  const on = (sel, fn) => el.querySelector(sel).addEventListener('click', fn);
  on('[data-do="voisin"]', () => { const b = toi || { az: 0, el: .1 }; add(b.az + (Math.random() - .5) * .3, clamp(b.el + (Math.random() - .5) * .16, -.2, 1.4), 'voisin'); });
  on('[data-do="inconnu"]', () => add(Math.random() * 2 * Math.PI, Math.asin(Math.random() * 1.3 - .3), 'inconnu'));
  on('[data-do="menteur"]', () => add(Math.random() * 2 * Math.PI, Math.asin(Math.random() * 1.1 - .2), 'menteur'));
  on('[data-do="reset"]', () => reset());
  out.reveal.addEventListener('click', () => reveal(!revealed));
  out.tol.addEventListener('input', () => { tol = out.tol.value / 100; out.tolp.textContent = out.tol.value + tx('pct'); update(false); });
  const objBtns = [...el.querySelectorAll('[data-obj]')];
  objBtns.forEach((b) => b.addEventListener('click', () => { press(objBtns, 'data-obj', b.dataset.obj); reset(ORDER[b.dataset.obj]); }));
  reset();
}

// =====================================================================================
// Figure 4 : le schéma n° 1 devient l'objet. Posé dans le coin de pièce de la figure 2, il projette à son tour :
// vu par la tranche, son mur n'est plus qu'un trait, son objet une tache, sa lampe un point.
// =====================================================================================
function figMeta(el) {
  const scene = new T.Scene(), cam = new T.PerspectiveCamera(30, 1, .1, 60);
  const FLOOR = -1.05, BACK = -1.45;
  const floor = wallMesh(3.4, 3.2); floor.rotation.x = -Math.PI / 2; floor.position.set(0, FLOOR, .15); scene.add(floor);
  const back = wallMesh(3.4, 2.5); back.position.set(0, FLOOR + 1.25, BACK); scene.add(back);
  scene.add(new T.HemisphereLight(0x9aa6c4, 0x10141f, .5));
  const top = new T.DirectionalLight(0xfff1d6, 1.6); top.position.set(0, 7, 0); top.shadow.camera.up.set(0, 0, -1); softShadow(top, 1.4, 1024); scene.add(top);
  const front = new T.DirectionalLight(0xfff1d6, 1.6); front.position.set(0, 0, 7); softShadow(front, 1.4, 1024); scene.add(front);

  // la maquette : le mur, l'objet et la lampe de la figure 1, à l'échelle 0,7
  const model = new T.Group(); model.scale.setScalar(.8); model.position.y = .05; scene.add(model);
  const miniWall = new T.Mesh(new T.BoxGeometry(.05, 1.5, 1.5), new T.MeshStandardMaterial({ color: WALL, roughness: .95 }));
  miniWall.position.x = -1.05; miniWall.castShadow = miniWall.receiveShadow = true; model.add(miniWall);
  const spin = new T.Group(); model.add(spin);
  const obj = new T.Mesh(geo('cylindre'), solidMat(SUN)); obj.scale.setScalar(.8); obj.castShadow = obj.receiveShadow = true; spin.add(obj);
  const bulb = new T.Mesh(new T.SphereGeometry(.09, 24, 16), new T.MeshBasicMaterial({ color: 0xfff3d6 }));
  bulb.position.x = 1.05; bulb.castShadow = true; model.add(bulb);
  const halo = glow('rgba(255,201,119,1)'); halo.scale.setScalar(.7); halo.position.copy(bulb.position); model.add(halo);
  // sa propre lumière : son ombre s'arrête à son petit mur (far), elle n'atteint pas les murs de la pièce
  const own = new T.DirectionalLight(0xfff1d6, 2.2); own.position.set(2.4, 0, 0); model.add(own); model.add(own.target);
  softShadow(own, .7, 512); own.shadow.camera.near = .1; own.shadow.camera.far = 2.8;

  const st = { yaw: 0, pitch: 0, vel: 0, held: false };
  let t = 0;
  const s = stage(el, (dt, s) => {
    coast(st, dt, 0); st.yaw = clamp(st.yaw, -.55, .55);
    if (!st.held) st.yaw *= Math.exp(-dt * .6);
    if (!REDUCE) t += dt;
    model.rotation.y = st.yaw + (REDUCE ? 0 : .22 * Math.sin(t / 3.1));
    spin.rotation.set(.5 + .4 * Math.sin(t / 4.2), t * .35, 0, 'YXZ');
    const a = .62, d = s.w < 480 ? 7.6 : 7.4;
    cam.position.set(Math.sin(a) * d, 2.9, Math.cos(a) * d); cam.lookAt(0, -.15, -.3);
    s.renderer.render(scene, cam);
  });
  if (!s) return;
  s.onResize = ({ w, h }) => { cam.aspect = w / h; cam.fov = w < 480 ? 33 : 30; cam.updateProjectionMatrix(); };
  s.onResize(s);
  spinner(s.canvas, st, { pmin: 0, pmax: 0 });
}

const a = document.getElementById('fig-ombre'), b = document.getElementById('fig-deux'), c = document.getElementById('fig-temoins');
if (a) figOmbre(a);
if (b) figDeux(b);
if (c) figTemoins(c);
const m = document.getElementById('fig-meta');
if (m) figMeta(m);
