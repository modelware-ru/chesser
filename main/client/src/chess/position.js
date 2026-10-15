// Позиция и правила игры: генерация допустимых ходов, применение хода, нотация.
import {
  SLOT_TYPES, START_STATE, WHITE, BLACK, WHITE_KING_SLOT, BLACK_KING_SLOT,
  slotColor, opposite, fileOf, rankOf, squareName, decodeState, encodeState,
} from './board.js';

const KNIGHT_STEPS = [[1, 2], [2, 1], [2, -1], [1, -2], [-1, -2], [-2, -1], [-2, 1], [-1, 2]];
const KING_STEPS = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]];
const ROOK_DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];
const BISHOP_DIRS = [[1, 1], [1, -1], [-1, 1], [-1, -1]];

export const PROMOTION_TYPES = ['Q', 'R', 'B', 'N'];

const A1 = 0, E1 = 4, H1 = 7, A8 = 56, E8 = 60, H8 = 63;

function offset(sq, df, dr) {
  const f = fileOf(sq) + df;
  const r = rankOf(sq) + dr;
  if (f < 0 || f > 7 || r < 0 || r > 7) return -1;
  return r * 8 + f;
}

export class Position {
  constructor({ slots, types, turn, castling, ep = -1, halfmove = 0, fullmove = 1 }) {
    this.slots = slots;
    this.types = types;
    this.turn = turn;
    this.castling = castling; // { K, Q, k, q }
    this.ep = ep;
    this.halfmove = halfmove;
    this.fullmove = fullmove;
    this.board = new Array(64).fill(-1);
    slots.forEach((sq, slot) => {
      if (sq >= 0) this.board[sq] = slot;
    });
    this._legal = null;
  }

  // Позиция из строки состояния. Права на рокировку выводятся из расположения короля и ладей.
  static fromState(state = START_STATE, turn = WHITE) {
    const slots = decodeState(state);
    const types = SLOT_TYPES.slice();
    const pos = new Position({ slots, types, turn, castling: { K: false, Q: false, k: false, q: false } });
    const rookAt = (sq, color) => {
      const p = pos.pieceAt(sq);
      return p && p.type === 'R' && p.color === color;
    };
    const wk = slots[WHITE_KING_SLOT] === E1;
    const bk = slots[BLACK_KING_SLOT] === E8;
    pos.castling = {
      K: wk && rookAt(H1, WHITE),
      Q: wk && rookAt(A1, WHITE),
      k: bk && rookAt(H8, BLACK),
      q: bk && rookAt(A8, BLACK),
    };
    return pos;
  }

  state() {
    return encodeState(this.slots);
  }

  pieceAt(sq) {
    const slot = this.board[sq];
    if (slot < 0) return null;
    return { slot, color: slotColor(slot), type: this.types[slot] };
  }

  kingSquare(color) {
    return this.slots[color === WHITE ? WHITE_KING_SLOT : BLACK_KING_SLOT];
  }

  // Атакована ли клетка sq фигурами цвета by.
  isAttacked(sq, by) {
    const at = (s) => {
      const p = s >= 0 ? this.pieceAt(s) : null;
      return p && p.color === by ? p.type : null;
    };
    const pawnDir = by === WHITE ? -1 : 1; // откуда бьёт пешка
    for (const df of [-1, 1]) {
      if (at(offset(sq, df, pawnDir)) === 'P') return true;
    }
    for (const [df, dr] of KNIGHT_STEPS) {
      if (at(offset(sq, df, dr)) === 'N') return true;
    }
    for (const [df, dr] of KING_STEPS) {
      if (at(offset(sq, df, dr)) === 'K') return true;
    }
    const ray = (dirs, kinds) => {
      for (const [df, dr] of dirs) {
        let s = offset(sq, df, dr);
        while (s >= 0) {
          const p = this.pieceAt(s);
          if (p) {
            if (p.color === by && kinds.includes(p.type)) return true;
            break;
          }
          s = offset(s, df, dr);
        }
      }
      return false;
    };
    return ray(ROOK_DIRS, ['R', 'Q']) || ray(BISHOP_DIRS, ['B', 'Q']);
  }

  inCheck(color = this.turn) {
    const k = this.kingSquare(color);
    return k >= 0 && this.isAttacked(k, opposite(color));
  }

  pseudoMoves() {
    const color = this.turn;
    const moves = [];
    const enemyAt = (s) => {
      const p = this.pieceAt(s);
      return p && p.color !== color ? p : null;
    };
    const add = (slot, from, to, extra = {}) => {
      const target = this.pieceAt(to);
      moves.push({ slot, from, to, captured: target ? target.slot : -1, promotion: null, castle: null, ep: false, ...extra });
    };
    for (let slot = 0; slot < 32; slot++) {
      const from = this.slots[slot];
      if (from < 0 || slotColor(slot) !== color) continue;
      const type = this.types[slot];
      if (type === 'P') {
        const dir = color === WHITE ? 1 : -1;
        const startRank = color === WHITE ? 1 : 6;
        const lastRank = color === WHITE ? 7 : 0;
        const pushPawn = (to, extra = {}) => {
          if (rankOf(to) === lastRank) {
            for (const promotion of PROMOTION_TYPES) add(slot, from, to, { ...extra, promotion });
          } else {
            add(slot, from, to, extra);
          }
        };
        const one = offset(from, 0, dir);
        if (one >= 0 && !this.pieceAt(one)) {
          pushPawn(one);
          const two = offset(from, 0, 2 * dir);
          if (rankOf(from) === startRank && two >= 0 && !this.pieceAt(two)) add(slot, from, two);
        }
        for (const df of [-1, 1]) {
          const to = offset(from, df, dir);
          if (to < 0) continue;
          if (enemyAt(to)) {
            pushPawn(to);
          } else if (to === this.ep) {
            const victim = this.board[offset(to, 0, -dir)];
            if (victim >= 0 && slotColor(victim) !== color && this.types[victim] === 'P') {
              add(slot, from, to, { captured: victim, ep: true });
            }
          }
        }
        continue;
      }
      const steps = (list) => {
        for (const [df, dr] of list) {
          const to = offset(from, df, dr);
          if (to < 0) continue;
          const p = this.pieceAt(to);
          if (!p || p.color !== color) add(slot, from, to);
        }
      };
      const slide = (dirs) => {
        for (const [df, dr] of dirs) {
          let to = offset(from, df, dr);
          while (to >= 0) {
            const p = this.pieceAt(to);
            if (p && p.color === color) break;
            add(slot, from, to);
            if (p) break;
            to = offset(to, df, dr);
          }
        }
      };
      if (type === 'N') steps(KNIGHT_STEPS);
      else if (type === 'B') slide(BISHOP_DIRS);
      else if (type === 'R') slide(ROOK_DIRS);
      else if (type === 'Q') slide([...ROOK_DIRS, ...BISHOP_DIRS]);
      else if (type === 'K') {
        steps(KING_STEPS);
        this._castlingMoves(slot, from, moves);
      }
    }
    return moves;
  }

  _castlingMoves(slot, from, moves) {
    const color = this.turn;
    const home = color === WHITE ? E1 : E8;
    if (from !== home || this.inCheck(color)) return;
    const enemy = opposite(color);
    const variants = color === WHITE
      ? [['K', H1, [5, 6], [5, 6], 6, 5], ['Q', A1, [1, 2, 3], [3, 2], 2, 3]]
      : [['k', H8, [61, 62], [61, 62], 62, 61], ['q', A8, [57, 58, 59], [59, 58], 58, 59]];
    for (const [right, rookFrom, empty, safe, kingTo, rookTo] of variants) {
      if (!this.castling[right]) continue;
      const rook = this.pieceAt(rookFrom);
      if (!rook || rook.type !== 'R' || rook.color !== color) continue;
      if (empty.some((s) => this.board[s] >= 0)) continue;
      if (safe.some((s) => this.isAttacked(s, enemy))) continue;
      moves.push({
        slot, from, to: kingTo, captured: -1, promotion: null, ep: false,
        castle: { rookSlot: rook.slot, rookFrom, rookTo, side: right.toUpperCase() },
      });
    }
  }

  legalMoves() {
    if (!this._legal) {
      this._legal = this.pseudoMoves().filter((m) => !this.apply(m).inCheck(this.turn));
    }
    return this._legal;
  }

  apply(move) {
    const slots = this.slots.slice();
    const types = this.types.slice();
    const castling = { ...this.castling };
    if (move.captured >= 0) slots[move.captured] = -1;
    slots[move.slot] = move.to;
    if (move.promotion) types[move.slot] = move.promotion;
    if (move.castle) slots[move.castle.rookSlot] = move.castle.rookTo;

    const type = this.types[move.slot];
    if (type === 'K') {
      if (this.turn === WHITE) castling.K = castling.Q = false;
      else castling.k = castling.q = false;
    }
    for (const sq of [move.from, move.to]) {
      if (sq === H1) castling.K = false;
      if (sq === A1) castling.Q = false;
      if (sq === H8) castling.k = false;
      if (sq === A8) castling.q = false;
    }
    let ep = -1;
    if (type === 'P' && Math.abs(move.to - move.from) === 16) ep = (move.to + move.from) / 2;
    const halfmove = type === 'P' || move.captured >= 0 ? 0 : this.halfmove + 1;
    const fullmove = this.turn === BLACK ? this.fullmove + 1 : this.fullmove;
    return new Position({ slots, types, turn: opposite(this.turn), castling, ep, halfmove, fullmove });
  }

  // Запись хода в стандартной алгебраической нотации (SAN).
  san(move) {
    let text;
    if (move.castle) {
      text = move.castle.side === 'K' ? 'O-O' : 'O-O-O';
    } else {
      const type = this.types[move.slot];
      const capture = move.captured >= 0;
      if (type === 'P') {
        text = (capture ? squareName(move.from)[0] + 'x' : '') + squareName(move.to);
        if (move.promotion) text += '=' + move.promotion;
      } else {
        const rivals = this.legalMoves().filter((m) => m.to === move.to && m.from !== move.from
          && this.types[m.slot] === type);
        let dis = '';
        if (rivals.length) {
          const name = squareName(move.from);
          if (!rivals.some((m) => fileOf(m.from) === fileOf(move.from))) dis = name[0];
          else if (!rivals.some((m) => rankOf(m.from) === rankOf(move.from))) dis = name[1];
          else dis = name;
        }
        text = type + dis + (capture ? 'x' : '') + squareName(move.to);
      }
    }
    const next = this.apply(move);
    if (next.inCheck()) text += next.legalMoves().length ? '+' : '#';
    return text;
  }

  // 'mate' | 'stalemate' | null
  status() {
    if (this.legalMoves().length) return null;
    return this.inCheck() ? 'mate' : 'stalemate';
  }
}

export function sameMove(a, b) {
  return a.from === b.from && a.to === b.to && (a.promotion || null) === (b.promotion || null);
}
