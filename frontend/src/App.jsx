import React, { useEffect } from 'react';
import { Provider, useSelector } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

import { store } from './store/store';
import AppRoutes from './routes/AppRoutes';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 1000 * 60 * 5 },
  },
});

// ThemeProvider wrapper to sync DOM data-theme attribute with Redux state
const ThemeProvider = ({ children }) => {
  const { theme } = useSelector((s) => s.theme);
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);
  return children;
};

export default function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: 'var(--clr-surface)',
                color: 'var(--clr-text)',
                border: '1px solid var(--clr-border)',
                borderRadius: 'var(--radius-md)',
                fontFamily: 'var(--font-body)',
                fontSize: '0.875rem',
              },
              success: { iconTheme: { primary: '#00C48C', secondary: '#000' } },
              error: { iconTheme: { primary: '#FF4D4F', secondary: '#fff' } },
            }}
          />
        </ThemeProvider>
      </QueryClientProvider>
    </Provider>
  );
}
