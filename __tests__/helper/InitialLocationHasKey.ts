import { execSteps } from './utils'
import type { Helper, Step } from './utils'

export const InitialLocationHasKey: Helper = (history, done) => {
  const steps: Step[] = [
    ({ location }) => {
      expect(location.key).toBeTruthy()
    },
  ]

  execSteps(steps, history, done)
}
