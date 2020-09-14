import { Value } from 'slate'

import { defaultNode } from '../model'

/**
 * @param value - Current {@link https://docs.slatejs.org/v/v0.47/slate-core/value | value}
 * @public
 */
export function isValueEmpty(value: Value) {
  // check if there is no content and only one node
  const block = value.document.nodes.get(0)
  if (
    value.document.text !== '' ||
    value.document.nodes.size !== 1 ||
    value.document.getTexts().size !== 1 ||
    block === undefined
  ) {
    return false
  }

  // check if the node is the default node
  return block.object !== 'text' && block.type === defaultNode
}
