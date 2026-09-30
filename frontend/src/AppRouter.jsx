import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { HomePage } from './components/pages/HomePage';
import { TasksPage } from './components/pages/TasksPage';
import { TaskDetailPage } from './components/pages/TaskDetailPage';
import { ChatPage } from './components/pages/ChatPage';
import { TeamPage } from './components/pages/TeamPage';
import { LabSkillPage } from './components/pages/LabSkillPage';
import { LabSkillNewRepoPage } from './components/pages/LabSkillNewRepoPage';
import { LabSkillRepoPage } from './components/pages/LabSkillRepoPage';
import { ProfilePage } from './components/pages/ProfilePage';
import { SettingsPage } from './components/pages/SettingsPage';
import { HowItWorksPage } from './components/pages/HowItWorksPage';

function AppRouter() {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/tasks/:id" element={<TaskDetailPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/team" element={<TeamPage />} />
            <Route path="/labskill" element={<LabSkillPage />} />
            <Route path="/labskill/new" element={<LabSkillNewRepoPage />} />
            <Route path="/labskill/:owner/:repoName" element={<LabSkillRepoPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default AppRouter;
