import React from 'react';
import { AppModal } from './AppModal';
import { MoonIcon } from '../pages/icons';
import { useTheme } from '../../context/ThemeContext';

export function ThemeModal({ isOpen, onClose }) {
    const { theme, setTheme, isDark } = useTheme();

    function selectTheme(next) {
        setTheme(next);
        onClose();
    }

    return (
        <AppModal isOpen={isOpen} onClose={onClose} title="Тема оформления">
            <p className="app-modal-desc">
                Выберите тему интерфейса SKILLGIT. Настройка сохраняется в браузере.
            </p>
            <div className="modal-theme-options">
                <button
                    type="button"
                    className={`modal-theme-option${theme === 'light' ? ' active' : ''}`}
                    onClick={() => selectTheme('light')}
                >
                    <span className="modal-theme-preview modal-theme-preview-light" />
                    <strong>Светлая</strong>
                    <span>{theme === 'light' ? 'Активна' : 'Выбрать'}</span>
                </button>
                <button
                    type="button"
                    className={`modal-theme-option${theme === 'dark' ? ' active' : ''}`}
                    onClick={() => selectTheme('dark')}
                >
                    <span className="modal-theme-preview modal-theme-preview-dark" />
                    <strong>Тёмная</strong>
                    <span>{theme === 'dark' ? 'Активна' : 'Выбрать'}</span>
                </button>
            </div>
            <div className="modal-theme-note">
                <MoonIcon />
                <span>
                    {isDark
                        ? 'Тёмная тема включена'
                        : 'Светлая тема включена'}
                </span>
            </div>
        </AppModal>
    );
}
