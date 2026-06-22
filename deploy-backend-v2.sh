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
rsync -av \
  --exclude='.git' \
  --exclude='node_modules' \
  --exclude='dist' \
  "$BACKEND_SRC/" "$TMPDIR/"

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
