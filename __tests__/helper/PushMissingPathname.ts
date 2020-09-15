import { execSteps } from './utils'
import type { Helper, Step } from './utils'

export const PushMissingPathname: Helper = (history, done) => {
  const steps: Step[] = [
    ({ location }) => {
      expect(location).toMatchObject({
        pathname: '/',
      })

      history.push('/home?the=query#the-hash')
    },
    ({ action, location }) => {
      expect(action).toBe('PUSH')
      expect(location).toMatchObject({
        pathname: '/home',
        search: '?the=query',
        hash: '#the-hash',
      })

      history.push('?another=query#another-hash')
    },
    ({ action, location }) => {
      expect(action).toBe('PUSH')
      expect(location).toMatchObject({
        pathname: '/home',
        search: '?another=query',
        hash: '#another-hash',
      })
    },
  ]

  execSteps(steps, history, done)
}
