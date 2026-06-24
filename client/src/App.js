import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext'; 

import MainLayout from './components/MainLayout';
import AdminLayout from './components/AdminLayout';

// Context & Components
import { ModalProvider } from './context/ModalContext';
import GlobalModal from './components/GlobalModal';
import { LoadingProvider, useLoading } from './context/LoadingContext'; 
import LoadingOverlay from './components/LoadingOverlay'; 
import { NotificationProvider } from './context/NotificationContext';

// --- NEW IMPORTS FOR FLOATING CART ---
import { CartSidebarProvider } from './context/CartSidebarContext';
import CartDrawer from './components/CartDrawer';
import FloatingCartButton from './components/FloatingCartButton';

import HomePage from './pages/HomePage';
import MenuPage from './pages/MenuPage';
import LechonPage from './pages/LechonPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage'; 
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import ProfilePage from './pages/ProfilePage';
import MockPaymentPage from './pages/MockPaymentPage';

import StoriesPage from './pages/StoriesPage';
import StoresPage from './pages/StoresPage';
import BlogsPage from './pages/BlogsPage';
import FAQPage from './pages/FAQPage';
import ContactPage from './pages/ContactPage';

import DashboardPage from './pages/admin/DashboardPage';
import OrderListPage from './pages/admin/OrderListPage';
import AdminOrderDetailPage from './pages/admin/AdminOrderDetailPage'; 
import LechonListPage from './pages/admin/LechonListPage';
import MenuListPage from './pages/admin/MenuListPage';
import CategoryListPage from './pages/admin/CategoryListPage';
import UserListPage from './pages/admin/UserListPage';
import ReportsPage from './pages/admin/ReportsPage';
import DeveloperPage from './pages/DeveloperPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import SettingsPage from './pages/admin/SettingsPage';

const GlobalLoader = () => {
  const { loading: authLoading } = useAuth();
  const { isLoading: globalLoading, message } = useLoading();
  const shouldShow = authLoading || globalLoading;
  return (
    <LoadingOverlay 
      open={shouldShow} 
      message={globalLoading ? message : "Processing..."} 
    />
  );
};

function App() {
  return (
    <LoadingProvider>
      <ModalProvider>
        <NotificationProvider>
          {/* WRAP WITH CART SIDEBAR PROVIDER */}
          <CartSidebarProvider>
          
            <GlobalModal /> 
            <GlobalLoader />
            
            {/* RENDER THE FLOATING CART UI GLOBALLY */}
            <CartDrawer />
            <FloatingCartButton />

            <Routes>
              {/* CUSTOMER ROUTES */}
              <Route path="/" element={<MainLayout />}>
                <Route index element={<HomePage />} />
                <Route path="menu" element={<MenuPage />} />
                <Route path="lechon" element={<LechonPage />} />
                <Route path="login" element={<LoginPage />} />
                <Route path="register" element={<RegisterPage />} /> 
                <Route path="developer" element={<DeveloperPage />} />
                <Route path="stories" element={<StoriesPage />} />
                <Route path="stores" element={<StoresPage />} />
                <Route path="blogs" element={<BlogsPage />} />
                <Route path="faq" element={<FAQPage />} />
                <Route path="contact" element={<ContactPage />} />
                <Route path="cart" element={<CartPage />} />
                <Route path="checkout" element={<CheckoutPage />} />
                <Route path="orders" element={<OrdersPage />} />
                <Route path="orders/:id" element={<OrderDetailPage />} />
                <Route path="mock-payment/:orderId" element={<MockPaymentPage />} />
                <Route path="profile" element={<ProfilePage />} />
                
                {/* --- MOVED HERE: This route should be accessible publicly --- */}
                <Route path="reset-password/:resetToken" element={<ResetPasswordPage />} />
              </Route>

              {/* ADMIN ROUTES */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="orders" element={<OrderListPage />} />
                <Route path="orders/:id" element={<AdminOrderDetailPage />} /> 
                <Route path="lechon" element={<LechonListPage />} />
                <Route path="menu" element={<MenuListPage />} />
                <Route path="categories" element={<CategoryListPage />} />
                <Route path="users" element={<UserListPage />} />
                <Route path="reports" element={<ReportsPage />} />
                <Route path="settings" element={<SettingsPage />} />
                {/* Removed ResetPasswordPage from here */}
              </Route>
            </Routes>
          
          </CartSidebarProvider>
        </NotificationProvider>
      </ModalProvider>
    </LoadingProvider>
  );
}

export default App;
