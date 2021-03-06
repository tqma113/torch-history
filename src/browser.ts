import warning from 'tiny-warning'
import { Action } from './index'
import { createEvents } from './events'
import {
  createKey,
  createPath,
  parsePath,
  readOnly,
  promptBeforeUnload,
} from './utils'
import type {
  To,
  State,
  Update,
  Location,
  Transaction,
  Listener,
  Blocker,
  Undo,
  Retry,
  History,
  HistoryState,
} from './index'

export type BrowserHistoryOptions = { window?: Window }

const BeforeUnloadEventType = 'beforeunload'
const PopStateEventType = 'popstate'

export default function createBrowserHistory({
  window = document.defaultView!,
}: BrowserHistoryOptions = {}): History {
  const globalHistory = window.history

  const getIndexAndLocation = (): [number, Location] => {
    const { pathname, search, hash } = window.location
    const state = globalHistory.state || {}

    return [
      state.idx,
      readOnly({
        pathname,
        hash,
        search,
        key: state.key || 'default',
        state: state.usr || null,
      }),
    ]
  }

  const createHref = (to: To) => {
    return typeof to === 'string' ? to : createPath(to)
  }

  const getHistoryStateAndUrl = (
    nextLocation: Location,
    index: number
  ): [HistoryState, string] => {
    return [
      {
        usr: nextLocation.state,
        key: nextLocation.key,
        idx: index,
      },
      createHref(nextLocation),
    ]
  }

  const getNextLocation = (to: To, state: State = null): Location => {
    return readOnly<Location>({
      ...location,
      ...(typeof to === 'string' ? parsePath(to) : to),
      state,
      key: createKey(),
    })
  }

  let blockedPopTx: Transaction | null = null
  const handlePop = () => {
    if (blockedPopTx) {
      blockers.call(blockedPopTx)
      blockedPopTx = null
    } else {
      const nextAction = Action.POP
      const [nextIndex, nextLocation] = getIndexAndLocation()

      if (blockers.length) {
        if (nextIndex != null) {
          let delta = index - nextIndex
          if (delta) {
            // Revert the POP
            blockedPopTx = {
              action: nextAction,
              location: nextLocation,
              retry() {
                go(delta * -1)
              },
            }

            go(delta)
          }
        } else {
          // Trying to POP to a location with no index. We did not create
          // this location, so we can't effectively block the navigation.
          warning(
            false,
            // detail and link to it here so people can understand better what
            // is going on and how to avoid it.
            `You are trying to block a POP navigation to a location that was not ` +
              `created by the history library. The block will fail silently in ` +
              `production, but in general you should do all navigation with the ` +
              `history library (instead of using window.history.pushState directly) ` +
              `to avoid this situation.`
          )
        }
      } else {
        transit(nextAction)
      }
    }
  }

  window.addEventListener(PopStateEventType, handlePop)

  let action = Action.POP
  let [index, location] = getIndexAndLocation()

  if (index == null) {
    index = 0
    globalHistory.replaceState({ ...globalHistory.state, idx: index }, '')
  }

  const blockers = createEvents<Transaction>()
  const allowTransit = (
    action: Action,
    location: Location,
    retry: Retry
  ): boolean => {
    if (blockers.length !== 0) {
      blockers.call({ action, location, retry })
      return false
    }
    return true
  }

  const listeners = createEvents<Update>()
  const transit = (nextAction: Action) => {
    action = nextAction
    ;[index, location] = getIndexAndLocation()
    listeners.call({ action, location })
  }

  const push = (to: To, state: State) => {
    const nextAction = Action.PUSH
    const nextLocation = getNextLocation(to, state)
    const retry = () => {
      push(to, state)
    }

    if (allowTransit(nextAction, nextLocation, retry)) {
      const [historyState, url] = getHistoryStateAndUrl(nextLocation, index + 1)

      // try...catch because iOS limits us to 100 pushState calls :/
      try {
        globalHistory.pushState(historyState, '', url)
      } catch (error) {
        // They are going to lose state here, but there is no real
        // way to warn them about it since the page will refresh...
        window.location.assign(url)
      }

      transit(nextAction)
    }
  }

  const replace = (to: To, state: State) => {
    const nextAction = Action.REPLACE
    const nextLocation = getNextLocation(to, state)
    const retry = () => {
      replace(to, state)
    }

    if (allowTransit(nextAction, nextLocation, retry)) {
      const [historyState, url] = getHistoryStateAndUrl(nextLocation, index)

      globalHistory.replaceState(historyState, '', url)

      transit(nextAction)
    }
  }

  const go = (delta: number) => {
    globalHistory.go(delta)
  }

  return readOnly({
    get length() {
      return globalHistory.length
    },
    get action() {
      return action
    },
    get location() {
      return location
    },
    createHref,
    push,
    replace,
    go,
    back: () => {
      go(-1)
    },
    forward: () => {
      go(1)
    },
    listen: (listener: Listener<State>): Undo => {
      return listeners.push(listener)
    },
    block: (blocker: Blocker<State>) => {
      const unblock = blockers.push(blocker)

      if (blockers.length === 1) {
        window.addEventListener(BeforeUnloadEventType, promptBeforeUnload)
      }

      return () => {
        unblock()

        if (!blockers.length) {
          window.removeEventListener(BeforeUnloadEventType, promptBeforeUnload)
        }
      }
    },
  })
}
