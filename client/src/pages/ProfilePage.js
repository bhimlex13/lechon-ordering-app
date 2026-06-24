import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Box, TextField, Button, Grid, Paper, Alert, CircularProgress, Divider, 
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import SaveIcon from '@mui/icons-material/Save';
import LockResetIcon from '@mui/icons-material/LockReset';
import CloseIcon from '@mui/icons-material/Close'; // Item #22: Close Icon
import api from '../api';

function ProfilePage() {
  const { userInfo, updateProfile, updateUserState, loading } = useAuth();
  
  // Profile State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [barangay, setBarangay] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  // Email Change State
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailStep, setEmailStep] = useState(1);
  const [newEmail, setNewEmail] = useState('');
  const [currentPasswordForEmail, setCurrentPasswordForEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState(null);
  const [emailSuccess, setEmailSuccess] = useState(null);

  // Password Change State (New Modal)
  const [passModalOpen, setPassModalOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passLoading, setPassLoading] = useState(false);
  const [passMessage, setPassMessage] = useState(null);
  const [passError, setPassError] = useState(null);

  useEffect(() => {
    if (userInfo) {
      setName(userInfo.name || '');
      setPhone(userInfo.phone || '');
      if (userInfo.address) {
        setStreet(userInfo.address.street || '');
        setBarangay(userInfo.address.barangay || '');
        setCity(userInfo.address.city || '');
        setProvince(userInfo.address.province || '');
      }
    }
  }, [userInfo]);

  // --- PROFILE UPDATE HANDLER ---
  const submitHandler = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    try {
      await updateProfile({
        name,
        phone,
        address: { street, barangay, city, province }
      });
      setMessage('Profile Updated Successfully!');
    } catch (err) {
      setError('Failed to update profile. Please try again.');
    }
  };

  // --- PASSWORD UPDATE HANDLER (Item #25) ---
  const handlePasswordChange = async () => {
      setPassMessage(null);
      setPassError(null);
      
      if (password !== confirmPassword) {
          setPassError("New passwords do not match");
          return;
      }
      if (password.length < 8) {
          setPassError("Password must be at least 8 characters");
          return;
      }

      setPassLoading(true);
      try {
           await updateProfile({ password });
           setPassMessage("Password Changed Successfully!");
           setPassword('');
           setConfirmPassword('');
           // Close modal after delay
           setTimeout(() => {
               setPassModalOpen(false);
               setPassMessage(null);
           }, 1500);
      } catch (err) {
           setPassError(err.message || "Failed to update password");
      } finally {
           setPassLoading(false);
      }
  };

  // --- EMAIL CHANGE HANDLERS ---
  const handleEmailInit = async () => {
      setEmailLoading(true);
      setEmailError(null);
      try {
          await api.post('/api/users/change-email-init', {
              currentPassword: currentPasswordForEmail,
              newEmail: newEmail
          });
          setEmailStep(2);
      } catch (err) {
          setEmailError(err.response?.data?.message || 'Failed to send OTP');
      } finally {
          setEmailLoading(false);
      }
  };

  const handleEmailVerify = async () => {
      setEmailLoading(true);
      setEmailError(null);
      try {
          const { data } = await api.post('/api/users/change-email-verify', { otp });
          updateUserState(data); 
          setEmailSuccess('Email changed successfully!');
          setTimeout(() => {
              setEmailModalOpen(false);
              setEmailStep(1);
              setNewEmail('');
              setOtp('');
              setCurrentPasswordForEmail('');
              setEmailSuccess(null);
          }, 1500);
      } catch (err) {
          setEmailError(err.response?.data?.message || 'Invalid OTP');
      } finally {
          setEmailLoading(false);
      }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 8 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold">My Profile</Typography>
      
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={submitHandler}>
          <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>Personal Details</Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}><TextField label="Full Name" fullWidth value={name} onChange={(e) => setName(e.target.value)} required /></Grid>
            <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField label="Email Address" fullWidth value={userInfo?.email} disabled />
                    <Button variant="outlined" color="secondary" onClick={() => setEmailModalOpen(true)}>Change</Button>
                </Box>
            </Grid>
            <Grid item xs={12}>
              <TextField label="Phone Number" fullWidth value={phone} onChange={(e) => { const val = e.target.value; if (/^\d*$/.test(val)) setPhone(val); }} helperText="Format: 09xxxxxxxxx" />
            </Grid>
          </Grid>

          <Divider sx={{ mb: 3 }} />
          <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>Delivery Address</Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
             <Grid item xs={12}><TextField label="Street Address / Landmark" fullWidth value={street} onChange={(e) => setStreet(e.target.value)} /></Grid>
             <Grid item xs={12} md={4}><TextField label="Barangay" fullWidth value={barangay} onChange={(e) => setBarangay(e.target.value)} /></Grid>
             <Grid item xs={12} md={4}><TextField label="City" fullWidth value={city} onChange={(e) => setCity(e.target.value)} /></Grid>
             <Grid item xs={12} md={4}><TextField label="Province" fullWidth value={province} onChange={(e) => setProvince(e.target.value)} /></Grid>
          </Grid>

          <Divider sx={{ mb: 3 }} />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Button 
                variant="outlined" 
                color="primary" 
                startIcon={<LockResetIcon />}
                onClick={() => setPassModalOpen(true)}
              >
                  Change Password
              </Button>

              <Button type="submit" variant="contained" color="primary" size="large" startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />} disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
          </Box>
        </Box>
      </Paper>

      {/* --- CHANGE PASSWORD MODAL --- */}
      <Dialog open={passModalOpen} onClose={() => setPassModalOpen(false)} fullWidth maxWidth="sm">
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              Change Password
              <IconButton onClick={() => setPassModalOpen(false)}><CloseIcon /></IconButton>
          </DialogTitle>
          <DialogContent>
              {passError && <Alert severity="error" sx={{ mb: 2, mt: 1 }}>{passError}</Alert>}
              {passMessage && <Alert severity="success" sx={{ mb: 2, mt: 1 }}>{passMessage}</Alert>}
              
              <TextField 
                margin="normal" 
                label="New Password" 
                type="password" 
                fullWidth 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
              />
              <TextField 
                margin="normal" 
                label="Confirm New Password" 
                type="password" 
                fullWidth 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
              />
          </DialogContent>
          <DialogActions>
              <Button onClick={() => setPassModalOpen(false)}>Cancel</Button>
              <Button onClick={handlePasswordChange} variant="contained" disabled={passLoading || !password}>
                  {passLoading ? 'Updating...' : 'Update Password'}
              </Button>
          </DialogActions>
      </Dialog>

      {/* --- CHANGE EMAIL MODAL --- */}
      <Dialog open={emailModalOpen} onClose={() => setEmailModalOpen(false)} fullWidth maxWidth="sm">
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              Change Email
              <IconButton onClick={() => setEmailModalOpen(false)}><CloseIcon /></IconButton>
          </DialogTitle>
          <DialogContent>
              {emailError && <Alert severity="error" sx={{ mb: 2, mt: 1 }}>{emailError}</Alert>}
              {emailSuccess && <Alert severity="success" sx={{ mb: 2, mt: 1 }}>{emailSuccess}</Alert>}
              {emailStep === 1 ? (
                  <>
                    <Typography variant="body2" sx={{ mb: 2, mt: 1 }}>To update your email, please enter your current password and the new email address.</Typography>
                    <TextField label="Current Password" type="password" fullWidth sx={{ mb: 2 }} value={currentPasswordForEmail} onChange={(e) => setCurrentPasswordForEmail(e.target.value)} />
                    <TextField label="New Email Address" type="email" fullWidth value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
                  </>
              ) : (
                  <>
                    <Typography variant="body2" sx={{ mb: 2, mt: 1 }}>An OTP has been sent to <strong>{newEmail}</strong>.</Typography>
                    <TextField label="Enter 6-Digit OTP" fullWidth sx={{ mt: 1 }} value={otp} onChange={(e) => setOtp(e.target.value)} inputProps={{ maxLength: 6, style: { textAlign: 'center', fontSize: '1.5rem', letterSpacing: '5px' } }} />
                  </>
              )}
          </DialogContent>
          <DialogActions>
              <Button onClick={() => setEmailModalOpen(false)}>Cancel</Button>
              {emailStep === 1 ? (
                  <Button onClick={handleEmailInit} variant="contained" disabled={emailLoading || !newEmail || !currentPasswordForEmail}>{emailLoading ? 'Sending...' : 'Send OTP'}</Button>
              ) : (
                  <Button onClick={handleEmailVerify} variant="contained" color="success" disabled={emailLoading || otp.length !== 6}>{emailLoading ? 'Verifying...' : 'Verify & Change'}</Button>
              )}
          </DialogActions>
      </Dialog>
    </Container>
  );
}

export default ProfilePage;