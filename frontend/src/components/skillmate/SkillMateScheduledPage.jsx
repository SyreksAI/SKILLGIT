import { useState } from 'react';
import { SKILLMATE_SCHEDULED_RECOMMENDED } from '../../data/skillMateSectionsData';
import {
    BookIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    FilterIcon,
    MapPinIcon,
    MicIcon,
    MusicIcon,
    NewspaperIcon,
    PlusIcon,
    ShoppingBagIcon,
} from '../pages/icons';

const ICONS = {
    newspaper: NewspaperIcon,
    book: BookIcon,
    shopping: ShoppingBagIcon,
    music: MusicIcon,
    map: MapPinIcon,
};

export function SkillMateScheduledPage() {
    const [prompt, setPrompt] = useState('');
    const [recommendedOpen, setRecommendedOpen] = useState(true);

    function handleSubmit(e) {
        e.preventDefault();
        if (!prompt.trim()) return;
    }

    function handleRecommendSelect(desc) {
        setPrompt(desc);
    }

    return (
        <div className="skillmate-scheduled-page">
            <div className="skillmate-scheduled-page-inner">
                <header className="skillmate-scheduled-head">
                    <div className="skillmate-scheduled-head-row">
                        <h1>Запланировано</h1>
                        <button type="button" className="skillmate-scheduled-status">
                            <FilterIcon />
                            Активно
                        </button>
                    </div>
                    <p>
                        Попросите SkillMate запланировать задачи, установить напоминания
                        или следить за обновлениями.
                    </p>
                </header>

                <form className="skillmate-scheduled-prompt" onSubmit={handleSubmit}>
                    <button
                        type="button"
                        className="skillmate-scheduled-prompt-plus"
                        aria-label="Добавить"
                    >
                        <PlusIcon />
                    </button>
                    <input
                        type="text"
                        value={prompt}
                        onChange={e => setPrompt(e.target.value)}
                        placeholder="Запланируйте задачу"
                    />
                    <div className="skillmate-scheduled-prompt-actions">
                        <button
                            type="button"
                            className="skillmate-scheduled-mic"
                            aria-label="Голосовой ввод"
                        >
                            <MicIcon />
                        </button>
                        <button
                            type="submit"
                            className="skillmate-scheduled-send"
                            aria-label="Запланировать"
                            disabled={!prompt.trim()}
                        >
                            <ChevronUpIcon />
                        </button>
                    </div>
                </form>

                <button
                    type="button"
                    className={`skillmate-scheduled-section-toggle${recommendedOpen ? ' open' : ''}`}
                    aria-expanded={recommendedOpen}
                    onClick={() => setRecommendedOpen(v => !v)}
                >
                    Рекомендуемые
                    <ChevronDownIcon />
                </button>

                {recommendedOpen && (
                    <ul className="skillmate-scheduled-list">
                        {SKILLMATE_SCHEDULED_RECOMMENDED.map(item => {
                            const Icon = ICONS[item.icon] ?? BookIcon;

                            return (
                                <li key={item.id}>
                                    <div className="skillmate-scheduled-row">
                                        <button
                                            type="button"
                                            className="skillmate-scheduled-row-main"
                                            onClick={() => handleRecommendSelect(item.desc)}
                                        >
                                            <span
                                                className="skillmate-scheduled-row-icon"
                                                style={{ background: item.accent, color: item.color }}
                                            >
                                                <Icon />
                                            </span>
                                            <span className="skillmate-scheduled-row-text">
                                                <strong>{item.title}</strong>
                                                <span>{item.desc}</span>
                                            </span>
                                        </button>
                                        <button
                                            type="button"
                                            className="skillmate-scheduled-row-add"
                                            aria-label={`Добавить «${item.title}»`}
                                            onClick={() => handleRecommendSelect(item.desc)}
                                        >
                                            <PlusIcon />
                                        </button>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </div>
    );
}
