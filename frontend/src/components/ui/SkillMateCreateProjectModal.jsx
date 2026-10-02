import { useEffect, useRef, useState } from 'react';
import { CheckIcon, ChevronDownIcon, LightbulbIcon, PlusIcon, SmileIcon, XIcon } from '../pages/icons';

const MEMORY_OPTIONS = [
    {
        id: 'default',
        label: 'Память по умолчанию',
        desc: 'Этот проект может использовать память из чатов вне проекта, и наоборот.',
    },
    {
        id: 'project',
        label: 'Память только в проекте',
        desc: 'Этот проект может обращаться только к собственной памяти. Она скрыта от чатов вне проекта.',
    },
];

export function SkillMateCreateProjectModal({ isOpen, onClose, onCreate }) {
    const [name, setName] = useState('');
    const [memoryId, setMemoryId] = useState('default');
    const [memoryOpen, setMemoryOpen] = useState(false);
    const memoryRef = useRef(null);
    const inputRef = useRef(null);

    const memory = MEMORY_OPTIONS.find(item => item.id === memoryId) ?? MEMORY_OPTIONS[0];
    const canCreate = name.trim().length > 0;

    useEffect(() => {
        if (!isOpen) return undefined;

        function handleKeyDown(e) {
            if (e.key === 'Escape') onClose();
        }

        document.body.style.overflow = 'hidden';
        document.addEventListener('keydown', handleKeyDown);
        inputRef.current?.focus();

        return () => {
            document.body.style.overflow = '';
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    useEffect(() => {
        if (!isOpen) {
            setName('');
            setMemoryId('default');
            setMemoryOpen(false);
        }
    }, [isOpen]);

    useEffect(() => {
        if (!memoryOpen) return undefined;

        function onDocClick(e) {
            if (memoryRef.current && !memoryRef.current.contains(e.target)) {
                setMemoryOpen(false);
            }
        }

        document.addEventListener('mousedown', onDocClick);
        return () => document.removeEventListener('mousedown', onDocClick);
    }, [memoryOpen]);

    if (!isOpen) return null;

    function handleSubmit(e) {
        e.preventDefault();
        if (!canCreate) return;
        onCreate?.({ name: name.trim(), memoryId });
        onClose();
    }

    return (
        <div className="skillmate-project-modal" role="presentation">
            <button
                type="button"
                className="skillmate-project-modal-backdrop"
                aria-label="Закрыть"
                onClick={onClose}
            />
            <form
                className="skillmate-project-modal-panel"
                role="dialog"
                aria-modal="true"
                aria-labelledby="skillmate-project-modal-title"
                onSubmit={handleSubmit}
            >
                <div className="skillmate-project-modal-head">
                    <h2 id="skillmate-project-modal-title">Создать проект</h2>
                    <button
                        type="button"
                        className="skillmate-project-modal-close"
                        aria-label="Закрыть"
                        onClick={onClose}
                    >
                        <XIcon />
                    </button>
                </div>

                <label className="skillmate-project-field">
                    <span>Название проекта</span>
                    <span className="skillmate-project-input-wrap">
                        <span className="skillmate-project-input-icon" aria-hidden="true">
                            <SmileIcon />
                            <PlusIcon />
                        </span>
                        <input
                            ref={inputRef}
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="Поездка в Копенгаген"
                        />
                    </span>
                </label>

                <div className="skillmate-project-tip">
                    <span className="skillmate-project-tip-icon" aria-hidden="true">
                        <LightbulbIcon />
                    </span>
                    <p>
                        Проекты объединяют чаты, файлы и пользовательские инструкции в одном месте.
                        Используйте их для продолжительной работы или просто чтобы поддерживать порядок.
                    </p>
                </div>

                <div className="skillmate-project-modal-foot">
                    <div className="skillmate-project-memory" ref={memoryRef}>
                        <button
                            type="button"
                            className={`skillmate-project-memory-btn${memoryOpen ? ' open' : ''}`}
                            aria-expanded={memoryOpen}
                            onClick={() => setMemoryOpen(v => !v)}
                        >
                            {memory.label}
                            <ChevronDownIcon />
                        </button>
                        {memoryOpen && (
                            <div className="skillmate-project-memory-menu" role="menu">
                                {MEMORY_OPTIONS.map(option => (
                                    <button
                                        key={option.id}
                                        type="button"
                                        role="menuitem"
                                        className={option.id === memoryId ? 'active' : ''}
                                        onClick={() => {
                                            setMemoryId(option.id);
                                            setMemoryOpen(false);
                                        }}
                                    >
                                        <span className="skillmate-project-memory-option">
                                            <strong>{option.label}</strong>
                                            <span>{option.desc}</span>
                                        </span>
                                        {option.id === memoryId && <CheckIcon />}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="skillmate-project-create"
                        disabled={!canCreate}
                    >
                        Создать проект
                    </button>
                </div>
            </form>
        </div>
    );
}
