import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SLOT_TYPES, START_STATE, WHITE, BLACK, squareFromName, slotColor } from '../src/chess/board.js';
import { Position } from '../src/chess/position.js';
import { Game, loadGame, serializeGame } from '../src/chess/game.js';

function perft(pos, depth) {
  if (depth === 0) return 1;
  let n = 0;
  for (const m of pos.legalMoves()) n += depth === 1 ? 1 : perft(pos.apply(m), depth - 1);
  return n;
}

// Построение позиции из FEN (лишние фигуры занимают свободные позиции пешек).
function fromFen(fen) {
  const [placement, turn, castling, ep] = fen.split(' ');
  const slots = new Array(32).fill(-1);
  const types = SLOT_TYPES.slice();
  const extra = [];
  placement.split('/').forEach((row, i) => {
    let f = 0;
    for (const ch of row) {
      if (/\d/.test(ch)) { f += Number(ch); continue; }
      const sq = (7 - i) * 8 + f++;
      const color = ch === ch.toUpperCase() ? WHITE : BLACK;
      const type = ch.toUpperCase();
      const slot = types.findIndex((t, s) => t === type && slotColor(s) === color && slots[s] < 0);
      if (slot >= 0) slots[slot] = sq; else extra.push({ sq, color, type });
    }
  });
  for (const { sq, color, type } of extra) {
    const slot = types.findIndex((t, s) => t === 'P' && slotColor(s) === color && slots[s] < 0);
    slots[slot] = sq;
    types[slot] = type;
  }
  return new Position({
    slots, types, turn: turn === 'w' ? WHITE : BLACK,
    castling: { K: castling.includes('K'), Q: castling.includes('Q'), k: castling.includes('k'), q: castling.includes('q') },
    ep: ep === '-' ? -1 : squareFromName(ep),
  });
}

test('perft начальной позиции', () => {
  const pos = Position.fromState();
  assert.equal(perft(pos, 1), 20);
  assert.equal(perft(pos, 2), 400);
  assert.equal(perft(pos, 3), 8902);
  assert.equal(perft(pos, 4), 197281);
});

test('perft kiwipete', () => {
  const pos = fromFen('r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq -');
  assert.equal(perft(pos, 1), 48);
  assert.equal(perft(pos, 2), 2039);
  assert.equal(perft(pos, 3), 97862);
});

test('perft позиция 3 (взятие на проходе, шахи)', () => {
  const pos = fromFen('8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - -');
  assert.equal(perft(pos, 4), 43238);
});

test('perft позиция 4 (превращения)', () => {
  const pos = fromFen('r3k2r/Pppp1ppp/1b3nbN/nP6/BBP1P3/q4N2/Pp1P2PP/R2Q1RK1 w kq - 0 1');
  assert.equal(perft(pos, 3), 9467);
});

function play(game, ...sans) {
  for (const s of sans) {
    const pos = game.positions[game.positions.length - 1];
    const move = pos.legalMoves().find((m) => pos.san(m).replace(/[+#]/, '') === s.replace(/[+#]/, ''));
    assert.ok(move, `ход ${s} недопустим`);
    game.addMove(move);
  }
}

test('нотация и мат', () => {
  const g = new Game();
  play(g, 'e4', 'e5', 'Qh5', 'Nc6', 'Bc4', 'Nf6', 'Qxf7#');
  assert.equal(g.moves.at(-1).san, 'Qxf7#');
  assert.equal(g.positions.at(-1).status(), 'mate');
});

test('запись и чтение файла', () => {
  const g = new Game();
  g.headers = { White: 'Иванов', Black: 'Петров', Place: 'Москва', Date: '2026-10-15', Note: 'Учебная партия' };
  g.notes[0] = 'Начало';
  play(g, 'e4', 'd5', 'exd5', 'Nf6', 'Nf3', 'Nxd5', 'Be2', 'Bf5', 'O-O');
  g.notes[1] = 'Королевская пешка\nвторая строка';
  const text = serializeGame(g);
  assert.ok(text.startsWith('# White: Иванов\n'));
  assert.ok(text.includes(`\n${START_STATE}\n[\nНачало\n]\n`));
  const { game, error } = loadGame(text);
  assert.equal(error, null);
  assert.equal(game.length, 9);
  assert.deepEqual(game.moves.map((m) => m.san), g.moves.map((m) => m.san));
  assert.deepEqual(game.notes, g.notes);
  assert.deepEqual(game.headers, g.headers);
  assert.equal(serializeGame(game), text);
});

test('чтение: повторный ключ, пустые строки, взятая фигура (пробел в состоянии)', () => {
  const text = [
    '# White: A', '', '# White: B',
    START_STATE,
    '89ABCDEF25160734mnopqrstwzv{u}xy',
  ].join('\n');
  // второй ход совпадает с начальным — недопустим
  const r = loadGame(text);
  assert.equal(r.game.headers.White, 'B');
  assert.ok(r.error);

  const g = new Game();
  play(g, 'e4', 'd5', 'exd5');
  const t = serializeGame(g);
  assert.ok(t.includes(' B d5') && /\n[^\n]* [^\n]* W exd5/.test(t));
  const loaded = loadGame(t);
  assert.equal(loaded.error, null);
  assert.equal(loaded.game.positions.at(-1).state(), g.positions.at(-1).state());
  assert.equal(loaded.game.positions.at(-1).state()[19], ' ');
});

test('превращение пешки по записи хода', () => {
  const pos = fromFen('8/4P3/8/8/8/8/k7/4K3 w - -');
  const g = new Game(pos);
  play(g, 'e8=N');
  const loaded = loadGame(serializeGame(g));
  assert.equal(loaded.error, null);
  const last = loaded.game.positions.at(-1);
  assert.equal(last.pieceAt(squareFromName('e8')).type, 'N');
});

test('однострочный комментарий и ошибка в ходе', () => {
  const g = new Game();
  play(g, 'e4');
  const e4 = g.positions[1].state();
  const text = `${START_STATE}\n[Вступление]\n${e4} W e4\n[ Лучший ход ]\n${e4} B ??\n`;
  const { game, error } = loadGame(text);
  assert.equal(game.notes[0], 'Вступление');
  assert.equal(game.notes[1].trim(), 'Лучший ход');
  assert.equal(game.length, 1);
  assert.match(error, /Строка 5/);
  assert.throws(() => loadGame('# White: X\n'));
  assert.throws(() => loadGame('00ABCDEF25160734mnopqrstwzv{u}xy'));
});
