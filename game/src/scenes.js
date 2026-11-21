// Twin Lanterns — the three scenes. Every scene is drawn twice, once per
// panel, from the same precomputed random values: variant 0 is the left
// picture, variant 1 the right picture, and the only thing that changes
// between them is the scene's seven deliberate differences. All art is
// original vector drawing on canvas — no image files, no copied art.
//
// A difference is { id, label, x, y, r }: the label is shown on the
// round-clear screen, and (x, y, r) is the hit circle in panel pixels.

import { makeRng, range } from './random.js';

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function circle(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
}

function star4(ctx, x, y, r) {
  ctx.beginPath();
  ctx.moveTo(x, y - r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.quadraticCurveTo(x, y, x, y + r);
  ctx.quadraticCurveTo(x, y, x - r, y);
  ctx.quadraticCurveTo(x, y, x, y - r);
  ctx.closePath();
}

function lantern(ctx, x, y, r, color, glow) {
  if (glow) {
    const g = ctx.createRadialGradient(x, y, r * 0.2, x, y, r * 2.4);
    g.addColorStop(0, glow);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    circle(ctx, x, y, r * 2.4);
    ctx.fill();
  }
  ctx.fillStyle = '#3a2a18';
  ctx.fillRect(x - r * 0.28, y - r - 5, r * 0.56, 5);
  ctx.fillRect(x - r * 0.28, y + r, r * 0.56, 5);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, r, r * 1.18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.35)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(x, y, r * 0.55, r * 1.18, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = '#ffe9a8';
  ctx.fillRect(x - 1.5, y - r * 0.7, 3, r * 1.4);
}

// ---------------------------------------------------------------------------
// Scene 1 — Lantern Market, dusk at the old market square.
// ---------------------------------------------------------------------------

const MARKET_DIFFS = [
  { id: 'moon', label: 'The moon turned full', x: 505, y: 62, r: 30 },
  { id: 'cat', label: 'The market cat wandered off', x: 300, y: 330, r: 28 },
  { id: 'lantern', label: 'A lantern changed colour', x: 180, y: 69, r: 20 },
  { id: 'orange', label: 'An orange went missing', x: 108, y: 254, r: 16 },
  { id: 'bloom', label: 'A flower lost a bloom', x: 464, y: 244, r: 16 },
  { id: 'awning', label: 'The awning stripe changed colour', x: 135, y: 233, r: 20 },
  { id: 'bird', label: 'A bird flew into the sky', x: 92, y: 92, r: 20 },
];

function paintMarket(ctx, w, h, variant) {
  const rng = makeRng(101);
  const stars = [];
  for (let i = 0; i < 26; i += 1) {
    stars.push({ x: range(rng, 8, w - 8), y: range(rng, 8, 150), r: range(rng, 1, 2.6) });
  }
  const cobbles = [];
  for (let i = 0; i < 46; i += 1) {
    cobbles.push({ x: range(rng, 0, w), y: range(rng, 246, h - 8), r: range(rng, 5, 11) });
  }

  // Dusk sky.
  const sky = ctx.createLinearGradient(0, 0, 0, 240);
  sky.addColorStop(0, '#2b2350');
  sky.addColorStop(0.55, '#7a4a7e');
  sky.addColorStop(1, '#e08a4e');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, 240);

  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  stars.forEach((s) => { star4(ctx, s.x, s.y, s.r); ctx.fill(); });

  // Moon: crescent on the left picture, full on the right.
  ctx.fillStyle = '#ffeec2';
  circle(ctx, 505, 62, 26);
  ctx.fill();
  if (variant === 0) {
    ctx.fillStyle = '#7a4a7e';
    circle(ctx, 516, 56, 22);
    ctx.fill();
  }
  ctx.fillStyle = 'rgba(255,238,194,0.25)';
  circle(ctx, 505, 62, 34);
  ctx.fill();

  // A bird only visits the right picture.
  if (variant === 1) {
    ctx.strokeStyle = '#241a33';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(80, 92);
    ctx.quadraticCurveTo(88, 84, 96, 92);
    ctx.quadraticCurveTo(100, 84, 108, 92);
    ctx.stroke();
  }

  // Rooftops silhouette.
  ctx.fillStyle = '#33254a';
  ctx.beginPath();
  ctx.moveTo(0, 240);
  ctx.lineTo(0, 196);
  ctx.lineTo(70, 196);
  ctx.lineTo(110, 168);
  ctx.lineTo(150, 196);
  ctx.lineTo(240, 196);
  ctx.lineTo(280, 176);
  ctx.lineTo(320, 196);
  ctx.lineTo(420, 196);
  ctx.lineTo(460, 170);
  ctx.lineTo(500, 196);
  ctx.lineTo(w, 196);
  ctx.lineTo(w, 240);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#ffd34d';
  [[52, 210], [300, 206], [470, 208]].forEach(([x, y]) => ctx.fillRect(x, y, 9, 11));

  // Lantern string across the top.
  ctx.strokeStyle = '#241a33';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 34);
  ctx.quadraticCurveTo(w / 2, 78, w, 34);
  ctx.stroke();
  const lanternXs = [60, 120, 180, 250, 330, 410, 480, 550];
  lanternXs.forEach((x, i) => {
    const y = 34 + Math.sin((x / w) * Math.PI) * 34;
    const color = (i === 2 && variant === 1) ? '#2ec4b6' : '#e8483f';
    lantern(ctx, x, y + 8, 13, color, 'rgba(255,190,80,0.35)');
  });

  // Cobblestone ground.
  ctx.fillStyle = '#4a3a52';
  ctx.fillRect(0, 240, w, h - 240);
  ctx.fillStyle = 'rgba(255,255,255,0.10)';
  cobbles.forEach((c) => { ctx.beginPath(); ctx.ellipse(c.x, c.y, c.r, c.r * 0.55, 0, 0, Math.PI * 2); ctx.fill(); });

  // Left stall: fruit, striped awning.
  ctx.fillStyle = '#5d3a24';
  ctx.fillRect(52, 268, 196, 12);
  ctx.fillStyle = '#7c4a2d';
  ctx.fillRect(60, 280, 10, 84);
  ctx.fillRect(230, 280, 10, 84);
  ctx.fillStyle = '#8a5a34';
  ctx.fillRect(52, 268, 196, 6);
  for (let i = 0; i < 6; i += 1) {
    ctx.fillStyle = i % 2 === 0 ? '#e8483f' : '#f4f1e6';
    ctx.fillRect(52 + i * 33, 216, 33, 34);
  }
  // The middle awning stripe changes colour on the right picture.
  ctx.fillStyle = variant === 1 ? '#2e9e6b' : '#e8483f';
  ctx.fillRect(52 + 2 * 33, 216, 33, 34);
  ctx.strokeStyle = '#3a2415';
  ctx.lineWidth = 2;
  ctx.strokeRect(52, 216, 196, 34);
  // Fruit pile on the counter: an orange goes missing on the right picture.
  const fruits = [
    [84, 258, '#ff7a2f'], [108, 254, '#ff7a2f'], [132, 258, '#e8483f'],
    [156, 254, '#e8483f'], [180, 258, '#ff7a2f'], [204, 254, '#ffd34d'],
    [96, 268, '#e8483f'], [120, 268, '#ff7a2f'], [144, 268, '#e8483f'],
    [168, 268, '#ffd34d'], [192, 268, '#e8483f'],
  ];
  fruits.forEach(([x, y, c], i) => {
    if (variant === 1 && i === 1) return; // the missing orange
    ctx.fillStyle = c;
    circle(ctx, x, y, 9);
    ctx.fill();
  });

  // Right stall: flowers.
  ctx.fillStyle = '#2d4a2d';
  ctx.fillRect(360, 268, 196, 12);
  ctx.fillStyle = '#3d5a34';
  ctx.fillRect(368, 280, 10, 84);
  ctx.fillRect(538, 280, 10, 84);
  ctx.fillStyle = '#f4e3c2';
  ctx.fillRect(360, 216, 196, 52);
  ctx.strokeStyle = '#2d4a2d';
  ctx.lineWidth = 2;
  ctx.strokeRect(360, 216, 196, 52);
  const blooms = [
    [392, 244, '#ff6fa5'], [428, 238, '#ffd34d'], [464, 244, '#ff6fa5'],
    [500, 238, '#b388ff'], [532, 244, '#ffd34d'],
  ];
  blooms.forEach(([x, y, c], i) => {
    if (variant === 1 && i === 2) return; // the lost bloom
    ctx.strokeStyle = '#2e7d4f';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x, 268);
    ctx.lineTo(x, y + 8);
    ctx.stroke();
    ctx.fillStyle = c;
    for (let p = 0; p < 5; p += 1) {
      const a = (p / 5) * Math.PI * 2;
      circle(ctx, x + Math.cos(a) * 8, y + Math.sin(a) * 8, 6);
      ctx.fill();
    }
    ctx.fillStyle = '#fff3c4';
    circle(ctx, x, y, 5);
    ctx.fill();
  });

  // The market cat sits between the stalls — only on the left picture.
  if (variant === 0) {
    ctx.fillStyle = '#2b2b33';
    ctx.beginPath();
    ctx.ellipse(300, 336, 24, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    circle(ctx, 300, 312, 13);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(290, 302);
    ctx.lineTo(293, 288);
    ctx.lineTo(298, 301);
    ctx.moveTo(304, 301);
    ctx.lineTo(309, 288);
    ctx.lineTo(312, 302);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#ffd34d';
    circle(ctx, 295, 310, 2);
    ctx.fill();
    circle(ctx, 305, 310, 2);
    ctx.fill();
    ctx.strokeStyle = '#2b2b33';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(322, 340);
    ctx.quadraticCurveTo(338, 330, 332, 314);
    ctx.stroke();
  }
}

// ---------------------------------------------------------------------------
// Scene 2 — Moonlit Koi Pond, a quiet garden after dark.
// ---------------------------------------------------------------------------

const POND_DIFFS = [
  { id: 'koi', label: 'A fourth koi swam in', x: 400, y: 322, r: 22 },
  { id: 'pagoda', label: 'The pagoda window went dark', x: 495, y: 130, r: 16 },
  { id: 'lily', label: 'A lily flower closed up', x: 200, y: 300, r: 18 },
  { id: 'willow', label: 'The willow grew a branch', x: 150, y: 150, r: 22 },
  { id: 'flame', label: 'The stone lantern burned blue', x: 330, y: 232, r: 16 },
  { id: 'firefly', label: 'A firefly joined the dance', x: 250, y: 100, r: 16 },
  { id: 'reflection', label: 'The moon lost its reflection', x: 90, y: 300, r: 24 },
];

function koi(ctx, x, y, dir, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(dir, 1);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(0, 0, 20, 9, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-18, 0);
  ctx.lineTo(-30, -9);
  ctx.lineTo(-30, 9);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  circle(ctx, 10, -3, 2.5);
  ctx.fill();
  ctx.fillStyle = '#1d2f45';
  circle(ctx, 11, -3, 1.4);
  ctx.fill();
  ctx.restore();
}

function paintPond(ctx, w, h, variant) {
  const rng = makeRng(202);
  const stars = [];
  for (let i = 0; i < 30; i += 1) {
    stars.push({ x: range(rng, 8, w - 8), y: range(rng, 8, 130), r: range(rng, 0.8, 2.4) });
  }
  const fireflies = [];
  for (let i = 0; i < 9; i += 1) {
    fireflies.push({ x: range(rng, 40, 400), y: range(rng, 60, 190), r: range(rng, 2, 3.4) });
  }
  const ripples = [];
  for (let i = 0; i < 12; i += 1) {
    ripples.push({ x: range(rng, 30, w - 30), y: range(rng, 250, h - 20), rx: range(rng, 18, 46) });
  }

  // Night sky.
  const sky = ctx.createLinearGradient(0, 0, 0, 220);
  sky.addColorStop(0, '#0d1b33');
  sky.addColorStop(1, '#274b63');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, 220);
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  stars.forEach((s) => { star4(ctx, s.x, s.y, s.r); ctx.fill(); });

  // Moon.
  ctx.fillStyle = '#f2ead0';
  circle(ctx, 90, 56, 24);
  ctx.fill();
  ctx.fillStyle = 'rgba(242,234,208,0.22)';
  circle(ctx, 90, 56, 33);
  ctx.fill();

  // Fireflies, plus one extra on the right picture.
  fireflies.forEach((f) => {
    ctx.fillStyle = 'rgba(190,255,120,0.35)';
    circle(ctx, f.x, f.y, f.r * 3);
    ctx.fill();
    ctx.fillStyle = '#c8ff7a';
    circle(ctx, f.x, f.y, f.r);
    ctx.fill();
  });
  if (variant === 1) {
    ctx.fillStyle = 'rgba(190,255,120,0.35)';
    circle(ctx, 250, 100, 10);
    ctx.fill();
    ctx.fillStyle = '#c8ff7a';
    circle(ctx, 250, 100, 3);
    ctx.fill();
  }

  // Willow on the left, drooping branches.
  ctx.strokeStyle = '#1e3a24';
  ctx.lineWidth = 9;
  ctx.beginPath();
  ctx.moveTo(28, 220);
  ctx.quadraticCurveTo(60, 120, 120, 84);
  ctx.stroke();
  ctx.lineWidth = 3;
  const branches = [[70, 108], [100, 96], [130, 92], [150, 100]];
  branches.forEach(([x, y]) => {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + 8, y + 42, x + 2, y + 84);
    ctx.stroke();
  });
  // The willow grows one more branch on the right picture.
  if (variant === 1) {
    ctx.beginPath();
    ctx.moveTo(150, 100);
    ctx.quadraticCurveTo(160, 140, 152, 190);
    ctx.stroke();
  }
  ctx.fillStyle = 'rgba(74,140,74,0.85)';
  for (let i = 0; i < 26; i += 1) {
    const t = i / 26;
    circle(ctx, 60 + t * 120, 92 + Math.sin(t * 5) * 8 + range(rng, -6, 14), range(rng, 3, 6));
    ctx.fill();
  }

  // Pagoda on the right.
  ctx.fillStyle = '#7a2e2e';
  ctx.fillRect(452, 96, 96, 12);
  ctx.fillRect(446, 140, 108, 12);
  ctx.fillRect(440, 184, 120, 12);
  ctx.fillStyle = '#5d3a24';
  ctx.fillRect(466, 108, 68, 32);
  ctx.fillRect(460, 152, 80, 32);
  ctx.fillRect(454, 196, 92, 34);
  ctx.fillStyle = '#3a2415';
  ctx.fillRect(488, 60, 24, 36);
  ctx.fillStyle = '#c98a3a';
  ctx.beginPath();
  ctx.moveTo(482, 60);
  ctx.lineTo(518, 60);
  ctx.lineTo(500, 44);
  ctx.closePath();
  ctx.fill();
  // Pagoda window: warm and lit on the left, dark on the right.
  ctx.fillStyle = variant === 0 ? '#ffd34d' : '#1d2f45';
  ctx.fillRect(488, 118, 24, 20);
  ctx.fillStyle = '#1d2f45';
  ctx.fillRect(488, 164, 24, 20);

  // Pond.
  const pond = ctx.createLinearGradient(0, 220, 0, h);
  pond.addColorStop(0, '#16425e');
  pond.addColorStop(1, '#0a2438');
  ctx.fillStyle = pond;
  ctx.fillRect(0, 220, w, h - 220);
  ctx.strokeStyle = 'rgba(140,220,255,0.35)';
  ctx.lineWidth = 2;
  ripples.forEach((r) => {
    ctx.beginPath();
    ctx.ellipse(r.x, r.y, r.rx, r.rx * 0.28, 0, 0, Math.PI * 2);
    ctx.stroke();
  });
  // The moon's reflection shimmers only on the left picture.
  if (variant === 0) {
    ctx.fillStyle = 'rgba(242,234,208,0.4)';
    for (let i = 0; i < 5; i += 1) {
      ctx.fillRect(78 + i * 3, 268 + i * 14, 26 - i * 3, 5);
    }
  }

  // Lily pads and one flower.
  const pads = [[140, 300], [200, 296], [260, 316], [330, 300], [470, 320], [540, 296]];
  ctx.fillStyle = '#2e7d4f';
  pads.forEach(([x, y]) => {
    ctx.beginPath();
    ctx.ellipse(x, y, 26, 11, 0, 0, Math.PI * 2);
    ctx.fill();
  });
  if (variant === 0) {
    ctx.fillStyle = '#ff9ecf';
    for (let p = 0; p < 6; p += 1) {
      const a = (p / 6) * Math.PI * 2;
      circle(ctx, 200 + Math.cos(a) * 9, 292 + Math.sin(a) * 6, 6);
      ctx.fill();
    }
    ctx.fillStyle = '#fff3c4';
    circle(ctx, 200, 292, 4);
    ctx.fill();
  }

  // Koi, plus a fourth on the right picture.
  koi(ctx, 120, 340, 1, '#ff7a3c');
  koi(ctx, 250, 350, -1, '#f4f1e6');
  koi(ctx, 320, 330, 1, '#ff5a5a');
  if (variant === 1) koi(ctx, 400, 322, -1, '#ffb03c');

  // Stone lantern on the bank.
  ctx.fillStyle = '#8a8f96';
  ctx.fillRect(322, 246, 16, 26);
  ctx.fillRect(312, 240, 36, 8);
  ctx.fillRect(316, 218, 28, 22);
  ctx.beginPath();
  ctx.moveTo(310, 218);
  ctx.lineTo(344, 218);
  ctx.lineTo(330, 204);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = variant === 0 ? '#ffb03c' : '#7ee7ff';
  circle(ctx, 330, 232, 6);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,176,60,0.3)';
  if (variant === 0) {
    circle(ctx, 330, 232, 14);
    ctx.fill();
  }
}

// ---------------------------------------------------------------------------
// Scene 3 — Snowy Lighthouse Cove, a cold bright morning by the sea.
// ---------------------------------------------------------------------------

const COVE_DIFFS = [
  { id: 'beam', label: 'The lighthouse beam went out', x: 260, y: 105, r: 28 },
  { id: 'boat', label: 'A third boat sailed in', x: 350, y: 250, r: 24 },
  { id: 'gull', label: 'A gull joined the flock', x: 300, y: 60, r: 18 },
  { id: 'cabin', label: 'The cabin window went dark', x: 508, y: 248, r: 16 },
  { id: 'pine', label: 'A pine tree vanished', x: 560, y: 198, r: 22 },
  { id: 'snowman', label: 'A snowman appeared', x: 400, y: 300, r: 22 },
  { id: 'flag', label: 'The lighthouse flag changed colour', x: 112, y: 32, r: 16 },
];

function boat(ctx, x, y, scale, hull, sail) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = sail;
  ctx.beginPath();
  ctx.moveTo(0, -26);
  ctx.lineTo(0, 2);
  ctx.lineTo(20, 2);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = hull;
  ctx.beginPath();
  ctx.moveTo(-24, 2);
  ctx.lineTo(26, 2);
  ctx.lineTo(18, 12);
  ctx.lineTo(-16, 12);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#3a2a18';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, -28);
  ctx.lineTo(0, 2);
  ctx.stroke();
  ctx.restore();
}

function gull(ctx, x, y, s) {
  ctx.strokeStyle = '#2b2b33';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - 10 * s, y);
  ctx.quadraticCurveTo(x - 4 * s, y - 7 * s, x, y);
  ctx.quadraticCurveTo(x + 4 * s, y - 7 * s, x + 10 * s, y);
  ctx.stroke();
}

function pine(ctx, x, y, s) {
  ctx.fillStyle = '#2e5d3a';
  [[0, -34, 26], [0, -16, 34], [0, 4, 42]].forEach(([dx, dy, w2]) => {
    ctx.beginPath();
    ctx.moveTo(x + dx, y + dy - 18);
    ctx.lineTo(x + dx - w2 / 2, y + dy + 12);
    ctx.lineTo(x + dx + w2 / 2, y + dy + 12);
    ctx.closePath();
    ctx.fill();
  });
  ctx.fillStyle = '#5d3a24';
  ctx.fillRect(x - 4, y + 12, 8, 12);
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.beginPath();
  ctx.moveTo(x, y - 52);
  ctx.lineTo(x - 13, y - 22);
  ctx.lineTo(x + 13, y - 22);
  ctx.closePath();
  ctx.fill();
}

function paintCove(ctx, w, h, variant) {
  const rng = makeRng(303);
  const flakes = [];
  for (let i = 0; i < 40; i += 1) {
    flakes.push({ x: range(rng, 0, w), y: range(rng, 0, 170), r: range(rng, 1, 3) });
  }
  const waves = [];
  for (let i = 0; i < 10; i += 1) {
    waves.push({ x: range(rng, 20, w - 20), y: range(rng, 200, 300), rx: range(rng, 20, 50) });
  }

  // Pale morning sky.
  const sky = ctx.createLinearGradient(0, 0, 0, 180);
  sky.addColorStop(0, '#bcd8ea');
  sky.addColorStop(1, '#e8f1f6');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, 180);
  ctx.fillStyle = '#fff3c4';
  circle(ctx, 520, 56, 26);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,243,196,0.4)';
  circle(ctx, 520, 56, 36);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  flakes.forEach((f) => { circle(ctx, f.x, f.y, f.r); ctx.fill(); });

  // Gulls, plus one extra on the right picture.
  gull(ctx, 220, 52, 1);
  gull(ctx, 260, 74, 0.9);
  gull(ctx, 340, 44, 1.1);
  if (variant === 1) gull(ctx, 300, 60, 1);

  // Sea.
  const sea = ctx.createLinearGradient(0, 170, 0, 310);
  sea.addColorStop(0, '#3f7ea6');
  sea.addColorStop(1, '#20506e');
  ctx.fillStyle = sea;
  ctx.fillRect(0, 170, w, 140);
  ctx.strokeStyle = 'rgba(255,255,255,0.4)';
  ctx.lineWidth = 2;
  waves.forEach((v) => {
    ctx.beginPath();
    ctx.ellipse(v.x, v.y, v.rx, v.rx * 0.2, 0, 0, Math.PI * 2);
    ctx.stroke();
  });

  // Snowy shore.
  ctx.fillStyle = '#eef4f8';
  ctx.beginPath();
  ctx.moveTo(0, 310);
  ctx.quadraticCurveTo(180, 292, 360, 310);
  ctx.quadraticCurveTo(500, 326, w, 306);
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fill();

  // Lighthouse on the left cliff.
  ctx.fillStyle = '#dfe6ea';
  ctx.beginPath();
  ctx.moveTo(0, 310);
  ctx.lineTo(0, 210);
  ctx.lineTo(60, 210);
  ctx.lineTo(60, 310);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#f4f1e6';
  ctx.beginPath();
  ctx.moveTo(78, 236);
  ctx.lineTo(86, 84);
  ctx.lineTo(122, 84);
  ctx.lineTo(130, 236);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#c0392b';
  ctx.fillRect(82, 150, 44, 26);
  ctx.fillRect(80, 196, 48, 22);
  ctx.fillStyle = '#2b2b33';
  ctx.fillRect(84, 62, 40, 24);
  ctx.fillStyle = '#ffd34d';
  ctx.fillRect(90, 68, 28, 12);
  ctx.beginPath();
  ctx.moveTo(82, 62);
  ctx.lineTo(126, 62);
  ctx.lineTo(104, 44);
  ctx.closePath();
  ctx.fillStyle = '#2b2b33';
  ctx.fill();
  // Flag: red on the left picture, blue on the right.
  ctx.strokeStyle = '#2b2b33';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(104, 44);
  ctx.lineTo(104, 26);
  ctx.stroke();
  ctx.fillStyle = variant === 0 ? '#c0392b' : '#2e6fd8';
  ctx.beginPath();
  ctx.moveTo(104, 26);
  ctx.lineTo(124, 31);
  ctx.lineTo(104, 37);
  ctx.closePath();
  ctx.fill();
  // The beam shines only on the left picture.
  if (variant === 0) {
    const beam = ctx.createLinearGradient(120, 74, 330, 130);
    beam.addColorStop(0, 'rgba(255,220,120,0.55)');
    beam.addColorStop(1, 'rgba(255,220,120,0)');
    ctx.fillStyle = beam;
    ctx.beginPath();
    ctx.moveTo(122, 66);
    ctx.lineTo(330, 96);
    ctx.lineTo(330, 142);
    ctx.lineTo(122, 84);
    ctx.closePath();
    ctx.fill();
  }

  // Boats, plus a third on the right picture.
  boat(ctx, 220, 250, 1, '#8a4a2d', '#f4f1e6');
  boat(ctx, 470, 272, 0.85, '#2e6f8e', '#ffd34d');
  if (variant === 1) boat(ctx, 350, 250, 0.9, '#5d3a7a', '#ff9ecf');

  // Cabin on the right shore.
  ctx.fillStyle = '#6b4a2f';
  ctx.fillRect(440, 226, 90, 62);
  ctx.fillStyle = '#8a2f2f';
  ctx.beginPath();
  ctx.moveTo(430, 228);
  ctx.lineTo(485, 196);
  ctx.lineTo(540, 228);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#f4f1e6';
  ctx.fillRect(448, 240, 14, 14);
  // Cabin window: lit on the left, dark on the right.
  ctx.fillStyle = variant === 0 ? '#ffd34d' : '#2b2b33';
  ctx.fillRect(500, 240, 16, 16);
  ctx.fillStyle = '#3a2a18';
  ctx.fillRect(478, 252, 16, 36);
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.fillRect(430, 228, 110, 6);

  // Pines along the shore; one vanishes on the right picture.
  pine(ctx, 180, 300, 1);
  pine(ctx, 250, 312, 0.85);
  if (variant === 0) pine(ctx, 560, 210, 1.1);
  pine(ctx, 590, 250, 0.9);

  // A snowman appears on the right picture.
  if (variant === 1) {
    ctx.fillStyle = '#ffffff';
    circle(ctx, 400, 322, 16);
    ctx.fill();
    circle(ctx, 400, 298, 11);
    ctx.fill();
    circle(ctx, 400, 280, 8);
    ctx.fill();
    ctx.fillStyle = '#2b2b33';
    circle(ctx, 397, 278, 1.6);
    ctx.fill();
    circle(ctx, 403, 278, 1.6);
    ctx.fill();
    ctx.fillStyle = '#e8483f';
    ctx.beginPath();
    ctx.moveTo(400, 281);
    ctx.lineTo(414, 283);
    ctx.lineTo(400, 285);
    ctx.closePath();
    ctx.fill();
  }
}

export const SCENES = [
  {
    id: 'market',
    title: 'Lantern Market',
    subtitle: 'Dusk at the old market square',
    seed: 101,
    differences: MARKET_DIFFS,
    paint: paintMarket,
  },
  {
    id: 'pond',
    title: 'Moonlit Koi Pond',
    subtitle: 'A quiet garden after dark',
    seed: 202,
    differences: POND_DIFFS,
    paint: paintPond,
  },
  {
    id: 'cove',
    title: 'Snowy Lighthouse Cove',
    subtitle: 'A cold bright morning by the sea',
    seed: 303,
    differences: COVE_DIFFS,
    paint: paintCove,
  },
];
