import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { ThemeProvider } from './context/ThemeContext';
import { ModalsProvider } from './context/ModalsContext';
import { BalanceProvider } from './context/BalanceContext';
import { LabSkillReposProvider } from './context/LabSkillReposContext';
import { AuthProvider } from './context/AuthContext';
import { UserSettingsProvider } from './context/UserSettingsContext';
import { NotificationsProvider } from './context/NotificationsContext';
import { CompanyAdminProvider } from './context/CompanyAdminContext';
import { PlatformAdminProvider } from './context/PlatformAdminContext';
import '/static/master.scss';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <UserSettingsProvider>
          <AuthProvider>
          <NotificationsProvider>
            <LabSkillReposProvider>
              <BalanceProvider>
                <CompanyAdminProvider>
                  <PlatformAdminProvider>
                    <ModalsProvider>
                      <App />
                    </ModalsProvider>
                  </PlatformAdminProvider>
                </CompanyAdminProvider>
              </BalanceProvider>
            </LabSkillReposProvider>
          </NotificationsProvider>
          </AuthProvider>
        </UserSettingsProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
