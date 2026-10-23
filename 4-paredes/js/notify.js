/* ============================================================
   NOTIFICAÇÕES — lembretes reais (Service Worker) + lembrete
   interno quando a aba está aberta
   ============================================================ */
import { S, save, summary } from './state.js'
import { pick } from './util.js'
import { LINES, fillLine } from './mascots.js'

let reg = null
const timers = new Set()

export async function initNotifications() {
  if (!('serviceWorker' in navigator) || !('Notification' in window)) return { ok: false, reason: 'unsupported' }
  try {
    reg = await navigator.serviceWorker.register('./sw.js', { scope: './' })
    return { ok: true, permission: Notification.permission }
  } catch (err) {
    console.warn('[4paredes] service worker indisponível', err)
    return { ok: false, reason: 'blocked' }
  }
}

export async function requestPermission() {
  if (!('Notification' in window)) return 'unsupported'
  if (Notification.permission === 'granted') return 'granted'
  try {
    const res = await Notification.requestPermission()
    return res
  } catch {
    return Notification.permission ?? 'denied'
  }
}

const APP_ICON = () => new URL('assets/icon.svg', document.baseURI).href

export async function notify(title, body, { tag = 'quatro-paredes', em = 'flame' } = {}) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return false
  try {
    if (reg?.showNotification) {
      await reg.showNotification(title, { body, tag, icon: APP_ICON(), badge: APP_ICON(), data: { em } })
      return true
    }
    new Notification(title, { body, tag })
    return true
  } catch (err) {
    console.warn('[4paredes] falha ao notificar', err)
    return false
  }
}

/** agenda o lembrete diário no horário escolhido */
export function scheduleDaily() {
  for (const t of timers) clearTimeout(t)
  timers.clear()
  if (!S.prefs.notify) return
  const ms = msUntilNextReminder()
  const id = setTimeout(async () => {
    await fireDaily()
    scheduleDaily()
  }, ms)
  timers.add(id)
}

export function msUntilNextReminder() {
  const now = new Date()
  const next = new Date()
  next.setHours(S.prefs.notifyHour ?? 21, S.prefs.notifyMin ?? 0, 0, 0)
  if (next <= now) next.setDate(next.getDate() + 1)
  return next - now
}

export function nextReminderLabel() {
  const ms = msUntilNextReminder()
  const d = new Date(Date.now() + ms)
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

export async function fireDaily() {
  const s = summary()
  const body = S.playedToday
    ? 'Vocês já jogaram hoje. Só passei pra dizer que a Chispa está orgulhosa.'
    : `A fase de hoje ainda está aberta. Ofensiva: ${s.streak} dia(s).`
  return notify('4 Paredes', fillLine(body, { streak: s.streak }))
}

/** lembrete de "risco de ofensiva" quando abrem o app no fim do dia */
export async function maybeStreakAlert() {
  if (!S.prefs.notify || Notification.permission !== 'granted') return false
  if (S.playedToday || !S.streak) return false
  const hour = new Date().getHours()
  if (hour < 18) return false
  const key = `streakAlert:${new Date().toDateString()}`
  if (S.nudges?.[key]) return false
  S.nudges[key] = true
  save()
  return notify(
    'Sua ofensiva está em risco',
    fillLine(pick(LINES.streakRisk), { streak: S.streak }),
    { tag: 'streak' },
  )
}

export function clearTimers() {
  for (const t of timers) clearTimeout(t)
  timers.clear()
}
