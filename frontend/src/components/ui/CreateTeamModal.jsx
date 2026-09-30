import { useState } from 'react';
import { DIRECTIONS } from '../../data/mockData';
import { AppModal } from './AppModal';

const MAX_MEMBERS_OPTIONS = [6, 8, 10, 12, 15];

const INITIAL_FORM = {
    name: '',
    description: '',
    direction: 'dev',
    maxMembers: 10,
    tags: '',
    open: true,
};

export function CreateTeamModal({ isOpen, onClose, onCreate }) {
    const [form, setForm] = useState(INITIAL_FORM);
    const [error, setError] = useState('');

    function updateField(field, value) {
        setForm(prev => ({ ...prev, [field]: value }));
        if (error) setError('');
    }

    function handleClose() {
        setForm(INITIAL_FORM);
        setError('');
        onClose();
    }

    function handleSubmit(e) {
        e.preventDefault();

        const name = form.name.trim();
        const description = form.description.trim();

        if (!name) {
            setError('Введите название команды.');
            return;
        }

        if (!description) {
            setError('Добавьте краткое описание команды.');
            return;
        }

        const direction = DIRECTIONS.find(d => d.id === form.direction) ?? DIRECTIONS[0];
        const tags = form.tags
            .split(',')
            .map(tag => tag.trim())
            .filter(Boolean);

        onCreate({
            name,
            description,
            direction: form.direction,
            maxMembers: Number(form.maxMembers),
            tags,
            open: form.open,
            color: direction.color,
            avatar: name.charAt(0).toUpperCase(),
        });

        setForm(INITIAL_FORM);
        setError('');
    }

    return (
        <AppModal
            isOpen={isOpen}
            onClose={handleClose}
            title="Создать команду"
            ariaLabel="Создание команды"
            panelClassName="app-modal-panel--gh"
            footer={(
                <div className="create-team-footer">
                    <button type="button" className="create-team-btn create-team-btn--ghost" onClick={handleClose}>
                        Отмена
                    </button>
                    <button type="submit" form="create-team-form" className="create-team-btn create-team-btn--primary">
                        Создать команду
                    </button>
                </div>
            )}
        >
            <form id="create-team-form" className="create-team-form" onSubmit={handleSubmit}>
                <p className="app-modal-desc">
                    Собери джунов своего направления: pet-проекты, менторство и подготовка к собеседованиям.
                </p>

                {error && <p className="create-team-error">{error}</p>}

                <label className="create-team-field">
                    <span>Название команды</span>
                    <input
                        type="text"
                        className="create-team-input"
                        placeholder="Например, React Crew"
                        value={form.name}
                        onChange={e => updateField('name', e.target.value)}
                        maxLength={60}
                        autoFocus
                    />
                </label>

                <label className="create-team-field">
                    <span>Описание</span>
                    <textarea
                        className="create-team-textarea"
                        placeholder="Чем занимается команда и кого ищете"
                        value={form.description}
                        onChange={e => updateField('description', e.target.value)}
                        rows={3}
                        maxLength={280}
                    />
                </label>

                <label className="create-team-field">
                    <span>Направление</span>
                    <select
                        className="create-team-select"
                        value={form.direction}
                        onChange={e => updateField('direction', e.target.value)}
                    >
                        {DIRECTIONS.map(dir => (
                            <option key={dir.id} value={dir.id}>{dir.label}</option>
                        ))}
                    </select>
                </label>

                <label className="create-team-field">
                    <span>Максимум участников</span>
                    <select
                        className="create-team-select"
                        value={form.maxMembers}
                        onChange={e => updateField('maxMembers', e.target.value)}
                    >
                        {MAX_MEMBERS_OPTIONS.map(n => (
                            <option key={n} value={n}>{n} человек</option>
                        ))}
                    </select>
                </label>

                <label className="create-team-field">
                    <span>Теги (через запятую)</span>
                    <input
                        type="text"
                        className="create-team-input"
                        placeholder="React, Pet-проекты, TypeScript"
                        value={form.tags}
                        onChange={e => updateField('tags', e.target.value)}
                    />
                </label>

                <label className="create-team-check">
                    <input
                        type="checkbox"
                        checked={form.open}
                        onChange={e => updateField('open', e.target.checked)}
                    />
                    <span>Открытая команда — новые участники могут вступить без приглашения</span>
                </label>
            </form>
        </AppModal>
    );
}
