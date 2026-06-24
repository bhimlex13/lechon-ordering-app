import React from 'react';
import { Container, Typography, Box, Grid, Card, CardContent, CardMedia, Button, Chip } from '@mui/material';
import usePageTitle from '../hooks/usePageTitle';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const blogs = [
  {
    id: 1,
    title: "The Secret to Perfect Crispy Lechon Skin",
    date: "June 15, 2026",
    category: "Culinary Tips",
    excerpt: "Ever wondered how we achieve that perfect crackle? It takes patience, the right temperature, and a few trade secrets we are sharing with you today...",
    image: "/images/blog-placeholder.png"
  },
  {
    id: 2,
    title: "Top 5 Side Dishes to Pair with Lechon",
    date: "June 02, 2026",
    category: "Food Pairing",
    excerpt: "Lechon is the star of the show, but every star needs a great supporting cast. Discover the best sides to elevate your next fiesta.",
    image: "/images/blog-placeholder.png"
  },
  {
    id: 3,
    title: "Our New Makati Branch is Finally Open!",
    date: "May 20, 2026",
    category: "News",
    excerpt: "We're bringing the best lechon closer to you. Join us this weekend as we celebrate the grand opening of our newest location in Makati.",
    image: "/images/store-placeholder.png"
  }
];

function BlogsPage() {
  usePageTitle('Blogs & News');

  return (
    <Box sx={{ py: 6, bgcolor: '#fff', minHeight: '80vh' }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            Blogs & Updates
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Stay updated with our latest news, recipes, and features
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {blogs.map((blog) => (
            <Grid item xs={12} md={4} key={blog.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', boxShadow: 2, borderRadius: 2, '&:hover': { boxShadow: 6, transition: '0.3s' } }}>
                <Box sx={{ position: 'relative' }}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={blog.image}
                    alt={blog.title}
                  />
                  <Chip 
                    label={blog.category} 
                    color="primary" 
                    size="small" 
                    sx={{ position: 'absolute', top: 10, right: 10, fontWeight: 'bold' }} 
                  />
                </Box>
                <CardContent sx={{ flexGrow: 1, p: 3, display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="caption" color="text.secondary" gutterBottom>
                    {blog.date}
                  </Typography>
                  <Typography gutterBottom variant="h5" fontWeight="bold">
                    {blog.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" paragraph sx={{ flexGrow: 1 }}>
                    {blog.excerpt}
                  </Typography>
                  <Box sx={{ mt: 'auto', pt: 2 }}>
                    <Button variant="text" color="primary" endIcon={<ArrowForwardIcon />} sx={{ fontWeight: 'bold' }}>
                      Read More
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}

export default BlogsPage;
