import React, { useEffect } from 'react';

export function AppModal({ isOpen, onClose, title, ariaLabel, children, footer, panelClassName }) {
    useEffect(() => {
        if (!isOpen) return undefined;

        function handleKeyDown(e) {
            if (e.key === 'Escape') onClose();
        }

        document.body.style.overflow = 'hidden';
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.body.style.overflow = '';
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div
            className="app-modal"
            role="dialog"
            aria-modal="true"
            aria-label={ariaLabel ?? title}
        >
            <button
                type="button"
                className="app-modal-backdrop"
                onClick={onClose}
                aria-label="Закрыть"
            />
            <div className={`app-modal-panel${panelClassName ? ` ${panelClassName}` : ''}`}>
                <div className="app-modal-head">
                    <h2>{title}</h2>
                    <button type="button" className="app-modal-close" onClick={onClose}>×</button>
                </div>
                <div className="app-modal-body">{children}</div>
                {footer && <div className="app-modal-footer">{footer}</div>}
            </div>
        </div>
    );
}
