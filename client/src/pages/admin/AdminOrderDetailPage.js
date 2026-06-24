import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Typography, Box, Grid, Paper, Button, CircularProgress, Alert,
  Divider, TableContainer, Table, TableHead, TableRow, TableCell, TableBody,
  FormControl, InputLabel, Select, MenuItem, Chip
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import api from '../../api';

// --- LEAFLET MAP IMPORTS ---
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default Leaflet marker icons in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const STATUS_OPTIONS = ['Pending', 'Processing', 'Ready', 'Delivered', 'Cancelled'];

// Default Store Location (Matches Admin Settings Default)
const DEFAULT_STORE_LOCATION = [14.629, 121.139];

function AdminOrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for Status Update
  const [newStatus, setNewStatus] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateMessage, setUpdateMessage] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await api.get(`/api/orders/${id}`);
        setOrder(data);
        setNewStatus(data.status); 
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const handleStatusUpdate = async () => {
    setUpdateLoading(true);
    setUpdateMessage(null);
    try {
      const { data } = await api.put(`/api/orders/${id}/status`, { status: newStatus });
      setOrder(data); 
      setUpdateMessage({ type: 'success', text: 'Status updated successfully!' });
    } catch (err) {
      setUpdateMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update status' });
    } finally {
      setUpdateLoading(false);
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error" sx={{ mt: 4 }}>{error}</Alert>;
  if (!order) return <Alert severity="warning" sx={{ mt: 4 }}>Order not found</Alert>;

  // Check if we have map coordinates for this order
  const hasCoordinates = order.deliveryAddress?.coordinates?.lat && order.deliveryAddress?.coordinates?.lng;

  return (
    <Container maxWidth="lg" sx={{ mb: 4 }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/admin/orders')} sx={{ mb: 2 }}>
        Back to List
      </Button>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Order #{order._id.substring(order._id.length - 6)}
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Placed: {new Date(order.createdAt).toLocaleString()}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        
        {/* LEFT COLUMN: DETAILS */}
        <Grid item xs={12} md={8}>
          
          {/* 1. Customer Info */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>Customer Information</Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
                <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">Name</Typography>
                    <Typography variant="body1">{order.contactInfo?.name || order.user?.name}</Typography>
                </Grid>
                <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">Phone</Typography>
                    <Typography variant="body1">{order.contactInfo?.phone || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                    <Typography variant="body1">{order.contactInfo?.email || order.user?.email}</Typography>
                </Grid>
            </Grid>
          </Paper>

          {/* 2. Payment & Delivery Info */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>Payment & Fulfillment</Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
                {/* Payment Section */}
                <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary">Payment Method:</Typography>
                        <Chip 
                            label={order.paymentMethod || 'Cash on Delivery'} 
                            color={order.paymentMethod === 'Bank Transfer' ? 'warning' : 'primary'}
                            sx={{ fontWeight: 'bold' }}
                        />
                    </Box>
                    
                    {/* Bank Transfer Warning for Admin */}
                    {order.paymentMethod === 'Bank Transfer' && order.status === 'Pending' && (
                        <Alert severity="warning" icon={<WarningAmberIcon />} sx={{ mb: 2 }}>
                            <strong>Manual Verification Needed:</strong> Please check your BDO/BPI account for ₱{order.totalPrice.toLocaleString()} before moving status to "Processing".
                        </Alert>
                    )}
                </Grid>

                <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">Type</Typography>
                    <Typography variant="body1" fontWeight="bold">{order.orderType}</Typography>
                </Grid>
                <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">Scheduled For</Typography>
                    <Typography variant="body1" fontWeight="bold">{order.scheduledDate} @ {order.scheduledTime}</Typography>
                </Grid>
                
                {order.orderType === 'Delivery' && (
                    <Grid item xs={12}>
                        <Box sx={{ bgcolor: '#f9f9f9', p: 2, borderRadius: 1, mt: 1 }}>
                            <Typography variant="subtitle2" color="text.secondary" sx={{display:'flex', alignItems:'center'}}>
                                <LocationOnIcon fontSize="small" sx={{mr:0.5}}/> Delivery Address
                            </Typography>
                            <Typography variant="body1" fontWeight="bold" sx={{mt:0.5}}>
                                {order.deliveryAddress?.street}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {order.deliveryAddress?.barangay}, {order.deliveryAddress?.city}, {order.deliveryAddress?.province}
                            </Typography>

                            {/* --- MAP FOR ADMIN --- */}
                            {/* Only renders if user used the map checkout feature */}
                            {hasCoordinates && (
                                <Box sx={{ height: 250, width: '100%', mt: 2, borderRadius: 2, overflow: 'hidden', border: '1px solid #ddd' }}>
                                    <MapContainer 
                                        center={order.deliveryAddress.coordinates} 
                                        zoom={13} 
                                        style={{ height: '100%', width: '100%' }}
                                    >
                                        <TileLayer
                                            attribution='&copy; OpenStreetMap contributors'
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        />
                                        <Marker position={DEFAULT_STORE_LOCATION}>
                                            <Popup>Store (Approx)</Popup>
                                        </Marker>
                                        <Marker position={order.deliveryAddress.coordinates}>
                                            <Popup>Customer Location</Popup>
                                        </Marker>
                                    </MapContainer>
                                </Box>
                            )}
                        </Box>
                    </Grid>
                )}
                {order.notes && (
                    <Grid item xs={12}>
                         <Typography variant="subtitle2" color="text.secondary">Customer Notes</Typography>
                         <Typography variant="body1" sx={{ fontStyle: 'italic', bgcolor: '#fff8e1', p: 1 }}>"{order.notes}"</Typography>
                    </Grid>
                )}
            </Grid>
          </Paper>

          {/* 3. Order Items */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>Items Ordered</Typography>
            <TableContainer>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Item Name</TableCell>
                            <TableCell align="right">Qty</TableCell>
                            <TableCell align="right">Price</TableCell>
                            <TableCell align="right">Total</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {order.orderItems.map((item, index) => (
                            <TableRow key={index}>
                                <TableCell>{item.name}</TableCell>
                                <TableCell align="right">{item.qty}</TableCell>
                                <TableCell align="right">₱{item.price.toLocaleString()}</TableCell>
                                <TableCell align="right">₱{(item.price * item.qty).toLocaleString()}</TableCell>
                            </TableRow>
                        ))}
                        
                        {/* TAX ROW - NEW */}
                        <TableRow>
                            <TableCell colSpan={3} align="right" sx={{ fontWeight: 'bold' }}>Tax</TableCell>
                            <TableCell align="right">₱{order.taxPrice ? order.taxPrice.toLocaleString() : '0.00'}</TableCell>
                        </TableRow>

                        {/* Delivery Fee Row (if applicable) */}
                        {order.deliveryFee > 0 && (
                            <TableRow>
                                <TableCell colSpan={3} align="right" sx={{ fontWeight: 'bold' }}>Delivery Fee</TableCell>
                                <TableCell align="right">₱{order.deliveryFee.toLocaleString()}</TableCell>
                            </TableRow>
                        )}

                        <TableRow>
                            <TableCell colSpan={3} align="right" sx={{ fontWeight: 'bold' }}>Total Amount</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'primary.main' }}>
                                ₱{order.totalPrice.toLocaleString()}
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* RIGHT COLUMN: ADMIN ACTIONS */}
        <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ p: 3, bgcolor: '#f0f4f8' }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>Admin Actions</Typography>
                <Divider sx={{ mb: 2 }} />

                <Typography variant="subtitle2" gutterBottom>Current Status:</Typography>
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h5" fontWeight="bold" color="primary">
                        {order.status}
                    </Typography>
                </Box>

                <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Update Status</InputLabel>
                    <Select
                        value={newStatus}
                        label="Update Status"
                        onChange={(e) => setNewStatus(e.target.value)}
                        disabled={order.status === 'Delivered' || order.status === 'Cancelled'}
                    >
                        {STATUS_OPTIONS.map(status => (
                            <MenuItem key={status} value={status}>{status}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <Button 
                    variant="contained" 
                    fullWidth 
                    startIcon={updateLoading ? <CircularProgress size={20} color="inherit"/> : <SaveIcon />}
                    onClick={handleStatusUpdate}
                    disabled={updateLoading || order.status === 'Delivered' || order.status === 'Cancelled' || newStatus === order.status}
                >
                    {updateLoading ? 'Updating...' : 'Update Status'}
                </Button>

                {updateMessage && (
                    <Alert severity={updateMessage.type} sx={{ mt: 2 }}>
                        {updateMessage.text}
                    </Alert>
                )}
                
                <Typography variant="caption" display="block" sx={{ mt: 2, color: 'text.secondary' }}>
                    * "Processing" usually indicates payment is verified/received.
                    <br/>
                    * Delivered and Cancelled orders are final.
                </Typography>
            </Paper>
        </Grid>

      </Grid>
    </Container>
  );
}

export default AdminOrderDetailPage;