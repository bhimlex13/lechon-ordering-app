import React, { createContext, useContext, useState } from 'react';

const CartSidebarContext = createContext();

export const useCartSidebar = () => useContext(CartSidebarContext);

export const CartSidebarProvider = ({ children }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);
  const toggleDrawer = () => setIsDrawerOpen((prev) => !prev);

  return (
    <CartSidebarContext.Provider value={{ isDrawerOpen, openDrawer, closeDrawer, toggleDrawer }}>
      {children}
    </CartSidebarContext.Provider>
  );
};