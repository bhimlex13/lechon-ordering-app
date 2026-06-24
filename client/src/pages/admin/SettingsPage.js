import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, TextField, Button, Grid, Alert, CircularProgress, 
  Tabs, Tab, Divider, FormControlLabel, Checkbox, InputAdornment
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import CampaignIcon from '@mui/icons-material/Campaign';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import api from '../../api';

// Map Imports
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Helper for Tab Panels
function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);

  // Initial State matches new Schema
  const [formData, setFormData] = useState({
    general: {
      taxRate: 12,
      storeCoordinates: { lat: 14.629, lng: 121.139 },
      storeAddress: '',
      operatingHours: { openTime: "08:00", closeTime: "20:00" },
      announcement: { message: "", enabled: false }
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

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await api.get('/api/settings');
        // Merge fetched data with state structure
        if (data) {
           setFormData({
              general: { ...formData.general, ...data.general },
              lechon: { ...formData.lechon, ...data.lechon },
              food: { ...formData.food, ...data.food },
           });
        }
        setLoading(false);
      } catch (err) {
        setError('Failed to load settings');
        setLoading(false);
      }
    };
    fetchSettings();
    // eslint-disable-next-line
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Generic Change Handler for nested objects
  const handleNestedChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleOperatingHoursChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      general: {
        ...prev.general,
        operatingHours: {
          ...prev.general.operatingHours,
          [field]: value
        }
      }
    }));
  };

  const handleAnnouncementChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      general: {
        ...prev.general,
        announcement: {
          ...prev.general.announcement,
          [field]: value
        }
      }
    }));
  };

  // Map Click Handler
  function StoreLocationMarker() {
    useMapEvents({
      click(e) {
        setFormData(prev => ({
          ...prev,
          general: {
             ...prev.general,
             storeCoordinates: e.latlng
          }
        }));
      },
    });
    return (
      <Marker position={formData.general.storeCoordinates}>
        <Popup>Store Location</Popup>
      </Marker>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      await api.put('/api/settings', formData);
      setMessage('Settings updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <CircularProgress sx={{display:'block', mx:'auto', mt:5}} />;

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
        Admin Configuration
      </Typography>

      {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper elevation={3}>
        <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            indicatorColor="primary" 
            textColor="primary"
            variant="fullWidth"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab icon={<LocationOnIcon />} label="General Settings" />
          <Tab icon={<RestaurantIcon />} label="Lechon Settings" />
          <Tab icon={<ReceiptLongIcon />} label="Food Settings" />
        </Tabs>

        <form onSubmit={handleSubmit}>
            
          {/* --- TAB 1: GENERAL SETTINGS --- */}
          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={4}>
                {/* Store Location Map */}
                <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom fontWeight="bold">Store Location</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Click on the map to set the store origin for delivery calculations.
                    </Typography>
                    <Box sx={{ height: 350, width: '100%', borderRadius: 2, overflow: 'hidden', border: '1px solid #ccc', mb: 2 }}>
                        {/* Force re-render map when tab 0 is active to avoid resizing issues */}
                        {tabValue === 0 && (
                            <MapContainer center={formData.general.storeCoordinates} zoom={13} style={{ height: '100%', width: '100%' }}>
                                <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                <StoreLocationMarker />
                            </MapContainer>
                        )}
                    </Box>
                    <TextField 
                        fullWidth label="Store Address Text" 
                        value={formData.general.storeAddress}
                        onChange={(e) => handleNestedChange('general', 'storeAddress', e.target.value)}
                    />
                </Grid>

                {/* Operations & Tax */}
                <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom fontWeight="bold">Operations</Typography>
                    
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth label="Opening Time" type="time"
                                InputLabelProps={{ shrink: true }}
                                value={formData.general.operatingHours.openTime}
                                onChange={(e) => handleOperatingHoursChange('openTime', e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth label="Closing Time" type="time"
                                InputLabelProps={{ shrink: true }}
                                value={formData.general.operatingHours.closeTime}
                                onChange={(e) => handleOperatingHoursChange('closeTime', e.target.value)}
                            />
                        </Grid>
                    </Grid>

                    <Divider sx={{ my: 3 }} />

                    <Typography variant="h6" gutterBottom fontWeight="bold">Tax & Fees</Typography>
                    <TextField
                        fullWidth label="Tax / VAT Rate (%)" type="number"
                        value={formData.general.taxRate}
                        onChange={(e) => handleNestedChange('general', 'taxRate', e.target.value)}
                        helperText="Added to the checkout total"
                    />

                    <Divider sx={{ my: 3 }} />

                    <Typography variant="h6" gutterBottom fontWeight="bold"><CampaignIcon sx={{verticalAlign:'middle'}}/> Announcement</Typography>
                    <FormControlLabel
                        control={
                            <Checkbox 
                                checked={formData.general.announcement.enabled}
                                onChange={(e) => handleAnnouncementChange('enabled', e.target.checked)}
                            />
                        }
                        label="Enable Login Popup Announcement"
                    />
                    <TextField
                        fullWidth multiline rows={3}
                        label="Announcement Message"
                        value={formData.general.announcement.message}
                        onChange={(e) => handleAnnouncementChange('message', e.target.value)}
                        disabled={!formData.general.announcement.enabled}
                    />
                </Grid>
            </Grid>
          </TabPanel>

          {/* --- TAB 2: LECHON SETTINGS --- */}
          <TabPanel value={tabValue} index={1}>
             <Typography variant="h6" color="secondary" gutterBottom fontWeight="bold">Lechon Delivery Configuration</Typography>
             <Alert severity="info" sx={{ mb: 3 }}>
                These settings apply when a customer has a <strong>Whole Lechon</strong> in their cart.
                (Requires 24h Lead time).
             </Alert>

             <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth label="Lechon Delivery Base Fee" type="number"
                        InputProps={{ startAdornment: <InputAdornment position="start">₱</InputAdornment> }}
                        value={formData.lechon.deliveryBaseFee}
                        onChange={(e) => handleNestedChange('lechon', 'deliveryBaseFee', e.target.value)}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        fullWidth label="Price Per Kilometer" type="number"
                        InputProps={{ startAdornment: <InputAdornment position="start">₱</InputAdornment> }}
                        value={formData.lechon.deliveryPricePerKm}
                        onChange={(e) => handleNestedChange('lechon', 'deliveryPricePerKm', e.target.value)}
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" fontWeight="bold">Terms & Conditions (Lechon)</Typography>
                    <TextField
                        fullWidth multiline rows={6}
                        label="T&C Text displayed at Checkout"
                        value={formData.lechon.termsAndConditions}
                        onChange={(e) => handleNestedChange('lechon', 'termsAndConditions', e.target.value)}
                        placeholder="e.g. 50% Downpayment required..."
                    />
                </Grid>
             </Grid>
          </TabPanel>

          {/* --- TAB 3: FOOD SETTINGS --- */}
          <TabPanel value={tabValue} index={2}>
            <Typography variant="h6" color="primary" gutterBottom fontWeight="bold">Standard Food Delivery</Typography>
            <Alert severity="info" sx={{ mb: 3 }}>
                These settings apply for standard menu items (same-day delivery).
            </Alert>

            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth label="Food Delivery Base Fee" type="number"
                        InputProps={{ startAdornment: <InputAdornment position="start">₱</InputAdornment> }}
                        value={formData.food.deliveryBaseFee}
                        onChange={(e) => handleNestedChange('food', 'deliveryBaseFee', e.target.value)}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        fullWidth label="Price Per Kilometer" type="number"
                        InputProps={{ startAdornment: <InputAdornment position="start">₱</InputAdornment> }}
                        value={formData.food.deliveryPricePerKm}
                        onChange={(e) => handleNestedChange('food', 'deliveryPricePerKm', e.target.value)}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        fullWidth label="Free Delivery Threshold" type="number"
                        InputProps={{ startAdornment: <InputAdornment position="start">₱</InputAdornment> }}
                        value={formData.food.freeDeliveryThreshold}
                        onChange={(e) => handleNestedChange('food', 'freeDeliveryThreshold', e.target.value)}
                        helperText="Orders above this amount get free delivery"
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" fontWeight="bold">Terms & Conditions (Food)</Typography>
                    <TextField
                        fullWidth multiline rows={6}
                        label="T&C Text displayed at Checkout"
                        value={formData.food.termsAndConditions}
                        onChange={(e) => handleNestedChange('food', 'termsAndConditions', e.target.value)}
                    />
                </Grid>
             </Grid>
          </TabPanel>

          <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #eee' }}>
             <Button 
                type="submit" 
                variant="contained" 
                size="large" 
                disabled={saving}
                startIcon={saving ? <CircularProgress size={20} color="inherit"/> : <SaveIcon />}
                sx={{ px: 5, py: 1.5, fontWeight: 'bold' }}
             >
                {saving ? 'Saving...' : 'Save All Settings'}
             </Button>
          </Box>

        </form>
      </Paper>
    </Box>
  );
}

export default SettingsPage;