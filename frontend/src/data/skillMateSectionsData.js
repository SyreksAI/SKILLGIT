export const SKILLMATE_IMAGES = [
    { id: 1, title: 'Логотип стартапа', prompt: 'Минималистичный логотип для IT-компании', date: '2 часа назад', accent: '#3b82f6' },
    { id: 2, title: 'Обложка презентации', prompt: 'Слайд для pitch deck, tёмная тема', date: 'вчера', accent: '#8b5cf6' },
    { id: 3, title: 'Иконка приложения', prompt: 'App icon 1024×1024, gradient blue', date: '3 дня назад', accent: '#06b6d4' },
    { id: 4, title: 'Баннер SkillMate', prompt: 'Hero banner для лендинга AI-ассистента', date: '5 дней назад', accent: '#f59e0b' },
];

export const SKILLMATE_IMAGE_TEMPLATES = [
    { id: 1, label: 'Sketch', category: 'popular', image: 'https://picsum.photos/seed/sm-sketch/480/600', accent: '#d8d8d8' },
    { id: 2, label: 'Стикеры', category: 'popular', image: 'https://picsum.photos/seed/sm-stickers/480/600', accent: '#f3f4f6' },
    { id: 3, label: "'80s flashback", category: 'popular', image: 'https://picsum.photos/seed/sm-eighties/480/600', accent: '#fda4af' },
    { id: 4, label: 'Создать карикатуру', category: 'popular', image: 'https://picsum.photos/seed/sm-anime/480/600', accent: '#93c5fd' },
    { id: 5, label: 'Карикатура', category: 'popular', image: 'https://picsum.photos/seed/sm-cartoon/480/600', accent: '#fcd34d' },
    { id: 6, label: 'Фотоэффект', category: 'popular', image: 'https://picsum.photos/seed/sm-splash/480/600', accent: '#67e8f9' },
    { id: 7, label: 'Бейдж', category: 'popular', image: 'https://picsum.photos/seed/sm-badge/480/600', accent: '#c4b5fd' },
    { id: 8, label: 'Портрет', category: 'popular', image: 'https://picsum.photos/seed/sm-portrait/480/600', accent: '#fdba74' },
    { id: 101, label: 'Product shot', category: 'templates', image: 'https://picsum.photos/seed/sm-product/480/600', accent: '#e5e7eb' },
    { id: 102, label: 'Social post', category: 'templates', image: 'https://picsum.photos/seed/sm-social/480/600', accent: '#bfdbfe' },
    { id: 103, label: 'Logo concept', category: 'templates', image: 'https://picsum.photos/seed/sm-logo/480/600', accent: '#ddd6fe' },
    { id: 104, label: 'App mockup', category: 'templates', image: 'https://picsum.photos/seed/sm-app/480/600', accent: '#99f6e4' },
    { id: 105, label: 'Infographic', category: 'templates', image: 'https://picsum.photos/seed/sm-info/480/600', accent: '#fde68a' },
    { id: 106, label: 'Poster', category: 'templates', image: 'https://picsum.photos/seed/sm-poster/480/600', accent: '#fecdd3' },
    { id: 107, label: 'Icon pack', category: 'templates', image: 'https://picsum.photos/seed/sm-icons/480/600', accent: '#d9f99d' },
    { id: 108, label: 'Wallpaper', category: 'templates', image: 'https://picsum.photos/seed/sm-wall/480/600', accent: '#a5b4fc' },
];

export const SKILLMATE_LIBRARY = [
    { id: 1, title: 'ТЗ на Telegram-bot', type: 'Документ', updated: '12 мар' },
    { id: 2, title: 'Code review PR #12', type: 'Чат', updated: '10 мар' },
    { id: 3, title: 'Roadmap Q2 2026', type: 'Таблица', updated: '8 мар' },
    { id: 4, title: 'Портреты аудитории', type: 'Презентация', updated: '5 мар' },
    { id: 5, title: 'API-спецификация v2', type: 'Документ', updated: '1 мар' },
];

export const SKILLMATE_LIBRARY_ITEMS = [
    {
        id: 1,
        name: 'dashboard-ui-v2.png',
        kind: 'image',
        preview: 'https://picsum.photos/seed/lib-dash/96/96',
        activity: 'Изменено 2д назад',
        recommended: true,
        favorite: true,
    },
    {
        id: 2,
        name: 'mobile-onboarding.png',
        kind: 'image',
        preview: 'https://picsum.photos/seed/lib-mobile/96/96',
        activity: 'Изменено 2д назад',
        recommended: true,
    },
    {
        id: 3,
        name: 'landing-hero.png',
        kind: 'image',
        preview: 'https://picsum.photos/seed/lib-hero/96/96',
        activity: 'Изменено 3д назад',
        recommended: true,
    },
    {
        id: 4,
        name: 'product-requirements.docx',
        kind: 'document',
        activity: 'Изменено 2д назад',
        recommended: true,
        favorite: true,
    },
    {
        id: 5,
        name: 'skillmate-roadmap.docx',
        kind: 'document',
        activity: 'Изменено 3д назад',
        recommended: true,
    },
    {
        id: 6,
        name: 'meeting-notes-march.docx',
        kind: 'document',
        activity: 'Изменено 4д назад',
        recommended: true,
    },
    {
        id: 7,
        name: 'api-spec-v2.docx',
        kind: 'document',
        activity: 'Изменено 5д назад',
        recommended: true,
    },
    {
        id: 8,
        name: 'design-review.docx',
        kind: 'document',
        activity: 'Изменено 6д назад',
        recommended: true,
    },
    {
        id: 9,
        name: 'Brand assets',
        kind: 'folder',
        activity: 'Изменено 1н назад',
        recommended: false,
        favorite: true,
    },
    {
        id: 10,
        name: 'archive-screens.png',
        kind: 'image',
        preview: 'https://picsum.photos/seed/lib-archive/96/96',
        activity: 'Изменено 1н назад',
        recommended: false,
    },
];

export const SKILLMATE_SCHEDULED = [
    { id: 1, title: 'Еженедельный отчёт по задачам', schedule: 'Каждый понедельник, 09:00', next: '7 апр, 09:00' },
    { id: 2, title: 'Напоминание о code review', schedule: 'Пятница, 18:00', next: '4 апр, 18:00' },
    { id: 3, title: 'Сводка по репозиториям LabSkill', schedule: 'Каждый день, 08:30', next: 'Завтра, 08:30' },
];

export const SKILLMATE_SCHEDULED_RECOMMENDED = [
    {
        id: 1,
        title: 'Сводка новостей',
        desc: 'Ежедневно отправляй мне сводку новостей по интересующим меня темам.',
        icon: 'newspaper',
        accent: 'rgba(59, 130, 246, 0.18)',
        color: '#60a5fa',
    },
    {
        id: 2,
        title: 'Найти, что почитать на выходных',
        desc: 'Еженедельно по субботам отправляй мне интересную статью, чтобы почитать.',
        icon: 'book',
        accent: 'rgba(96, 165, 250, 0.18)',
        color: '#93c5fd',
    },
    {
        id: 3,
        title: 'Уведомления о ценах',
        desc: 'Ежедневно проверяй цены и сообщай мне, когда выбранный товар подешевеет.',
        icon: 'shopping',
        accent: 'rgba(251, 146, 60, 0.18)',
        color: '#fb923c',
    },
    {
        id: 4,
        title: 'Найти концерты',
        desc: 'Еженедельно проверяй, нет ли новых концертов на мой вкус.',
        icon: 'music',
        accent: 'rgba(59, 130, 246, 0.18)',
        color: '#60a5fa',
    },
    {
        id: 5,
        title: 'Спланируй мои выходные',
        desc: 'Каждый четверг присылай мне идеи для выходных в окрестностях.',
        icon: 'map',
        accent: 'rgba(239, 68, 68, 0.16)',
        color: '#ef4444',
    },
];

export const SKILLMATE_PROJECTS = [
    { id: 1, name: 'Telegram-bot', chats: 4, files: 12, updated: '2 часа назад', accent: '#0066e0', label: 'TB' },
    { id: 2, name: 'SkillMate Landing', chats: 2, files: 8, updated: 'вчера', accent: '#7c3aed', label: 'SM' },
    { id: 3, name: 'CRM Dashboard', chats: 6, files: 24, updated: '3 дня назад', accent: '#059669', label: 'CR' },
    { id: 4, name: 'Mobile App MVP', chats: 1, files: 5, updated: '1 неделю назад', accent: '#ea580c', label: 'MA' },
];

export const SKILLMATE_AGENTS = [
    { id: 1, name: 'Code Reviewer', desc: 'Анализ PR, безопасность и стиль кода', tasks: 128, accent: '#24292f', label: 'CR' },
    { id: 2, name: 'Doc Writer', desc: 'Документы, отчёты и технические тексты', tasks: 94, accent: '#2563eb', label: 'DW' },
    { id: 3, name: 'Data Analyst', desc: 'Таблицы, графики и сводки по данным', tasks: 67, accent: '#0d9488', label: 'DA' },
    { id: 4, name: 'Designer', desc: 'Макеты, презентации и визуальные материалы', tasks: 41, accent: '#db2777', label: 'DS' },
];
