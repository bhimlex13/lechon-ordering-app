import React from 'react';
import { Container, Typography, Box, Grid, Paper } from '@mui/material';
import usePageTitle from '../hooks/usePageTitle';
import { branding } from '../config/branding';

function StoriesPage() {
  usePageTitle('Our Story');

  return (
    <Box sx={{ py: 6 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            Our Story
          </Typography>
          <Typography variant="h6" color="text.secondary">
            The rich history behind {branding.name}
          </Typography>
        </Box>

        <Grid container spacing={6} alignItems="center">
          {/* Image Section */}
          <Grid item xs={12} md={6}>
            <Paper elevation={4} sx={{ borderRadius: 4, overflow: 'hidden' }}>
              <Box 
                component="img" 
                src="/images/story-placeholder.png" 
                alt="Our Story"
                sx={{ width: '100%', height: 'auto', display: 'block' }}
              />
            </Paper>
          </Grid>

          {/* Text Section */}
          <Grid item xs={12} md={6}>
            <Typography variant="h4" fontWeight="bold" gutterBottom color="primary">
              A Tradition of Flavor
            </Typography>
            <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
              Established with a passion for authentic Filipino cuisine, {branding.name} started as a humble family kitchen. We believed that the secret to the perfect lechon lies not just in the recipe, but in the patience and love poured into roasting it slowly over an open fire.
            </Typography>
            <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
              Over the years, our dedication to quality has allowed us to grow, but our core values remain the same. We source only the best local ingredients, ensuring that every bite delivers that signature crispy skin and juicy, flavorful meat that our customers crave.
            </Typography>
            <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.8, fontStyle: 'italic', fontWeight: 'bold' }}>
              "Sarap na 'di tinipid!"
            </Typography>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default StoriesPage;
