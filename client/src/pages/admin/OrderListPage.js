import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  TextField,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  InputAdornment,
  TablePagination
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom'; 
import api from '../../api'; 
import { useAuth } from '../../context/AuthContext'; 

function OrderListPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- FILTER STATES ---
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [paymentFilter, setPaymentFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState(''); // <--- NEW DATE FILTER

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const { userInfo } = useAuth(); 
  const navigate = useNavigate(); 

  useEffect(() => {
    if (!userInfo) return;

    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await api.get('/api/orders');
        // Sort descending by created date
        const sortedOrders = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setOrders(sortedOrders);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [userInfo]); 

  // --- FILTERING LOGIC (Client-Side) ---
  const getFilteredOrders = () => {
    return orders.filter((order) => {
      // 1. Search Logic
      const term = searchTerm.toLowerCase();
      const orderId = order._id.toLowerCase();
      const customerName = (order.contactInfo?.name || order.user?.name || '').toLowerCase();
      
      const matchesSearch = 
        term === '' || 
        orderId.includes(term) || 
        customerName.includes(term);

      // 2. Dropdown Filters
      const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
      const matchesPayment = paymentFilter === 'All' || order.paymentMethod === paymentFilter;
      const matchesType = typeFilter === 'All' || order.orderType === typeFilter;

      // 3. Date Filter (Matches Scheduled Date)
      let matchesDate = true;
      if (dateFilter) {
          // Check if order.scheduledDate matches dateFilter (YYYY-MM-DD)
          // Ensure format matches backend storage (usually YYYY-MM-DD string)
          matchesDate = order.scheduledDate === dateFilter;
      }

      return matchesSearch && matchesStatus && matchesPayment && matchesType && matchesDate;
    });
  };

  const filteredOrders = getFilteredOrders();

  const handleClearFilters = () => {
      setSearchTerm('');
      setStatusFilter('All');
      setPaymentFilter('All');
      setTypeFilter('All');
      setDateFilter('');
      setPage(0);
  };

  // Helper Colors
  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered': return 'success';
      case 'Cancelled': return 'error';
      case 'Processing': return 'info';
      case 'Ready': return 'warning';
      default: return 'default';
    }
  };

  const getPaymentColor = (method) => {
      if (method === 'GCash') return 'primary';
      if (method === 'Maya') return 'secondary';
      if (method === 'Bank Transfer') return 'warning';
      return 'default';
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
            Order Management
        </Typography>
        <Chip label={`${filteredOrders.length} Orders Found`} color="primary" variant="outlined" />
      </Box>

      {/* --- FILTERS SECTION --- */}
      <Paper elevation={2} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
            {/* Search Bar */}
            <Grid item xs={12} md={3}>
                <TextField 
                    fullWidth 
                    variant="outlined" 
                    placeholder="Search ID or Name..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon color="action" />
                            </InputAdornment>
                        ),
                    }}
                    size="small"
                />
            </Grid>

            {/* Date Filter (New) */}
            <Grid item xs={6} md={2}>
                <TextField
                    fullWidth
                    type="date"
                    label="Scheduled Date"
                    InputLabelProps={{ shrink: true }}
                    size="small"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                />
            </Grid>

            {/* Status Filter */}
            <Grid item xs={6} md={2}>
                <FormControl fullWidth size="small">
                    <InputLabel>Status</InputLabel>
                    <Select
                        value={statusFilter}
                        label="Status"
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <MenuItem value="All">All Statuses</MenuItem>
                        <MenuItem value="Pending">Pending</MenuItem>
                        <MenuItem value="Processing">Processing</MenuItem>
                        <MenuItem value="Ready">Ready</MenuItem>
                        <MenuItem value="Delivered">Delivered</MenuItem>
                        <MenuItem value="Cancelled">Cancelled</MenuItem>
                    </Select>
                </FormControl>
            </Grid>

            {/* Payment Filter */}
            <Grid item xs={6} md={2}>
                <FormControl fullWidth size="small">
                    <InputLabel>Payment</InputLabel>
                    <Select
                        value={paymentFilter}
                        label="Payment"
                        onChange={(e) => setPaymentFilter(e.target.value)}
                    >
                        <MenuItem value="All">All Payments</MenuItem>
                        <MenuItem value="GCash">GCash</MenuItem>
                        <MenuItem value="Maya">Maya</MenuItem>
                        <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
                    </Select>
                </FormControl>
            </Grid>

            {/* Type Filter & Reset */}
            <Grid item xs={6} md={2}>
                <FormControl fullWidth size="small">
                    <InputLabel>Type</InputLabel>
                    <Select
                        value={typeFilter}
                        label="Type"
                        onChange={(e) => setTypeFilter(e.target.value)}
                    >
                        <MenuItem value="All">All Types</MenuItem>
                        <MenuItem value="Pick-up">Pick-up</MenuItem>
                        <MenuItem value="Delivery">Delivery</MenuItem>
                    </Select>
                </FormControl>
            </Grid>

            <Grid item xs={6} md={1}>
                <Button 
                    fullWidth 
                    variant="text" 
                    color="secondary" 
                    onClick={handleClearFilters}
                    sx={{ height: 40 }}
                >
                    Clear
                </Button>
            </Grid>
        </Grid>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead sx={{ bgcolor: '#f5f5f5' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Order ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Customer</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Scheduled</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Payment</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="right">Total</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="center">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredOrders.length > 0 ? filteredOrders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((order) => (
                <TableRow key={order._id} hover>
                  <TableCell sx={{ fontFamily: 'monospace' }}>
                      {order._id.substring(order._id.length - 6).toUpperCase()}
                  </TableCell>
                  <TableCell>{order.contactInfo?.name || order.user?.name}</TableCell>
                  <TableCell>
                      {order.scheduledDate ? (
                         <Box>
                           <Typography variant="body2" fontWeight="500">
                                {new Date(order.scheduledDate).toLocaleDateString()}
                           </Typography>
                           <Typography variant="caption" color="text.secondary">
                                {order.scheduledTime}
                           </Typography>
                         </Box>
                      ) : 'N/A'}
                  </TableCell>
                  <TableCell>
                      <Chip label={order.orderType} size="small" variant="outlined" />
                  </TableCell>
                  
                  <TableCell>
                      <Chip 
                          label={order.paymentMethod || 'COD'} 
                          size="small" 
                          variant="filled"
                          color={getPaymentColor(order.paymentMethod)}
                          sx={{ fontWeight: 'bold', color: 'white' }}
                      />
                  </TableCell>

                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>₱{order.totalPrice.toLocaleString()}</TableCell>
                  <TableCell>
                    <Chip 
                      label={order.status} 
                      color={getStatusColor(order.status)} 
                      variant={order.status === 'Pending' ? 'outlined' : 'filled'}
                      size="small"
                      sx={{ fontWeight: 'bold' }}
                    />
                  </TableCell>
                  <TableCell align="center">
                      <Button 
                        variant="contained" 
                        size="small" 
                        color="primary"
                        startIcon={<VisibilityIcon />}
                        onClick={() => navigate(`/admin/orders/${order._id}`)} 
                        sx={{ textTransform: 'none' }}
                      >
                          View
                      </Button>
                  </TableCell>
                </TableRow>
              )) : (
                  <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                          <Typography variant="h6" color="text.secondary">
                              No orders found matching your filters.
                          </Typography>
                      </TableCell>
                  </TableRow>
              )}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredOrders.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
            }}
          />
        </TableContainer>
      )}
    </Container>
  );
}

export default OrderListPage;