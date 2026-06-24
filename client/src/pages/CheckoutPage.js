import React, { useState, useEffect, useMemo } from 'react';
import {
  Container, Typography, Box, Grid, Paper, Button, TextField, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, Checkbox, CircularProgress, Alert, Divider, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Chip, DialogContentText
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import CloseIcon from '@mui/icons-material/Close';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SearchIcon from '@mui/icons-material/Search';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import InfoIcon from '@mui/icons-material/Info';
import AccessTimeFilledIcon from '@mui/icons-material/AccessTimeFilled';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { motion } from 'framer-motion';
import { addDays, format, parse, isBefore, isAfter } from 'date-fns';
import { theme } from '../theme';
// Leaflet
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet Icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// --- HELPER: FLY TO MAP LOCATION ---
function MapFlyTo({ center }) {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.flyTo(center, 15);
        }
    }, [center, map]);
    return null;
}

function CheckoutPage() {
  const { cartItems, clearCart } = useCart();
  const { userInfo } = useAuth();
  const navigate = useNavigate();

  // --- 1. SETTINGS STATE ---
  const [sysSettings, setSysSettings] = useState({
    general: {
        taxRate: 12,
        storeCoordinates: { lat: 14.629, lng: 121.139 },
        operatingHours: { openTime: "08:00", closeTime: "20:00" }
    },
    lechon: {
        deliveryBaseFee: 100,
        deliveryPricePerKm: 15,
        termsAndConditions: ""
    },
    food: {
        deliveryBaseFee: 50,
        deliveryPricePerKm: 10,
        freeDeliveryThreshold: 5000,
        termsAndConditions: ""
    }
  });
  const [loadingSettings, setLoadingSettings] = useState(true);

  // Form State
  const [orderType, setOrderType] = useState('Pick-up');
  const [name, setName] = useState(userInfo?.name || '');
  const [mobile, setMobile] = useState(userInfo?.phone || '');
  const [email, setEmail] = useState(userInfo?.email || '');
  
  // Map & Search State
  const [searchCity, setSearchCity] = useState('');
  const [searchBarangay, setSearchBarangay] = useState('');
  const [mapCenter, setMapCenter] = useState({ lat: 14.629, lng: 121.139 });
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);

  const [addressText, setAddressText] = useState('');
  const [coordinates, setCoordinates] = useState(null); 
  const [distanceKm, setDistanceKm] = useState(0);
  const [calculatingFee, setCalculatingFee] = useState(false);

  // Schedule State (Only used for Lechon)
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  
  const [note, setNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  
  const [agreed, setAgreed] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false); 
  const [storeClosedModal, setStoreClosedModal] = useState(false);
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // --- 2. DETECT LECHON IN CART ---
  const isLechonOrder = useMemo(() => {
    return cartItems.some(item => item.category === 'Lechon');
  }, [cartItems]);

  // --- 3. GET ACTIVE CONFIGURATION ---
  const activeConfig = isLechonOrder ? sysSettings.lechon : sysSettings.food;

  // Load Settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await api.get('/api/settings');
        if(data) {
            setSysSettings({
                general: { ...sysSettings.general, ...data.general },
                lechon: { ...sysSettings.lechon, ...data.lechon },
                food: { ...sysSettings.food, ...data.food }
            });
            if (data.general?.storeCoordinates) {
                setMapCenter(data.general.storeCoordinates);
            }
        }
      } catch (err) {
        console.error("Could not load settings:", err);
      } finally {
        setLoadingSettings(false);
      }
    };
    fetchSettings();
    // eslint-disable-next-line
  }, []);

  // --- 4. AUTO-OPEN TERMS MODAL ---
  useEffect(() => {
      if (!loadingSettings) {
          setTermsOpen(true);
      }
  }, [loadingSettings]);

  const handleTermsAgree = () => {
      setAgreed(true);
      setTermsOpen(false);
  };

  const handleTermsDecline = () => {
      navigate('/cart');
  };

  // --- 5. CALCULATIONS ---
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  
  const taxPrice = useMemo(() => {
      return subtotal * (sysSettings.general.taxRate / 100);
  }, [subtotal, sysSettings.general.taxRate]);

  const deliveryFee = useMemo(() => {
    if (orderType !== 'Delivery') return 0;
    if (!isLechonOrder && subtotal >= activeConfig.freeDeliveryThreshold) return 0;
    if (distanceKm > 0) {
        return Math.round(activeConfig.deliveryBaseFee + (distanceKm * activeConfig.deliveryPricePerKm));
    }
    return activeConfig.deliveryBaseFee; 
  }, [orderType, distanceKm, activeConfig, subtotal, isLechonOrder]);

  const totalPrice = subtotal + taxPrice + deliveryFee;

  // --- MAP SEARCH ---
  const handleSearchLocation = async () => {
      if (!searchCity) { setSearchError("Please enter a City."); return; }
      setIsSearching(true);
      setSearchError(null);
      try {
          const query = `${searchBarangay ? searchBarangay + ', ' : ''}${searchCity}, Philippines`;
          const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
          const data = await response.json();
          if (data && data.length > 0) {
              const { lat, lon } = data[0];
              setMapCenter({ lat: parseFloat(lat), lng: parseFloat(lon) });
          } else {
              setSearchError("Location not found.");
          }
      } catch (err) { setSearchError("Error searching location."); } 
      finally { setIsSearching(false); }
  };

  const calculateRouteDistance = async (dest) => {
    setCalculatingFee(true);
    try {
        const start = `${sysSettings.general.storeCoordinates.lng},${sysSettings.general.storeCoordinates.lat}`; 
        const end = `${dest.lng},${dest.lat}`; 
        const response = await fetch(`https://router.project-osrm.org/route/v1/driving/${start};${end}?overview=false`);
        const data = await response.json();
        if (data.routes && data.routes.length > 0) {
            const km = (data.routes[0].distance / 1000).toFixed(1); 
            setDistanceKm(parseFloat(km));
        }
    } catch (err) { console.error(err); } 
    finally { setCalculatingFee(false); }
  };

  function LocationMarker() {
    useMapEvents({
      click(e) {
        setCoordinates(e.latlng);
        calculateRouteDistance(e.latlng);
      },
    });
    return coordinates ? <Marker position={coordinates}><Popup>Delivery Point</Popup></Marker> : null;
  }

  // --- HELPER: CHECK STORE HOURS ---
  const isStoreOpen = () => {
      const { openTime, closeTime } = sysSettings.general.operatingHours;
      if (!openTime || !closeTime) return true; 

      const now = new Date();
      const current = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

      return current >= openTime && current <= closeTime;
  };

  // --- SCHEDULING LOGIC ---
  const getMinDate = () => {
    return format(addDays(new Date(), 1), 'yyyy-MM-dd'); // Always tomorrow for Lechon
  };

  const handlePlaceOrder = async () => {
    setError(null);
    if (!name || !mobile || !email) { setError("Please complete contact information."); return; }
    if (orderType === 'Delivery') {
        if (!coordinates || distanceKm === 0) { setError("Please pin your location on the map."); return; }
        if (!addressText) { setError("Please provide specific address details."); return; }
    }
    
    // --- MODE SPECIFIC VALIDATION ---
    if (isLechonOrder) {
        // Lechon must have date/time picked by user
        if (!date || !time) { setError("Please select date and time."); return; }
        
        // Validate Lechon Time
        const { openTime, closeTime } = sysSettings.general.operatingHours;
        const selectedDateTime = parse(`${date} ${time}`, 'yyyy-MM-dd HH:mm', new Date());
        const openDateTime = parse(`${date} ${openTime}`, 'yyyy-MM-dd HH:mm', new Date());
        const closeDateTime = parse(`${date} ${closeTime}`, 'yyyy-MM-dd HH:mm', new Date());

        if (isBefore(selectedDateTime, openDateTime) || isAfter(selectedDateTime, closeDateTime)) {
            setError(`Store hours are ${openTime} to ${closeTime}`);
            return false;
        }
    } else {
        // STANDARD ORDER: Final check if store is open
        if (!isStoreOpen()) {
            setStoreClosedModal(true); 
            return;
        }
    }

    if (!paymentMethod) { setError("Please select a payment method."); return; }
    if (!agreed) { setError("Please agree to the Terms."); setTermsOpen(true); return; }

    setSubmitting(true);
    try {
      // Determine Schedule Payload
      // Standard Orders get "Today" and "ASAP" automatically
      const finalDate = isLechonOrder ? date : format(new Date(), 'yyyy-MM-dd'); 
      const finalTime = isLechonOrder ? time : "ASAP"; 

      const orderData = {
        orderItems: cartItems.map((item) => ({ 
            name: item.name, 
            qty: item.qty, 
            price: item.price, 
            product: item._id,
            image: item.imageUrl 
        })),
        orderType,
        contactInfo: { name, phone: mobile, email },
        deliveryAddress: orderType === 'Delivery' ? { 
            street: addressText, 
            city: searchCity || 'Map Location', 
            barangay: searchBarangay,
            coordinates: { lat: coordinates.lat, lng: coordinates.lng }
        } : {},
        scheduledDate: finalDate, 
        scheduledTime: finalTime,
        notes: note,
        paymentMethod,
        totalPrice,
        deliveryFee,
        taxPrice 
      };

      const { data: createdOrder } = await api.post('/api/orders', orderData);

      if (createdOrder.checkoutUrl) {
          window.location.href = createdOrder.checkoutUrl;
      } else {
          setSubmitting(false);
          clearCart();
          navigate(`/orders/${createdOrder._id}`);
      }
    } catch (err) {
      setSubmitting(false);
      setError(err.response?.data?.message || err.message);
    }
  };

  if (loadingSettings) return <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 10 }} />;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Button onClick={() => navigate('/cart')} sx={{ mb: 2, color: theme.palette.primary.main, fontWeight: 'bold' }}>&larr; Back to Cart</Button>
      
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" fontWeight="bold" sx={{ color: '#333', flexGrow: 1 }}>Checkout</Typography>
        {isLechonOrder && (
            <Chip 
                icon={<RestaurantIcon />} 
                label="Lechon Order Detected" 
                color="warning" 
                sx={{ fontWeight: 'bold' }} 
            />
        )}
      </Box>

      <Alert severity="info" icon={<InfoIcon />} sx={{ mb: 3 }}>
        {isLechonOrder ? (
            <span><strong>Lechon Delivery:</strong> Requires 24-hour lead time. 50% Downpayment required.</span>
        ) : (
            <span><strong>Standard Delivery:</strong> Orders are processed immediately upon confirmation.</span>
        )}
      </Alert>
      
      <Grid container spacing={4}>
        {/* LEFT FORM */}
        <Grid item xs={12} md={7}>
          <Paper elevation={2} sx={{ p: 4, borderRadius: 2, borderTop: `4px solid ${theme.palette.primary.main}` }}>
            
            <FormControl component="fieldset" sx={{ mb: 3, width: '100%' }}>
              <FormLabel component="legend" sx={{ fontWeight: 'bold', mb: 1 }}>Delivery Method</FormLabel>
              <RadioGroup row value={orderType} onChange={(e) => setOrderType(e.target.value)} sx={{ mt: 1, gap: 2 }}>
                <Paper variant="outlined" sx={{ flex: 1, p: 2, textAlign: 'center', cursor: 'pointer', borderColor: orderType === 'Pick-up' ? theme.palette.primary.main : 'divider', bgcolor: orderType === 'Pick-up' ? theme.palette.primary.light : 'inherit' }}>
                   <FormControlLabel value="Pick-up" control={<Radio sx={{color: theme.palette.primary.main}} />} label="Pick-up" />
                </Paper>
                <Paper variant="outlined" sx={{ flex: 1, p: 2, textAlign: 'center', cursor: 'pointer', borderColor: orderType === 'Delivery' ? theme.palette.primary.main : 'divider', bgcolor: orderType === 'Delivery' ? theme.palette.primary.light : 'inherit' }}>
                   <FormControlLabel value="Delivery" control={<Radio sx={{color: theme.palette.primary.main}} />} label="Delivery" />
                </Paper>
              </RadioGroup>
            </FormControl>

            {orderType === 'Delivery' && (
              <Box component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }} sx={{ mb: 4, p: 2, bgcolor: '#f9f9f9', borderRadius: 1 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>1. Find Location</Typography>
                <Grid container spacing={1} sx={{ mb: 2 }}>
                    <Grid item xs={12} sm={5}>
                        <TextField fullWidth size="small" label="City" value={searchCity} onChange={(e) => setSearchCity(e.target.value)} />
                    </Grid>
                    <Grid item xs={12} sm={5}>
                        <TextField fullWidth size="small" label="Barangay" value={searchBarangay} onChange={(e) => setSearchBarangay(e.target.value)} />
                    </Grid>
                    <Grid item xs={12} sm={2}>
                        <Button variant="contained" fullWidth sx={{ height: '100%' }} onClick={handleSearchLocation} disabled={isSearching}>
                            {isSearching ? <CircularProgress size={20} color="inherit"/> : <SearchIcon />}
                        </Button>
                    </Grid>
                </Grid>
                {searchError && <Alert severity="warning" sx={{mb:1}}>{searchError}</Alert>}

                <Box sx={{ height: 300, width: '100%', mb: 2, borderRadius: 2, overflow: 'hidden', border: '1px solid #ccc' }}>
                    <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
                        <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <MapFlyTo center={mapCenter} />
                        <Marker position={sysSettings.general.storeCoordinates}><Popup>Store</Popup></Marker>
                        <LocationMarker />
                    </MapContainer>
                </Box>

                {distanceKm > 0 && (
                    <Alert severity="success" icon={<LocationOnIcon />} sx={{ mb: 2 }}>
                        Distance: <strong>{distanceKm} km</strong> | Fee: <strong>₱{deliveryFee}</strong>
                    </Alert>
                )}
                <TextField fullWidth label="Specific Address (Street, House No.)" value={addressText} onChange={(e) => setAddressText(e.target.value)} />
              </Box>
            )}

            <Divider sx={{ my: 3 }} />
            
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>Contact Info</Typography>
            <TextField fullWidth label="Full Name" sx={{ mb: 2 }} value={name} onChange={(e) => setName(e.target.value)} required />
            <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6}><TextField fullWidth label="Mobile" value={mobile} onChange={(e) => setMobile(e.target.value)} required /></Grid>
                <Grid item xs={6}><TextField fullWidth label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></Grid>
            </Grid>

            {/* --- CONDITIONAL SCHEDULING --- */}
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>Schedule</Typography>
            {isLechonOrder ? (
                <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={6}>
                        <TextField 
                            fullWidth type="date" label="Date" InputLabelProps={{ shrink: true }} 
                            value={date} onChange={(e) => setDate(e.target.value)} 
                            required inputProps={{ min: getMinDate() }} 
                            helperText="Min: 24h lead time"
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField 
                            fullWidth type="time" label="Time" InputLabelProps={{ shrink: true }} 
                            value={time} onChange={(e) => setTime(e.target.value)} required 
                            helperText={`Hours: ${sysSettings.general.operatingHours.openTime} - ${sysSettings.general.operatingHours.closeTime}`}
                        />
                    </Grid>
                </Grid>
            ) : (
                // STANDARD DELIVERY MESSAGE (Replaces Inputs)
                <Alert icon={<AccessTimeFilledIcon fontSize="inherit" />} severity="info" sx={{ mb: 2, bgcolor: '#e3f2fd' }}>
                    <Typography variant="subtitle2" fontWeight="bold">Processing: Immediately (ASAP)</Typography>
                    <Typography variant="caption" display="block">
                        Your order will be prepared and delivered shortly. <br/>
                        Estimated arrival: 45-60 mins (depending on location).
                    </Typography>
                </Alert>
            )}

            <TextField fullWidth multiline rows={2} label="Notes for Kitchen/Rider" value={note} onChange={(e) => setNote(e.target.value)} />

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>Payment</Typography>
            <FormControl component="fieldset" sx={{ width: '100%' }}>
              <RadioGroup value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                <Paper variant="outlined" sx={{ mb: 1, p: 1, borderColor: paymentMethod === 'GCash' ? theme.palette.primary.main : 'divider' }}>
                    <FormControlLabel value="GCash" control={<Radio sx={{color: theme.palette.primary.main}} />} label="GCash" />
                </Paper>
                <Paper variant="outlined" sx={{ mb: 1, p: 1, borderColor: paymentMethod === 'Bank Transfer' ? theme.palette.primary.main : 'divider' }}>
                    <FormControlLabel value="Bank Transfer" control={<Radio sx={{color: theme.palette.primary.main}} />} label="Bank Transfer" />
                </Paper>
              </RadioGroup>
            </FormControl>

            <Box sx={{ mt: 2 }}>
                <Checkbox 
                    checked={agreed} 
                    onChange={(e) => {
                        if(e.target.checked) setTermsOpen(true); 
                        else setAgreed(false);
                    }} 
                    sx={{color: theme.palette.primary.main}} 
                /> 
                I agree to the <span style={{color: theme.palette.primary.main, textDecoration: 'underline', cursor: 'pointer'}} onClick={()=>setTermsOpen(true)}>Terms & Conditions</span>.
            </Box>
          </Paper>
        </Grid>

        {/* RIGHT SUMMARY */}
        <Grid item xs={12} md={5}>
          <Paper elevation={3} sx={{ p: 3, position: 'sticky', top: 20 }}>
             <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>Order Summary</Typography>
             {cartItems.map((item) => (
                 <Box key={item._id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, borderBottom: '1px dashed #ccc', pb: 1 }}>
                    <Box>
                        <Typography variant="body1" fontWeight="bold">{item.name}</Typography>
                        <Typography variant="caption" color="text.secondary">Qty: {item.qty}</Typography>
                        {item.category === 'Lechon' && (
                            <Chip size="small" label="Lechon" color="warning" sx={{ml:1, height: 20, fontSize: '0.6rem'}}/>
                        )}
                    </Box>
                    <Typography variant="body1">₱{(item.price * item.qty).toLocaleString()}</Typography>
                 </Box>
             ))}
             
             <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                 <Typography>Subtotal</Typography><Typography>₱{subtotal.toLocaleString()}</Typography>
             </Box>
             <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                 <Typography>Tax ({sysSettings.general.taxRate}%)</Typography>
                 <Typography>₱{taxPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</Typography>
             </Box>
             <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, mt: 1 }}>
                 <Typography>Delivery Fee</Typography>
                 <Typography color={deliveryFee === 0 && orderType === 'Delivery' && !isLechonOrder && subtotal < activeConfig.freeDeliveryThreshold ? 'error' : 'inherit'}>
                     {orderType === 'Pick-up' ? 'Free' : (deliveryFee > 0 ? `₱${deliveryFee}` : (subtotal >= activeConfig.freeDeliveryThreshold && !isLechonOrder ? 'Free (Promo)' : 'Pin Location'))}
                 </Typography>
             </Box>
             
             <Divider />
             <Box sx={{ display: 'flex', justifyContent: 'space-between', my: 2 }}>
                 <Typography variant="h5" fontWeight="bold">Total</Typography>
                 <Typography variant="h5" fontWeight="bold" color={theme.palette.primary.main}>₱{totalPrice.toLocaleString()}</Typography>
             </Box>
             {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
             
             <Button variant="contained" fullWidth size="large" onClick={handlePlaceOrder} disabled={submitting || calculatingFee} sx={{ py: 1.5, fontWeight: 'bold', bgcolor: theme.palette.primary.main }}>
                {submitting ? <CircularProgress size={24} color="inherit" /> : 'PLACE ORDER'}
             </Button>
          </Paper>
        </Grid>
      </Grid>
      
      {/* --- TERMS MODAL --- */}
      <Dialog 
        open={termsOpen} 
        onClose={handleTermsDecline} 
        maxWidth="md"
        disableEscapeKeyDown={!agreed} 
      >
        <DialogTitle sx={{display: 'flex', justifyContent:'space-between', alignItems: 'center'}}>
          {isLechonOrder ? 'Lechon Order Terms' : 'Food Delivery Terms'}
          <IconButton onClick={handleTermsDecline}><CloseIcon/></IconButton>
        </DialogTitle>
        <DialogContent dividers>
            <Typography variant="body1" paragraph style={{whiteSpace: 'pre-line', fontSize: '1.1rem'}}>
                {activeConfig.termsAndConditions || "No specific terms provided."}
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Alert severity="warning">
                By continuing, you acknowledge that you must comply with our payment and cancellation policies.
            </Alert>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleTermsDecline} color="inherit">I Do Not Agree (Back to Cart)</Button>
            <Button variant="contained" onClick={handleTermsAgree} sx={{ bgcolor: theme.palette.primary.main, fontWeight: 'bold' }}>
                I Agree & Proceed
            </Button>
        </DialogActions>
      </Dialog>

      {/* --- STORE CLOSED MODAL --- */}
      <Dialog
        open={storeClosedModal}
        onClose={() => setStoreClosedModal(false)}
      >
        <DialogTitle sx={{ color: 'error.main', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
            <AccessTimeFilledIcon sx={{ mr: 1 }} /> Store is Closed
        </DialogTitle>
        <DialogContent>
            <DialogContentText>
                We are currently outside of our operating hours ({sysSettings.general.operatingHours.openTime} - {sysSettings.general.operatingHours.closeTime}).
                <br/><br/>
                Standard orders can only be placed when the kitchen is open. Please check back later or place a scheduled Lechon order instead.
            </DialogContentText>
        </DialogContent>
        <DialogActions>
            <Button onClick={() => setStoreClosedModal(false)} color="primary" variant="contained">
                Understood
            </Button>
        </DialogActions>
      </Dialog>

    </Container>
  );
}

export default CheckoutPage;
