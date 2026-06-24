import React, { useEffect, useState } from 'react';
import { Fab, Badge, Tooltip, Zoom } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useCartSidebar } from '../context/CartSidebarContext';
import { useCart } from '../context/CartContext';
import { useLocation } from 'react-router-dom'; // <--- NEW IMPORT

const FloatingCartButton = () => {
  const { toggleDrawer } = useCartSidebar();
  const { cartItems } = useCart();
  const [bump, setBump] = useState(false);
  
  // --- NEW: Check URL Location ---
  const location = useLocation();

  // Calculate total quantity of items
  const totalItems = cartItems.reduce((acc, item) => acc + item.qty, 0);

  // Animation effect when items change
  useEffect(() => {
    if (totalItems === 0) return;
    setBump(true);
    const timer = setTimeout(() => setBump(false), 300);
    return () => clearTimeout(timer);
  }, [totalItems]);

  // --- LOGIC: Hide button if on Admin pages ---
  if (location.pathname.startsWith('/admin')) {
      return null;
  }

  return (
    <Zoom in={true} style={{ transitionDelay: '500ms' }}>
      <Tooltip title="View Cart" placement="left"> 
        <Fab
          color="primary"
          aria-label="cart"
          onClick={toggleDrawer}
          sx={{
            position: 'fixed',
            bottom: 32, 
            right: 32, 
            zIndex: 1200, 
            width: 64,
            height: 64,
            boxShadow: '0px 4px 20px rgba(237, 108, 2, 0.4)', 
            transform: bump ? 'scale(1.1)' : 'scale(1)',
            transition: 'transform 0.1s ease-in-out',
            '&:hover': {
                transform: 'scale(1.05)',
            }
          }}
        >
          <Badge 
            badgeContent={totalItems} 
            color="error"
            overlap="circular"
            sx={{
                '& .MuiBadge-badge': {
                    fontSize: '0.9rem',
                    height: 22,
                    minWidth: 22,
                    fontWeight: 'bold'
                }
            }}
          >
            <ShoppingCartIcon sx={{ fontSize: 30 }} />
          </Badge>
        </Fab>
      </Tooltip>
    </Zoom>
  );
};

export default FloatingCartButton;