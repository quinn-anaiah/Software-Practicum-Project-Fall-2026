#!/usr/bin/env bash

set -euo pipefail

formula="postgresql@17"

if ! command -v brew >/dev/null 2>&1; then
  echo "Homebrew is required but was not found in PATH." >&2
  exit 1
fi

postgres_prefix="$(brew --prefix "$formula")"

brew services start "$formula"

if "$postgres_prefix/bin/pg_isready" --dbname=postgres >/dev/null; then
  echo "PostgreSQL is running. Connect with:"
  echo "  $postgres_prefix/bin/psql -d postgres"
else
  echo "PostgreSQL service was started but is not accepting connections yet." >&2
  exit 1
fi
