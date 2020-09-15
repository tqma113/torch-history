import { execSteps } from './utils'
import type { Helper, Step } from './utils'

export const GoForward: Helper = (history, done) => {
  const steps: Step[] = [
    ({ location }) => {
      expect(location).toMatchObject({
        pathname: '/',
      })

      history.push('/home')
    },
    ({ action, location }) => {
      expect(action).toEqual('PUSH')
      expect(location).toMatchObject({
        pathname: '/home',
      })

      history.back()
    },
    ({ action, location }) => {
      expect(action).toEqual('POP')
      expect(location).toMatchObject({
        pathname: '/',
      })

      history.forward()
    },
    ({ action, location }) => {
      expect(action).toEqual('POP')
      expect(location).toMatchObject({
        pathname: '/home',
      })
    },
  ]

  execSteps(steps, history, done)
}
