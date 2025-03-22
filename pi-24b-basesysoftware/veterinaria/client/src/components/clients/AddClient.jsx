import React, { useState, useEffect } from 'react';
import axios from 'axios';
import axiosInstance from '../../api/axiosInstance';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import TextField from '@mui/material/TextField';
import FormGroup from '@mui/material/FormGroup';
import  {Paper,  Grid2, IconButton }  from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import InputAdornment from '@mui/material/InputAdornment';
import { Close } from '@mui/icons-material';
import ErrorAlert from '../alerts/ErrorAlert';


const inputPropsStyle = {
    shrink: true, // Ensures the label stays on top
}
// style for modals
const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    boxShadow: 24,
    overflowY:'auto',
    maxHeight: '90vh',
    p: 4,
  };

    const AddClients = ({open, onClose, handleModificationSuccess}) => {
        const [client, setClient] = useState({
            ID_USUARIO: "",
            NOMBRE: "",
            APELLIDO: "",
            CORREO: "",
            CONTRASENA: "",
            DIRECCION: "",
            CONTRASENA_CONFIRMADA: ""
        })      
        
        // objeto vacío para guardar los errores
        const [errores,setErrores] = useState({});

        const [errorAlertVisible, setErrorAlertVisible] = useState(false)

        const [visible, setVisible] = useState(false);

        const HandleChange = (e) => {
            // actualiza la info del cliente
            setClient((prev) => ({...prev, [e.target.name]: e.target.value}))
            // actualiza si hubieron errores en form
            setErrores((prevErrores) => ({ ...prevErrores, [e.target.name]: false }))
        }

        const handleCloseErrorBanner = () => {
            setErrorAlertVisible(false)
        }
        
        // para clearear el cliente cuando se cierra el modal
        useEffect(() => {
            if (!open) {
              setClient({
                ID_USUARIO: "",
                NOMBRE: "",
                APELLIDO: "",
                CORREO: "",
                CONTRASENA: "",
                DIRECCION: "",
                CONTRASENA_CONFIRMADA: ""
              });
              setErrores("")
            }
          }, [open]);
        
        const handleClickAdd = async e => {
            e.preventDefault()
            const newErrores = {} // para guardar los errores
            console.log("Entre a handleUpdate")
            const nombreRegex = /^[A-Za-z]+$/; // Solo letras
            const apellidoRegex = /^[A-Za-z]+$/; // Solo letras
            const correoRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Formato de un correo
            // solo letras y números sin espacios ni nada especial
            const idUsrRegex = /^[A-Za-z\d]+$/;
            // Al menos una mayúsucula, una minúscula, un número y un caracter especial
            const contrasenaRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
            
            if (!idUsrRegex.test(client.ID_USUARIO) || client.ID_USUARIO.length > 50 || client.ID_USUARIO.length <= 0) {
                newErrores.ID_USUARIO = true
            }

            if (!nombreRegex.test(client.NOMBRE) || client.NOMBRE.length > 50 || client.NOMBRE.length <= 0) {
                newErrores.NOMBRE = true;
            }

            if (!apellidoRegex.test(client.APELLIDO) || client.APELLIDO.length > 50 || client.APELLIDO.length <= 0) {
                newErrores.APELLIDO = true;
            }

            if (!correoRegex.test(client.CORREO) || client.CORREO.length > 50 || client.CORREO.length <= 0) {
                newErrores.CORREO = true;
            }

            if (!contrasenaRegex.test(client.CONTRASENA) || client.CONTRASENA.length > 50 || client.CONTRASENA.length <= 8) {
                newErrores.CONTRASENA = true;
            }

            if (client.DIRECCION.length > 500) {
                newErrores.DIRECCION = true;
            }

            if (client.CONTRASENA != client.CONTRASENA_CONFIRMADA) {
                newErrores.CONTRASENA_CONFIRMADA = true;
            }
            setErrores(newErrores)

            // hay algún error
            if (Object.keys(newErrores).length > 0) {
                return
            }
            try {
                const result = await axiosInstance.post("http://localhost:8080/administradores/clientes/add", client)
                if (result.data.exists) {
                    setErrorAlertVisible(true)
                } else {
                    handleModificationSuccess(true)
                    onClose()
                }
            } catch (error) {
                handleModificationSuccess(false)
                onClose()
            }
        }

        return (
            <div>
                <Modal
                    open={open}
                    onClose={onClose}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                >
                    <Box sx={style}>
                    <ErrorAlert message="El nombre de usuario ya existe, ingrese otro" open={errorAlertVisible} onClose={handleCloseErrorBanner}></ErrorAlert>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6" component="h2">
                            Agregar Cliente
                        </Typography>
                        <IconButton onClick={onClose}>
                            <Close />
                        </IconButton>
                    </Box>
                        
                        <FormGroup>
                        <TextField required
                            label = "Nombre de Usuario"
                            name="ID_USUARIO"
                            value={client.ID_USUARIO}
                            InputLabelProps={inputPropsStyle}
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            onChange={HandleChange}
                            error = {errores.ID_USUARIO}
                            helperText={errores.ID_USUARIO?"El nombre de usuario no puede tener más de 50 caracteres ni ser vacío y solo debe tener letar y/o números":""}
                        />
                        <TextField required
                            label="Nombre"
                            name="NOMBRE"
                            value={client.NOMBRE}
                            InputLabelProps={inputPropsStyle}
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            onChange={HandleChange}
                            error = {errores.NOMBRE}
                            helperText= {errores.NOMBRE? "El nombre no puede tener más de 50 letras ni estar vacío. Solo puede usar letras." : ""}
                        />
                        <TextField required
                            label="Apellido"
                            name="APELLIDO"
                            value={client.APELLIDO}
                            InputLabelProps={inputPropsStyle}
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            onChange={HandleChange}
                            error = {errores.APELLIDO}
                            helperText={errores.APELLIDO?"El apellido no puede tener más de 50 letras ni estar vacío. Solo puede usar letras.":""}
                        />
                        <TextField required
                            label="Correo"
                            name="CORREO"
                            value={client.CORREO}
                            InputLabelProps={inputPropsStyle}
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            onChange={HandleChange}
                            error={errores.CORREO}
                            helperText={errores.CORREO?"El correo no puede tener más de 50 letras ni estar vacío. Verifique que siga el formato de un correo.":""}
                        />
                        <TextField
                            label="Dirección"
                            name="DIRECCION"
                            multiline // para que el campo se haga más grueso conforme le entra texto
                            value={client.DIRECCION}
                            InputLabelProps={inputPropsStyle}
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            onChange={HandleChange}
                            error={errores.DIRECCION}
                            helperText = {errores.DIRECCION? "Dirección inválida. No puede pasarse de los 500 caracteres. Tampoco puede tener caracterse especiales":""}
                        />
                        <TextField required
                            label="Contraseña"
                            name="CONTRASENA"
                            value={client.CONTRASENA}
                            //InputLabelProps={inputPropsStyle}
                            variant="outlined"
                            type={visible? "text":"password"}
                            fullWidth
                            margin="normal"
                            InputLabelProps={inputPropsStyle}
                            onChange={HandleChange}
                            error={errores.CONTRASENA}
                            helperText = {errores.CONTRASENA?"Contraseña inválida. Debe contener al menos 8 caracteres, una letra en mayúscula, una letra en minúscula, un número y un caracter especial.":""}
                            // para el toggle de la contraseña
                            InputProps={{
                                endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                    aria-label="toggle password visibility"
                                    onClick={() => setVisible(!visible)}   
                                        
                                    edge="end"
                                    >
                                    {visible ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                                )
                            }}
                        />
                        <TextField required
                        label="Confirmar contraseña"
                            name="CONTRASENA_CONFIRMADA"
                            value={client.CONTRASENA_CONFIRMADA}
                            variant="outlined"
                            type={visible ? "text":"password"}
                            InputLabelProps={inputPropsStyle}
                            fullWidth
                            margin="normal"
                            onChange={HandleChange}
                            error={errores.CONTRASENA_CONFIRMADA}
                            helperText = {errores.CONTRASENA_CONFIRMADA? "Las contraseñas deben concordar":""}
                            InputProps={{
                                endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                    aria-label="toggle password visibility"
                                    onClick={() => setVisible(!visible)}   
                                        
                                    edge="end"
                                    >
                                    {visible ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                                )
                            }}
                        />
                        </FormGroup>
                        <Box mt={2} display="flex" justifyContent="flex-end">
                            <Button onClick={onClose}>
                                Cancelar
                            </Button>
                            <Button variant="contained" sx={{ backgroundColor: '#4976CB' }} type="submit" onClick={handleClickAdd}>
                                Agregar
                            </Button>
                        </Box>

                    </Box>
                </Modal>
            </div>
        );
    }

export default AddClients;
