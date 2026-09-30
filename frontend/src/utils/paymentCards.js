export const CARD_BRANDS = {
    visa: { label: 'Visa', color: '#1a1f71' },
    mastercard: { label: 'Mastercard', color: '#eb001b' },
    mir: { label: 'Мир', color: '#007852' },
    card: { label: 'Карта', color: '#5577ff' },
};

export function detectCardBrand(number) {
    const digits = number.replace(/\D/g, '');
    if (/^220[0-4]/.test(digits)) return 'mir';
    if (/^4/.test(digits)) return 'visa';
    if (/^5[1-5]/.test(digits)) return 'mastercard';
    return 'card';
}

export function formatCardNumber(value) {
    return value
        .replace(/\D/g, '')
        .slice(0, 19)
        .replace(/(\d{4})(?=\d)/g, '$1 ')
        .trim();
}

export function formatExpiry(value) {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    if (digits.length <= 2) return digits;
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export function validateCardForm({ number, expiry, cvc, holder }) {
    const digits = number.replace(/\D/g, '');
    if (digits.length < 16 || digits.length > 19) {
        return 'Введите номер карты (16–19 цифр)';
    }

    const match = expiry.match(/^(\d{2})\/(\d{2})$/);
    if (!match) {
        return 'Срок действия в формате ММ/ГГ';
    }

    const month = Number(match[1]);
    const year = Number(`20${match[2]}`);
    if (month < 1 || month > 12) {
        return 'Некорректный месяц';
    }

    const now = new Date();
    const expiryDate = new Date(year, month, 0);
    if (expiryDate < now) {
        return 'Срок действия карты истёк';
    }

    if (!/^\d{3}$/.test(cvc.replace(/\D/g, ''))) {
        return 'CVC — 3 цифры';
    }

    if (!holder.trim() || holder.trim().length < 3) {
        return 'Укажите имя держателя карты';
    }

    return null;
}

export function maskCardLabel(last4, brand) {
    const brandLabel = CARD_BRANDS[brand]?.label ?? 'Карта';
    return `${brandLabel} •••• ${last4}`;
}

export function formatAccountNumber(value) {
    return value
        .replace(/\D/g, '')
        .slice(0, 20)
        .replace(/(\d{4})(?=\d)/g, '$1 ')
        .trim();
}

export function formatBik(value) {
    return value.replace(/\D/g, '').slice(0, 9);
}

export function validateAccountForm({ accountNumber, bik, bankName, holder }) {
    const accountDigits = accountNumber.replace(/\D/g, '');
    if (accountDigits.length !== 20) {
        return 'Номер счёта — 20 цифр';
    }

    if (!/^408/.test(accountDigits) && !/^407/.test(accountDigits) && !/^423/.test(accountDigits)) {
        return 'Укажите корректный расчётный или лицевой счёт';
    }

    const bikDigits = bik.replace(/\D/g, '');
    if (bikDigits.length !== 9) {
        return 'БИК банка — 9 цифр';
    }

    if (!bankName.trim() || bankName.trim().length < 2) {
        return 'Укажите название банка';
    }

    if (!holder.trim() || holder.trim().length < 3) {
        return 'Укажите получателя платежа';
    }

    return null;
}

export function maskAccountLabel(last4, bankName) {
    return `${bankName} •••• ${last4}`;
}

export function parsePayoutRef(value) {
    if (!value || !value.includes(':')) return null;
    const [type, id] = value.split(':');
    if (type !== 'card' && type !== 'account') return null;
    return { type, id };
}

export function formatPayoutRef(type, id) {
    return `${type}:${id}`;
}
