// include.js — simple include injector for nav/footer
(function(){
  let includesPending = 0;

  function enhanceNavigation(){
    const overlay = document.getElementById('nav-overlay');
    const burger = document.getElementById('nav-burger');
    if (!overlay || !burger) return;

    let returnFocus = null;
    let previousOverflow = '';
    const focusables = () => Array.from(overlay.querySelectorAll('a[href], button:not([disabled])'));
    const setOverlayTabState = open => focusables().forEach(el => {
      if (open) el.removeAttribute('tabindex');
      else el.setAttribute('tabindex', '-1');
    });

    window.openMenu = function(){
      returnFocus = document.activeElement;
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      document.body.classList.add('nav-open');
      overlay.setAttribute('aria-hidden', 'false');
      burger.setAttribute('aria-expanded', 'true');
      burger.setAttribute('aria-label', 'Navigation schließen');
      setOverlayTabState(true);
      requestAnimationFrame(() => (overlay.querySelector('[aria-current="page"]') || focusables()[0])?.focus());
    };
    window.closeMenu = function(){
      document.body.classList.remove('nav-open');
      document.body.style.overflow = previousOverflow;
      overlay.setAttribute('aria-hidden', 'true');
      burger.setAttribute('aria-expanded', 'false');
      burger.setAttribute('aria-label', 'Navigation öffnen');
      setOverlayTabState(false);
      if (returnFocus && document.contains(returnFocus)) returnFocus.focus({ preventScroll: true });
    };
    window.toggleMenu = function(){
      document.body.classList.contains('nav-open') ? window.closeMenu() : window.openMenu();
    };

    burger.addEventListener('click', window.toggleMenu);
    overlay.addEventListener('click', event => {
      if (event.target === overlay) window.closeMenu();
    });
    setOverlayTabState(false);
    document.addEventListener('keydown', event => {
      if (!document.body.classList.contains('nav-open')) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        window.closeMenu();
        return;
      }
      if (event.key !== 'Tab') return;
      const items = focusables();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
  }

  function loadInclude(src, targetId){
    includesPending += 1;
    fetch(src, { cache: 'no-cache' }).then(r => {
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
      if (href.endsWith(path) || ((path === '' || path === 'index.html') && href.endsWith('index.html'))) {
        a.setAttribute('aria-current','page');
      }
    });
  }

  function initIncludes(){
    loadInclude('includes/nav.html','shared-nav');
    loadInclude('includes/footer.html','shared-footer');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initIncludes, { once: true });
  } else {
    initIncludes();
  }
})();
