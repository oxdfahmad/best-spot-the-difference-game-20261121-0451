// Twin Lanterns — mouse and keyboard input. Pointer coordinates are mapped
// into panel space (either picture counts), header buttons are hit-tested
// in canvas space, and keys drive hints, pause, mute and restart.

import { PANEL_W, PANEL_H, PANEL_Y, PANEL_X_LEFT, PANEL_X_RIGHT } from './config.js';
import { clickAt, useHint, startRound, startGame, nextRound } from './state.js';
import { headerButtonRects } from './render.js';
import { setMuted, isMuted, soundClick } from './audio.js';

function panelAt(clientX, clientY, canvas) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const x = (clientX - rect.left) * scaleX;
  const y = (clientY - rect.top) * scaleY;
  if (y < PANEL_Y || y > PANEL_Y + PANEL_H) return null;
  if (x >= PANEL_X_LEFT && x <= PANEL_X_LEFT + PANEL_W) {
    return { panel: 'left', x: x - PANEL_X_LEFT, y: y - PANEL_Y };
  }
  if (x >= PANEL_X_RIGHT && x <= PANEL_X_RIGHT + PANEL_W) {
    return { panel: 'right', x: x - PANEL_X_RIGHT, y: y - PANEL_Y };
  }
  return null;
}

function buttonAt(clientX, clientY, canvas) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const x = (clientX - rect.left) * scaleX;
  const y = (clientY - rect.top) * scaleY;
  return headerButtonRects().find((b) => x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) || null;
}

function advance(game) {
  if (game.screen === 'title') startGame(game);
  else if (game.screen === 'roundClear') nextRound(game);
  else if (game.screen === 'complete') startGame(game);
  else if (game.screen === 'timeUp') startRound(game, game.sceneIndex);
}

export function installInput(canvas, game) {
  canvas.addEventListener('pointerdown', (event) => {
    const now = Date.now();
    const button = buttonAt(event.clientX, event.clientY, canvas);
    if (button) {
      soundClick();
      if (button.id === 'hint') useHint(game, now);
      else if (button.id === 'sound') setMuted(!isMuted());
      else if (button.id === 'restart') startRound(game, game.sceneIndex);
      return;
    }
    if (game.screen !== 'playing') {
      advance(game);
      return;
    }
    if (game.paused) {
      game.paused = false;
      return;
    }
    const hit = panelAt(event.clientX, event.clientY, canvas);
    if (!hit) return;
    clickAt(game, hit.panel, hit.x, hit.y, now);
  });

  window.addEventListener('keydown', (event) => {
    const now = Date.now();
    const key = event.key.toLowerCase();
    if (key === 'enter' || key === ' ') {
      if (game.screen !== 'playing') {
        event.preventDefault();
        advance(game);
      }
      return;
    }
    if (key === 'h') useHint(game, now);
    else if (key === 'm') setMuted(!isMuted());
    else if (key === 'r') {
      if (game.screen === 'playing') startRound(game, game.sceneIndex);
    } else if (key === 'p') {
      if (game.screen === 'playing') game.paused = !game.paused;
    } else if (key >= '1' && key <= '3') {
      if (game.screen === 'title') startRound(game, Number(key) - 1);
    }
  });
}
