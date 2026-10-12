// Videos are streamed from the original portfolio site, so nothing is duplicated here.
// If that repo is ever renamed, update this one line.
const MEDIA = 'https://jocelyneat.github.io/portofolio/assets/videos_showcase/';

const CATEGORY_LABELS = { game: 'Game', environment: '3D Env', uiux: 'UI/UX', animation: 'Animation' };

const projects = [
  // Games
  { id: 'sea-vagabond', cat: 'game', title: 'Sea Vagabond', subtitle: '3D pirate action-adventure', badge: 'Best Creative Game', award: true,
    img: 'seavagabond', video: 'game_videos/seavagabond_gameplay.mp4', youtube: 'https://youtu.be/BEFC1k0lOBw',
    desc: 'A third-person pirate action-adventure built in Unity by a 6-member team. Won Best Creative Third-Person Action-Adventure Game at EGDAD-XMUM 2025, recognized for worldbuilding, dialogue and visual art.',
    facts: { Engine: 'Unity 3D', Team: '6 members' } },
  { id: 'code-eternis', cat: 'game', title: 'Code Eternis', subtitle: 'Sci-fi FPS arena prototype', badge: '1st Place · Most Popular Booth', award: true,
    img: 'codeeternis',
    desc: 'A Unity-based 3D FPS adventure. Took 1st Place and the Most Popular Booth Award at the RenDify DMT Student Showcase 2025, with the highest number of votes from participants and lecturers.',
    facts: { Engine: 'Unity 3D', Event: 'RenDify DMT Showcase 2025' } },
  { id: 'lost-tomato', cat: 'game', title: 'The Lost Tomato', subtitle: '3D physics adventure', badge: 'Physics Platformer',
    img: 'tomato', video: 'game_videos/tomato_gameplay.mp4', youtube: 'https://youtu.be/utgsa_6fV0M',
    desc: 'A physics-driven 3D platformer where you guide a runaway tomato through playful obstacle courses.' },
  { id: 'runaway-timmy', cat: 'game', title: 'Runaway Timmy', subtitle: 'Cartoon 3D mobile endless runner', badge: 'Endless Runner',
    img: 'timmy', video: 'game_videos/timmy_gameplay.mp4', youtube: 'https://youtu.be/maJktk8v5lA', extra: { label: 'Dev walkthrough', url: 'https://youtu.be/h-d8EciMMEw' },
    desc: 'A cartoon-style 3D endless runner designed for mobile, with swipe controls and escalating difficulty.' },
  { id: 'we-were-mummies', cat: 'game', title: 'We Were Mummies', subtitle: '2-player online co-op puzzle', badge: 'Multiplayer Co-op',
    img: 'mummies', video: 'game_videos/mummy_gameplay.mp4', youtube: 'https://youtu.be/WZfB8VD5NtY',
    desc: 'An online two-player co-op puzzle game where both players must cooperate to escape an ancient tomb.' },
  { id: 'mario-arena', cat: 'game', title: 'Mario Arena: Luma Star Wars', subtitle: 'Galactic arena boss combat & FPS prototype', badge: 'Unity 3D Action',
    img: 'mario', video: 'game_videos/mario_gameplay.mp4', youtube: 'https://youtu.be/Ie3MEz1A0PE',
    desc: 'A galactic arena prototype mixing boss combat with first-person shooting mechanics.' },

  // Environments
  { id: 'pirate-harbor', cat: 'environment', title: 'Pirate Harbor & Island', subtitle: '3D level & environment design', badge: '3D Environment',
    img: 'pirate', video: 'game_videos/pirate_environment.mp4',
    desc: 'A pirate harbor and island environment designed for Sea Vagabond, focused on readable layout and atmosphere.' },
  { id: 'abandoned-school', cat: 'environment', title: 'Abandoned School', subtitle: 'Atmospheric horror interior', badge: 'Level Design',
    img: 'school', video: 'game_videos/environment_school.mp4',
    desc: 'A horror interior environment using lighting and set dressing to build tension.' },
  { id: 'dwarf-hut', cat: 'environment', title: 'Fantasy Dwarf Hut', subtitle: 'Stylized foliage & modular props', badge: 'Stylized 3D',
    img: 'hut', video: 'game_videos/environment_hut.mp4',
    desc: 'A stylized fantasy hut scene built from modular props and hand-placed foliage.' },

  // UI/UX
  { id: 'kitchin', cat: 'uiux', title: 'Kitchin', subtitle: 'Smart fridge & food waste reduction app', badge: 'Usability score 85.4',
    img: 'kitchin', video: 'uiux_videos/kitchin_video.mp4', figma: 'https://www.figma.com/proto/Q5gTXsWb1tPzoU5ZLWw5bB/HCI-Prototype?node-id=0-1&p=f&viewport=-1074%2C1054%2C1&t=OS76Hi7PPhiikFMD-0&scaling=scale-down&content-scaling=fixed&starting-point-node-id=149%3A87',
    desc: 'An HCI project: a companion app for a smart fridge that tracks food and nudges users to reduce waste. Scored 85.4 in usability testing.',
    facts: { Tool: 'Figma' } },
  { id: 'best-rate', cat: 'uiux', title: 'Best Rate', subtitle: 'Real-time currency & remittance comparison', badge: 'FinTech Mobile UI',
    img: 'bestrate', video: 'uiux_videos/bestrate_video.mp4',
    desc: 'A mobile app concept that compares currency exchange and remittance rates in real time.', facts: { Tool: 'Figma' } },
  { id: 'codu', cat: 'uiux', title: 'Codu', subtitle: 'Gamified coding education & 1v1 battles', badge: 'Gamified EdTech',
    img: 'codu', video: 'uiux_videos/codu_video.mp4',
    desc: 'A gamified coding-education app where learners level up and challenge friends to 1v1 coding battles.', facts: { Tool: 'Figma' } },
  { id: 'asian-cuisine', cat: 'uiux', title: 'Asian Cuisine', subtitle: 'Pixel-art restaurant sim UI/UX', badge: 'Game UI',
    img: 'asiancuisine', video: 'uiux_videos/asiancuisine_video.mp4',
    desc: 'UI/UX for a pixel-art restaurant simulation and cooking game.', facts: { Tool: 'Canva' } },
  { id: 'nba-infovis', cat: 'uiux', title: 'The Shift Toward International NBA Players', subtitle: 'Tableau data visualization dashboard', badge: 'Data Viz',
    img: 'infovis', video: 'uiux_videos/infovis_video.mp4', tableau: 'https://public.tableau.com/app/profile/jocelyne.audrey/viz/Group14_17835961965340/Dashboard3',
    desc: 'An interactive dashboard comparing USA and international NBA player performance from 2000 to 2022.', facts: { Tool: 'Tableau' } },

  // Animation
  { id: 'inner-thoughts', cat: 'animation', title: 'Inner Thoughts', subtitle: '3D character animation & lip-sync short', badge: 'Final Project',
    img: 'inner', video: 'animation_videos/Inner Thoughts.mp4',
    desc: 'Bonnie finds an envelope full of money, and his conscience appears as a Devil and an Angel on his shoulders. I animated the middle climax: the dialogue lip-sync, facial acting and contrasting body language of the two characters.',
    facts: { Role: 'Character animator (Devil & Angel scene)', Tool: 'Autodesk Maya', Team: '4 members' } },
  { id: 'lily', cat: 'animation', title: 'Lily and the Veggies', subtitle: '2D animated short', badge: 'Narrative Short',
    img: 'lily', video: 'animation_videos/lily_animation.MP4',
    desc: 'An educational animated story about young Lily and a group of talking garden vegetables, teaching children about healthy eating.',
    facts: { Role: 'Character animator & story artist', Tool: 'Adobe Animate' } },
  { id: 'ball-study', cat: 'animation', title: 'Bowling & Tennis Ball', subtitle: 'Keyframe weight & bounce study', badge: 'Keyframe Physics',
    img: 'ball', video: 'animation_videos/ball_animation.mp4',
    desc: 'A study of squash and stretch, momentum and decay, contrasting a heavy bowling ball with an elastic tennis ball.', facts: { Tool: 'Autodesk Maya' } },
  { id: 'human-walk', cat: 'animation', title: 'Human Walk & Run Cycle', subtitle: 'Biped locomotion', badge: 'Body Mechanics',
    img: 'human', video: 'animation_videos/humanwalk_animation.mp4',
    desc: 'Hip weight shifts, spine counter-rotation and passing poses for a natural walk and run cycle.', facts: { Tool: 'Autodesk Maya' } },
  { id: 'animal-walk', cat: 'animation', title: 'Animal Walk & Run Cycle', subtitle: 'Quadruped locomotion', badge: 'Creature Motion',
    img: 'animal', video: 'animation_videos/animalwalk_animation.mp4',
    desc: 'Quadruped motion: scapula mechanics, pelvic tilt and footfall patterns across walking and galloping gaits.', facts: { Tool: 'Autodesk Maya' } }
];

const awards = [
  { date: '2025', title: 'Best Creative Third-Person Action-Adventure Game', desc: 'Sea Vagabond, EGDAD-XMUM 2025 (6-member team).', tag: 'Game' },
  { date: '2025', title: '1st Place, Most Popular Booth', desc: 'Code Eternis, RenDify DMT Student Showcase 2025. Highest votes from participants and lecturers.', tag: 'Game' },
  { date: '2025', title: '1st Place, Code Eternis', desc: 'Unity 3D FPS adventure, recognized for creativity and technical execution.', tag: 'Game' },
  { date: '2025/09', title: 'Top CGPA Achiever', desc: 'Highest CGPA in Digital Media Technology.', tag: 'Academic' },
  { date: '2025/09', title: "Dean's List", desc: 'GPA 3.81', tag: 'Academic' },
  { date: '2025/04', title: "Dean's List", desc: 'GPA 3.95', tag: 'Academic' },
  { date: '2024/09', title: "Dean's List", desc: 'GPA 3.81', tag: 'Academic' }
];

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* ---------- Projects ---------- */
const grid = $('#projectGrid');

function renderProjects(filter = 'all') {
  const list = filter === 'all' ? projects : projects.filter(p => p.cat === filter);
  grid.innerHTML = list.map((p, i) => `
    <button class="card spot" data-id="${p.id}" style="animation-delay:${i * 40}ms" aria-label="Open ${esc(p.title)}">
      <div class="card-thumb">
        <img src="img/${p.img}.webp" alt="" loading="lazy" decoding="async">
        ${p.video ? '<span class="play" aria-hidden="true"><svg viewBox="0 0 10 12"><path d="M0 0l10 6-10 6z"/></svg></span>' : ''}
      </div>
      <div class="card-info">
        <div class="card-meta"><span>${CATEGORY_LABELS[p.cat]}</span><span class="card-badge${p.award ? ' is-award' : ''}">${esc(p.badge)}</span></div>
        <h3>${esc(p.title)}</h3>
        <p>${esc(p.subtitle)}</p>
      </div>
    </button>`).join('');
}

grid.addEventListener('click', e => {
  const card = e.target.closest('.card');
  if (card) openProject(card.dataset.id);
});

/* Filters with sliding indicator */
const indicator = $('#filterIndicator');
function moveIndicator(btn) {
  indicator.style.width = btn.offsetWidth + 'px';
  indicator.style.transform = `translateX(${btn.offsetLeft}px)`;
}
$$('.filter').forEach(btn => btn.addEventListener('click', () => {
  $$('.filter').forEach(b => { b.classList.toggle('active', b === btn); b.setAttribute('aria-selected', b === btn); });
  moveIndicator(btn);
  renderProjects(btn.dataset.filter);
}));
window.addEventListener('resize', () => moveIndicator($('.filter.active')));

/* Cursor spotlight */
document.addEventListener('pointermove', e => {
  const el = e.target.closest?.('.spot');
  if (!el) return;
  const r = el.getBoundingClientRect();
  el.style.setProperty('--mx', `${e.clientX - r.left}px`);
  el.style.setProperty('--my', `${e.clientY - r.top}px`);
});

/* ---------- Modal ---------- */
const modal = $('#modal');
let lastFocus = null;

function openProject(id) {
  const p = projects.find(x => x.id === id);
  if (!p) return;
  lastFocus = document.activeElement;

  const media = $('#modalMedia');
  if (p.video) {
    media.innerHTML = `<video controls playsinline preload="metadata" poster="img/${p.img}.webp"></video>`;
    const v = $('video', media);
    v.src = MEDIA + p.video.split('/').map(encodeURIComponent).join('/');
    v.addEventListener('error', () => {
      if ($('.media-fallback', media)) return;
      media.insertAdjacentHTML('beforeend', `<div class="media-fallback">Video is being optimized for the web.${p.youtube ? ' Watch it on YouTube below.' : ''}</div>`);
    });
    v.play().catch(() => {});
  } else {
    media.innerHTML = `<img src="img/${p.img}.webp" alt="${esc(p.title)}">`;
  }

  const facts = Object.entries(p.facts || {}).map(([k, v]) => `<div class="fact"><span>${esc(k)}</span><strong>${esc(v)}</strong></div>`).join('');
  const links = [
    p.youtube && `<a class="btn" href="${p.youtube}" target="_blank" rel="noopener">Watch on YouTube ↗</a>`,
    p.extra && `<a class="btn" href="${p.extra.url}" target="_blank" rel="noopener">${esc(p.extra.label)} ↗</a>`,
    p.figma && `<a class="btn" href="${p.figma}" target="_blank" rel="noopener">Open Figma prototype ↗</a>`,
    p.tableau && `<a class="btn" href="${p.tableau}" target="_blank" rel="noopener">Open Tableau dashboard ↗</a>`
  ].filter(Boolean).join('');

  $('#modalBody').innerHTML = `
    <div class="card-meta"><span>${CATEGORY_LABELS[p.cat]}</span><span class="card-badge${p.award ? ' is-award' : ''}">${esc(p.badge)}</span></div>
    <h2 id="modalTitle">${esc(p.title)}</h2>
    <p class="modal-sub">${esc(p.subtitle)}</p>
    <p class="modal-desc">${esc(p.desc)}</p>
    ${facts ? `<div class="modal-facts">${facts}</div>` : ''}
    ${links ? `<div class="modal-links">${links}</div>` : ''}`;

  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  history.replaceState(null, '', '#' + p.id);
  $('.modal-close', modal).focus({ preventScroll: true });
}

function closeProject() {
  if (!modal.classList.contains('open')) return;
  const v = $('video', modal);
  if (v) { v.pause(); v.removeAttribute('src'); v.load(); }
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  history.replaceState(null, '', location.pathname);
  lastFocus?.focus({ preventScroll: true });
}

modal.addEventListener('click', e => { if (e.target.closest('[data-close]')) closeProject(); });

/* ---------- Awards ---------- */
$('#awardList').innerHTML = awards.map(a => `
  <li class="award reveal">
    <span class="award-date">${esc(a.date)}</span>
    <div><h3>${esc(a.title)}</h3><p>${esc(a.desc)}</p></div>
    <span class="award-tag">${esc(a.tag)}</span>
  </li>`).join('');

/* ---------- Command palette ---------- */
const cmd = $('#cmd'), cmdInput = $('#cmdInput'), cmdList = $('#cmdList');
const sections = [
  { label: 'Work', hint: 'Section', run: () => location.hash = '#work' },
  { label: 'Awards & honors', hint: 'Section', run: () => location.hash = '#awards' },
  { label: 'Toolkit', hint: 'Section', run: () => location.hash = '#skills' },
  { label: 'Contact', hint: 'Section', run: () => location.hash = '#contact' },
  { label: 'Copy email address', hint: 'Action', run: () => copyEmail() },
  { label: 'Open interactive desk version', hint: 'Link', run: () => window.open('https://jocelyneat.github.io/portofolio/', '_blank') }
];
const commands = [...sections, ...projects.map(p => ({ label: p.title, hint: CATEGORY_LABELS[p.cat], run: () => openProject(p.id) }))];
let cmdItems = [], sel = 0;

function renderCmd() {
  const q = cmdInput.value.trim().toLowerCase();
  cmdItems = commands.filter(c => (c.label + ' ' + c.hint).toLowerCase().includes(q));
  sel = Math.min(sel, Math.max(cmdItems.length - 1, 0));
  cmdList.innerHTML = cmdItems.length
    ? cmdItems.map((c, i) => `<li role="option" data-i="${i}" class="${i === sel ? 'sel' : ''}" aria-selected="${i === sel}"><span>${esc(c.label)}</span><span>${esc(c.hint)}</span></li>`).join('')
    : '<li class="cmd-empty">No results</li>';
  $('.sel', cmdList)?.scrollIntoView({ block: 'nearest' });
}
function openCmd() {
  closeProject();
  cmd.classList.add('open'); cmd.setAttribute('aria-hidden', 'false');
  cmdInput.value = ''; sel = 0; renderCmd();
  cmdInput.focus();
}
function closeCmd() { cmd.classList.remove('open'); cmd.setAttribute('aria-hidden', 'true'); }
function runCmd(i) { const c = cmdItems[i]; if (!c) return; closeCmd(); c.run(); }

$('#cmdOpen').addEventListener('click', openCmd);
cmd.addEventListener('click', e => { if (e.target.closest('[data-cmd-close]')) closeCmd(); });
cmdInput.addEventListener('input', () => { sel = 0; renderCmd(); });
cmdList.addEventListener('click', e => { const li = e.target.closest('li[data-i]'); if (li) runCmd(+li.dataset.i); });
cmdInput.addEventListener('keydown', e => {
  if (e.key === 'ArrowDown') { e.preventDefault(); sel = Math.min(sel + 1, cmdItems.length - 1); renderCmd(); }
  else if (e.key === 'ArrowUp') { e.preventDefault(); sel = Math.max(sel - 1, 0); renderCmd(); }
  else if (e.key === 'Enter') { e.preventDefault(); runCmd(sel); }
});

document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); cmd.classList.contains('open') ? closeCmd() : openCmd(); }
  else if (e.key === 'Escape') { closeCmd(); closeProject(); }
});

/* ---------- Copy email ---------- */
const toast = $('#toast');
function showToast(msg) {
  toast.textContent = msg; toast.classList.add('show');
  clearTimeout(showToast.t); showToast.t = setTimeout(() => toast.classList.remove('show'), 1800);
}
function copyEmail() {
  const email = $('#emailCopy').dataset.email;
  navigator.clipboard?.writeText(email).then(() => {
    showToast('Email copied');
    $('#emailHint').textContent = 'Copied ✓';
    setTimeout(() => $('#emailHint').textContent = 'Click to copy', 2000);
  }, () => { location.href = 'mailto:' + email; });
}
$('#emailCopy').addEventListener('click', copyEmail);

/* ---------- Hero word rotator ---------- */
const words = ['games', '3D worlds', 'UI/UX', 'animations'];
const rot = $('#rotator');
if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
  let wi = 0, ci = words[0].length, deleting = true;
  setTimeout(function tick() {
    const w = words[wi];
    ci += deleting ? -1 : 1;
    rot.textContent = w.slice(0, ci);
    let delay = deleting ? 45 : 85;
    if (deleting && ci === 0) { deleting = false; wi = (wi + 1) % words.length; ci = 0; delay = 250; }
    else if (!deleting && ci === w.length) { deleting = true; delay = 1900; }
    setTimeout(tick, delay);
  }, 2200);
}

/* ---------- Nav state + reveal ---------- */
const nav = $('.nav');
window.addEventListener('scroll', () => nav.classList.toggle('scrolled', scrollY > 8), { passive: true });

const navLinks = $$('.nav-links a');
const spy = new IntersectionObserver(entries => {
  entries.forEach(en => {
    if (en.isIntersecting) navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + en.target.id));
  });
}, { rootMargin: '-45% 0px -50% 0px' });
$$('section[id]').forEach(s => spy.observe(s));

const io = new IntersectionObserver(entries => {
  entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
}, { threshold: 0.12 });
$$('.reveal').forEach((el, i) => { el.style.transitionDelay = `${Math.min(i, 6) * 60}ms`; io.observe(el); });

/* ---------- Init ---------- */
$('#year').textContent = new Date().getFullYear();
renderProjects();
requestAnimationFrame(() => moveIndicator($('.filter.active')));
// Deep link: share a URL like .../#sea-vagabond to open a project directly
const hashId = location.hash.slice(1);
if (projects.some(p => p.id === hashId)) openProject(hashId);
