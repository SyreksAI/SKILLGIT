/**
 * API-слой для подключения бэкенда.
 * Замени mock-данные на реальные fetch-запросы когда бэкенд будет готов.
 */

const API_BASE = import.meta.env.VITE_API_URL ?? '/api';

async function request(path, options = {}) {
    const res = await fetch(`${API_BASE}${path}`, {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        ...options,
    });

    if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
    }

    return res.json();
}

export const api = {
    getTasks: () => request('/tasks'),
    getTask: id => request(`/tasks/${id}`),
    getMyTasks: () => request('/my-tasks'),
    applyToTask: (id, body) => request(`/tasks/${id}/apply`, { method: 'POST', body: JSON.stringify(body) }),
    getConversations: () => request('/chat/conversations'),
    getMessages: id => request(`/chat/${id}/messages`),
    sendMessage: (id, text) => request(`/chat/${id}/messages`, { method: 'POST', body: JSON.stringify({ text }) }),
    getTeams: () => request('/teams'),
    getProfile: () => request('/profile'),
    updateProfile: data => request('/profile', { method: 'PATCH', body: JSON.stringify(data) }),
    getLabSkillRepos: () => request('/labskill/repos'),
    getNotifications: () => request('/notifications'),
    markNotificationsRead: ids => request('/notifications/read', {
        method: 'POST',
        body: JSON.stringify({ ids }),
    }),
    markAllNotificationsRead: () => request('/notifications/read-all', { method: 'POST' }),
};
