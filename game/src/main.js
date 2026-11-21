// Twin Lanterns — bootstrap: build the canvas, wire input, run the loop.
// The loop ticks the timer once a second and redraws every animation frame,
// so hint pulses and the wrong-click flash animate smoothly.

import { VIEW_W, VIEW_H } from './config.js';
import { newGame, tick, tickTimer } from './state.js';
import { render } from './render.js';
import { installInput } from './input.js';
import { applyShotParams } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
canvas.width = VIEW_W;
canvas.height = VIEW_H;

const game = newGame();
installInput(canvas, game);
const staged = applyShotParams(game);
if (staged) document.body.classList.add('shot');

let lastFrame = performance.now();
let lastSecond = performance.now();

function frame(now) {
  const dt = Math.min(0.1, (now - lastFrame) / 1000);
  lastFrame = now;
  if (!staged && now - lastSecond >= 1000) {
    lastSecond = now;
    tickTimer(game, 1);
  }
  tick(game, now);
  render(ctx, game, now);
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
