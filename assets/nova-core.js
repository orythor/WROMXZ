// ─── CONFIG ────────────────────────────────────────────────────────────────────
const SUPABASE_URL = 'https://dgpzbeupgzmqxnqsdnfv.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRncHpiZXVwZ3ptcXhucXNkbmZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQzOTU3NzAsImV4cCI6MjA5OTk3MTc3MH0.tm9MDxrKBvlPL_p5EER7mFpto1wMcWRwAYxPK0nAn9Q';
const TABLE = 'prompts';

// ─── SUPABASE HELPERS ──────────────────────────────────────────────────────────
window.sbFetch = async function(path, opts = {}) {
const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
        ...(opts.headers || {})
    },
    ...opts
});
if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `HTTP ${res.status}`);
}
const text = await res.text();
return text ? JSON.parse(text) : null;
};

window.getPrompts = () => sbFetch(`${TABLE}?order=created_at.desc&select=id,title,creator,jenis_prompt,description,content,created_at`);
window.deletePrompt = id => sbFetch(`${TABLE}?id=eq.${id}`, { method: 'DELETE' });

// ─── GLOBAL STATE ──────────────────────────────────────────────────────────────
window.allPrompts      = [];
window.currentFiltered = [];
window.currentPage     = 1;
window.ITEMS_PER_PAGE  = 12;
window.searchQuery     = '';
window.modalCurrentPrompt = null;

// ─── CANVAS PARTICLES ──────────────────────────────────────────────────────────
(() => {
const canvas = document.getElementById('bg-canvas');
if (!canvas) return;
const ctx = canvas.getContext('2d', { alpha: true });
let particles = [], rafId = null, isRunning = true;

let resizeTimer;
function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { resize(); init(); }, 200);
}, { passive: true });
resize();

class P {
    constructor(initY = false) { this.reset(initY); }
    reset(initY = false) {
        this.x = Math.random() * canvas.width;
        this.y = initY ? Math.random() * canvas.height : canvas.height + 10;
        this.s = Math.random() * 2.5 + 1.5;
        this.vx = (Math.random() - 0.5) * 0.2;
        this.vy = -(Math.random() * 0.35 + 0.1);
        this.o = Math.random() * 0.25 + 0.05;
        this.type = Math.random() > 0.5 ? 'd' : 'x';
    }
    update() {
        this.x += this.vx; this.y += this.vy;
        if (this.y < -10 || this.x < -10 || this.x > canvas.width + 10) this.reset();
    }
    draw() {
        ctx.globalAlpha = this.o;
        ctx.fillStyle = '#ffffff'; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 0.8;
        if (this.type === 'd') {
            ctx.beginPath();
            ctx.moveTo(this.x, this.y - this.s); ctx.lineTo(this.x + this.s * 0.65, this.y);
            ctx.lineTo(this.x, this.y + this.s); ctx.lineTo(this.x - this.s * 0.65, this.y);
            ctx.closePath(); ctx.fill();
        } else {
            ctx.beginPath();
            ctx.moveTo(this.x - this.s * 0.6, this.y); ctx.lineTo(this.x + this.s * 0.6, this.y);
            ctx.moveTo(this.x, this.y - this.s * 0.6); ctx.lineTo(this.x, this.y + this.s * 0.6);
            ctx.stroke();
        }
        ctx.globalAlpha = 1;
    }
}

function init() {
    particles = [];
    const isMobile = window.innerWidth < 768;
    const n = isMobile ? Math.min(Math.floor(canvas.width / 50), 30) : Math.min(Math.floor(canvas.width / 30), 70);
    for (let i = 0; i < n; i++) particles.push(new P(true));
}

function loop() {
    if (!isRunning) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    rafId = requestAnimationFrame(loop);
}

document.addEventListener('visibilitychange', () => {
    if (document.hidden) { isRunning = false; if (rafId) cancelAnimationFrame(rafId); }
    else { isRunning = true; loop(); }
});

init(); loop();
})();

// ─── SIDEBAR ───────────────────────────────────────────────────────────────────
const _sidebar  = document.getElementById('sidebar');
const _overlay  = document.getElementById('overlay');
const _openBtn  = document.getElementById('open-sidebar');
const _closeBtn = document.getElementById('close-sidebar');

window.toggleSidebar = function(open) {
_sidebar.classList.toggle('open', open);
_overlay.classList.toggle('show', open);
};

_openBtn.addEventListener('click',  () => toggleSidebar(true));
_closeBtn.addEventListener('click', () => toggleSidebar(false));
_overlay.addEventListener('click',  () => toggleSidebar(false));

// ─── TOAST ─────────────────────────────────────────────────────────────────────
window.showToast = function(msg, type = 'success') {
const el = document.getElementById('toast');
el.className = `toast ${type}`;
document.getElementById('toast-msg').textContent = msg;
el.classList.add('show');
setTimeout(() => el.classList.remove('show'), 3000);
};

// ─── COPY + DOWNLOAD HELPERS ───────────────────────────────────────────────────
window.copyText = function(text, btn) {
navigator.clipboard.writeText(text).then(() => {
    if (btn) {
        const orig = btn.innerHTML;
        btn.classList.add('copied');
        btn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg> Tersalin';
        setTimeout(() => { btn.classList.remove('copied'); btn.innerHTML = orig; }, 2000);
    }
    showToast('Prompt disalin!');
}).catch(() => showToast('Gagal menyalin', 'error'));
};

window.downloadText = function(text, title) {
const a = document.createElement('a');
const filename = (title || 'prompt').replace(/[^a-z0-9]/gi, '_').toLowerCase().slice(0, 40) + '.txt';
a.href = URL.createObjectURL(new Blob([text], { type: 'text/plain' }));
a.download = filename;
a.click();
showToast('File diunduh');
};

// ─── MODAL ─────────────────────────────────────────────────────────────────────
const _modal     = document.getElementById('view-modal');
const _closeModal= document.getElementById('close-view-modal');

window.openViewModal = function(id) {
const p = window.allPrompts.find(x => x.id === id);
if (!p) return;
window.modalCurrentPrompt = p;
document.getElementById('modal-title').textContent    = p.title || 'Blueprint';
document.getElementById('modal-tag-label').textContent = p.jenis_prompt || '';
document.getElementById('modal-body').textContent      = p.content || '';
_modal.classList.add('show');
};

_closeModal.addEventListener('click', () => _modal.classList.remove('show'));
_modal.addEventListener('click', e => { if (e.target === _modal) _modal.classList.remove('show'); });

document.getElementById('modal-copy-btn').addEventListener('click', function() {
if (window.modalCurrentPrompt) copyText(window.modalCurrentPrompt.content, this);
});
document.getElementById('modal-download-btn').addEventListener('click', function() {
if (window.modalCurrentPrompt) downloadText(window.modalCurrentPrompt.content, window.modalCurrentPrompt.title);
});

// ─── SPA ROUTER ────────────────────────────────────────────────────────────────
const PAGE_ROUTES = {
'dashboard'  : '/dashboard',
'hub'        : '/hub',
'host-info'  : '/tools/host-info',
'anime-news' : '/tools/anime',
'qr-gen'     : '/tools/qr',
'cipherx'    : '/cipherx',
};

const PAGE_FILES = {
'dashboard'  : 'pages/dashboard.html',
'hub'        : 'pages/hub.html',
'host-info'  : 'pages/host-info.html',
'anime-news' : 'pages/anime-news.html',
'qr-gen'     : 'pages/qr-gen.html',
'cipherx'    : 'pages/cipherx.html',
};

// JS modul per halaman — di-load sekali, tidak di-reload
const PAGE_JS = {
'hub'        : 'assets/hub.js',
'host-info'  : 'assets/host-info.js',
'anime-news' : 'assets/anime.js',
'qr-gen'     : 'assets/qr.js',
'cipherx'    : 'assets/cipherx.js',
};

const _loadedScripts  = new Set();
const _pageCache      = new Map();   // cache HTML per page
const _pageContent    = document.getElementById('page-content');
const _pageLoading    = document.getElementById('page-loading');

function resolveRoute(path) {
const clean = path.replace(/\/+$/, '') || '/dashboard';
const found = Object.entries(PAGE_ROUTES).find(([, r]) => r === clean);
return found ? found[0] : 'dashboard';
}

async function loadPageScript(id) {
const src = PAGE_JS[id];
if (!src || _loadedScripts.has(src)) return;
_loadedScripts.add(src);
await new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
});
}

async function switchPage(id) {
// Update nav active state
document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
document.querySelector(`.nav-item[data-page="${id}"]`)?.classList.add('active');
toggleSidebar(false);

// Update URL
const route = PAGE_ROUTES[id] || '/dashboard';
history.pushState({ page: id }, '', route);

// Tampilkan loading
_pageLoading.style.display = 'flex';
_pageContent.style.opacity = '0';

try {
    // Fetch HTML fragment (dari cache jika sudah pernah dimuat)
    let html;
    if (_pageCache.has(id)) {
        html = _pageCache.get(id);
    } else {
        const res = await fetch(PAGE_FILES[id]);
        if (!res.ok) throw new Error(`Gagal memuat halaman (${res.status})`);
        html = await res.text();
        _pageCache.set(id, html);
    }

    // Inject HTML ke container
    _pageContent.innerHTML = html;

    // Load JS modul halaman (sekali saja)
    await loadPageScript(id);

    // Trigger init callback jika ada (dipanggil setelah HTML di-inject)
    if (typeof window[`nova_init_${id.replace('-','_')}`] === 'function') {
        window[`nova_init_${id.replace('-','_')}`]();
    }

    // Scroll ke atas
    const main = document.querySelector('main');
    if (main) main.scrollTop = 0;

    // Fade in konten
    _pageLoading.style.display = 'none';
    _pageContent.style.transition = 'opacity 0.18s ease';
    _pageContent.style.opacity = '1';

} catch(err) {
    _pageLoading.style.display = 'none';
    _pageContent.style.opacity = '1';
    _pageContent.innerHTML = `
        <div class="state-box" style="margin-top:4rem;">
            <p class="state-title">Gagal memuat halaman</p>
            <p style="font-size:0.75rem;color:var(--text-muted);">${err.message}</p>
        </div>`;
}
}

// Browser back/forward
window.addEventListener('popstate', e => {
const id = e.state?.page || resolveRoute(location.pathname);
switchPage(id);
});

// Nav klik
document.querySelectorAll('.nav-item').forEach(item => {
item.addEventListener('click', () => switchPage(item.dataset.page));
});

// Initial load
(async () => {
const id = resolveRoute(location.pathname);
if (location.pathname === '/' || location.pathname === '') {
    history.replaceState({ page: 'dashboard' }, '', '/dashboard');
}
await switchPage(id);
})();

// ─── ANTI-PROXY FETCH INTERCEPTOR ──────────────────────────────────────────────
const _originalFetch = window.fetch;
const _BLOCKED_PROXY_HOSTS = [
'allorigins.win','corsproxy.io','cors.eu.org','cors.sh',
'cors-anywhere.herokuapp','thingproxy.freeboard.io',
'api.codetabs.com','whateverorigin.com','corsfix.com',
'cors.bridged.cc','worker.bridged.cc','cors.io',
'crossorigin.me','pass.ai','corsanywhere'
];

window.fetch = async function(url, opts = {}) {
const urlStr = typeof url === 'string' ? url : (url?.url || String(url));
const urlLow = urlStr.toLowerCase();

if (_BLOCKED_PROXY_HOSTS.some(h => urlLow.includes(h))) {
    return new Response(JSON.stringify({ error: 'cors_proxy_blocked' }), {
        status: 403, headers: { 'Content-Type': 'application/json' }
    });
}

if (opts && typeof opts === 'object' && !Array.isArray(opts.headers)) {
    opts.headers = opts.headers || {};
    try { opts.headers['X-Nova-Origin'] = window.__novaSecured ? '1' : '0'; } catch {}
}

return _originalFetch.apply(this, arguments);
};
