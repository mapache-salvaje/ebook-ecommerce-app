import React from 'react';
import { Container, Typography } from '@mui/material';
import BookList from '../components/BookList';

export default function Books() {
  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Available Books
      </Typography>
      <BookList />
    </Container>
  );
} 