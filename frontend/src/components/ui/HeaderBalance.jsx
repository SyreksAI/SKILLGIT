import { useModals } from '../../context/ModalsContext';
import { useBalance } from '../../context/BalanceContext';
import { CoinIcon } from '../pages/icons';

export function HeaderBalance() {
    const { openBalance } = useModals();
    const { balanceLabel } = useBalance();

    return (
        <button
            type="button"
            className="header-balance"
            onClick={openBalance}
            aria-label="Открыть баланс и историю операций"
        >
            <CoinIcon />
            <div className="header-balance-info">
                <span className="header-balance-label">Баланс</span>
                <strong>{balanceLabel}</strong>
            </div>
        </button>
    );
}
