import React, { useEffect, useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { Box, Container, Typography, Alert } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { stripePromise } from '../lib/stripe';
import api, { CreateOrderRequest } from '../services/api';
import CheckoutForm from '../components/CheckoutForm';
import { useCart } from '../contexts/CartContext';

interface LocationState {
  order: CreateOrderRequest;
}

export default function Checkout() {
  const [clientSecret, setClientSecret] = useState<string>();
  const [error, setError] = useState<string>();
  const location = useLocation();
  const navigate = useNavigate();
  const { order } = (location.state as LocationState) || {};
  const { clearCart } = useCart();

  useEffect(() => {
    if (!order) {
      navigate('/cart');
      return;
    }

    const createOrder = async () => {
      try {
        // Create the order
        const { data: createdOrder } = await api.createOrder(order);
        
        // Get the payment intent
        const { data } = await api.createPaymentIntent(createdOrder.id);
        setClientSecret(data.clientSecret);
      } catch (err) {
        setError('Failed to create order. Please try again.');
      }
    };

    createOrder();
  }, [order, navigate]);

  const handleSuccess = () => {
    clearCart();
    navigate('/order-success');
  };

  if (!clientSecret) {
    return (
      <Container sx={{ py: 4 }}>
        <Typography>Preparing your order...</Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Checkout
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mt: 4 }}>
        <Elements
          stripe={stripePromise}
          options={{
            clientSecret,
            appearance: {
              theme: 'stripe',
            },
          }}
        >
          <CheckoutForm
            onSuccess={handleSuccess}
            onError={setError}
          />
        </Elements>
      </Box>
    </Container>
  );
} 