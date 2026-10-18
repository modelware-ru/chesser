// Хранилище партий: дерево из games.json, листья которого — файлы партий в той же папке.
export const STORAGE_INDEX = 'games/games.json';

// Проверяет и нормализует дерево: узел — { title, children }, лист — { title, file }.
// Пустые узлы оставляются; некорректные элементы приводят к ошибке с указанием пути.
export function parseTree(data, path = 'games.json') {
  if (!Array.isArray(data)) throw new Error(`${path}: ожидается массив узлов`);
  return data.map((item, i) => {
    const where = `${path}[${i}]`;
    if (!item || typeof item !== 'object') throw new Error(`${where}: ожидается объект`);
    const title = typeof item.title === 'string' ? item.title.trim() : '';
    if (!title) throw new Error(`${where}: нет названия (title)`);
    if (typeof item.file === 'string' && item.file.trim()) return { title, file: item.file.trim() };
    if (Array.isArray(item.children)) return { title, children: parseTree(item.children, `${where}.children`) };
    throw new Error(`${where} «${title}»: нужно поле file или children`);
  });
}

// Количество партий (листьев) в дереве.
export function countGames(tree) {
  return tree.reduce((n, item) => n + (item.children ? countGames(item.children) : 1), 0);
}

async function fetchText(url) {
  const response = await fetch(url, { cache: 'no-cache' });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`.trim());
  return response.text();
}

// Загружает дерево хранилища. Пути файлов в листьях задаются относительно games.json.
export async function loadStorage(indexUrl = STORAGE_INDEX) {
  const base = new URL(indexUrl, document.baseURI);
  const tree = parseTree(JSON.parse(await fetchText(base)));
  return { tree, base };
}

export function loadStoredGame(base, file) {
  return fetchText(new URL(file, base));
}
