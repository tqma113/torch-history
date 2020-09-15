import { execSteps } from './utils'
import type { Helper, Step } from './utils'

export const ReplaceState: Helper = (history, done) => {
  const steps: Step[] = [
    ({ location }) => {
      expect(location).toMatchObject({
        pathname: '/',
      })

      history.replace('/home?the=query#the-hash', { the: 'state' })
    },
    ({ action, location }) => {
      expect(action).toBe('REPLACE')
      expect(location).toMatchObject({
        pathname: '/home',
        search: '?the=query',
        hash: '#the-hash',
        state: { the: 'state' },
      })
    },
  ]

  execSteps(steps, history, done)
}
