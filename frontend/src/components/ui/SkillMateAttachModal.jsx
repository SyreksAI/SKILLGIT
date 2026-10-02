import { useEffect } from 'react';
import {
    BookIcon,
    CodeIcon,
    FolderIcon,
    ImageIcon,
    UploadIcon,
} from '../pages/icons';

const ACTIONS = [
    {
        id: 'file',
        label: 'Загрузить файл',
        desc: 'PDF, код, документы',
        Icon: UploadIcon,
    },
    {
        id: 'photo',
        label: 'Добавить фото',
        desc: 'PNG, JPG до 10 МБ',
        Icon: ImageIcon,
    },
    {
        id: 'repo',
        label: 'Репозиторий LabSkill',
        desc: 'Подключить проект к чату',
        Icon: FolderIcon,
    },
    {
        id: 'code',
        label: 'Вставить код',
        desc: 'Фрагмент или файл',
        Icon: CodeIcon,
    },
    {
        id: 'docs',
        label: 'Документация',
        desc: 'Справка и примеры SkillMate',
        Icon: BookIcon,
    },
];

export function SkillMateAttachModal({ isOpen, onClose, onSelect }) {
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
        <div className="skillmate-attach-modal" role="presentation">
            <button
                type="button"
                className="skillmate-attach-backdrop"
                aria-label="Закрыть"
                onClick={onClose}
            />
            <div
                className="skillmate-attach-panel"
                role="dialog"
                aria-modal="true"
                aria-label="Добавить в чат"
            >
                <div className="skillmate-attach-head">
                    <strong>Добавить к запросу</strong>
                    <span>Файлы, код и репозитории</span>
                </div>
                <ul className="skillmate-attach-list">
                    {ACTIONS.map(({ id, label, desc, Icon }) => (
                        <li key={id}>
                            <button
                                type="button"
                                className="skillmate-attach-item"
                                onClick={() => {
                                    onSelect?.(id);
                                    onClose();
                                }}
                            >
                                <span className="skillmate-attach-item-icon">
                                    <Icon />
                                </span>
                                <span className="skillmate-attach-item-text">
                                    <strong>{label}</strong>
                                    <span>{desc}</span>
                                </span>
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
