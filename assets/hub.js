// ─── HUB MODULE ────────────────────────────────────────────────────────────────
// Semua variabel dan fungsi scoped — tidak ada referensi DOM saat load
// nova_init_hub() dipanggil oleh nova-core.js setelah HTML di-inject ke DOM

const ITEMS_PER_PAGE = 12;
let _hubAllPrompts      = [];
let _hubFiltered        = [];
let _hubCurrentPage     = 1;
let _hubSearchQuery     = '';
let _hubCardObserver    = null;
let _hubSearchTimer     = null;
let _hubInitDone        = false;

// ─── SUPABASE (reuse global dari nova-core) ────────────────────────────────────
async function _hubGetPrompts() {
    return window.sbFetch('prompts?order=created_at.desc&select=id,title,creator,jenis_prompt,description,content,created_at');
}
async function _hubDeletePrompt(id) {
    return window.sbFetch(`prompts?id=eq.${id}`, { method: 'DELETE' });
}

// ─── INTERSECTION OBSERVER ─────────────────────────────────────────────────────
function _hubMakeObserver() {
    return new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                _hubCardObserver.unobserve(entry.target);
            }
        });
    }, {
        root: document.querySelector('main'),
        rootMargin: '0px 0px 60px 0px',
        threshold: 0.05
    });
}

// ─── COPY / DOWNLOAD / MODAL ───────────────────────────────────────────────────
function _hubCopyText(text, btn) {
    if (typeof window.copyText === 'function') { window.copyText(text, btn); return; }
    navigator.clipboard.writeText(text).then(() => window.showToast?.('Prompt disalin!'));
}
function _hubDownload(text, title) {
    if (typeof window.downloadText === 'function') { window.downloadText(text, title); return; }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type: 'text/plain' }));
    a.download = (title || 'prompt').replace(/[^a-z0-9]/gi, '_').slice(0, 40) + '.txt';
    a.click();
}
function _hubOpenModal(id) {
    const p = _hubAllPrompts.find(x => x.id === id);
    if (!p) return;
    if (typeof window.openViewModal === 'function') {
        window.allPrompts = _hubAllPrompts; // sync global
        window.openViewModal(id);
    }
}

// ─── RENDER CARDS ──────────────────────────────────────────────────────────────
function _hubRenderCards(prompts) {
    const grid = document.getElementById('prompt-grid');
    const pgWrap = document.getElementById('pagination-wrap');
    if (!grid) return;

    if (!prompts.length) {
        grid.innerHTML = `
            <div class="state-box">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <p class="state-title">Tidak ditemukan</p>
                <p>Coba ubah kata kunci atau filter.</p>
            </div>`;
        if (pgWrap) pgWrap.style.display = 'none';
        return;
    }

    const totalPages = Math.ceil(prompts.length / ITEMS_PER_PAGE);
    if (_hubCurrentPage > totalPages) _hubCurrentPage = totalPages;
    const start     = (_hubCurrentPage - 1) * ITEMS_PER_PAGE;
    const pageItems = prompts.slice(start, start + ITEMS_PER_PAGE);

    grid.innerHTML = pageItems.map(p => `
        <div class="prompt-card" data-id="${p.id}">
            <div class="card-meta">
                ${p.jenis_prompt ? `<span class="tag">${p.jenis_prompt}</span>` : ''}
                ${p.creator ? `<span style="font-size:0.7rem;color:var(--text-dim);">by ${p.creator}</span>` : ''}
            </div>
            <h3 class="card-title">${p.title}</h3>
            ${p.description ? `<div style="font-size:0.8rem;color:var(--text-dim);line-height:1.5;">${p.description}</div>` : ''}
            <p class="card-preview">${p.content}</p>
            <div class="card-actions">
                <button class="action-btn copy" data-action="copy" data-id="${p.id}">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>Salin
                </button>
                <button class="action-btn" data-action="download" data-id="${p.id}">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>Download
                </button>
                <button class="action-btn" data-action="view" data-id="${p.id}">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>View
                </button>
            </div>
        </div>`).join('');

    // Observe cards
    if (_hubCardObserver) {
        grid.querySelectorAll('.prompt-card').forEach(c => _hubCardObserver.observe(c));
    }

    _hubRenderPagination(totalPages);
}

// ─── PAGINATION ─────────────────────────────────────────────────────────────────
function _hubRenderPagination(totalPages) {
    const wrap = document.getElementById('pagination-wrap');
    if (!wrap) return;
    if (totalPages <= 1) { wrap.style.display = 'none'; return; }
    wrap.style.display = 'flex';

    let pages = [];
    if (totalPages <= 7) {
        pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    } else {
        const left  = Math.max(2, _hubCurrentPage - 1);
        const right = Math.min(totalPages - 1, _hubCurrentPage + 1);
        pages = [1];
        if (left > 2) pages.push('...');
        for (let i = left; i <= right; i++) pages.push(i);
        if (right < totalPages - 1) pages.push('...');
        pages.push(totalPages);
    }

    wrap.innerHTML = `
        <button class="pg-btn" id="pg-prev" ${_hubCurrentPage === 1 ? 'disabled' : ''}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        ${pages.map(p => p === '...'
            ? `<span class="pg-ellipsis">···</span>`
            : `<button class="pg-btn ${p === _hubCurrentPage ? 'active' : ''}" data-page="${p}">${p}</button>`
        ).join('')}
        <button class="pg-btn" id="pg-next" ${_hubCurrentPage === totalPages ? 'disabled' : ''}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>`;

    document.getElementById('pg-prev')?.addEventListener('click', () => _hubGoToPage(_hubCurrentPage - 1));
    document.getElementById('pg-next')?.addEventListener('click', () => _hubGoToPage(_hubCurrentPage + 1));
    wrap.querySelectorAll('.pg-btn[data-page]').forEach(btn => {
        btn.addEventListener('click', () => _hubGoToPage(parseInt(btn.dataset.page)));
    });
}

function _hubGoToPage(page) {
    _hubCurrentPage = page;
    _hubRenderCards(_hubFiltered);
    const grid = document.getElementById('prompt-grid');
    if (grid) {
        const rect = grid.getBoundingClientRect();
        grid.scrollIntoView({ behavior: Math.abs(rect.top) > 400 ? 'smooth' : 'instant', block: 'start' });
    }
}

// ─── FILTER / SEARCH ───────────────────────────────────────────────────────────
function _hubFilterAndRender() {
    let res = _hubAllPrompts;
    if (_hubSearchQuery) {
        const q = _hubSearchQuery.toLowerCase();
        res = res.filter(p =>
            (p.title || '').toLowerCase().includes(q) ||
            (p.content || '').toLowerCase().includes(q) ||
            (p.jenis_prompt || '').toLowerCase().includes(q) ||
            (p.creator || '').toLowerCase().includes(q) ||
            (p.description || '').toLowerCase().includes(q)
        );
    }
    _hubFiltered    = res;
    _hubCurrentPage = 1;
    _hubRenderCards(_hubFiltered);
}

// ─── LOAD PROMPTS ──────────────────────────────────────────────────────────────
async function _hubLoadPrompts() {
    const grid = document.getElementById('prompt-grid');
    if (!grid) return;
    grid.innerHTML = `<div class="state-box"><div class="spinner"></div><p>Memuat prompts dari database...</p></div>`;

    try {
        const data = await _hubGetPrompts();
        _hubAllPrompts = data || [];

        // Sync global untuk modal
        window.allPrompts = _hubAllPrompts;

        const statEl = document.getElementById('stat-total');
        if (statEl) statEl.textContent = _hubAllPrompts.length;

        _hubFilterAndRender();
    } catch(e) {
        grid.innerHTML = `<div class="state-box"><p class="state-title">Gagal memuat</p><p>${e.message}</p></div>`;
    }
}

// ─── INIT CALLBACK ─────────────────────────────────────────────────────────────
window.nova_init_hub = function() {
    // Reset state tiap kali page dimuat ulang
    _hubAllPrompts   = [];
    _hubFiltered     = [];
    _hubCurrentPage  = 1;
    _hubSearchQuery  = '';

    // Buat IntersectionObserver baru dengan root = main element saat ini
    _hubCardObserver = _hubMakeObserver();

    // Search input
    const si = document.getElementById('search-input');
    if (si) {
        si.value = '';
        si.addEventListener('input', e => {
            clearTimeout(_hubSearchTimer);
            _hubSearchTimer = setTimeout(() => {
                _hubSearchQuery = e.target.value.trim();
                _hubFilterAndRender();
            }, 150);
        }, { passive: true });
    }

    // Event delegation grid — attach ke container yang sudah ada di DOM
    const grid = document.getElementById('prompt-grid');
    if (grid) {
        grid.addEventListener('click', e => {
            const btn = e.target.closest('.action-btn');
            if (!btn) return;
            const id     = parseInt(btn.dataset.id);
            const action = btn.dataset.action;
            const prompt = _hubAllPrompts.find(x => x.id === id);
            if (!prompt) return;
            if (action === 'copy')     _hubCopyText(prompt.content, btn);
            if (action === 'download') _hubDownload(prompt.content, prompt.title);
            if (action === 'view')     _hubOpenModal(id);
        });
    }

    // Load data
    _hubLoadPrompts();
};
