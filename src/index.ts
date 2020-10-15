// FUNCTIONS
export { default as createBrowserHistory } from './browser'
export { default as createHashHistory } from './hash'
export { default as createMemoryHistory } from './memory'

// CONSTANTS
export enum Action {
  POP = 'POP',
  PUSH = 'PUSH',
  REPLACE = 'REPLACE',
}

// TYPES
export type { BrowserHistoryOptions } from './browser'
export type { HashHistoryOptions } from './hash'
export type {
  MemoryHistory,
  MemoryHistoryOptions,
  InitialEntry,
} from './memory'

export type Pathname = string

export type Search = string

export type Hash = string

export type State = object | null

export type Key = string

export type Path = {
  pathname: Pathname
  search: Search
  hash: Hash
}

export type PartialPath = Partial<Path>

export type HistoryState = {
  usr: State
  key?: string
  idx: number
}

export interface Location<S extends State = State> extends Path {
  state: S
  key: Key
}

export type PartialLocation = Partial<Location>

export type To = string | PartialPath

export interface Update<S extends State = State> {
  action: Action
  location: Location<S>
}

export interface Listener<S extends State = State> {
  (update: Update<S>): void
}

export interface Transaction<S extends State = State> extends Update<S> {
  retry(): void
}

export interface Blocker<S extends State = State> {
  (tx: Transaction<S>): void
}

export type Undo = () => void

export type Retry = () => void

export interface History<S extends State = State> {
  length: number
  action: Action
  location: Location<S>
  createHref(to: To): string
  push(to: To, state?: State): void
  replace(to: To, state?: State): void
  go(delta: number): void
  back(): void
  forward(): void
  listen(listener: Listener<S>): Undo
  block(blocker: Blocker<S>): Undo
}
