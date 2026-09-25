#!/usr/bin/env bash
# ビルドするスライドを matrix の include に渡す JSON 配列で出す。
# 使い方: tools/build-slides/targets.sh [<base> <head>]
# 引数がなければ slides.json の全件を出す。あれば base...head の差分で変わった教材だけに絞る。
set -euo pipefail

if [ $# -ne 0 ] && [ $# -ne 2 ]; then
  echo "usage: $0 [<base> <head>]" >&2
  exit 2
fi

cd "$(git rev-parse --show-toplevel)"
slides=tools/build-slides/slides.json

if [ $# -eq 0 ]; then
  jq -c . "$slides"
  exit 0
fi

# `...` で merge-base からの差分を取る。base が先に進んでいても PR の変更だけが出る
# quotePath を切らないと、ASCII 以外を含むパスが引用符付きの 8 進表記で出て一致しない
changed=$(git -c core.quotePath=false diff --name-only "$1...$2")

# 描画に効く共通ファイルが変わったら全件をビルドする
if printf '%s\n' "$changed" |
  grep -qE '^(engine\.mjs|\.marprc\.yml|package\.json|pnpm-lock\.yaml|tools/build-slides/targets\.sh|\.github/workflows/build-slides\.yml)$'; then
  jq -c . "$slides"
  exit 0
fi

printf '%s\n' "$changed" |
  jq -cnR --slurpfile slides "$slides" '
    [inputs] as $changed
    | $slides[0] | map(select(.slide as $dir | $changed | any(startswith($dir + "/"))))
  '
