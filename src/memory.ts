import warning from 'tiny-warning'
import { Action } from './index'
import { createEvents } from './events'
import { createKey, createHref, parsePath, readOnly, clamp } from './utils'
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
}: MemoryHistoryOptions): MemoryHistory {
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
    silence: boolean
  ): boolean => {
    if (!silence && blockers.length !== 0) {
      blockers.call({ action, location, retry })
      return false
    }
    return true
  }

  const listeners = createEvents<Update>()

  const transit = (nextAction: Action, nextLocation: Location, silence: boolean) => {
    action = nextAction
    location = nextLocation
    if (!silence) {
      listeners.call({ action, location })
    }
  }

  const push = (to: To, state: State = null, silence: boolean = false) => {
    const nextAction = Action.PUSH
    const nextLocation = getNextLocation(to, state)
    const retry = () => {
      push(to, state, silence)
    }

    warning(
      nextLocation.pathname.charAt(0) === '/',
      `Relative pathnames are not supported in hash history.push(${JSON.stringify(
        to
      )})`
    )

    if (allowTransit(nextAction, nextLocation, retry, silence)) {
      index += 1
      entries.splice(index, entries.length, nextLocation)
      transit(nextAction, nextLocation, silence)
    }
  }

  const replace = (to: To, state: State = null, silence: boolean = false) => {
    const nextAction = Action.REPLACE
    const nextLocation = getNextLocation(to, state)
    const retry = () => {
      replace(to, state, silence)
    }

    warning(
      nextLocation.pathname.charAt(0) === '/',
      `Relative pathnames are not supported in hash history.replace(${JSON.stringify(
        to
      )})`
    )

    if (allowTransit(nextAction, nextLocation, retry, silence)) {
      entries[index] = nextLocation
      transit(nextAction, nextLocation, silence)
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

  const back = () => {
    go(-1)
  }

  const forward = () => {
    go(1)
  }

  const listen = (listener: Listener<State>): Undo => {
    return listeners.push(listener)
  }

  const block = (blocker: Blocker<State>) => {
    return blockers.push(blocker)
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
    push,
    replace,
    go,
    back,
    forward,
    listen,
    block,
  }
}