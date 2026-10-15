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

  // Winners' podium for the strip before Awards: steps 2 · 1 · 3, bunting between two poles, a few confetti
  function podium(x) {
    const B = G - 6;
    const flags = Array.from({ length: 11 }, (_, i) => {
      const fx = x - 250 + i * 50, fy = B - 196 + Math.sin(i / 10 * PI) * 26;
      return `<path class="pd-flag${i % 3}" d="M${f(fx - 11)} ${f(fy)} L${f(fx + 11)} ${f(fy)} L${f(fx)} ${f(fy + 22)} Z"/>`;
    }).join('');
    const confetti = Array.from({ length: 14 }, (_, i) =>
      `<rect class="pd-conf${i % 3}" x="${f(x - 230 + i * 34)}" y="${f(B - 168 + (i * 37) % 70)}" width="6" height="3" rx="1" transform="rotate(${(i * 47) % 180} ${f(x - 227 + i * 34)} ${f(B - 166 + (i * 37) % 70)})"/>`).join('');
    return `<g class="pd">
      <path class="pd-pole" d="M${x - 270} ${B} V${B - 206} M${x + 270} ${B} V${B - 206}"/><circle class="pd-knob" cx="${x - 270}" cy="${B - 208}" r="5"/><circle class="pd-knob" cx="${x + 270}" cy="${B - 208}" r="5"/>
      <path class="pd-string" d="M${x - 270} ${B - 200} Q${x} ${B - 140} ${x + 270} ${B - 200}"/>${flags}${confetti}
      <rect class="pd-step2" x="${x - 150}" y="${B - 46}" width="96" height="46" rx="4"/><text class="pd-num" x="${x - 102}" y="${B - 16}">2</text>
      <rect class="pd-step3" x="${x + 54}" y="${B - 32}" width="96" height="32" rx="4"/><text class="pd-num" x="${x + 102}" y="${B - 9}">3</text>
      <rect class="pd-step1" x="${x - 58}" y="${B - 72}" width="116" height="72" rx="4"/><rect class="pd-top" x="${x - 58}" y="${B - 72}" width="116" height="8" rx="3"/>
      <text class="pd-num one" x="${x}" y="${B - 26}">1</text>
    </g>`;
  }

  // Awards night: an indoor stage with curtains, spotlights, a garland and the 2 · 1 · 3 podium
  function awardStage() {
    const x = 720, B = G + 4;
    let planks = '';
    for (let px = -200; px < 1660; px += 74) planks += `M${px} ${G - 4} L${f(720 + (px - 720) * 1.35)} ${H + 80} `;
    const curtain = side => {
      const s = side, x0 = side < 0 ? -60 : 1500, x1 = side < 0 ? 300 : 1140;
      const tie = side < 0 ? 170 : 1270;
      const folds = [0.2, 0.42, 0.64].map(k => { const fx = f(x0 + (x1 - x0) * k * 0.7); return `M${fx} 30 Q${f(+fx + s * 10)} 200 ${f(tie + s * (1 - k) * -40)} 236 Q${f(+fx - s * 6)} 290 ${fx} ${G}`; }).join(' ');
      return `<path class="st-curtain" d="M${x0} 0 H${x1} Q${f(x1 - s * -30)} 150 ${tie} 236 Q${f(x1 + s * 30)} 300 ${f(x1 + s * 40)} ${G} H${x0} Z"/>` +
        `<path class="st-fold" d="${folds}"/>` +
        `<ellipse class="st-tie" cx="${tie}" cy="238" rx="12" ry="7"/>`;
    };
    let scallops = '';
    for (let sx = -60; sx < 1500; sx += 60) scallops += `Q${sx + 30} 74 ${sx + 60} 46 `;
    const garland = Array.from({ length: 13 }, (_, i) => {
      const gx = 420 + i * 50, gy = 104 + Math.sin(i / 12 * PI) * 30;
      return `<path class="st-star${i % 2}" d="M${gx} ${f(gy - 8)} l2.4 5 l5.4 .6 l-4 3.7 l1.1 5.3 l-4.9 -2.7 l-4.9 2.7 l1.1 -5.3 l-4 -3.7 l5.4 -.6 Z"/>`;
    }).join('');
    const confetti = Array.from({ length: 22 }, (_, i) =>
      `<rect class="pd-conf${i % 3} st-conf" x="${380 + (i * 61) % 680}" y="-20" width="7" height="3.5" rx="1" style="animation-delay:${f(-i * 0.55)}s;animation-duration:${f(5 + (i % 5) * 0.9)}s"/>`).join('');
    const bulbs = Array.from({ length: 16 }, (_, i) => `<circle class="st-bulb" cx="${130 + i * 78}" cy="${G + 30}" r="4"/>`).join('');
    return {
      viewBox: `0 0 ${W} ${H}`,
      layers: [
        [0.12, `<rect class="st-wall" x="-200" y="-200" width="1840" height="${G + 200}"/>` +
          `<path class="st-drape" d="M400 40 H1040 V${G} H400 Z"/><path class="st-drape-fold" d="M480 40 V${G} M560 40 V${G} M640 40 V${G} M800 40 V${G} M880 40 V${G} M960 40 V${G}"/>` +
          `<path class="st-string" d="M400 98 Q720 158 1040 98"/>${garland}`],
        [0, `<rect class="st-floor" x="-200" y="${G - 4}" width="1840" height="200"/><path class="st-plank" d="${planks}"/>` +
          `<rect class="st-lip" x="-200" y="${G + 22}" width="1840" height="18"/>${bulbs}` +
          `<path class="st-beam" d="M560 0 L620 0 L820 ${B} L470 ${B} Z"/><path class="st-beam" d="M820 0 L880 0 L970 ${B} L640 ${B} Z"/>` +
          `<ellipse class="st-pool" cx="${x}" cy="${B}" rx="230" ry="18"/>` +
          `<rect class="pd-step2" x="${x - 150}" y="${B - 46}" width="96" height="46" rx="4"/><text class="pd-num" x="${x - 102}" y="${B - 16}">2</text>` +
          `<rect class="pd-step3" x="${x + 54}" y="${B - 32}" width="96" height="32" rx="4"/><text class="pd-num" x="${x + 102}" y="${B - 9}">3</text>` +
          `<rect class="pd-step1" x="${x - 58}" y="${B - 72}" width="116" height="72" rx="4"/><rect class="pd-top" x="${x - 58}" y="${B - 72}" width="116" height="8" rx="3"/>` +
          `<text class="pd-num one" x="${x}" y="${B - 26}">1</text>` +
          `<g class="pairs"></g>${confetti}` +
          curtain(-1) + curtain(1) +
          `<path class="st-valance" d="M-60 0 V46 ${scallops} V0 Z"/><path class="st-trim" d="M-60 46 ${scallops}"/>`]
      ]
    };
  }

  // Contact: a little town street; she walks the poodle to the post box outside the post office
  function townStreet() {
    const S = G - 8;                       // pavement line
    let far = '';
    const r = rng(77);
    for (let x = -120; x < W + 120;) {
      const w = 60 + r() * 70, hgt = 90 + r() * 110;
      far += `<rect class="tn-far" x="${f(x)}" y="${f(S - 60 - hgt)}" width="${f(w)}" height="${f(hgt + 60)}"/>`;
      if (r() < 0.5) far += `<path class="tn-far" d="M${f(x - 4)} ${f(S - 60 - hgt)} L${f(x + w / 2)} ${f(S - 90 - hgt)} L${f(x + w + 4)} ${f(S - 60 - hgt)} Z"/>`;
      for (let wy = S - 40 - hgt; wy < S - 70; wy += 26) for (let wx = x + 12; wx < x + w - 14; wx += 22)
        far += `<rect class="tn-far-win" x="${f(wx)}" y="${f(wy)}" width="8" height="11" rx="1"/>`;
      x += w + 8;
    }
    const awning = (x, w, y, cls) => {
      // striped canopy: each stripe has its own scalloped bottom edge
      const n = Math.round(w / 24), sw = w / n;
      let st = '';
      for (let i = 0; i < n; i++) st += `<path class="${cls}${i % 2 ? '-b' : ''}" d="M${f(x + i * sw)} ${y} H${f(x + (i + 1) * sw)} V${y + 24} Q${f(x + i * sw + sw / 2)} ${y + 36} ${f(x + i * sw)} ${y + 24} Z"/>`;
      return `<path class="${cls}" d="M${x - 8} ${y - 8} H${x + w + 8} L${x + w} ${y} H${x} Z"/>` + st;
    };
    const windows = (x, w, y0, rows, cls = 'tn-win') => {
      let s = '';
      for (let ry = 0; ry < rows; ry++) for (let wx = x + 18; wx < x + w - 30; wx += 46)
        s += `<rect class="${cls}" x="${wx}" y="${y0 + ry * 46}" width="26" height="32" rx="3"/><path class="tn-sill" d="M${wx - 3} ${y0 + ry * 46 + 33} h32"/>`;
      return s;
    };
    // café
    const cafe = `<rect class="tn-wall1" x="120" y="${S - 230}" width="300" height="230"/><rect class="tn-cornice" x="112" y="${S - 238}" width="316" height="12" rx="2"/>` +
      windows(120, 300, S - 214, 1) +
      `<rect class="tn-shop" x="132" y="${S - 112}" width="276" height="112"/>` + awning(132, 276, S - 120, 'tn-awn1') +
      `<rect class="tn-glass" x="146" y="${S - 84}" width="150" height="70" rx="3"/><rect class="tn-door" x="318" y="${S - 86}" width="74" height="86" rx="3"/>` +
      `<rect class="tn-sign" x="210" y="${S - 160}" width="120" height="30" rx="15"/><text class="tn-sign-t" x="270" y="${S - 140}">café</text>` +
      `<rect class="tn-table" x="70" y="${S - 34}" width="36" height="5" rx="2"/><path class="tn-table-leg" d="M88 ${S - 30} V${S}"/>`;
    // flower shop
    const flowers = `<rect class="tn-wall2" x="440" y="${S - 190}" width="230" height="190"/><rect class="tn-cornice" x="432" y="${S - 198}" width="246" height="12" rx="2"/>` +
      windows(440, 230, S - 174, 1) +
      `<rect class="tn-shop" x="452" y="${S - 104}" width="206" height="104"/>` + awning(452, 206, S - 112, 'tn-awn2') +
      `<rect class="tn-glass" x="466" y="${S - 78}" width="110" height="64" rx="3"/><rect class="tn-door2" x="590" y="${S - 80}" width="56" height="80" rx="3"/>` +
      [478, 506, 534].map((bx, i) => `<rect class="tn-bucket" x="${bx}" y="${S - 18}" width="22" height="18" rx="2"/>` +
        [-6, 0, 6].map(d => `<circle class="tn-bloom${(i + d / 6 + 3) % 3}" cx="${bx + 11 + d}" cy="${S - 24 - Math.abs(d)}" r="6"/>`).join('')).join('');
    // post office
    const post = `<rect class="tn-wall3" x="1000" y="${S - 250}" width="320" height="250"/><path class="tn-roof3" d="M988 ${S - 250} L1160 ${S - 300} L1332 ${S - 250} Z"/>` +
      windows(1000, 320, S - 228, 2) +
      `<rect class="tn-sign2" x="1080" y="${S - 128}" width="160" height="30" rx="4"/><text class="tn-sign-t2" x="1160" y="${S - 107}">POST OFFICE</text>` +
      `<path class="tn-arch" d="M1120 ${S} V${S - 64} Q1160 ${S - 96} 1200 ${S - 64} V${S} Z"/>` +
      `<rect class="tn-glass" x="1024" y="${S - 86}" width="70" height="62" rx="3"/><rect class="tn-glass" x="1226" y="${S - 86}" width="70" height="62" rx="3"/>` +
      `<path class="tn-env" d="M1040 ${S - 70} h38 v26 h-38 Z M1040 ${S - 70} l19 14 l19 -14"/>`;
    // round red post box
    const box = `<g class="tn-box"><rect class="tn-box-post" x="950" y="${S - 16}" width="12" height="16"/><rect class="tn-box-body" x="932" y="${S - 86}" width="48" height="72" rx="8"/>` +
      `<path class="tn-box-top" d="M930 ${S - 80} Q956 ${S - 108} 982 ${S - 80} Z"/><rect class="tn-box-slot" x="942" y="${S - 66}" width="28" height="4" rx="2"/><rect class="tn-box-band" x="932" y="${S - 40}" width="48" height="6"/></g>`;
    const planes = [0, 1, 2].map(i => `<g class="tn-plane" style="animation-delay:${-i * 3}s"><path d="M0 0 L22 -8 L8 4 Z M8 4 L6 10 L11 5 Z"/></g>`).join('');
    return {
      viewBox: `0 0 ${W} ${H}`,
      layers: [
        [0.5, `<circle class="w-sun" cx="820" cy="120" r="30"/>` + bigCloud(140, 110, 1.3) + bigCloud(1120, 80, 1.1)],
        [0.3, far],
        [0.1, cafe + flowers + post + lampPost(760, S) + lampPost(1380, S)],
        [0, `<rect class="tn-walk" x="-200" y="${S}" width="1840" height="30"/><path class="tn-slab" d="${Array.from({ length: 30 }, (_, i) => `M${-200 + i * 64} ${S} V${S + 30}`).join(' ')}"/>` +
          `<rect class="tn-curb" x="-200" y="${S + 30}" width="1840" height="8"/><rect class="tn-road" x="-200" y="${S + 38}" width="1840" height="200"/>` +
          `<path class="tn-lane" d="${Array.from({ length: 16 }, (_, i) => `M${-100 + i * 110} ${S + 70} h60`).join(' ')}"/>` +
          box + `<g class="tn-planes" transform="translate(960 ${S - 96})">${planes}</g><g class="pairs"></g>`]
      ]
    };
  }

  // Contact: home again. Her living room uses the very same pieces as the bedroom at the top
  // (window with the real sky, digital clock, calendar, diploma, bookshelf, nightstand lamp, plants, dog bed),
  // arranged around the sofa she sits on, with the front door on the left.
  function livingRoom() {
    const B = G;
    const r = rng(31);
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
    let planks = '';
    for (let x = -400; x < 1840; x += 70) planks += `M${x} ${B} v400 `;
    const curtain = side => side < 0
      ? `<path class="hr-curtain" d="M598 -46 H684 Q676 60 664 120 Q682 190 694 300 H604 Q616 190 622 120 Q606 50 598 -46 Z"/><path class="hr-curtain-fold" d="M626 -40 Q634 60 640 118 M650 130 Q656 210 660 296"/><rect class="hr-tieback" x="612" y="114" width="58" height="8" rx="4"/>`
      : `<path class="hr-curtain" d="M982 -46 H896 Q904 60 916 120 Q898 190 886 300 H976 Q964 190 958 120 Q974 50 982 -46 Z"/><path class="hr-curtain-fold" d="M954 -40 Q946 60 940 118 M930 130 Q924 210 920 296"/><rect class="hr-tieback" x="910" y="114" width="58" height="8" rx="4"/>`;
    const CK = [884, 150];
    const obj = (t, extra, cls = 'hr-obj') => `class="${cls}" data-tip="${t}" ${extra} tabindex="0" role="button" aria-label="${t}"`;
    return {
      viewBox: `0 0 ${W} ${H}`,
      live: true,
      layers: [[0, `
      <defs>
        <linearGradient id="lrGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" class="ws-top"/><stop offset="1" class="ws-bot"/></linearGradient>
        <clipPath id="lrClip"><rect x="662" y="-18" width="256" height="238"/></clipPath>
      </defs>
      <rect class="r-wall" x="-400" y="-600" width="2240" height="${B + 600}"/>
      <rect class="r-floor" x="-400" y="${B}" width="2240" height="400"/>
      <path class="r-plank" d="${planks}"/>
      <rect class="r-skirting" x="-400" y="${B - 7}" width="2240" height="7"/>

      <!-- front door: frame, arched glass, two panels, brass knob, a plant by the door -->
      <g transform="translate(70 0)">
      <g ${obj('Back to top', 'data-go="home"', 'hr-hit')}>
      <rect class="hr-wood-l" x="98" y="${B - 236}" width="152" height="236" rx="4"/>
      <rect class="hr-wood" x="110" y="${B - 224}" width="128" height="224" rx="3"/>
      <path class="r-window-frame" d="M136 ${B - 150} V${B - 184} a38 38 0 0 1 76 0 V${B - 150} Z"/>
      <path class="hr-sky" d="M142 ${B - 156} V${B - 184} a32 32 0 0 1 64 0 V${B - 156} Z"/>
      <path class="r-mullion" d="M174 ${B - 214} V${B - 156} M142 ${B - 182} H206"/>
      <rect class="hr-wood-d" x="130" y="${B - 134}" width="38" height="112" rx="3"/><rect class="hr-wood-d" x="180" y="${B - 134}" width="38" height="112" rx="3"/>
      <rect class="hr-wood" x="134" y="${B - 130}" width="30" height="104" rx="2"/><rect class="hr-wood" x="184" y="${B - 130}" width="30" height="104" rx="2"/>
      <rect class="lr-plate" x="221" y="${B - 124}" width="8" height="26" rx="3"/><circle class="lr-knob" cx="225" cy="${B - 108}" r="4.5"/>
      </g>
      <g ${obj('Water the plant', 'data-act="plant"')}>${plant(278, B, 1.9)}</g>
      </g>

      <g transform="translate(-150 0)">
      <!-- above the sofa: diploma, the digital clock, a little picture, the calendar -->
      <g ${obj('Education', 'data-go="education"')}>
      <rect class="hr-frame" x="726" y="126" width="64" height="48" rx="2"/><rect class="hr-paper" x="731" y="131" width="54" height="38"/>
      <path class="hr-paper-line" d="M740 140 h36 M744 148 h28 M747 156 h22"/><circle class="g-cert-seal" cx="775" cy="163" r="4"/>
      </g>
      <g transform="translate(${CK[0]} ${CK[1]}) scale(0.7) translate(${-CK[0]} ${-CK[1]})"><g ${obj('What time is it?', 'data-act="clock"', 'hr-hit')}>
        <rect class="hr-dclock" x="${CK[0] - 58}" y="${CK[1] - 30}" width="116" height="60" rx="12"/>
        <rect class="hr-dclock-screen" x="${CK[0] - 50}" y="${CK[1] - 22}" width="100" height="44" rx="7"/>
        <text class="hr-dclock-t" x="${CK[0] - 6}" y="${CK[1] + 10}" text-anchor="middle"></text>
        <text class="hr-dclock-ap" x="${CK[0] + 40}" y="${CK[1] - 6}" text-anchor="middle"></text>
        <text class="hr-dclock-s" x="${CK[0] + 40}" y="${CK[1] + 10}" text-anchor="middle"></text>
      </g></g>
      <g ${obj('About me', 'data-go="about"')}>${picture(966, 128, 40, 46)}</g>
      <g ${obj("Today's date", 'data-act="calendar"', 'hr-hit hr-cal')}>
        <rect class="hr-cal-paper" x="1028" y="110" width="72" height="80" rx="5"/>
        <path class="hr-cal-top" d="M1028 127 V115 a5 5 0 0 1 5 -5 h62 a5 5 0 0 1 5 5 V127 Z"/>
        <circle class="hr-cal-ring" cx="1044" cy="110" r="3.5"/><circle class="hr-cal-ring" cx="1084" cy="110" r="3.5"/>
        <text class="hr-cal-month" x="1064" y="123" text-anchor="middle"></text>
        <text class="hr-cal-day" x="1064" y="164" text-anchor="middle"></text>
        <text class="hr-cal-wd" x="1064" y="180" text-anchor="middle"></text>
      </g>

      <!-- sofa (she sits here) -->
      <g transform="translate(0 8)">
      <rect class="lr-sofa-back" x="724" y="${B - 118}" width="300" height="78" rx="26"/>
      <rect class="lr-cushion" x="752" y="${B - 100}" width="56" height="44" rx="14" transform="rotate(-8 780 ${B - 78})"/>
      <rect class="lr-cushion2" x="940" y="${B - 100}" width="52" height="42" rx="14" transform="rotate(7 966 ${B - 79})"/>
      <rect class="lr-sofa" x="716" y="${B - 54}" width="316" height="38" rx="14"/>
      <rect class="lr-sofa-arm" x="696" y="${B - 88}" width="44" height="76" rx="20"/><rect class="lr-sofa-arm" x="1008" y="${B - 88}" width="44" height="76" rx="20"/>
      </g>
      <rect class="hr-wood-d" x="718" y="${B - 8}" width="8" height="8" rx="2"/><rect class="hr-wood-d" x="1022" y="${B - 8}" width="8" height="8" rx="2"/>

      <!-- nightstand beside the sofa: the same lamp, mug and phone -->
      <g transform="translate(30 0)">
      <rect class="hr-wood" x="1074" y="${B - 74}" width="62" height="74" rx="3"/>
      <rect class="hr-wood-l" x="1070" y="${B - 78}" width="70" height="7" rx="2"/>
      <path class="hr-drawer" d="M1078 ${B - 42} H1132"/><path class="hr-knob" d="M1100 ${B - 56} h10 M1100 ${B - 24} h10"/>
      <g ${obj('Lights on / off', 'data-act="lamp"')}>
      <circle class="hr-lamp-glow" cx="1090" cy="${B - 114}" r="42"/>
      <path class="hr-lamp-pole" d="M1090 ${B - 78} V${B - 98} M1082 ${B - 78} H1098"/>
      <path class="hr-shade" d="M1074 ${B - 98} L1106 ${B - 98} L1100 ${B - 124} L1080 ${B - 124} Z"/>
      </g>
      <g ${obj('Ring ring', 'data-act="phone"')}><rect class="hr-phone" x="1112" y="${B - 92}" width="12" height="14" rx="2"/><path class="hr-phone-h" d="M1109 ${B - 92} q9 -8 18 0"/></g>

      </g>
      <!-- the same bookshelf: books, bunny, a picture and her trophy on top -->
      <g transform="translate(70 0)">
      <rect class="hr-wood" x="1170" y="${B - 168}" width="120" height="168" rx="3"/>
      <rect class="hr-shelf-in" x="1177" y="${B - 161}" width="106" height="154" rx="2"/>
      <rect class="hr-wood" x="1177" y="${B - 112}" width="106" height="6"/><rect class="hr-wood" x="1177" y="${B - 58}" width="106" height="6"/>
      <g ${obj('Pick a book', 'data-act="book"')}>${books(1180, 1244, B - 112, 26, 14)}</g><g ${obj('About me', 'data-go="about"')}>${picture(1250, B - 146, 28, 32)}</g>
      <g ${obj('Pick a book', 'data-act="book"')}>${books(1180, 1224, B - 58, 26, 14)}</g>
      <g ${obj('Boop the bunny', 'data-act="bunny"')}><ellipse class="hr-bunny" cx="1244" cy="${B - 68}" rx="9" ry="11"/><ellipse class="hr-bunny" cx="1239" cy="${B - 84}" rx="3" ry="8"/><ellipse class="hr-bunny" cx="1249" cy="${B - 84}" rx="3" ry="8"/></g>
      <rect class="hr-box" x="1258" y="${B - 82}" width="22" height="24" rx="2"/>
      <rect class="hr-box" x="1182" y="${B - 34}" width="34" height="27" rx="2"/>
      <g class="hr-pad"><rect x="1228" y="${B - 22}" width="34" height="15" rx="7"/><circle class="hr-pad-b" cx="1236" cy="${B - 15}" r="2.2"/><circle class="hr-pad-b" cx="1254" cy="${B - 15}" r="2.2"/></g>
      <g>
      <path class="h-gold" d="M1256 ${B - 200} h26 q0 22 -13 24 q-13 -2 -13 -24 Z"/>
      <path class="h-handle" d="M1256 ${B - 196} q-9 2 -5 10 q2 3 6 2 M1282 ${B - 196} q9 2 5 10 q-2 3 -6 2"/>
      <rect class="h-gold" x="1266" y="${B - 176}" width="6" height="5"/><rect class="h-gold" x="1258" y="${B - 171}" width="22" height="5" rx="1.5"/>
      </g>
      ${books(1184, 1224, B - 168, 14, 6)}

      </g>
      <!-- a tall plant in the corner, the poodle's bed in front of the sofa -->
      <g transform="translate(100 0)"><g ${obj('Water the plant', 'data-act="plant"')}>${plant(1352, B, 3.2)}</g></g>
      <ellipse class="hr-dogbed" cx="1000" cy="${B - 4}" rx="42" ry="12"/><ellipse class="hr-dogbed-in" cx="1000" cy="${B - 7}" rx="31" ry="6"/>
      </g>
      <g class="pairs"></g>`]]
    };
  }

  // Real time for any room that shows the window, clock and calendar (the bedroom has its own)
  function liveRoom(el, svg) {
    const q = sel => svg.querySelector(sel);
    const set = (sel, t) => { const n = q(sel); if (n) n.textContent = t; };
    const tick = () => {
      const d = new Date(), h = d.getHours(), m = d.getMinutes(), hf = h + m / 60;
      el.dataset.sky = hf < 6 || hf >= 19.5 ? 'night' : hf < 11 ? 'morning' : hf < 16.5 ? 'day' : 'evening';
      set('.hr-dclock-t', `${h % 12 || 12}:${String(m).padStart(2, '0')}`);
      set('.hr-dclock-ap', h < 12 ? 'AM' : 'PM');
      set('.hr-dclock-s', String(d.getSeconds()).padStart(2, '0'));
      set('.hr-cal-month', d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase() + ' ' + d.getFullYear());
      set('.hr-cal-day', d.getDate());
      set('.hr-cal-wd', d.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase());
    };
    tick(); setInterval(tick, 1000);
  }
  // Draw a scene at the same size as the bedroom at the top (same scale rule as fitRoom), ground along the bottom
  function fitScene(el, svg) {
    const fit = () => {
      const Wd = el.clientWidth, Hd = el.clientHeight;
      if (!Wd || !Hd) return;
      const s = max(0.6, min(Wd / 1440, innerHeight / 860));
      const w = Wd / s, h = Hd / s;
      svg.setAttribute('viewBox', `${f(720 - w / 2)} ${f(420 - h)} ${f(w)} ${f(h)}`);
    };
    fit();
    addEventListener('resize', fit);
  }

  /* ---------- Characters ---------- */
  // Celyne: one design shared by every view. Long straight brown hair with curtain bangs and an orange clip,
  // orange hoodie, pink skirt, white sneakers, cream backpack. Soft light colors, no outlines.
  // Side view (walking/sitting) has limbs posed every frame; front view is used when she stands still.
  const LIMB = () => '';
  const HERO = `<g class="hero-flip">
    <ellipse class="g-shadow" cx="0" cy="1" rx="14" ry="2.6"/>
    <g class="hero-body">
      <g class="view-side">
        <path class="g-sleeve far" data-limb="armB" d=""/><circle class="g-skin far" data-limb="handB" r="2.4"/>
        <path class="g-leg far" data-limb="legB" d=""/><path class="g-leg far" data-limb="sockB" d=""/><path class="g-shoe far" data-limb="bootB" d=""/>
        <path class="g-leg" data-limb="legA" d=""/><path class="g-leg" data-limb="sockA" d=""/><path class="g-shoe" data-limb="bootA" d=""/>
        <g class="torso">
          <rect class="g-pack2" x="-15.5" y="-55" width="9" height="15" rx="3.5"/>
          <path class="g-skirtp" d="M-8 -42 L8 -42 Q10.5 -34 12.5 -27 Q0 -24.5 -12.5 -27 Q-10.5 -34 -8 -42 Z"/>
          <path class="g-skirtp-fold" d="M-4 -38 L-5.5 -26.2 M0.5 -38 L0.5 -25.4 M4.8 -38 L6 -26.2"/>
          <path class="g-jacket" d="M-9 -56 Q1 -59 8.5 -55.5 Q10.6 -47 10 -38.5 Q0 -37 -10 -38.5 Q-10.6 -47 -9 -56 Z"/>
          <path class="g-jacket-hem" d="M-9.6 -40.5 Q0 -39 9.8 -40.5"/>
          <path class="g-pocket" d="M2 -46 h6 v4"/>
          <path class="g-top" d="M-1.5 -57.5 C3 -57.5 7.5 -55.5 7 -52.5 C2.5 -52.5 -0.5 -54.5 -1.5 -57.5 Z"/>
          <path class="g-pack-strap2" d="M-6 -56 Q-3 -50 -6.5 -43"/>
          <rect class="g-skin" x="-1.6" y="-58.5" width="5" height="5" rx="1.5"/>
          <g class="g-head" transform="translate(2 -57) scale(1.2) translate(-2 57)">
          <path class="g-hair hair-back" d=""/>
          <circle class="g-skin" cx="2.5" cy="-70" r="14.6"/>
          <ellipse class="g-skin" cx="6.5" cy="-66" rx="8" ry="7.5"/>
          <!-- Straight hair with blunt bangs; a lock falls in front of the ear -->
          <path class="g-hair" d="M-14.5 -62 C-17.5 -82 -9 -90.5 3 -90.5 C14 -90.5 19.8 -84 19.2 -73 Q15.5 -74.6 11.5 -74 Q7 -72 5.8 -64 Q5.2 -59.5 3.4 -56.5 L-15 -56.5 Q-15.6 -59 -14.5 -62 Z"/>
          <path class="g-hair-shine" d="M-3.5 -91.5 Q3.5 -94.5 11 -91"/>

          <!-- Orange hair clip -->
          <rect class="g-clip" x="3" y="-87" width="8" height="3" rx="1.5" transform="rotate(-18 10 -80.5)"/>
          <g class="blink"><ellipse class="g-eye" cx="12" cy="-64.4" rx="2.1" ry="2.8"/></g>
          <circle class="g-eye-hi" cx="12.7" cy="-65.6" r="0.8"/><circle class="g-eye-hi" cx="11.3" cy="-63.2" r="0.38"/>
          <ellipse class="g-blush" cx="9.2" cy="-61.2" rx="2.5" ry="1.5"/>
          <path class="g-smile" d="M11.4 -60.6 Q12.6 -59.4 13.8 -60.8"/>
          </g>
        </g>
        <path class="g-sleeve" data-limb="armA" d=""/><circle class="g-skin" data-limb="handA" r="2.4"/>
      </g>
      <g class="view-front">
        <!-- Long straight hair down the back -->
        <path class="g-hair" transform="translate(0 -57) scale(1.2) translate(0 57)" d="M-18.6 -66 C-20.5 -83 -12 -89.5 0 -89.5 C12 -89.5 20.5 -83 18.6 -66 L19.4 -42 Q15.5 -40.6 11.6 -42 L11.6 -54 L-11.6 -54 L-11.6 -42 Q-15.5 -40.6 -19.4 -42 Z"/>
        <path class="g-shoe2" d="M-9 0 C-9.4 -4.2 -7.4 -6 -4.6 -6 C-2 -6 -0.8 -4.6 -1 -2 L-1 0 Z M9 0 C9.4 -4.2 7.4 -6 4.6 -6 C2 -6 0.8 -4.6 1 -2 L1 0 Z"/>
        <path class="g-skin" d="M-6 -29 H-1.8 V-5 H-6 Z M1.8 -29 H6 V-5 H1.8 Z"/>
        <path class="g-skirtp" d="M-10 -42 L10 -42 Q12.5 -34 14.5 -27.5 Q0 -25 -14.5 -27.5 Q-12.5 -34 -10 -42 Z"/>
        <path class="g-skirtp-fold" d="M-6 -38.5 L-8.4 -27 M-2 -38.5 L-2.8 -26.2 M2 -38.5 L2.8 -26.2 M6 -38.5 L8.4 -27"/>
        <path class="g-jacket" d="M-9.5 -55.5 Q0 -58.5 9.5 -55.5 Q11.4 -47 11 -38.5 Q0 -37 -11 -38.5 Q-11.4 -47 -9.5 -55.5 Z"/>
        <path class="g-jacket-hem" d="M-10.6 -40.5 Q0 -39 10.6 -40.5"/>
        <path class="g-top" d="M-6 -56 Q0 -52.5 6 -56 Q3.5 -51 0 -52 Q-3.5 -51 -6 -56 Z"/>
        <g class="arm-l"><path class="g-sleeve-f" d="M-9.6 -54.6 Q-13.6 -51 -14.4 -39"/><circle class="g-skin" cx="-14.5" cy="-37" r="2.4"/></g>
        <path class="g-pack-strap2" d="M-6.2 -56 L-5.6 -44.5 M6.2 -56 L5.6 -44.5"/>
        <rect class="g-skin" x="-2.4" y="-59" width="4.8" height="5" rx="1.5"/>
        <path class="g-neck" d="M-3.6 -56.4 Q0 -53.4 3.6 -56.4 Z"/>
        <g class="g-head" transform="translate(0 -57) scale(1.2) translate(0 57)">
          <ellipse class="g-skin" cx="0" cy="-69" rx="15.8" ry="13.8"/>
          <!-- side-swept bangs parted on her right, long straight locks framing the face -->
          <path class="g-hair" d="M-18.8 -48 C-20.8 -81 -12 -89.5 0 -89.5 C12 -89.5 20.8 -81 18.8 -48 L15.4 -48 Q15.8 -59 14.8 -64.5 Q9.5 -66.2 4.5 -70.2 Q-0.5 -74.4 -4 -79.2 Q-6.4 -73.8 -9.6 -70.6 Q-13.2 -67.4 -14.8 -63.5 Q-15.8 -58 -15.4 -48 Z"/>
          <rect class="g-clip" x="6.5" y="-84.5" width="8.5" height="3.2" rx="1.6" transform="rotate(-22 10.75 -82.9)"/>
          <g class="blink">
            <ellipse class="g-eye" cx="-6.3" cy="-63.8" rx="2.3" ry="2.9"/>
            <ellipse class="g-eye" cx="6.3" cy="-63.8" rx="2.3" ry="2.9"/>
          </g>
          <circle class="g-eye-hi" cx="-5.5" cy="-65" r=".85"/><circle class="g-eye-hi" cx="7.1" cy="-65" r=".85"/>
          <circle class="g-eye-hi" cx="-7.1" cy="-62.6" r=".4"/><circle class="g-eye-hi" cx="5.5" cy="-62.6" r=".4"/>
          <ellipse class="g-blush" cx="-10.4" cy="-60" rx="2.6" ry="1.5"/><ellipse class="g-blush" cx="10.4" cy="-60" rx="2.6" ry="1.5"/>
          <path class="g-smile" d="M-1.9 -60 Q0 -58 1.9 -60"/>
        </g>
        <g class="cert-hold"><path class="g-sleeve-f" d="M-9.6 -54.6 Q-13 -46 -5.5 -42.5"/><path class="g-sleeve-f" d="M9.6 -54.6 Q13 -46 5.5 -42.5"/>
          <path class="g-trophy-h" d="M-5.6 -52 q-4.6 0.6 -3.4 4.6 q0.8 2 3.6 2 M5.6 -52 q4.6 0.6 3.4 4.6 q-0.8 2 -3.6 2"/>
          <path class="g-trophy" d="M-6.4 -53.5 H6.4 Q6.6 -44.6 0 -43.4 Q-6.6 -44.6 -6.4 -53.5 Z"/>
          <rect class="g-trophy" x="-1.3" y="-43.8" width="2.6" height="3.4"/><rect class="g-trophy-d" x="-4.6" y="-40.6" width="9.2" height="2.6" rx="1"/>
          <path class="g-trophy-star" d="M0 -51.4 l0.9 1.9 l2 .2 l-1.5 1.4 l.4 2 l-1.8 -1 l-1.8 1 l.4 -2 l-1.5 -1.4 l2 -.2 Z"/>
          <circle class="g-skin" cx="-5.5" cy="-42.5" r="2.4"/><circle class="g-skin" cx="5.5" cy="-42.5" r="2.4"/></g>
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
      <g class="dog-collar"><path class="g-collar" d="M4.5 -25 Q10 -21 16.5 -23.6"/><circle class="g-collar-tag" cx="10.6" cy="-20.2" r="1.7"/></g>
      <g class="dog-face">
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

  // Grand hall behind the Awards: arched windows and pillars at the sides, long banners,
  // big potted plants, and a podium with a red carpet at the bottom where she stands.
  // Scene units: x 0–1440, y -400–620, floor at 560.
  function hallSVG() {
    const F = 560;
    const laurel = (cx, cy, r, side, cls = 'h-gold') => {
      let s = '';
      for (let i = 0; i < 7; i++) {
        const a = (side < 0 ? 200 : -20) + side * i * 24, rad = a * PI / 180;
        const x = cx + Math.cos(rad) * r, y = cy + Math.sin(rad) * r;
        s += `<ellipse class="${cls}" cx="${f(x)}" cy="${f(y)}" rx="${f(r * 0.14)}" ry="${f(r * 0.3)}" transform="rotate(${f(a + 90 * side)} ${f(x)} ${f(y)})"/>`;
      }
      return s;
    };
    const banner = x => `<path class="h-rod" d="M${x - 50} -232 H${x + 50}"/><circle class="h-rod-knob" cx="${x - 52}" cy="-232" r="5"/><circle class="h-rod-knob" cx="${x + 52}" cy="-232" r="5"/>` +
      `<path class="h-banner" d="M${x - 38} -230 H${x + 38} V60 L${x} 98 L${x - 38} 60 Z"/><path class="h-banner-edge" d="M${x - 31} -222 V56 L${x} 88 L${x + 31} 56 V-222"/>` +
      laurel(x - 2, -100, 26, -1, 'h-laurel') + laurel(x + 2, -100, 26, 1, 'h-laurel') + `<path class="h-laurel" d="M${x} -62 l5 7 l-5 7 l-5 -7 Z"/>`;
    const win = x => `<path class="h-window" d="M${x} ${F} V-180 Q${x + 100} -330 ${x + 200} -180 V${F} Z"/>` +
      `<path class="h-frame" d="M${x} ${F} V-180 Q${x + 100} -330 ${x + 200} -180 V${F} M${x + 100} -255 V${F} M${x} -40 H${x + 200} M${x} 160 H${x + 200} M${x} 360 H${x + 200}"/>`;
    const plant = (x, s) => `<path class="h-pot" d="M${x - 34 * s} ${F - 62 * s} H${x + 34 * s} L${x + 27 * s} ${F} H${x - 27 * s} Z"/>` +
      `<rect class="h-pot-rim" x="${f(x - 37 * s)}" y="${f(F - 66 * s)}" width="${f(74 * s)}" height="${f(10 * s)}" rx="3"/>` +
      [-64, -40, -18, 6, 28, 50, 70].map((a, i) => `<path class="${i % 2 ? 'h-leaf' : 'h-leaf2'}" transform="rotate(${a} ${x} ${f(F - 66 * s)})" d="M${x} ${f(F - 66 * s)} Q${f(x + 30 * s)} ${f(F - 140 * s)} ${x} ${f(F - (210 - (i % 3) * 30) * s)} Q${f(x - 30 * s)} ${f(F - 140 * s)} ${x} ${f(F - 66 * s)} Z"/>`).join('');
    let petals = '';
    const r = rng(91);
    for (let i = 0; i < 16; i++) petals += `<ellipse class="h-petal" cx="${f(r() * 1440)}" cy="-380" rx="5" ry="3" style="animation-delay:${f(-r() * 9)}s;animation-duration:${f(9 + r() * 6)}s;--dx:${f((r() - 0.5) * 160)}px"/>`;
    return `
      <g class="hall-g"><rect class="h-wall" x="-1200" y="-1400" width="3840" height="${1400 + F}"/>
      <path class="h-panel" d="M260 -330 H1180 M260 -322 H1180"/>
      ${win(-150)}${win(1390)}
      <rect class="h-pillar" x="44" y="-420" width="58" height="${420 + F}"/><rect class="h-pillar-cap" x="34" y="-420" width="78" height="18" rx="3"/>
      <rect class="h-pillar" x="1338" y="-420" width="58" height="${420 + F}"/><rect class="h-pillar-cap" x="1328" y="-420" width="78" height="18" rx="3"/>
      ${banner(150)}${banner(1290)}
      <rect class="h-skirting" x="-1200" y="${F - 18}" width="3840" height="18"/>
      <rect class="h-floor" x="-1200" y="${F}" width="3840" height="700"/>
      <path class="h-floor-line" d="M-1200 ${F + 26} H2640"/>
      ${plant(150, 1.15)}${plant(1290, 1.15)}
      <path class="h-carpet" d="M640 ${F} H800 L1010 ${F + 260} H430 Z"/>
      <path class="h-carpet-edge" d="M652 ${F} L462 ${F + 260} M788 ${F} L978 ${F + 260}"/>
      <rect class="h-step2" x="458" y="${F - 62}" width="170" height="64" rx="4"/>
      <rect class="h-step2" x="812" y="${F - 62}" width="170" height="64" rx="4"/>
      <rect class="h-step" x="600" y="${F - 96}" width="240" height="98" rx="4"/>
      <path class="h-step-edge" d="M604 ${F - 94} H836 M462 ${F - 60} H624 M816 ${F - 60} H978"/>
      ${laurel(720, F - 40, 24, -1, 'h-laurel')}${laurel(720, F - 40, 24, 1, 'h-laurel')}
      <g class="h-stars">${petals}</g>
    </g>`;
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
      `M8 -89.5 Q-15 -92 -18 -76 ` +
      `L${f(-19 + sw * 0.4)} -56 L${f(-19 + sw * 0.9)} -40 ` +
      `Q${f(-12 + sw)} -38.5 ${f(-5 + sw * 0.8)} -40 ` +
      `L-3 -56 L-1 -57 Z`);
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
    a.dx = still ? dTarget
      : c.dogSpeed ? a.dx + Math.sign(dTarget - a.dx) * min(abs(dTarget - a.dx), c.dogSpeed * dt)   // a steady walk
      : a.dx + (dTarget - a.dx) * min(1, dt * 3.4);
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
  // Speech bubbles are switched off: the rooms speak through their links instead
  function say() {}
  function sayOld(who, text, ms = 2600) {
    const b = who.querySelector('.bubble'), tx = b.querySelector('text'), rect = b.querySelector('rect');
    tx.textContent = text;
    const w = max(44, tx.getComputedTextLength() + 26);
    rect.setAttribute('x', -w / 2); rect.setAttribute('width', w);
    b.classList.add('show');
    clearTimeout(b._t); b._t = setTimeout(() => b.classList.remove('show'), ms);
  }

  /* ---------- Outdoor landscape in layers (far → near), parallax by data-depth ---------- */
  const W = 1440;
  function landscape(seed, { trees = [], lamps = [], landmark = '', onPath = '', front = true, sky = '' } = {}) {
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
        [0, `<rect class="g-meadow2" x="-200" y="${G - 30}" width="${W + 400}" height="40"/>` + landmark + near + back + onPath +
          `<rect class="g-meadow" x="-200" y="${G + 10}" width="${W + 400}" height="400"/>` +
          `<path class="g-path" d="M-200 ${G - 8} Q360 ${G - 12} 720 ${G - 8} T1640 ${G - 8} V${G + 18} Q1080 ${G + 22} 720 ${G + 18} T-200 ${G + 18} Z"/>` +
          `<g class="pairs"></g>` + fore],
        ...(front ? [[-0.2, leafClump(-90, H + 40, 1.15, 1) + leafClump(1530, H + 40, 1.05, -1)]] : [])
      ]
    };
  }


  /* ---------- Hero: her room, a little playroom ---------- */
  // Drag her onto the bed to sleep or onto the chair to work, throw the ball for the poodle,
  // click the lamp for night mode; the laptop, trophy, diploma and phone link to sections.
  // the desk side sits SPREAD units further left and the bed side SPREAD units further right, so the room fills wide screens
  const SPREAD = 100, MID = -80;            // MID: the window, wall clock and dog bed in the middle
  const CHAIR = 300 - SPREAD, BED = [1004 + SPREAD, 1420 + SPREAD], DOG_BED = 884 + MID, BEANBAG = 1225;
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
      <g transform="translate(${MID} 0)">
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

      </g>
      <g transform="translate(${SPREAD} 0)">
      <!-- wall calendar with today's date; diploma above the bed -->
      <g ${obj("Today's date", 'data-act="calendar"', 'hr-hit hr-cal')}>
        <rect class="hr-cal-paper" x="1182" y="98" width="72" height="80" rx="5"/>
        <path class="hr-cal-top" d="M1182 115 V103 a5 5 0 0 1 5 -5 h62 a5 5 0 0 1 5 5 V115 Z"/>
        <circle class="hr-cal-ring" cx="1198" cy="98" r="3.5"/><circle class="hr-cal-ring" cx="1238" cy="98" r="3.5"/>
        <text class="hr-cal-month" x="1218" y="111" text-anchor="middle"></text>
        <text class="hr-cal-day" x="1218" y="152" text-anchor="middle"></text>
        <text class="hr-cal-wd" x="1218" y="168" text-anchor="middle"></text>
      </g>
      <g ${obj('Education', 'data-go="education"')}>
        <rect class="hr-frame" x="1080" y="114" width="64" height="48" rx="2"/><rect class="hr-paper" x="1085" y="119" width="54" height="38"/>
        <path class="hr-paper-line" d="M1094 128 h36 M1098 136 h28 M1101 144 h22"/><circle class="g-cert-seal" cx="1129" cy="151" r="4"/>
      </g>

      </g>
      <g transform="translate(${-SPREAD} 0)">
      <!-- desk corner -->
      <g class="hr-bin"><path d="M222 ${B} l-6 -40 h40 l-6 40 Z"/><circle class="hr-bin-face" cx="236" cy="${B - 22}" r="8"/><circle class="hr-bin-face" cx="230" cy="${B - 30}" r="3"/><circle class="hr-bin-face" cx="242" cy="${B - 30}" r="3"/></g>
      <rect class="hr-wood-d" x="320" y="${B - 58}" width="7" height="58"/>
      <rect class="hr-wood" x="404" y="${B - 58}" width="62" height="58" rx="2"/>
      <path class="hr-drawer" d="M408 ${B - 39} H462 M408 ${B - 20} H462"/><path class="hr-knob" d="M430 ${B - 49} h10 M430 ${B - 30} h10 M430 ${B - 11} h10"/>
      <rect class="hr-wood-l" x="306" y="${B - 66}" width="166" height="9" rx="2"/>
      <g ${obj('Projects', 'data-go="projects"')}>
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
      <g ${obj('Pick a book', 'data-act="book"')}>${books(496, 560, B - 112, 26, 14)}</g><g ${obj('About me', 'data-go="about"')}>${picture(566, B - 146, 28, 32)}</g>
      <g ${obj('Pick a book', 'data-act="book"')}>${books(496, 540, B - 58, 26, 14)}</g>
      <g ${obj('Boop the bunny', 'data-act="bunny"')}><ellipse class="hr-bunny" cx="560" cy="${B - 68}" rx="9" ry="11"/><ellipse class="hr-bunny" cx="555" cy="${B - 84}" rx="3" ry="8"/><ellipse class="hr-bunny" cx="565" cy="${B - 84}" rx="3" ry="8"/></g>
      <rect class="hr-box" x="574" y="${B - 82}" width="22" height="24" rx="2"/>
      <rect class="hr-box" x="498" y="${B - 34}" width="34" height="27" rx="2"/>
      <g class="hr-pad"><rect x="544" y="${B - 22}" width="34" height="15" rx="7"/><circle class="hr-pad-b" cx="552" cy="${B - 15}" r="2.2"/><circle class="hr-pad-b" cx="570" cy="${B - 15}" r="2.2"/></g>
      <g>
        <path class="h-gold" d="M572 ${B - 200} h26 q0 22 -13 24 q-13 -2 -13 -24 Z"/>
        <path class="h-handle" d="M572 ${B - 196} q-9 2 -5 10 q2 3 6 2 M598 ${B - 196} q9 2 5 10 q-2 3 -6 2"/>
        <rect class="h-gold" x="582" y="${B - 176}" width="6" height="5"/><rect class="h-gold" x="574" y="${B - 171}" width="22" height="5" rx="1.5"/>
      </g>
      ${books(500, 540, B - 168, 14, 6)}

      </g>
      <!-- dog bed on the floor -->
      <g ${obj('Nap time for the pup', 'data-act="dogbed"', 'hr-hit')}><ellipse class="hr-dogbed" cx="${DOG_BED}" cy="${B - 4}" rx="42" ry="12"/><ellipse class="hr-dogbed-in" cx="${DOG_BED}" cy="${B - 7}" rx="31" ry="6"/></g>

      <g transform="translate(${SPREAD} 0)">
      <!-- nightstand: lamp is the room's light switch (dark mode), real digital clock, phone -->
      <rect class="hr-wood" x="936" y="${B - 74}" width="62" height="74" rx="3"/>
      <rect class="hr-wood-l" x="932" y="${B - 78}" width="70" height="7" rx="2"/>
      <path class="hr-drawer" d="M940 ${B - 42} H994"/><path class="hr-knob" d="M962 ${B - 56} h10 M962 ${B - 24} h10"/>
      <g ${obj('Lights on / off', 'data-act="lamp"')}>
        <circle class="hr-lamp-glow" cx="950" cy="${B - 114}" r="42"/>
        <path class="hr-lamp-pole" d="M950 ${B - 78} V${B - 98} M942 ${B - 78} H958"/>
        <path class="hr-shade" d="M934 ${B - 98} L966 ${B - 98} L960 ${B - 124} L940 ${B - 124} Z"/>
      </g>
      <g ${obj('Contact', 'data-go="contact"')}>
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
      </g>
      `;
  }


  // Hover label: only for things that take you somewhere (white, with an arrow) and the light switch (a moon)
  const TIP_ARROW = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9"/></svg>';
  const TIP_MOON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/></svg>';
  function roomTips(svg, busy = () => false) {
    const tip = document.createElement('div');
    tip.className = 'room-tip';
    document.body.append(tip);
    svg.addEventListener('pointermove', e => {
      const t = e.target.closest('[data-go], [data-act="lamp"]');
      if (!t || busy()) { tip.classList.remove('on'); return; }
      const link = !!t.dataset.go;
      tip.innerHTML = link ? `<span>${t.dataset.tip}</span>${TIP_ARROW}` : TIP_MOON;
      tip.classList.toggle('icon', !link);
      tip.style.transform = `translate(${e.clientX + 14}px, ${e.clientY - 38}px)`;
      tip.classList.add('on');
    });
    svg.addEventListener('pointerleave', () => tip.classList.remove('on'));
  }
  // The living room: the same things react as in the bedroom (links, light switch, little wiggles)
  function roomPlay(svg) {
    const pop = (el, cls = 'pop') => { el.classList.remove(cls); el.getBoundingClientRect(); el.classList.add(cls); };
    const acts = {
      lamp: () => document.getElementById('themeToggle')?.click(),
      calendar: el => pop(el, 'flip'), mug: el => pop(el, 'puff'), bunny: el => pop(el, 'hop'),
      clock: el => pop(el), plant: el => pop(el), book: el => pop(el), trophy: el => pop(el), phone: el => pop(el)
    };
    svg.addEventListener('click', e => {
      const obj = e.target.closest('[data-go], [data-act]');
      if (!obj) return;
      if (obj.dataset.go) document.getElementById(obj.dataset.go)?.scrollIntoView({ behavior: still ? 'auto' : 'smooth' });
      else acts[obj.dataset.act]?.(obj);
    });
    svg.addEventListener('keydown', e => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const obj = e.target.closest('[data-act], [data-go]');
      if (obj) { e.preventDefault(); obj.dispatchEvent(new MouseEvent('click', { bubbles: true })); }
    });
    roomTips(svg);
  }

  function setupRoom(sc) {
    const a = sc.pairs[0], svg = sc.svg, c = a.cfg, sc_ = a.sc;
    const layer = svg.querySelector('.pairs');
    layer.insertAdjacentHTML('beforeend',
      `<g class="hr-ball" data-tip="Grab and throw the ball!" tabindex="0" role="button" aria-label="Throw the ball"><circle class="hr-ball-c" r="8"/><path class="hr-ball-s" d="M-8 -1 Q0 5 8 -1"/></g>` +
      `<g transform="translate(${SPREAD} 0)"><path class="hr-plaid hr-cover" d="M1134 ${G - 52} Q1128 ${G - 104} 1156 ${G - 112} H1444 V${G - 30} H1166 Q1138 ${G - 34} 1134 ${G - 52} Z"/>` +
      `<path class="hr-plaid-line hr-cover" d="M1150 ${G - 109} Q1142 ${G - 70} 1146 ${G - 36} M1196 ${G - 112} V${G - 30} M1240 ${G - 112} V${G - 30} M1284 ${G - 112} V${G - 30} M1328 ${G - 112} V${G - 30} M1150 ${G - 84} H1444 M1146 ${G - 60} H1444"/>` +
      `<g class="hr-zzz"><text x="1066" y="${G - 112}">z</text><text x="1078" y="${G - 128}">z</text><text x="1092" y="${G - 146}">Z</text></g></g>`);
    const ball = layer.querySelector('.hr-ball');
    const R = { state: c.mode === 'type' ? 'type' : 'idle', down: null, drag: null, fall: null, idle: 0, pending: null,
      ball: { x: 590, y: G - 8, st: 'rest', vx: 0, vy: 0, spin: 0, back: false, pick: 0, trail: [] } };
    const FLOOR = G - 8, DSC = sc_ * 0.88;
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
      wake(1190 + SPREAD); R.state = 'sleep'; c.mode = 'sleep';
      sc.el.classList.add('sleeping'); a.heroEl.classList.add('asleep'); settleDog();
      say(a.dogEl, '…zz', 1400);
    }
    // a click tosses it across the room; a drag lets you carry it, fling it or just set it down
    function launch(vx, vy) {
      const b = R.ball;
      Object.assign(b, { st: 'fly', vx, vy, back: false });
      c.dogSpeed = undefined;              // chase the ball at full speed; only the walk back is slow
      c.dogFace = undefined;
      if (Math.random() < 0.6) say(a.dogEl, 'Ball!!', 1100);
    }
    function throwBall() {
      const b = R.ball;
      if (b.st !== 'rest') return;
      launch((b.x < 700 ? 1 : -1) * (420 + Math.random() * 260), -620 - Math.random() * 120);
    }
    ball.addEventListener('pointerdown', e => {
      e.stopPropagation(); R.idle = 0;
      const b = R.ball, p = toSvg(e);
      ball.setPointerCapture(e.pointerId);
      R.ballDown = { x: e.clientX, y: e.clientY };
      b.st = 'held'; b.back = false; b.trail = [{ x: p.x, y: p.y, t: performance.now() }];
      c.dogX = a.dx; c.dogFace = undefined; c.dogSpeed = undefined;
      sc.el.classList.add('holding-ball');
    });
    ball.addEventListener('pointermove', e => {
      const b = R.ball;
      if (b.st !== 'held') return;
      const p = toSvg(e), now = performance.now();
      b.x = clamp(p.x, -40, 1500); b.y = clamp(p.y, -240, FLOOR);
      b.trail.push({ x: b.x, y: b.y, t: now });
      while (b.trail.length > 2 && now - b.trail[0].t > 90) b.trail.shift();
      c.dogFace = b.x > a.dx ? 1 : -1;
    });
    const release = e => {
      const b = R.ball;
      if (b.st !== 'held') return;
      sc.el.classList.remove('holding-ball');
      const moved = Math.hypot(e.clientX - R.ballDown.x, e.clientY - R.ballDown.y) > 6;
      if (!moved) { b.st = 'rest'; throwBall(); }
      else {
        const t0 = b.trail[0], t1 = b.trail[b.trail.length - 1], dt = max(16, t1.t - t0.t) / 1000;
        const sp = (v, m) => clamp(v, -m, m);
        launch(sp((t1.x - t0.x) / dt, 1800), sp((t1.y - t0.y) / dt, 1800));
      }
      R.ballDragged = true;
    };
    ball.addEventListener('pointerup', release);
    ball.addEventListener('pointercancel', release);
    // where the poodle has to stand so the ball ends up in its mouth
    const fetchFrom = x => x - 24 * DSC * (x >= a.dx ? 1 : -1);

    // a.onClick lets the room take over clicks on her (no jump while asleep or right after a drag)
    a.onClick = () => {
      if (R.dragged) { R.dragged = false; return false; }
      if (R.state === 'sleep') { wake(1000 + SPREAD); say(a.heroEl, 'Good morning! ☀', 1800); return false; }
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
      R.drag = { x: clamp(p.x, -40, W + 60), y: min(p.y, G - 40) };
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
      if (obj?.classList.contains('hr-ball')) { if (R.ballDragged) R.ballDragged = false; else throwBall(); return; }
      if (obj?.dataset.go) { document.getElementById(obj.dataset.go)?.scrollIntoView({ behavior: still ? 'auto' : 'smooth' }); return; }
      if (obj?.dataset.act) { ACTS[obj.dataset.act]?.(obj); return; }
      if (e.target.closest('.hero, .dog')) return;
      const pt = toSvg(e);
      if (pt.y < G - 60) return;
      if (R.state === 'sleep' || R.state === 'type') wake();
      c.wave = false;
      a.tx = clamp(pt.x, 40, 1460);
      sc.el.classList.add('walked');
    });
    svg.addEventListener('keydown', e => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const obj = e.target.closest('[data-act], [data-go], .hr-ball');
      if (obj) { e.preventDefault(); obj.dispatchEvent(new MouseEvent('click', { bubbles: true })); }
    });
    svg.addEventListener('pointerdown', () => { R.idle = 0; });

    roomTips(svg, () => R.state === 'drag');

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
      let s = Math.min(W / 1580, Hh / 860, (Hh - textBottom - 14) / (420 - 138), (Hh - nameBottom - 14) / (420 - 30));
      s = W < 700 ? 0.85 : Math.max(s, 0.6);
      const w = W / s, h = Hh / s;
      // on phones only part of the room fits: centre it on her desk, bookshelf and clock
      const cx = W < 700 ? 380 : 720;
      svg.setAttribute('viewBox', `${f(cx - w / 2)} ${f(420 - h)} ${f(w)} ${f(h)}`);
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
      trophy: el => pop(el),
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
      if (R.state === 'idle' && R.idle > 45 && !R.pending) { R.pending = 'sleep'; a.tx = 1000 + SPREAD; c.wave = false; }
      if (R.pending === 'sleep' && abs(a.x - 1000 - SPREAD) < 3) sleep();

      // ball: held, flying and bouncing, waiting for the poodle, carried back to her, dropped at her feet
      const b = R.ball;
      if (b.st === 'fly') {
        const h = min(dt, 0.04);
        b.vy += 1900 * h; b.x += b.vx * h; b.y += b.vy * h; b.spin += b.vx * h * 3;
        if (b.x < -40 || b.x > 1500) { b.x = clamp(b.x, -40, 1500); b.vx *= -0.6; }
        if (b.y < -240) { b.y = -240; b.vy = abs(b.vy) * 0.3; }
        if (b.y >= FLOOR) {
          b.y = FLOOR;
          if (b.vy > 140) { b.vy *= -0.45; b.vx *= 0.82; } else b.vy = 0;
          if (!b.vy) b.vx *= max(0, 1 - 3.5 * h);
        }
        if (!b.back) c.dogX = clamp(fetchFrom(b.x), -60, 1520);
        if (b.y >= FLOOR && !b.vy && abs(b.vx) < 18) {
          b.vx = 0;
          if (b.back) { b.st = 'rest'; setTimeout(settleDog, 900); }
          else { b.st = 'wait'; b.pick = c.dogX = clamp(fetchFrom(b.x), -60, 1520); }
        }
      } else if (b.st === 'wait') {
        if (abs(a.dx - b.pick) < 8) {
          b.st = 'carry';
          const side = a.dx < a.x ? -1 : 1;
          c.dogX = a.x + side * (R.state === 'sleep' ? 70 : 52); c.dogFace = -side; c.dogSpeed = 120;
        }
      } else if (b.st === 'carry') {
        b.x = a.dx + 24 * DSC * a.dDir; b.y = G - 22 * DSC;
        if (abs(a.dx - c.dogX) < 6) {
          // drop it in front of her with a little bounce
          Object.assign(b, { st: 'fly', back: true, vx: a.dDir * 28, vy: -120 });
          say(a.dogEl, 'Woof! Again?', 1500);
        }
      }
      ball.setAttribute('transform', `translate(${f(b.x)} ${f(b.y)}) rotate(${f(b.spin % 360)})`);

      stepPair(a, dt, t, 0);

      if (R.state === 'sleep') {
        a.heroEl.classList.remove('facing');
        a.flip.setAttribute('transform', 'scale(1 1)');
        poseHero(a, 0, 0, 0, t * 0.4);
        a.heroEl.setAttribute('transform', `translate(${1210 + SPREAD} ${G - 86}) rotate(-90) scale(${sc_})`);
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

  /* ---------- Projects TV room: she and the poodle watch my projects on TV ---------- */
  // Scene units: x 0–1440, y -140–420 (floor at G). The TV screen itself is HTML laid over x 846–1274, y 32–270.
  function tvRoom() {
    const B = G;
    let planks = '';
    for (let x = 0; x < 1460; x += 70) planks += `M${x} ${B} v80 `;
    const frame = (x, y, art) => `<rect class="hr-frame" x="${x - 30}" y="${y - 24}" width="60" height="48" rx="2"/><rect class="r-canvas" x="${x - 25}" y="${y - 19}" width="50" height="38"/><g transform="translate(${x} ${y}) scale(.85)">${art}</g>`;
    const bulbs = Array.from({ length: 16 }, (_, i) => `<circle class="tvr-bulb" cx="${40 + i * 88}" cy="${f(-92 + Math.sin(i * 1.2) * 6 + (i % 2) * 8)}" r="5" style="animation-delay:${-i * 0.3}s"/>`).join('');
    const pot = (x, y, w, h) => `<path class="hr-pot" d="M${f(x - w / 2)} ${f(y - h)} h${w} l${f(-w * 0.12)} ${h} h${f(-w * 0.76)} Z"/>`;
    const plant = (x, y, s) => pot(x, y, 26 * s, 22 * s) + [-58, -32, -10, 12, 34, 58].map((a, i) =>
      `<ellipse class="hr-leaf${i % 2 ? '2' : ''}" cx="${x}" cy="${f(y - 22 * s - 16 * s)}" rx="${f(6 * s)}" ry="${f(19 * s)}" transform="rotate(${a} ${x} ${f(y - 22 * s)})"/>`).join('');
    return `
      <rect class="r-wall" x="0" y="-140" width="1440" height="${B + 140}"/>
      <rect class="r-floor" x="0" y="${B}" width="1440" height="80"/>
      <path class="r-plank" d="${planks}"/>
      <rect class="r-skirting" x="0" y="${B - 7}" width="1440" height="7"/>
      <path class="tvr-string" d="M0 -98 Q90 -78 180 -92 T360 -90 T540 -92 T720 -90 T900 -92 T1080 -90 T1260 -92 T1440 -96"/>
      ${bulbs}
      <ellipse class="tvr-wallglow" cx="1060" cy="150" rx="330" ry="210"/>
      ${frame(330, 150, ART_SHIP)}${frame(420, 140, ART_PHONE)}${frame(510, 150, ART_TOMATO)}
      <circle class="hr-lamp-glow" cx="120" cy="170" r="70"/>
      <path class="hr-lamp-pole" d="M120 ${B} V196 M100 ${B} H140"/><path class="hr-shade" d="M92 196 H148 L138 150 H102 Z"/>
      <ellipse class="hr-rug" cx="640" cy="${B + 26}" rx="380" ry="30"/><ellipse class="hr-rug2" cx="640" cy="${B + 26}" rx="320" ry="20"/>
      <ellipse class="tvr-floorglow" cx="1000" cy="${B + 20}" rx="300" ry="34"/>
      <!-- sofa -->
      <rect class="tvr-sofa-d" x="236" y="232" width="368" height="80" rx="28"/>
      <rect class="tvr-sofa" x="230" y="292" width="380" height="40" rx="14"/>
      <rect class="tvr-sofa-d" x="214" y="266" width="48" height="76" rx="20"/><rect class="tvr-sofa-d" x="578" y="266" width="48" height="76" rx="20"/>
      <rect class="hr-wood-d" x="246" y="${B - 12}" width="8" height="12"/><rect class="hr-wood-d" x="586" y="${B - 12}" width="8" height="12"/>
      <rect class="tvr-cushion" x="262" y="250" width="46" height="44" rx="14" transform="rotate(-8 285 272)"/>
      <path class="hr-plaid" d="M500 244 h70 v80 l-10 10 -10 -8 -10 8 -10 -8 -10 8 -10 -8 -10 8 Z"/>
      <path class="hr-plaid-line" d="M500 270 h70 M500 296 h70 M523 244 v84 M546 244 v84"/>
      <!-- side table with popcorn, plant -->
      <rect class="hr-wood" x="660" y="290" width="70" height="62" rx="3"/><rect class="hr-wood-l" x="654" y="284" width="82" height="8" rx="2"/>
      <path class="tvr-bowl" d="M674 284 h42 q-3 -20 -21 -20 q-18 0 -21 20 Z"/>
      <circle class="tvr-corn" cx="684" cy="266" r="6"/><circle class="tvr-corn" cx="695" cy="260" r="7"/><circle class="tvr-corn" cx="707" cy="266" r="6"/>
      ${plant(1370, B, 1.5)}
      <!-- TV and stand (the screen is HTML on top) -->
      <rect class="tvr-bezel" x="830" y="18" width="460" height="266" rx="14"/>
      <rect class="tvr-neck" x="1040" y="282" width="40" height="10"/>
      <rect class="hr-wood" x="800" y="290" width="520" height="62" rx="4"/>
      <rect class="hr-wood-l" x="794" y="284" width="532" height="9" rx="3"/>
      <path class="hr-drawer" d="M974 296 V348 M1146 296 V348"/><path class="hr-knob" d="M880 320 h14 M1052 320 h14 M1224 320 h14"/>
      <rect class="tvr-speaker" x="796" y="214" width="26" height="70" rx="5"/><rect class="tvr-speaker" x="1298" y="214" width="26" height="70" rx="5"/>
      <circle class="tvr-cone" cx="809" cy="240" r="7"/><circle class="tvr-cone" cx="1311" cy="240" r="7"/>`;
  }

  // Full-screen TV room background (the TV, cabinet and sofa are drawn by HTML/SVG on top)
  function tvRoomBg() {
    const B = 640;
    let planks = '';
    for (let x = 0; x < 1460; x += 80) planks += `M${x} ${B} v160 `;
    const bulbs = Array.from({ length: 18 }, (_, i) => `<circle class="tvr-bulb" cx="${30 + i * 80}" cy="${f(58 + Math.sin(i * 1.2) * 7 + (i % 2) * 9)}" r="5.5" style="animation-delay:${-i * 0.3}s"/>`).join('');
    const pot = (x, y, w2, h2) => `<path class="hr-pot" d="M${f(x - w2 / 2)} ${f(y - h2)} h${w2} l${f(-w2 * 0.12)} ${h2} h${f(-w2 * 0.76)} Z"/>`;
    const plant = (x, y, s) => pot(x, y, 34 * s, 28 * s) + [-60, -36, -14, 10, 32, 58].map((ang, i) =>
      `<ellipse class="hr-leaf${i % 2 ? '2' : ''}" cx="${x}" cy="${f(y - 28 * s - 22 * s)}" rx="${f(8 * s)}" ry="${f(26 * s)}" transform="rotate(${ang} ${x} ${f(y - 28 * s)})"/>`).join('');
    return `<rect class="r-wall" width="1440" height="${B}"/><rect class="r-floor" y="${B}" width="1440" height="160"/>
      <path class="r-plank" d="${planks}"/><rect class="r-skirting" y="${B - 8}" width="1440" height="8"/>
      <path class="tvr-string" d="M0 52 Q120 82 240 62 T480 64 T720 62 T960 64 T1200 62 T1440 56"/>${bulbs}
      <ellipse class="tvr-wallglow" cx="720" cy="330" rx="560" ry="300"/>
      <g class="tv-lamp" role="button" tabindex="0" aria-label="Lamp: switch the lights (dark mode)">
        <circle class="hr-lamp-glow tv-lamp-glow" cx="170" cy="330" r="110"/>
        <path class="hr-lamp-pole" d="M170 ${B} V352 M134 ${B} H206"/>
        <path class="hr-shade" d="M122 352 H218 L200 276 H140 Z"/>
        <path class="tv-lamp-cord" d="M190 352 V392"/><circle class="tv-lamp-knob" cx="190" cy="396" r="5"/>
        <rect x="110" y="260" width="120" height="${B - 250}" fill="transparent"/>
      </g>
      ${plant(1330, B, 2.2)}${plant(70, B, 1.4)}
      <ellipse class="hr-rug" cx="720" cy="${B + 70}" rx="620" ry="56"/><ellipse class="hr-rug2" cx="720" cy="${B + 70}" rx="520" ry="38"/>
      <ellipse class="tvr-floorglow" cx="720" cy="${B + 30}" rx="460" ry="50"/>`;
  }

  /* ---------- The scenes between sections ---------- */
  const SCENES = {
    tvroom: () => ({ viewBox: '0 0 1440 800', layers: [[0, tvRoomBg()]] }),
    // Home: her room, where you can play with her and the poodle
    hero: () => ({
      viewBox: '40 -300 1360 720', room: true,
      layers: [[0, heroRoom() + '<g class="pairs"></g>']],
      pairs: [{ x: 300 - SPREAD, y: G, scale: 1.3, mode: 'type' }]
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
      fit: true,
      ...landscape(2, { landmark: school('karangturi', karangturi(300), 300, G - 222, 'SMA Karangturi', 'High school · Semarang, Indonesia') +
        school('xmum', campus(930), 930, G - 252, 'Xiamen University Malaysia', 'Digital Media Technology · Class of 2027'), lamps: [560] }),
      pairs: [{ x: 300, y: G, leash: true, mode: 'walk', path: [300, 700, 0.15, 0.65] }]
    }),
    // Awards: the grand hall behind the list, holding her certificate on the podium
    hall: () => ({
      viewBox: `0 -400 ${W} 1020`,
      layers: [[0, `${hallSVG()}<g class="pairs"></g>`]],
      pairs: [{ x: 706, y: 464, scale: 1.55, mode: 'hold', dogX: 770, dogFace: -1 }]
    }),
    // Before Awards: she stands on the winners' podium with her trophy, the poodle right beside her
    podium: () => ({
      ...awardStage(),
      pairs: [{ x: 704, y: G - 68, scale: 1.15, mode: 'hold', dogX: 748, dogFace: -1 }]
    }),
    // Contact: home, sitting on the sofa; the poodle sits on the rug
    livingroom: () => ({
      ...livingRoom(),
      pairs: [{ x: 688, y: G + 2, scale: 1.3, mode: 'sit', dogX: 850, dogFace: -1 }]
    }),
    // Contact: walking the poodle to the post box on a little town street
    street: () => ({
      ...townStreet(),
      pairs: [{ x: 300, y: G - 8, leash: true, mode: 'walk', path: [240, 880, 0.05, 0.7] }]
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
    if (def.live) { liveRoom(el, svg); roomPlay(svg); }
    if (def.live || def.fit) fitScene(el, svg);
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
      if (!sc.on && sc.placed) continue;             // off-screen scenes still get placed once
      sc.placed = true;
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

  // Changing TV channel: she comments, the poodle hops
  document.addEventListener('tvchannel', e => {
    const tv = scenes.find(s => s.el.dataset.scene === 'tvroom');
    const a = tv?.pairs[0];
    if (!a) return;
    say(a.heroEl, e.detail.line, 1800);
    if (a.hop < 0) a.hop = 0;
  });

  // Say hello once the page has loaded
  setTimeout(() => { const h = scenes.find(s => s.el.dataset.scene === 'hero'); if (h?.pairs[0]) say(h.pairs[0].heroEl, 'Hi, welcome! ☺'); }, 1200);
})();
