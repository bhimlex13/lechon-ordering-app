import React from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Divider,
  Button,
  Stack
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ProductionQuantityLimitsIcon from '@mui/icons-material/ProductionQuantityLimits';

import { useCart } from '../context/CartContext';
import { useCartSidebar } from '../context/CartSidebarContext';
import { useNavigate } from 'react-router-dom';

const CartDrawer = () => {
  const { cartItems, removeItemFromCart } = useCart();
  const { isDrawerOpen, closeDrawer } = useCartSidebar();
  const navigate = useNavigate();

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);

  const handleCheckout = () => {
    closeDrawer(); 
    navigate('/cart'); 
  };

  return (
    <Drawer
      anchor="right" // <--- SLIDES FROM RIGHT
      open={isDrawerOpen}
      onClose={closeDrawer}
      PaperProps={{
        sx: {
          width: { xs: '85%', sm: 400 }, 
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      {/* --- HEADER --- */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: '#f5f5f5' }}>
        <Typography variant="h6" fontWeight="bold">
          Your Cart ({cartItems.length})
        </Typography>
        <IconButton onClick={closeDrawer}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Divider />

      {/* --- CART ITEMS LIST --- */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
        {cartItems.length === 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 8, px: 3, opacity: 0.6 }}>
            <ProductionQuantityLimitsIcon sx={{ fontSize: 80, mb: 2 }} />
            <Typography variant="body1" align="center">
              Your cart is empty. <br /> Start adding delicious lechon!
            </Typography>
            <Button 
                variant="text" 
                onClick={closeDrawer} 
                sx={{ mt: 2, fontWeight: 'bold' }}
            >
                Start Browsing
            </Button>
          </Box>
        ) : (
          <List>
            {cartItems.map((item) => (
              <React.Fragment key={item._id}>
                <ListItem
                  secondaryAction={
                    <IconButton edge="end" aria-label="delete" onClick={() => removeItemFromCart(item._id)} color="error" size="small">
                      <DeleteOutlineIcon />
                    </IconButton>
                  }
                >
                  <ListItemAvatar>
                    <Avatar 
                        src={item.imageUrl || '/images/placeholder.png'} 
                        variant="rounded" 
                        sx={{ width: 56, height: 56, mr: 2 }}
                    />
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                        <Typography variant="subtitle2" fontWeight="bold" noWrap>
                            {item.name}
                        </Typography>
                    }
                    secondary={
                        <Box component="span" sx={{ display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="caption" color="text.secondary">
                                ₱{item.price.toLocaleString()} x {item.qty}
                            </Typography>
                            <Typography variant="body2" color="primary" fontWeight="bold">
                                ₱{(item.price * item.qty).toLocaleString()}
                            </Typography>
                        </Box>
                    }
                  />
                </ListItem>
                <Divider variant="inset" component="li" />
              </React.Fragment>
            ))}
          </List>
        )}
      </Box>

      {/* --- FOOTER --- */}
      {cartItems.length > 0 && (
        <Box sx={{ p: 3, borderTop: '1px solid #e0e0e0', bgcolor: '#fff' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="subtitle1">Subtotal:</Typography>
            <Typography variant="h6" fontWeight="bold" color="primary">
              ₱{subtotal.toLocaleString()}
            </Typography>
          </Box>

          <Stack spacing={2}>
            <Button
                variant="contained"
                fullWidth
                size="large"
                startIcon={<ArrowForwardIcon />}
                onClick={handleCheckout}
                sx={{ 
                    fontWeight: 'bold', 
                    borderRadius: 2,
                    py: 1.5
                }}
            >
                VIEW CART & CHECKOUT
            </Button>
            
            <Button 
                variant="outlined" 
                fullWidth 
                onClick={closeDrawer}
                sx={{ borderRadius: 2 }}
            >
                Continue Shopping
            </Button>
          </Stack>
        </Box>
      )}
    </Drawer>
  );
};

export default CartDrawer;