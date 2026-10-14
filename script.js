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
    desc: 'A Unity-based 3D FPS adventure built by a 5-member team. Won 1st Place for Best Advanced and Creative 3D FPS Adventure Game at GD-XMUM 2025, plus 1st Prize and the Popular Booth Award at the RenDify DMT Student Showcase 2025.',
    facts: { Engine: 'Unity 3D', Team: '5 members', Events: 'GD-XMUM 2025 · RenDify DMT Showcase 2025' } },
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

// Tools / role line shown under each project (from the project write-ups on the desk version)
const TOOLS = {
  'sea-vagabond': ['Unity', 'Level design', 'Cutscenes', 'Team of 6'],
  'code-eternis': ['Unity', 'FPS', 'Level design', 'Team of 5'],
  'lost-tomato': ['Unity', 'Blender', 'Physics'],
  'runaway-timmy': ['Unity', 'Blender', 'Mobile'],
  'we-were-mummies': ['Unity', 'Online co-op', 'Puzzle design'],
  'mario-arena': ['Unity', 'Boss AI', 'Combat'],
  'pirate-harbor': ['Unity', 'Level design'],
  'abandoned-school': ['Unity', 'Lighting', 'Level design'],
  'dwarf-hut': ['Unity', 'Modular props'],
  'kitchin': ['Figma', 'HCI', 'Usability test'],
  'best-rate': ['Figma', 'Design system'],
  'codu': ['Figma', 'Gamified UX'],
  'asian-cuisine': ['Canva', 'Game UI', 'Pixel art'],
  'nba-infovis': ['Tableau', 'Data viz'],
  'inner-thoughts': ['Autodesk Maya', 'Lip-sync', 'Team of 4'],
  'lily': ['Adobe Animate', '2D animation'],
  'ball-study': ['Autodesk Maya', 'Keyframe'],
  'human-walk': ['Autodesk Maya', 'Body mechanics'],
  'animal-walk': ['Autodesk Maya', 'Creature motion']
};

// Awards, each with its certificate / ceremony photos (img/awards/)
const awards = [
  { date: '2025', title: 'Best Creative Third-Person Action-Adventure Game', desc: 'Sea Vagabond · EGDAD-XMUM 2025',
    photos: ['seavagabond-cert'] },
  { date: '2025', title: '1st Prize + Popular Booth Award', desc: 'Code Eternis · RenDify DMT Student Showcase 2025',
    photos: ['award2-1', 'award2-2', 'award2-3'] },
  { date: '2025', title: '1st Place · Best Advanced & Creative 3D FPS Adventure Game', desc: 'Code Eternis · GD-XMUM 2025',
    photos: ['code-cert'] },
  { date: '2025', title: 'Top CGPA Achiever (DMT)', desc: 'September 2025 semester · School of Computing and Data Science',
    photos: ['award5-1', 'award5-2'] },
  { date: '2024–25', title: "Dean's List ×3", desc: '2024/04 · 2025/04 · 2025/09 semesters · GPA 3.81 · 3.95 · 3.81',
    photos: ['award1-1', 'award1-2', 'award3-1', 'award3-2', 'award4-1', 'award4-2'] }
];

// Organizations, clubs and activities. Add entries like:
// { role: 'Head of Design', org: 'XMUM Game Dev Club', place: 'Sepang, Malaysia', date: 'Sep 2024 – Present', note: 'Optional one-liner' },
const experience = [];

// Software I use, grouped by what I use it for (logos in img/tools/)
const toolGroups = [
  { title: 'Game Development', tools: [['unity', 'Unity 6']] },
  { title: '3D & Animation', tools: [['maya', 'Autodesk Maya'], ['animate', 'Adobe Animate']] },
  { title: 'UI/UX & Visual Design', tools: [['figma', 'Figma'], ['canva', 'Canva'], ['illustrator', 'Adobe Illustrator']] },
  { title: 'Video & Audio', tools: [['capcut', 'CapCut'], ['audition', 'Adobe Audition']] }
];

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const arrowIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9"/></svg>';

/* ---------- Projects: a featured card + grid, with muted video previews on hover ---------- */
const grid = $('#projectGrid'), moreBtn = $('#moreBtn');
const FIRST = 9;
let filter = 'all', expanded = false;
const canHover = matchMedia('(hover: hover) and (pointer: fine)').matches;

function renderProjects() {
  const all = filter === 'all' ? projects : projects.filter(p => p.cat === filter);
  const shown = expanded ? all : all.slice(0, FIRST);
  $('#workCount').textContent = all.length;
  grid.innerHTML = shown.map((p, i) => `
    <button class="pcard${i === 0 ? ' feature' : ''}" data-id="${p.id}" style="--i:${i}" aria-label="Open ${esc(p.title)}">
      <span class="pcard-media">
        <img src="img/${p.img}.webp" alt="" loading="${i < 3 ? 'eager' : 'lazy'}" decoding="async">
        <span class="pcard-chip">${CATEGORY_LABELS[p.cat]}</span>
        ${p.award ? '<span class="pcard-award">★ Award</span>' : ''}
        ${p.video ? '<span class="pcard-play" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></span>' : ''}
      </span>
      <span class="pcard-info">
        <span class="pcard-title">${esc(p.title)}</span>
        <span class="pcard-sub">${esc(p.subtitle)}</span>
        <span class="pcard-tools">${(TOOLS[p.id] || []).map(esc).join(' · ')}</span>
      </span>
      <span class="pcard-arrow" aria-hidden="true">${arrowIcon}</span>
    </button>`).join('');
  moreBtn.hidden = all.length <= FIRST;
  moreBtn.textContent = expanded ? 'Show fewer' : `Show all ${all.length} projects`;
}
grid.addEventListener('click', e => { const c = e.target.closest('.pcard'); if (c) openProject(c.dataset.id); });
moreBtn.addEventListener('click', () => { expanded = !expanded; renderProjects(); if (!expanded) $('#projects').scrollIntoView(); });
function setFilter(f) {
  filter = f; expanded = false;
  $$('.filter').forEach(b => { const on = b.dataset.filter === f; b.classList.toggle('active', on); b.setAttribute('aria-selected', on); });
  renderProjects();
}
$$('.filter').forEach(btn => btn.addEventListener('click', () => setFilter(btn.dataset.filter)));

// Hover: soft 3D tilt toward the cursor, and a muted video preview after a short pause
if (canHover && !reducedMotion) {
  grid.addEventListener('pointermove', e => {
    const c = e.target.closest('.pcard');
    if (!c) return;
    const r = c.getBoundingClientRect();
    c.style.setProperty('--rx', `${((e.clientY - r.top) / r.height - 0.5) * -5}deg`);
    c.style.setProperty('--ry', `${((e.clientX - r.left) / r.width - 0.5) * 6}deg`);
  });
  grid.addEventListener('pointerover', e => {
    const c = e.target.closest('.pcard');
    if (!c || c.contains(e.relatedTarget)) return;
    const p = projects.find(x => x.id === c.dataset.id);
    if (!p?.video) return;
    c._hover = setTimeout(() => {
      const v = document.createElement('video');
      Object.assign(v, { muted: true, loop: true, playsInline: true, preload: 'auto' });
      v.className = 'pcard-video';
      v.src = MEDIA + p.video.split('/').map(encodeURIComponent).join('/');
      v.addEventListener('playing', () => v.classList.add('on'), { once: true });
      v.addEventListener('error', () => v.remove());
      $('.pcard-media', c).append(v);
      v.play().catch(() => {});
    }, 350);
  });
  grid.addEventListener('pointerout', e => {
    const c = e.target.closest('.pcard');
    if (!c || c.contains(e.relatedTarget)) return;
    clearTimeout(c._hover);
    c.style.removeProperty('--rx'); c.style.removeProperty('--ry');
    const v = $('.pcard-video', c);
    if (v) { v.pause(); v.removeAttribute('src'); v.load(); v.remove(); }
  });
}

/* ---------- Project modal ---------- */
const modal = $('#modal');
let lastFocus = null;

function openModal(m) {
  lastFocus = document.activeElement;
  m.classList.add('open'); m.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  $('.modal-close', m).focus({ preventScroll: true });
}
function closeModal(m) {
  if (!m.classList.contains('open')) return false;
  m.classList.remove('open'); m.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  lastFocus?.focus({ preventScroll: true });
  return true;
}

function openProject(id) {
  const p = projects.find(x => x.id === id);
  if (!p) return;
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
  const facts = Object.entries(p.facts || {}).map(([k, v]) => `<div class="fact"><span>${esc(k)}</span><div>${esc(v)}</div></div>`).join('');
  const link = (url, label) => `<a class="ulink" href="${url}" target="_blank" rel="noopener">${esc(label)} ${arrowIcon}</a>`;
  const links = [p.youtube && link(p.youtube, 'YouTube'), p.extra && link(p.extra.url, p.extra.label),
    p.figma && link(p.figma, 'Figma prototype'), p.tableau && link(p.tableau, 'Tableau dashboard')].filter(Boolean).join('');
  $('#modalBody').innerHTML = `
    <p class="modal-kicker">${CATEGORY_LABELS[p.cat]} · ${p.award ? '★ ' : ''}${esc(p.badge)}</p>
    <h2 id="modalTitle">${esc(p.title)}</h2>
    <p class="modal-sub">${esc(p.subtitle)}</p>
    <p class="modal-desc">${esc(p.desc)}</p>
    ${facts ? `<div class="modal-facts">${facts}</div>` : ''}
    ${links ? `<div class="modal-links">${links}</div>` : ''}`;
  openModal(modal);
  history.replaceState(null, '', '#' + p.id);
}
function closeProject() {
  const v = $('video', modal);
  if (v) { v.pause(); v.removeAttribute('src'); v.load(); }
  if (closeModal(modal)) history.replaceState(null, '', location.pathname);
}
modal.addEventListener('click', e => { if (e.target.closest('[data-close]')) closeProject(); });

/* ---------- About: software logos ---------- */
$('#toolGroups').innerHTML = toolGroups.map(g => `
  <div class="tool-group reveal">
    <h4>${esc(g.title)}</h4>
    <ul>${g.tools.map(([file, name]) => `<li><span class="tool-logo"><img src="img/tools/${file}.png" alt="" width="56" height="56" loading="lazy"></span><span>${esc(name)}</span></li>`).join('')}</ul>
  </div>`).join('');

/* ---------- Organizations & activities ---------- */
$('#expList').innerHTML = experience.length
  ? experience.map(x => `
    <li class="row reveal">
      <div class="row-main"><h3>${esc(x.role)}</h3><p>${esc(x.org)}${x.place ? ' · ' + esc(x.place) : ''}</p>${x.note ? `<p class="muted">${esc(x.note)}</p>` : ''}</div>
      <span class="row-date">${esc(x.date)}</span>
    </li>`).join('')
  : `<li class="row empty reveal"><div class="row-main"><h3>Clubs &amp; organizations</h3><p class="muted">Coming soon: student clubs, committees and events I've been part of.</p></div></li>`;

/* ---------- Awards with certificate photos ---------- */
$('#awardCount').textContent = awards.length;
$('#awardList').innerHTML = awards.map((a, i) => `
  <li class="row award reveal">
    <span class="row-date">${esc(a.date)}</span>
    <div class="row-main"><h3>${esc(a.title)}</h3><p>${esc(a.desc)}</p></div>
    <button class="cert-btn" data-award="${i}" aria-label="View certificate photos for ${esc(a.title)}">
      <img src="img/awards/${a.photos[0]}.jpg" alt="" loading="lazy">
      ${a.photos.length > 1 ? `<span>${a.photos.length}</span>` : ''}
    </button>
  </li>`).join('');

const lb = $('#lightbox');
let lbSet = [], lbI = 0, lbTitle = '';
function showLb() {
  $('#lbImg').src = `img/awards/${lbSet[lbI]}.jpg`;
  $('#lbImg').alt = lbTitle;
  $('#lbCap').textContent = lbTitle;
  $('#lbCount').textContent = lbSet.length > 1 ? `${lbI + 1} / ${lbSet.length}` : '';
  $('.lb-nav', lb).hidden = lbSet.length < 2;
}
$('#awardList').addEventListener('click', e => {
  const b = e.target.closest('.cert-btn');
  if (!b) return;
  const a = awards[+b.dataset.award];
  lbSet = a.photos; lbI = 0; lbTitle = a.title;
  showLb(); openModal(lb);
});
$('#lbPrev').addEventListener('click', () => { lbI = (lbI - 1 + lbSet.length) % lbSet.length; showLb(); });
$('#lbNext').addEventListener('click', () => { lbI = (lbI + 1) % lbSet.length; showLb(); });
lb.addEventListener('click', e => { if (e.target.closest('[data-lb-close]')) closeModal(lb); });

/* ---------- Command palette ---------- */
const cmd = $('#cmd'), cmdInput = $('#cmdInput'), cmdList = $('#cmdList');
const jump = id => () => document.getElementById(id).scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
const commands = [
  { label: 'Projects', hint: 'Section', run: jump('projects') },
  { label: 'About me', hint: 'Section', run: jump('about') },
  { label: 'Software I use', hint: 'Section', run: jump('about') },
  { label: 'Organizations & activities', hint: 'Section', run: jump('experience') },
  { label: 'Education', hint: 'Section', run: jump('education') },
  { label: 'Awards & certificates', hint: 'Section', run: jump('awards') },
  { label: 'Contact', hint: 'Section', run: jump('contact') },
  { label: 'Résumé', hint: 'Link', run: () => window.open('resume.pdf', '_blank') },
  { label: 'Toggle dark mode', hint: 'Action', run: () => toggleTheme() },
  { label: 'Copy email address', hint: 'Action', run: () => copyEmail() },
  { label: 'Open interactive desk version', hint: 'Link', run: () => window.open('https://jocelyneat.github.io/portofolio/', '_blank') },
  ...projects.map(p => ({ label: p.title, hint: CATEGORY_LABELS[p.cat], run: () => openProject(p.id) }))
];
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
  closeProject(); closeModal(lb);
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
  else if (e.key === 'Escape') { closeCmd(); closeProject(); closeModal(lb); }
  else if (lb.classList.contains('open') && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) $(e.key === 'ArrowRight' ? '#lbNext' : '#lbPrev').click();
});

/* ---------- Copy email ---------- */
const toast = $('#toast');
function showToast(msg) {
  toast.textContent = msg; toast.classList.add('show');
  clearTimeout(showToast.t); showToast.t = setTimeout(() => toast.classList.remove('show'), 1800);
}
function copyEmail(btn = $('.copy')) {
  const email = btn.dataset.email, hint = $('.copy-hint', btn);
  navigator.clipboard?.writeText(email).then(() => {
    showToast('Email copied');
    const label = hint.dataset.label ||= hint.textContent;
    hint.textContent = 'Copied ✓';
    setTimeout(() => hint.textContent = label, 2000);
  }, () => { location.href = 'mailto:' + email; });
}
$$('.copy').forEach(btn => btn.addEventListener('click', () => copyEmail(btn)));

/* ---------- Theme toggle ---------- */
function toggleTheme() {
  const root = document.documentElement;
  root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
  try { localStorage.setItem('theme', root.dataset.theme); } catch {}
}
$('#themeToggle').addEventListener('click', toggleTheme);

/* ---------- Hero word rotator ---------- */
const words = ['games', '3D worlds', 'UI/UX', 'animations'];
const rot = $('#rotator');
if (!reducedMotion) {
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

/* ---------- Nav: highlight the section in view; reveal content as it scrolls in ---------- */
const navLinks = $$('.nav a[href^="#"]');
const spy = new IntersectionObserver(entries => entries.forEach(en => {
  if (!en.isIntersecting) return;
  const id = en.target.id === 'home' ? 'top' : en.target.id;
  navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + id));
}), { rootMargin: '-45% 0px -50% 0px' });
$$('main section[id]').forEach(s => spy.observe(s));

const revealer = new IntersectionObserver(entries => entries.forEach(en => {
  if (en.isIntersecting) { en.target.classList.add('in'); revealer.unobserve(en.target); }
}), { threshold: 0.12 });
$$('.reveal').forEach(el => revealer.observe(el));

/* ---------- Footer: her local time ---------- */
const clock = $('#clock');
function tickClock() {
  clock.textContent = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'Asia/Kuala_Lumpur' }) + ' in Malaysia';
}
tickClock(); setInterval(tickClock, 30000);

/* ---------- Init ---------- */
$('#year').textContent = new Date().getFullYear();
renderProjects();
// Deep link: share a URL like .../#sea-vagabond to open a project directly
const hashId = location.hash.slice(1);
if (projects.some(p => p.id === hashId)) openProject(hashId);
