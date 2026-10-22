/* ============================================================
   ESTADO DO JOGO — progresso, ofensiva, moedas, missões, liga
   persistido em localStorage
   ============================================================ */
import { ACHIEVEMENTS, LEAGUES, LIGHTNING, NODES, RIVALS } from './content.js'
import {
  DAY,
  clamp,
  daysBetween,
  loadJSON,
  pick,
  randInt,
  saveJSON,
  shuffle,
  todayKey,
  uid,
  weekKey,
} from './util.js'

const KEY = 'quatro-paredes:v1'

const listeners = new Set()
export const onChange = (fn) => {
  listeners.add(fn)
  return () => listeners.delete(fn)
}
export function emit(reason = 'change') {
  for (const fn of listeners) {
    try {
      fn(reason)
    } catch (err) {
      console.warn('[4paredes] listener falhou', err)
    }
  }
}

function defaultState() {
  const today = todayKey()
  return {
    v: 1,
    onboarded: false,
    startDate: today,
    trialStart: null, // vindo da página de vendas (?trial=1)
    paid: false, // passe comprado: libera tudo depois da 1ª fase
    paidAt: null,
    payCode: null,
    couple: { p1: 'Você', p2: 'Amor', emoji: 'couple', since: '' },
    prefs: {
      intensity: 2,
      sound: true,
      notify: false,
      notifyHour: 21,
      notifyMin: 0,
      marathon: false,
      safeword: 'geladeira',
      vetoed: [],
    },
    xp: 0,
    brasas: 120,
    curingas: 2,
    freezes: 1,
    folego: 5,
    streak: 0,
    bestStreak: 0,
    lastPlayed: null,
    playedToday: false,
    nodes: {}, // id -> { date, mood, note, skipped }
    memories: [],
    achievements: [],
    stats: {
      done: 0,
      spicy: 0,
      fire: 0,
      duels: 0,
      duelLoss: 0,
      games: 0,
      roulettes: 0,
      dice: 0,
      cards: 0,
      quizBest: 0,
      minutes: 0,
      lightning: 0,
      kisses: 0,
    },
    quests: null,
    league: {
      week: weekKey(),
      xp: 0,
      bestRank: 99,
      promoted: 0,
      rivals: [],
    },
    nudges: { last: 0, seenToday: [], count: 0 },
    lightning: { last: 0, today: null },
    seenCutscenes: [],
    bootCount: 0,
  }
}

/** mescla o estado salvo com o padrão (sobrevive a estado corrompido/antigo) */
function mergeState(base, over) {
  if (over === null || over === undefined) return base
  if (Array.isArray(over)) return over
  if (typeof over !== 'object') return over
  const out = Array.isArray(base) ? [...base] : { ...base }
  for (const k of Object.keys(over)) out[k] = mergeState(base?.[k], over[k])
  return out
}

export const S = mergeState(defaultState(), loadJSON(KEY, null))

export function save() {
  saveJSON(KEY, S)
}

/* ---------------- chegada do lead (vindo da página de vendas) ---------------- */
export const TRIAL_DAYS = 7 // janela em que o lead chegou pela página de vendas (não é mais o período grátis: a amostra é a 1ª fase)

/** dia atual do teste (1..7) e quantos faltam; active=false quando não há teste */
export function trialInfo(now = todayKey()) {
  if (!S.trialStart) return { active: false, day: 0, left: 0, start: null }
  const day = daysBetween(now, S.trialStart) + 1
  return {
    active: day >= 1 && day <= TRIAL_DAYS,
    day: Math.max(1, Math.min(TRIAL_DAYS, day)),
    left: Math.max(0, TRIAL_DAYS - day),
    start: S.trialStart,
  }
}

export function resetAll() {
  localStorage.removeItem(KEY)
  Object.assign(S, defaultState())
  save()
  emit('reset')
}

/* ---------------- níveis ---------------- */
export const xpForLevel = (lvl) => Math.round(80 * Math.pow(lvl, 1.22))

export function levelInfo(xp = S.xp) {
  let level = 1
  let rest = xp
  while (rest >= xpForLevel(level)) {
    rest -= xpForLevel(level)
    level++
    if (level > 999) break
  }
  const need = xpForLevel(level)
  return { level, into: rest, need, pct: clamp(rest / need, 0, 1) }
}

/* ---------------- passe pago: só a 1ª fase é grátis ---------------- */
export const FREE_PHASES = 1

/** o lead pagou? sem passe, o jogo inteiro cabe em FREE_PHASES */
export function isPremium() {
  return S.paid === true
}

/** confirma o pagamento (volta do checkout ou por código de acesso) */
export function markPaid(code = '') {
  S.paid = true
  S.paidAt = todayKey()
  S.payCode = code || null
  save()
  emit('paid')
  return { paid: true, at: S.paidAt }
}

/* ---------------- desbloqueio de fases ---------------- */
export function unlockedCount() {
  // sem passe, a trilha termina na primeira fase — o resto é paywall
  if (!isPremium()) return Math.min(FREE_PHASES, NODES.length)
  if (S.prefs.marathon) return NODES.length
  const days = Math.max(0, daysBetween(todayKey(), S.startDate))
  return clamp(days + 1, 1, NODES.length)
}

export function currentNodeIndex() {
  const idx = NODES.findIndex((n) => !S.nodes[n.id]?.date)
  return idx === -1 ? NODES.length : idx
}

export function nextNode() {
  const i = currentNodeIndex()
  return NODES[Math.min(i, NODES.length - 1)]
}

export function nodeState(id) {
  const record = S.nodes[id]
  if (record?.date) return 'done'
  const idx = NODES.findIndex((n) => n.id === id)
  if (idx < unlockedCount() && idx <= currentNodeIndex()) return 'current'
  if (idx < unlockedCount()) return 'open'
  return 'locked'
}

export function unitProgress(unit) {
  const done = unit.days.filter((d) => S.nodes[d.id]?.date).length
  return { done, total: unit.days.length, pct: done / unit.days.length }
}

export function activeUnit() {
  const node = nextNode()
  return node?.unit ?? UNITS_LAST
}
const UNITS_LAST = NODES[NODES.length - 1].unit

/* ---------------- moedas / xp ---------------- */
export function addXp(amount, reason = '') {
  const before = levelInfo().level
  S.xp += amount
  S.league.xp += amount
  const after = levelInfo()
  save()
  emit('xp')
  if (after.level > before) return { leveledUp: true, level: after.level, reason }
  return { leveledUp: false, level: after.level, reason }
}

export function addBrasas(n) {
  S.brasas = Math.max(0, S.brasas + n)
  save()
  emit('brasas')
}

export function spendBrasas(n) {
  if (S.brasas < n) return false
  S.brasas -= n
  save()
  emit('brasas')
  return true
}

export function addCuringa(n = 1) {
  S.curingas += n
  save()
  emit('curinga')
}

/* ---------------- dia / ofensiva ---------------- */
export function syncDay() {
  const today = todayKey()
  const events = { newDay: false, broken: false, freezeUsed: 0, streakSaved: false, firstBoot: false }

  S.bootCount++
  S.bestStreak = Math.max(S.bestStreak ?? 0, S.streak ?? 0)
  if (!S.lastPlayed && S.streak === 0 && S.stats.done === 0) events.firstBoot = true

  if (S.league.week !== weekKey()) {
    finishLeagueWeek()
    S.league.week = weekKey()
    S.league.xp = 0
    seedRivals()
  }

  if (!S.quests || S.quests.date !== today) {
    rollQuests(today)
    events.newDay = true
  }

  if (S.lightning?.todayDate !== today) {
    S.lightning.today = null
    S.lightning.todayDate = today
  }

  // ofensiva
  if (S.lastPlayed) {
    const gap = daysBetween(today, S.lastPlayed)
    if (gap > 1) {
      const missing = gap - 1
      const usable = Math.min(missing, S.freezes)
      if (usable >= missing) {
        S.freezes -= usable
        events.freezeUsed = usable
        events.streakSaved = true
      } else {
        S.streak = 0
        events.broken = true
        S.freezes = Math.max(0, S.freezes - usable)
      }
      S.lastPlayed = todayKey(new Date(Date.now() - DAY))
    }
  }
  S.playedToday = S.lastPlayed === today

  if (S.nudges.seenTodayDate !== today) {
    S.nudges.seenToday = []
    S.nudges.seenTodayDate = today
  }

  simulateRivals()
  save()
  return events
}

export function markPlayedToday() {
  const today = todayKey()
  if (S.lastPlayed !== today) {
    const gap = S.lastPlayed ? daysBetween(today, S.lastPlayed) : 99
    S.streak = gap === 1 ? S.streak + 1 : 1
    S.bestStreak = Math.max(S.bestStreak, S.streak)
    S.lastPlayed = today
    S.playedToday = true
    return { streakUp: true }
  }
  return { streakUp: false }
}

/* ---------------- concluir fase ---------------- */
export function completeNode(node, { mood = 3, note = '' } = {}) {
  const today = todayKey()
  S.nodes[node.id] = { ...(S.nodes[node.id] ?? {}), date: today, mood, note: note.trim(), ts: Date.now() }
  S.stats.done++
  if (node.level >= 2) S.stats.spicy++
  if (node.level >= 3) S.stats.fire++
  S.stats.minutes += node.min ?? 0
  const streak = markPlayedToday()
  const lv = addXp(node.xp ?? 30)
  S.memories.unshift({
    id: uid(),
    date: today,
    nodeId: node.id,
    title: node.title,
    em: node.em ?? 'sparkle',
    mood,
    note: note.trim(),
    xp: node.xp ?? 30,
  })
  S.memories = S.memories.slice(0, 200)
  trackQuest('fase', 1)
  trackQuest('xp', node.xp ?? 30)
  if (mood >= 4) trackQuest('nota', 1)
  const ach = checkAchievements()
  save()
  emit('complete')
  return { streak, level: lv, achievements: ach }
}

export function skipNode(node, { usedCuringa = false }) {
  S.nodes[node.id] = { ...(S.nodes[node.id] ?? {}), skipped: true, skipDate: todayKey(), usedCuringa }
  if (usedCuringa) {
    S.curingas = Math.max(0, S.curingas - 1)
  } else {
    S.folego = Math.max(0, S.folego - 1)
  }
  save()
  emit('skip')
}

export function unskipNode(id) {
  if (S.nodes[id]) {
    delete S.nodes[id].skipped
    delete S.nodes[id].skipDate
    save()
  }
}

/** registra xp de mini-jogo avulso (não conta como fase diária) */
export function completeActivity({ xp = 20, type = 'game', note = '', title = 'Mini-jogo', em = 'dice', mood = 0 }) {
  if (type !== 'extra') S.stats.games++
  if (type === 'roleta') S.stats.roulettes++
  if (type === 'dados') S.stats.dice++
  if (type === 'cartas') S.stats.cards++
  if (type === 'duelo') S.stats.duels++
  if (type === 'relampago') S.stats.lightning++
  const lv = addXp(xp)
  trackQuest('jogo', 1)
  trackQuest('xp', xp)
  if (note) {
    S.memories.unshift({ id: uid(), date: todayKey(), nodeId: null, title, em, mood, note, xp })
    trackQuest('nota', 1)
  }
  const ach = checkAchievements()
  save()
  emit('activity')
  return { level: lv, achievements: ach }
}

/* ---------------- missões diárias ---------------- */
const QUEST_POOL = [
  { id: 'fase', em: 'target', label: 'Complete a fase de hoje', goal: 1, reward: 40 },
  { id: 'xp', em: 'bolt', label: 'Ganhe 80 XP', goal: 80, reward: 35 },
  { id: 'jogo', em: 'dice', label: 'Jogue 2 mini-jogos', goal: 2, reward: 45 },
  { id: 'nota', em: 'book', label: 'Registre o clima no diário', goal: 1, reward: 25 },
  { id: 'roleta', em: 'wheel', label: 'Gire a roleta 2 vezes', goal: 2, reward: 30 },
  { id: 'duelo', em: 'swords', label: 'Vença 1 duelo dos mascotes', goal: 1, reward: 60 },
]

export function rollQuests(date = todayKey()) {
  const items = shuffle(QUEST_POOL).slice(0, 3).map((q) => ({ ...q, progress: 0, claimed: false }))
  S.quests = { date, items }
}

export function trackQuest(id, amount = 1) {
  if (!S.quests || S.quests.date !== todayKey()) return
  for (const q of S.quests.items) {
    if (q.id === id && !q.claimed) q.progress = Math.min(q.goal, q.progress + amount)
  }
}

export function claimQuest(index) {
  const q = S.quests?.items?.[index]
  if (!q || q.claimed || q.progress < q.goal) return false
  q.claimed = true
  addBrasas(q.reward)
  save()
  emit('quest')
  return true
}

export function questsReady() {
  return S.quests?.items?.some((q) => q.progress >= q.goal && !q.claimed) ?? false
}

/* ---------------- relâmpago ---------------- */
export function maybeLightning(force = false) {
  const now = Date.now()
  const cooldown = 45 * 60 * 1000
  if (!force && now - (S.lightning.last ?? 0) < cooldown) return null
  const item = pick(LIGHTNING)
  S.lightning.last = now
  S.lightning.today = item
  save()
  return item
}

export function claimLightning(item, { mood = 3, note = '' } = {}) {
  addBrasas(15)
  const res = completeActivity({ xp: item.xp ?? 25, type: 'relampago', title: item.title, em: item.em, note, mood })
  S.lightning.today = null
  save()
  return res
}

/* ---------------- conquistas ---------------- */
export function checkAchievements() {
  const unlocked = []
  for (const a of ACHIEVEMENTS) {
    if (S.achievements.includes(a.id)) continue
    let ok = false
    try {
      ok = !!a.test(S)
    } catch {
      ok = false
    }
    if (ok) {
      S.achievements.push(a.id)
      unlocked.push(a)
      addBrasas(25)
    }
  }
  if (unlocked.length) save()
  return unlocked
}

/* ---------------- liga ---------------- */
export function leagueTier() {
  let tier = LEAGUES[0]
  for (const l of LEAGUES) if (S.league.promoted >= LEAGUES.indexOf(l)) tier = l
  const idx = clamp(S.league.promoted, 0, LEAGUES.length - 1)
  return { ...LEAGUES[idx], index: idx, next: LEAGUES[idx + 1] ?? null }
}

function seedRivals() {
  const names = shuffle(RIVALS).slice(0, 9)
  S.league.rivals = names.map((n, i) => ({
    name: n,
    em: pick(['couple', 'heart', 'heartHands', 'glasses', 'leaf', 'lips', 'gem']),
    xp: randInt(20, 90),
    pace: randInt(4, 14),
  }))
}

function simulateRivals() {
  if (!S.league.rivals?.length) return seedRivals()
  const now = Date.now()
  const last = S.league.lastSim ?? now - 3600_000
  const hours = clamp((now - last) / 3600_000, 0, 24)
  S.league.lastSim = now
  for (const r of S.league.rivals) {
    r.xp += Math.round(r.pace * hours * (0.6 + Math.random() * 0.9))
  }
}

export function standings() {
  const me = { name: `${S.couple.p1} & ${S.couple.p2}`, em: S.couple.emoji, xp: S.league.xp, me: true }
  const all = [...(S.league.rivals ?? []), me].sort((a, b) => b.xp - a.xp)
  const rank = all.findIndex((x) => x.me) + 1
  S.league.bestRank = Math.min(S.league.bestRank || 99, rank)
  return { all, rank }
}

function finishLeagueWeek() {
  const { rank } = standings()
  if (rank <= 3) {
    S.league.promoted = Math.min(LEAGUES.length - 1, S.league.promoted + 1)
    addBrasas(120)
    return { promoted: true, rank }
  }
  if (rank > 7) {
    S.league.promoted = Math.max(0, S.league.promoted - 1)
    return { demoted: true, rank }
  }
  return { promoted: false, rank }
}

/* ---------------- intensidade ---------------- */
export function effectiveLevel(node) {
  return Math.min(node.level ?? 1, S.prefs.intensity)
}

export function nodeText(node) {
  const capped = (node.level ?? 1) > S.prefs.intensity && node.alt
  return { text: capped ? node.alt : node.text, capped }
}

export function intensityFilter() {
  return S.prefs.intensity
}

/* ---------------- loja ---------------- */
export const SHOP = [
  { id: 'freeze', em: 'snowflake', name: 'Congelador de ofensiva', desc: 'Protege 1 dia perdido', price: 180 },
  { id: 'curinga', em: 'cards', name: 'Curinga', desc: 'Pule uma fase sem perder fôlego', price: 90 },
  { id: 'folego', em: 'heart', name: 'Recarga de fôlego', desc: 'Volta aos 5 fôlegos', price: 120 },
  { id: 'baudir', em: 'gift', name: 'Baú direto', desc: 'Abre um baú agora', price: 220 },
]

export function buy(itemId) {
  const item = SHOP.find((s) => s.id === itemId)
  if (!item) return false
  if (!spendBrasas(item.price)) return false
  if (itemId === 'freeze') S.freezes++
  if (itemId === 'curinga') S.curingas++
  if (itemId === 'folego') S.folego = 5
  save()
  emit('shop')
  return true
}

/* ---------------- baús ---------------- */
export function openChest(node) {
  const brasas = randInt(45, 90) + (node?.unit ? NODES.indexOf(node) * 3 : 0)
  addBrasas(brasas)
  const extras = []
  if (Math.random() < 0.6) {
    addCuringa(1)
    extras.push({ em: 'cards', label: '1 curinga' })
  }
  if (Math.random() < 0.35) {
    S.freezes++
    extras.push({ em: 'snowflake', label: '1 congelador' })
  }
  if (S.folego < 5 && Math.random() < 0.5) {
    S.folego = 5
    extras.push({ em: 'heart', label: 'fôlego cheio' })
  }
  const res = completeNode(node, { mood: 0 })
  save()
  return { brasas, extras, ...res }
}

/* ---------------- diagnóstico ---------------- */
export function dangerOfLosingStreak() {
  if (!S.streak) return false
  return !S.playedToday
}

export function summary() {
  const li = levelInfo()
  return {
    level: li.level,
    pct: li.pct,
    into: li.into,
    need: li.need,
    streak: S.streak,
    brasas: S.brasas,
    folego: S.folego,
    done: S.stats.done,
    unlocked: unlockedCount(),
    total: NODES.length,
  }
}
