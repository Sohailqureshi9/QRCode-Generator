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
const appRedirectMode = document.getElementById('appRedirectMode');
const redirectBaseWrap = document.getElementById('redirectBaseWrap');
const redirectBase = document.getElementById('redirectBase');
const walletProvider = document.getElementById('walletProvider');
const walletNumber = document.getElementById('walletNumber');
const walletName = document.getElementById('walletName');
const walletAmount = document.getElementById('walletAmount');
const walletScanMode = document.getElementById('walletScanMode');
const walletAppLinkWrap = document.getElementById('walletAppLinkWrap');
const walletAppLink = document.getElementById('walletAppLink');
const walletRedirectWrap = document.getElementById('walletRedirectWrap');
const walletRedirectBase = document.getElementById('walletRedirectBase');
const bankName = document.getElementById('bankName');
const iban = document.getElementById('iban');
const accountNumber = document.getElementById('accountNumber');
const beneficiary = document.getElementById('beneficiary');
const bankAmount = document.getElementById('bankAmount');
const bankScanMode = document.getElementById('bankScanMode');
const bankAppLinkWrap = document.getElementById('bankAppLinkWrap');
const bankAppLink = document.getElementById('bankAppLink');
const bankRedirectWrap = document.getElementById('bankRedirectWrap');
const bankRedirectBase = document.getElementById('bankRedirectBase');
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
    updateVisibilityByMode();
    errorText.textContent = '';
}

function updateVisibilityByMode() {
    const appRedirectActive = modeEl.value === 'app' && appRedirectMode.value === 'via-redirect';
    redirectBaseWrap.classList.toggle('active', appRedirectActive);

    const walletLinkActive = modeEl.value === 'wallet' && walletScanMode.value !== 'details';
    const walletRedirectActive = modeEl.value === 'wallet' && walletScanMode.value === 'via-redirect';
    walletAppLinkWrap.classList.toggle('active', walletLinkActive);
    walletRedirectWrap.classList.toggle('active', walletRedirectActive);

    const bankLinkActive = modeEl.value === 'bank' && bankScanMode.value !== 'details';
    const bankRedirectActive = modeEl.value === 'bank' && bankScanMode.value === 'via-redirect';
    bankAppLinkWrap.classList.toggle('active', bankLinkActive);
    bankRedirectWrap.classList.toggle('active', bankRedirectActive);
}

function updateWalletHints() {
    const provider = walletProvider.value;
    const map = {
        Easypaisa: {
            number: '03XXXXXXXXX (Easypaisa number)',
            appLink: 'easypaisa://pay?data={data}'
        },
        JazzCash: {
            number: '03XXXXXXXXX (JazzCash number)',
            appLink: 'jazzcash://pay?data={data}'
        },
        SadaPay: {
            number: '03XXXXXXXXX or username',
            appLink: 'sadapay://pay?data={data}'
        },
        NayaPay: {
            number: '03XXXXXXXXX or NayaPay tag',
            appLink: 'nayapay://pay?data={data}'
        },
        Other: {
            number: 'Wallet number or ID',
            appLink: 'walletapp://pay?data={data}'
        }
    };

    const config = map[provider] || map.Other;
    walletNumber.placeholder = config.number;
    walletAppLink.placeholder = config.appLink + ' or https://wallet-link';
}

function looksLikeLink(value) {
    return /^[a-z][a-z0-9+.-]*:\/\//i.test(value);
}

function makeRedirectUrl(base, target) {
    const encodedTarget = encodeURIComponent(target);
    if (base.includes('{target}')) {
        return base.replace('{target}', encodedTarget);
    }
    const joiner = base.includes('?') ? '&' : '?';
    return base + joiner + 'to=' + encodedTarget;
}

function applyDataTemplate(linkBase, payloadData) {
    const encodedData = encodeURIComponent(payloadData);
    if (linkBase.includes('{data}')) {
        return linkBase.replace('{data}', encodedData);
    }
    return linkBase;
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
        if (!looksLikeLink(value)) {
            return { error: 'Use a valid link format like easypaisa:// or https://.' };
        }

        if (appRedirectMode.value === 'direct') {
            return { payload: value };
        }

        const base = redirectBase.value.trim();
        if (!base) {
            return { error: 'Enter redirect endpoint URL for redirect mode.' };
        }
        if (!/^https?:\/\//i.test(base)) {
            return { error: 'Redirect endpoint must start with http:// or https://.' };
        }

        const redirectPayload = makeRedirectUrl(base, value);

        return { payload: redirectPayload };
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

        const payloadText = lines.join('\n');
        if (walletScanMode.value === 'details') {
            return { payload: payloadText };
        }

        const appLinkValue = walletAppLink.value.trim();
        if (!appLinkValue) {
            return { error: 'Enter wallet app link for selected scan behavior.' };
        }
        if (!looksLikeLink(appLinkValue)) {
            return { error: 'Wallet app link must start with a valid scheme like easypaisa:// or https://.' };
        }

        const targetLink = applyDataTemplate(appLinkValue, payloadText);
        if (walletScanMode.value === 'direct') {
            return { payload: targetLink };
        }

        const redirectValue = walletRedirectBase.value.trim();
        if (!redirectValue) {
            return { error: 'Enter wallet redirect endpoint URL.' };
        }
        if (!/^https?:\/\//i.test(redirectValue)) {
            return { error: 'Wallet redirect endpoint must start with http:// or https://.' };
        }

        return { payload: makeRedirectUrl(redirectValue, targetLink) };
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

        const payloadText = lines.join('\n');
        if (bankScanMode.value === 'details') {
            return { payload: payloadText };
        }

        const appLinkValue = bankAppLink.value.trim();
        if (!appLinkValue) {
            return { error: 'Enter bank app link for selected scan behavior.' };
        }
        if (!looksLikeLink(appLinkValue)) {
            return { error: 'Bank app link must start with a valid scheme like bankapp:// or https://.' };
        }

        const targetLink = applyDataTemplate(appLinkValue, payloadText);
        if (bankScanMode.value === 'direct') {
            return { payload: targetLink };
        }

        const redirectValue = bankRedirectBase.value.trim();
        if (!redirectValue) {
            return { error: 'Enter bank redirect endpoint URL.' };
        }
        if (!/^https?:\/\//i.test(redirectValue)) {
            return { error: 'Bank redirect endpoint must start with http:// or https://.' };
        }

        return { payload: makeRedirectUrl(redirectValue, targetLink) };
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
    appRedirectMode.value = 'direct';
    redirectBase.value = '';
    walletScanMode.value = 'details';
    walletAppLink.value = '';
    walletRedirectBase.value = '';
    walletNumber.value = '';
    walletName.value = '';
    walletAmount.value = '';
    bankScanMode.value = 'details';
    bankAppLink.value = '';
    bankRedirectBase.value = '';
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
    updateVisibilityByMode();
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
appRedirectMode.addEventListener('change', updateVisibilityByMode);
walletScanMode.addEventListener('change', updateVisibilityByMode);
bankScanMode.addEventListener('change', updateVisibilityByMode);
walletProvider.addEventListener('change', updateWalletHints);
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
updateWalletHints();
initTheme();
