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
    // コードブロック内の @@...@@ を <mark> に変換する。
    // シンタックスハイライトを保つため、いったん番兵文字に置き換えてから
    // ハイライト処理を通し、生成された HTML 上で <mark> に戻す。
    const OPEN = '\u0091';
    const CLOSE = '\u0092';
    const orig = md.options.highlight;
    md.options.highlight = (code, lang, attrs) => {
      if (!code.includes('@@')) return orig ? orig(code, lang, attrs) : '';
      let i = 0;
      const sentinel = code.replace(/@@/g, () => (i++ % 2 === 0 ? OPEN : CLOSE));
      const html = orig ? orig(sentinel, lang, attrs) : md.utils.escapeHtml(sentinel);
      return html
        .replace(new RegExp(OPEN, 'g'), '<mark>')
        .replace(new RegExp(CLOSE, 'g'), '</mark>');
    };
  });
