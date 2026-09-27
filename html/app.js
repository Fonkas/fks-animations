'use strict';

const RES = typeof GetParentResourceName === 'function' ? GetParentResourceName() : null;

function post(name, data = {}) {
    if (!RES) return Promise.resolve(window.devPost ? window.devPost(name, data) : null);
    return fetch(`https://${RES}/${name}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=UTF-8' },
        body: JSON.stringify(data),
    }).then(r => r.json()).catch(() => null);
}

const $ = sel => document.querySelector(sel);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const arr = v => Array.isArray(v) ? v : []; // lua sends {} for empty tables
const norm = s => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

// ---------------------------------------------------------------- state
const S = {
    anims: [], byId: {}, cats: [], L: {}, command: 'e', locale: 'en',
    slots: 6, slotKeys: [],
    fav: new Set(), shortcuts: [], recent: [], playing: false,
    q: '', sel: 0, open: false, view: [],
    tab: 'all', sort: 'az', mode: 'full', preview: false,
};

// per-player UI preferences
const PREFS_KEY = 'fks-animations';
try { Object.assign(S, JSON.parse(localStorage.getItem(PREFS_KEY)) || {}); } catch (e) { /* no storage */ }
function savePrefs() {
    try { localStorage.setItem(PREFS_KEY, JSON.stringify({ tab: S.tab, sort: S.sort, mode: S.mode, preview: S.preview })); } catch (e) { /* no storage */ }
}

const el = {
    book: $('#book'), tabs: $('#tabs'), grid: $('#grid'), slots: $('#slots'), q: $('#q'), search: $('#search'),
    secName: $('#section-name'), secCount: $('#section-count'), toast: $('#toast'), ghost: $('#ghost'),
    body: $('#btn-body'), cam: $('#btn-cam'), close: $('#btn-close'), sort: $('#btn-sort'), stop: $('#btn-stop'), clear: $('#btn-clear'),
};

// ---------------------------------------------------------------- helpers
let toastTimer;
function toast(text, err) {
    el.toast.textContent = text;
    el.toast.className = 'show' + (err ? ' err' : '');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { el.toast.className = err ? 'err' : ''; }, 1800);
}

function tabList() {
    return [
        { id: 'all', label: S.L.all, icon: 'grid' },
        { id: 'fav', label: S.L.favorites, icon: 'star' },
        { id: 'recent', label: S.L.recent, icon: 'watch' },
        ...S.cats,
    ];
}

function countFor(id) {
    if (id === 'all') return S.anims.length;
    if (id === 'fav') return S.fav.size;
    if (id === 'recent') return S.recent.length;
    return S.anims.filter(a => a.cat === id).length;
}

function query() {
    // accepts "sit", "/e sit" or "e sit"
    return norm(S.q.trim()).replace(new RegExp(`^/?(${S.command}\\s+)?`), '').replace(/^\//, '');
}

function computeView() {
    const q = query();
    let list;
    if (q) {
        list = S.anims.filter(a => a._n.includes(q) || a.id.includes(q));
        list.sort((a, b) => (b._n.startsWith(q) || b.id.startsWith(q)) - (a._n.startsWith(q) || a.id.startsWith(q)) || a.label.localeCompare(b.label, S.locale));
        return list;
    }
    if (S.tab === 'recent') return S.recent.map(id => S.byId[id]).filter(Boolean);
    if (S.tab === 'fav') list = S.anims.filter(a => S.fav.has(a.id));
    else if (S.tab === 'all') list = S.anims.slice();
    else list = S.anims.filter(a => a.cat === S.tab);
    list.sort((a, b) => a.label.localeCompare(b.label, S.locale));
    if (S.sort === 'za') list.reverse();
    return list;
}

// ---------------------------------------------------------------- render
function renderStatic() {
    document.querySelectorAll('[data-l]').forEach(n => { n.textContent = S.L[n.dataset.l] || ''; });
    el.q.placeholder = S.L.search || '';
    $('#search-ico').outerHTML = icon('search');
    el.clear.innerHTML = icon('close');
    el.close.innerHTML = icon('close');
    el.close.title = S.L.close || '';
    el.cam.title = S.L.preview_hint || '';
    el.body.title = S.L.body_hint || '';
    el.stop.innerHTML = icon('stop') + `<span>${esc(S.L.stop)}</span>`;
    el.slots.style.setProperty('--slots', S.slots);
}

function renderTools() {
    el.body.innerHTML = icon(S.mode === 'upper' ? 'torso' : 'body') + `<span>${esc(S.mode === 'upper' ? S.L.upper_body : S.L.full_body)}</span>`;
    el.body.classList.toggle('on', S.mode === 'upper');
    el.cam.innerHTML = icon('camera') + `<span>${esc(S.L.preview)}</span>`;
    el.cam.classList.toggle('on', S.preview);
    el.sort.innerHTML = icon('sort') + `<span>${esc(S.sort === 'za' ? S.L.sort_za : S.L.sort_az)}</span>`;
    el.stop.classList.toggle('idle', !S.playing);
}

function renderTabs() {
    const searching = !!query();
    el.tabs.innerHTML = tabList().map(t => `
        <button class="tab ${!searching && t.id === S.tab ? 'active' : ''}" data-tab="${esc(t.id)}" title="${esc(t.label)}">
            ${icon(t.icon)}<span class="n">${countFor(t.id)}</span>
        </button>`).join('');
}

function cardHtml(a, i) {
    const art = a.image ? `<img src="${esc(a.image)}" alt="">` : icon(a.icon);
    return `
        <div class="card ${S.playing === a.id ? 'on' : ''} ${i === S.sel ? 'sel' : ''}" data-id="${esc(a.id)}" style="--d:${Math.min(i, 24) * 15}ms">
            <button class="star ${S.fav.has(a.id) ? 'fav' : ''}" data-star="${esc(a.id)}">${icon('star')}</button>
            <span class="badge">${esc(S.L.playing)}</span>
            <div class="art">${art}</div>
            <div class="name" title="${esc(a.label)}">${esc(a.label)}</div>
            <div class="cmd">/${esc(S.command)} ${esc(a.id)}</div>
        </div>`;
}

function renderGrid(keepScroll) {
    const q = query();
    S.view = computeView();
    if (S.sel >= S.view.length) S.sel = Math.max(0, S.view.length - 1);

    const tab = tabList().find(t => t.id === S.tab) || tabList()[0];
    el.secName.textContent = q ? S.L.results : tab.label;
    el.secCount.textContent = `· ${S.view.length}`;

    if (!S.view.length) {
        const [ico, text] = q ? ['search', S.L.empty]
            : S.tab === 'fav' ? ['star', S.L.empty_fav]
            : S.tab === 'recent' ? ['watch', S.L.empty_recent]
            : ['search', S.L.empty];
        el.grid.innerHTML = `<div class="empty">${icon(ico)}${esc(text)}</div>`;
        return;
    }
    const top = el.grid.scrollTop;
    el.grid.innerHTML = S.view.map(cardHtml).join('');
    el.grid.scrollTop = keepScroll ? top : 0;
}

function renderSlots() {
    let html = '';
    for (let i = 0; i < S.slots; i++) {
        const a = S.byId[S.shortcuts[i]];
        const key = S.slotKeys[i] ? `<span class="k">${esc(S.slotKeys[i])}</span>` : '';
        html += a
            ? `<div class="slot set ${S.playing === a.id ? 'on' : ''}" data-slot="${i}" title="${esc(a.label)}">${a.image ? `<img src="${esc(a.image)}" style="width:40%">` : icon(a.icon)}<span class="nm">${esc(a.label)}</span>${key}</div>`
            : `<div class="slot" data-slot="${i}" title="${esc(S.L.slot_empty)}"><span class="plus">+</span>${key}</div>`;
    }
    el.slots.innerHTML = html;
}

function renderAll(keepScroll) {
    renderTools();
    renderTabs();
    renderGrid(keepScroll);
    renderSlots();
}

function markPlaying() {
    document.querySelectorAll('.card').forEach(c => c.classList.toggle('on', c.dataset.id === S.playing));
    document.querySelectorAll('.slot.set').forEach(s => s.classList.toggle('on', S.shortcuts[s.dataset.slot] === S.playing));
    el.stop.classList.toggle('idle', !S.playing);
}

function markSel(scroll) {
    const cards = el.grid.querySelectorAll('.card');
    cards.forEach((c, i) => c.classList.toggle('sel', i === S.sel));
    if (scroll && cards[S.sel]) cards[S.sel].scrollIntoView({ block: 'nearest' });
}

// ---------------------------------------------------------------- actions
function play(id) {
    if (!S.byId[id]) return;
    post('play', { id, mode: S.mode }).then(res => {
        if (!res) return;
        if (res.ok === false) return toast(res.error || S.L.empty, true);
        S.playing = id;
        if (Array.isArray(res.recent)) S.recent = res.recent;
        markPlaying();
        renderTabs();
        if (S.tab === 'recent' && !query()) renderGrid(true);
    });
}

function stop() {
    post('stop');
    S.playing = false;
    markPlaying();
}

function toggleFav(id, starEl) {
    const on = !S.fav.has(id);
    if (on) S.fav.add(id); else S.fav.delete(id);
    post('favorite', { id, on });
    toast(on ? S.L.fav_on : S.L.fav_off);
    renderTabs();
    if (S.tab === 'fav' && !query()) return renderGrid(true);
    const star = starEl || el.grid.querySelector(`[data-star="${CSS.escape(id)}"]`);
    if (star) {
        star.classList.toggle('fav', on);
        star.classList.remove('pop'); void star.offsetWidth; star.classList.add('pop');
    }
}

function setSlot(slot, id) {
    S.shortcuts[slot] = id || '';
    post('shortcut', { slot: slot + 1, id: id || '' });
    renderSlots();
    toast((id ? S.L.slot_set : S.L.slot_clear).replace('%s', slot + 1));
}

function setTab(id) {
    S.tab = id;
    S.sel = 0;
    if (S.q) { S.q = ''; el.q.value = ''; el.search.classList.remove('has'); }
    savePrefs();
    renderTabs();
    renderGrid();
}

function close() {
    if (!S.open) return;
    S.open = false;
    el.book.classList.add('hidden');
    endDrag();
    post('close');
}

// ---------------------------------------------------------------- events
el.tabs.addEventListener('click', e => {
    const t = e.target.closest('[data-tab]');
    if (t) setTab(t.dataset.tab);
});

el.q.addEventListener('input', () => {
    S.q = el.q.value;
    S.sel = 0;
    el.search.classList.toggle('has', !!S.q);
    renderTabs();
    renderGrid();
});
el.search.addEventListener('mousedown', e => { if (e.target !== el.q) { e.preventDefault(); el.q.focus(); } });
el.clear.addEventListener('click', () => { el.q.value = ''; el.q.dispatchEvent(new Event('input')); });

el.body.addEventListener('click', () => { S.mode = S.mode === 'upper' ? 'full' : 'upper'; savePrefs(); renderTools(); });
el.cam.addEventListener('click', () => { S.preview = !S.preview; savePrefs(); renderTools(); post('preview', { on: S.preview }); });
el.sort.addEventListener('click', () => { S.sort = S.sort === 'za' ? 'az' : 'za'; savePrefs(); renderTools(); renderGrid(); });
el.close.addEventListener('click', close);
el.stop.addEventListener('click', stop);

el.grid.addEventListener('contextmenu', e => {
    const card = e.target.closest('.card');
    if (!card) return;
    e.preventDefault();
    toggleFav(card.dataset.id, card.querySelector('.star'));
});

el.slots.addEventListener('click', e => {
    const s = e.target.closest('.slot.set');
    if (!s) return;
    const id = S.shortcuts[s.dataset.slot];
    if (id === S.playing) stop(); else play(id);
});
el.slots.addEventListener('contextmenu', e => {
    const s = e.target.closest('.slot.set');
    if (!s) return;
    e.preventDefault();
    setSlot(+s.dataset.slot, '');
});

// press on a card: click = play, star = favourite, drag = shortcut
let drag = null;
el.grid.addEventListener('mousedown', e => {
    if (e.button !== 0) return;
    const star = e.target.closest('[data-star]');
    if (star) return;
    const card = e.target.closest('.card');
    if (!card) return;
    drag = { id: card.dataset.id, x: e.clientX, y: e.clientY, moving: false };
});
el.grid.addEventListener('click', e => {
    const star = e.target.closest('[data-star]');
    if (star) toggleFav(star.dataset.star, star);
});

function slotAt(x, y) {
    const n = document.elementFromPoint(x, y);
    return n && n.closest('.slot');
}

window.addEventListener('mousemove', e => {
    if (!drag) return;
    if (!drag.moving && Math.hypot(e.clientX - drag.x, e.clientY - drag.y) > 6) {
        drag.moving = true;
        const a = S.byId[drag.id];
        el.ghost.innerHTML = a.image ? `<img src="${esc(a.image)}" style="width:100%;height:100%">` : icon(a.icon);
        el.ghost.classList.add('show');
        document.body.classList.add('dragging');
    }
    if (!drag.moving) return;
    const r = el.ghost.offsetWidth / 2;
    el.ghost.style.transform = `translate(${e.clientX - r}px, ${e.clientY - r}px)`;
    const over = slotAt(e.clientX, e.clientY);
    document.querySelectorAll('.slot').forEach(s => s.classList.toggle('drop', s === over));
});

window.addEventListener('mouseup', e => {
    if (!drag) return;
    const d = drag;
    if (d.moving) {
        const s = slotAt(e.clientX, e.clientY);
        if (s) setSlot(+s.dataset.slot, d.id);
    } else if (e.target.closest('.card')?.dataset.id === d.id) {
        S.sel = S.view.findIndex(a => a.id === d.id);
        markSel();
        play(d.id);
    }
    endDrag();
});

function endDrag() {
    drag = null;
    el.ghost.classList.remove('show');
    document.body.classList.remove('dragging');
    document.querySelectorAll('.slot.drop').forEach(s => s.classList.remove('drop'));
}

window.addEventListener('keydown', e => {
    if (!S.open) return;
    if (e.key === 'Escape' || e.key === 'F7') { e.preventDefault(); return close(); }

    const typing = document.activeElement === el.q;
    const cols = 3;
    const move = { ArrowDown: cols, ArrowUp: -cols, ArrowRight: 1, ArrowLeft: -1 }[e.key];
    if (move && S.view.length && (!typing || !S.q || Math.abs(move) === cols)) {
        e.preventDefault();
        S.sel = Math.min(S.view.length - 1, Math.max(0, S.sel + move));
        return markSel(true);
    }
    if (e.key === 'Enter' && S.view[S.sel]) { e.preventDefault(); return play(S.view[S.sel].id); }
    if (e.key === 'Tab') {
        e.preventDefault();
        const tabs = tabList();
        const i = tabs.findIndex(t => t.id === S.tab);
        return setTab(tabs[(i + (e.shiftKey ? -1 : 1) + tabs.length) % tabs.length].id);
    }
    // start typing anywhere -> search
    if (!typing && e.key.length === 1 && !e.ctrlKey && !e.altKey) el.q.focus();
});

// ---------------------------------------------------------------- messages from lua
window.addEventListener('message', ({ data: msg }) => {
    if (!msg || !msg.action) return;
    switch (msg.action) {
        case 'init':
            S.anims = arr(msg.animations).map(a => ({ ...a, _n: norm(a.label) }));
            S.byId = Object.fromEntries(S.anims.map(a => [a.id, a]));
            S.cats = arr(msg.categories).map(c => ({ id: c.id, label: c.label, icon: c.icon }));
            S.L = msg.lang || {};
            S.command = msg.command || 'e';
            S.locale = msg.locale || 'en';
            document.documentElement.lang = S.locale;
            S.slots = msg.slots || 6;
            S.slotKeys = arr(msg.slotKeys);
            if (!tabList().some(t => t.id === S.tab)) S.tab = 'all';
            renderStatic();
            break;

        case 'open':
            S.fav = new Set(arr(msg.favorites));
            S.shortcuts = arr(msg.shortcuts);
            S.recent = arr(msg.recent);
            S.playing = msg.playing || false;
            S.open = true;
            S.sel = 0;
            renderAll();
            el.book.classList.remove('hidden');
            setTimeout(() => el.q.focus(), 50);
            if (S.preview) post('preview', { on: true });
            break;

        case 'close':
            S.open = false;
            el.book.classList.add('hidden');
            endDrag();
            break;

        case 'playing':
            S.playing = msg.id || false;
            markPlaying();
            break;
    }
});
