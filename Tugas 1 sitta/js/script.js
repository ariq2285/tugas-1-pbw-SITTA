/* script.js — logika terpusat, aman untuk semua halaman */

/* ====== UTILS ====== */
function el(id) { return document.getElementById(id); }
function qs(sel) { return document.querySelector(sel); }

/* ====== LOGIN ====== */
function login() {
  const emailEl = document.getElementById('email');
  const passEl = document.getElementById('password');
  if (!emailEl || !passEl) return alert('Form login tidak tersedia.');

  const email = emailEl.value.trim();
  const password = passEl.value.trim();

  const user = (typeof dataPengguna !== 'undefined')
    ? dataPengguna.find(u => u.email === email && u.password === password)
    : null;

  if (user) {
    alert(`Login berhasil! Selamat datang, ${user.nama}`);
    localStorage.setItem('userLogin', JSON.stringify(user));
    window.location.href = 'dashboard.html';
  } else {
    alert('Email atau password yang anda masukkan salah.');
  }
}

/* ====== MODAL (umum) ====== */
function openModal(id) {
  const m = el(id);
  if (m) m.style.display = 'block';
}
function closeModal(id) {
  const m = el(id);
  if (m) m.style.display = 'none';
}
window.addEventListener('click', function (e) {
  if (e.target && e.target.classList && e.target.classList.contains('modal')) {
    e.target.style.display = 'none';
  }
});

/* ====== DASHBOARD (hanya kalau elemen ada) ====== */
function initDashboard() {
  const greetingEl = document.getElementById('greetingText');
  const userInfoEl = document.getElementById('userInfo');
  const userJson = localStorage.getItem('userLogin');

  if (!greetingEl || !userInfoEl) return;
  if (!userJson) {
    alert('Silakan login terlebih dahulu!');
    window.location.href = 'index.html';
    return;
  }

  const user = JSON.parse(userJson);
  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Selamat Pagi' : hour < 18 ? 'Selamat Siang' : 'Selamat Sore';
  greetingEl.innerText = `${greet}, ${user.nama}!`;
  userInfoEl.innerText = `${user.role} • ${user.lokasi}`;
}

function logout() {
  localStorage.removeItem('userLogin');
  window.location.href = 'index.html';
}

/* ====== TRACKING ====== */
function cariDO() {
  const inputEl = el('inputDO');
  const resultContainer = el('resultContainer');
  const infoSection = el('infoSection');
  const trackingTable = el('trackingTable');
  const progressBar = el('progressBar');

  if (!inputEl || !infoSection || !trackingTable || !progressBar || !resultContainer) {
    alert('Elemen tracking tidak lengkap di halaman ini.');
    return;
  }

  const input = inputEl.value.trim();
  infoSection.innerHTML = '';
  trackingTable.innerHTML = '';
  resultContainer.style.display = 'none';

  if (input === '') {
    alert('Masukkan Nomor DO terlebih dahulu!');
    return;
  }

  if (typeof dataTracking === 'undefined') {
    alert('Data tracking belum tersedia.');
    return;
  }

  const data = dataTracking[input];
  if (!data) {
    alert('Nomor DO tidak ditemukan!');
    return;
  }

  resultContainer.style.display = 'block';
  infoSection.innerHTML = `
    <b>Nama:</b> ${data.nama}<br>
    <b>Status:</b> ${data.status}<br>
    <b>Ekspedisi:</b> ${data.ekspedisi}<br>
    <b>Tanggal Kirim:</b> ${data.tanggalKirim}<br>
    <b>Jenis Paket:</b> ${data.paket}<br>
    <b>Total Pembayaran:</b> ${data.total}
  `;

  const totalSteps = 6;
  const step = (data.perjalanan.length / totalSteps) * 100;
  const percent = Math.min(Math.round(step), 100);
  progressBar.style.width = percent + '%';
  progressBar.innerText = percent + '%';

  let rows = '<tr><th colspan="2" style="text-align:left">Riwayat Perjalanan</th></tr>';
  data.perjalanan.forEach(p => {
    rows += `<tr><td style="width:35%">${p.waktu}</td><td>${p.keterangan}</td></tr>`;
  });
  trackingTable.innerHTML = rows;
}

/* ====== STOK ====== */
function tampilkanDataBahan() {
  const tbody = qs('#stokTable tbody');
  if (!tbody) return;
  if (typeof dataBahanAjar === 'undefined') {
    tbody.innerHTML = '<tr><td colspan="6">Data bahan ajar tidak tersedia.</td></tr>';
    return;
  }

  tbody.innerHTML = '';
  dataBahanAjar.forEach(item => {
    const row = document.createElement('tr');
    const cover = item.cover || 'assets/logo-ut.png';
    row.innerHTML = `
      <td><img src="${cover}" class="cover" alt="${item.namaBarang}"></td>
      <td>${item.kodeBarang || ''}</td>
      <td>${item.namaBarang || ''}</td>
      <td>${item.jenisBarang || ''}</td>
      <td>${item.edisi || ''}</td>
      <td>${item.stok != null ? item.stok : ''}</td>
    `;
    tbody.appendChild(row);
  });
}

function tambahDataBahan() {
  const kodeBarang = (el('kodeBarang') && el('kodeBarang').value.trim()) || '';
  const namaBarang = (el('namaBarang') && el('namaBarang').value.trim()) || '';
  const jenisBarang = (el('jenisBarang') && el('jenisBarang').value.trim()) || '';
  const edisi = (el('edisi') && el('edisi').value.trim()) || '';
  const stok = (el('stok') && el('stok').value.trim()) || '';
  const cover = (el('cover') && el('cover').value.trim()) || '';

  if (!kodeBarang || !namaBarang || !jenisBarang || !edisi || !stok) {
    alert('Semua kolom harus diisi!');
    return;
  }

  if (typeof dataBahanAjar === 'undefined') window.dataBahanAjar = [];

  dataBahanAjar.push({
    kodeLokasi: '0TMP01',
    kodeBarang,
    namaBarang,
    jenisBarang,
    edisi,
    stok: parseInt(stok, 10),
    cover: cover || 'assets/logo-ut.png'
  });

  tampilkanDataBahan();
  alert('Data berhasil ditambahkan!');
  document.querySelectorAll('.add-form input').forEach(i => i.value = '');
}

/* ====== Init sesuai halaman ====== */
document.addEventListener('DOMContentLoaded', function () {
  // jika ada elemen stokTable → halaman stok
  if (qs('#stokTable')) tampilkanDataBahan();

  // tombol tambah data stok (mungkn ada di stok.html)
  if (el('kodeBarang') && el('kodeBarang').closest) {
    const tambahBtn = document.querySelector('.add-form button');
    if (tambahBtn) tambahBtn.addEventListener('click', tambahDataBahan);
  }

  // jika ada elemen inputDO → halaman tracking
  if (el('inputDO')) {
    const cariBtn = document.querySelector('.search-btn');
    if (cariBtn) cariBtn.addEventListener('click', cariDO);
  }

  // jika ada greetingText → halaman dashboard
  if (el('greetingText')) initDashboard();

  // pasang tombol login dari index.html (jika ada)
  const loginBtn = document.querySelector('.login-container button');
  if (loginBtn && el('email') && el('password')) {
    loginBtn.addEventListener('click', function (e) { e.preventDefault(); login(); });
  }

});