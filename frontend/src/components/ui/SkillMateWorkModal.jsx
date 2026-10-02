import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { StarIcon, XIcon } from '../pages/icons';

export function SkillMateWorkModal({ isOpen, onClose }) {
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
        <div className="skillmate-work-modal" role="presentation">
            <button
                type="button"
                className="skillmate-work-modal-backdrop"
                aria-label="Закрыть"
                onClick={onClose}
            />
            <div
                className="skillmate-work-modal-panel"
                role="dialog"
                aria-modal="true"
                aria-labelledby="skillmate-work-modal-title"
            >
                <button
                    type="button"
                    className="skillmate-work-modal-close"
                    aria-label="Закрыть"
                    onClick={onClose}
                >
                    <XIcon />
                </button>

                <span className="skillmate-work-badge">SkillMate Work</span>
                <h2 id="skillmate-work-modal-title" className="skillmate-work-title">
                    Представляем SkillMate Work
                </h2>
                <p className="skillmate-work-desc">
                    Используйте SkillMate Work, если задача требует большего, чем просто краткий ответ.
                    SkillMate поможет собрать контекст, организовать работу и создать профессионально
                    оформленные документы, презентации, таблицы и многое другое.
                </p>
                <Link to="/how-it-works" className="skillmate-work-link" onClick={onClose}>
                    Узнать больше
                </Link>
                <button type="button" className="skillmate-work-unlock">
                    <StarIcon />
                    Разблокировать с помощью Pro
                </button>
            </div>
        </div>
    );
}
