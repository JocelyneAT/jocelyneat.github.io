// Projects page: category tabs, search and a team/individual filter. Uses data + popup from shared.js.
const TABS = [['all', 'All'], ['game', 'Games'], ['environment', '3D Env'], ['uiux', 'UI/UX'], ['animation', 'Animation']];
const LONG = { all: 'All projects', game: 'Game Development', environment: '3D Environments', uiux: 'UI/UX Design', animation: 'Animation' };
const params = new URLSearchParams(location.search);
const state = {
  cat: TABS.some(([k]) => k === params.get('cat')) ? params.get('cat') : 'all',
  q: params.get('q') || '',
  collab: ['team', 'solo'].includes(params.get('collab')) ? params.get('collab') : 'all'
};
const grid = $('#ppGrid'), search = $('#ppSearch'), collab = $('#ppCollab');
search.value = state.q;
collab.value = state.collab;

const inCat = (p, c) => c === 'all' || p.cat === c;
const matches = p => {
  if (state.collab === 'team' && !isTeam(p)) return false;
  if (state.collab === 'solo' && isTeam(p)) return false;
  const q = state.q.trim().toLowerCase();
  if (!q) return true;
  return [p.title, p.subtitle, p.badge, CATEGORY_LABELS[p.cat], ...(TOOLS[p.id] || [])].join(' ').toLowerCase().includes(q);
};

function render() {
  // tab counts respect search + collaboration, like a real filter
  $('#ppTabs').innerHTML = TABS.map(([k, label]) => `
    <button class="pp-tab${k === state.cat ? ' active' : ''}" role="tab" aria-selected="${k === state.cat}" data-cat="${k}">
      ${label}<sup>${projects.filter(p => inCat(p, k) && matches(p)).length}</sup></button>`).join('');
  const list = projects.filter(p => inCat(p, state.cat) && matches(p));
  $('#ppSummary').innerHTML = `<b>${list.length}</b> project${list.length === 1 ? '' : 's'} / ${LONG[state.cat]}`;
  $('#ppEmpty').hidden = list.length > 0;
  grid.innerHTML = list.map((p, i) => `
    <article class="pp-card" style="--i:${i}">
      <button class="pp-media" data-id="${p.id}" aria-label="Open ${esc(p.title)}">
        <img src="img/${p.img}.webp" alt="" loading="lazy" decoding="async">
        ${p.video ? '<span class="pp-badge">▶ Video</span>' : ''}
        ${p.award ? '<span class="pp-award">★ Award</span>' : ''}
        <span class="pp-corner" aria-hidden="true">${arrowIcon}</span>
      </button>
      <p class="pp-cat">${esc(LONG[p.cat])}</p>
      <h2 class="pp-name"><button data-id="${p.id}">${esc(p.title)}</button></h2>
      <p class="pp-sub">${esc(p.subtitle)}</p>
      <ul class="pp-tags">
        <li class="${isTeam(p) ? 'team' : 'solo'}">${isTeam(p) ? 'Team project' : 'Individual'}</li>
        ${(TOOLS[p.id] || []).filter(t => !/^Team of/.test(t)).slice(0, 3).map(t => `<li>${esc(t)}</li>`).join('')}
      </ul>
    </article>`).join('');
  // keep the URL shareable
  const u = new URLSearchParams();
  if (state.cat !== 'all') u.set('cat', state.cat);
  if (state.q) u.set('q', state.q);
  if (state.collab !== 'all') u.set('collab', state.collab);
  history.replaceState(null, '', location.pathname + (u.toString() ? '?' + u : '') + location.hash);
}

$('#ppTabs').addEventListener('click', e => { const t = e.target.closest('.pp-tab'); if (t) { state.cat = t.dataset.cat; render(); } });
search.addEventListener('input', () => { state.q = search.value; render(); });
collab.addEventListener('change', () => { state.collab = collab.value; render(); });
$('#ppReset').addEventListener('click', () => { state.q = ''; state.collab = 'all'; state.cat = 'all'; search.value = ''; collab.value = 'all'; render(); });
grid.addEventListener('click', e => { const b = e.target.closest('[data-id]'); if (b) openProject(b.dataset.id); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeProject(); });

// Muted video preview while hovering a card
if (matchMedia('(hover: hover) and (pointer: fine)').matches && !reducedMotion) {
  grid.addEventListener('pointerover', e => {
    const m = e.target.closest('.pp-media');
    if (!m || m.contains(e.relatedTarget)) return;
    const p = projects.find(x => x.id === m.dataset.id);
    if (!p?.video) return;
    m._t = setTimeout(() => {
      const v = document.createElement('video');
      Object.assign(v, { muted: true, loop: true, playsInline: true, src: mediaUrl(p) });
      v.className = 'pp-video';
      v.addEventListener('playing', () => v.classList.add('on'), { once: true });
      v.addEventListener('error', () => v.remove());
      m.append(v);
      v.play().catch(() => {});
    }, 300);
  });
  grid.addEventListener('pointerout', e => {
    const m = e.target.closest('.pp-media');
    if (!m || m.contains(e.relatedTarget)) return;
    clearTimeout(m._t);
    const v = $('.pp-video', m);
    if (v) { v.pause(); v.removeAttribute('src'); v.load(); v.remove(); }
  });
}

$('#year').textContent = new Date().getFullYear();
render();
const hashId = location.hash.slice(1);
if (projects.some(p => p.id === hashId)) openProject(hashId);
