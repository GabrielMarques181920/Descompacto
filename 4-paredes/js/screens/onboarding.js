/* ============================================================
   ONBOARDING — idade, casal, intensidade, lembrete, boas-vindas
   ============================================================ */
import { LEVELS } from '../content.js'
import { S, save, rollQuests } from '../state.js'
import { el, todayKey } from '../util.js'
import { go } from '../router.js'
import { hideChrome, toast } from '../ui.js'
import { mascot, playCutscene, SCENES, setMood } from '../mascots.js'
import { sfx, setSound } from '../audio.js'
import { confetti } from '../fx.js'
import { nextReminderLabel, notify, requestPermission, scheduleDaily } from '../notify.js'
import { icon } from '../icons.js'

export function renderOnboarding(host) {
  hideChrome()
  let step = 0
  const wrap = el('div', { class: 'onb' })
  host.append(wrap)

  const progress = el('div', { class: 'progress', style: { width: '100%' } }, [el('i', { style: { width: '0%' } })])
  host.prepend(progress)

  const steps = [ageGate, names, intensity, reminder, ready]

  function paintStep() {
    wrap.innerHTML = ''
    wrap.className = 'onb screen-anim'
    progress.firstElementChild.style.width = `${((step + 1) / steps.length) * 100}%`
    steps[step](wrap)
    host.scrollTop = 0
  }

  function next() {
    sfx.select()
    step = Math.min(steps.length - 1, step + 1)
    paintStep()
  }
  function back() {
    sfx.tap()
    step = Math.max(0, step - 1)
    paintStep()
  }

  /* ---------- 1. idade ---------- */
  function ageGate(box) {
    const duo = el('div', { class: 'duo-stage' })
    duo.append(mascot('chispa', 'happy', { anim: 'wave', cls: 'pop-a' }), mascot('fosforo', 'wink', { anim: 'idle', cls: 'flip pop-b' }))
    box.append(
      el('div', { class: 'onb-hero' }, [
        el('div', { class: 'logo-mark crest', html: icon('flame', 46) }),
        el('h1', { class: 'onb-title wordmark', text: '4 Paredes' }),
      ]),
      duo,
    )
    const card = el('div', { class: 'card age-gate' })
    card.innerHTML = `
      <h2 style="margin-bottom:8px">Antes de acender a luz</h2>
      <p class="muted" style="font-size:13.5px">
        Este é um jogo <strong>para maiores de 18 anos</strong>, feito para um casal que se ama e combina as coisas antes.
        Tem desafio fofo, tem desafio picante e tem desafio quente — vocês escolhem até onde vão.
      </p>
      <p class="tiny muted" style="margin-top:10px">
        Nada aqui é obrigatório. Tudo pode ser pulado com um curinga, e a palavra de segurança de vocês vale mais que qualquer fase.
      </p>`
    box.append(card)

    const ok = el('button', { class: 'btn', text: 'Temos 18+ e vamos jogar' })
    ok.innerHTML = '<span class="shine"></span>' + ok.textContent
    ok.onclick = next
    const no = el('button', { class: 'btn ghost', text: 'Ainda não' })
    no.onclick = () => {
      sfx.wrong()
      toast('Sem problema. Voltem quando fizer sentido para vocês.', '', 3000, 'moon')
    }
    box.append(ok, no)
  }

  /* ---------- 2. nomes ---------- */
  function names(box) {
    box.append(
      el('h1', { text: 'Quem são vocês?' }),
      el('p', { class: 'muted', text: 'Os nomes aparecem nos duelos, no quiz e na liga. Podem mudar depois.' }),
    )
    const card = el('div', { class: 'card col' })
    const f1 = el('div', { class: 'field' })
    f1.append(el('label', { text: 'Pessoa 1' }))
    const i1 = el('input', { class: 'input', placeholder: 'Seu nome ou apelido', maxlength: '14', value: S.couple.p1 === 'Você' ? '' : S.couple.p1 })
    f1.append(i1)
    const f2 = el('div', { class: 'field' })
    f2.append(el('label', { text: 'Pessoa 2' }))
    const i2 = el('input', { class: 'input', placeholder: 'Nome ou apelido', maxlength: '14', value: S.couple.p2 === 'Amor' ? '' : S.couple.p2 })
    f2.append(i2)
    card.append(f1, f2)

    const duo = el('div', { class: 'duo-stage', style: { margin: '10px 0' } })
    const m1 = mascot('chispa', 'happy', { anim: 'idle' })
    const m2 = mascot('fosforo', 'love', { anim: 'idle', cls: 'flip' })
    duo.append(m1, m2)
    card.append(duo)

    const emojiRow = el('div', { class: 'row wrap', style: { gap: '6px', justifyContent: 'center' } })
    for (const e of ['couple', 'heart', 'flame', 'ring', 'cherry', 'glasses', 'heartHands', 'pepper']) {
      const b = el('button', {
        class: `pill ${S.couple.emoji === e ? 'hot' : ''}`,
        html: icon(e, 16),
        style: { cursor: 'pointer', padding: '8px' },
        'aria-label': `símbolo ${e}`,
      })
      b.onclick = () => {
        S.couple.emoji = e
        sfx.tap()
        ;[...emojiRow.children].forEach((c) => c.classList.remove('hot'))
        b.classList.add('hot')
      }
      emojiRow.append(b)
    }
    card.append(el('label', { class: 'tiny muted', text: 'símbolo do casal' }), emojiRow)
    box.append(card)

    const row = el('div', { class: 'row', style: { gap: '8px' } })
    const b = el('button', { class: 'btn ghost grow', html: icon('chevronLeft', 16), 'aria-label': 'voltar' })
    b.onclick = back
    const n = el('button', { class: 'btn grow', text: 'Continuar' })
    n.onclick = () => {
      S.couple.p1 = (i1.value || '').trim() || 'Você'
      S.couple.p2 = (i2.value || '').trim() || 'Amor'
      save()
      setMood(m1, 'love', 'happy')
      next()
    }
    row.append(b, n)
    box.append(row)
  }

  /* ---------- 3. intensidade ---------- */
  function intensity(box) {
    box.append(
      el('h1', { text: 'Até onde vocês vão?' }),
      el('p', { class: 'muted', text: 'O jogo adapta os desafios. Dá para mudar quando quiserem no Ninho.' }),
    )
    const seg = el('div', { class: 'col', style: { gap: '10px' } })
    for (const [k, v] of Object.entries(LEVELS)) {
      const b = el('button', { class: `choice ${Number(k) === S.prefs.intensity ? 'on' : ''}` })
      b.innerHTML = `<span class="c-em">${icon(v.em, 22)}</span><span class="grow">
        <strong style="font-size:15px">${v.name}</strong>
        <p class="tiny muted" style="margin-top:2px">${v.desc}</p></span>`
      b.onclick = () => {
        S.prefs.intensity = Number(k)
        sfx.select()
        ;[...seg.children].forEach((c) => c.classList.remove('on'))
        b.classList.add('on')
      }
      seg.append(b)
    }
    box.append(seg)

    const safe = el('div', { class: 'card tight', style: { marginTop: '12px' } })
    safe.append(el('p', { class: 'tiny muted', text: 'Palavra de segurança: se alguém disser, tudo para na hora, sem discussão.' }))
    const f = el('div', { class: 'field', style: { marginTop: '8px' } })
    f.append(el('label', { text: 'a palavra de vocês' }))
    const input = el('input', { class: 'input', value: S.prefs.safeword, placeholder: 'ex: geladeira' })
    input.oninput = () => {
      S.prefs.safeword = input.value
      save()
    }
    f.append(input)
    safe.append(f)
    box.append(safe)

    const row = el('div', { class: 'row', style: { gap: '8px' } })
    const b = el('button', { class: 'btn ghost grow', html: icon('chevronLeft', 16), 'aria-label': 'voltar' })
    b.onclick = back
    const n = el('button', { class: 'btn grow', text: 'Continuar' })
    n.onclick = () => {
      save()
      next()
    }
    row.append(b, n)
    box.append(row)
  }

  /* ---------- 4. lembrete ---------- */
  function reminder(box) {
    box.append(
      el('h1', { text: 'A Chispa chama vocês' }),
      el('p', { class: 'muted', text: 'O segredo do jogo é a constância. Um lembrete por dia resolve.' }),
    )
    const card = el('div', { class: 'card col' })
    const m = mascot('chispa', 'wink', { anim: 'wave' })
    m.style.alignSelf = 'center'
    card.append(m)

    const row = el('div', { class: 'toggle on' })
    row.innerHTML = `<span><strong style="font-size:13.5px">${icon('bell', 17)} Lembrete diário</strong>
      <p class="tiny muted">notificação no celular às <span id="rem-time">${nextReminderLabel()}</span></p></span><span class="sw"></span>`
    row.onclick = async () => {
      const turningOn = !row.classList.contains('on')
      if (turningOn) {
        const perm = await requestPermission()
        if (perm !== 'granted') {
          row.classList.remove('on')
          S.prefs.notify = false
          save()
          toast('Sem permissão aqui — mas a Chispa chama vocês dentro do app mesmo.', 'warn', 3200, 'bellOff')
          return
        }
        S.prefs.notify = true
        save()
        scheduleDaily()
        notify('4 Paredes', `Combinado: todo dia às ${nextReminderLabel()} eu chamo vocês dois.`)
      } else {
        S.prefs.notify = false
        save()
      }
      row.classList.toggle('on', S.prefs.notify)
      sfx.tap()
    }
    card.append(row)

    const time = el('div', { class: 'field' })
    time.append(el('label', { text: 'horário' }))
    const t = el('input', { class: 'input', type: 'time', value: '21:00' })
    t.onchange = () => {
      const [h, mi] = t.value.split(':').map(Number)
      S.prefs.notifyHour = Number.isFinite(h) ? h : 21
      S.prefs.notifyMin = Number.isFinite(mi) ? mi : 0
      save()
      scheduleDaily()
      const label = box.querySelector('#rem-time')
      if (label) label.textContent = nextReminderLabel()
    }
    time.append(t)
    card.append(time)

    const sound = el('div', { class: 'toggle on' })
    sound.innerHTML = `<span><strong style="font-size:13.5px">${icon('soundOn', 17)} Sons do jogo</strong>
      <p class="tiny muted">bipes, moedas e a trilha dos duelos</p></span><span class="sw"></span>`
    sound.onclick = () => {
      const on = !sound.classList.contains('on')
      sound.classList.toggle('on', on)
      S.prefs.sound = on
      setSound(on)
      save()
      if (on) sfx.select()
    }
    card.append(sound)
    box.append(card)

    const rowBtn = el('div', { class: 'row', style: { gap: '8px' } })
    const b = el('button', { class: 'btn ghost grow', html: icon('chevronLeft', 16), 'aria-label': 'voltar' })
    b.onclick = back
    const n = el('button', { class: 'btn grow', text: 'Quase lá' })
    n.onclick = next
    rowBtn.append(b, n)
    box.append(rowBtn)
  }

  /* ---------- 5. pronto ---------- */
  function ready(box) {
    const duo = el('div', { class: 'duo-stage' })
    duo.append(mascot('chispa', 'love', { anim: 'happy', cls: 'pop-a' }), mascot('fosforo', 'happy', { anim: 'happy', cls: 'flip pop-b' }))
    box.append(
      el('div', { class: 'onb-hero' }, [
        el('div', { class: 'logo-mark crest', html: icon('flame', 46) }),
        el('h1', { class: 'onb-title wordmark', text: 'Tudo pronto' }),
        el('p', {
          class: 'muted',
          html: `${S.couple.p1} & ${S.couple.p2} · ${icon(LEVELS[S.prefs.intensity].em, 14)} ${LEVELS[S.prefs.intensity].name}`,
        }),
      ]),
      duo,
    )

    const card = el('div', { class: 'card' })
    card.innerHTML = `
      <h2 style="margin-bottom:10px">Como funciona</h2>
      <p class="muted" style="font-size:13.5px">
        <strong>1 fase nova por dia.</strong> 8 temporadas, 56 fases: do reencontro ao fogo alto.<br/><br/>
        <strong>Ofensiva.</strong> Joguem todo dia para manter a chama. Perdeu um dia, ela apaga (mas dá para congelar).<br/><br/>
        <strong>Mini-jogos.</strong> Roleta, dados, baralho, quiz, cronômetro e o duelo dos mascotes — liberados a qualquer hora.<br/><br/>
        <strong>Mascotes.</strong> Chispa e Fósforo brigam entre fases, provocam e chamam vocês de volta.
      </p>`
    box.append(card)

    const go2 = el('button', { class: 'btn', html: `${icon('flame', 16)}<span>Conhecer os mascotes</span>` })
    go2.insertAdjacentHTML('afterbegin', '<span class="shine"></span>')
    go2.onclick = () => {
      S.onboarded = true
      S.startDate = todayKey()
      rollQuests()
      save()
      confetti()
      sfx.levelUp()
      playCutscene(SCENES.intro, { onDone: () => go('#/trilha') })
    }
    const skip = el('button', { class: 'btn ghost', text: 'Ir direto para a trilha' })
    skip.onclick = () => {
      S.onboarded = true
      S.startDate = todayKey()
      rollQuests()
      save()
      go('#/trilha')
    }
    box.append(go2, skip)
  }

  paintStep()
}
