// Illustrated scenes between the sections of the page, drawn as inline SVG.
// Each scene is a strip with layered scenery (parallax as you scroll) and a chibi Celyne with her black poodle.
// Their limbs are posed every frame from a gait phase tied to the distance walked, so feet never slide.
// Colors come from CSS variables in world.css, so dark mode turns every scene into night.
(() => {
  const H = 420, G = 352;                            // scene units: strip height and ground line
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Seeded RNG so every visit draws the same world
  function rng(seed) {
    return () => {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  const f = n => Math.round(n * 10) / 10;
  const { sin, cos, abs, max, min, PI } = Math;

  // Smooth closed silhouette through a list of [x, y] points
  function smooth(pts, bottom = H + 40) {
    let d = `M${f(pts[0][0])} ${bottom} L${f(pts[0][0])} ${f(pts[0][1])}`;
    for (let i = 1; i < pts.length - 1; i++) {
      const [x, y] = pts[i], [nx, ny] = pts[i + 1];
      d += ` Q${f(x)} ${f(y)} ${f((x + nx) / 2)} ${f((y + ny) / 2)}`;
    }
    const [lx, ly] = pts[pts.length - 1];
    return d + ` L${f(lx)} ${f(ly)} L${f(lx)} ${bottom} Z`;
  }
  function hills({ seed, from, to, base, step = 110, amp = 30, peaks = [] }) {
    const r = rng(seed), pts = [];
    for (let x = from; x <= to + step; x += step) {
      let y = base - (Math.sin(x / 300 + seed) * 0.5 + 0.5) * amp - r() * amp * 0.3;
      for (const p of peaks) y -= p.h * Math.max(0, 1 - Math.abs(x - p.x) / p.w) ** 1.3;
      pts.push([x, y]);
    }
    return smooth(pts);
  }
  // Fluffy "cloud" of circles: a core plus a ring of bumps (used for the poodle's curly coat)
  function fluff(cx, cy, r, n, cls = 'g-poodle') {
    let s = `<circle class="${cls}" cx="${f(cx)}" cy="${f(cy)}" r="${f(r * 0.82)}"/>`;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      s += `<circle class="${cls}" cx="${f(cx + Math.cos(a) * r * 0.72)}" cy="${f(cy + Math.sin(a) * r * 0.72)}" r="${f(r * 0.36)}"/>`;
    }
    return s;
  }

  /* ---------- Scenery ---------- */
  function cloud(x, y, s) {
    return `<g class="g-cloud-drift" style="animation-duration:${f(70 + s * 40)}s"><path class="g-cloud" transform="translate(${x} ${y}) scale(${s})"
      d="M0 20 a14 14 0 0 1 16 -12 a20 20 0 0 1 36 -4 a14 14 0 0 1 22 16 Z"/></g>`;
  }
  function birds(x, y, n, seed) {
    const r = rng(seed);
    let s = '<g class="g-birds g-day">';
    for (let i = 0; i < n; i++) s += `<path class="g-bird" transform="translate(${f(x + i * 22 + r() * 10)} ${f(y + (r() - 0.5) * 16)}) scale(${f(0.6 + r() * 0.3)})" d="M-9 0 Q-4 -5 0 0 Q4 -5 9 0"/>`;
    return s + '</g>';
  }
  function stars(seed, w, n) {
    const r = rng(seed);
    let s = '<g class="g-night">';
    for (let i = 0; i < n; i++) s += `<circle class="g-star" cx="${f(r() * w)}" cy="${f(40 + r() * 190)}" r="${f(0.6 + r() * 1.1)}" style="animation-delay:${f(-r() * 4)}s"/>`;
    return s + '</g>';
  }
  function roundTree(x, y, h, cls = 'g-tree') {
    const rad = h * 0.34;
    return `<path class="g-trunk" d="M${f(x)} ${f(y)} V${f(y - h + rad)}"/><circle class="${cls}" cx="${f(x)}" cy="${f(y - h + rad)}" r="${f(rad)}"/>`;
  }
  function cypress(x, y, h, cls = 'g-tree2') {
    return `<path class="${cls}" d="M${f(x)} ${f(y - h)} C${f(x + h * 0.2)} ${f(y - h * 0.7)} ${f(x + h * 0.16)} ${f(y - h * 0.1)} ${f(x)} ${f(y)} C${f(x - h * 0.16)} ${f(y - h * 0.1)} ${f(x - h * 0.2)} ${f(y - h * 0.7)} ${f(x)} ${f(y - h)} Z"/>`;
  }
  function roofs(x, y, seed) {                       // a distant village
    const r = rng(seed);
    let s = '';
    for (let i = 0; i < 5; i++) {
      const w = 18 + r() * 14, hx = x + i * 26, h = 12 + r() * 8;
      s += `<rect class="g-village" x="${f(hx)}" y="${f(y - h)}" width="${f(w)}" height="${f(h)}"/><path class="g-village-roof" d="M${f(hx - 2)} ${f(y - h)} l${f(w / 2 + 2)} -9 l${f(w / 2 + 2)} 9 Z"/>`;
    }
    return s;
  }
  function flower(x, y, cls = 'g-bloom') {
    return `<path class="g-stem" d="M${f(x)} ${f(y)} v-10"/><circle class="${cls}" cx="${f(x)}" cy="${f(y - 12)}" r="3"/>`;
  }
  function tuft(x, y) { return `<path class="g-tuft" d="M${f(x)} ${f(y)} q-2 -6 -6 -9 M${f(x)} ${f(y)} q0 -8 1 -11 M${f(x)} ${f(y)} q3 -6 7 -7"/>`; }

  // Collectible sparkle (4-point star)
  const STAR = 'M0 -9 C1.2 -2.4 2.4 -1.2 9 0 C2.4 1.2 1.2 2.4 0 9 C-1.2 2.4 -2.4 1.2 -9 0 C-2.4 -1.2 -1.2 -2.4 0 -9 Z';
  function sparkle(x, y, extra = '') {
    return `<g class="sparkle${extra}" data-x="${f(x)}" transform="translate(${f(x)} ${f(y)})"><g class="sparkle-pop"><g class="sparkle-in"><path class="g-spark" d="${STAR}"/></g></g></g>`;
  }

  /* ---------- 01 Morning: home and garden ---------- */
  function home(x) {
    const B = G - 8;
    let fence = '';
    for (let fx = x - 250; fx <= x - 110; fx += 20) fence += `<rect class="g-fence" x="${fx}" y="${B - 30}" width="6" height="30" rx="2"/>`;
    return fence + `<path class="g-fence-rail" d="M${x - 252} ${B - 20} H${x - 104} M${x - 252} ${B - 10} H${x - 104}"/>` +
      `<rect class="g-wall" x="${x - 74}" y="${B - 96}" width="148" height="96"/>` +
      `<path class="g-roof" d="M${x - 90} ${B - 92} L${x - 40} ${B - 148} H${x + 40} L${x + 90} ${B - 92} Z"/>` +
      `<rect class="g-window" x="${x - 58}" y="${B - 74}" width="54" height="44" rx="3"/><path class="g-mullion" d="M${x - 31} ${B - 74} v44 M${x - 58} ${B - 52} h54"/>` +
      `<rect class="g-door" x="${x + 16}" y="${B - 62}" width="32" height="62" rx="2"/><circle class="g-knob" cx="${x + 42}" cy="${B - 30}" r="2"/>` +
      `<rect class="g-planter" x="${x - 60}" y="${B - 28}" width="58" height="8" rx="2"/>` +
      flower(x - 52, B - 28, 'g-bloom') + flower(x - 40, B - 28, 'g-bloom2') + flower(x - 28, B - 28, 'g-bloom') + flower(x - 14, B - 28, 'g-bloom2') +
      roundTree(x + 120, B, 96) + `<path class="g-mailpost" d="M${x + 70} ${B} V${B - 34}"/><rect class="g-mailbox" x="${x + 58}" y="${B - 50}" width="26" height="18" rx="8"/>`;
  }

  /* ---------- Her university: Xiamen University Malaysia main building ---------- */
  // Symmetric cream block with rows of windows, a tiered red Chinese-style roof with upturned eaves,
  // a glass atrium over a columned entrance, a grand staircase, side wings and palm trees.
  function palm(x, y, h) {
    const tx = x + 3, ty = y - h;
    const leaf = (dx, dy) => `M${tx} ${ty} q${f(dx * 0.5)} ${f(dy * 0.5 - 8)} ${dx} ${dy}`;
    return `<path class="g-palm-trunk" d="M${x} ${y} Q${x + 4} ${f(y - h / 2)} ${tx} ${ty}"/>` +
      `<path class="g-palm-leaf" d="${[leaf(20, 6), leaf(14, 14), leaf(-20, 6), leaf(-14, 14), leaf(2, -12)].join(' ')}"/>`;
  }
  function campus(x) {
    const B = G - 8;
    const wing = (cx, w, h) => {
      let win = '';
      for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) win += `<rect class="g-uni-win" x="${f(cx - w / 2 + 9 + c * (w - 18) / 4)}" y="${B - h + 16 + r * 22}" width="${f((w - 18) / 4 - 5)}" height="12" rx="1"/>`;
      return `<rect class="g-uni-wall" x="${cx - w / 2}" y="${B - h}" width="${w}" height="${h}"/>${win}` +
        `<path class="g-uni-roof" d="M${cx - w / 2 - 10} ${B - h + 2} Q${cx - w / 2 - 2} ${B - h - 2} ${cx - w / 2 + 6} ${B - h - 16} H${cx + w / 2 - 6} Q${cx + w / 2 + 2} ${B - h - 2} ${cx + w / 2 + 10} ${B - h + 2} Z"/>`;
    };
    let win = '';
    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 12; c++) {
        const wx = x - 132 + c * 22.5;
        if (wx > x - 34 && wx < x + 26) continue;           // leave room for the atrium
        win += `<rect class="g-uni-win" x="${f(wx)}" y="${B - 160 + r * 21}" width="13" height="12" rx="1"/>`;
      }
    }
    let cols = '';
    for (const dx of [-30, -15, 0, 15, 30]) cols += `<rect class="g-uni-col" x="${x + dx - 3}" y="${B - 40}" width="6" height="34"/>`;
    return wing(x - 205, 90, 112) + wing(x + 205, 90, 112) +
      `<rect class="g-uni-wall" x="${x - 145}" y="${B - 172}" width="290" height="172"/>` +
      `<rect class="g-uni-band" x="${x - 145}" y="${B - 176}" width="290" height="8"/>` + win +
      `<path class="g-uni-glass" d="M${x - 28} ${B - 44} V${B - 140} Q${x} ${B - 162} ${x + 28} ${B - 140} V${B - 44} Z"/>` +
      `<path class="g-uni-mullion" d="M${x - 9} ${B - 152} V${B - 44} M${x + 9} ${B - 152} V${B - 44} M${x - 28} ${B - 112} H${x + 28} M${x - 28} ${B - 80} H${x + 28}"/>` +
      `<rect class="g-uni-band" x="${x - 40}" y="${B - 46}" width="80" height="7"/>` + cols +
      `<path class="g-uni-roof" d="M${x - 168} ${B - 172} Q${x - 152} ${B - 176} ${x - 140} ${B - 196} H${x + 140} Q${x + 152} ${B - 176} ${x + 168} ${B - 172} Z"/>` +
      `<path class="g-uni-roof2" d="M${x - 118} ${B - 194} Q${x - 104} ${B - 198} ${x - 94} ${B - 218} H${x + 94} Q${x + 104} ${B - 198} ${x + 118} ${B - 194} Z"/>` +
      `<path class="g-uni-ridge" d="M${x - 140} ${B - 196} H${x + 140} M${x - 94} ${B - 218} H${x + 94}"/>` +
      `<path class="g-uni-stairs" d="M${x - 60} ${B + 6} L${x - 40} ${B - 6} H${x + 40} L${x + 60} ${B + 6} Z"/>` +
      `<path class="g-uni-step" d="M${x - 54} ${B + 2} H${x + 54} M${x - 47} ${B - 2} H${x + 47}"/>` +
      palm(x - 120, B, 46) + palm(x - 84, B, 38) + palm(x + 84, B, 38) + palm(x + 120, B, 46) +
      `<rect class="g-uni-sign" x="${x - 44}" y="${B - 60}" width="88" height="11" rx="2"/><text class="g-uni-text" x="${x}" y="${B - 51.8}" text-anchor="middle">XIAMEN UNIVERSITY MALAYSIA</text>`;
  }

  /* ---------- Her high school: SMA Karangturi, Semarang ---------- */
  // Modern white block with a swooping roof that rises to the right, red and blue vertical stripes,
  // big blue glass panes, a dark centre panel with the school emblem, and a lower wing with a railing.
  function karangturi(cx) {
    const B = G - 8;
    const grid = (x, y, w, h, cols, rows) => {
      let s = `<rect class="k-glass" x="${x}" y="${y}" width="${w}" height="${h}" rx="1"/>`;
      for (let c = 1; c < cols; c++) s += `<path class="k-mullion" d="M${f(x + c * w / cols)} ${y} V${y + h}"/>`;
      for (let r = 1; r < rows; r++) s += `<path class="k-mullion" d="M${x} ${f(y + r * h / rows)} H${x + w}"/>`;
      return s;
    };
    return `<g class="karangturi" role="img" aria-label="SMA Karangturi, Semarang">
      <rect class="k-wall2" x="${cx - 152}" y="${B - 104}" width="34" height="104"/>
      ${grid(cx - 148, B - 92, 26, 74, 2, 3)}
      <rect class="k-wall" x="${cx - 122}" y="${B - 150}" width="224" height="150"/>
      <rect class="k-wall2" x="${cx + 102}" y="${B - 98}" width="72" height="98"/>
      <path class="k-rail" d="M${cx + 102} ${B - 112} H${cx + 174} M${cx + 108} ${B - 112} V${B - 98} M${cx + 126} ${B - 112} V${B - 98} M${cx + 144} ${B - 112} V${B - 98} M${cx + 162} ${B - 112} V${B - 98}"/>
      ${grid(cx + 108, B - 88, 60, 34, 4, 2)}${grid(cx + 108, B - 46, 60, 34, 4, 2)}
      <rect class="k-blue" x="${cx + 100}" y="${B - 150}" width="5" height="150"/>
      ${grid(cx - 98, B - 134, 52, 64, 4, 3)}${grid(cx + 44, B - 134, 50, 64, 4, 3)}
      <rect class="k-red" x="${cx - 108}" y="${B - 146}" width="5" height="128"/><rect class="k-red" x="${cx - 40}" y="${B - 146}" width="5" height="128"/>
      <rect class="k-red" x="${cx + 32}" y="${B - 146}" width="5" height="128"/>
      <rect class="k-panel" x="${cx - 30}" y="${B - 140}" width="58" height="78" rx="2"/>
      <path class="k-emblem" d="M${cx - 1} ${B - 116} q-14 -2 -18 -10 q10 2 18 5 q8 -3 18 -5 q-4 8 -18 10 Z M${cx - 7} ${B - 112} h12 l-2 9 h-8 Z"/>
      <text class="k-name" x="${cx - 1}" y="${B - 88}" text-anchor="middle">KARANGTURI</text>
      ${grid(cx - 116, B - 52, 74, 40, 5, 2)}${grid(cx + 40, B - 52, 56, 40, 4, 2)}
      <rect class="k-blue" x="${cx - 122}" y="${B - 54}" width="224" height="4"/>
      <path class="k-canopy" d="M${cx - 40} ${B - 52} H${cx + 40} L${cx + 34} ${B - 44} H${cx - 34} Z"/>
      <rect class="k-door" x="${cx - 14}" y="${B - 40}" width="26" height="40" rx="1"/>
      <path class="k-roof-under" d="M${cx - 160} ${B - 146} L${cx + 106} ${B - 176} L${cx + 106} ${B - 164} L${cx - 156} ${B - 140} Z"/>
      <path class="k-roof" d="M${cx - 166} ${B - 150} L${cx + 112} ${B - 184} L${cx + 112} ${B - 176} L${cx - 162} ${B - 145} Z"/>
      <rect class="k-step" x="${cx - 46}" y="${B - 4}" width="92" height="6" rx="1"/>
    </g>` + bush(cx - 92, B + 2, 0.8, 1) + bush(cx + 70, B + 2, 0.7, 2) + bush(cx + 150, B + 2, 0.8, 0) + palm(cx + 196, B, 40);
  }

  // A school building you can hover: the other one fades and a name label appears
  function school(id, body, x, y, name, sub) {
    const w = Math.max(name.length * 7.4, sub.length * 5.2) + 28;
    return `<g class="school" data-school="${id}" tabindex="0" role="button" aria-label="${name}">${body}
      <g class="school-label" transform="translate(${x} ${y})"><rect x="${f(-w / 2)}" y="-22" width="${f(w)}" height="38" rx="19"/>
        <text class="school-name" y="-5" text-anchor="middle">${name}</text><text class="school-sub" y="9" text-anchor="middle">${sub}</text>
        <path d="M-6 16 L0 23 L6 16 Z"/></g></g>`;
  }

  /* ---------- Home park: signpost to her sections, a bench and flower beds ---------- */
  function park(x) {
    const B = G - 8;
    const board = (y, label) => `<g class="p-sign" data-target="${label.toLowerCase()}" role="link" tabindex="0" aria-label="Go to ${label.toLowerCase()}"><path class="p-board" d="M${x + 556} ${y} h70 l8 9 l-8 9 h-70 Z" />` +
      `<text class="p-board-text" x="${x + 590}" y="${y + 12.5}" text-anchor="middle">${label}</text></g>`;
    const bed = cx => `<ellipse class="p-bed" cx="${cx}" cy="${B - 2}" rx="54" ry="9"/>` +
      `<g class="g-leaf1"><circle cx="${cx - 30}" cy="${B - 12}" r="12"/><circle cx="${cx - 8}" cy="${B - 17}" r="15"/><circle cx="${cx + 16}" cy="${B - 14}" r="13"/><circle cx="${cx + 36}" cy="${B - 9}" r="9"/></g>` +
      [[-30, -20], [-14, -28], [2, -24], [18, -27], [34, -16], [-22, -10], [10, -12]].map(([dx, dy], i) => `<circle class="${i % 2 ? 'g-bloom' : 'g-bloom2'}" cx="${cx + dx}" cy="${B + dy}" r="3.6"/>`).join('');
    return bed(x + 400) + bed(x + 1010) +
      `<rect class="p-post" x="${x + 586}" y="${B - 104}" width="7" height="104" rx="2"/>` +
      board(B - 98, 'EDUCATION') + board(B - 76, 'PROJECTS') + board(B - 54, 'AWARDS') +
      `<g class="p-bench"><rect x="${x + 300}" y="${B - 34}" width="78" height="7" rx="3"/><rect x="${x + 300}" y="${B - 50}" width="78" height="6" rx="3"/>` +
      `<rect x="${x + 306}" y="${B - 27}" width="5" height="27"/><rect x="${x + 367}" y="${B - 27}" width="5" height="27"/></g>`;
  }

  /* ---------- 02 Afternoon: her studio ---------- */
  function studio(x) {
    const B = G - 8;
    return `<rect class="g-wall2" x="${x - 140}" y="${B - 150}" width="290" height="150"/>` +
      `<rect class="g-roofline" x="${x - 150}" y="${B - 160}" width="310" height="12" rx="3"/>` +
      `<rect class="g-sign" x="${x - 40}" y="${B - 182}" width="80" height="20" rx="4"/><text class="g-sign-text" x="${x}" y="${B - 168}" text-anchor="middle">STUDIO</text>` +
      `<rect class="g-glass" x="${x - 124}" y="${B - 128}" width="180" height="96" rx="3"/>` +
      // inside: desk, monitor, lamp, plant, chair
      `<rect class="g-desk" x="${x - 112}" y="${B - 64}" width="150" height="5"/><path class="g-desk-leg" d="M${x - 104} ${B - 59} V${B - 32} M${x + 30} ${B - 59} V${B - 32}"/>` +
      `<g class="monitor hit" data-hit="monitor"><rect class="g-monitor" x="${x - 76}" y="${B - 112}" width="66" height="42" rx="3"/>` +
      `<rect class="g-screen" x="${x - 72}" y="${B - 108}" width="58" height="34" rx="1.5"/>` +
      `<path class="g-screen-ui" d="M${x - 66} ${B - 101} h22 M${x - 66} ${B - 94} h34 M${x - 66} ${B - 87} h16"/>` +
      `<rect class="g-monitor" x="${x - 46}" y="${B - 70}" width="6" height="6"/></g>` +
      `<path class="g-lamp-arm" d="M${x + 10} ${B - 64} L${x + 22} ${B - 92} L${x + 6} ${B - 104}"/><path class="g-lamp-shade" d="M${x - 2} ${B - 110} l14 4 l-6 10 Z"/>` +
      `<rect class="g-pot" x="${x - 104}" y="${B - 76}" width="12" height="12" rx="2"/>` + cypress(x - 98, B - 76, 24, 'g-tree') +
      `<path class="g-mullion2" d="M${x - 34} ${B - 128} v96"/>` +
      `<rect class="g-door2" x="${x + 76}" y="${B - 100}" width="44" height="100" rx="3"/><circle class="g-knob" cx="${x + 112}" cy="${B - 50}" r="2"/>` +
      `<rect class="g-bench" x="${x - 150}" y="${B - 22}" width="40" height="5" rx="2"/>`;
  }

  /* ---------- 03 Golden hour: awards stage ---------- */
  function stage(x) {
    const B = G - 8;
    let bulbs = '', confetti = '';
    const r = rng(77);
    for (let i = 0; i <= 12; i++) {
      const t = i / 12, bx = x - 160 + t * 320, by = B - 178 + Math.sin(t * Math.PI) * 18;
      bulbs += `<circle class="g-bulb" cx="${f(bx)}" cy="${f(by + 4)}" r="3.2" style="animation-delay:${f(-r() * 2)}s"/>`;
    }
    for (let i = 0; i < 34; i++) {
      confetti += `<rect class="g-confetti c${i % 4}" x="${f(x - 150 + r() * 300)}" y="${f(B - 220 - r() * 40)}" width="4" height="7" rx="1"
        style="animation-delay:${f(r() * 0.8)}s;--dx:${f((r() - 0.5) * 40)}px;--rot:${f(r() * 720 - 360)}deg"/>`;
    }
    return `<path class="g-string" d="M${x - 160} ${B - 178} Q${x} ${B - 142} ${x + 160} ${B - 178}"/>` + bulbs +
      `<path class="g-pole2" d="M${x - 160} ${B} V${B - 182} M${x + 160} ${B} V${B - 182}"/>` +
      `<rect class="g-backdrop" x="${x - 130}" y="${B - 150}" width="260" height="120" rx="4"/>` +
      `<text class="g-banner-text" x="${x}" y="${B - 122}" text-anchor="middle">AWARDS</text>` +
      `<path class="g-laurel" d="M${x - 62} ${B - 124} q-10 -6 -10 -16 M${x + 62} ${B - 124} q10 -6 10 -16"/>` +
      `<rect class="g-platform" x="${x - 150}" y="${B - 32}" width="300" height="32" rx="3"/><path class="g-platform-line" d="M${x - 150} ${B - 22} H${x + 150}"/>` +
      `<rect class="g-podium" x="${x - 22}" y="${B - 74}" width="44" height="42" rx="2"/><text class="g-podium-text" x="${x}" y="${B - 46}" text-anchor="middle">1</text>` +
      `<circle class="g-glow" cx="${x}" cy="${B - 96}" r="30"/>` +
      `<g class="trophy"><path class="g-gold" d="M${x - 13} ${B - 114} h26 q0 20 -13 22 q-13 -2 -13 -22 Z"/>` +
      `<path class="g-handle" d="M${x - 13} ${B - 110} q-9 2 -5 9 q2 4 7 3 M${x + 13} ${B - 110} q9 2 5 9 q-2 4 -7 3"/>` +
      `<rect class="g-gold" x="${x - 3}" y="${B - 92}" width="6" height="7"/><rect class="g-gold" x="${x - 10}" y="${B - 85}" width="20" height="6" rx="2"/></g>` +
      `<g class="confetti">${confetti}</g>`;
  }

  /* ---------- 04 Night: her room, drama on TV ---------- */
  function room(x) {
    const B = G - 8;
    return `<path class="g-roof" d="M${x - 190} ${B - 168} L${x} ${B - 222} L${x + 190} ${B - 168} Z"/>` +
      `<rect class="g-room" x="${x - 176}" y="${B - 170}" width="352" height="170"/>` +
      `<rect class="g-room-floor" x="${x - 176}" y="${B - 10}" width="352" height="10"/>` +
      // window with the moon
      `<rect class="g-night-window" x="${x - 150}" y="${B - 150}" width="64" height="58" rx="3"/><circle class="g-moon-small" cx="${x - 106}" cy="${B - 128}" r="9"/>` +
      `<path class="g-mullion3" d="M${x - 118} ${B - 150} v58 M${x - 150} ${B - 121} h64"/>` +
      // drama poster + floor lamp
      `<rect class="g-poster" x="${x - 40}" y="${B - 150}" width="34" height="46" rx="2"/><circle class="g-poster-dot" cx="${x - 23}" cy="${B - 133}" r="7"/><path class="g-poster-line" d="M${x - 34} ${B - 116} h22"/>` +
      `<path class="g-lamp-arm" d="M${x - 160} ${B} V${B - 96}"/><path class="g-lampshade" d="M${x - 174} ${B - 96} h28 l-6 -20 h-16 Z"/><circle class="g-lamp-glow" cx="${x - 160}" cy="${B - 90}" r="30"/>` +
      // sofa
      `<rect class="g-sofa-back" x="${x - 74}" y="${B - 64}" width="128" height="36" rx="12"/>` +
      `<rect class="g-sofa" x="${x - 84}" y="${B - 36}" width="148" height="22" rx="8"/>` +
      `<rect class="g-sofa-arm" x="${x - 92}" y="${B - 48}" width="18" height="36" rx="8"/><rect class="g-sofa-arm" x="${x + 54}" y="${B - 48}" width="18" height="36" rx="8"/>` +
      `<path class="g-sofa-leg" d="M${x - 80} ${B - 14} v8 M${x + 60} ${B - 14} v8"/>` +
      `<rect class="g-cushion" x="${x - 66}" y="${B - 58}" width="22" height="20" rx="6"/>` +
      // TV on a stand, showing the "drama" with her contact details
      `<g class="tv hit" data-hit="tv"><rect class="g-tv-stand" x="${x + 104}" y="${B - 30}" width="66" height="30" rx="3"/>` +
      `<rect class="g-tv" x="${x + 92}" y="${B - 108}" width="90" height="62" rx="4"/><rect class="g-tv-screen" x="${x + 96}" y="${B - 104}" width="82" height="54" rx="2"/>` +
      `<text class="g-tv-title" x="${x + 137}" y="${B - 86}" text-anchor="middle">EP.04 · SAY HI</text>` +
      `<text class="g-tv-sub" x="${x + 137}" y="${B - 72}" text-anchor="middle">click to copy</text>` +
      `<text class="g-tv-sub" x="${x + 137}" y="${B - 62}" text-anchor="middle">my email ✉</text>` +
      `<path class="g-tv-leg" d="M${x + 137} ${B - 46} v16"/></g>` +
      `<ellipse class="g-rug" cx="${x + 10}" cy="${G + 6}" rx="120" ry="9"/>`;
  }

  /* ---------- Characters ---------- */
  // Celyne: one design shared by every view. Long brown hair with blunt bangs, black long-sleeve top,
  // black A-line skirt, cream backpack, black socks and boots. Soft flat colors, no outlines.
  // Side view (walking/sitting) has limbs posed every frame; front view is used when she stands still.
  const LIMB = () => '';
  const HERO = `<g class="hero-flip">
    <ellipse class="g-shadow" cx="0" cy="1" rx="14" ry="2.6"/>
    <g class="hero-body">
      <g class="view-side">
        <path class="g-sleeve far" data-limb="armB" d=""/><circle class="g-skin far" data-limb="handB" r="2.4"/>
        <path class="g-leg far" data-limb="legB" d=""/><path class="g-sock" data-limb="sockB" d=""/><path class="g-boot far" data-limb="bootB" d=""/>
        <path class="g-leg" data-limb="legA" d=""/><path class="g-sock" data-limb="sockA" d=""/><path class="g-boot" data-limb="bootA" d=""/>
        <g class="torso">
          <rect class="g-pack2" x="-15.5" y="-55" width="9" height="15" rx="3.5"/>
          <path class="g-skirt" d="M-8 -42 L8 -42 Q10.5 -34 12 -27.5 Q0 -25 -12 -27.5 Q-10.5 -34 -8 -42 Z"/>
          <path class="g-skirt-pleats" d="M-4.5 -42 L-6 -27.2 M-0.5 -42 L-0.5 -26.5 M3.8 -42 L4.8 -27.2"/>
          <path class="g-jacket" d="M-8.5 -55.5 Q1 -58.5 8 -55 L9 -41 L-9 -41 Q-10 -48 -8.5 -55.5 Z"/>
          <path class="g-top" d="M-1.5 -57.5 C3 -57.5 7.5 -55.5 7 -52.5 C2.5 -52.5 -0.5 -54.5 -1.5 -57.5 Z"/>
          <path class="g-pack-strap2" d="M-6 -56 Q-3 -50 -6.5 -43"/>
          <rect class="g-skin" x="-1.6" y="-58.5" width="5" height="5" rx="1.5"/>
          <path class="g-hair hair-back" d=""/>
          <circle class="g-skin" cx="2.5" cy="-70" r="14.6"/>
          <ellipse class="g-skin" cx="6.5" cy="-66" rx="8" ry="7.5"/>
          <!-- Wavy front & side curls -->
          <path class="g-hair" d="M-14 -64 C-17.5 -88 -9.5 -98 3 -98 C15 -98 20.5 -88 18 -74 Q17 -70.5 14.5 -67.5 Q13 -72.5 10 -69 Q7 -73.5 4.5 -68.5 Q1 -71.5 -1.2 -65.5 Q3.5 -59 2.5 -49 Q4.2 -43 1.2 -41 Q-1 -43 0.2 -48 Q1.5 -56 -0.5 -63.5 Q-6.5 -59 -10.5 -60.5 Q-13 -61.5 -14 -64 Z"/>
          <path class="g-hair-curl" d="M2.5 -57 Q4.2 -51 2.2 -44"/>
          <path class="g-hair-curl" d="M15 -72 Q11.5 -69 7.5 -71.5"/>
          <path class="g-hair-shine" d="M-3.5 -91.5 Q3.5 -94.5 11 -91"/>
          <circle cx="12.5" cy="-90.2" r="0.8" fill="#fff" opacity=".65"/>
          <!-- Cute hairpin -->
          <g class="g-hairpin" transform="translate(6 -84)"><circle cx="0" cy="0" r="2.2" fill="#f8d578"/><circle cx="0" cy="0" r="1.1" fill="#fff"/><line x1="-2.5" y1="1.5" x2="2.5" y2="-1.5" stroke="#df9b28" stroke-width="0.8" stroke-linecap="round"/></g>
          <!-- Ear & earring -->
          <ellipse class="g-skin" cx="0.8" cy="-66.2" rx="2.2" ry="2.7"/>
          <circle cx="0.8" cy="-64.2" r="1" fill="#f8d578"/><circle cx="0.8" cy="-64.2" r="0.4" fill="#fff"/>
          <!-- Expressive eye, lashes & brow -->
          <path class="g-eyebrow" d="M9.2 -71.2 Q12 -73 14.2 -70.8"/>
          <path class="g-eyelash" d="M9.2 -67.8 Q11.8 -70 14.5 -66.8"/>
          <path class="g-eyelash-flick" d="M14.2 -67.2 L15.4 -67.8"/>
          <g class="blink">
            <ellipse class="g-eye" cx="11.8" cy="-65.4" rx="2.0" ry="2.6"/>
            <ellipse cx="11.8" cy="-64.5" rx="1.5" ry="1.4" fill="#7a4634" opacity="0.65"/>
          </g>
          <circle class="g-eye-hi" cx="12.6" cy="-66.6" r="0.9"/>
          <circle class="g-eye-hi2" cx="10.8" cy="-64.6" r="0.45"/>
          <ellipse class="g-blush" cx="10.8" cy="-61.6" rx="3.2" ry="1.7"/>
          <line class="g-blush-h" x1="9.6" y1="-61.8" x2="11.8" y2="-61.2"/>
          <path class="g-smile" d="M13.2 -59.6 Q14.6 -58.4 15.8 -59.8"/>
        </g>
        <path class="g-sleeve" data-limb="armA" d=""/><circle class="g-skin" data-limb="handA" r="2.4"/>
      </g>
      <g class="view-front">
        <!-- Wavy curly hair cascading on both shoulders -->
        <path class="g-hair" d="M-18 -68 C-21 -88 -13 -98 0 -98 C13 -98 21 -88 18 -68 C20.5 -58 24 -47 20 -37 C17 -29 11 -31 13 -40 Q15.5 -48 11.5 -54 L10.5 -55 L-10.5 -55 L-11.5 -54 Q-15.5 -48 -13 -40 C-11 -31 -17 -29 -20 -37 C-24 -47 -20.5 -58 -18 -68 Z"/>
        <path class="g-boot2" d="M-8.6 0 C-9 -4.6 -7 -6.6 -4.4 -6.6 C-2 -6.6 -1 -5 -1.2 -2.2 L-1.2 0 Z M8.6 0 C9 -4.6 7 -6.6 4.4 -6.6 C2 -6.6 1 -5 1.2 -2.2 L1.2 0 Z"/>
        <path class="g-skin" d="M-6 -28 H-1.8 V-12 H-6 Z M1.8 -28 H6 V-12 H1.8 Z"/>
        <path class="g-sock2" d="M-6.2 -13 H-1.6 V-5.5 H-6.2 Z M1.6 -13 H6.2 V-5.5 H1.6 Z"/>
        <path class="g-skirt" d="M-10 -42 L10 -42 Q12.5 -34 14.5 -27.5 Q0 -25 -14.5 -27.5 Q-12.5 -34 -10 -42 Z"/>
        <path class="g-skirt-pleats" d="M-6 -42 L-9 -27 M-2 -42 L-3 -26.2 M2 -42 L3 -26.2 M6 -42 L9 -27"/>
        <path class="g-jacket" d="M-9.5 -55.5 Q0 -58.5 9.5 -55.5 L10.6 -41 L-10.6 -41 Z"/>
        <path class="g-top" d="M-6 -56 Q0 -52.5 6 -56 Q3.5 -51 0 -52 Q-3.5 -51 -6 -56 Z"/>
        <g class="arm-l"><path class="g-sleeve-f" d="M-9.6 -54.6 Q-13.6 -51 -14.4 -39"/><circle class="g-skin" cx="-14.5" cy="-37" r="2.4"/></g>
        <path class="g-pack-strap2" d="M-6.2 -56 L-5.6 -44.5 M6.2 -56 L5.6 -44.5"/>
        <rect class="g-skin" x="-2.4" y="-59" width="4.8" height="5" rx="1.5"/>
        <path class="g-neck" d="M-3.6 -56.4 Q0 -53.4 3.6 -56.4 Z"/>
        <circle class="g-skin" cx="-15" cy="-67.5" r="2.4"/><circle class="g-skin" cx="15" cy="-67.5" r="2.4"/>
        <circle cx="-15" cy="-65.5" r="0.9" fill="#f8d578"/><circle cx="15" cy="-65.5" r="0.9" fill="#f8d578"/>
        <ellipse class="g-skin" cx="0" cy="-69.5" rx="15.4" ry="14.4"/>
        <!-- Soft wavy curtain bangs -->
        <path class="g-hair" d="M-18 -62 C-21 -88 -13 -98 0 -98 C13 -98 21 -88 18 -62 L15 -62 Q14.5 -68 12 -72 Q8 -70 4 -72.5 Q1 -69 -2 -72 Q-6 -70 -10 -72.5 Q-13.5 -68 -14.5 -62 Z"/>
        <path class="g-hair-shine" d="M-8 -89 Q0 -92.5 8 -89"/>
        <g class="g-hairpin" transform="translate(10 -80)"><circle cx="0" cy="0" r="2.2" fill="#f8d578"/><circle cx="0" cy="0" r="1.1" fill="#fff"/><line x1="-2" y1="1.5" x2="2" y2="-1.5" stroke="#df9b28" stroke-width="0.8" stroke-linecap="round"/></g>
        <!-- Eyebrows & eyelashes -->
        <path class="g-eyebrow" d="M-8.5 -71.5 Q-6 -73.5 -3.5 -71.8"/>
        <path class="g-eyebrow" d="M3.5 -71.8 Q6 -73.5 8.5 -71.5"/>
        <path class="g-eyelash" d="M-8.2 -67.2 Q-5.8 -69.2 -3.8 -67"/>
        <path class="g-eyelash" d="M3.8 -67 Q5.8 -69.2 8.2 -67.2"/>
        <g class="blink">
          <ellipse class="g-eye" cx="-6" cy="-65.5" rx="2.1" ry="2.8"/>
          <ellipse class="g-eye" cx="6" cy="-65.5" rx="2.1" ry="2.8"/>
          <ellipse cx="-6" cy="-64.6" rx="1.6" ry="1.5" fill="#7a4634" opacity="0.65"/>
          <ellipse cx="6" cy="-64.6" rx="1.6" ry="1.5" fill="#7a4634" opacity="0.65"/>
        </g>
        <circle class="g-eye-hi" cx="-5.2" cy="-66.7" r=".85"/><circle class="g-eye-hi" cx="6.8" cy="-66.7" r=".85"/>
        <circle class="g-eye-hi2" cx="-6.8" cy="-64.8" r=".42"/><circle class="g-eye-hi2" cx="5.2" cy="-64.8" r=".42"/>
        <ellipse class="g-blush" cx="-9.8" cy="-60.6" rx="3.0" ry="1.7"/><ellipse class="g-blush" cx="9.8" cy="-60.6" rx="3.0" ry="1.7"/>
        <path class="g-smile" d="M-2.2 -60.2 Q0 -58.2 2.2 -60.2"/>
        <g class="cert-hold"><path class="g-sleeve-f" d="M-9.6 -54.6 Q-13 -46 -5.5 -42.5"/><path class="g-sleeve-f" d="M9.6 -54.6 Q13 -46 5.5 -42.5"/>
          <rect class="g-cert" x="-9.5" y="-51" width="19" height="14" rx="1.5"/><path class="g-cert-line" d="M-5.5 -47 h11 M-5.5 -44 h8"/>
          <circle class="g-cert-seal" cx="5.5" cy="-40.5" r="2.1"/><circle class="g-skin" cx="-5.5" cy="-42.5" r="2.4"/><circle class="g-skin" cx="5.5" cy="-42.5" r="2.4"/></g>
        <g class="wave-arm"><path class="g-sleeve-f" d="M9.6 -54.6 Q13.6 -51 14.4 -39"/><circle class="g-skin" cx="14.5" cy="-37" r="2.4"/></g>
      </g>
    </g>
  </g>
  <g class="bubble" transform="translate(0 -116)"><rect class="g-bubble" x="-40" y="-14" width="80" height="24" rx="12"/><path class="g-bubble" d="M-5 9 l5 6 l5 -6 Z"/><text class="g-bubble-text" x="0" y="3" text-anchor="middle"></text></g>`;

  // Chibi black poodle in the same outline style. The shape is drawn twice: a slightly thicker dark copy
  // underneath gives one clean outer outline around all the fluffy bumps.
  const DOG_SHAPE = `
      <path class="g-dleg" data-limb="dlegB1" d=""/><path class="g-dleg" data-limb="dlegB2" d=""/>
      <circle class="g-poodle" data-limb="dpawB1" r="3.2"/><circle class="g-poodle" data-limb="dpawB2" r="3.2"/>
      <g class="dog-tail"><path class="g-dstem" d="M-11 -21 Q-15 -26 -14 -31"/>${fluff(-14, -34, 4.8, 6)}</g>
      ${fluff(-6, -19, 7.5, 7)}${fluff(3, -20, 8, 7)}
      <path class="g-dleg" data-limb="dlegA1" d=""/><path class="g-dleg" data-limb="dlegA2" d=""/>
      <circle class="g-poodle" data-limb="dpawA1" r="3.4"/><circle class="g-poodle" data-limb="dpawA2" r="3.4"/>
      <g class="dog-head">${fluff(13, -31, 10.5, 9)}<ellipse class="g-poodle" cx="22.5" cy="-27.5" rx="5.2" ry="4"/>${fluff(7.5, -25.5, 5.2, 6)}</g>`;
  const DOG = `<g class="dog-flip">
    <ellipse class="g-shadow" cx="3" cy="1" rx="14" ry="2.4"/>
    <g class="dog-body">
      <g class="dog-sil">${DOG_SHAPE}</g>
      <g class="dog-fill">${DOG_SHAPE}</g>
      <g class="dog-face">
        <path class="g-bandana ol" d="M4 -19.5 L17 -19 L11 -11 Z"/>
        <circle class="g-poodle-nose" cx="27" cy="-28.5" r="1.7"/>
        <g class="blink"><circle class="g-eye" cx="17" cy="-32" r="1.9"/></g><circle class="g-eye-hi" cx="17.6" cy="-32.7" r=".6"/>
        <ellipse class="g-dog-blush" cx="18" cy="-26.5" rx="2.2" ry="1.4"/>
        <path class="g-curl" d="M10 -36 a1.8 1.8 0 1 1 2.8 1.2 M-1 -23 a1.8 1.8 0 1 1 2.8 1.2"/>
      </g>
    </g>
  </g>
  <g class="bubble" transform="translate(10 -56)"><rect class="g-bubble" x="-30" y="-14" width="60" height="24" rx="12"/><path class="g-bubble" d="M-5 9 l5 6 l5 -6 Z"/><text class="g-bubble-text" x="0" y="3" text-anchor="middle"></text></g>`;

  /* ---------- Illustrated scenery: cumulus clouds, leafy trees, lamps, foreground plants ---------- */
  function bigCloud(x, y, s) {
    const puffs = [[-30, 8, 18], [0, 0, 26], [32, -14, 32], [68, -6, 27], [98, 6, 20]];
    const circles = puffs.map(([dx, dy, r]) => `<circle cx="${f(x + dx * s)}" cy="${f(y + dy * s)}" r="${f(r * s)}"/>`).join('');
    return `<g class="g-cloud-drift" style="animation-duration:${f(80 + s * 30)}s"><g class="g-cumulus">${circles}` +
      `<rect x="${f(x - 46 * s)}" y="${f(y + 2 * s)}" width="${f(164 * s)}" height="${f(24 * s)}" rx="${f(12 * s)}"/></g>` +
      `<ellipse class="g-cumulus-shade" cx="${f(x + 36 * s)}" cy="${f(y + 22 * s)}" rx="${f(76 * s)}" ry="${f(5 * s)}"/></g>`;
  }
  // Teardrop canopy with a darker Y of branches inside, like a picture-book tree
  function lushTree(x, y, h, tone = 0) {
    const w = h * 0.4, ty = y - h, by = y - h * 0.22;
    return `<path class="g-trunk2" d="M${f(x)} ${f(y)} V${f(by - h * 0.05)}"/>` +
      `<path class="g-leaf${tone}" d="M${f(x)} ${f(ty)} C${f(x + w)} ${f(ty + h * 0.1)} ${f(x + w * 1.08)} ${f(by - h * 0.06)} ${f(x)} ${f(by)} C${f(x - w * 1.08)} ${f(by - h * 0.06)} ${f(x - w)} ${f(ty + h * 0.1)} ${f(x)} ${f(ty)} Z"/>` +
      `<path class="g-leaf-shade" d="M${f(x)} ${f(ty)} C${f(x + w)} ${f(ty + h * 0.1)} ${f(x + w * 1.08)} ${f(by - h * 0.06)} ${f(x)} ${f(by)} Z"/>` +
      `<path class="g-branch" d="M${f(x)} ${f(by)} V${f(ty + h * 0.3)} M${f(x)} ${f(by - h * 0.12)} l${f(-w * 0.45)} ${f(-h * 0.2)} M${f(x)} ${f(by - h * 0.28)} l${f(w * 0.4)} ${f(-h * 0.18)}"/>`;
  }
  function bush(x, y, s = 1, tone = 1) {
    return `<g class="g-leaf${tone}"><circle cx="${f(x - 10 * s)}" cy="${f(y - 7 * s)}" r="${f(9 * s)}"/><circle cx="${f(x + 2 * s)}" cy="${f(y - 12 * s)}" r="${f(12 * s)}"/><circle cx="${f(x + 14 * s)}" cy="${f(y - 7 * s)}" r="${f(9 * s)}"/>` +
      `<rect x="${f(x - 19 * s)}" y="${f(y - 8 * s)}" width="${f(42 * s)}" height="${f(8 * s)}"/></g>`;
  }
  function lampPost(x, B) {
    return `<path class="g-lamp-post2" d="M${x} ${B} V${B - 64} M${x - 5} ${B - 64} H${x + 5}"/><rect class="g-lamp-head" x="${x - 4}" y="${B - 76}" width="8" height="11" rx="2"/>` +
      `<circle class="g-lamp-glow2" cx="${x}" cy="${B - 70}" r="16"/>`;
  }
  function daisy(x, y) { return `<circle class="g-daisy" cx="${f(x)}" cy="${f(y)}" r="2.2"/>`; }
  // Big leafy plant for the foreground corners
  function leafClump(x, y, s, flip = 1) {
    const leaves = [[-62, 120, 0], [-38, 150, 1], [-14, 130, 2], [8, 165, 0], [30, 120, 1], [52, 140, 2], [-80, 90, 1]];
    return `<g transform="translate(${f(x)} ${f(y)}) scale(${f(s * flip)} ${f(s)})">` + leaves.map(([a, len, tone]) => {
      const w = len * 0.24;
      return `<g transform="rotate(${a})"><path class="g-fg${tone}" d="M0 0 Q${f(w)} ${f(-len * 0.5)} 0 ${-len} Q${f(-w)} ${f(-len * 0.5)} 0 0 Z"/>` +
        `<path class="g-fg-rib" d="M0 0 Q${f(w * 0.12)} ${f(-len * 0.5)} 0 ${f(-len * 0.92)}"/></g>`;
    }).join('') + '</g>';
  }

  function hallSVG() {
    const laurel = (cx, cy, r, side) => {
      let s = '';
      for (let i = 0; i < 7; i++) {
        const a = (side < 0 ? 200 : -20) + side * i * 24, rad = a * PI / 180;
        const x = cx + Math.cos(rad) * r, y = cy + Math.sin(rad) * r;
        s += `<ellipse class="h-gold" cx="${f(x)}" cy="${f(y)}" rx="3.2" ry="7" transform="rotate(${f(a + 90 * side)} ${f(x)} ${f(y)})"/>`;
      }
      return s;
    };
    const banner = x => `<path class="h-rod" d="M${x - 44} 292 H${x + 44}"/><circle class="h-rod-knob" cx="${x - 46}" cy="292" r="4"/><circle class="h-rod-knob" cx="${x + 46}" cy="292" r="4"/>` +
      `<path class="h-banner" d="M${x - 34} 294 H${x + 34} V438 L${x} 466 L${x - 34} 438 Z"/><path class="h-banner-edge" d="M${x - 28} 300 V434 L${x} 458 L${x + 28} 434 V300"/>` +
      laurel(x - 2, 366, 22, -1) + laurel(x + 2, 366, 22, 1) + `<path class="h-gold" d="M${x} 430 l5 7 l-5 7 l-5 -7 Z"/>`;
    const win = x => `<path class="h-window" d="M${x} 600 V200 Q${x + 80} 70 ${x + 160} 200 V600 Z"/>` +
      `<path class="h-frame" d="M${x} 600 V200 Q${x + 80} 70 ${x + 160} 200 V600 M${x + 80} 112 V600 M${x} 330 H${x + 160} M${x} 460 H${x + 160}"/>`;
    const vase = x => `<rect class="h-pedestal" x="${x - 22}" y="552" width="44" height="58" rx="3"/><rect class="h-pedestal-top" x="${x - 26}" y="546" width="52" height="8" rx="2"/>` +
      `<path class="h-vase" d="M${x - 14} 546 Q${x - 18} 526 ${x - 8} 518 H${x + 8} Q${x + 18} 526 ${x + 14} 546 Z"/>` +
      `<path class="h-leaf" d="M${x} 518 Q${x - 30} 500 ${x - 36} 470 Q${x - 10} 486 ${x} 518 M${x} 518 Q${x + 30} 500 ${x + 36} 470 Q${x + 10} 486 ${x} 518 M${x} 518 Q${x - 6} 480 ${x} 452 Q${x + 6} 480 ${x} 518"/>` +
      [[-20, 486], [0, 470], [18, 488], [-8, 500], [10, 504], [-26, 504], [26, 506]].map(([dx, y], i) =>
        `<circle class="${i % 2 ? 'h-bloom2' : 'h-bloom'}" cx="${x + dx}" cy="${y}" r="${i % 3 ? 6 : 7.5}"/><circle class="h-bloom-c" cx="${x + dx}" cy="${y}" r="2"/>`).join('');
    const plant = x => `<path class="h-pot" d="M${x - 24} 600 L${x - 18} 640 H${x + 18} L${x + 24} 600 Z"/>` +
      [-60, -35, -12, 12, 35, 60].map((a, i) => `<path class="${i % 2 ? 'h-leaf' : 'h-leaf2'}" transform="rotate(${a} ${x} 600)" d="M${x} 600 Q${x + 16} 560 ${x} ${520 - (i % 3) * 10} Q${x - 16} 560 ${x} 600 Z"/>`).join('');
    const seat = (x, y, s) => `<g transform="translate(${f(x)} ${f(y)}) scale(${s})"><rect class="h-seat-back" x="-34" y="-58" width="68" height="52" rx="12"/>` +
      `<rect class="h-seat" x="-36" y="-12" width="72" height="22" rx="8"/><rect class="h-seat-shade" x="-34" y="-58" width="68" height="10" rx="6"/></g>`;
    let seats = '';
    [[790, 1, [-195, -110, -25, 60, 145, 230, 315]], [860, 1.15, [-284, -186, -88, 10, 108, 206, 304, 402]], [940, 1.32, [-366, -254, -142, -30, 82, 194, 306, 418]]].forEach(([y, s, xs]) => {
      for (const x of xs) seats += seat(x, y, s) + seat(1440 - x, y, s);
    });
    let petals = '';
    const r = rng(91);
    for (let i = 0; i < 18; i++) petals += `<ellipse class="h-petal" cx="${f(r() * 1440)}" cy="-20" rx="5" ry="3" style="animation-delay:${f(-r() * 9)}s;animation-duration:${f(7 + r() * 5)}s;--dx:${f((r() - 0.5) * 160)}px"/>`;

    const svgHall = `
      <g class="hall-g"><rect class="h-wall" x="-1200" y="-900" width="3840" height="1510"/>
      <rect class="h-floor" x="-1200" y="600" width="3840" height="700"/>
      <path class="h-arch" d="M250 150 Q720 -20 1190 150"/>
      ${win(-330)}${win(-150)}${win(36)}${win(1244)}${win(1430)}${win(1610)}
      <rect class="h-pillar" x="-30" y="90" width="44" height="520"/><rect class="h-pillar" x="1426" y="90" width="44" height="520"/>
      <path class="h-beam" d="M196 220 L560 900 H400 L60 330 Z"/><path class="h-beam" d="M1244 220 L880 900 H1040 L1380 330 Z"/>
      <rect class="h-pillar" x="222" y="90" width="44" height="520"/><rect class="h-pillar-cap" x="212" y="84" width="64" height="16" rx="3"/>
      <rect class="h-pillar" x="1174" y="90" width="44" height="520"/><rect class="h-pillar-cap" x="1164" y="84" width="64" height="16" rx="3"/>
      ${banner(150)}${banner(1290)}
      <path class="h-alcove" d="M548 612 V470 Q720 312 892 470 V612 Z"/>
      <path class="h-niche" d="M606 612 V482 Q720 372 834 482 V612 Z"/>
      <circle class="h-trophy-glow" cx="720" cy="430" r="70"/>
      <g class="h-trophy"><path class="h-gold" d="M694 388 h52 q0 40 -26 44 q-26 -4 -26 -44 Z"/>
        <path class="h-handle" d="M694 396 q-18 3 -11 19 q4 7 14 6 M746 396 q18 3 11 19 q-4 7 -14 6"/>
        <rect class="h-gold" x="714" y="432" width="12" height="12"/><rect class="h-gold" x="700" y="444" width="40" height="10" rx="3"/>
        <path class="h-shine" d="M704 396 q0 18 9 28"/></g>
      ${laurel(720, 436, 62, -1)}${laurel(720, 436, 62, 1)}
      <path class="h-sparkle" d="M612 520 l5 9 l-5 9 l-5 -9 Z M828 520 l5 9 l-5 9 l-5 -9 Z"/>
      ${vase(520)}${vase(920)}${plant(150)}${plant(1290)}
      <path class="h-step" d="M420 610 H1020 V660 H420 Z"/>
      <path class="h-step2" d="M380 660 H1060 L1072 692 H368 Z"/>
      <path class="h-step3" d="M340 692 H1100 L1114 728 H326 Z"/>
      <path class="h-step-edge" d="M420 610 H1020 M380 660 H1060 M340 692 H1100"/>
      <path class="h-carpet" d="M656 610 H784 L1010 900 H430 Z"/>
      <path class="h-carpet-edge" d="M666 610 L452 900 M774 610 L988 900"/>
      <g class="h-stars">${petals}</g>
      ${seats}
    </g>`;
    return svgHall;
  }

  // Tiny paintings of her own projects for the room wall
  const ART_SHIP = `<path class="g-art-sea" d="M-26 8 h52 v12 h-52 Z"/><path class="g-art-ink" d="M-14 6 H14 L9 13 H-9 Z M-2 6 V-14 M-2 -13 L9 3 H-2 Z"/><circle class="g-art-sun" cx="15" cy="-10" r="4"/>`;
  const ART_PHONE = `<rect class="g-art-ink" x="-9" y="-17" width="18" height="34" rx="3"/><rect class="g-art-screen" x="-7" y="-13" width="14" height="24" rx="1"/><rect class="g-art-sun" x="-5" y="-10" width="10" height="5" rx="1"/><rect class="g-art-sea" x="-5" y="-3" width="10" height="3" rx="1"/><rect class="g-art-sea" x="-5" y="2" width="7" height="3" rx="1"/>`;
  const ART_TOMATO = `<circle class="g-art-tomato" cx="0" cy="3" r="12"/><path class="g-art-leaf" d="M0 -9 l-6 -3 l5 -1 l1 -5 l1 5 l5 1 Z"/><circle class="g-art-ink" cx="-4" cy="2" r="1.4"/><circle class="g-art-ink" cx="4" cy="2" r="1.4"/>`;


  /* ---------- Her desk ---------- */
  function roomSVG() {
    const B = G;
    let planks = '', books = '';
    for (let x = -1400; x < 1400; x += 64) planks += `M${x} ${B} v420 `;
    const r = rng(55), bookColors = ['#c96a55', '#8ea47a', '#e3bb72', '#7d8fa6', '#d9a58e', '#5d7a6a'];
    for (const shelfY of [B - 150, B - 104, B - 58]) {
      for (let x = 214; x < 286;) {
        const w = 6 + r() * 6, h = 26 + r() * 12;
        books += `<rect x="${f(x)}" y="${f(shelfY - h)}" width="${f(w)}" height="${f(h)}" rx="1" fill="${bookColors[Math.floor(r() * bookColors.length)]}"/>`;
        x += w + 1.5;
      }
    }
    const frame = (x, y, art) => `<rect class="r-frame" x="${x - 22}" y="${y - 17}" width="44" height="34" rx="2"/><rect class="r-canvas" x="${x - 19}" y="${y - 14}" width="38" height="28"/>` +
      `<g transform="translate(${x} ${y}) scale(.68)">${art}</g>`;
    const svgRoom = `<g class="room-g">
      <rect class="r-wall" x="-1400" y="${B - 1400}" width="2800" height="1400"/>
      <rect class="r-wall2" x="-1400" y="${B - 70}" width="2800" height="70"/>
      <rect class="r-floor" x="-1400" y="${B}" width="2800" height="440"/>
      <path class="r-plank" d="${planks}"/>
      <rect class="r-skirting" x="-1400" y="${B - 6}" width="2800" height="6"/>
      <g class="r-window-g"><rect class="r-window-frame" x="-292" y="${B - 262}" width="168" height="138" rx="6"/>
        <rect class="r-sky" x="-284" y="${B - 254}" width="152" height="122" rx="3"/>
        <path class="r-hill" d="M-284 ${B - 160} Q-230 ${B - 196} -190 ${B - 172} T-132 ${B - 180} V${B - 132} H-284 Z"/>
        <circle class="r-tree" cx="-168" cy="${B - 178}" r="16"/><circle class="r-sun" cx="-250" cy="${B - 222}" r="10"/>
        <path class="r-mullion" d="M-208 ${B - 254} V${B - 132} M-284 ${B - 193} H-132"/>
        <rect class="r-sill" x="-300" y="${B - 126}" width="184" height="8" rx="3"/></g>
      <rect class="r-shelf-board" x="12" y="${B - 168}" width="150" height="6" rx="2"/>
      ${frame(40, B - 196, ART_SHIP)}${frame(90, B - 196, ART_PHONE)}${frame(140, B - 196, ART_TOMATO)}
      <rect class="r-case" x="206" y="${B - 196}" width="88" height="196" rx="3"/>
      <rect class="r-case-in" x="212" y="${B - 190}" width="76" height="184" rx="2"/>
      ${books}
      <path class="r-case-shelf" d="M212 ${B - 150} H288 M212 ${B - 104} H288 M212 ${B - 58} H288"/>
      <ellipse class="r-rug" cx="20" cy="${B + 22}" rx="150" ry="14"/>
      <rect class="r-desk-leg" x="20" y="${B - 58}" width="6" height="58"/><rect class="r-desk-leg" x="150" y="${B - 58}" width="6" height="58"/>
      <rect class="r-drawer" x="112" y="${B - 56}" width="40" height="34" rx="2"/><path class="r-drawer-line" d="M112 ${B - 39} H152 M126 ${B - 48} h12 M126 ${B - 31} h12"/>
      <rect class="r-desk" x="12" y="${B - 64}" width="152" height="7" rx="2"/>
      <ellipse class="r-glow" cx="34" cy="${B - 82}" rx="26" ry="20"/>
      <path class="r-lid" d="M50 ${B - 65} L76 ${B - 65} L84 ${B - 104} L58 ${B - 104} Z"/><circle class="r-logo" cx="67" cy="${B - 85}" r="2.6"/>
      <rect class="r-base" x="34" y="${B - 67}" width="44" height="3.5" rx="1.5"/>
      <path class="r-mug" d="M122 ${B - 64} v-13 h12 v13 Z M134 ${B - 74} q6 1 5 5 q-1 3 -5 3"/><path class="r-steam" d="M126 ${B - 82} q-3 -5 0 -9 M131 ${B - 82} q3 -5 0 -9"/>
      <path class="r-lamp-arm" d="M156 ${B - 64} L150 ${B - 102} L124 ${B - 116}"/><path class="r-lamp-shade" d="M118 ${B - 124} l16 6 l-8 10 Z"/>
      <circle class="r-lamp-glow" cx="124" cy="${B - 100}" r="24"/>
      <rect class="r-pot" x="-70" y="${B - 30}" width="22" height="30" rx="3"/>
      <path class="r-leaf" d="M-59 ${B - 30} Q-82 ${B - 60} -72 ${B - 84} Q-62 ${B - 56} -59 ${B - 30} M-59 ${B - 30} Q-38 ${B - 62} -46 ${B - 88} Q-58 ${B - 58} -59 ${B - 30} M-59 ${B - 30} Q-60 ${B - 70} -58 ${B - 96} Q-54 ${B - 66} -59 ${B - 30}"/>
      <rect class="r-chair-back" x="-21" y="${B - 94}" width="8" height="50" rx="4"/>
      <rect class="r-chair-seat" x="-16" y="${B - 47}" width="30" height="7" rx="3.5"/>
      <rect class="r-chair-pole" x="-2.5" y="${B - 40}" width="5" height="28"/>
      <path class="r-chair-base" d="M-16 ${B - 9} H16"/><circle class="r-wheel" cx="-15" cy="${B - 3}" r="3"/><circle class="r-wheel" cx="15" cy="${B - 3}" r="3"/>
    </g>`;
    return svgRoom;
  }

  /* ---------- Posing (shared by every Celyne + poodle pair) ---------- */
  const lerp = (a, b, k) => a + (b - a) * k;
  const clamp = (v, a = 0, b = 1) => min(b, max(a, v));
  // Two-bone limb from (x, y): angles in radians from straight down, positive swings forward (+x)
  function bone(x, y, a1, l1, a2, l2) {
    const kx = x + sin(a1) * l1, ky = y + cos(a1) * l1;
    return [kx, ky, kx + sin(a1 + a2) * l2, ky + cos(a1 + a2) * l2];
  }
  const P = (...pts) => 'M' + pts.map(n => f(n)).join(' ').replace(/(\S+ \S+) /g, '$1 L');

  // phase: gait phase; s: 0 idle → 1 full walk; sit: 0 standing → 1 seated; t: time (s) for breathing
  function poseHero(a, phase, s, sit, t, typing = 0) {
    const breathe = (1 - s) * sin(t * 2.2) * 0.5;
    const hipY = lerp(-29 - s * 1.8 * abs(sin(phase)), -37, sit);
    const lean = s * 4 * (1 - sit);
    for (const [k, ph] of [['A', phase], ['B', phase + PI]]) {
      const thigh = lerp(s * 0.6 * sin(ph), PI / 2 - 0.1, sit);
      const knee = lerp(-(0.05 + s * 1.1 * max(0, cos(ph)) ** 1.4), -PI / 2 + 0.15, sit);
      const [kx, ky, ax, ay] = bone(0, hipY, thigh, 12, knee, 13);
      a.set('leg' + k, 'd', P(0, hipY, kx, ky, ax, ay - 2));
      a.set('sock' + k, 'd', P(kx + (ax - kx) * 0.35, ky + (ay - ky) * 0.35, ax, ay - 2));
      const tip = thigh + knee + PI / 2 + 0.05;      // boot points forward
      a.set('boot' + k, 'd', P(ax - 2.2, ay - 2.4, ax + sin(tip) * 5.5, ay - 2.4 + cos(tip) * 5.5));
    }
    a.torso.setAttribute('transform', `translate(0 ${f(hipY + 29 + breathe)}) rotate(${f(lean)} 0 -29)`);
    const sw = -s * (4 + 2 * sin(phase * 2)) + (1 - s) * sin(t * 1.3);
    a.hairBack.setAttribute('d',
      `M8 -96.5 Q-15 -100 -18 -80 ` +
      `Q${f(-22 + sw * 0.3)} -68 ${f(-19 + sw * 0.5)} -58 ` +
      `Q${f(-23 + sw * 0.8)} -48 ${f(-18 + sw * 1.0)} -38 ` +
      `Q${f(-13 + sw * 1.1)} -29 ${f(-6 + sw * 0.8)} -33 ` +
      `Q${f(-1 + sw * 0.6)} -37 ${f(-6 + sw * 0.7)} -43 ` +
      `Q${f(-11 + sw * 0.5)} -48 ${f(-4 + sw * 0.3)} -54 ` +
      `L-1 -56 Z`);
    // arms swing opposite to the legs; hands rest on her lap when seated, or type on the laptop
    const shY = hipY - 25.5 + breathe;
    for (const [k, ph] of [['A', phase + PI], ['B', phase]]) {
      const upper = lerp(lerp(s * 0.55 * sin(ph) + 0.06, 0.5, sit), 1.05 + sin(t * 13 + (k === 'A' ? 0 : 2)) * 0.05, typing);
      const elbow = lerp(lerp(0.1 + s * 0.4, 1.0, sit), 0.55, typing);
      const [ex, ey, hx, hy] = bone(0, shY, upper, 8.5, elbow, 8);
      a.set('arm' + k, 'd', P(0, shY, ex, ey, hx, hy));
      a.set('hand' + k, 'cx', f(hx)); a.set('hand' + k, 'cy', f(hy));
      if (k === 'A') a.hand = [hx, hy];
    }
  }

  function poseDog(a, phase, s, t, sit = 0) {
    const bob = s * 1.4 * abs(sin(phase));
    a.dogBody.setAttribute('transform', `translate(0 ${f(-bob + sit * 9.5)}) rotate(${f(-15 * sit)} -8 -12)`);
    const legs = [['A1', 9, phase], ['B1', 6, phase + PI], ['A2', -6, phase + PI], ['B2', -9, phase]];
    for (const [k, x, ph] of legs) {
      const hind = x < 0;
      const ang = lerp(s * 0.55 * sin(ph), hind ? 1.3 : 0.47, sit);
      const [kx, ky, px, py] = bone(x, -14, ang, 6, lerp(-s * 0.6 * max(0, cos(ph)), hind ? -2.3 : 0, sit), 6.5);
      a.set('dleg' + k, 'd', P(x, -14, kx, ky, px, py - 2.5 + bob));
      a.set('dpaw' + k, 'cx', f(px)); a.set('dpaw' + k, 'cy', f(py - 2.8 + bob));
    }
    a.dogTail.forEach(el => el.setAttribute('transform', `rotate(${f(sin(t * (s > 0.1 ? 14 : 6)) * 12)} -11 -21)`));
    const tilt = `rotate(${f(s * 3 * sin(phase * 2) + (1 - s) * sin(t * 0.9) * 4)} 10 -22)`;
    a.dogHead.forEach(el => el.setAttribute('transform', tilt));
    a.dogFace.setAttribute('transform', tilt);
  }

  /* ---------- A Celyne + poodle pair inside one scene ---------- */
  // cfg: { x, y, scale, dogX?, leash?, mode: 'idle' | 'walk' | 'sit' | 'type' | 'hold', path?: [x0, x1, p0, p1], dogSide? }
  function makePair(layer, cfg) {
    const sc = cfg.scale || 1.2;
    layer.insertAdjacentHTML('beforeend',
      `<path class="g-leash" d=""/><g class="dog" role="img" aria-label="My black poodle">${DOG}</g><g class="hero" role="img" aria-label="Chibi me">${HERO}</g>`);
    const heroEl = layer.lastElementChild, dogEl = heroEl.previousElementSibling, leash = dogEl.previousElementSibling;
    const parts = {};
    for (const root of [heroEl, dogEl]) root.querySelectorAll('[data-limb]').forEach(el => { (parts[el.dataset.limb] ||= []).push(el); });
    const a = {
      cfg, sc, heroEl, dogEl, leash, hand: [0, 0],
      set: (n, at, v) => parts[n]?.forEach(el => el.setAttribute(at, v)),
      torso: heroEl.querySelector('.torso'), hairBack: heroEl.querySelector('.hair-back'),
      flip: heroEl.querySelector('.hero-flip'), wave: heroEl.querySelector('.wave-arm'),
      dogBody: dogEl.querySelector('.dog-body'), dogFlip: dogEl.querySelector('.dog-flip'), dogFace: dogEl.querySelector('.dog-face'),
      dogTail: [...dogEl.querySelectorAll('.dog-tail')], dogHead: [...dogEl.querySelectorAll('.dog-head')],
      x: cfg.x, tx: cfg.x, phase: 0, s: 0, dir: cfg.dir || 1, jump: -1, waveUntil: 0, faceUntil: 0,
      dx: cfg.dogX ?? cfg.x - 46, dPhase: 0, dS: 0, dDir: 1, dSit: 1, hop: -1
    };
    if (cfg.mode === 'hold') heroEl.classList.add('holding');
    heroEl.addEventListener('click', () => {
      if (a.onClick && a.onClick() === false) return;
      a.faceUntil = performance.now() + 3200;
      if (a.jump < 0 && cfg.mode !== 'sit' && cfg.mode !== 'type') a.jump = 0;
      say(heroEl, FACTS[fact++ % FACTS.length]);
    });
    dogEl.addEventListener('click', () => { if (a.hop < 0) a.hop = 0; say(dogEl, ['Woof!', 'Arf!', '♥'][Math.floor(Math.random() * 3)], 1400); });
    return a;
  }

  function stepPair(a, dt, t, progress) {
    const c = a.cfg;
    // where she wants to be: walkers follow the scroll position through their scene
    if (c.path) {
      const [x0, x1, p0, p1] = c.path;
      a.tx = lerp(x0, x1, clamp((progress - p0) / (p1 - p0)));
    }
    const prev = a.x;
    a.x = still ? a.tx : a.x + (a.tx - a.x) * min(1, dt * 5);
    const moved = a.x - prev, v = abs(moved) / max(dt, 1e-3);
    a.phase += abs(moved) / 62 * 2 * PI;
    a.s += (min(1, v / 120) - a.s) * min(1, dt * 8);
    if (v > 8) a.dir = moved > 0 ? 1 : -1;
    if (a.s < 0.03) a.phase += (Math.round(a.phase / PI) * PI - a.phase) * min(1, dt * 8);   // settle feet
    const sit = c.mode === 'sit' || c.mode === 'type' ? 1 : 0;
    let jy = 0;
    if (a.jump >= 0) { a.jump += dt; jy = -26 * sin(PI * min(1, a.jump / 0.5)); if (a.jump > 0.5) a.jump = -1; }
    const front = !sit && a.s < 0.06;
    a.heroEl.classList.toggle('facing', front);
    a.heroEl.setAttribute('transform', `translate(${f(a.x)} ${f(c.y + jy)}) scale(${a.sc})`);
    a.flip.setAttribute('transform', `scale(${sit ? 1 : a.dir} 1)`);
    poseHero(a, a.phase, a.jump >= 0 ? 0.2 : a.s, sit, t, c.mode === 'type' ? 1 : 0);
    const waving = front && c.mode !== 'hold' && (t * 1000 < a.waveUntil || (c.wave && a.s < 0.06));
    a.wave.setAttribute('transform', waving ? `rotate(${f(-118 + 16 * sin(t * 9))} 9.6 -54.6)` : '');
    if (front) a.hand = [-14.5, -37];

    // poodle: trots along a little behind her, sits when she stops
    const dTarget = c.dogX ?? (a.x - 44 * a.dir);
    const dPrev = a.dx;
    a.dx = still ? dTarget : a.dx + (dTarget - a.dx) * min(1, dt * 3.4);
    const dMoved = a.dx - dPrev, dv = abs(dMoved) / max(dt, 1e-3);
    a.dPhase += abs(dMoved) / 40 * 2 * PI;
    a.dS += (min(1, dv / 90) - a.dS) * min(1, dt * 8);
    if (dv > 8) a.dDir = dMoved > 0 ? 1 : -1; else if (c.dogFace) a.dDir = c.dogFace;
    a.dSit += ((a.dS < 0.05 ? 1 : 0) - a.dSit) * min(1, dt * 4);
    let dy = 0;
    if (a.hop >= 0) { a.hop += dt; dy = -12 * sin(PI * min(1, a.hop / 0.4)); if (a.hop > 0.4) a.hop = -1; }
    const dsc = a.sc * 0.88;
    a.dogEl.setAttribute('transform', `translate(${f(a.dx)} ${f(c.y + dy)}) scale(${f(dsc)})`);
    a.dogFlip.setAttribute('transform', `scale(${a.dDir} 1)`);
    poseDog(a, a.dPhase, a.dS, t, a.dSit);

    // leash from her hand to the bandana
    if (c.leash && !sit) {
      const hx = a.x + a.hand[0] * a.sc * (front ? 1 : a.dir), hy = c.y + jy + a.hand[1] * a.sc;
      const cx = a.dx + 10 * dsc * a.dDir, cy = c.y + dy - 18 * dsc;
      const sag = 6 + min(14, abs(hx - cx) * 0.08);
      a.leash.setAttribute('d', `M${f(hx)} ${f(hy)} Q${f((hx + cx) / 2)} ${f(max(hy, cy) + sag)} ${f(cx)} ${f(cy)}`);
    } else a.leash.setAttribute('d', '');
  }

  /* ---------- Speech bubbles ---------- */
  const FACTS = ['Hi, I\'m Celyne!', 'This is my black poodle 🐩', 'Currently binge-watching a drama…', 'Psst: Ctrl K to search', 'I love dogs, obviously'];
  let fact = 1;
  function say(who, text, ms = 2600) {
    const b = who.querySelector('.bubble'), tx = b.querySelector('text'), rect = b.querySelector('rect');
    tx.textContent = text;
    const w = max(44, tx.getComputedTextLength() + 26);
    rect.setAttribute('x', -w / 2); rect.setAttribute('width', w);
    b.classList.add('show');
    clearTimeout(b._t); b._t = setTimeout(() => b.classList.remove('show'), ms);
  }

  /* ---------- Outdoor landscape in layers (far → near), parallax by data-depth ---------- */
  const W = 1440;
  function landscape(seed, { trees = [], lamps = [], landmark = '', front = true, sky = '' } = {}) {
    const r = rng(seed);
    let mid = '', back = '', fore = '';
    for (let x = -120; x < W + 120; x += 46 + r() * 120) {
      const y = 330 - r() * 6;
      mid += r() < 0.6 ? lushTree(f(x), y, 34 + r() * 26, Math.floor(r() * 3)) : bush(f(x), y, 0.7 + r() * 0.4, Math.floor(r() * 3));
    }
    for (let x = -100; x < W + 100; x += 22 + r() * 60) back += r() < 0.5 ? tuft(x, G - 10) : daisy(x, G - 12 - r() * 6);
    for (let x = -100; x < W + 100; x += 18 + r() * 40) fore += r() < 0.45 ? tuft(x, G + 34 + r() * 30) : daisy(x, G + 30 + r() * 40);
    const near = trees.map(([x, h, tone]) => lushTree(x, G - 10, h, tone) + bush(x + 46, G - 8, 0.9, (tone + 1) % 3)).join('') +
      lamps.map(x => lampPost(x, G - 8)).join('');
    return {
      layers: [
        [0.5, `${stars(seed + 1, W, 70)}<circle class="w-sun" cx="${1040 + (seed % 5) * 40}" cy="${170 + (seed % 3) * 18}" r="30"/>` +
          bigCloud(60 - (seed % 4) * 80, 250, 1.8 + (seed % 3) * 0.3) + bigCloud(620, 170 + (seed % 2) * 30, 0.9) + bigCloud(1180 - (seed % 3) * 60, 240, 1.7) + sky],
        [0.36, `<path class="g-mtn1" d="${hills({ seed: 3 + seed, from: -200, to: W + 200, base: 262, amp: 26, step: 130,
          peaks: [{ x: 160 + seed * 13 % 200, h: 96, w: 300 }, { x: 760, h: 140, w: 360 }, { x: 1300, h: 110, w: 330 }] })}"/>` +
          `<rect class="g-mist" x="-200" y="236" width="${W + 400}" height="60"/>`],
        [0.26, `<path class="g-mtn2" d="${hills({ seed: 5 + seed, from: -200, to: W + 200, base: 296, amp: 22, step: 120,
          peaks: [{ x: 420, h: 86, w: 300 }, { x: 1040, h: 100, w: 320 }] })}"/>` +
          `<path class="g-mtn3" d="${hills({ seed: 11 + seed, from: -200, to: W + 200, base: 318, amp: 18, step: 110,
          peaks: [{ x: 240, h: 44, w: 220 }, { x: 900, h: 52, w: 260 }] })}"/>`],
        [0.14, `<path class="g-hill" d="${hills({ seed: 9 + seed, from: -200, to: W + 200, base: 334, amp: 16, step: 120 })}"/>` + mid],
        [0, `<rect class="g-meadow2" x="-200" y="${G - 30}" width="${W + 400}" height="40"/>` + landmark + near + back +
          `<rect class="g-meadow" x="-200" y="${G + 10}" width="${W + 400}" height="400"/>` +
          `<path class="g-path" d="M-200 ${G - 8} Q360 ${G - 12} 720 ${G - 8} T1640 ${G - 8} V${G + 18} Q1080 ${G + 22} 720 ${G + 18} T-200 ${G + 18} Z"/>` +
          `<g class="pairs"></g>` + fore],
        ...(front ? [[-0.2, leafClump(-10, H + 40, 1.6, 1) + leafClump(1460, H + 40, 1.4, -1)]] : [])
      ]
    };
  }


  /* ---------- Hero: her room, a little playroom ---------- */
  // Drag her onto the bed to sleep or onto the chair to work, throw the ball for the poodle,
  // click the lamp for night mode; the laptop, trophy, diploma and phone link to sections.
  const CHAIR = 300, BED = [1004, 1420], DOG_BED = 884, BEANBAG = 1225;
  const CLOCK = [668, 162];
  function heroRoom() {
    const B = G;
    const r = rng(57);
    const colors = ['#c96a55', '#8ea47a', '#e3bb72', '#7d8fa6', '#d9a58e', '#5d7a6a', '#b58ab0'];
    const books = (x0, x1, y, hMin = 22, hVar = 12) => {
      let s = '';
      for (let x = x0; x < x1 - 6;) {
        const w = 5 + r() * 5, h = hMin + r() * hVar;
        s += `<rect x="${f(x)}" y="${f(y - h)}" width="${f(w)}" height="${f(h)}" rx="1" fill="${colors[Math.floor(r() * colors.length)]}"/>`;
        x += w + 1.2;
      }
      return s;
    };
    const pot = (x, y, w, h) => `<path class="hr-pot" d="M${f(x - w / 2)} ${f(y - h)} h${w} l${f(-w * 0.12)} ${h} h${f(-w * 0.76)} Z"/>`;
    const plant = (x, y, s = 1) => pot(x, y, 18 * s, 15 * s) +
      [-50, -22, 0, 22, 50].map((a, i) => `<ellipse class="hr-leaf${i % 2 ? '2' : ''}" cx="${x}" cy="${f(y - 15 * s - 9 * s)}" rx="${f(4 * s)}" ry="${f(11 * s)}" transform="rotate(${a} ${x} ${f(y - 15 * s)})"/>`).join('');
    const picture = (x, y, w, h) => `<rect class="hr-frame" x="${x}" y="${y}" width="${w}" height="${h}" rx="2"/>` +
      `<rect class="hr-pic-sky" x="${x + 4}" y="${y + 4}" width="${w - 8}" height="${h - 8}"/>` +
      `<path class="hr-pic-mtn" d="M${x + 4} ${y + h - 4} L${f(x + w * 0.35)} ${f(y + h * 0.45)} L${f(x + w * 0.55)} ${f(y + h * 0.7)} L${f(x + w * 0.75)} ${f(y + h * 0.5)} L${x + w - 4} ${y + h - 4} Z"/>`;
    // clickable thing: goes somewhere (data-go) or does something (data-act)
    const obj = (t, extra, cls = 'hr-obj') => `class="${cls}" data-tip="${t}" ${extra} tabindex="0" role="button" aria-label="${t}"`;
    let planks = '', ticks = '';
    for (let x = -400; x < 1840; x += 70) planks += `M${x} ${B} v400 `;
    for (let i = 0; i < 12; i++) {
      const a = i * PI / 6, r1 = i % 3 ? 27 : 24;
      ticks += `M${f(CLOCK[0] + sin(a) * r1)} ${f(CLOCK[1] - cos(a) * r1)} L${f(CLOCK[0] + sin(a) * 30)} ${f(CLOCK[1] - cos(a) * 30)} `;
    }
    const curtain = side => side < 0
      ? `<path class="hr-curtain" d="M598 -46 H684 Q676 60 664 120 Q682 190 694 300 H604 Q616 190 622 120 Q606 50 598 -46 Z"/><path class="hr-curtain-fold" d="M626 -40 Q634 60 640 118 M650 130 Q656 210 660 296"/><rect class="hr-tieback" x="612" y="114" width="58" height="8" rx="4"/>`
      : `<path class="hr-curtain" d="M982 -46 H896 Q904 60 916 120 Q898 190 886 300 H976 Q964 190 958 120 Q974 50 982 -46 Z"/><path class="hr-curtain-fold" d="M954 -40 Q946 60 940 118 M930 130 Q924 210 920 296"/><rect class="hr-tieback" x="910" y="114" width="58" height="8" rx="4"/>`;
    const closed = side => `<g class="cur-closed ${side < 0 ? 'cc-l' : 'cc-r'}"><rect class="hr-curtain" x="${side < 0 ? 598 : 790}" y="-46" width="192" height="346"/>` +
      `<path class="hr-curtain-fold" d="${[0.2, 0.45, 0.7].map(k => `M${f((side < 0 ? 598 : 790) + 192 * k)} -40 V296`).join(' ')}"/></g>`;

    return `
      <defs>
        <linearGradient id="wsGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" class="ws-top"/><stop offset="1" class="ws-bot"/></linearGradient>
        <clipPath id="wsClip"><rect x="662" y="-18" width="256" height="238"/></clipPath>
      </defs>
      <rect class="r-wall" x="-400" y="-600" width="2240" height="${B + 600}"/>
      <rect class="r-floor" x="-400" y="${B}" width="2240" height="400"/>
      <path class="r-plank" d="${planks}"/>
      <rect class="r-skirting" x="-400" y="${B - 7}" width="2240" height="7"/>
      <path class="hr-floorlight" d="M640 ${B} L940 ${B} L860 ${B + 70} L520 ${B + 70} Z"/>

      <!-- window: the sky follows the visitor's real time of day; click to open / close the curtains -->
      <g transform="translate(302 73) scale(0.707)">
        <g ${obj('Open / close the curtains', 'data-act="curtain"', 'hr-hit')}>
          <rect class="r-window-frame" x="650" y="-30" width="280" height="262" rx="4"/>
          <g clip-path="url(#wsClip)">
            <rect class="ws-sky" x="662" y="-18" width="256" height="238" fill="url(#wsGrad)"/>
            <g class="ws-stars">${[[690, 10], [720, 40], [770, 0], [840, 30], [890, 12], [700, 90], [880, 70], [745, 62], [812, 18]].map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${i % 3 ? 1.4 : 2}" style="animation-delay:${-i * 0.7}s"/>`).join('')}</g>
            <g class="ws-moon"><circle class="ws-moon-c" cx="862" cy="40" r="20"/><circle class="ws-bite" cx="872" cy="33" r="17"/></g>
            <circle class="ws-sun" cx="790" cy="20" r="20"/>
            <g class="ws-clouds"><g class="hr-wcloud"><circle cx="700" cy="70" r="18"/><circle cx="724" cy="62" r="22"/><circle cx="748" cy="72" r="15"/><rect x="688" y="72" width="70" height="14" rx="7"/></g>
              <g class="hr-wcloud c2"><circle cx="850" cy="110" r="12"/><circle cx="866" cy="104" r="15"/><circle cx="882" cy="112" r="10"/><rect x="842" y="112" width="48" height="10" rx="5"/></g></g>
            <path class="hr-whill" d="M662 170 Q720 120 790 150 T918 140 V220 H662 Z"/>
            ${[[690, 170, 26], [726, 160, 22], [760, 176, 20], [856, 162, 26], [898, 172, 22]].map(([x, y, rr]) => `<circle class="hr-wtree" cx="${x}" cy="${y}" r="${rr}"/>`).join('')}
            <path class="hr-whill2" d="M662 200 Q760 182 840 200 T918 196 V220 H662 Z"/>
          </g>
          <path class="r-mullion" d="M790 -18 V220 M662 100 H918"/>
          <rect class="r-sill" x="638" y="226" width="304" height="10" rx="3"/>
        </g>
        <g ${obj('Water the plant', 'data-act="plant"')}>${plant(684, 226, 1)}</g>
        <rect class="hr-rod" x="586" y="-52" width="408" height="6" rx="3"/><circle class="hr-rod" cx="586" cy="-49" r="7"/><circle class="hr-rod" cx="994" cy="-49" r="7"/>
        <g class="cur-open">${curtain(-1)}${curtain(1)}</g>
        ${closed(-1)}${closed(1)}
      </g>

      <!-- digital wall clock with the visitor's real time -->
      <g transform="translate(${CLOCK[0]} ${CLOCK[1]}) scale(0.7) translate(${-CLOCK[0]} ${-CLOCK[1]})"><g ${obj('What time is it?', 'data-act="clock"', 'hr-hit')}>
        <rect class="hr-dclock" x="${CLOCK[0] - 58}" y="${CLOCK[1] - 30}" width="116" height="60" rx="12"/>
        <rect class="hr-dclock-screen" x="${CLOCK[0] - 50}" y="${CLOCK[1] - 22}" width="100" height="44" rx="7"/>
        <text class="hr-dclock-t" x="${CLOCK[0] - 6}" y="${CLOCK[1] + 10}" text-anchor="middle"></text>
        <text class="hr-dclock-ap" x="${CLOCK[0] + 40}" y="${CLOCK[1] - 6}" text-anchor="middle"></text>
        <text class="hr-dclock-s" x="${CLOCK[0] + 40}" y="${CLOCK[1] + 10}" text-anchor="middle"></text>
      </g></g>

      <!-- wall calendar with today's date; diploma above the bed -->
      <g ${obj("Today's date", 'data-act="calendar"', 'hr-hit hr-cal')}>
        <rect class="hr-cal-paper" x="1182" y="98" width="72" height="80" rx="5"/>
        <path class="hr-cal-top" d="M1182 115 V103 a5 5 0 0 1 5 -5 h62 a5 5 0 0 1 5 5 V115 Z"/>
        <circle class="hr-cal-ring" cx="1198" cy="98" r="3.5"/><circle class="hr-cal-ring" cx="1238" cy="98" r="3.5"/>
        <text class="hr-cal-month" x="1218" y="111" text-anchor="middle"></text>
        <text class="hr-cal-day" x="1218" y="152" text-anchor="middle"></text>
        <text class="hr-cal-wd" x="1218" y="168" text-anchor="middle"></text>
      </g>
      <g ${obj('Education →', 'data-go="education"')}>
        <rect class="hr-frame" x="1080" y="114" width="64" height="48" rx="2"/><rect class="hr-paper" x="1085" y="119" width="54" height="38"/>
        <path class="hr-paper-line" d="M1094 128 h36 M1098 136 h28 M1101 144 h22"/><circle class="g-cert-seal" cx="1129" cy="151" r="4"/>
      </g>

      <!-- desk corner -->
      <g class="hr-bin"><path d="M222 ${B} l-6 -40 h40 l-6 40 Z"/><circle class="hr-bin-face" cx="236" cy="${B - 22}" r="8"/><circle class="hr-bin-face" cx="230" cy="${B - 30}" r="3"/><circle class="hr-bin-face" cx="242" cy="${B - 30}" r="3"/></g>
      <rect class="hr-wood-d" x="320" y="${B - 58}" width="7" height="58"/>
      <rect class="hr-wood" x="404" y="${B - 58}" width="62" height="58" rx="2"/>
      <path class="hr-drawer" d="M408 ${B - 39} H462 M408 ${B - 20} H462"/><path class="hr-knob" d="M430 ${B - 49} h10 M430 ${B - 30} h10 M430 ${B - 11} h10"/>
      <rect class="hr-wood-l" x="306" y="${B - 66}" width="166" height="9" rx="2"/>
      <g ${obj('My projects →', 'data-go="projects"')}>
        <ellipse class="r-glow" cx="334" cy="${B - 84}" rx="26" ry="20"/>
        <path class="r-lid" d="M350 ${B - 67} L378 ${B - 67} L386 ${B - 108} L358 ${B - 108} Z"/><circle class="r-logo" cx="368" cy="${B - 88}" r="2.6"/>
        <rect class="r-base" x="334" y="${B - 69}" width="46" height="3.5" rx="1.5"/>
      </g>
      <g ${obj('Coffee break', 'data-act="mug"')}>
        <rect class="hr-cup" x="398" y="${B - 82}" width="13" height="16" rx="2"/><path class="hr-mug-h" d="M411 ${B - 78} q6 1 5 5 q-1 3 -5 3"/>
        <path class="hr-steam" d="M401 ${B - 88} q-3 -5 0 -9 M407 ${B - 88} q3 -5 0 -9"/>
      </g>
      <g ${obj('Water the plant', 'data-act="plant"')}>${plant(446, B - 66, 1.05)}</g>
      <path class="r-lamp-arm" d="M466 ${B - 66} L462 ${B - 110} L432 ${B - 126}"/><path class="r-lamp-shade" d="M424 ${B - 134} l18 6 l-9 11 Z"/>
      <g ${obj('Work at desk', 'data-act="chair"', 'hr-hit')}>
        <rect class="r-chair-back" x="276" y="${B - 98}" width="10" height="54" rx="5"/>
        <rect class="r-chair-seat" x="282" y="${B - 48}" width="34" height="8" rx="4"/>
        <rect class="r-chair-pole" x="297.5" y="${B - 40}" width="5" height="28"/>
        <path class="r-chair-base" d="M282 ${B - 9} H318"/><circle class="r-wheel" cx="283" cy="${B - 3}" r="3"/><circle class="r-wheel" cx="317" cy="${B - 3}" r="3"/>
      </g>

      <!-- bookshelf -->
      <rect class="hr-wood" x="486" y="${B - 168}" width="120" height="168" rx="3"/>
      <rect class="hr-shelf-in" x="493" y="${B - 161}" width="106" height="154" rx="2"/>
      <rect class="hr-wood" x="493" y="${B - 112}" width="106" height="6"/><rect class="hr-wood" x="493" y="${B - 58}" width="106" height="6"/>
      <g ${obj('Pick a book', 'data-act="book"')}>${books(496, 560, B - 112, 26, 14)}</g>${picture(566, B - 146, 28, 32)}
      <g ${obj('Pick a book', 'data-act="book"')}>${books(496, 540, B - 58, 26, 14)}</g>
      <g ${obj('Boop the bunny', 'data-act="bunny"')}><ellipse class="hr-bunny" cx="560" cy="${B - 68}" rx="9" ry="11"/><ellipse class="hr-bunny" cx="555" cy="${B - 84}" rx="3" ry="8"/><ellipse class="hr-bunny" cx="565" cy="${B - 84}" rx="3" ry="8"/></g>
      <rect class="hr-box" x="574" y="${B - 82}" width="22" height="24" rx="2"/>
      <rect class="hr-box" x="498" y="${B - 34}" width="34" height="27" rx="2"/>
      <g class="hr-pad"><rect x="544" y="${B - 22}" width="34" height="15" rx="7"/><circle class="hr-pad-b" cx="552" cy="${B - 15}" r="2.2"/><circle class="hr-pad-b" cx="570" cy="${B - 15}" r="2.2"/></g>
      <g ${obj('My awards →', 'data-go="awards"')}>
        <path class="h-gold" d="M572 ${B - 200} h26 q0 22 -13 24 q-13 -2 -13 -24 Z"/>
        <path class="h-handle" d="M572 ${B - 196} q-9 2 -5 10 q2 3 6 2 M598 ${B - 196} q9 2 5 10 q-2 3 -6 2"/>
        <rect class="h-gold" x="582" y="${B - 176}" width="6" height="5"/><rect class="h-gold" x="574" y="${B - 171}" width="22" height="5" rx="1.5"/>
      </g>
      ${books(500, 540, B - 168, 14, 6)}

      <!-- dog bed on the floor -->
      <g ${obj('Nap time for the pup', 'data-act="dogbed"', 'hr-hit')}><ellipse class="hr-dogbed" cx="${DOG_BED}" cy="${B - 4}" rx="42" ry="12"/><ellipse class="hr-dogbed-in" cx="${DOG_BED}" cy="${B - 7}" rx="31" ry="6"/></g>

      <!-- nightstand: lamp is the room's light switch (dark mode), real digital clock, phone -->
      <rect class="hr-wood" x="936" y="${B - 74}" width="62" height="74" rx="3"/>
      <rect class="hr-wood-l" x="932" y="${B - 78}" width="70" height="7" rx="2"/>
      <path class="hr-drawer" d="M940 ${B - 42} H994"/><path class="hr-knob" d="M962 ${B - 56} h10 M962 ${B - 24} h10"/>
      <g ${obj('Lights on / off', 'data-act="lamp"')}>
        <circle class="hr-lamp-glow" cx="950" cy="${B - 114}" r="42"/>
        <path class="hr-lamp-pole" d="M950 ${B - 78} V${B - 98} M942 ${B - 78} H958"/>
        <path class="hr-shade" d="M934 ${B - 98} L966 ${B - 98} L960 ${B - 124} L940 ${B - 124} Z"/>
      </g>
      <g ${obj('Contact me →', 'data-go="contact"')}>
        <rect class="hr-phone" x="972" y="${B - 92}" width="12" height="14" rx="2"/><path class="hr-phone-h" d="M969 ${B - 92} q9 -8 18 0"/>
      </g>

      <!-- bed -->
      <path class="hr-wood" d="M1004 ${B} V${B - 132} Q1004 ${B - 150} 1022 ${B - 150} Q1040 ${B - 150} 1040 ${B - 132} V${B} Z"/>
      <rect class="hr-wood-d" x="1016" y="${B - 52}" width="430" height="26" rx="4"/>
      <rect class="hr-mattress" x="1032" y="${B - 76}" width="412" height="26" rx="8"/>
      <ellipse class="hr-pillow" cx="1072" cy="${B - 84}" rx="34" ry="13"/>
      <g class="hr-flower"><circle cx="1112" cy="${B - 88}" r="9"/><circle cx="1124" cy="${B - 84}" r="9"/><circle cx="1120" cy="${B - 72}" r="9"/><circle cx="1105" cy="${B - 74}" r="9"/><circle class="hr-flower-c" cx="1115" cy="${B - 80}" r="6"/></g>
      <path class="hr-plaid" d="M1130 ${B - 80} Q1140 ${B - 84} 1160 ${B - 82} H1444 V${B - 30} H1170 Q1146 ${B - 34} 1130 ${B - 44} Z"/>
      <path class="hr-plaid-line" d="M1180 ${B - 82} V${B - 30} M1220 ${B - 82} V${B - 30} M1260 ${B - 82} V${B - 30} M1300 ${B - 82} V${B - 30} M1340 ${B - 82} V${B - 30} M1380 ${B - 82} V${B - 30} M1140 ${B - 64} H1444 M1150 ${B - 48} H1444"/>
      <rect class="hr-wood-d" x="1022" y="${B - 26}" width="10" height="26"/><rect class="hr-wood-d" x="1430" y="${B - 26}" width="10" height="26"/>

      `;
  }


  function setupRoom(sc) {
    const a = sc.pairs[0], svg = sc.svg, c = a.cfg, sc_ = a.sc;
    const layer = svg.querySelector('.pairs');
    layer.insertAdjacentHTML('beforeend',
      `<g class="hr-ball" data-tip="Throw the ball!" tabindex="0" role="button" aria-label="Throw the ball"><circle class="hr-ball-c" r="8"/><path class="hr-ball-s" d="M-8 -1 Q0 5 8 -1"/></g>` +
      `<path class="hr-plaid hr-cover" d="M1134 ${G - 52} Q1128 ${G - 104} 1156 ${G - 112} H1444 V${G - 30} H1166 Q1138 ${G - 34} 1134 ${G - 52} Z"/>` +
      `<path class="hr-plaid-line hr-cover" d="M1150 ${G - 109} Q1142 ${G - 70} 1146 ${G - 36} M1196 ${G - 112} V${G - 30} M1240 ${G - 112} V${G - 30} M1284 ${G - 112} V${G - 30} M1328 ${G - 112} V${G - 30} M1150 ${G - 84} H1444 M1146 ${G - 60} H1444"/>` +
      `<g class="hr-zzz"><text x="1066" y="${G - 112}">z</text><text x="1078" y="${G - 128}">z</text><text x="1092" y="${G - 146}">Z</text></g>`);
    const ball = layer.querySelector('.hr-ball');
    const R = { state: c.mode === 'type' ? 'type' : 'idle', down: null, drag: null, fall: null, idle: 0, pending: null,
      ball: { x: 590, y: G - 8, st: 'rest', t: 0, from: 0, to: 0, spin: 0 } };
    const toSvg = e => new DOMPoint(e.clientX, e.clientY).matrixTransform(svg.getScreenCTM().inverse());
    const dogHome = () => R.state === 'type' ? CHAIR + 196 : R.state === 'sleep' ? DOG_BED : undefined;
    const settleDog = () => { if (R.ball.st === 'rest') { c.dogX = dogHome(); c.dogFace = R.state === 'type' ? -1 : 1; } };
    if (c.mode === 'type') { settleDog(); }

    function wake(x) {
      R.state = 'idle'; c.mode = 'idle'; R.pending = null;
      sc.el.classList.remove('sleeping');
      a.heroEl.classList.remove('asleep');
      if (x !== undefined) { a.x = a.tx = x; }
      settleDog();
    }
    function sitDown() {
      wake(CHAIR); R.state = 'type'; c.mode = 'type'; settleDog();
      say(a.heroEl, 'Working on a project 💻', 2200);
    }
    function sleep() {
      wake(1190); R.state = 'sleep'; c.mode = 'sleep';
      sc.el.classList.add('sleeping'); a.heroEl.classList.add('asleep'); settleDog();
      say(a.dogEl, '…zz', 1400);
    }
    function throwBall() {
      const b = R.ball;
      if (b.st !== 'rest') return;
      const dir = b.x < 700 ? 1 : -1;
      Object.assign(b, { st: 'air', t: 0, from: b.x, to: clamp(b.x + dir * (240 + Math.random() * 260), 360, 960) });
      c.dogX = b.to - 22; c.dogFace = undefined;
      if (Math.random() < 0.6) say(a.dogEl, 'Ball!!', 1100);
    }

    // a.onClick lets the room take over clicks on her (no jump while asleep or right after a drag)
    a.onClick = () => {
      if (R.dragged) { R.dragged = false; return false; }
      if (R.state === 'sleep') { wake(1000); say(a.heroEl, 'Good morning! ☀', 1800); return false; }
      return true;
    };

    a.heroEl.addEventListener('pointerdown', e => {
      R.down = { x: e.clientX, y: e.clientY };
      a.heroEl.setPointerCapture(e.pointerId);
    });
    a.heroEl.addEventListener('pointermove', e => {
      if (!R.down) return;
      if (R.state !== 'drag' && Math.hypot(e.clientX - R.down.x, e.clientY - R.down.y) < 6) return;
      if (R.state !== 'drag') { wake(); R.state = 'drag'; sc.el.classList.add('dragging'); }
      const p = toSvg(e);
      R.drag = { x: clamp(p.x, 40, W - 40), y: min(p.y, G - 40) };
      a.x = a.tx = R.drag.x;
    });
    a.heroEl.addEventListener('pointerup', () => {
      R.down = null;
      if (R.state !== 'drag') return;
      R.dragged = true;
      sc.el.classList.remove('dragging');
      const { x, y } = R.drag;
      R.state = 'idle'; c.mode = 'idle';
      if (x > BED[0] && x < BED[1]) sleep();
      else if (abs(x - CHAIR) < 70) sitDown();
      else { R.fall = { y: (y + 90 * sc_) - G, v: 0 }; a.x = a.tx = x; settleDog(); }
    });

    // Clicks around the room: links, the lamp, the ball, or walking on the floor
    svg.addEventListener('click', e => {
      R.idle = 0;
      const obj = e.target.closest('[data-go], [data-act], .hr-ball');
      if (obj?.classList.contains('hr-ball')) { throwBall(); return; }
      if (obj?.dataset.go) { document.getElementById(obj.dataset.go)?.scrollIntoView({ behavior: still ? 'auto' : 'smooth' }); return; }
      if (obj?.dataset.act) { ACTS[obj.dataset.act]?.(obj); return; }
      if (e.target.closest('.hero, .dog')) return;
      const pt = toSvg(e);
      if (pt.y < G - 60) return;
      if (R.state === 'sleep' || R.state === 'type') wake();
      c.wave = false;
      a.tx = clamp(pt.x, 120, 1300);
      sc.el.classList.add('walked');
    });
    svg.addEventListener('keydown', e => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const obj = e.target.closest('[data-act], [data-go], .hr-ball');
      if (obj) { e.preventDefault(); obj.dispatchEvent(new MouseEvent('click', { bubbles: true })); }
    });
    svg.addEventListener('pointerdown', () => { R.idle = 0; });

    // Tooltip for the clickable things
    const tipEl = document.createElement('div');
    tipEl.className = 'room-tip';
    document.body.append(tipEl);
    svg.addEventListener('pointermove', e => {
      const t = e.target.closest('[data-tip]');
      if (!t || R.state === 'drag') { tipEl.classList.remove('on'); return; }
      tipEl.textContent = t.dataset.tip;
      tipEl.style.transform = `translate(${e.clientX + 14}px, ${e.clientY - 34}px)`;
      tipEl.classList.add('on');
    });
    svg.addEventListener('pointerleave', () => tipEl.classList.remove('on'));

    /* ----- real time: wall clock, nightstand clock, calendar and the sky in the window ----- */
    const q = sel => svg.querySelector(sel);
    const sun = q('.ws-sun');
    const timeText = d => d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    function tick() {
      const d = new Date(), h = d.getHours(), m = d.getMinutes(), sec = d.getSeconds();
      q('.hr-dclock-t').textContent = `${h % 12 || 12}:${String(m).padStart(2, '0')}`;
      q('.hr-dclock-ap').textContent = h < 12 ? 'AM' : 'PM';
      q('.hr-dclock-s').textContent = String(sec).padStart(2, '0');
      q('.hr-cal-month').textContent = d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase() + ' ' + d.getFullYear();
      q('.hr-cal-day').textContent = d.getDate();
      q('.hr-cal-wd').textContent = d.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
      const hf = h + m / 60;
      sc.el.dataset.sky = hf < 6 || hf >= 19.5 ? 'night' : hf < 11 ? 'morning' : hf < 16.5 ? 'day' : 'evening';
      const p = clamp((hf - 6) / 13.5);
      sun.setAttribute('cx', f(690 + p * 200)); sun.setAttribute('cy', f(200 - sin(p * PI) * 180));
    }
    tick(); setInterval(tick, 1000);

    /* ----- fit the room into the space under the text so they never overlap ----- */
    const heroBox = sc.el.closest('.hero');
    function fitRoom() {
      const W = sc.el.clientWidth, Hh = sc.el.clientHeight;
      if (!W || !Hh) return;
      const top = heroBox.getBoundingClientRect().top;
      const below = sel => { const el = heroBox.querySelector(sel); return el ? el.getBoundingClientRect().bottom - top : 0; };
      const nameBottom = below('h1'), textBottom = below('.hero-links');
      // the window and calendar reach up to y≈30, the shelf, trophy and clock up to y≈138 (room units, floor at 420)
      let s = Math.min(W / 1180, Hh / 680, (Hh - textBottom - 14) / (420 - 138), (Hh - nameBottom - 14) / (420 - 30));
      s = Math.max(s, 0.6);
      const w = W / s, h = Hh / s;
      svg.setAttribute('viewBox', `${f(720 - w / 2)} ${f(420 - h)} ${f(w)} ${f(h)}`);
    }
    fitRoom();
    addEventListener('resize', fitRoom);
    document.fonts?.ready.then(fitRoom);
    addEventListener('load', fitRoom);

    /* ----- what each clickable thing does ----- */
    const pop = (el, cls = 'pop') => { el.classList.remove(cls); el.getBoundingClientRect(); el.classList.add(cls); };
    const BOOKS = ['Reading about level design 📖', 'A game art book!', 'Storyboarding 101', 'UX research notes', 'My sketchbook ✏️'];
    let bookI = 0;
    const ACTS = {
      lamp: () => {
        document.getElementById('themeToggle')?.click();
        say(a.heroEl, document.documentElement.dataset.theme === 'dark' ? 'Lights off 🌙' : 'Lights on ☀', 1500);
      },
      clock: el => { pop(el); say(a.heroEl, `It's ${timeText(new Date())} ⏰`, 2200); },
      calendar: el => {
        pop(el, 'flip');
        say(a.heroEl, new Date().toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }), 2600);
      },
      curtain: () => {
        const shut = sc.el.classList.toggle('curtains-closed');
        say(a.heroEl, shut ? 'Cosy mode 🛋️' : ({ night: 'Look, the stars ✨', morning: 'Good morning sun ☀', day: 'What a nice day!', evening: 'Pretty sunset 🌇' })[sc.el.dataset.sky], 1800);
      },
      mug: el => { pop(el, 'puff'); say(a.heroEl, 'Coffee break ☕', 1500); },
      plant: el => { pop(el); say(a.heroEl, 'Grow, little plant 🌱', 1500); },
      book: el => { pop(el); say(a.heroEl, BOOKS[bookI++ % BOOKS.length], 1800); },
      bunny: el => { pop(el, 'hop'); },
      beanbag: el => {
        pop(el, 'squish');
        if (R.ball.st === 'rest') { c.dogX = BEANBAG; c.dogFace = -1; }
        setTimeout(() => say(a.dogEl, 'Comfy!', 1300), 700);
      },
      dogbed: () => {
        if (R.ball.st === 'rest') { c.dogX = DOG_BED; c.dogFace = 1; }
        setTimeout(() => say(a.dogEl, '…zz', 1300), 700);
      },
      chair: () => sitDown()
    };

    // Called every frame instead of the plain stepPair
    return function step(dt, t) {
      R.idle += dt;
      // after a quiet while she gets sleepy and goes to bed on her own
      if (R.state === 'idle' && R.idle > 45 && !R.pending) { R.pending = 'sleep'; a.tx = 1000; c.wave = false; }
      if (R.pending === 'sleep' && abs(a.x - 1000) < 3) sleep();

      // ball: flight, waiting for the poodle, carried back
      const b = R.ball;
      if (b.st === 'air') {
        b.t += dt; const k = min(1, b.t / 0.85);
        b.x = lerp(b.from, b.to, k); b.y = G - 8 - 120 * 4 * k * (1 - k); b.spin += dt * 900;
        if (k >= 1) { b.st = 'wait'; b.y = G - 8; }
      } else if (b.st === 'wait') {
        if (abs(a.dx - (b.x - 22)) < 10) { b.st = 'carry'; c.dogX = R.state === 'idle' ? a.x - 50 : dogHome(); }
      } else if (b.st === 'carry') {
        const dsc = sc_ * 0.88;
        b.x = a.dx + 24 * dsc * a.dDir; b.y = G - 22 * dsc;
        const target = c.dogX ?? a.x - 50;
        if (abs(a.dx - target) < 6) { b.st = 'rest'; b.y = G - 8; say(a.dogEl, 'Woof! Again?', 1500); settleDog(); }
      }
      ball.setAttribute('transform', `translate(${f(b.x)} ${f(b.y)}) rotate(${f(b.spin % 360)})`);

      stepPair(a, dt, t, 0);

      if (R.state === 'sleep') {
        a.heroEl.classList.remove('facing');
        a.flip.setAttribute('transform', 'scale(1 1)');
        poseHero(a, 0, 0, 0, t * 0.4);
        a.heroEl.setAttribute('transform', `translate(1210 ${G - 86}) rotate(-90) scale(${sc_})`);
      } else if (R.state === 'drag') {
        a.heroEl.classList.add('facing');
        const sway = sin(t * 7) * 6;
        a.heroEl.setAttribute('transform', `translate(${f(R.drag.x)} ${f(R.drag.y + 90 * sc_)}) rotate(${f(sway)} 0 ${f(-90)}) scale(${sc_})`);
      } else if (R.fall) {
        R.fall.v += 2200 * dt; R.fall.y = min(0, R.fall.y + R.fall.v * dt);
        a.heroEl.setAttribute('transform', `translate(${f(a.x)} ${f(G + R.fall.y)}) scale(${sc_})`);
        if (R.fall.y >= 0) { R.fall = null; say(a.heroEl, 'Wheee!', 1200); }
      }
    };
  }

  /* ---------- The scenes between sections ---------- */
  const SCENES = {
    // Home: her room, where you can play with her and the poodle
    hero: () => ({
      viewBox: '40 -300 1360 720', room: true,
      layers: [[0, heroRoom() + '<g class="pairs"></g>']],
      pairs: [{ x: 300, y: G, scale: 1.3, mode: 'type' }]
    }),
    // After Projects: her desk; she types on the laptop, the poodle naps by the chair
    desk: () => ({
      viewBox: `0 0 ${W} ${H}`,
      layers: [[0, `<g transform="translate(640 0)">${roomSVG()}</g><g class="pairs"></g>`]],
      pairs: [{ x: 640, y: G, mode: 'type', dogX: 578, dogFace: 1 }]
    }),
    // After About: a walk through the hills as you scroll
    walk: () => ({
      ...landscape(4, { trees: [[180, 96, 1], [1240, 90, 0]], lamps: [520, 980] }),
      pairs: [{ x: 160, y: G, leash: true, mode: 'walk', path: [140, 1300, 0.15, 0.85] }]
    }),
    // Before Awards: walking up to her university
    campus: () => ({
      ...landscape(2, { landmark: school('karangturi', karangturi(300), 300, G - 222, 'SMA Karangturi', 'High school · Semarang, Indonesia') +
        school('xmum', campus(930), 930, G - 252, 'Xiamen University Malaysia', 'Digital Media Technology · Class of 2027'), lamps: [560] }),
      pairs: [{ x: 300, y: G, leash: true, mode: 'walk', path: [300, 700, 0.15, 0.65] }]
    }),
    // Awards: the grand hall, holding her certificate on stage
    hall: () => ({
      viewBox: `0 380 ${W} 440`,
      layers: [[0, `${hallSVG()}<g class="pairs"></g>`]],
      pairs: [{ x: 720, y: 658, scale: 1.75, mode: 'hold', dogX: 664, dogFace: 1 }]
    }),
    // After Contact: walking home at the end of the day
    home: () => ({
      ...landscape(3, { landmark: home(1240), trees: [[200, 100, 2], [980, 92, 1]], lamps: [600] }),
      pairs: [{ x: 200, y: G, leash: true, mode: 'walk', path: [160, 1080, 0.05, 0.75] }]
    })
  };

  const scenes = [];
  document.querySelectorAll('[data-scene]').forEach(el => {
    const def = SCENES[el.dataset.scene]?.();
    if (!def) return;
    el.innerHTML = `<svg viewBox="${def.viewBox || `0 0 ${W} ${H}`}" preserveAspectRatio="xMidYMax slice">` +
      def.layers.map(([d, body]) => `<g class="px" data-depth="${d}">${body}</g>`).join('') + '</svg>';
    const svg = el.firstElementChild;
    const pairsLayer = svg.querySelector('.pairs');
    const pairs = (def.pairs || []).map(cfg => makePair(pairsLayer, cfg));
    const sc = { el, svg, layers: [...svg.querySelectorAll('.px')].map(g => ({ g, d: +g.dataset.depth })), pairs, on: false, p: 0 };
    if (def.room) sc.step = setupRoom(sc);
    scenes.push(sc);
  });

  // Only animate scenes that are on screen
  const io = new IntersectionObserver(entries => entries.forEach(en => {
    const sc = scenes.find(s => s.el === en.target);
    if (sc) sc.on = en.isIntersecting;
  }), { rootMargin: '100px 0px' });
  scenes.forEach(s => io.observe(s.el));

  // Cursor position (−1…1), smoothed, for the mouse parallax
  let mx = 0, my = 0, tmx = 0, tmy = 0;
  if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
    addEventListener('pointermove', e => { tmx = e.clientX / innerWidth * 2 - 1; tmy = e.clientY / innerHeight * 2 - 1; }, { passive: true });
  }

  let last = performance.now();
  function frame(now) {
    const dt = min(0.05, (now - last) / 1000); last = now;
    mx += (tmx - mx) * min(1, dt * 4); my += (tmy - my) * min(1, dt * 4);
    const t = now / 1000, vh = innerHeight;
    for (const sc of scenes) {
      if (!sc.on) continue;
      const r = sc.el.getBoundingClientRect();
      sc.p = clamp((vh - r.top) / (vh + r.height));            // 0 entering at the bottom → 1 leaving at the top
      if (!still) for (const { g, d } of sc.layers) g.setAttribute('transform', `translate(${f(-mx * d * 60)} ${f((sc.p - 0.5) * d * -90 - my * d * 14)})`);
      if (sc.step) sc.step(dt, t); else for (const a of sc.pairs) stepPair(a, dt, t, sc.p);
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  function focusSchool(id) {
    document.querySelectorAll('[data-school]').forEach(el => el.classList.toggle('hot', el.dataset.school === id));
    document.documentElement.classList.toggle('school-focus', !!id);
  }
  document.addEventListener('pointerover', e => {
    const el = e.target.closest('[data-school]');
    focusSchool(el ? el.dataset.school : null);
  });
  document.addEventListener('focusin', e => { const el = e.target.closest('[data-school]'); if (el) focusSchool(el.dataset.school); });
  document.addEventListener('focusout', () => focusSchool(null));

  // Say hello once the page has loaded
  setTimeout(() => { const h = scenes.find(s => s.el.dataset.scene === 'hero'); if (h?.pairs[0]) say(h.pairs[0].heroEl, 'Hi, welcome! ☺'); }, 1200);
})();
