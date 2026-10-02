export const SKILLMATE_PLUGINS_INSTALLED = [
    { id: 'labskill', name: 'LabSkill', iconBg: '#0066e0', iconLabel: 'LS', sparkle: false },
];

const p = (id, name, desc, iconBg, iconLabel, sparkle = false) => ({
    id, name, desc, iconBg, iconLabel, sparkle,
});

export const SKILLMATE_PLUGIN_CATALOG = [
    {
        id: 'popular',
        title: 'Популярное',
        items: [
            p('gmail', 'Gmail', 'Находите письма, составляйте ответы и резюмируйте переписку', '#ea4335', 'M', true),
            p('health', 'Health', 'Анализируйте данные о здоровье и получайте рекомендации', '#ff2d55', '♥'),
            p('gdrive', 'Google Drive', 'Ищите, резюмируйте и делитесь файлами в Google Drive', '#34a853', '▲', true),
            p('github', 'GitHub', 'Создавайте, ищите и анализируйте репозитории и PR', '#24292f', 'GH'),
            p('supabase', 'Supabase', 'Создавайте базы данных и выполняйте запросы', '#3ecf8e', 'S'),
            p('sales', 'Sales', 'Исследуйте клиентов и готовьте материалы для продаж', '#7c3aed', '$'),
        ],
        more: {
            preview: [
                p('outlook', 'Outlook', '', '#0078d4', 'O'),
                p('shopify', 'Shopify', '', '#96bf48', 'S'),
                p('notion', 'Notion', '', '#ffffff', 'N'),
            ],
            label: 'Показать Outlook Email, Shopify и другие',
        },
    },
    {
        id: 'new',
        title: 'Новое и интересное',
        items: [
            p('adobe', 'Adobe', 'Создавайте изображения, редактируйте видео и PDF', '#ff0000', 'Ae'),
            p('tldraw', 'tldraw', 'Совместно создавайте диаграммы и схемы', '#fbbf24', 'td'),
            p('canva', 'Canva', 'Дизайн, презентации и визуальный контент', '#00c4cc', 'C'),
            p('figma', 'Figma', 'Макеты, прототипы и UI-кит', '#a259ff', 'F'),
            p('shopify', 'Shopify', 'Создавайте и управляйте интернет-магазином', '#96bf48', 'S'),
            p('magicpath', 'MagicPath', 'Генерация UI-потоков и прототипов', '#6366f1', 'MP'),
        ],
        more: {
            preview: [
                p('openart', 'OpenArt', '', '#ec4899', 'OA'),
                p('runway', 'Runway', '', '#111827', 'R'),
            ],
            label: 'Показать Adobe, OpenArt и другие',
        },
    },
    {
        id: 'productivity',
        title: 'Производительность',
        items: [
            p('notion', 'Notion', 'Документы, базы и рабочие процессы', '#ffffff', 'N'),
            p('gcal', 'Google Calendar', 'Планируйте встречи и управляйте расписанием', '#4285f4', 'G', true),
            p('dropbox', 'Dropbox', 'Файлы, синхронизация и совместная работа', '#0061ff', 'D'),
            p('ocal', 'Outlook Calendar', 'Календарь и планирование в Microsoft 365', '#0078d4', 'O'),
            p('todoist', 'Todoist', 'Задачи, проекты и напоминания', '#e44332', 'T'),
            p('sharepoint', 'SharePoint', 'Документы и сайты команды', '#038387', 'SP'),
        ],
        more: {
            preview: [
                p('trello', 'Trello', '', '#0079bf', 'Tr'),
                p('asana', 'Asana', '', '#f06a6a', 'A'),
            ],
            label: 'Показать Trello, Asana и другие',
        },
    },
    {
        id: 'comms',
        title: 'Коммуникации',
        items: [
            p('outlook', 'Outlook Email', 'Почта, черновики и резюме переписки', '#0078d4', 'O'),
            p('slack', 'Slack', 'Сообщения, каналы и уведомления команды', '#4a154b', '#'),
            p('teams', 'Teams', 'Чаты, звонки и совместная работа', '#6264a7', 'T'),
            p('hostinger', 'Hostinger Mail', 'Управление почтой и доменами', '#673de6', 'H'),
            p('zoom', 'Zoom', 'Встречи, записи и транскрипции', '#2d8cff', 'Z'),
            p('mailopoly', 'Mailopoly Inbox', 'Умный inbox и автоответы', '#0ea5e9', 'M'),
        ],
        more: {
            preview: [
                p('superhuman', 'Superhuman', '', '#111827', 'SH'),
                p('rhythm', 'Rhythm AI', '', '#8b5cf6', 'R'),
            ],
            label: 'Показать Superhuman Mail, Rhythm AI и другие',
        },
    },
    {
        id: 'creative',
        title: 'Творчество',
        items: [
            p('canva-c', 'Canva', 'Дизайн, брендинг и соцсети', '#00c4cc', 'C'),
            p('product-design', 'Product Design', 'UI/UX и продуктовые макеты', '#f97316', 'PD'),
            p('higgsfield', 'Higgsfield', 'AI-видео и визуальные эффекты', '#111827', 'Hf'),
            p('figma-c', 'Figma', 'Дизайн-системы и handoff', '#a259ff', 'F'),
            p('runway', 'Runway', 'Генерация и монтаж видео', '#111827', 'R'),
            p('creative-prod', 'Creative Production', 'Продакшн контента под ключ', '#db2777', 'CP'),
        ],
        more: {
            preview: [
                p('adobe-c', 'Adobe', '', '#ff0000', 'Ae'),
                p('openart-c', 'OpenArt', '', '#ec4899', 'OA'),
            ],
            label: 'Показать Adobe, OpenArt и другие',
        },
    },
    {
        id: 'devtools',
        title: 'Инструменты разработчика',
        items: [
            p('vercel', 'Vercel', 'Сборка и деплой веб-приложений и агентов', '#000000', 'V'),
            p('lovable', 'Lovable', 'Full-stack приложения через чат', '#ec4899', 'L'),
            p('base44', 'Base44', 'Создавайте сайты и приложения с AI', '#2563eb', 'B'),
            p('remote-desk', 'Remote Desktop Commander', 'Автоматизация и удалённая разработка', '#475569', 'RD'),
            p('exa', 'Exa', 'Веб-поиск для AI-агентов', '#1e293b', 'E'),
            p('replit', 'Replit', 'Превращайте идеи в рабочие приложения', '#f26207', 'Re'),
        ],
        more: {
            preview: [
                p('appdeploy', 'AppDeploy', '', '#059669', 'AD'),
                p('neon', 'Neon', '', '#00e599', 'Ne'),
            ],
            label: 'Показать AppDeploy, Neon и другие',
        },
    },
    {
        id: 'health',
        title: 'Здравоохранение',
        items: [
            p('coros', 'COROS', 'Тренировки и аналитика здоровья', '#111827', 'CO'),
            p('garmin-ai', 'Fitness AI Connector', 'AI-тренер для данных Garmin', '#007cc3', 'G'),
            p('tredict', 'Tredict', 'Анализ тренировок и планы', '#22c55e', 'Tr'),
            p('calorie', 'Calorie Tracker', 'Учёт питания и калорий', '#f59e0b', 'CT'),
            p('freddy', 'freddy', 'Вопросы о ваших медицинских данных', '#06b6d4', 'Fr'),
            p('caliber', 'Caliber', 'Анализ фитнес-данных и прогресса', '#ef4444', 'Ca'),
        ],
        more: {
            preview: [
                p('mfp', 'MyFitnessPal', '', '#0072ce', 'MF'),
                p('fitai', 'FitAI Pro', '', '#10b981', 'FP'),
            ],
            label: 'Показать MyFitnessPal, FitAI Pro и другие',
        },
    },
    {
        id: 'finance',
        title: 'Финансы',
        items: [
            p('equity', 'Public Equity Investing', 'Исследование публичных акций', '#1d4ed8', 'PE'),
            p('ibkr', 'Interactive Brokers', 'Анализ глобальных рынков', '#c8102e', 'IB'),
            p('binance', 'Binance', 'Криптовалюты и торговые данные', '#f3ba2f', 'Bi'),
            p('stripe', 'Stripe', 'Платежи, подписки и финансы', '#635bff', 'St'),
            p('longbridge', 'Longbridge', 'Инвестиции и портфель', '#ff6b00', 'LB'),
            p('iol', 'IOL invertironline', 'Брокер и аналитика рынков', '#0057a8', 'IOL'),
        ],
        more: {
            preview: [
                p('foreflight', 'ForeFlight', '', '#003366', 'FF'),
                p('edreams', 'eDreams', '', '#ff6600', 'eD'),
            ],
            label: 'Показать ForeFlight Mobile, eDreams и другие',
        },
    },
    {
        id: 'travel',
        title: 'Путешествия',
        items: [
            p('booking', 'Booking.com', 'Отели, жильё и лучшие предложения', '#003580', 'B'),
            p('skyscanner', 'Skyscanner', 'Поиск дешёвых авиабилетов', '#0770e3', 'Sk'),
            p('tripcom', 'Trip.com', 'Поездки, отели и туры', '#287dfa', 'TC'),
            p('wikiloc', 'Wikiloc', 'Маршруты для пеших и вело походов', '#84cc16', 'Wk'),
            p('flightnet', 'Flight Network', 'Авиабилеты и перелёты', '#0ea5e9', 'FN'),
            p('tripadvisor', 'Tripadvisor', 'Отзывы, отели и достопримечательности', '#34e0a1', 'TA'),
        ],
        more: {
            preview: [
                p('foreflight-t', 'ForeFlight', '', '#003366', 'FF'),
                p('edreams-t', 'eDreams', '', '#ff6600', 'eD'),
            ],
            label: 'Показать ForeFlight Mobile, eDreams и другие',
        },
    },
    {
        id: 'entertainment',
        title: 'Развлечения',
        items: [
            p('spotify', 'Spotify', 'Музыка и подкасты для вас', '#1db954', 'Sp'),
            p('apple-music', 'Apple Music', 'Плейлисты и поиск музыки', '#fa243c', 'AM'),
            p('chessy', 'Chessy', 'Играйте в шахматы с ChatGPT', '#787c40', 'Ch'),
            p('smart-chess', 'Smart Chess', 'Тренировки, стратегия и партии', '#a16207', 'SC'),
            p('destiny-astro', 'Destiny AI Astrology', 'Нatal charts и гороскопы', '#7c3aed', 'DA'),
            p('shazam', 'Shazam', 'Определяйте песни мгновенно', '#0088ff', 'Sh'),
        ],
        more: {
            preview: [
                p('soundbreak', 'SoundBreak', '', '#111827', 'SB'),
                p('ticketmaster', 'Ticketmaster', '', '#026cdf', 'TM'),
            ],
            label: 'Показать SoundBreak, Ticketmaster и другие',
        },
    },
    {
        id: 'education',
        title: 'Образование',
        items: [
            p('consensus', 'Consensus', 'Научные исследования и статьи', '#2563eb', 'Co'),
            p('zotero', 'Zotero', 'Поиск статей и цитирование', '#cc2936', 'Zo'),
            p('scispace', 'SciSpace', 'Для науки и исследований', '#6366f1', 'SS'),
            p('sider', 'Sider Scholar', '350M+ статей, сохранение и чат', '#0ea5e9', 'Si'),
            p('acumen', 'Acumen by Talarion', 'Актуальные знания для AI', '#14b8a6', 'Ac'),
            p('scite', 'Scite', 'Поиск научной литературы', '#1f2937', 'Sc'),
        ],
        more: {
            preview: [
                p('tarteel', 'Tarteel', '', '#059669', 'Ta'),
                p('wolfram', 'Wolfram', '', '#dd1100', 'Wf'),
            ],
            label: 'Показать Tarteel, Wolfram и другие',
        },
    },
    {
        id: 'business',
        title: 'Бизнес и операции',
        items: [
            p('shopify-b', 'Shopify', 'Создавайте и управляйте магазином', '#96bf48', 'S'),
            p('hubspot', 'HubSpot', 'CRM, маркетинг и аналитика', '#ff7a59', 'HS'),
            p('apollo', 'Apollo.io', 'Поиск клиентов и сделки', '#ffff00', 'Ap'),
            p('vidiq', 'vidIQ', 'Рост на YouTube, IG и TikTok', '#007aff', 'vQ'),
            p('wix', 'Wix', 'Создайте свой сайт', '#0c6efc', 'Wx'),
            p('indeed', 'Indeed Job Search', 'Вакансии под ваш профиль', '#2164f3', 'In'),
        ],
        more: {
            preview: [
                p('windsor', 'Windsor.ai', '', '#111827', 'Wi'),
                p('ads-mgr', 'Ads Manager', '', '#3b82f6', 'AM'),
            ],
            label: 'Показать Windsor.ai, ChatGPT Ads Manager и другие',
        },
    },
    {
        id: 'analytics',
        title: 'Данные и аналитика',
        items: [
            p('data', 'Data', 'Ответы на вопросы с помощью данных', '#111827', 'Da'),
            p('helium', 'Helium 10', 'Доступ к данным Helium 10', '#ff9900', 'He'),
            p('amplitude', 'Amplitude', 'Аналитика продукта', '#1f77ff', 'Am'),
            p('posthog', 'PostHog', 'Продуктовая аналитика и фичи', '#f9bd2b', 'PH'),
            p('blockscout', 'Blockscout', 'Поиск и анализ блокчейн-данных', '#6b46c1', 'BS'),
            p('mixpanel', 'Mixpanel', 'Запросы и анализ Mixpanel', '#7856ff', 'Mx'),
        ],
        more: {
            preview: [
                p('waldo', 'Waldo', '', '#2563eb', 'Wa'),
                p('motherduck', 'MotherDuck', '', '#ff9900', 'MD'),
            ],
            label: 'Показать Waldo, MotherDuck и другие',
        },
    },
    {
        id: 'science',
        title: 'Научные исследования',
        items: [
            p('undermind', 'Undermind', 'Поиск и чтение научных статей', '#2563eb', 'U'),
            p('ngs', 'NGS Analysis Workbench', 'Анализ геномных данных', '#059669', 'NG'),
            p('research-ai', 'Research AI', 'Сводки и гипотезы по статьям', '#7c3aed', 'RA'),
            p('paperpal', 'Paperpal', 'Редактирование научных текстов', '#ec4899', 'PP'),
            p('connected-papers', 'Connected Papers', 'Граф связанных публикаций', '#0891b2', 'CP'),
            p('semantic', 'Semantic Scholar', 'Семантический поиск статей', '#1857a4', 'SS'),
        ],
        more: {
            preview: [
                p('arxiv', 'arXiv', '', '#b31b1b', 'ar'),
                p('pubmed', 'PubMed', '', '#326599', 'PM'),
            ],
            label: 'Показать arXiv, PubMed и другие',
        },
    },
    {
        id: 'security',
        title: 'Безопасность',
        items: [
            p('codex-sec', 'Codex Security', 'Аудит кода и уязвимостей', '#111827', 'CS'),
            p('snyk', 'Snyk', 'Сканирование зависимостей', '#4c4a73', 'Sy'),
            p('vault', 'Vault Scanner', 'Проверка секретов в репозиториях', '#f59e0b', 'Vs'),
            p('owasp', 'OWASP Guide', 'Рекомендации по безопасности', '#000000', 'OW'),
            p('pentest', 'Pentest Copilot', 'Сценарии тестирования на проникновение', '#dc2626', 'PC'),
            p('guardian', 'Guardian AI', 'Мониторинг инцидентов', '#0284c7', 'GA'),
        ],
        more: {
            preview: [
                p('crowdstrike', 'CrowdStrike', '', '#e01e26', 'CR'),
                p('1password', '1Password', '', '#0094f5', '1P'),
            ],
            label: 'Показать CrowdStrike, 1Password и другие',
        },
    },
    {
        id: 'other',
        title: 'Другое',
        items: [
            p('tarot', 'Tarot', 'Гадание и таро-расклады', '#7c3aed', 'Ta'),
            p('steer-astro', 'Steer Astro', 'Персональный AI-астrolog', '#6366f1', 'SA'),
            p('ask-tarot', 'Ask Tarot Cards', 'Чтение карт таро', '#a855f7', 'AT'),
            p('linkedin', 'LinkedIn', 'Поиск специалистов и контактов', '#0a66c2', 'Li'),
            p('etsy', 'Etsy', 'Handmade, декор и подарки', '#f56400', 'Et'),
            p('kleinanzeigen', 'Kleinanzeigen', 'Объявления и сделки', '#86b817', 'Kl'),
        ],
        more: {
            preview: [
                p('astrologic', 'Astrologic', '', '#8b5cf6', 'As'),
                p('astroscope', 'Astro Scope', '', '#ec4899', 'AS'),
            ],
            label: 'Показать Astrologic, The Astro Scope Horoscope и другие',
        },
    },
];

export function getAllCatalogPlugins() {
    const map = new Map();
    SKILLMATE_PLUGIN_CATALOG.forEach(section => {
        section.items.forEach(item => {
            if (!map.has(item.id)) map.set(item.id, item);
        });
    });
    SKILLMATE_PLUGINS_INSTALLED.forEach(item => {
        if (!map.has(item.id)) map.set(item.id, item);
    });
    return [...map.values()];
}
