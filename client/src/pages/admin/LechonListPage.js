import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Button, Box, CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Modal, TextField, Checkbox, FormControlLabel, Grid, Chip, TablePagination, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import axios from 'axios';
import api from '../../api';

const modalStyle = {
  position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
  width: 500, maxHeight: '90vh', overflowY: 'auto', bgcolor: 'background.paper',
  border: '2px solid #000', boxShadow: 24, p: 4, display: 'flex', flexDirection: 'column', gap: 2,
};

const initialFormState = {
  _id: null, name: '', description: '', price: 0, category: 'Lechon', 
  imageUrl: '', availability: true, goodFor: '', cookedWeight: '',
  requires24Hours: true // Default Lechon to TRUE for safety
};

function LechonListPage() {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState('');
  const [priceSort, setPriceSort] = useState(''); // '' | 'asc' | 'desc'

  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentItem, setCurrentItem] = useState(initialFormState);
  const [formLoading, setFormLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchLechon = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/api/menu');
        setMenuItems(data.filter(item => item.category === 'Lechon'));
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchLechon();
  }, []);

  const handleOpenCreate = () => {
    setCurrentItem(initialFormState);
    setIsEditing(false);
    setModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setCurrentItem(item);
    setIsEditing(true);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setCurrentItem(initialFormState);
    setError(null);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newValue = type === 'checkbox' ? checked : value;

    if (type === 'number' || name === 'price') {
      if (newValue.length > 1 && newValue.startsWith('0') && newValue[1] !== '.') {
        newValue = newValue.replace(/^0+/, ''); 
      }
    }
    
    setCurrentItem((prev) => ({ ...prev, [name]: newValue }));
  };

  const uploadFileHandler = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
        setCurrentItem((prev) => ({ ...prev, imageUrl: reader.result }));
        setUploading(false);
    };
    reader.onerror = () => {
        setError('Image conversion failed.');
        setUploading(false);
    };
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (Number(currentItem.price) < 0) {
        alert("Price cannot be negative.");
        return;
    }
    if (!currentItem.name.trim()) {
        alert("Name is required.");
        return;
    }

    setFormLoading(true);
    try {
      const payload = { ...currentItem, category: 'Lechon' };
      if (isEditing) {
        const { data } = await api.put(`/api/menu/${currentItem._id}`, payload);
        setMenuItems((prev) => prev.map((item) => (item._id === data._id ? data : item)));
      } else {
        const { _id, ...createData } = payload;
        const { data } = await api.post('/api/menu', createData);
        setMenuItems((prev) => [...prev, data]);
      }
      handleCloseModal();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this Lechon item?')) {
      try {
        await api.delete(`/api/menu/${id}`);
        setMenuItems((prev) => prev.filter((item) => item._id !== id));
      } catch (err) {
        setError(err.message);
      }
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" color="primary" fontWeight="bold">Lechon Management</Typography>
        <Button variant="contained" color="primary" onClick={handleOpenCreate}>Add New Lechon</Button>
      </Box>

      {/* --- Filters & Search --- */}
      <Paper sx={{ p: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField 
                label="Search Lechon Name..." 
                variant="outlined" 
                size="small" 
                value={searchQuery}
                onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(0);
                }}
                sx={{ minWidth: 250 }}
              />
              <FormControl size="small" sx={{ minWidth: 200 }}>
                  <InputLabel>Sort by Price</InputLabel>
                  <Select
                      value={priceSort}
                      label="Sort by Price"
                      onChange={(e) => {
                          setPriceSort(e.target.value);
                          setPage(0);
                      }}
                  >
                      <MenuItem value="">No Sorting</MenuItem>
                      <MenuItem value="asc">Price: Low to High</MenuItem>
                      <MenuItem value="desc">Price: High to Low</MenuItem>
                  </Select>
              </FormControl>
          </Box>
      </Paper>

      {error && !modalOpen && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      {loading ? <CircularProgress /> : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                <TableCell>Image</TableCell>
                <TableCell>Name</TableCell>
                <TableCell align="right">Price</TableCell>
                <TableCell>Pax / Weight</TableCell>
                <TableCell>Pre-Order</TableCell>
                <TableCell>Available</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {menuItems
                .filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
                .sort((a, b) => {
                    if (priceSort === 'asc') return a.price - b.price;
                    if (priceSort === 'desc') return b.price - a.price;
                    return 0;
                })
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((item) => (
                <TableRow key={item._id}>
                  <TableCell>{item._id.substring(item._id.length - 6).toUpperCase()}</TableCell>
                  <TableCell><Box component="img" src={item.imageUrl} sx={{ width: 60, height: 60, borderRadius: 1, objectFit: 'cover' }} /></TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell align="right">₱{item.price.toLocaleString()}</TableCell>
                  <TableCell>
                    <Typography variant="caption" display="block">Pax: {item.goodFor}</Typography>
                    <Typography variant="caption" display="block">Wt: {item.cookedWeight}</Typography>
                  </TableCell>
                  <TableCell>
                      {item.requires24Hours && <Chip icon={<AccessTimeIcon />} label="24h Required" size="small" color="warning" />}
                  </TableCell>
                  <TableCell>{item.availability ? 'Yes' : 'No'}</TableCell>
                  <TableCell align="center">
                    <IconButton color="secondary" onClick={() => handleOpenEdit(item)}><EditIcon /></IconButton>
                    <IconButton color="error" onClick={() => handleDelete(item._id)}><DeleteIcon /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={menuItems.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase())).length}
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

      <Modal open={modalOpen} onClose={handleCloseModal}>
        <Box sx={modalStyle} component="form" onSubmit={handleFormSubmit}>
          <Typography variant="h5">{isEditing ? 'Edit Lechon' : 'New Lechon'}</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}><TextField name="name" label="Lechon Name" value={currentItem.name} onChange={handleFormChange} fullWidth required /></Grid>
            <Grid item xs={6}><TextField name="price" label="Price" type="number" inputProps={{ min: 0 }} value={currentItem.price} onChange={handleFormChange} fullWidth required /></Grid>
            <Grid item xs={6}><TextField name="goodFor" label="Good For" value={currentItem.goodFor} onChange={handleFormChange} fullWidth /></Grid>
            <Grid item xs={6}><TextField name="cookedWeight" label="Cooked Weight" value={currentItem.cookedWeight} onChange={handleFormChange} fullWidth /></Grid>
            <Grid item xs={12}><TextField name="description" label="Description" value={currentItem.description} onChange={handleFormChange} fullWidth multiline rows={2} /></Grid>
            <Grid item xs={12}>
               <Button variant="outlined" component="label" fullWidth startIcon={uploading ? <CircularProgress size={20}/> : <UploadFileIcon/>}>
                 Upload Image <input type="file" hidden onChange={uploadFileHandler} />
               </Button>
            </Grid>
            
            <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', bgcolor: '#f5f5f5', p: 1, borderRadius: 1 }}>
                    <FormControlLabel control={<Checkbox name="availability" checked={currentItem.availability} onChange={handleFormChange}/>} label="Available" />
                    {/* ITEM #18 CHECKBOX */}
                    <FormControlLabel 
                        control={<Checkbox name="requires24Hours" checked={currentItem.requires24Hours} onChange={handleFormChange} color="warning" />} 
                        label="Requires 24-Hour Notice" 
                    />
                </Box>
            </Grid>
            
          </Grid>
          <Button type="submit" variant="contained" disabled={formLoading || uploading} sx={{ mt: 2 }}>{isEditing ? 'Save' : 'Create'}</Button>
        </Box>
      </Modal>
    </Container>
  );
}
export default LechonListPage;