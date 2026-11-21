// Twin Lanterns — draws the whole game on one canvas: header, the two
// picture panels, found-difference markers, hint and wrong-click marks,
// and the title / round-clear / complete / time-up overlays.

import { SCENES } from './scenes.js';
import {
  VIEW_W,
  VIEW_H,
  HEADER_H,
  FOOTER_H,
  PANEL_W,
  PANEL_H,
  PANEL_Y,
  PANEL_X_LEFT,
  PANEL_X_RIGHT,
  HEADER_BUTTONS,
  HEADER_BUTTON_H,
  HEADER_BUTTON_GAP,
  HEADER_BUTTON_RIGHT_MARGIN,
  MARK_RING_COLOR,
  MARK_RING_WIDTH,
  HINT_RING_COLOR,
  WRONG_COLOR,
  ROUND_SECONDS,
} from './config.js';
import { remaining, sceneOf, isFound } from './state.js';
import { isMuted } from './audio.js';

export function headerButtonRects() {
  const rects = [];
  let right = VIEW_W - HEADER_BUTTON_RIGHT_MARGIN;
  HEADER_BUTTONS.forEach((b) => {
    const x = right - b.width;
    rects.push({ id: b.id, label: b.label, x, y: (HEADER_H - HEADER_BUTTON_H) / 2, w: b.width, h: HEADER_BUTTON_H });
    right = x - HEADER_BUTTON_GAP;
  });
  return rects;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawPanelFrame(ctx, x) {
  ctx.fillStyle = '#171226';
  roundRect(ctx, x - 4, PANEL_Y - 4, PANEL_W + 8, PANEL_H + 8, 10);
  ctx.fill();
  ctx.strokeStyle = '#4a3a6e';
  ctx.lineWidth = 2;
  roundRect(ctx, x - 4, PANEL_Y - 4, PANEL_W + 8, PANEL_H + 8, 10);
  ctx.stroke();
}

function drawPanelLabel(ctx, x, text) {
  ctx.fillStyle = 'rgba(23,18,38,0.85)';
  roundRect(ctx, x + 10, PANEL_Y + 10, 118, 26, 13);
  ctx.fill();
  ctx.fillStyle = '#ffe9a8';
  ctx.font = '600 14px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x + 22, PANEL_Y + 24);
}

function drawMarker(ctx, px, py, x, y, r, color, width, dashed) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  if (dashed) ctx.setLineDash([8, 6]);
  ctx.beginPath();
  ctx.arc(px + x, py + y, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(px + x - 7, py + y);
  ctx.lineTo(px + x - 1, py + y + 6);
  ctx.lineTo(px + x + 9, py + y - 7);
  ctx.stroke();
}

function drawPanels(ctx, game, now) {
  const scene = sceneOf(game);
  const panels = [
    { x: PANEL_X_LEFT, variant: 0, label: 'Picture A' },
    { x: PANEL_X_RIGHT, variant: 1, label: 'Picture B' },
  ];
  panels.forEach(({ x, variant, label }) => {
    drawPanelFrame(ctx, x);
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, PANEL_Y, PANEL_W, PANEL_H);
    ctx.clip();
    ctx.translate(x, PANEL_Y);
    scene.paint(ctx, PANEL_W, PANEL_H, variant);
    ctx.restore();
    drawPanelLabel(ctx, x, label);
    scene.differences.forEach((d) => {
      if (isFound(game, d.id)) {
        drawMarker(ctx, x, PANEL_Y, d.x, d.y, d.r, MARK_RING_COLOR, MARK_RING_WIDTH, false);
      }
    });
    if (game.hintAt && now < game.hintAt.until) {
      const d = scene.differences.find((dd) => dd.id === game.hintAt.diffId);
      if (d) {
        const pulse = 1 + 0.12 * Math.sin(now / 130);
        drawMarker(ctx, x, PANEL_Y, d.x, d.y, d.r * pulse, HINT_RING_COLOR, 4, true);
      }
    }
    if (game.wrongAt && now < game.wrongAt.until && game.wrongAt.panel === (variant === 0 ? 'left' : 'right')) {
      const w = game.wrongAt;
      ctx.strokeStyle = WRONG_COLOR;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(x + w.x - 10, PANEL_Y + w.y - 10);
      ctx.lineTo(x + w.x + 10, PANEL_Y + w.y + 10);
      ctx.moveTo(x + w.x + 10, PANEL_Y + w.y - 10);
      ctx.lineTo(x + w.x - 10, PANEL_Y + w.y + 10);
      ctx.stroke();
    }
  });
  // Centre divider with the scene name.
  ctx.fillStyle = '#241a33';
  ctx.fillRect(PANEL_X_LEFT + PANEL_W + 4, PANEL_Y + 40, 24, PANEL_H - 80);
  ctx.save();
  ctx.translate(PANEL_X_LEFT + PANEL_W + 16, PANEL_Y + PANEL_H / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillStyle = '#c9b8ff';
  ctx.font = '600 13px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(scene.title.toUpperCase(), 0, 0);
  ctx.restore();
}

function drawHeader(ctx, game) {
  ctx.fillStyle = '#1d1533';
  ctx.fillRect(0, 0, VIEW_W, HEADER_H);
  ctx.fillStyle = '#ffd34d';
  ctx.font = '700 22px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('Twin Lanterns', 16, HEADER_H / 2 + 1);
  ctx.fillStyle = '#c9b8ff';
  ctx.font = '500 13px system-ui, sans-serif';
  ctx.fillText('spot the difference', 196, HEADER_H / 2 + 1);

  const rects = headerButtonRects();
  const timerX = 400;
  const timerW = 200;
  const frac = Math.max(0, game.timeLeft / ROUND_SECONDS);
  ctx.fillStyle = '#33254a';
  roundRect(ctx, timerX, 14, timerW, 16, 8);
  ctx.fill();
  ctx.fillStyle = frac > 0.25 ? '#7ee7a0' : '#ff5a5a';
  if (frac > 0) {
    roundRect(ctx, timerX, 14, timerW * frac, 16, 8);
    ctx.fill();
  }
  ctx.fillStyle = '#f4f1e6';
  ctx.font = '700 15px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`Time ${Math.ceil(game.timeLeft)}s`, timerX, 44);

  const found = game.found.length;
  const left = remaining(game);
  ctx.font = '700 17px system-ui, sans-serif';
  ctx.fillStyle = '#ffd34d';
  ctx.fillText(`★ ${found} found · ${left} remain`, 640, HEADER_H / 2 - 8);
  ctx.font = '500 13px system-ui, sans-serif';
  ctx.fillStyle = '#c9b8ff';
  ctx.fillText(`Score ${game.score}   Combo ×${game.combo}   Hints ${game.hintsLeft}`, 640, HEADER_H / 2 + 13);

  rects.forEach((b) => {
    const disabled = b.id === 'hint' && (game.hintsLeft <= 0 || game.screen !== 'playing');
    ctx.fillStyle = disabled ? '#3a2f55' : '#4a3a6e';
    roundRect(ctx, b.x, b.y, b.w, b.h, 9);
    ctx.fill();
    ctx.strokeStyle = '#6e5a9e';
    ctx.lineWidth = 1.5;
    roundRect(ctx, b.x, b.y, b.w, b.h, 9);
    ctx.stroke();
    ctx.fillStyle = disabled ? '#8a7fb0' : '#f4f1e6';
    ctx.font = '600 14px system-ui, sans-serif';
    ctx.textAlign = 'center';
    const label = b.id === 'sound' ? (isMuted() ? 'Muted (M)' : 'Sound (M)') : b.label;
    ctx.fillText(label, b.x + b.w / 2, b.y + b.h / 2 + 1);
  });
}

function drawFooter(ctx, game) {
  ctx.fillStyle = '#1d1533';
  ctx.fillRect(0, VIEW_H - FOOTER_H, VIEW_W, FOOTER_H);
  ctx.fillStyle = '#8a7fb0';
  ctx.font = '500 13px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  const scene = sceneOf(game);
  ctx.fillText(`Scene ${game.sceneIndex + 1} of ${SCENES.length} — ${scene.title}: ${scene.subtitle}`, 16, VIEW_H - FOOTER_H / 2);
  ctx.textAlign = 'right';
  ctx.fillText('Click a difference on either picture · H hint · P pause · R restart', VIEW_W - 16, VIEW_H - FOOTER_H / 2);
}

function overlay(ctx, title, lines, buttonLabel) {
  ctx.fillStyle = 'rgba(13,9,26,0.82)';
  ctx.fillRect(0, HEADER_H, VIEW_W, VIEW_H - HEADER_H - FOOTER_H);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffd34d';
  ctx.font = '700 34px system-ui, sans-serif';
  ctx.fillText(title, VIEW_W / 2, 150);
  ctx.fillStyle = '#f4f1e6';
  ctx.font = '500 17px system-ui, sans-serif';
  lines.forEach((line, i) => ctx.fillText(line, VIEW_W / 2, 196 + i * 28));
  if (buttonLabel) {
    const buttonY = 196 + (lines.length - 1) * 28 + 36;
    ctx.fillStyle = '#e8483f';
    roundRect(ctx, VIEW_W / 2 - 130, buttonY, 260, 48, 12);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = '700 18px system-ui, sans-serif';
    ctx.fillText(buttonLabel, VIEW_W / 2, buttonY + 25);
  }
}

export function drawTitle(ctx, game) {
  drawPanels(ctx, game, Date.now());
  overlay(
    ctx,
    'Twin Lanterns',
    [
      'Two pictures, seven differences. Find them all before the lanterns burn down.',
      'Click a difference on either picture. A wrong click costs 3 seconds.',
      'Three scenes: Lantern Market · Moonlit Koi Pond · Snowy Lighthouse Cove.',
      'Press Enter or click to play. Hints cost 50 points — use them wisely.',
    ],
    '▶  Play — press Enter',
  );
}

function drawRoundClear(ctx, game) {
  const scene = sceneOf(game);
  const stars = '★'.repeat(game.stars) + '☆'.repeat(3 - game.stars);
  const labels = scene.differences.map((d) => d.label);
  const half = Math.ceil(labels.length / 2);
  overlay(
    ctx,
    `${scene.title} — cleared!`,
    [
      `${stars}   Round score ${game.roundScore}   ·   Total ${game.score}`,
      'You found:',
      labels.slice(0, half).join(' · '),
      labels.slice(half).join(' · '),
      game.sceneIndex + 1 < SCENES.length
        ? `Next up: ${SCENES[game.sceneIndex + 1].title} — ${SCENES[game.sceneIndex + 1].subtitle}`
        : 'That was the last scene — see your final tally!',
    ],
    game.sceneIndex + 1 < SCENES.length ? '▶  Next scene — press Enter' : '▶  See results — press Enter',
  );
}

function drawComplete(ctx, game) {
  const stars = '★'.repeat(game.totalStars) + '☆'.repeat(9 - game.totalStars);
  overlay(
    ctx,
    'All three scenes cleared!',
    [
      `${stars}`,
      `Final score ${game.score}   ·   Best combo ×${game.bestCombo}   ·   Wrong clicks ${game.wrongCount}`,
      'Three original scenes, twenty-one hidden differences — every one found.',
      'Play again to beat your score, or try a faster run for the time bonus.',
    ],
    '↻  Play again — press Enter',
  );
}

function drawTimeUp(ctx, game) {
  overlay(
    ctx,
    "Time's up!",
    [
      `You found ${game.found.length} of 7 differences in ${sceneOf(game).title}.`,
      `Score so far: ${game.score}. The lanterns burned down — but the scene is still there.`,
      'Tip: scan slowly along the rooftops, the waterline and the stalls.',
    ],
    '↻  Try this scene again — press Enter',
  );
}

function drawPaused(ctx) {
  overlay(ctx, 'Paused', ['Take a breath. The timer is stopped.', 'Press P or click to keep hunting.'], null);
}

export function render(ctx, game, now) {
  ctx.clearRect(0, 0, VIEW_W, VIEW_H);
  ctx.fillStyle = '#241a33';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  drawHeader(ctx, game);
  drawFooter(ctx, game);
  if (game.screen === 'title') {
    drawTitle(ctx, game);
    return;
  }
  drawPanels(ctx, game, now);
  if (game.screen === 'roundClear') drawRoundClear(ctx, game);
  else if (game.screen === 'complete') drawComplete(ctx, game);
  else if (game.screen === 'timeUp') drawTimeUp(ctx, game);
  else if (game.paused) drawPaused(ctx);
}
