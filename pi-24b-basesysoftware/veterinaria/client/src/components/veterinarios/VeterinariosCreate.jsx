import React, { useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
import {
  Box, Typography, Button, TextField, Modal, FormGroup
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SideMenu from './SideMenu';
import Header from './Header';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '30%',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
};

const inputPropsStyle = {
  shrink: true, // Ensures the label stays on top
}

export default function AddVet() {
  const [formValues, setFormValues] = useState({
    id_usuario: '',
    nombre: '',
    apellido: '',
    correo: '',
    contrasena: '',
    salario: '',
    especialidad: '',
  });
  const [confirmContrasena, setConfirmContrasena] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const navigate = useNavigate();

  // Form change handler
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    if (name === 'confirmContrasena') {
      setConfirmContrasena(value);
    } else {
      setFormValues((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Create veterinarian
  const handleCreateVet = async (e) => {
    e.preventDefault();
    // Add validation if needed

    if (formValues.contrasena !== confirmContrasena) {
      setErrorMessage('Las contraseñas no coinciden');
      setShowErrorModal(true);
      return;
    }

    try {
      await axiosInstance.post('http://localhost:8080/administradores/veterinarios', formValues);
      setShowSuccessModal(true);
    } catch (err) {
      console.error('Error creating veterinarian', err);
      setErrorMessage('Error al crear el veterinario');
      setShowErrorModal(true);
    }
  };

  const handleCloseErrorModal = () => {
    setShowErrorModal(false);
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    navigate('/administradores/veterinarios');
  };

  return (
    <div>
      <Modal open={showErrorModal} onClose={handleCloseErrorModal}>
        <Box sx={modalStyle}>
          <Typography variant="h6">Error</Typography>
          <Typography>{errorMessage}</Typography>
          <Button onClick={handleCloseErrorModal}>Cerrar</Button>
        </Box>
      </Modal>

      <Modal open={showSuccessModal} onClose={handleCloseSuccessModal}>
        <Box sx={modalStyle}>
          <Typography variant="h6">Éxito</Typography>
          <Typography>Veterinario agregado correctamente</Typography>
          <Button onClick={handleCloseSuccessModal}>Aceptar</Button>
        </Box>
      </Modal>

      <Box sx={{ display: 'flex' }}>
        <SideMenu />
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Header />
          <Typography variant="h4" gutterBottom>
            Agregar Veterinario
          </Typography>
          <form onSubmit={handleCreateVet}>
            <FormGroup>
              <TextField
              InputLabelProps={inputPropsStyle}
                required
                label="ID Usuario"
                name="id_usuario"
                value={formValues.id_usuario}
                onChange={handleFormChange}
                fullWidth
                margin="normal"
              />
              <TextField
              InputLabelProps={inputPropsStyle}
                required
                label="Nombre"
                name="nombre"
                value={formValues.nombre}
                onChange={handleFormChange}
                fullWidth
                margin="normal"
              />
              <TextField
                required
                InputLabelProps={inputPropsStyle}
                label="Apellido"
                name="apellido"
                value={formValues.apellido}
                onChange={handleFormChange}
                fullWidth
                margin="normal"
              />
              <TextField
                required
                InputLabelProps={inputPropsStyle}
                label="Correo"
                name="correo"
                type="email"
                value={formValues.correo}
                onChange={handleFormChange}
                fullWidth
                margin="normal"
              />
              <TextField
                required
                InputLabelProps={inputPropsStyle}
                label="Contraseña"
                name="contrasena"
                type="password"
                value={formValues.contrasena}
                onChange={handleFormChange}
                fullWidth
                margin="normal"
              />
              <TextField
                required
                InputLabelProps={inputPropsStyle}
                label="Confirmar Contraseña"
                name="confirmContrasena"
                type="password"
                value={confirmContrasena}
                onChange={handleFormChange}
                fullWidth
                margin="normal"
              />
              <TextField
                required
                InputLabelProps={inputPropsStyle}
                label="Salario"
                name="salario"
                type="number"
                value={formValues.salario}
                onChange={handleFormChange}
                fullWidth
                margin="normal"
              />
              <TextField
                required
                InputLabelProps={inputPropsStyle}
                label="Especialidad"
                name="especialidad"
                value={formValues.especialidad}
                onChange={handleFormChange}
                fullWidth
                margin="normal"
              />
              <Box mt={2}>
                <Button variant="contained" color="primary" type="submit">
                  Agregar
                </Button>
              </Box>
            </FormGroup>
          </form>
        </Box>
      </Box>
    </div>
  );
}
