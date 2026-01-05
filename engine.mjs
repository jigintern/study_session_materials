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
  .use(container, '_');