import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import {
  Box, Typography, Button, TextField, Modal, FormGroup
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
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

export default function UpdVet() {
  const [formValues, setFormValues] = useState({
    id_usuario: '',
    nombre: '',
    apellido: '',
    correo: '',
    contrasena: '',
    salario: '',
    especialidad: '',
    rol: 'veterinario',
  });
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const navigate = useNavigate();
  const { id } = useParams(); // Assuming you're using React Router v6

  useEffect(() => {
    fetchVeterinario();
  }, []);

  const fetchVeterinario = async () => {
    try {
      const res = await axiosInstance.get(
        `http://localhost:8080/administradores/veterinarios/${id}`
      );
      // Ensure that all fields have default values
      const data = res.data;
      setFormValues({
        id_usuario: data.ID_USUARIO ?? '',
        nombre: data.NOMBRE ?? '',
        apellido: data.APELLIDO ?? '',
        correo: data.CORREO ?? '',
        contrasena: '', // Leave password empty for security
        salario: data.SALARIO ?? '',
        especialidad: data.ESPECIALIDAD ?? '',
        rol: 'veterinario',
      });
    } catch (err) {
      console.error('Error fetching veterinarian', err);
    }
  };

  // Form change handler
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value ?? '' }));
  };

  // Update veterinarian
  const handleUpdateVet = async (e) => {
    e.preventDefault();

    // Password validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{1,50}$/;
    const { contrasena } = formValues;

    if (!contrasena) {
      setErrorMessage('La contraseña es obligatoria.');
      setShowErrorModal(true);
      return;
    }

    if (!passwordRegex.test(contrasena)) {
      setErrorMessage(
        'La contraseña debe tener al menos una letra mayúscula, una letra minúscula, un dígito, un carácter especial y no debe exceder los 50 caracteres.'
      );
      setShowErrorModal(true);
      return;
    }

    // Additional validations can be added here

    try {
      await axiosInstance.put(
        `http://localhost:8080/administradores/veterinarios/${formValues.id_usuario}`,
        formValues
      );
      setShowSuccessModal(true);
    } catch (err) {
      console.error('Error updating veterinarian', err);
      setErrorMessage('Error al actualizar el veterinario');
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
          <Typography>Veterinario actualizado correctamente</Typography>
          <Button onClick={handleCloseSuccessModal}>Aceptar</Button>
        </Box>
      </Modal>

      <Box sx={{ display: 'flex' }}>
        <SideMenu />
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Header />
          <Typography variant="h4" gutterBottom>
            Editar Veterinario
          </Typography>
          <form onSubmit={handleUpdateVet}>
            <FormGroup>
              <TextField
                required
                label="Nombre"
                name="nombre"
                value={formValues.nombre ?? ''}
                onChange={handleFormChange}
                fullWidth
                margin="normal"
              />
              <TextField
                required
                label="Apellido"
                name="apellido"
                value={formValues.apellido ?? ''}
                onChange={handleFormChange}
                fullWidth
                margin="normal"
              />
              <TextField
                required
                label="Correo"
                name="correo"
                type="email"
                value={formValues.correo ?? ''}
                onChange={handleFormChange}
                fullWidth
                margin="normal"
              />
              <TextField
                required
                label="Contraseña"
                name="contrasena"
                type="password"
                value={formValues.contrasena ?? ''}
                onChange={handleFormChange}
                fullWidth
                margin="normal"
              />
              <TextField
                required
                label="Salario"
                name="salario"
                type="number"
                value={formValues.salario ?? ''}
                onChange={handleFormChange}
                fullWidth
                margin="normal"
              />
              <TextField
                required
                label="Especialidad"
                name="especialidad"
                value={formValues.especialidad ?? ''}
                onChange={handleFormChange}
                fullWidth
                margin="normal"
              />
              <Box mt={2}>
                <Button variant="contained" color="primary" type="submit">
                  Guardar Cambios
                </Button>
              </Box>
            </FormGroup>
          </form>
        </Box>
      </Box>
    </div>
  );
}
