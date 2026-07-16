#!/usr/bin/env sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
PROJECT_ROOT=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)
PROJECT_NAME=$(basename "$PROJECT_ROOT")
EXPORT_ROOT="$PROJECT_ROOT/dist/export"
ZIP_PATH="$EXPORT_ROOT/$PROJECT_NAME-clean.zip"

if ! command -v zip >/dev/null 2>&1; then
  echo "zip command is required to create the clean export." >&2
  exit 1
fi

mkdir -p "$EXPORT_ROOT"
rm -f "$ZIP_PATH"

(
  cd "$PROJECT_ROOT"
  zip -r "$ZIP_PATH" . \
    -x '.git/*' \
    -x 'node_modules/*' \
    -x '.next/*' \
    -x 'dist/*' \
    -x 'exports/*' \
    -x '.idea/*' \
    -x '.vscode/*' \
    -x '.env' \
    -x '.env.*' \
    -x '*.log' \
    -x '*.tmp' \
    -x '*.temp' \
    -x '*.zip' \
    -x '.DS_Store' \
    -x 'Thumbs.db'
  [ -f ".env.example" ] && zip "$ZIP_PATH" ".env.example" >/dev/null
)

echo "Export created: $ZIP_PATH"
