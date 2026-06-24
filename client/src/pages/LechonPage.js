import React, { useState, useEffect } from 'react';
import api from '../api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useLoading } from '../context/LoadingContext';
import { useNotification } from '../context/NotificationContext'; // <--- NEW Notification Hook
import { useNavigate } from 'react-router-dom';

import {
  Container,
  Box,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Button,
  Alert
} from '@mui/material';
import { motion } from 'framer-motion';
import PeopleIcon from '@mui/icons-material/People';
import ScaleIcon from '@mui/icons-material/Scale';

// BRAND COLORS
import { theme } from '../theme';
const BRAND_DARK_ORANGE = theme.palette.primary.dark;

function LechonPage() {
  const [menuItems, setMenuItems] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);

  const { addItemToCart } = useCart();
  const { userInfo } = useAuth();
  const { showLoading, hideLoading } = useLoading();
  const { showNotification } = useNotification(); // <--- Destructure hook
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        showLoading('Chopping the Lechon...');
        
        const response = await api.get('/api/menu');
        const lechonItems = response.data.filter(item => item.category === 'Lechon');
        setMenuItems(lechonItems);
        setDataLoaded(true);
      } catch (error) {
        console.error('Error fetching menu items:', error);
      } finally {
        hideLoading();
      }
    };

    fetchMenuItems();
    // eslint-disable-next-line
  }, []);

  const handleAddToCart = (item) => {
    // --- STRICT LOGIN CHECK ---
    if (!userInfo) {
        navigate('/login?redirect=/lechon'); 
        return;
    }

    addItemToCart(item, 1);

    // <--- TRIGGER STACKABLE NOTIFICATION ---
    showNotification(`${item.name} added to cart!`, 'success');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <>
      {/* HEADER SECTION - Updated to Orange Theme */}
      <Box sx={{ bgcolor: theme.palette.primary.light, py: 6, mb: 4, textAlign: 'center', borderBottom: `1px solid ${theme.palette.primary.main}` }}>
        <Container maxWidth="lg">
          <Typography 
            variant="subtitle1" 
            sx={{ 
              color: BRAND_DARK_ORANGE, 
              fontWeight: '900', 
              letterSpacing: 2,
              textTransform: 'uppercase',
              mb: 1
            }}
          >
            Authentic & Crispy
          </Typography>
          <Typography 
            variant="h2" 
            component="h1"
            sx={{ 
              fontFamily: '"Arial Black", Gadget, sans-serif', 
              color: '#d84315', // Burnt Orange
              fontSize: { xs: '2.5rem', md: '4rem' },
              textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            LECHON PRICELIST
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mb: 8 }}>
        {/* Only show content when data is ready. The Spinner covers the empty state. */}
        {dataLoaded && (
          <Box
            component={motion.div}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <Grid container spacing={4}>
              {menuItems.length > 0 ? (
                menuItems.map((item) => (
                  <Grid
                    item
                    key={item._id}
                    xs={12}
                    sm={6}
                    md={4}
                    component={motion.div}
                    variants={cardVariants}
                  >
                    <Card
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        border: '1px solid #ffd8a8',
                        borderRadius: 3,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-5px)',
                          borderColor: theme.palette.primary.main,
                          boxShadow: '0 12px 20px rgba(230, 81, 0, 0.15)',
                        },
                      }}
                    >
                      <Box sx={{ position: 'relative', overflow: 'hidden' }}>
                        <CardMedia
                          component="img"
                          height="250"
                          image={item.imageUrl || 'https://via.placeholder.com/300x250'}
                          alt={item.name}
                          sx={{ objectFit: 'cover' }}
                        />
                      </Box>

                      <CardContent sx={{ flexGrow: 1, pt: 3, px: 3 }}>
                        <Typography variant="h5" component="div" sx={{ color: '#bf360c', fontWeight: 'bold', mb: 1 }}>
                          {item.name}
                        </Typography>

                        <Typography variant="h4" sx={{ color: theme.palette.primary.main, fontWeight: 'bold', mb: 3 }}>
                          ₱{item.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </Typography>

                        <Box sx={{ mb: 2, bgcolor: theme.palette.primary.light, p: 2, borderRadius: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <PeopleIcon sx={{ color: theme.palette.primary.main, mr: 1.5, fontSize: 20 }} />
                                <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#555' }}>
                                {item.goodFor || "Good for -- pax"}
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <ScaleIcon sx={{ color: theme.palette.primary.main, mr: 1.5, fontSize: 20 }} />
                                <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#555' }}>
                                {item.cookedWeight || "Weight Approx. -- kg"}
                                </Typography>
                            </Box>
                        </Box>
                      </CardContent>
                      
                      <CardActions sx={{ p: 3, pt: 0 }}>
                        <Button
                          variant="contained"
                          fullWidth
                          size="large"
                          sx={{ 
                            textTransform: 'none', 
                            bgcolor: theme.palette.primary.main,
                            fontWeight: 'bold',
                            fontSize: '1.1rem',
                            '&:hover': { 
                                bgcolor: BRAND_DARK_ORANGE,
                            } 
                          }}
                          onClick={() => handleAddToCart(item)}
                        >
                          ADD TO CART
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))
              ) : (
                <Grid item xs={12}>
                    <Alert severity="warning">
                        No Lechon items found. Please add items with category "Lechon" in the admin panel.
                    </Alert>
                </Grid>
              )}
            </Grid>
          </Box>
        )}
      </Container>
    </>
  );
}

export default LechonPage;
