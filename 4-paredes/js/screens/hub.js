/* ============================================================
   JOGOS — mesa de mini-jogos avulsos (jogáveis a qualquer hora)
   ============================================================ */
import { ROULETTES } from '../content.js'
import { S, completeActivity, maybeLightning } from '../state.js'
import { el, pick } from '../util.js'
import { render } from '../router.js'
import { nudge, openSheet, renderTabbar, renderTopbar, toast } from '../ui.js'
import { GAMES, openGame } from '../games.js'
import { sfx } from '../audio.js'
import { mascot, LINES, fillLine } from '../mascots.js'
import { openExtraChallenge } from './extra.js'
import { icon } from '../icons.js'

const POOLS = {
  roleta: [
    { id: 'cozinha', em: 'pot', label: 'Roleta da Cozinha' },
    { id: 'sofa', em: 'bed', label: 'Roleta do Sofá' },
    { id: 'cidade', em: 'city', label: 'Roleta da Cidade' },
    { id: 'final', em: 'flame', label: 'Roleta Final (nível 3)' },
  ],
  dados: [
    { id: 'tempero', em: 'pepper', label: 'Dados do Tempero' },
    { id: 'duracao', em: 'stopwatch', label: 'Dados da Duração' },
    { id: 'fantasia', em: 'mask', label: 'Dados da Fantasia' },
  ],
}

export function renderHub(host) {
  renderTabbar('jogos')
  const wrap = el('div', { class: 'col stagger' })
  host.append(wrap)

  const head = el('div', { class: 'trail-head' })
  head.append(
    el('div', { class: 'grow' }, [
      el('div', { class: 'trail-meta', text: 'mesa de jogos' }),
      el('h1', { text: 'O que vocês jogam hoje?' }),
      el('p', { class: 'tiny muted', text: 'Mini-jogos liberados a qualquer hora. Valem XP, mas não contam como fase do dia.' }),
    ]),
    mascot('fosforo', 'wink', { anim: 'wave' }),
  )
  wrap.append(head)

  /* relâmpago */
  const item = S.lightning.today
  const light = el('div', { class: 'card tight daily-card' })
  light.innerHTML = item
    ? `<div class="row"><span class="flame-live" style="color:var(--gold)">${icon('bolt', 24)}</span>
        <span class="grow"><div class="trail-meta">relâmpago ativo</div>
        <strong style="font-size:14px">${item.title}</strong>
        <p class="tiny muted">${item.text}</p></span></div>`
    : `<div class="row"><span style="color:var(--gold)">${icon('bolt', 24)}</span>
        <span class="grow"><strong style="font-size:14px">Desafio relâmpago</strong>
        <p class="tiny muted">Um desafio de 2 minutos para fazer agora, valendo XP e brasas.</p></span></div>`
  const lightBtn = el('button', {
    class: 'btn sm amber',
    html: item
      ? `${icon('check', 15)}<span>Já fizemos</span>`
      : `${icon('bolt', 15)}<span>Sortear relâmpago</span>`,
    style: { marginTop: '10px' },
  })
  lightBtn.onclick = () => {
    if (item) {
      const res = S.lightning.today
      S.lightning.today = null
      completeActivity({ xp: res.xp ?? 25, type: 'relampago', title: res.title, em: res.em })
      sfx.correct()
      toast(`+${res.xp ?? 25} XP pela rapidez!`, 'good', 2600, 'bolt')
      render()
      return
    }
    const got = maybeLightning(true)
    sfx.alarm()
    if (!got) return toast('Calma: um relâmpago por vez.', 'warn', 2200, 'bolt')
    render()
  }
  light.append(lightBtn)
  wrap.append(light)

  /* jogos */
  wrap.append(el('div', { class: 'section-title' }, [el('h2', { html: `${icon('dice', 16)} Os jogos` })]))
  const grid = el('div', { class: 'col', style: { gap: '10px' } })
  for (const [kind, g] of Object.entries(GAMES)) {
    const card = el('button', { class: 'game-card' })
    card.innerHTML = `<span class="g-em">${icon(g.em, 26)}</span>
      <span class="grow"><strong style="font-size:15px">${g.name}</strong><p>${g.desc}</p></span>
      <span class="pill gold">+XP</span>`
    card.onclick = () => {
      sfx.select()
      if (POOLS[kind]) return pickPool(kind, g)
      openGame(kind, { onComplete: () => renderTopbar(), closeOnComplete: false })
    }
    grid.append(card)
  }
  wrap.append(grid)

  /* extras */
  wrap.append(
    el('div', { class: 'section-title' }, [el('h2', { html: `${icon('sparkle', 16)} Fora da trilha` })]),
  )
  const extras = el('div', { class: 'col', style: { gap: '10px' } })
  const extra = el('button', { class: 'game-card' })
  extra.innerHTML = `<span class="g-em">${icon('target', 26)}</span>
    <span class="grow"><strong style="font-size:15px">Desafio extra sorteado</strong>
    <p>Um desafio avulso do baralho, respeitando o nível de intensidade de vocês.</p></span>`
  extra.onclick = () => {
    sfx.select()
    openExtraChallenge()
  }
  const surprise = el('button', { class: 'game-card' })
  surprise.innerHTML = `<span class="g-em">${icon('wheel', 26)}</span>
    <span class="grow"><strong style="font-size:15px">Noite surpresa</strong>
    <p>A gente monta a noite inteira: entrada, prato principal e sobremesa.</p></span>`
  surprise.onclick = () => {
    sfx.select()
    openSurpriseNight()
  }
  extras.append(extra, surprise)
  wrap.append(extras)

  wrap.append(
    el('p', {
      class: 'tiny muted center',
      style: { marginTop: '18px' },
      text: fillLine(pick(LINES.idle), { streak: S.streak }),
    }),
  )
}

function pickPool(kind, g) {
  const host = el('div', { class: 'col' })
  host.append(el('h2', { html: `${icon(g.em, 20)} Escolha o baralho` }))
  host.append(el('p', { class: 'tiny muted', text: 'Cada baralho tem 12 resultados diferentes.' }))
  const sheet = openSheet(host)
  for (const opt of POOLS[kind]) {
    const b = el('button', { class: 'choice' })
    b.innerHTML = `<span class="c-em">${icon(opt.em, 22)}</span><span class="grow"><strong>${opt.label}</strong></span>`
    b.onclick = () => {
      sfx.select()
      sheet.close()
      openGame(kind, { pool: opt.id, set: opt.id, onComplete: () => renderTopbar(), closeOnComplete: false })
    }
    host.append(b)
  }
}

function openSurpriseNight() {
  const courses = [
    { em: 'glasses', label: 'Entrada', pool: 'sofa' },
    { em: 'utensils', label: 'Prato principal', pool: 'cidade' },
    { em: 'cup', label: 'Sobremesa', pool: S.prefs.intensity >= 3 ? 'final' : 'sofa' },
  ]
  const host = el('div', { class: 'col' })
  const sheet = openSheet(host)
  host.append(
    el('h2', { html: `${icon('wheel', 20)} Noite surpresa` }),
    el('p', {
      class: 'tiny muted',
      text: 'Três rodadas de roleta: uma para começar, uma para o meio e uma para terminar. Cumpram na ordem.',
    }),
  )
  const m = mascot('chispa', 'love', { anim: 'idle' })
  m.style.alignSelf = 'center'
  host.append(m)

  const one = el('button', { class: 'btn', text: 'Sortear a noite inteira' })
  one.innerHTML = '<span class="shine"></span>Sortear a noite inteira'
  one.onclick = () => {
    sfx.spin()
    sheet.close()
    setTimeout(() => showThree(courses), 300)
  }
  host.append(one)

  host.append(el('p', { class: 'tiny muted center', text: 'ou jogue um prato de cada vez:' }))
  for (const c of courses) {
    const b = el('button', { class: 'choice' })
    b.innerHTML = `<span class="c-em">${icon(c.em, 22)}</span><span class="grow"><strong>${c.label}</strong>
      <span class="tiny muted">roleta ${c.pool}</span></span>`
    b.onclick = () => {
      sfx.select()
      sheet.close()
      openGame('roleta', { pool: c.pool, closeOnComplete: false, onComplete: () => nudge(`Próximo prato da noite: ${c.label}`, { em: c.em, actionLabel: 'Ok' }) })
    }
    host.append(b)
  }
}

function showThree(courses) {
  const results = courses.map((c) => ({ ...c, result: pick(ROULETTES[c.pool]) }))
  const box = el('div', { class: 'col' })
  const sheet = openSheet(box)
  box.append(el('h2', { html: `${icon('wheel', 20)} A noite de vocês` }))
  for (const r of results) {
    const card = el('div', { class: 'card tight' })
    card.innerHTML = `<div class="trail-meta">${icon(r.em, 13)} ${r.label}</div><h3 style="margin-top:4px">${r.result}</h3>`
    box.append(card)
  }
  const note = el('textarea', { class: 'input', placeholder: 'Como foi a noite? (entra no diário)' })
  box.append(note)
  const ok = el('button', { class: 'btn green', text: 'Aceitamos a noite (+60 XP)' })
  ok.onclick = () => {
    completeActivity({
      xp: 60,
      type: 'noite',
      title: 'Noite surpresa',
      em: 'wheel',
      note: [note.value.trim(), results.map((r) => `${r.label}: ${r.result}`).join(' · ')].filter(Boolean).join(' — '),
      mood: 4,
    })
    sheet.close()
    toast('Noite surpresa registrada no diário!', 'good', 2600, 'wheel')
    render()
  }
  box.append(ok)
}
