import type { History, Undo, Action, Location } from '../../src'

export type StepProps = {
  action: Action
  location: Location
}

export type Step = (props: StepProps) => void

export interface DoneCallback {
  (...args: any[]): any
  fail(error?: string | { message: string }): any
}

export type Helper = (history: History, done: DoneCallback) => void

export const execSteps: (
  steps: Step[],
  history: History,
  done: DoneCallback
) => void = (steps, history, done) => {
  let index = 0,
    unlisten: Undo,
    cleanedUp = false

  function cleanup(...args: any[]) {
    if (!cleanedUp) {
      cleanedUp = true
      unlisten()
      done(...args)
    }
  }

  function execNextStep(props: StepProps) {
    try {
      let nextStep = steps[index++]
      if (!nextStep) throw new Error('Test is missing step ' + index)

      nextStep(props)

      if (index === steps.length) cleanup()
    } catch (error) {
      cleanup(error)
    }
  }

  if (steps.length) {
    unlisten = history.listen(execNextStep)

    execNextStep({
      action: history.action,
      location: history.location,
    })
  } else {
    done()
  }
}

export const noop = () => {}
