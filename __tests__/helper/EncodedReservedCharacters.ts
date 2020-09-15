import { execSteps } from './utils'
import type { Helper, Step } from './utils'

export const EncodedReservedCharacters: Helper = (history, done) => {
  const steps: Step[] = [
    () => {
      // encoded string
      let pathname = '/view/%23abc'
      history.replace(pathname)
    },
    ({ location }) => {
      expect(location).toMatchObject({
        pathname: '/view/%23abc',
      })
      // encoded object
      let pathname = '/view/%23abc'
      history.replace({ pathname })
    },
    ({ location }) => {
      expect(location).toMatchObject({
        pathname: '/view/%23abc',
      })
      // unencoded string
      let pathname = '/view/#abc'
      history.replace(pathname)
    },
    ({ location }) => {
      expect(location).toMatchObject({
        pathname: '/view/',
        hash: '#abc',
      })
    },
  ]

  execSteps(steps, history, done)
}
