// Registration flow state. This demo stores progress only for the current page session.
const psbState = {
    paid: false,
    formSubmitted: false,
    observationPassed: false,
    currentStep: 1,
    studentName: ''
};

// The script is included in the document head and at the end of body. Defer
// initialization until the DOM exists, and initialize only once.
function initializePsbApp() {
    if (window.__psbAppInitialized) return;
    window.__psbAppInitialized = true;

    const dateInput = document.getElementById('form-tanggal-lahir');
    if (dateInput) {
        dateInput.readOnly = false;
        dateInput.addEventListener('click', () => {
            if (typeof dateInput.showPicker === 'function') {
                try {
                    dateInput.showPicker();
                } catch (error) {
                    // The native date input remains available if showPicker is unsupported.
                }
            }
        });
    }

    const mobileMenuButton = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.setAttribute('aria-expanded', 'false');
        mobileMenuButton.addEventListener('click', () => {
            const isOpen = !mobileMenu.classList.contains('hidden');
            mobileMenu.classList.toggle('hidden', isOpen);
            mobileMenuButton.setAttribute('aria-expanded', String(!isOpen));
        });
        mobileMenu.addEventListener('click', event => {
            if (event.target.closest('a')) {
                mobileMenu.classList.add('hidden');
                mobileMenuButton.setAttribute('aria-expanded', 'false');
            }
        });
    }

    document.body.addEventListener('click', event => {
        const trigger = event.target.closest('[data-action]');
        if (!trigger || trigger.disabled) return;

        switch (trigger.dataset.action) {
            case 'switch-step':
                switchStep(Number(trigger.dataset.step));
                break;
            case 'open-video':
                openModal('video-modal');
                break;
            case 'open-payment':
                if (!psbState.paid) openModal('payment-modal');
                break;
            case 'close-payment':
                closeModal('payment-modal');
                break;
            case 'confirm-payment':
                confirmSimulatedPayment();
                break;
            case 'download-form':
                downloadFormPDF();
                break;
            case 'simulate-pass':
                simulatePass();
                break;
            case 'close-video':
                closeModal('video-modal');
                break;
        }
    });

    document.body.addEventListener('change', event => {
        if (event.target.matches('[data-action="calculate-cost"]')) calculateCost();
    });

    const form = document.getElementById('psb-form');
    if (form) form.addEventListener('submit', handleFormSubmit);

    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
            closeModal('payment-modal');
            closeModal('video-modal');
        }
    });

    // Ensure the first calculator display matches its selected values.
    calculateCost();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePsbApp, { once: true });
} else {
    initializePsbApp();
}

function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    const colors = {
        success: 'bg-emerald-600',
        error: 'bg-rose-600',
        info: 'bg-brand-600'
    };
    const icon = type === 'success' ? 'fa-circle-check' : type === 'error' ? 'fa-circle-exclamation' : 'fa-circle-info';
    toast.className = `${colors[type] || colors.info} text-white p-4 rounded-2xl shadow-xl flex items-center gap-3 pointer-events-auto transform transition-all duration-300 text-sm font-semibold`;
    const iconElement = document.createElement('i');
    iconElement.className = `fa-solid ${icon} text-lg`;
    const messageElement = document.createElement('span');
    messageElement.textContent = message;
    toast.append(iconElement, messageElement);
    container.appendChild(toast);

    window.setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-2');
        window.setTimeout(() => toast.remove(), 300);
    }, 3500);
}

function getHighestAvailableStep() {
    if (!psbState.paid) return 1;
    if (!psbState.formSubmitted) return 2;
    if (!psbState.observationPassed) return 3;
    return 5;
}

function switchStep(stepNumber) {
    if (!Number.isInteger(stepNumber) || stepNumber < 1 || stepNumber > 5) return;

    if (stepNumber > getHighestAvailableStep()) {
        const messages = {
            2: 'Selesaikan pembayaran formulir terlebih dahulu.',
            3: 'Lengkapi dan simpan formulir terlebih dahulu.',
            4: 'Selesaikan tahap formulir dan observasi terlebih dahulu.',
            5: 'Lihat hasil observasi sebelum melanjutkan daftar ulang.'
        };
        showToast(messages[stepNumber] || 'Selesaikan tahap sebelumnya terlebih dahulu.', 'error');
        return;
    }

    psbState.currentStep = stepNumber;
    const progressLine = document.getElementById('stepper-progress-line');
    if (progressLine) progressLine.style.width = `${((stepNumber - 1) / 4) * 100}%`;

    for (let index = 1; index <= 5; index += 1) {
        const button = document.getElementById(`step-btn-${index}`);
        if (!button) continue;
        const icon = button.querySelector('.step-icon');
        const text = button.querySelector('span');
        const isCurrentOrComplete = index <= stepNumber;
        if (icon) {
            icon.className = `step-icon w-12 h-12 rounded-full ${isCurrentOrComplete ? 'bg-brand-600 text-white shadow-lg' : 'bg-slate-200 text-slate-600 shadow'} font-bold flex items-center justify-center ring-4 ring-white transition-all`;
        }
        if (text) text.className = `text-xs font-bold ${isCurrentOrComplete ? 'text-brand-600' : 'text-slate-500'} mt-2 hidden sm:block`;
        button.setAttribute('aria-current', index === stepNumber ? 'step' : 'false');
        button.disabled = index > getHighestAvailableStep();
        button.classList.toggle('cursor-not-allowed', button.disabled);
        button.classList.toggle('opacity-60', button.disabled);
    }

    document.querySelectorAll('.step-content').forEach(section => section.classList.add('hidden'));
    const activeStep = document.getElementById(`step-content-${stepNumber}`);
    if (activeStep) activeStep.classList.remove('hidden');
}

function openModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('overflow-hidden');
    const closeButton = modal.querySelector('[data-action^="close-"]');
    if (closeButton) closeButton.focus();
}

function closeModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
    if (document.querySelectorAll('#payment-modal:not(.hidden), #video-modal:not(.hidden)').length === 0) {
        document.body.classList.remove('overflow-hidden');
    }
}

function confirmSimulatedPayment() {
    if (psbState.paid) {
        closeModal('payment-modal');
        return;
    }
    psbState.paid = true;
    closeModal('payment-modal');

    const badge = document.getElementById('payment-status-badge');
    if (badge) {
        badge.className = 'px-4 py-2 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-2';
        badge.innerHTML = '<i class="fa-solid fa-circle-check text-emerald-600"></i><span>Status: LUNAS (Rp 150.000)</span>';
    }

    const downloadBox = document.getElementById('download-box');
    if (downloadBox) {
        downloadBox.classList.remove('opacity-60', 'opacity-65', 'bg-slate-100');
        downloadBox.classList.add('bg-white', 'border-emerald-200');
    }
    const icon = document.getElementById('dl-icon');
    if (icon) icon.className = 'w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl mb-3';
    const description = document.getElementById('dl-desc');
    if (description) description.textContent = 'Pembayaran simulasi berhasil. Silakan unduh formulir atau lanjut isi data online.';

    setButtonEnabled('btn-download-pdf', true, 'w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow transition-all flex items-center justify-center gap-2');
    setButtonEnabled('btn-goto-step2', true, 'w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow transition-all flex items-center justify-center gap-2');
    switchStep(1);
    showToast('Pembayaran simulasi berhasil. Formulir dan tahap berikutnya kini tersedia.');
}

function setButtonEnabled(id, enabled, enabledClass) {
    const button = document.getElementById(id);
    if (!button) return;
    button.disabled = !enabled;
    if (enabled) {
        button.className = enabledClass;
    } else {
        button.className = 'w-full py-2.5 rounded-xl bg-slate-300 text-slate-600 font-bold text-sm cursor-not-allowed transition-all flex items-center justify-center gap-2';
    }
}

// Opens the browser print dialog; users can select "Save as PDF" there.
function downloadFormPDF() {
    if (!psbState.paid) {
        showToast('Selesaikan pembayaran formulir terlebih dahulu.', 'error');
        return;
    }

    const printWindow = window.open('', '_blank', 'noopener,noreferrer');
    if (!printWindow) {
        showToast('Izinkan pop-up untuk mencetak atau menyimpan formulir sebagai PDF.', 'error');
        return;
    }

    const printableForm = `<!doctype html><html lang="id"><head><meta charset="utf-8"><title>Formulir PSB Smart Spark</title><style>body{font:14px Arial,sans-serif;color:#1e293b;margin:36px}h1{text-align:center;color:#3730a3;font-size:20px}h2{font-size:15px;color:#4338ca;margin-top:28px}.meta{text-align:center;color:#0f766e;margin-bottom:28px}.line{border-bottom:1px solid #94a3b8;height:30px}.notice{margin-top:24px;padding:12px;background:#f1f5f9}@media print{body{margin:18mm}}</style></head><body><h1>FORMULIR PENDAFTARAN SISWA BARU</h1><p class="meta">SD SMART SPARK ACADEMY — TA 2027/2028</p><p><strong>Status pembayaran:</strong> Lunas (simulasi) — Rp 150.000</p><h2>I. Biodata Calon Siswa</h2><p>Nama lengkap siswa</p><div class="line"></div><p>NIK siswa</p><div class="line"></div><p>Tempat, tanggal lahir</p><div class="line"></div><p>Jenis kelamin</p><div class="line"></div><h2>II. Data Orang Tua / Wali</h2><p>Nama orang tua / wali</p><div class="line"></div><p>No. WhatsApp</p><div class="line"></div><p>Alamat lengkap</p><div class="line"></div><p class="notice">Harap lengkapi data dan bawa salinan Kartu Keluarga, Akta Kelahiran, serta pasfoto saat observasi.</p><script>window.addEventListener('load',()=>window.print());</script></body></html>`;
    printWindow.document.open();
    printWindow.document.write(printableForm);
    printWindow.document.close();
    showToast('Formulir dibuka untuk dicetak atau disimpan sebagai PDF.');
}

function handleFormSubmit(event) {
    event.preventDefault();
    if (!psbState.paid) {
        showToast('Selesaikan pembayaran formulir terlebih dahulu.', 'error');
        switchStep(1);
        return;
    }

    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const dateInput = document.getElementById('form-tanggal-lahir');
    if (!dateInput || !dateInput.value) {
        showToast('Silakan isi tanggal lahir.', 'error');
        if (dateInput) dateInput.focus();
        return;
    }

    psbState.studentName = document.getElementById('form-nama-siswa')?.value.trim() || '';
    psbState.formSubmitted = true;
    const registration = document.getElementById('display-reg-no');
    if (registration) registration.textContent = `REG-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    showToast('Data pendaftaran berhasil disimpan. Jadwal observasi tersedia.');
    switchStep(3);
}

function simulatePass() {
    if (!psbState.formSubmitted || psbState.currentStep !== 3) {
        showToast('Lengkapi formulir dan buka tahap observasi terlebih dahulu.', 'error');
        return;
    }
    psbState.observationPassed = true;
    const acceptedName = document.getElementById('display-nama-diterima');
    if (acceptedName) acceptedName.textContent = psbState.studentName ? `Ananda ${psbState.studentName}` : 'Calon siswa';
    showToast('Simulasi hasil observasi: DITERIMA.');
    switchStep(4);
}

function calculateCost() {
    const waveInput = document.getElementById('calc-gelombang');
    const programInput = document.getElementById('calc-program');
    if (!waveInput || !programInput) return;

    const discountByWave = { '1': 1500000, '2': 750000, '3': 0 };
    const extraSppByProgram = { reguler: 0, tahfidz: 300000, fullday: 500000 };
    const uangPangkalNet = 8500000 - (discountByWave[waveInput.value] || 0);
    const spp = 750000 + (extraSppByProgram[programInput.value] || 0);
    const total = uangPangkalNet + 1450000 + 1200000 + spp;
    const formatRupiah = amount => `Rp ${amount.toLocaleString('id-ID')}`;

    const uangPangkal = document.getElementById('calc-uang-pangkal');
    const sppOutput = document.getElementById('calc-spp');
    const totalOutput = document.getElementById('calc-total');
    if (uangPangkal) uangPangkal.textContent = formatRupiah(uangPangkalNet);
    if (sppOutput) sppOutput.textContent = `${formatRupiah(spp)} / Bulan`;
    if (totalOutput) totalOutput.textContent = formatRupiah(total);
}
