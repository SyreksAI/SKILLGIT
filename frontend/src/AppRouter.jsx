import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { HomePage } from './components/pages/HomePage';
import { TasksPage } from './components/pages/TasksPage';
import { TaskDetailPage } from './components/pages/TaskDetailPage';
import { ChatPage } from './components/pages/ChatPage';
import { SkillMatePage } from './components/pages/SkillMatePage';
import { MateAIPage } from './components/pages/MateAIPage';
import { TeamPage } from './components/pages/TeamPage';
import { LabSkillPage } from './components/pages/LabSkillPage';
import { LabSkillNewRepoPage } from './components/pages/LabSkillNewRepoPage';
import { LabSkillRepoPage } from './components/pages/LabSkillRepoPage';
import { ProfilePage } from './components/pages/ProfilePage';
import { SettingsPage } from './components/pages/SettingsPage';
import { HowItWorksPage } from './components/pages/HowItWorksPage';
import { NotificationsPage } from './components/pages/NotificationsPage';
import { HelpPage } from './components/pages/HelpPage';
import { CompanyPublicPage } from './components/pages/CompanyPublicPage';
import { UserPublicPage } from './components/pages/UserPublicPage';
import { AccessPage } from './components/pages/AccessPage';
import { LoginPage } from './components/pages/LoginPage';
import { RegisterPage } from './components/pages/RegisterPage';
import { CompanyAdminLayout } from './components/company/CompanyAdminLayout';
import { CompanyDashboardPage } from './components/company/CompanyDashboardPage';
import { CompanyTasksPage, CompanyTaskNewPage, CompanyTaskDetailPage } from './components/company/CompanyTasksPage';
import { CompanyApplicantsPage } from './components/company/CompanyApplicantsPage';
import { CompanyMessagesPage } from './components/company/CompanyMessagesPage';
import { CompanyTeamPage } from './components/company/CompanyTeamPage';
import { CompanyAnalyticsPage } from './components/company/CompanyAnalyticsPage';
import { CompanyBillingPage } from './components/company/CompanyBillingPage';
import { CompanySettingsPage } from './components/company/CompanySettingsPage';
import { CompanyPipelinePage } from './components/company/CompanyPipelinePage';
import { CompanyDealsPage } from './components/company/CompanyDealsPage';
import { CompanyActivityPage } from './components/company/CompanyActivityPage';
import { PlatformAdminLayout } from './components/platform/PlatformAdminLayout';
import { PlatformDashboardPage } from './components/platform/PlatformDashboardPage';
import { PlatformUsersPage } from './components/platform/PlatformUsersPage';
import { PlatformCompaniesPage } from './components/platform/PlatformCompaniesPage';
import { PlatformTasksPage } from './components/platform/PlatformTasksPage';
import { PlatformTransactionsPage } from './components/platform/PlatformTransactionsPage';
import { PlatformReportsPage } from './components/platform/PlatformReportsPage';
import { PlatformSettingsPage } from './components/platform/PlatformSettingsPage';
import { PlatformAnalyticsPage } from './components/platform/PlatformAnalyticsPage';
import { PlatformActivityPage } from './components/platform/PlatformActivityPage';
import { PlatformUserDetailPage } from './components/platform/PlatformUserDetailPage';

function AppRouter() {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/tasks/:id" element={<TaskDetailPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/skillmate" element={<SkillMatePage />} />
            <Route path="/mateai" element={<MateAIPage />} />
            <Route path="/team" element={<TeamPage />} />
            <Route path="/labskill" element={<LabSkillPage />} />
            <Route path="/labskill/new" element={<LabSkillNewRepoPage />} />
            <Route path="/labskill/:owner/:repoName" element={<LabSkillRepoPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/help" element={<HelpPage />} />
            <Route path="/companies/:slug" element={<CompanyPublicPage />} />
            <Route path="/users/:username" element={<UserPublicPage />} />
            <Route path="/access" element={<AccessPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route path="/company" element={<CompanyAdminLayout />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<CompanyDashboardPage />} />
                <Route path="tasks" element={<CompanyTasksPage />} />
                <Route path="tasks/new" element={<CompanyTaskNewPage />} />
                <Route path="tasks/:id" element={<CompanyTaskDetailPage />} />
                <Route path="pipeline" element={<CompanyPipelinePage />} />
                <Route path="applicants" element={<CompanyApplicantsPage />} />
                <Route path="deals" element={<CompanyDealsPage />} />
                <Route path="messages" element={<CompanyMessagesPage />} />
                <Route path="activity" element={<CompanyActivityPage />} />
                <Route path="team" element={<CompanyTeamPage />} />
                <Route path="analytics" element={<CompanyAnalyticsPage />} />
                <Route path="billing" element={<CompanyBillingPage />} />
                <Route path="settings" element={<CompanySettingsPage />} />
            </Route>

            <Route path="/admin" element={<PlatformAdminLayout />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<PlatformDashboardPage />} />
                <Route path="users" element={<PlatformUsersPage />} />
                <Route path="users/:id" element={<PlatformUserDetailPage />} />
                <Route path="analytics" element={<PlatformAnalyticsPage />} />
                <Route path="activity" element={<PlatformActivityPage />} />
                <Route path="companies" element={<PlatformCompaniesPage />} />
                <Route path="tasks" element={<PlatformTasksPage />} />
                <Route path="transactions" element={<PlatformTransactionsPage />} />
                <Route path="reports" element={<PlatformReportsPage />} />
                <Route path="settings" element={<PlatformSettingsPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default AppRouter;
