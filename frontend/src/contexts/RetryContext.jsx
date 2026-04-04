import { createContext, useContext, useState, useCallback } from 'react';

const RetryContext = createContext();

export function RetryProvider({ children }) {
  const [retryState, setRetryState] = useState({
    isRetrying: false,
    retryInfo: null
  });

  const setRetrying = useCallback((isRetrying, retryInfo = null) => {
    setRetryState({
      isRetrying,
      retryInfo
    });
  }, []);

  return (
    <RetryContext.Provider value={{ retryState, setRetrying }}>
      {children}
    </RetryContext.Provider>
  );
}

export function useRetry() {
  const context = useContext(RetryContext);
  if (!context) {
    throw new Error('useRetry must be used within RetryProvider');
  }
  return context;
}
