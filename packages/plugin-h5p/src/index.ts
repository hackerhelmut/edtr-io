import { StateType, StatefulPlugin } from '@edtr-io/core'

import { H5pEditor } from './editor'

export const h5pState = StateType.object({
  src: StateType.string('')
})

export const h5pPlugin: StatefulPlugin<typeof h5pState> = {
  Component: H5pEditor,
  state: h5pState
}
