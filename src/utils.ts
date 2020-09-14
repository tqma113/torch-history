import type { To, PartialPath } from './index'

export function parsePath(path: string): PartialPath {
  let partialPath: PartialPath = {}

  if (path) {
    let hashIndex = path.indexOf('#')
    if (hashIndex >= 0) {
      partialPath.hash = path.substr(hashIndex)
      path = path.substr(0, hashIndex)
    }

    let searchIndex = path.indexOf('?')
    if (searchIndex >= 0) {
      partialPath.search = path.substr(searchIndex)
      path = path.substr(0, searchIndex)
    }

    if (path) {
      partialPath.pathname = path
    }
  }

  return partialPath
}

export function createPath({
  pathname = '/',
  search = '',
  hash = '',
}: PartialPath) {
  return pathname + search + hash
}

export function createKey() {
  return Math.random().toString(36).substr(2, 8)
}

export const readOnly: <T extends unknown>(obj: T) => T = (obj) => obj

export const createHref = (to: To) => {
  return typeof to === 'string' ? to : createPath(to)
}

export const clamp = (n: number, lowerBound: number, upperBound: number) =>
  Math.min(Math.max(n, lowerBound), upperBound)

export const promptBeforeUnload = (event: BeforeUnloadEvent) => {
  // Cancel the event.
  event.preventDefault()
  // Chrome (and legacy IE) requires returnValue to be set.
  event.returnValue = ''
}
