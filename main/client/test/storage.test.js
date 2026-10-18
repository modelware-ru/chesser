import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseTree, countGames } from '../src/chess/storage.js';
import { loadGame } from '../src/chess/game.js';

const GAMES = new URL('../../server/www/games/', import.meta.url);

test('дерево хранилища: узлы, листья и ошибки', () => {
  const tree = parseTree([{ title: ' A ', children: [{ title: 'B', children: [] }, { title: 'C', file: 'c.chessgame' }] }]);
  assert.deepEqual(tree, [{ title: 'A', children: [{ title: 'B', children: [] }, { title: 'C', file: 'c.chessgame' }] }]);
  assert.equal(countGames(tree), 1);
  assert.throws(() => parseTree({}), /массив/);
  assert.throws(() => parseTree([{ title: '' }]), /title/);
  assert.throws(() => parseTree([{ title: 'X', children: [{ title: 'Y' }] }]), /games\.json\[0\]\.children\[0\] «Y»/);
});

test('games.json: все партии существуют и загружаются', () => {
  const tree = parseTree(JSON.parse(fs.readFileSync(new URL('games.json', GAMES), 'utf8')));
  const leaves = [];
  const walk = (items) => items.forEach((i) => (i.children ? walk(i.children) : leaves.push(i)));
  walk(tree);
  assert.ok(leaves.length > 0);
  const files = fs.readdirSync(GAMES).filter((f) => f.endsWith('.chessgame'));
  assert.deepEqual([...new Set(leaves.map((l) => l.file))].sort(), files.sort());
  for (const leaf of leaves) {
    const { game, error } = loadGame(fs.readFileSync(new URL(leaf.file, GAMES), 'utf8'));
    assert.ok(!error, `${leaf.file}: ${error}`);
    assert.ok(game.length > 0, leaf.file);
  }
});
