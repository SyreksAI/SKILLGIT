import { useMemo, useState } from 'react';
import { SKILLMATE_IMAGE_TEMPLATES } from '../../data/skillMateSectionsData';
import { AgentsIcon, MicIcon, PlusIcon, WaveformIcon } from '../pages/icons';

const TABS = [
    { id: 'popular', label: 'Популярное' },
    { id: 'templates', label: 'Templates' },
];

export function SkillMateImagesPage() {
    const [prompt, setPrompt] = useState('');
    const [tab, setTab] = useState('popular');

    const items = useMemo(
        () => SKILLMATE_IMAGE_TEMPLATES.filter(item => item.category === tab),
        [tab]
    );

    function handleSubmit(e) {
        e.preventDefault();
        if (!prompt.trim()) return;
    }

    function handleTemplateSelect(label) {
        setPrompt(`Создай изображение в стиле «${label}»`);
    }

    return (
        <div className="skillmate-images-page">
            <div className="skillmate-images-page-inner">
                <h1>Изображения</h1>

                <form className="skillmate-images-prompt" onSubmit={handleSubmit}>
                    <button
                        type="button"
                        className="skillmate-images-prompt-plus"
                        aria-label="Добавить"
                    >
                        <PlusIcon />
                    </button>
                    <input
                        type="text"
                        value={prompt}
                        onChange={e => setPrompt(e.target.value)}
                        placeholder="Опишите новое изображение"
                    />
                    <div className="skillmate-images-prompt-actions">
                        <button type="button" className="skillmate-images-model">
                            <AgentsIcon />
                            Auto
                        </button>
                        <button
                            type="button"
                            className="skillmate-images-mic"
                            aria-label="Голосовой ввод"
                        >
                            <MicIcon />
                        </button>
                        <button
                            type="submit"
                            className="skillmate-images-send"
                            aria-label="Создать изображение"
                            disabled={!prompt.trim()}
                        >
                            <WaveformIcon />
                        </button>
                    </div>
                </form>

                <div className="skillmate-images-tabs" role="tablist" aria-label="Категории">
                    {TABS.map(item => (
                        <button
                            key={item.id}
                            type="button"
                            role="tab"
                            aria-selected={tab === item.id}
                            className={tab === item.id ? 'active' : ''}
                            onClick={() => setTab(item.id)}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>

                <div className="skillmate-images-grid">
                    {items.map(item => (
                        <button
                            key={item.id}
                            type="button"
                            className="skillmate-images-card"
                            onClick={() => handleTemplateSelect(item.label)}
                        >
                            <img
                                src={item.image}
                                alt=""
                                loading="lazy"
                                style={{ background: item.accent }}
                            />
                            <span className="skillmate-images-card-shade" aria-hidden="true" />
                            <span className="skillmate-images-card-label">{item.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
