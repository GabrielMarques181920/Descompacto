/* utilidades gerais */

export const qs = (sel, root = document) => root.querySelector(sel)
export const qsa = (sel, root = document) => [...root.querySelectorAll(sel)]

export const el = (tag, attrs = {}, kids = []) => {
  const node = document.createElement(tag)
  for (const [k, v] of Object.entries(attrs)) {
    if (v === null || v === undefined || v === false) continue
    if (k === 'class') node.className = v
    else if (k === 'html') node.innerHTML = v
    else if (k === 'text') node.textContent = v
    else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2), v)
    else if (k === 'style' && typeof v === 'object') Object.assign(node.style, v)
    else node.setAttribute(k, v)
  }
  for (const kid of [].concat(kids)) {
    if (kid === null || kid === undefined || kid === false) continue
    node.append(kid.nodeType ? kid : document.createTextNode(String(kid)))
  }
  return node
}

/** delegação de eventos simples: on(root, 'click', '.selector', handler) */
export function on(root, type, selector, handler, opts) {
  root.addEventListener(
    type,
    (ev) => {
      const target = ev.target.closest(selector)
      if (target && root.contains(target)) handler(ev, target)
    },
    opts,
  )
  return () => root.removeEventListener(type, handler)
}

export const rand = (min, max) => Math.random() * (max - min) + min
export const randInt = (min, max) => Math.floor(rand(min, max + 1))
export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]
export const chance = (p) => Math.random() < p

export function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export const clamp = (v, min, max) => Math.min(max, Math.max(min, v))

export const uid = () => Math.random().toString(36).slice(2, 10)

/* ---------------- datas ---------------- */
export const DAY = 86400000

export function todayKey(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function parseKey(key) {
  const [y, m, d] = String(key).split('-').map(Number)
  return new Date(y, (m || 1) - 1, d || 1, 12, 0, 0)
}

/** diferença em dias de calendário (a - b) */
export function daysBetween(aKey, bKey) {
  return Math.round((parseKey(aKey) - parseKey(bKey)) / DAY)
}

/** segundos até a próxima meia-noite local */
export function secsToMidnight(now = new Date()) {
  const next = new Date(now)
  next.setHours(24, 0, 0, 0)
  return Math.round((next - now) / 1000)
}

export function fmtCountdown(totalSecs) {
  const s = Math.max(0, totalSecs)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m`
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

export function fmtLongDate(d = new Date()) {
  return d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
}

export function fmtShortDate(key) {
  return parseKey(key).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

export function weekKey(d = new Date()) {
  const t = new Date(d)
  const day = (t.getDay() + 6) % 7 // segunda = 0
  t.setDate(t.getDate() - day)
  return todayKey(t)
}

/* ---------------- misc ---------------- */
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

export function plural(n, one, many = one + 's') {
  return `${n} ${n === 1 ? one : many}`
}

export function esc(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

export function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

export function saveJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}
