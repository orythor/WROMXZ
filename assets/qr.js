// QR GENERATOR MODULE — DOM-safe
let _qrText, _qrCount, _qrSize, _qrBtn, _qrResult, _qrInner;
let _qrTimer;

function _qrGenerate(silent = false) {
    const text = _qrText?.value.trim();
    if (!text) { if (!silent) { _qrText?.focus(); showToast('Masukkan teks atau URL', 'error'); } return; }
    const size = parseInt(_qrSize?.value) || 300;
    if (!silent) { _qrBtn.disabled = true; _qrBtn.innerHTML = '<div class="spinner" style="width:14px;height:14px;border-width:2px;border-color:#000 transparent transparent transparent;"></div> Membuat...'; }
    _qrResult.classList.add('show');
    if (!silent) _qrInner.innerHTML = '<div class="tool-spinner"><div class="spinner" style="width:14px;height:14px;border-width:2px"></div> Membuat QR code...</div>';

    fetch('https://api-faa.my.id/faa/qr-create?text=' + encodeURIComponent(text) + '&size=' + size)
        .then(res => {
            const ct = res.headers.get('content-type') || '';
            if (ct.includes('image/')) return res.blob().then(b => ({ type:'blob', data:b }));
            return res.json().then(d => ({ type:'json', data:d }));
        })
        .then(({ type, data }) => {
            const qrUrl = type === 'blob'
                ? URL.createObjectURL(data)
                : (data.result || data.url || data.image || data.qr || data.data?.url || data.link);
            if (!qrUrl) throw new Error('QR image tidak ditemukan.');
            _qrInner.innerHTML =
                '<div class="qr-result-wrap">' +
                '<div class="qr-img-box"><img src="' + qrUrl + '" alt="QR Code" width="' + Math.min(size,220) + '" height="' + Math.min(size,220) + '"></div>' +
                '<div class="qr-actions">' +
                '<a class="tool-btn" href="' + qrUrl + '" download="qr-' + Date.now() + '.png" style="flex:1;justify-content:center;padding:0.65rem;text-decoration:none;" target="_blank" rel="noopener"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Download PNG</a>' +
                '<button class="tool-btn outline" id="qr-copy-url" style="flex:1;justify-content:center;padding:0.65rem;">Salin Link</button>' +
                '</div><div style="font-size:0.7rem;color:var(--text-muted);text-align:center;padding-bottom:0.5rem;">' + size + ' × ' + size + ' px</div></div>';
            document.getElementById('qr-copy-url')?.addEventListener('click', () => {
                navigator.clipboard.writeText(qrUrl).then(() => showToast('Link QR disalin!'));
            });
        })
        .catch(e => { if (!silent) _qrInner.innerHTML = '<div class="tool-error">⚠ ' + e.message + '</div>'; })
        .finally(() => {
            if (!silent) {
                _qrBtn.disabled = false;
                _qrBtn.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> Buat QR Code';
            }
        });
}

function _qrInit() {
    _qrText   = document.getElementById('qr-text');
    _qrCount  = document.getElementById('qr-count');
    _qrSize   = document.getElementById('qr-size');
    _qrBtn    = document.getElementById('qr-gen-btn');
    _qrResult = document.getElementById('qr-result');
    _qrInner  = document.getElementById('qr-inner');
    if (!_qrText) return;

    _qrText.addEventListener('input', () => {
        if (_qrCount) _qrCount.textContent = _qrText.value.length;
        clearTimeout(_qrTimer);
        if (_qrText.value.trim()) _qrTimer = setTimeout(() => _qrGenerate(true), 600);
    });
    _qrSize?.addEventListener('change', () => { if (_qrText.value.trim()) _qrGenerate(true); });
    _qrBtn?.addEventListener('click', () => _qrGenerate(false));
    _qrText.addEventListener('keydown', e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) _qrGenerate(false); });
}

window.nova_init_qr_gen = function() { _qrInit(); };
