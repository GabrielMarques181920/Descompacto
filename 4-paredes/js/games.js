/* ============================================================
   MINI-JOGOS — roleta · dados · cartas · quiz · cronômetro · duelo
   ============================================================ */
import { CARDS, DICE_SETS, QUIZ, ROULETTES, TIMERS } from './content.js'
import { S, addBrasas, completeActivity, trackQuest } from './state.js'
import { clamp, el, pick, randInt, shuffle, sleep } from './util.js'
import { sfx } from './audio.js'
import { burst, confetti, floatHearts, shake } from './fx.js'
import { celebrateReward, onLayerClear, openSheet, toast } from './ui.js'
import { LINES, mascot, setMood } from './mascots.js'
import { icon } from './icons.js'

/* ---------- helper de conclusão ---------- */
let pendingComplete = null

/**
 * Recompensa do mini-jogo: o resultado fica na tela (toast + confete) e a
 * folha do jogo só fecha depois, para o casal conseguir ler o que saiu.
 */
function finishGame({ xp = 20, type = 'jogo', title = 'Mini-jogo', em = 'dice', msg = '', note = '', onClose, hold = 1300 }) {
  const res = completeActivity({ xp, type, title, em, note })
  const brasas = randInt(5, 18)
  addBrasas(brasas)
  const cb = onClose ?? pendingComplete
  pendingComplete = null
  toast(`${msg || title} · +${xp} XP · +${brasas} brasas`, 'hot', 3000, em)

  const extras = []
  if (res.achievements?.length) extras.push(...res.achievements.map((a) => ({ em: a.em, label: a.name })))

  if (extras.length) {
    setTimeout(() => {
      celebrateReward({
        title: 'Conquista nova!',
        em: extras[0].em,
        text: `${msg || title} · +${xp} XP · +${brasas} brasas`,
        items: extras,
        onClose: cb,
      })
    }, hold)
  } else {
    setTimeout(() => cb?.(), hold)
  }
  return res
}

const header = (title, sub, em) => {
  const box = el('div', { class: 'col', style: { gap: '4px', marginBottom: '12px' } })
  box.append(
    el('h2', {
      html: `<span style="display:inline-flex;vertical-align:-4px;color:var(--wine-300)">${icon(
        em ?? 'dice',
        20,
      )}</span> ${title}`,
    }),
  )
  if (sub) box.append(el('p', { class: 'tiny muted', text: sub }))
  return box
}

/* ============================================================
   ROLETA
   ============================================================ */
const WHEEL_COLORS = ['#7d1832', '#1c1619', '#93203c', '#262024', '#66132a', '#151113']

function buildRoulette(host, opts = {}) {
  const token = opts.token ?? {}
  const pool = opts.pool ?? 'sofa'
  const items = shuffle(ROULETTES[pool] ?? ROULETTES.sofa)
  const n = items.length
  const deg = 360 / n
  const stops = items.map((_, i) => `${WHEEL_COLORS[i % WHEEL_COLORS.length]} ${i * deg}deg ${(i + 1) * deg}deg`).join(',')

  host.append(header('Roleta do Desejo', 'Girem juntos. O que parar, vale.', 'wheel'))

  const wrap = el('div', { class: 'wheel-wrap' })
  const wheel = el('div', { class: 'wheel', style: { background: `conic-gradient(${stops})` } })
  items.forEach((it, i) => {
    const slot = el('div', {
      style: {
        position: 'absolute',
        inset: '0',
        display: 'grid',
        placeItems: 'start center',
        transform: `rotate(${i * deg + deg / 2}deg)`,
      },
    })
    const span = el('span', {
      text: it,
      style: {
        transform: 'translateY(10px)',
        fontSize: '9.5px',
        fontWeight: '900',
        color: '#f6f2f1',
        textShadow: '0 1px 3px rgba(0,0,0,.75)',
        maxWidth: '72px',
        textAlign: 'center',
        lineHeight: '1.1',
      },
    })
    slot.append(span)
    wheel.append(slot)
  })
  const hub = el('div', { class: 'wheel-hub' }, [el('div', { class: 'hub', html: icon('lips', 26) })])
  const pointer = el('div', { class: 'wheel-pointer', html: icon('caretDown', 26) })
  wrap.append(wheel, hub, pointer)

  const result = el('div', { class: 'combo-card', style: { display: 'none', marginBottom: '12px' } })
  const spinBtn = el('button', { class: 'btn', text: 'Girar a roleta' })
  spinBtn.innerHTML = '<span class="shine"></span>Girar a roleta'
  const againBtn = el('button', { class: 'btn ghost', text: 'Girar de novo' })
  againBtn.style.display = 'none'

  let rotation = 0
  let spinning = false
  let spinTimer = null

  spinBtn.onclick = () => {
    if (spinning) return
    spinning = true
    sfx.spin()
    const idx = randInt(0, n - 1)
    const jitter = (Math.random() - 0.5) * deg * 0.7
    const target = 360 * 6 + (360 - (idx * deg + deg / 2 + jitter))
    rotation += target
    wheel.classList.add('spinning')
    wheel.style.transform = `rotate(${rotation}deg)`
    result.style.display = 'none'
    spinBtn.disabled = true
    spinTimer = setTimeout(() => {
      if (token.closed) return
      spinning = false
      wheel.classList.remove('spinning')
      spinBtn.disabled = false
      spinBtn.style.display = 'none'
      againBtn.style.display = ''
      const chosen = items[idx]
      result.style.display = ''
      result.innerHTML = `<div class="tiny muted" style="text-transform:uppercase;letter-spacing:.1em">a roleta mandou</div>
        <h2 style="margin:6px 0">${chosen}</h2>
        <p class="tiny muted">Sem trocar, sem pedir de novo. Vocês têm 10 minutos.</p>`
      burst(window.innerWidth / 2, window.innerHeight / 2.6, { count: 34, speed: [4, 12] })
      sfx.correct()
      trackQuest('roleta', 1)
      finishGame({ xp: 25, type: 'roleta', title: `Roleta: ${chosen}`, em: 'wheel', msg: 'A roleta decidiu!' })
    }, 4700)
  }

  againBtn.onclick = () => {
    againBtn.style.display = 'none'
    spinBtn.style.display = ''
    result.style.display = 'none'
    spinBtn.onclick()
  }

  host.append(wrap, result, spinBtn, againBtn)
  return { destroy: () => clearTimeout(spinTimer) }
}

/* ============================================================
   DADOS
   ============================================================ */
function buildDice(host, opts = {}) {
  const token = opts.token ?? {}
  const setKey = opts.set ?? 'tempero'
  const set = DICE_SETS[setKey] ?? DICE_SETS.tempero
  const titles = { tempero: 'Dados do Tempero', duracao: 'Dados da Duração', fantasia: 'Dados da Fantasia' }

  host.append(header(titles[setKey] ?? 'Dados', 'Um dado diz o quê. O outro diz onde ou quanto.', 'dice'))

  const stage = el('div', { class: 'dice-stage' })
  const dieA = el('div', { class: 'die', text: '?' })
  const dieB = el('div', { class: 'die b', text: '?' })
  stage.append(dieA, dieB)

  const combo = el('div', { class: 'combo-card', style: { display: 'none', margin: '14px 0' } })
  const rollBtn = el('button', { class: 'btn', text: 'Rolar os dados' })
  rollBtn.innerHTML = '<span class="shine"></span>Rolar os dados'
  const rules = el('p', { class: 'tiny muted center', style: { marginTop: '12px' }, text: 'Regra da casa: o que cair, se cumpre. Curinga custa 1 carta do baralho.' })

  let rolling = false
  rollBtn.onclick = async () => {
    if (rolling) return
    rolling = true
    combo.style.display = 'none'
    dieA.classList.add('rolling')
    dieB.classList.add('rolling')
    sfx.whoosh()
    const ticks = 12
    for (let i = 0; i < ticks; i++) {
      dieA.textContent = pick(set.a)
      dieB.textContent = pick(set.b)
      await sleep(65)
    }
    const a = pick(set.a)
    const b = pick(set.b)
    if (token.closed) {
      rolling = false
      return
    }
    dieA.classList.remove('rolling')
    dieB.classList.remove('rolling')
    dieA.textContent = a
    dieB.textContent = b
    sfx.correct()
    combo.style.display = ''
    combo.innerHTML = `<div class="tiny muted" style="text-transform:uppercase;letter-spacing:.1em">combinação</div>
      <h2 style="margin:6px 0">${a} ${b}</h2>
      <p class="tiny muted">${set.combo(a, b)}</p>`
    burst(window.innerWidth / 2, window.innerHeight / 2.4, { count: 26, speed: [3, 10], colors: ['#c9a227', '#a82747', '#f6f2f1'] })
    finishGame({ xp: 20, type: 'dados', title: `Dados: ${a} ${b}`, em: 'dice', msg: 'Os dados falaram!' })
    rolling = false
  }

  host.append(stage, combo, rollBtn, rules)
}

/* ============================================================
   BARALHO
   ============================================================ */
function buildCards(host, opts = {}) {
  const token = opts.token ?? {}
  const pool = shuffle(CARDS).filter((c) => {
    if (c.kind === 'desejo') return S.prefs.intensity >= 2
    return true
  })
  host.append(header('Baralho do Desejo', 'Toquem na carta para virar. A carta manda.', 'cards'))

  let i = 0
  const deck = el('div', { class: 'deck' })
  const layerA = el('div', { class: 'layer', html: icon('cards', 44) })
  const layerB = el('div', { class: 'layer', html: icon('cards', 44) })
  const top = el('div', { class: 'layer top' })
  top.innerHTML = `<div class="back">${icon('flame', 52)}</div><div class="face"><h3>…</h3><p></p></div>`
  deck.append(layerA, layerB, top)
  const hint = el('p', { class: 'deck-hint', text: `${pool.length} cartas no baralho · toque para virar` })
  const actions = el('div', { class: 'row', style: { gap: '8px', marginTop: '14px', display: 'none' } })
  const doneBtn = el('button', { class: 'btn green grow', html: `${icon('check', 15)}<span>Cumprimos</span>` })
  const passBtn = el('button', { class: 'btn ghost grow', text: 'Passar' })
  actions.append(doneBtn, passBtn)

  let flipped = false
  let current = null

  function draw() {
    if (i >= pool.length) {
      hint.textContent = 'O baralho acabou. Vocês são oficialmente um casal sem cartas.'
      top.querySelector('.face h3').textContent = 'Fim do baralho'
      top.querySelector('.face p').textContent = 'Agora a imaginação de vocês é o jogo.'
      actions.style.display = 'none'
      return
    }
    current = pool[i++]
    top.classList.remove('flipped')
    flipped = false
    actions.style.display = 'none'
    const face = top.querySelector('.face')
    face.innerHTML = `<div>${icon(current.em, 34)}</div>
      <span class="pill hot" style="align-self:center">${current.kind}</span>
      <h3>${current.title}</h3>
      <p>${current.text}</p>`
    hint.textContent = `${pool.length - i} cartas restantes · toque para virar`
  }

  top.onclick = () => {
    if (flipped) return
    flipped = true
    sfx.whoosh()
    top.classList.add('flipped')
    setTimeout(() => {
      sfx.select()
      floatHearts(top, 4)
      actions.style.display = 'flex'
    }, 700)
  }

  doneBtn.onclick = () => {
    const xp = current?.kind === 'curinga' ? 15 : current?.kind === 'carinho' ? 20 : 30
    finishGame({ xp, type: 'cartas', title: `Carta: ${current?.title}`, em: current?.em ?? 'cards', msg: 'Carta cumprida!' })
    draw()
  }
  passBtn.onclick = () => {
    sfx.wrong()
    toast('Carta passada. O baralho anota tudo.', 'warn', 2200, 'eyeOff')
    draw()
  }

  draw()
  host.append(deck, hint, actions)
}

/* ============================================================
   QUIZ DO CASAL
   ============================================================ */
function buildQuiz(host, opts = {}) {
  const token = opts.token ?? {}
  const spicy = opts.spicy ?? S.prefs.intensity >= 3
  const pool = shuffle(spicy ? QUIZ : QUIZ.filter((q) => !q.spicy)).slice(0, 8)
  const p1 = S.couple.p1 || 'Um'
  const p2 = S.couple.p2 || 'Outro'

  host.append(header('Quem conhece quem?', `${pool.length} perguntas · cada um responde sobre o outro`, 'brain'))

  const vs = el('div', { class: 'quiz-vs' })
  const tagA = el('span', { class: 'who-tag', text: p1 })
  const tagB = el('span', { class: 'who-tag', text: p2 })
  vs.append(tagA, el('span', { html: icon('bolt', 18) }), tagB)

  const progress = el('div', { class: 'progress' }, [el('i', { style: { width: '0%' } })])
  const qBox = el('div', { class: 'card', style: { marginTop: '12px' } })
  const scoreBox = el('div', { class: 'tiny muted center', style: { marginTop: '10px' }, text: 'Sintonia: 0%' })

  let i = 0
  let matches = 0
  let phase = 'p1'
  let answerA = null

  function renderQuestion() {
    const q = pool[i]
    tagA.classList.toggle('on', phase === 'p1')
    tagB.classList.toggle('on', phase === 'p2')
    qBox.innerHTML = ''
    qBox.append(
      el('div', { class: 'tiny muted', text: `Pergunta ${i + 1} de ${pool.length}` }),
      el('h3', { text: q.q, style: { margin: '6px 0 12px' } }),
    )
    const label = el('p', {
      class: 'tiny',
      style: { marginBottom: '10px', fontWeight: '800', color: phase === 'p1' ? '#f6f2f1' : '#e6cd84' },
      text: phase === 'p1' ? `${p1}, responda o que você acha:` : `Agora é a vez de ${p2} (sem espiar!):`,
    })
    qBox.append(label)
    q.a.forEach((opt, k) => {
      const b = el('button', { class: 'answer' })
      b.innerHTML = `<span class="k">${'ABCD'[k]}</span><span>${opt}</span>`
      b.onclick = () => choose(k, b)
      qBox.append(b)
    })
  }

  function choose(k, node) {
    if (phase === 'p1') {
      answerA = k
      sfx.tap()
      node.classList.add('right')
      phase = 'p2'
      setTimeout(() => {
        qBox.innerHTML = ''
        const m = mascot('gota', 'wink', { anim: 'idle' })
        const curtain = el('div', { class: 'col center', style: { gap: '10px', padding: '10px 0' } })
        curtain.append(m, el('h3', { text: `Passa o celular para ${p2}` }), el('p', { class: 'tiny muted', text: `${p1} já respondeu. Sem espiar, hein.` }))
        const go = el('button', { class: 'btn', text: `Sou ${p2}, pode mostrar` })
        go.onclick = () => {
          sfx.select()
          renderQuestion()
        }
        qBox.append(curtain, go)
      }, 420)
    } else {
      const same = k === answerA
      if (same) matches++
      sfx[same ? 'correct' : 'wrong']()
      const answers = [...qBox.querySelectorAll('.answer')]
      answers.forEach((a, idx) => {
        if (idx === answerA) a.classList.add('right')
        if (idx === k && !same) a.classList.add('wrong')
      })
      if (!same) shake(qBox)
      const verdict = el('p', {
        class: 'tiny center',
        style: { marginTop: '12px', fontWeight: '900', color: same ? '#e6cd84' : '#c4506a' },
        text: same ? 'Sintonia total!' : 'Vocês precisam conversar sobre isso hoje à noite.',
      })
      qBox.append(verdict)
      if (same) floatHearts(qBox, 5)
      phase = 'p1'
      i++
      progress.firstElementChild.style.width = `${(i / pool.length) * 100}%`
      scoreBox.textContent = `Sintonia: ${Math.round((matches / Math.max(1, i)) * 100)}%`
      if (i >= pool.length) {
        setTimeout(showResult, 900)
        return
      }
      setTimeout(renderQuestion, 1500)
    }
  }

  function showResult() {
    const pct = matches / pool.length
    S.stats.quizBest = Math.max(S.stats.quizBest || 0, pct)
    const xp = 20 + matches * 8
    const title =
      pct >= 0.8 ? 'Telepatia de casal' : pct >= 0.5 ? 'Vocês se conhecem bem' : 'Tem muito o que descobrir'
    finishGame({ xp, type: 'quiz', title: `Quiz: ${matches}/${pool.length}`, em: 'brain', msg: `${title} — ${matches}/${pool.length}` })
  }

  host.append(vs, progress, qBox, scoreBox)
  renderQuestion()
}

/* ============================================================
   CRONÔMETRO DO TOQUE
   ============================================================ */
function buildTimer(host, opts = {}) {
  const token = opts.token ?? {}
  host.append(header('Cronômetro do Toque', 'Escolham a ação e deixem o tempo mandar.', 'stopwatch'))

  const grid = el('div', { class: 'col', style: { gap: '8px' } })
  const runBox = el('div', { class: 'ritual', style: { display: 'none' } })
  const big = el('div', { class: 'pulse-ring' }, [el('div', { class: 'big-timer', text: '00:00' })])
  const actionLabel = el('h2', {})
  const actionText = el('p', { class: 'tiny muted', style: { maxWidth: '320px' } })
  const controls = el('div', { class: 'row', style: { gap: '8px', marginTop: '6px' } })
  runBox.append(actionLabel, actionText, big, controls)

  let total = 0
  let left = 0
  let ticking = null
  let current = null

  function fmt(s) {
    return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
  }

  function start(item, minutes) {
    current = item
    total = minutes * 60
    left = total
    grid.style.display = 'none'
    runBox.style.display = ''
    actionLabel.innerHTML = `${icon(item.em, 20)} ${item.label}`
    actionText.textContent = item.text
    big.firstElementChild && (big.innerHTML = `<div class="big-timer">${fmt(left)}</div>`)
    controls.innerHTML = ''
    const pause = el('button', { class: 'btn ghost grow', text: 'Pausar' })
    const done = el('button', { class: 'btn green grow', html: `${icon('check', 15)}<span>Cumprimos</span>` })
    const stop = el('button', { class: 'btn ghost xs', html: icon('refresh', 15), 'aria-label': 'reiniciar' })
    controls.append(pause, done, stop)

    pause.onclick = () => {
      if (ticking) {
        clearInterval(ticking)
        ticking = null
        pause.textContent = 'Continuar'
      } else {
        ticking = setInterval(tick, 1000)
        pause.textContent = 'Pausar'
      }
      sfx.tap()
    }
    stop.onclick = () => reset()
    done.onclick = () => {
      clearInterval(ticking)
      ticking = null
      const pctDone = clamp(1 - left / Math.max(1, total), 0, 1)
      const xp = Math.round(20 + pctDone * 35)
      finishGame({
        xp,
        type: 'timer',
        title: `Cronômetro: ${item.label}`,
        em: item.em,
        msg: pctDone >= 0.95 ? 'Cronômetro completo!' : `Vocês aguentaram ${Math.round(pctDone * 100)}%`,
      })
      S.stats.minutes += Math.round((total - left) / 60)
      reset()
    }
    ticking = setInterval(tick, 1000)
  }

  function tick() {
    if (token.closed) {
      clearInterval(ticking)
      ticking = null
      return
    }
    left--
    big.innerHTML = `<div class="big-timer">${fmt(Math.max(0, left))}</div>`
    if (left % 10 === 0) sfx.tick()
    if (left <= 0) {
      clearInterval(ticking)
      ticking = null
      sfx.win()
      confetti()
      big.innerHTML = `<div class="big-timer" style="display:grid;place-items:center">${icon('flame', 52)}</div>`
      toast('Tempo esgotado! Vocês venceram o cronômetro.', 'hot', 3200, 'stopwatch')
      finishGame({ xp: 55, type: 'timer', title: `Cronômetro: ${current?.label}`, em: current?.em ?? 'stopwatch', msg: 'Cronômetro completo!' })
      S.stats.minutes += Math.round(total / 60)
      setTimeout(reset, 1400)
    }
  }

  function reset() {
    clearInterval(ticking)
    ticking = null
    runBox.style.display = 'none'
    grid.style.display = ''
  }

  const presets = TIMERS.filter((t) => (t.level ?? 1) <= S.prefs.intensity)
  const list = presets.length ? presets : TIMERS.filter((t) => (t.level ?? 1) <= 1)
  for (const t of list) {
    const b = el('button', { class: 'choice' })
    b.innerHTML = `<span class="c-em">${icon(t.em, 22)}</span>
      <span class="grow"><strong style="display:block">${t.label}</strong>
      <span class="tiny muted">${t.text.slice(0, 74)}…</span></span>
      <span class="pill gold">${t.min} min</span>`
    b.onclick = () => {
      sfx.select()
      start(t, t.min)
    }
    grid.append(b)
  }

  const custom = el('button', { class: 'choice' })
  custom.innerHTML = `<span class="c-em">${icon('pencil', 22)}</span><span class="grow"><strong style="display:block">Modo livre</strong>
    <span class="tiny muted">Vocês inventam a ação, o jogo só conta o tempo.</span></span><span class="pill">3–30 min</span>`
  custom.onclick = () => {
    sfx.select()
    start({ em: 'pencil', label: 'Modo livre', text: 'Regra combinada entre vocês. O cronômetro só garante que ninguém desiste no meio.' }, randInt(3, 12))
  }
  grid.append(custom)

  host.append(grid, runBox)
}

/* ============================================================
   DUELO DOS MASCOTES
   ============================================================ */
export function buildDuel(host, opts = {}) {
  const token = opts.token ?? {}
  const boss = opts.boss ?? { left: 'chispa', right: 'gota', bet: 'o direito de escolher o filme' }
  const p1 = S.couple.p1 || 'Um'
  const p2 = S.couple.p2 || 'Outro'
  const DURATION = opts.seconds ?? 25
  const MAXHP = 100

  host.append(header('Duelo dos Mascotes', `${p1} defende a esquerda · ${p2} defende a direita · ${DURATION}s`, 'swords'))

  const arena = el('div', { class: 'battle-arena' })
  arena.append(el('div', { class: 'floor' }))

  const mL = mascot(boss.left ?? 'chispa', 'angry', { anim: 'angry' })
  const mR = mascot(boss.right ?? 'gota', 'angry', { anim: 'angry' })
  const hpL = el('div', { class: 'hp' }, [el('i', { style: { width: '100%' } })])
  const hpR = el('div', { class: 'hp' }, [el('i', { style: { width: '100%' } })])
  const fL = el('div', { class: 'fighter left' }, [hpL, mL])
  const fR = el('div', { class: 'fighter right' }, [hpR, mR])
  const clash = el('div', { class: 'clash', html: icon('burst', 42) })
  const fighters = el('div', { class: 'fighters' }, [fL, fR, clash])
  const taunt = el('div', { class: 'bubble center', style: { marginTop: '10px' } })
  taunt.innerHTML = `<span class="who">Chispa</span>${pick(LINES.taunt)}`
  arena.append(fighters, taunt)

  const timerBar = el('div', { class: 'progress', style: { marginTop: '12px' } }, [el('i', { style: { width: '100%' } })])
  const clock = el('div', { class: 'center countdown', style: { fontSize: '20px', marginTop: '6px' }, text: `${DURATION}` })
  const zones = el('div', { class: 'row', style: { gap: '10px', marginTop: '12px' } })
  const zL = el('div', { class: 'tap-zone grow', html: `<div class="center">${p1}<br><span class="tiny">TOQUE AQUI</span></div>` })
  const zR = el('div', { class: 'tap-zone grow', html: `<div class="center">${p2}<br><span class="tiny">TOQUE AQUI</span></div>` })
  zones.append(zL, zR)
  const startBtn = el('button', { class: 'btn', text: 'Começar o duelo' })
  startBtn.innerHTML = '<span class="shine"></span>Começar o duelo'

  let hpA = MAXHP
  let hpB = MAXHP
  let running = false
  let timeLeft = DURATION
  let interval = null
  let tauntInterval = null

  function hit(side) {
    if (!running) return
    const dmg = randInt(2, 4)
    if (side === 'L') {
      hpB = Math.max(0, hpB - dmg)
      hpR.firstElementChild.style.width = `${hpB}%`
      fR.classList.remove('hit')
      void fR.offsetWidth
      fR.classList.add('hit')
      burst(window.innerWidth * 0.72, window.innerHeight * 0.42, { count: 6, speed: [2, 6], size: [4, 9], shapes: ['spark', 'ring'] })
    } else {
      hpA = Math.max(0, hpA - dmg)
      hpL.firstElementChild.style.width = `${hpA}%`
      fL.classList.remove('hit')
      void fL.offsetWidth
      fL.classList.add('hit')
      burst(window.innerWidth * 0.28, window.innerHeight * 0.42, { count: 6, speed: [2, 6], size: [4, 9], shapes: ['spark', 'ring'] })
    }
    hpL.classList.toggle('low', hpA < 35)
    hpR.classList.toggle('low', hpB < 35)
    clash.classList.remove('go')
    void clash.offsetWidth
    clash.classList.add('go')
    sfx.hit()
    if (hpA <= 0 || hpB <= 0) end(hpA <= 0 ? 'R' : 'L')
  }

  const onTapL = (e) => {
    e.preventDefault()
    hit('L')
  }
  const onTapR = (e) => {
    e.preventDefault()
    hit('R')
  }
  zL.addEventListener('pointerdown', onTapL)
  zR.addEventListener('pointerdown', onTapR)

  function sayTaunt() {
    const kind = pick(['chispa', 'gota'])
    taunt.innerHTML = `<span class="who">${kind === 'chispa' ? 'Chispa' : 'Gota'}</span>${pick(LINES.taunt)}`
    taunt.className = `bubble center ${kind === 'gota' ? 'right' : ''}`
    taunt.style.marginTop = '10px'
  }

  function start() {
    running = true
    startBtn.style.display = 'none'
    hpA = hpB = MAXHP
    timeLeft = DURATION
    hpL.firstElementChild.style.width = '100%'
    hpR.firstElementChild.style.width = '100%'
    setMood(mL, 'angry', 'angry')
    setMood(mR, 'angry', 'angry')
    sfx.alarm()
    interval = setInterval(() => {
      if (token.closed) return
      timeLeft--
      clock.textContent = String(timeLeft)
      timerBar.firstElementChild.style.width = `${(timeLeft / DURATION) * 100}%`
      if (timeLeft % 5 === 0) sfx.tick()
      if (timeLeft <= 0) end(hpA === hpB ? 'draw' : hpA > hpB ? 'L' : 'R')
    }, 1000)
    tauntInterval = setInterval(sayTaunt, 3800)
  }

  function end(winner) {
    running = false
    clearInterval(interval)
    clearInterval(tauntInterval)
    const winLeft = winner === 'L'
    const draw = winner === 'draw'
    setMood(winLeft ? mL : mR, draw ? 'shock' : 'love', 'happy')
    setMood(winLeft ? mR : mL, draw ? 'shock' : 'sad', 'sad')
    const who = draw ? 'Empate técnico' : winLeft ? `${p1} venceu!` : `${p2} venceu!`
    taunt.innerHTML = `<span class="who">resultado</span>${who} — aposta: ${boss.bet}.`
    if (draw) sfx.lose()
    else sfx.win()
    confetti()
    if (!draw) S.stats.duels++
    trackQuest('duelo', draw ? 0 : 1)
    const xp = draw ? 40 : 70 + (opts.bonusXp ?? 0)
    finishGame({
      xp,
      type: 'duelo',
      title: `Duelo: ${who}`,
      em: 'swords',
      msg: draw ? 'Empate! Os mascotes vão continuar brigando.' : `${who} Aposta: ${boss.bet}`,
    })
    startBtn.style.display = ''
    startBtn.textContent = 'Revanche!'
    clock.textContent = '0'
    timerBar.firstElementChild.style.width = '0%'
  }

  startBtn.onclick = start
  host.append(arena, timerBar, clock, zones, startBtn)

  return {
    destroy() {
      clearInterval(interval)
      clearInterval(tauntInterval)
      zL.removeEventListener('pointerdown', onTapL)
      zR.removeEventListener('pointerdown', onTapR)
    },
  }
}

/* ============================================================
   REGISTRO / ABERTURA
   ============================================================ */
export const GAMES = {
  roleta: { em: 'wheel', name: 'Roleta do Desejo', desc: 'Gire e cumpra o que parar. Sem veto.', build: buildRoulette, pools: ['cozinha', 'sofa', 'cidade', 'final'] },
  dados: { em: 'dice', name: 'Dados do Tempero', desc: 'Um dado diz o quê, o outro diz onde.', build: buildDice, pools: ['tempero', 'duracao', 'fantasia'] },
  cartas: { em: 'cards', name: 'Baralho do Desejo', desc: 'Verdade, desafio, desejo ou curinga.', build: buildCards },
  quiz: { em: 'brain', name: 'Quem conhece quem?', desc: 'Cada um responde sobre o outro. Sintonia medida.', build: buildQuiz },
  timer: { em: 'stopwatch', name: 'Cronômetro do Toque', desc: 'Ação + tempo. Enquanto roda, vale só aquilo.', build: buildTimer },
  duelo: { em: 'swords', name: 'Duelo dos Mascotes', desc: 'Chispa × Gota. Dedos na zona de toque.', build: buildDuel },
}

const openHandles = new Set()

export function openGame(kind, opts = {}) {
  const game = GAMES[kind] ?? GAMES.roleta
  const host = el('div', { class: 'col' })
  for (const h of openHandles) h.destroy?.()
  openHandles.clear()
  const token = { closed: false }
  const sheet = openSheet(host, {})
  const keepOpen = opts.closeOnComplete === false
  pendingComplete = opts.onComplete
    ? () => {
        if (!keepOpen) sheet.close()
        setTimeout(() => opts.onComplete(), keepOpen ? 0 : 280)
      }
    : null
  let built = null
  const offHook = onLayerClear(() => {
    token.closed = true
    built?.destroy?.()
  })
  built = game.build(host, { ...opts, sheet, token })
  const prevClose = sheet.close
  sheet.close = () => {
    token.closed = true
    pendingComplete = null
    offHook()
    built?.destroy?.()
    prevClose()
  }
  const handle = { destroy: () => sheet.close() }
  openHandles.add(handle)
  sheet.box.addEventListener('transitionend', () => openHandles.delete(handle), { once: true })
  return sheet
}

export function closeAllGames() {
  for (const h of openHandles) h.destroy?.()
  openHandles.clear()
}
