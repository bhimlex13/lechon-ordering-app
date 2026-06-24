import React, { useState, useEffect } from 'react';
import api from '../api';
import { useCart } from '../context/CartContext';
import usePageTitle from '../hooks/usePageTitle';
import { useAuth } from '../context/AuthContext';
import { useLoading } from '../context/LoadingContext';
import { useNotification } from '../context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';

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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  IconButton
} from '@mui/material';
import { motion } from 'framer-motion';
import CampaignIcon from '@mui/icons-material/Campaign';
import CloseIcon from '@mui/icons-material/Close';

function MenuPage() {
  const [menuItems, setMenuItems] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const theme = useTheme();

  // --- ANNOUNCEMENT STATE ---
  const [announcement, setAnnouncement] = useState({ message: '', enabled: false });
  const [showAnnouncement, setShowAnnouncement] = useState(false);

  usePageTitle('Menu');
  const { addItemToCart } = useCart();
  const { userInfo } = useAuth();
  const { showLoading, hideLoading } = useLoading();
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        showLoading('Preparing the menu...');
        
        // 1. Fetch Menu
        const menuRes = await api.get('/api/menu');
        const otherItems = menuRes.data.filter(item => item.category !== 'Lechon');
        setMenuItems(otherItems);

        // 2. Fetch Settings for Announcement
        const settingsRes = await api.get('/api/settings');
        const annSettings = settingsRes.data?.general?.announcement;
        
        // Check if enabled and should show on 'menu'
        if (annSettings?.enabled && annSettings?.showOnPages?.includes('menu')) {
            setAnnouncement(annSettings);
            setShowAnnouncement(true);
        }

        setDataLoaded(true);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        hideLoading();
      }
    };

    fetchData();
    // eslint-disable-next-line
  }, []);

  const handleAddToCart = (item) => {
    if (!userInfo) {
        navigate('/login?redirect=/menu');
        return;
    }
    addItemToCart(item, 1);
    showNotification(`${item.name} added to your order!`, 'success');
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
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: '#333' }}>
          Our Menu
        </Typography>
        <Typography variant="subtitle1" sx={{ mb: 4, color: 'text.secondary' }}>
          Delicious dishes to pair with your Lechon
        </Typography>

        {dataLoaded && (
          <Box
            component={motion.div}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <Grid container spacing={3}>
              {menuItems && menuItems.length > 0 ? (
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
                        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-5px)',
                          boxShadow: 6,
                        },
                      }}
                    >
                      <CardMedia
                        component="img"
                        height="200"
                        image={item.imageUrl || 'https://via.placeholder.com/300x200'}
                        alt={item.name}
                      />
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography gutterBottom variant="h5" component="div" fontWeight="bold">
                          {item.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {item.description}
                        </Typography>
                        <Typography
                          variant="h6"
                          color="primary"
                          sx={{ mt: 2, fontWeight: 'bold' }}
                        >
                          ₱{item.price.toFixed(2)}
                        </Typography>
                      </CardContent>
                      <CardActions sx={{ p: 2, pt: 0 }}>
                        <Button
                          variant="contained"
                          color="primary"
                          fullWidth
                          size="large"
                          sx={{ fontWeight: 'bold' }}
                          onClick={() => handleAddToCart(item)}
                        >
                          Add to Order
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))
              ) : (
                <Typography sx={{ ml: 3, mt: 3, color: 'text.secondary' }}>
                  No other menu items found.
                </Typography>
              )}
            </Grid>
          </Box>
        )}
      </Container>

      {/* --- ANNOUNCEMENT POPUP --- */}
      <Dialog 
        open={showAnnouncement} 
        onClose={() => setShowAnnouncement(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', bgcolor: theme.palette.primary.main, color: 'white' }}>
            <CampaignIcon sx={{ mr: 1 }} /> Announcement
            <IconButton onClick={() => setShowAnnouncement(false)} sx={{ ml: 'auto', color: 'white' }}>
                <CloseIcon />
            </IconButton>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
            <DialogContentText sx={{ fontSize: '1.1rem', color: '#333', whiteSpace: 'pre-line' }}>
                {announcement.message}
            </DialogContentText>
        </DialogContent>
        <DialogActions>
            <Button onClick={() => setShowAnnouncement(false)} variant="contained" sx={{ bgcolor: theme.palette.primary.main }}>
                Got it
            </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default MenuPage;
