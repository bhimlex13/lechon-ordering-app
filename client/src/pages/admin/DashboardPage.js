import React, { useEffect, useState } from 'react';
import {
  Container, Grid, Paper, Typography, Box, CircularProgress, Alert, Divider,
  ToggleButton, ToggleButtonGroup, List, ListItem, ListItemText, ListItemAvatar, Avatar,
  Card, CardActionArea
} from '@mui/material';

// --- ICONS ---
import PaymentsIcon from '@mui/icons-material/Payments'; // <--- NEW "Paper Bill" Icon
import ShoppingBasketIcon from '@mui/icons-material/ShoppingBasket';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import FastfoodIcon from '@mui/icons-material/Fastfood';
import { useNavigate } from 'react-router-dom';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { startOfDay, startOfWeek, startOfMonth, isAfter, format } from 'date-fns';

import api from '../../api';
import { theme } from '../../theme';

function DashboardPage() {
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); 

  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    deliveredOrders: 0,
    pendingOrders: 0,
  });
  const [bestSellersMenu, setBestSellersMenu] = useState([]);
  const [bestSellersLechon, setBestSellersLechon] = useState([]);
  const [graphData, setGraphData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersRes, menuRes] = await Promise.all([
          api.get('/api/orders'),
          api.get('/api/menu')
        ]);
        setOrders(ordersRes.data);
        setMenuItems(menuRes.data);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!orders.length || !menuItems.length) return;

    const now = new Date();
    let filteredOrders = orders;

    if (filter === 'today') {
      filteredOrders = orders.filter(o => isAfter(new Date(o.createdAt), startOfDay(now)));
    } else if (filter === 'week') {
      filteredOrders = orders.filter(o => isAfter(new Date(o.createdAt), startOfWeek(now)));
    } else if (filter === 'month') {
      filteredOrders = orders.filter(o => isAfter(new Date(o.createdAt), startOfMonth(now)));
    }

    const delivered = filteredOrders.filter(o => o.status === 'Delivered');
    const pending = filteredOrders.filter(o => o.status === 'Pending');
    
    setStats({
      totalOrders: filteredOrders.length,
      deliveredOrders: delivered.length,
      pendingOrders: pending.length,
      totalSales: delivered.reduce((acc, order) => acc + order.totalPrice, 0)
    });

    const itemSales = {}; 

    filteredOrders.forEach(order => {
      if (order.status === 'Cancelled') return; 

      order.orderItems.forEach(item => {
        const originalItem = menuItems.find(m => m._id === item.product);
        const category = originalItem ? originalItem.category : 'Unknown';
        const imageUrl = originalItem ? originalItem.imageUrl : '';

        if (!itemSales[item.product]) {
          itemSales[item.product] = { 
            name: item.name, 
            category, 
            imageUrl,
            qty: 0, 
            revenue: 0 
          };
        }
        itemSales[item.product].qty += item.qty;
        itemSales[item.product].revenue += (item.price * item.qty);
      });
    });

    const allSoldItems = Object.values(itemSales).sort((a, b) => b.qty - a.qty);

    setBestSellersLechon(allSoldItems.filter(i => i.category === 'Lechon').slice(0, 5));
    setBestSellersMenu(allSoldItems.filter(i => i.category !== 'Lechon').slice(0, 5));

    const salesByDate = {};
    
    filteredOrders.forEach(order => {
        if (order.status === 'Cancelled') return;
        const dateKey = format(new Date(order.createdAt), 'MMM dd'); 
        if (!salesByDate[dateKey]) salesByDate[dateKey] = 0;
        salesByDate[dateKey] += order.totalPrice;
    });

    const chartData = Object.keys(salesByDate).map(key => ({
        name: key,
        Sales: salesByDate[key]
    }));
    
    setGraphData(chartData);

  }, [filter, orders, menuItems]);

  const StatCard = ({ title, value, icon, color, link }) => (
    <Card elevation={2} sx={{ height: '100%', borderLeft: `5px solid ${color}` }}>
        <CardActionArea 
            onClick={() => navigate(link)} 
            sx={{ height: '100%', p: 2, display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}
        >
            <Box sx={{ p: 1.5, borderRadius: '50%', bgcolor: `${color}20`, mr: 2, color: color }}>
                {React.cloneElement(icon, { fontSize: 'large' })}
            </Box>
            <Box>
                <Typography variant="caption" color="text.secondary" fontWeight="bold" textTransform="uppercase">{title}</Typography>
                <Typography variant="h5" fontWeight="bold">{value}</Typography>
            </Box>
        </CardActionArea>
    </Card>
  );

  const BestSellerList = ({ title, items, icon }) => (
      <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
             {icon}
             <Typography variant="h6" fontWeight="bold" sx={{ ml: 1 }}>{title}</Typography>
          </Box>
          <Divider sx={{ mb: 1 }} />
          <List>
              {items.length === 0 ? <Typography variant="body2" sx={{fontStyle:'italic'}}>No sales yet for this period.</Typography> : items.map((item, index) => (
                  <ListItem key={index} disableGutters>
                      <ListItemAvatar>
                          <Avatar src={item.imageUrl} variant="rounded" />
                      </ListItemAvatar>
                      <ListItemText 
                        primary={<Typography variant="body2" fontWeight="bold">{item.name}</Typography>}
                        secondary={`Sold: ${item.qty} | ₱${item.revenue.toLocaleString()}`} 
                      />
                  </ListItem>
              ))}
          </List>
      </Paper>
  );

  return (
    <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" fontWeight="bold" sx={{ color: '#333' }}>
          Dashboard Overview
        </Typography>
        
        <ToggleButtonGroup
          value={filter}
          exclusive
          onChange={(e, newFilter) => { if(newFilter) setFilter(newFilter); }}
          aria-label="date filter"
          color="primary"
          size="small"
        >
          <ToggleButton value="today">Today</ToggleButton>
          <ToggleButton value="week">This Week</ToggleButton>
          <ToggleButton value="month">This Month</ToggleButton>
          <ToggleButton value="all">All Time</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {loading && <Box sx={{ display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>}

      {!loading && (
          <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                  <StatCard 
                    title="Total Sales" 
                    value={`₱${stats.totalSales.toLocaleString()}`} 
                    icon={<PaymentsIcon />} // <--- UPDATED to "Paper Bill" Icon
                    color={theme.palette.primary.main} 
                    link="/admin/reports" 
                  />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                  <StatCard 
                    title="Total Orders" 
                    value={stats.totalOrders} 
                    icon={<ShoppingBasketIcon />} 
                    color="#1976d2" 
                    link="/admin/orders" 
                  />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                  <StatCard 
                    title="Delivered" 
                    value={stats.deliveredOrders} 
                    icon={<LocalShippingIcon />} 
                    color="#2e7d32" 
                    link="/admin/orders" 
                  />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                  <StatCard 
                    title="Pending" 
                    value={stats.pendingOrders} 
                    icon={<PendingActionsIcon />} 
                    color="#d32f2f" 
                    link="/admin/orders" 
                  />
              </Grid>

              <Grid item xs={12} md={8}>
                  <Paper elevation={2} sx={{ p: 3, height: 400 }}>
                      <Typography variant="h6" fontWeight="bold" gutterBottom>Sales Trends</Typography>
                      <ResponsiveContainer width="100%" height="90%">
                          <AreaChart data={graphData}>
                              <defs>
                                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.8}/>
                                  <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} />
                              <XAxis dataKey="name" axisLine={false} tickLine={false} />
                              <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `₱${value/1000}k`} />
                              <Tooltip formatter={(value) => `₱${value.toLocaleString()}`} />
                              <Legend />
                              <Area type="monotone" dataKey="Sales" stroke={theme.palette.primary.main} strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                          </AreaChart>
                      </ResponsiveContainer>
                  </Paper>
              </Grid>

              <Grid item xs={12} md={4}>
                  <BestSellerList title="Top Lechon" items={bestSellersLechon} icon={<RestaurantIcon color="primary" />} />
              </Grid>

              <Grid item xs={12} md={6}>
                  <BestSellerList title="Top Menu Items" items={bestSellersMenu} icon={<FastfoodIcon color="secondary" />} />
              </Grid>
          </Grid>
      )}
    </Container>
  );
}

export default DashboardPage;