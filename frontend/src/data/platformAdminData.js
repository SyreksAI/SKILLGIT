import { TASKS } from './mockData';
import { COMPANY_REGISTRY } from './companyAdminData';

export const PLATFORM_STATS = {
    usersTotal: 12847,
    companies: 342,
    activeTasks: 891,
    monthlyRevenue: 2840000,
    pendingVerifications: 12,
    openReports: 5,
    gmv: 18400000,
    avgTaskPrice: 12400,
};

export const PLATFORM_USERS = [
    { id: 1, name: 'Иван Иванов', username: 'ivan-ivanov', email: 'ivan.ivanov@mail.ru', role: 'student', direction: 'dev', rating: 4.8, tasksDone: 12, status: 'active', joined: 'Сен 2025', balance: 32500, reports: 0, lastActive: '2 мин назад' },
    { id: 2, name: 'Анна Петрова', username: 'anna-p', email: 'anna@mail.ru', role: 'student', direction: 'design', rating: 4.6, tasksDone: 8, status: 'active', joined: 'Авг 2025', balance: 18200, reports: 0, lastActive: '1 ч назад' },
    { id: 3, name: 'Дмитрий К.', username: 'dmitry-k', email: 'd.k@mail.ru', role: 'student', direction: 'ai', rating: 4.3, tasksDone: 5, status: 'active', joined: 'Июл 2025', balance: 9100, reports: 1, lastActive: '3 ч назад' },
    { id: 4, name: 'Ольга Кузнецова', username: 'olga-k', email: 'olga.k@yandex.ru', role: 'company', direction: 'rpo', rating: null, tasksDone: 0, status: 'active', joined: 'Мар 2025', balance: 0, reports: 0, lastActive: '30 мин назад' },
    { id: 5, name: 'Спамер123', username: 'spam-user', email: 'spam@test.ru', role: 'student', direction: 'dev', rating: 2.1, tasksDone: 0, status: 'blocked', joined: 'Сен 2026', balance: 0, reports: 4, lastActive: '2 дня назад' },
    { id: 6, name: 'Максим Орлов', username: 'max-o', email: 'max@mail.ru', role: 'student', direction: 'dev', rating: 4.2, tasksDone: 6, status: 'active', joined: 'Июн 2025', balance: 15600, reports: 0, lastActive: '5 ч назад' },
    { id: 7, name: 'Елена Д.', username: 'elena-d', email: 'elena.d@mail.ru', role: 'student', direction: 'dev', rating: 4.7, tasksDone: 9, status: 'active', joined: 'Май 2025', balance: 22100, reports: 0, lastActive: '20 мин назад' },
    { id: 8, name: 'Кирилл М.', username: 'kirill-m', email: 'kirill@mail.ru', role: 'student', direction: 'dev', rating: 4.6, tasksDone: 4, status: 'active', joined: 'Авг 2026', balance: 6800, reports: 0, lastActive: '1 день назад' },
];

export const PLATFORM_COMPANIES = COMPANY_REGISTRY.map((company, index) => ({
    ...company,
    tasksCount: TASKS.filter(t => t.company === company.name).length,
    totalSpent: [890000, 420000, 1200000, 310000, 560000, 780000][index] ?? 100000,
    status: company.verified ? 'verified' : 'pending',
    contact: `hr@${company.slug}.ru`,
    managers: [4, 2, 6, 1, 3, 2][index] ?? 2,
    activeDeals: [12, 5, 18, 2, 8, 6][index] ?? 3,
    rating: [4.9, 4.7, 4.8, 3.2, 4.6, 4.9][index] ?? 4.5,
}));

export const PLATFORM_TASKS = TASKS.map((task, index) => ({
    ...task,
    moderationStatus: index === 3 ? 'pending' : index === 4 ? 'flagged' : 'approved',
    reports: index === 4 ? 2 : 0,
    views: task.applicants * 15 + 20,
    platformId: `T-${1000 + task.id}`,
}));

export const PLATFORM_TRANSACTIONS = [
    { id: 1, date: '30 сен 2026', user: 'Иван Иванов', company: 'Яндекс', type: 'payout', amount: 15000, status: 'completed', fee: 750 },
    { id: 2, date: '29 сен 2026', user: '—', company: 'VK', type: 'topup', amount: 200000, status: 'completed', fee: 0 },
    { id: 3, date: '28 сен 2026', user: 'Анна Петрова', company: 'Сбер', type: 'payout', amount: 8000, status: 'completed', fee: 400 },
    { id: 4, date: '28 сен 2026', user: '—', company: '—', type: 'fee', amount: 400, status: 'completed', fee: 0 },
    { id: 5, date: '27 сен 2026', user: 'Дмитрий К.', company: 'Ozon', type: 'payout', amount: 5000, status: 'pending', fee: 250 },
    { id: 6, date: '26 сен 2026', user: '—', company: 'Tinkoff', type: 'topup', amount: 50000, status: 'completed', fee: 0 },
    { id: 7, date: '25 сен 2026', user: 'Елена Д.', company: 'Яндекс', type: 'payout', amount: 7500, status: 'completed', fee: 375 },
    { id: 8, date: '24 сен 2026', user: 'Максим Орлов', company: 'Kaspersky Lab', type: 'payout', amount: 18000, status: 'completed', fee: 900 },
];

export const PLATFORM_REPORTS = [
    { id: 1, type: 'spam', target: 'spam-user', reporter: 'anna-p', text: 'Спам в чате задачи', status: 'open', date: '30 сен 2026', priority: 'high' },
    { id: 2, type: 'task', target: 'task-99', reporter: 'ivan-ivanov', text: 'Подозрительное задание без описания', status: 'open', date: '29 сен 2026', priority: 'medium' },
    { id: 3, type: 'company', target: 'unknown-co', reporter: 'max-o', text: 'Фейковая компания', status: 'review', date: '28 сен 2026', priority: 'high' },
    { id: 4, type: 'payment', target: 'tx-441', reporter: 'system', text: 'Несоответствие суммы выплаты', status: 'resolved', date: '25 сен 2026', priority: 'low' },
    { id: 5, type: 'user', target: 'bad-user', reporter: 'olga-k', text: 'Оскорбления в переписке', status: 'open', date: '24 сен 2026', priority: 'medium' },
];

export const PLATFORM_ACTIVITIES = [
    { id: 1, type: 'user', text: 'Новая регистрация: kirill-m', time: '5 мин назад', severity: 'info' },
    { id: 2, type: 'task', text: 'AI Startup опубликовала задачу на 10 000 ₽', time: '18 мин назад', severity: 'info' },
    { id: 3, type: 'report', text: 'Жалоба на spam-user (спам в чате)', time: '42 мин назад', severity: 'warning' },
    { id: 4, type: 'payment', text: 'Выплата 15 000 ₽ → Иван Иванов / Яндекс', time: '1 ч назад', severity: 'success' },
    { id: 5, type: 'company', text: 'Tinkoff запросила верификацию', time: '2 ч назад', severity: 'warning' },
    { id: 6, type: 'system', text: 'Комиссия 5% начислена по 12 транзакциям', time: '3 ч назад', severity: 'info' },
    { id: 7, type: 'moderation', text: 'Задача T-1004 помечена для проверки', time: '5 ч назад', severity: 'warning' },
    { id: 8, type: 'user', text: 'Пользователь spam-user заблокирован автоматически', time: '1 день назад', severity: 'danger' },
];

export const PLATFORM_ANALYTICS = {
    revenue: [2100000, 2250000, 2180000, 2400000, 2520000, 2610000, 2480000, 2720000, 2840000, 2910000, 2780000, 2840000],
    users: [8200, 8450, 8700, 9100, 9400, 9800, 10100, 10500, 11000, 11500, 12200, 12847],
    tasks: [620, 645, 680, 710, 735, 760, 790, 820, 850, 870, 885, 891],
    conversion: [11.2, 11.8, 12.1, 11.5, 12.4, 12.9, 12.2, 13.1, 12.8, 13.4, 13.0, 13.2],
    labels: ['Ноя', 'Дек', 'Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт'],
};

export const PLATFORM_SETTINGS_DEFAULT = {
    commissionRate: 5,
    minTaskPrice: 1000,
    maxTaskPrice: 500000,
    autoVerifyCompanies: false,
    maintenanceMode: false,
    supportEmail: 'support@skillgit.ru',
    autoBlockSpam: true,
    requireCompanyKyc: true,
};

export const PLATFORM_ADMIN = {
    name: 'Admin SKILLGIT',
    email: 'admin@skillgit.ru',
    role: 'Super Admin',
};
