import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Container, Typography, Box, Button, Paper, CircularProgress } from '@mui/material';

import { theme } from '../theme';

function MockPaymentPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [amount, setAmount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const amountParam = queryParams.get('amount');
    if (amountParam) {
      setAmount(Number(amountParam));
    }
  }, [location]);

  const handleSimulateSuccess = () => {
    setLoading(true);
    // Simulate network delay
    setTimeout(() => {
      // Redirect to the order page with the success flag
      navigate(`/orders/${orderId}?payment_success=true`);
    }, 1500);
  };

  const handleSimulateCancel = () => {
    navigate(`/checkout?payment_cancelled=true`);
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 10, mb: 10, textAlign: 'center' }}>
      <Paper elevation={4} sx={{ p: 5, borderRadius: 3 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom color="primary">
          Mock Payment Gateway
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          This is a simulated payment page for portfolio demonstration purposes. No real transaction is being processed.
        </Typography>

        <Box sx={{ my: 4, p: 3, bgcolor: '#f9f9f9', borderRadius: 2 }}>
          <Typography variant="h6" color="text.secondary">Total Amount to Pay</Typography>
          <Typography variant="h3" fontWeight="bold" sx={{ color: theme.palette.primary.main, mt: 1 }}>
            ₱{amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 4 }}>
          <Button 
            variant="contained" 
            size="large" 
            sx={{ bgcolor: theme.palette.primary.main, fontWeight: 'bold', py: 1.5 }}
            onClick={handleSimulateSuccess}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Simulate Payment Success'}
          </Button>
          <Button 
            variant="outlined" 
            color="inherit" 
            size="large" 
            sx={{ fontWeight: 'bold' }}
            onClick={handleSimulateCancel}
            disabled={loading}
          >
            Cancel Payment
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default MockPaymentPage;

