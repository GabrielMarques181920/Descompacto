/* ============================================================
   SMOKE TEST — sobe o jogo num DOM fake (jsdom) e exercita os
   fluxos principais: onboarding → trilha → fase → jogos → liga → ninho
   Rodar: npm run smoke
   ============================================================ */
import { readFileSync } from 'node:fs'
import { JSDOM } from 'jsdom'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const html = readFileSync(join(root, 'index.html'), 'utf8')

const dom = new JSDOM(html, {
  url: 'http://localhost:4321/#/trilha',
  pretendToBeVisual: true,
  runScripts: 'outside-only',
})
const { window } = dom

/* ---- stubs de APIs que o jsdom não tem ---- */
const ctxStub = new Proxy(
  {
    canvas: null,
    measureText: () => ({ width: 10 }),
    createLinearGradient: () => ({ addColorStop() {} }),
  },
  {
    get(t, k) {
      if (k in t) return t[k]
      return () => {}
    },
    set(t, k, v) {
      t[k] = v
      return true
    },
  },
)
window.HTMLCanvasElement.prototype.getContext = () => ctxStub
window.Element.prototype.scrollIntoView = function () {}
window.HTMLElement.prototype.animate = function () {
  return { finished: Promise.resolve(), cancel() {}, onfinish: null }
}

for (const k of [
  'window',
  'document',
  'navigator',
  'location',
  'localStorage',
  'HTMLElement',
  'Element',
  'Node',
  'Event',
  'CustomEvent',
  'Blob',
  'URL',
  'getComputedStyle',
  'requestAnimationFrame',
  'cancelAnimationFrame',
]) {
  if (window[k] === undefined) continue
  try {
    globalThis[k] = window[k]
  } catch {
    Object.defineProperty(globalThis, k, { value: window[k], configurable: true, writable: true })
  }
}
globalThis.self = window

const errors = []
window.addEventListener('error', (e) => errors.push(String(e.error ?? e.message)))
const origWarn = console.warn
console.warn = (...args) => {
  if (String(args[0]).includes('listener falhou') || String(args[0]).includes('cleanup')) errors.push(args.join(' '))
  else origWarn(...args)
}

/* ---- carrega o jogo ---- */
const t0 = Date.now()
await import('../js/main.js')
const ui = await import('../js/ui.js')
const state = await import('../js/state.js')
const router = await import('../js/router.js')
const games = await import('../js/games.js')
const { NODES } = await import('../js/content.js')
await new Promise((r) => setTimeout(r, 250))

const $ = (sel) => window.document.querySelector(sel)
const $$ = (sel) => [...window.document.querySelectorAll(sel)]
const click = (node) => node.dispatchEvent(new window.MouseEvent('click', { bubbles: true }))
const wait = (ms) => new Promise((r) => setTimeout(r, ms))

let pass = 0
let fail = 0
function check(label, cond, extra = '') {
  if (cond) {
    pass++
    console.log(`  ✅ ${label}`)
  } else {
    fail++
    console.log(`  ❌ ${label} ${extra}`)
  }
}

console.log(`\n🔥 4 Paredes — smoke test (${Date.now() - t0}ms para bootar)\n`)

/* ---------- 1. onboarding ---------- */
console.log('1) Onboarding')
check('tela de idade visível', $('#screen').textContent.includes('18'))
check('topbar escondida no onboarding', $('#topbar').hidden === true)
const continueButtons = $$('#screen .btn')
check('botões do onboarding existem', continueButtons.length >= 2)
click(continueButtons[0]) // "Temos 18+"
await wait(30)
check('passo 2 (nomes)', $('#screen').textContent.includes('Quem são vocês'))
const inputs = $$('#screen input.input')
inputs[0].value = 'Ju'
inputs[1].value = 'Rafa'
click($$('#screen .btn').find((b) => b.textContent.includes('Continuar')))
await wait(30)
check('passo 3 (intensidade)', $('#screen').textContent.includes('Até onde'))
click($$('#screen .choice')[1]) // picante
click($$('#screen .btn').find((b) => b.textContent.includes('Continuar')))
await wait(30)
check('passo 4 (lembrete)', $('#screen').textContent.includes('Chispa chama'))
click($$('#screen .btn').find((b) => b.textContent.includes('Quase lá')))
await wait(30)
check('passo 5 (pronto)', $('#screen').textContent.includes('Tudo pronto'))
click($$('#screen .btn').find((b) => b.textContent.includes('direto para a trilha')))
await wait(80)

/* ---------- 2. trilha ---------- */
console.log('\n2) Trilha')
check('estado onboarded', state.S.onboarded === true)
check('nomens salvos', state.S.couple.p1 === 'Ju' && state.S.couple.p2 === 'Rafa')
check('topbar visível', $('#topbar').hidden === false)
check('tabbar visível', $('#tabbar').hidden === false)
const nodes = $$('.node')
check(`nós renderizados (${nodes.length})`, nodes.length === NODES.length)
check('um nó "hoje"', $$('.node.current').length === 1)
check('nós travados', $$('.node.locked').length === NODES.length - 1)
check('missões diárias', $('#screen').textContent.includes('Missões de hoje'))
check('mascote no nó atual', !!$('.node.current .mascot svg'))
check('fases liberadas = 1', state.unlockedCount() === 1)

/* ---------- 3. fase ---------- */
console.log('\n3) Fase do dia')
click($('.node.current .knob'))
await wait(80)
check('rota da fase', location.hash.startsWith('#/fase/'))
check('tabbar oculta na fase', $('#tabbar').hidden === true)
check('texto do desafio presente', $('#screen').textContent.length > 300)
const startBtn = $$('#screen .btn').find((b) => b.textContent.includes('Começar agora'))
check('botão começar', !!startBtn)
click(startBtn)
await wait(60)
check('ritual / checklist', $('#screen').textContent.includes('Preparando o clima'))
check('cronômetro do ritual', !!$('.big-timer'))
const doneBtn = $$('#screen .btn').find((b) => b.textContent.includes('Cumprimos'))
click(doneBtn)
await wait(60)
check('avaliação de clima', $$('.mood-pick button').length === 5)
click($$('.mood-pick button')[4])
const note = $('#screen textarea')
note.value = 'primeira noite do jogo'
const finish = $$('#screen .btn').find((b) => b.textContent.includes('Concluir fase'))
click(finish)
await wait(120)
check('fase concluída no estado', Object.values(state.S.nodes).some((n) => n.date))
check('ofensiva = 1', state.S.streak === 1)
check('XP ganho', state.S.xp > 0)
check('memória registrada', state.S.memories.length === 1 && state.S.memories[0].note === 'primeira noite do jogo')
check('modal de recompensa', !!$('.modal') || $('#modal-layer').hidden === false)

/* fecha modal e volta pra trilha */
const pegar = $$('.modal .btn').find((b) => b.textContent.includes('Pegar'))
if (pegar) click(pegar)
await wait(400)
const voltar = $$('#screen .btn').find((b) => b.textContent.includes('Voltar à trilha'))
if (voltar) click(voltar)
await wait(80)
check('de volta à trilha', location.hash === '#/trilha')
check('nó anterior marcado como feito', $$('.node.done').length === 1)

/* ---------- 4. jogos ---------- */
console.log('\n4) Mini-jogos')
location.hash = '#/jogos'
await wait(80)
check('hub de jogos', $('#screen').textContent.includes('O que vocês jogam hoje'))
const gameCards = $$('.game-card')
check(`cartões de jogo (${gameCards.length})`, gameCards.length >= 6)

// roleta
click(gameCards[0])
await wait(60)
check('sheet de baralhos da roleta', !!$('.sheet'))
click($('.sheet .choice'))
await wait(60)
check('roleta montada', !!$('.wheel'))
const spin = $$('.sheet .btn').find((b) => b.textContent.includes('Girar'))
click(spin)
await wait(120)
check('roleta girando (transform)', $('.wheel').style.transform.includes('rotate'))
await wait(5000)
check('resultado da roleta', !!$('.combo-card') && $('.combo-card').textContent.includes('roleta'))
check('sheet continua aberta após o giro', !!$('.sheet'))
ui.closeNudge?.()
games.closeAllGames()
await wait(400)

// dados
location.hash = '#/jogos'
await wait(60)
click($$('.game-card')[1])
await wait(40)
click($('.sheet .choice'))
await wait(40)
check('dados montados', $$('.die').length === 2)
click($$('.sheet .btn').find((b) => b.textContent.includes('Rolar')))
await wait(1400)
check('combinação apareceu', !!$('.combo-card'))
games.closeAllGames()
await wait(400)

// quiz
location.hash = '#/jogos'
await wait(60)
click($$('.game-card').find((c) => c.textContent.includes('Quem conhece')))
await wait(60)
check('quiz montado', $$('.answer').length === 4)
click($('.answer'))
await wait(600)
check('cortina de troca de celular', $('#screen').textContent.includes('Passa o celular') || $('.sheet').textContent.includes('Passa o celular'))
const souBtn = $$('.sheet .btn').find((b) => b.textContent.includes('pode mostrar'))
click(souBtn)
await wait(40)
click($('.answer'))
await wait(1800)
games.closeAllGames()
await wait(400)

// duelo
location.hash = '#/jogos'
await wait(60)
click($$('.game-card').find((c) => c.textContent.includes('Duelo')))
await wait(60)
check('arena do duelo', !!$('.battle-arena'))
check('dois mascotes na arena', $$('.fighter .mascot svg').length === 2)
click($$('.sheet .btn').find((b) => b.textContent.includes('Começar o duelo')))
await wait(100)
const zone = $('.tap-zone')
zone.dispatchEvent(new window.Event('pointerdown', { bubbles: true }))
await wait(60)
check('hp do oponente caiu', parseFloat($('.fighter.right .hp i').style.width) < 100)
games.closeAllGames()
await wait(400)

/* ---------- 5. liga ---------- */
console.log('\n5) Liga')
location.hash = '#/liga'
await wait(80)
check('tela da liga', $('#screen').textContent.includes('Classificação'))
check('10 linhas no placar', $$('.league-row').length === 10)
check('linha do casal destacada', !!$('.league-row.me'))

/* ---------- 6. ninho ---------- */
console.log('\n6) Ninho')
location.hash = '#/ninho'
await wait(80)
check('perfil', $('#screen').textContent.includes('Números de vocês'))
check('conquistas', $$('.badge').length >= 10)
check('diário com 1 memória', $('#screen').textContent.includes('primeira noite do jogo'))
check('loja', $('#screen').textContent.includes('Loja de brasas'))
const toggles = $$('.toggle')
check('toggles de preferência', toggles.length >= 3)
click($$('.seg button')[2]) // intensidade fogo
await wait(60)
check('intensidade = 3', state.S.prefs.intensity === 3)
const marathon = toggles.find((t) => t.textContent.includes('maratona'))
click(marathon)
await wait(400)
const closeCut = $$('.modal .btn').find((b) => b.textContent.includes('Começar'))
if (closeCut) click(closeCut)
await wait(300)
check('maratona ligada', state.S.prefs.marathon === true)
check('todas as fases liberadas', state.unlockedCount() === NODES.length)

/* ---------- 7. navegação por tabs ---------- */
console.log('\n7) Tabs e persistência')
location.hash = '#/trilha'
await wait(60)
click($('#tabbar .tab[data-go="#/jogos"]'))
await wait(60)
check('tab jogos ativa', $('#tabbar .tab.on').textContent.includes('Jogos'))
click($('#tabbar .tab[data-go="#/ninho"]'))
await wait(60)
check('tab ninho ativa', $('#tabbar .tab.on').textContent.includes('Ninho'))
const saved = JSON.parse(window.localStorage.getItem('quatro-paredes:v1'))
check('estado persistido', saved?.couple?.p1 === 'Ju' && saved?.stats?.done === 1)

/* ---------- 8. nós travados ---------- */
console.log('\n8) Travas')
state.S.prefs.marathon = false
state.save()
location.hash = '#/trilha'
await wait(60)
const locked = $('.node.locked')
click(locked)
await wait(60)
check('nó travado avisa (nudge ou toast)', !!$('.nudge') || !!$('.toast'))

/* ---------- 9. lógica de dia / ofensiva ---------- */
console.log('\n9) Ofensiva e virada de dia')
const dayKey = (offset) => {
  const d = new Date(Date.now() + offset * 86400000)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
state.S.streak = 5
state.S.lastPlayed = dayKey(-1)
state.S.freezes = 0
let ev = state.syncDay()
check('ofensiva preservada quando jogou ontem', state.S.streak === 5 && ev.broken === false)
check('playedToday = false num dia novo', state.S.playedToday === false)

state.S.streak = 7
state.S.lastPlayed = dayKey(-3)
state.S.freezes = 0
ev = state.syncDay()
check('ofensiva zerada após 3 dias sem jogar', state.S.streak === 0 && ev.broken === true)
check('melhor ofensiva guardada', state.S.bestStreak >= 7)

state.S.streak = 4
state.S.lastPlayed = dayKey(-2)
state.S.freezes = 2
ev = state.syncDay()
check('congelador salvou a ofensiva', ev.streakSaved === true && state.S.streak === 4 && state.S.freezes === 1)

const before = state.S.stats.done
state.S.lastPlayed = null
state.markPlayedToday()
check('markPlayedToday reinicia ofensiva em 1', state.S.streak === 1)
check('playedToday = true', state.S.playedToday === true)

/* ---------- 10. validação de conteúdo ---------- */
console.log('\n10) Conteúdo do jogo')
const C = await import('../js/content.js')
check('8 temporadas', C.UNITS.length === 8)
check('7 fases por temporada', C.UNITS.every((u) => u.days.length === 7))
check('56 fases no total', C.NODES.length === 56)
check('ids únicos', new Set(C.NODES.map((n) => n.id)).size === C.NODES.length)
check('toda fase tem título, texto e xp', C.NODES.every((n) => n.title && n.text && n.xp > 0 && n.em))
check('todo desafio nível 3 tem versão mais leve', C.NODES.filter((n) => n.level === 3 && n.type === 'desafio').every((n) => n.alt))
check('cada temporada tem baú e duelo', C.UNITS.every((u) => u.days.some((d) => d.type === 'bau') && u.days.some((d) => d.type === 'duelo')))
check('jogos referenciados existem', C.NODES.filter((n) => n.type === 'jogo').every((n) => !!games.GAMES[n.game]))
check('4 roletas com 12 resultados', Object.keys(C.ROULETTES).length === 4 && Object.values(C.ROULETTES).every((r) => r.length === 12))
check('3 conjuntos de dados', Object.keys(C.DICE_SETS).length === 3)
check('baralho com 20+ cartas', C.CARDS.length >= 20)
check('quiz com 20+ perguntas', C.QUIZ.length >= 20)
check('quiz tem respostas suficientes', C.QUIZ.every((q) => q.a.length >= 3))
check('cronômetro com 8+ modos', C.TIMERS.length >= 8)
check('30+ desafios extras', C.EXTRA.length >= 30)
check('8+ relâmpagos', C.LIGHTNING.length >= 8)
check('12 conquistas', C.ACHIEVEMENTS.length === 12)
check('6 ligas', C.LEAGUES.length === 6)
check('temas cobrem os pedidos do brief', C.NODES.some((n) => /50 Tons/i.test(n.text)) && C.NODES.some((n) => /cozinha/i.test(n.text) && n.level === 3))

/* ---------- 11. sanidade de CSS/DOM (jsdom não aplica CSS) ---------- */
console.log('\n11) Sanidade de CSS/DOM')
const appCss = readFileSync(join(root, 'styles/app.css'), 'utf8')
const screensCss = readFileSync(join(root, 'styles/screens.css'), 'utf8')
const indexHtml = readFileSync(join(root, 'index.html'), 'utf8')

// bug real: .modal-layer tem display:grid + backdrop-filter:blur e usava o
// atributo hidden — sem a regra global, a camada de blur cobria o app inteiro.
check('regra global [hidden] existe', /\[hidden\]\s*\{[^}]*display:\s*none\s*!important/.test(appCss))
const toggled = ['topbar', 'tabbar', 'modal-layer', 'nudge-layer']
for (const id of toggled) {
  const re = new RegExp(`id="${id}"[^>]*hidden`)
  check(`#${id} nasce hidden no HTML`, re.test(indexHtml))
}
check('modal-layer é a camada com blur', /\.modal-layer\s*\{[^}]*backdrop-filter/.test(appCss))
check('boot tem rede de segurança (failsafe de 6s)', indexHtml.includes('6000') && indexHtml.includes("classList.contains('off')"))
check('boot reporta erro em vez de travar', indexHtml.includes("addEventListener('error'"))
check('camadas de fx/modal não bloqueiam toque indevidamente', /\.fx-layer\s*\{[^}]*pointer-events:\s*none/.test(appCss))

// ordem de empilhamento: fundo < app < mascote < fx < modal < nudge < toast < boot
const zIndex = (sel) => Number(new RegExp(`\\.${sel}\\s*\\{[^}]*z-index:\\s*(\\d+)`).exec(appCss)?.[1] ?? NaN)
const order = ['app', 'float-mascot', 'fx-layer', 'modal-layer', 'nudge-layer', 'toast-layer', 'boot']
const values = order.map(zIndex)
check(`z-index crescente (${order.join(' < ')})`, values.every((v, i) => Number.isFinite(v) && (i === 0 || v > values[i - 1])), values.join(','))

// classes usadas pelo JS precisam existir no CSS
const usedClasses = ['node', 'knob', 'streak-alert', 'wheel', 'die', 'deck', 'battle-arena', 'tap-zone', 'hp', 'mascot', 'bubble', 'mood-pick', 'league-row', 'badge', 'quest', 'choice', 'seg', 'toggle', 'cutscene']
for (const c of usedClasses) {
  const present = new RegExp(`\\.${c}\\b`).test(appCss) || new RegExp(`\\.${c}\\b`).test(screensCss)
  check(`CSS tem .${c}`, present)
}
check('todos os humores do mascote têm regra', ['love', 'angry', 'sad', 'happy', 'wink', 'sleepy', 'shock'].every((m) => appCss.includes(`[data-mood="${m}"]`)))

/* ---------- 12. identidade visual (redesign vinho/preto/branco) ---------- */
console.log('\n12) Identidade visual')
const { readdirSync, statSync, existsSync } = await import('node:fs')
const { ICONS, EMOJI_ICON, iconNameFor } = await import('../js/icons.js')

const jsFiles = []
const walk = (dir) => {
  for (const f of readdirSync(dir)) {
    const full = join(dir, f)
    if (statSync(full).isDirectory()) walk(full)
    else if (f.endsWith('.js')) jsFiles.push(full)
  }
}
walk(join(root, 'js'))

// 1. nenhum emoji do sistema na interface (só o mapa de migração em icons.js)
const EMOJI_RE = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{2B00}-\u{2BFF}]/u
const emojiLeaks = jsFiles
  .filter((f) => !f.endsWith('icons.js'))
  .map((f) => [f.replace(root + '/', ''), (readFileSync(f, 'utf8').match(EMOJI_RE) ?? []).length])
  .filter(([, n]) => n > 0)
check('nenhum emoji do sistema no código da UI', emojiLeaks.length === 0, JSON.stringify(emojiLeaks))

// 2. todo campo em/emoji do conteúdo resolve para um ícone desenhado
const contentSrc = readFileSync(join(root, 'js/content.js'), 'utf8')
const fieldIcons = [...contentSrc.matchAll(/\b(?:em|emoji):\s*'([^']*)'/g)].map((m) => m[1])
const unknownFields = fieldIcons.filter((v) => !ICONS[v] && !EMOJI_ICON[v])
check('ícones do conteúdo existem no registro', unknownFields.length === 0, unknownFields.join(','))
check('conteúdo tem 100+ referências de ícone', fieldIcons.length >= 100, String(fieldIcons.length))

// 3. toda chamada icon('x') literal aponta para um ícone existente
const literalCalls = new Set()
for (const f of jsFiles) {
  for (const m of readFileSync(f, 'utf8').matchAll(/\bicon(?:Repeat)?\(\s*'([A-Za-z0-9]+)'/g)) literalCalls.add(m[1])
}
const unknownCalls = [...literalCalls].filter((n) => !ICONS[n])
check('chamadas icon() usam nomes válidos', unknownCalls.length === 0, unknownCalls.join(','))
const iconsInUse = new Set([...literalCalls, ...fieldIcons.filter((v) => ICONS[v])])
check('30+ ícones usados diretamente na UI', literalCalls.size >= 30, String(literalCalls.size))
check('60+ ícones diferentes em uso no total', iconsInUse.size >= 60, String(iconsInUse.size))

// 4. cada ícone do registro é SVG bem formado
const parser = new window.DOMParser()
const badIcons = Object.keys(ICONS).filter((name) => {
  const doc = parser.parseFromString(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">${ICONS[name]}</svg>`,
    'image/svg+xml',
  )
  return doc.querySelector('parsererror') || !doc.documentElement.children.length
})
check('todos os ícones são SVG válido', badIcons.length === 0, badIcons.join(','))
check('registro tem 80+ ícones', Object.keys(ICONS).length >= 80, String(Object.keys(ICONS).length))
check('mapa de migração cobre 100+ emoji', Object.keys(EMOJI_ICON).length >= 100, String(Object.keys(EMOJI_ICON).length))
check('emoji desconhecido cai em fallback (nunca vaza)', iconNameFor('\u{1F984}') === 'sparkle')

// 5. paleta: vinho + preto + branco, dourado só como acento
const BANNED = ['#ff2e63', '#8b5cf6', '#ffb703', '#3ddc97', '#22d3ee', '#a855f7', '#f472b6', '#ff4d4d', '#120721', '#180a26']
const styled = [appCss, screensCss, ...jsFiles.map((f) => readFileSync(f, 'utf8'))].join('\n').toLowerCase()
const bannedFound = BANNED.filter((c) => styled.includes(c))
check('sem cores neon da versão anterior', bannedFound.length === 0, bannedFound.join(','))
for (const token of ['--wine-500', '--wine-900', '--gold', '--paper', '--black']) {
  check(`token ${token} definido`, appCss.includes(`${token}:`))
}

// 6. tipografia do sistema (sem download de fonte)
const allCss = appCss + screensCss
check('sem @font-face', !/@font-face/.test(allCss))
check('sem @import de fonte', !/@import\s+url/.test(allCss))
check('sem CDN de fonte no HTML', !/fonts\.(googleapis|gstatic)/.test(indexHtml))
check('stack de fonte do sistema', /--font:[^;]*-apple-system/.test(appCss))

// 7. marca: splash, ícone do app e manifest
const iconPath = join(root, 'assets/icon.svg')
check('assets/icon.svg existe', existsSync(iconPath))
const iconSvg = existsSync(iconPath) ? readFileSync(iconPath, 'utf8') : ''
check('ícone do app usa a paleta vinho', /#3b0c18|#8c1c39/.test(iconSvg) && /#c9a227|#e6cd84/.test(iconSvg))
check('HTML aponta para assets/icon.svg', indexHtml.includes('./assets/icon.svg'))
check('splash tem crest + wordmark', indexHtml.includes('boot-crest') && indexHtml.includes('boot-word'))
const manifest = JSON.parse(readFileSync(join(root, 'manifest.webmanifest'), 'utf8'))
check('manifest usa o ícone novo', manifest.icons.every((i) => i.src.includes('assets/icon.svg')))
check('manifest em preto/vinho', manifest.theme_color === '#0a090a' && manifest.background_color === '#0a090a')
check('manifest standalone + pt-BR', manifest.display === 'standalone' && manifest.lang === 'pt-BR')

// 8. ícones realmente renderizados no DOM (topbar + tabbar)
ui.renderTopbar()
ui.renderTabbar('trilha')
const domIcons = window.document.querySelectorAll('#topbar svg.ic, #tabbar svg.ic')
check('topbar/tabbar renderizam SVG (não emoji)', domIcons.length >= 7, String(domIcons.length))
check('tabbar tem 4 ícones', window.document.querySelectorAll('#tabbar svg.ic').length === 4)
check('chips do topbar usam ícone', window.document.querySelectorAll('#topbar .chip svg.ic').length === 3)

console.log(`\n${'='.repeat(46)}`)
console.log(`erros capturados: ${errors.length}`)
for (const e of errors.slice(0, 8)) console.log('   ⚠️ ', e)
console.log(`${'='.repeat(46)}`)
console.log(`✅ ${pass} passaram · ❌ ${fail} falharam\n`)
process.exit(fail === 0 && errors.length === 0 ? 0 : 1)
