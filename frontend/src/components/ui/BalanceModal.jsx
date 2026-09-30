import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppModal } from './AppModal';
import { formatCurrency, formatCurrencyPlain } from '../../data/mockData';
import { useBalance } from '../../context/BalanceContext';
import { formatPayoutRef, maskAccountLabel, maskCardLabel } from '../../utils/paymentCards';
import { CoinIcon } from '../pages/icons';

const FILTERS = [
    { id: 'all', label: 'Все' },
    { id: 'income', label: 'Поступления' },
    { id: 'expense', label: 'Расходы' },
];

const CATEGORY_LABELS = {
    task: 'Задача',
    bonus: 'Бонус',
    referral: 'Реферал',
    withdrawal: 'Вывод',
    fee: 'Комиссия',
    premium: 'Подписка',
    topup: 'Пополнение',
};

const DEPOSIT_PRESETS = [1000, 5000, 10000, 25000];

function BalanceActionForm({
    mode,
    onBack,
    onSubmit,
    balanceAmount,
    minWithdraw,
    withdrawFeeRate,
    linkedCards,
    linkedAccounts,
    defaultPayout,
    onClose,
}) {
    const [amount, setAmount] = useState('');
    const [method, setMethod] = useState('card');
    const [depositRef, setDepositRef] = useState('');
    const [payoutRef, setPayoutRef] = useState(defaultPayout?.ref ?? '');
    const [error, setError] = useState('');

    const hasPayoutMethods = linkedCards.length > 0 || linkedAccounts.length > 0;
    const defaultCardRef = linkedCards.find(card => card.isDefault)?.id ?? linkedCards[0]?.id;
    const defaultAccountRef = linkedAccounts.find(account => account.isDefault)?.id
        ?? linkedAccounts[0]?.id;
    const canDeposit = method === 'card'
        ? linkedCards.length > 0
        : linkedAccounts.length > 0;

    useEffect(() => {
        if (mode !== 'deposit') return;
        if (method === 'card' && defaultCardRef) {
            setDepositRef(formatPayoutRef('card', defaultCardRef));
            return;
        }
        if (method === 'sbp' && defaultAccountRef) {
            setDepositRef(formatPayoutRef('account', defaultAccountRef));
        }
    }, [mode, method, defaultCardRef, defaultAccountRef]);

    const parsedAmount = Math.round(Number(amount.replace(/\s/g, '').replace(',', '.')) || 0);
    const withdrawFee = mode === 'withdraw' ? Math.round(parsedAmount * withdrawFeeRate) : 0;
    const withdrawTotal = parsedAmount + withdrawFee;

    function handleSubmit(e) {
        e.preventDefault();
        setError('');
        const result = mode === 'withdraw'
            ? onSubmit(parsedAmount, method, payoutRef)
            : onSubmit(parsedAmount, method, depositRef);
        if (!result.ok) {
            setError(result.error);
        }
    }

    function setPreset(value) {
        setAmount(String(value));
        setError('');
    }

    return (
        <form className="balance-action-form" onSubmit={handleSubmit}>
            <button type="button" className="balance-action-back" onClick={onBack}>
                ← Назад к операциям
            </button>

            {mode === 'withdraw' && (
                <p className="balance-action-hint">
                    Доступно: <strong>{formatCurrencyPlain(balanceAmount)}</strong>
                </p>
            )}

            <label className="balance-action-field">
                <span>Сумма, ₽</span>
                <input
                    type="text"
                    inputMode="numeric"
                    className="balance-action-input"
                    placeholder={mode === 'deposit' ? 'от 100' : 'от 500'}
                    value={amount}
                    onChange={(e) => {
                        setAmount(e.target.value.replace(/[^\d\s,]/g, ''));
                        setError('');
                    }}
                />
            </label>

            <div className="balance-action-presets">
                {(mode === 'deposit' ? DEPOSIT_PRESETS : DEPOSIT_PRESETS.filter(v => v <= balanceAmount)).map(value => (
                    <button
                        key={value}
                        type="button"
                        className={`balance-action-preset${parsedAmount === value ? ' active' : ''}`}
                        onClick={() => setPreset(value)}
                    >
                        {formatCurrencyPlain(value)}
                    </button>
                ))}
                {mode === 'withdraw' && balanceAmount >= minWithdraw && (
                    <button
                        type="button"
                        className="balance-action-preset"
                        onClick={() => setPreset(Math.floor(balanceAmount / (1 + withdrawFeeRate)))}
                    >
                        Максимум
                    </button>
                )}
            </div>

            {mode === 'deposit' ? (
                <>
                    <label className="balance-action-field">
                        <span>Способ оплаты</span>
                        <select
                            className="balance-action-input"
                            value={method}
                            onChange={(e) => {
                                setMethod(e.target.value);
                                setError('');
                            }}
                        >
                            <option value="card">Банковская карта</option>
                            <option value="sbp">СБП</option>
                        </select>
                    </label>

                    {method === 'card' && (
                        linkedCards.length > 0 ? (
                            <label className="balance-action-field">
                                <span>Карта для оплаты</span>
                                <select
                                    className="balance-action-input"
                                    value={depositRef}
                                    onChange={(e) => {
                                        setDepositRef(e.target.value);
                                        setError('');
                                    }}
                                >
                                    {linkedCards.map(card => (
                                        <option key={card.id} value={formatPayoutRef('card', card.id)}>
                                            {maskCardLabel(card.last4, card.brand)}
                                            {card.isDefault ? ' · основная' : ''}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        ) : (
                            <div className="balance-action-empty-card">
                                <p>Нет привязанных карт для пополнения.</p>
                                <Link to="/settings?section=payments" className="app-modal-link" onClick={onClose}>
                                    Привязать карту в настройках
                                </Link>
                            </div>
                        )
                    )}

                    {method === 'sbp' && (
                        linkedAccounts.length > 0 ? (
                            <label className="balance-action-field">
                                <span>Счёт для СБП</span>
                                <select
                                    className="balance-action-input"
                                    value={depositRef}
                                    onChange={(e) => {
                                        setDepositRef(e.target.value);
                                        setError('');
                                    }}
                                >
                                    {linkedAccounts.map(account => (
                                        <option key={account.id} value={formatPayoutRef('account', account.id)}>
                                            {maskAccountLabel(account.last4, account.bankName)}
                                            {account.isDefault ? ' · основной' : ''}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        ) : (
                            <div className="balance-action-empty-card">
                                <p>Нет привязанных счетов для СБП.</p>
                                <Link to="/settings?section=payments" className="app-modal-link" onClick={onClose}>
                                    Привязать счёт в настройках
                                </Link>
                            </div>
                        )
                    )}
                </>
            ) : !hasPayoutMethods ? (
                <div className="balance-action-empty-card">
                    <p>Нет привязанных карт или счетов для вывода.</p>
                    <Link to="/settings?section=payments" className="app-modal-link" onClick={onClose}>
                        Привязать реквизиты в настройках
                    </Link>
                </div>
            ) : (
                <>
                    <label className="balance-action-field">
                        <span>Куда вывести</span>
                        <select
                            className="balance-action-input"
                            value={payoutRef}
                            onChange={(e) => setPayoutRef(e.target.value)}
                        >
                            {linkedCards.length > 0 && (
                                <optgroup label="Карты">
                                    {linkedCards.map(card => (
                                        <option key={`card-${card.id}`} value={formatPayoutRef('card', card.id)}>
                                            {maskCardLabel(card.last4, card.brand)}
                                            {card.isDefault ? ' · основной' : ''}
                                        </option>
                                    ))}
                                </optgroup>
                            )}
                            {linkedAccounts.length > 0 && (
                                <optgroup label="Счета">
                                    {linkedAccounts.map(account => (
                                        <option key={`account-${account.id}`} value={formatPayoutRef('account', account.id)}>
                                            {maskAccountLabel(account.last4, account.bankName)}
                                            {account.isDefault ? ' · основной' : ''}
                                        </option>
                                    ))}
                                </optgroup>
                            )}
                        </select>
                    </label>
                    {parsedAmount >= minWithdraw && (
                        <div className="balance-action-breakdown">
                            <div><span>Сумма вывода</span><strong>{formatCurrencyPlain(parsedAmount)}</strong></div>
                            <div><span>Комиссия (5%)</span><strong>−{formatCurrencyPlain(withdrawFee)}</strong></div>
                            <div className="balance-action-breakdown-total">
                                <span>Итого спишется</span>
                                <strong>{formatCurrencyPlain(withdrawTotal)}</strong>
                            </div>
                        </div>
                    )}
                </>
            )}

            {error && <p className="balance-action-error">{error}</p>}

            {((mode === 'deposit' && canDeposit) || (mode === 'withdraw' && hasPayoutMethods)) && (
                <button type="submit" className={`balance-action-submit balance-action-submit--${mode}`}>
                    {mode === 'deposit' ? 'Пополнить' : 'Вывести'}
                </button>
            )}
        </form>
    );
}

export function BalanceModal({ isOpen, onClose }) {
    const [filter, setFilter] = useState('all');
    const [view, setView] = useState('main');
    const {
        balanceLabel,
        pendingAmount,
        totalReceived,
        totalSpent,
        transactions,
        lastMessage,
        clearMessage,
        deposit,
        withdraw,
        balanceAmount,
        minWithdraw,
        withdrawFeeRate,
        linkedCards,
        linkedAccounts,
        defaultPayout,
    } = useBalance();

    useEffect(() => {
        if (!isOpen) {
            setView('main');
            setFilter('all');
            clearMessage();
        }
    }, [isOpen, clearMessage]);

    const filtered = useMemo(() => {
        if (filter === 'all') return transactions;
        return transactions.filter(item => item.type === filter);
    }, [filter, transactions]);

    const titles = {
        main: 'Баланс и операции',
        deposit: 'Пополнение баланса',
        withdraw: 'Вывод средств',
    };

    function handleDeposit(amount, method, sourceRef) {
        const result = deposit(amount, method, sourceRef);
        if (result.ok) setView('main');
        return result;
    }

    function handleWithdraw(amount, _method, selectedPayoutRef) {
        const result = withdraw(amount, selectedPayoutRef || defaultPayout?.ref);
        if (result.ok) setView('main');
        return result;
    }

    return (
        <AppModal
            isOpen={isOpen}
            onClose={onClose}
            title={titles[view]}
            panelClassName="app-modal-panel--balance"
            footer={view === 'main' ? (
                <Link to="/settings?section=payments" className="app-modal-link" onClick={onClose}>
                    Настройки выплат и карты
                </Link>
            ) : null}
        >
            {lastMessage && view === 'main' && (
                <div className="balance-modal-toast" role="status">{lastMessage}</div>
            )}

            {view === 'main' ? (
                <>
                    <div className="balance-modal-summary">
                        <div className="balance-modal-main">
                            <span className="balance-modal-main-label">Текущий баланс</span>
                            <strong>{balanceLabel}</strong>
                            {pendingAmount > 0 && (
                                <span className="balance-modal-pending">
                                    +{formatCurrencyPlain(pendingAmount)} на проверке
                                </span>
                            )}
                        </div>

                        <div className="balance-modal-actions">
                            <button
                                type="button"
                                className="balance-modal-action balance-modal-action--deposit"
                                onClick={() => setView('deposit')}
                            >
                                Пополнить
                            </button>
                            <button
                                type="button"
                                className="balance-modal-action balance-modal-action--withdraw"
                                onClick={() => setView('withdraw')}
                            >
                                Вывести
                            </button>
                        </div>

                        <div className="balance-modal-stats">
                            <div className="balance-modal-stat balance-modal-stat--income">
                                <span>Получено</span>
                                <strong>{formatCurrencyPlain(totalReceived)}</strong>
                            </div>
                            <div className="balance-modal-stat balance-modal-stat--expense">
                                <span>Потрачено</span>
                                <strong>{formatCurrencyPlain(totalSpent)}</strong>
                            </div>
                        </div>
                    </div>

                    <div className="balance-modal-filters">
                        {FILTERS.map(({ id, label }) => (
                            <button
                                key={id}
                                type="button"
                                className={`balance-modal-filter${filter === id ? ' active' : ''}`}
                                onClick={() => setFilter(id)}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    {filtered.length === 0 ? (
                        <p className="app-modal-empty">Нет операций в этой категории</p>
                    ) : (
                        <ul className="balance-modal-list">
                            {filtered.map(item => {
                                const isIncome = item.amount > 0;
                                return (
                                    <li key={item.id}>
                                        <div className="balance-modal-item">
                                            <span className={`balance-modal-item-icon${isIncome ? ' income' : ' expense'}`}>
                                                <CoinIcon />
                                            </span>
                                            <div className="balance-modal-item-body">
                                                <strong>{item.title}</strong>
                                                <span className="balance-modal-item-meta">
                                                    {CATEGORY_LABELS[item.category] ?? item.category}
                                                    {' · '}
                                                    {item.date}
                                                </span>
                                            </div>
                                            <span className={`balance-modal-item-amount${isIncome ? ' income' : ' expense'}`}>
                                                {formatCurrency(item.amount)}
                                            </span>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </>
            ) : (
                <BalanceActionForm
                    mode={view}
                    onBack={() => setView('main')}
                    onSubmit={view === 'deposit' ? handleDeposit : handleWithdraw}
                    balanceAmount={balanceAmount}
                    minWithdraw={minWithdraw}
                    withdrawFeeRate={withdrawFeeRate}
                    linkedCards={linkedCards}
                    linkedAccounts={linkedAccounts}
                    defaultPayout={defaultPayout}
                    onClose={onClose}
                />
            )}
        </AppModal>
    );
}
