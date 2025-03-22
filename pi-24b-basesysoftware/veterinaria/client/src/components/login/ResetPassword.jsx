import React, { useState } from 'react';
import axiosInstance from '../../api/axiosInstance.js';
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  Container, Box, TextField, Button, Typography,
  Card, CardContent, CardMedia, FormGroup
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import HomeHeader from '../home/HomeHeader.jsx';
import HomeFooter from '../home/HomeFooter.jsx';
import logo from '../../assets/homeAssets/gatilloAzulillo.png';

export default function ResetPassword() {
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const inputPropsStyle = {
    shrink: true, // Ensures the label stays on top
  }
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const query = new URLSearchParams(location.search);
  const token = query.get("token");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setErrors({});

    const { newPassword, confirmPassword } = formData;

    // Validate password constraints
    const validationErrors = validatePassword(newPassword);
    let newErrors = {};

    if (validationErrors.length > 0) {
      newErrors.newPassword = validationErrors.join(' ');
    }

    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await axiosInstance.post('http://localhost:8080/reset-password', { token, newPassword });
      setMessage("Contraseña restablecida correctamente. Redirigiendo al inicio de sesión...");
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setErrors({ general: "Error al restablecer la contraseña. El enlace puede haber expirado." });
    }
  };

  // Password validation function
  const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8 || password.length > 50) {
      errors.push("Debe tener entre 8 y 50 caracteres.");
    }
    if (!/[A-Z]/.test(password)) {
      errors.push("Debe contener al menos una letra mayúscula.");
    }
    if (!/[a-z]/.test(password)) {
      errors.push("Debe contener al menos una letra minúscula.");
    }
    if (!/[0-9]/.test(password)) {
      errors.push("Debe contener al menos un número.");
    }
    if (!/[!@#$%^&*(),.?\":{}|<>]/.test(password)) {
      errors.push("Debe contener al menos un carácter especial.");
    }
    return errors;
  };

  return (
    <div>
      <HomeHeader />
      <Container maxWidth={false} disableGutters align="center">
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center" // Mantener alignItems="center"
          minHeight="80vh" // Mantener minHeight sin py
        >
          <Card sx={{ maxWidth: 680, width: '100%' }}>
            <Grid container spacing={{ xs: 0, md: 0 }} columns={{ xs: 1, md: 4 }}>
              {/* Left side */}
              <Grid size={2} alignContent='center' className='leftLogInSection'>
                <CardContent>
                  <Box>
                    <CardMedia
                      sx={{ height: 168, width: 180, marginBottom: 2 }}
                      image={logo}
                      title="Logo de la veterinaria"
                    />
                    <Typography gutterBottom variant="h4" component="div">
                      Veterinaria El Bigote
                    </Typography>
                  </Box>
                </CardContent>
              </Grid>

              {/* Right side */}
              <Grid size={2} className='rightLogInSection'>
                <CardContent>
                  <Typography
                    gutterBottom
                    variant="h4"
                    component="div"
                    sx={{ textAlign: 'left', marginLeft: '8px' }}
                  >
                    Cambiar contraseña
                  </Typography>
                  <Box component="form" noValidate onSubmit={handleSubmit}>
                    <FormGroup>
                      <TextField
                      InputLabelProps={inputPropsStyle}
                        label="Nueva contraseña"
                        variant="outlined"
                        fullWidth
                        value={formData.newPassword}
                        onChange={handleChange}
                        required
                        type="password"
                        margin="normal"
                        name="newPassword"
                        error={!!errors.newPassword}
                        helperText={errors.newPassword}
                      />
                      <TextField
                        label="Confirmar contraseña"
                        InputLabelProps={inputPropsStyle}
                        variant="outlined"
                        fullWidth
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        type="password"
                        margin="normal"
                        name="confirmPassword"
                        error={!!errors.confirmPassword}
                        helperText={errors.confirmPassword}
                      />
                      {errors.general && (
                        <Typography color="error" variant="body2" sx={{ mt: 1, textAlign: 'left' }}>
                          {errors.general}
                        </Typography>
                      )}
                      {message && (
                        <Typography color="primary" variant="body2" sx={{ mt: 1, textAlign: 'left' }}>
                          {message}
                        </Typography>
                      )}
                      <Button
                        variant="contained"
                        sx={{ backgroundColor: '#4976CB', mt: 2 }}
                        type="submit"
                        fullWidth
                      >
                        Continuar
                      </Button>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 2 }}>
                        <Link to="/login" style={{ textDecoration: 'underline', color: '#4976CB' }}>
                          Volver al inicio de sesión
                        </Link>
                      </Box>
                    </FormGroup>
                  </Box>
                </CardContent>
              </Grid>
            </Grid>
          </Card>
        </Box>
      </Container>
      <HomeFooter />
    </div>
  );
}
