/* ============================================================
   4 PAREDES — boot, rotas e a "chamada constante" dos mascotes
   ============================================================ */
import { LINES, SCENES, fillLine, playCutscene } from './mascots.js'
import { parseRoute, paint, setRenderer } from './router.js'
import { hideChrome, idleMascotPeek, nudge, renderTabbar, renderTopbar, toast, walkMascot } from './ui.js'
import { S, dangerOfLosingStreak, save, syncDay, unlockedCount } from './state.js'
import { setSound, sfx } from './audio.js'
import { initNotifications, maybeStreakAlert, scheduleDaily } from './notify.js'
import { pick, qs } from './util.js'

import { renderOnboarding } from './screens/onboarding.js'
import { renderHome, bindRender } from './screens/home.js'
import { renderLesson } from './screens/lesson.js'
import { renderHub } from './screens/hub.js'
import { renderLeague } from './screens/league.js'
import { renderProfile } from './screens/profile.js'

const ROUTES = {
  trilha: renderHome,
  jogos: renderHub,
  liga: renderLeague,
  ninho: renderProfile,
}

bindRender(() => render())
setRenderer(() => render())

function render() {
  const route = parseRoute()

  if (!S.onboarded) {
    if (route.name !== 'onboarding') {
      location.hash = '#/onboarding'
      return
    }
    hideChrome()
    paint((host) => renderOnboarding(host))
    return
  }

  if (route.name === 'onboarding') {
    location.hash = '#/trilha'
    return
  }

  if (route.name === 'fase') {
    renderTopbar()
    paint((host) => renderLesson(host, route.params[0]))
    return
  }

  const fn = ROUTES[route.name] ?? renderHome
  renderTopbar()
  paint((host) => {
    fn(host)
    renderTabbar(route.name in ROUTES ? route.name : 'trilha')
  })
}

/* navegação por tabs */
document.addEventListener('click', (e) => {
  const tab = e.target.closest('[data-go]')
  if (!tab) return
  sfx.tap()
  location.hash = tab.dataset.go
})

window.addEventListener('hashchange', () => render())

/* mantém o dia sincronizado quando a aba volta */
document.addEventListener('visibilitychange', () => {
  if (document.hidden) return
  const ev = syncDay()
  if (ev.newDay && S.onboarded) {
    render()
    toast(ev.broken ? 'Novo dia. A ofensiva apagou, mas dá para recomeçar hoje.' : 'Novo dia, nova fase liberada!', ev.broken ? 'warn' : 'good', 3000, ev.broken ? 'heartBroken' : 'sun')
  }
})

/* ---------------- boot ---------------- */
function boot() {
  setSound(S.prefs.sound !== false)
  const events = syncDay()
  render()

  const boot = qs('#boot')
  setTimeout(() => boot?.classList.add('off'), 420)
  setTimeout(() => boot?.remove(), 1200)

  if (!S.onboarded) return

  // eventos do dia
  setTimeout(() => {
    if (events.broken && !S.seenCutscenes.includes(`streakLost:${new Date().toDateString()}`)) {
      S.seenCutscenes.push(`streakLost:${new Date().toDateString()}`)
      save()
      playCutscene(SCENES.streakLost, { onDone: () => render() })
      sfx.lose()
      return
    }
    if (events.streakSaved) {
      toast(`Congelador usado! A ofensiva de ${S.streak} dias sobreviveu.`, 'good', 4000, 'snowflake')
      sfx.coin()
      return
    }
    if (!S.playedToday && S.streak > 0) {
      toast(
        `Bem-vindos de volta! Fase ${unlockedCount()} liberada e ${S.streak} dia(s) de ofensiva em jogo.`,
        'hot',
        4200,
        'flame',
      )
    } else if (S.playedToday) {
      toast('A fase de hoje já foi. Orgulho da Chispa.', 'good', 3200, 'checkCircle')
    } else {
      toast(`Dia ${unlockedCount()} de vocês nas 4 paredes. A primeira fase espera.`, '', 3600, 'leaf')
    }
  }, 900)

  // notificações reais
  initNotifications().then(() => scheduleDaily())
  maybeStreakAlert()

  // chamada constante
  setInterval(nudgeLoop, 25_000)
  setTimeout(nudgeLoop, 12_000)
}

function nudgeLoop() {
  if (document.hidden || !S.onboarded) return
  if (qs('#modal-layer') && !qs('#modal-layer').hidden) return
  const now = Date.now()
  const cooldown = 2.5 * 60 * 1000
  if (now - (S.nudges.last ?? 0) < cooldown) return

  const risk = dangerOfLosingStreak() && S.streak > 0 && new Date().getHours() >= 18
  const route = parseRoute().name

  if (!S.playedToday) {
    S.nudges.last = now
    S.nudges.count = (S.nudges.count ?? 0) + 1
    save()
    const text = risk
      ? fillLine(pick(LINES.streakRisk), { streak: S.streak })
      : fillLine(pick(LINES.nudge), { streak: S.streak })
    if (route === 'fase') {
      toast(text, risk ? 'warn' : 'hot', 4000, risk ? 'warning' : 'flame')
      return
    }
    const goTrail = () => {
      if (route !== 'trilha') location.hash = '#/trilha'
    }
    if (risk || Math.random() < 0.5) {
      // o mascote atravessa a tela reclamando — a chamada mais chamativa
      walkMascot(text, {
        kind: risk ? 'chispa' : pick(['chispa', 'fosforo']),
        mood: risk ? 'angry' : 'wink',
        ms: 9500,
        onClick: goTrail,
      })
    } else {
      nudge(text, { em: 'dice', actionLabel: 'Jogar agora', onAction: goTrail, ms: 9000 })
    }
    return
  }

  // já jogou hoje: mascote só passa para provocar
  if (Math.random() < 0.45) {
    S.nudges.last = now
    save()
    idleMascotPeek()
  } else {
    S.nudges.last = now - cooldown + 60_000
  }
}

window.addEventListener('error', (e) => {
  console.error('[4paredes]', e.error ?? e.message)
})

boot()
