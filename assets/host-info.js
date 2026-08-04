// HOST INFO MODULE — DOM-safe, dipanggil nova_init_host_info()
let _hiBtn, _hiHostIn, _hiResult, _hiInner;

function _hiRow(key, val, full = false) {
    if (!val && val !== 0) return '';
    return '<div class="hi-item' + (full ? ' full' : '') + '"><div class="hi-key">' + key + '</div><div class="hi-val">' + val + '</div></div>';
}

async function _hiFetch() {
    const host = _hiHostIn.value.trim().replace(/^https?:\/\//, '').split('/')[0];
    if (!host) { _hiHostIn.focus(); return; }
    _hiBtn.disabled = true;
    _hiResult.classList.add('show');
    _hiInner.innerHTML = '<div class="tool-spinner"><div class="spinner" style="width:14px;height:14px;border-width:2px"></div> Mengambil info host...</div>';
    try {
        const res = await fetch(`https://api.emiliabot.my.id/tools/hostinfo?host=${encodeURIComponent(host)}`);
        const data = await res.json();
        if (!data || data.status === false) throw new Error(data?.message || 'Gagal mendapatkan info host.');
        const d = data.result || data.data || data;
        const ip = d.ip||d.address||'—', city=d.city||'—', region=d.region||d.regionName||'—',
              country=d.country||d.countryCode||'—', org=d.org||d.isp||'—',
              asn=d.as||d.asn||'—', tz=d.timezone||'—',
              loc=d.loc||(d.lat&&d.lon?d.lat+', '+d.lon:'—'),
              ptr=d.hostname||d.reverse||'—', postal=d.postal||'—';
        _hiInner.innerHTML = '<div style="margin-bottom:0.75rem;"><span class="hi-badge"><svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>' + host + '</span></div><div class="hi-grid">' +
            _hiRow('IP Address',ip) + _hiRow('PTR / Hostname',ptr) + _hiRow('ASN / Org',asn) +
            _hiRow('ISP / Provider',org) + _hiRow('Kota',city) + _hiRow('Region',region) +
            _hiRow('Negara',country) + _hiRow('Kode Pos',postal) + _hiRow('Timezone',tz) + _hiRow('Koordinat',loc) +
            '</div>';
    } catch(e) {
        _hiInner.innerHTML = '<div class="tool-error">⚠ ' + e.message + '</div>';
    } finally { _hiBtn.disabled = false; }
}

function _hiInit() {
    _hiBtn    = document.getElementById('hi-fetch-btn');
    _hiHostIn = document.getElementById('hi-host');
    _hiResult = document.getElementById('hi-result');
    _hiInner  = document.getElementById('hi-inner');
    if (!_hiBtn) return;
    _hiBtn.addEventListener('click', _hiFetch);
    _hiHostIn.addEventListener('keydown', e => { if (e.key === 'Enter') _hiFetch(); });
}

window.nova_init_host_info = function() { _hiInit(); };
