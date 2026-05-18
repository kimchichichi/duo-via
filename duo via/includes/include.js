// include.js — simple include injector for nav/footer
(function(){
  let includesPending = 0;

  function enhanceNavigation(){
    const overlay = document.getElementById('nav-overlay');
    const burger = document.getElementById('nav-burger');
    if (!overlay || !burger) return;

    const focusables = () => Array.from(overlay.querySelectorAll('a[href], button:not([disabled])'));
    const setOverlayTabState = open => focusables().forEach(el => {
      if (open) el.removeAttribute('tabindex');
      else el.setAttribute('tabindex', '-1');
    });

    window.openMenu = function(){
      document.body.classList.add('nav-open');
      overlay.setAttribute('aria-hidden', 'false');
      burger.setAttribute('aria-expanded', 'true');
      burger.setAttribute('aria-label', 'Navigation schließen');
      setOverlayTabState(true);
    };
    window.closeMenu = function(){
      document.body.classList.remove('nav-open');
      overlay.setAttribute('aria-hidden', 'true');
      burger.setAttribute('aria-expanded', 'false');
      burger.setAttribute('aria-label', 'Navigation öffnen');
      setOverlayTabState(false);
    };
    window.toggleMenu = function(){
      document.body.classList.contains('nav-open') ? window.closeMenu() : window.openMenu();
    };

    setOverlayTabState(false);
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && document.body.classList.contains('nav-open')) window.closeMenu();
    });
  }

  function loadInclude(src, targetId){
    includesPending += 1;
    fetch(src).then(r => {
      if (!r.ok) throw new Error('fetch failed');
      return r.text();
    }).then(html => {
      const el = document.getElementById(targetId);
      if (el) el.innerHTML = html;
      setCurrentLinks();
    }).catch(()=>{}).finally(() => {
      includesPending -= 1;
      if (includesPending === 0) enhanceNavigation();
    });
  }

  function setCurrentLinks(){
    const path = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('#nav-quick a, .nav-links-main a, .footer-links a').forEach(a => {
      a.removeAttribute('aria-current');
      const href = a.getAttribute('href') || '';
      if (href.endsWith(path) || ((path === '' || path === 'index.html') && href.endsWith('landing.html'))) {
        a.setAttribute('aria-current','page');
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function(){
    loadInclude('includes/nav.html','shared-nav');
    loadInclude('includes/footer.html','shared-footer');
  });
})();
