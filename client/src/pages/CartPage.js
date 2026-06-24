import React, { useState, useEffect, useMemo } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  TextField,
  Button,
  Paper,
  Divider,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ShoppingCartCheckoutIcon from '@mui/icons-material/ShoppingCartCheckout';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart'; 
import RemoveShoppingCartIcon from '@mui/icons-material/RemoveShoppingCart'; 
import NightlightIcon from '@mui/icons-material/Nightlight'; // <--- NEW ICON for "Night/Closed"

import api from '../api';
import { useCart } from '../context/CartContext'; 
import { useAuth } from '../context/AuthContext'; 
import { motion, AnimatePresence } from 'framer-motion'; 

function CartPage() {
  const { cartItems, updateCartQty, removeItemFromCart } = useCart();
  const { userInfo } = useAuth();
  const navigate = useNavigate();

  const [settings, setSettings] = useState(null);
  const [storeClosedModal, setStoreClosedModal] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await api.get('/api/settings');
        setSettings(data);
      } catch (err) {
        console.error("Failed to load settings:", err);
      }
    };
    fetchSettings();
  }, []);

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.qty,
    0
  );
  const totalItems = cartItems.reduce((acc, item) => acc + item.qty, 0);

  const handleQtyChange = (item, value) => {
    if (value === '') return; 
    const qty = parseInt(value);
    if (!isNaN(qty) && qty >= 1) {
        updateCartQty(item._id, qty);
    }
  };

  const handleIncrease = (item) => {
      updateCartQty(item._id, item.qty + 1);
  };

  const handleDecrease = (item) => {
      if (item.qty > 1) {
          updateCartQty(item._id, item.qty - 1);
      }
  };

  const handleBlur = (item, event) => {
      const val = parseInt(event.target.value);
      if (isNaN(val) || val < 1) {
          updateCartQty(item._id, 1); 
      }
  };

  const handleRemove = (itemId) => { 
    removeItemFromCart(itemId); 
  };

  const isLechonOrder = useMemo(() => {
    return cartItems.some(item => item.category === 'Lechon');
  }, [cartItems]);

  const isStoreOpen = () => {
      if (!settings || !settings.general?.operatingHours) return true;
      
      const { openTime, closeTime } = settings.general.operatingHours;
      const now = new Date();
      const current = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

      return current >= openTime && current <= closeTime;
  };

  const handleCheckout = () => {
    if (!userInfo) {
      navigate('/login?redirect=/checkout');
      return;
    }

    if (!isLechonOrder && !isStoreOpen()) {
        setStoreClosedModal(true);
        return;
    }

    navigate('/checkout');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton 
            onClick={() => navigate(-1)} 
            sx={{ mr: 2, border: '1px solid #ccc', borderRadius: 2 }}
        >
            <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1" fontWeight="bold">
            Shopping Cart
        </Typography>
      </Box>

      {cartItems.length === 0 ? (
        <Paper 
            component={motion.div}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            elevation={3} 
            sx={{ p: 5, textAlign: 'center', mt: 3, borderRadius: 2 }}
        >
            <RemoveShoppingCartIcon sx={{ fontSize: 120, color: '#e0e0e0', mb: 2 }} />
            
            <Typography variant="h5" color="text.secondary" gutterBottom>
                Your cart is currently empty.
            </Typography>
            <Button 
                component={RouterLink} 
                to="/menu" 
                variant="contained" 
                size="large" 
                startIcon={<AddShoppingCartIcon />}
                sx={{ mt: 3, fontWeight: 'bold', px: 4, py: 1.5 }}
            >
                ADD ORDERS
            </Button>
        </Paper>
      ) : (
        <Grid 
            container 
            spacing={4}
            component={motion.div} 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
          <Grid item xs={12} md={8}>
            <Stack spacing={2}>
                <AnimatePresence>
                {cartItems.map((item) => (
                <motion.div 
                    key={item._id}
                    variants={itemVariants}
                    layout 
                    exit={{ opacity: 0, x: -100, transition: { duration: 0.2 } }}
                >
                    <Card sx={{ display: 'flex', boxShadow: 2, borderRadius: 3, overflow: 'hidden' }}>
                        <CardMedia
                        component="img"
                        sx={{ width: { xs: 100, sm: 140 }, objectFit: 'cover' }}
                        image={item.imageUrl || '/images/placeholder.png'}
                        alt={item.name}
                        />
                        <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, p: { xs: 1, sm: 2 } }}>
                        <CardContent sx={{ flex: '1 0 auto', p: 1, pb: 0 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                <Box>
                                    <Typography component="div" variant="h6" fontWeight="bold" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                                    {item.name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Unit Price: ₱{item.price.toLocaleString()}
                                    </Typography>
                                </Box>
                                <IconButton aria-label="delete" color="error" onClick={() => handleRemove(item._id)}>
                                    <DeleteIcon />
                                </IconButton>
                            </Box>
                        </CardContent>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1, mt: 1 }}>
                            <Box 
                                sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    border: '1px solid #ddd', 
                                    borderRadius: 50,
                                    bgcolor: '#f5f5f5',
                                    px: 1
                                }}
                            >
                                <IconButton size="small" onClick={() => handleDecrease(item)} disabled={item.qty <= 1}>
                                    <RemoveIcon fontSize="small" />
                                </IconButton>
                                
                                <TextField
                                    variant="standard"
                                    value={item.qty}
                                    onChange={(e) => handleQtyChange(item, e.target.value)}
                                    onBlur={(e) => handleBlur(item, e)}
                                    onFocus={(e) => e.target.select()}
                                    inputProps={{ 
                                        style: { textAlign: 'center', fontWeight: 'bold' },
                                        min: 1,
                                        type: 'number' 
                                    }}
                                    InputProps={{ disableUnderline: true }}
                                    sx={{ width: 40, mx: 0.5 }}
                                />
                                
                                <IconButton size="small" onClick={() => handleIncrease(item)}>
                                    <AddIcon fontSize="small" />
                                </IconButton>
                            </Box>
                            
                            <Typography variant="subtitle1" color="primary" sx={{ fontWeight: 'bold' }}>
                                ₱{(item.price * item.qty).toLocaleString()}
                            </Typography>
                        </Box>
                        </Box>
                    </Card>
                </motion.div>
                ))}
                </AnimatePresence>
            </Stack>
            
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-start' }}>
                 <Button 
                    component={RouterLink} 
                    to="/menu" 
                    variant="outlined" 
                    size="large"
                    startIcon={<AddShoppingCartIcon />}
                    sx={{ 
                        fontWeight: 'bold', 
                        borderWidth: 2, 
                        '&:hover': { borderWidth: 2 },
                        width: { xs: '100%', sm: 'auto' } 
                    }}
                >
                    ADD ORDERS
                </Button>
            </Box>
          </Grid>

          <Grid item xs={12} md={4} component={motion.div} variants={itemVariants}>
            <Paper elevation={4} sx={{ p: 3, borderRadius: 3, position: 'sticky', top: 90 }}>
              <Typography variant="h5" gutterBottom fontWeight="bold">
                Order Summary
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body1">Total Items:</Typography>
                <Typography variant="body1" fontWeight="bold">{totalItems}</Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6">Subtotal:</Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                  ₱{subtotal.toLocaleString()}
                </Typography>
              </Box>

              <Button
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                startIcon={<ShoppingCartCheckoutIcon />}
                sx={{ py: 1.5, fontWeight: 'bold', fontSize: '1.1rem', borderRadius: 2 }}
                onClick={handleCheckout}
              >
                CHECKOUT
              </Button>
              
              <Typography variant="caption" display="block" align="center" sx={{ mt: 2, color: 'text.secondary' }}>
                Tax included. Shipping calculated at checkout.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* --- FRIENDLY STORE CLOSED MODAL --- */}
      <Dialog
        open={storeClosedModal}
        onClose={() => setStoreClosedModal(false)}
      >
        <DialogTitle sx={{ color: '#1a237e', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
            <NightlightIcon sx={{ mr: 1, color: '#fdd835' }} /> Our Kitchen is Currently Closed
        </DialogTitle>
        <DialogContent>
            <DialogContentText sx={{ fontSize: '1.1rem', color: '#333' }}>
                We're sorry, but we cannot process standard food orders at the moment.
                <br/><br/>
                We'd love to serve you during our operating hours:
                <br/>
                <strong>{settings?.general?.operatingHours?.openTime} - {settings?.general?.operatingHours?.closeTime}</strong>.
            </DialogContentText>
            <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 2, mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                    <strong>Tip:</strong> If you are planning a feast for a future date, you may still proceed by ordering a <strong>Whole Lechon</strong>, which is available for advance scheduling.
                </Typography>
            </Box>
        </DialogContent>
        <DialogActions>
            <Button onClick={() => setStoreClosedModal(false)} color="primary" variant="contained">
                I'll Come Back Later
            </Button>
        </DialogActions>
      </Dialog>

    </Container>
  );
}

export default CartPage;