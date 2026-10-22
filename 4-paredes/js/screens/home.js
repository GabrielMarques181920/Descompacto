/* ============================================================
   TRILHA — o caminho das fases diárias
   ============================================================ */
import { NODES, UNITS } from '../content.js'
import {
  S,
  claimLightning,
  claimQuest,
  currentNodeIndex,
  dangerOfLosingStreak,
  maybeLightning,
  nextNode,
  nodeState,
  unitProgress,
  unlockedCount,
} from '../state.js'
import { el, fmtCountdown, fmtLongDate, pick, secsToMidnight } from '../util.js'
import { go, interval } from '../router.js'
import { celebrateReward, nudge, renderTabbar, renderTopbar, toast } from '../ui.js'
import { mascot, LINES, fillLine } from '../mascots.js'
import { sfx } from '../audio.js'
import { confetti, floatHearts, shake } from '../fx.js'
import { openExtraChallenge } from './extra.js'
import { icon, iconRepeat } from '../icons.js'

const OFFSETS = [0, 52, 84, 52, 0, -52, -84]

export function renderHome(host) {
  renderTabbar('trilha')
  const wrap = el('div', { class: 'col stagger' })
  host.append(wrap)

  const alert = streakAlert()
  if (alert) wrap.append(alert)
  wrap.append(todayCard())
  wrap.append(questCard())
  wrap.append(lightningCard())

  UNITS.forEach((unit, ui) => {
    const prog = unitProgress(unit)
    const unitUnlocked = NODES.findIndex((n) => n.id === unit.days[0].id) < unlockedCount()
    const banner = el('div', {
      class: `unit-banner ${unitUnlocked ? '' : 'locked'}`,
      style: { background: `linear-gradient(120deg, ${unit.color}33, ${unit.color}12)` },
    })
    banner.innerHTML = `
      <span class="u-em">${icon(unit.emoji, 20)}</span>
      <span class="grow">
        <span class="trail-meta">temporada ${ui + 1}</span>
        <strong style="display:block;font-size:16px">${unit.name}</strong>
        <span class="tiny muted">${unit.tagline}</span>
      </span>
      <span class="pill ${prog.done === prog.total ? 'green' : ''}">${prog.done}/${prog.total}</span>`
    banner.onclick = () => {
      sfx.tap()
      toast(unitUnlocked ? unit.tagline : `Temporada bloqueada — complete a ${ui}ª primeiro`, '', 2200, unit.emoji)

    }
    wrap.append(banner)

    const path = el('div', { class: 'path' })
    path.append(el('div', { class: 'path-line' }))
    unit.days.forEach((day, di) => {
      path.append(nodeEl(day, di, unitUnlocked))
    })
    wrap.append(path)
  })

  wrap.append(footerNote())

  // scroll até a fase atual
  setTimeout(() => {
    const cur = host.querySelector('.node.current')
    if (cur) cur.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, 420)

  // contagem regressiva viva
  const cds = host.querySelectorAll('#cd-midnight, #cd-alert')
  if (cds.length) {
    interval(() => {
      const txt = fmtCountdown(secsToMidnight())
      for (const cd of cds) {
        cd.textContent = txt
        if (dangerOfLosingStreak() && secsToMidnight() < 3600) cd.style.color = 'var(--wine-300)'
      }
    }, 1000)
  }
}

/* ---------- alerta de ofensiva ---------- */
function streakAlert() {
  if (S.playedToday || !S.streak) return null
  const hour = new Date().getHours()
  if (hour < 18) return null
  const card = el('div', { class: 'streak-alert' })
  card.innerHTML = `
    <span class="sa-em">${icon('warning', 26)}</span>
    <span class="grow">
      <strong style="font-size:14px">Sua ofensiva de ${S.streak} ${S.streak === 1 ? 'dia' : 'dias'} apaga à meia-noite</strong>
      <p class="tiny muted">Faltam <span class="countdown" id="cd-alert">${fmtCountdown(secsToMidnight())}</span>. Uma fase resolve — nem precisa ser longa.</p>
    </span>`
  const btn = el('button', { class: 'btn xs danger', text: 'Salvar' })
  btn.onclick = () => {
    sfx.select()
    const node = nextNode()
    go(`#/fase/${node.id}`)
  }
  card.append(btn)
  return card
}

/* ---------- cartão de hoje ---------- */
function todayCard() {
  const node = nextNode()
  const idx = currentNodeIndex()
  const allDoneToday = idx >= unlockedCount()
  const card = el('div', { class: 'card daily-card' })

  if (allDoneToday) {
    card.innerHTML = `
      <div class="row between">
        <div>
          <div class="trail-meta">vocês zeraram o dia</div>
          <h2 style="margin-top:4px">Casa em chamas</h2>
        </div>
        <div class="right" style="color:var(--gold)">${icon('flag', 40)}</div>
      </div>
      <p class="tiny muted" style="margin:10px 0 14px">
        ${fillLine(pick(LINES.empty), { streak: S.streak })} A próxima fase abre à meia-noite
        (faltam <span class="countdown" id="cd-midnight">${fmtCountdown(secsToMidnight())}</span>).
      </p>`
    const row = el('div', { class: 'row', style: { gap: '8px' } })
    const extra = el('button', { class: 'btn grow', text: 'Desafio extra' })
    extra.onclick = () => {
      sfx.select()
      openExtraChallenge()
    }
    const games = el('button', { class: 'btn ghost grow', text: 'Mini-jogos' })
    games.onclick = () => go('#/jogos')
    row.append(extra, games)
    card.append(row)
    return card
  }

  const st = nodeState(node.id)
  card.innerHTML = `
    <div class="row between" style="align-items:flex-start">
      <div class="grow">
        <div class="trail-meta">${fmtLongDate()} · fase ${idx + 1} de ${NODES.length}</div>
        <h2 style="margin:6px 0 4px;display:flex;align-items:center;gap:8px">
          <span style="color:var(--gold);flex:none">${icon(node.em, 22)}</span>${node.title}
        </h2>
        <p class="tiny muted">${node.text.slice(0, 96)}…</p>
      </div>
      <div class="right" style="flex:none;color:var(--wine-300)">${icon(
        node.type === 'duelo' ? 'swords' : node.type === 'bau' ? 'gift' : node.type === 'jogo' ? 'dice' : 'flame',
        34,
      )}</div>
    </div>
    <div class="row" style="gap:6px;margin:12px 0;flex-wrap:wrap">
      <span class="pill hot">${iconRepeat('pepper', Math.max(1, node.level), 13)} ${['', 'suave', 'picante', 'fogo alto'][node.level]}</span>
      <span class="pill">${icon('clock', 13)} ${node.min >= 60 ? `${Math.round(node.min / 60)}h` : `${node.min}min`}</span>
      <span class="pill gold">+${node.xp} XP</span>
    </div>
    <p class="tiny muted" style="margin-bottom:12px">
      ${
        S.playedToday
          ? `${icon('checkCircle', 13)} Ofensiva de hoje garantida`
          : `Faltam <span class="countdown" id="cd-midnight">${fmtCountdown(secsToMidnight())}</span> para a ofensiva apagar`
      }
    </p>`
  const cta = el('button', { class: 'btn', text: st === 'current' ? 'Jogar a fase de hoje' : 'Abrir fase' })
  cta.innerHTML = `<span class="shine"></span>${cta.textContent}`
  cta.onclick = () => {
    sfx.select()
    go(`#/fase/${node.id}`)
  }
  card.append(cta)
  return card
}

/* ---------- missões diárias ---------- */
function questCard() {
  const card = el('div', { class: 'card tight' })
  card.append(
    el('div', { class: 'section-title', style: { margin: '2px 0 10px' } }, [
      el('h2', { html: `${icon('calendar', 16)} Missões de hoje` }),
      el('span', { class: 'pill', text: `${S.quests.items.filter((q) => q.claimed).length}/3` }),
    ]),
  )
  const list = el('div', { class: 'col', style: { gap: '8px' } })
  S.quests.items.forEach((q, i) => {
    const row = el('div', { class: `quest ${q.claimed ? 'claimed' : ''}` })
    const info = el('div', { class: 'grow' })
    info.append(el('strong', { text: q.label, style: { fontSize: '13px' } }))
    const bar = el('div', { class: 'progress' }, [
      el('i', { style: { width: `${Math.min(100, (q.progress / q.goal) * 100)}%` } }),
    ])
    info.append(bar, el('span', { class: 'tiny muted', text: `${Math.min(q.progress, q.goal)}/${q.goal} · +${q.reward} brasas` }))
    row.append(el('span', { class: 'q-em', html: icon(q.em, 20) }), info)
    if (!q.claimed && q.progress >= q.goal) {
      const btn = el('button', { class: 'btn xs amber claim', text: 'Pegar' })
      btn.onclick = (e) => {
        e.stopPropagation()
        if (claimQuest(i)) {
          sfx.coin()
          floatHearts(btn, 4, 'sparkle')
          renderTopbar()
          render()
        }
      }
      row.append(btn)
    } else if (q.claimed) {
      row.append(el('span', { class: 'q-em', html: icon('check', 20) }))
    }
    list.append(row)
  })
  card.append(list)
  return card
}

/* ---------- relâmpago ---------- */
function lightningCard() {
  const active = S.lightning.today
  const card = el('div', {
    class: 'card tight',
    style: {
      background: active ? 'linear-gradient(120deg, rgba(201,162,39,.2), rgba(140,28,57,.22))' : '',
      borderColor: active ? 'rgba(201,162,39,.5)' : '',
    },
  })
  if (active) {
    card.innerHTML = `
      <div class="row" style="gap:10px">
        <span class="flame-live" style="color:var(--gold)">${icon('bolt', 26)}</span>
        <span class="grow">
          <div class="trail-meta">desafio relâmpago ativo</div>
          <strong style="font-size:14px">${active.title}</strong>
          <p class="tiny muted">${active.text}</p>
        </span>
      </div>`
    const row = el('div', { class: 'row', style: { gap: '8px', marginTop: '10px' } })
    const ok = el('button', { class: 'btn green grow sm', text: 'Fizemos agora' })
    ok.onclick = () => {
      const res = claimLightning(active)
      confetti()
      renderTopbar()
      toast(`+${active.xp} XP e +15 brasas pela rapidez!`, 'good', 2600, 'bolt')
      render()
    }
    const no = el('button', { class: 'btn ghost grow sm', text: 'Depois' })
    no.onclick = () => {
      S.lightning.today = null
      sfx.tap()
      render()
    }
    row.append(ok, no)
    card.append(row)
    return card
  }
  card.innerHTML = `
    <div class="row between">
      <div class="row" style="gap:10px">
        <span style="color:var(--gold)">${icon('bolt', 22)}</span>
        <span class="grow">
          <strong style="font-size:13.5px">Desafio relâmpago</strong>
          <p class="tiny muted">Algo rápido para fazer agora mesmo, valendo XP extra.</p>
        </span>
      </div>
    </div>`
  const btn = el('button', {
    class: 'btn sm amber',
    html: `${icon('bolt', 15)}<span>Sortear</span>`,
    style: { marginTop: '10px' },
  })
  btn.onclick = () => {
    const item = maybeLightning(true)
    if (!item) return toast('Um relâmpago de cada vez. Já já aparece outro.', 'warn', 2400, 'bolt')
    sfx.alarm()
    renderTopbar()
    render()
  }
  card.append(btn)
  return card
}

/* ---------- nó da trilha ---------- */
function nodeEl(day, index, unitUnlocked) {
  const state = unitUnlocked ? nodeState(day.id) : 'locked'
  const node = el('button', {
    class: `node ${state}`,
    style: { transform: `translateX(${OFFSETS[index % OFFSETS.length]}px)` },
  })

  const knob = el('span', { class: 'knob' })
  knob.innerHTML = icon(state === 'locked' ? 'lock' : day.em, state === 'locked' ? 24 : 30)
  node.append(knob)

  if (state === 'done') {
    node.append(el('span', { class: 'check', html: icon('check', 13) }))
  }
  if (state === 'current') {
    node.append(el('span', { class: 'start-bubble', text: 'hoje!' }))
    const pet = mascot(Math.random() < 0.5 ? 'chispa' : 'gota', 'happy', { anim: 'idle', cls: 'm-pet' })
    node.append(pet)
  }
  if (day.type === 'duelo' && state !== 'locked')
    node.append(el('span', { class: 'crown', html: icon('swords', 20) }))
  if (day.type === 'bau' && state !== 'locked')
    node.append(el('span', { class: 'crown', html: icon('sparkle', 20) }))

  const label = el('span', {
    class: 'n-label',
    text: state === 'locked' ? `Dia ${index + 1}` : day.title,
  })
  node.append(label)

  node.onclick = () => {
    if (state === 'locked') {
      sfx.wrong()
      shake(node)
      const days = Math.max(1, NODES.findIndex((n) => n.id === day.id) - unlockedCount() + 1)
      nudge(
        `Essa fase abre em ${days} ${days === 1 ? 'dia' : 'dias'}. A Chispa não deixa pular a fila de graça…`,
        { em: 'lock', actionLabel: 'Ver hoje', onAction: () => go('#/trilha') },
      )
      return
    }
    sfx.select()
    if (state === 'done') return showMemory(day)
    go(`#/fase/${day.id}`)
  }
  return node
}

function showMemory(day) {
  const rec = S.nodes[day.id]
  celebrateReward({
    title: day.title,
    em: day.em,
    text: `Concluído em ${new Date(rec.ts ?? Date.now()).toLocaleDateString('pt-BR')}${
      rec.mood ? ` · clima ${rec.mood}/5` : ''
    }${rec.note ? `\n“${rec.note}”` : ''}`,
    items: [{ em: 'check', label: `+${day.xp} XP` }],
  })
}

function footerNote() {
  const box = el('div', { class: 'card tight center', style: { marginTop: '18px' } })
  box.innerHTML = `
    <p class="tiny muted">
      ${unlockedCount()} de ${NODES.length} fases liberadas · ${S.stats.done} concluídas<br/>
      Regra das 4 paredes: o que acontece aqui, fica aqui. Consentimento sempre — usem a palavra de segurança
      (<strong>${S.prefs.safeword || 'geladeira'}</strong>) e o curinga sem culpa.
    </p>`
  return box
}

let render = () => {}
export function bindRender(fn) {
  render = fn
}
