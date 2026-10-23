/* desafio extra (sorteado) — para quando o dia já foi zerado */
import { EXTRA } from '../content.js'
import { S, completeActivity } from '../state.js'
import { el, pick } from '../util.js'
import { openSheet, toast, renderTopbar } from '../ui.js'
import { sfx } from '../audio.js'
import { confetti, floatHearts } from '../fx.js'
import { mascot } from '../mascots.js'
import { requirePremium } from '../paywall.js'

export function extraPool() {
  return EXTRA.filter((e) => (e.level ?? 1) <= S.prefs.intensity)
}

export function openExtraChallenge(preset) {
  if (!requirePremium('extra')) return null
  const host = el('div', { class: 'col' })
  const sheet = openSheet(host)
  let item = preset ?? pick(extraPool())

  function draw(fresh) {
    if (fresh) item = pick(extraPool())
    host.innerHTML = ''
    const m = mascot(Math.random() < 0.5 ? 'chispa' : 'gota', 'wink', { anim: 'idle' })
    m.style.alignSelf = 'center'
    host.append(m)
    const card = el('div', { class: 'card center' })
    card.append(
      el('div', { class: 'big-em', text: item.em, style: { fontSize: '48px' } }),
      el('div', { class: 'trail-meta', text: 'desafio extra · não conta como fase do dia', style: { marginTop: '6px' } }),
      el('h2', { text: item.title, style: { margin: '6px 0' } }),
      el('p', { class: 'muted', text: item.text, style: { fontSize: '14px' } }),
    )
    host.append(card)

    const note = el('textarea', { class: 'input', placeholder: 'Como foi? (opcional — entra no diário de vocês)' })
    host.append(note)

    const row = el('div', { class: 'row', style: { gap: '8px' } })
    const ok = el('button', { class: 'btn green grow', text: `Cumprimos (+${item.xp} XP)` })
    ok.onclick = () => {
      completeActivity({ xp: item.xp, type: 'extra', title: item.title, em: item.em, note: note.value, mood: 3 })
      sfx.win()
      confetti()
      floatHearts(ok, 6)
      renderTopbar()
      sheet.close()
      toast(`${item.title} concluído! +${item.xp} XP`, 'good', 2600, item.em)
    }
    const swap = el('button', { class: 'btn ghost grow', text: 'Trocar' })
    swap.onclick = () => {
      sfx.tap()
      draw(true)
    }
    row.append(ok, swap)
    host.append(row)

    const close = el('button', { class: 'btn ghost xs', text: 'fechar', style: { alignSelf: 'center' } })
    close.onclick = () => sheet.close()
    host.append(close)
  }

  draw(false)
  return sheet
}

export function randomExtra() {
  return pick(extraPool())
}
