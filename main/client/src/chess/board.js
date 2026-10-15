// Кодирование клеток и состояния доски (см. ai/todo.md, ai/doc/board.svg).

// Символ клетки: '0' — a1, '1' — b1, ... '}' — h8.
export const ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz{}';

export const STATE_LENGTH = 32;
export const EMPTY_CHAR = ' ';
export const START_STATE = '89ABCDEF25160734mnopqrstwzv{u}xy';

export const WHITE = 'W';
export const BLACK = 'B';

// Тип фигуры для каждой позиции в строке состояния.
const HALF = ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'B', 'B', 'N', 'N', 'R', 'R', 'Q', 'K'];
export const SLOT_TYPES = [...HALF, ...HALF];

export const WHITE_KING_SLOT = 15;
export const BLACK_KING_SLOT = 31;

export const FILES = 'abcdefgh';

export function slotColor(slot) {
  return slot < 16 ? WHITE : BLACK;
}

export function opposite(color) {
  return color === WHITE ? BLACK : WHITE;
}

export function fileOf(sq) {
  return sq & 7;
}

export function rankOf(sq) {
  return sq >> 3;
}

export function squareName(sq) {
  return FILES[fileOf(sq)] + (rankOf(sq) + 1);
}

export function squareFromName(name) {
  const f = FILES.indexOf(name[0]);
  const r = Number(name[1]) - 1;
  if (f < 0 || !(r >= 0 && r < 8)) return -1;
  return r * 8 + f;
}

export function squareChar(sq) {
  return ALPHABET[sq];
}

// Разбирает строку состояния в массив из 32 клеток (-1 — фигуры нет на доске).
export function decodeState(state) {
  if (typeof state !== 'string') throw new Error('Состояние доски должно быть строкой');
  const padded = state.padEnd(STATE_LENGTH, EMPTY_CHAR);
  if (padded.length !== STATE_LENGTH) {
    throw new Error(`Состояние доски должно содержать ${STATE_LENGTH} символа`);
  }
  const slots = [];
  const used = new Set();
  for (let i = 0; i < STATE_LENGTH; i++) {
    const ch = padded[i];
    if (ch === EMPTY_CHAR) {
      slots.push(-1);
      continue;
    }
    const sq = ALPHABET.indexOf(ch);
    if (sq < 0) throw new Error(`Недопустимый символ клетки "${ch}" в позиции ${i}`);
    if (used.has(sq)) throw new Error(`Клетка ${squareName(sq)} занята несколькими фигурами`);
    used.add(sq);
    slots.push(sq);
  }
  return slots;
}

export function encodeState(slots) {
  return slots.map((sq) => (sq < 0 ? EMPTY_CHAR : ALPHABET[sq])).join('');
}
