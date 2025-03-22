import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Navigate, useParams, useNavigate
} from "react-router-dom";
import axiosInstance from "../../../api/axiosInstance";
import SideMenu from "../SideMenu";
import Header from '../Header';
import {
  Box, Typography, CircularProgress,
  Button
} from '@mui/material';
import Cargando from "../../general/loadingScreen";

/* 
  Stripe documentation mentions that some payment methods may redirect to another page,
  therefore a return page is needed. This component handles those cases, if there's any.
*/
export default function CheckoutReturn() {

  const navigate = useNavigate();

  const [status, setStatus] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('');
  const { id } = useParams()
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const sessionId = urlParams.get('session_id');

  useEffect(() => {

    axiosInstance.get(`http://localhost:8080/clientes/session?session_id=${sessionId}`)
      .then((res) => {
        console.log(res)
        setStatus(res.data.status);
        if (res.data.status == 'complete') {
            fetchPaymentMethod().then(
              markComplete()
            )
        }
      });
    setLoading(false);
  }, []);


  const fetchPaymentMethod = async () => {
    try {
      await axiosInstance.get(`http://localhost:8080/clientes/payment_method/session?session_id=${sessionId}`)
      .then((res) => {
        console.log(res)
        setPaymentMethod(res.data.card_brand + ' - ' + res.data.card_last4);
        console.log(paymentMethod)
      });
    } catch (err) {
      console.error('Error in fetching payment method error', err);
    }
  }

  const markComplete = async () => {
    try {
      console.log(paymentMethod)
      const response = await axiosInstance.put(`http://localhost:8080/clientes/pagos/update`, {
        id: id,
        paymentMethod: paymentMethod
      });

      console.log(response)
    } catch (err) {
      console.error('Error updating payment state', err);
    } finally {
      setLoading(false);
    }
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

  if (status === 'open') {
    return (
      <Navigate to="clientes/pagos" />
    )
  }

  if (status === 'complete') {
    return (
      <Box sx={{ display: 'flex' }}>
        <SideMenu />
        {/* Main content */}
        <Box component="main" sx={{ flexGrow: 1, overflow: 'auto' }}>
          <Header />

          <Box className='dashSection' sx={{ width: '70%', marginLeft: '35px' }}>
            {/* Stripe Checkout component */}
            <Typography variant="h4" gutterBottom>Mis Pagos</Typography>
            <Typography variant="p">Su pago ha sido procesado correctamente.</Typography>  
            <Box sx={{ marginTop: '15px' }}>
              <Button>Descargar factura</Button>
              <Button variant="contained" color="primary" href="http://localhost:5173/clientes/pagos">
                Continuar
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
    )
  }
}