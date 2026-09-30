import React, { useState } from 'react';
import { useBalance } from '../../context/BalanceContext';
import {
    CARD_BRANDS,
    detectCardBrand,
    formatAccountNumber,
    formatBik,
    formatCardNumber,
    formatExpiry,
    maskAccountLabel,
    maskCardLabel,
} from '../../utils/paymentCards';

const EMPTY_CARD_FORM = {
    number: '',
    expiry: '',
    cvc: '',
    holder: '',
};

const EMPTY_ACCOUNT_FORM = {
    accountNumber: '',
    bik: '',
    bankName: '',
    holder: '',
};

export function PaymentCardsSettings() {
    const {
        linkedCards,
        linkedAccounts,
        addLinkedCard,
        addLinkedAccount,
        removeLinkedCard,
        removeLinkedAccount,
        setDefaultCard,
        setDefaultAccount,
    } = useBalance();

    const [activeForm, setActiveForm] = useState(null);
    const [cardForm, setCardForm] = useState(EMPTY_CARD_FORM);
    const [accountForm, setAccountForm] = useState(EMPTY_ACCOUNT_FORM);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const previewBrand = detectCardBrand(cardForm.number);

    function showSuccess(message) {
        setSuccess(message);
        setTimeout(() => setSuccess(''), 3000);
    }

    function updateCardField(field, value) {
        setCardForm(prev => ({ ...prev, [field]: value }));
        setError('');
    }

    function updateAccountField(field, value) {
        setAccountForm(prev => ({ ...prev, [field]: value }));
        setError('');
    }

    function closeForms() {
        setActiveForm(null);
        setCardForm(EMPTY_CARD_FORM);
        setAccountForm(EMPTY_ACCOUNT_FORM);
        setError('');
    }

    function handleCardSubmit(e) {
        e.preventDefault();
        setError('');

        const result = addLinkedCard(cardForm);
        if (!result.ok) {
            setError(result.error);
            return;
        }

        closeForms();
        showSuccess(`Карта ${maskCardLabel(result.card.last4, result.card.brand)} успешно привязана`);
    }

    function handleAccountSubmit(e) {
        e.preventDefault();
        setError('');

        const result = addLinkedAccount(accountForm);
        if (!result.ok) {
            setError(result.error);
            return;
        }

        closeForms();
        showSuccess(`Счёт ${maskAccountLabel(result.account.last4, result.account.bankName)} успешно привязан`);
    }

    return (
        <div className="payments-settings">
            <div className="account-panel-head">
                <h2>Выплаты и реквизиты</h2>
                <p>Привяжите банковскую карту или расчётный счёт для вывода средств с баланса SKILLGIT.</p>
            </div>

            {success && <div className="payments-settings-toast" role="status">{success}</div>}
            {error && !activeForm && <div className="payments-settings-error">{error}</div>}

            <section className="payments-settings-section">
                <div className="payments-settings-section-head">
                    <h3>Банковские карты</h3>
                    {activeForm !== 'card' && (
                        <button type="button" className="payments-add-btn payments-add-btn--inline" onClick={() => { setActiveForm('card'); setError(''); }}>
                            + Привязать карту
                        </button>
                    )}
                </div>

                <div className="payments-cards-list">
                    {linkedCards.length === 0 ? (
                        <p className="payments-empty">Нет привязанных карт</p>
                    ) : linkedCards.map(card => {
                        const brand = CARD_BRANDS[card.brand] ?? CARD_BRANDS.card;
                        return (
                            <article key={card.id} className={`payments-card-item${card.isDefault ? ' is-default' : ''}`}>
                                <div className="payments-card-visual" style={{ '--card-brand': brand.color }}>
                                    <span className="payments-card-brand">{brand.label}</span>
                                    <strong>•••• •••• •••• {card.last4}</strong>
                                    <div className="payments-card-meta">
                                        <span>{card.holder}</span>
                                        <span>{card.expiry}</span>
                                    </div>
                                </div>
                                <div className="payments-card-actions">
                                    {card.isDefault ? (
                                        <span className="payments-card-badge">Основной</span>
                                    ) : (
                                        <button type="button" className="payments-card-btn" onClick={() => setDefaultCard(card.id)}>
                                            Сделать основным
                                        </button>
                                    )}
                                    <button type="button" className="payments-card-btn payments-card-btn--danger" onClick={() => {
                                        if (!window.confirm(`Удалить карту ${maskCardLabel(card.last4, card.brand)}?`)) return;
                                        const result = removeLinkedCard(card.id);
                                        if (!result.ok) setError(result.error);
                                        else showSuccess('Карта удалена');
                                    }}>
                                        Удалить
                                    </button>
                                </div>
                                <span className="payments-card-added">Привязана {card.addedAt}</span>
                            </article>
                        );
                    })}
                </div>

                {activeForm === 'card' && (
                    <form className="payments-add-form" onSubmit={handleCardSubmit}>
                        <h3>Новая карта</h3>
                        <div className="payments-form-preview" style={{ '--card-brand': CARD_BRANDS[previewBrand].color }}>
                            <span>{CARD_BRANDS[previewBrand].label}</span>
                            <strong>{cardForm.number || '•••• •••• •••• ••••'}</strong>
                            <div>
                                <em>{cardForm.holder || 'ИМЯ ДЕРЖАТЕЛЯ'}</em>
                                <em>{cardForm.expiry || 'ММ/ГГ'}</em>
                            </div>
                        </div>
                        <label className="account-field account-field-full">
                            <span>Номер карты</span>
                            <input type="text" inputMode="numeric" placeholder="0000 0000 0000 0000" value={cardForm.number} onChange={(e) => updateCardField('number', formatCardNumber(e.target.value))} />
                        </label>
                        <div className="payments-form-row">
                            <label className="account-field">
                                <span>Срок действия</span>
                                <input type="text" inputMode="numeric" placeholder="ММ/ГГ" value={cardForm.expiry} onChange={(e) => updateCardField('expiry', formatExpiry(e.target.value))} />
                            </label>
                            <label className="account-field">
                                <span>CVC</span>
                                <input type="password" inputMode="numeric" placeholder="•••" maxLength={3} value={cardForm.cvc} onChange={(e) => updateCardField('cvc', e.target.value.replace(/\D/g, '').slice(0, 3))} />
                            </label>
                        </div>
                        <label className="account-field account-field-full">
                            <span>Имя держателя</span>
                            <input type="text" placeholder="IVAN IVANOV" value={cardForm.holder} onChange={(e) => updateCardField('holder', e.target.value.toUpperCase())} />
                        </label>
                        {error && <p className="payments-settings-error">{error}</p>}
                        <div className="account-actions">
                            <button type="submit" className="account-save-btn">Привязать карту</button>
                            <button type="button" className="account-danger-btn payments-cancel-btn" onClick={closeForms}>Отмена</button>
                        </div>
                    </form>
                )}
            </section>

            <section className="payments-settings-section">
                <div className="payments-settings-section-head">
                    <h3>Банковские счета</h3>
                    {activeForm !== 'account' && (
                        <button type="button" className="payments-add-btn payments-add-btn--inline" onClick={() => { setActiveForm('account'); setError(''); }}>
                            + Привязать счёт
                        </button>
                    )}
                </div>

                <div className="payments-cards-list">
                    {linkedAccounts.length === 0 ? (
                        <p className="payments-empty">Нет привязанных счетов</p>
                    ) : linkedAccounts.map(account => (
                        <article key={account.id} className={`payments-card-item payments-account-item${account.isDefault ? ' is-default' : ''}`}>
                            <div className="payments-account-visual">
                                <span className="payments-card-brand">Расчётный счёт</span>
                                <strong>40817 •••• •••• {account.last4}</strong>
                                <div className="payments-card-meta">
                                    <span>{account.bankName}</span>
                                    <span>БИК {account.bik}</span>
                                </div>
                                <div className="payments-account-holder">{account.holder}</div>
                            </div>
                            <div className="payments-card-actions">
                                {account.isDefault ? (
                                    <span className="payments-card-badge">Основной</span>
                                ) : (
                                    <button type="button" className="payments-card-btn" onClick={() => setDefaultAccount(account.id)}>
                                        Сделать основным
                                    </button>
                                )}
                                <button type="button" className="payments-card-btn payments-card-btn--danger" onClick={() => {
                                    if (!window.confirm(`Удалить счёт ${maskAccountLabel(account.last4, account.bankName)}?`)) return;
                                    const result = removeLinkedAccount(account.id);
                                    if (!result.ok) setError(result.error);
                                    else showSuccess('Счёт удалён');
                                }}>
                                    Удалить
                                </button>
                            </div>
                            <span className="payments-card-added">Привязан {account.addedAt}</span>
                        </article>
                    ))}
                </div>

                {activeForm === 'account' && (
                    <form className="payments-add-form" onSubmit={handleAccountSubmit}>
                        <h3>Новый счёт</h3>
                        <p className="payments-add-note">
                            Укажите реквизиты расчётного счёта для вывода средств без комиссии банка-эмитента карты.
                        </p>
                        <div className="payments-account-preview">
                            <span>{accountForm.bankName || 'Банк'}</span>
                            <strong>{accountForm.accountNumber || '40817 810 0 0000 0000000'}</strong>
                            <div>
                                <em>{accountForm.holder || 'Получатель'}</em>
                                <em>БИК {accountForm.bik || '000000000'}</em>
                            </div>
                        </div>
                        <label className="account-field account-field-full">
                            <span>Номер счёта</span>
                            <input type="text" inputMode="numeric" placeholder="40817 810 0 0000 0000000" value={accountForm.accountNumber} onChange={(e) => updateAccountField('accountNumber', formatAccountNumber(e.target.value))} />
                        </label>
                        <div className="payments-form-row">
                            <label className="account-field">
                                <span>БИК банка</span>
                                <input type="text" inputMode="numeric" placeholder="044525225" value={accountForm.bik} onChange={(e) => updateAccountField('bik', formatBik(e.target.value))} />
                            </label>
                            <label className="account-field">
                                <span>Банк</span>
                                <input type="text" placeholder="Сбербанк" value={accountForm.bankName} onChange={(e) => updateAccountField('bankName', e.target.value)} />
                            </label>
                        </div>
                        <label className="account-field account-field-full">
                            <span>Получатель</span>
                            <input type="text" placeholder="Иванов Иван Иванович" value={accountForm.holder} onChange={(e) => updateAccountField('holder', e.target.value)} />
                        </label>
                        {error && <p className="payments-settings-error">{error}</p>}
                        <div className="account-actions">
                            <button type="submit" className="account-save-btn">Привязать счёт</button>
                            <button type="button" className="account-danger-btn payments-cancel-btn" onClick={closeForms}>Отмена</button>
                        </div>
                    </form>
                )}
            </section>
        </div>
    );
}
