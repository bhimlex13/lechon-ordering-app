import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api'; 
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Grid
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff, 
  CheckCircle, 
  Cancel 
} from '@mui/icons-material';

function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // NEW: State to track if token is valid on load
  const [isTokenValid, setIsTokenValid] = useState(true); 
  const [validating, setValidating] = useState(true);

  // Validation State
  const [passwordCriteria, setPasswordCriteria] = useState({
    length: false,
    upper: false,
    lower: false,
    number: false,
    special: false
  });
  
  const { resetToken } = useParams();
  const navigate = useNavigate();

  // --- NEW: Check Token Validity on Mount ---
  useEffect(() => {
    const checkToken = async () => {
        try {
            await api.get(`/api/users/reset-password/${resetToken}`);
            setIsTokenValid(true);
        } catch (err) {
            setIsTokenValid(false);
            setError(err.response?.data?.message || "This link is invalid or has already been used.");
        } finally {
            setValidating(false);
        }
    };
    checkToken();
  }, [resetToken]);

  // Update password criteria in real-time
  useEffect(() => {
    setPasswordCriteria({
      length: password.length >= 8,
      upper: /[A-Z]/.test(password),
      lower: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[@$!%*?&._-]/.test(password),
    });
  }, [password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    const { length, upper, lower, number, special } = passwordCriteria;
    if (!length || !upper || !lower || !number || !special) {
      setError("Password does not meet complexity requirements.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await api.put(`/api/users/reset-password/${resetToken}`, { password });
      
      setSuccess(true);
      setMessage('Password updated successfully! Redirecting to login...');
      
      setTimeout(() => {
        navigate('/login');
      }, 3000);

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. Link may be expired.');
    } finally {
      setLoading(false);
    }
  };

  const RequirementItem = ({ met, text }) => (
    <ListItem dense sx={{ py: 0 }}>
      <ListItemIcon sx={{ minWidth: 30 }}>
        {met ? <CheckCircle color="success" fontSize="small" /> : <Cancel color="error" fontSize="small" />}
      </ListItemIcon>
      <ListItemText 
        primary={text} 
        primaryTypographyProps={{ variant: 'caption', color: met ? 'text.primary' : 'text.secondary' }} 
      />
    </ListItem>
  );

  // 1. Success Screen
  if (success) {
    return (
      <Container component="main" maxWidth="sm" sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2, textAlign: 'center' }}>
            <CheckCircle color="success" sx={{ fontSize: 60, mb: 2 }} />
            <Typography variant="h5" gutterBottom>Success!</Typography>
            <Typography variant="body1">{message}</Typography>
            <Button variant="contained" sx={{ mt: 3 }} onClick={() => navigate('/login')}>
                Go to Login Now
            </Button>
        </Paper>
      </Container>
    );
  }

  // 2. Loading Screen (while checking token)
  if (validating) {
      return (
          <Container component="main" maxWidth="sm" sx={{ mt: 8, textAlign: 'center' }}>
              <Typography>Verifying link...</Typography>
          </Container>
      );
  }

  // 3. Invalid Token Screen (Already Used / Expired)
  if (!isTokenValid) {
    return (
      <Container component="main" maxWidth="sm" sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2, textAlign: 'center' }}>
            <Cancel color="error" sx={{ fontSize: 60, mb: 2 }} />
            <Typography variant="h5" gutterBottom color="error">Link Expired</Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
                {error || "This password reset link is invalid or has already been used."}
            </Typography>
            <Button variant="contained" onClick={() => navigate('/login')}>
                Back to Login
            </Button>
        </Paper>
      </Container>
    );
  }

  // 4. Main Form (Only shows if token is valid)
  return (
    <Container component="main" maxWidth="sm" sx={{ mt: 8, mb: 4 }}>
      <Paper elevation={6} sx={{ p: 4, borderRadius: 2 }}>
        <Typography component="h1" variant="h5" align="center" fontWeight="bold" gutterBottom>
          Reset Password
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
          Please enter your new password below.
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="New Password"
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

          <Box sx={{ mt: 1, mb: 2, p: 2, bgcolor: 'background.default', borderRadius: 2, border: '1px solid #eee' }}>
            <Typography variant="caption" sx={{ fontWeight: 'bold' }}>Password Requirements:</Typography>
            <Grid container>
              <Grid item xs={6}>
                <List disablePadding>
                  <RequirementItem met={passwordCriteria.length} text="Min 8 chars" />
                  <RequirementItem met={passwordCriteria.upper} text="1 Uppercase" />
                  <RequirementItem met={passwordCriteria.lower} text="1 Lowercase" />
                </List>
              </Grid>
              <Grid item xs={6}>
                <List disablePadding>
                  <RequirementItem met={passwordCriteria.number} text="1 Number" />
                  <RequirementItem met={passwordCriteria.special} text="1 Special (@$!%*?&)" />
                </List>
              </Grid>
            </Grid>
          </Box>

          <TextField
            margin="normal"
            required
            fullWidth
            label="Confirm New Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2, py: 1.5, fontWeight: 'bold' }}
            disabled={loading}
          >
            {loading ? 'Resetting Password...' : 'Reset Password'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default ResetPasswordPage;