import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { ThemeProvider } from './context/ThemeContext';
import { ModalsProvider } from './context/ModalsContext';
import { BalanceProvider } from './context/BalanceContext';
import { LabSkillReposProvider } from './context/LabSkillReposContext';
import { UserSettingsProvider } from './context/UserSettingsContext';
import '/static/master.scss';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <UserSettingsProvider>
          <LabSkillReposProvider>
            <BalanceProvider>
              <ModalsProvider>
                <App />
              </ModalsProvider>
            </BalanceProvider>
          </LabSkillReposProvider>
        </UserSettingsProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
