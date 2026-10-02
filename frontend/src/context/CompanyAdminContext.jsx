import React, {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
} from 'react';
import {
    APPLICANT_STATUSES,
    COMPANY_ACTIVITIES,
    COMPANY_ANALYTICS_TRENDS,
    COMPANY_APPLICANT_NOTES,
    COMPANY_APPLICANTS,
    COMPANY_BILLING,
    COMPANY_DEALS,
    COMPANY_MESSAGE_THREADS,
    COMPANY_MESSAGES,
    COMPANY_TEAM,
    DEMO_COMPANY,
    MESSAGE_TEMPLATES,
    getCompanyTasksFromCatalog,
    getNextStatus,
    getPrevStatus,
} from '../data/companyAdminData';

const STORAGE_KEY = 'skillgit-company-admin';

function loadStored() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

function formatNow() {
    return new Date().toLocaleString('ru-RU', {
        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
    });
}

const CompanyAdminContext = createContext(null);

export function CompanyAdminProvider({ children }) {
    const stored = loadStored();

    const [customTasks, setCustomTasks] = useState(stored?.customTasks ?? []);
    const [applicants, setApplicants] = useState(stored?.applicants ?? COMPANY_APPLICANTS);
    const [applicantNotes, setApplicantNotes] = useState(stored?.applicantNotes ?? COMPANY_APPLICANT_NOTES);
    const [deals, setDeals] = useState(stored?.deals ?? COMPANY_DEALS);
    const [activities, setActivities] = useState(stored?.activities ?? COMPANY_ACTIVITIES);
    const [team, setTeam] = useState(stored?.team ?? COMPANY_TEAM);
    const [messages, setMessages] = useState(stored?.messages ?? COMPANY_MESSAGES);
    const [threads, setThreads] = useState(stored?.threads ?? COMPANY_MESSAGE_THREADS);
    const [billing, setBilling] = useState(stored?.billing ?? COMPANY_BILLING);
    const [company, setCompany] = useState(stored?.company ?? DEMO_COMPANY);
    const [crmSearch, setCrmSearch] = useState('');

    const persist = useCallback((patch) => {
        const current = loadStored() ?? {};
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, ...patch }));
    }, []);

    const logActivity = useCallback((entry) => {
        const item = { id: Date.now(), time: 'только что', ...entry };
        setActivities(prev => {
            const next = [item, ...prev].slice(0, 50);
            persist({ activities: next });
            return next;
        });
    }, [persist]);

    const tasks = useMemo(() => {
        const catalog = getCompanyTasksFromCatalog(company.name);
        const merged = [...customTasks, ...catalog.filter(
            ct => !customTasks.some(t => t.id === ct.id),
        )];
        return merged.sort((a, b) => (b.id ?? 0) - (a.id ?? 0));
    }, [company.name, customTasks]);

    const stats = useMemo(() => {
        const pipeline = APPLICANT_STATUSES.filter(s => s.id !== 'rejected').map(st => ({
            ...st,
            count: applicants.filter(a => a.status === st.id).length,
        }));
        return {
            activeTasks: tasks.filter(t => t.status !== 'closed' && t.status !== 'draft').length,
            draftTasks: tasks.filter(t => t.status === 'draft').length,
            totalApplicants: applicants.length,
            newApplicants: applicants.filter(a => a.status === 'new').length,
            inInterview: applicants.filter(a => a.status === 'interview').length,
            hired: applicants.filter(a => a.status === 'hired').length,
            activeDeals: deals.filter(d => d.status === 'active').length,
            unreadMessages: messages.reduce((s, m) => s + (m.unread ?? 0), 0),
            balance: company.balance,
            conversion: applicants.length
                ? Math.round((applicants.filter(a => a.status === 'hired').length / applicants.length) * 100)
                : 0,
            pipeline,
            trends: COMPANY_ANALYTICS_TRENDS,
        };
    }, [tasks, applicants, deals, messages, company.balance]);

    const filteredApplicants = useMemo(() => {
        const q = crmSearch.trim().toLowerCase();
        if (!q) return applicants;
        return applicants.filter(a =>
            a.userName.toLowerCase().includes(q) ||
            a.username.toLowerCase().includes(q) ||
            a.taskTitle.toLowerCase().includes(q) ||
            a.skills?.some(s => s.toLowerCase().includes(q)),
        );
    }, [applicants, crmSearch]);

    const createTask = useCallback((payload) => {
        const task = {
            id: Date.now(),
            company: company.name,
            companyColor: company.color,
            direction: payload.direction,
            badge: { text: payload.status === 'draft' ? 'Черновик' : 'Новое', kind: 'new' },
            verified: company.verified,
            highPay: Number(payload.price) >= 15000,
            title: payload.title,
            desc: payload.desc,
            fullDesc: payload.fullDesc || payload.desc,
            tags: payload.tags ?? [],
            price: Number(payload.price),
            priceLabel: `${Number(payload.price).toLocaleString('ru-RU')} ₽`,
            days: Number(payload.days),
            daysLabel: `${payload.days} дн.`,
            applicants: 0,
            level: payload.level || 'junior',
            postedAt: 'только что',
            status: payload.status || 'published',
            statusLabel: payload.status === 'draft' ? 'Черновик' : 'Опубликовано',
            views: 0,
            conversions: 0,
            source: 'custom',
            assigneeId: payload.assigneeId ?? 1,
        };
        setCustomTasks(prev => {
            const next = [task, ...prev];
            persist({ customTasks: next });
            return next;
        });
        logActivity({ type: 'task', text: `Создано задание «${task.title}»`, actor: 'HR' });
        return task;
    }, [company, persist, logActivity]);

    const updateTask = useCallback((taskId, patch) => {
        setCustomTasks(prev => {
            const next = prev.map(t => (t.id === taskId ? { ...t, ...patch } : t));
            persist({ customTasks: next });
            return next;
        });
    }, [persist]);

    const closeTask = useCallback((taskId) => {
        updateTask(taskId, { status: 'closed', statusLabel: 'Закрыто' });
        logActivity({ type: 'task', text: 'Задание закрыто', actor: 'HR' });
    }, [updateTask, logActivity]);

    const pauseTask = useCallback((taskId) => {
        updateTask(taskId, { status: 'paused', statusLabel: 'На паузе' });
    }, [updateTask]);

    const publishTask = useCallback((taskId) => {
        updateTask(taskId, { status: 'published', statusLabel: 'Опубликовано' });
    }, [updateTask]);

    const updateApplicantStatus = useCallback((applicantId, status) => {
        setApplicants(prev => {
            const target = prev.find(a => a.id === applicantId);
            const next = prev.map(a => (a.id === applicantId ? { ...a, status } : a));
            persist({ applicants: next });
            if (target) {
                logActivity({
                    type: 'status',
                    text: `${target.userName} → «${APPLICANT_STATUSES.find(s => s.id === status)?.label}»`,
                    actor: 'CRM',
                });
            }
            return next;
        });
    }, [persist, logActivity]);

    const moveApplicantNext = useCallback((applicantId) => {
        const applicant = applicants.find(a => a.id === applicantId);
        if (!applicant) return;
        const next = getNextStatus(applicant.status);
        if (next && next !== 'rejected') updateApplicantStatus(applicantId, next);
    }, [applicants, updateApplicantStatus]);

    const moveApplicantPrev = useCallback((applicantId) => {
        const applicant = applicants.find(a => a.id === applicantId);
        if (!applicant) return;
        const prev = getPrevStatus(applicant.status);
        if (prev) updateApplicantStatus(applicantId, prev);
    }, [applicants, updateApplicantStatus]);

    const assignApplicant = useCallback((applicantId, assigneeId) => {
        setApplicants(prev => {
            const next = prev.map(a => (a.id === applicantId ? { ...a, assigneeId } : a));
            persist({ applicants: next });
            return next;
        });
    }, [persist]);

    const addApplicantNote = useCallback((applicantId, text, author = 'Мария Н.') => {
        const note = { id: Date.now(), author, text, date: formatNow() };
        setApplicantNotes(prev => {
            const next = { ...prev, [applicantId]: [...(prev[applicantId] ?? []), note] };
            persist({ applicantNotes: next });
            return next;
        });
    }, [persist]);

    const createDealFromApplicant = useCallback((applicantId, amount) => {
        const applicant = applicants.find(a => a.id === applicantId);
        if (!applicant) return null;
        updateApplicantStatus(applicantId, 'hired');
        const deal = {
            id: Date.now(),
            applicantId,
            taskId: applicant.taskId,
            taskTitle: applicant.taskTitle,
            candidateName: applicant.userName,
            username: applicant.username,
            amount: Number(amount),
            paid: 0,
            status: 'active',
            progress: 0,
            deadline: '—',
            milestone: 'Старт работы',
            createdAt: formatNow(),
        };
        setDeals(prev => {
            const next = [deal, ...prev];
            persist({ deals: next });
            return next;
        });
        logActivity({ type: 'deal', text: `Сделка с ${applicant.userName} на ${amount.toLocaleString('ru-RU')} ₽`, actor: 'HR' });
        return deal;
    }, [applicants, updateApplicantStatus, persist, logActivity]);

    const payDeal = useCallback((dealId, amount) => {
        setDeals(prev => {
            const next = prev.map(d => {
                if (d.id !== dealId) return d;
                const paid = d.paid + amount;
                const progress = Math.min(100, Math.round((paid / d.amount) * 100));
                return {
                    ...d,
                    paid,
                    progress,
                    status: paid >= d.amount ? 'completed' : d.status,
                };
            });
            persist({ deals: next });
            return next;
        });
        setCompany(prev => {
            const next = { ...prev, balance: prev.balance - amount };
            persist({ company: next });
            return next;
        });
        const entry = {
            id: Date.now(),
            date: formatNow(),
            title: `Выплата по сделке #${dealId}`,
            amount: -amount,
            type: 'payout',
            dealId,
        };
        setBilling(prev => {
            const next = [entry, ...prev];
            persist({ billing: next });
            return next;
        });
        logActivity({ type: 'deal', text: `Выплата ${amount.toLocaleString('ru-RU')} ₽ по сделке`, actor: 'Финансы' });
    }, [persist, logActivity]);

    const sendCompanyMessage = useCallback((threadId, text) => {
        const entry = { id: Date.now(), from: 'me', text, time: 'сейчас' };
        setThreads(prev => {
            const next = { ...prev, [threadId]: [...(prev[threadId] ?? []), entry] };
            persist({ threads: next });
            return next;
        });
        setMessages(prev => {
            const next = prev.map(m =>
                m.id === threadId ? { ...m, lastMessage: text, time: 'сейчас', unread: 0 } : m,
            );
            persist({ messages: next });
            return next;
        });
    }, [persist]);

    const markThreadRead = useCallback((threadId) => {
        setMessages(prev => {
            const next = prev.map(m => (m.id === threadId ? { ...m, unread: 0 } : m));
            persist({ messages: next });
            return next;
        });
    }, [persist]);

    const togglePinThread = useCallback((threadId) => {
        setMessages(prev => {
            const next = prev.map(m =>
                m.id === threadId ? { ...m, pinned: !m.pinned } : m,
            );
            persist({ messages: next });
            return next;
        });
    }, [persist]);

    const addTeamMember = useCallback((member) => {
        setTeam(prev => {
            const next = [...prev, { ...member, id: Date.now(), active: true, permissions: ['applicants', 'messages'] }];
            persist({ team: next });
            return next;
        });
    }, [persist]);

    const removeTeamMember = useCallback((memberId) => {
        setTeam(prev => {
            const next = prev.filter(m => m.id !== memberId);
            persist({ team: next });
            return next;
        });
    }, [persist]);

    const updateCompany = useCallback((patch) => {
        setCompany(prev => {
            const next = { ...prev, ...patch };
            persist({ company: next });
            return next;
        });
    }, [persist]);

    const topUpBalance = useCallback((amount) => {
        setCompany(prev => {
            const next = { ...prev, balance: prev.balance + amount };
            persist({ company: next });
            return next;
        });
        const entry = {
            id: Date.now(),
            date: formatNow(),
            title: 'Пополнение баланса компании',
            amount,
            type: 'topup',
        };
        setBilling(prev => {
            const next = [entry, ...prev];
            persist({ billing: next });
            return next;
        });
    }, [persist]);

    const value = useMemo(() => ({
        company,
        tasks,
        applicants,
        filteredApplicants,
        applicantNotes,
        deals,
        activities,
        team,
        messages,
        threads,
        billing,
        stats,
        crmSearch,
        setCrmSearch,
        messageTemplates: MESSAGE_TEMPLATES,
        createTask,
        updateTask,
        closeTask,
        pauseTask,
        publishTask,
        updateApplicantStatus,
        moveApplicantNext,
        moveApplicantPrev,
        assignApplicant,
        addApplicantNote,
        createDealFromApplicant,
        payDeal,
        sendCompanyMessage,
        markThreadRead,
        togglePinThread,
        addTeamMember,
        removeTeamMember,
        updateCompany,
        topUpBalance,
        logActivity,
    }), [
        company, tasks, applicants, filteredApplicants, applicantNotes, deals, activities,
        team, messages, threads, billing, stats, crmSearch,
        createTask, updateTask, closeTask, pauseTask, publishTask,
        updateApplicantStatus, moveApplicantNext, moveApplicantPrev, assignApplicant,
        addApplicantNote, createDealFromApplicant, payDeal,
        sendCompanyMessage, markThreadRead, togglePinThread,
        addTeamMember, removeTeamMember, updateCompany, topUpBalance, logActivity,
    ]);

    return (
        <CompanyAdminContext.Provider value={value}>
            {children}
        </CompanyAdminContext.Provider>
    );
}

export function useCompanyAdmin() {
    const ctx = useContext(CompanyAdminContext);
    if (!ctx) throw new Error('useCompanyAdmin must be used within CompanyAdminProvider');
    return ctx;
}
