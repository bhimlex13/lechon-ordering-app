import React, { createContext, useContext, useState } from 'react';

const ModalContext = createContext();

export const useModal = () => useContext(ModalContext);

export const ModalProvider = ({ children }) => {
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info', // info, success, error, warning
    onConfirm: null, // Function to run when user clicks "OK"
    confirmText: 'Okay',
  });

  const showModal = ({ 
    title, 
    message, 
    type = 'info', 
    onConfirm = null, 
    confirmText = 'Okay' 
  }) => {
    setModalState({
      isOpen: true,
      title,
      message,
      type,
      onConfirm,
      confirmText
    });
  };

  const hideModal = () => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
  };

  return (
    <ModalContext.Provider value={{ modalState, showModal, hideModal }}>
      {children}
    </ModalContext.Provider>
  );
};