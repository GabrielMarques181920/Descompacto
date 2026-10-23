/* ============================================================
   ÍCONES — iconografia SVG própria do 4 Paredes
   Traço único (24×24, currentColor), sem emoji do sistema.
   ============================================================ */

const S = 'fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"'
const F = 'fill="currentColor" stroke="none"'

export const ICONS = {
  /* ---------- núcleo do jogo ---------- */
  flame: `<path d="M12 2.6c3.6 4.1 6.2 6.5 6.2 9.9A6.2 6.2 0 0 1 5.8 12.5c0-3.4 2.6-5.8 6.2-9.9Z"/><path d="M12 9.4c1.5 1.8 2.5 2.7 2.5 4.2a2.5 2.5 0 1 1-5 0c0-1.5 1-2.4 2.5-4.2Z" ${F} opacity=".35"/>`,
  flameSmall: `<path d="M12 5c2.6 3 4.4 4.7 4.4 7.1A4.4 4.4 0 0 1 7.6 12.1C7.6 9.7 9.4 8 12 5Z"/>`,
  heart: `<path d="M12 20.2S4.2 15.4 4.2 10.4A4.3 4.3 0 0 1 12 7.9a4.3 4.3 0 0 1 7.8 2.5c0 5-7.8 9.8-7.8 9.8Z"/>`,
  heartFill: `<path d="M12 20.2S4.2 15.4 4.2 10.4A4.3 4.3 0 0 1 12 7.9a4.3 4.3 0 0 1 7.8 2.5c0 5-7.8 9.8-7.8 9.8Z" ${F}/>`,
  heartBroken: `<path d="M12 20.2S4.2 15.4 4.2 10.4A4.3 4.3 0 0 1 12 7.9a4.3 4.3 0 0 1 7.8 2.5c0 5-7.8 9.8-7.8 9.8Z"/><path d="M12 7.9 9.8 12l3.4 1.6L11 17.4"/>`,
  heartHands: `<path d="M12 20.2S5.6 16.2 5.6 12a3.6 3.6 0 0 1 6.4-2.1A3.6 3.6 0 0 1 18.4 12c0 4.2-6.4 8.2-6.4 8.2Z"/><path d="M3 13.5 5.6 12M21 13.5 18.4 12M3.6 17.4 6 15.6M20.4 17.4 18 15.6"/>`,
  sparkle: `<path d="M10.6 3.2 12 7.4l4.2 1.4-4.2 1.4-1.4 4.2-1.4-4.2L5 8.8 9.2 7.4Z"/><path d="M17.6 14.4l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8Z"/>`,
  bolt: `<path d="M13.4 2.4 5.6 13.2h4.6l-1.2 8.4 8.4-11.4h-5l1-7.8Z" ${F}/>`,
  swords: `<path d="M4 3.4 13.6 13M20 3.4 10.4 13"/><path d="M13.2 13.4 17 17.2M10.8 13.4 7 17.2"/><path d="M17.2 17.2 20.6 20.6M6.8 17.2 3.4 20.6"/>`,
  dice: `<rect x="3.4" y="3.4" width="17.2" height="17.2" rx="4.4"/><circle cx="8.6" cy="8.6" r="1.35" ${F}/><circle cx="12" cy="12" r="1.35" ${F}/><circle cx="15.4" cy="15.4" r="1.35" ${F}/>`,
  cards: `<rect x="2.6" y="6.4" width="12" height="15" rx="2.6" transform="rotate(-8 8.6 13.9)"/><rect x="9.4" y="3.4" width="12" height="15" rx="2.6" transform="rotate(9 15.4 10.9)"/><path d="M15.4 8.2l1 2.2 2.2 1-2.2 1-1 2.2-1-2.2-2.2-1 2.2-1Z" ${F} opacity=".5"/>`,
  cardSingle: `<rect x="5" y="2.8" width="14" height="18.4" rx="3"/><path d="M12 7.4l1.5 3.3 3.3 1.5-3.3 1.5L12 17l-1.5-3.3-3.3-1.5 3.3-1.5Z"/>`,
  gift: `<rect x="3.2" y="8.6" width="17.6" height="12.2" rx="2.4"/><path d="M3.2 13.2h17.6M12 8.6v12.2"/><path d="M12 8.6S10.8 4 8.4 4a2.3 2.3 0 0 0 0 4.6H12Zm0 0s1.2-4.6 3.6-4.6a2.3 2.3 0 0 1 0 4.6H12Z"/>`,
  trophy: `<path d="M8 3.4h8v4.4a4 4 0 0 1-8 0V3.4Z"/><path d="M8 4.8H5.2v1.8a3 3 0 0 0 2.9 3M16 4.8h2.8v1.8a3 3 0 0 1-2.9 3"/><path d="M12 11.8v3.6M8.6 20.6h6.8l-.7-4.4H9.3Z"/>`,
  crown: `<path d="M3.6 18.4h16.8M4.4 18.4 3.2 6.6l5.2 4L12 4.4l3.6 6.2 5.2-4-1.2 11.8"/>`,
  medal: `<path d="M8.4 2.8 10.6 9M15.6 2.8 13.4 9"/><circle cx="12" cy="15" r="5.6"/><circle cx="12" cy="15" r="2.2"/>`,
  wheel: `<circle cx="12" cy="12" r="8.8"/><circle cx="12" cy="12" r="2.6"/><path d="M12 3.2v6.2M12 14.6v6.2M3.2 12h6.2M14.6 12h6.2M5.8 5.8l4.4 4.4M13.8 13.8l4.4 4.4M18.2 5.8l-4.4 4.4M10.2 13.8l-4.4 4.4"/>`,
  clock: `<circle cx="12" cy="12" r="8.8"/><path d="M12 6.8V12l3.6 2.2"/>`,
  hourglass: `<path d="M6.6 2.8h10.8M6.6 21.2h10.8"/><path d="M8 2.8c0 4.2 4 5.4 4 9.2s-4 5-4 9.2M16 2.8c0 4.2-4 5.4-4 9.2s4 5 4 9.2"/>`,
  stopwatch: `<circle cx="12" cy="13.4" r="7.6"/><path d="M12 9.8v3.6l2.6 1.6M9.4 2.6h5.2M19.2 6.2l1.6-1.6"/>`,
  target: `<circle cx="12" cy="12" r="8.8"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" ${F}/>`,
  flag: `<path d="M5.6 2.8v18.4M5.6 4.2h13l-2.4 4 2.4 4h-13"/>`,
  lock: `<rect x="4.4" y="10.2" width="15.2" height="10.6" rx="2.8"/><path d="M7.8 10.2V7.6a4.2 4.2 0 0 1 8.4 0v2.6"/><circle cx="12" cy="15.4" r="1.4" ${F}/>`,
  ban: `<circle cx="12" cy="12" r="8.8"/><path d="M5.8 18.2 18.2 5.8"/>`,
  check: `<path d="M4.8 12.6 9.6 17.4 19.2 6.6"/>`,
  checkCircle: `<circle cx="12" cy="12" r="8.8"/><path d="M8 12.4l2.8 2.8L16.2 9"/>`,
  close: `<path d="M6 6l12 12M18 6 6 18"/>`,
  chevronLeft: `<path d="M14.8 5.2 8 12l6.8 6.8"/>`,
  chevronRight: `<path d="M9.2 5.2 16 12l-6.8 6.8"/>`,
  chevronUp: `<path d="M5.2 14.8 12 8l6.8 6.8"/>`,
  chevronDown: `<path d="M5.2 9.2 12 16l6.8-6.8"/>`,
  caretDown: `<path d="M6.4 8.4 12 16l5.6-7.6Z" ${F}/>`,
  arrowUp: `<path d="M12 20V4.8M5.6 11.2 12 4.8l6.4 6.4"/>`,
  arrowDown: `<path d="M12 4v15.2M5.6 12.8 12 19.2l6.4-6.4"/>`,
  play: `<path d="M7.6 4.8 19 12 7.6 19.2V4.8Z" ${F}/>`,
  pause: `<rect x="6.4" y="4.8" width="4" height="14.4" rx="1.4" ${F}/><rect x="13.6" y="4.8" width="4" height="14.4" rx="1.4" ${F}/>`,
  refresh: `<path d="M20.4 12a8.4 8.4 0 1 1-2.5-6"/><path d="M20.4 3.6v5h-5"/>`,
  fastForward: `<path d="M3.2 5.6 11 12l-7.8 6.4V5.6ZM12.4 5.6 20.2 12l-7.8 6.4V5.6Z" ${F}/>`,
  gear: `<circle cx="12" cy="12" r="3.2"/><path d="M12 2.6v2.6M12 18.8v2.6M2.6 12h2.6M18.8 12h2.6M5.4 5.4l1.8 1.8M16.8 16.8l1.8 1.8M18.6 5.4l-1.8 1.8M7.2 16.8l-1.8 1.8"/>`,
  info: `<circle cx="12" cy="12" r="8.8"/><path d="M12 11v5.4M12 7.8h.01"/>`,
  warning: `<path d="M12 3.2 22 20.4H2L12 3.2Z"/><path d="M12 9.6v4.2M12 17.2h.01"/>`,
  bell: `<path d="M6.2 16.4v-5a5.8 5.8 0 0 1 11.6 0v5l1.8 2.8H4.4l1.8-2.8Z"/><path d="M9.8 20a2.4 2.4 0 0 0 4.4 0"/>`,
  bellOff: `<path d="M6.2 16.4v-5a5.8 5.8 0 0 1 8.6-5.1M17.8 12.6v3.8l1.8 2.8H4.4l1.8-2.8"/><path d="M9.8 20a2.4 2.4 0 0 0 4.4 0M3.4 3.4l17.2 17.2"/>`,
  soundOn: `<path d="M4.4 9.2h3.2L12 5.4v13.2L7.6 14.8H4.4V9.2Z"/><path d="M15.6 9a4.4 4.4 0 0 1 0 6M18.2 6.4a8 8 0 0 1 0 11.2"/>`,
  soundOff: `<path d="M4.4 9.2h3.2L12 5.4v13.2L7.6 14.8H4.4V9.2Z"/><path d="M16 9.6l4.8 4.8M20.8 9.6 16 14.4"/>`,
  eye: `<path d="M2.4 12S6 6.2 12 6.2 21.6 12 21.6 12 18 17.8 12 17.8 2.4 12 2.4 12Z"/><circle cx="12" cy="12" r="2.8"/>`,
  eyeOff: `<path d="M4 4.6C2.9 6.4 2.4 12 2.4 12S6 17.8 12 17.8c1.7 0 3.2-.5 4.4-1.1M9.4 6.6A9.6 9.6 0 0 1 12 6.2c6 0 9.6 5.8 9.6 5.8a17 17 0 0 1-2.6 3.2M3.2 3.2l17.6 17.6"/><path d="M10 10a2.8 2.8 0 0 0 4 4"/>`,
  couple: `<circle cx="8.6" cy="8" r="3.2"/><circle cx="16.4" cy="9.4" r="2.6"/><path d="M2.8 19.6c0-3.2 2.6-5.4 5.8-5.4s5.8 2.2 5.8 5.4M14.6 14.6c2.9-.4 6.6 1.4 6.6 5"/>`,
  calendar: `<rect x="3.4" y="5" width="17.2" height="15.6" rx="2.8"/><path d="M3.4 9.8h17.2M8 3v4M16 3v4"/><circle cx="8.4" cy="14" r="1.1" ${F}/><circle cx="12" cy="14" r="1.1" ${F}/><circle cx="15.6" cy="14" r="1.1" ${F}/>`,
  chart: `<path d="M3.6 20.4h16.8"/><rect x="5.4" y="12" width="3.6" height="6" rx="1"/><rect x="10.2" y="7.6" width="3.6" height="10.4" rx="1"/><rect x="15" y="4" width="3.6" height="14" rx="1"/>`,
  book: `<path d="M5 3.4h11.2A3.4 3.4 0 0 1 19.6 6.8v13.8H8.4A3.4 3.4 0 0 1 5 17.2V3.4Z"/><path d="M5 17.2a3.4 3.4 0 0 1 3.4-3.4h11.2M9.4 3.4v6.2l2-1.4 2 1.4V3.4"/>`,
  pencil: `<path d="M4 20.2l4.4-1.2L19.6 7.8 16.2 4.4 5 15.6 4 20.2Z"/><path d="M14.6 6l3.4 3.4"/>`,
  export: `<path d="M12 3.4v10.2M8.2 7.2 12 3.4l3.8 3.8"/><path d="M4.4 14.6v4a2 2 0 0 0 2 2h11.2a2 2 0 0 0 2-2v-4"/>`,
  trash: `<path d="M4.4 6.8h15.2M9.2 6.8V4.4h5.6v2.4M6.4 6.8l1 13a1.6 1.6 0 0 0 1.6 1.4h6a1.6 1.6 0 0 0 1.6-1.4l1-13"/>`,
  snowflake: `<path d="M12 2.6v18.8M3.9 7.3l16.2 9.4M20.1 7.3 3.9 16.7"/><path d="M12 6.4 9.8 4.4M12 6.4l2.2-2M12 17.6l-2.2 2M12 17.6l2.2 2"/>`,
  gem: `<path d="M7.2 3.2h9.6l4 6-8.8 11.6L3.2 9.2l4-6Z"/><path d="M3.2 9.2h17.6M9.4 9.2 12 20.8 14.6 9.2M7.2 3.2l2.2 6M16.8 3.2l-2.2 6"/>`,
  coin: `<circle cx="12" cy="12" r="8.6"/><circle cx="12" cy="12" r="4.6"/><path d="M12 7.4v9.2"/>`,
  shield: `<path d="M12 2.8 20 5.8v6c0 5-3.4 8.2-8 9.4-4.6-1.2-8-4.4-8-9.4v-6l8-3Z"/><path d="M8.8 12.2l2.2 2.2 4.2-4.4"/>`,
  key: `<circle cx="7.6" cy="12" r="4"/><path d="M11.6 12h9M17.4 12v3.2M20.2 12v2.4"/>`,

  /* ---------- níveis de intensidade ---------- */
  leaf: `<path d="M20.4 3.6C10.2 3.6 4 8.8 4 15.8c0 2.2.9 4.2.9 4.2s5.9-.9 9.8-4.8c3.9-3.9 5.7-8 5.7-11.6Z"/><path d="M4.9 20 14 10.6"/>`,
  pepper: `<path d="M13.6 6.6c2.4.4 3.6 2.4 3.2 5-.6 4.2-3.6 8.6-7.8 8.6-3 0-5-1.9-5-4.4 0-3 2.6-5.8 6-6.4 2.4-.4 3.6-.4 3.6-2.8Z"/><path d="M13.6 6.6C13.6 4.6 15 3.4 17 3.4"/>`,
  volcano: `<path d="M3.4 20.6h17.2L15.8 9.4H8.2L3.4 20.6Z"/><path d="M9.4 9.4C9.4 6 10.6 4 12 2.6c1.4 1.4 2.6 3.4 2.6 6.8"/><path d="M10.4 14.2h3.2"/>`,

  /* ---------- clima / humores ---------- */
  moodCold: `<circle cx="12" cy="12" r="8.8"/><path d="M8.6 10h.01M15.4 10h.01"/><path d="M8.8 16.2c1.8-1.4 4.6-1.4 6.4 0M2.8 6.2 4.6 8M21.2 6.2 19.4 8"/>`,
  moodOk: `<circle cx="12" cy="12" r="8.8"/><path d="M8.6 10h.01M15.4 10h.01M9 15h6"/>`,
  moodCalm: `<circle cx="12" cy="12" r="8.8"/><path d="M8.6 10h.01M15.4 10h.01M8.8 14.6c1.8 1.6 4.6 1.6 6.4 0"/>`,
  moodHot: `<circle cx="12" cy="12" r="8.8"/><path d="M8.6 9.8h.01M15.4 9.8h.01M8.2 14c1.4 2.4 6.2 2.4 7.6 0"/><path d="M6 12.4h1.6M16.4 12.4H18"/>`,
  moodFire: `<circle cx="12" cy="13.4" r="7.6"/><path d="M9.2 11.6h.01M14.8 11.6h.01M8.8 15.4c1.4 2.2 5 2.2 6.4 0"/><path d="M12 5.8c-1.2-1.4-1-2.8 0-4 1.4 1.2 2.4 2.6 1.4 4"/>`,

  /* ---------- temas das temporadas e fases ---------- */
  candle: `<rect x="8.4" y="9.6" width="7.2" height="11.6" rx="1.8"/><path d="M12 9.6V7.4"/><path d="M12 2.6c1.6 1.6 2.4 2.6 2.4 3.8a2.4 2.4 0 0 1-4.8 0c0-1.2.8-2.2 2.4-3.8Z"/>`,
  match: `<path d="M12 21.4V11.6"/><path d="M12 11.6c-2.2 0-3.6-1.6-3.6-3.6S12 2.6 12 2.6s3.6 3.4 3.6 5.4-1.4 3.6-3.6 3.6Z"/>`,
  pot: `<path d="M4 9.6h16v5.2a5.6 5.6 0 0 1-5.6 5.6H9.6A5.6 5.6 0 0 1 4 14.8V9.6Z"/><path d="M2.4 11.6H4M20 11.6h1.6M8.8 6.4c0-1.4 1.2-1.6 1.2-3M14 6.4c0-1.4 1.2-1.6 1.2-3"/>`,
  utensils: `<path d="M6.4 2.8v7a2.4 2.4 0 0 0 4.8 0v-7M8.8 12.2v9M17.6 2.8c-1.6 1.6-2.4 3.6-2.4 5.8 0 1.8.8 2.8 2.4 3.2v9.4"/>`,
  film: `<path d="M3.2 9.4h17.6v10a1.6 1.6 0 0 1-1.6 1.6H4.8a1.6 1.6 0 0 1-1.6-1.6v-10Z"/><path d="M3.2 9.4 5 3.6h15.4l-1.8 5.8M8.6 3.6 7 9.4M14 3.6l-1.6 5.8M18.4 4.4l-1.6 5"/>`,
  city: `<path d="M2.8 21.2h18.4"/><path d="M4.6 21.2V9.4l5-3v14.8M14.2 21.2V4.6l5.2 3v13.6"/><path d="M7 12h.01M7 15.6h.01M16.6 11h.01M16.6 14.8h.01"/>`,
  lotus: `<path d="M12 20.4c-4.6 0-8.4-3-8.4-6.6 2-1 4-.8 5.6.4-.6-2.8.6-5.6 2.8-7.4 2.2 1.8 3.4 4.6 2.8 7.4 1.6-1.2 3.6-1.4 5.6-.4 0 3.6-3.8 6.6-8.4 6.6Z"/>`,
  bed: `<path d="M2.8 20.4v-9.2M2.8 15.6h18.4v4.8"/><path d="M9.2 11.2h8a4.4 4.4 0 0 1 4 2.6M6 11.2V8.4h5.2v2.8"/><circle cx="6" cy="13.6" r="1.6"/>`,
  moon: `<path d="M20.4 14.8A8.8 8.8 0 0 1 9.2 3.6 8.8 8.8 0 1 0 20.4 14.8Z"/>`,
  sun: `<circle cx="12" cy="12" r="4.4"/><path d="M12 2.4v2.4M12 19.2v2.4M2.4 12h2.4M19.2 12h2.4M5.2 5.2l1.6 1.6M17.2 17.2l1.6 1.6M18.8 5.2l-1.6 1.6M6.8 17.2l-1.6 1.6"/>`,
  star: `<path d="m12 3.2 2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1L3.2 9.7l6.1-.9L12 3.2Z"/>`,
  mask: `<path d="M3.4 5.6c5.6-1.4 12-1.4 17.2 0 .2 6.4-2.2 13.2-8.6 15.2C5.6 18.8 3.2 12 3.4 5.6Z"/><path d="M8 10.2c1-.8 2.2-.8 3.2 0M12.8 10.2c1-.8 2.2-.8 3.2 0M9.6 15c1.4 1.2 3.4 1.2 4.8 0"/>`,
  ring: `<circle cx="12" cy="14.6" r="6"/><path d="M9.4 8.6 12 4.4l2.6 4.2M10.4 8.6h3.2"/>`,
  lips: `<path d="M2.8 9.6C6 6.8 9.2 6.8 12 9c2.8-2.2 6-2.2 9.2.6-2.2 5.2-6 9-9.2 9s-7-3.8-9.2-9Z"/><path d="M2.8 9.6C6 11.6 9 12.4 12 12.4s6-.8 9.2-2.8"/>`,
  wine: `<path d="M7 3.2h10l-.8 5.6a4.2 4.2 0 0 1-8.4 0L7 3.2Z"/><path d="M12 13v6.2M8.6 20.8h6.8"/>`,
  glasses: `<path d="M4 3.2h6l-.6 4.4a2.8 2.8 0 0 1-4.8 0L4 3.2ZM14 3.2h6l-.6 4.4a2.8 2.8 0 0 1-4.8 0L14 3.2Z"/><path d="M7 10.4V20M17 10.4V20M4.6 20h4.8M14.6 20h4.8"/>`,
  music: `<path d="M9 18.2V5.6l10-2v12.2"/><circle cx="6.6" cy="18.4" r="2.6"/><circle cx="16.6" cy="15.8" r="2.6"/>`,
  camera: `<path d="M3.2 8.4h3.4l1.6-2.6h7.6l1.6 2.6h3.4v11a1.6 1.6 0 0 1-1.6 1.6H4.8a1.6 1.6 0 0 1-1.6-1.6v-11Z"/><circle cx="12" cy="13.8" r="3.6"/>`,
  mapPin: `<path d="M12 21.4s7-6 7-11a7 7 0 1 0-14 0c0 5 7 11 7 11Z"/><circle cx="12" cy="10.2" r="2.6"/>`,
  compass: `<circle cx="12" cy="12" r="8.8"/><path d="m15.8 8.2-2 5.6-5.6 2 2-5.6 5.6-2Z"/><circle cx="12" cy="12" r="1" ${F}/>`,
  map: `<path d="m9 4.2 6 2.4 5.4-2.4v13.2L15 19.8l-6-2.4-5.4 2.4V6.6L9 4.2Z"/><path d="M9 4.2v13.2M15 6.6v13.2"/>`,
  rain: `<path d="M7 14.4a4.2 4.2 0 0 1 .6-8.3 5.4 5.4 0 0 1 10.2 1.4 3.6 3.6 0 0 1-.6 7.1"/><path d="M8.4 17.6l-1 2.8M12.4 17.6l-1 2.8M16.4 17.6l-1 2.8"/>`,
  car: `<path d="M4.4 16.4v2.4H7v-2.4M17 16.4v2.4h2.6v-2.4"/><path d="M3.2 16.4v-4l2-4.6h10.6l3.4 4.6v4H3.2Z"/><path d="M6.4 12.4h11.2"/>`,
  bag: `<rect x="4" y="7.6" width="16" height="13" rx="2.6"/><path d="M9 7.6V5.8a3 3 0 0 1 6 0v1.8M4 12h16"/>`,
  shirt: `<path d="M8.4 3.2 12 5.4l3.6-2.2 4.6 2.8-2.2 3.6-1.6-1v10.2H7.6V8.6L6 9.6 3.8 6l4.6-2.8Z"/>`,
  shower: `<path d="M4 13.6a8 8 0 0 1 16 0"/><path d="M12 13.6V5.4a2.4 2.4 0 0 0-4.8 0"/><path d="M7.6 17v2.6M12 17v3.4M16.4 17v2.6"/>`,
  mic: `<rect x="9.2" y="2.8" width="5.6" height="11" rx="2.8"/><path d="M5.6 11.6a6.4 6.4 0 0 0 12.8 0M12 18v3.2M8.8 21.2h6.4"/>`,
  mirror: `<ellipse cx="12" cy="9.6" rx="6" ry="7"/><path d="M12 16.6v4.6M9.4 21.2h5.2"/>`,
  bottle: `<path d="M10 2.8h4v2.6l1.8 2.2v11.6a2 2 0 0 1-2 2h-3.6a2 2 0 0 1-2-2V7.6L10 5.4V2.8Z"/><path d="M8.2 12.4h7.6"/>`,
  feather: `<path d="M20.2 3.8c-8 0-13.4 4.6-13.4 11.2 0 1.8.6 3.4.6 3.4l3.6-3.6-2.8-.8 4.8-2-2.8-.8 5.6-2.8-3.6-.8 5.4-3.8Z"/><path d="M4 20.4l4.4-4.4"/>`,
  envelope: `<rect x="2.8" y="5.2" width="18.4" height="13.6" rx="2.4"/><path d="m3.6 7 8.4 6 8.4-6"/>`,
  phoneOff: `<rect x="6.4" y="2.8" width="11.2" height="18.4" rx="2.8"/><path d="M10.6 18.4h2.8M3.2 3.2l17.6 17.6"/>`,
  touch: `<path d="M9 11.4V6.6a2 2 0 0 1 4 0v6"/><path d="M13 10.6a1.8 1.8 0 0 1 3.6 0v1M16.6 11.6a1.8 1.8 0 0 1 3.6 0v3.6a5.6 5.6 0 0 1-5.6 5.6h-2.2a5.6 5.6 0 0 1-4.4-2.2L5 15.4a1.9 1.9 0 0 1 2.9-2.4L9 14"/>`,
  drop: `<path d="M12 2.8c3.4 4.2 5.6 6.8 5.6 9.6a5.6 5.6 0 0 1-11.2 0c0-2.8 2.2-5.4 5.6-9.6Z"/>`,
  door: `<path d="M5.2 21.2V4.4a1.6 1.6 0 0 1 1.6-1.6h10.4a1.6 1.6 0 0 1 1.6 1.6v16.8M2.8 21.2h18.4"/><circle cx="15.2" cy="12.8" r="1.2" ${F}/>`,
  bulb: `<path d="M9.2 17.2a6.4 6.4 0 1 1 5.6 0v2.2H9.2v-2.2Z"/><path d="M10 21.6h4"/>`,
  cart: `<path d="M2.8 4h2.6l2.6 10.6h10l2.2-7.6H6.6"/><circle cx="9.4" cy="19" r="1.6"/><circle cx="17.4" cy="19" r="1.6"/>`,
  party: `<path d="M3.6 20.4 9.4 6.2l8.4 8.4L3.6 20.4Z"/><path d="M14 3.4v2.4M19.4 5.6l-1.6 1.8M21 11h-2.4"/>`,
  burst: `<path d="m12 2.6 2 5.2 5.4-1.4-3.2 4.4 4.6 3-5.6.8.6 5.6-4.2-3.4-3.4 4.2.4-5.6-5.6-1 4.6-3L4.4 6l5.4 1.6 2.2-5Z" ${F}/>`,
  hat: `<path d="M8.4 9.6V4.8a1.6 1.6 0 0 1 1.6-1.6h4a1.6 1.6 0 0 1 1.6 1.6v4.8"/><path d="M2.8 9.6h18.4v2.8a2 2 0 0 1-2 2H4.8a2 2 0 0 1-2-2V9.6Z"/>`,
  cup: `<path d="M4.4 8.4h15.2l-1.4 10a2.4 2.4 0 0 1-2.4 2H8.2a2.4 2.4 0 0 1-2.4-2l-1.4-10Z"/><path d="M3.2 8.4 5.6 3.6h12.8l2.4 4.8M9 12.4h.01M12 12.4h.01M15 12.4h.01"/>`,
  cherry: `<path d="M12 3.4c2.4 2.4 3.6 5 3.6 7.6"/><path d="M12 3.4C9.6 5.8 8.4 8.4 8.4 11"/><circle cx="7.2" cy="16.4" r="4"/><circle cx="16.8" cy="16.4" r="4"/>`,
  chocolate: `<rect x="4.4" y="3.2" width="15.2" height="17.6" rx="2.2"/><path d="M4.4 9.2h15.2M4.4 15h15.2M9.6 3.2v17.6M14.4 3.2v17.6"/>`,
  home: `<path d="M3.6 11 12 3.6 20.4 11v8.2a1.6 1.6 0 0 1-1.6 1.6H5.2a1.6 1.6 0 0 1-1.6-1.6V11Z"/><path d="M9.4 20.8v-6h5.2v6"/>`,
  ticket: `<path d="M3.2 8.4a2.4 2.4 0 0 1 2.4-2.4h12.8a2.4 2.4 0 0 1 2.4 2.4 2.4 2.4 0 0 0 0 4.8 2.4 2.4 0 0 1-2.4 2.4H5.6a2.4 2.4 0 0 1-2.4-2.4 2.4 2.4 0 0 0 0-4.8Z"/><path d="M13.6 6v1.6M13.6 11v1.6M13.6 16v1.6"/>`,
  brain: `<path d="M9.4 4.2a3 3 0 0 0-3 3 2.8 2.8 0 0 0-1.6 5 3 3 0 0 0 1.6 5 3 3 0 0 0 3 2.6 2.4 2.4 0 0 0 2.4-2.4V6.6a2.4 2.4 0 0 0-2.4-2.4Z"/><path d="M14.6 4.2a3 3 0 0 1 3 3 2.8 2.8 0 0 1 1.6 5 3 3 0 0 1-1.6 5 3 3 0 0 1-3 2.6"/>`,
  nest: `<path d="M3.6 13.2a8.4 8.4 0 0 0 16.8 0"/><path d="M2.8 13.2h18.4M6 16.4h12M8.8 19.2h6.4"/><circle cx="9.6" cy="10.4" r="1.6"/><circle cx="14.4" cy="10.4" r="1.6"/>`,
}

/* emoji legado → ícone novo (migração sem tocar em todo o conteúdo) */
export const EMOJI_ICON = {
  '🔥': 'flame', '⚡': 'bolt', '✨': 'sparkle', '⚔️': 'swords', '🎲': 'dice', '🃏': 'cards',
  '🌶️': 'pepper', '🎁': 'gift', '🫣': 'eye', '🧠': 'brain', '🎡': 'wheel', '🎰': 'wheel',
  '🏆': 'trophy', '🎯': 'target', '✓': 'check', '💞': 'heart', '🕯️': 'candle', '🛏️': 'bed',
  '👑': 'crown', '🔔': 'bell', '📵': 'phoneOff', '🍓': 'cherry', '🛋️': 'bed', '🧊': 'snowflake',
  '🎭': 'mask', '💋': 'lips', '🌙': 'moon', '🔒': 'lock', '🙈': 'eyeOff', '💍': 'ring',
  '✕': 'close', '✅': 'checkCircle', '💔': 'heartBroken', '🥂': 'glasses', '✍️': 'pencil',
  '🔕': 'bellOff', '👀': 'eye', '🍳': 'pot', '🗺️': 'map', '🛁': 'shower', '🌆': 'city',
  '🪄': 'sparkle', '👗': 'shirt', '🎧': 'music', '💌': 'envelope', '🍽️': 'utensils',
  '📅': 'calendar', '🌋': 'volcano', '🚫': 'ban', '📈': 'arrowUp', '🌹': 'leaf', '🫶': 'heartHands',
  '🔊': 'soundOn', '🌸': 'leaf', '🧺': 'pot', '🔪': 'utensils', '🍫': 'chocolate', '🎬': 'film',
  '🎩': 'hat', '💃': 'music', '🍿': 'cup', '📼': 'film', '🪵': 'flame', '👕': 'shirt',
  '💆': 'touch', '🧖': 'lotus', '🌧️': 'rain', '🚗': 'car', '🧳': 'bag', '🤫': 'lips',
  '✉️': 'envelope', '🍸': 'wine', '📜': 'book', '📝': 'pencil', '🧦': 'shirt', '👄': 'lips',
  '🩲': 'shirt', '🍷': 'wine', '🖐️': 'touch', '🔇': 'soundOff', '📸': 'camera', '🪞': 'mirror',
  '🌅': 'sun', '🚿': 'shower', '🎤': 'mic', '🕺': 'music', '🛌': 'bed', '🧴': 'bottle',
  '🤲': 'touch', '🌱': 'leaf', '💄': 'lips', '🧭': 'compass', '🪺': 'nest', '🎉': 'party',
  '⚠️': 'warning', '🏁': 'flag', '🗓️': 'calendar', '🚪': 'door', '💧': 'drop', '💡': 'bulb',
  '🥶': 'moodCold', '🙂': 'moodOk', '😌': 'moodCalm', '😅': 'moodHot', '🍮': 'cup',
  '📊': 'chart', '🥇': 'medal', '🥈': 'medal', '🥉': 'medal', '🏅': 'medal', '⚙️': 'gear',
  '🏃': 'fastForward', '🛒': 'cart', '🧨': 'warning', '🔻': 'caretDown', '↺': 'refresh',
  '💥': 'burst', '🐻': 'couple', '🦊': 'couple', '🐝': 'couple', '⭐': 'star', '🌟': 'star',
  '❤️': 'heart', '💗': 'heart', '💘': 'heart', '⏱️': 'stopwatch', '🔑': 'key', '🛡️': 'shield',
  '⏳': 'hourglass', '📔': 'book', '🧭': 'compass', '🎴': 'cards', '🀄': 'cards', '💤': 'moon',
}

/** nome do ícone a partir de um emoji (com fallback) */
export function iconNameFor(emojiOrName, fallback = 'sparkle') {
  if (!emojiOrName) return fallback
  if (ICONS[emojiOrName]) return emojiOrName
  const cleaned = String(emojiOrName).replace(/\uFE0F/gu, '')
  for (const [emoji, name] of Object.entries(EMOJI_ICON)) {
    if (emoji.replace(/\uFE0F/gu, '') === cleaned) return name
  }
  // emoji composto (ex.: "🌶️🌶️") → pega o primeiro
  const first = [...cleaned][0]
  for (const [emoji, name] of Object.entries(EMOJI_ICON)) {
    if ([...emoji.replace(/\uFE0F/gu, '')][0] === first) return name
  }
  return fallback
}

/** SVG inline (string) */
export function icon(name, size = 22, extra = '') {
  const body = ICONS[name] ?? ICONS[iconNameFor(name)] ?? ICONS.sparkle
  return `<svg class="ic ${extra}" width="${size}" height="${size}" viewBox="0 0 24 24" ${S} aria-hidden="true">${body}</svg>`
}

/** SVG inline como elemento DOM */
export function iconEl(name, size = 22, cls = '') {
  const wrap = document.createElement('span')
  wrap.className = `ic-wrap ${cls}`.trim()
  wrap.innerHTML = icon(name, size)
  return wrap.firstElementChild
}

/** pilha de ícones repetidos (ex.: nível de intensidade) */
export function iconRepeat(name, times, size = 14) {
  return icon(name, size).repeat(Math.max(0, times))
}
