import { mount } from 'redom';
import { App } from './ui/app.js';

function start() {
  mount(document.getElementById('app'), new App());
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
else start();
