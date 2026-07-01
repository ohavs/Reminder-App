import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { App } from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Diagnostic } from './components/Diagnostic';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Diagnostic />
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);
