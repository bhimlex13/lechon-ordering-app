import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  CircularProgress,
  Alert,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Chip,
  Divider
} from '@mui/material';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import api from '../api';
import { branding } from '../config/branding';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

// Brand color for consistency
import { theme } from '../theme';

function OrderDetailPage() {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Cancel Dialog State
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError] = useState(null);

  // Payment Status Message State
  const [paymentMsg, setPaymentMsg] = useState(null);

  const { id: orderId } = useParams();
  const { userInfo } = useAuth();
  const location = useLocation();
  const { clearCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const paymentSuccess = queryParams.get('payment_success');
    const paymentCancelled = queryParams.get('payment_cancelled');

    // --- FIX: Handle Logged Out State ---
    if (!userInfo) {
        // If the user is not logged in but has payment params, 
        // redirect to login and COME BACK here after.
        if (paymentSuccess || paymentCancelled) {
             const returnUrl = `/orders/${orderId}${location.search}`; 
             navigate(`/login?redirect=${encodeURIComponent(returnUrl)}`);
        } else {
             // Just viewing normal order? Redirect to login.
             navigate(`/login?redirect=/orders/${orderId}`);
        }
        return;
    }

    const fetchOrder = async () => {
      setLoading(true);
      setError(null);
      try {
        // 1. If returning from PayMongo Success, verify with backend first
        if (paymentSuccess) {
            try {
                // Call the new verification endpoint
                const verifyRes = await api.put(`/api/orders/${orderId}/verify-payment`);
                
                if(verifyRes.data.message === 'Payment verified' || verifyRes.data.order.isPaid) {
                    setPaymentMsg({ type: 'success', text: 'Payment Verified! Thank you for your order.' });
                } else {
                    setPaymentMsg({ type: 'info', text: 'Payment is being processed. Please refresh shortly.' });
                }

                setOrder(verifyRes.data.order); // Use the updated order from backend
                clearCart();
                // Clean the URL history so a refresh doesn't re-trigger
                navigate(`/orders/${orderId}`, { replace: true });
                setLoading(false);
                return; // Stop here, we have the data
            } catch (verifyErr) {
                console.error("Verification Failed:", verifyErr);
                setPaymentMsg({ type: 'warning', text: 'Payment marked successful, but verification failed. Please contact support.' });
            }
        } else if (paymentCancelled) {
             setPaymentMsg({ type: 'error', text: 'Payment was cancelled. You can try again or choose another method.' });
        }

        // 2. Normal Fetch
        const { data } = await api.get(`/api/orders/${orderId}`);
        setOrder(data);
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

    fetchOrder();
    // eslint-disable-next-line
  }, [userInfo, orderId, location, navigate]); 

  const handleCancelOrder = async () => {
    setCancelLoading(true);
    setCancelError(null);
    try {
        const { data } = await api.put(`/api/orders/${orderId}/cancel`);
        setOrder(data); 
        setOpenCancelDialog(false);
        setPaymentMsg({ type: 'success', text: "Order Cancelled Successfully" });
    } catch (err) {
        setCancelError(
            err.response && err.response.data.message
              ? err.response.data.message
              : err.message
        );
    } finally {
        setCancelLoading(false);
    }
  };

  const handleRetryPayment = () => {
      if (order && order.checkoutUrl) {
          window.location.href = order.checkoutUrl;
      } else {
          alert("Payment link expired or unavailable. Please create a new order.");
      }
  };

  const canCancel = () => {
      if (!order) return false;
      if (order.status !== 'Pending' && order.status !== 'Processing') return false;
      if (order.status === 'Cancelled' || order.status === 'Delivered') return false;
      
      const scheduledDate = new Date(`${order.scheduledDate}T${order.scheduledTime}`);
      const now = new Date();
      // Calculate diff in hours
      const diffHours = (scheduledDate - now) / 36e5;
      
      return diffHours >= 48; // 48 Hours Rule (2 Days)
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 3 }}>{error}</Alert>
      </Container>
    );
  }

  if (!order) return null;

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 8 }}>
      
      {paymentMsg && (
          <Alert severity={paymentMsg.type} sx={{ mb: 3, boxShadow: 2 }}>{paymentMsg.text}</Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h4" component="h1" fontWeight="bold">
                Order #{order._id.substring(order._id.length - 6).toUpperCase()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
                Placed on: {formatDate(order.createdAt)}
            </Typography>
          </Box>
          <Chip 
             label={order.status.toUpperCase()} 
             color={order.status === 'Cancelled' ? 'error' : order.status === 'Delivered' ? 'success' : 'primary'}
             sx={{ fontWeight: 'bold', px: 2 }}
          />
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Order Details
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {order.orderItems.map((item) => (
              <Box
                key={item.product}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  mb: 2,
                  pb: 2,
                  borderBottom: '1px dashed #eee',
                }}
              >
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold">{item.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.qty} x ₱{item.price.toLocaleString()}
                  </Typography>
                </Box>
                <Typography variant="subtitle1" fontWeight="bold">
                  ₱{(item.qty * item.price).toLocaleString()}
                </Typography>
              </Box>
            ))}
            
            {/* Contact & Schedule Info */}
            <Box sx={{ mt: 3, p: 2, bgcolor: '#f8f9fa', borderRadius: 2, border: '1px solid #eee' }}>
                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary" fontWeight="bold">SCHEDULED DATE</Typography>
                        <Typography variant="body2">{new Date(order.scheduledDate).toDateString()}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary" fontWeight="bold">TIME</Typography>
                        <Typography variant="body2">{order.scheduledTime}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <Typography variant="caption" color="text.secondary" fontWeight="bold">PAYMENT METHOD</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body1" fontWeight="bold">{order.paymentMethod}</Typography>
                            {order.isPaid ? 
                                <Chip label="PAID" color="success" size="small" /> : 
                                <Chip label="PENDING" color="warning" size="small" />
                            }
                        </Box>
                    </Grid>
                </Grid>

                {order.orderType === 'Delivery' && (
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="caption" color="text.secondary" fontWeight="bold">DELIVERY ADDRESS</Typography>
                        <Typography variant="body2">
                            {order.deliveryAddress?.street}, {order.deliveryAddress?.barangay}, {order.deliveryAddress?.city}, {order.deliveryAddress?.province}
                        </Typography>
                    </Box>
                )}
            </Box>

            {/* --- BANK TRANSFER INSTRUCTIONS --- */}
            {order.paymentMethod === 'Bank Transfer' && order.status !== 'Cancelled' && (
                <Alert severity="info" sx={{ mt: 3 }}>
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>Bank Transfer Instructions</Typography>
                    <Typography variant="body2" sx={{ mb: 2, p: 2, bgcolor: '#f9f9f9', borderRadius: 2 }}>
                        Please transfer the exact amount and reply to your order confirmation email with the receipt.<br/>
                        <li><strong>BDO:</strong> 001234567890 (Juan Dela Cruz)</li>
                        <li><strong>GCash:</strong> {branding.payment.gcashNumber} ({branding.payment.gcashName})</li>
                    </Typography>
                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                        Please send proof of payment to our Facebook Page for verification.
                    </Typography>
                </Alert>
            )}

            {/* --- PAY ONLINE BUTTON (If pending and Online Method) --- */}
            {!order.isPaid && (order.paymentMethod === 'GCash' || order.paymentMethod === 'Maya') && order.status !== 'Cancelled' && (
                 <Button 
                    variant="contained" 
                    fullWidth 
                    sx={{ mt: 3, fontWeight: 'bold', bgcolor: theme.palette.primary.main }}
                    onClick={handleRetryPayment}
                 >
                    PAY NOW (Mock)
                 </Button>
            )}

          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Summary
            </Typography>
            
            {/* --- CALCULATE SUBTOTAL (Total - Tax - Delivery) --- */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography color="text.secondary">Subtotal</Typography>
              <Typography>₱{(order.totalPrice - (order.deliveryFee || 0) - (order.taxPrice || 0)).toLocaleString()}</Typography>
            </Box>
            
            {/* --- TAX ROW --- */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography color="text.secondary">Tax</Typography>
              <Typography>₱{(order.taxPrice || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography color="text.secondary">Delivery Fee</Typography>
              <Typography>{order.deliveryFee > 0 ? `₱${order.deliveryFee}` : 'Free'}</Typography>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Total
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
                ₱{order.totalPrice.toLocaleString()}
              </Typography>
            </Box>
            
            {/* --- CANCEL BUTTON --- */}
            {order.status !== 'Cancelled' && order.status !== 'Delivered' && (
                <>
                    {canCancel() ? (
                        <Button 
                            variant="outlined" 
                            color="error" 
                            fullWidth 
                            onClick={() => setOpenCancelDialog(true)}
                        >
                            Cancel Order
                        </Button>
                    ) : (
                        <Alert severity="warning" sx={{ fontSize: '0.75rem', py: 0 }}>
                            Cancellation is only allowed 48 hours before schedule.
                        </Alert>
                    )}
                </>
            )}

          </Paper>
        </Grid>
      </Grid>

      {/* --- CANCEL CONFIRMATION DIALOG --- */}
      <Dialog open={openCancelDialog} onClose={() => setOpenCancelDialog(false)}>
        <DialogTitle>Cancel Order?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to cancel this order? This action cannot be undone.
            <br/><br/>
            Note: If you have already paid via GCash/Maya, refunds may take 2-3 business days.
          </DialogContentText>
          {cancelError && <Alert severity="error" sx={{ mt: 1 }}>{cancelError}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCancelDialog(false)}>Keep Order</Button>
          <Button onClick={handleCancelOrder} color="error" disabled={cancelLoading} autoFocus>
            {cancelLoading ? 'Cancelling...' : 'Yes, Cancel Order'}
          </Button>
        </DialogActions>
      </Dialog>

    </Container>
  );
}

export default OrderDetailPage;
