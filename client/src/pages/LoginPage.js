import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext'; 
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import api from '../api';

import {
  Container, Box, TextField, Button, Typography, CircularProgress, Alert, Paper, Link, 
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, IconButton, InputAdornment, Divider
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Forgot Password State
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotEmailError, setForgotEmailError] = useState(''); // Added Error State
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState(null);
  const [forgotError, setForgotError] = useState(null);

  const { userInfo, loading, error, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const redirect = location.search ? location.search.split('=')[1] : '/';

  useEffect(() => {
    if (userInfo) {
        if (userInfo.role === 'Admin' || userInfo.role === 'Superadmin') {
            navigate('/admin/dashboard');
        } else {
            navigate(redirect);
        }
    }
  }, [userInfo, navigate, redirect]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(email, password);
  };

  // --- VALIDATION LOGIC ADDED ---
  const handleForgotEmailChange = (e) => {
    const val = e.target.value;
    setForgotEmail(val);
    
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (val && !emailRegex.test(val)) {
        setForgotEmailError("Please enter a valid email address.");
    } else {
        setForgotEmailError("");
    }
  };

  const handleForgotSubmit = async () => {
      // Final check before sending
      if (forgotEmailError || !forgotEmail) return;

      setForgotLoading(true);
      setForgotError(null);
      try {
          await api.post('/api/users/forgot-password', { email: forgotEmail });
          setForgotMessage(`Reset link sent to ${forgotEmail}. Link expires in 10 minutes.`);
      } catch (err) {
          setForgotError(err.response?.data?.message || 'Failed to send email');
      } finally {
          setForgotLoading(false);
      }
  };

  // Clear state when modal opens/closes
    const quickLogin = async (e, role) => {
      e.preventDefault();
      const demoEmail = role === 'admin' ? 'admin@crispylechonhouse.example' : 'customer@example.com';
      const demoPassword = 'password123';
      setEmail(demoEmail);
      setPassword(demoPassword);
      // Wait for state to update, or just dispatch directly
      login(demoEmail, demoPassword);
  };

  const toggleForgot = (open) => {
      setForgotOpen(open);
      if (open) {
          setForgotEmail('');
          setForgotEmailError('');
          setForgotMessage(null);
          setForgotError(null);
      }
  };

  return (
    <Container component="main" maxWidth="sm" sx={{ mt: 8, mb: 4 }}>
      <Paper elevation={6} sx={{ p: 4, borderRadius: 2 }}>
          <Typography component="h1" variant="h5" align="center" fontWeight="bold">Sign In</Typography>
          <Box sx={{ display: 'flex', gap: 2, mt: 2, mb: 1 }}>
            <Button variant="outlined" fullWidth onClick={(e) => quickLogin(e, 'customer')}>Login as Customer</Button>
            <Button variant="outlined" fullWidth color="secondary" onClick={(e) => quickLogin(e, 'admin')}>Login as Admin</Button>
          </Box>
          <Divider sx={{ my: 2 }}>OR</Divider>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
            
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <TextField 
                margin="normal" 
                required 
                fullWidth 
                label="Email Address" 
                autoFocus 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
            />
            
            <TextField 
                margin="normal" 
                required 
                fullWidth 
                label="Password" 
                type={showPassword ? 'text' : 'password'} 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                        </InputAdornment>
                    )
                }}
            />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                <Link component={RouterLink} to="/register" variant="body2">
                    Don't have an account? Sign Up
                </Link>
                <Link component="button" variant="body2" type="button" onClick={() => toggleForgot(true)}>
                    Forgot Password?
                </Link>
            </Box>

            <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2, py: 1.5, fontWeight: 'bold' }} disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'Sign In'}
            </Button>
          </Box>

        {/* FORGOT PASSWORD MODAL */}
        <Dialog open={forgotOpen} onClose={() => toggleForgot(false)} fullWidth maxWidth="xs">
          <DialogTitle>Reset Password</DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ mb: 2 }}>
              Enter your email address and we'll send you a link to reset your password.
            </DialogContentText>
            
            {forgotMessage && <Alert severity="success" sx={{ mb: 2 }}>{forgotMessage}</Alert>}
            {forgotError && <Alert severity="error" sx={{ mb: 2 }}>{forgotError}</Alert>}
            
            <TextField
              autoFocus
              margin="dense"
              label="Email Address"
              type="email"
              fullWidth
              variant="outlined"
              value={forgotEmail}
              onChange={handleForgotEmailChange}
              error={!!forgotEmailError}
              helperText={forgotEmailError}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => toggleForgot(false)}>Cancel</Button>
            <Button 
                onClick={handleForgotSubmit} 
                disabled={forgotLoading || !forgotEmail || !!forgotEmailError}
                variant="contained"
            >
              {forgotLoading ? 'Sending...' : 'Send Link'}
            </Button>
          </DialogActions>
        </Dialog>
       </Paper>
    </Container>
  );
}

export default LoginPage;


