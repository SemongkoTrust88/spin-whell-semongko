/* =========================================================
   BIGSLOTO Lucky Wheel - editable configuration
   ========================================================= */
const CONFIG = {
  // Keep empty when the API is served from the same domain.
  // Example for an external backend: "https://api.example.com"
  API_BASE: "",
  API_PATH: "/wheel/start/",

  social: {
    instagram: "https://www.instagram.com/bigsloto/",
    facebook: "https://facebook.com/bigsloto",
    twitter: "https://twitter.com/bigsloto"
  }
};

const segments = [
  { fillStyle: '#ff0000', text: 'IPHONE-17', textFillStyle: '#c3da08' },
  { fillStyle: '#ff0000', text: 'PS-5', textFillStyle: '#c3da08' },
  { fillStyle: '#c3da08', text: '10,000,000', textFillStyle: '#1e9201' },
  { fillStyle: '#1e9201', text: '5,000,000', textFillStyle: '#c3da08' },
  { fillStyle: '#ff0000', text: 'VERSYS-650', textFillStyle: '#fff', textFontSize: 15 },
  { fillStyle: '#c3da08', text: '1,000,000', textFillStyle: '#1e9201' },
  { fillStyle: '#1e9201', text: '500,000', textFillStyle: '#c3da08' },
  { fillStyle: '#c3da08', text: '100,000', textFillStyle: '#1e9201' },
  { fillStyle: '#1e9201', text: '50,000', textFillStyle: '#c3da08' },
  { fillStyle: '#c3da08', text: '20,000', textFillStyle: '#1e9201' },
  { fillStyle: '#1e9201', text: 'CASHBACK 10%', textFillStyle: '#c3da08', textFontSize: 13 },
  { fillStyle: '#c3da08', text: 'BONUS DP 10%', textFillStyle: '#1e9201', textFontSize: 14 }
];

let wincode = '';
let whatsapp = '';
let wheelSpinning = false;
let xhr = null;

const $ = (id) => document.getElementById(id);
const codeInput = $('code');
const spinButton = $('spin_button');
const status = $('status');

const theWheel = new Winwheel({
  numSegments: segments.length,
  outerRadius: 185,
  innerRadius: 75,
  textFontSize: 18,
  textMargin: 0,
  segments,
  animation: {
    type: 'spinToStop',
    duration: 4,
    spins: 12,
    callbackFinished: alertPrize
  }
});

function setStatus(message) {
  status.textContent = message;
}

function closeWelcome() {
  $('welcome-wrapper').classList.add('hidden');
}

function showModal(id, message) {
  $(id + '-text').innerHTML = message;
  $(id).classList.remove('hidden');
}

function hideModal(id) {
  $(id).classList.add('hidden');
  codeInput.value = '';
  resetWheel();
}

function resetWheel() {
  theWheel.stopAnimation(false);
  theWheel.rotationAngle = 0;
  theWheel.draw();
  wheelSpinning = false;
  spinButton.disabled = false;
}

function calculatePrizeOnServer(code) {
  if (!CONFIG.API_BASE && location.protocol === 'file:') {
    showModal('alert', 'Backend belum terhubung. Upload project ke Netlify/GitHub Pages atau isi <b>CONFIG.API_BASE</b> pada <code>script.js</code>.');
    spinButton.disabled = false;
    wheelSpinning = false;
    return;
  }

  xhr = new XMLHttpRequest();
  xhr.onreadystatechange = ajaxStateChange;
  const base = CONFIG.API_BASE.replace(/\/$/, '');
  const url = base + CONFIG.API_PATH + encodeURIComponent(code) + '?_=' + Date.now();
  xhr.open('GET', url, true);
  xhr.send();
}

function ajaxStateChange() {
  if (!xhr || xhr.readyState !== 4) return;

  if (xhr.status !== 200) {
    setStatus('Backend tidak merespons. Periksa API_BASE dan endpoint.');
    showModal('alert', 'Terjadi kesalahan saat menghubungi server. Silakan periksa koneksi backend.');
    wheelSpinning = false;
    spinButton.disabled = false;
    return;
  }

  let resp = xhr.responseText.trim();
  if (resp.length > 2) {
    try {
      resp = atob(resp).split('-');
      const segmentNumber = Number(resp[0]);
      wincode = resp[1] || '';
      whatsapp = resp[3] || '';

      if (segmentNumber > 0 && segmentNumber <= segments.length) {
        setStatus('Kode valid. Wheel sedang berputar...');
        const stopAt = theWheel.getRandomForSegment(segmentNumber);
        theWheel.animation.stopAngle = stopAt;
        theWheel.startAnimation();
      } else {
        showModal('alert', 'Respons server tidak valid.');
        wheelSpinning = false;
        spinButton.disabled = false;
      }
    } catch (error) {
      console.error(error);
      showModal('alert', 'Respons server tidak dapat diproses.');
      wheelSpinning = false;
      spinButton.disabled = false;
    }
  } else if (resp === '-1') {
    showModal('alert', 'Maaf, kode yang kamu masukkan sudah kadaluarsa.');
    wheelSpinning = false;
    spinButton.disabled = false;
  } else if (resp === '') {
    showModal('alert', 'Maaf, kode yang kamu masukkan salah.');
    wheelSpinning = false;
    spinButton.disabled = false;
  }
}

function startSpin() {
  const code = codeInput.value.trim();
  if (!code) {
    showModal('alert', 'Masukkan Kode Tiket Terlebih Dahulu!');
    return;
  }
  if (wheelSpinning) return;

  wheelSpinning = true;
  spinButton.disabled = true;
  setStatus('Memeriksa kode tiket...');
  calculatePrizeOnServer(code);
}

function prizeLabel(rawPrize) {
  const map = {
    'IPHONE-17': 'IPHONE 17 PRO MAX',
    'PS-5': 'Playstation 5',
    'CASHBACK 10%': 'CASHBACK 10%',
    'VERSYS-650': 'VERSYS 650cc',
    'BONUS DP 10%': 'BONUS DEPOSIT 10%'
  };
  return map[rawPrize] || rawPrize + ' CREDIT';
}

function makeConfetti() {
  const layer = $('confetti-layer');
  layer.innerHTML = '';
  const colors = ['#ff0000', '#ffd700', '#c8dc18', '#ffffff', '#20b45a'];
  for (let i = 0; i < 70; i++) {
    const piece = document.createElement('span');
    piece.className = 'confetti-piece';
    piece.style.left = Math.random() * 100 + '%';
    piece.style.background = colors[i % colors.length];
    piece.style.setProperty('--x', (Math.random() * 240 - 120) + 'px');
    piece.style.animationDelay = (Math.random() * .6) + 's';
    layer.appendChild(piece);
  }
  setTimeout(() => { layer.innerHTML = ''; }, 3500);
}

function alertPrize(indicatedSegment) {
  wheelSpinning = false;
  spinButton.disabled = false;

  const rawPrize = indicatedSegment.text;
  const prize = prizeLabel(rawPrize);
  const message = encodeURIComponent('halo, saya mau klaim wheel of fortune dengan kode kemenangan ' + wincode);

  if (rawPrize === 'ZONK') {
    showModal('congrats', '<b>Yaah ZONK, Anda Kurang Beruntung!</b><div style="margin-top:10px">Silakan coba kembali di lain kesempatan.</div>');
    return;
  }

  const whatsappLink = whatsapp
    ? 'https://api.whatsapp.com/send?phone=' + encodeURIComponent(whatsapp) + '&text=' + message
    : '#';

  const social = CONFIG.social;
  const html = `
    <div style="text-align:center">
      <div style="font-size:28px;margin-bottom:10px">🎉</div>
      <b>SELAMAT! ANDA MEMENANGKAN HADIAH</b>
      <div style="color:gold;font-size:22px;margin:8px 0"><b>${escapeHtml(prize)}</b></div>
      <div><b>Kode Kemenangan:</b> <span style="color:gold"><b>${escapeHtml(wincode)}</b></span></div>
      ${whatsapp ? `<div class="claim"><i class="fa-brands fa-whatsapp" style="color:gold"></i> <a href="${whatsappLink}" target="_blank" rel="noopener">WhatsApp</a></div>` : ''}
      <div style="margin:16px 0 8px">Follow media sosial untuk mendapatkan informasi terbaru.</div>
      <div style="font-size:24px">
        <a href="${social.instagram}" target="_blank" rel="noopener" style="color:gold;margin:0 8px"><i class="fa-brands fa-instagram"></i></a>
        <a href="${social.facebook}" target="_blank" rel="noopener" style="color:gold;margin:0 8px"><i class="fa-brands fa-facebook"></i></a>
        <a href="${social.twitter}" target="_blank" rel="noopener" style="color:gold;margin:0 8px"><i class="fa-brands fa-x-twitter"></i></a>
      </div>
    </div>`;

  makeConfetti();
  showModal('congrats', html);
  setStatus('Selesai.');
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (char) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[char]));
}

$('agree').addEventListener('click', closeWelcome);
$('close-alert').addEventListener('click', () => hideModal('alert'));
$('close-congrats').addEventListener('click', () => hideModal('congrats'));
spinButton.addEventListener('click', startSpin);
codeInput.addEventListener('keydown', (event) => { if (event.key === 'Enter') startSpin(); });
