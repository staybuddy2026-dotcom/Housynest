import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { faviconBase64 } from '../../assets/faviconBase64.js';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

const RazorpayPaymentHandler = ({ isOpen, onClose, amount, bookingId, onSuccess, purpose }) => {
  const [isInitializing, setIsInitializing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      handlePayment();
    }
  }, [isOpen]);

  const handlePayment = async () => {
    if (isInitializing) return;
    setIsInitializing(true);

    try {
      const res = await loadRazorpayScript();

      if (!res) {
        toast.error('Failed to load Razorpay SDK. Please check your internet connection.');
        setIsInitializing(false);
        onClose();
        return;
      }

      const token = localStorage.getItem('accessToken');

      // Create Order
      const orderRes = await fetch('/api/payments/razorpay/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ amount, bookingId, purpose: purpose || 'booking_payment' })
      });

      const orderData = await orderRes.json();

      if (!orderData.success) {
        toast.error('Failed to initialize payment order');
        setIsInitializing(false);
        onClose();
        return;
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || orderData.key_id, // Enter the Key ID generated from the Dashboard
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: "Housynest",
        description: "Property Booking Payment",
        image: faviconBase64,
        order_id: orderData.order.id,
        handler: async function (response) {
          try {
            const verifyRes = await fetch('/api/payments/razorpay/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature
              })
            });

            const verifyData = await verifyRes.json();

            if (verifyData.success) {
              onSuccess('Paid');
            } else {
              toast.error('Payment Verification Failed!');
              onClose();
            }
          } catch (err) {
            console.error('Verification error:', err);
            toast.error('Payment Verification Error!');
            onClose();
          }
        },
        modal: {
          ondismiss: function () {
            setIsInitializing(false);
            onClose();
          }
        },
        prefill: {
          name: "Tenant Name", // Can be fetched from user profile if available
          email: "tenant@example.com",
          contact: "9999999999"
        },
        theme: {
          color: "#062F26"
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

    } catch (err) {
      console.error('Razorpay Error:', err);
      toast.error('Something went wrong during payment initialization.');
      onClose();
    } finally {
      setIsInitializing(false);
    }
  };

  // We don't render anything visually, the Razorpay SDK handles the popup overlay
  return null;
};

export default RazorpayPaymentHandler;
