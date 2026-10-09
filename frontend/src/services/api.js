/**
 * Общий API-слой приложения.
 */

const API_BASE = import.meta.env.VITE_API_URL ?? '/api';

async function request(path, options = {}) {
    const { token, ...fetchOptions } = options;
    const headers = {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
    };
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}${path}`, { ...fetchOptions, headers });

    if (!res.ok) {
        let message = `Ошибка API: ${res.status}`;
        try {
            const body = await res.json();
            if (typeof body.detail === 'string') message = body.detail;
            else if (Array.isArray(body.detail)) message = body.detail.map(item => item.msg).join(', ');
        } catch {
            // Ответ сервера может быть без JSON-тела.
        }
        throw new Error(message);
    }

    if (res.status === 204) return null;
    return res.json();
}

export const api = {
    registerAccount: data => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    loginAccount: data => request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
    logoutAccount: token => request('/auth/logout', { method: 'POST', token }),
    getCurrentUser: token => request('/auth/me', { token }),
    getTasks: () => request('/tasks'),
    getTask: id => request(`/tasks/${id}`),
    getPublicCompany: slug => request(`/companies/${encodeURIComponent(slug)}`),
    getCompanyTasks: token => request('/company/tasks', { token }),
    getCompanyWorkspace: token => request('/company/workspace', { token }),
    updateCompanyWorkspace: (data, token) => request('/company/workspace', {
        method: 'PATCH', body: JSON.stringify(data), token,
    }),
    topUpCompanyBalance: (amount, token) => request('/company/billing/top-up', {
        method: 'POST', body: JSON.stringify({ amount }), token,
    }),
    createCompanyDeal: (applicantId, amount, milestones, token) => request('/company/deals', {
        method: 'POST', body: JSON.stringify({ applicantId, amount, milestones }), token,
    }),
    payCompanyDeal: (dealId, amount, token) => request(`/company/deals/${dealId}/pay`, {
        method: 'POST', body: JSON.stringify({ amount }), token,
    }),
    reviewCompanyMilestone: (dealId, milestoneId, decision, feedback, token) => request(`/company/deals/${dealId}/milestones/${milestoneId}/review`, {
        method: 'POST', body: JSON.stringify({ decision, feedback }), token,
    }),
    reviewCompletedDeal: (dealId, rating, text, token) => request(`/company/deals/${dealId}/review`, {
        method: 'POST', body: JSON.stringify({ rating, text }), token,
    }),
    updateCompanyMessageThread: (id, pinned, token) => request(`/company/messages/${id}`, {
        method: 'PATCH', body: JSON.stringify({ pinned }), token,
    }),
    createCompanyTask: (data, token) => request('/company/tasks', { method: 'POST', body: JSON.stringify(data), token }),
    updateCompanyTask: (id, status, token) => request(`/company/tasks/${id}`, {
        method: 'PATCH', body: JSON.stringify({ status }), token,
    }),
    getCompanyApplicants: token => request('/company/applicants', { token }),
    updateCompanyApplicant: (id, updates, token) => request(`/company/applicants/${id}`, {
        method: 'PATCH', body: JSON.stringify(typeof updates === 'string' ? { status: updates } : updates), token,
    }),
    getMyTasks: () => request('/my-tasks'),
    getMyDeals: token => request('/my/deals', { token }),
    submitDealMilestone: (companyId, dealId, milestoneId, submission, token) => request(`/my/deals/${companyId}/${dealId}/milestones/${milestoneId}/submit`, {
        method: 'POST', body: JSON.stringify(submission), token,
    }),
    applyToTask: (id, body, token) => request(`/tasks/${id}/apply`, { method: 'POST', body: JSON.stringify(body), token }),
    getConversations: token => request('/chat/conversations', { token }),
    getMessages: (id, token) => request(`/chat/${id}/messages`, { token }),
    sendMessage: (id, text, token) => request(`/chat/${id}/messages`, { method: 'POST', body: JSON.stringify({ text }), token }),
    getTeams: () => request('/teams'),
    getProfile: token => request('/profile', { token }),
    getPublicUser: username => request(`/users/${encodeURIComponent(username)}`),
    updateProfile: (data, token) => request('/profile', {
        method: 'PATCH',
        body: JSON.stringify(data),
        token,
    }),
    getLabSkillRepos: () => request('/labskill/repos'),
    getNotifications: () => request('/notifications'),
    markNotificationsRead: ids => request('/notifications/read', {
        method: 'POST',
        body: JSON.stringify({ ids }),
    }),
    markAllNotificationsRead: () => request('/notifications/read-all', { method: 'POST' }),
};
