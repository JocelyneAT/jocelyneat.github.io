// Shared by index.html and projects.html: project data, helpers, the project popup and the theme switch
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

// Team projects (everything else is individual work)
const TEAM = new Set(['sea-vagabond', 'code-eternis', 'we-were-mummies', 'pirate-harbor', 'nba-infovis', 'inner-thoughts']);
const isTeam = p => TEAM.has(p.id);
const mediaUrl = p => MEDIA + p.video.split('/').map(encodeURIComponent).join('/');

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const arrowIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9"/></svg>';

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
  if (closeModal(modal)) history.replaceState(null, '', location.pathname + location.search);
}
modal.addEventListener('click', e => { if (e.target.closest('[data-close]')) closeProject(); });

/* ---------- Theme toggle ---------- */
function toggleTheme() {
  const root = document.documentElement;
  root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
  try { localStorage.setItem('theme', root.dataset.theme); } catch {}
}
$('#themeToggle')?.addEventListener('click', toggleTheme);

