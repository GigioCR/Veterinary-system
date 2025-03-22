import React, { useState, useEffect } from "react";
import { loadStripe } from '@stripe/stripe-js';
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js';
import axiosInstance from "../../../api/axiosInstance";
import SideMenu from "../SideMenu";
import Header from '../Header';
import {
  Modal, Box, Typography, CircularProgress, Button
} from '@mui/material';
import { useLocation } from 'react-router-dom';
import Cargando from "../../general/loadingScreen";

const stripePromise = loadStripe("pk_test_51QKY4o09Kygg2wKkdyIuUV8nJPMru6l922kkE8fnhGzMcMPyrNk0XMH6l0T5PwuiK3jZemcmL2S4TeiBRiYRIQLV003dLMPl5g");

// Style for modals
const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
};

export default function CheckoutSession() {

  // Access state passed via navigate
  const location = useLocation();
  const [pagoInfo, setPagoInfo] = useState([])

  const [clientSecret, setClientSecret] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const [sessionId, setSessionId] = useState('');

  const handleComplete = () => {
    setIsComplete(true);
    handleOpen();
  }

  useEffect( () => {

    setPagoInfo({
      ID_PAGO: location.state.ID_PAGO,
      ID_CITA: location.state.ID_CITA,
      MONTO: location.state.MONTO,
      CITAS_SERVICIOS: location.state.CITAS_SERVICIOS
    })

    // Create PaymentIntent as soon as the page loads
    async function fetchClientSecret() {
      await axiosInstance.post(`http://localhost:8080/clientes/pagos/${location.state.ID_PAGO}`, {
        ID: localStorage.getItem('userId'),
        ID_PAGO: location.state.ID_PAGO,
        CITAS_SERVICIOS: location.state.CITAS_SERVICIOS
      })
        .then((res) => {
          console.log(res)
          console.log(res.data.clientSecret)
          setClientSecret(res.data.clientSecret);
          setSessionId(res.data.sessionID)
          setLoading(false);
        });
    }
    fetchClientSecret();
    
  }, []);

  const options = {clientSecret};

  const fetchPaymentMethod = async () => {
    try {
      const res = await axiosInstance.get(`http://localhost:8080/clientes/payment_method/session?session_id=${sessionId}`)
        console.log(res)
        const method = res.data.card_brand + ' - ' + res.data.card_last4
        return (method)
    } catch (err) {
      console.error('Error in fetching payment method error', err);
      return null
    }
  }

  const markComplete = async (paymentMethod) => {
    try {
      console.log(paymentMethod)
      const response = await axiosInstance.put(`http://localhost:8080/clientes/pagos/update`, {
        id: pagoInfo.ID_PAGO,
        paymentMethod: paymentMethod
      });

      console.log(response)
    } catch (err) {
      console.error('Error updating payment state', err);
    } finally {
      setLoading(false);
    }
  };

  // Manage success modal
  const [open, setOpen] = useState(false);
  const handleOpen = async () => {
    setOpen(true);
    try {
      const method = await fetchPaymentMethod();

      markComplete(method);
      
    } catch (err) {
      console.error("Error handling completion", err);
    }
  };
  const handleClose = () => {
    setOpen(false)
  };

  // Loading state
  const [loading, setLoading] = useState(true);

  // Show loading screen while data is being fetched
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
        <Box sx={{ mt: 2 }}>
          <Cargando />
        </Box>
      </Box>
    );
  }

  return (
    <div id="checkout">
      <Box sx={{ display: 'flex' }}>
        <SideMenu />
        {/* Main content */}
        <Box component="main" sx={{ flexGrow: 1, overflow: 'auto' }}>
          <Header />

          <Box className='dashSection' sx={{ width: '70%', marginLeft: '35px' }}>
            <Typography variant="h4" gutterBottom>Mis Pagos</Typography> 

            <Modal         
              open={open}
              onClose={(event, reason) => {
                if (reason !== 'backdropClick') {
                  handleClose();
                }
              }}
              aria-labelledby="modal-modal-title"
              aria-describedby="modal-modal-description"
            >
              <Box sx={style}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography id="modal-modal-title" variant="h6" component="h2">
                    Pago exitoso
                  </Typography>
                </Box>
                <Typography variant="p">Su pago ha sido procesado correctamente.</Typography>  
                <Box mt={2} display="flex" justifyContent="flex-end">
                  <Button
                    onClick={async () => {
                      try {
                        console.log(`Pago ID: ${pagoInfo.ID_PAGO}`);
                        const response = await axiosInstance.get(
                          `http://localhost:8080/pagos/recibo/${pagoInfo.ID_PAGO}`,
                          { responseType: 'blob' } // Ensure the response is treated as binary data
                        );

                        // Create a Blob URL for the PDF
                        const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));

                        // Open the PDF in a new browser tab
                        window.open(url, '_blank');
                      } catch (error) {
                        console.error('Error fetching PDF:', error);
                      }
                    }}
                  >
                    Descargar factura
                  </Button>
                  <Button variant="contained" color="primary" href="http://localhost:5173/clientes/pagos">
                    Continuar
                  </Button>
                </Box>
              </Box>

            </Modal>
          </Box>
          {/* Stripe Checkout component */}
            <Box
              sx={{
                border: '10px solid #f6f6f6',
                borderRadius: 1
              }}
            >
              <EmbeddedCheckoutProvider
                stripe={stripePromise}
                options={{
                  ...options,
                  onComplete: handleComplete
                }}
              >
                <EmbeddedCheckout label='here?'/>
              </EmbeddedCheckoutProvider>
            </Box>
        </Box>
      </Box>
    </div>
  )
}

