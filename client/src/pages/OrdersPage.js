import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  CircularProgress,
  Alert,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Chip,
  Stepper,
  Step,
  StepLabel,
  Button,
  Avatar,
  Divider,
  Paper
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import api from '../api'; 
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

// Brand colors
import { theme } from '../theme';

function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { userInfo } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!userInfo) {
      navigate('/login?redirect=/orders');
      return;
    }

    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await api.get('/api/orders/my-orders');
        setOrders(data);
      } catch (err) {
        setError(
          err.response && err.response.data.message
            ? err.response.data.message
            : err.message
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [userInfo, navigate]);

  // --- ANIMATION VARIANTS ---
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

  // --- HELPERS ---
  const steps = ['Pending', 'Processing', 'Ready', 'Delivered'];

  const getActiveStep = (status) => {
      if (status === 'Cancelled') return -1;
      return steps.indexOf(status);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered': return 'success';
      case 'Cancelled': return 'error';
      case 'Processing': return 'info';
      case 'Ready': return 'warning';
      default: return 'default';
    }
  };

  // --- RENDER CONTENT ---
  let content;
  if (loading) {
    content = (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 10 }}>
        <CircularProgress size={60} sx={{ color: theme.palette.primary.main }} />
      </Box>
    );
  } else if (error) {
    content = (
        <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>{error}</Alert>
    );
  } else if (orders.length === 0) {
    // --- EMPTY STATE ---
    content = (
        <Box 
            component={motion.div} 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            sx={{ textAlign: 'center', mt: 8, py: 5 }}
        >
            <ReceiptLongIcon sx={{ fontSize: 100, color: '#e0e0e0', mb: 2 }} />
            <Typography variant="h5" color="text.secondary" gutterBottom fontWeight="bold">
                No orders found
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                Looks like you haven't placed any orders yet.
            </Typography>
            <Button 
                variant="contained" 
                size="large"
                endIcon={<ArrowForwardIcon />}
                onClick={() => navigate('/menu')}
                sx={{ bgcolor: theme.palette.primary.main, fontWeight: 'bold', px: 4, py: 1.5, borderRadius: 50 }}
            >
                Browse Menu
            </Button>
        </Box>
    );
  } else {
    content = (
      <Box component={motion.div} variants={containerVariants} initial="hidden" animate="visible" sx={{ mt: 3 }}>
        {orders.map((order) => {
            const activeStep = getActiveStep(order.status);
            
            return (
              <Box 
                component={motion.div} 
                variants={itemVariants} 
                key={order._id}
                // --- FIX: Apply margin to the wrapper Box, not the Accordion ---
                sx={{ mb: 3 }} 
              >
                  <Accordion
                    disableGutters // Prevents the accordion from shifting its own margins
                    sx={{ 
                        borderRadius: '12px !important', // Force rounded corners always
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)', 
                        border: '1px solid #eee',
                        '&:before': { display: 'none' }, // Hides default line
                        overflow: 'hidden'
                    }}
                  >
                    <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: '#fff' }}>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={3}>
                          <Typography variant="caption" color="text.secondary" display="block" sx={{ letterSpacing: 1 }}>ORDER ID</Typography>
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', fontFamily: 'monospace', color: '#333' }}>
                            #{order._id.substring(order._id.length - 8).toUpperCase()}
                          </Typography>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Typography variant="caption" color="text.secondary" display="block" sx={{ letterSpacing: 1 }}>DATE</Typography>
                          <Typography variant="body2" fontWeight="500">
                            {new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </Typography>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Typography variant="caption" color="text.secondary" display="block" sx={{ letterSpacing: 1 }}>TOTAL</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
                            ₱{order.totalPrice.toLocaleString()}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={3} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', sm: 'flex-end' } }}>
                          <Chip 
                            label={order.status} 
                            color={getStatusColor(order.status)} 
                            size="small" 
                            sx={{ fontWeight: 'bold', minWidth: 90, borderRadius: 1 }}
                            icon={order.status === 'Delivered' ? <CheckCircleIcon /> : undefined}
                          />
                        </Grid>
                      </Grid>
                    </AccordionSummary>
                    
                    <AccordionDetails sx={{ backgroundColor: '#fafafa', borderTop: '1px solid #f0f0f0', p: 3 }}>
                      
                      {/* --- STATUS STEPPER --- */}
                      {order.status !== 'Cancelled' && (
                          <Box sx={{ width: '100%', mb: 4, mt: 1 }}>
                            <Stepper activeStep={activeStep} alternativeLabel>
                              {steps.map((label) => (
                                <Step key={label}>
                                  <StepLabel 
                                    StepIconProps={{
                                        sx: { color: activeStep >= steps.indexOf(label) ? theme.palette.primary.main : undefined }
                                    }}
                                  >
                                    {label}
                                  </StepLabel>
                                </Step>
                              ))}
                            </Stepper>
                          </Box>
                      )}

                      {order.status === 'Delivered' && (
                          <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
                              Order received. Enjoy your meal!
                          </Alert>
                      )}

                      {order.status === 'Cancelled' && (
                          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                              This order has been cancelled.
                          </Alert>
                      )}

                      <Divider sx={{ mb: 2 }} />
                      <Typography variant="subtitle2" gutterBottom fontWeight="bold" color="text.secondary" sx={{ mb: 2 }}>
                        ITEMS ORDERED
                      </Typography>

                      <Grid container spacing={2}>
                        {order.orderItems.map((item, index) => (
                            <Grid item xs={12} md={6} key={index}>
                                <Paper elevation={0} sx={{ p: 2, border: '1px solid #eee', display: 'flex', alignItems: 'center', borderRadius: 2 }}>
                                    {/* IMAGE AVATAR */}
                                    <Avatar 
                                        src={item.image || item.product?.imageUrl} 
                                        variant="rounded"
                                        sx={{ width: 56, height: 56, mr: 2, bgcolor: theme.palette.primary.light }}
                                    >
                                        <RestaurantMenuIcon sx={{ color: theme.palette.primary.main }} />
                                    </Avatar>
                                    
                                    <Box sx={{ flexGrow: 1 }}>
                                        <Typography variant="subtitle2" fontWeight="bold">
                                            {item.name}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Qty: {item.qty}
                                        </Typography>
                                    </Box>
                                    
                                    <Typography variant="body2" fontWeight="bold" color="primary">
                                        ₱{(item.qty * item.price).toLocaleString()}
                                    </Typography>
                                </Paper>
                            </Grid>
                        ))}
                      </Grid>
                      
                      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 2 }}>
                          <Button size="small" onClick={() => navigate(`/orders/${order._id}`)}>
                              View Full Details
                          </Button>
                          <Typography variant="h6" color={theme.palette.primary.main} sx={{ fontWeight: 'bold' }}>
                            Total: ₱{order.totalPrice.toLocaleString()}
                          </Typography>
                      </Box>
                    </AccordionDetails>
                  </Accordion>
              </Box>
            );
        })}
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Typography variant="h3" component="h1" fontWeight="bold" sx={{ mb: 1, color: '#333' }}>
        My Orders
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Track your current orders and view history
      </Typography>
      {content}
    </Container>
  );
}

export default OrdersPage;
