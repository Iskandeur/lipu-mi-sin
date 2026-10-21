// Investigation posts: reading mode (everyone / technical), reading progress, image zoom, share.
(function () {
  var root = document.documentElement;
  var KEY = 'ap-blog-mode';
  function fromHash() {
    var h = location.hash.replace('#', '');
    if (h === 'technique' || h === 'tech') return 'tech';
    if (h === 'tout-public' || h === 'simple') return 'simple';
    return null;
  }
  function stored() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function setMode(m, push) {
    root.setAttribute('data-mode', m);
    document.querySelectorAll('[data-set-mode]').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-set-mode') === m));
    });
    try { localStorage.setItem(KEY, m); } catch (e) {}
    if (push) history.replaceState(null, '', '#' + (m === 'tech' ? 'technique' : 'tout-public'));
  }
  setMode(fromHash() || stored() || 'simple', false);
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-set-mode]');
    if (!b) return;
    var m = b.getAttribute('data-set-mode');
    setMode(m, true);
    if (b.hasAttribute('data-jump')) {
      var top = document.querySelector('.modes');
      if (top) window.scrollTo({ top: top.getBoundingClientRect().top + window.scrollY - 60 });
    }
  });
  window.addEventListener('hashchange', function () { var m = fromHash(); if (m) setMode(m, false); });

  var bar = document.querySelector('.progress');
  if (bar) {
    var tick = function () {
      var h = document.documentElement.scrollHeight - innerHeight;
      bar.style.transform = 'scaleX(' + (h > 0 ? Math.min(1, scrollY / h) : 0) + ')';
    };
    addEventListener('scroll', tick, { passive: true }); tick();
  }

  var lb = document.createElement('div');
  lb.className = 'lb'; lb.hidden = true; lb.innerHTML = '<img alt="">';
  document.body.appendChild(lb);
  lb.addEventListener('click', function () { lb.hidden = true; });
  addEventListener('keydown', function (e) { if (e.key === 'Escape') lb.hidden = true; });
  document.querySelectorAll('figure img').forEach(function (img) {
    img.addEventListener('click', function () { lb.firstChild.src = img.currentSrc || img.src; lb.firstChild.alt = img.alt; lb.hidden = false; });
  });

  document.querySelectorAll('[data-share]').forEach(function (b) {
    b.addEventListener('click', function () {
      var url = location.href.split('#')[0] + '#' + (b.getAttribute('data-share') === 'tech' ? 'technique' : 'tout-public');
      var title = document.title;
      if (navigator.share) { navigator.share({ title: title, url: url }).catch(function () {}); return; }
      (navigator.clipboard ? navigator.clipboard.writeText(url) : Promise.reject()).then(function () {
        var t = b.textContent; b.textContent = 'Lien copié ✓'; setTimeout(function () { b.textContent = t; }, 1800);
      }).catch(function () { prompt('Copie ce lien :', url); });
    });
  });
})();
