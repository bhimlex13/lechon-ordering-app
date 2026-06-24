import React, { useState } from 'react';
import { Container, Typography, Box, Grid, Paper, TextField, Button, Alert } from '@mui/material';
import usePageTitle from '../hooks/usePageTitle';
import { branding } from '../config/branding';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import FacebookIcon from '@mui/icons-material/Facebook';
import SendIcon from '@mui/icons-material/Send';

function ContactPage() {
  usePageTitle('Contact Us');
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setFormData({ name: '', email: '', message: '' });
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <Box sx={{ py: 6, minHeight: '80vh' }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            Contact Us
          </Typography>
          <Typography variant="h6" color="text.secondary">
            We'd love to hear from you! Reach out for catering, bulk orders, or inquiries.
          </Typography>
        </Box>

        <Grid container spacing={6}>
          {/* Contact Details & Map */}
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" fontWeight="bold" gutterBottom color="primary">
                Get in Touch
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, mt: 3 }}>
                  <LocationOnIcon color="primary" sx={{ mr: 2, fontSize: 30 }} />
                  <Box>
                      <Typography variant="subtitle2" color="text.secondary">Visit Us</Typography>
                      <Typography variant="body1">{branding.contact.address}</Typography>
                  </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <PhoneIcon color="primary" sx={{ mr: 2, fontSize: 30 }} />
                  <Box>
                      <Typography variant="subtitle2" color="text.secondary">Call Us</Typography>
                      <Typography variant="body1">{branding.contact.phone}</Typography>
                  </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <EmailIcon color="primary" sx={{ mr: 2, fontSize: 30 }} />
                  <Box>
                      <Typography variant="subtitle2" color="text.secondary">Email Us</Typography>
                      <Typography variant="body1">{branding.contact.email}</Typography>
                  </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <FacebookIcon color="primary" sx={{ mr: 2, fontSize: 30 }} />
                  <Box>
                      <Typography variant="subtitle2" color="text.secondary">Follow Us</Typography>
                      <Typography variant="body1">{branding.contact.facebook}</Typography>
                  </Box>
              </Box>
            </Box>

            <Paper elevation={3} sx={{ height: 300, borderRadius: 3, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#eee' }}>
              <Box 
                component="img"
                src="/images/contact.svg" 
                alt="Map"
                sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                    e.target.onerror = null; 
                    e.target.src = 'https://via.placeholder.com/600x400?text=Map+Location';
                }}
              />
            </Paper>
          </Grid>

          {/* Contact Form */}
          <Grid item xs={12} md={6}>
            <Paper elevation={4} sx={{ p: 4, borderRadius: 4 }}>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                Send us a Message
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Fill out the form below and our team will get back to you within 24 hours.
              </Typography>

              {submitted && (
                <Alert severity="success" sx={{ mb: 3 }}>
                  Thank you for your message! We will get back to you soon.
                </Alert>
              )}

              <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField 
                      fullWidth 
                      label="Full Name" 
                      variant="outlined" 
                      required 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField 
                      fullWidth 
                      label="Email Address" 
                      variant="outlined" 
                      type="email" 
                      required 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField 
                      fullWidth 
                      label="Message" 
                      variant="outlined" 
                      multiline 
                      rows={5} 
                      required 
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button 
                      type="submit" 
                      variant="contained" 
                      color="primary" 
                      size="large" 
                      fullWidth
                      endIcon={<SendIcon />}
                      sx={{ py: 1.5, fontWeight: 'bold' }}
                    >
                      Send Message
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default ContactPage;
