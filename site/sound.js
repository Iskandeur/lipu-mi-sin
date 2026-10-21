/* Small synthesized sounds, WebAudio only, no files. Silent until the visitor touches the page;
   the button in the bar mutes it, and the choice is kept. Never any music. */
(function () {
  "use strict";
  var ctx = null, master = null, last = {}, on = true;
  try { on = localStorage.getItem("sound") !== "off"; } catch (e) {}
  var btn = document.getElementById("snd");

  function paint() {
    if (!btn) return;
    btn.setAttribute("aria-pressed", on ? "true" : "false");
    btn.setAttribute("data-ia", on ? "sndOn" : "sndOff");
    var T = window.I18N && I18N.T, d = T && (T[I18N.lang] || T.en);
    if (d) btn.setAttribute("aria-label", on ? (d.sndOn || T.en.sndOn) : (d.sndOff || T.en.sndOff));
  }
  function wake() {
    if (ctx || !on) return;
    var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    ctx = new AC(); master = ctx.createGain(); master.gain.value = .35;
    var comp = ctx.createDynamicsCompressor(); master.connect(comp); comp.connect(ctx.destination);
  }
  ["pointerdown", "keydown"].forEach(function (ev) { addEventListener(ev, wake, { capture: true, passive: true }); });

  function ok(name, gap) {
    if (!on || !ctx) return false;
    if (ctx.state === "suspended") ctx.resume();
    var t = ctx.currentTime; if (last[name] && t - last[name] < (gap || .03)) return false;
    last[name] = t; return true;
  }
  function env(g, t, a, peak, d) { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + d); }
  function tone(type, f, peak, d, f2, at) {
    var t = ctx.currentTime + (at || 0), o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d);
    env(g, t, .004, peak, d); o.connect(g); g.connect(master); o.start(t); o.stop(t + d + .05);
  }
  var nbuf = null;
  function noise(peak, d, freq, q) {
    if (!nbuf) { nbuf = ctx.createBuffer(1, ctx.sampleRate * .4, ctx.sampleRate); var a = nbuf.getChannelData(0); for (var i = 0; i < a.length; i++) a[i] = Math.random() * 2 - 1; }
    var t = ctx.currentTime, s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = nbuf; f.type = "bandpass"; f.frequency.value = freq; f.Q.value = q || 1;
    env(g, t, .002, peak, d); s.connect(f); f.connect(g); g.connect(master); s.start(t); s.stop(t + d + .05);
  }
  /* a pentatonic scale, so that everything played together still sounds fine */
  var PENTA = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21];
  function note(i, base) { return (base || 440) * Math.pow(2, PENTA[((i % PENTA.length) + PENTA.length) % PENTA.length] / 12); }

  var S = {
    /* a letter lands: wooden knock, harder and lower when it falls fast; a crack above a threshold */
    hit: function (v) {
      if (!ok("hit", .045)) return;
      var k = Math.min(1, v / 26);
      tone("triangle", 190 - 60 * k, .12 + .35 * k, .09 + .05 * k, 70);
      noise(.05 + .2 * k, .05, 1800 - 600 * k, 1.4);
      if (v > 20 && ok("crack", .12)) { noise(.35, .12, 3200, .7); tone("square", 900, .04, .05, 300, .01); }
    },
    pop: function () { if (ok("pop", .04)) { tone("sine", 520 + Math.random() * 300, .22, .12, 1100); } },
    grab: function () { if (ok("grab")) tone("sine", 330, .12, .06, 420); },
    tick: function () { if (ok("tick", .06)) noise(.08, .03, 4200, 3); },
    lantern: function (i) { if (ok("lantern", .07)) { tone("sine", note(i, 523), .16, .9); tone("sine", note(i, 1046), .04, .6); } },
    pulse: function (i) { if (!ok("pulse", .1)) return; for (var k = 0; k < 4; k++) tone("triangle", note(i + k * 2, 392), .12, .35, null, k * .07); },
    rebuild: function () { if (!ok("rebuild", .3)) return; for (var k = 0; k < 6; k++) tone("triangle", note(k, 330), .12, .22, null, k * .06); },
    chime: function () { if (!ok("chime", .3)) return; [0, 2, 4, 7].forEach(function (k, n) { tone("sine", note(k, 659), .14, 1.2, null, n * .11); }); },
    toggle: function () { on = !on; try { localStorage.setItem("sound", on ? "on" : "off"); } catch (e) {} if (on) { wake(); S.chime(); } paint(); }
  };
  if (btn) btn.addEventListener("click", function () { S.toggle(); });
  window.SOUND = S;
  window.addEventListener("DOMContentLoaded", paint); paint();
})();
