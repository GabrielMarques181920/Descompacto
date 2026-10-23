/* ============================================================
   NINHO — perfil do casal, diário, conquistas, preferências e loja
   ============================================================ */
import { ACHIEVEMENTS, EXTRA, LEVELS, NODES } from '../content.js'
import { S, addBrasas, buy, levelInfo, resetAll, save, SHOP, unlockedCount } from '../state.js'
import { DAY, el, parseKey, todayKey } from '../util.js'
import { render } from '../router.js'
import { confirmDialog, openSheet, renderTabbar, renderTopbar, toast } from '../ui.js'
import { mascot, SCENES, playCutscene } from '../mascots.js'
import { setSound, sfx } from '../audio.js'
import { confetti } from '../fx.js'
import { nextReminderLabel, notify, requestPermission, scheduleDaily } from '../notify.js'
import { icon, iconRepeat } from '../icons.js'


const SYMBOLOS = [
  'couple',
  'heart',
  'flame',
  'ring',
  'leaf',
  'moon',
  'cherry',
  'glasses',
  'heartHands',
  'pepper',
  'gem',
  'star',
]

export function renderProfile(host) {
  renderTabbar('ninho')
  const wrap = el('div', { class: 'col stagger' })
  host.append(wrap)

  wrap.append(coupleCard())
  wrap.append(statsCard())
  wrap.append(weekCard())
  wrap.append(badgeCard())
  wrap.append(diaryCard())
  wrap.append(prefsCard())
  wrap.append(shopCard())
  wrap.append(dangerCard())
  wrap.append(aboutCard())
}

/* ---------- casal ---------- */
function coupleCard() {
  const li = levelInfo()
  const card = el('div', { class: 'card' })
  const head = el('div', { class: 'row between' })
  const left = el('div', { class: 'grow' })
  left.append(
    el('div', { class: 'trail-meta', text: 'o casal' }),
    el('h1', { text: `${S.couple.p1} & ${S.couple.p2}` }),
    el('p', { class: 'tiny muted', text: `nível ${li.level} · ${li.into}/${li.need} XP para o próximo` }),
  )
  const av = el('button', {
    class: 'league-badge',
    html: icon(S.couple.emoji, 34),
    style: { cursor: 'pointer' },
    'aria-label': 'trocar símbolo do casal',
  })
  av.onclick = () => pickEmoji(av)
  head.append(left, av)
  card.append(head)
  card.append(el('div', { class: 'progress', style: { margin: '12px 0' } }, [el('i', { style: { width: `${li.pct * 100}%` } })]))

  const row = el('div', { class: 'row', style: { gap: '8px' } })
  const i1 = el('input', { class: 'input', value: S.couple.p1, 'aria-label': 'nome 1', maxlength: '14' })
  const i2 = el('input', { class: 'input', value: S.couple.p2, 'aria-label': 'nome 2', maxlength: '14' })
  i1.oninput = () => {
    S.couple.p1 = i1.value.slice(0, 14) || 'Você'
    save()
    renderTopbar()
  }
  i2.oninput = () => {
    S.couple.p2 = i2.value.slice(0, 14) || 'Amor'
    save()
    renderTopbar()
  }
  row.append(i1, i2)
  card.append(row)

  const duo = el('div', { class: 'duo-stage', style: { marginTop: '14px' } })
  duo.append(mascot('chispa', 'happy', { anim: 'idle', cls: 'pop-a' }), mascot('gota', 'wink', { anim: 'idle', cls: 'flip pop-b' }))
  card.append(duo)

  const meet = el('button', { class: 'btn ghost sm', text: 'Ver a briga dos mascotes', style: { alignSelf: 'center', marginTop: '6px' } })
  meet.onclick = () => {
    sfx.select()
    playCutscene(SCENES.intro)
  }
  card.append(meet)
  return card
}

function pickEmoji(av) {
  const host = el('div', { class: 'col' })
  host.append(el('h2', { text: 'Escolham o símbolo de vocês' }))
  const grid = el('div', { class: 'badge-grid' })
  for (const e of SYMBOLOS) {
    const b = el('button', { class: 'badge on', html: icon(e, 24), 'aria-label': e })
    b.onclick = () => {
      S.couple.emoji = e
      save()
      sfx.select()
      av.innerHTML = icon(e, 34)
      renderTopbar()
      sheet.close()
    }
    grid.append(b)
  }
  host.append(grid)
  const sheet = openSheet(host)
}

/* ---------- estatísticas ---------- */
function statsCard() {
  const card = el('div', { class: 'card tight' })
  card.append(el('div', { class: 'section-title', style: { margin: '2px 0 10px' } }, [el('h2', { html: `${icon('chart', 16)} Números de vocês` })]))
  const grid = el('div', { class: 'stat-grid' })
  const items = [
    { b: S.stats.done, s: 'fases concluídas' },
    { b: S.streak, s: 'ofensiva atual' },
    { b: `${S.bestStreak}`, s: 'melhor ofensiva' },
    { b: S.xp, s: 'XP total' },
    { b: `${Math.round(S.stats.minutes / 60)}h`, s: 'tempo de jogo' },
    { b: S.stats.duels, s: 'duelos vencidos' },
    { b: S.stats.roulettes, s: 'roletas giradas' },
    { b: `${Math.round((S.stats.quizBest || 0) * 100)}%`, s: 'melhor sintonia' },
    { b: `${unlockedCount()}/${NODES.length}`, s: 'fases liberadas' },
    { b: S.brasas, s: 'brasas guardadas' },
  ]
  for (const it of items) {
    grid.append(el('div', { class: 'stat' }, [el('b', { text: String(it.b) }), el('span', { text: it.s })]))
  }
  card.append(grid)
  return card
}

/* ---------- semana ---------- */
function weekCard() {
  const card = el('div', { class: 'card tight' })
  card.append(el('div', { class: 'section-title', style: { margin: '2px 0 10px' } }, [el('h2', { html: `${icon('calendar', 16)} Últimos 7 dias` })]))
  const strip = el('div', { class: 'week-strip' })
  const labels = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']
  for (let i = 6; i >= 0; i--) {
    const key = todayKey(new Date(Date.now() - i * DAY))
    const played = Object.values(S.nodes).some((n) => n.date === key) || S.memories.some((m) => m.date === key)
    const d = el('div', { class: `d ${played ? 'on' : ''}` })
    d.innerHTML = `<i>${played ? icon('flame', 16) : '·'}</i>${labels[parseKey(key).getDay()]}`
    strip.append(d)
  }
  card.append(strip)
  card.append(
    el('p', {
      class: 'tiny muted center',
      style: { marginTop: '10px' },
      text: `Concluíram fases em ${Object.values(S.nodes).filter((n) => n.date).length} dias diferentes.`,
    }),
  )
  return card
}

/* ---------- conquistas ---------- */
function badgeCard() {
  const card = el('div', { class: 'card tight' })
  const got = S.achievements.length
  card.append(
    el('div', { class: 'section-title', style: { margin: '2px 0 10px' } }, [
      el('h2', { html: `${icon('medal', 16)} Conquistas` }),
      el('span', { class: 'pill gold', text: `${got}/${ACHIEVEMENTS.length}` }),
    ]),
  )
  const grid = el('div', { class: 'badge-grid' })
  for (const a of ACHIEVEMENTS) {
    const on = S.achievements.includes(a.id)
    const b = el('button', {
      class: `badge ${on ? 'on' : 'off'}`,
      html: `${icon(a.em, 24)}<small>${a.name}</small>`,
    })
    b.onclick = () => {
      sfx.tap()
      toast(on ? `${a.name}: ${a.desc}` : `Bloqueada — ${a.desc}`, on ? 'good' : '', 2600, a.em)
    }
    grid.append(b)
  }
  card.append(grid)
  return card
}

/* ---------- diário ---------- */
function diaryCard() {
  const card = el('div', { class: 'card tight' })
  card.append(
    el('div', { class: 'section-title', style: { margin: '2px 0 10px' } }, [
      el('h2', { html: `${icon('book', 16)} Diário do casal` }),
      el('span', { class: 'pill', text: `${S.memories.length}` }),
    ]),
  )
  if (!S.memories.length) {
    card.append(el('p', { class: 'tiny muted', text: 'Nenhuma memória ainda. Concluam a primeira fase e anotem como foi.' }))
    return card
  }
  const list = el('div', { class: 'col', style: { gap: '8px', maxHeight: '320px', overflowY: 'auto' } })
  for (const m of S.memories.slice(0, 40)) {
    const d = parseKey(m.date)
    const row = el('div', { class: 'memory' })
    row.append(
      el('div', { class: 'm-day', html: `<b>${d.getDate()}</b>${d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}` }),
      el('div', { class: 'grow' }, [
        el('strong', { html: `${icon(m.em, 17)} ${m.title}`, style: { fontSize: '13.5px' } }),
        m.mood ? el('div', { class: 'mood-row', html: iconRepeat('flame', m.mood, 12) }) : null,
        m.note ? el('p', { class: 'tiny muted', text: `“${m.note}”`, style: { marginTop: '4px' } }) : null,
      ]),
    )
    list.append(row)
  }
  card.append(list)

  const row = el('div', { class: 'row', style: { gap: '8px', marginTop: '12px' } })
  const exp = el('button', { class: 'btn ghost sm grow', text: 'Exportar diário' })
  exp.onclick = () => exportDiary()
  const add = el('button', { class: 'btn ghost sm grow', text: 'Nova anotação' })
  add.onclick = () => addMemory()
  row.append(exp, add)
  card.append(row)
  return card
}

function exportDiary() {
  const data = {
    casal: `${S.couple.p1} & ${S.couple.p2}`,
    exportadoEm: new Date().toISOString(),
    ofensiva: S.streak,
    nivel: levelInfo().level,
    memorias: S.memories,
    fases: Object.entries(S.nodes).map(([id, n]) => ({ id, ...n })),
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = el('a', { href: url, download: `4-paredes-diario-${todayKey()}.json` })
  document.body.append(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 2000)
  sfx.coin()
  toast('Diário exportado. Guardem com carinho.', 'good', 2400, 'book')
}

function addMemory() {
  const host = el('div', { class: 'col' })
  host.append(el('h2', { html: `${icon('book', 20)} Nova anotação` }))
  const title = el('input', { class: 'input', placeholder: 'Título (ex: noite de chuva)' })
  const text = el('textarea', { class: 'input', placeholder: 'O que vale a pena lembrar?' })
  const btn = el('button', { class: 'btn green', text: 'Guardar' })
  btn.onclick = () => {
    if (!text.value.trim() && !title.value.trim()) return toast('Escreva alguma coisa primeiro.', 'warn', 2000, 'pencil')
    S.memories.unshift({
      id: Math.random().toString(36).slice(2, 9),
      date: todayKey(),
      nodeId: null,
      title: title.value.trim() || 'Anotação',
      em: 'envelope',
      mood: 4,
      note: text.value.trim(),
      xp: 0,
    })
    save()
    sfx.correct()
    sheet.close()
    render()
  }
  host.append(title, text, btn)
  const sheet = openSheet(host)
}

/* ---------- preferências ---------- */
function prefsCard() {
  const card = el('div', { class: 'card tight' })
  card.append(el('div', { class: 'section-title', style: { margin: '2px 0 10px' } }, [el('h2', { html: `${icon('gear', 16)} Preferências` })]))

  /* intensidade */
  card.append(el('p', { class: 'tiny muted', text: 'Nível de intensidade dos desafios', style: { marginBottom: '6px' } }))
  const seg = el('div', { class: 'seg' })
  for (const [k, v] of Object.entries(LEVELS)) {
    const b = el('button', {
      class: Number(k) === S.prefs.intensity ? 'on' : '',
      html: `<span class="em">${icon(v.em, 20)}</span>${v.name}`,
    })
    b.onclick = () => {
      S.prefs.intensity = Number(k)
      save()
      sfx.select()
      ;[...seg.children].forEach((c) => c.classList.remove('on'))
      b.classList.add('on')
      toast(`${v.name}: ${v.desc}`, '', 2600, v.em)
      render()
    }
    seg.append(b)
  }
  card.append(seg)

  /* palavra de segurança */
  const safe = el('div', { class: 'field', style: { marginTop: '14px' } })
  safe.append(el('label', { text: 'Palavra de segurança (para tudo na hora)' }))
  const safeInput = el('input', { class: 'input', value: S.prefs.safeword || '', placeholder: 'ex: geladeira' })
  safeInput.oninput = () => {
    S.prefs.safeword = safeInput.value
    save()
  }
  safe.append(safeInput)
  card.append(safe)

  /* tags vetadas */
  card.append(el('p', { class: 'tiny muted', style: { margin: '14px 0 6px' }, text: 'O que vocês NÃO querem ver no jogo' }))
  const tags = [...new Set([...NODES, ...EXTRA].flatMap((n) => n.tags ?? []))].sort()
  const chips = el('div', { class: 'row wrap', style: { gap: '6px' } })
  for (const t of tags) {
    const on = S.prefs.vetoed.includes(t)
    const c = el('button', {
      class: `pill ${on ? 'hot' : ''}`,
      html: `${on ? icon('ban', 12) + ' ' : ''}${t}`,
      style: { cursor: 'pointer' },
    })
    c.onclick = () => {
      if (on) S.prefs.vetoed = S.prefs.vetoed.filter((x) => x !== t)
      else S.prefs.vetoed.push(t)
      save()
      sfx.tap()
      render()
    }
    chips.append(c)
  }
  card.append(chips)

  /* toggles */
  const toggles = el('div', { class: 'col', style: { gap: '8px', marginTop: '14px' } })
  toggles.append(
    toggleRow('soundOn', 'Sons e efeitos', S.prefs.sound, (on) => {
      S.prefs.sound = on
      setSound(on)
      save()
      if (on) sfx.select()
    }),
  )
  toggles.append(
    toggleRow('fastForward', 'Modo maratona (libera todas as fases)', S.prefs.marathon, (on) => {
      S.prefs.marathon = on
      save()
      if (on) playCutscene(SCENES.marathon)
      render()
    }),
  )
  const notifyRow = toggleRow('bell', `Lembrete diário às ${nextReminderLabel()}`, S.prefs.notify, async (on) => {
    if (on) {
      const perm = await requestPermission()
      if (perm !== 'granted') {
        S.prefs.notify = false
        save()
        toast('Sem permissão de notificação neste navegador. A Chispa chama vocês dentro do app mesmo.', 'warn', 3200, 'bellOff')
        render()
        return
      }
      S.prefs.notify = true
      save()
      scheduleDaily()
      notify('4 Paredes', `Lembrete ligado: todo dia às ${nextReminderLabel()} a gente chama vocês.`)
      toast('Lembrete diário ativado!', 'good', 2600, 'bell')
      render()
      return
    }
    S.prefs.notify = false
    save()
    render()
  })
  toggles.append(notifyRow)
  card.append(toggles)

  /* horário */
  const time = el('div', { class: 'field', style: { marginTop: '10px' } })
  time.append(el('label', { text: 'Horário do lembrete' }))
  const timeInput = el('input', { class: 'input', type: 'time', value: `${String(S.prefs.notifyHour).padStart(2, '0')}:${String(S.prefs.notifyMin).padStart(2, '0')}` })
  timeInput.onchange = () => {
    const [h, m] = timeInput.value.split(':').map(Number)
    S.prefs.notifyHour = Number.isFinite(h) ? h : 21
    S.prefs.notifyMin = Number.isFinite(m) ? m : 0
    save()
    scheduleDaily()
    sfx.tap()
    render()
  }
  time.append(timeInput)
  card.append(time)

  const test = el('button', { class: 'btn ghost sm', text: 'Testar notificação agora', style: { marginTop: '10px' } })
  test.onclick = async () => {
    const perm = await requestPermission()
    if (perm !== 'granted') return toast('Permissão negada — use os lembretes dentro do app.', 'warn', 2800, 'bellOff')
    notify('4 Paredes', 'É assim que a Chispa chama vocês. Todo dia, nesse horário.')
    toast('Notificação enviada!', 'good', 2400, 'bell')
  }
  card.append(test)
  return card
}

function toggleRow(em, label, value, onChange) {
  const row = el('div', { class: `toggle ${value ? 'on' : ''}` })
  row.innerHTML = `<span><strong style="font-size:13.5px">${icon(em, 17)} ${label}</strong></span><span class="sw"></span>`
  row.onclick = () => {
    const on = !row.classList.contains('on')
    row.classList.toggle('on', on)
    sfx.tap()
    onChange(on)
  }
  return row
}

/* ---------- loja ---------- */
function shopCard() {
  const card = el('div', { class: 'card tight' })
  card.append(
    el('div', { class: 'section-title', style: { margin: '2px 0 10px' } }, [
      el('h2', { html: `${icon('cart', 16)} Loja de brasas` }),
      el('span', { class: 'pill gold', html: `${icon('gem', 13)} ${S.brasas}` }),
    ]),
  )
  const list = el('div', { class: 'col', style: { gap: '8px' } })
  for (const item of SHOP) {
    const row = el('div', { class: 'quest' })
    row.append(
      el('span', { class: 'q-em', html: icon(item.em, 20) }),
      el('div', { class: 'grow' }, [
        el('strong', { text: item.name, style: { fontSize: '13.5px' } }),
        el('p', { class: 'tiny muted', text: item.desc }),
      ]),
    )
    const btn = el('button', {
      class: `btn xs ${S.brasas >= item.price ? 'amber' : 'ghost'}`,
      html: `${icon('gem', 13)}<span>${item.price}</span>`,
    })
    btn.onclick = () => {
      if (buy(item.id)) {
        sfx.coin()
        confetti({ count: 14 })
        renderTopbar()
        toast(`${item.name} comprado!`, 'good', 2400, item.em)
        render()
      } else {
        sfx.wrong()
        toast('Brasas insuficientes. Concluam fases para ganhar mais.', 'warn', 2600, 'gem')
      }
    }
    row.append(btn)
    list.append(row)
  }
  card.append(list)
  card.append(
    el('p', { class: 'tiny muted center', style: { marginTop: '10px' }, text: 'Baús da trilha também dão brasas, curingas e congeladores.' }),
  )
  return card
}

/* ---------- zona de risco ---------- */
function dangerCard() {
  const card = el('div', { class: 'card tight' })
  card.append(el('div', { class: 'section-title', style: { margin: '2px 0 10px' } }, [el('h2', { html: `${icon('warning', 16)} Zona de risco` })]))
  const row = el('div', { class: 'row', style: { gap: '8px' } })
  // atalho de desenvolvimento: some da frente do lead (só aparece com ?debug na URL)
  const debug = new URLSearchParams(location.search).has('debug')
  const give = el('button', { class: 'btn ghost sm grow', text: 'Ganhar 100 brasas (teste)' })
  give.onclick = () => {
    addBrasas(100)
    sfx.coin()
    renderTopbar()
    render()
  }
  if (!debug) give.hidden = true
  const reset = el('button', { class: 'btn danger sm grow', text: 'Zerar o jogo' })
  reset.onclick = async () => {
    const ok = await confirmDialog({
      title: 'Zerar tudo?',
      text: 'Fases, ofensiva, brasas, diário e conquistas voltam ao zero. As memórias exportadas continuam no arquivo que vocês baixaram.',
      ok: 'Zerar tudo',
      cancel: 'Deixa quieto',
      danger: true,
    })
    if (ok) {
      resetAll()
      location.hash = '#/onboarding'
      render()
    }
  }
  row.append(give, reset)
  card.append(row)
  return card
}

/* ---------- sobre ---------- */
function aboutCard() {
  const card = el('div', { class: 'card tight center' })
  const m = mascot('chispa', 'happy', { anim: 'idle' })
  m.style.width = '82px'
  m.style.height = '96px'
  card.append(m)
  card.append(
    el('h3', { text: '4 Paredes' }),
    el('p', {
      class: 'tiny muted',
      style: { marginTop: '6px' },
      text:
        'Um jogo diário para casais que não querem cair na rotina. 8 temporadas, 56 fases, 6 mini-jogos e dois mascotes que brigam o tempo todo.',
    }),
    el('p', {
      class: 'tiny muted',
      style: { marginTop: '10px' },
      html:
        '<strong>Combinado de vocês:</strong> tudo aqui é sugestão. Nada é obrigatório, tudo é combinado antes e pode parar a qualquer momento — é para isso que serve a palavra de segurança. Se algo do jogo incomodar, vetem a tag nas preferências.',
    }),
  )
  return card
}
