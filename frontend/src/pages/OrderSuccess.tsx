import { useEffect, useState } from 'react';
import { Container, Typography, Button, Box } from '@mui/material';
import { CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Elements, useStripe } from '@stripe/react-stripe-js';
import { stripePromise } from '../lib/stripe';
import { useCart } from '../contexts/CartContext';

function OrderSuccessContent() {
  const navigate = useNavigate();
  const stripe = useStripe();
  const { clearCart } = useCart();
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    let mounted = true;

    const verifyPayment = async () => {
      if (!stripe) {
        return;
      }

      try {
        const clientSecret = new URLSearchParams(window.location.search).get(
          'payment_intent_client_secret'
        );

        if (clientSecret) {
          const { paymentIntent } = await stripe.retrievePaymentIntent(clientSecret);
          if (mounted) {
            if (paymentIntent && paymentIntent.status === 'succeeded') {
              clearCart();
            } else {
              navigate('/cart');
            }
          }
        } else {
          navigate('/cart');
        }
      } catch (error) {
        console.error('Payment verification failed:', error);
        navigate('/cart');
      } finally {
        if (mounted) {
          setIsVerifying(false);
        }
      }
    };

    verifyPayment();

    return () => {
      mounted = false;
    };
  }, [stripe, clearCart, navigate]);

  const handleContinueShopping = () => {
    navigate('/');
  };

  if (isVerifying) {
    return (
      <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
        <Typography>Verifying your payment...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
      <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
      
      <Typography variant="h4" gutterBottom>
        Thank you for your purchase!
      </Typography>
      
      <Typography color="text.secondary">
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