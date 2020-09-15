import warning from 'tiny-warning'
import { Action } from './index'
import { createEvents } from './events'
import { createKey, createPath, parsePath, readOnly, clamp } from './utils'
import type {
  To,
  State,
  Update,
  Location,
  PartialLocation,
  Transaction,
  Listener,
  Blocker,
  Undo,
  Retry,
  History,
} from './index'

export type InitialEntry = string | PartialLocation

export type MemoryHistoryOptions = {
  initialEntries?: InitialEntry[]
  initialIndex?: number
}

export interface MemoryHistory<S extends State = State> extends History<S> {
  index: number
}

export default function createMemoryHistory({
  initialEntries = ['/'],
  initialIndex,
}: MemoryHistoryOptions = {}): MemoryHistory {
  let entries: Location[] = initialEntries.map((entry) => {
    let location = readOnly<Location>({
      pathname: '/',
      search: '',
      hash: '',
      state: null,
      key: createKey(),
      ...(typeof entry === 'string' ? parsePath(entry) : entry),
    })

    warning(
      location.pathname.charAt(0) === '/',
      `Relative pathnames are not supported in createMemoryHistory({ initialEntries }) (invalid entry: ${JSON.stringify(
        entry
      )})`
    )

    return location
  })
  let index = clamp(
    initialIndex == null ? entries.length - 1 : initialIndex,
    0,
    entries.length - 1
  )

  let action = Action.POP
  let location = entries[index]

  const getNextLocation = (to: To, state: State = null): Location => {
    return readOnly<Location>({
      ...location,
      ...(typeof to === 'string' ? parsePath(to) : to),
      state,
      key: createKey(),
    })
  }

  const blockers = createEvents<Transaction>()

  const allowTransit = (
    action: Action,
    location: Location,
    retry: Retry,
    silent: boolean
  ): boolean => {
    if (!silent && blockers.length !== 0) {
      blockers.call({ action, location, retry })
      return false
    }
    return true
  }

  const listeners = createEvents<Update>()

  const transit = (
    nextAction: Action,
    nextLocation: Location,
    silent: boolean
  ) => {
    action = nextAction
    location = nextLocation
    if (!silent) {
      listeners.call({ action, location })
    }
  }

  const createHref = (to: To) => {
    return typeof to === 'string' ? to : createPath(to)
  }

  const _push = (to: To, state: State = null, silent: boolean = false) => {
    const nextAction = Action.PUSH
    const nextLocation = getNextLocation(to, state)
    const retry = () => {
      _push(to, state, silent)
    }

    warning(
      nextLocation.pathname.charAt(0) === '/',
      `Relative pathnames are not supported in hash history.push(${JSON.stringify(
        to
      )})`
    )

    if (allowTransit(nextAction, nextLocation, retry, silent)) {
      index += 1
      entries.splice(index, entries.length, nextLocation)
      transit(nextAction, nextLocation, silent)
    }
  }

  const _replace = (to: To, state: State = null, silent: boolean = false) => {
    const nextAction = Action.REPLACE
    const nextLocation = getNextLocation(to, state)
    const retry = () => {
      _replace(to, state, silent)
    }

    warning(
      nextLocation.pathname.charAt(0) === '/',
      `Relative pathnames are not supported in hash history.replace(${JSON.stringify(
        to
      )})`
    )

    if (allowTransit(nextAction, nextLocation, retry, silent)) {
      entries[index] = nextLocation
      transit(nextAction, nextLocation, silent)
    }
  }

  const go = (delta: number) => {
    let nextIndex = clamp(index + delta, 0, entries.length - 1)
    let nextAction = Action.POP
    let nextLocation = entries[nextIndex]
    function retry() {
      go(delta)
    }

    if (allowTransit(nextAction, nextLocation, retry, false)) {
      index = nextIndex
      transit(nextAction, nextLocation, false)
    }
  }

  return {
    get index() {
      return index
    },
    get length() {
      return entries.length
    },
    get action() {
      return action
    },
    get location() {
      return location
    },
    createHref,
    push: (to: To, state: State) => {
      _push(to, state, false)
    },
    replace: (to: To, state: State) => {
      _replace(to, state, false)
    },
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
      return blockers.push(blocker)
    },
    silent: {
      push: (to: To, state: State) => {
        _push(to, state, true)
      },
      replace: (to: To, state: State) => {
        _replace(to, state, true)
      },
    },
  }
}
