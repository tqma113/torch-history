import { execSteps } from './utils'
import type { Helper, Step } from './utils'
import type { Location } from '../../src'

export const ReplaceSamePath: Helper = (history, done) => {
  let prevLocation: Location

  const steps: Step[] = [
    ({ location }) => {
      expect(location).toMatchObject({
        pathname: '/',
      })

      history.replace('/home')
    },
    ({ action, location }) => {
      expect(action).toBe('REPLACE')
      expect(location).toMatchObject({
        pathname: '/home',
      })

      prevLocation = location

      history.replace('/home')
    },
    ({ action, location }) => {
      expect(action).toBe('REPLACE')
      expect(location).toMatchObject({
        pathname: '/home',
      })

      expect(location).not.toBe(prevLocation)
    },
  ]

  execSteps(steps, history, done)
}
