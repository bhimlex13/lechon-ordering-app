import React from 'react';
import { Container, Typography, Box, Grid, Card, CardContent, CardMedia, Button } from '@mui/material';
import usePageTitle from '../hooks/usePageTitle';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const stores = [
  {
    id: 1,
    name: "Main Branch (Quezon City)",
    address: "123 Lechon Avenue, Quezon City, Metro Manila",
    phone: "0912-345-6789",
    hours: "8:00 AM - 9:00 PM (Mon-Sun)",
    image: "/images/store-placeholder.png"
  },
  {
    id: 2,
    name: "Makati Branch",
    address: "456 Business Blvd, Makati City, Metro Manila",
    phone: "0998-765-4321",
    hours: "9:00 AM - 10:00 PM (Mon-Sun)",
    image: "/images/store-placeholder.png"
  },
  {
    id: 3,
    name: "Cebu Branch",
    address: "789 Mango Avenue, Cebu City, Cebu",
    phone: "0911-222-3333",
    hours: "8:00 AM - 8:00 PM (Mon-Sun)",
    image: "/images/store-placeholder.png"
  }
];

function StoresPage() {
  usePageTitle('Our Stores');

  return (
    <Box sx={{ py: 6, bgcolor: '#f9f9f9', minHeight: '80vh' }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            Our Branches
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Find the nearest Crispy Lechon House to you
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {stores.map((store) => (
            <Grid item xs={12} md={4} key={store.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', boxShadow: 3, borderRadius: 3, '&:hover': { transform: 'translateY(-5px)', transition: '0.3s' } }}>
                <CardMedia
                  component="img"
                  height="220"
                  image={store.image}
                  alt={store.name}
                />
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Typography gutterBottom variant="h5" fontWeight="bold">
                    {store.name}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mt: 2, mb: 1 }}>
                    <LocationOnIcon color="primary" sx={{ mr: 1, mt: 0.5 }} />
                    <Typography variant="body1" color="text.secondary">
                      {store.address}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <PhoneIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="body1" color="text.secondary">
                      {store.phone}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <AccessTimeIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="body1" color="text.secondary">
                      {store.hours}
                    </Typography>
                  </Box>
                  <Button variant="outlined" color="primary" fullWidth startIcon={<LocationOnIcon />}>
                    Get Directions
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}

export default StoresPage;
