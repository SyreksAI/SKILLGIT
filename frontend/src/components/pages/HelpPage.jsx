import { Link } from 'react-router-dom';
import { HeaderActions } from '../ui/HeaderActions';
import { SearchIcon, ArrowRightIcon } from './icons';

const SECTIONS = [
    {
        title: 'Для студентов',
        items: [
            { q: 'Как откликнуться на задание?', a: 'Откройте карточку задачи на главной и нажмите «Откликнуться». Статус появится в разделе «Мои задачи».', link: '/' },
            { q: 'Как получить выплату?', a: 'Привяжите карту или счёт в настройках выплат. После проверки работы компанией средства поступят на баланс.', link: '/settings?section=payments' },
            { q: 'Что такое LabSkill?', a: 'Это ваше портфолио на GitHub-подобной платформе. Репозитории можно привязать к задачам.', link: '/labskill' },
        ],
    },
    {
        title: 'Для компаний',
        items: [
            { q: 'Как публиковать задачи?', a: 'Войдите в кабинет компании через служебный адрес, создайте задание и управляйте откликами в CRM.', link: null },
            { q: 'Как общаться с кандидатами?', a: 'Используйте раздел «Сообщения» в кабинете компании.', link: null },
        ],
    },
    {
        title: 'Поддержка',
        items: [
            { q: 'Контакты', a: 'support@skillgit.ru · Telegram @skillgit_support', link: null },
            { q: 'Как это работает', a: 'Пошаговый гайд по платформе.', link: '/how-it-works' },
        ],
    },
];

export function HelpPage() {
    return (
        <div className="help-page">
            <header className="home-header">
                <div className="home-header-search">
                    <SearchIcon />
                    <input type="text" placeholder="Поиск в справке..." readOnly />
                </div>
                <HeaderActions />
            </header>

            <div className="account-page">
                <header className="account-header">
                    <div>
                        <h1>Справка и поддержка</h1>
                        <p>Ответы на частые вопросы по SKILLGIT</p>
                    </div>
                    <Link to="/notifications" className="account-public-link">
                        Уведомления
                        <ArrowRightIcon />
                    </Link>
                </header>

                {SECTIONS.map(section => (
                    <section key={section.title} className="help-section">
                        <h2>{section.title}</h2>
                        <ul className="help-faq">
                            {section.items.map(item => (
                                <li key={item.q} className="help-faq-item">
                                    <strong>{item.q}</strong>
                                    <p>{item.a}</p>
                                    {item.link && (
                                        <Link to={item.link} className="admin-link">Перейти →</Link>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </section>
                ))}
            </div>
        </div>
    );
}
