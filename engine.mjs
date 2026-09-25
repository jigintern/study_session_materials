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
  });
