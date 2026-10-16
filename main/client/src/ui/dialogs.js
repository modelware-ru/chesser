// Модальные окна bootstrap и всплывающие сообщения.
import { el, setChildren } from 'redom';
import { Modal } from 'bootstrap';

let modal = null;
const parts = {};

function ensureModal() {
  if (modal) return;
  parts.title = el('h5.modal-title');
  parts.close = el('button.btn-close', { type: 'button', 'data-bs-dismiss': 'modal', 'aria-label': 'Закрыть' });
  parts.body = el('div.modal-body');
  parts.footer = el('div.modal-footer');
  parts.root = el('div.modal.fade', { tabindex: -1, 'aria-hidden': 'true' },
    el('div.modal-dialog.modal-dialog-centered',
      el('div.modal-content',
        el('div.modal-header', parts.title, parts.close),
        parts.body,
        parts.footer)));
  document.body.appendChild(parts.root);
  modal = new Modal(parts.root);
}

let pending = Promise.resolve();

// Показывает окно. options: [{ label, value, cls }]. Возвращает выбранное значение или null.
function show({ title, body, options, onShown, getValue }) {
  const run = () => new Promise((resolve) => {
    ensureModal();
    let result = null;
    parts.title.textContent = title;
    setChildren(parts.body, body ? [body] : []);
    parts.body.classList.toggle('d-none', !body);
    const finish = (value) => {
      result = value;
      modal.hide();
    };
    setChildren(parts.footer, options.map((o) => {
      const b = el(`button.btn.${o.cls || 'btn-primary'}`, { type: o.submit ? 'submit' : 'button' }, o.label);
      b.addEventListener('click', () => finish(getValue && o.value === true ? getValue() : o.value));
      return b;
    }));
    parts.finish = finish;
    const shown = () => {
      parts.root.removeEventListener('shown.bs.modal', shown);
      if (onShown) onShown(finish);
      else parts.footer.querySelector('button')?.focus();
    };
    const hidden = () => {
      parts.root.removeEventListener('hidden.bs.modal', hidden);
      resolve(result);
    };
    parts.root.addEventListener('shown.bs.modal', shown);
    parts.root.addEventListener('hidden.bs.modal', hidden);
    modal.show();
  });
  const p = pending.then(run);
  pending = p.catch(() => {});
  return p;
}

export function choose(title, text, options) {
  const body = text ? (typeof text === 'string' ? el('p.mb-0', text) : text) : null;
  return show({ title, body, options });
}

export function confirmDialog(title, text, okLabel = 'Да') {
  return choose(title, text, [
    { label: 'Отмена', value: false, cls: 'btn-outline-secondary' },
    { label: okLabel, value: true, cls: 'btn-primary' },
  ]).then(Boolean);
}

export function promptText(title, label, value = '') {
  const input = el('input.form-control', { type: 'text', value, id: 'dialog-input', autocomplete: 'off' });
  const form = el('form', el('label.form-label', { for: 'dialog-input' }, label), input);
  return show({
    title,
    body: form,
    getValue: () => input.value,
    options: [
      { label: 'Отмена', value: null, cls: 'btn-outline-secondary' },
      { label: 'OK', value: true, cls: 'btn-primary' },
    ],
    onShown: (finish) => {
      form.onsubmit = (e) => {
        e.preventDefault();
        finish(input.value);
      };
      input.focus();
      input.select();
    },
  });
}

// Подсказки и сообщения выводятся в фиксированное поле над доской (одно сообщение за раз).
const messageBar = el('div.message-bar', { role: 'status', 'aria-live': 'polite' });
let messageTimer = null;

export function messageArea() {
  return messageBar;
}

export function notify(text, type = 'info', timeout = 3500) {
  clearTimeout(messageTimer);
  setChildren(messageBar, [el(`div.message.alert.alert-${type}`, { role: type === 'danger' ? 'alert' : null }, text)]);
  messageTimer = setTimeout(() => setChildren(messageBar, []), timeout);
}

// Окно настроек: options — [{ key, label }], values — текущие значения; onChange(key, value) вызывается сразу.
export function settingsDialog(options, values, onChange) {
  const body = el('div', options.map(({ key, label }) => {
    const input = el('input.form-check-input', { type: 'checkbox', id: `opt-${key}` });
    input.checked = Boolean(values[key]);
    input.addEventListener('change', () => onChange(key, input.checked));
    return el('div.form-check.form-switch.mb-2', input, el('label.form-check-label', { for: `opt-${key}` }, label));
  }));
  return choose('Настройки', body, [{ label: 'Закрыть', value: null, cls: 'btn-primary' }]);
}
