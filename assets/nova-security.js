(function() {
    'use strict';

    const ua  = navigator.userAgent || '';
    const ref = (document.referrer || '').toLowerCase();

    // ── 1. ANTI-BOT: Pola UA bot/scraper/headless ─────────────
    const BOT_PATTERNS = [
        /bot/i,/crawl/i,/spider/i,/scraper/i,/curl/i,/wget/i,
        /python[-/ ]/i,/axios/i,/node-fetch/i,/node\.js/i,/got\//i,
        /puppeteer/i,/playwright/i,/selenium/i,/phantomjs/i,
        /headless/i,/mechanize/i,/scrapy/i,/httpx/i,/aiohttp/i,
        /java\/\d/i,/libwww/i,/lwp-/i,/okhttp/i,/Go-http/i,
        /PostmanRuntime/i,/insomnia/i,/RestSharp/i,/ApacheBench/i,
        /masscan/i,/zgrab/i,/nmap/i,/nuclei/i,/sqlmap/i,
        /dataforseo/i,/semrushbot/i,/ahrefsbot/i,/mj12bot/i,
        /rogerbot/i,/dotbot/i,/exabot/i,/ia_archiver/i
    ];
    const isBot = BOT_PATTERNS.some(p => p.test(ua));

    // ── 2. HEADLESS BROWSER DETECTION (multi-probe) ───────────
    const isHeadless = (() => {
        if (navigator.webdriver === true) return true;
        if (/HeadlessChrome|HeadlessFirefox/i.test(ua)) return true;
        if (window.callPhantom || window._phantom || window.__nightmare) return true;
        if (window.__selenium_evaluate || window.__selenium_unwrapped) return true;
        if (window.domAutomation || window.domAutomationController) return true;
        if (window.cdc_adoQpoasnfa76pfcZLmcfl || window.cdc_adoQpoasnfa76pfcZLmcfl_Array) return true;
        // Headless biasanya tidak punya plugin
        const plugins = navigator.plugins;
        if (plugins && plugins.length === 0 && !/(mobile|android|iphone|ipad)/i.test(ua)) return true;
        // Bahasa tidak terdefinisi
        if (!navigator.languages || navigator.languages.length === 0) return true;
        // Chrome tapi bukan Chrome nyata (Electron, dll)
        if (window.chrome && !window.chrome.app && !window.chrome.runtime && !/electron/i.test(ua)) {
            // boleh lewat — banyak chrome extension mode
        }
        return false;
    })();

    // ── 3. ANTI-CORS-PROXY SCRAPER ────────────────────────────
    // (a) Referrer dari layanan proxy publik
    const PROXY_REFS = [
        'allorigins','corsproxy','cors-anywhere','codetabs','thingproxy',
        'cors.eu.org','cors.sh','corsanywhere','htmlpreview','gitcdn',
        'raw.githubusercontent','viewhtml','proxy.cors','whateverorigin',
        'corsfix','cors.bridged','api.codetabs','worker.bridged',
        'wsrv.nl','images.weserv','picsum','placeholder.com',
        'cors-proxy.fringe','8gwifi','livekit','rapidapi.com/proxy',
        'cors.io','corsnowhere','fetchproxy','pass.ai'
    ];
    const isProxyRef = PROXY_REFS.some(p => ref.includes(p));

    // (b) Query param proxy
    const sp = new URLSearchParams(window.location.search);
    const isProxyParam = ['url','q','uri','target','fetch','proxy','src','href','link']
        .some(k => sp.has(k) && /^https?:\/\//i.test(sp.get(k) || ''));

    // (c) Iframe embed oleh proxy
    const isIframeEmbed = (() => { try { return window.self !== window.top; } catch { return true; } })();

    // (d) Storage blocked = headless/proxy environment
    let isStorageBlocked = false;
    try {
        const tk = '__nv_' + Math.random().toString(36).slice(2);
        localStorage.setItem(tk, '1');
        if (localStorage.getItem(tk) !== '1') isStorageBlocked = true;
        localStorage.removeItem(tk);
    } catch { isStorageBlocked = true; }

    // (e) Canvas fingerprint — headless biasanya return blank/identical canvas
    const isCanvasSuspect = (() => {
        try {
            const c = document.createElement('canvas');
            c.width = 1; c.height = 1;
            const ctx = c.getContext('2d');
            ctx.fillStyle = '#f00';
            ctx.fillRect(0, 0, 1, 1);
            const d = ctx.getImageData(0, 0, 1, 1).data;
            return d[0] === 0 && d[1] === 0 && d[2] === 0; // blank = suspect
        } catch { return false; }
    })();

    // (f) Request header check — X-Forwarded-For sering ada di proxy
    // (tidak bisa di client-side, tapi kita bisa cek timing)

    // (g) Performance timing — bot biasanya terlalu cepat
    const loadTime = performance?.now?.() || 0;
    const isSuperFast = loadTime < 5; // < 5ms = suspect automation

    // ── 4. HONEYPOT trap ──────────────────────────────────────
    const hp = document.createElement('div');
    hp.style.cssText = 'position:fixed;left:-99999px;top:-99999px;opacity:0;pointer-events:none;width:1px;height:1px;overflow:hidden;';
    hp.innerHTML = '<a href="/api/admin/config" tabindex="-1" aria-hidden="true" id="__hp__">config</a>'
                 + '<input type="text" name="email" id="__hp_email__" tabindex="-1" autocomplete="off">';
    document.documentElement.appendChild(hp);

    // ── 5. RATE LIMIT: request banjir dari satu sesi ──────────
    const _reqLog = JSON.parse(sessionStorage.getItem('__nv_rl') || '[]');
    const _now    = Date.now();
    _reqLog.push(_now);
    const _recent = _reqLog.filter(t => _now - t < 10000); // 10 detik terakhir
    try { sessionStorage.setItem('__nv_rl', JSON.stringify(_recent.slice(-50))); } catch {}
    const isRateLimitHit = _recent.length > 30; // > 30 request dalam 10 detik

    // ── 6. BLOCK FUNCTION ─────────────────────────────────────
    function showBlock(code) {
        document.documentElement.innerHTML = [
            '<!DOCTYPE html><html><head>',
            '<meta charset="UTF-8">',
            '<meta name="viewport" content="width=device-width,initial-scale=1">',
            '<title>403</title>',
            '<style>',
            '*{margin:0;padding:0;box-sizing:border-box;}',
            'body{background:#000;color:#fff;font-family:-apple-system,sans-serif;',
            'display:flex;align-items:center;justify-content:center;min-height:100vh;text-align:center;padding:2rem;}',
            '.w{max-width:360px;}',
            'svg{opacity:.15;margin-bottom:1.5rem;}',
            'h1{font-size:.95rem;font-weight:700;letter-spacing:3px;text-transform:uppercase;margin-bottom:.75rem;}',
            'p{font-size:.78rem;color:#444;line-height:1.65;margin-bottom:1.25rem;}',
            '.code{font-family:monospace;font-size:.65rem;color:#2a2a2a;background:#050505;',
            'padding:.4rem .8rem;border-radius:4px;border:1px solid #111;display:inline-block;}',
            '.brand{margin-top:2.5rem;font-size:.55rem;letter-spacing:3px;text-transform:uppercase;color:#1a1a1a;}',
            '</style></head><body>',
            '<div class="w">',
            '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
            '<h1>Akses Ditolak</h1>',
            '<p>Permintaan tidak dapat diproses. Aktivitas mencurigakan terdeteksi.</p>',
            '<div class="code">NV_' + code.toUpperCase() + '</div>',
            '<div class="brand">✦ NOVAPROMPT SECURITY</div>',
            '</div></body></html>'
        ].join('');
    }

    if (isBot)           { showBlock('BOT_UA');        return; }
    if (isHeadless)      { showBlock('HEADLESS');      return; }
    if (isProxyRef)      { showBlock('PROXY_REF');     return; }
    if (isProxyParam)    { showBlock('PROXY_PARAM');   return; }
    if (isIframeEmbed)   { showBlock('IFRAME_EMBED');  return; }
    if (isStorageBlocked){ showBlock('STORAGE_DENY');  return; }
    if (isCanvasSuspect) { showBlock('CANVAS_BLANK');  return; }
    if (isRateLimitHit)  { showBlock('RATE_LIMIT');    return; }

    // ── 7. BEHAVIOR VERIFICATION ──────────────────────────────
    let _humanVerified = false;
    const VERIFY_TIMEOUT = 45000;

    function _onHuman() {
        _humanVerified = true;
        ['mousemove','touchstart','keydown','scroll','click','pointermove']
            .forEach(ev => document.removeEventListener(ev, _onHuman));
    }
    ['mousemove','touchstart','keydown','scroll','click','pointermove']
        .forEach(ev => document.addEventListener(ev, _onHuman, { passive: true }));

    setTimeout(() => {
        if (!_humanVerified && !/(mobile|android|iphone|ipad)/i.test(ua)) {
            window.__novaBotSuspect = true;
        }
    }, VERIFY_TIMEOUT);

    // ── 8. CONSOLE OBFUSCATION ────────────────────────────────
    const _oc = window.console;
    window.console = {
        ...console,
        log:   (...a) => { if (!window.__novaDebug) return; _oc.log(...a); },
        warn:  (...a) => { if (!window.__novaDebug) return; _oc.warn(...a); },
        error: (...a) => _oc.error(...a),
        info:  (...a) => { if (!window.__novaDebug) return; _oc.info(...a); },
        table: (...a) => { if (!window.__novaDebug) return; _oc.table(...a); },
        dir:   (...a) => { if (!window.__novaDebug) return; _oc.dir(...a); }
    };

    // ── 9. DISABLE VIEW SOURCE SHORTCUTS ─────────────────────
    document.addEventListener('contextmenu', e => e.preventDefault());
    document.addEventListener('keydown', e => {
        const ctrl = e.ctrlKey || e.metaKey;
        if (ctrl && (e.key === 'u' || e.key === 'U')) { e.preventDefault(); return false; }
        if (ctrl && (e.key === 's' || e.key === 'S')) { e.preventDefault(); return false; }
        if (e.key === 'F12') { e.preventDefault(); return false; }
    });

    // ── 10. SESSION TOKEN ─────────────────────────────────────
    const _st = btoa(Date.now() + '.' + Math.random().toString(36).slice(2));
    try { sessionStorage.setItem('__npt', _st); } catch {}

    // ── 11. MUTATION OBSERVER: cegah DOM scraping dinamis ─────
    // Monitor jika ada script inject dari luar
    const _mo = new MutationObserver(mutations => {
        for (const m of mutations) {
            for (const node of m.addedNodes) {
                if (node.nodeName === 'SCRIPT') {
                    const src = node.src || '';
                    if (src && !src.includes(window.location.origin) &&
                        !src.includes('cdnjs.cloudflare.com') &&
                        !src.includes('unpkg.com') &&
                        !src.includes('cdn.tailwindcss.com')) {
                        node.remove();
                    }
                }
            }
        }
    });
    _mo.observe(document.documentElement, { childList: true, subtree: true });

    window.__novaSecured = true;
    window.__novaDebug   = false;

})();
