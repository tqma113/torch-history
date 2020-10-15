import { createHashHistory } from '../src'
import {
  InitialLocationDefaultKey,
  Listen,
  PushNewLocation,
  PushSamePath,
  PushState,
  PushMissingPathname,
  PushRelativePathnameWarning,
  ReplaceNewLocation,
  ReplaceSamePath,
  ReplaceState,
  EncodedReservedCharacters,
  GoBack,
  GoForward,
  BlockEverything,
  BlockPopWithoutListening,
} from './helper'
import type { History } from '../src'

describe('a hash history on a page with a <base> tag', () => {
  let history: History, base: HTMLBaseElement
  beforeEach(() => {
    if (window.location.hash !== '#/') {
      window.location.hash = '/'
    }

    base = document.createElement('base')
    base.setAttribute('href', '/prefix')

    document.head.appendChild(base)

    history = createHashHistory()
  })

  afterEach(() => {
    document.head.removeChild(base)
  })

  it('knows how to create hrefs', () => {
    const hashIndex = window.location.href.indexOf('#')
    const upToHash =
      hashIndex === -1
        ? window.location.href
        : window.location.href.slice(0, hashIndex)

    const href = history.createHref({
      pathname: '/the/path',
      search: '?the=query',
      hash: '#the-hash',
    })

    expect(href).toEqual(upToHash + '#/the/path?the=query#the-hash')
  })
})

describe('a hash history', () => {
  let history: History
  beforeEach(() => {
    window.history.replaceState(null, '', '#/')
    history = createHashHistory()
  })

  it('knows how to create hrefs from location objects', () => {
    const href = history.createHref({
      pathname: '/the/path',
      search: '?the=query',
      hash: '#the-hash',
    })

    expect(href).toEqual('#/the/path?the=query#the-hash')
  })

  it('knows how to create hrefs from strings', () => {
    const href = history.createHref('/the/path?the=query#the-hash')
    expect(href).toEqual('#/the/path?the=query#the-hash')
  })

  it('does not encode the generated path', () => {
    const encodedHref = history.createHref({
      pathname: '/%23abc',
    })
    expect(encodedHref).toEqual('#/%23abc')

    const unencodedHref = history.createHref({
      pathname: '/#abc',
    })
    expect(unencodedHref).toEqual('#/#abc')
  })

  describe('listen', () => {
    it('does not immediately call listeners', (done) => {
      Listen(history, done)
    })
  })

  describe('the initial location', () => {
    it('has the "default" key', (done) => {
      InitialLocationDefaultKey(history, done)
    })
  })

  describe('push a new path', () => {
    it('calls change listeners with the new location', (done) => {
      PushNewLocation(history, done)
    })
  })

  describe('push the same path', () => {
    it('calls change listeners with the new location', (done) => {
      PushSamePath(history, done)
    })
  })

  describe('push state', () => {
    it('calls change listeners with the new location', (done) => {
      PushState(history, done)
    })
  })

  describe('push with no pathname', () => {
    it('reuses the current location pathname', (done) => {
      PushMissingPathname(history, done)
    })
  })

  describe('push with a relative pathname', () => {
    it('issues a warning', (done) => {
      PushRelativePathnameWarning(history, done)
    })
  })

  describe('replace a new path', () => {
    it('calls change listeners with the new location', (done) => {
      ReplaceNewLocation(history, done)
    })
  })

  describe('replace the same path', () => {
    it('calls change listeners with the new location', (done) => {
      ReplaceSamePath(history, done)
    })
  })

  describe('replace state', () => {
    it('calls change listeners with the new location', (done) => {
      ReplaceState(history, done)
    })
  })

  describe('location created with encoded/unencoded reserved characters', () => {
    it('produces different location objects', (done) => {
      EncodedReservedCharacters(history, done)
    })
  })

  describe('back', () => {
    it('calls change listeners with the previous location', (done) => {
      GoBack(history, done)
    })
  })

  describe('forward', () => {
    it('calls change listeners with the next location', (done) => {
      GoForward(history, done)
    })
  })

  describe('block', () => {
    it('blocks all transitions', (done) => {
      BlockEverything(history, done)
    })
  })

  describe('block a POP without listening', () => {
    it('receives the next location and action as arguments', (done) => {
      BlockPopWithoutListening(history, done)
    })
  })
})
