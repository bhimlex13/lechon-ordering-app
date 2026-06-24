import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Typography, 
  Link, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogContentText, 
  DialogActions, 
  Button
} from '@mui/material';
import { theme } from '../theme';
import { branding } from '../config/branding';

function Footer() {
  const [openTerms, setOpenTerms] = useState(false);
  const [openPrivacy, setOpenPrivacy] = useState(false);
  return (
    <>
      <Box
        component="footer"
        sx={{
          backgroundColor: theme.palette.background.footer, // Dark Grey Background
          color: 'white',             // White Text
          p: 3,
          mt: 'auto',
          borderTop: `4px solid ${theme.palette.primary.main}`,
          textAlign: 'center'
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1, color: 'rgba(255,255,255,0.9)' }}>
            COPYRIGHT © {new Date().getFullYear()} {branding.name.toUpperCase()} 
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
            <Link 
              component="button" 
              variant="body2" 
              onClick={() => setOpenTerms(true)}
              sx={{ 
                color: theme.palette.primary.main, // Orange Link
                textDecoration: 'none', 
                fontWeight: 'bold', 
                border: `1px solid ${theme.palette.primary.main}`, 
                px: 1,
                '&:hover': { color: '#fff', borderColor: '#fff' }
              }}
            >
              TERMS OF USE
            </Link>
            
            <Typography variant="caption" sx={{ color: 'grey.500' }}>|</Typography>
            
            <Link 
              component="button" 
              variant="body2" 
              onClick={() => setOpenPrivacy(true)}
              sx={{ 
                color: theme.palette.primary.main, // Orange Link
                textDecoration: 'none', 
                fontWeight: 'bold', 
                border: `1px solid transparent`, 
                px: 1,
                '&:hover': { color: '#fff' }
              }}
            >
              PRIVACY POLICY
            </Link>
                      <Typography variant="caption" sx={{ color: 'grey.500' }}>|</Typography>
            <Link 
              component={RouterLink} 
              to="/developer"
              variant="body2" 
              sx={{ 
                color: theme.palette.primary.main, 
                textDecoration: 'none', 
                fontWeight: 'bold', 
                border: '1px solid transparent', 
                px: 1,
                '&:hover': { color: '#fff' }
              }}
            >
              ABOUT THE DEVELOPER
            </Link>
          </Box>
        </Container>

          </Box>

      {/* --- TERMS OF USE MODAL --- */}
      <Dialog open={openTerms} onClose={() => setOpenTerms(false)} scroll="paper">
        <DialogTitle sx={{ bgcolor: theme.palette.primary.main, color: 'white' }}>Terms of Use</DialogTitle>
        <DialogContent dividers>
          <DialogContentText tabIndex={-1} sx={{ color: '#333' }}>
            <Typography variant="h6" gutterBottom sx={{ color: 'black' }}>1. Acceptance of Terms</Typography>
            <Typography paragraph>
                By accessing and using the {branding.name} website, you agree to comply with and be bound by these terms and conditions.
            </Typography>

            <Typography variant="h6" gutterBottom sx={{ color: 'black' }}>2. Ordering & Payments</Typography>
            <Typography paragraph>
                All orders placed through the website are subject to acceptance. We reserve the right to refuse service. 
                Payments via GCash/Maya/Card are processed securely. Unpaid orders (if applicable) may be cancelled.
            </Typography>

            <Typography variant="h6" gutterBottom sx={{ color: 'black' }}>3. Cancellations & Refunds</Typography>
            <Typography paragraph>
                <strong>Cancellation:</strong> Orders may be cancelled within 1 hour of placement, provided preparation has not begun.
                <br/>
                <strong>Refunds:</strong> Refunds are processed only for valid complaints regarding food quality or unfulfilled orders, subject to investigation.
            </Typography>

            <Typography variant="h6" gutterBottom sx={{ color: 'black' }}>4. Intellectual Property</Typography>
            <Typography paragraph>
                All content, logos, and images on this site are the property of {branding.name}.
            </Typography>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTerms(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* --- PRIVACY POLICY MODAL --- */}
      <Dialog open={openPrivacy} onClose={() => setOpenPrivacy(false)} scroll="paper">
        <DialogTitle sx={{ bgcolor: '#333', color: 'white' }}>Privacy Policy</DialogTitle>
        <DialogContent dividers>
          <DialogContentText tabIndex={-1} sx={{ color: '#333' }}>
            <Typography variant="h6" gutterBottom sx={{ color: 'black' }}>1. Data Collection</Typography>
            <Typography paragraph>
                We collect personal information (Name, Address, Contact Number, Email) solely for the purpose of processing your orders and delivery.
            </Typography>

            <Typography variant="h6" gutterBottom sx={{ color: 'black' }}>2. Use of Information</Typography>
            <Typography paragraph>
                Your data is used to:
                <ul>
                    <li>Process and deliver your food orders.</li>
                    <li>Contact you regarding order updates.</li>
                    <li>Send electronic receipts.</li>
                </ul>
                We do not sell your data to third parties.
            </Typography>

            <Typography variant="h6" gutterBottom sx={{ color: 'black' }}>3. Data Security</Typography>
            <Typography paragraph>
                We implement security measures to maintain the safety of your personal information. Payment details are processed securely and are not stored on our servers.
            </Typography>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPrivacy(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
export default Footer;




