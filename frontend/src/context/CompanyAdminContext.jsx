import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';
import { useAuth } from './AuthContext';
import { api } from '../services/api';
import {
    APPLICANT_STATUSES,
    MESSAGE_TEMPLATES,
    getNextStatus,
    getPrevStatus,
} from '../data/companyAdminData';

const STORAGE_KEY = 'skillgit-company-admin';

function loadStored(key) {
    try {
        const raw = localStorage.getItem(key);
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
    const { user, accessToken } = useAuth();
    const storageKey = `${STORAGE_KEY}:${user?.id ?? 'guest'}`;
    const [stored] = useState(() => loadStored(storageKey));

    const [customTasks, setCustomTasks] = useState([]);
    const [applicants, setApplicants] = useState([]);
    const [applicantAssignees, setApplicantAssignees] = useState({});
    const [applicantNotes, setApplicantNotes] = useState({});
    const [deals, setDeals] = useState([]);
    const [activities, setActivities] = useState([]);
    const [team, setTeam] = useState([]);
    const [messages, setMessages] = useState([]);
    const [threads, setThreads] = useState({});
    const [billing, setBilling] = useState([]);
    const [workspaceReady, setWorkspaceReady] = useState(false);
    const [workspaceLoading, setWorkspaceLoading] = useState(false);
    const [workspaceError, setWorkspaceError] = useState('');
    const [workspaceReloadKey, setWorkspaceReloadKey] = useState(0);
    const reloadWorkspace = useCallback(() => setWorkspaceReloadKey(key => key + 1), []);
    const [company, setCompany] = useState(() => ({
        id: user?.id ?? 'company',
        name: user?.name ?? 'Моя компания',
        color: '#3b82f6',
        industry: '',
        verified: false,
        plan: 'Free',
        balance: 0,
        email: user?.email ?? '',
        website: '',
        description: '',
        managers: 1,
        ...(stored?.company ?? {}),
    }));
    const [crmSearch, setCrmSearch] = useState('');

    const persist = useCallback((patch) => {
        const current = loadStored(storageKey) ?? {};
        localStorage.setItem(storageKey, JSON.stringify({ ...current, ...patch }));
        if (accessToken && user?.accountType === 'customer') {
            return api.updateCompanyWorkspace(patch, accessToken)
                .then(() => null)
                .catch(error => {
                    console.error('Не удалось сохранить данные CRM:', error);
                    return { error };
                });
        }
        return Promise.resolve(null);
    }, [storageKey, accessToken, user?.accountType]);

    useEffect(() => {
        const accountData = loadStored(storageKey) ?? {};
        setCompany(prev => ({
            id: user?.id ?? 'company',
            name: user?.name ?? 'Моя компания',
            color: '#3b82f6',
            industry: '',
            verified: false,
            plan: 'Free',
            balance: 0,
            email: user?.email ?? '',
            website: '',
            description: '',
            managers: 1,
            ...accountData.company,
        }));
        setApplicantNotes(accountData.applicantNotes ?? {});
        setDeals(accountData.deals ?? []);
        setActivities(accountData.activities ?? []);
        setTeam(accountData.team ?? []);
        setMessages(accountData.messages ?? []);
        setThreads(accountData.threads ?? {});
        setBilling(accountData.billing ?? []);
    }, [storageKey, user?.email, user?.name, user?.id]);

    useEffect(() => {
        if (!accessToken || user?.accountType !== 'customer') {
            setCustomTasks([]);
            setApplicants([]);
            setWorkspaceReady(false);
            setWorkspaceLoading(false);
            setWorkspaceError('');
            return undefined;
        }
        let cancelled = false;
        let hasLoaded = false;
        let retryTimer;
        let retryDelay = 2000;
        setWorkspaceReady(false);
        setWorkspaceLoading(true);
        setWorkspaceError('');

        async function refreshWorkspace() {
            try {
                const [nextTasks, applicantsFromApi, workspace] = await Promise.all([
                    api.getCompanyTasks(accessToken),
                    api.getCompanyApplicants(accessToken),
                    api.getCompanyWorkspace(accessToken),
                ]);
                if (cancelled) return;
                const nextApplicants = applicantsFromApi.map(applicant => ({
                    ...applicant,
                    assigneeId: workspace.applicantAssignees?.[applicant.id] ?? applicant.assigneeId,
                }));
                setCustomTasks(nextTasks);
                setApplicants(nextApplicants);
                setApplicantAssignees(workspace.applicantAssignees ?? {});
                setCompany(workspace.company);
                setApplicantNotes(workspace.applicantNotes ?? {});
                setDeals(workspace.deals ?? []);
                setActivities(workspace.activities ?? []);
                setTeam(workspace.team ?? []);
                setMessages(workspace.messages ?? []);
                setThreads(workspace.threads ?? {});
                setBilling(workspace.billing ?? []);
                hasLoaded = true;
                setWorkspaceReady(true);
                setWorkspaceLoading(false);
                setWorkspaceError('');
                retryDelay = 2000;
                window.clearTimeout(retryTimer);
                retryTimer = undefined;
            } catch (error) {
                if (!cancelled) {
                    setWorkspaceError(error.message || 'Не удалось загрузить данные CRM');
                    if (!hasLoaded) setWorkspaceLoading(false);
                }
                throw error;
            }
        }

        let refreshTimer;
        function scheduleRetry() {
            if (cancelled || retryTimer) return;
            retryTimer = window.setTimeout(() => {
                retryTimer = undefined;
                refreshWorkspace().catch(error => {
                    console.error('Не удалось загрузить данные CRM:', error);
                    retryDelay = Math.min(retryDelay * 2, 30000);
                    scheduleRetry();
                });
            }, retryDelay);
        }
        function handleRefreshError(error) {
            console.error('Не удалось обновить CRM:', error);
            scheduleRetry();
        }

        refreshWorkspace().catch(handleRefreshError);
        const scheme = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const socket = new WebSocket(`${scheme}//${window.location.host}/ws/company`);
        socket.addEventListener('open', () => socket.send(JSON.stringify({ token: accessToken })));
        socket.addEventListener('message', () => refreshWorkspace().catch(handleRefreshError));
        refreshTimer = window.setInterval(() => refreshWorkspace().catch(handleRefreshError), 30000);
        return () => {
            cancelled = true;
            window.clearInterval(refreshTimer);
            window.clearTimeout(retryTimer);
            socket.close();
        };
    }, [accessToken, user?.accountType, workspaceReloadKey]);

    const logActivity = useCallback((entry) => {
        const item = { id: Date.now(), time: 'только что', ...entry };
        setActivities(prev => {
            const next = [item, ...prev].slice(0, 50);
            persist({ activities: next });
            return next;
        });
    }, [persist]);

    const tasks = customTasks;

    const stats = useMemo(() => {
        const applicationTrend = Array(12).fill(0);
        const spendTrend = Array(12).fill(0);
        const now = new Date();
        applicants.forEach(applicant => {
            const [day, month, year] = (applicant.appliedAt ?? '').split('.').map(Number);
            const appliedAt = applicant.createdAt
                ? new Date(applicant.createdAt).getTime()
                : day && month && year ? new Date(year, month - 1, day).getTime() : Date.now();
            const createdAt = new Date(Number.isNaN(appliedAt) ? Date.now() : appliedAt);
            const monthsAgo = (now.getFullYear() - createdAt.getFullYear()) * 12
                + now.getMonth() - createdAt.getMonth();
            if (monthsAgo >= 0 && monthsAgo < applicationTrend.length) {
                applicationTrend[applicationTrend.length - monthsAgo - 1] += 1;
            }
        });
        billing.forEach(entry => {
            if (entry.amount >= 0) return;
            const date = entry.createdAt ? new Date(entry.createdAt) : new Date();
            const monthsAgo = (now.getFullYear() - date.getFullYear()) * 12 + now.getMonth() - date.getMonth();
            if (monthsAgo >= 0 && monthsAgo < spendTrend.length) {
                spendTrend[spendTrend.length - monthsAgo - 1] += Math.abs(entry.amount);
            }
        });
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
            activeDeals: deals.filter(d => ['planning', 'active', 'in_review', 'revision'].includes(d.status)).length,
            unreadMessages: messages.reduce((s, m) => s + (m.unread ?? 0), 0),
            balance: company.balance,
            conversion: applicants.length
                ? Math.round((applicants.filter(a => a.status === 'hired').length / applicants.length) * 100)
                : 0,
            pipeline,
            trends: {
                applications: applicationTrend,
                hires: Array(12).fill(0),
                spend: spendTrend,
                conversion: Array(12).fill(0),
            },
        };
    }, [tasks, applicants, deals, messages, billing, company.balance]);

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

    const createTask = useCallback(async (payload) => {
        const task = await api.createCompanyTask({
            ...payload,
            price: Number(payload.price),
            days: Number(payload.days),
        }, accessToken);
        setCustomTasks(prev => [task, ...prev]);
        logActivity({ type: 'task', text: `Создано задание «${task.title}»`, actor: user?.name ?? 'Заказчик' });
        return task;
    }, [accessToken, logActivity, user?.name]);

    const updateTask = useCallback(async (taskId, patch) => {
        const updated = await api.updateCompanyTask(taskId, patch.status, accessToken);
        setCustomTasks(prev => prev.map(task => task.id === updated.id ? updated : task));
        return updated;
    }, [accessToken]);

    const closeTask = useCallback((taskId) => {
        updateTask(taskId, { status: 'closed' }).catch(error => console.error(error));
    }, [updateTask]);

    const pauseTask = useCallback((taskId) => {
        updateTask(taskId, { status: 'paused' }).catch(error => console.error(error));
    }, [updateTask]);

    const publishTask = useCallback((taskId) => {
        updateTask(taskId, { status: 'published' }).catch(error => console.error(error));
    }, [updateTask]);

    const updateApplicantStatus = useCallback(async (applicantId, status) => {
        let updated;
        try {
            updated = await api.updateCompanyApplicant(applicantId, status, accessToken);
        } catch (error) {
            console.error('Не удалось обновить этап отклика:', error);
            return;
        }
        setApplicants(prev => {
            return prev.map(a => (a.id === applicantId ? updated : a));
        });
    }, [accessToken]);

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
        api.updateCompanyApplicant(applicantId, { assigneeId }, accessToken)
            .catch(error => console.error('Не удалось назначить ответственного:', error));
        setApplicants(prev => {
            const next = prev.map(a => (a.id === applicantId ? { ...a, assigneeId } : a));
            return next;
        });
        setApplicantAssignees(prev => ({ ...prev, [applicantId]: assigneeId }));
        logActivity({ type: 'team', text: 'Изменён ответственный за кандидата', actor: user?.name ?? 'Заказчик' });
    }, [accessToken, logActivity, user?.name]);

    const addApplicantNote = useCallback((applicantId, text, author = user?.name ?? 'Заказчик') => {
        const note = { id: Date.now(), author, text, date: formatNow() };
        setApplicantNotes(prev => {
            const next = { ...prev, [applicantId]: [...(prev[applicantId] ?? []), note] };
            persist({ applicantNotes: next });
            return next;
        });
    }, [persist, user?.name]);

    const createDealFromApplicant = useCallback(async (applicantId, amount, milestones) => {
        const applicant = applicants.find(a => a.id === applicantId);
        if (!applicant) return null;
        const deal = await api.createCompanyDeal(applicantId, Number(amount), milestones, accessToken);
        setDeals(prev => [deal, ...prev.filter(existing => existing.id !== deal.id)]);
        setApplicants(prev => prev.map(item => item.id === applicantId ? { ...item, status: 'hired' } : item));
        return deal;
    }, [accessToken, applicants]);

    const reviewDealMilestone = useCallback(async (dealId, milestoneId, decision, feedback = '') => {
        const result = await api.reviewCompanyMilestone(dealId, milestoneId, decision, feedback, accessToken);
        setDeals(prev => prev.map(deal => deal.id === dealId ? result.deal : deal));
        setCompany(result.company);
        setBilling(result.billing);
        return result;
    }, [accessToken]);

    const reviewCompletedDeal = useCallback(async (dealId, rating, text) => {
        const deal = await api.reviewCompletedDeal(dealId, rating, text, accessToken);
        setDeals(prev => prev.map(item => item.id === dealId ? deal : item));
        return deal;
    }, [accessToken]);

    const payDeal = useCallback(async (dealId, amount) => {
        const result = await api.payCompanyDeal(dealId, Number(amount), accessToken);
        setDeals(prev => prev.map(deal => deal.id === dealId ? result.deal : deal));
        setCompany(result.company);
        setBilling(result.billing);
        return result;
    }, [accessToken]);

    const sendCompanyMessage = useCallback(async (threadId, text) => {
        let entry;
        try {
            entry = await api.sendMessage(threadId, text, accessToken);
        } catch (error) {
            console.error('Не удалось отправить сообщение:', error);
            throw error;
        }
        setThreads(prev => {
            const next = { ...prev, [threadId]: [...(prev[threadId] ?? []), entry] };
            return next;
        });
        setMessages(prev => {
            const next = prev.map(m =>
                m.id === threadId ? { ...m, lastMessage: text, time: entry.time, unread: 0 } : m,
            );
            return next;
        });
    }, [accessToken]);

    const markThreadRead = useCallback((threadId) => {
        api.getMessages(threadId, accessToken)
            .then(thread => setThreads(prev => ({ ...prev, [threadId]: thread })))
            .catch(error => console.error('Не удалось загрузить переписку:', error));
        setMessages(prev => {
            const next = prev.map(m => (m.id === threadId ? { ...m, unread: 0 } : m));
            return next;
        });
    }, [accessToken]);

    const togglePinThread = useCallback((threadId) => {
        const pinned = !messages.find(item => item.id === threadId)?.pinned;
        api.updateCompanyMessageThread(threadId, pinned, accessToken)
            .catch(error => console.error('Не удалось закрепить диалог:', error));
        setMessages(prev => {
            const next = prev.map(m =>
                m.id === threadId ? { ...m, pinned } : m,
            );
            return next;
        });
    }, [accessToken, messages]);

    const addTeamMember = useCallback((member) => {
        setTeam(prev => {
            const next = [...prev, { ...member, id: Date.now(), active: true, permissions: ['applicants', 'messages'] }];
            persist({ team: next });
            return next;
        });
        logActivity({ type: 'team', text: `${member.name} добавлен(а) в список HR-команды`, actor: user?.name ?? 'Заказчик' });
    }, [persist, logActivity, user?.name]);

    const removeTeamMember = useCallback((memberId) => {
        setTeam(prev => {
            const next = prev.filter(m => m.id !== memberId);
            persist({ team: next });
            return next;
        });
        logActivity({ type: 'team', text: 'Сотрудник удалён из списка HR-команды', actor: user?.name ?? 'Заказчик' });
    }, [persist, logActivity, user?.name]);

    const updateCompany = useCallback((patch) => {
        const next = { ...company, ...patch };
        setCompany(next);
        return persist({ company: next });
    }, [company, persist]);

    const topUpBalance = useCallback(async (amount) => {
        const result = await api.topUpCompanyBalance(Number(amount), accessToken);
        setCompany(result.company);
        setBilling(result.billing);
        return result;
    }, [accessToken]);

    const value = useMemo(() => ({
        company,
        workspaceReady,
        workspaceLoading,
        workspaceError,
        reloadWorkspace,
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
        reviewDealMilestone,
        reviewCompletedDeal,
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
        company, workspaceReady, workspaceLoading, workspaceError, reloadWorkspace, tasks, applicants, filteredApplicants, applicantNotes, deals, activities,
        team, messages, threads, billing, stats, crmSearch,
        createTask, updateTask, closeTask, pauseTask, publishTask,
        updateApplicantStatus, moveApplicantNext, moveApplicantPrev, assignApplicant,
        addApplicantNote, createDealFromApplicant, reviewDealMilestone, reviewCompletedDeal, payDeal,
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
