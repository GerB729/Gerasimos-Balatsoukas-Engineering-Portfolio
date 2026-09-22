/* ===========================================================================
   GERASIMOS BALATSOUKAS - PORTFOLIO SCRIPT
   Loaded at the end of index.html. Seven self-contained pieces, in order:
   the light / dark control, the mobile menu, the view navigation, the print
   buttons, the lightbox, the hero clip and the scroll reveals. The theme is
   restored earlier, by the small inline script in <head>, so the page does
   not flash on load.
   =========================================================================== */

/* --- light / dark control -----------------------------------------------
   No saved choice means the page follows the device setting. Pressing the
   button saves an explicit choice, which then wins until it is changed.
   The button's text names the mode it switches to. */
(function(){
  const btn = document.getElementById('themeToggle');
  const root = document.documentElement;
  const system = window.matchMedia('(prefers-color-scheme: dark)');
  const metas = document.querySelectorAll('meta[name="theme-color"]');
  const original = [...metas].map(m => m.getAttribute('content'));

  function currentIsDark(){
    const set = root.getAttribute('data-theme');
    if(set === 'dark')  return true;
    if(set === 'light') return false;
    return system.matches;
  }
  function label(){
    const dark = currentIsDark();
    const next = dark ? 'light' : 'dark';
    btn.textContent = dark ? 'Light' : 'Dark';
    btn.setAttribute('aria-label', 'Switch to ' + next + ' mode');
    // Both theme-color tags carry a media query, so after an explicit choice
    // they are pointed at the chosen page colour; with no choice they are restored.
    const explicit = root.getAttribute('data-theme');
    metas.forEach((m, i) => {
      m.setAttribute('content', explicit ? (dark ? '#0e1a1e' : '#f4f7f7') : original[i]);
    });
  }
  btn.addEventListener('click', ()=>{
    const next = currentIsDark() ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try{ localStorage.setItem('theme', next); }catch(e){}
    label();
  });
  // if the device flips while the visitor has made no explicit choice
  system.addEventListener('change', ()=>{ if(!root.getAttribute('data-theme')) label(); });
  label();
})();

/* --- mobile menu ------------------------------------------------------- */
(function(){
  const toggle = document.getElementById('navToggle');
  const links  = document.getElementById('navLinks');
  const mq     = window.matchMedia('(max-width:1023px)');

  function setDrawer(open){
    toggle.setAttribute('aria-expanded', String(open));
    links.hidden = !open;
  }
  function sync(){
    // above the breakpoint the links are always visible, so drop the hidden flag
    if(mq.matches){ setDrawer(false); } else { links.hidden = false; toggle.setAttribute('aria-expanded','false'); }
  }
  toggle.addEventListener('click', ()=> setDrawer(links.hidden));
  mq.addEventListener('change', sync);
  sync();

  // close the drawer after choosing something inside it
  links.addEventListener('click', e=>{ if(mq.matches && e.target.closest('a')) setDrawer(false); });
  document.addEventListener('keydown', e=>{
    if(e.key==='Escape' && mq.matches && !links.hidden){ setDrawer(false); toggle.focus(); }
  });
  window.__closeDrawer = ()=>{ if(mq.matches) setDrawer(false); };
})();

/* --- the Projects menu ---------------------------------------------------
   A button that opens the list of every project. It closes on Escape, on a
   click outside, and after a project is chosen. Without this script the list
   is simply visible (see the .js rules in the stylesheet). */
(function(){
  const wrap = document.getElementById('projectsMenu');
  const btn  = document.getElementById('projectsBtn');
  const list = document.getElementById('projectsList');
  if(!wrap || !btn || !list) return;

  function setOpen(open){
    btn.setAttribute('aria-expanded', String(open));
    wrap.classList.toggle('open', open);
  }
  btn.addEventListener('click', ()=> setOpen(btn.getAttribute('aria-expanded') !== 'true'));
  list.addEventListener('click', e=>{ if(e.target.closest('a')) setOpen(false); });
  document.addEventListener('click', e=>{ if(!wrap.contains(e.target)) setOpen(false); });
  document.addEventListener('keydown', e=>{
    if(e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true'){
      setOpen(false);
      btn.focus();
    }
  });
  // closing the mobile drawer closes this too
  const closeDrawer = window.__closeDrawer;
  window.__closeDrawer = function(){ setOpen(false); if(closeDrawer) closeDrawer(); };
})();

/* --- view navigation: show one view at a time ----------------------------
   Every "#something" link is resolved to the view that contains it. A link
   to a view (#stent) opens that view at the top; a link to an element inside
   a view (#work) opens the view and scrolls to the element. pushState keeps
   the browser back button stepping through what was visited.            */
(function(){
  const views  = document.querySelectorAll('.view');
  const status = document.getElementById('viewStatus');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const projectIds = ['stent','scaffolds','generator','cfd','biosensor','forecast','drug','cad','python','bedtower'];
  // the link that was followed out of each view, so Back can return focus to it
  const openers = {};
  // show() decides where each view opens (its top, a linked element, or the
  // link that was followed out of it), so the browser's own restoring of old
  // scroll positions on Back and Forward is switched off
  if('scrollRestoration' in history) history.scrollRestoration = 'manual';

  function resolve(id){
    if(!id) return null;
    const el = document.getElementById(id);
    if(!el) return null;
    const view = el.classList.contains('view') ? el : el.closest('.view');
    if(!view) return null;
    return {view: view.id, target: el === view ? null : el, hash: id};
  }

  function markNav(viewId){
    document.querySelectorAll('.nav-link[data-nav]').forEach(a=>{
      const key = a.dataset.nav;
      let state = null;
      if(key === viewId) state = 'page';
      else if(key === 'work' && viewId === 'home') state = 'page';
      else if(key === 'work' && projectIds.includes(viewId)) state = 'true';
      // the About link has no data-nav: its text lives on the landing page,
      // so "Work" is the current page whenever the landing page is open
      if(state) a.setAttribute('aria-current', state); else a.removeAttribute('aria-current');
    });
  }

  function show(r, mode){
    const changed = !document.getElementById(r.view).classList.contains('active');
    views.forEach(v => v.classList.toggle('active', v.id === r.view));
    markNav(r.view);

    if(mode === 'push')         history.pushState({hash:r.hash}, '', '#' + r.hash);
    else if(mode === 'replace') history.replaceState({hash:r.hash}, '', '#' + r.hash);

    const title = document.getElementById(r.view).querySelector('h1,h2');
    if(changed && title && status) status.textContent = title.textContent.trim() + ', loaded.';
    // After a visitor's own action (not the first load), keyboard and screen
    // reader focus moves to what was opened: the element linked to, or the
    // view's heading. Otherwise focus stays on a link that has just been hidden.
    // Going back returns focus, and the scroll position, to the link that was
    // followed out of the view.
    const opener = mode === 'back' && changed ? openers[r.view] : null;
    if(opener && opener.isConnected && document.getElementById(r.view).contains(opener)){
      const html = document.documentElement;
      html.style.scrollBehavior = 'auto';
      opener.focus();
      html.style.scrollBehavior = '';
      if(window.__closeDrawer) window.__closeDrawer();
      return;
    }
    const focusTo = mode !== 'replace' && (r.target || (changed ? title : null));
    if(focusTo){
      if(!focusTo.hasAttribute('tabindex')) focusTo.setAttribute('tabindex', '-1');
      focusTo.focus({preventScroll: true});
    }
    if(r.target){
      r.target.scrollIntoView({behavior: reduce.matches ? 'auto' : 'smooth', block:'start'});
    } else if(changed || mode === 'push'){
      // jump, do not glide: a new view should open at its top straight away,
      // so the smooth scrolling set in the CSS is switched off for this call
      const html = document.documentElement;
      html.style.scrollBehavior = 'auto';
      window.scrollTo(0, 0);
      html.style.scrollBehavior = '';
    }
    if(window.__closeDrawer) window.__closeDrawer();
  }

  document.addEventListener('click', e=>{
    if(e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const link = e.target.closest('a[href^="#"], button[data-view]');
    if(!link) return;
    const id = link.tagName === 'A' ? decodeURIComponent(link.getAttribute('href').slice(1)) : link.dataset.view;
    const r = resolve(id);
    if(!r) return;               // the skip link and anything else keeps its default
    e.preventDefault();
    const from = document.querySelector('.view.active');
    if(from && from.id !== r.view && from.contains(link)) openers[from.id] = link;
    show(r, 'push');
  });

  // back / forward buttons
  window.addEventListener('popstate', e=>{
    const id = (e.state && e.state.hash) || location.hash.slice(1) || 'home';
    show(resolve(id) || resolve('home'), 'back');
  });
  // someone edits the hash by hand, or follows a #link from elsewhere
  window.addEventListener('hashchange', ()=>{
    const r = resolve(decodeURIComponent(location.hash.slice(1)));
    if(r) show(r, null);
  });

  // first load: a hash opens that view; no hash opens the landing page and
  // leaves the address bar untouched
  const first = resolve(decodeURIComponent(location.hash.slice(1)));
  if(first){
    show(first, 'replace');
  } else {
    show(resolve('home'), null);
    history.replaceState({hash:'home'}, '');
  }
})();

/* --- print buttons ------------------------------------------------------ */
document.querySelectorAll('[data-print]').forEach(el=>{
  el.addEventListener('click', e=>{ e.preventDefault(); window.print(); });
});

/* --- lightbox: click a figure to see it large with its caption ----------
   The arrow buttons and the left and right arrow keys step through the
   figures of the page that is open. Tab stays inside the dialog, and a clip's
   own controls are part of that loop. */
(function(){
  const lb      = document.getElementById('lightbox');
  const content = lb.querySelector('.lb-content');
  const cap     = lb.querySelector('.lb-cap');
  const count   = lb.querySelector('.lb-count');
  const closeBtn= lb.querySelector('.lb-close');
  const prevBtn = lb.querySelector('.lb-prev');
  const nextBtn = lb.querySelector('.lb-next');
  let lastFocus = null;
  let figs = [];
  let index = 0;

  function captionOf(fig){
    const own = fig.querySelector(':scope > figcaption');
    let text = own ? own.textContent.trim() : '';
    // a panel of a combined figure borrows the figure's caption for context
    const parent = fig.parentElement.closest('figure');
    if(parent){
      const main = parent.querySelector(':scope > figcaption');
      if(main) text = text + ' ' + main.textContent.trim();
    }
    return text;
  }

  function render(){
    const fig  = figs[index];
    const type = fig.dataset.type;
    const src  = fig.dataset.src;
    const thumb = fig.querySelector('img');

    content.replaceChildren();
    let node;
    if(type === 'video'){
      node = document.createElement('video');
      node.src = src; node.loop = true; node.muted = true;
      node.playsInline = true; node.controls = true;
      if(thumb) node.poster = thumb.getAttribute('src');
      if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches) node.autoplay = true;
    } else {
      node = document.createElement('img');
      node.src = src;
      node.alt = thumb ? thumb.alt : '';
    }
    content.appendChild(node);
    cap.textContent = captionOf(fig);

    const many = figs.length > 1;
    prevBtn.hidden = nextBtn.hidden = !many;
    count.textContent = many ? 'Figure ' + (index + 1) + ' of ' + figs.length + ' on this page' : '';
  }

  function open(fig){
    const view = fig.closest('.view');
    figs = [...(view || document).querySelectorAll('.fig[data-src]')];
    index = Math.max(0, figs.indexOf(fig));
    render();
    lastFocus = document.activeElement;
    lb.hidden = false;
    lb.classList.add('open');
    closeBtn.focus();
    document.body.style.overflow = 'hidden';
  }

  function step(delta){
    if(figs.length < 2) return;
    index = (index + delta + figs.length) % figs.length;
    render();
  }

  function close(){
    lb.classList.remove('open');
    lb.hidden = true;
    content.replaceChildren();
    document.body.style.overflow = '';
    if(lastFocus) lastFocus.focus();
  }

  document.querySelectorAll('.fig[data-src]').forEach(fig=>{
    const btn = fig.querySelector('.fig-thumb');
    if(btn) btn.addEventListener('click', ()=> open(fig));
  });

  lb.addEventListener('click', e=>{ if(e.target === lb) close(); });
  closeBtn.addEventListener('click', close);
  prevBtn.addEventListener('click', ()=> step(-1));
  nextBtn.addEventListener('click', ()=> step(1));

  document.addEventListener('keydown', e=>{
    if(lb.hidden) return;
    if(e.key === 'Escape'){ close(); return; }
    if(e.key === 'ArrowLeft' && !(e.target instanceof HTMLVideoElement)){ e.preventDefault(); step(-1); return; }
    if(e.key === 'ArrowRight' && !(e.target instanceof HTMLVideoElement)){ e.preventDefault(); step(1); return; }
    if(e.key === 'Tab'){
      // keep the keyboard inside the dialog while it is open
      const stops = [closeBtn, prevBtn, content.querySelector('video'), nextBtn].filter(el => el && !el.hidden);
      const at = stops.indexOf(document.activeElement);
      e.preventDefault();
      const next = e.shiftKey ? (at <= 0 ? stops.length - 1 : at - 1) : (at + 1) % stops.length;
      stops[next].focus();
    }
  });
})();

/* --- hero clip -----------------------------------------------------------
   The clip is the only video that plays by itself. It waits for the page to
   finish loading, never starts when the visitor prefers reduced motion or
   has data saving on, pauses whenever it is off screen, and has a Pause /
   Play control (the loop runs longer than five seconds in total). */
(function(){
  const video  = document.getElementById('heroVideo');
  const toggle = document.getElementById('heroToggle');
  if(!video || !toggle) return;
  const reduce   = window.matchMedia('(prefers-reduced-motion: reduce)');
  const saveData = !!(navigator.connection && navigator.connection.saveData);
  let wanted  = !reduce.matches && !saveData;   // what the visitor wants
  let visible = false;

  function render(){
    toggle.hidden = false;
    toggle.textContent = wanted ? 'Pause' : 'Play';
    toggle.setAttribute('aria-label', (wanted ? 'Pause' : 'Play') + ' the stent animation');
  }
  function apply(){
    if(wanted && visible){
      if(video.preload !== 'auto') video.preload = 'auto';
      const p = video.play();
      if(p && p.catch) p.catch(()=>{ wanted = false; render(); });
    } else {
      video.pause();
    }
  }
  toggle.addEventListener('click', ()=>{ wanted = !wanted; render(); apply(); });
  reduce.addEventListener('change', ()=>{ if(reduce.matches){ wanted = false; render(); apply(); } });

  function begin(){
    render();
    if('IntersectionObserver' in window){
      new IntersectionObserver(entries=>{
        visible = entries[0].isIntersecting;
        apply();
      }, {threshold:0.25}).observe(video);
    } else {
      visible = true;
      apply();
    }
  }
  if(document.readyState === 'complete') begin();
  else window.addEventListener('load', begin, {once:true});
})();

/* --- scroll reveals -------------------------------------------------------
   Project cards, list rows, figures and timeline entries fade up once, the
   first time they come into view. Items that arrive together are staggered
   by 60 ms. Nothing is hidden unless motion is allowed and the observer is
   available, and a hidden view simply reveals its items when it opens. */
(function(){
  if(!('IntersectionObserver' in window)) return;
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const groups = ['.work-grid > .work-card', '.proof-list > .proof-item',
                  '.figs > .fig', '.timeline > .tl-item', '.skills > .skill-group'];
  const io = new IntersectionObserver(entries=>{
    const arriving = entries.filter(e => e.isIntersecting)
      .sort((a, b) => (a.boundingClientRect.top - b.boundingClientRect.top) || (a.boundingClientRect.left - b.boundingClientRect.left));
    arriving.forEach((e, i)=>{
      e.target.style.transitionDelay = Math.min(i, 6) * 60 + 'ms';
      e.target.classList.add('is-in');
      io.unobserve(e.target);
      // once the fade has run, drop the delay so hover feedback is immediate
      e.target.addEventListener('transitionend', ()=>{ e.target.style.transitionDelay = ''; }, {once:true});
    });
  }, {rootMargin:'0px 0px -6% 0px', threshold:0.08});
  document.querySelectorAll(groups.join(',')).forEach(el=>{
    el.classList.add('reveal');
    io.observe(el);
  });
})();
