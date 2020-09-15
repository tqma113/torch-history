import { execSteps } from './utils'
import type { Helper, Step } from './utils'

export const PushRelativePathnameWarning: Helper = (history, done) => {
  const steps: Step[] = [
    ({ location }) => {
      expect(location).toMatchObject({
        pathname: '/',
      })

      history.push('/the/path?the=query#the-hash')
    },
    ({ action, location }) => {
      expect(action).toBe('PUSH')
      expect(location).toMatchObject({
        pathname: '/the/path',
        search: '?the=query',
        hash: '#the-hash',
      })

      let spy = jest.spyOn(console, 'warn')

      history.push('../other/path?another=query#another-hash')

      expect(spy).toHaveBeenCalledWith(
        expect.stringContaining('relative pathnames are not supported')
      )
    },
    ({ location }) => {
      expect(location).toMatchObject({
        pathname: '../other/path',
        search: '?another=query',
        hash: '#another-hash',
      })
    },
  ]

  execSteps(steps, history, done)
}
