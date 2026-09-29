import container from 'markdown-it-container';
import attrs from 'markdown-it-attrs';
import mark from 'markdown-it-mark'

/**
 * @type {import('@marp-team/marp-cli').Config<typeof import('@marp-team/marpit').Marpit>["engine"]}
 */
export default ({ marp }) => marp
  .use(mark)
  .use(attrs)
  .use(container, 'row')
  .use(container, '_')
  .use((md) => {
    // コードブロック内の @@...@@ を <mark>、%%...%% を <del> に変換する。
    // シンタックスハイライトを保つため、いったん番兵文字に置き換えてから
    // ハイライト処理を通し、生成された HTML 上でタグに戻す。
    const MARKERS = [
      { delim: '@@', tag: 'mark', open: '', close: '' },
      { delim: '%%', tag: 'del', open: '', close: '' },
    ];
    const orig = md.options.highlight;
    md.options.highlight = (code, lang, attrs) => {
      const used = MARKERS.filter((m) => code.includes(m.delim));
      if (used.length === 0) return orig ? orig(code, lang, attrs) : '';

      let sentinel = code;
      for (const m of used) {
        let i = 0;
        sentinel = sentinel.replaceAll(m.delim, () => (i++ % 2 === 0 ? m.open : m.close));
      }

      let html = orig ? orig(sentinel, lang, attrs) : md.utils.escapeHtml(sentinel);
      for (const m of used) {
        html = html.replaceAll(m.open, `<${m.tag}>`).replaceAll(m.close, `</${m.tag}>`);
      }
      return html;
    };
  })
  .use((md) => {
    // ```js {data-file=server.js} の data-file を <code> から <pre> に移す。
    // marp-pre は縮小のために <code> を内側の枠に入れ、枠からはみ出した部分を切り取る。
    // <code> の ::before では上の余白にラベルを出せないので、<pre> の ::before で出す。
    const fence = md.renderer.rules.fence;
    md.renderer.rules.fence = (tokens, idx, options, env, self) => {
      const token = tokens[idx];
      const file = token.attrGet('data-file');
      if (file === null) return fence(tokens, idx, options, env, self);

      token.attrs = token.attrs.filter(([name]) => name !== 'data-file');
      const html = fence(tokens, idx, options, env, self);
      return html.replace('<pre', `<pre data-file="${md.utils.escapeHtml(file)}"`);
    };
  })
  .use((md) => {
    // [text](#foo) を、{#foo} を付けた要素があるスライドの番号 (#12) に書き換える。
    // bespoke はハッシュをページ番号としてしか読まないので、id のままでは移動しない。
    // 番号を手で書くと、スライドを足し引きするたびにずれる。
    // 見出しの id は marp-core が見出しの文字列から付け直すので、{#foo} は段落などに付ける。
    md.core.ruler.push('slide_anchor', (state) => {
      const pages = new Map();
      let page = 0;
      for (const token of state.tokens) {
        if (token.type === 'marpit_slide_open') page = token.meta.marpitSlide + 1;
        const id = token.attrGet('id');
        if (id !== null && token.type !== 'marpit_slide_open') pages.set(id, page);
      }
      for (const token of state.tokens) {
        for (const child of token.children ?? []) {
          if (child.type !== 'link_open') continue;
          const href = child.attrGet('href');
          if (href?.startsWith('#') && pages.has(href.slice(1))) {
            child.attrSet('href', `#${pages.get(href.slice(1))}`);
          }
        }
      }
    });
  });
