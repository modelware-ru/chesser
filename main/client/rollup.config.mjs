import fs from 'node:fs';
import path from 'node:path';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';

const WWW = '../server/www';
const production = !process.env.ROLLUP_WATCH;

// Импорт .svg как data-URI строки.
function svg() {
  return {
    name: 'svg',
    load(id) {
      if (!id.endsWith('.svg')) return null;
      const text = fs.readFileSync(id, 'utf8');
      return `export default ${JSON.stringify('data:image/svg+xml;charset=utf-8,' + encodeURIComponent(text))};`;
    },
  };
}

// Копирование стилей и шрифтов в www.
function assets() {
  const copy = (from, to, transform) => {
    fs.mkdirSync(path.dirname(to), { recursive: true });
    if (transform) fs.writeFileSync(to, transform(fs.readFileSync(from, 'utf8')));
    else fs.copyFileSync(from, to);
  };
  return {
    name: 'assets',
    buildStart() {
      this.addWatchFile('src/css/app.css');
    },
    writeBundle() {
      copy('node_modules/bootstrap/dist/css/bootstrap.min.css', `${WWW}/css/bootstrap.min.css`);
      copy('node_modules/bootstrap-icons/font/bootstrap-icons.min.css', `${WWW}/css/bootstrap-icons.min.css`,
        (css) => css.replaceAll('./fonts/', '../fonts/').replaceAll('url("fonts/', 'url("../fonts/'));
      for (const font of fs.readdirSync('node_modules/bootstrap-icons/font/fonts')) {
        copy(`node_modules/bootstrap-icons/font/fonts/${font}`, `${WWW}/fonts/${font}`);
      }
      copy('src/css/app.css', `${WWW}/css/app.css`);
    },
  };
}

export default {
  input: 'src/main.js',
  output: {
    file: `${WWW}/js/app.js`,
    format: 'iife',
    sourcemap: !production,
  },
  plugins: [svg(), nodeResolve({ browser: true }), production && terser(), assets()],
};
