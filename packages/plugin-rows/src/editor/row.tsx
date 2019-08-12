import {
  StatefulPluginEditorProps,
  selectors,
  EditorStore,
  connectStateOnly
} from '@edtr-io/core'
import { PrimarySettings } from '@edtr-io/editor-ui'
import { ThemeProvider, usePluginTheme } from '@edtr-io/ui'
import * as React from 'react'
import { createPortal } from 'react-dom'

import { rowsPluginThemeFactory, rowsState } from '..'
import { RowContainer } from '../row-container'
import { Controls, ExtendedSettingsWrapper } from './controls'
import { connectDnD, CollectedProps, TargetProps } from './dnd-hoc'
import { Menu } from './menu'
import render from './render'
import { Separator } from './separator'

const PrimarySettingsWrapper: React.FunctionComponent = props => {
  React.useEffect(() => {
    // eslint-disable-next-line no-console
    console.warn(
      'PrimarySettingsWrapper of @edtr-io/plugin-rows is deprecated. Use PrimarySettings of @edtr-io/editor-ui instead.'
    )
  }, [])
  return <PrimarySettings {...props} />
}
export type RowExposedProps = StatefulPluginEditorProps<typeof rowsState> & {
  moveRow: (from: number, to: number) => void
  insert: (index: number, options?: { plugin: string; state?: unknown }) => void
  index: number
  doc: { plugin: string; state?: unknown }
  fullStore: EditorStore
} & { scope: string }

export type RowSourceProps = RowExposedProps & CollectedProps & TargetProps

const RowSource = React.forwardRef<
  { getNode: () => HTMLDivElement | null },
  RowSourceProps & RowStateProps & RowMenuProps
>((props, ref) => {
  const [expandedState, setExpanded] = React.useState(false)
  const [showExtendedSettings, setShowExtendedSettings] = React.useState(false)
  const rows = props.state
  const index = props.index
  const row = rows()[index]

  // DnD
  const rowRef = React.useRef<HTMLDivElement>(null)

  React.useImperativeHandle(ref, () => {
    return { getNode: () => rowRef.current }
  })

  if (props.connectDragSource) {
    props.connectDragPreview(rowRef)
    props.connectDropTarget(rowRef)
    // const opacity = isDragging ? 0 : 1
  }

  const extendedSettingsNode = React.useRef<HTMLDivElement>(null)
  const settingsTheme = usePluginTheme(name, rowsPluginThemeFactory)

  const theme = React.useMemo(() => {
    return {
      editorUi: {
        overlay: {
          input: {
            backgroundColor: settingsTheme.backgroundColor,
            color: settingsTheme.menu.primary.color
          },
          button: {
            backgroundColor: settingsTheme.backgroundColor,
            color: settingsTheme.menu.primary.color,
            borderColor: settingsTheme.menu.primary.color
          },
          textarea: {
            backgroundColor: settingsTheme.backgroundColor,
            color: settingsTheme.menu.primary.color,
            borderColor: settingsTheme.menu.primary.color
          },
          checkbox: {
            color: settingsTheme.menu.primary.color,
            boxDeselectedColor: settingsTheme.backgroundColor,
            boxSelectedColor: settingsTheme.menu.primary.color
          }
        }
      }
    }
  }, [settingsTheme])
  const focused = props.focusedElement === row.id
  React.useLayoutEffect(() => {
    if (!props.focused && !focused) {
      setExpanded(false)
    }
  }, [focused, props.focused])
  const expanded = (props.focused || focused) && expandedState
  return (
    <React.Fragment>
      <RowContainer
        editable={props.editable || false}
        ref={rowRef}
        noHeight={props.doc.plugin === 'notes' && !props.editable}
        name={props.name}
        isFirst={index === 0}
        expanded={expanded}
        onMouseMove={() => {
          if (focused) {
            setExpanded(true)
          }
        }}
      >
        {render({
          row,
          rows,
          index,
          store: props.fullStore,
          getDocument: selectors.getDocument,
          renderIntoExtendedSettings: children => {
            if (!extendedSettingsNode.current) return null

            return createPortal(
              <ThemeProvider theme={theme}>{children}</ThemeProvider>,
              extendedSettingsNode.current
            )
          },
          PrimarySettingsWrapper
        })}
        <ExtendedSettingsWrapper
          hideExtendedSettings={() => {
            setShowExtendedSettings(false)
          }}
          expanded={expanded}
          index={index}
          rows={rows}
          duplicateRow={() => rows.insert(index, props.doc)}
          ref={extendedSettingsNode}
          extendedSettingsVisible={showExtendedSettings}
          name={props.name}
        />
        {props.editable && (
          <React.Fragment>
            <Controls
              name={props.name}
              index={index}
              expanded={expanded}
              setShowExtendedSettings={setShowExtendedSettings}
              rows={rows}
              row={row}
              connectDragSource={props.connectDragSource}
            />
            <Menu
              visible={!!props.menu}
              menu={props.menu}
              setMenu={props.setMenu}
              plugins={props.plugins}
              name={props.name}
            />
          </React.Fragment>
        )}
      </RowContainer>
      <Separator
        name={props.name}
        focused={focused}
        onClick={() => {
          props.openMenu(index + 1)
        }}
      />
    </React.Fragment>
  )
})
RowSource.displayName = 'RowSource'

export const Row = connectStateOnly<
  RowStateProps,
  RowExposedProps & { scope: string } & RowMenuProps
>(state => {
  return {
    focusedElement: selectors.getFocused(state),
    plugins: selectors.getPlugins(state)
  }
})(connectDnD(RowSource))

export interface RowStateProps {
  focusedElement: ReturnType<typeof selectors['getFocused']>
  plugins: ReturnType<typeof selectors['getPlugins']>
}

export interface RowMenuProps {
  menu: MenuType | undefined
  setMenu: (menu: MenuType | undefined) => void
  openMenu: (insertIndex: number, replaceIndex?: number) => void
}

type MenuType = {
  index: number
  onClose: (pluginState: { plugin: string; state?: unknown }) => void
}
