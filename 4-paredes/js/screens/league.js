/* ============================================================
   LIGA — competição semanal entre casais (simulada)
   ============================================================ */
import { LEAGUES } from '../content.js'
import { S, leagueTier, standings } from '../state.js'
import { el, pick } from '../util.js'
import { renderTabbar, toast } from '../ui.js'
import { render as rerender } from '../router.js'
import { mascot } from '../mascots.js'
import { sfx } from '../audio.js'
import { icon } from '../icons.js'

export function renderLeague(host) {
  renderTabbar('liga')
  const wrap = el('div', { class: 'col stagger' })
  host.append(wrap)

  const tier = leagueTier()
  const { all, rank } = standings()
  const me = all.find((x) => x.me)

  const hero = el('div', { class: 'league-hero' })
  hero.innerHTML = `
    <div class="league-badge">${icon(tier.em, 52)}</div>
    <div class="trail-meta">semana de ${tier.name}</div>
    <h1>${rank}º lugar</h1>
    <p class="tiny muted">${me.xp} XP nesta semana · ${all.length - 1} casais na disputa</p>`
  const bar = el('div', { class: 'progress', style: { width: '100%' } }, [
    el('i', { style: { width: `${Math.min(100, (rank / all.length) * 100)}%` } }),
  ])
  hero.append(bar)
  const m = mascot(rank <= 3 ? 'chispa' : 'gota', rank <= 3 ? 'love' : 'sad', { anim: 'idle' })
  m.style.width = '86px'
  m.style.height = '100px'
  hero.append(m)
  wrap.append(hero)

  const promo = el('div', { class: 'card tight' })
  promo.innerHTML = `
    <div class="row between">
      <div>
        <strong style="font-size:13.5px">Regras da semana</strong>
        <p class="tiny muted">Top 3 sobem de liga e ganham 120 brasas. Os 3 últimos caem. Segunda-feira zera tudo.</p>
      </div>
      <span class="pill gold">${icon('trophy', 16)}</span>
    </div>`
  const nextTier = tier.next
  if (nextTier) {
    promo.append(
      el('div', { class: 'row', style: { gap: '8px', marginTop: '10px' } }, [
        el('span', { class: 'pill', html: `${icon(tier.em, 13)} ${tier.name}` }),
        el('span', { html: icon('chevronRight', 14) }),
        el('span', { class: 'pill hot', html: `${icon(nextTier.em, 13)} ${nextTier.name}` }),
      ]),
    )
  } else {
    promo.append(
      el('span', {
        class: 'pill hot',
        style: { marginTop: '10px' },
        html: `${icon('crown', 13)} liga máxima alcançada`,
      }),
    )
  }
  wrap.append(promo)

  wrap.append(
    el('div', { class: 'section-title' }, [
      el('h2', { html: `${icon('chart', 16)} Classificação` }),
      el('span', { class: 'pill', text: 'esta semana' }),
    ]),
  )

  const list = el('div', { class: 'col', style: { gap: '6px' } })
  all.forEach((row, i) => {
    const node = el('div', { class: `league-row ${row.me ? 'me' : ''}` })
    const medal = i < 3 ? icon('medal', 19) : String(i + 1)
    node.innerHTML = `
      <span class="pos">${medal}</span>
      <span class="av">${icon(row.em, 18)}</span>
      <span class="grow"><strong style="font-size:13.5px">${row.name}</strong>
      ${row.me ? '<span class="tiny muted" style="display:block">vocês</span>' : ''}</span>
      <span class="xp">${row.xp}</span>`
    list.append(node)
  })
  wrap.append(list)

  const tip = el('div', { class: 'card tight center', style: { marginTop: '16px' } })
  tip.append(
    el('p', {
      class: 'tiny muted',
      text: pick([
        'Dica da Chispa: fase diária + mini-jogo + relâmpago = topo da liga quase garantido.',
        'Dica da Gota: os outros casais também jogam. Não confiem na sorte, confiem na rotina.',
        'Casais no topo da liga costumam ser os mesmos que não pulam um dia sequer.',
      ]),
    }),
  )
  wrap.append(tip)

  const refresh = el('button', { class: 'btn ghost sm', text: 'Atualizar placar', style: { alignSelf: 'center', marginTop: '4px' } })
  refresh.onclick = () => {
    sfx.tap()
    for (const r of S.league.rivals) r.xp += Math.round(r.pace * (0.4 + Math.random()))
    toast('Placar atualizado. Os outros casais não param.', '', 2200, 'trophy')
    renderLeagueClear()
  }
  wrap.append(refresh)

  wrap.append(
    el('div', { class: 'row wrap', style: { gap: '6px', justifyContent: 'center', marginTop: '14px' } }, [
      ...LEAGUES.map((l) =>
        el('span', {
          class: `pill ${l.name === tier.name ? 'hot' : ''}`,
          html: `${icon(l.em, 13)} ${l.name}`,
        }),
      ),
    ]),
  )
}

function renderLeagueClear() {
  rerender()
}
