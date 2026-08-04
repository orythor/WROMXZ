// ─── ANIME NEWS MODULE ─────────────────────────────────────────────────────────
// DOM-safe — semua DOM query di dalam nova_init_anime_news()

let _anListView, _anDetailView, _anListInner, _anDetailInner;
window._anCache = null;

function _anFormatDate(str) {
    if (!str) return '';
    try { return new Date(str).toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric' }); }
    catch { return str; }
}

function _anRenderList(items) {
    if (!_anListInner) return;
    const cards = items.map(item => {
        const id  = item.id || item.slug || item.link || '';
        const img = item.thumbnail || item.image || item.img || '';
        return '<div class="an-card" data-id="' + id + '">'
            + (img ? '<img class="an-card-img" src="' + img + '" alt="">' : '<div class="an-card-img" style="height:80px;background:#111;"></div>')
            + '<div class="an-card-body">'
            + '<div class="an-card-title">' + (item.title || 'Tanpa judul') + '</div>'
            + '<div class="an-card-date">' + _anFormatDate(item.date || item.published_at || item.created_at) + '</div>'
            + '</div></div>';
    }).join('');

    _anListInner.innerHTML = '<div class="an-grid">' + cards + '</div>';
    _anListInner.querySelectorAll('.an-card').forEach(card => {
        card.addEventListener('click', () => _anOpenDetail(card.dataset.id, items));
    });
}

async function _anOpenDetail(id, items) {
    const item = items.find(i => String(i.id || i.slug || i.link || '') === String(id));
    _anListView.style.display   = 'none';
    _anDetailView.style.display = 'block';
    _anDetailInner.innerHTML    = '<div class="tool-spinner"><div class="spinner" style="width:14px;height:14px;border-width:2px"></div> Memuat detail...</div>';

    try {
        const res  = await fetch('https://api.emiliabot.my.id/anime/berita?id=' + encodeURIComponent(id));
        const data = await res.json();
        const d    = data.result || data.data || data;

        const title   = d.title || item?.title || 'Tanpa judul';
        const date    = d.date  || item?.date  || '';
        const content = d.content || d.body || d.text || '';
        const img     = d.thumbnail || d.image || item?.thumbnail || '';

        let html = '<div class="an-back-btn" id="an-back">'
            + '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/></svg>'
            + ' Kembali ke daftar</div>';
        if (img) html += '<img src="' + img + '" class="an-detail-img" alt="" style="width:100%;border-radius:10px;margin-bottom:1rem;display:block;">';
        html += '<div class="an-detail-title">' + title + '</div>';
        if (date) html += '<div class="an-detail-date">' + _anFormatDate(date) + '</div>';
        html += '<div class="an-detail-content">' + (content || '<em style="color:var(--text-muted)">Konten tidak tersedia.</em>') + '</div>';

        _anDetailInner.innerHTML = html;
        document.getElementById('an-back')?.addEventListener('click', () => {
            _anDetailView.style.display = 'none';
            _anListView.style.display   = 'block';
        });
    } catch(e) {
        _anDetailInner.innerHTML = '<div class="an-back-btn" id="an-back2">'
            + '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/></svg>'
            + ' Kembali</div><div class="tool-error">⚠ ' + e.message + '</div>';
        document.getElementById('an-back2')?.addEventListener('click', () => {
            _anDetailView.style.display = 'none';
            _anListView.style.display   = 'block';
        });
    }
}

async function _anLoadNews() {
    if (!_anListInner) return;
    _anListInner.innerHTML = '<div class="tool-spinner"><div class="spinner" style="width:14px;height:14px;border-width:2px"></div> Memuat berita...</div>';
    try {
        const res   = await fetch('https://api.emiliabot.my.id/anime/berita');
        const data  = await res.json();
        const items = data.result || data.data || data.results || data || [];
        if (!Array.isArray(items) || !items.length) throw new Error('Tidak ada berita tersedia.');
        window._anCache = items;
        _anRenderList(items);
    } catch(e) {
        if (_anListInner) _anListInner.innerHTML = '<div class="tool-error">⚠ ' + e.message + '</div>';
    }
}

window.nova_init_anime_news = function() {
    _anListView    = document.getElementById('an-list-view');
    _anDetailView  = document.getElementById('an-detail-view');
    _anListInner   = document.getElementById('an-list-inner');
    _anDetailInner = document.getElementById('an-detail-inner');
    if (window._anCache) _anRenderList(window._anCache);
    else _anLoadNews();
};
