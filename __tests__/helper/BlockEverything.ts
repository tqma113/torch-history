import { execSteps, noop } from './utils'
import type { Helper, Step } from './utils'

export const BlockEverything: Helper = (history, done) => {
  const steps: Step[] = [
    ({ location }) => {
      expect(location).toMatchObject({
        pathname: '/',
      })

      let unblock = history.block(noop)

      history.push('/home')

      expect(history.location).toMatchObject({
        pathname: '/',
      })

      unblock()
    },
  ]

  execSteps(steps, history, done)
}
