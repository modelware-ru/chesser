// Приложение: создание новой партии (режим записи) и проигрывание загруженной партии.
import { el, setChildren } from 'redom';
import { WHITE, BLACK } from '../chess/board.js';
import { sameMove } from '../chess/position.js';
import { Game, HEADER_KEYS, FILE_EXTENSION, loadGame, serializeGame } from '../chess/game.js';
import { BoardView } from './board-view.js';
import { choose, confirmDialog, promptText, notify, messageArea, settingsDialog } from './dialogs.js';
import { pieceImage } from './pieces.js';

const HEADER_LABELS = { White: 'Белые', Black: 'Черные', Place: 'Место', Date: 'Дата', Note: 'Описание' };
const SIDE_LABELS = { W: 'за белых', B: 'за черных', both: 'за обе стороны' };
const AUTO_DELAY = 700;
const SETTINGS_KEY = 'chesser.settings';
const SETTINGS = [
  { key: 'showInfo', label: 'Показывать информацию об игре' },
  { key: 'showComments', label: 'Показывать комментарии к ходам' },
  { key: 'showMoves', label: 'Показывать сыгранные ходы' },
];

function loadSettings() {
  const values = { showInfo: true, showComments: true, showMoves: true };
  try {
    const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
    for (const { key } of SETTINGS) if (typeof saved[key] === 'boolean') values[key] = saved[key];
  } catch (e) {
    // настройки по умолчанию
  }
  return values;
}

function saveSettings(values) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(values));
  } catch (e) {
    // хранилище недоступно — настройки действуют до перезагрузки страницы
  }
}

function icon(name) {
  return el(`i.bi.bi-${name}`, { 'aria-hidden': 'true' });
}

function button(cls, iconName, label, onClick, title = label) {
  const b = el(`button.btn.${cls}`, { type: 'button', title }, icon(iconName), label ? el('span.ms-1.btn-label', label) : null);
  b.addEventListener('click', onClick);
  return b;
}

function colorName(color, genitive = false) {
  if (genitive) return color === WHITE ? 'белых' : 'черных';
  return color === WHITE ? 'белые' : 'черные';
}

function moveNumber(pos) {
  return `${pos.fullmove}.${pos.turn === BLACK ? '..' : ''}`;
}

export class App {
  constructor() {
    this.mode = 'edit'; // 'edit' | 'play'
    this.game = new Game();
    this.cursor = 0; // номер отображаемой позиции
    this.side = 'both'; // за кого играет пользователь в режиме проигрывания
    this.flipped = false;
    this.selected = -1;
    this.hint = null;
    this.dirty = false;
    this.timer = null;
    this.fileName = '';
    this.settings = loadSettings();

    this.board = new BoardView((sq) => this.onSquare(sq));
    this.fileInput = el('input.d-none', { type: 'file', accept: `${FILE_EXTENSION},text/plain` });
    this.fileInput.addEventListener('change', () => this.readFile());

    this.saveButton = button('btn-outline-light.btn-sm', 'download', 'Сохранить', () => this.save());
    this.editButton = button('btn-outline-light.btn-sm', 'pencil', 'Редактировать', () => this.toEdit());
    const nav = el('nav.navbar.navbar-dark.bg-dark.px-2.py-1',
      el('span.navbar-brand.d-flex.align-items-center.gap-2', icon('grid-3x3'), 'Chesser'),
      el('div.d-flex.flex-wrap.gap-1',
        button('btn-outline-light.btn-sm', 'file-earmark-plus', 'Новая', () => this.newGame(), 'Новая партия'),
        button('btn-outline-light.btn-sm', 'folder2-open', 'Открыть', () => this.open(), 'Открыть партию'),
        this.saveButton,
        this.editButton,
        button('btn-outline-light.btn-sm', 'gear', 'Настройки', () => this.openSettings())));

    this.toolbar = el('div.toolbar.d-flex.flex-wrap.justify-content-center.gap-1.mt-2');
    this.status = el('div.status.alert.py-2.mb-2');
    this.panel = el('div.panel');

    this.el = el('div.app',
      nav,
      el('div.container-fluid.py-2',
        el('div.row.g-3',
          el('div.col-12.col-lg-7.col-xl-6.offset-xl-1',
            el('div.board-wrap', messageArea(), this.board),
            this.toolbar),
          el('div.col-12.col-lg-5.col-xl-4',
            this.status,
            this.panel))),
      this.fileInput);

    this.buildEditPanel();
    this.buildPlayPanel();

    window.addEventListener('beforeunload', (e) => {
      if (this.dirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    });
    window.addEventListener('keydown', (e) => this.onKey(e));
    this.render();
  }

  // ---------- Панели ----------

  buildEditPanel() {
    this.headerInputs = {};
    const fields = HEADER_KEYS.map((key) => {
      const input = el('input.form-control.form-control-sm', {
        type: 'text', id: `h-${key}`, placeholder: HEADER_LABELS[key], autocomplete: 'off',
      });
      input.addEventListener('input', () => {
        this.game.headers[key] = input.value;
        this.dirty = true;
      });
      this.headerInputs[key] = input;
      return el(key === 'Note' ? 'div.col-12' : 'div.col-6',
        el('label.form-label.small.mb-0', { for: `h-${key}` }, HEADER_LABELS[key]),
        input);
    });
    this.noteInput = el('textarea.form-control', { rows: 4, id: 'note', placeholder: 'Комментарий к текущему ходу' });
    this.noteInput.addEventListener('input', () => {
      this.game.notes[this.cursor] = this.noteInput.value;
      this.dirty = true;
      this.renderMoves();
    });
    this.noteLabel = el('label.form-label.fw-semibold.mb-1', { for: 'note' });
    this.editMoves = el('div.moves');
    this.headerCard = el('div.card.mb-2', el('div.card-body.p-2', el('div.row.g-2', fields)));
    this.noteCard = el('div.card.mb-2', el('div.card-body.p-2', this.noteLabel, this.noteInput));
    this.editMovesCard = el('div.card', el('div.card-header.py-1.small.fw-semibold', 'Ходы партии'), el('div.card-body.p-2', this.editMoves));
    this.editPanel = el('div', this.headerCard, this.noteCard, this.editMovesCard);
  }

  buildPlayPanel() {
    this.playInfo = el('div.small');
    this.playSide = el('div.small.text-body-secondary.mb-2');
    this.infoCard = el('div.card.mb-2', el('div.card-body.p-2', this.playInfo));
    this.comment = el('div.comment');
    this.commentTitle = el('div.card-header.py-1.small.fw-semibold');
    this.playMoves = el('div.moves');
    this.commentCard = el('div.card.mb-2.comment-card', this.commentTitle, el('div.card-body.p-2', this.comment));
    this.movesCard = el('div.card', el('div.card-header.py-1.small.fw-semibold', 'Сыгранные ходы'), el('div.card-body.p-2', this.playMoves));
    this.playPanel = el('div', this.playSide, this.infoCard, this.commentCard, this.movesCard);
  }

  // ---------- Состояние ----------

  get position() {
    return this.game.positions[this.cursor];
  }

  isUserTurn() {
    if (this.mode === 'edit') return true;
    if (this.cursor >= this.game.length) return false;
    return this.side === 'both' || this.side === this.position.turn;
  }

  clearTimer() {
    clearTimeout(this.timer);
    this.timer = null;
  }

  // ---------- Отрисовка ----------

  render() {
    const pos = this.position;
    const targets = new Set();
    if (this.selected >= 0) {
      for (const m of pos.legalMoves()) if (m.from === this.selected) targets.add(m.to);
    }
    const last = this.cursor > 0 ? this.game.moves[this.cursor - 1].move : null;
    this.board.update({
      position: pos, flipped: this.flipped, selected: this.selected, targets,
      lastMove: last, hint: this.hint, interactive: this.isUserTurn(),
    });
    this.saveButton.classList.toggle('d-none', this.mode !== 'edit');
    this.editButton.classList.toggle('d-none', this.mode !== 'play');
    this.renderStatus();
    this.renderToolbar();
    if (this.mode === 'edit') {
      setChildren(this.panel, [this.editPanel]);
      this.headerCard.classList.toggle('d-none', !this.settings.showInfo);
      this.noteCard.classList.toggle('d-none', !this.settings.showComments);
      this.editMovesCard.classList.toggle('d-none', !this.settings.showMoves);
      for (const key of HEADER_KEYS) {
        const v = this.game.headers[key] || '';
        if (this.headerInputs[key].value !== v) this.headerInputs[key].value = v;
      }
      this.noteLabel.textContent = this.cursor === 0
        ? 'Комментарий к начальной позиции'
        : `Комментарий к ходу ${this.moveTitle(this.cursor - 1)}`;
      const note = this.game.notes[this.cursor] || '';
      if (this.noteInput.value !== note) this.noteInput.value = note;
    } else {
      setChildren(this.panel, [this.playPanel]);
      this.infoCard.classList.toggle('d-none', !this.settings.showInfo);
      this.commentCard.classList.toggle('d-none', !this.settings.showComments);
      this.movesCard.classList.toggle('d-none', !this.settings.showMoves);
      this.renderPlayInfo();
      this.renderComment();
    }
    this.renderMoves();
  }

  moveTitle(index) {
    const m = this.game.moves[index];
    return `${moveNumber(this.game.positions[index])} ${m.san}`;
  }

  renderStatus() {
    const pos = this.position;
    const st = pos.status();
    let text;
    let cls = 'alert-secondary';
    if (st === 'mate') {
      text = `Мат. Победили ${colorName(pos.turn === WHITE ? BLACK : WHITE)}`;
      cls = 'alert-success';
    } else if (st === 'stalemate') {
      text = 'Пат. Ничья';
      cls = 'alert-success';
    } else if (this.mode === 'play' && this.cursor >= this.game.length) {
      text = 'Партия завершена';
      cls = 'alert-success';
    } else {
      text = `Ход ${colorName(pos.turn, true)}`;
      if (pos.inCheck()) {
        text += ' — шах!';
        cls = 'alert-warning';
      }
      if (this.mode === 'play') {
        text += this.isUserTurn() ? ' — ваш ход' : ' — ход соперника…';
        if (this.isUserTurn()) cls = cls === 'alert-warning' ? cls : 'alert-primary';
      } else if (this.cursor < this.game.length) {
        text += ` (просмотр хода ${this.cursor} из ${this.game.length})`;
      }
    }
    this.status.className = `status alert py-2 mb-2 ${cls}`;
    this.status.textContent = text;
  }

  renderToolbar() {
    const flip = button('btn-outline-secondary', 'arrow-down-up', '', () => {
      this.flipped = !this.flipped;
      this.render();
    }, 'Перевернуть доску');
    if (this.mode === 'edit') {
      const nav = (i) => () => this.goTo(i);
      const atStart = this.cursor === 0;
      const atEnd = this.cursor === this.game.length;
      const items = [
        button('btn-outline-secondary', 'chevron-bar-left', '', nav(0), 'В начало'),
        button('btn-outline-secondary', 'chevron-left', '', nav(this.cursor - 1), 'Предыдущий ход'),
        button('btn-outline-secondary', 'chevron-right', '', nav(this.cursor + 1), 'Следующий ход'),
        button('btn-outline-secondary', 'chevron-bar-right', '', nav(this.game.length), 'В конец'),
        flip,
        button('btn-outline-danger', 'arrow-counterclockwise', 'Отменить ход', () => this.undo(), 'Отменить последний ход'),
      ];
      items[0].disabled = items[1].disabled = atStart;
      items[2].disabled = items[3].disabled = atEnd;
      items[5].disabled = !this.game.length;
      setChildren(this.toolbar, items);
    } else {
      const hint = button('btn-warning', 'lightbulb', 'Подсказка', () => this.showHint());
      hint.disabled = !this.isUserTurn();
      const back = button('btn-outline-secondary', 'arrow-counterclockwise', 'Назад', () => this.playBack(), 'Вернуть ход');
      back.disabled = this.cursor === 0;
      setChildren(this.toolbar, [
        button('btn-outline-secondary', 'skip-start', 'Сначала', () => this.restart(), 'Начать сначала'),
        back, flip, hint,
      ]);
    }
  }

  renderMoves() {
    const container = this.mode === 'edit' ? this.editMoves : this.playMoves;
    const count = this.mode === 'edit' ? this.game.length : this.cursor;
    if (!count) {
      setChildren(container, [el('span.text-body-secondary.small',
        this.mode === 'edit' ? 'Сделайте ход фигурой на доске' : 'Ходов пока нет')]);
      return;
    }
    const items = [];
    for (let i = 0; i < count; i++) {
      const pos = this.game.positions[i];
      if (pos.turn === WHITE || i === 0) items.push(el('span.move-no', moveNumber(pos)));
      const m = this.game.moves[i];
      const note = this.settings.showComments ? (this.game.notes[i + 1] || '').trim() : '';
      const item = el('button.move.btn.btn-sm', { type: 'button' },
        m.san, note ? el('i.bi.bi-chat-left-text.ms-1.small', { 'aria-hidden': 'true' }) : null);
      if (i + 1 === this.cursor) item.classList.add('active');
      if (this.mode === 'edit') item.addEventListener('click', () => this.goTo(i + 1));
      else item.disabled = true;
      items.push(item);
    }
    setChildren(container, items);
    const active = container.querySelector('.active');
    if (active) active.scrollIntoView({ block: 'nearest' });
  }

  renderPlayInfo() {
    const h = this.game.headers;
    const rows = [];
    if (this.fileName) rows.push(el('div.fw-semibold.text-truncate', this.fileName));
    const players = `${h.White || '?'} — ${h.Black || '?'}`;
    rows.push(el('div', players));
    const extra = [h.Place, h.Date].filter(Boolean).join(', ');
    if (extra) rows.push(el('div.text-body-secondary', extra));
    if (h.Note) rows.push(el('div.fst-italic', h.Note));
    setChildren(this.playInfo, rows);
    this.playSide.textContent = `Вы играете ${SIDE_LABELS[this.side]}. Ход ${this.cursor} из ${this.game.length}.`;
  }

  // Комментарии ко всем сыгранным ходам; последний ход выделен.
  renderComment() {
    this.commentTitle.textContent = 'Комментарии';
    const items = [];
    for (let i = 0; i <= this.cursor; i++) {
      const note = (this.game.notes[i] || '').trim();
      if (!note && i !== this.cursor) continue;
      const title = i === 0 ? 'Начальная позиция' : this.moveTitle(i - 1);
      items.push(el(`div.note${i === this.cursor ? '.current' : ''}`,
        el('div.note-title', title),
        note ? el('div.note-text', note) : el('div.text-body-secondary.small', 'Комментария нет')));
    }
    setChildren(this.comment, items);
    this.comment.scrollTop = this.comment.scrollHeight;
  }

  openSettings() {
    settingsDialog(SETTINGS, this.settings, (key, value) => {
      this.settings[key] = value;
      saveSettings(this.settings);
      this.render();
    });
  }

  // ---------- Ходы ----------

  onSquare(sq) {
    if (!this.isUserTurn()) return;
    const pos = this.position;
    const piece = pos.pieceAt(sq);
    if (this.selected >= 0 && this.selected !== sq) {
      const moves = pos.legalMoves().filter((m) => m.from === this.selected && m.to === sq);
      if (moves.length) {
        this.tryMove(moves);
        return;
      }
      if (!piece || piece.color !== pos.turn) {
        const own = pos.pieceAt(this.selected);
        if (own) notify('Недопустимый ход', 'danger', 2000);
        this.selected = -1;
        this.render();
        return;
      }
    }
    if (piece && piece.color === pos.turn) {
      this.selected = this.selected === sq ? -1 : sq;
      if (this.selected >= 0 && !pos.legalMoves().some((m) => m.from === sq)) {
        notify('Этой фигурой нельзя сделать ход', 'warning', 2000);
      }
    } else {
      if (piece) notify(`Сейчас ход ${colorName(pos.turn, true)}`, 'warning', 2000);
      this.selected = -1;
    }
    this.render();
  }

  async tryMove(moves) {
    let move = moves[0];
    if (moves.length > 1) {
      const color = this.position.turn;
      const type = await choose('Превращение пешки', 'Выберите фигуру', ['Q', 'R', 'B', 'N'].map((t) => ({
        label: el('img.promo-piece', { src: pieceImage(color, t), alt: t }), value: t, cls: 'btn-light border',
      })));
      if (!type) {
        this.selected = -1;
        this.render();
        return;
      }
      move = moves.find((m) => m.promotion === type);
    }
    this.selected = -1;
    if (this.mode === 'edit') await this.recordMove(move);
    else this.checkMove(move);
  }

  async recordMove(move) {
    if (this.cursor < this.game.length) {
      const ok = await confirmDialog('Новый ход',
        `Ходы после текущей позиции (${this.game.length - this.cursor}) будут удалены. Продолжить?`, 'Удалить и сделать ход');
      if (!ok) {
        this.render();
        return;
      }
      this.game.truncate(this.cursor);
    }
    this.game.addMove(move);
    this.cursor = this.game.length;
    this.dirty = true;
    this.render();
    this.announceEnd();
  }

  announceEnd() {
    const st = this.position.status();
    if (st === 'mate') notify(`Мат! Победили ${colorName(this.position.turn === WHITE ? BLACK : WHITE)}`, 'success');
    else if (st === 'stalemate') notify('Пат. Ничья', 'success');
  }

  goTo(index) {
    this.cursor = Math.max(0, Math.min(this.game.length, index));
    this.selected = -1;
    this.render();
  }

  undo() {
    if (!this.game.length) return;
    this.game.truncate(this.game.length - 1);
    this.cursor = this.game.length;
    this.selected = -1;
    this.dirty = true;
    this.render();
  }

  onKey(e) {
    if (e.target.closest && e.target.closest('input, textarea, .modal')) return;
    if (this.mode !== 'edit') return;
    if (e.key === 'ArrowLeft') this.goTo(this.cursor - 1);
    else if (e.key === 'ArrowRight') this.goTo(this.cursor + 1);
    else if (e.key === 'Home') this.goTo(0);
    else if (e.key === 'End') this.goTo(this.game.length);
    else return;
    e.preventDefault();
  }

  // ---------- Проигрывание ----------

  checkMove(move) {
    const expected = this.game.moves[this.cursor];
    if (!sameMove(move, expected.move)) {
      notify('Неверно: в партии был сделан другой ход. Попробуйте ещё раз или воспользуйтесь подсказкой.', 'danger');
      this.render();
      return;
    }
    this.advance();
  }

  advance() {
    this.hint = null;
    this.cursor++;
    this.render();
    if (this.cursor >= this.game.length) {
      notify('Партия завершена', 'success');
      return;
    }
    this.scheduleOpponent();
  }

  scheduleOpponent() {
    this.clearTimer();
    if (this.mode === 'play' && this.cursor < this.game.length && !this.isUserTurn()) {
      this.timer = setTimeout(() => {
        this.timer = null;
        this.advance();
      }, AUTO_DELAY);
    }
  }

  showHint() {
    if (!this.isUserTurn()) return;
    const m = this.game.moves[this.cursor];
    this.hint = { from: m.move.from, to: m.move.to };
    this.selected = -1;
    notify(`Подсказка: ${moveNumber(this.position)} ${m.san}`, 'warning');
    this.render();
  }

  restart() {
    this.clearTimer();
    this.cursor = 0;
    this.hint = null;
    this.selected = -1;
    this.render();
    this.scheduleOpponent();
  }

  playBack() {
    this.clearTimer();
    this.hint = null;
    this.selected = -1;
    if (this.cursor > 0) this.cursor--;
    while (this.cursor > 0 && !this.isUserTurn()) this.cursor--;
    this.render();
    this.scheduleOpponent();
  }

  startPlay(side) {
    this.clearTimer();
    this.mode = 'play';
    this.side = side;
    this.flipped = side === BLACK;
    this.cursor = 0;
    this.hint = null;
    this.selected = -1;
    this.render();
    this.scheduleOpponent();
  }

  toEdit() {
    this.clearTimer();
    this.mode = 'edit';
    this.hint = null;
    this.selected = -1;
    this.render();
  }

  // ---------- Файлы ----------

  async discardChanges() {
    if (!this.dirty) return true;
    return confirmDialog('Несохранённые изменения', 'Текущая партия не сохранена. Продолжить без сохранения?', 'Продолжить');
  }

  async newGame() {
    if (!(await this.discardChanges())) return;
    this.clearTimer();
    this.game = new Game();
    this.mode = 'edit';
    this.cursor = 0;
    this.flipped = false;
    this.selected = -1;
    this.hint = null;
    this.dirty = false;
    this.fileName = '';
    this.render();
    notify('Создана новая партия. Заполните поля и делайте ходы на доске.', 'info');
  }

  async open() {
    if (!(await this.discardChanges())) return;
    this.fileInput.value = '';
    this.fileInput.click();
  }

  async readFile() {
    const file = this.fileInput.files[0];
    if (!file) return;
    let result;
    try {
      result = loadGame(await file.text());
    } catch (e) {
      notify(`Не удалось открыть «${file.name}»: ${e.message}`, 'danger', 6000);
      return;
    }
    const { game, error } = result;
    if (error) notify(`${error}. Партия загружена до этого хода.`, 'warning', 7000);
    this.clearTimer();
    this.game = game;
    this.fileName = file.name;
    this.dirty = false;
    this.cursor = 0;
    this.selected = -1;
    this.hint = null;
    const h = game.headers;
    const about = this.settings.showInfo ? `${h.White || '?'} — ${h.Black || '?'}, ходов` : 'Ходов';
    const side = await choose('Партия загружена', `${about}: ${game.length}. За кого вы будете играть?`, [
        { label: 'За белых', value: WHITE, cls: 'btn-light border' },
        { label: 'За черных', value: BLACK, cls: 'btn-dark' },
        { label: 'За обоих', value: 'both', cls: 'btn-primary' },
        { label: 'Редактировать', value: 'edit', cls: 'btn-outline-secondary' },
      ]);
    if (side === 'edit') {
      this.mode = 'edit';
      this.flipped = false;
      this.render();
    } else {
      this.startPlay(side || 'both');
    }
  }

  defaultFileName() {
    if (this.fileName) return this.fileName.replace(/\.chessgame$/i, '');
    const h = this.game.headers;
    const parts = [h.White, h.Black, h.Date].map((s) => (s || '').trim()).filter(Boolean);
    return (parts.join('-') || 'партия').replace(/[\\/:*?"<>|]+/g, '_');
  }

  async save() {
    let name = await promptText('Сохранение партии', 'Имя файла', this.defaultFileName());
    if (name === null) return;
    name = name.trim().replace(/[\\/:*?"<>|]+/g, '_');
    if (!name) {
      notify('Имя файла не указано', 'danger');
      return;
    }
    if (!name.toLowerCase().endsWith(FILE_EXTENSION)) name += FILE_EXTENSION;
    const blob = new Blob([serializeGame(this.game)], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = el('a', { href: url, download: name });
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    this.fileName = name;
    this.dirty = false;
    notify(`Партия сохранена в файл «${name}»`, 'success');
  }
}
