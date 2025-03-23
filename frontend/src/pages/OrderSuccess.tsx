import React, { useEffect } from 'react';
import { Container, Typography, Button, Box } from '@mui/material';
import { CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';
import { useStripe } from '@stripe/react-stripe-js';
import { stripePromise } from '../lib/stripe';
import { useCart } from '../contexts/CartContext';

function OrderSuccessContent() {
  const navigate = useNavigate();
  const stripe = useStripe();
  const { clearCart } = useCart();

  useEffect(() => {
    if (!stripe) {
      return;
    }

    // Retrieve the "payment_intent_client_secret" query parameter
    const clientSecret = new URLSearchParams(window.location.search).get(
      'payment_intent_client_secret'
    );

    if (clientSecret) {
      stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
        if (paymentIntent && paymentIntent.status === 'succeeded') {
          clearCart();
        } else {
          // Payment failed, redirect to cart
          navigate('/cart');
        }
      });
    } else {
      // No client secret found, redirect to cart
      navigate('/cart');
    }
  }, [stripe, clearCart, navigate]);

  const handleContinueShopping = () => {
    navigate('/');
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
      <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
      
      <Typography variant="h4" gutterBottom>
        Thank you for your purchase!
      </Typography>
      
      <Typography color="text.secondary" paragraph>
        Your order has been successfully processed. You will receive an email confirmation shortly.
      </Typography>

      <Box sx={{ mt: 4 }}>
        <Button
          variant="contained"
          size="large"
          onClick={handleContinueShopping}
        >
          Continue Shopping
        </Button>
      </Box>
    </Container>
  );
}

export default function OrderSuccess() {
  return (
    <Elements stripe={stripePromise}>
      <OrderSuccessContent />
    </Elements>
  );
} 