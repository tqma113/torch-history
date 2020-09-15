import type { Helper } from './utils'

export const Listen: Helper = (history, done) => {
  const spy = jest.fn()
  const unlisten = history.listen(spy)

  expect(spy).not.toHaveBeenCalled()

  unlisten()
  done()
}
