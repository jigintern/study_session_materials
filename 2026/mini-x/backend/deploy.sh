#!/usr/bin/env bash
# 使い方: ./deploy.sh <組織名> [アプリ名] [KV の名前]
set -euo pipefail
cd "$(dirname "$0")"

usage='使い方: ./deploy.sh <組織名> [アプリ名] [KV の名前]'
org=${1:?$usage}
app=${2:-mini-x-2026}
kv=${3:-}

# 終了コードは deno deploy --help の記載による (4 NOT_FOUND, 5 CONFLICT)
if deno deploy apps get --org "$org" --app "$app" >/dev/null; then
  echo "アプリ $app は作成済みなので、作成を省略します"
else
  status=$?
  [ "$status" -eq 4 ] || exit "$status"
  # create は作成と同時にデプロイもするが、KV が未割り当てで起動に失敗する。待たずに KV の割り当てへ進む
  deno deploy create --org "$org" --app "$app" \
    --source local --runtime-mode dynamic --entrypoint main.ts --region global \
    --no-wait
fi

if [ -z "$kv" ]; then
  kv="$app-kv"
  deno deploy database provision "$kv" --kind denokv --org "$org" || {
    status=$?
    if [ "$status" -ne 5 ]; then
      echo "KV を作成できませんでした。無料プランでは組織に 1 つまでしか作れません。" >&2
      echo "deno deploy database list --org $org で既存の KV の名前を調べ、3 つめの引数に渡してください。" >&2
      exit "$status"
    fi
  }
fi

deno deploy database assign "$kv" --app "$app" --org "$org" || {
  status=$?
  [ "$status" -eq 5 ] || exit "$status"
  echo "KV $kv は割り当て済みです"
}

deno deploy --org "$org" --app "$app" --prod
