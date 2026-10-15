#!/bin/sh
# Сборка клиента в docker-контейнере. Результат: ../server/www/{js,css,fonts}
set -e
cd "$(dirname "$0")"
HOST_UID=$(id -u) HOST_GID=$(id -g) docker compose run --rm build "$@"
