import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';
import {
    BALANCE_TRANSACTIONS,
    CURRENT_USER,
    formatCurrencyPlain,
} from '../data/mockData';
import {
    detectCardBrand,
    formatPayoutRef,
    maskAccountLabel,
    maskCardLabel,
    validateAccountForm,
    validateCardForm,
} from '../utils/paymentCards';

const MIN_DEPOSIT = 100;
const MIN_WITHDRAW = 500;
const WITHDRAW_FEE_RATE = 0.05;

const STORAGE_KEY = 'skillgit-balance';

const BalanceContext = createContext(null);

function loadStoredBalance() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

function formatNowDate() {
    const now = new Date();
    const date = now.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
    const time = now.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
    });
    return `${date}, ${time}`;
}

const DEPOSIT_METHODS = {
    card: 'Банковская карта',
    sbp: 'СБП',
};

const INITIAL_LINKED_CARDS = [
    {
        id: '4821',
        last4: '4821',
        brand: 'visa',
        holder: 'IVAN IVANOV',
        expiry: '09/28',
        isDefault: true,
        addedAt: '15 авг 2026',
    },
];

const INITIAL_LINKED_ACCOUNTS = [
    {
        id: '7890',
        last4: '7890',
        bik: '044525225',
        bankName: 'Сбербанк',
        holder: 'Иванов Иван Иванович',
        isDefault: false,
        addedAt: '20 авг 2026',
    },
];

function formatAddedDate() {
    return new Date().toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

export function BalanceProvider({ children }) {
    const stored = loadStoredBalance();

    const [balanceAmount, setBalanceAmount] = useState(
        stored?.balanceAmount ?? CURRENT_USER.stats.balanceAmount,
    );
    const [pendingAmount] = useState(CURRENT_USER.stats.pendingAmount);
    const [totalReceived, setTotalReceived] = useState(
        stored?.totalReceived ?? CURRENT_USER.stats.totalReceived,
    );
    const [totalSpent, setTotalSpent] = useState(
        stored?.totalSpent ?? CURRENT_USER.stats.totalSpent,
    );
    const [transactions, setTransactions] = useState(
        stored?.transactions ?? BALANCE_TRANSACTIONS,
    );
    const [lastMessage, setLastMessage] = useState(null);
    const [linkedCards, setLinkedCards] = useState(
        stored?.linkedCards ?? INITIAL_LINKED_CARDS,
    );
    const [linkedAccounts, setLinkedAccounts] = useState(
        stored?.linkedAccounts ?? INITIAL_LINKED_ACCOUNTS,
    );

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            balanceAmount,
            totalReceived,
            totalSpent,
            transactions,
            linkedCards,
            linkedAccounts,
        }));
    }, [balanceAmount, totalReceived, totalSpent, transactions, linkedCards, linkedAccounts]);

    const balanceLabel = useMemo(
        () => formatCurrencyPlain(balanceAmount),
        [balanceAmount],
    );

    const clearMessage = useCallback(() => setLastMessage(null), []);

    const deposit = useCallback((amount, method = 'card', sourceRef) => {
        const value = Math.round(Number(amount));
        if (!Number.isFinite(value) || value < MIN_DEPOSIT) {
            return { ok: false, error: `Минимальная сумма пополнения — ${formatCurrencyPlain(MIN_DEPOSIT)}` };
        }
        if (value > 500000) {
            return { ok: false, error: 'Максимальная сумма пополнения — 500 000 ₽' };
        }

        const methodLabel = DEPOSIT_METHODS[method] ?? DEPOSIT_METHODS.card;
        let sourceLabel = '';

        if (method === 'card') {
            if (!sourceRef) {
                return { ok: false, error: 'Выберите карту для оплаты' };
            }
            const cardId = sourceRef.split(':')[1];
            const card = linkedCards.find(item => item.id === cardId);
            if (!card) {
                return { ok: false, error: 'Привяжите карту в настройках выплат' };
            }
            sourceLabel = maskCardLabel(card.last4, card.brand);
        }

        if (method === 'sbp') {
            if (!sourceRef) {
                return { ok: false, error: 'Выберите счёт для СБП' };
            }
            const accountId = sourceRef.split(':')[1];
            const account = linkedAccounts.find(item => item.id === accountId);
            if (!account) {
                return { ok: false, error: 'Привяжите счёт в настройках выплат' };
            }
            sourceLabel = maskAccountLabel(account.last4, account.bankName);
        }

        const entry = {
            id: Date.now(),
            type: 'income',
            category: 'topup',
            title: `Пополнение баланса (${methodLabel}${sourceLabel ? ` · ${sourceLabel}` : ''})`,
            amount: value,
            date: formatNowDate(),
        };

        setBalanceAmount(prev => prev + value);
        setTotalReceived(prev => prev + value);
        setTransactions(prev => [entry, ...prev]);
        setLastMessage(
            sourceLabel
                ? `Баланс пополнен на ${formatCurrencyPlain(value)} через ${sourceLabel}`
                : `Баланс пополнен на ${formatCurrencyPlain(value)}`,
        );

        return { ok: true };
    }, [linkedAccounts, linkedCards]);

    const defaultCard = useMemo(
        () => linkedCards.find(card => card.isDefault) ?? null,
        [linkedCards],
    );

    const defaultAccount = useMemo(
        () => linkedAccounts.find(account => account.isDefault) ?? null,
        [linkedAccounts],
    );

    const defaultPayout = useMemo(() => {
        if (defaultAccount) {
            return { type: 'account', item: defaultAccount, ref: formatPayoutRef('account', defaultAccount.id) };
        }
        if (defaultCard) {
            return { type: 'card', item: defaultCard, ref: formatPayoutRef('card', defaultCard.id) };
        }
        if (linkedCards[0]) {
            return { type: 'card', item: linkedCards[0], ref: formatPayoutRef('card', linkedCards[0].id) };
        }
        if (linkedAccounts[0]) {
            return { type: 'account', item: linkedAccounts[0], ref: formatPayoutRef('account', linkedAccounts[0].id) };
        }
        return null;
    }, [defaultAccount, defaultCard, linkedAccounts, linkedCards]);

    const clearDefaultPayout = useCallback((exceptType, exceptId) => {
        setLinkedCards(prev => prev.map(card => ({
            ...card,
            isDefault: exceptType === 'card' && card.id === exceptId,
        })));
        setLinkedAccounts(prev => prev.map(account => ({
            ...account,
            isDefault: exceptType === 'account' && account.id === exceptId,
        })));
    }, []);

    const addLinkedCard = useCallback((form) => {
        const error = validateCardForm(form);
        if (error) {
            return { ok: false, error };
        }

        const digits = form.number.replace(/\D/g, '');
        const last4 = digits.slice(-4);
        const brand = detectCardBrand(digits);

        if (linkedCards.some(card => card.last4 === last4 && card.brand === brand)) {
            return { ok: false, error: 'Эта карта уже привязана' };
        }

        const isFirstMethod = linkedCards.length === 0 && linkedAccounts.length === 0;
        const card = {
            id: last4,
            last4,
            brand,
            holder: form.holder.trim().toUpperCase(),
            expiry: form.expiry,
            isDefault: isFirstMethod,
            addedAt: formatAddedDate(),
        };

        if (isFirstMethod) {
            clearDefaultPayout('card', last4);
        }

        setLinkedCards(prev => [...prev, card]);
        return { ok: true, card };
    }, [linkedCards, linkedAccounts.length, clearDefaultPayout]);

    const addLinkedAccount = useCallback((form) => {
        const error = validateAccountForm(form);
        if (error) {
            return { ok: false, error };
        }

        const accountDigits = form.accountNumber.replace(/\D/g, '');
        const last4 = accountDigits.slice(-4);
        const bik = form.bik.replace(/\D/g, '');

        if (linkedAccounts.some(account => account.last4 === last4 && account.bik === bik)) {
            return { ok: false, error: 'Этот счёт уже привязан' };
        }

        const isFirstMethod = linkedCards.length === 0 && linkedAccounts.length === 0;
        const account = {
            id: last4,
            last4,
            bik,
            bankName: form.bankName.trim(),
            holder: form.holder.trim(),
            isDefault: isFirstMethod,
            addedAt: formatAddedDate(),
        };

        if (isFirstMethod) {
            clearDefaultPayout('account', last4);
        }

        setLinkedAccounts(prev => [...prev, account]);
        return { ok: true, account };
    }, [linkedAccounts, linkedCards.length, clearDefaultPayout]);

    const removeLinkedCard = useCallback((cardId) => {
        if (linkedCards.length + linkedAccounts.length <= 1) {
            return { ok: false, error: 'Нельзя удалить единственный способ выплат' };
        }

        const removed = linkedCards.find(card => card.id === cardId);
        const nextCards = linkedCards.filter(card => card.id !== cardId);
        setLinkedCards(nextCards);

        if (removed?.isDefault) {
            if (nextCards.length > 0) {
                clearDefaultPayout('card', nextCards[0].id);
            } else if (linkedAccounts.length > 0) {
                clearDefaultPayout('account', linkedAccounts[0].id);
            }
        }

        return { ok: true };
    }, [linkedAccounts, linkedCards, clearDefaultPayout]);

    const removeLinkedAccount = useCallback((accountId) => {
        if (linkedCards.length + linkedAccounts.length <= 1) {
            return { ok: false, error: 'Нельзя удалить единственный способ выплат' };
        }

        const removed = linkedAccounts.find(account => account.id === accountId);
        const nextAccounts = linkedAccounts.filter(account => account.id !== accountId);
        setLinkedAccounts(nextAccounts);

        if (removed?.isDefault) {
            if (nextAccounts.length > 0) {
                clearDefaultPayout('account', nextAccounts[0].id);
            } else if (linkedCards.length > 0) {
                clearDefaultPayout('card', linkedCards[0].id);
            }
        }

        return { ok: true };
    }, [linkedAccounts, linkedCards, clearDefaultPayout]);

    const setDefaultCard = useCallback((cardId) => {
        clearDefaultPayout('card', cardId);
        return { ok: true };
    }, [clearDefaultPayout]);

    const setDefaultAccount = useCallback((accountId) => {
        clearDefaultPayout('account', accountId);
        return { ok: true };
    }, [clearDefaultPayout]);

    const withdraw = useCallback((amount, payoutRef) => {
        const parsed = typeof payoutRef === 'string' && payoutRef.includes(':')
            ? { type: payoutRef.split(':')[0], id: payoutRef.split(':')[1] }
            : null;

        let payout = null;
        if (parsed?.type === 'account') {
            payout = linkedAccounts.find(item => item.id === parsed.id);
        } else if (parsed?.type === 'card') {
            payout = linkedCards.find(item => item.id === parsed.id);
        } else {
            payout = defaultPayout?.item ?? null;
        }

        if (!payout) {
            return { ok: false, error: 'Привяжите карту или счёт в настройках выплат' };
        }

        const isAccount = Boolean(payout.bik);
        const value = Math.round(Number(amount));
        if (!Number.isFinite(value) || value < MIN_WITHDRAW) {
            return { ok: false, error: `Минимальная сумма вывода — ${formatCurrencyPlain(MIN_WITHDRAW)}` };
        }

        const fee = Math.round(value * WITHDRAW_FEE_RATE);
        const total = value + fee;

        if (total > balanceAmount) {
            return {
                ok: false,
                error: `Недостаточно средств. Нужно ${formatCurrencyPlain(total)} с учётом комиссии`,
            };
        }

        const date = formatNowDate();
        const withdrawalTitle = isAccount || payout.bik
            ? `Вывод на счёт ${payout.bankName} •••• ${payout.last4}`
            : `Вывод на карту •••• ${payout.last4}`;

        const withdrawalEntry = {
            id: Date.now(),
            type: 'expense',
            category: 'withdrawal',
            title: withdrawalTitle,
            amount: -value,
            date,
        };
        const feeEntry = {
            id: Date.now() + 1,
            type: 'expense',
            category: 'fee',
            title: 'Комиссия за вывод средств (5%)',
            amount: -fee,
            date,
        };

        setBalanceAmount(prev => prev - total);
        setTotalSpent(prev => prev + total);
        setTransactions(prev => [feeEntry, withdrawalEntry, ...prev]);
        const successLabel = payout.bik
            ? `счёт ${payout.bankName} •••• ${payout.last4}`
            : `карту •••• ${payout.last4}`;
        setLastMessage(`Выведено ${formatCurrencyPlain(value)} на ${successLabel}`);

        return { ok: true };
    }, [balanceAmount, linkedCards, linkedAccounts, defaultPayout]);

    const value = useMemo(() => ({
        balanceAmount,
        balanceLabel,
        pendingAmount,
        totalReceived,
        totalSpent,
        transactions,
        lastMessage,
        clearMessage,
        deposit,
        withdraw,
        linkedCards,
        linkedAccounts,
        defaultCard,
        defaultAccount,
        defaultPayout,
        addLinkedCard,
        addLinkedAccount,
        removeLinkedCard,
        removeLinkedAccount,
        setDefaultCard,
        setDefaultAccount,
        minDeposit: MIN_DEPOSIT,
        minWithdraw: MIN_WITHDRAW,
        withdrawFeeRate: WITHDRAW_FEE_RATE,
    }), [
        balanceAmount,
        balanceLabel,
        pendingAmount,
        totalReceived,
        totalSpent,
        transactions,
        lastMessage,
        clearMessage,
        deposit,
        withdraw,
        linkedCards,
        linkedAccounts,
        defaultCard,
        defaultAccount,
        defaultPayout,
        addLinkedCard,
        addLinkedAccount,
        removeLinkedCard,
        removeLinkedAccount,
        setDefaultCard,
        setDefaultAccount,
    ]);

    return (
        <BalanceContext.Provider value={value}>
            {children}
        </BalanceContext.Provider>
    );
}

export function useBalance() {
    const context = useContext(BalanceContext);
    if (!context) {
        throw new Error('useBalance must be used within BalanceProvider');
    }
    return context;
}
