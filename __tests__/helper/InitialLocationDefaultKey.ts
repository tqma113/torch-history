import { execSteps } from './utils'
import type { Helper, Step } from './utils'

export const InitialLocationDefaultKey: Helper = (history, done) => {
  const steps: Step[] = [
    ({ location }) => {
      expect(location.key).toBe('default')
    },
  ]

  execSteps(steps, history, done)
}
