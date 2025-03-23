import React, { useState } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Box, Button, Typography, CircularProgress } from '@mui/material';

interface CheckoutFormProps {
  onSuccess: () => void;
  onError: (error: string) => void;
}

export default function CheckoutForm({ onSuccess, onError }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/order-success`,
        },
      });

      if (error) {
        onError(error.message || 'An error occurred during payment.');
      } else {
        onSuccess();
      }
    } catch (err) {
      onError('An unexpected error occurred.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', maxWidth: 500 }}>
      <PaymentElement />
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
        <Button
          type="submit"
          variant="contained"
          disabled={!stripe || isProcessing}
          sx={{ minWidth: 200 }}
        >
          {isProcessing ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            'Pay now'
          )}
        </Button>
      </Box>
      {isProcessing && (
        <Typography sx={{ mt: 2, textAlign: 'center' }}>
          Processing your payment...
        </Typography>
      )}
    </Box>
  );
} 