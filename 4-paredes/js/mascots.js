/* ============================================================
   MASCOTES — Chispa (fogo) & Gota (água)
   Um casal de opostos que se provoca: SVG animado, 7 humores,
   falas e brigas entre fases.
   ============================================================ */
import { el, pick } from './util.js'

let svgSeq = 0

const MOODS = ['happy', 'love', 'angry', 'sad', 'wink', 'sleepy', 'shock']

/* ---------- CHISPA: a chama ---------- */
function chispa(gid) {
  return `
  <g class="m-body">
    <g class="m-legs">
      <path d="M52 116 L48 140" stroke="#b81f0a" stroke-width="9" stroke-linecap="round"/>
      <path d="M68 116 L72 140" stroke="#b81f0a" stroke-width="9" stroke-linecap="round"/>
    </g>
    <path d="M45 76 C45 71 75 71 75 76 L79 110 C79 118 41 118 41 110 Z" fill="url(#${gid}-fb)"/>
    <g class="m-arms">
      <path class="m-arm-l" d="M45 84 C31 84 25 74 29 66" stroke="#e5401f" stroke-width="7" fill="none" stroke-linecap="round"/>
      <path class="m-arm-r" d="M75 84 C89 84 95 74 91 66" stroke="#e5401f" stroke-width="7" fill="none" stroke-linecap="round"/>
    </g>
    <ellipse cx="60" cy="54" rx="26" ry="24" fill="url(#${gid}-fb)"/>
    <g class="m-flame-tip">
      <path d="M60 4 C66 15 77 19 74 29 C83 27 85 36 76 40 L44 40 C35 36 37 27 46 29 C43 19 54 15 60 4 Z" fill="url(#${gid}-fh)"/>
      <path d="M60 15 C64 21 68 24 66 30 L54 30 C52 24 56 21 60 15 Z" fill="#ffe27a" opacity=".85"/>
    </g>
    <g class="m-face">
      <ellipse class="mood-blush" cx="39" cy="61" rx="7" ry="4" fill="#ff5d8f" opacity=".5"/>
      <ellipse class="mood-blush" cx="81" cy="61" rx="7" ry="4" fill="#ff5d8f" opacity=".5"/>

      <g class="mood mood-happy">
        <g class="m-eyes">
          <ellipse cx="49" cy="50" rx="8" ry="9.5" fill="#fff"/>
          <ellipse cx="71" cy="50" rx="8" ry="9.5" fill="#fff"/>
          <circle cx="50.5" cy="52" r="4" fill="#4a1206"/>
          <circle cx="72.5" cy="52" r="4" fill="#4a1206"/>
          <circle cx="52" cy="48.5" r="1.5" fill="#fff"/>
          <circle cx="74" cy="48.5" r="1.5" fill="#fff"/>
        </g>
        <path d="M40 40 Q48 35 55 39" stroke="#7a1608" stroke-width="3.4" fill="none" stroke-linecap="round"/>
        <path d="M65 39 Q72 35 80 40" stroke="#7a1608" stroke-width="3.4" fill="none" stroke-linecap="round"/>
        <path d="M47 63 Q60 76 73 62 Q60 69 47 63 Z" fill="#4a1206"/>
        <path d="M52 65.5 Q60 70 68 65 Q60 68 52 65.5 Z" fill="#fff"/>
      </g>

      <g class="mood mood-love">
        <g class="m-eyes">
          <path d="M49 44 c-6-7-14 1-8 8 l8 9 8-9 c6-7-2-15-8-8Z" fill="#e5133f"/>
          <path d="M71 44 c-6-7-14 1-8 8 l8 9 8-9 c6-7-2-15-8-8Z" fill="#e5133f"/>
        </g>
        <path d="M47 62 Q60 77 73 62 Q60 69 47 62Z" fill="#4a1206"/>
      </g>

      <g class="mood mood-angry">
        <g class="m-eyes">
          <ellipse cx="49" cy="52" rx="7.5" ry="6.5" fill="#fff"/>
          <ellipse cx="71" cy="52" rx="7.5" ry="6.5" fill="#fff"/>
          <circle cx="50" cy="53" r="3.6" fill="#4a1206"/>
          <circle cx="72" cy="53" r="3.6" fill="#4a1206"/>
          <path d="M38 42 L56 48" stroke="#4a1206" stroke-width="4.4" stroke-linecap="round"/>
          <path d="M82 42 L64 48" stroke="#4a1206" stroke-width="4.4" stroke-linecap="round"/>
        </g>
        <path d="M46 68 L52 63 L58 68 L64 63 L70 68" stroke="#4a1206" stroke-width="4" fill="none" stroke-linecap="round"/>
      </g>

      <g class="mood mood-sad">
        <g class="m-eyes">
          <path d="M41 50 a8 8 0 0 1 16 0Z" fill="#fff"/>
          <path d="M63 50 a8 8 0 0 1 16 0Z" fill="#fff"/>
          <circle cx="49" cy="50" r="3.4" fill="#4a1206"/>
          <circle cx="71" cy="50" r="3.4" fill="#4a1206"/>
          <path d="M78 56 q4 8 -2 10 q-6 1 -3 -10Z" fill="#7fd8ff"/>
        </g>
        <path d="M48 72 Q60 62 72 72" stroke="#4a1206" stroke-width="4" fill="none" stroke-linecap="round"/>
      </g>

      <g class="mood mood-wink">
        <g class="m-eyes">
          <path d="M41 50 q8 -8 16 0" stroke="#4a1206" stroke-width="4" fill="none" stroke-linecap="round"/>
          <ellipse cx="71" cy="50" rx="8" ry="9.5" fill="#fff"/>
          <circle cx="72.5" cy="52" r="4" fill="#4a1206"/>
        </g>
        <path d="M50 64 Q62 74 74 62" stroke="#4a1206" stroke-width="4" fill="none" stroke-linecap="round"/>
      </g>

      <g class="mood mood-sleepy">
        <g class="m-eyes">
          <path d="M41 52 q8 6 16 0" stroke="#4a1206" stroke-width="4" fill="none" stroke-linecap="round"/>
          <path d="M63 52 q8 6 16 0" stroke="#4a1206" stroke-width="4" fill="none" stroke-linecap="round"/>
        </g>
        <ellipse cx="60" cy="68" rx="6" ry="7" fill="#4a1206"/>
        <text x="86" y="34" font-size="16" font-weight="900" fill="#fff" opacity=".7">z</text>
      </g>

      <g class="mood mood-shock">
        <g class="m-eyes">
          <ellipse cx="49" cy="49" rx="10" ry="12" fill="#fff"/>
          <ellipse cx="71" cy="49" rx="10" ry="12" fill="#fff"/>
          <circle cx="49" cy="50" r="3.2" fill="#4a1206"/>
          <circle cx="71" cy="50" r="3.2" fill="#4a1206"/>
        </g>
        <ellipse cx="60" cy="69" rx="7" ry="9" fill="#4a1206"/>
      </g>
    </g>
  </g>`
}

/* ---------- GOTA: a água ---------- */
function gota(gid) {
  return `
  <g class="m-body">
    <g class="m-legs">
      <path d="M52 118 L49 140" stroke="#1f8fd0" stroke-width="8" stroke-linecap="round"/>
      <path d="M68 118 L71 140" stroke="#1f8fd0" stroke-width="8" stroke-linecap="round"/>
    </g>
    <g class="m-arms">
      <path class="m-arm-l" d="M31 86 C19 86 14 77 18 69" stroke="#2f9fd0" stroke-width="6.5" fill="none" stroke-linecap="round"/>
      <path class="m-arm-r" d="M89 86 C101 86 106 77 102 69" stroke="#2f9fd0" stroke-width="6.5" fill="none" stroke-linecap="round"/>
    </g>
    <path d="M60 8 C60 8 91 52 91 88 a31 31 0 0 1 -62 0 C29 52 60 8 60 8 Z" fill="url(#${gid}-wd)"/>
    <path class="m-drop-tip" d="M60 2 C63 6 64.5 9 60 12 C55.5 9 57 6 60 2 Z" fill="#d9f4ff"/>
    <ellipse class="m-gloss" cx="43" cy="66" rx="7" ry="15" fill="#fff" opacity=".5" transform="rotate(-16 43 66)"/>
    <circle cx="40" cy="46" r="3.2" fill="#fff" opacity=".7"/>
    <g class="m-face">
      <ellipse class="mood-blush" cx="41" cy="92" rx="7" ry="4" fill="#ff8fb3" opacity=".55"/>
      <ellipse class="mood-blush" cx="79" cy="92" rx="7" ry="4" fill="#ff8fb3" opacity=".55"/>

      <g class="mood mood-happy">
        <g class="m-eyes">
          <ellipse cx="50" cy="80" rx="8" ry="9" fill="#fff"/>
          <ellipse cx="70" cy="80" rx="8" ry="9" fill="#fff"/>
          <circle cx="51.5" cy="82" r="4" fill="#0b3a63"/>
          <circle cx="71.5" cy="82" r="4" fill="#0b3a63"/>
          <circle cx="53" cy="78.5" r="1.5" fill="#fff"/>
          <circle cx="73" cy="78.5" r="1.5" fill="#fff"/>
          <path d="M42 72 l-4 -3 M45 70 l-3 -4 M75 70 l3 -4 M78 72 l4 -3" stroke="#0b3a63" stroke-width="2" stroke-linecap="round"/>
        </g>
        <path d="M42 70 Q50 66 57 70" stroke="#0b3a63" stroke-width="2.6" fill="none" stroke-linecap="round"/>
        <path d="M63 70 Q70 66 78 70" stroke="#0b3a63" stroke-width="2.6" fill="none" stroke-linecap="round"/>
        <path d="M50 95 Q60 105 70 95 Q60 100 50 95 Z" fill="#e5406b"/>
      </g>

      <g class="mood mood-love">
        <g class="m-eyes">
          <path d="M50 74 c-6-7-14 1-8 8 l8 9 8-9 c6-7-2-15-8-8Z" fill="#e5133f"/>
          <path d="M70 74 c-6-7-14 1-8 8 l8 9 8-9 c6-7-2-15-8-8Z" fill="#e5133f"/>
        </g>
        <path d="M50 94 Q60 106 70 94 Q60 100 50 94Z" fill="#e5406b"/>
      </g>

      <g class="mood mood-angry">
        <g class="m-eyes">
          <ellipse cx="50" cy="82" rx="7" ry="6" fill="#fff"/>
          <ellipse cx="70" cy="82" rx="7" ry="6" fill="#fff"/>
          <circle cx="51" cy="83" r="3.4" fill="#0b3a63"/>
          <circle cx="71" cy="83" r="3.4" fill="#0b3a63"/>
          <path d="M40 72 L56 78" stroke="#0b3a63" stroke-width="4" stroke-linecap="round"/>
          <path d="M80 72 L64 78" stroke="#0b3a63" stroke-width="4" stroke-linecap="round"/>
        </g>
        <path d="M47 98 L53 93 L59 98 L65 93 L71 98" stroke="#0b3a63" stroke-width="3.8" fill="none" stroke-linecap="round"/>
      </g>

      <g class="mood mood-sad">
        <g class="m-eyes">
          <path d="M43 80 a7.5 7.5 0 0 1 15 0Z" fill="#fff"/>
          <path d="M62 80 a7.5 7.5 0 0 1 15 0Z" fill="#fff"/>
          <circle cx="50" cy="80" r="3.2" fill="#0b3a63"/>
          <circle cx="70" cy="80" r="3.2" fill="#0b3a63"/>
          <path d="M76 86 q4 8 -2 10 q-6 1 -3 -10Z" fill="#d9f4ff"/>
        </g>
        <path d="M50 102 Q60 92 70 102" stroke="#0b3a63" stroke-width="3.8" fill="none" stroke-linecap="round"/>
      </g>

      <g class="mood mood-wink">
        <g class="m-eyes">
          <path d="M43 80 q7.5 -8 15 0" stroke="#0b3a63" stroke-width="3.8" fill="none" stroke-linecap="round"/>
          <ellipse cx="70" cy="80" rx="8" ry="9" fill="#fff"/>
          <circle cx="71.5" cy="82" r="4" fill="#0b3a63"/>
          <path d="M75 70 l3 -4 M78 72 l4 -3" stroke="#0b3a63" stroke-width="2" stroke-linecap="round"/>
        </g>
        <path d="M51 96 Q62 105 73 95" stroke="#e5406b" stroke-width="4" fill="none" stroke-linecap="round"/>
      </g>

      <g class="mood mood-sleepy">
        <g class="m-eyes">
          <path d="M43 82 q7.5 6 15 0" stroke="#0b3a63" stroke-width="3.8" fill="none" stroke-linecap="round"/>
          <path d="M62 82 q7.5 6 15 0" stroke="#0b3a63" stroke-width="3.8" fill="none" stroke-linecap="round"/>
        </g>
        <ellipse cx="60" cy="98" rx="5.5" ry="6.5" fill="#0b3a63"/>
        <text x="84" y="56" font-size="15" font-weight="900" fill="#fff" opacity=".7">z</text>
      </g>

      <g class="mood mood-shock">
        <g class="m-eyes">
          <ellipse cx="50" cy="79" rx="9" ry="11" fill="#fff"/>
          <ellipse cx="70" cy="79" rx="9" ry="11" fill="#fff"/>
          <circle cx="50" cy="80" r="3" fill="#0b3a63"/>
          <circle cx="70" cy="80" r="3" fill="#0b3a63"/>
        </g>
        <ellipse cx="60" cy="99" rx="6.5" ry="8" fill="#0b3a63"/>
      </g>
    </g>
  </g>`
}

function defs(gid) {
  return `
  <defs>
    <linearGradient id="${gid}-fh" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ffe27a"/>
      <stop offset="55%" stop-color="#ff9f1c"/>
      <stop offset="100%" stop-color="#ff5a1f"/>
    </linearGradient>
    <radialGradient id="${gid}-fb" cx="42%" cy="34%" r="72%">
      <stop offset="0%" stop-color="#ff8a4d"/>
      <stop offset="58%" stop-color="#e5401f"/>
      <stop offset="100%" stop-color="#b81f0a"/>
    </radialGradient>
    <linearGradient id="${gid}-wd" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#d9f4ff"/>
      <stop offset="52%" stop-color="#6fd4f7"/>
      <stop offset="100%" stop-color="#1f8fd0"/>
    </linearGradient>
  </defs>`
}

/**
 * Cria o elemento do mascote.
 * @param {'chispa'|'gota'} kind
 * @param {string} mood
 * @param {object} opts { anim: 'idle'|'happy'|'angry'|'wave'|'sad', cls }
 */
export function mascot(kind = 'chispa', mood = 'happy', opts = {}) {
  const gid = `m${svgSeq++}`
  const box = '0 0 120 150'
  const node = el('div', {
    class: `mascot ${opts.anim ?? 'idle'} ${opts.cls ?? ''}`.trim(),
    'data-kind': kind,
    'data-mood': MOODS.includes(mood) ? mood : 'happy',
    html: `<svg viewBox="${box}" xmlns="http://www.w3.org/2000/svg">${defs(gid)}${
      kind === 'gota' ? gota(gid) : chispa(gid)
    }</svg>`,
  })
  return node
}

export function setMood(node, mood, anim) {
  if (!node) return
  node.dataset.mood = MOODS.includes(mood) ? mood : 'happy'
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
