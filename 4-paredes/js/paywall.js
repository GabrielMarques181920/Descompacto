/* ============================================================
   4 PAREDES — paywall
   Regra do funil: a 1ª fase é grátis. A partir da segunda, só com o passe.
   O pagamento acontece fora do app (link de checkout); aqui entram a
   oferta, a volta do checkout (?paid=1) e o código de acesso manual.
   ============================================================ */
import { NODES } from './content.js'
import { icon } from './icons.js'
import { mascot } from './mascots.js'
import { FREE_PHASES, S, isPremium, markPaid } from './state.js'
import { el } from './util.js'
import { go, render } from './router.js'
import { openModal, renderTopbar, toast } from './ui.js'
import { sfx } from './audio.js'
import { confetti } from './fx.js'

/* ---------- configuração de cobrança ---------- */
export const PAY = {
  price: 'R$ 19,90',
  period: '/mês',
  // COLE AQUI O LINK DO CHECKOUT (Stripe, Mercado Pago, Hotmart, Kiwify…)
  // Ex.: 'https://buy.stripe.com/xxxx' — vazio = o app pede código de acesso
  checkoutUrl: '',
  // Liberação manual: códigos que você envia depois de confirmar o pagamento
  codes: ['4PAREDES-CHAMA'],
  // parâmetros aceitos na volta do checkout: ?paid=1 ou ?code=XXXX
  paidParam: 'paid',
  codeParam: 'code',
}

const INCLUDED = [
  { em: 'compass', label: `As outras ${NODES.length - FREE_PHASES} fases (8 temporadas)` },
  { em: 'dice', label: 'Os 6 mini-jogos, sem limite' },
  { em: 'book', label: 'Diário do casal exportável' },
  { em: 'trophy', label: 'Liga semanal contra outros casais' },
  { em: 'bolt', label: 'Relâmpagos, baús e duelos' },
]

const norm = (v) => String(v ?? '').trim().toUpperCase().replace(/\s+/g, '')

/** o código digitado libera o passe? */
export function validateCode(value) {
  const v = norm(value)
  if (!v) return false
  return PAY.codes.map(norm).includes(v)
}

/* ---------- desbloqueio ---------- */
function unlock(code = '', from = 'checkout') {
  markPaid(code)
  confetti()
  sfx.win()
  renderTopbar()
  render()
  toast('Passe liberado! As 56 fases, os mini-jogos e a liga são de vocês.', 'good', 5200, 'key')
  celebratePaid(from)
}

function celebratePaid(from) {
  const body = el('div', { class: 'col center', style: { gap: '12px' } })
  const duo = el('div', { class: 'pay-duo' })
  duo.append(mascot('gota', 'love', { anim: 'idle' }), mascot('chispa', 'love', { anim: 'happy' }))
  body.append(duo)
  body.append(
    el('h2', { text: 'Casa liberada' }),
    el('p', {
      class: 'muted tiny',
      text:
        from === 'code'
          ? 'Código aceito. A fase de amanhã já está na trilha — e a Chispa vai cobrar vocês todos os dias.'
          : 'Pagamento confirmado. A fase de amanhã já está na trilha — e a Chispa vai cobrar vocês todos os dias.',
    }),
  )
  const ok = el('button', { class: 'btn', html: `${icon('flame', 17)} Ver minha trilha` })
  ok.onclick = () => {
    sfx.select()
    go('#/trilha')
  }
  body.append(ok)
  openModal(body, { title: '' })
}

/** volta do checkout: ?paid=1 ou ?code=XXXX */
export function checkUnlockFromUrl() {
  const params = new URLSearchParams(location.search)
  const code = params.get(PAY.codeParam) || params.get('unlock') || ''
  const paidFlag = params.get(PAY.paidParam)
  if (!paidFlag && !code) return false
  if (isPremium()) return true

  if (code && validateCode(code)) {
    history.replaceState(null, '', location.pathname + location.hash)
    unlock(norm(code), 'code')
    return true
  }
  if (paidFlag === '1' || paidFlag === 'true') {
    history.replaceState(null, '', location.pathname + location.hash)
    unlock('', 'checkout')
    return true
  }
  toast('Código inválido. Se você já pagou, use o código enviado por quem vendeu.', 'warn', 4200, 'warning')
  return false
}

/* ---------- gate central ---------- */
/** retorna true se pode jogar; senão abre o paywall e retorna false */
export function requirePremium(context = '') {
  if (isPremium()) return true
  openPaywall(context)
  return false
}

/* ---------- modal de pagamento ---------- */
export function openPaywall(context = '') {
  if (isPremium()) return null
  const body = el('div', { class: 'col pay-body' })

  const duo = el('div', { class: 'pay-duo' })
  duo.append(mascot('chispa', 'wink', { anim: 'idle' }), mascot('gota', 'love', { anim: 'idle' }))
  body.append(duo)

  body.append(
    el('div', { class: 'pay-kicker', text: contextLabel(context) }),
    el('h2', { class: 'pay-title', text: 'A primeira chama foi acesa.' }),
    el('p', {
      class: 'muted tiny pay-lead',
      text: `Vocês levaram ${NODES.length - FREE_PHASES} fases, 6 mini-jogos e uma liga inteira de volta para a cama — e jogaram só a primeira. O passe libera o resto do ano.`,
    }),
  )

  const price = el('div', { class: 'pay-price' })
  price.innerHTML = `<strong>${PAY.price}</strong><span>${PAY.period}</span>`
  body.append(price)

  const list = el('ul', { class: 'pay-list' })
  for (const it of INCLUDED)
    list.append(
      el('li', { html: `${icon(it.em, 16)}<span>${it.label}</span>` }),
    )
  body.append(list)

  /* CTA principal */
  const buy = el('button', { class: 'btn lg gold pay-cta' })
  buy.innerHTML = `<span class="shine"></span>${icon('key', 18)} Pagar e liberar tudo`
  buy.onclick = () => {
    sfx.select()
    if (!PAY.checkoutUrl) {
      toast('Checkout ainda não configurado — use um código de acesso abaixo.', 'warn', 3600, 'warning')
      showCodePanel(body)
      return
    }
    const w = window.open(PAY.checkoutUrl, '_blank', 'noopener')
    if (!w) location.href = PAY.checkoutUrl
    toast('Abrindo o pagamento… ao concluir, volte aqui e toque em "Já paguei".', '', 4600, 'gift')
    showCodePanel(body)
  }
  body.append(buy)

  /* já paguei / código de acesso */
  const alt = el('button', { class: 'btn ghost sm', text: 'Já paguei — usar código de acesso' })
  alt.onclick = () => {
    sfx.tap()
    showCodePanel(body, alt)
  }
  body.append(alt)

  const codeHost = el('div', { class: 'pay-code' })
  body.append(codeHost)

  body.append(
    el('p', {
      class: 'pay-micro',
      text: `Pagamento processado fora do app · Cancele em um toque, sem multa · O diário de vocês é exportável`,
    }),
  )

  return openModal(body, { title: '' })

  function showCodePanel(host, hide) {
    if (hide) hide.hidden = true
    if (host.querySelector('.pay-code.on')) return
    const panel = host.querySelector('.pay-code')
    panel.classList.add('on')
    panel.innerHTML = ''
    const input = el('input', {
      class: 'input',
      type: 'text',
      placeholder: 'CÓDIGO DE ACESSO',
      autocomplete: 'off',
      spellcheck: 'false',
    })
    input.style.textTransform = 'uppercase'
    const ok = el('button', { class: 'btn green', html: `${icon('check', 16)} Liberar` })
    const tryCode = () => {
      if (validateCode(input.value)) {
        panel.querySelector('.pay-code-msg')?.remove()
        unlock(norm(input.value), 'code')
        return
      }
      sfx.wrong()
      panel.querySelector('.pay-code-msg')?.remove()
      panel.append(
        el('p', {
          class: 'pay-code-msg',
          text: 'Esse código não valeu. Confira o que chegou no seu e-mail/WhatsApp.',
        }),
      )
    }
    ok.onclick = tryCode
    input.onkeydown = (ev) => {
      if (ev.key === 'Enter') tryCode()
    }
    panel.append(el('div', { class: 'pay-code-title', text: 'Código de acesso' }), input, ok)
    setTimeout(() => input.focus(), 120)
  }
}

function contextLabel(context) {
  switch (context) {
    case 'trilha':
      return 'fase bloqueada'
    case 'jogos':
      return 'mini-jogos bloqueados'
    case 'liga':
      return 'liga bloqueada'
    case 'extra':
      return 'desafio extra bloqueado'
    case 'fase':
      return 'essa fase é paga'
    default:
      return `vocês jogaram a fase ${FREE_PHASES} de ${NODES.length}`
  }
}

/* ---------- cartão do paywall na trilha ---------- */
export function paywallCard() {
  const card = el('div', { class: 'card pay-card' })
  card.innerHTML = `
    <div class="row between" style="align-items:flex-start">
      <div class="grow">
        <div class="trail-meta">fim da amostra grátis</div>
        <h2 style="margin:6px 0 4px">Vocês acenderam a primeira. Falta o resto do ano.</h2>
        <p class="tiny muted">
          A fase 1 foi de graça. As outras ${NODES.length - FREE_PHASES} fases, os 6 mini-jogos, o diário
          e a liga ficam do outro lado do passe — <strong>${PAY.price}${PAY.period}</strong>.
        </p>
      </div>
      <div class="right" style="flex:none;color:var(--gold)">${icon('key', 34)}</div>
    </div>
    <div class="row" style="gap:6px;margin:12px 0;flex-wrap:wrap">
      <span class="pill gold">${icon('check', 13)} fase 1 concluída</span>
      <span class="pill">${icon('lock', 13)} ${NODES.length - FREE_PHASES} fases bloqueadas</span>
      <span class="pill hot">${icon('flame', 13)} ofensiva de ${S.streak} ${S.streak === 1 ? 'dia' : 'dias'}</span>
    </div>`
  const cta = el('button', { class: 'btn gold' })
  cta.innerHTML = `<span class="shine"></span>${icon('gift', 17)} Liberar tudo por ${PAY.price}${PAY.period}`
  cta.onclick = () => {
    sfx.select()
    openPaywall('trilha')
  }
  card.append(cta)
  return card
}

/* ---------- faixa compacta: a aba segue visível como vitrine ---------- */
export function paywallBanner(context = 'jogos') {
  const bar = el('div', { class: 'card tight pay-banner' })
  bar.innerHTML = `
    <div class="row" style="gap:10px">
      <span style="color:var(--gold);flex:none">${icon('key', 22)}</span>
      <span class="grow">
        <div class="trail-meta">${contextLabel(context)}</div>
        <strong style="font-size:13.5px">Amostra grátis terminou na fase ${FREE_PHASES}</strong>
        <p class="tiny muted">O passe de <strong>${PAY.price}${PAY.period}</strong> libera isto aqui e as outras ${NODES.length - FREE_PHASES} fases.</p>
      </span>
    </div>`
  const btn = el('button', { class: 'btn sm gold', style: { marginTop: '10px' } })
  btn.innerHTML = `${icon('key', 14)}<span>Liberar agora</span>`
  btn.onclick = () => {
    sfx.select()
    openPaywall(context)
  }
  bar.append(btn)
  return bar
}

/* ---------- painel de aba bloqueada (jogos / liga) ---------- */
export function paywallPanel(context = 'jogos') {
  const box = el('div', { class: 'card center pay-panel' })
  const duo = el('div', { class: 'pay-duo' })
  duo.append(mascot('gota', 'angry', { anim: 'idle' }), mascot('chispa', 'wink', { anim: 'idle' }))
  box.append(duo)
  box.append(
    el('div', { class: 'trail-meta', text: contextLabel(context) }),
    el('h2', { text: 'Aqui só com o passe' }),
    el('p', {
      class: 'muted tiny',
      html: `A amostra grátis termina na fase ${FREE_PHASES}. Por <strong>${PAY.price}${PAY.period}</strong> vocês levam as ${NODES.length} fases, os 6 mini-jogos, o diário e a liga semanal.`,
    }),
  )
  const cta = el('button', { class: 'btn gold', style: { marginTop: '14px' } })
  cta.innerHTML = `<span class="shine"></span>${icon('key', 17)} Pagar e liberar`
  cta.onclick = () => {
    sfx.select()
    openPaywall(context)
  }
  const back = el('button', { class: 'btn ghost sm', text: 'Voltar à trilha', style: { marginTop: '8px' } })
  back.onclick = () => go('#/trilha')
  box.append(cta, back)
  return box
}
