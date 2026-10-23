/* efeitos: confete de corações/chamas, tremor, bolhas, pop de XP */
import { qs } from './util.js'
import { icon } from './icons.js'

const canvas = qs('#fx')
const ctx = canvas.getContext('2d')
let parts = []
let raf = null
let dpr = 1

function resize() {
  dpr = Math.min(window.devicePixelRatio || 1, 2)
  canvas.width = Math.floor(window.innerWidth * dpr)
  canvas.height = Math.floor(window.innerHeight * dpr)
  canvas.style.width = `${window.innerWidth}px`
  canvas.style.height = `${window.innerHeight}px`
}
resize()
window.addEventListener('resize', resize)

const SHAPES = ['heart', 'flame', 'spark', 'ring', 'petal']

function makeParticle(x, y, opts = {}) {
  const {
    count = 30,
    spread = Math.PI * 2,
    speed = [4, 12],
    dir = -Math.PI / 2,
    gravity = 0.22,
    life = [60, 120],
    size = [7, 16],
    colors = ['#a82747', '#c4506a', '#c9a227', '#e6cd84', '#f6f2f1', '#70162a'],
    shapes = SHAPES,
    drag = 0.985,
  } = opts

  for (let i = 0; i < count; i++) {
    const angle = dir + (Math.random() - 0.5) * spread
    const v = speed[0] + Math.random() * (speed[1] - speed[0])
    parts.push({
      x: x * dpr,
      y: y * dpr,
      vx: Math.cos(angle) * v * dpr,
      vy: Math.sin(angle) * v * dpr,
      g: gravity * dpr,
      drag,
      life: life[0] + Math.random() * (life[1] - life[0]),
      age: 0,
      size: (size[0] + Math.random() * (size[1] - size[0])) * dpr,
      color: colors[Math.floor(Math.random() * colors.length)],
      shape: shapes[Math.floor(Math.random() * shapes.length)],
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.3,
    })
  }
  if (!raf) loop()
}

function drawHeart(c, s) {
  c.beginPath()
  const t = s / 16
  c.moveTo(0, 5 * t)
  c.bezierCurveTo(0, -2 * t, -9 * t, -3 * t, -9 * t, 3 * t)
  c.bezierCurveTo(-9 * t, 9 * t, 0, 12 * t, 0, 16 * t)
  c.bezierCurveTo(0, 12 * t, 9 * t, 9 * t, 9 * t, 3 * t)
  c.bezierCurveTo(9 * t, -3 * t, 0, -2 * t, 0, 5 * t)
  c.fill()
}

function drawFlame(c, s) {
  c.beginPath()
  const t = s / 16
  c.moveTo(0, -10 * t)
  c.bezierCurveTo(7 * t, -2 * t, 8 * t, 6 * t, 0, 10 * t)
  c.bezierCurveTo(-8 * t, 6 * t, -7 * t, -2 * t, 0, -10 * t)
  c.fill()
}

function drawPetal(c, s) {
  c.beginPath()
  c.ellipse(0, 0, s * 0.35, s * 0.75, 0, 0, Math.PI * 2)
  c.fill()
}

function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  for (const p of parts) {
    p.age++
    p.vx *= p.drag
    p.vy = p.vy * p.drag + p.g
    p.x += p.vx
    p.y += p.vy
    p.rot += p.vr
    const alpha = Math.max(0, 1 - p.age / p.life)
    ctx.save()
    ctx.globalAlpha = alpha
    ctx.translate(p.x, p.y)
    ctx.rotate(p.rot)
    ctx.fillStyle = p.color
    if (p.shape === 'heart') drawHeart(ctx, p.size)
    else if (p.shape === 'flame') drawFlame(ctx, p.size)
    else if (p.shape === 'ring') {
      ctx.strokeStyle = p.color
      ctx.lineWidth = 2 * dpr
      ctx.beginPath()
      ctx.arc(0, 0, p.size * 0.6, 0, Math.PI * 2)
      ctx.stroke()
    } else if (p.shape === 'petal') drawPetal(ctx, p.size)
    else {
      ctx.fillRect(-p.size / 4, -p.size / 4, p.size / 2, p.size / 2)
    }
    ctx.restore()
  }
  parts = parts.filter((p) => p.age < p.life && p.y < canvas.height + 80 * dpr)
  if (parts.length) {
    raf = requestAnimationFrame(loop)
  } else {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    raf = null
  }
}

/** explosão de festa no centro ou num ponto */
export function burst(x = window.innerWidth / 2, y = window.innerHeight / 2, opts = {}) {
  makeParticle(x, y, { count: 46, speed: [5, 15], ...opts })
}

export function confetti(opts = {}) {
  const w = window.innerWidth
  for (let i = 0; i < 4; i++) {
    makeParticle(rand_x(w), -20, {
      count: 26,
      dir: Math.PI / 2,
      spread: 0.9,
      speed: [3, 8],
      gravity: 0.14,
      life: [90, 170],
      ...opts,
    })
  }
  function rand_x(span) {
    return 30 + Math.random() * (span - 60)
  }
}

export function fireworks(n = 3) {
  let i = 0
  const tick = () => {
    burst(
      window.innerWidth * (0.2 + Math.random() * 0.6),
      window.innerHeight * (0.2 + Math.random() * 0.4),
      { count: 40, speed: [6, 16], life: [50, 110] },
    )
    if (++i < n) setTimeout(tick, 280)
  }
  tick()
}

/** coraçõezinhos subindo de um elemento */
const HEART_FX = ['heart', 'heartFill', 'sparkle', 'flameSmall', 'gem']
export function floatHearts(target, count = 6, emoji = null) {
  const rect = target.getBoundingClientRect()
  for (let i = 0; i < count; i++) {
    const node = document.createElement('span')
    node.className = 'float-hearts'
    node.innerHTML = icon(emoji ?? HEART_FX[Math.floor(Math.random() * HEART_FX.length)], 20)
    node.style.left = `${rect.left + rect.width / 2 + (Math.random() - 0.5) * rect.width * 0.8}px`
    node.style.top = `${rect.top + rect.height / 2}px`
    node.style.position = 'fixed'
    node.style.zIndex = '160'
    node.style.animationDelay = `${i * 70}ms`
    document.body.append(node)
    setTimeout(() => node.remove(), 1800 + i * 70)
  }
}

export function shake(node = document.querySelector('.app')) {
  node?.classList.remove('shake')
  void node?.offsetWidth
  node?.classList.add('shake')
  setTimeout(() => node?.classList.remove('shake'), 460)
}

/** +XP flutuante perto de um elemento */
export function xpPop(text, target) {
  const node = document.createElement('div')
  node.className = 'xp-pop'
  node.textContent = text
  const rect = target?.getBoundingClientRect?.()
  node.style.left = `${(rect?.left ?? window.innerWidth / 2) + (rect?.width ?? 0) / 2 - 30}px`
  node.style.top = `${(rect?.top ?? window.innerHeight / 2) - 10}px`
  document.body.append(node)
  setTimeout(() => node.remove(), 1200)
}

export function clearFx() {
  parts = []
  ctx.clearRect(0, 0, canvas.width, canvas.height)
}
