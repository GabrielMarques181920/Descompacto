/* trilha sonora sintetizada (sem arquivos) — bips fofos estilo Duolingo */
let ctx = null
let enabled = true

function ac() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return null
    ctx = new AC()
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {})
  return ctx
}

export function setSound(on) {
  enabled = !!on
}
export const soundOn = () => enabled

function tone({ freq = 440, dur = 0.12, type = 'sine', gain = 0.06, at = 0, slide = 0 }) {
  if (!enabled) return
  const a = ac()
  if (!a) return
  const t0 = a.currentTime + at
  const osc = a.createOscillator()
  const g = a.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t0)
  if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), t0 + dur)
  g.gain.setValueAtTime(0.0001, t0)
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.012)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
  osc.connect(g).connect(a.destination)
  osc.start(t0)
  osc.stop(t0 + dur + 0.05)
}

function noise({ dur = 0.2, gain = 0.04, at = 0, hp = 800 }) {
  if (!enabled) return
  const a = ac()
  if (!a) return
  const t0 = a.currentTime + at
  const len = Math.floor(a.sampleRate * dur)
  const buf = a.createBuffer(1, len, a.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len)
  const src = a.createBufferSource()
  src.buffer = buf
  const filter = a.createBiquadFilter()
  filter.type = 'highpass'
  filter.frequency.value = hp
  const g = a.createGain()
  g.gain.value = gain
  src.connect(filter).connect(g).connect(a.destination)
  src.start(t0)
}

export const sfx = {
  tap: () => tone({ freq: 620, dur: 0.06, type: 'triangle', gain: 0.035 }),
  select: () => tone({ freq: 880, dur: 0.09, type: 'triangle', gain: 0.045, slide: 180 }),
  correct: () => {
    tone({ freq: 660, dur: 0.1, type: 'triangle', gain: 0.05 })
    tone({ freq: 880, dur: 0.12, type: 'triangle', gain: 0.05, at: 0.09 })
    tone({ freq: 1180, dur: 0.18, type: 'sine', gain: 0.045, at: 0.18 })
  },
  wrong: () => {
    tone({ freq: 240, dur: 0.18, type: 'sawtooth', gain: 0.035, slide: -110 })
    noise({ dur: 0.14, gain: 0.02, hp: 300 })
  },
  coin: () => {
    tone({ freq: 1200, dur: 0.07, type: 'square', gain: 0.03 })
    tone({ freq: 1750, dur: 0.12, type: 'square', gain: 0.028, at: 0.06 })
  },
  levelUp: () => {
    ;[523, 659, 784, 1046, 1318].forEach((f, i) =>
      tone({ freq: f, dur: 0.22, type: 'triangle', gain: 0.05, at: i * 0.085 }),
    )
  },
  whoosh: () => noise({ dur: 0.32, gain: 0.035, hp: 500 }),
  spin: () => {
    for (let i = 0; i < 12; i++) tone({ freq: 900 - i * 30, dur: 0.04, type: 'square', gain: 0.014, at: i * 0.09 })
  },
  hit: () => {
    noise({ dur: 0.09, gain: 0.05, hp: 1200 })
    tone({ freq: 180, dur: 0.1, type: 'square', gain: 0.03, slide: -80 })
  },
  kiss: () => {
    tone({ freq: 1300, dur: 0.06, type: 'sine', gain: 0.04 })
    tone({ freq: 900, dur: 0.1, type: 'sine', gain: 0.035, at: 0.07 })
  },
  win: () => {
    ;[392, 523, 659, 784, 1046].forEach((f, i) =>
      tone({ freq: f, dur: 0.3, type: 'sine', gain: 0.05, at: i * 0.11 }),
    )
    noise({ dur: 0.5, gain: 0.02, at: 0.4 })
  },
  lose: () => {
    ;[440, 349, 262].forEach((f, i) => tone({ freq: f, dur: 0.28, type: 'triangle', gain: 0.045, at: i * 0.14 }))
  },
  alarm: () => {
    tone({ freq: 880, dur: 0.14, type: 'square', gain: 0.035 })
    tone({ freq: 880, dur: 0.14, type: 'square', gain: 0.035, at: 0.22 })
  },
  tick: () => tone({ freq: 1500, dur: 0.03, type: 'square', gain: 0.012 }),
}

/** destrava o áudio no primeiro toque (exigência dos navegadores) */
export function unlockAudio() {
  ac()
  window.removeEventListener('pointerdown', unlockAudio)
}
window.addEventListener('pointerdown', unlockAudio, { once: true })
