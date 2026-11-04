// State Management
let isPaid = false;
let currentStep = 1;
let formData = {
    namaSiswa: '',
    tempatLahir: '',
    tanggalLahir: '',
    namaOrtu: '',
    wa: ''
};

// Enable the native date picker for Tanggal Lahir.
const tanggalLahirInput = document.getElementById('form-tanggal-lahir');
tanggalLahirInput.readOnly = false;
tanggalLahirInput.addEventListener('click', () => {
    if (typeof tanggalLahirInput.showPicker === 'function') {
        try {
            tanggalLahirInput.showPicker();
        } catch (error) {
            // Some browsers only allow showPicker in specific user-activation contexts.
            // The input remains editable and its native picker can still be opened normally.
        }
    }
});

// Mobile Menu Toggle
document.getElementById('mobile-menu-btn').addEventListener('click', () => {
    const menu = document.getElementById('mobile-menu');
    menu.classList.toggle('hidden');
});

document.body.addEventListener('click', event => {
    const trigger = event.target.closest('[data-action]');
    if (!trigger) return;

    switch (trigger.dataset.action) {
        case 'switch-step':
            switchStep(Number(trigger.dataset.step));
            break;
        case 'open-video':
            openVideoModal();
            break;
        case 'open-payment':
            openPaymentModal();
            break;
        case 'close-payment':
            closePaymentModal();
            break;
        case 'confirm-payment':
            confirmSimulatedPayment();
            break;
        case 'download-form':
            downloadFormPDF();
            break;
        case 'simulate-pass':
            simulasiLulus();
            break;
        case 'close-video':
            closeVideoModal();
            break;
    }
});

document.body.addEventListener('change', event => {
    if (event.target.matches('[data-action="calculate-cost"]')) calculateCost();
});

document.getElementById('psb-form').addEventListener('submit', handleFormSubmit);

// Toast Notification Function
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');

    const bgColor = type === 'success' ? 'bg-emerald-600' : (type === 'error' ? 'bg-rose-600' : 'bg-brand-600');
    const icon = type === 'success' ? 'fa-circle-check' : 'fa-info-circle';

    toast.className = `${bgColor} text-white p-4 rounded-2xl shadow-xl flex items-center gap-3 pointer-events-auto transform transition-all duration-300 text-sm font-semibold`;
    toast.innerHTML = `<i class="fa-solid ${icon} text-lg"></i><span>${message}</span>`;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-2');
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// Stepper Navigation Switcher
function switchStep(stepNumber) {
    // Check Lock Condition for Steps > 1
    if (stepNumber > 1 && !isPaid) {
        showToast('Harap selesaikan pembayaran formulir (Rp 150.000) di Tahap 1 terlebih dahulu!', 'error');
        return;
    }

    currentStep = stepNumber;

    // Update Progress Bar
    const progressPercent = ((stepNumber - 1) / 4) * 100;
    document.getElementById('stepper-progress-line').style.width = `${progressPercent}%`;

    // Update Stepper Icon Buttons Style
    for (let i = 1; i <= 5; i++) {
        const btnIcon = document.querySelector(`#step-btn-${i} .step-icon`);
        const btnText = document.querySelector(`#step-btn-${i} span`);

        if (i <= stepNumber) {
            btnIcon.className = 'step-icon w-12 h-12 rounded-full bg-brand-600 text-white font-bold flex items-center justify-center ring-4 ring-white shadow-lg transition-all';
            if (btnText) btnText.className = 'text-xs font-bold text-brand-600 mt-2 hidden sm:block';
        } else {
            btnIcon.className = 'step-icon w-12 h-12 rounded-full bg-slate-200 text-slate-600 font-bold flex items-center justify-center ring-4 ring-white shadow transition-all';
            if (btnText) btnText.className = 'text-xs font-bold text-slate-500 mt-2 hidden sm:block';
        }
    }

    // Hide all content steps & Show current
    document.querySelectorAll('.step-content').forEach(el => el.classList.add('hidden'));
    document.getElementById(`step-content-${stepNumber}`).classList.remove('hidden');
}

// Payment Modal Handler
function openPaymentModal() {
    document.getElementById('payment-modal').classList.remove('hidden');
}

function closePaymentModal() {
    document.getElementById('payment-modal').classList.add('hidden');
}

function confirmSimulatedPayment() {
    isPaid = true;
    closePaymentModal();

    // Update UI Status Badge
    const badge = document.getElementById('payment-status-badge');
    badge.className = 'px-4 py-2 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-2';
    badge.innerHTML = `<i class="fa-solid fa-circle-check text-emerald-600"></i><span>Status: LUNAS (Rp 150.000)</span>`;

    // Unlock Download Box & Next Step Buttons
    const downloadBox = document.getElementById('download-box');
    downloadBox.classList.remove('opacity-65', 'bg-slate-100');
    downloadBox.classList.add('bg-white', 'border-emerald-200');

    document.getElementById('dl-icon').className = 'w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl mb-3';
    document.getElementById('dl-desc').innerText = 'Pembayaran terverifikasi! Silahkan unduh formulir atau langsung isi online.';

    const btnPdf = document.getElementById('btn-download-pdf');
    btnPdf.disabled = false;
    btnPdf.className = 'w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow transition-all flex items-center justify-center gap-2';

    const btnStep2 = document.getElementById('btn-goto-step2');
    btnStep2.disabled = false;
    btnStep2.className = 'w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow transition-all flex items-center justify-center gap-2';

    showToast('Pembayaran Formulir Berhasil! Silahkan unduh berkas atau lanjut isi data.');
}

// SVG PDF Download Simulation
function downloadFormPDF() {
    if (!isPaid) return;

    const svgContent = `
    <svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800" style="background:#ffffff; font-family: sans-serif;">
        <rect x="20" y="20" width="560" height="760" fill="none" stroke="#4f46e5" stroke-width="4"/>
        <text x="300" y="80" text-anchor="middle" font-size="22" font-weight="bold" fill="#3730a3">FORMULIR PENDAFTARAN SISWA BARU</text>
        <text x="300" y="105" text-anchor="middle" font-size="14" fill="#14b8a6">SD SMART SPARK ACADEMY - TA 2027/2028</text>
        <line x1="50" y1="120" x2="550" y2="120" stroke="#cbd5e1" stroke-width="2"/>

        <text x="50" y="160" font-size="14" font-weight="bold" fill="#1e293b">STATUS BUKTI PEMBAYARAN: LUNAS (Rp 150.000)</text>
        <text x="50" y="185" font-size="12" fill="#64748b">No. Transaksi: TRX-PSB-99821</text>

        <text x="50" y="230" font-size="14" font-weight="bold" fill="#4f46e5">I. BIODATA CALON SISWA</text>
        <text x="50" y="260" font-size="12" fill="#334155">Nama Lengkap Siswa : ____________________________________</text>
        <text x="50" y="290" font-size="12" fill="#334155">NIK Siswa           : ____________________________________</text>
        <text x="50" y="320" font-size="12" fill="#334155">Tempat, Tgl Lahir   : ____________________________________</text>
        <text x="50" y="350" font-size="12" fill="#334155">Jenis Kelamin       : [  ] Laki-laki   [  ] Perempuan</text>

        <text x="50" y="400" font-size="14" font-weight="bold" fill="#4f46e5">II. DATA ORANG TUA / WALI</text>
        <text x="50" y="430" font-size="12" fill="#334155">Nama Ayah/Ibu      : ____________________________________</text>
        <text x="50" y="460" font-size="12" fill="#334155">No. WhatsApp/HP     : ____________________________________</text>
        <text x="50" y="490" font-size="12" fill="#334155">Alamat Lengkap      : ____________________________________</text>

        <text x="50" y="550" font-size="12" font-weight="bold" fill="#059669">Catatan Observasi:</text>
        <text x="50" y="575" font-size="11" fill="#475569">Harap membawa berkas ini saat pelaksanaan Observasi & Wawancara di Sekolah.</text>

        <text x="400" y="700" text-anchor="middle" font-size="12" fill="#334155">Panitia PSB SD Smart Spark</text>
        <text x="400" y="750" text-anchor="middle" font-size="11" fill="#94a3b8">( Tanda Tangan & Cap Panitia )</text>
    </svg>`;

    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Formulir_PSB_SD_SmartSpark.svg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('Berhasil mengunduh Formulir Pendaftaran PDF!');
}

// Form Submission (Stage 2 -> Stage 3)
function handleFormSubmit(event) {
    event.preventDefault();

    const tanggalLahir = document.getElementById('form-tanggal-lahir');
    if (!tanggalLahir.value) {
        showToast('Silakan pilih tanggal lahir melalui kalender.', 'error');
        tanggalLahir.focus();
        return;
    }

    formData.namaSiswa = document.getElementById('form-nama-siswa').value;
    formData.tempatLahir = document.getElementById('form-tempat-lahir').value;
    formData.tanggalLahir = tanggalLahir.value;
    formData.namaOrtu = document.getElementById('form-nama-ortu').value;
    formData.wa = document.getElementById('form-wa').value;

    showToast('Data Pendaftaran Berhasil Disimpan!');
    switchStep(3);
}

// Simulation Stage 3 -> Stage 4
function simulasiLulus() {
    if (formData.namaSiswa) {
        document.getElementById('display-nama-diterima').innerText = `Ananda ${formData.namaSiswa}`;
    }
    showToast('Hasil Observasi Rilis: DITERIMA!');
    switchStep(4);
}

// Fee Calculator Logic
function calculateCost() {
    const gelombang = document.getElementById('calc-gelombang').value;
    const program = document.getElementById('calc-program').value;

    let uangPangkalBase = 8500000;
    let diskon = 0;
    if (gelombang === '1') diskon = 1500000;
    if (gelombang === '2') diskon = 750000;

    let sppBase = 750000;
    if (program === 'tahfidz') sppBase += 300000;
    if (program === 'fullday') sppBase += 500000;

    const uangPangkalNet = uangPangkalBase - diskon;
    const seragam = 1450000;
    const buku = 1200000;

    const total = uangPangkalNet + seragam + buku + sppBase;

    document.getElementById('calc-uang-pangkal').innerText = `Rp ${uangPangkalNet.toLocaleString('id-ID')}`;
    document.getElementById('calc-spp').innerText = `Rp ${sppBase.toLocaleString('id-ID')} / Bulan`;
    document.getElementById('calc-total').innerText = `Rp ${total.toLocaleString('id-ID')}`;
}

// Video Modal Handler
function openVideoModal() {
    document.getElementById('video-modal').classList.remove('hidden');
}

function closeVideoModal() {
    document.getElementById('video-modal').classList.add('hidden');
}
