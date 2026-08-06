/* ---------------- DATABASE GAME ---------------- */
const gamesDatabase = [
  { 
    title: 'Majok Ways 2', 
    vendor: 'Pragmatic Play', 
    category: 'Slot', 
    icon: 'assets/logo/majok.png', 
    tag: 'HOT', 
    rtp: '98.8%', 
    path: 'games/Majok/index.html'
  },
  { 
    title: 'Spaceman', 
    vendor: 'Pragmatic Play', 
    category: 'Slot', 
    icon: 'assets/logo/spaceman.png', 
    tag: 'TOP', 
    rtp: '97.5%', 
    path: 'games/Spaceman/index.html' 
  },
  { 
    title: 'Megawil Live', 
    vendor: 'PG Soft', 
    category: 'Arcade', 
    icon: 'assets/logo/Megawil.png', 
    tag: 'Live', 
    rtp: '99.1%', 
    path: 'games/Megawil/index.html' 
  },
  { 
    title: 'Coming Soon!!', 
    vendor: 'Habanero', 
    category: 'Arcade', 
    icon: 'assets/logo/kv5.png', 
    tag: '', 
    rtp: '0%', 
    path: 'games/coming-soon/index.html' 
  }
];

// Global States
let currentUser = null;
let jackpotValue = 1482930500;
let activeCategoryFilter = 'all';
let activeProviderFilter = 'all';

/* ---------------- 1. SISTEM SINKRONISASI SALDO LINTAS TAB / IFRAME ---------------- */
window.addEventListener('storage', function(e) {
  if (e.key === 'users_db') {
    let db = JSON.parse(e.newValue) || {};
    if (currentUser && db[currentUser]) {
      updateUserUIDisplay(db[currentUser].balance);

      const balanceBadge = document.querySelector('.balance-badge');
      if (balanceBadge) {
        balanceBadge.classList.add('balance-highlight-anim');
        setTimeout(() => balanceBadge.classList.remove('balance-highlight-anim'), 1200);
      }
    }
  }
});

window.addEventListener('focus', function() {
  if (currentUser) {
    let db = JSON.parse(localStorage.getItem('users_db')) || {};
    if (db[currentUser]) {
      updateUserUIDisplay(db[currentUser].balance);
    }
  }
});

window.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'UPDATE_BALANCE') {
    const newBalance = parseFloat(event.data.newBalance);
    updateLocalDatabaseBalance(newBalance);
    updateUserUIDisplay(newBalance);
  }
});

function updateLocalDatabaseBalance(balance) {
  if (!currentUser) return;
  let db = JSON.parse(localStorage.getItem('users_db')) || {};
  if (db[currentUser]) {
    db[currentUser].balance = balance;
    localStorage.setItem('users_db', JSON.stringify(db));
  }
}

function updateUserUIDisplay(balance) {
  const balanceEl = document.getElementById('userBalance');
  if (balanceEl) {
    balanceEl.innerText = `Rp ${balance.toLocaleString('id-ID')}`;
  }
}

/* ---------------- NOTIFICATION SYSTEM ---------------- */
function showNotify(title, message, icon = '✨') {
  document.getElementById('notifyIcon').innerText = icon;
  document.getElementById('notifyTitle').innerText = title;
  document.getElementById('notifyDesc').innerText = message;
  document.getElementById('notifyOverlay').style.display = 'flex';
}

function closeNotify() {
  document.getElementById('notifyOverlay').style.display = 'none';
}

/* ---------------- CAROUSEL BANNER ---------------- */
const track = document.getElementById('carouselTrack');
const dots = document.querySelectorAll('.page-dot');
let currentIndex = 0;

function setPositionByIndex() {
  if (!track) return;
  const slideWidth = track.offsetWidth / dots.length;
  track.style.transform = `translateX(-${currentIndex * 50}%)`;
  
  dots.forEach((dot, idx) => {
    dot.classList.toggle('active', idx === currentIndex);
  });
}

function goToSlide(index) {
  currentIndex = index;
  setPositionByIndex();
}

setInterval(() => {
  if (dots.length > 0) {
    currentIndex = (currentIndex + 1) % dots.length;
    setPositionByIndex();
  }
}, 4000);

/* ---------------- RENDER GAMES & FILTERS ---------------- */
function renderGames() {
  const container = document.getElementById('gamesGrid');
  if (!container) return;
  container.innerHTML = '';

  const filtered = gamesDatabase.filter(g => {
    const catMatch = activeCategoryFilter === 'all' || g.category === activeCategoryFilter;
    const provMatch = activeProviderFilter === 'all' || g.vendor === activeProviderFilter;
    return catMatch && provMatch;
  });

  if (filtered.length === 0) {
    container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px 0; color: var(--text-secondary); font-size: 0.85rem;">Tidak ada permainan yang cocok.</div>`;
    return;
  }

  filtered.forEach(game => {
    const card = document.createElement('div');
    card.className = 'game-card-item';
    card.innerHTML = `
      <div class="game-thumb-wrapper">
        ${game.tag ? `<span class="badge-tag">${game.tag}</span>` : ''}
        <img src="${game.icon}" alt="${game.title}" onerror="this.onerror=null; this.src='https://via.placeholder.com/150/1e293b/ffffff?text=LOGO';">
      </div>
      <div class="game-info-box">
        <div>
          <div class="game-title">${game.title}</div>
          <div class="game-provider">${game.vendor}</div>
        </div>
        <div class="rtp-bar-wrapper">
          <div class="rtp-header">
            <span>RTP</span>
            <span style="color:var(--accent-green)">${game.rtp}</span>
          </div>
          <div class="rtp-bar-bg">
            <div class="rtp-bar-fill" style="width: ${game.rtp}; background: var(--accent-green);"></div>
          </div>
        </div>
        <button class="btn-play-game" onclick="openGame('${game.path}')">MAIN</button>
      </div>
    `;
    container.appendChild(card);
  });
}

function switchCategory(cat, element) {
  activeCategoryFilter = cat;
  
  document.querySelectorAll('.sidebar-nav .nav-category-item').forEach(el => el.classList.remove('active'));
  if (element) element.classList.add('active');

  const bottomItems = document.querySelectorAll('.mobile-bottom-nav .bottom-nav-item');
  bottomItems.forEach(el => el.classList.remove('active'));
  if (cat === 'all' && bottomItems[0]) bottomItems[0].classList.add('active');

  renderGames();
}

function filterProvider(prov, element) {
  activeProviderFilter = prov;
  if (element) {
    document.querySelectorAll('.provider-scroll .provider-chip').forEach(el => el.classList.remove('active'));
    element.classList.add('active');
  }
  renderGames();
}

/* ---------------- JACKPOT TICKER ---------------- */
setInterval(() => {
  jackpotValue += Math.floor(Math.random() * 2000) + 500;
  const jackpotEl = document.getElementById('jackpotVal');
  if (jackpotEl) {
    jackpotEl.innerText = `Rp ${jackpotValue.toLocaleString('id-ID')}`;
  }
}, 2000);

/* ---------------- AUTH & USER STATE ---------------- */
window.onload = function() {
  renderGames();
  const activeSession = localStorage.getItem('active_session');
  if (activeSession) {
    currentUser = activeSession;
    let db = JSON.parse(localStorage.getItem('users_db')) || {};
    if (db[currentUser]) {
      updateUserUIDisplay(db[currentUser].balance);
    }
    const authOverlay = document.getElementById('authOverlay');
    if (authOverlay) authOverlay.style.display = 'none';
  }
};

function openAuthModal() {
  if (!currentUser) {
    document.getElementById('authOverlay').style.display = 'flex';
  }
}

function switchAuthTab(tab) {
  const isLogin = tab === 'login';
  document.getElementById('loginForm').style.display = isLogin ? 'block' : 'none';
  document.getElementById('registerForm').style.display = isLogin ? 'none' : 'block';
  document.getElementById('tabLogin').classList.toggle('active', isLogin);
  document.getElementById('tabRegister').classList.toggle('active', !isLogin);
}

function handleRegister(e) {
  e.preventDefault();
  const u = document.getElementById('regUser').value.trim();
  const p = document.getElementById('regPass').value.trim();
  let db = JSON.parse(localStorage.getItem('users_db')) || {};

  if (db[u]) {
    showNotify('Gagal Registrasi', 'Username sudah digunakan!', '⚠️');
    return;
  }

  db[u] = { password: p, balance: 50000 };
  localStorage.setItem('users_db', JSON.stringify(db));
  showNotify('Sukses', 'Pendaftaran Berhasil! Silakan Login.', '✅');
  switchAuthTab('login');
}

function handleLogin(e) {
  e.preventDefault();
  const u = document.getElementById('loginUser').value.trim();
  const p = document.getElementById('loginPass').value.trim();
  let db = JSON.parse(localStorage.getItem('users_db')) || {};

  if (db[u] && db[u].password === p) {
    currentUser = u;
    localStorage.setItem('active_session', u);
    
    const authOverlay = document.getElementById('authOverlay');
    const modalCard = authOverlay.querySelector('.modal-card');
    modalCard.className = 'success-login-card';
    modalCard.innerHTML = `
      <div class="success-checkmark-circle">
        <i class="fa-solid fa-check"></i>
      </div>
      <h3 style="color: var(--gold-light); font-family: Teko, sans-serif; font-size: 1.8rem; line-height: 1; margin-bottom: 4px;">LOGIN BERHASIL!</h3>
      <p style="color: var(--text-secondary); font-size: 0.82rem;">Selamat datang kembali, <strong style="color:#fff;">${u}</strong></p>
    `;

    setTimeout(() => {
      authOverlay.style.transition = 'opacity 0.3s ease';
      authOverlay.style.opacity = '0';

      setTimeout(() => {
        authOverlay.style.display = 'none';
        authOverlay.style.opacity = '1'; 
        resetAuthModalStructure();

        updateUserUIDisplay(db[u].balance);

        const balanceBadge = document.querySelector('.balance-badge');
        if (balanceBadge) {
          balanceBadge.classList.add('balance-highlight-anim');
          setTimeout(() => balanceBadge.classList.remove('balance-highlight-anim'), 1200);
        }
        showToast(`Selamat datang kembali, ${u}!`, 'success');
      }, 300);
    }, 1200);

  } else {
    showNotify('Gagal Login', 'Username atau Password salah!', '❌');
  }
}

function handleLogout() {
  localStorage.removeItem('active_session');
  location.reload();
}

/* ---------------- PROFILE MODAL ---------------- */
function openProfileModal() {
  if (!currentUser) { openAuthModal(); return; }
  let db = JSON.parse(localStorage.getItem('users_db')) || {};
  document.getElementById('profUser').value = currentUser;
  document.getElementById('profBalance').value = `Rp ${db[currentUser].balance.toLocaleString('id-ID')}`;
  document.getElementById('profileModal').style.display = 'flex';
}

function closeProfileModal() {
  document.getElementById('profileModal').style.display = 'none';
}

/* ---------------- PROMO MODAL ---------------- */
function openPromoModal() {
  document.getElementById('promoModal').style.display = 'flex';
}

function closePromoModal() {
  document.getElementById('promoModal').style.display = 'none';
}

function claimPromo(title) {
  if (!currentUser) { closePromoModal(); openAuthModal(); return; }
  closePromoModal();
  showNotify('Promo Diklaim', `Selamat! ${title} berhasil diaktifkan pada akun Anda.`, '🎁');
}

/* ---------------- CONTEXTUAL LIVE CHAT ---------------- */
function openChatModal() {
  document.getElementById('chatModal').style.display = 'flex';
}

function closeChatModal() {
  document.getElementById('chatModal').style.display = 'none';
}

function handleChatKey(e) {
  if (e.key === 'Enter') sendChatMessage();
}

function sendChatMessage() {
  const input = document.getElementById('chatInput');
  const text = input.value.trim();
  if (!text) return;

  const chatBox = document.getElementById('chatBox');
  
  const userMsg = document.createElement('div');
  userMsg.className = 'msg-bubble msg-user';
  userMsg.innerText = text;
  chatBox.appendChild(userMsg);

  input.value = '';
  chatBox.scrollTop = chatBox.scrollHeight;

  setTimeout(() => {
    const csMsg = document.createElement('div');
    csMsg.className = 'msg-bubble msg-cs';
    csMsg.innerText = getSmartResponse(text.toLowerCase());
    chatBox.appendChild(csMsg);
    chatBox.scrollTop = chatBox.scrollHeight;
  }, 800);
}

function getSmartResponse(input) {
  if (input.includes('depo') || input.includes('isi') || input.includes('topup') || input.includes('bayar')) {
    return "Untuk melakukan Deposit, silakan klik tombol [TOP UP] di bagian bawah atau navigasi utama. Minimal deposit Rp 10.000 via QRIS, Bank, atau E-Wallet.";
  }
  if (input.includes('wd') || input.includes('withdraw') || input.includes('tarik')) {
    return "Penarikan dana (Withdraw) dapat diproses melalui menu WD atau Akun Profil. Minimal penarikan saldo adalah Rp 50.000.";
  }
  if (input.includes('promo') || input.includes('bonus')) {
    return "Bonus New Member 100% & Cashback Harian tersedia di menu [Promosi].";
  }
  return "Terima kasih atas pertanyaannya. Tim CS VIP telah mencatat pesan Anda.";
}

/* ---------------- FULLSCREEN GAME ENGINE ---------------- */
function openGame(url) {
  if (!currentUser) { 
    openAuthModal(); 
    return; 
  }
  window.open(url, '_blank');
}

/* ---------------- TOP UP SYSTEM FLOW ---------------- */
let currentTopUpData = {
  amount: 0,
  adminFee: 0,
  totalAmount: 0,
  method: '',
  trxId: '',
  timerInterval: null
};

function openTopUpModal() {
  if (!currentUser) { openAuthModal(); return; }
  
  document.getElementById('manualAmount').value = '';
  document.getElementById('stepInput').style.display = 'block';
  document.getElementById('stepSummary').style.display = 'none';
  document.getElementById('stepSuccess').style.display = 'none';
  
  document.querySelectorAll('.quick-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.method-item').forEach(item => item.classList.remove('selected'));
  currentTopUpData.method = '';
  
  document.getElementById('topupModal').style.display = 'flex';
}

function closeTopUpModal() {
  if (currentTopUpData.timerInterval) {
    clearInterval(currentTopUpData.timerInterval);
  }
  document.getElementById('topupModal').style.display = 'none';
}

function selectQuickAmount(amount, element) {
  document.querySelectorAll('#stepInput .quick-btn').forEach(btn => btn.classList.remove('active'));
  if (element) element.classList.add('active');
  document.getElementById('manualAmount').value = amount;
}

function selectPaymentMethod(element, methodName) {
  document.querySelectorAll('.method-item').forEach(item => item.classList.remove('selected'));
  if (element) element.classList.add('selected');
  currentTopUpData.method = methodName;
}

function processTopUpInput() {
  const rawVal = document.getElementById('manualAmount').value;
  const amount = parseInt(rawVal);

  if (!amount || amount < 10000) {
    showToast('Minimal top-up adalah Rp10.000.', 'error');
    return;
  }

  if (!currentTopUpData.method) {
    showToast('Silakan pilih metode pembayaran terlebih dahulu.', 'error');
    return;
  }

  showLoading(true);

  setTimeout(() => {
    showLoading(false);
    
    const adminFee = currentTopUpData.method.includes('Kartu') ? 2500 : 0;
    const total = amount + adminFee;
    const trxId = 'TRX-' + Math.floor(100000 + Math.random() * 900000);

    currentTopUpData.amount = amount;
    currentTopUpData.adminFee = adminFee;
    currentTopUpData.totalAmount = total;
    currentTopUpData.trxId = trxId;

    document.getElementById('summaryNominal').innerText = `Rp ${amount.toLocaleString('id-ID')}`;
    document.getElementById('summaryAdmin').innerText = `Rp ${adminFee.toLocaleString('id-ID')}`;
    document.getElementById('summaryTotal').innerText = `Rp ${total.toLocaleString('id-ID')}`;
    document.getElementById('payCodeVal').innerText = `8830${Math.floor(10000000 + Math.random() * 90000000)}`;
    
    document.getElementById('stepInput').style.display = 'none';
    document.getElementById('stepSummary').style.display = 'block';

    startPaymentTimer(120);
  }, 1000);
}

function startPaymentTimer(durationInSeconds) {
  let timer = durationInSeconds;
  const timerDisplay = document.getElementById('paymentTimer');

  if (currentTopUpData.timerInterval) clearInterval(currentTopUpData.timerInterval);

  currentTopUpData.timerInterval = setInterval(() => {
    let minutes = parseInt(timer / 60, 10);
    let seconds = parseInt(timer % 60, 10);

    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;

    if (timerDisplay) timerDisplay.innerText = `${minutes}:${seconds}`;

    if (--timer < 0) {
      clearInterval(currentTopUpData.timerInterval);
      showToast("Waktu pembayaran habis. Silakan buat pesanan top-up baru.", "error");
      closeTopUpModal();
    }
  }, 1000);
}

function copyPayCode() {
  const code = document.getElementById('payCodeVal').innerText;
  navigator.clipboard.writeText(code);
  showToast("Kode pembayaran berhasil disalin!", "success");
}

function simulateWebhookSuccess() {
  showLoading(true);

  setTimeout(() => {
    showLoading(false);
    if (currentTopUpData.timerInterval) clearInterval(currentTopUpData.timerInterval);

    let db = JSON.parse(localStorage.getItem('users_db')) || {};
    if (db[currentUser]) {
      db[currentUser].balance += currentTopUpData.amount;
      localStorage.setItem('users_db', JSON.stringify(db));
      updateUserUIDisplay(db[currentUser].balance);
    }

    document.getElementById('successAmount').innerText = `Rp ${currentTopUpData.amount.toLocaleString('id-ID')}`;
    document.getElementById('successFinalBalance').innerText = document.getElementById('userBalance').innerText;
    document.getElementById('successTrxId').innerText = currentTopUpData.trxId;

    document.getElementById('stepSummary').style.display = 'none';
    document.getElementById('stepSuccess').style.display = 'block';

    showToast(`Top Up Rp${currentTopUpData.amount.toLocaleString('id-ID')} berhasil! Saldo kamu telah diperbarui.`, "success");
  }, 1200);
}

/* ---------------- WITHDRAW SYSTEM FLOW ---------------- */
function openWithdrawModal() {
  if (!currentUser) { openAuthModal(); return; }
  
  document.getElementById('wdBank').value = '';
  document.getElementById('wdAccountNum').value = '';
  document.getElementById('wdAccountName').value = '';
  document.getElementById('wdAmount').value = '';
  
  document.getElementById('stepWdInput').style.display = 'block';
  document.getElementById('stepWdSuccess').style.display = 'none';
  
  document.getElementById('withdrawModal').style.display = 'flex';
}

function closeWithdrawModal() {
  document.getElementById('withdrawModal').style.display = 'none';
}

function selectQuickWdAmount(val) {
  let db = JSON.parse(localStorage.getItem('users_db')) || {};
  let currentBalance = db[currentUser] ? db[currentUser].balance : 0;

  if (val === 'all') {
    document.getElementById('wdAmount').value = currentBalance;
  } else {
    document.getElementById('wdAmount').value = val;
  }
}

function processWithdrawInput() {
  const bank = document.getElementById('wdBank').value;
  const accNum = document.getElementById('wdAccountNum').value.trim();
  const accName = document.getElementById('wdAccountName').value.trim();
  const amount = parseInt(document.getElementById('wdAmount').value);

  if (!bank || !accNum || !accName || !amount) {
    showToast('Harap isi semua formulir penarikan.', 'error');
    return;
  }

  if (amount < 50000) {
    showToast('Minimal penarikan saldo adalah Rp50.000.', 'error');
    return;
  }

  let db = JSON.parse(localStorage.getItem('users_db')) || {};
  let userBalance = db[currentUser] ? db[currentUser].balance : 0;

  if (amount > userBalance) {
    showToast('Saldo Anda tidak mencukupi untuk melakukan penarikan ini.', 'error');
    return;
  }

  showLoading(true);

  setTimeout(() => {
    showLoading(false);

    db[currentUser].balance -= amount;
    localStorage.setItem('users_db', JSON.stringify(db));
    updateUserUIDisplay(db[currentUser].balance);

    const trxId = 'WD-' + Math.floor(100000 + Math.random() * 900000);

    document.getElementById('wdTrxId').innerText = trxId;
    document.getElementById('wdTargetBank').innerText = bank;
    document.getElementById('wdTargetAcc').innerText = `${accNum} a/n ${accName}`;
    document.getElementById('wdSuccessAmount').innerText = `Rp ${amount.toLocaleString('id-ID')}`;
    document.getElementById('wdFinalBalance').innerText = `Rp ${db[currentUser].balance.toLocaleString('id-ID')}`;

    document.getElementById('stepWdInput').style.display = 'none';
    document.getElementById('stepWdSuccess').style.display = 'block';

    showToast(`Permintaan penarikan Rp${amount.toLocaleString('id-ID')} berhasil dikirim.`, 'success');
  }, 1200);
}

/* ---------------- TOAST, LOADING & HELPER SYSTEM ---------------- */
function showToast(message, type = 'info') {
  const toast = document.getElementById('toastNotification');
  if (!toast) return;

  toast.innerText = message;
  toast.className = `toast-banner toast-${type} show`;

  setTimeout(() => {
    toast.className = toast.className.replace('show', '');
  }, 3500);
}

function showLoading(state) {
  const loading = document.getElementById('loadingOverlay');
  if (loading) {
    loading.style.display = state ? 'flex' : 'none';
  }
}

function resetAuthModalStructure() {
  const authOverlay = document.getElementById('authOverlay');
  if(!authOverlay) return;
  authOverlay.innerHTML = `
    <div class="modal-card">
      <div class="tab-switcher">
        <div class="tab-btn active" id="tabLogin" onclick="switchAuthTab('login')">LOGIN</div>
        <div class="tab-btn" id="tabRegister" onclick="switchAuthTab('register')">DAFTAR</div>
      </div>

      <form id="loginForm" onsubmit="handleLogin(event)">
        <div class="field-group">
          <label>Username</label>
          <input type="text" id="loginUser" class="input-control" placeholder="Masukkan username" required>
        </div>
        <div class="field-group">
          <label>Password</label>
          <input type="password" id="loginPass" class="input-control" placeholder="Masukkan password" required>
        </div>
        <button type="submit" class="btn-submit">MASUK</button>
      </form>

      <form id="registerForm" onsubmit="handleRegister(event)" style="display: none;">
        <div class="field-group">
          <label>Username Baru</label>
          <input type="text" id="regUser" class="input-control" placeholder="Buat username" required>
        </div>
        <div class="field-group">
          <label>Password Baru</label>
          <input type="password" id="regPass" class="input-control" placeholder="Buat password" required>
        </div>
        <button type="submit" class="btn-submit">BUAT AKUN VIP</button>
      </form>
    </div>
  `;
}