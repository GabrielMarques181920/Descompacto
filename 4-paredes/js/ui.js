/* ============================================================
   UI — topbar, tabs, toasts, modais, nudge e mascote andarilho
   ============================================================ */
import { S, levelInfo, questsReady, dangerOfLosingStreak } from './state.js'
import { el, qs, pick } from './util.js'
import { mascot, setMood, VOICES, LINES, fillLine } from './mascots.js'
import { sfx } from './audio.js'
import { confetti, floatHearts, xpPop } from './fx.js'
import { icon } from './icons.js'

const CIRC = 2 * Math.PI * 18

export const TABS = [
  { id: 'trilha', label: 'Trilha', em: 'compass', hash: '#/trilha' },
  { id: 'jogos', label: 'Jogos', em: 'dice', hash: '#/jogos' },
  { id: 'liga', label: 'Liga', em: 'trophy', hash: '#/liga' },
  { id: 'ninho', label: 'Ninho', em: 'nest', hash: '#/ninho' },
]

/* ---------------- topbar ---------------- */
export function renderTopbar() {
  const bar = qs('#topbar')
  const li = levelInfo()
  const offset = CIRC * (1 - li.pct)
  bar.hidden = false
  bar.innerHTML = `
    <div class="tb-pair">
      <div class="tb-ring">
        <svg viewBox="0 0 44 44">
          <defs>
            <linearGradient id="lvlGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stop-color="#a82747"/><stop offset="1" stop-color="#c9a227"/>
            </linearGradient>
          </defs>
          <circle class="ring-bg" cx="22" cy="22" r="18"/>
          <circle class="ring-fg" cx="22" cy="22" r="18" stroke-dasharray="${CIRC.toFixed(1)}" stroke-dashoffset="${offset.toFixed(1)}"/>
        </svg>
        <b>${li.level}</b>
      </div>
      <div class="tb-names">
        <strong>${S.couple.p1} <span style="opacity:.6">&</span> ${S.couple.p2}</strong>
        <span>nível ${li.level} · ${li.into}/${li.need} XP</span>
      </div>
    </div>
    <div class="tb-stats">
      <div class="chip fire" data-chip="streak" title="Ofensiva"><i class="${S.streak ? 'flame-live' : ''}">${icon('flame', 15)}</i>${S.streak}</div>
      <div class="chip ember" data-chip="brasas" title="Brasas"><i>${icon('gem', 15)}</i>${S.brasas}</div>
      <div class="chip breath" data-chip="folego" title="Fôlego"><i>${icon('heart', 15)}</i>${S.folego}</div>
    </div>`
}

export function pulseChip(name) {
  const chip = qs(`#topbar .chip[data-chip="${name}"]`)
  if (!chip) return
  chip.classList.remove('pulse')
  void chip.offsetWidth
  chip.classList.add('pulse')
}

/* ---------------- tabbar ---------------- */
export function renderTabbar(active) {
  const bar = qs('#tabbar')
  bar.hidden = false
  bar.innerHTML = ''
  for (const t of TABS) {
    const b = el('button', { class: `tab ${t.id === active ? 'on' : ''}`, 'data-go': t.hash })
    b.innerHTML = `<span class="ico">${icon(t.em, 22)}</span><span>${t.label}</span>`
    if (t.id === 'trilha' && (questsReady() || dangerOfLosingStreak())) b.append(el('span', { class: 'dot' }))
    bar.append(b)
  }
}

export function hideChrome() {
  qs('#topbar').hidden = true
  qs('#tabbar').hidden = true
}

/* ---------------- toasts ---------------- */
export function toast(msg, kind = '', ms = 2600, em = 'sparkle') {
  const layer = qs('#toast-layer')
  const node = el('div', { class: `toast ${kind}` })
  node.innerHTML = `<span>${icon(em, 18)}</span><span class="grow">${msg}</span>`
  layer.append(node)
  setTimeout(() => {
    node.classList.add('out')
    setTimeout(() => node.remove(), 320)
  }, ms)
  return node
}

/* ---------------- modal ---------------- */
let modalStack = []
let activeLayerNode = null
const layerHooks = new Set()
let clearing = false

/** avisa os interessados antes de limpar a camada de modal/sheet */
export function onLayerClear(fn) {
  layerHooks.add(fn)
  return () => layerHooks.delete(fn)
}

function clearLayer(layer) {
  if (!clearing) {
    clearing = true
    for (const h of [...layerHooks]) {
      try {
        h()
      } catch (err) {
        console.warn('[4paredes] layer hook', err)
      }
    }
    clearing = false
  }
  layer.innerHTML = ''
}

export function openModal(content, { title, closeOnBackdrop = true, actions } = {}) {
  const layer = qs('#modal-layer')
  layer.hidden = false
  clearLayer(layer)
  const box = el('div', { class: 'modal' })
  if (title) box.append(el('h2', { text: title, style: { marginBottom: '12px' } }))
  if (typeof content === 'string') box.insertAdjacentHTML('beforeend', content)
  else box.append(content)
  if (actions) {
    const row = el('div', { class: 'col', style: { marginTop: '16px' } })
    for (const a of actions) row.append(a)
    box.append(row)
  }
  layer.append(box)
  activeLayerNode = box

  const close = () => {
    box.classList.add('out')
    layer.classList.add('out')
    setTimeout(() => {
      if (activeLayerNode !== box) return
      activeLayerNode = null
      layer.hidden = true
      clearLayer(layer)
      layer.classList.remove('out')
      modalStack = modalStack.filter((m) => m !== api)
    }, 210)
  }
  if (closeOnBackdrop) {
    layer.addEventListener('click', (e) => {
      if (e.target === layer) close()
    })
  }
  const api = { close, box }
  modalStack.push(api)
  return api
}

export function openSheet(content, { title } = {}) {
  const layer = qs('#modal-layer')
  layer.hidden = false
  clearLayer(layer)
  const sheet = el('div', { class: 'sheet' })
  sheet.append(el('div', { class: 'grabber' }))
  const closeX = el('button', { class: 'icon-btn sheet-close', html: icon('close', 15), 'aria-label': 'fechar' })
  sheet.append(closeX)
  if (title) sheet.append(el('h2', { text: title, style: { marginBottom: '12px' } }))
  if (typeof content === 'string') sheet.insertAdjacentHTML('beforeend', content)
  else sheet.append(content)
  layer.append(sheet)
  activeLayerNode = sheet
  const close = () => {
    sheet.classList.add('out')
    layer.classList.add('out')
    setTimeout(() => {
      if (activeLayerNode !== sheet) return
      activeLayerNode = null
      layer.hidden = true
      clearLayer(layer)
      layer.classList.remove('out')
    }, 240)
  }
  layer.addEventListener('click', (e) => {
    if (e.target === layer) close()
  })
  closeX.addEventListener('click', () => close())
  return { close, box: sheet }
}

export const modalOpen = () => modalStack.length > 0

export function confirmDialog({ title = 'Tem certeza?', text = '', ok = 'Confirmar', cancel = 'Voltar', danger = false }) {
  return new Promise((resolve) => {
    const okBtn = el('button', { class: `btn ${danger ? 'danger' : ''}`, text: ok })
    const cancelBtn = el('button', { class: 'btn ghost', text: cancel })
    const m = openModal(el('p', { class: 'muted', text }), { title, actions: [okBtn, cancelBtn] })
    okBtn.onclick = () => {
      m.close()
      resolve(true)
    }
    cancelBtn.onclick = () => {
      m.close()
      resolve(false)
    }
  })
}

/* ---------------- nudge (chamada constante) ---------------- */
let nudgeTimer = null
export function nudge(text, { em = 'flame', actionLabel = 'Ver fase', onAction, ms = 9000 } = {}) {
  const layer = qs('#nudge-layer')
  layer.hidden = false
  layer.innerHTML = ''
  const node = el('div', { class: 'nudge' })
  node.innerHTML = `<span class="n-ico">${icon(em, 22)}</span><p class="grow">${text}</p>`
  const go = el('button', { class: 'btn xs', text: actionLabel })
  const x = el('button', { class: 'n-x', html: icon('close', 14), 'aria-label': 'fechar' })
  go.onclick = () => {
    sfx.select()
    closeNudge()
    onAction?.()
  }
  x.onclick = () => closeNudge()
  node.append(go, x)
  layer.append(node)
  clearTimeout(nudgeTimer)
  nudgeTimer = setTimeout(closeNudge, ms)
}

export function closeNudge() {
  const layer = qs('#nudge-layer')
  const node = qs('.nudge', layer)
  if (!node) return
  node.classList.add('out')
  clearTimeout(nudgeTimer)
  setTimeout(() => {
    layer.hidden = true
    layer.innerHTML = ''
  }, 340)
}

/* ---------------- mascote andarilho ---------------- */
let walkTimer = null
export function walkMascot(text, { kind = 'chispa', mood = 'happy', ms = 9000, onClick } = {}) {
  const host = qs('#float-mascot')
  clearTimeout(walkTimer)
  host.classList.remove('out', 'show')
  host.innerHTML = ''
  const m = mascot(kind, mood, { anim: mood === 'angry' ? 'angry' : 'wave' })
  const bubble = el('div', { class: 'bubble fm-bubble' })
  bubble.innerHTML = `<span class="who">${VOICES[kind]?.name ?? 'Chispa'}</span>`
  bubble.append(document.createTextNode(text))
  const track = el('div', { class: 'fm-track' }, [bubble, m])
  host.append(track)
  host.classList.add('show')

  const tap = () => {
    sfx.kiss()
    floatHearts(m, 5)
    setMood(m, 'love', 'happy')
    onClick?.()
    dismiss()
  }
  bubble.addEventListener('click', tap)
  m.addEventListener('click', tap)

  const dismiss = () => {
    host.classList.add('out')
    setTimeout(() => {
      host.classList.remove('show', 'out')
      host.innerHTML = ''
    }, 1100)
  }
  walkTimer = setTimeout(dismiss, ms)
  return { dismiss, node: m }
}

/** mascote quieto, só observando (aparece de vez em quando) */
export function idleMascotPeek() {
  if (document.hidden) return
  const kind = Math.random() < 0.5 ? 'chispa' : 'fosforo'
  const text = fillLine(pick(LINES.idle), { streak: S.streak })
  walkMascot(text, { kind, mood: 'wink', ms: 7500 })
}

/* ---------------- celebrações ---------------- */
export function celebrateLevel(level) {
  confetti({ count: 40 })
  sfx.levelUp()
  const m = mascot('chispa', 'love', { anim: 'happy' })
  const f = mascot('fosforo', 'shock', { anim: 'happy' })
  const stage = el('div', { class: 'duo-stage' }, [m, f])
  const body = el('div', { class: 'col center', style: { gap: '10px' } })
  body.append(
    el('div', { class: 'league-badge', html: icon('party', 52) }),
    el('h1', { text: `Nível ${level}!` }),
    el('p', { class: 'muted', text: pick(LINES.levelUp) }),
    stage,
  )
  const btn = el('button', { class: 'btn', text: 'Continuar esquentando' })
  btn.innerHTML = '<span class="shine"></span><span>' + btn.textContent + '</span>'
  btn.onclick = () => mod.close()
  const mod = openModal(body, { actions: [btn] })
}

export function celebrateReward({ title, em = 'gift', text, items = [], onClose }) {
  confetti()
  sfx.coin()
  const body = el('div', { class: 'col center', style: { gap: '12px' } })
  body.append(el('div', { class: 'league-badge', html: icon(em, 52) }), el('h2', { text: title }))
  if (text) body.append(el('p', { class: 'muted', text }))
  if (items.length) {
    const wrap = el('div', { class: 'row wrap', style: { justifyContent: 'center' } })
    for (const it of items)
      wrap.append(el('span', { class: 'pill gold', html: `${icon(it.em ?? 'gem', 13)}<span>${it.label}</span>` }))
    body.append(wrap)
  }
  const btn = el('button', { class: 'btn green', text: 'Pegar' })
  btn.onclick = () => {
    mod.close()
    setTimeout(() => onClose?.(), 240)
  }
  const mod = openModal(body, { actions: [btn], closeOnBackdrop: false })
  return mod
}

export function showXp(amount, target) {
  xpPop(`+${amount} XP`, target)
  sfx.correct()
}
