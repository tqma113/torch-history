import type { Undo } from './index'

type Handler<Arg> = (arg: Arg) => void

type Events<Arg> = {
  length: number
  push: (handler: Handler<Arg>) => Undo
  call: (arg: Arg) => void
}

export function createEvents<Arg>(): Events<Arg> {
  let handlers: Handler<Arg>[] = []

  return {
    get length() {
      return handlers.length
    },
    push(fn: Handler<Arg>) {
      handlers.push(fn)
      return function () {
        handlers = handlers.filter((handler) => handler !== fn)
      }
    },
    call(arg) {
      handlers.forEach((fn) => fn && fn(arg))
    },
  }
}
