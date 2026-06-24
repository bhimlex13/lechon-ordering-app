import React, { useState, useEffect } from 'react';
import {
  Container, Typography, CircularProgress, Alert, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Paper, IconButton, Select, MenuItem, Chip,
  TablePagination, TextField, FormControl, InputLabel, Box
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '../../api';

function AdminUserListPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await api.get('/api/users'); 
        setUsers(data);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    if(!window.confirm(`Change user role to ${newRole}?`)) return;
    
    setUpdateLoading(true);
    try {
        await api.put(`/api/users/${userId}`, { role: newRole });
        setUsers(prev => prev.map(user => user._id === userId ? { ...user, role: newRole } : user));
    } catch (err) {
        alert(err.response?.data?.message || "Failed to update role");
    } finally {
        setUpdateLoading(false);
    }
  };

  const handleDelete = async (userId) => {
      if(!window.confirm("Are you sure you want to delete this user? This cannot be undone.")) return;
      try {
          await api.delete(`/api/users/${userId}`);
          setUsers(prev => prev.filter(u => u._id !== userId));
      } catch (err) {
          alert("Failed to delete user");
      }
  }

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>User Management</Typography>

      {/* --- Filters & Search --- */}
      <Paper sx={{ p: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField 
                label="Search Name or Email..." 
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
                  <InputLabel>Filter Role</InputLabel>
                  <Select
                      value={filterRole}
                      label="Filter Role"
                      onChange={(e) => {
                          setFilterRole(e.target.value);
                          setPage(0);
                      }}
                  >
                      <MenuItem value="">All Roles</MenuItem>
                      <MenuItem value="Customer">Customer</MenuItem>
                      <MenuItem value="Staff">Staff</MenuItem>
                      <MenuItem value="Admin">Admin</MenuItem>
                      <MenuItem value="Superadmin">Superadmin</MenuItem>
                  </Select>
              </FormControl>
          </Box>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      {loading ? <CircularProgress /> : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Current Role</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Change Role</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users
                .filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase()))
                .filter(u => filterRole ? u.role === filterRole : true)
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map(user => (
                <TableRow key={user._id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                      <Chip 
                        label={user.role} 
                        color={user.role === 'Admin' || user.role === 'Superadmin' ? 'error' : user.role === 'Staff' ? 'primary' : 'default'} 
                        size="small" 
                        variant="outlined"
                      />
                  </TableCell>
                  <TableCell>
                      <Select 
                        size="small" 
                        value={user.role} 
                        onChange={(e) => handleRoleChange(user._id, e.target.value)}
                        disabled={updateLoading}
                        sx={{ minWidth: 120 }}
                      >
                          <MenuItem value="Customer">Customer</MenuItem>
                          <MenuItem value="Staff">Staff</MenuItem>
                          <MenuItem value="Admin">Admin</MenuItem>
                          <MenuItem value="Superadmin">Superadmin</MenuItem>
                      </Select>
                  </TableCell>
                  <TableCell>
                      <IconButton color="error" onClick={() => handleDelete(user._id)}>
                          <DeleteIcon />
                      </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={users.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase())).filter(u => filterRole ? u.role === filterRole : true).length}
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

export default AdminUserListPage;