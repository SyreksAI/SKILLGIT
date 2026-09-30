import React from 'react';
import { Link } from 'react-router-dom';
import { HeaderActions } from '../ui/HeaderActions';
import {
    SearchIcon,
    GridIcon,
    RepoIcon,
    CoinIcon,
    ArrowRightIcon,
    CheckCircleIcon,
    RocketIcon,
} from './icons';

const STEPS = [
    {
        num: '01',
        title: 'Найди задачу',
        desc: 'На главной — задания от реальных компаний: разработка, дизайн, QA, AI и другие направления.',
        link: '/',
        linkLabel: 'Смотреть задания',
        Icon: SearchIcon,
    },
    {
        num: '02',
        title: 'Выполни и сдай',
        desc: 'Откликнись, общайся с заказчиком в чате, работай в команде и отправь результат на проверку.',
        link: '/tasks',
        linkLabel: 'Мои задачи',
        Icon: GridIcon,
    },
    {
        num: '03',
        title: 'Пополни портфолио',
        desc: 'Каждая выполненная задача автоматически появляется в LabSkill — твоём профессиональном портфолио.',
        link: '/labskill',
        linkLabel: 'LabSkill',
        Icon: RepoIcon,
    },
    {
        num: '04',
        title: 'Получи оплату',
        desc: 'После проверки деньги поступают на баланс SKILLGIT. Рейтинг и отзывы растут в профиле.',
        link: '/profile',
        linkLabel: 'Мой профиль',
        Icon: CoinIcon,
    },
];

export function HowItWorksPage() {
    return (
        <div className="how-page">
            <header className="home-header">
                <div className="home-header-search">
                    <SearchIcon />
                    <input type="text" placeholder="Поиск..." readOnly />
                </div>
                <HeaderActions />
            </header>

            <section className="how-hero">
                <RocketIcon />
                <h1>Как работает SKILLGIT</h1>
                <p>
                    Биржа задач для студентов и джунов: реальный опыт, портфолио
                    и заработок — в одном месте.
                </p>
                <Link to="/" className="how-hero-btn">
                    Найти первое задание <ArrowRightIcon />
                </Link>
            </section>

            <div className="how-steps">
                {STEPS.map(({ num, title, desc, link, linkLabel, Icon }) => (
                    <article key={num} className="how-step">
                        <span className="how-step-num">{num}</span>
                        <div className="how-step-icon"><Icon /></div>
                        <h2>{title}</h2>
                        <p>{desc}</p>
                        <Link to={link} className="how-step-link">
                            {linkLabel} <ArrowRightIcon />
                        </Link>
                    </article>
                ))}
            </div>

            <section className="how-faq">
                <h2>Частые вопросы</h2>
                <div className="how-faq-list">
                    <details>
                        <summary>Нужен ли опыт?</summary>
                        <p>Нет — большинство задач рассчитаны на junior и студентов с базовыми навыками.</p>
                    </details>
                    <details>
                        <summary>Как получить оплату?</summary>
                        <p>После проверки работы заказчиком сумма зачисляется на ваш баланс в профиле.</p>
                    </details>
                    <details>
                        <summary>Что такое LabSkill?</summary>
                        <p>Это ваше портфолио: репозитории, вклад, активность — всё в одном месте на SKILLGIT.</p>
                    </details>
                </div>
            </section>

            <section className="how-cta">
                <CheckCircleIcon />
                <div>
                    <strong>Готов начать?</strong>
                    <span>Выбери задачу и отправь первый отклик уже сегодня.</span>
                </div>
                <Link to="/" className="how-hero-btn">К заданиям</Link>
            </section>
        </div>
    );
}
