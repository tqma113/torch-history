import { execSteps } from './utils'
import type { Helper, Step } from './utils'

export const GoBack: Helper = (history, done) => {
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
    },
  ]

  execSteps(steps, history, done)
}
