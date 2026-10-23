/* roteador minimalista por hash + limpeza de intervalos por tela */
import { qs } from './util.js'

const cleanups = []

export function onLeave(fn) {
  cleanups.push(fn)
  return fn
}

export function runCleanups() {
  while (cleanups.length) {
    const fn = cleanups.pop()
    try {
      fn()
    } catch (err) {
      console.warn('[4paredes] cleanup', err)
    }
  }
}

export const screenEl = () => qs('#screen')

export function go(hash) {
  if (location.hash === hash) render()
  else location.hash = hash
}

export function currentRoute() {
  return location.hash || '#/trilha'
}

export function parseRoute(hash = currentRoute()) {
  const clean = hash.replace(/^#\/?/, '')
  const [name, ...rest] = clean.split('/')
  return { name: name || 'trilha', params: rest }
}

/** troca o conteúdo da tela com animação */
export function paint(builder) {
  runCleanups()
  const host = screenEl()
  host.scrollTop = 0
  host.innerHTML = ''
  const wrap = document.createElement('div')
  wrap.className = 'screen-anim'
  host.append(wrap)
  builder(wrap)
  return wrap
}

export function interval(fn, ms) {
  const id = setInterval(fn, ms)
  onLeave(() => clearInterval(id))
  return id
}

export function timeout(fn, ms) {
  const id = setTimeout(fn, ms)
  onLeave(() => clearTimeout(id))
  return id
}

let renderImpl = () => {}
export function setRenderer(fn) {
  renderImpl = fn
}
export function render() {
  renderImpl()
}
