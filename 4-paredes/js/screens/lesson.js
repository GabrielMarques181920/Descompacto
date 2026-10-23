/* ============================================================
   FASE — tela do desafio do dia (estilo lição do Duolingo)
   ============================================================ */
import { NODES, nodeById } from '../content.js'
import { FREE_PHASES, S, completeNode, isPremium, nodeText, openChest, skipNode, spendBrasas, unlockedCount } from '../state.js'
import { openPaywall } from '../paywall.js'
import { clamp, el, pick, qs } from '../util.js'
import { go, interval, onLeave } from '../router.js'
import { celebrateLevel, celebrateReward, openSheet, renderTopbar, toast } from '../ui.js'
import { LINES, SCENES, fillLine, mascot, playCutscene } from '../mascots.js'
import { sfx } from '../audio.js'
import { burst, confetti, floatHearts, shake } from '../fx.js'
import { openGame } from '../games.js'
import { openExtraChallenge } from './extra.js'
import { icon, iconRepeat } from '../icons.js'

const CHECKLIST = [
  { em: 'phoneOff', label: 'Celulares longe da cama' },
  { em: 'candle', label: 'Luz baixa ou vela acesa' },
  { em: 'music', label: 'Playlist combinada' },
  { em: 'door', label: 'Porta trancada (se precisar)' },
  { em: 'drop', label: 'Água/bebida por perto' },
]

export function renderLesson(host, id) {
  const node = nodeById(id)
  if (!node) return go('#/trilha')

  // fase além da amostra grátis → paywall (não deixa entrar nem por link direto)
  if (!isPremium() && NODES.findIndex((n) => n.id === node.id) >= FREE_PHASES) {
    go('#/trilha')
    openPaywall('fase')
    return
  }
  const tabbar = qs('#tabbar')
  tabbar.hidden = true
  onLeave(() => {
    tabbar.hidden = false
  })

  const { text, capped } = nodeText(node)
  const idx = NODES.findIndex((n) => n.id === node.id)
  const dayInUnit = node.unit.days.findIndex((d) => d.id === node.id) + 1

  const top = el('div', { class: 'lesson-top' })
  const back = el('button', { class: 'icon-btn', html: icon('chevronLeft', 17), 'aria-label': 'voltar' })
  back.onclick = () => {
    sfx.tap()
    go('#/trilha')
  }
  const bar = el('div', { class: 'progress grow' }, [
    el('i', { style: { width: `${((idx + 1) / NODES.length) * 100}%` } }),
  ])
  const meta = el('span', { class: 'pill', text: `T${node.unit.id.slice(1)} · dia ${dayInUnit}` })
  top.append(back, bar, meta)

  const view = el('div', { class: 'lesson' })
  host.append(top, view)

  /* ---------------- visão 1: apresentação ---------------- */
  function intro() {
    view.innerHTML = ''
    const pet = mascot('chispa', node.level >= 3 ? 'love' : 'happy', { anim: 'idle' })
    pet.style.alignSelf = 'center'

    const hero = el('div', {
      class: 'lesson-hero',
      style: { background: `linear-gradient(150deg, ${node.unit.color}38, rgba(255,255,255,.04))` },
    })
    hero.innerHTML = `
      <div class="big-em">${icon(node.em, 58)}</div>
      <span class="trail-meta">temporada · ${node.unit.name}</span>
      <h1>${node.title}</h1>
      <div class="row wrap" style="justify-content:center;gap:6px">
        <span class="pill hot">${iconRepeat('pepper', node.level, 13)} ${['', 'suave', 'picante', 'fogo alto'][node.level]}</span>
        <span class="pill">${icon('clock', 13)} ${node.min >= 60 ? `${Math.round(node.min / 60)}h` : `${node.min} min`}</span>
        <span class="pill gold">+${node.xp} XP</span>
        ${capped ? '<span class="pill green">versão ajustada ao nível de vocês</span>' : ''}
      </div>`

    const body = el('div', { class: 'card lesson-body' })
    body.append(el('p', { text }))
    if (node.dica) {
      body.append(
        el('div', { class: 'tip', style: { marginTop: '12px' } }, [
          el('span', { html: icon('bulb', 17) }),
          el('span', { text: node.dica }),
        ]),
      )
    }
    body.append(
      el('div', {
        class: 'bubble',
        style: { marginTop: '14px' },
        html: `<span class="who">Chispa</span>${fillLine(pick(node.type === 'duelo' ? LINES.taunt : LINES.cheer), { streak: S.streak })}`,
      }),
    )

    /* aviso de conteúdo vetado pelo casal */
    const vetoed = (node.tags ?? []).filter((t) => S.prefs.vetoed.includes(t))
    const vetoBlock = []
    if (vetoed.length) {
      const warn = el('div', {
        class: 'tip',
        style: { background: 'rgba(168,39,71,.16)', borderColor: 'rgba(168,39,71,.55)', color: '#ffd7de' },
      })
      warn.innerHTML = `<span>${icon('ban', 17)}</span><span>Essa fase tem <strong>${vetoed.join(', ')}</strong>, que vocês vetaram nas preferências. Nada de culpa: troquem por outra coisa.</span>`
      const swap = el('button', { class: 'btn ghost sm', text: 'Sortear outro desafio no lugar', style: { alignSelf: 'flex-start' } })
      swap.onclick = () => {
        sfx.select()
        openExtraChallenge()
      }
      vetoBlock.push(warn, swap)
    }

    const actions = el('div', { class: 'lesson-actions' })
    const start = el('button', { class: 'btn', text: labelFor(node) })
    start.innerHTML = `<span class="shine"></span>${start.textContent}`
    start.onclick = () => {
      sfx.select()
      if (node.type === 'desafio') return ritual()
      if (node.type === 'bau') return chest()
      if (node.type === 'duelo') return duel()
      if (node.type === 'jogo') return play()
    }
    const skipRow = el('div', { class: 'row', style: { gap: '8px' } })
    const skip = el('button', {
      class: 'btn ghost grow sm',
      html: `${icon('cards', 14)}<span>Pular (${S.curingas})</span>`,
    })
    skip.onclick = () => skipSheet(node, () => go('#/trilha'))
    const later = el('button', { class: 'btn ghost grow sm', text: 'Ver depois' })
    later.onclick = () => {
      sfx.tap()
      go('#/trilha')
    }
    skipRow.append(skip, later)
    actions.append(start, skipRow)

    view.append(pet, hero, body, ...vetoBlock, actions)
  }

  /* ---------------- visão 2: ritual ---------------- */
  function ritual() {
    view.innerHTML = ''
    const done = new Set()
    const card = el('div', { class: 'card' })
    card.append(
      el('h2', { html: `${icon(node.em, 20)} Preparando o clima` }),
      el('p', { class: 'tiny muted', text: 'Marquem o que já está pronto. Não precisa ser tudo.' }),
    )
    const list = el('div', { class: 'col', style: { gap: '8px', marginTop: '12px' } })
    CHECKLIST.forEach((c) => {
      const t = el('div', { class: 'toggle', role: 'button' })
      t.innerHTML = `<span><strong style="font-size:13.5px">${icon(c.em, 17)} ${c.label}</strong></span><span class="sw"></span>`
      t.onclick = () => {
        const on = t.classList.toggle('on')
        on ? done.add(c.label) : done.delete(c.label)
        sfx.tap()
      }
      list.append(t)
    })
    card.append(list)

    const ring = el('div', { class: 'ritual' })
    const pulse = el('div', { class: 'pulse-ring' }, [el('div', { class: 'big-timer', text: fmtClock(node.min) })])
    ring.append(
      el('h2', { text: 'Valendo!' }),
      el('p', { class: 'tiny muted', text: 'O cronômetro é só um lembrete de que hoje é o dia. Podem parar quando quiserem.' }),
      pulse,
    )

    const controls = el('div', { class: 'row', style: { gap: '8px' } })
    const pause = el('button', { class: 'btn ghost grow sm', text: 'Pausar' })
    const finished = el('button', { class: 'btn green grow', html: `${icon('check', 15)}<span>Cumprimos</span>` })
    finished.onclick = () => {
      clearInterval(tick)
      finishFlow()
    }
    controls.append(pause, finished)

    let remaining = clamp(node.min, 1, 180) * 60
    let running = true
    const tick = interval(() => {
      if (!running) return
      remaining = Math.max(0, remaining - 1)
      pulse.innerHTML = `<div class="big-timer">${fmtClock(Math.ceil(remaining / 60))}</div>`
      if (remaining % 60 === 0 && remaining > 0) sfx.tick()
      if (remaining === 0) {
        running = false
        sfx.win()
        confetti()
        toast('Tempo do desafio completo! Vocês são incríveis.', 'hot', 3000, 'flame')
        finishFlow()
      }
    }, 1000)
    pause.onclick = () => {
      running = !running
      pause.textContent = running ? 'Pausar' : 'Continuar'
      sfx.tap()
    }

    const back = el('button', {
      class: 'btn ghost xs',
      html: `${icon('chevronLeft', 14)}<span>voltar ao desafio</span>`,
      style: { alignSelf: 'center' },
    })
    back.onclick = () => intro()

    view.append(card, ring, controls, back)
    burst(window.innerWidth / 2, window.innerHeight / 3, { count: 18, speed: [2, 7], colors: ['#c9a227', '#a82747'] })
  }

  /* ---------------- visão 3: conclusão ---------------- */
  function finishFlow() {
    view.innerHTML = ''
    let mood = 3
    const card = el('div', { class: 'card center' })
    card.append(
      el('div', { class: 'league-badge', html: icon(node.em, 52) }),
      el('h2', { text: 'Como foi o clima?' }),
      el('p', { class: 'tiny muted', text: 'A nota fica só entre vocês — e alimenta o diário do casal.' }),
    )
    const moods = el('div', { class: 'mood-pick', style: { marginTop: '12px' } })
    ;['moodCold', 'moodOk', 'moodCalm', 'moodHot', 'moodFire'].forEach((m, i) => {
      const b = el('button', { html: icon(m, 28), class: i + 1 === mood ? 'on' : '', 'aria-label': `clima ${i + 1} de 5` })
      b.onclick = () => {
        mood = i + 1
        sfx.tap()
        ;[...moods.children].forEach((c) => c.classList.remove('on'))
        b.classList.add('on')
        floatHearts(b, 2, m)
      }
      moods.append(b)
    })
    card.append(moods)
    const note = el('textarea', { class: 'input', style: { marginTop: '12px' }, placeholder: 'Quer guardar uma frase dessa noite? (opcional)' })
    card.append(note)

    const finish = el('button', { class: 'btn green', text: `Concluir fase · +${node.xp} XP` })
    finish.onclick = () => {
      const res = completeNode(node, { mood, note: note.value })
      sfx.win()
      confetti()
      floatHearts(finish, 8)
      renderTopbar()
      celebrate(res, node)
    }
    const again = el('button', { class: 'btn ghost', text: 'Ainda não, volta pro desafio' })
    again.onclick = () => intro()

    view.append(card, finish, again)
  }

  function celebrate(res, node) {
    const items = [
      { em: 'bolt', label: `+${node.xp} XP` },
      { em: 'flame', label: `${S.streak} ${S.streak === 1 ? 'dia' : 'dias'} de ofensiva` },
    ]
    if (res.streak?.streakUp) items.push({ em: 'arrowUp', label: 'ofensiva renovada' })
    for (const a of res.achievements ?? []) items.push({ em: a.em, label: a.name })
    celebrateReward({
      title: 'Fase concluída!',
      em: node.em,
      text: fillLine(pick(LINES.cheer), { streak: S.streak }),
      items,
      onClose: () => {
        if (res.level?.leveledUp) {
          celebrateLevel(res.level.level)
        } else if (node.type === 'duelo' && !S.seenCutscenes.includes('afterBoss')) {
          S.seenCutscenes.push('afterBoss')
          playCutscene(SCENES.afterBoss, { onDone: () => go('#/trilha') })
        } else {
          afterComplete(node)
        }
      },
    })
  }

  function afterComplete(node) {
    const hostBox = el('div', { class: 'col center', style: { gap: '12px' } })
    const m = mascot('chispa', 'love', { anim: 'happy' })
    hostBox.append(m)
    const nextIdx = NODES.indexOf(node) + 1
    const next = NODES[nextIdx]
    const paywalled = !isPremium() && nextIdx >= FREE_PHASES
    const info = paywalled
      ? `A fase ${nextIdx + 1} (${next ? next.title : 'a próxima'}) e as outras ${NODES.length - FREE_PHASES} estão do outro lado do passe.`
      : next
        ? nextIdx >= unlockedCount()
          ? 'A próxima fase abre amanhã à meia-noite. A Chispa vai lembrar vocês.'
          : `A próxima fase já está liberada: ${icon(next.em, 17)} ${next.title}`
        : 'Vocês terminaram todas as temporadas. A casa é oficialmente um vulcão.'
    hostBox.append(
      el('h2', { text: paywalled ? 'Amostra grátis concluída!' : 'Dia vencido!' }),
      el('p', { class: 'muted tiny', html: info }),
    )
    const row = el('div', { class: 'col', style: { gap: '8px', width: '100%' } })
    if (paywalled) {
      const buy = el('button', { class: 'btn gold' })
      buy.innerHTML = `<span class="shine"></span>${icon('key', 17)} Liberar as ${NODES.length} fases`
      buy.onclick = () => openPaywall('fase')
      const home = el('button', { class: 'btn ghost', text: 'Voltar à trilha' })
      home.onclick = () => go('#/trilha')
      row.append(buy, home)
    } else {
      const home = el('button', { class: 'btn', text: 'Voltar à trilha' })
      home.onclick = () => go('#/trilha')
      const extra = el('button', { class: 'btn ghost', text: 'Desafio extra' })
      extra.onclick = () => openExtraChallenge()
      row.append(home, extra)
    }
    hostBox.append(row)
    view.innerHTML = ''
    view.append(hostBox)
  }

  /* ---------------- jogo ---------------- */
  function play() {
    const kind = node.game ?? 'roleta'
    const lvl = Math.min(node.level ?? 1, S.prefs.intensity)
    const byLevel = {
      roleta: { 1: 'sofa', 2: 'cidade', 3: 'final' },
      dados: { 1: 'duracao', 2: 'tempero', 3: 'fantasia' },
    }
    const unitFlavor = {
      u2: { roleta: 'cozinha' },
      u3: { roleta: 'sofa' },
      u4: { dados: 'duracao' },
      u6: { roleta: 'cidade' },
      u7: { dados: 'fantasia' },
      u8: { roleta: 'final' },
    }
    const flavor = unitFlavor[node.unit.id]?.[kind]
    const opts = {}
    if (kind === 'roleta') opts.pool = (lvl >= 2 && flavor) || byLevel.roleta[lvl] || 'sofa'
    if (kind === 'dados') opts.set = (lvl >= 2 && flavor) || byLevel.dados[lvl] || 'tempero'
    if (kind === 'quiz') opts.spicy = lvl >= 3
    openGame(kind, {
      ...opts,
      onComplete: () => finishFlow(),
    })
  }

  /* ---------------- baú ---------------- */
  function chest() {
    view.innerHTML = ''
    const box = el('div', { class: 'col center', style: { gap: '16px', padding: '30px 0' } })
    const chest = el('div', { class: 'league-badge', html: icon('gift', 86) })
    chest.style.animation = 'crownBob 1s ease-in-out infinite'
    box.append(chest, el('h2', { text: 'Baú do dia' }), el('p', { class: 'tiny muted', text: node.text }))
    const open = el('button', { class: 'btn amber', text: 'Abrir baú' })
    open.innerHTML = '<span class="shine"></span>Abrir baú'
    open.onclick = () => {
      open.disabled = true
      chest.style.animation = 'mascotRage .28s ease-in-out 5'
      sfx.whoosh()
      setTimeout(() => {
        const res = openChest(node)
        burst(window.innerWidth / 2, window.innerHeight / 2.6, { count: 70, speed: [6, 16] })
        sfx.coin()
        renderTopbar()
        celebrateReward({
          title: 'Baú aberto!',
          em: 'gift',
          text: `+${res.brasas} brasas para gastar na loja`,
          items: [
            { em: 'gem', label: `${res.brasas} brasas` },
            ...res.extras.map((e) => ({ em: e.em, label: e.label })),
            { em: 'bolt', label: `+${node.xp} XP` },
          ],
          onClose: () => afterComplete(node),
        })
      }, 1500)
    }
    box.append(open)
    view.append(box)
  }

  /* ---------------- duelo ---------------- */
  function duel() {
    openGame('duelo', {
      boss: node.boss ?? { left: 'chispa', right: 'gota', bet: 'o direito de escolher o filme' },
      bonusXp: Math.round(node.xp * 0.4),
      onComplete: () => finishFlow(),
    })
  }

  intro()
}

function labelFor(node) {
  if (node.type === 'bau') return 'Abrir o baú'
  if (node.type === 'duelo') return 'Começar o duelo'
  if (node.type === 'jogo') return 'Abrir o jogo'
  return 'Começar agora'
}

function fmtClock(min) {
  const m = Math.max(0, Math.floor(min))
  if (m >= 60) return `${Math.floor(m / 60)}h${String(m % 60).padStart(2, '0')}`
  return `${String(m).padStart(2, '0')}:00`
}

export function skipSheet(node, after) {
  const host = el('div', { class: 'col' })
  const sheet = openSheet(host)
  const m = mascot('gota', 'sad', { anim: 'sad' })
  m.style.alignSelf = 'center'
  host.append(m)
  host.append(
    el('h2', { text: 'Pular essa fase?' }),
    el('p', { class: 'tiny muted', text: fillLine(pick(LINES.scold), {}) }),
  )

  const opts = el('div', { class: 'col', style: { gap: '8px', marginTop: '12px' } })

  const curinga = el('button', { class: 'choice', html: `<span class="c-em">${icon('cards', 22)}</span><span class="grow"><strong style="display:block">Usar um curinga</strong><span class="tiny muted">Você tem ${S.curingas}. A fase volta amanhã sem penalidade.</span></span>` })
  curinga.onclick = () => {
    if (S.curingas <= 0) {
      sfx.wrong()
      return toast('Sem curingas. Compre na loja do Ninho.', 'warn', 2400, 'cards')
    }
    skipNode(node, { usedCuringa: true })
    sfx.tap()
    renderTopbar()
    sheet.close()
    toast('Curinga usado. Amanhã tem outra.', '', 2400, 'cards')
    after?.()
  }

  const brasas = el('button', { class: 'choice', html: `<span class="c-em">${icon('gem', 22)}</span><span class="grow"><strong style="display:block">Pagar 60 brasas</strong><span class="tiny muted">Sem curinga, sem perder fôlego.</span></span>` })
  brasas.onclick = () => {
    if (!spendBrasas(60)) {
      sfx.wrong()
      return toast('Brasas insuficientes.', 'warn', 2400, 'gem')
    }
    skipNode(node, { usedCuringa: false })
    S.folego = Math.min(5, S.folego + 1)
    renderTopbar()
    sheet.close()
    toast('Pago. A Chispa anotou, mas relevou.', '', 2400, 'gem')
    after?.()
  }

  const adiar = el('button', { class: 'choice', html: `<span class="c-em">${icon('heartBroken', 22)}</span><span class="grow"><strong style="display:block">Adiar sem nada</strong><span class="tiny muted">Perde 1 fôlego e a fase continua aqui amanhã.</span></span>` })
  adiar.onclick = () => {
    skipNode(node, { usedCuringa: false })
    sfx.wrong()
    shake(host)
    renderTopbar()
    sheet.close()
    toast('Adiado. A Gota ficou murcha.', 'warn', 2600, 'heartBroken')
    after?.()
  }

  const keep = el('button', { class: 'btn ghost', text: 'Deixa pra lá, vamos jogar' })
  keep.onclick = () => {
    sfx.select()
    sheet.close()
  }

  opts.append(curinga, brasas, adiar)
  host.append(opts, keep)
  return sheet
}
