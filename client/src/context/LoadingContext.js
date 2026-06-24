import React, { createContext, useContext, useState } from 'react';

const LoadingContext = createContext();

export const useLoading = () => useContext(LoadingContext);

export const LoadingProvider = ({ children }) => {
  const [loadingState, setLoadingState] = useState({
    isLoading: false,
    message: 'Loading...',
  });

  const showLoading = (message = 'Loading...') => {
    setLoadingState({
      isLoading: true,
      message,
    });
  };

  const hideLoading = () => {
    setLoadingState((prev) => ({ ...prev, isLoading: false }));
  };

  return (
    <LoadingContext.Provider value={{ ...loadingState, showLoading, hideLoading }}>
      {children}
    </LoadingContext.Provider>
  );
};