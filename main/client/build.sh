#!/bin/sh
# Локальная сборка клиента. Результат: ../server/www/{js,css,fonts}
set -e
cd "$(dirname "$0")"
npm install --no-audit --no-fund
npm test
npm run build
