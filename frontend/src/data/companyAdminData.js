import { DIRECTIONS, TASKS } from './mockData';

export const DEMO_COMPANY = {
    id: 'yandex',
    slug: 'yandex',
    name: 'Яндекс',
    color: '#fc3f1d',
    industry: 'IT / Tech',
    verified: true,
    plan: 'Business',
    balance: 245000,
    email: 'hr-tasks@yandex.ru',
    website: 'yandex.ru',
    description: 'Крупнейшая IT-компания России. Публикуем задачи для студентов и джунов через SKILLGIT.',
    managers: 4,
    joined: 'Март 2025',
};

export const COMPANY_REGISTRY = [
    DEMO_COMPANY,
    { id: 'vk', slug: 'vk', name: 'VK', color: '#0077ff', industry: 'IT / Social', verified: true, description: 'Социальная экосистема и технологии.' },
    { id: 'sber', slug: 'sber', name: 'Сбер', color: '#21a038', industry: 'Финтех', verified: true, description: 'Цифровые сервисы и финтех-продукты.' },
    { id: 'tinkoff', slug: 'tinkoff', name: 'Tinkoff', color: '#ffdd2d', industry: 'Финтех', verified: false, description: 'Онлайн-банк и экосистема сервисов.' },
    { id: 'ozon', slug: 'ozon', name: 'Ozon', color: '#005bff', industry: 'E-commerce', verified: true, description: 'Маркетплейс и логистика.' },
    { id: 'kaspersky', slug: 'kaspersky', name: 'Kaspersky Lab', color: '#00a88e', industry: 'Security', verified: true, description: 'Кибербезопасность и защита данных.' },
];

export function getCompanyBySlug(slug) {
    return COMPANY_REGISTRY.find(c => c.slug === slug) ?? null;
}

export function companySlugFromName(name) {
    const found = COMPANY_REGISTRY.find(c => c.name === name);
    if (found) return found.slug;
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

export const APPLICANT_STATUSES = [
    { id: 'new', label: 'Новые', color: '#3b82f6' },
    { id: 'review', label: 'Скрининг', color: '#f59e0b' },
    { id: 'interview', label: 'Интервью', color: '#8b5cf6' },
    { id: 'offer', label: 'Оффер', color: '#06b6d4' },
    { id: 'hired', label: 'В работе', color: '#22c55e' },
    { id: 'rejected', label: 'Отказ', color: '#ef4444' },
];

export const APPLICANT_TAGS = ['Приоритет', 'Рекомендация', 'Джун', 'Middle', 'Портфолио+'];

export const COMPANY_APPLICANTS = [
    { id: 1, taskId: 1, taskTitle: 'Реализовать Telegram-бота на Python', userName: 'Иван Иванов', username: 'ivan-ivanov', avatar: 'И', rating: 4.8, skills: ['Python', 'Telegram API', 'SQLite'], status: 'new', appliedAt: '2 часа назад', cover: 'Делал ботов на aiogram, есть 2 проекта в LabSkill.', assigneeId: 3, tags: ['Приоритет', 'Портфолио+'], labskillRepo: 'ivan-ivanov/telegram-bot', interviewAt: null, source: 'SKILLGIT' },
    { id: 2, taskId: 1, taskTitle: 'Реализовать Telegram-бота на Python', userName: 'Дмитрий Петров', username: 'dmitry-p', avatar: 'Д', rating: 4.5, skills: ['Python', 'FastAPI'], status: 'review', appliedAt: '5 часов назад', cover: 'Backend-разработчик, опыт с SQLite и ботами.', assigneeId: 3, tags: ['Джун'], labskillRepo: 'dmitry-p/fastapi-starter', interviewAt: null, source: 'SKILLGIT' },
    { id: 3, taskId: 1, taskTitle: 'Реализовать Telegram-бота на Python', userName: 'Анна Соколова', username: 'anna-s', avatar: 'А', rating: 4.9, skills: ['Python', 'Django'], status: 'interview', appliedAt: '1 день назад', cover: 'Хочу прокачать портфолио, готова к созвону.', assigneeId: 1, tags: ['Рекомендация'], labskillRepo: 'anna-s/django-shop', interviewAt: '1 окт, 15:00', source: 'SKILLGIT' },
    { id: 4, taskId: 1, taskTitle: 'Реализовать Telegram-бота на Python', userName: 'Максим Орлов', username: 'max-o', avatar: 'М', rating: 4.2, skills: ['Python'], status: 'rejected', appliedAt: '2 дня назад', cover: 'Начинающий, но мотивированный.', assigneeId: null, tags: [], labskillRepo: null, interviewAt: null, source: 'SKILLGIT' },
    { id: 5, taskId: 1, taskTitle: 'Реализовать Telegram-бота на Python', userName: 'Елена Д.', username: 'elena-d', avatar: 'Е', rating: 4.7, skills: ['Python', 'SQL'], status: 'hired', appliedAt: '3 дня назад', cover: 'Уже делала похожий проект для курсовой.', assigneeId: 2, tags: ['Middle'], labskillRepo: 'elena-d/bot-admin', interviewAt: null, source: 'SKILLGIT' },
    { id: 6, taskId: 1, taskTitle: 'Реализовать Telegram-бота на Python', userName: 'Кирилл М.', username: 'kirill-m', avatar: 'К', rating: 4.6, skills: ['Python', 'Docker'], status: 'offer', appliedAt: '4 часа назад', cover: 'DevOps background, быстро разворачиваю проекты.', assigneeId: 1, tags: ['Приоритет'], labskillRepo: 'kirill-m/devops-lab', interviewAt: '2 окт, 11:00', source: 'SKILLGIT' },
    { id: 7, taskId: 1, taskTitle: 'Реализовать Telegram-бота на Python', userName: 'София Р.', username: 'sofia-r', avatar: 'С', rating: 4.4, skills: ['Python', 'NLP'], status: 'new', appliedAt: '6 часов назад', cover: 'Интересует ML-компонент в боте.', assigneeId: null, tags: ['Джун'], labskillRepo: null, interviewAt: null, source: 'SKILLGIT' },
    { id: 8, taskId: 1, taskTitle: 'Реализовать Telegram-бота на Python', userName: 'Павел Г.', username: 'pavel-g', avatar: 'П', rating: 4.1, skills: ['Python', 'PostgreSQL'], status: 'review', appliedAt: '1 день назад', cover: 'Работал с aiogram 3.x.', assigneeId: 3, tags: [], labskillRepo: 'pavel-g/pg-bot', interviewAt: null, source: 'Referral' },
];

export const COMPANY_APPLICANT_NOTES = {
    1: [{ id: 1, author: 'Мария Н.', text: 'Сильное портфолио, позвать на тех. интервью.', date: '30 сен, 14:00' }],
    3: [{ id: 1, author: 'Ольга К.', text: 'Рекомендация от ментора VK Tech.', date: '29 сен, 10:30' }],
    6: [{ id: 1, author: 'Алексей В.', text: 'Готов отправить оффер после созвона.', date: '30 сен, 16:45' }],
};

export const COMPANY_DEALS = [
    { id: 1, applicantId: 5, taskId: 1, taskTitle: 'Telegram-бот на Python', candidateName: 'Елена Д.', username: 'elena-d', amount: 15000, paid: 7500, status: 'active', progress: 65, deadline: '5 окт 2026', milestone: 'MVP + README', createdAt: '27 сен 2026' },
    { id: 2, applicantId: null, taskId: null, taskTitle: 'UI audit (завершено)', candidateName: 'Анна Петрова', username: 'anna-p', amount: 8000, paid: 8000, status: 'completed', progress: 100, deadline: '20 сен 2026', milestone: 'Финальный отчёт', createdAt: '10 сен 2026' },
];

export const COMPANY_ACTIVITIES = [
    { id: 1, type: 'applicant', text: 'Иван Иванов откликнулся на «Telegram-бот»', time: '2 часа назад', actor: 'Система' },
    { id: 2, type: 'status', text: 'Анна Соколова → этап «Интервью»', time: '5 часов назад', actor: 'Мария Н.' },
    { id: 3, type: 'message', text: 'Новое сообщение от Дмитрия Петрова', time: '6 часов назад', actor: 'CRM' },
    { id: 4, type: 'deal', text: 'Частичная выплата 7 500 ₽ · Елена Д.', time: '1 день назад', actor: 'Финансы' },
    { id: 5, type: 'task', text: 'Опубликовано задание «Telegram-бот на Python»', time: '3 дня назад', actor: 'Ольга К.' },
    { id: 6, type: 'team', text: 'Мария Н. назначена рекрутером на вакансию', time: '4 дня назад', actor: 'HR Lead' },
];

export const COMPANY_ANALYTICS_TRENDS = {
    applications: [12, 18, 15, 22, 19, 28, 24, 31, 27, 35, 32, 38],
    hires: [1, 0, 2, 1, 3, 2, 2, 4, 3, 2, 3, 5],
    spend: [45000, 32000, 58000, 41000, 72000, 55000, 68000, 91000, 76000, 88000, 95000, 102000],
    conversion: [8, 6, 12, 9, 14, 11, 10, 13, 12, 15, 11, 13],
};

export const MESSAGE_TEMPLATES = [
    { id: 1, title: 'Приглашение на интервью', text: 'Здравствуйте! Приглашаем вас на короткое техническое интервью. Удобно ли созвониться завтра в 15:00?' },
    { id: 2, title: 'Запрос портфолио', text: 'Спасибо за отклик! Пришлите, пожалуйста, ссылку на LabSkill-репозиторий или GitHub с похожим проектом.' },
    { id: 3, title: 'Оффер', text: 'Мы готовы начать работу по задаче. Подтвердите, пожалуйста, сроки и условия из ТЗ.' },
    { id: 4, title: 'Отказ (мягкий)', text: 'Спасибо за интерес к нашей задаче. На данном этапе мы выбрали другого кандидата, но будем рады видеть ваши отклики снова.' },
];

export const COMPANY_TEAM = [
    { id: 1, name: 'Ольга Кузнецова', email: 'olga.k@yandex.ru', role: 'HR Lead', avatar: 'О', active: true, permissions: ['all'] },
    { id: 2, name: 'Алексей В.', email: 'alex.v@yandex.ru', role: 'Tech Lead', avatar: 'А', active: true, permissions: ['tasks', 'applicants', 'deals'] },
    { id: 3, name: 'Мария Н.', email: 'maria.n@yandex.ru', role: 'Recruiter', avatar: 'М', active: true, permissions: ['applicants', 'messages'] },
];

export const COMPANY_MESSAGES = [
    { id: 1, applicantId: 1, userName: 'Иван Иванов', username: 'ivan-ivanov', taskTitle: 'Telegram-бот на Python', lastMessage: 'Готов приступить сегодня, могу показать репозиторий.', time: '14:20', unread: 2, pinned: true },
    { id: 2, applicantId: 3, userName: 'Анна Соколова', username: 'anna-s', taskTitle: 'Telegram-бот на Python', lastMessage: 'Когда удобно созвониться?', time: '11:05', unread: 0, pinned: false },
    { id: 3, applicantId: 2, userName: 'Дмитрий Петров', username: 'dmitry-p', taskTitle: 'Telegram-бот на Python', lastMessage: 'Отправил ссылку на LabSkill-репозиторий.', time: 'Вчера', unread: 1, pinned: false },
    { id: 4, applicantId: 6, userName: 'Кирилл М.', username: 'kirill-m', taskTitle: 'Telegram-бот на Python', lastMessage: 'Могу созвониться в четверг утром.', time: '09:40', unread: 0, pinned: false },
];

export const COMPANY_MESSAGE_THREADS = {
    1: [
        { id: 1, from: 'them', text: 'Здравствуйте! Откликаюсь на задачу с Telegram-ботом.', time: '10:00' },
        { id: 2, from: 'me', text: 'Добрый день! Расскажите про опыт с aiogram.', time: '10:15' },
        { id: 3, from: 'them', text: 'Делал бота для учебного проекта — команды, SQLite, админка.', time: '10:22' },
        { id: 4, from: 'them', text: 'Готов приступить сегодня, могу показать репозиторий.', time: '14:20' },
    ],
    2: [
        { id: 1, from: 'them', text: 'Добрый день! Интересует задача по боту.', time: '09:30' },
        { id: 2, from: 'me', text: 'Спасибо за отклик. Когда удобно созвон?', time: '10:00' },
        { id: 3, from: 'them', text: 'Когда удобно созвониться?', time: '11:05' },
    ],
    3: [{ id: 1, from: 'them', text: 'Отправил ссылку на LabSkill-репозиторий.', time: 'Вчера' }],
    4: [{ id: 1, from: 'them', text: 'Могу созвониться в четверг утром.', time: '09:40' }],
};

export const COMPANY_BILLING = [
    { id: 1, date: '28 сен 2026', title: 'Выплата исполнителю · Telegram-бот (аванс 50%)', amount: -7500, type: 'payout', dealId: 1 },
    { id: 2, date: '25 сен 2026', title: 'Пополнение баланса компании', amount: 100000, type: 'topup', dealId: null },
    { id: 3, date: '20 сен 2026', title: 'Комиссия SKILLGIT (5%)', amount: -750, type: 'fee', dealId: null },
    { id: 4, date: '18 сен 2026', title: 'Выплата исполнителю · UI audit', amount: -8000, type: 'payout', dealId: 2 },
];

export function getCompanyTasksFromCatalog(companyName) {
    return TASKS.filter(t => t.company === companyName).map(task => ({
        ...task,
        status: 'published',
        statusLabel: 'Опубликовано',
        views: task.applicants * 12 + 40,
        conversions: Math.round(task.applicants * 0.12),
        source: 'catalog',
        assigneeId: 1,
    }));
}

export function getDirectionOptions() {
    return DIRECTIONS.map(d => ({ id: d.id, label: d.label }));
}

export function getStatusMeta(statusId) {
    return APPLICANT_STATUSES.find(s => s.id === statusId) ?? APPLICANT_STATUSES[0];
}

export function getNextStatus(statusId) {
    const idx = APPLICANT_STATUSES.findIndex(s => s.id === statusId);
    if (idx < 0 || idx >= APPLICANT_STATUSES.length - 2) return null;
    return APPLICANT_STATUSES[idx + 1].id;
}

export function getPrevStatus(statusId) {
    const idx = APPLICANT_STATUSES.findIndex(s => s.id === statusId);
    if (idx <= 0) return null;
    return APPLICANT_STATUSES[idx - 1].id;
}
