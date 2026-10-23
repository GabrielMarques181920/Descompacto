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
const html = readFileSync(join(root, 'app.html'), 'utf8')

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

/* o restante do smoke exercita o jogo completo: libera o passe.
   (a amostra grátis de 1 fase e o paywall são testados na seção 14) */
state.markPaid('SMOKE')

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
const mascotsCss = readFileSync(join(root, 'styles/mascots.css'), 'utf8')
const appCss = readFileSync(join(root, 'styles/app.css'), 'utf8') + '\n' + mascotsCss
const screensCss = readFileSync(join(root, 'styles/screens.css'), 'utf8')
const appHtml = readFileSync(join(root, 'app.html'), 'utf8')

// bug real: .modal-layer tem display:grid + backdrop-filter:blur e usava o
// atributo hidden — sem a regra global, a camada de blur cobria o app inteiro.
check('regra global [hidden] existe', /\[hidden\]\s*\{[^}]*display:\s*none\s*!important/.test(appCss))
const toggled = ['topbar', 'tabbar', 'modal-layer', 'nudge-layer']
for (const id of toggled) {
  const re = new RegExp(`id="${id}"[^>]*hidden`)
  check(`#${id} nasce hidden no HTML`, re.test(appHtml))
}
check('modal-layer é a camada com blur', /\.modal-layer\s*\{[^}]*backdrop-filter/.test(appCss))
check('boot tem rede de segurança (failsafe de 6s)', appHtml.includes('6000') && appHtml.includes("classList.contains('off')"))
check('boot reporta erro em vez de travar', appHtml.includes("addEventListener('error'"))
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
check('sem @import de fonte', !/@import[^;]*fonts\.|@import[^;]*\.(woff|ttf|otf)/.test(allCss))
check('@import só de CSS local', [...allCss.matchAll(/@import\s+url\(\s*'([^']+)'/g)].every((m) => m[1].startsWith('./') && m[1].endsWith('.css')))
check('sem CDN de fonte no HTML', !/fonts\.(googleapis|gstatic)/.test(appHtml))
check('stack de fonte do sistema', /--font:[^;]*-apple-system/.test(appCss))

// 7. marca: splash, ícone do app e manifest
const iconPath = join(root, 'assets/icon.svg')
check('assets/icon.svg existe', existsSync(iconPath))
const iconSvg = existsSync(iconPath) ? readFileSync(iconPath, 'utf8') : ''
check('ícone do app usa a paleta vinho', /#3b0c18|#8c1c39/.test(iconSvg) && /#c9a227|#e6cd84/.test(iconSvg))
check('HTML aponta para assets/icon.svg', appHtml.includes('./assets/icon.svg'))
check('splash tem crest + wordmark', appHtml.includes('boot-crest') && appHtml.includes('boot-word'))
const manifest = JSON.parse(readFileSync(join(root, 'manifest.webmanifest'), 'utf8'))
check('manifest usa o ícone novo', manifest.icons.every((i) => i.src.includes('assets/icon.svg')))
check('manifest em preto/vinho', manifest.theme_color === '#0a090a' && manifest.background_color === '#0a090a')
check('manifest standalone + pt-BR', manifest.display === 'standalone' && manifest.lang === 'pt-BR')

// 8. mascotes: o casal fogo + água
const M = await import('../js/mascots.js')
for (const kind of ['chispa', 'gota']) {
  const node = M.mascot(kind, 'happy', {})
  const moods = node.querySelectorAll('.mood').length
  check(`mascote ${kind} tem os 7 humores`, moods === 7, String(moods))
  check(`mascote ${kind} tem corpo animável (.m-body)`, !!node.querySelector('.m-body'))
  check(`mascote ${kind} tem braço de aceno (.m-arm-r)`, !!node.querySelector('.m-arm-r'))
}
check('dupla é Chispa + Gota (sem Fósforo)', !!M.VOICES.chispa && !!M.VOICES.gota && !M.VOICES.fosforo)
const chispaSvg = M.mascot('chispa', 'happy', {}).innerHTML
const gotaSvg = M.mascot('gota', 'happy', {}).innerHTML
check('Chispa é fogo (gradiente quente)', chispaSvg.includes('ff9f1c') && chispaSvg.includes('e5401f'))
check('Gota é água (gradiente frio)', gotaSvg.includes('6fd4f7') && gotaSvg.includes('1f8fd0'))
check('Gota tem brilho + ponta animados', gotaSvg.includes('m-gloss') && gotaSvg.includes('m-drop-tip'))
check('Chispa tem cabelo de chama animado', chispaSvg.includes('m-flame-tip'))
const allSrc = jsFiles.map((f) => readFileSync(f, 'utf8')).join('')
check('nenhuma referência ao mascote antigo no código', !/fosforo/i.test(allSrc))
check('cutscenes e duelos usam a dupla nova', allSrc.includes("mascot('gota'") || allSrc.includes('mascot(\'gota\''))

// 8. ícones realmente renderizados no DOM (topbar + tabbar)
ui.renderTopbar()
ui.renderTabbar('trilha')
const domIcons = window.document.querySelectorAll('#topbar svg.ic, #tabbar svg.ic')
check('topbar/tabbar renderizam SVG (não emoji)', domIcons.length >= 7, String(domIcons.length))
check('tabbar tem 4 ícones', window.document.querySelectorAll('#tabbar svg.ic').length === 4)
check('chips do topbar usam ícone', window.document.querySelectorAll('#topbar .chip svg.ic').length === 3)

/* ---------- 13. página de vendas (front door antes do teste grátis) ---------- */
console.log('\n13) Página de vendas')
const landingHtml = readFileSync(join(root, 'index.html'), 'utf8')
const landingCss = readFileSync(join(root, 'styles/landing.css'), 'utf8')
const landingJs = readFileSync(join(root, 'js/landing.js'), 'utf8')

// a casca do jogo saiu de index.html; a landing não pode fingir ser o jogo
check('index.html é a página de vendas (não a casca do jogo)', !landingHtml.includes('id="screen"') && !landingHtml.includes('id="topbar"'))
check('app.html é a casca do jogo', appHtml.includes('id="screen"') && appHtml.includes('id="tabbar"'))
check('server.mjs serve index.html em /', readFileSync(join(root, 'server.mjs'), 'utf8').includes("'/index.html'"))
check('landing carrega seu próprio CSS/JS', landingHtml.includes('./styles/landing.css') && landingHtml.includes('./js/landing.js'))
check('CSS/JS da landing existem', landingCss.length > 4000 && landingJs.length > 800)

// todo CTA leva para o teste grátis do jogo
const ctas = [...landingHtml.matchAll(/href="([^"]+)"/g)].map((m) => m[1])
const appLinks = ctas.filter((h) => h.includes('app.html'))
check('CTAs apontam para app.html?trial=1', appLinks.length >= 5 && appLinks.every((h) => h === './app.html?trial=1'), appLinks.join(','))
check('nenhum CTA morto (# vazio)', !ctas.some((h) => h === '#' || h === ''))
check('links internos são âncoras da própria página', ctas.filter((h) => !h.includes('app.html')).every((h) => h.startsWith('#') || h.startsWith('./')))

// copy: headline, consciência, oferta, confiança
check('headline fala de rotina + 365 dias', /rotina/i.test(landingHtml) && /365/.test(landingHtml))
check('copy tem a seção de consciência', landingHtml.includes('A rotina não chega com uma briga'))
check('copy tem a pergunta que incomoda', /se escolheram/i.test(landingHtml))
check('oferta: 1ª fase grátis no card', landingHtml.includes('offer-card') && /1ª fase/.test(landingHtml))
check('landing não promete mais 7 dias grátis', !/7 dias grátis/i.test(landingHtml))
check('landing diz que a 1ª fase não pede cartão', /Sem cartão na primeira fase/i.test(landingHtml) && /não pede cartão/i.test(landingHtml))
check('CTAs dizem "primeira fase grátis"', (landingHtml.match(/primeira fase grátis/gi) || []).length >= 3)
check('micro-trust: sem cartão, sem spam, sigilo', /Sem cartão/i.test(landingHtml) && /Sem spam/i.test(landingHtml))
check('marcação 18+', /\+18|18 anos/.test(landingHtml))
check('preço real definido (R$ 19,90/mês)', landingHtml.includes('R$ 19,90/mês') && !/AJUSTE O PREÇO/.test(landingHtml))
check('preço aparece no card e no FAQ', (landingHtml.match(/R\$ 19,90/g) || []).length >= 2)
check('depoimentos seguem marcados como placeholder', /SUBSTITUA/.test(landingHtml))

// hooks que o JS da landing precisa
for (const hook of ['hero-duo', 'final-duo', 'ticker', 'year']) {
  check(`landing tem #${hook}`, landingHtml.includes(`id="${hook}"`))
}
check('landing tem ícones declarativos', (landingHtml.match(/data-icon="/g) || []).length >= 20)
check('landing tem contadores animados', (landingHtml.match(/data-count="/g) || []).length >= 4)
const hookIcons = [...landingHtml.matchAll(/data-icon="([A-Za-z0-9]+)"/g)].map((m) => m[1]).filter((n) => !ICONS[n])
check('todos os data-icon da landing existem', hookIcons.length === 0, hookIcons.join(','))
check('landing.js usa a dupla e o conteúdo real', landingJs.includes("mascot('gota'") && landingJs.includes("mascot('chispa'") && /from '\.\/content\.js'/.test(landingJs))
check('ticker monta com títulos reais (sem inventar)', landingJs.includes('iconNameFor') && landingJs.includes('title'))

// identidade: mesma paleta, sem emoji, sem CDN, sem cores banidas
const landingAll = (landingHtml + landingCss + landingJs).toLowerCase()
check('landing sem emoji do sistema', !EMOJI_RE.test(landingHtml + landingJs))
check('landing sem CDN de fonte', !/fonts\.(googleapis|gstatic)/.test(landingHtml) && !/@font-face/.test(landingCss))
check('landing sem cores neon banidas', !BANNED.some((c) => landingAll.includes(c)))
check('landing usa a paleta vinho/preto/branco', landingCss.includes('--wine-500') && landingCss.includes('#0a090a') && landingCss.includes('--paper'))
check('landing importa o CSS dos mascotes', landingCss.includes("@import url('./mascots.css')"))
check('app.css também importa os mascotes (fonte única)', appCss.includes("@import url('./mascots.css')"))
check('mascots.css tem os 7 humores', ['love', 'angry', 'sad', 'happy', 'wink', 'sleepy', 'shock'].every((m) => mascotsCss.includes(`[data-mood="${m}"]`)))
check('landing respeita prefers-reduced-motion', /prefers-reduced-motion/.test(landingCss))

// teste grátis do outro lado do CTA
check('state tem trialStart + trialInfo', readFileSync(join(root, 'js/state.js'), 'utf8').includes('trialStart') && readFileSync(join(root, 'js/state.js'), 'utf8').includes('export function trialInfo'))
check('main.js ativa o teste com ?trial=1', readFileSync(join(root, 'js/main.js'), 'utf8').includes("get('trial') !== '1'"))
check('manifest abre o jogo (não a landing)', manifest.start_url === './app.html')
check('shortcuts do manifest abrem o jogo', manifest.shortcuts.every((sc) => sc.url.startsWith('./app.html')))

/* ---------- 14. paywall: só a 1ª fase é grátis ---------- */
console.log('\n14) Paywall (1 fase grátis → pagamento)')
const paywallSrc = readFileSync(join(root, 'js/paywall.js'), 'utf8')
const PAY = await import('../js/paywall.js')

check('FREE_PHASES é 1', state.FREE_PHASES === 1, String(state.FREE_PHASES))
check('estado tem paid/paidAt/payCode', 'paid' in state.S && 'paidAt' in state.S && 'payCode' in state.S)

// volta para o estado de lead sem passe
state.S.paid = false
state.S.payCode = null
state.save()
check('lead sem passe não é premium', state.isPremium() === false)
check('trilha libera só 1 fase sem passe', state.unlockedCount() === 1, String(state.unlockedCount()))
check('fase 2 nasce bloqueada sem passe', state.nodeState(NODES[1].id) === 'locked', state.nodeState(NODES[1].id))
check('maratonas não furam o paywall', (state.S.prefs.marathon = true, state.unlockedCount() === 1))
state.S.prefs.marathon = false

// configuração de cobrança
check('preço do passe é R$ 19,90/mês', PAY.PAY.price === 'R$ 19,90' && PAY.PAY.period === '/mês')
check('checkout configurável (URL + params de volta)', 'checkoutUrl' in PAY.PAY && PAY.PAY.paidParam === 'paid' && PAY.PAY.codeParam === 'code')
check('código de acesso manual existe', Array.isArray(PAY.PAY.codes) && PAY.PAY.codes.length >= 1)
check('validateCode aceita o código e rejeita lixo', PAY.validateCode('4paredes-chama') === true && PAY.validateCode('qualquer') === false && PAY.validateCode('') === false)
check('requirePremium barra sem passe', PAY.requirePremium('teste') === false)
check('paywall abriu no DOM', !!window.document.querySelector('.pay-price, .pay-card, .pay-panel'))
check('modal do paywall tem preço e CTA', window.document.querySelector('#modal-layer .pay-price')?.textContent.includes('19,90') === true)
check('modal lista o que o passe libera', window.document.querySelectorAll('#modal-layer .pay-list li').length >= 5)
check('modal tem entrada de código de acesso', !!window.document.querySelector('#modal-layer .pay-code'))

// pagamento por código libera tudo
const codeInput = window.document.querySelector('#modal-layer .pay-code .input')
window.document.querySelector('#modal-layer .pay-cta')?.click?.()
const input2 = window.document.querySelector('#modal-layer .pay-code .input') ?? codeInput
if (input2) {
  input2.value = '4PAREDES-CHAMA'
  const liberar = [...window.document.querySelectorAll('#modal-layer .pay-code .btn')].find((b) => b.textContent.includes('Liberar'))
  liberar?.click()
  await wait(60)
}
check('pagar libera o passe', state.isPremium() === true)
check('passe registra data e código', !!state.S.paidAt && !!state.S.payCode)
// com o passe, o limite deixa de ser o paywall (volta a ser a cadência diária:
// 1 fase por dia, ou a temporada inteira no modo maratona)
state.S.prefs.marathon = true
check('passe reabre a trilha inteira (maratona)', state.unlockedCount() === NODES.length, String(state.unlockedCount()))
check('fase 2 jogável depois do pagamento', state.nodeState(NODES[1].id) !== 'locked', state.nodeState(NODES[1].id))
state.S.prefs.marathon = false
check('sem maratona, o passe segue a cadência de 1 fase/dia', state.unlockedCount() === 1, String(state.unlockedCount()))

// fluxo real sem passe: trilha vira vitrine, abas pagas mostram o painel
state.S.paid = false
state.S.payCode = null
state.save()
const showRoute = async (hash) => {
  window.location.hash = hash
  router.render() // hash igual não dispara hashchange no jsdom
  await wait(90)
}
await showRoute('#/trilha')
check('trilha sem passe mostra o cartão do passe', !!$('#screen .pay-card'), $('#screen').textContent.slice(0, 40))
check('cartão da trilha diz o preço', /19,90/.test($('#screen .pay-card')?.textContent ?? ''))
const payCta = $('#screen .pay-card .btn')
check('cartão do passe tem CTA', !!payCta)
click(payCta)
await wait(60)
check('CTA da trilha abre o modal de pagamento', !!$('#modal-layer .pay-price'))
await showRoute('#/jogos')
check('aba Jogos mostra a faixa do passe', !!$('#screen .pay-banner'), $('#screen').textContent.slice(0, 40))
check('jogos ficam com cadeado na vitrine', $$('#screen .game-card .pill').some((x) => x.querySelector('svg')))
click($('#screen .game-card'))
await wait(60)
check('tocar num jogo sem passe abre o pagamento', !!$('#modal-layer .pay-price'))
$('#modal-layer').hidden = true
await showRoute('#/liga')
check('aba Liga bloqueada sem passe', !!$('#screen .pay-panel'))
await showRoute('#/trilha')
const lockedNode = $$('.node.locked')[0]
check('existem fases bloqueadas sem passe', !!lockedNode)
click(lockedNode)
await wait(40)
check('fase bloqueada sem passe chama o paywall (não o "abre em X dias")', /passe/i.test($('#nudge-layer')?.textContent ?? '') || !!$('#modal-layer .pay-price'))

// relâmpago ativo não pode vazar XP grátis para o lead
$('#modal-layer').hidden = true
state.S.lightning.today = { title: 'Beijo de 2 minutos', text: 'teste de furo', xp: 25, em: 'bolt' }
state.S.lightning.todayDate = undefined
const xpAntes = state.S.xp
await showRoute('#/trilha')
const claimBtn = $$('#screen .btn').find((b) => b.textContent.includes('Fizemos agora'))
check('relâmpago ativo aparece na trilha', !!claimBtn)
if (claimBtn) click(claimBtn)
await wait(60)
check('claim do relâmpago não dá XP sem passe', state.S.xp === xpAntes, `${xpAntes}→${state.S.xp}`)
check('claim do relâmpago abre o pagamento', !!$('#modal-layer .pay-price'))
state.S.lightning.today = null
$('#modal-layer').hidden = true

// truques de estado não furam o gate
state.S.prefs.marathon = true
state.S.startDate = '2020-01-01'
check('dias passados + maratona não liberam sem passe', state.unlockedCount() === 1, String(state.unlockedCount()))
state.S.prefs.marathon = false
state.S.startDate = new Date().toISOString().slice(0, 10)

// atalho de desenvolvimento fora da vista do lead
await showRoute('#/ninho')
const debugBtn = $$('#screen .btn').find((b) => /brasas \(teste\)/.test(b.textContent))
check('botão "ganhar brasas (teste)" escondido do lead', !debugBtn || debugBtn.hidden === true)

state.markPaid('SMOKE')

// vitrines do passe
const card = PAY.paywallCard()
check('cartão do passe na trilha existe', card.className.includes('pay-card') && /19,90/.test(card.textContent))
const panel = PAY.paywallPanel('liga')
check('painel de aba bloqueada existe', panel.className.includes('pay-panel') && /passe/.test(panel.textContent))

// gates ligados em todas as portas de conteúdo pago
const gateMap = {
  'js/screens/home.js': ['paywallCard', 'openPaywall', 'requirePremium'],
  'js/screens/hub.js': ['requirePremium'],
  'js/screens/league.js': ['isPremium', 'paywallPanel'],
  'js/screens/extra.js': ['requirePremium'],
  'js/screens/lesson.js': ['openPaywall', 'FREE_PHASES'],
  'js/main.js': ['checkUnlockFromUrl'],
}
for (const [file, needles] of Object.entries(gateMap)) {
  const src = readFileSync(join(root, file), 'utf8')
  check(`gate em ${file.replace('js/screens/', '').replace('js/', '')}`, needles.every((n) => src.includes(n)), needles.filter((n) => !src.includes(n)).join(','))
}
check('paywall tem CSS próprio', ['pay-card', 'pay-panel', 'pay-price', 'pay-list', 'pay-code'].every((c) => screensCss.includes(`.${c}`)))
check('paywall não usa emoji', !EMOJI_RE.test(paywallSrc))
check('paywall não usa cores banidas', !BANNED.some((c) => paywallSrc.toLowerCase().includes(c)))
check('volta do checkout desbloqueia (?paid=1 / ?code=)', paywallSrc.includes('checkUnlockFromUrl') && paywallSrc.includes('paidParam'))

/* ---------- 15. rosto da Chispa (assets/foguinho.png) ---------- */
console.log('\n15) Rosto da Chispa')
const facePath = join(root, 'assets/foguinho.png')
check('assets/foguinho.png existe', existsSync(facePath))
const faceBytes = existsSync(facePath) ? statSync(facePath).size : 0
check('PNG otimizado para web (< 400 KB)', faceBytes > 0 && faceBytes < 400_000, `${Math.round(faceBytes / 1024)} KB`)
check('splash mostra o rosto da Chispa', appHtml.includes('./assets/foguinho.png') && /boot-crest boot-face/.test(appHtml))
check('splash mantém crest + wordmark (contrato)', appHtml.includes('boot-crest') && appHtml.includes('boot-word'))
check('onboarding apresenta a Chispa com retrato', readFileSync(join(root, 'js/screens/onboarding.js'), 'utf8').includes('./assets/foguinho.png'))
check('card de oferta da landing tem o rosto', landingHtml.includes('./assets/foguinho.png') && landingHtml.includes('offer-face'))
check('CSS do rosto nos dois lados', appCss.includes('.boot-face') && appCss.includes('.chispa-face') && landingCss.includes('.offer-face'))
check('SVG animado segue onde há movimento', readFileSync(join(root, 'js/screens/home.js'), 'utf8').includes("mascot(") && readFileSync(join(root, 'js/paywall.js'), 'utf8').includes("mascot("))
check('ícone do app (casal) continua sendo o SVG', manifest.icons.every((i) => i.src.includes('assets/icon.svg')) && appHtml.includes('./assets/icon.svg'))

console.log(`\n${'='.repeat(46)}`)
console.log(`erros capturados: ${errors.length}`)
for (const e of errors.slice(0, 8)) console.log('   ⚠️ ', e)
console.log(`${'='.repeat(46)}`)
console.log(`✅ ${pass} passaram · ❌ ${fail} falharam\n`)
process.exit(fail === 0 && errors.length === 0 ? 0 : 1)
