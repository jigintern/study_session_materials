#!/usr/bin/env bash
# PR の差分から検査対象の slide.md を出す。
# 使い方: tools/slide-check/targets.sh <base> <head>
# 出力は 1 行 1 件で「error <path>」か「warn <path>」。規則は docs/slide-guidelines.md にある。
set -euo pipefail

if [ $# -ne 2 ]; then
  echo "usage: $0 <base> <head>" >&2
  exit 2
fi

cd "$(git rev-parse --show-toplevel)"
# `...` で merge-base からの差分を取る。base が先に進んでいても PR の変更だけが出る
# quotePath を切らないと、ASCII 以外を含むパスが引用符付きの 8 進表記で出て規則に一致しない
changed=$(git -c core.quotePath=false diff --name-only "$1...$2")

# 変更された教材 (<年>/<題材>) の slide.md は error で検査する
errors=$(
  printf '%s\n' "$changed" |
    awk -F/ '$1 ~ /^20[0-9][0-9]$/ && NF >= 3 { print $1 "/" $2 "/slide.md" }' |
    sort -u |
    while IFS= read -r slide; do
      if [ -f "$slide" ]; then echo "$slide"; fi
    done
)

# 描画に効く共通ファイルが変わったら、残りの全スライドを warn で検査する
common=$(
  printf '%s\n' "$changed" |
    grep -E '^(engine\.mjs|\.marprc\.yml|package\.json|pnpm-lock\.yaml|tools/slide-check/.*|\.github/workflows/slide-check\.yml)$' ||
    true
)

if [ -n "$errors" ]; then printf '%s\n' "$errors" | sed 's/^/error /'; fi
if [ -n "$common" ]; then
  for slide in 20*/*/slide.md; do
    if [ -f "$slide" ] && ! printf '%s\n' "$errors" | grep -qxF "$slide"; then
      echo "warn $slide"
    fi
  done
fi
