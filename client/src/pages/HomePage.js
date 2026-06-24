import React, { useState, useEffect, useRef } from 'react';
import api from '../api'; 
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useLoading } from '../context/LoadingContext';
import { useNotification } from '../context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { branding } from '../config/branding';
import PlaceholderImage from '../components/PlaceholderImage';
import usePageTitle from '../hooks/usePageTitle';
import { theme } from '../theme';

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
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  IconButton,
  Paper,
  Divider
} from '@mui/material';
import { motion } from 'framer-motion';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import CampaignIcon from '@mui/icons-material/Campaign';
import CloseIcon from '@mui/icons-material/Close';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import FacebookIcon from '@mui/icons-material/Facebook';
import ZoomInIcon from '@mui/icons-material/ZoomIn'; 

// --- ANIMATION VARIANTS (Defined Outside) ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

// --- MENU GRID COMPONENT (Defined Outside to prevent blinking) ---
const MenuGrid = ({ items, onAddToCart }) => (
  <Grid container spacing={{ xs: 2, md: 3 }}>
    {items && items.length > 0 ? (
      items.map((item) => (
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
              transition: '0.3s',
              '&:hover': {
                transform: { md: 'translateY(-8px)' },
                boxShadow: 6,
              },
            }}
          >
            <Box sx={{ position: 'relative' }}>
              {item.imageUrl ? (
                <CardMedia
                  component="img"
                  height="250"
                  image={item.imageUrl}
                  alt={item.name}
                  sx={{ objectFit: 'cover' }}
                />
              ) : (
                <PlaceholderImage name={item.name} category={item.category?.name || item.category} height="250px" />
              )}
              
              {/* FIXED: Robust Category Label Check */}
              {(item.category || item.categoryName) && (
                <Chip 
                  label={item.category?.name || item.category || 'Special'} 
                  size="small"
                  color="secondary"
                  sx={{ position: 'absolute', top: 10, right: 10, fontWeight: 'bold' }} 
                />
              )}
            </Box>

            <CardContent sx={{ flexGrow: 1, p: { xs: 2, md: 3 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Typography gutterBottom variant="h6" component="div" sx={{ fontWeight: 'bold', mb: 0, lineHeight: 1.2 }}>
                  {item.name}
                  </Typography>
                  <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold', whiteSpace: 'nowrap', ml: 1 }}>
                  ₱{item.price.toFixed(2)}
                  </Typography>
              </Box>
              
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                {item.description}
              </Typography>
            </CardContent>

            <CardActions sx={{ p: 2, pt: 0 }}>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                startIcon={<AddShoppingCartIcon />}
                onClick={() => onAddToCart(item)}
                sx={{ fontWeight: 'bold', boxShadow: 2 }}
              >
                Add to Order
              </Button>
            </CardActions>
          </Card>
        </Grid>
      ))
    ) : (
      <Box sx={{ width: '100%', textAlign: 'center', py: 5 }}>
          <Typography variant="body1" color="text.secondary">
              No items available in this section.
          </Typography>
      </Box>
    )}
  </Grid>
);

function HomePage() {
  const [lechonItems, setLechonItems] = useState([]);
  const [regularItems, setRegularItems] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  
  const [announcement, setAnnouncement] = useState({ message: '🔥 Grand Opening Special: Get 10% off your first whole lechon order! Use code CRISPY10 at checkout.', enabled: true });
  const [showAnnouncement, setShowAnnouncement] = useState(false);

  usePageTitle('Home');

  const [width, setWidth] = useState(0);
  const carousel = useRef();
  const [selectedImage, setSelectedImage] = useState(null); 

  const { addItemToCart } = useCart();
  const { userInfo } = useAuth();
  const { showLoading, hideLoading } = useLoading();
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  
  const dineInMenuImages = [
    '/images/menu-page-1.png',
    '/images/menu-page-2.png',
    '/images/menu-page-3.png',
    '/images/menu-page-4.png',
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Only show loading if empty to prevent full screen flash on re-renders
        if (lechonItems.length === 0) showLoading('Loading...'); 

        const menuRes = await api.get('/api/menu');
        const allItems = menuRes.data;

        // Robust checking for category name (handles populated object or string ID)
        const lechon = allItems.filter(item => {
            const catName = item.category?.name || item.category || '';
            return catName.toLowerCase().includes('lechon') || item.name.toLowerCase().includes('lechon');
        });
        
        const regular = allItems.filter(item => {
            const catName = item.category?.name || item.category || '';
            return !catName.toLowerCase().includes('lechon') && !item.name.toLowerCase().includes('lechon');
        });

        setLechonItems(lechon);
        setRegularItems(regular);

        const settingsRes = await api.get('/api/settings');
        const annSettings = settingsRes.data?.general?.announcement;
        
        if (annSettings?.enabled && annSettings?.showOnPages?.includes('home')) {
            setAnnouncement(annSettings);
            if (!localStorage.getItem('announcementDismissed')) {
                setShowAnnouncement(true);
            } else {
                setShowAnnouncement(false);
            }
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

  useEffect(() => {
    if (carousel.current) {
        setWidth(carousel.current.scrollWidth - carousel.current.offsetWidth);
    }
  }, [dataLoaded]); 

  const handleAddToCart = (item) => {
    if (!userInfo) {
        navigate('/login?redirect=/'); 
        return;
    }
    addItemToCart(item, 1);
    showNotification(`${item.name} added to your cart!`, 'success');
  };

  return (
    <>
      {/* --- HERO BANNER --- */}
      <Box
        sx={{
          height: { xs: '35vh', md: '50vh' },
          minHeight: { xs: '220px', md: '400px' },
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#000',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundImage: `url(/images/hero-banner.jpg)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            opacity: 0.8,
          }}
        />
      </Box>

      <Container maxWidth="lg" sx={{ mt: 6, mb: 8 }}>
        
        {dataLoaded && (
          <Box
            component={motion.div}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* --- SECTION 1: LECHON LIST --- */}
            <Box sx={{ mb: 6 }}>
                <Typography 
                    variant="h3" 
                    component="h2"
                    color="primary"
                    sx={{ 
                        textAlign: { xs: 'center', md: 'left' },
                        mb: 1,
                        fontWeight: '800'
                    }}
                >
                Our Famous Lechon
                </Typography>
                <Typography variant="body1" sx={{ mb: 4, textAlign: { xs: 'center', md: 'left' }, color: 'text.secondary' }}>
                    The star of any feast. Crispy skin, juicy meat, packed with flavor.
                </Typography>
                
                {/* Passed handleAddToCart as prop */}
                <MenuGrid items={lechonItems} onAddToCart={handleAddToCart} />
            </Box>

            <Divider sx={{ my: 6 }} />

            {/* --- SECTION 2: REGULAR MENU --- */}
            <Box>
                <Typography 
                    variant="h3" 
                    component="h2"
                    sx={{ 
                        textAlign: { xs: 'center', md: 'left' },
                        mb: 1,
                        fontWeight: '800'
                    }}
                >
                A La Carte Menu
                </Typography>
                <Typography variant="body1" sx={{ mb: 4, textAlign: { xs: 'center', md: 'left' }, color: 'text.secondary' }}>
                    Perfect companions for your meal. From soups to savory dishes.
                </Typography>

                <MenuGrid items={regularItems} onAddToCart={handleAddToCart} />
            </Box>

          </Box>
        )}
      </Container>

      {/* --- SECTION 3: DINE-IN MENU CAROUSEL (Draggable & Zoomable) --- */}
      <Box sx={{ bgcolor: theme.palette.primary.light, py: 8, mb: 0 }}>
        <Container maxWidth="lg">
            <Typography 
              variant="h3" 
              gutterBottom 
              sx={{ textAlign: 'center', mb: 1, color: theme.palette.primary.main, fontWeight: 'bold' }}
            >
              Dine-In Menu
            </Typography>
            <Typography variant="body1" align="center" sx={{ mb: 5, color: 'text.secondary' }}>
               A sneak peek at our full menu for our dine-in customers.
               <br/>
               <Typography variant="caption" component="span" sx={{ fontStyle: 'italic' }}>
                   (Drag to scroll, click to zoom)
               </Typography>
            </Typography>

            {/* Draggable Carousel Container */}
            <motion.div 
                ref={carousel} 
                className="carousel" 
                whileTap={{ cursor: "grabbing" }}
                style={{ overflow: 'hidden', cursor: 'grab' }}
            >
                <motion.div
                    drag="x"
                    dragConstraints={{ right: 0, left: -width }}
                    style={{ display: 'flex', gap: '20px', paddingBottom: '20px' }}
                >
                    {dineInMenuImages.map((img, index) => (
                        <motion.div 
                            key={index} 
                            style={{ 
                                width: '240px',   
                                height: '340px',  
                                flexShrink: 0 
                            }}
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Paper 
                                elevation={4}
                                sx={{ 
                                    borderRadius: 3, 
                                    overflow: 'hidden', 
                                    height: '100%',
                                    width: '100%',
                                    cursor: 'pointer',
                                    position: 'relative',
                                    '&:hover .zoom-icon': { opacity: 1 }
                                }}
                                onClick={() => setSelectedImage(img)}
                            >
                                <Box className="zoom-icon" sx={{ 
                                    position: 'absolute', 
                                    top: '50%', 
                                    left: '50%', 
                                    transform: 'translate(-50%, -50%)', 
                                    bgcolor: 'rgba(0,0,0,0.6)', 
                                    color: 'white',
                                    borderRadius: '50%',
                                    p: 1,
                                    opacity: 0,
                                    transition: '0.3s'
                                }}>
                                    <ZoomInIcon />
                                </Box>

                                <Box 
                                    component="img"
                                    src={img}
                                    alt={`Menu Page ${index + 1}`}
                                    sx={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        objectPosition: 'top',
                                        pointerEvents: 'none' 
                                    }}
                                    onError={(e) => {
                                        e.target.onerror = null; 
                                        e.target.src = 'https://via.placeholder.com/240x340?text=No+Image';
                                    }}
                                />
                            </Paper>
                        </motion.div>
                    ))}
                </motion.div>
            </motion.div>
        </Container>
      </Box>

      {/* --- CONTACT US SECTION --- */}
      <Box id="contact" sx={{ bgcolor: theme.palette.background.footer, color: 'white', py: 8 }}>
        <Container maxWidth="lg">
            <Grid container spacing={4} alignItems="center">
                <Grid item xs={12} md={6}>
                    <Typography variant="overline" sx={{ color: theme.palette.primary.main, fontWeight: 'bold', letterSpacing: 2 }}>
                        GET IN TOUCH
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 2 }}>
                        Contact Us
                    </Typography>
                    <Typography variant="h6" sx={{ mb: 4, fontStyle: 'italic', opacity: 0.8 }}>
                        "Sarap na 'di tinipid!"
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <LocationOnIcon sx={{ color: theme.palette.primary.main, mr: 2, fontSize: 30 }} />
                        <Box>
                            <Typography variant="subtitle2" sx={{ color: '#aaa' }}>Visit Us</Typography>
                            <Typography variant="body1">
                                {branding.contact.address}
                            </Typography>
                        </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <PhoneIcon sx={{ color: theme.palette.primary.main, mr: 2, fontSize: 30 }} />
                        <Box>
                            <Typography variant="subtitle2" sx={{ color: '#aaa' }}>Call Us</Typography>
                            <Typography variant="body1">{branding.contact.phone}</Typography>
                        </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <EmailIcon sx={{ color: theme.palette.primary.main, mr: 2, fontSize: 30 }} />
                        <Box>
                            <Typography variant="subtitle2" sx={{ color: '#aaa' }}>Email Us</Typography>
                            <Typography variant="body1">{branding.contact.email}</Typography>
                        </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <FacebookIcon sx={{ color: theme.palette.primary.main, mr: 2, fontSize: 30 }} />
                        <Box>
                            <Typography variant="subtitle2" sx={{ color: '#aaa' }}>Facebook</Typography>
                            <Typography variant="body1">{branding.contact.facebook}</Typography>
                        </Box>
                    </Box>

                </Grid>
                <Grid item xs={12} md={6}>
                     <Paper 
                        elevation={4} 
                        sx={{ 
                            height: 400, 
                            bgcolor: '#333', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            borderRadius: 4,
                            overflow: 'hidden'
                        }}
                     >
                        <Box 
                            component="img"
                            src="/images/contact.svg" 
                            alt="Shop Location"
                            sx={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }}
                        />
                     </Paper>
                </Grid>
            </Grid>
        </Container>
      </Box>

      {/* --- ANNOUNCEMENT POPUP --- */}
      <Dialog 
        open={showAnnouncement} 
        onClose={() => {
            setShowAnnouncement(false);
            localStorage.setItem('announcementDismissed', 'true');
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', bgcolor: theme.palette.primary.main, color: 'white' }}>
            <CampaignIcon sx={{ mr: 1 }} /> Announcement
            <IconButton onClick={() => {
                setShowAnnouncement(false);
                localStorage.setItem('announcementDismissed', 'true');
            }} sx={{ ml: 'auto', color: 'white' }}>
                <CloseIcon />
            </IconButton>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
            <DialogContentText sx={{ fontSize: '1.1rem', color: '#333', whiteSpace: 'pre-line' }}>
                {announcement.message}
            </DialogContentText>
        </DialogContent>
        <DialogActions>
            <Button onClick={() => {
                setShowAnnouncement(false);
                localStorage.setItem('announcementDismissed', 'true');
            }} variant="contained" sx={{ bgcolor: theme.palette.primary.main }}>
                Got it
            </Button>
        </DialogActions>
      </Dialog>

      {/* --- IMAGE ZOOM MODAL (NEW) --- */}
      <Dialog 
        open={!!selectedImage} 
        onClose={() => setSelectedImage(null)}
        maxWidth="md"
        fullWidth
        scroll="body"
        PaperProps={{
            style: { backgroundColor: 'transparent', boxShadow: 'none' }
        }}
      >
         <Box sx={{ position: 'relative', textAlign: 'center' }}>
            <IconButton 
                onClick={() => setSelectedImage(null)}
                sx={{ 
                    position: 'absolute', 
                    top: 10, 
                    right: 10, 
                    color: 'white', 
                    bgcolor: 'rgba(0,0,0,0.5)',
                    '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' } 
                }}
            >
                <CloseIcon />
            </IconButton>
            
            <Box 
                component="img"
                src={selectedImage}
                sx={{ 
                    width: '100%', 
                    height: 'auto', 
                    borderRadius: 2,
                    maxHeight: '90vh' 
                }}
            />
         </Box>
      </Dialog>

    </>
  );
}

export default HomePage;

