import React from 'react';
import { AppBar, Toolbar, Typography, Button, Badge } from '@mui/material';
import { ShoppingCart as ShoppingCartIcon } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

export default function Navbar() {
  const { items } = useCart();
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <AppBar position="sticky">
      <Toolbar>
        <Typography
          variant="h6"
          component={RouterLink}
          to="/"
          sx={{
            flexGrow: 1,
            textDecoration: 'none',
            color: 'inherit',
          }}
        >
          Bookstore
        </Typography>

        <Button
          component={RouterLink}
          to="/cart"
          color="inherit"
          startIcon={
            <Badge badgeContent={itemCount} color="error">
              <ShoppingCartIcon />
            </Badge>
          }
        >
          Cart
        </Button>
      </Toolbar>
    </AppBar>
  );
}