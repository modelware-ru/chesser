// Шахматная доска: отображение позиции, выбор клеток касанием/щелчком и перетаскиванием.
import { el, setChildren } from 'redom';
import { FILES, fileOf, rankOf, squareName } from '../chess/board.js';
import { pieceImage, PIECE_NAMES } from './pieces.js';

export class BoardView {
  constructor(onSquare) {
    this.onSquare = onSquare;
    this.flipped = null;
    this.selected = -1;
    this.drag = null;
    this.squares = [];
    for (let sq = 0; sq < 64; sq++) {
      const img = el('img.piece', { alt: '', draggable: false });
      const coordRank = el('span.coord.coord-rank', String(rankOf(sq) + 1));
      const coordFile = el('span.coord.coord-file', FILES[fileOf(sq)]);
      const square = el('div.sq', { 'data-sq': sq, title: squareName(sq) }, img);
      square.classList.add((fileOf(sq) + rankOf(sq)) % 2 ? 'light' : 'dark');
      this.squares.push({ el: square, img, coordRank, coordFile });
    }
    this.el = el('div.board', { role: 'grid', 'aria-label': 'Шахматная доска' });
    this.el.addEventListener('pointerdown', (e) => this.pointerDown(e));
    this.el.addEventListener('pointermove', (e) => this.pointerMove(e));
    this.el.addEventListener('pointerup', (e) => this.pointerUp(e));
    this.el.addEventListener('pointercancel', () => this.endDrag());
    this.el.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  squareFromEvent(e) {
    const target = document.elementFromPoint(e.clientX, e.clientY);
    const square = target && target.closest('.sq');
    return square && this.el.contains(square) ? Number(square.dataset.sq) : -1;
  }

  pointerDown(e) {
    if (e.button !== undefined && e.button !== 0) return;
    const sq = this.squareFromEvent(e);
    if (sq < 0) return;
    e.preventDefault();
    this.onSquare(sq);
    const { img } = this.squares[sq];
    if (this.selected === sq && img.src) {
      const rect = img.getBoundingClientRect();
      const ghost = el('img.piece-ghost', { src: img.src, alt: '' });
      ghost.style.width = `${rect.width}px`;
      ghost.style.height = `${rect.height}px`;
      document.body.appendChild(ghost);
      this.drag = { from: sq, ghost, size: rect.width, moved: false, x: e.clientX, y: e.clientY };
      this.el.setPointerCapture(e.pointerId);
      this.moveGhost(e);
    }
  }

  moveGhost(e) {
    const { ghost, size } = this.drag;
    ghost.style.transform = `translate(${e.clientX - size / 2}px, ${e.clientY - size / 2}px)`;
  }

  pointerMove(e) {
    if (!this.drag) return;
    if (!this.drag.moved && Math.hypot(e.clientX - this.drag.x, e.clientY - this.drag.y) > 4) {
      this.drag.moved = true;
      this.squares[this.drag.from].img.classList.add('dragging');
      this.drag.ghost.classList.add('visible');
    }
    this.moveGhost(e);
  }

  pointerUp(e) {
    if (!this.drag) return;
    const { from, moved } = this.drag;
    this.endDrag();
    if (!moved) return;
    const sq = this.squareFromEvent(e);
    if (sq >= 0 && sq !== from) this.onSquare(sq);
  }

  endDrag() {
    if (!this.drag) return;
    this.drag.ghost.remove();
    this.squares[this.drag.from].img.classList.remove('dragging');
    this.drag = null;
  }

  orient(flipped) {
    if (flipped === this.flipped) return;
    this.flipped = flipped;
    const order = [];
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const rank = flipped ? row : 7 - row;
        const file = flipped ? 7 - col : col;
        const sq = rank * 8 + file;
        const s = this.squares[sq];
        const labels = [];
        if (col === 0) labels.push(s.coordRank);
        if (row === 7) labels.push(s.coordFile);
        setChildren(s.el, [s.img, ...labels]);
        order.push(s.el);
      }
    }
    setChildren(this.el, order);
  }

  update({ position, flipped = false, selected = -1, targets = new Set(), lastMove = null, hint = null, interactive = true }) {
    this.endDrag();
    this.orient(flipped);
    this.selected = selected;
    const check = position.inCheck() ? position.kingSquare(position.turn) : -1;
    this.el.classList.toggle('interactive', interactive);
    for (let sq = 0; sq < 64; sq++) {
      const { el: square, img } = this.squares[sq];
      const piece = position.pieceAt(sq);
      if (piece) {
        const src = pieceImage(piece.color, piece.type);
        if (img.getAttribute('src') !== src) img.setAttribute('src', src);
        img.alt = `${piece.color === 'W' ? 'белый' : 'черный'} ${PIECE_NAMES[piece.type]}`;
      } else if (img.hasAttribute('src')) {
        img.removeAttribute('src');
        img.alt = '';
      }
      const c = square.classList;
      c.toggle('selected', sq === selected);
      c.toggle('target', targets.has(sq) && !piece);
      c.toggle('target-capture', targets.has(sq) && !!piece);
      c.toggle('last', !!lastMove && (lastMove.from === sq || lastMove.to === sq));
      c.toggle('hint', !!hint && (hint.from === sq || hint.to === sq));
      c.toggle('check', sq === check);
    }
  }
}
