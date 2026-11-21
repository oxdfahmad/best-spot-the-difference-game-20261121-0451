// Twin Lanterns — shared constants for the spot-the-difference game.
// One canvas fills the 1280x480 window: a header strip, two picture panels
// side by side, and a thin footer strip. All sizes are in CSS pixels.

export const VIEW_W = 1280;
export const VIEW_H = 480;

export const HEADER_H = 56;
export const FOOTER_H = 28;
export const PANEL_W = 608;
export const PANEL_H = 384;
export const PANEL_Y = 64;
export const PANEL_GAP = 32;
export const PANEL_X_LEFT = 16;
export const PANEL_X_RIGHT = PANEL_X_LEFT + PANEL_W + PANEL_GAP;

export const DIFFS_PER_ROUND = 7;
export const ROUND_SECONDS = 150;
export const HINTS_PER_ROUND = 3;
export const HINT_COOLDOWN_MS = 10000;
export const HINT_SHOW_MS = 3000;
export const WRONG_CLICK_PENALTY_SEC = 3;

export const POINTS_PER_FIND = 100;
export const POINTS_PER_COMBO_STEP = 25;
export const POINTS_HINT_COST = 50;
export const POINTS_TIME_BONUS_PER_SEC = 5;
export const WRONG_CLICK_COMBO_RESET = true;

export const MARK_RING_COLOR = '#ffd34d';
export const MARK_RING_WIDTH = 5;
export const HINT_RING_COLOR = '#7ee7ff';
export const WRONG_COLOR = '#ff5a5a';

// Button hit areas in the header, laid out from the right edge.
export const HEADER_BUTTONS = [
  { id: 'hint', label: 'Hint (H)', width: 96 },
  { id: 'sound', label: 'Sound (M)', width: 110 },
  { id: 'restart', label: 'Restart (R)', width: 118 },
];
export const HEADER_BUTTON_H = 34;
export const HEADER_BUTTON_GAP = 10;
export const HEADER_BUTTON_RIGHT_MARGIN = 16;

// Star thresholds for a finished round, as fractions of the max round score.
export const STAR_CUTS = [0.55, 0.8, 0.95];
