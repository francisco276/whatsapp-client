#!/bin/bash
set -e

REMOTE="https://github.com/francisco276/simplifica-Whatsapp-server.git"
TMPDIR="/tmp/backend-push-v2"
BACKEND_SRC="/home/runner/workspace/backend"

echo "==> Limpiando directorio temporal..."
rm -rf "$TMPDIR"

echo "==> Clonando repo del backend..."
git clone "$REMOTE" "$TMPDIR"

echo "==> Creando rama v2 desde main..."
cd "$TMPDIR"
git checkout -b v2 origin/main

echo "==> Copiando todos los archivos del backend..."
cd "$BACKEND_SRC"
find . \
  -not -path './.git/*' \
  -not -path './node_modules/*' \
  -not -path './dist/*' \
  -not -name '.git' \
  | while read -r item; do
    dest="$TMPDIR/$item"
    if [ -d "$BACKEND_SRC/$item" ]; then
      mkdir -p "$dest"
    else
      mkdir -p "$(dirname "$dest")"
      cp "$BACKEND_SRC/$item" "$dest"
    fi
  done
cd "$TMPDIR"

echo "==> Archivos modificados:"
git status

echo "==> Agregando cambios..."
git add -A

echo "==> Commiteando..."
git commit -m "feat: apply all Replit backend updates

- fix: notifications - add API-Version header and full response logging
- fix: bulk send delay now applied on frontend between requests
- fix: board items pagination with cursor (removes 500 item limit)
- improvement: send progress shows pending contacts with wait time"

echo "==> Pusheando rama v2 a GitHub..."
git push origin v2

echo ""
echo "✅ Listo! Rama v2 subida a GitHub."
echo "   Abre un Pull Request en:"
echo "   https://github.com/francisco276/simplifica-Whatsapp-server/compare/v2"
