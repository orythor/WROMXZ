// ─── CIPHERX MODULE ────────────────────────────────────────────────────────────
// Semua fungsi top-level — dipanggil via nova_init_cipherx() setelah HTML di-inject

const CX_CIPHERS = {
// ── KLASIK ─────────────────────────────────────────────
morse: { name:"Sandi Morse", cat:"Klasik",
desc:"Sandi internasional menggunakan titik (.) dan garis (-) untuk merepresentasikan huruf, angka.",
extra:"Titik=1 unit, Garis=3 unit. Spasi antar huruf=3 unit, antar kata=7 unit (gunakan '/') saat decode.",
encode: s => { const m={'A':'.-','B':'-...','C':'-.-.','D':'-..','E':'.','F':'..-.','G':'--.','H':'....','I':'..','J':'.---','K':'-.-','L':'.-..','M':'--','N':'-.','O':'---','P':'.--.','Q':'--.-','R':'.-.','S':'...','T':'-','U':'..-','V':'...-','W':'.--','X':'-..-','Y':'-.--','Z':'--..','1':'.----','2':'..---','3':'...--','4':'....-','5':'.....','6':'-....','7':'--...','8':'---..','9':'----.','0':'-----',' ':'/'}; return s.toUpperCase().split('').map(c=>m[c]??c).join(' '); },
decode: s => { const m={'.-':'A','-...':'B','-.-.':'C','-..':'D','.':'E','..-.':'F','--.':'G','....':'H','..':'I','.---':'J','-.-':'K','.-..':'L','--':'M','-.':'N','---':'O','.--.':'P','--.-':'Q','.-.':'R','...':'S','-':'T','..-':'U','...-':'V','.--':'W','-..-':'X','-.--':'Y','--..':'Z','.----':'1','..---':'2','...--':'3','....-':'4','.....':'5','-....':'6','--...':'7','---..':'8','----.':'9','-----':'0','/':' '}; return s.trim().split(' ').map(c=>m[c]??c).join(''); }
},
caesar: { name:"Caesar (ROT13)", cat:"Klasik",
desc:"Sandi geser klasik dari zaman Romawi — setiap huruf digeser 13 posisi dalam abjad.",
extra:"Digunakan Julius Caesar untuk komunikasi militer rahasia. ROT13 adalah kasus simetris: encode = decode.",
encode: s => s.replace(/[a-zA-Z]/g,c=>{const b=c<='Z'?65:97;return String.fromCharCode(b+(c.charCodeAt(0)-b+13)%26);}),
decode: s => CX_CIPHERS.caesar.encode(s)
},
atbash: { name:"Atbash Cipher", cat:"Klasik",
desc:"Sandi substitusi kuno dari tradisi Ibrani — huruf pertama ↔ terakhir (A↔Z, B↔Y).",
extra:"Digunakan dalam kitab Yeremia (Alkitab Ibrani). Simetris: encode = decode.",
encode: s => { const a='abcdefghijklmnopqrstuvwxyz',r='zyxwvutsrqponmlkjihgfedcba'; return s.split('').map(c=>{const i=a.indexOf(c.toLowerCase());return i!==-1?(c===c.toUpperCase()?r[i].toUpperCase():r[i]):c;}).join(''); },
decode: s => CX_CIPHERS.atbash.encode(s)
},
vigenere: { name:"Vigenère Cipher", cat:"Klasik",
desc:"Sandi substitusi polialfabet menggunakan kata kunci. Key default: KUNCI.",
extra:"Ditemukan Blaise de Vigenère (1586). Disebut 'le chiffre indéchiffrable' selama 300 tahun.",
encode: s => { const k='KUNCI';let ki=0;return s.toUpperCase().split('').map(c=>{if(c<'A'||c>'Z')return c;const sh=k[ki++%k.length].charCodeAt(0)-65;return String.fromCharCode((c.charCodeAt(0)-65+sh)%26+65);}).join(''); },
decode: s => { const k='KUNCI';let ki=0;return s.toUpperCase().split('').map(c=>{if(c<'A'||c>'Z')return c;const sh=k[ki++%k.length].charCodeAt(0)-65;return String.fromCharCode((c.charCodeAt(0)-65-sh+26)%26+65);}).join(''); }
},
a1z26: { name:"A1Z26 (Angka)", cat:"Klasik",
desc:"Substitusi sederhana: setiap huruf digantikan nomor urut abjad. A=1, B=2, ..., Z=26.",
extra:"Sering muncul di teka-teki. Pisahkan angka dengan '-' saat decode.",
encode: s => s.toUpperCase().split('').map(c=>{const n=c.charCodeAt(0);return(n>=65&&n<=90)?(n-64):c;}).join('-').replace(/([^0-9])-([^0-9])/g,'$1$2'),
decode: s => s.split('-').map(n=>{const v=parseInt(n);return(v>=1&&v<=26)?String.fromCharCode(v+64):n;}).join('')
},
reverse: { name:"Reverse Text", cat:"Klasik",
desc:"Membalikkan urutan karakter teks dari belakang ke depan.",
extra:"Digunakan Leonardo da Vinci dalam catatan pribadinya (mirror writing).",
encode: s=>s.split('').reverse().join(''), decode:s=>s.split('').reverse().join('')
},
railfence: { name:"Rail Fence Cipher", cat:"Klasik",
desc:"Sandi transposisi — karakter disusun zigzag di 3 jalur lalu dibaca baris per baris.",
extra:"Termasuk kategori sandi transposisi: karakter tidak diganti tapi posisinya diacak.",
encode: s => { const f=Array.from({length:3},()=>[]);let r=0,d=1;for(const c of s){f[r].push(c);if(r===0)d=1;else if(r===2)d=-1;r+=d;}return f.flat().join(''); },
decode: s => { const n=s.length,p=[];let r=0,d=1;for(let i=0;i<n;i++){p.push(r);if(r===0)d=1;else if(r===2)d=-1;r+=d;}const sorted=p.map((r,i)=>({r,i})).sort((a,b)=>a.r-b.r||a.i-b.i),res=new Array(n);for(let i=0;i<n;i++)res[sorted[i].i]=s[i];return res.join(''); }
},
rot47: { name:"ROT47", cat:"Klasik",
desc:"Versi ROT13 yang diperluas — memutar semua 94 karakter ASCII yang bisa dicetak (33–126).",
extra:"Berbeda dari ROT13: memutar angka, tanda baca, dan simbol ASCII juga. Simetris.",
encode: s=>s.split('').map(c=>{const n=c.charCodeAt(0);return(n>=33&&n<=126)?String.fromCharCode(33+(n-33+47)%94):c;}).join(''),
decode: s=>CX_CIPHERS.rot47.encode(s)
},
playfair: { name:"Playfair Cipher", cat:"Klasik",
desc:"Sandi digraf — mengenkripsi dua huruf sekaligus menggunakan grid 5×5. Key: KUNCI.",
extra:"Ditemukan Charles Wheatstone (1854). Digunakan tentara Inggris di WWI.",
encode: s => {
const KEY='KUNCI',alpha='ABCDEFGHIKLMNOPQRSTUVWXYZ';
let sq='';for(const c of(KEY+alpha)){const u=c==='J'?'I':c;if(/[A-Z]/.test(u)&&!sq.includes(u))sq+=u;}
const pos=c=>{const i=sq.indexOf(c==='J'?'I':c);return[Math.floor(i/5),i%5];};
let pairs=s.toUpperCase().replace(/J/g,'I').replace(/[^A-Z]/g,''),out='',i=0;
while(i<pairs.length){const a=pairs[i],b=pairs[i+1]||'X';i+=a===b?1:2;const[ra,ca]=pos(a),[rb,cb]=pos(b===a?'X':b);if(ra===rb)out+=sq[ra*5+(ca+1)%5]+sq[rb*5+(cb+1)%5];else if(ca===cb)out+=sq[((ra+1)%5)*5+ca]+sq[((rb+1)%5)*5+cb];else out+=sq[ra*5+cb]+sq[rb*5+ca];}return out;
},
decode: s => {
const KEY='KUNCI',alpha='ABCDEFGHIKLMNOPQRSTUVWXYZ';
let sq='';for(const c of(KEY+alpha)){const u=c==='J'?'I':c;if(/[A-Z]/.test(u)&&!sq.includes(u))sq+=u;}
const pos=c=>{const i=sq.indexOf(c);return[Math.floor(i/5),i%5];};
let out='',t=s.toUpperCase().replace(/[^A-Z]/g,'');
for(let i=0;i<t.length;i+=2){const a=t[i],b=t[i+1]||'X';const[ra,ca]=pos(a),[rb,cb]=pos(b);if(ra===rb)out+=sq[ra*5+(ca+4)%5]+sq[rb*5+(cb+4)%5];else if(ca===cb)out+=sq[((ra+4)%5)*5+ca]+sq[((rb+4)%5)*5+cb];else out+=sq[ra*5+cb]+sq[rb*5+ca];}return out;
}
},
beaufort: { name:"Beaufort Cipher", cat:"Klasik",
desc:"Varian Vigenère oleh Admiral Francis Beaufort. Key: CIPHER. Simetris: encode = decode.",
extra:"Digunakan kriptografi laut abad ke-19. Rumus: (key − teks + 26) mod 26.",
encode: s=>{const k='CIPHER';let ki=0;return s.toUpperCase().split('').map(c=>{if(c<'A'||c>'Z')return c;const kv=k[ki++%k.length].charCodeAt(0)-65;return String.fromCharCode((kv-(c.charCodeAt(0)-65)+26)%26+65);}).join('');},
decode: s=>CX_CIPHERS.beaufort.encode(s)
},
// ── DIGITAL ────────────────────────────────────────────
binary: { name:"Biner (Binary)", cat:"Digital",
desc:"Sistem bilangan berbasis 2 — tiap karakter sebagai 8-bit angka 0 dan 1.",
extra:"Dasar komputasi modern. 'A' = 01000001.",
encode:s=>s.split('').map(c=>c.charCodeAt(0).toString(2).padStart(8,'0')).join(' '),
decode:s=>{try{return s.trim().split(/\s+/).map(b=>String.fromCharCode(parseInt(b,2))).join('');}catch{return"Format biner tidak valid";}}
},
hex: { name:"Hexadecimal", cat:"Digital",
desc:"Sistem bilangan berbasis 16 — digunakan luas dalam pemrograman.",
extra:"0-9 dan A-F. 'A'=41. Warna #FF0000 = R:255 G:0 B:0.",
encode:s=>s.split('').map(c=>c.charCodeAt(0).toString(16).padStart(2,'0')).join(' '),
decode:s=>{try{return s.trim().split(/\s+/).map(h=>String.fromCharCode(parseInt(h,16))).join('');}catch{return"Format hex tidak valid";}}
},
base64: { name:"Base64", cat:"Digital",
desc:"Encoding biner-ke-teks 64 karakter ASCII. Standar universal transmisi data.",
extra:"Digunakan JWT, data URL, HTTP Basic Auth. Output 4/3× ukuran input.",
encode:s=>{try{return btoa(unescape(encodeURIComponent(s)));}catch{return"Error encoding";}},
decode:s=>{try{return decodeURIComponent(escape(atob(s)));}catch{return"Format Base64 tidak valid";}}
},
base32: { name:"Base32", cat:"Digital",
desc:"Encoding 32 karakter (A-Z, 2-7). Digunakan OTP authenticator dan QR.",
extra:"Dipakai Google Authenticator, TOTP/HOTP. Tidak case-sensitive.",
encode:s=>{const a='ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';let bits='',out='';for(const c of s)bits+=c.charCodeAt(0).toString(2).padStart(8,'0');while(bits.length%5)bits+='0';for(let i=0;i<bits.length;i+=5)out+=a[parseInt(bits.slice(i,i+5),2)];while(out.length%8)out+='=';return out;},
decode:s=>{const a='ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';s=s.replace(/=/g,'').toUpperCase();let bits='',out='';for(const c of s){const i=a.indexOf(c);if(i<0)continue;bits+=i.toString(2).padStart(5,'0');}for(let i=0;i+8<=bits.length;i+=8){const n=parseInt(bits.slice(i,i+8),2);if(n>0)out+=String.fromCharCode(n);}return out||"Format Base32 tidak valid";}
},
octal: { name:"Oktal (Octal)", cat:"Digital",
desc:"Sistem bilangan berbasis 8 — Unix file permissions dan assembly.",
extra:"chmod 755: owner=7(rwx), group=5(r-x), others=5(r-x). 'A'=101 oktal.",
encode:s=>s.split('').map(c=>c.charCodeAt(0).toString(8).padStart(3,'0')).join(' '),
decode:s=>{try{return s.trim().split(/\s+/).map(o=>String.fromCharCode(parseInt(o,8))).join('');}catch{return"Format oktal tidak valid";}}
},
url_enc: { name:"URL Encode", cat:"Digital",
desc:"Encoding karakter khusus untuk URL — spasi dan simbol jadi format %XX.",
extra:"Spasi=%20, /=%2F, @=%40. Penting untuk form submission dan query string.",
encode:s=>encodeURIComponent(s),
decode:s=>{try{return decodeURIComponent(s);}catch{return"Format URL encode tidak valid";}}
},
html_ent: { name:"HTML Entities", cat:"Digital",
desc:"Encoding karakter khusus HTML — mencegah XSS dan rendering error.",
extra:"< = &lt;  > = &gt;  & = &amp;  \" = &quot;  Penting untuk web security.",
encode:s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;'),
decode:s=>s.replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#039;/g,"'")
},
ascii_dec: { name:"ASCII Desimal", cat:"Digital",
desc:"Nilai desimal ASCII setiap karakter. 'A'=65, 'a'=97, '0'=48.",
extra:"ASCII (American Standard Code for Information Interchange) — standar 7-bit, 128 karakter.",
encode:s=>s.split('').map(c=>c.charCodeAt(0)).join(' '),
decode:s=>{try{return s.trim().split(/\s+/).map(n=>String.fromCharCode(parseInt(n))).join('');}catch{return"Format tidak valid";}}
},
// ── KRIPTOGRAFI ────────────────────────────────────────
unicode: { name:"Unicode Points", cat:"Kriptografi",
desc:"Nilai Unicode (code point) setiap karakter dalam format U+XXXX.",
extra:"Unicode mencakup 1.1 juta+ karakter. 'A' = U+0041.",
encode:s=>s.split('').map(c=>'U+'+c.charCodeAt(0).toString(16).toUpperCase().padStart(4,'0')).join(' '),
decode:s=>s.trim().split(/\s+/).map(u=>String.fromCharCode(parseInt(u.replace('U+',''),16))).join('')
},
nato: { name:"NATO Phonetic", cat:"Kriptografi",
desc:"Alfabet fonetik NATO/ICAO untuk komunikasi radio — tiap huruf dieja kata baku.",
extra:"Alpha, Bravo, Charlie... digunakan militer, penerbangan, polisi internasional.",
encode:s=>{const m={A:'Alpha',B:'Bravo',C:'Charlie',D:'Delta',E:'Echo',F:'Foxtrot',G:'Golf',H:'Hotel',I:'India',J:'Juliet',K:'Kilo',L:'Lima',M:'Mike',N:'November',O:'Oscar',P:'Papa',Q:'Quebec',R:'Romeo',S:'Sierra',T:'Tango',U:'Uniform',V:'Victor',W:'Whiskey',X:'X-ray',Y:'Yankee',Z:'Zulu',' ':'/'};return s.toUpperCase().split('').map(c=>m[c]??c).join(' ');},
decode:s=>{const m={'ALPHA':'A','BRAVO':'B','CHARLIE':'C','DELTA':'D','ECHO':'E','FOXTROT':'F','GOLF':'G','HOTEL':'H','INDIA':'I','JULIET':'J','KILO':'K','LIMA':'L','MIKE':'M','NOVEMBER':'N','OSCAR':'O','PAPA':'P','QUEBEC':'Q','ROMEO':'R','SIERRA':'S','TANGO':'T','UNIFORM':'U','VICTOR':'V','WHISKEY':'W','X-RAY':'X','YANKEE':'Y','ZULU':'Z','/':' '};return s.toUpperCase().trim().split(/\s+/).map(w=>m[w]??w).join('');}
},
pigpen: { name:"Pigpen (Simbol)", cat:"Kriptografi",
desc:"Sandi substitusi abad ke-18 dengan simbol geometri. Digunakan Freemason.",
extra:"Dikenal sebagai Masonic cipher. Muncul di novel Da Vinci Code.",
encode:s=>{const m={'A':'⊏','B':'⊓','C':'⊐','D':'⊔','E':'⌐','F':'¬','G':'⊣','H':'⊢','I':'⬡','J':'△','K':'▷','L':'▽','M':'◁','N':'◇','O':'✦','P':'⊕','Q':'⊗','R':'⊘','S':'⊙','T':'⊚','U':'⊛','V':'⊜','W':'⊝','X':'⊞','Y':'⊟','Z':'⊠',' ':' '};return s.toUpperCase().split('').map(c=>m[c]??c).join('');},
decode:s=>{const m={'⊏':'A','⊓':'B','⊐':'C','⊔':'D','⌐':'E','¬':'F','⊣':'G','⊢':'H','⬡':'I','△':'J','▷':'K','▽':'L','◁':'M','◇':'N','✦':'O','⊕':'P','⊗':'Q','⊘':'R','⊙':'S','⊚':'T','⊛':'U','⊜':'V','⊝':'W','⊞':'X','⊟':'Y','⊠':'Z',' ':' '};return s.split('').map(c=>m[c]??c).join('');}
},
tap: { name:"Tap Code (Penjara)", cat:"Kriptografi",
desc:"Sandi ketukan tahanan — tiap huruf = koordinat baris.kolom di grid 5×5.",
extra:"Digunakan POW Vietnam di 'Hanoi Hilton'. C dan K berbagi satu sel.",
encode:s=>{const g='ABDEFGHIJLMNOPQRSTUVWXYZ';return s.toUpperCase().replace(/C/g,'K').split('').map(c=>{const i=g.indexOf(c);if(i===-1)return c===' '?'  ':c;return`${Math.floor(i/5)+1}.${(i%5)+1}`;}).join(' ');},
decode:s=>{const g='ABDEFGHIJLMNOPQRSTUVWXYZ';return s.trim().split(/\s{2,}|\s(?=\d)/).map(p=>{const[r,c]=p.split('.').map(Number);if(!r||!c)return p;return g[(r-1)*5+(c-1)]??p;}).join('');}
},
semaphore: { name:"Semaphore (Bendera)", cat:"Kriptografi",
desc:"Komunikasi visual dengan dua bendera — posisi sudut 45° mewakili tiap huruf.",
extra:"Digunakan angkatan laut sejak abad ke-19.",
encode:s=>{const m={A:'↙↓',B:'↙←',C:'↙↖',D:'↙↑',E:'↙↗',F:'↙→',G:'↙↘',H:'↓←',I:'↓↖',J:'←↑',K:'↓↑',L:'↓↗',M:'↓→',N:'↓↘',O:'←↖',P:'←↑',Q:'←↗',R:'←→',S:'←↘',T:'↖↑',U:'↖↗',V:'↑→',W:'↗↘',X:'↗→',Y:'↑↘',Z:'→↘',' ':' / '};return s.toUpperCase().split('').map(c=>m[c]??c).join(' ');},
decode:s=>{const m={'↙↓':'A','↙←':'B','↙↖':'C','↙↑':'D','↙↗':'E','↙→':'F','↙↘':'G','↓←':'H','↓↖':'I','←↑':'J','↓↑':'K','↓↗':'L','↓→':'M','↓↘':'N','←↖':'O','←→':'R','←↘':'S','↖↑':'T','↖↗':'U','↑→':'V','↗↘':'W','↗→':'X','↑↘':'Y','→↘':'Z','/':' '};return s.trim().split(/\s+/).map(t=>m[t]??t).join('');}
},
braille: { name:"Braille (Timbul)", cat:"Kriptografi",
desc:"Sistem tulisan timbul tunanetra — pola 6 titik mewakili tiap huruf.",
extra:"Diciptakan Louis Braille (1824) saat berusia 15 tahun.",
encode:s=>{const m={A:'⠁',B:'⠃',C:'⠉',D:'⠙',E:'⠑',F:'⠋',G:'⠛',H:'⠓',I:'⠊',J:'⠚',K:'⠅',L:'⠇',M:'⠍',N:'⠝',O:'⠕',P:'⠏',Q:'⠟',R:'⠗',S:'⠎',T:'⠞',U:'⠥',V:'⠧',W:'⠺',X:'⠭',Y:'⠽',Z:'⠵',' ':'⠀'};return s.toUpperCase().split('').map(c=>m[c]??c).join('');},
decode:s=>{const m={'⠁':'A','⠃':'B','⠉':'C','⠙':'D','⠑':'E','⠋':'F','⠛':'G','⠓':'H','⠊':'I','⠚':'J','⠅':'K','⠇':'L','⠍':'M','⠝':'N','⠕':'O','⠏':'P','⠟':'Q','⠗':'R','⠎':'S','⠞':'T','⠥':'U','⠧':'V','⠺':'W','⠭':'X','⠽':'Y','⠵':'Z','⠀':' '};return s.split('').map(c=>m[c]??c).join('');}
},
t9: { name:"T9 / Keypad Angka", cat:"Kriptografi",
desc:"Sandi keypad ponsel lama — huruf diwakili nomor tombol + posisi (ABC=2...).",
extra:"A=21, B=22, C=23, D=31... Kenangan era Nokia!",
encode:s=>{const m={A:'21',B:'22',C:'23',D:'31',E:'32',F:'33',G:'41',H:'42',I:'43',J:'51',K:'52',L:'53',M:'61',N:'62',O:'63',P:'71',Q:'72',R:'73',S:'74',T:'81',U:'82',V:'83',W:'91',X:'92',Y:'93',Z:'94',' ':'0'};return s.toUpperCase().split('').map(c=>m[c]??c).join(' ');},
decode:s=>{const m={'21':'A','22':'B','23':'C','31':'D','32':'E','33':'F','41':'G','42':'H','43':'I','51':'J','52':'K','53':'L','61':'M','62':'N','63':'O','71':'P','72':'Q','73':'R','74':'S','81':'T','82':'U','83':'V','91':'W','92':'X','93':'Y','94':'Z','0':' '};return s.trim().split(/\s+/).map(n=>m[n]??n).join('');}
}
};

const CX_CATS = [
{ key:'Klasik',      icon:'⊞' },
{ key:'Digital',     icon:'⌁' },
{ key:'Kriptografi', icon:'✦' },
];

let cxKey    = 'morse';
let cxMode   = 'encode';
let cxTc     = 0, cxTt = 0, cxAns = '';
const cxOpen = new Set(['Klasik']);

const $$ = id => document.getElementById(id);

// ── Sidebar + Dropdown render ──────────────────────────────
function cxRenderSidebar() {
const nav   = $$('cx-sidebar');
const panel = $$('cx-dropdown-panel');
nav.innerHTML = '';
if (panel) panel.innerHTML = '';
$$('cx-total-count').textContent = Object.keys(CX_CIPHERS).length;

CX_CATS.forEach(cat => {
const keys = Object.keys(CX_CIPHERS).filter(k => CX_CIPHERS[k].cat === cat.key);
if (!keys.length) return;
const isOpen = cxOpen.has(cat.key), hasActive = keys.includes(cxKey);

// ── Custom dropdown group ─────────────────────
if (panel) {
const grpLabel = document.createElement('div');
grpLabel.className = 'cx-dd-group-label';
grpLabel.textContent = cat.icon + ' ' + cat.key;
panel.appendChild(grpLabel);
keys.forEach(k => {
    const item = document.createElement('button');
    item.className = 'cx-dd-item' + (k === cxKey ? ' active' : '');
    item.innerHTML = '<span>' + CX_CIPHERS[k].name + '</span><span class="cx-dd-dot"></span>';
    item.addEventListener('click', () => { cxSelect(k); cxCloseDropdown(); });
    panel.appendChild(item);
});
}

// ── Sidebar accordion ─────────────────────────
const hdr = document.createElement('button');
hdr.className = 'cx-acc-header' + (isOpen?' open':'') + (hasActive?' has-active':'');
hdr.innerHTML = '<div class="cx-acc-left"><span style="opacity:0.5;font-size:0.68rem">' + cat.icon + '</span><span>' + cat.key + '</span><span class="cx-badge">' + keys.length + '</span></div><svg class="cx-acc-arrow" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>';
nav.appendChild(hdr);

const body = document.createElement('div');
body.className = 'cx-acc-body' + (isOpen?' open':'');
body.style.maxHeight = isOpen ? '600px' : '0px';
body.style.opacity   = isOpen ? '1' : '0';
const inner = document.createElement('div');
inner.style.paddingBottom = '4px';
keys.forEach(k => {
const btn = document.createElement('button');
btn.className = 'cx-cipher-btn' + (k===cxKey?' active':'');
btn.innerHTML = '<span>' + CX_CIPHERS[k].name + '</span><span class="cx-dot"></span>';
btn.addEventListener('click', () => cxSelect(k));
inner.appendChild(btn);
});
body.appendChild(inner);
nav.appendChild(body);
hdr.addEventListener('click', () => {
const was = cxOpen.has(cat.key);
if (was) { cxOpen.delete(cat.key); hdr.classList.remove('open'); body.classList.remove('open'); body.style.maxHeight='0px'; body.style.opacity='0'; }
else     { cxOpen.add(cat.key); hdr.classList.add('open'); body.classList.add('open'); body.style.maxHeight='600px'; body.style.opacity='1'; }
});
});

// Update dropdown trigger label
const lbl = $$('cx-dropdown-label');
const cat = $$('cx-dropdown-cat');
if (lbl) lbl.textContent = CX_CIPHERS[cxKey]?.name || 'Pilih sandi...';
if (cat) cat.textContent = CX_CIPHERS[cxKey]?.cat  || '';
}

// ── Custom dropdown open/close ─────────────────────────────
function cxOpenDropdown() {
const t = $$('cx-dropdown-trigger'), p = $$('cx-dropdown-panel');
if (!t || !p) return;
t.classList.add('open'); p.classList.add('open');
setTimeout(() => { const a = p.querySelector('.cx-dd-item.active'); if (a) a.scrollIntoView({block:'nearest'}); }, 50);
}
function cxCloseDropdown() {
const t = $$('cx-dropdown-trigger'), p = $$('cx-dropdown-panel');
if (!t || !p) return;
t.classList.remove('open'); p.classList.remove('open');
}
document.addEventListener('click', e => {
const t = $$('cx-dropdown-trigger'), p = $$('cx-dropdown-panel');
if (!t || !p) return;
if (t.contains(e.target)) { t.classList.contains('open') ? cxCloseDropdown() : cxOpenDropdown(); }
else if (!p.contains(e.target)) { cxCloseDropdown(); }
});

function cxSelect(key) {
cxKey = key;
const c = CX_CIPHERS[key];
$$('cx-title').textContent     = c.name;
$$('cx-desc').textContent      = c.desc;
$$('cx-cat-badge').textContent = c.cat;
if (c.extra) { $$('cx-info-box').textContent = c.extra; $$('cx-info-box').style.display='block'; }
else          { $$('cx-info-box').style.display='none'; }
cxOpen.add(c.cat);
cxRenderSidebar();
cxProcess();
}


// ── Mode toggle ─────────────────────────────────────────────
$$('cx-encode-btn').addEventListener('click', () => { cxMode='encode'; $$('cx-encode-btn').className='cx-mode-btn cx-mode-active'; $$('cx-decode-btn').className='cx-mode-btn cx-mode-inactive'; cxProcess(); });
$$('cx-decode-btn').addEventListener('click', () => { cxMode='decode'; $$('cx-decode-btn').className='cx-mode-btn cx-mode-active'; $$('cx-encode-btn').className='cx-mode-btn cx-mode-inactive'; cxProcess(); });

// ── Conversion ──────────────────────────────────────────────
function cxProcess() {
const txt = $$('cx-input').value;
$$('cx-in-count').textContent  = `${txt.length} karakter`;
if (!txt.trim()) { $$('cx-output').value=''; $$('cx-out-count').textContent='0 karakter'; return; }
try {
const res = cxMode==='encode' ? CX_CIPHERS[cxKey].encode(txt) : CX_CIPHERS[cxKey].decode(txt);
$$('cx-output').value = res;
$$('cx-out-count').textContent = `${res.length} karakter`;
} catch { $$('cx-output').value='⚠ Error memproses.'; }
}

let _cxTimer;
$$('cx-input').addEventListener('input', () => { clearTimeout(_cxTimer); _cxTimer = setTimeout(cxProcess, 100); });

// ── Actions ─────────────────────────────────────────────────
$$('cx-clear-btn').addEventListener('click', () => { $$('cx-input').value=''; cxProcess(); showToast('Teks dibersihkan'); });
$$('cx-paste-btn').addEventListener('click', async () => {
try { $$('cx-input').value = await navigator.clipboard.readText(); cxProcess(); showToast('Ditempel dari clipboard'); }
catch { showToast('Gagal akses clipboard','error'); }
});
$$('cx-swap-btn').addEventListener('click', () => {
const out = $$('cx-output').value;
if (!out) return;
$$('cx-input').value = out;
cxMode = cxMode==='encode'?'decode':'encode';
$$('cx-encode-btn').className = `cx-mode-btn cx-mode-${cxMode==='encode'?'active':'inactive'}`;
$$('cx-decode-btn').className = `cx-mode-btn cx-mode-${cxMode==='decode'?'active':'inactive'}`;
cxProcess(); showToast('Input ↔ Output ditukar');
});
$$('cx-copy-btn').addEventListener('click', () => {
const v = $$('cx-output').value;
if (!v) return;
navigator.clipboard.writeText(v); showToast('Hasil sandi disalin!');
});

// Download dropdown
const dlMenu = $$('cx-dl-menu');
$$('cx-dl-btn').addEventListener('click', e => { e.stopPropagation(); dlMenu.classList.toggle('open'); });
document.addEventListener('click', () => dlMenu.classList.remove('open'));
$$('cx-dl-txt').addEventListener('click', () => {
const v=$$('cx-output').value; if(!v) return;
const a=Object.assign(document.createElement('a'),{href:URL.createObjectURL(new Blob([`CipherX\nSandi: ${CX_CIPHERS[cxKey].name}\nMode: ${cxMode}\n\n${v}`],{type:'text/plain'})),download:`cipherx-${cxKey}.txt`}); a.click(); showToast('.TXT diunduh');
});
$$('cx-dl-json').addEventListener('click', () => {
const v=$$('cx-output').value; if(!v) return;
const d={cipher:CX_CIPHERS[cxKey].name,mode:cxMode,input:$$('cx-input').value,output:v,ts:new Date().toISOString()};
const a=Object.assign(document.createElement('a'),{href:URL.createObjectURL(new Blob([JSON.stringify(d,null,2)],{type:'application/json'})),download:`cipherx-${cxKey}.json`}); a.click(); showToast('.JSON diunduh');
});
$$('cx-dl-audio').addEventListener('click', () => {
const v=$$('cx-output').value; if(!v) return;
showToast('Memutar audio beep...');
try {
const ctx=new(window.AudioContext||window.webkitAudioContext)();
let t=ctx.currentTime+0.1;
const beep=(st,dur)=>{const o=ctx.createOscillator(),g=ctx.createGain();o.type='sine';o.frequency.value=650;g.gain.setValueAtTime(0,st);g.gain.linearRampToValueAtTime(0.12,st+0.01);g.gain.setValueAtTime(0.12,st+dur-0.01);g.gain.linearRampToValueAtTime(0,st+dur);o.connect(g);g.connect(ctx.destination);o.start(st);o.stop(st+dur);};
for(const c of v){if(c==='.')beep(t,0.08),t+=0.13;else if(c==='-')beep(t,0.24),t+=0.29;else if(c===' ')t+=0.13;else if(c==='/')t+=0.26;}
} catch { showToast('Audio tidak tersedia','error'); }
});

// ── Test panel ──────────────────────────────────────────────
const TEST_WORDS = ['SANDI','CYBER','DUNIA','RAHASIA','KODE','AMAN','PESAN','ENKRIPSI','DATA','KUNCI','PROTOKOL','DIGITAL','JARINGAN'];

function cxGenTest() {
const w = TEST_WORDS[Math.floor(Math.random()*TEST_WORDS.length)];
cxAns = w;
$$('cx-challenge').textContent = CX_CIPHERS[cxKey].encode(w);
$$('cx-test-input').value = '';
$$('cx-test-fb').textContent = '';
$$('cx-test-fb').className = 'cx-test-fb';
$$('cx-test-q').textContent = `Tebak teks asli dari [${CX_CIPHERS[cxKey].name}] berikut:`;
}

function cxCheckAnswer() {
const ans = $$('cx-test-input').value.trim().toUpperCase();
const fb  = $$('cx-test-fb');
cxTt++;
if (ans === cxAns) { cxTc++; fb.textContent='✓ Benar! Lanjut...'; fb.style.color='#4aff9f'; setTimeout(cxGenTest,1800); }
else { fb.textContent=`✗ Salah. Jawaban: ${cxAns}`; fb.style.color='#ff6b6b'; setTimeout(cxGenTest,2400); }
$$('cx-t-correct').textContent = cxTc;
$$('cx-t-total').textContent   = cxTt;
}

$$('cx-test-toggle-btn').addEventListener('click', () => {
const p = $$('cx-test-panel');
const showing = p.style.display !== 'none';
p.style.display = showing ? 'none' : 'block';
if (!showing) { cxGenTest(); p.scrollIntoView({behavior:'smooth',block:'nearest'}); }
});
$$('cx-close-test-btn').addEventListener('click', () => { $$('cx-test-panel').style.display='none'; });
$$('cx-skip-btn').addEventListener('click', () => { cxTt++; $$('cx-t-total').textContent=cxTt; cxGenTest(); });
$$('cx-submit-btn').addEventListener('click', cxCheckAnswer);
$$('cx-test-input').addEventListener('keydown', e => { if(e.key==='Enter') cxCheckAnswer(); });

// ── Init ────────────────────────────────────────────────────
cxRenderSidebar();
cxSelect('morse');
$$('cx-input').value = 'Halo Dunia';
cxProcess();

// ─── INIT CALLBACK ─────────────────────────────────────────────────────────────
window.nova_init_cipherx = function() {
// Re-attach semua listener setelah HTML di-inject
cxRenderSidebar();
cxSelect('morse');

const inp = document.getElementById('cx-input');
if (inp) { inp.value = 'Halo Dunia'; cxProcess(); }

// Mode buttons
const encBtn = document.getElementById('cx-encode-btn');
const decBtn = document.getElementById('cx-decode-btn');
if (encBtn) encBtn.addEventListener('click', () => {
cxMode = 'encode';
encBtn.className = 'cx-mode-btn cx-mode-active';
decBtn.className = 'cx-mode-btn cx-mode-inactive';
cxProcess();
});
if (decBtn) decBtn.addEventListener('click', () => {
cxMode = 'decode';
decBtn.className = 'cx-mode-btn cx-mode-active';
encBtn.className = 'cx-mode-btn cx-mode-inactive';
cxProcess();
});

// Input
let _cxTimer;
const cxInput = document.getElementById('cx-input');
if (cxInput) cxInput.addEventListener('input', () => { clearTimeout(_cxTimer); _cxTimer = setTimeout(cxProcess, 100); });

// Clear / Paste / Swap / Copy
document.getElementById('cx-clear-btn')?.addEventListener('click', () => {
const i = document.getElementById('cx-input'); if (i) { i.value = ''; cxProcess(); }
window.showToast?.('Teks dibersihkan');
});
document.getElementById('cx-paste-btn')?.addEventListener('click', async () => {
try {
const i = document.getElementById('cx-input');
if (i) { i.value = await navigator.clipboard.readText(); cxProcess(); }
window.showToast?.('Ditempel dari clipboard');
} catch { window.showToast?.('Gagal akses clipboard', 'error'); }
});
document.getElementById('cx-swap-btn')?.addEventListener('click', () => {
const out = document.getElementById('cx-output')?.value;
const inp = document.getElementById('cx-input');
if (!out || !inp) return;
inp.value = out;
cxMode = cxMode === 'encode' ? 'decode' : 'encode';
document.getElementById('cx-encode-btn').className = 'cx-mode-btn cx-mode-' + (cxMode==='encode'?'active':'inactive');
document.getElementById('cx-decode-btn').className = 'cx-mode-btn cx-mode-' + (cxMode==='decode'?'active':'inactive');
cxProcess();
window.showToast?.('Input ↔ Output ditukar');
});
document.getElementById('cx-copy-btn')?.addEventListener('click', () => {
const v = document.getElementById('cx-output')?.value;
if (!v) return;
navigator.clipboard.writeText(v);
window.showToast?.('Hasil sandi disalin!');
});

// Download dropdown
const dlMenu = document.getElementById('cx-dl-menu');
document.getElementById('cx-dl-btn')?.addEventListener('click', e => {
e.stopPropagation(); dlMenu?.classList.toggle('open');
});
document.addEventListener('click', () => dlMenu?.classList.remove('open'));

document.getElementById('cx-dl-txt')?.addEventListener('click', () => {
const v = document.getElementById('cx-output')?.value; if (!v) return;
const a = Object.assign(document.createElement('a'), {
href: URL.createObjectURL(new Blob(['CipherX\nSandi: ' + CX_CIPHERS[cxKey].name + '\nMode: ' + cxMode + '\n\n' + v], {type:'text/plain'})),
download: 'cipherx-' + cxKey + '.txt'
}); a.click(); window.showToast?.('.TXT diunduh');
});
document.getElementById('cx-dl-json')?.addEventListener('click', () => {
const v = document.getElementById('cx-output')?.value; if (!v) return;
const d = { cipher: CX_CIPHERS[cxKey].name, mode: cxMode, input: document.getElementById('cx-input')?.value, output: v, ts: new Date().toISOString() };
const a = Object.assign(document.createElement('a'), {
href: URL.createObjectURL(new Blob([JSON.stringify(d,null,2)], {type:'application/json'})),
download: 'cipherx-' + cxKey + '.json'
}); a.click(); window.showToast?.('.JSON diunduh');
});
document.getElementById('cx-dl-audio')?.addEventListener('click', () => {
const v = document.getElementById('cx-output')?.value; if (!v) return;
window.showToast?.('Memutar audio beep...');
try {
const ctx = new (window.AudioContext||window.webkitAudioContext)();
let t = ctx.currentTime + 0.1;
const beep = (st, dur) => {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sine'; o.frequency.value = 650;
    g.gain.setValueAtTime(0,st); g.gain.linearRampToValueAtTime(0.12,st+0.01);
    g.gain.setValueAtTime(0.12,st+dur-0.01); g.gain.linearRampToValueAtTime(0,st+dur);
    o.connect(g); g.connect(ctx.destination); o.start(st); o.stop(st+dur);
};
for (const c of v) {
    if (c==='.') { beep(t,0.08); t+=0.13; }
    else if (c==='-') { beep(t,0.24); t+=0.29; }
    else if (c===' ') t+=0.13;
    else if (c==='/') t+=0.26;
}
} catch { window.showToast?.('Audio tidak tersedia','error'); }
});

// Test panel
document.getElementById('cx-test-toggle-btn')?.addEventListener('click', () => {
const p = document.getElementById('cx-test-panel');
if (!p) return;
const showing = p.style.display !== 'none';
p.style.display = showing ? 'none' : 'block';
if (!showing) { cxGenTest(); p.scrollIntoView({behavior:'smooth',block:'nearest'}); }
});
document.getElementById('cx-close-test-btn')?.addEventListener('click', () => {
document.getElementById('cx-test-panel').style.display = 'none';
});
document.getElementById('cx-skip-btn')?.addEventListener('click', () => {
cxTt++; const el = document.getElementById('cx-t-total'); if(el) el.textContent = cxTt; cxGenTest();
});
document.getElementById('cx-submit-btn')?.addEventListener('click', cxCheckAnswer);
document.getElementById('cx-test-input')?.addEventListener('keydown', e => { if(e.key==='Enter') cxCheckAnswer(); });
};
