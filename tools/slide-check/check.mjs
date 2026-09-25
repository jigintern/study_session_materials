// スライドのはみ出しと小さすぎる文字を検査する。
// 使い方: node tools/slide-check/check.mjs [--warn] <slide.md>...
// 規則の全文は docs/slide-guidelines.md にある。
import { execFileSync } from 'node:child_process';
import { appendFileSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from 'playwright';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const MARP = join(ROOT, 'node_modules/.bin/marp');

const args = process.argv.slice(2);
const warn = args.includes('--warn');
const slides = args.filter((a) => a !== '--warn');
if (slides.length === 0) {
  console.error('usage: check.mjs [--warn] <slide.md>...');
  process.exit(2);
}

// ブラウザの中で 1 枚ずつ測る。marp は section を transform で縮小するので、
// 位置は section の縮尺で割り戻し、大きさは計算後の px を使う。
function measure({ minFont, minCodeFont, tolerance }) {
  // marp の header: / footer: はページの飾りなので本文の規則で測らない
  const EXCLUDE = '.timer-btn, section > header, section > footer';
  const excerpt = (el) => el.textContent.replace(/\s+/g, ' ').trim().slice(0, 30);
  const violations = [];

  document.querySelectorAll('svg[data-marpit-svg]').forEach((svg, i) => {
    const page = i + 1;
    // 背景画像の分割表示では 1 ページに section が複数できる。本文は content 側
    const section =
      svg.querySelector('section[data-marpit-advanced-background="content"]') ??
      svg.querySelector('section');
    if (!section) return;

    // section の枠 (16:9 なら 1280x720) を基準にする。下の padding への食い込みは違反にしない。
    // 高さを固定した要素から中身があふれても親の高さは変わらないので、子孫と文字まで辿る。
    // 縮小されていても比は変わらないので、矩形の座標を section の縮尺で割り戻して使う
    const limit = section.clientHeight;
    const box = section.getBoundingClientRect();
    const scale = box.height / section.offsetHeight || 1;
    const range = document.createRange();
    let worst = null;
    const visit = (node, el) => {
      const rect = node.nodeType === Node.TEXT_NODE
        ? (range.selectNodeContents(node), range.getBoundingClientRect())
        : node.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) return;
      const bottom = (rect.bottom - box.top) / scale;
      if (!worst || bottom >= worst.bottom) worst = { bottom, el };
    };
    const walk = (el) => {
      for (const child of el.childNodes) {
        if (child.nodeType === Node.TEXT_NODE) {
          if (child.textContent.trim() !== '') visit(child, el);
          continue;
        }
        if (child.nodeType !== Node.ELEMENT_NODE || child.matches(EXCLUDE)) continue;
        const style = getComputedStyle(child);
        if (style.position === 'absolute' || style.position === 'fixed') continue;
        visit(child, child);
        // 中身を切り取る要素の内側は、枠の外に描かれないので辿らない
        if (style.overflowY === 'visible') walk(child);
      }
    };
    walk(section);
    if (worst && worst.bottom - limit > tolerance) {
      violations.push({ page, kind: 'overflow', value: worst.bottom - limit, text: excerpt(worst.el) });
    }

    for (const pre of section.querySelectorAll('pre')) {
      if (pre.closest(EXCLUDE)) continue;
      const over = pre.scrollWidth - pre.clientWidth;
      if (over > tolerance) {
        violations.push({ page, kind: 'overflow-x', value: over, text: excerpt(pre) });
      }
    }

    for (const el of section.querySelectorAll('*')) {
      if (el.closest(EXCLUDE)) continue;
      const hasText = [...el.childNodes].some(
        (n) => n.nodeType === Node.TEXT_NODE && n.textContent.trim() !== '',
      );
      if (!hasText || el.getClientRects().length === 0) continue;
      const size = parseFloat(getComputedStyle(el).fontSize) || 0;
      const min = el.closest('pre, code, table') ? minCodeFont : minFont;
      if (size < min) {
        violations.push({ page, kind: 'font', value: size, text: excerpt(el) });
      }
    }
  });
  return violations;
}

function build(slide, outDir) {
  const out = join(outDir, 'slide.html');
  execFileSync(
    MARP,
    [slide, '--html', '--template', 'bare', '--allow-local-files', '-o', out],
    { cwd: ROOT, stdio: ['ignore', 'ignore', 'inherit'] },
  );
  // 出力を一時ディレクトリに置くので、画像などの相対パスを slide.md の場所で解決させる
  const base = `<base href="${pathToFileURL(dirname(slide))}/">`;
  writeFileSync(out, readFileSync(out, 'utf8').replace('<head>', `<head>${base}`));
  return out;
}

const fmt = (n) => String(Math.round(n * 100) / 100);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
// スライドごとに種別ごとの違反件数を持つ
const KINDS = ['overflow', 'overflow-x', 'font', 'build-failed'];
const counts = new Map();
try {
  for (const arg of slides) {
    const slide = resolve(arg);
    const name = relative(ROOT, slide);
    const outDir = mkdtempSync(join(tmpdir(), 'slide-check-'));
    const tally = Object.fromEntries(KINDS.map((k) => [k, 0]));
    counts.set(name, tally);
    try {
      await page.goto(pathToFileURL(build(slide, outDir)).href, { waitUntil: 'load', timeout: 120_000 });
      await page.evaluate(() => document.fonts.ready);
      const violations = await page.evaluate(measure, { minFont: 20, minCodeFont: 18, tolerance: 1 });
      for (const v of violations) {
        console.log(`${name}:p${v.page} ${v.kind} ${fmt(v.value)}px ${v.text}`);
        tally[v.kind] += 1;
      }
    } catch (e) {
      // 変換や読み込みに失敗しても残りのスライドは測る。失敗は違反と同じ扱いで出す
      console.log(`${name}:build-failed ${String(e.message).split('\n')[0]}`);
      tally['build-failed'] += 1;
    } finally {
      rmSync(outDir, { recursive: true, force: true });
    }
  }
} finally {
  await browser.close();
}

const total = (tally) => KINDS.reduce((sum, k) => sum + tally[k], 0);

// 1 行ずつの違反はログに任せ、実行結果のページには件数の表だけを出す。
// annotation は 1 ステップ 10 件で打ち切られるので使わない
if (process.env.GITHUB_STEP_SUMMARY) {
  const cell = (s) => String(s).replace(/\|/g, '\\|');
  const lines = [
    `### slide-check (${warn ? 'warn' : 'error'})`,
    '',
    `| slide.md | ${KINDS.join(' | ')} | 計 |`,
    `| --- | ${KINDS.map(() => '---:').join(' | ')} | ---: |`,
    ...[...counts].map(([name, tally]) => `| ${cell(name)} | ${KINDS.map((k) => tally[k]).join(' | ')} | ${total(tally)} |`),
    '',
  ];
  appendFileSync(process.env.GITHUB_STEP_SUMMARY, lines.join('\n') + '\n');
}

// --warn は終了コードだけを変える。違反があってもジョブを落とさない
const count = [...counts.values()].reduce((sum, tally) => sum + total(tally), 0);
if (count > 0 && !warn) process.exit(1);
