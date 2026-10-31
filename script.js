(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const ICON_CHECK = "<svg class=\"ic ic-check\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M20 6 9 17l-5-5\"/></svg>";
  const ICON_SEARCH = "<svg class=\"ic ic-search\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><circle cx=\"11\" cy=\"11\" r=\"8\"/> <path d=\"m21 21-4.3-4.3\"/></svg>";
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // scroll reveal
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: 0.15 });
  $$('.reveal').forEach((el) => io.observe(el));

  // nav shadow
  const nav = $('#nav');
  addEventListener('scroll', () => nav.classList.toggle('scrolled', scrollY > 10), { passive: true });

  if (reduce) return;

  // run a loop only while its section is on screen
  const whileVisible = (el, fn) => {
    let on = false, running = false;
    new IntersectionObserver(([e]) => {
      on = e.isIntersecting;
      if (on && !running) { running = true; fn(() => on).finally(() => (running = false)); }
    }).observe(el);
  };

  // ---------- hero: phone drives the TV ----------
  const tiles = $$('#tiles .tile');
  const caption = $('#caption');
  const splash = $('#splash');
  const hud = $('#volHud');
  const volFill = $('#volFill');
  const volNum = $('#volNum');
  const pVol = $('#pVol');
  const pThumb = $('#pThumb');
  const mic = $('#mic');
  const say = $('#say');
  let focus = 0, vol = 12;

  const setFocus = (i) => { focus = i; tiles.forEach((t, n) => t.classList.toggle('focus', n === i)); };
  const press = async (key, text) => {
    const el = $(`[data-key="${key}"]`);
    el.classList.add('press');
    if (text) caption.textContent = text;
    await sleep(220);
    el.classList.remove('press');
  };
  const setVol = (v) => {
    vol = Math.max(0, Math.min(40, v));
    const pct = Math.round((vol / 40) * 100);
    volFill.style.width = pct + '%'; volNum.textContent = vol;
    pVol.style.height = pct + '%'; pThumb.style.bottom = pct + '%';
  };
  const showHud = async () => { hud.classList.add('on'); await sleep(1400); hud.classList.remove('on'); };

  setFocus(0); setVol(vol);
  whileVisible($('.stage'), async (alive) => {
    while (alive()) {
      setFocus(0); caption.textContent = 'Ready';
      await sleep(900);
      await press('right', 'D-pad: move right'); setFocus(1); await sleep(700);
      await press('ok', 'OK: open Netflix');
      splash.classList.add('on'); await sleep(1700);
      await press('back', 'Back'); splash.classList.remove('on'); await sleep(900);
      mic.classList.add('listen'); say.textContent = 'Listening…'; caption.textContent = 'Voice: "volume up"';
      await sleep(1300);
      say.textContent = '“volume up”'; say.classList.add('hot'); mic.classList.remove('listen');
      for (let i = 0; i < 4; i++) { setVol(vol + 4); if (i === 0) showHud(); await sleep(260); }
      await sleep(1500);
      say.textContent = 'Tap the mic and speak'; say.classList.remove('hot');
      await press('home', 'Home'); setVol(12); await sleep(1100);
    }
  });

  // ---------- voice demo ----------
  const wave = $('#wave'), bubbles = $('#bubbles');
  const say2 = [
    ['volume up', 'Volume up'],
    ['open Netflix', 'Opening Netflix'],
    ['search lofi music', 'Searching YouTube: lofi music'],
  ];
  const addBubble = (cls, text) => {
    const d = document.createElement('div');
    d.className = 'b ' + cls;
    if (cls === 'reply') d.innerHTML = ICON_CHECK + text; else d.textContent = text;
    bubbles.appendChild(d);
    while (bubbles.children.length > 4) bubbles.firstChild.remove();
  };
  whileVisible($('#voice'), async (alive) => {
    let i = 0;
    while (alive()) {
      const [me, tv] = say2[i++ % say2.length];
      wave.classList.add('on'); await sleep(1500); wave.classList.remove('on');
      addBubble('me', '“' + me + '”'); await sleep(700);
      addBubble('reply', tv); await sleep(2200);
    }
  });

  // ---------- typing demo ----------
  const typed = $('#typed'), sug = $('#sug');
  const keys = Object.fromEntries($$('.kb-row span').map((s) => [s.textContent, s]));
  const results = {
    l: ['lofi hip hop radio', 'live news'],
    lo: ['lofi hip hop radio', 'long drive songs'],
    lof: ['lofi hip hop radio', 'lofi girl'],
    lofi: ['lofi hip hop radio', 'lofi girl', 'lofi beats to study'],
  };
  whileVisible($('#typing'), async (alive) => {
    while (alive()) {
      typed.textContent = ''; sug.innerHTML = '';
      await sleep(700);
      for (const ch of 'lofi') {
        keys[ch].classList.add('hit'); typed.textContent += ch;
        sug.innerHTML = (results[typed.textContent] || []).map((r) => `<div>${ICON_SEARCH}${r}</div>`).join('');
        await sleep(160); keys[ch].classList.remove('hit'); await sleep(260);
      }
      await sleep(2600);
    }
  });
})();
