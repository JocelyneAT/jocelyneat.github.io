// Organizations, clubs and activities. Add entries like:
// Newest first. 'events' show as small tags; 'lead' marks events where I was the organizing chairperson.
const experience = [
  { role: 'Director of Community Services', org: 'Rotaract Club of XMUM', logo: 'rotaract', date: 'Jul 2025 – Jul 2026',
    note: "Led community service events aligned with Rotary's 7 Areas of Focus.",
    events: [['Harmony Hour 2.0', 'lead']] },
  { role: 'Head of Help Center', org: 'PPI Malaysia · Data & Information Systems', logo: 'ppi', date: 'Mar 2025 – Mar 2026',
    note: 'Guided Indonesian students on scholarships, visas and university life.' },
  { role: 'Director of Club Service', org: 'Rotaract Club of XMUM', logo: 'rotaract', date: 'Jul 2024 – Jul 2025',
    note: 'Led fellowship activities that connected members.',
    events: [['Find the Lost Star', 'lead'], ['Picnic Bonding', 'lead'], ['Mystique Under the Moon', 'lead'], ['Hydrolympic', 'lead'], ['X-Mas Treat & Trade', 'vice'], ['Splash Hike', 'vice']] }
];

// Software I use, grouped by what I use it for (logos in img/tools/)
const toolGroups = [
  { title: 'Game Development', tools: [['unity', 'Unity 6']] },
  { title: '3D & Animation', tools: [['maya', 'Autodesk Maya'], ['animate', 'Adobe Animate']] },
  { title: 'UI/UX & Visual Design', tools: [['figma', 'Figma'], ['canva', 'Canva'], ['illustrator', 'Adobe Illustrator']] },
  { title: 'Video & Audio', tools: [['capcut', 'CapCut'], ['audition', 'Adobe Audition']] }
];

/* ---------- Projects: one line per category, each opens projects.html already filtered ---------- */
const CATS = [['game', 'Games'], ['environment', '3D Environments'], ['uiux', 'UI/UX Design'], ['animation', 'Animation']];
$('#workCount').textContent = projects.length;
$('#projectList').innerHTML = CATS.map(([c, label], i) => {
  const list = projects.filter(p => p.cat === c);
  const wins = list.filter(p => p.award).length;
  return `
  <li><a class="plist-row" href="projects.html?cat=${c}">
    <span class="plist-no">${String(i + 1).padStart(2, '0')}</span>
    <span class="plist-main">
      <span class="plist-title">${label}<span class="plist-chip"><i></i>${list.length} projects${wins ? ` · ${wins} awards` : ''}</span></span>
      <span class="plist-meta">${list.map(p => esc(p.title)).join(' · ')}</span>
    </span>
    <span class="plist-arrow" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M7 17 17 7M8 7h9v9"/></svg></span>
  </a></li>`;
}).join('');

/* ---------- About: software logos ---------- */
$('#toolGroups').innerHTML = toolGroups.map(g => `
  <div class="tool-group reveal">
    <h4>${esc(g.title)}</h4>
    <ul>${g.tools.map(([file, name]) => `<li><span class="tool-logo"><img src="img/tools/${file}.png" alt="" width="56" height="56" loading="lazy"></span><span>${esc(name)}</span></li>`).join('')}</ul>
  </div>`).join('');

/* ---------- Organizations & activities ---------- */
$('#expList').innerHTML = experience.length
  ? experience.map(x => `
    <li class="row reveal" data-school="xmum">
      ${x.logo ? `<img class="row-logo" src="img/logos/${x.logo}.png" alt="${esc(x.org)} logo" width="44" height="44" loading="lazy">` : ''}
      <div class="row-main"><h3>${esc(x.role)}</h3><p>${esc(x.org)}</p>${x.note ? `<p class="muted">${esc(x.note)}</p>` : ''}</div>
      <span class="row-date">${esc(x.date)}</span>
    </li>`).join('')
  : `<li class="row empty reveal"><div class="row-main"><h3>Clubs &amp; organizations</h3><p class="muted">Coming soon: student clubs, committees and events I've been part of.</p></div></li>`;

/* ---------- Command palette ---------- */
const cmd = $('#cmd'), cmdInput = $('#cmdInput'), cmdList = $('#cmdList');
const jump = id => () => document.getElementById(id).scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
const commands = [
  { label: 'Projects', hint: 'Section', run: jump('projects') },
  { label: 'About me', hint: 'Section', run: jump('about') },
  { label: 'Software I use', hint: 'Section', run: jump('about') },
  { label: 'Browse all projects (search & filter)', hint: 'Page', run: () => { location.href = 'projects.html'; } },
  { label: 'Organizations & activities', hint: 'Section', run: jump('experience') },
  { label: 'Education', hint: 'Section', run: jump('education') },
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

/* ---------- Hero word rotator ---------- */
const words = ['games', '3D worlds', 'UI/UX', 'animations'];
const rot = $('#rotator');
if (rot && !reducedMotion) {
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

/* ---------- Scroll progress: the poodle runs along under the nav ---------- */
const prog = $('.scroll-prog');
let lastY = scrollY, runT = 0;
function updateProgress() {
  const max = document.documentElement.scrollHeight - innerHeight;
  const p = max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0;
  prog.style.setProperty('--p', p.toFixed(4));
  if (scrollY !== lastY) prog.classList.toggle('back', scrollY < lastY);
  lastY = scrollY;
  prog.classList.add('running');
  clearTimeout(runT); runT = setTimeout(() => prog.classList.remove('running'), 180);
}
addEventListener('scroll', updateProgress, { passive: true });
addEventListener('resize', updateProgress);
updateProgress();
prog.classList.remove('running');

/* ---------- Footer: her local time ---------- */
const clock = $('#clock');
function tickClock() {
  clock.textContent = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'Asia/Kuala_Lumpur' }) + ' in Malaysia';
}
tickClock(); setInterval(tickClock, 30000);

/* ---------- Init ---------- */
$('#year').textContent = new Date().getFullYear();
// Deep link: share a URL like .../#sea-vagabond to open a project directly
const hashId = location.hash.slice(1);
if (projects.some(p => p.id === hashId)) openProject(hashId);
