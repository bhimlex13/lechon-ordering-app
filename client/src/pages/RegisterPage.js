import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext'; // Import Modal
import { useNavigate, Link as RouterLink } from 'react-router-dom';
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
  Grid,
  Link,
  Checkbox,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff, 
  CheckCircle, 
  Cancel, 
  Close as CloseIcon 
} from '@mui/icons-material';
import { branding } from '../config/branding';
import { theme } from '../theme';

function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Terms & Conditions State
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [openTerms, setOpenTerms] = useState(false);
  
  const [showPassword, setShowPassword] = useState(false);
  
  // Validation State
  const [errors, setErrors] = useState({});
  const [passwordCriteria, setPasswordCriteria] = useState({
    length: false,
    upper: false,
    lower: false,
    number: false,
    special: false
  });

  const { error: authError, loading, register, userInfo } = useAuth();
  const { showModal } = useModal(); // Use the modal context
  const navigate = useNavigate();

  // Redirect if already logged in (Initial Load Only)
  useEffect(() => {
    if (userInfo) {
       // Only redirect if we are NOT currently submitting a form
       // This prevents conflict with the modal logic
    }
  }, [userInfo, navigate]);

  // --- HANDLERS ---

  const handlePhoneChange = (e) => {
    const val = e.target.value.replace(/\D/g, ''); 
    if (val.length <= 11) {
      setPhone(val);
    }
  };

  const handleEmailBlur = () => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (email && !emailRegex.test(email)) {
        setErrors((prev) => ({ ...prev, email: "Please enter a valid email address." }));
    }
  };

  const handleEmailChange = (e) => {
      const val = e.target.value;
      setEmail(val);
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (emailRegex.test(val)) {
          setErrors((prev) => {
              const newErr = { ...prev };
              delete newErr.email;
              return newErr;
          });
      }
  };

  useEffect(() => {
    setPasswordCriteria({
      length: password.length >= 8,
      upper: /[A-Z]/.test(password),
      lower: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[@$!%*?&._-]/.test(password),
    });
  }, [password]);

  const validateInputs = () => {
    const newErrors = {};
    if (!name.trim() || name.length < 2) newErrors.name = "Name must be at least 2 characters.";
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) newErrors.email = "Please enter a valid email address.";
    const phoneRegex = /^09\d{9}$/;
    if (!phoneRegex.test(phone)) newErrors.phone = "Enter a valid PH mobile number (e.g., 09171234567).";

    const { length, upper, lower, number, special } = passwordCriteria;
    if (!length || !upper || !lower || !number || !special) {
      newErrors.password = "Password does not meet complexity requirements.";
    }
    if (password !== confirmPassword) newErrors.confirmPassword = "Passwords do not match.";
    if (!termsAccepted) newErrors.terms = "You must accept the Terms & Conditions.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateInputs()) {
      // 1. Call Register
      const result = await register(name, email, password, phone);
      
      // 2. Check result
      if (result.success) {
        // 3. Show Success Modal
        showModal({
          type: 'success',
          title: `Welcome to ${branding.name}!`,
          message: 'Your account has been successfully created. You can now start ordering delicious meals.',
          confirmText: 'Let\'s Eat!',
          onConfirm: () => {
            navigate('/'); // Redirect happens ONLY after clicking the button in modal
          }
        });
      } else {
        // 4. Show Error Modal (Optional, or just use the inline Alert)
        // We can keep the inline alert for errors as it's less intrusive for typos
      }
    }
  };

  const handleOpenTerms = () => setOpenTerms(true);
  const handleCloseTerms = () => setOpenTerms(false);

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

  return (
    <Container component="main" maxWidth="sm" sx={{ mt: 4, mb: 8 }}>
      <Paper elevation={3} sx={{ p: { xs: 3, md: 5 }, borderRadius: 3 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Box
                  component="img"
                  src="/images/logo.png"
                  alt="Logo"
                  sx={{ height: 60, width: 'auto', borderRadius: '50%', mb: 1 }}
            />
            <Typography component="h1" variant="h5" fontWeight="bold">
            Create an Account
            </Typography>
            <Typography variant="body2" color="text.secondary">
            Join {branding.name} to order delicious meals!
            </Typography>
        </Box>

        {authError && <Alert severity="error" sx={{ mb: 2 }}>{authError}</Alert>}
        {errors.terms && <Alert severity="warning" sx={{ mb: 2 }}>{errors.terms}</Alert>}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Full Name"
            placeholder="Juan Dela Cruz"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={!!errors.name}
            helperText={errors.name}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            label="Email Address"
            placeholder="juan@example.com"
            value={email}
            onChange={handleEmailChange}
            onBlur={handleEmailBlur}
            error={!!errors.email}
            helperText={errors.email}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            label="Mobile Number"
            value={phone}
            onChange={handlePhoneChange}
            error={!!errors.phone}
            helperText={errors.phone || "Format: 09xxxxxxxxx (11 digits)"}
            placeholder="09xxxxxxxxx"
          />

          <TextField
            margin="normal"
            required
            fullWidth
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={!!errors.password}
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

          <Box sx={{ mt: 1, mb: 2, p: 2, bgcolor: theme.palette.background.default, borderRadius: 2 }}>
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
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword}
          />

          <FormControlLabel
            control={<Checkbox checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} color="primary" />}
            label={
              <Typography variant="body2">
                I agree to the{' '}
                <Link component="button" variant="body2" onClick={handleOpenTerms} sx={{ fontWeight: 'bold' }}>
                  Terms & Conditions
                </Link>
              </Typography>
            }
            sx={{ mt: 1 }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            sx={{ mt: 3, mb: 2, fontWeight: 'bold' }}
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Register'}
          </Button>

          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="body2">
              Already have an account?{' '}
              <Link component={RouterLink} to="/login" variant="body2" sx={{ fontWeight: 'bold' }}>
                Sign in
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Dialog open={openTerms} onClose={handleCloseTerms} scroll="paper">
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Terms & Conditions
          <IconButton onClick={handleCloseTerms}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent dividers>
            <Typography variant="body1" paragraph>
                <strong>1. Acceptance of Terms</strong><br/>
                <Typography variant="body2" sx={{ mb: 2 }}>
                By registering an account with {branding.name}, you agree to comply with and be bound by these terms.
              </Typography>
            </Typography>
            <Typography variant="body1" paragraph>
                <strong>2. Ordering Process</strong><br/>
                All orders are subject to availability. Reservations for Lechon must be made at least 24 hours in advance.
            </Typography>
            <Typography variant="body1" paragraph>
                <strong>3. Data Privacy</strong><br/>
                Your personal information (Name, Contact No, Address) will be used solely for processing orders and improving our service. We do not share your data with third parties.
            </Typography>
            <Typography variant="body1" paragraph>
                <strong>4. Cancellations</strong><br/>
                Orders may be cancelled within 1 hour of placement. Lechon reservations require a 50% non-refundable down payment.
            </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTerms} variant="contained">I Understand</Button>
        </DialogActions>
      </Dialog>

    </Container>
  );
}

export default RegisterPage;