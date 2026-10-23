/* ============================================================
   MASCOTES — Chispa (fogo) & Gota (água)
   O casal de opostos que se provoca, agora com os retratos oficiais
   (assets/foguinho.png e assets/gotinha.png): movimento em camadas no
   CSS, 7 humores com emote, falas e brigas entre fases.
   ============================================================ */
import { icon } from './icons.js'
import { el, pick } from './util.js'

/* retratos oficiais — a arte que o dono do app escolheu no chat */
export const FACES = {
  chispa: { src: './assets/foguinho.png', alt: 'Chispa, a mascote de fogo do 4 Paredes', glow: '#ff7a29' },
  gota: { src: './assets/gotinha.png', alt: 'Gota, a mascote de água do 4 Paredes', glow: '#4cc9f0' },
}

const MOODS = ['happy', 'love', 'angry', 'sad', 'wink', 'sleepy', 'shock']

/* cada humor veste um emote sobre a cabeça — o rosto é o retrato oficial */
const MOOD_EMOTE = {
  happy: 'sparkle',
  love: 'heart',
  angry: 'warning',
  sad: 'drop',
  wink: 'star',
  sleepy: 'moon',
  shock: 'bolt',
}

/**
 * Monta um mascote vivo a partir do retrato oficial.
 * O movimento vem do CSS em camadas (flutuação do corpo + sombra no chão que
 * respira + brilho pulsante + micro-respiração da imagem); o humor vem de
 * [data-mood] (emote + movimento secundário). Mesmo contrato de antes:
 * @param {'chispa'|'gota'} kind
 * @param {string} mood
 * @param {object} opts { anim: 'idle'|'happy'|'angry'|'wave'|'sad', cls }
 */
export function mascot(kind = 'chispa', mood = 'happy', opts = {}) {
  const face = FACES[kind] ?? FACES.chispa
  const safeMood = MOODS.includes(mood) ? mood : 'happy'
  const node = el('div', {
    class: `mascot ${opts.anim ?? 'idle'} ${opts.cls ?? ''}`.trim(),
    'data-kind': kind,
    'data-mood': safeMood,
  })
  node.style.setProperty('--m-glow', face.glow)
  node.append(
    el('span', { class: 'm-glow', 'aria-hidden': 'true' }),
    el('span', { class: 'm-body' }, [
      el('img', {
        class: 'm-img',
        src: face.src,
        alt: face.alt,
        width: 120,
        height: 120,
        draggable: 'false',
      }),
    ]),
    el('span', { class: 'm-emote', 'aria-hidden': 'true', html: icon(MOOD_EMOTE[safeMood] ?? 'sparkle', 13) }),
    el('span', { class: 'm-shadow', 'aria-hidden': 'true' }),
  )
  return node
}

export function setMood(node, mood, anim) {
  if (!node) return
  const safeMood = MOODS.includes(mood) ? mood : 'happy'
  node.dataset.mood = safeMood
  const emote = node.querySelector('.m-emote')
  if (emote) emote.innerHTML = icon(MOOD_EMOTE[safeMood] ?? 'sparkle', 13)
  if (anim) node.className = `mascot ${anim}`
}

/* ============================================================
   FALAS
   ============================================================ */
export const VOICES = {
  chispa: { name: 'Chispa', em: 'flame', color: '#ff7a29' },
  gota: { name: 'Gota', em: 'drop', color: '#4cc9f0' },
}

export const LINES = {
  greet: [
    'Finalmente vocês abriram o app! Eu já estava apagando aqui.',
    'Boa noite, casal. A casa tá fria demais, bora mudar isso.',
    'Olha quem voltou! A Gota apostou que vocês iam esquecer.',
    'Um dia sem desafio é um dia desperdiçado. Bora?',
    'Eu sou a Chispa, ela é a Gota. Fogo e água. Vocês são a desculpa da nossa existência.',
  ],
  nudge: [
    'Psiu… a fase de hoje ainda tá aí. Ela não se completa sozinha.',
    'Vou contar um segredo: casais que jogam todo dia brigam menos. Eu inventei isso, mas é verdade.',
    'Falta 1 fase pra hoje ficar perfeito. 1. Só 1.',
    'Vocês têm {streak} dias de ofensiva. Perder isso dói mais do que parece.',
    'Eu e a Gota apostamos quanto tempo vocês iam demorar. Eu perdi. Façam valer a aposta.',
    'Não deixa pra depois do jantar. Depois do jantar vocês dormem. Sempre.',
    'Tô vendo vocês aí rolando o feed. Aqui tem coisa melhor pra rolar.',
    'Chamando as 4 paredes: tem desafio esperando. E tem vela apagada também.',
  ],
  streakRisk: [
    'ALERTA DE OFENSIVA! Se vocês não jogarem hoje, {streak} dias viram cinza.',
    'Últimas horas! A meia-noite não perdoa casal distraído.',
    'Eu não vou conseguir segurar essa chama sozinha. Ajuda aqui.',
  ],
  cheer: [
    'ISSO! É assim que se mantém acesa!',
    'Orgulho de vocês. Sério. Chama aprovada.',
    'Vocês dois são o melhor combustível que existe.',
    'A Gota tá chorando de emoção. Ela nega, mas tá. Aliás, chorar é a especialidade dela.',
    'Mais um dia, mais uma história pra contar pros netos (ou não).',
  ],
  scold: [
    'Pularam? Tá bom… mas a vela apagou um pouquinho aqui.',
    'Anotado no meu caderninho de chama. Brincadeira. Mais ou menos.',
    'Sem drama, amanhã tem outra. Mas amanhã mesmo, hein.',
    'Eu avisei a Gota que vocês iam pular. Ela não acreditou em mim.',
  ],
  broke: [
    'A ofensiva caiu. Respira. Amanhã a gente começa outra e vai mais longe.',
    'Quebrou… mas quebrou com estilo. Bora reconstruir hoje?',
    'Eu usei meu último congelador pra tentar salvar. Não deu. Culpa de vocês.',
  ],
  taunt: [
    'Vai com calma, gota. Você evapora no meu primeiro abraço.',
    'Chispa, você é dramática. E quente demais. Difícil conversar.',
    'Sem mim você é só calor sem direção, chama.',
    'Sem mim você é só um pires d’água na janela, Gota.',
    'Água e fogo não combinam, dizem. A gente combina. Prova real: vocês dois.',
  ],
  duelWin: [
    'Vitória da Chispa! Alguém me deve um incêndio comemorativo.',
    'A Gota venceu… apagando tudo. Literalmente. Insuportável por uma semana.',
  ],
  idle: [
    'Tô só observando vocês dois. Continua.',
    'Sabia que 70% da rotina morre no sofá? Eu inventei esse número agora.',
    'Gota, para de olhar o celular dela. É o seu próprio celular.',
    'Casal que joga junto… fica junto. Óbvio, né? Fui eu que escrevi.',
  ],
  levelUp: [
    'SUBIU DE NÍVEL! A casa inteira sentiu.',
    'Nível novo desbloqueado. Agora vocês são oficialmente perigosos.',
  ],
  empty: [
    'Vocês zeraram o dia! Voltem amanhã — ou comprem um passe na loja, seus apressados.',
    'Acabou por hoje. A Gota tá deitada no sofá, evaporando de tédio. Literalmente.',
  ],
}

export function fillLine(text, vars = {}) {
  return text.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? `{${k}}`)
}

/* ---------- brigas / cutscenes ---------- */
export const SCENES = {
  intro: [
    { who: 'chispa', mood: 'happy', text: 'Oi! Eu sou a Chispa. Sou a faísca que sobra quando vocês dois se olham.' },
    { who: 'gota', mood: 'wink', text: 'E eu sou a Gota. Sem mim, ela é só calor sem fogo.' },
    { who: 'chispa', mood: 'angry', text: 'Como assim SEM VOCÊ? Eu queimo sozinha desde sempre.' },
    { who: 'gota', mood: 'angry', text: 'Sozinha você dura dois segundos. Literalmente. Eu cronometrei.' },
    { who: 'chispa', mood: 'happy', text: 'Enfim… vocês. A regra é simples: todo dia tem um desafio novo nas 4 paredes.' },
    { who: 'gota', mood: 'happy', text: 'Se vocês pularem um dia, a ofensiva apaga. E a gente briga. De novo.' },
    { who: 'chispa', mood: 'love', text: 'Bora acender isso aqui?' },
  ],
  afterBoss: [
    { who: 'chispa', mood: 'shock', text: 'Vocês viram aquilo?! Foi golpe baixo!' },
    { who: 'gota', mood: 'angry', text: 'Golpe baixo foi você usar a maré a seu favor, chama.' },
    { who: 'chispa', mood: 'wink', text: 'Isso se chama estratégia. Aprende, gota.' },
    { who: 'gota', mood: 'happy', text: 'Tá bom, tá bom. Próxima temporada a gente resolve. Com vocês de juízes.' },
  ],
  streakLost: [
    { who: 'gota', mood: 'sad', text: 'Apagou. Eu falei que ia apagar.' },
    { who: 'chispa', mood: 'angry', text: 'VOCÊ falou?! Eu que avisei três vezes ontem à noite!' },
    { who: 'gota', mood: 'angry', text: 'Avisou nada. Você tava ocupada brilhando.' },
    { who: 'chispa', mood: 'sad', text: '…tá. Vamos reconstruir. Um dia de cada vez, casal.' },
  ],
  noPlay: [
    { who: 'chispa', mood: 'sad', text: 'Hoje ninguém jogou. A casa ficou fria.' },
    { who: 'gota', mood: 'sad', text: 'Eu até guardei água pra vocês. Nada.' },
    { who: 'chispa', mood: 'happy', text: 'Mas ainda dá tempo. A fase de hoje tá esperando, olha ela ali pulsando.' },
  ],
  marathon: [
    { who: 'gota', mood: 'shock', text: 'Vocês ligaram o modo maratona?! Isso é trapaça!' },
    { who: 'chispa', mood: 'love', text: 'Isso é ENTUSIASMO, gota. Deixa eles.' },
  ],
}

export function randomScene() {
  return pick([SCENES.afterBoss, SCENES.noPlay, SCENES.intro])
}

/* ---------- cutscene player ---------- */
export function playCutscene(scene, { onDone } = {}) {
  const lines = Array.isArray(scene) ? scene : scene.lines
  const layer = document.querySelector('#modal-layer')
  layer.hidden = false
  layer.innerHTML = ''

  const left = mascot('chispa', 'happy', { anim: 'idle' })
  const right = mascot('gota', 'happy', { anim: 'idle' })
  right.classList.add('right-m')

  const stage = el('div', { class: 'cut-stage' }, [left, right])
  const bubble = el('div', { class: 'bubble cut-line' })
  const hint = el('p', { class: 'tiny muted center', text: 'toque para continuar' })
  const nextBtn = el('button', { class: 'btn sm ghost', text: 'Continuar' })

  const box = el('div', { class: 'modal cutscene' }, [stage, bubble, nextBtn, hint])
  layer.append(box)

  let i = 0
  const queue = lines

  function render() {
    const cur = queue[i]
    if (!cur) return close()
    const isLeft = cur.who === 'chispa'
    const target = isLeft ? left : right
    const other = isLeft ? right : left
    setMood(target, cur.mood, cur.mood === 'angry' ? 'angry' : cur.mood === 'sad' ? 'sad' : 'happy')
    setMood(other, cur.mood === 'angry' ? 'shock' : 'happy', 'idle')
    bubble.className = `bubble cut-line ${isLeft ? '' : 'right'}`
    bubble.innerHTML = `<span class="who">${VOICES[cur.who]?.name ?? ''}</span>`
    bubble.append(document.createTextNode(cur.text))
    nextBtn.textContent = i === queue.length - 1 ? 'Começar' : 'Continuar'
  }

  function close() {
    box.classList.add('out')
    layer.classList.add('out')
    setTimeout(() => {
      layer.hidden = true
      layer.innerHTML = ''
      layer.classList.remove('out')
      onDone?.()
    }, 220)
  }

  const advance = () => {
    i++
    if (i >= queue.length) return close()
    render()
  }
  nextBtn.addEventListener('click', advance)
  box.addEventListener('click', (e) => {
    if (e.target === stage || stage.contains(e.target)) advance()
  })
  render()
}
