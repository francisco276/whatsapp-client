#!/bin/bash
set -e

echo "==> Creando rama v2 del frontend..."
git checkout -b v2

echo "==> Pusheando rama v2 a GitHub..."
git push origin v2

echo ""
echo "Listo! Rama v2 subida a GitHub."
echo "   https://github.com/francisco276/whatsapp-client/compare/v2"
