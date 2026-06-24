import React, { useState } from 'react';
import { Container, Typography, Box, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import usePageTitle from '../hooks/usePageTitle';

const faqs = [
  {
    question: "Do you deliver nationwide?",
    answer: "Currently, our delivery services are limited to Metro Manila and select nearby provinces to ensure the lechon arrives hot and fresh. We are working on expanding our reach soon!"
  },
  {
    question: "How far in advance should I place my order?",
    answer: "For whole lechon, we require at least 24 hours notice to prepare and perfectly roast your order. For smaller items like chopped lechon or meals, you can order for same-day delivery or pickup depending on availability."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept Cash on Delivery (COD) for selected areas, GCash, Bank Transfer (BDO, BPI), and all major Credit/Debit Cards via our online secure payment gateway."
  },
  {
    question: "How long does the lechon stay crispy?",
    answer: "Our lechon skin stays crispy for up to 4-5 hours after delivery. For the best experience, we recommend consuming it as soon as possible. If reheating is needed, use an oven or air fryer instead of a microwave."
  },
  {
    question: "Do you offer chopping services?",
    answer: "Yes! If you are ordering a whole lechon and would like it chopped before delivery, simply leave a note in the 'Special Instructions' box during checkout. This service is free of charge."
  }
];

function FAQPage() {
  usePageTitle('FAQ');
  const [expanded, setExpanded] = useState(false);

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <Box sx={{ py: 8, bgcolor: '#f9f9f9', minHeight: '80vh' }}>
      <Container maxWidth="md">
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            Frequently Asked Questions
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Got questions? We've got answers.
          </Typography>
        </Box>

        <Box>
          {faqs.map((faq, index) => (
            <Accordion 
              key={index} 
              expanded={expanded === `panel${index}`} 
              onChange={handleChange(`panel${index}`)}
              sx={{ mb: 2, borderRadius: 2, '&:before': { display: 'none' }, boxShadow: 1 }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon color="primary" />}
                sx={{ '& .MuiAccordionSummary-content': { my: 2 } }}
              >
                <Typography variant="h6" fontWeight="bold">{faq.question}</Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ bgcolor: '#fff', p: 3, borderTop: '1px solid #eee' }}>
                <Typography variant="body1" sx={{ lineHeight: 1.8, color: 'text.secondary' }}>
                  {faq.answer}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      </Container>
    </Box>
  );
}

export default FAQPage;
