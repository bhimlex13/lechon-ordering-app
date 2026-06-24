import React from 'react';
import { Container, Typography, Box, Paper, Avatar, Button, Stack } from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import WorkIcon from '@mui/icons-material/Work';
import usePageTitle from '../hooks/usePageTitle';

function DeveloperPage() {
  usePageTitle('About the Developer');

  return (
    <Container maxWidth="md" sx={{ mt: 8, mb: 8 }}>
      <Paper elevation={4} sx={{ p: 5, borderRadius: 3, textAlign: 'center' }}>
        <Avatar
          alt="Alexander Oro"
          src="/images/developer-photo.jpg"
          imgProps={{ style: { objectPosition: 'center 10%' } }}
          sx={{ 
            width: 180, 
            height: 180, 
            margin: '0 auto', 
            mb: 3, 
            bgcolor: 'primary.main', 
            fontSize: '3rem',
            border: '4px solid #fff',
            boxShadow: '0px 8px 24px rgba(0,0,0,0.15)'
          }}
        >
          AO
        </Avatar>
        
        <Typography variant="h3" component="h1" fontWeight="bold" gutterBottom>
          Alexander Oro
        </Typography>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Full Stack Software Engineer
        </Typography>

        <Box sx={{ maxWidth: '600px', margin: '0 auto', mt: 4, mb: 5 }}>
          <Typography variant="body1" paragraph>
            Hello! I am Alexander Oro, a passionate developer with a strong focus on building scalable, performant, and beautiful web applications. 
          </Typography>
          <Typography variant="body1" paragraph>
            This <strong>Crispy Lechon House</strong> ordering platform is part of my portfolio, demonstrating my skills in full-stack development using the MERN stack (MongoDB, Express, React, Node.js), along with modern UI design using Material UI.
          </Typography>
          <Typography variant="body1">
            If you're looking for a dedicated engineer to bring your ideas to life or to join your engineering team, feel free to connect with me!
          </Typography>
        </Box>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center" mt={4}>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<LanguageIcon />}
            href="https://alexanderoro.vercel.app/"
            target="_blank"
            size="large"
            sx={{ fontWeight: 'bold' }}
          >
            Portfolio Website
          </Button>
          <Button 
            variant="outlined" 
            color="primary" 
            startIcon={<LinkedInIcon />}
            href="https://www.linkedin.com/in/alexanderoro0731/"
            target="_blank"
            size="large"
            sx={{ fontWeight: 'bold' }}
          >
            LinkedIn
          </Button>
          <Button 
            variant="outlined" 
            color="success" 
            startIcon={<WorkIcon />}
            href="https://www.upwork.com/freelancers/~01e9a88ee211734d10"
            target="_blank"
            size="large"
            sx={{ fontWeight: 'bold' }}
          >
            Upwork Profile
          </Button>
        </Stack>

      </Paper>
    </Container>
  );
}

export default DeveloperPage;
