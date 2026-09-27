// Ink icons for the animation cards (viewBox 0 0 64 64, stroke = currentColor).
// Add your own here and use them with Icon = 'name' in config_animations.lua.
const head = (x, y, r = 5) => `<circle class="f" cx="${x}" cy="${y}" r="${r}"/>`;

const ICONS = {
    grid: `<rect x="10" y="10" width="18" height="18" rx="2"/><rect x="36" y="10" width="18" height="18" rx="2"/><rect x="10" y="36" width="18" height="18" rx="2"/><rect x="36" y="36" width="18" height="18" rx="2"/>`,

    star: `<path d="M32 7l7.3 15.6 17 2.1-12.5 11.7 3.2 16.9L32 45l-15 8.3 3.2-16.9L7.7 24.7l17-2.1z"/>`,

    watch: `<circle cx="32" cy="37" r="19"/><circle cx="32" cy="37" r="14.5" class="thin"/><path d="M28 18v-4h8v4M32 14v-3"/><circle cx="32" cy="8" r="3"/><path d="M32 37V27M32 37l7 5"/>`,

    wave: `${head(30, 14)}<path d="M30 20v19M30 39l-7 17M30 39l7 17M30 25l-10 10M30 25l11-6 2-11"/><path class="thin" d="M48 5c3 3 3 7 0 10M53 2c5 5 5 12 0 17"/>`,

    hat: `<path d="M19 38c0-13 3-22 8-22 3 0 3.5 3 5 3s2-3 5-3c5 0 8 9 8 22"/><path d="M19.5 32h25" class="thin"/><path d="M5 37c5 9 49 9 54 0-9 5-45 5-54 0z"/>`,

    bow: `${head(46, 22)}<path d="M40 26L25 36M25 36l-2 20M25 36l7 20M37 28l6 13M34 30l-6 6"/>`,

    dance: `${head(20, 11)}<path d="M20 17v18M20 35l-6 20M20 35l8 13-1 7M20 22l12-2M20 22L10 14"/>${head(44, 11)}<path d="M44 17v11M44 22l-12-2M44 22l9-9M44 28l-9 20h18z"/><path d="M40 48v8M48 48v8"/>`,

    jig: `${head(28, 10)}<path d="M28 16l3 18M29 21l-10-8M29 21l12 3 5-8M31 34l-7 11-5 11M31 34l12 8"/><path class="thin" d="M52 28v11"/><circle class="f" cx="50" cy="40" r="2.6"/><path class="thin" d="M52 28l5 2"/>`,

    sit: `<path class="thin" d="M5 50h54"/>${head(20, 16)}<path d="M20 22l3 20M23 42h12l6 8M23 42l12-12 8 20M21 27l13 5M21 27l-6 15"/>`,

    sleep: `<path class="thin" d="M4 52h56"/>${head(13, 44)}<path d="M19 45h26l12 2M24 45l6-6 10 6M45 45l9-4"/><path class="thin" d="M36 10h9l-9 10h9M50 22h6l-6 7h6"/>`,

    stance: `${head(32, 11)}<path d="M32 17v21M32 38l-8 18M32 38l8 18M23 25l17 7M41 25l-17 7"/>`,

    lean: `<path d="M52 4v56" class="thick"/>${head(40, 12)}<path d="M41 18l-3 20M38 38l-9 18M38 38l2 18M40 24l-10 6 9 4"/>`,

    kneel: `<path class="thin" d="M5 56h54"/>${head(30, 12)}<path d="M30 18v20M30 38h12v18M30 38l-10 18h-6M30 24l-9-9M30 24l9-9"/>`,

    handsup: `${head(32, 18)}<path d="M32 24v17M32 41l-7 16M32 41l7 16M32 28l-10-8V8M32 28l10-8V8"/>`,

    point: `${head(20, 12)}<path d="M20 18l2 20M22 38l-6 18M22 38l7 18M21 24l26-5M21 24l-7 11"/><path class="thin" d="M52 18l6-1M51 13l5-3M52 23l5 3"/>`,

    fist: `<path d="M18 26h26c3 0 5 2 5 5v11c0 8-6 13-14 13h-6c-7 0-12-5-12-12V31c0-3 0-5 1-5z"/><path class="thin" d="M26 26v8M33 26v8M40 26v8"/><path d="M13 36c4-2 10-1 13 2"/><path class="thin" d="M24 55v6M38 55v6"/>`,

    thumbsup: `<rect x="8" y="30" width="10" height="26" rx="2"/><path d="M18 32l9-14c2-4 8-3 7 3l-2 8h13c3 0 5 3 4 6l-4 15c-1 3-3 5-6 5H18"/>`,
    thumbsdown: `<g transform="rotate(180 32 34)"><rect x="8" y="30" width="10" height="26" rx="2"/><path d="M18 32l9-14c2-4 8-3 7 3l-2 8h13c3 0 5 3 4 6l-4 15c-1 3-3 5-6 5H18"/></g>`,

    clap: `<rect x="16" y="16" width="13" height="30" rx="6.5" transform="rotate(-16 22 31)"/><rect x="35" y="16" width="13" height="30" rx="6.5" transform="rotate(16 42 31)"/><path class="thin" d="M32 4v7M21 7l3 6M43 7l-3 6M24 50l-2 10M40 50l2 10"/>`,

    pray: `<path d="M31 9c-2 0-3 2-3 4l-5 22-9 11 6 6 11-11zM33 9c2 0 3 2 3 4l5 22 9 11-6 6-11-11z"/><path class="thin" d="M32 4v-2M22 8l-3-3M42 8l3-3"/>`,

    heart: `<path d="M32 54C11 40 8 24 19 17c6-4 11 0 13 5 2-5 7-9 13-5 11 7 8 23-13 37z"/><path class="thin" d="M50 6c-2-2-5 0-3 3l3 3 3-3c2-3-1-5-3-3z"/>`,

    smile: `<circle cx="32" cy="32" r="23"/><circle class="f" cx="24" cy="27" r="2.6"/><circle class="f" cx="40" cy="27" r="2.6"/><path d="M21 38c6 8 16 8 22 0"/>`,

    laugh: `<circle cx="32" cy="32" r="23"/><path class="thin" d="M20 27c3-4 7-4 9 0M35 27c3-4 7-4 9 0"/><path d="M20 36h24c0 11-24 11-24 0z"/>`,

    sad: `<circle cx="32" cy="32" r="23"/><circle class="f" cx="24" cy="27" r="2.6"/><circle class="f" cx="40" cy="27" r="2.6"/><path d="M22 45c6-6 14-6 20 0"/><path class="thin" d="M22 33c-2 4-3 6 0 8 3-2 2-4 0-8z"/>`,

    angry: `<circle cx="32" cy="32" r="23"/><path d="M18 22l10 5M46 22l-10 5"/><circle class="f" cx="25" cy="31" r="2.6"/><circle class="f" cx="39" cy="31" r="2.6"/><path d="M22 45c6-5 14-5 20 0"/>`,

    sick: `<circle cx="32" cy="32" r="23"/><path class="thin" d="M20 23l7 7M27 23l-7 7M37 23l7 7M44 23l-7 7"/><path d="M20 43c3-4 5 0 8 0s5-4 8 0 5 0 8 0"/>`,

    hush: `<circle cx="32" cy="32" r="23"/><circle class="f" cx="24" cy="26" r="2.6"/><circle class="f" cx="40" cy="26" r="2.6"/><path d="M25 42h14"/><path d="M32 60V36" class="thick"/>`,

    eye: `<path d="M5 32C15 15 49 15 59 32 49 49 15 49 5 32z"/><circle cx="32" cy="32" r="9"/><circle class="f" cx="32" cy="32" r="3.5"/>`,

    skull: `<path d="M17 30a15 15 0 1 1 30 0v9l-4 4v7H21v-7l-4-4z"/><circle class="f" cx="25" cy="31" r="4.2"/><circle class="f" cx="39" cy="31" r="4.2"/><path class="thin" d="M32 37l-2 4h4zM27 50v-5M32 50v-5M37 50v-5"/>`,

    injured: `<path d="M26 8h12v16h16v12H38v16H26V36H10V24h16z"/><path class="thin" d="M20 54l24-44" stroke-dasharray="3 4"/>`,

    moon: `<path d="M40 8a24 24 0 1 0 16 38A19 19 0 1 1 40 8z"/><path class="thin" d="M14 12l1 3 3 1-3 1-1 3-1-3-3-1 3-1z"/>`,

    cup: `<path d="M15 24h30v22c0 4-3 7-7 7H22c-4 0-7-3-7-7z"/><path d="M45 29h4a6 6 0 0 1 0 12h-4"/><path class="thin" d="M22 18c-3-4 3-6 0-11M30 18c-3-4 3-6 0-11M38 18c-3-4 3-6 0-11"/>`,

    bottle: `<path d="M27 6h10v4h-10zM28 10v8c-6 3-9 8-9 15v19c0 3 2 5 5 5h16c3 0 5-2 5-5V33c0-7-3-12-9-15v-8"/><rect class="thin" x="23" y="34" width="18" height="12" rx="1"/>`,

    cigar: `<path d="M6 36h40a5 5 0 0 1 0 10H6z"/><path class="thin" d="M36 36v10M40 36v10"/><path d="M6 36v10" class="thick"/><path class="thin" d="M12 31c-4-5 4-8 1-14-3-5 3-8 2-12"/>`,

    music: `<path d="M22 47V17l24-6v30M22 23l24-6"/><circle class="f" cx="17" cy="47" r="5.5"/><circle class="f" cx="41" cy="41" r="5.5"/>`,

    book: `<path d="M32 17c-7-5-17-5-24-1v33c7-4 17-4 24 1 7-5 17-5 24-1V16c-7-4-17-4-24 1z"/><path d="M32 17v33"/><path class="thin" d="M14 25c4-2 9-2 13 0M14 32c4-2 9-2 13 0M37 25c4-2 9-2 13 0M37 32c4-2 9-2 13 0"/>`,

    quill: `<path d="M53 6C35 10 22 24 18 46c14-6 29-19 35-40z"/><path class="thin" d="M18 46L9 58M24 38c8-6 16-15 22-25"/><path class="thin" d="M30 58h26"/>`,

    revolver: `<path d="M24 22h32v8H24z"/><path d="M12 21h14v14h-6l-4 20H6l5-20c-4-2-4-14 1-14z"/><circle cx="28" cy="30" r="5"/><path class="thin" d="M24 36c0 5 8 5 8 0M52 22v-4"/>`,

    coin: `<circle cx="32" cy="32" r="22"/><circle cx="32" cy="32" r="16" class="thin"/><path d="M37 25c-2-3-10-3-10 2s10 3 10 8-8 5-10 2M32 20v24"/>`,

    fish: `<path d="M6 32c10-14 30-14 40 0-10 14-30 14-40 0z"/><path d="M46 32l12-9v18z"/><circle class="f" cx="16" cy="30" r="2.4"/><path class="thin" d="M26 24c3 5 3 11 0 16"/>`,

    hammer: `<path d="M12 54l26-26" class="thick"/><path d="M30 14l14-6 12 12-6 14-6-6-8 0 0-8z"/>`,

    cards: `<rect x="10" y="14" width="26" height="38" rx="3" transform="rotate(-12 23 33)"/><rect x="28" y="12" width="26" height="38" rx="3" transform="rotate(10 41 31)"/><path class="f" d="M41 24c-4 4-8 7-4 10 2 1 3 0 4-1 1 1 2 2 4 1 4-3 0-6-4-10z"/>`,

    broom: `<path d="M48 4L28 38" class="thick"/><path d="M28 38l-14 5-6 15 20-6 6-12z"/><path class="thin" d="M14 50l12-8M18 55l10-8"/>`,

    mirror: `<circle cx="28" cy="24" r="16"/><circle cx="28" cy="24" r="11" class="thin"/><path d="M39 36l15 17" class="thick"/><path class="thin" d="M22 18c2-3 5-4 8-4"/>`,

    stop: `<rect x="16" y="16" width="32" height="32" rx="3"/>`,
    close: `<path d="M16 16l32 32M48 16L16 48"/>`,
    search: `<circle cx="27" cy="27" r="16"/><path d="M39 39l16 16" class="thick"/>`,
    camera: `<path d="M8 20h12l4-6h16l4 6h12v32H8z"/><circle cx="32" cy="35" r="10"/>`,
    body: `${head(32, 10)}<path d="M32 16v22M32 38l-8 18M32 38l8 18M32 22l-12 10M32 22l12 10"/>`,
    torso: `${head(32, 14)}<path d="M32 20v18M32 26l-12 10M32 26l12 10"/><path class="thin" d="M18 44h28" stroke-dasharray="3 4"/>`,
    sort: `<path d="M20 10v44M12 46l8 8 8-8M44 54V10M36 18l8-8 8 8"/>`,
};

function icon(name, cls = '') {
    return `<svg class="ico ${cls}" viewBox="0 0 64 64" aria-hidden="true">${ICONS[name] || ICONS.star}</svg>`;
}
