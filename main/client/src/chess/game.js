// Партия: заголовки, последовательность позиций, комментарии; чтение и запись формата .chessgame.
import { STATE_LENGTH, START_STATE, WHITE, BLACK, decodeState, encodeState, slotColor } from './board.js';
import { Position } from './position.js';

export const HEADER_KEYS = ['White', 'Black', 'Place', 'Date'];
export const FILE_EXTENSION = '.chessgame';

export class Game {
  constructor(start = Position.fromState(START_STATE, WHITE)) {
    this.headers = {};
    this.positions = [start]; // positions[i + 1] = positions[i].apply(moves[i].move)
    this.moves = []; // { move, san, color }
    this.notes = ['']; // notes[i] — комментарий к positions[i]
  }

  get length() {
    return this.moves.length;
  }

  addMove(move) {
    const pos = this.positions[this.positions.length - 1];
    const san = pos.san(move);
    this.moves.push({ move, san, color: pos.turn });
    this.positions.push(pos.apply(move));
    this.notes.push('');
  }

  // Удаляет все ходы после позиции index.
  truncate(index) {
    this.moves.length = index;
    this.positions.length = index + 1;
    this.notes.length = index + 1;
  }
}

// Разбор текста файла в «сырые» записи без проверки правил.
export function parseText(text) {
  const headers = {};
  const entries = []; // { state, color, step, note, line }
  let note = null; // { lines, entry }
  const lines = text.replace(/^﻿/, '').split(/\r?\n/);

  lines.forEach((raw, i) => {
    const lineNo = i + 1;
    if (note) {
      const end = raw.lastIndexOf(']');
      if (end >= 0 && raw.slice(end + 1).trim() === '') {
        note.lines.push(raw.slice(0, end));
        finishNote();
      } else {
        note.lines.push(raw);
      }
      return;
    }
    if (raw.trim() === '') return;
    if (raw.startsWith('#')) {
      const m = raw.slice(1).match(/^\s*([^:]+?)\s*:\s?(.*)$/);
      if (m) headers[m[1]] = m[2].trimEnd();
      return;
    }
    const trimmed = raw.trim();
    if (trimmed.startsWith('[')) {
      note = { lines: [], entry: entries[entries.length - 1] || null };
      const rest = trimmed.slice(1);
      if (rest.trim().endsWith(']')) {
        note.lines.push(rest.slice(0, rest.lastIndexOf(']')));
        finishNote();
      } else if (rest.trim() !== '') {
        note.lines.push(rest);
      }
      return;
    }
    const state = raw.slice(0, STATE_LENGTH).padEnd(STATE_LENGTH, ' ');
    const [color = '', ...step] = raw.slice(STATE_LENGTH).trim().split(/\s+/).filter(Boolean);
    try {
      decodeState(state);
    } catch (e) {
      throw new Error(`Строка ${lineNo}: ${e.message}`);
    }
    const c = color.toUpperCase();
    if (c && c !== WHITE && c !== BLACK) throw new Error(`Строка ${lineNo}: неизвестный цвет "${color}"`);
    entries.push({ state, color: c, step: step.join(' '), note: '', line: lineNo });
  });
  if (note) finishNote();

  function finishNote() {
    const textNote = trimBlankLines(note.lines).join('\n');
    if (note.entry) note.entry.note = note.entry.note ? note.entry.note + '\n' + textNote : textNote;
    note = null;
  }
  return { headers, entries };
}

function trimBlankLines(lines) {
  let a = 0;
  let b = lines.length;
  while (a < b && lines[a].trim() === '') a++;
  while (b > a && lines[b - 1].trim() === '') b--;
  return lines.slice(a, b);
}

const PROMO_LETTERS = { Q: 'Q', R: 'R', B: 'B', N: 'N', 'Ф': 'Q', 'Л': 'R', 'С': 'B', 'К': 'N' };

function promotionFromStep(step) {
  const m = (step || '').match(/=?\(?([QRBNФЛСК])\)?[+#!?]*$/i);
  return m ? PROMO_LETTERS[m[1].toUpperCase()] || null : null;
}

function occupancy(slots) {
  const map = new Map();
  slots.forEach((sq, slot) => {
    if (sq >= 0) map.set(sq, slotColor(slot) + (slot % 16 < 8 ? 'P' : slot % 16));
  });
  return map;
}

function sameOccupancy(a, b) {
  if (a.size !== b.size) return false;
  for (const [sq, v] of a) if (b.get(sq) !== v) return false;
  return true;
}

// Находит допустимый ход из pos, приводящий к состоянию state.
function findMove(pos, state, step) {
  const target = decodeState(state);
  const targetState = encodeState(target);
  const legal = pos.legalMoves();
  let candidates = legal.filter((m) => pos.apply(m).state() === targetState);
  if (!candidates.length) {
    // Допускаем перестановку одинаковых фигур (например, пешек) между позициями строки.
    const occ = occupancy(target);
    candidates = legal.filter((m) => sameOccupancy(occupancy(pos.apply(m).slots), occ));
  }
  if (candidates.length > 1) {
    const promo = promotionFromStep(step) || 'Q';
    const byPromo = candidates.filter((m) => m.promotion === promo);
    if (byPromo.length) candidates = byPromo;
  }
  return candidates[0] || null;
}

// Загружает партию из текста файла. Возвращает { game, error }.
// При ошибке в ходах партия загружается до последнего корректного хода.
export function loadGame(text) {
  const { headers, entries } = parseText(text);
  if (!entries.length) throw new Error('В файле нет ни одного состояния доски');
  const [first, ...rest] = entries;
  let turn = WHITE;
  if (rest.length && rest[0].color) turn = rest[0].color;
  else if (first.color) turn = first.color === WHITE ? BLACK : WHITE;
  const game = new Game(Position.fromState(first.state, turn));
  game.headers = headers;
  game.notes[0] = first.note;
  let error = null;
  for (const entry of rest) {
    const pos = game.positions[game.positions.length - 1];
    if (entry.color && entry.color !== pos.turn) {
      error = `Строка ${entry.line}: ожидался ход ${pos.turn === WHITE ? 'белых' : 'черных'}`;
      break;
    }
    const move = findMove(pos, entry.state, entry.step);
    if (!move) {
      error = `Строка ${entry.line}: недопустимый ход ${entry.step || ''}`.trim();
      break;
    }
    game.addMove(move);
    game.notes[game.notes.length - 1] = entry.note;
  }
  return { game, error };
}

function noteBlock(note) {
  if (!note || !note.trim()) return [];
  return ['[', ...note.replace(/\r/g, '').split('\n'), ']'];
}

export function serializeGame(game) {
  const out = [];
  const keys = [...HEADER_KEYS, ...Object.keys(game.headers).filter((k) => !HEADER_KEYS.includes(k))];
  for (const key of keys) {
    const value = (game.headers[key] || '').replace(/[\r\n]+/g, ' ').trim();
    if (value) out.push(`# ${key}: ${value}`);
  }
  if (out.length) out.push('');
  out.push(game.positions[0].state(), ...noteBlock(game.notes[0]));
  game.moves.forEach((m, i) => {
    out.push(`${game.positions[i + 1].state()} ${m.color} ${m.san}`, ...noteBlock(game.notes[i + 1]));
  });
  return out.join('\n') + '\n';
}
