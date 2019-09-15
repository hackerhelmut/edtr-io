import {
  StoreDeserializeHelpers,
  StateType,
  StateTypesSerializedType,
  StateTypesValueType,
  StateTypesReturnType,
  StateTypeReturnType
} from '@edtr-io/abstract-plugin-state'
import * as R from 'ramda'

export function object<Ds extends Record<string, StateType>>(
  types: Ds
): StateType<
  StateTypesSerializedType<Ds>,
  StateTypesValueType<Ds>,
  StateTypesReturnType<Ds>
> {
  type S = StateTypesSerializedType<Ds>
  type T = StateTypesValueType<Ds>
  type U = StateTypesReturnType<Ds>

  return {
    init(state, onChange, pluginProps) {
      return R.mapObjIndexed((type, key) => {
        return type.init(state[key], innerOnChange, pluginProps)

        function innerOnChange(
          updater: (
            oldValue: StateTypeReturnType<typeof type>,
            helpers: StoreDeserializeHelpers
          ) => StateTypeReturnType<typeof type>
        ): void {
          onChange((oldObj, helpers) =>
            R.set(R.lensProp(key), updater(oldObj[key], helpers), oldObj)
          )
        }
      }, types) as U
    },
    createInitialState(helpers) {
      return R.map(type => {
        return type.createInitialState(helpers)
      }, types) as T
    },
    deserialize(serialized, helpers) {
      return R.mapObjIndexed((type, key) => {
        return type.deserialize(serialized[key], helpers)
      }, types) as T
    },
    serialize(deserialized, helpers) {
      return R.mapObjIndexed((type, key) => {
        return type.serialize(deserialized[key], helpers)
      }, types) as S
    }
  }
}
