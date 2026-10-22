/* ============================================================
   MASCOTES — Chispa (chama) & Fósforo (palito)
   SVG animado + falas + brigas entre fases
   ============================================================ */
import { el, pick } from './util.js'

let svgSeq = 0

const MOODS = ['happy', 'love', 'angry', 'sad', 'wink', 'sleepy', 'shock']

/* ---------- CHISPA: a chama ---------- */
function chispa(gid) {
  return `
  <g class="m-body">
    <g class="m-flame-tip">
      <path d="M60 4 C79 33 100 47 100 80 a40 40 0 0 1 -80 0 C20 47 41 33 60 4Z" fill="url(#${gid}-f)" stroke="#e6cd84" stroke-opacity=".28" stroke-width="2"/>
      <path d="M60 33 C71 52 83 61 83 80 a23 23 0 0 1 -46 0 C37 61 49 52 60 33Z" fill="#e6cd84" opacity=".85"/>
    </g>
    <g class="m-arms">
      <path class="m-arm-l" d="M22 92 C10 88 6 78 9 70" stroke="#8c1c39" stroke-width="6" fill="none" stroke-linecap="round"/>
      <path class="m-arm-r" d="M98 92 C110 88 114 78 111 70" stroke="#8c1c39" stroke-width="6" fill="none" stroke-linecap="round"/>
    </g>
    <g class="m-face">
      <ellipse class="mood-blush" cx="38" cy="88" rx="9" ry="5" fill="#a82747" opacity=".55"/>
      <ellipse class="mood-blush" cx="82" cy="88" rx="9" ry="5" fill="#a82747" opacity=".55"/>

      <g class="mood mood-happy">
        <g class="m-eyes">
          <ellipse cx="47" cy="74" rx="8.5" ry="10" fill="#fff"/>
          <ellipse cx="73" cy="74" rx="8.5" ry="10" fill="#fff"/>
          <circle cx="48.5" cy="76" r="4.2" fill="#17040a"/>
          <circle cx="74.5" cy="76" r="4.2" fill="#17040a"/>
          <circle cx="50" cy="72" r="1.6" fill="#fff"/>
          <circle cx="76" cy="72" r="1.6" fill="#fff"/>
        </g>
        <path d="M48 90 Q60 101 72 90 Q60 96 48 90Z" fill="#17040a"/>
      </g>

      <g class="mood mood-love">
        <g class="m-eyes">
          <path d="M47 68 c-6-7-14 1-8 8 l8 9 8-9 c6-7-2-15-8-8Z" fill="#8c1c39"/>
          <path d="M73 68 c-6-7-14 1-8 8 l8 9 8-9 c6-7-2-15-8-8Z" fill="#8c1c39"/>
        </g>
        <path d="M47 88 Q60 103 73 88 Q60 95 47 88Z" fill="#17040a"/>
      </g>

      <g class="mood mood-angry">
        <g class="m-eyes">
          <ellipse cx="47" cy="76" rx="8" ry="7" fill="#fff"/>
          <ellipse cx="73" cy="76" rx="8" ry="7" fill="#fff"/>
          <circle cx="48" cy="77" r="3.8" fill="#17040a"/>
          <circle cx="74" cy="77" r="3.8" fill="#17040a"/>
          <path d="M36 66 L56 72" stroke="#17040a" stroke-width="4.5" stroke-linecap="round"/>
          <path d="M84 66 L64 72" stroke="#17040a" stroke-width="4.5" stroke-linecap="round"/>
        </g>
        <path d="M46 94 L52 89 L58 94 L64 89 L70 94" stroke="#17040a" stroke-width="4" fill="none" stroke-linecap="round"/>
      </g>

      <g class="mood mood-sad">
        <g class="m-eyes">
          <path d="M39 74 a8 8 0 0 1 16 0Z" fill="#fff"/>
          <path d="M65 74 a8 8 0 0 1 16 0Z" fill="#fff"/>
          <circle cx="47" cy="74" r="3.4" fill="#17040a"/>
          <circle cx="73" cy="74" r="3.4" fill="#17040a"/>
          <path d="M80 80 q4 8 -2 10 q-6 1 -3 -10Z" fill="#f6f2f1"/>
        </g>
        <path d="M48 98 Q60 88 72 98" stroke="#17040a" stroke-width="4" fill="none" stroke-linecap="round"/>
      </g>

      <g class="mood mood-wink">
        <g class="m-eyes">
          <path d="M39 74 q8 -8 16 0" stroke="#17040a" stroke-width="4" fill="none" stroke-linecap="round"/>
          <ellipse cx="73" cy="74" rx="8.5" ry="10" fill="#fff"/>
          <circle cx="74.5" cy="76" r="4.2" fill="#17040a"/>
        </g>
        <path d="M50 90 Q62 100 74 88" stroke="#17040a" stroke-width="4" fill="none" stroke-linecap="round"/>
      </g>

      <g class="mood mood-sleepy">
        <g class="m-eyes">
          <path d="M39 76 q8 6 16 0" stroke="#17040a" stroke-width="4" fill="none" stroke-linecap="round"/>
          <path d="M65 76 q8 6 16 0" stroke="#17040a" stroke-width="4" fill="none" stroke-linecap="round"/>
        </g>
        <ellipse cx="60" cy="94" rx="6" ry="7" fill="#17040a"/>
        <text x="86" y="56" font-size="16" font-weight="900" fill="#fff" opacity=".7">z</text>
      </g>

      <g class="mood mood-shock">
        <g class="m-eyes">
          <ellipse cx="47" cy="73" rx="10" ry="12" fill="#fff"/>
          <ellipse cx="73" cy="73" rx="10" ry="12" fill="#fff"/>
          <circle cx="47" cy="74" r="3.2" fill="#17040a"/>
          <circle cx="73" cy="74" r="3.2" fill="#17040a"/>
        </g>
        <ellipse cx="60" cy="95" rx="7" ry="9" fill="#17040a"/>
      </g>
    </g>
  </g>`
}

/* ---------- FÓSFORO: o palito ---------- */
function fosforo(gid) {
  return `
  <g class="m-body">
    <g class="m-legs">
      <path d="M50 128 L46 146" stroke="#b6a7a2" stroke-width="7" stroke-linecap="round"/>
      <path d="M70 128 L74 146" stroke="#b6a7a2" stroke-width="7" stroke-linecap="round"/>
    </g>
    <rect x="46" y="52" width="28" height="80" rx="13" fill="url(#${gid}-w)" stroke="#17040a" stroke-opacity=".25" stroke-width="1.6"/>
    <g class="m-arms">
      <path class="m-arm-l" d="M46 84 C32 82 26 72 30 64" stroke="#b6a7a2" stroke-width="6" fill="none" stroke-linecap="round"/>
      <path class="m-arm-r" d="M74 84 C88 82 94 72 90 64" stroke="#b6a7a2" stroke-width="6" fill="none" stroke-linecap="round"/>
    </g>
    <g class="m-head">
      <ellipse cx="60" cy="40" rx="27" ry="30" fill="url(#${gid}-h)" stroke="#e6cd84" stroke-opacity=".22" stroke-width="1.6"/>
      <path class="m-flame-tip" d="M60 2 C70 16 76 22 74 32 C72 42 66 44 60 44 C54 44 48 42 46 32 C44 22 50 16 60 2Z" fill="url(#${gid}-t)" opacity=".95"/>
    </g>
    <g class="m-face">
      <ellipse class="mood-blush" cx="43" cy="48" rx="7" ry="4" fill="#a82747" opacity=".5"/>
      <ellipse class="mood-blush" cx="77" cy="48" rx="7" ry="4" fill="#a82747" opacity=".5"/>

      <g class="mood mood-happy">
        <g class="m-eyes">
          <ellipse cx="50" cy="38" rx="7.5" ry="9" fill="#fff"/>
          <ellipse cx="70" cy="38" rx="7.5" ry="9" fill="#fff"/>
          <circle cx="51" cy="40" r="3.8" fill="#17040a"/>
          <circle cx="71" cy="40" r="3.8" fill="#17040a"/>
        </g>
        <path d="M48 52 Q60 63 72 52 Q60 58 48 52Z" fill="#17040a"/>
      </g>

      <g class="mood mood-love">
        <g class="m-eyes">
          <path d="M50 33 c-6-7-14 1-8 8 l8 9 8-9 c6-7-2-15-8-8Z" fill="#8c1c39"/>
          <path d="M70 33 c-6-7-14 1-8 8 l8 9 8-9 c6-7-2-15-8-8Z" fill="#8c1c39"/>
        </g>
        <path d="M47 50 Q60 65 73 50 Q60 57 47 50Z" fill="#17040a"/>
      </g>

      <g class="mood mood-angry">
        <g class="m-eyes">
          <ellipse cx="50" cy="40" rx="7" ry="6" fill="#fff"/>
          <ellipse cx="70" cy="40" rx="7" ry="6" fill="#fff"/>
          <circle cx="51" cy="41" r="3.4" fill="#17040a"/>
          <circle cx="71" cy="41" r="3.4" fill="#17040a"/>
          <path d="M40 30 L58 36" stroke="#17040a" stroke-width="4.2" stroke-linecap="round"/>
          <path d="M80 30 L62 36" stroke="#17040a" stroke-width="4.2" stroke-linecap="round"/>
        </g>
        <path d="M46 56 L52 51 L58 56 L64 51 L70 56" stroke="#17040a" stroke-width="3.8" fill="none" stroke-linecap="round"/>
      </g>

      <g class="mood mood-sad">
        <g class="m-eyes">
          <path d="M43 38 a7.5 7.5 0 0 1 15 0Z" fill="#fff"/>
          <path d="M62 38 a7.5 7.5 0 0 1 15 0Z" fill="#fff"/>
          <circle cx="50" cy="38" r="3.2" fill="#17040a"/>
          <circle cx="70" cy="38" r="3.2" fill="#17040a"/>
          <path d="M76 44 q4 8 -2 10 q-6 1 -3 -10Z" fill="#f6f2f1"/>
        </g>
        <path d="M48 60 Q60 50 72 60" stroke="#17040a" stroke-width="3.8" fill="none" stroke-linecap="round"/>
      </g>

      <g class="mood mood-wink">
        <g class="m-eyes">
          <path d="M43 38 q7.5 -8 15 0" stroke="#17040a" stroke-width="3.8" fill="none" stroke-linecap="round"/>
          <ellipse cx="70" cy="38" rx="7.5" ry="9" fill="#fff"/>
          <circle cx="71" cy="40" r="3.8" fill="#17040a"/>
        </g>
        <path d="M50 52 Q62 62 74 50" stroke="#17040a" stroke-width="3.8" fill="none" stroke-linecap="round"/>
      </g>

      <g class="mood mood-sleepy">
        <g class="m-eyes">
          <path d="M43 40 q7.5 6 15 0" stroke="#17040a" stroke-width="3.8" fill="none" stroke-linecap="round"/>
          <path d="M62 40 q7.5 6 15 0" stroke="#17040a" stroke-width="3.8" fill="none" stroke-linecap="round"/>
        </g>
        <ellipse cx="60" cy="56" rx="5.5" ry="6.5" fill="#17040a"/>
        <text x="82" y="24" font-size="15" font-weight="900" fill="#fff" opacity=".7">z</text>
      </g>

      <g class="mood mood-shock">
        <g class="m-eyes">
          <ellipse cx="50" cy="37" rx="9" ry="11" fill="#fff"/>
          <ellipse cx="70" cy="37" rx="9" ry="11" fill="#fff"/>
          <circle cx="50" cy="38" r="3" fill="#17040a"/>
          <circle cx="70" cy="38" r="3" fill="#17040a"/>
        </g>
        <ellipse cx="60" cy="57" rx="6.5" ry="8" fill="#17040a"/>
      </g>
    </g>
  </g>`
}

function defs(gid) {
  return `
  <defs>
    <radialGradient id="${gid}-f" cx="50%" cy="68%" r="62%">
      <stop offset="0%" stop-color="#e6cd84"/>
      <stop offset="52%" stop-color="#a82747"/>
      <stop offset="100%" stop-color="#55111f"/>
    </radialGradient>
    <linearGradient id="${gid}-w" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f6f2f1"/>
      <stop offset="100%" stop-color="#c3b7b4"/>
    </linearGradient>
    <radialGradient id="${gid}-h" cx="45%" cy="35%" r="70%">
      <stop offset="0%" stop-color="#a82747"/>
      <stop offset="100%" stop-color="#3b0c18"/>
    </radialGradient>
    <radialGradient id="${gid}-t" cx="50%" cy="70%" r="60%">
      <stop offset="0%" stop-color="#f3e2ac"/>
      <stop offset="55%" stop-color="#c9a227"/>
      <stop offset="100%" stop-color="#8c1c39"/>
    </radialGradient>
  </defs>`
}

/**
 * Cria o elemento do mascote.
 * @param {'chispa'|'fosforo'} kind
 * @param {string} mood
 * @param {object} opts { anim: 'idle'|'happy'|'angry'|'wave'|'sad', cls }
 */
export function mascot(kind = 'chispa', mood = 'happy', opts = {}) {
  const gid = `m${svgSeq++}`
  const box = kind === 'fosforo' ? '0 0 120 152' : '0 0 120 128'
  const node = el('div', {
    class: `mascot ${opts.anim ?? 'idle'} ${opts.cls ?? ''}`.trim(),
    'data-kind': kind,
    'data-mood': MOODS.includes(mood) ? mood : 'happy',
    html: `<svg viewBox="${box}" xmlns="http://www.w3.org/2000/svg">${defs(gid)}${
      kind === 'fosforo' ? fosforo(gid) : chispa(gid)
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
  chispa: { name: 'Chispa', em: 'flame', color: '#c4506a' },
  fosforo: { name: 'Fósforo', em: 'match', color: '#c9a227' },
}

export const LINES = {
  greet: [
    'Finalmente vocês abriram o app! Eu já estava apagando aqui.',
    'Boa noite, casal. A casa tá fria demais, bora mudar isso.',
    'Olha quem voltou! Fósforo apostou que vocês iam esquecer.',
    'Um dia sem desafio é um dia desperdiçado. Bora?',
    'Eu sou a Chispa. Ele é o Fósforo. Vocês são a desculpa da nossa existência.',
  ],
  nudge: [
    'Psiu… a fase de hoje ainda tá aí. Ela não se completa sozinha.',
    'Vou contar um segredo: casais que jogam todo dia brigam menos. Eu inventei isso, mas é verdade.',
    'Falta 1 fase pra hoje ficar perfeito. 1. Só 1.',
    'Vocês têm {streak} dias de ofensiva. Perder isso dói mais do que parece.',
    'Eu e o Fósforo apostamos quanto tempo vocês iam demorar. Eu perdi. Façam valer a aposta.',
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
    'Fósforo tá chorando de emoção. Ele nega, mas tá.',
    'Mais um dia, mais uma história pra contar pros netos (ou não).',
  ],
  scold: [
    'Pularam? Tá bom… mas a vela apagou um pouquinho aqui.',
    'Anotado no meu caderninho de chama. Brincadeira. Mais ou menos.',
    'Sem drama, amanhã tem outra. Mas amanhã mesmo, hein.',
    'Eu avisei o Fósforo que vocês iam pular. Ele não acreditou em mim.',
  ],
  broke: [
    'A ofensiva caiu. Respira. Amanhã a gente começa outra e vai mais longe.',
    'Quebrou… mas quebrou com estilo. Bora reconstruir hoje?',
    'Eu usei meu último congelador pra tentar salvar. Não deu. Culpa de vocês.',
  ],
  taunt: [
    'Vai com calma, palito, você apaga no primeiro sopro.',
    'Você é literalmente um pedaço de madeira com complexo.',
    'Chispa, você é dramática. E quente demais. Não dá pra conversar.',
    'Eu risco, você queima. Sem mim você não existe, chama.',
    'Sem mim você é só um palito na gaveta, Fósforo.',
  ],
  duelWin: ['Vitória da Chispa! Alguém me deve uma vela nova.', 'Fósforo venceu… e vai ficar insuportável por uma semana.'],
  idle: [
    'Tô só observando vocês dois. Continua.',
    'Sabia que 70% da rotina morre no sofá? Eu inventei esse número agora.',
    'Fósforo, para de olhar o celular dela. É o seu próprio celular.',
    'Casal que joga junto… fica junto. Óbvio, né? Fui eu que escrevi.',
  ],
  levelUp: [
    'SUBIU DE NÍVEL! A casa inteira sentiu.',
    'Nível novo desbloqueado. Agora vocês são oficialmente perigosos.',
  ],
  empty: [
    'Vocês zeraram o dia! Voltem amanhã — ou comprem um passe na loja, seus apressados.',
    'Acabou por hoje. Fósforo tá deitado no sofá apagado. Literalmente.',
  ],
}

export function fillLine(text, vars = {}) {
  return text.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? `{${k}}`)
}

/* ---------- brigas / cutscenes ---------- */
export const SCENES = {
  intro: [
    { who: 'chispa', mood: 'happy', text: 'Oi! Eu sou a Chispa. Sou a faísca que sobra quando vocês dois se olham.' },
    { who: 'fosforo', mood: 'wink', text: 'E eu sou o Fósforo. Sem mim, ela é só calor sem fogo.' },
    { who: 'chispa', mood: 'angry', text: 'Como assim SEM VOCÊ? Eu queimo sozinha desde sempre.' },
    { who: 'fosforo', mood: 'angry', text: 'Sozinha você dura dois segundos. Literalmente. Eu cronometrei.' },
    { who: 'chispa', mood: 'happy', text: 'Enfim… vocês. A regra é simples: todo dia tem um desafio novo nas 4 paredes.' },
    { who: 'fosforo', mood: 'happy', text: 'Se vocês pularem um dia, a ofensiva apaga. E a gente briga. De novo.' },
    { who: 'chispa', mood: 'love', text: 'Bora acender isso aqui?' },
  ],
  afterBoss: [
    { who: 'chispa', mood: 'shock', text: 'Vocês viram aquilo?! Foi golpe baixo!' },
    { who: 'fosforo', mood: 'angry', text: 'Golpe baixo foi você usar o vento a seu favor, chama.' },
    { who: 'chispa', mood: 'wink', text: 'Isso se chama estratégia. Aprende, madeira.' },
    { who: 'fosforo', mood: 'happy', text: 'Tá bom, tá bom. Próxima temporada a gente resolve. Com vocês de juízes.' },
  ],
  streakLost: [
    { who: 'fosforo', mood: 'sad', text: 'Apagou. Eu falei que ia apagar.' },
    { who: 'chispa', mood: 'angry', text: 'VOCÊ falou?! Eu que avisei três vezes ontem à noite!' },
    { who: 'fosforo', mood: 'angry', text: 'Avisou nada. Você tava ocupada brilhando.' },
    { who: 'chispa', mood: 'sad', text: '…tá. Vamos reconstruir. Um dia de cada vez, casal.' },
  ],
  noPlay: [
    { who: 'chispa', mood: 'sad', text: 'Hoje ninguém jogou. A casa ficou fria.' },
    { who: 'fosforo', mood: 'sad', text: 'Eu até risquei uma vela pra vocês. Nada.' },
    { who: 'chispa', mood: 'happy', text: 'Mas ainda dá tempo. A fase de hoje tá esperando, olha ela ali pulsando.' },
  ],
  marathon: [
    { who: 'fosforo', mood: 'shock', text: 'Vocês ligaram o modo maratona?! Isso é trapaça!' },
    { who: 'chispa', mood: 'love', text: 'Isso é ENTUSIASMO, palito. Deixa eles.' },
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
  const right = mascot('fosforo', 'happy', { anim: 'idle' })
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
