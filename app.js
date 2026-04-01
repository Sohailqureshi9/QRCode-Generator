const modeEl = document.getElementById('mode');
const qrSizeEl = document.getElementById('qrSize');
const qrEccEl = document.getElementById('qrEcc');
const themeToggle = document.getElementById('themeToggle');

const groups = {
    text: document.getElementById('groupText'),
    app: document.getElementById('groupApp'),
    wallet: document.getElementById('groupWallet'),
    bank: document.getElementById('groupBank')
};

const textInput = document.getElementById('textInput');
const appLink = document.getElementById('appLink');
const walletProvider = document.getElementById('walletProvider');
const walletNumber = document.getElementById('walletNumber');
const walletName = document.getElementById('walletName');
const walletAmount = document.getElementById('walletAmount');
const bankName = document.getElementById('bankName');
const iban = document.getElementById('iban');
const accountNumber = document.getElementById('accountNumber');
const beneficiary = document.getElementById('beneficiary');
const bankAmount = document.getElementById('bankAmount');
const note = document.getElementById('note');

const errorText = document.getElementById('errorText');
const statusText = document.getElementById('statusText');
const imgBox = document.getElementById('imgBox');
const qrImage = document.getElementById('qrCodeImage');
const downloadLink = document.getElementById('downloadLink');
const payloadPreview = document.getElementById('payloadPreview');

const generateBtn = document.getElementById('generateBtn');
const clearBtn = document.getElementById('clearBtn');
const copyPayloadBtn = document.getElementById('copyPayloadBtn');
const copyImageLinkBtn = document.getElementById('copyImageLinkBtn');

let lastQrUrl = '';

function showMode(mode) {
    Object.keys(groups).forEach((key) => {
        groups[key].classList.toggle('active', key === mode);
    });
    errorText.textContent = '';
}

function setStatus(message) {
    statusText.textContent = message;
    if (!message) {
        return;
    }
    window.clearTimeout(setStatus.timer);
    setStatus.timer = window.setTimeout(() => {
        statusText.textContent = '';
    }, 2400);
}

function readAmount(value) {
    const clean = value.trim();
    if (!clean) {
        return '';
    }
    const numeric = Number(clean);
    if (!Number.isFinite(numeric) || numeric < 0) {
        return null;
    }
    return numeric.toFixed(2);
}

function buildPayload() {
    const mode = modeEl.value;
    const commonNote = note.value.trim();

    if (mode === 'text') {
        const value = textInput.value.trim();
        if (!value) {
            return { error: 'Enter text or URL first.' };
        }
        return { payload: value };
    }

    if (mode === 'app') {
        const value = appLink.value.trim();
        if (!value) {
            return { error: 'Enter an app link first.' };
        }
        const looksLikeLink = /^[a-z][a-z0-9+.-]*:\/\//i.test(value);
        if (!looksLikeLink) {
            return { error: 'Use a valid link format like easypaisa:// or https://.' };
        }
        return { payload: value };
    }

    if (mode === 'wallet') {
        const number = walletNumber.value.trim();
        const amount = readAmount(walletAmount.value);
        if (!number) {
            return { error: 'Enter a wallet number.' };
        }
        if (!/^[+0-9\-\s]{8,20}$/.test(number)) {
            return { error: 'Wallet number should contain 8-20 digits/symbols.' };
        }
        if (amount === null) {
            return { error: 'Wallet amount must be a valid positive number.' };
        }

        const lines = [
            'PAYMENT_TYPE:WALLET',
            'PROVIDER:' + walletProvider.value,
            'NUMBER:' + number
        ];

        if (walletName.value.trim()) lines.push('ACCOUNT_TITLE:' + walletName.value.trim());
        if (amount) lines.push('AMOUNT_PKR:' + amount);
        if (commonNote) lines.push('NOTE:' + commonNote);

        return { payload: lines.join('\n') };
    }

    if (mode === 'bank') {
        const ibanValue = iban.value.trim().toUpperCase();
        const accountValue = accountNumber.value.trim();
        const amount = readAmount(bankAmount.value);

        if (!ibanValue && !accountValue) {
            return { error: 'Enter IBAN or account number.' };
        }
        if (ibanValue && !/^[A-Z0-9]{15,34}$/.test(ibanValue)) {
            return { error: 'IBAN must be 15 to 34 letters/numbers.' };
        }
        if (accountValue && !/^[A-Za-z0-9\-\s]{6,34}$/.test(accountValue)) {
            return { error: 'Account number format looks invalid.' };
        }
        if (amount === null) {
            return { error: 'Bank amount must be a valid positive number.' };
        }

        const lines = ['PAYMENT_TYPE:BANK_TRANSFER'];
        if (bankName.value.trim()) lines.push('BANK:' + bankName.value.trim());
        if (ibanValue) lines.push('IBAN:' + ibanValue);
        if (accountValue) lines.push('ACCOUNT_NUMBER:' + accountValue);
        if (beneficiary.value.trim()) lines.push('BENEFICIARY:' + beneficiary.value.trim());
        if (amount) lines.push('AMOUNT_PKR:' + amount);
        if (commonNote) lines.push('NOTE:' + commonNote);

        return { payload: lines.join('\n') };
    }

    return { error: 'Unsupported mode selected.' };
}

function buildQrUrl(payload) {
    const size = qrSizeEl.value;
    const ecc = qrEccEl.value;
    return 'https://api.qrserver.com/v1/create-qr-code/?size=' + size + 'x' + size + '&ecc=' + ecc + '&margin=12&data=' + encodeURIComponent(payload);
}

function generateQRCode() {
    const result = buildPayload();

    if (result.error) {
        errorText.textContent = result.error;
        imgBox.classList.remove('visible');
        payloadPreview.value = '';
        setStatus('');
        return;
    }

    const payload = result.payload;
    const qrUrl = buildQrUrl(payload);

    errorText.textContent = '';
    payloadPreview.value = payload;
    qrImage.src = qrUrl;
    downloadLink.href = qrUrl;
    lastQrUrl = qrUrl;
    imgBox.classList.add('visible');
    setStatus('QR generated successfully.');
}

function clearForm() {
    textInput.value = '';
    appLink.value = '';
    walletNumber.value = '';
    walletName.value = '';
    walletAmount.value = '';
    bankName.value = '';
    iban.value = '';
    accountNumber.value = '';
    beneficiary.value = '';
    bankAmount.value = '';
    note.value = '';
    payloadPreview.value = '';
    qrImage.src = '';
    lastQrUrl = '';
    imgBox.classList.remove('visible');
    errorText.textContent = '';
    setStatus('Form reset.');
}

async function copyText(text, successMsg, errorMsg) {
    try {
        await navigator.clipboard.writeText(text);
        setStatus(successMsg);
    } catch (err) {
        setStatus(errorMsg);
    }
}

function applyTheme(theme) {
    const dark = theme === 'dark';
    document.body.classList.toggle('dark', dark);
    themeToggle.textContent = dark ? 'Light mode' : 'Dark mode';
}

function initTheme() {
    const stored = localStorage.getItem('sheen_qr_theme');
    if (stored === 'dark' || stored === 'light') {
        applyTheme(stored);
    } else {
        applyTheme('light');
    }
}

modeEl.addEventListener('change', () => showMode(modeEl.value));
generateBtn.addEventListener('click', generateQRCode);
clearBtn.addEventListener('click', clearForm);

copyPayloadBtn.addEventListener('click', () => {
    const data = payloadPreview.value.trim();
    if (!data) {
        setStatus('Generate QR first to copy payload.');
        return;
    }
    copyText(data, 'Payload copied.', 'Clipboard denied by browser.');
});

copyImageLinkBtn.addEventListener('click', () => {
    if (!lastQrUrl) {
        setStatus('Generate QR first to copy image link.');
        return;
    }
    copyText(lastQrUrl, 'Image link copied.', 'Clipboard denied by browser.');
});

themeToggle.addEventListener('click', () => {
    const nextTheme = document.body.classList.contains('dark') ? 'light' : 'dark';
    applyTheme(nextTheme);
    localStorage.setItem('sheen_qr_theme', nextTheme);
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && event.target.tagName !== 'TEXTAREA') {
        generateQRCode();
    }
});

qrImage.addEventListener('error', () => {
    imgBox.classList.remove('visible');
    errorText.textContent = 'QR service is unavailable right now. Please check internet and try again.';
    setStatus('');
});

showMode(modeEl.value);
initTheme();
