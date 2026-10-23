# 🔥 4 Paredes

**O jogo diário para casais não caírem na rotina.** Uma trilha estilo Duolingo com 8 temporadas,
56 fases diárias, 6 mini-jogos, dois mascotes animados que brigam entre si e uma chamada constante
para vocês voltarem a jogar.

> Conteúdo **18+**, pensado para um casal que combina tudo antes. Nada é obrigatório:
> cada desafio pode ser pulado com um curinga, cada temporada tem versão mais leve, e a
> palavra de segurança de vocês vale mais do que qualquer fase.

---

## Rodando

```bash
cd 4-paredes
npm start          # sobe em http://localhost:4321 (0.0.0.0)
```

Sem build, sem dependências de runtime: HTML + CSS + ES Modules servidos por um servidor
estático de ~70 linhas (`server.mjs`). Abra no celular ou no navegador — o layout é mobile-first.

```bash
npm run smoke      # 86 verificações de fluxo num DOM falso (jsdom)
npm run check      # análise estática de imports/exports
```

`jsdom` é a única dependência e existe só para os testes.

---

## Página de vendas (`/`)

A porta de entrada não é o jogo: é a página de vendas (`index.html`), que só então libera o
teste grátis. O jogo mora em **`/app.html`**.

```
/                → página de vendas (index.html + styles/landing.css + js/landing.js)
/app.html        → o jogo (casca, topbar, trilha, tabs)
/app.html?trial=1→ todos os CTAs da página de vendas caem aqui
```

Como a página funciona:

- **Copy de consciência** — a headline ("Não deixe seu relacionamento cair na rotina. /
  365 dias. 365 formas de manter a chama acesa.") abre para três incômodos ("A rotina não chega
  com uma briga…", "tem uma tela entre vocês há quantas noites?", "Rotina não é falta de amor.
  É falta de plano.") e para a pergunta que fecha a seção: *quando foi a última vez que vocês
  se escolheram?*
- **Prova em movimento** — Chispa & Gota aparecem no herói e no fechamento, e um ticker rola com
  títulos **reais** tirados de `js/content.js` (nada de texto inventado).
- **Oferta** — a **1ª fase é grátis** (sem cartão) e depois **R$ 19,90/mês** (card + FAQ).
  Os 3 depoimentos seguem **placeholder** (`<!-- SUBSTITUA -->`) até existirem casais reais.
- **Amostra grátis = 1 fase** — chegar com `?trial=1` grava `S.trialStart` (`state.js`) e o jogo
  avisa que a primeira fase está liberada. `trialInfo()` diz há quantos dias o lead chegou.
- Mesma identidade do jogo: vinho/preto/branco, dourado só em recompensa e no CTA da oferta,
  fonte do sistema, zero emoji, zero CDN.

---

## Paywall: só a 1ª fase é grátis (`js/paywall.js`)

Regra do funil: **o lead joga a fase 1 de graça e, a partir da segunda, precisa pagar**.

| Situação | O que acontece |
| --- | --- |
| Sem passe | `unlockedCount()` devolve `FREE_PHASES` (= 1). O modo maratona **não** fura o paywall. |
| Trilha | Fase 1 jogável; as outras 55 aparecem com cadeado. Ao concluir a 1ª, o cartão de hoje vira o **cartão do passe** (`paywallCard`). |
| Tocar numa fase bloqueada | Nudge da Chispa + modal de pagamento (`openPaywall`), nunca o "abre em X dias". |
| Link direto `#/fase/u1d3` | `renderLesson` barra, volta para a trilha e abre o pagamento. |
| Aba Jogos | Continua visível como **vitrine**: faixa do passe (`paywallBanner`), cadeado nos cards e qualquer toque abre o pagamento. |
| Aba Liga | `paywallPanel` no lugar da tabela. |
| Extras, relâmpago (sortear **e** concluir), noite surpresa | `requirePremium()` em cada clique — nada vaza XP grátis. |
| Zona de risco (perfil) | O atalho "Ganhar 100 brasas (teste)" só aparece com `?debug` na URL. |

**Cobrança** (o app é 100% estático, então o pagamento acontece fora):

```js
// js/paywall.js
export const PAY = {
  price: 'R$ 19,90',
  period: '/mês',
  checkoutUrl: '',            // ← COLE AQUI o link (Stripe, Mercado Pago, Hotmart, Kiwify…)
  codes: ['4PAREDES-CHAMA'],  // liberação manual depois de confirmar o pagamento
  paidParam: 'paid',          // volta do checkout: app.html?paid=1
  codeParam: 'code',          // ou: app.html?code=XXXX
}
```

- Com `checkoutUrl` preenchido, o CTA "Pagar e liberar tudo" abre o checkout em outra aba e o
  app orienta o lead a voltar e tocar em **"Já paguei"**.
- Duas formas de liberar: **volta do checkout** (`?paid=1` ou `?code=XXXX`, que o `checkUnlockFromUrl()`
  lê no boot) ou **código de acesso** digitado no modal (`validateCode()`).
- Pagou → `markPaid()` grava `S.paid`, `S.paidAt` e `S.payCode`; a trilha, os jogos, o diário e a
  liga abrem na hora, com confete. **Sem backend**: a confirmação real do pagamento depende do
  redirect do seu provedor ou do código que você enviar.
- Preços, textos e o que entra no passe ficam em `PAY`/`INCLUDED` — nada está espalhado pelas telas.
- Sem passe, nem truque de estado libera: maratona, dias passados, XP ou brasas não mudam
  `unlockedCount()` (verificado no smoke, seção 14).

---

## O jogo

### Trilha diária (o coração)
- **1 fase nova por dia**, liberada à meia-noite: 8 temporadas × 7 dias.
- Temporadas: 💞 O Reencontro → 🍳 Cozinha dos Pecados → 🎬 Cinema Proibido → 🎲 Noite de Jogos →
  🕯️ Spa a Dois → 🌆 Fora das 4 Paredes → 🎭 Fantasias & Segredos → 🔥 Fogo Alto.
- Tipos de fase: **desafio** (com ritual de clima + cronômetro), **jogo** (abre um mini-jogo),
  **baú** (recompensa) e **duelo** (chefe, no 7º dia de cada temporada).
- Caminho em zigue-zague com nós pulsando, mascote sentado na fase do dia, selo de "hoje!",
  fases travadas e banners de temporada que grudam no topo ao rolar.

### Progressão (loop de retenção)
| Sistema | Como funciona |
| --- | --- |
| **XP e nível** | Cada fase dá 20–200 XP; anel de nível no topo. |
| **Ofensiva** 🔥 | Jogou todo dia, a chama cresce. Perdeu, apaga. |
| **Congelador** 🧊 | Salva 1 dia perdido (comprado ou achado em baú). |
| **Brasas** ✨ | Moeda do jogo: loja, pulos e baús. |
| **Curingas** 🃏 | Pulam uma fase sem penalidade. |
| **Fôlego** 💗 | 5 corações; pular sem curinga custa 1. |
| **Missões diárias** | 3 por dia, com recompensa em brasas. |
| **Liga** 🏆 | 6 ligas semanais contra 9 casais simulados; top 3 sobe. |
| **Conquistas** 🏅 | 12 medalhas (ofensiva, picância, duelos, telepatia…). |
| **Diário do casal** 📔 | Toda fase concluída vira memória com nota de clima e texto livre. |

### Mini-jogos (aba Jogos, liberados a qualquer hora)
- 🎡 **Roleta do Desejo** — 4 baralhos de 12 setores (cozinha, sofá, cidade, final), roda de verdade.
- 🎲 **Dados** — 3 conjuntos: ação × lugar, ação × duração, personagem × cena.
- 🃏 **Baralho do Desejo** — 24 cartas (verdade, desafio, desejo, curinga, carinho) com virada 3D.
- 🧠 **Quem conhece quem?** — quiz em hot-seat: cada um responde sobre o outro e o jogo mede a sintonia.
- ⏱️ **Cronômetro do Toque** — 8 modos cronometrados com anel pulsante.
- ⚔️ **Duelo dos Mascotes** — cada pessoa defende um mascote numa zona de toque, com HP, golpes,
  provocações e confete no final.
- 🎰 **Noite surpresa** — sorteia entrada, prato principal e sobremesa de uma vez.
- ⚡ **Desafio relâmpago** — aparece do nada, vale XP extra.

### Mascotes: Chispa & Gota
- **Chispa** é o fogo (chama antropomórfica) e **Gota** é a água (personagem-gota): um casal de
  opostos que se provoca e se resolve. Ambos são SVG desenhado à mão, com
  7 humores (feliz, apaixonado, bravo, triste, piscada, sono, choque), piscada automática,
  língua de fogo tremulando, braços acenando e animações de pulo, flutuação e raiva.
- Eles **conversam** em balões, **brigam entre fases** (cutscenes de diálogo no onboarding,
  depois de cada chefe, quando a ofensiva cai e quando ninguém joga) e **provocam** durante os duelos.
- **Chamada constante**: a cada ~2,5 minutos sem fase cumprida, um mascote atravessa a tela
  andando com um balão de reclamação; à noite o aviso vira alerta de ofensiva; e, com permissão,
  sai notificação real do celular no horário escolhido (Service Worker em `sw.js`).

### Intensidade e consentimento
- Três níveis — 🌸 Suave, 🌶️ Picante, 🔥 Fogo Alto — definidos no onboarding e trocáveis no Ninho.
- Todo desafio nível 3 tem uma **versão mais leve** (`alt`) usada automaticamente quando o nível
  de vocês é menor; mini-jogos também filtram cartas, roletas e cronômetros pelo nível.
- **Palavra de segurança** cadastrada no perfil e **tags vetáveis** (`sexo`, `público`, `strip`…):
  se a fase do dia tiver algo vetado, o jogo avisa e oferece outro desafio no lugar.

---

## Identidade visual

- **Paleta:** vinho (`#8c1c39` e escalas), preto (`#0a090a`) e branco quente (`#f6f2f1`).
  O **dourado** (`#c9a227`) aparece só onde há recompensa: XP, brasas, liga e conquistas.
- **Iconografia própria:** nada de emoji do sistema. `js/icons.js` desenha 100+ ícones em SVG
  inline (traço único 24×24, `currentColor`), cobrindo fases, jogos, abas, chips, humores e
  recompensas. O mapa `EMOJI_ICON` também converte valores antigos salvos em `localStorage`,
  então um perfil criado antes do redesign continua renderizando ícones.
- **Tipografia:** apenas a pilha de fontes do sistema — nenhum download de fonte, nenhuma
  requisição externa. Títulos em peso 800/900 e micro-rótulos em caixa alta com tracking largo.
- **Mascotes:** Chispa (fogo) e Gota (água), um casal de opostos inspirado em adesivos de fogo e
  água. Cada um carrega a própria paleta de personagem (laranja/vermelho e azul/ciano), enquanto
  a interface permanece vinho/preto/branco; os 7 humores e as brigas entre fases continuam.
- **Ícone do app:** `assets/icon.svg` — as 4 paredes em branco com a chama vinho e ouro dentro.
- **Rostos do casal:** `assets/foguinho.png` (Chispa, 512 px, ~216 KB) e `assets/gotinha.png`
  (Gota, 512 px, ~324 KB) — retratos oficiais das mascotes no mesmo estilo (fundo vinho-preto,
  filete dourado), usados só onde a tela é estática e sempre em par: splash de boot
  (`.boot-duo .boot-face`), cartão de apresentação no onboarding (`.face-duo .chispa-face`) e topo
  do card de oferta da landing (`.offer-duo .offer-face`). Onde há movimento (trilha, cutscenes,
  paywall, herói da landing) continua o SVG animado de `mascots.js`.

---

## Estrutura

```
4-paredes/
├── index.html              # página de vendas (front door): copy, oferta e CTA do teste grátis
├── app.html                # casca do jogo: quarto de fundo, topbar, tela, tabs, camadas de fx/modal
├── server.mjs              # servidor estático (0.0.0.0:4321)
├── sw.js                   # Service Worker (notificações)
├── manifest.webmanifest    # instalável como PWA
├── assets/
│   └── icon.svg            # ícone do app (splash, favicon, PWA, notificações)
├── styles/
│   ├── landing.css         # página de vendas (hero, ticker, oferta, FAQ, reveal)
│   ├── mascots.css         # Chispa & Gota — compartilhado pela venda e pelo jogo
│   ├── app.css             # tokens de cor, topbar, tabs, botões, modal, fx
│   └── screens.css         # trilha, fase, jogos, duelo, liga, ninho, onboarding
├── js/
│   ├── landing.js          # página de vendas: mascotes, ticker, contadores, reveal
│   ├── main.js             # boot, rotas, teste grátis (?trial=1), loop de "chamada constante"
│   ├── router.js           # rotas por hash + limpeza de intervalos por tela
│   ├── state.js            # progresso, ofensiva, moedas, missões, liga, loja
│   ├── content.js          # 56 fases, 30 extras, roletas, dados, cartas, quiz, conquistas
│   ├── mascots.js          # SVG dos mascotes, falas, brigas e cutscenes
│   ├── games.js            # roleta, dados, cartas, quiz, cronômetro, duelo
│   ├── ui.js               # topbar, tabs, toasts, modais, sheets, nudge, celebrações
│   ├── icons.js            # registro de ícones SVG + mapa de migração de emoji
│   ├── fx.js               # confete de corações/chamas em canvas, tremor, +XP flutuante
│   ├── audio.js            # synth WebAudio (sem arquivos de som)
│   ├── notify.js           # permissão, agendamento e disparo de notificações
│   └── screens/            # onboarding, home (trilha), lesson (fase), hub, league, profile, extra
└── tools/
    ├── smoke.mjs           # 146 verificações de fluxo, CSS e identidade visual
    └── check-imports.mjs   # análise estática de imports
```

Estado persistido em `localStorage` (`quatro-paredes:v1`), com merge defensivo contra
estado antigo/corrompido. Dá para exportar o diário em JSON pelo Ninho.

---

## Notas

- Nenhum dado sai do aparelho: não há backend, analytics ou conta.
- Sons são sintetizados no WebAudio e os ícones são SVG inline: nenhum asset binário,
  nenhuma fonte baixada, nenhuma requisição para fora do aparelho.
- Os "outros casais" da liga são simulados localmente para dar sensação de disputa.
- Projeto independente dentro do repositório, sem acoplamento com o código do REA.
