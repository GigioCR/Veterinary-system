import React, { useState } from "react";
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

const ModalUpdate = ({ open, onClose, client_p, handleModificationSuccess}) => { 
    // objeto vacío para guardar los errores
    const [errores,setErrores] = useState({});

    const [visible, setVisible] = useState(false);

    const [client, setClient] = useState({
        USER_ID: client_p.USER_ID,
        NOMBRE: client_p.NOMBRE,
        APELLIDO: client_p.APELLIDO,
        CORREO: client_p.CORREO,
        DIRECCION: client_p.DIRECCION
    });

    const HandleChange = (e) => {
        // actualiza la info del cliente
        setClient((prev) => ({...prev, [e.target.name]: e.target.value}))
        // actualiza si hubieron errores en form
        setErrores((prevErrores) => ({ ...prevErrores, [e.target.name]: false }))
    }

    const handleUpdate = async () => {
        //e.preventDefault()
            const newErrores = {} // para guardar los errores
            console.log("Entre a handleUpdate")
            const nombreRegex = /^[A-Za-z]+$/; // Solo letras
            const apellidoRegex = /^[A-Za-z]+$/; // Solo letras
            const correoRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Formato de un correo
        
            if (!nombreRegex.test(client.NOMBRE) || client.NOMBRE.length > 50 || client.NOMBRE.length <= 0) {
                newErrores.NOMBRE = true;
            }

            if (!apellidoRegex.test(client.APELLIDO) || client.APELLIDO.length > 50 || client.APELLIDO.length <= 0) {
                newErrores.APELLIDO = true;
            }

            if (!correoRegex.test(client.CORREO) || client.CORREO.length > 50 || client.CORREO.length <= 0) {
                newErrores.CORREO = true;
            }

            if (client.DIRECCION.length > 500) {
                newErrores.DIRECCION = true;
            }

            setErrores(newErrores)

            // hay algún error
            if (Object.keys(newErrores).length > 0) {
                return
            }
        try {
            await axiosInstance.put("http://localhost:8080/administradores/clientes/update/" + client.USER_ID, client);
            handleModificationSuccess(true)
            onClose() 
        } catch (error) {
            handleModificationSuccess(false)
            onClose()
        }
    };

    return (
        <div>
                <Modal
                    open={open}
                    onClose={onClose}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                >
                    <Box sx={style}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6" component="h2">
                            Modificar Cliente
                        </Typography>
                        <IconButton onClick={onClose}>
                            <Close />
                        </IconButton>
                    </Box>
                        <FormGroup>
                        <TextField required
                            inputProps={{ "data-testid": "nombre" }}
                            label="Nombre"
                            name="NOMBRE"
                            value={client.NOMBRE}
                            variant="outlined"
                            InputLabelProps={inputPropsStyle}
                            fullWidth
                            margin="normal"
                            onChange={HandleChange}
                            error = {errores.NOMBRE}
                            helperText= {errores.NOMBRE? "El nombre no puede tener más de 50 letras ni estar vacío. Solo puede usar letras." : ""}
                        />
                        <TextField required
                            inputProps={{ "data-testid": "apellido" }}
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
                            inputProps={{ "data-testid": "correo" }}
                            label="Correo"
                            name="CORREO"
                            InputLabelProps={inputPropsStyle}
                            value={client.CORREO}
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            onChange={HandleChange}
                            error={errores.CORREO}
                            helperText={errores.CORREO?"El correo no puede tener más de 50 letras ni estar vacío. Verifique que siga el formato de un correo.":""}
                        />
                        <TextField
                            inputProps={{ "data-testid": "direccion" }}
                            label="Dirección"
                            name="DIRECCION"
                            InputLabelProps={inputPropsStyle}
                            multiline // para que el campo se haga más grueso conforme le entra texto
                            value={client.DIRECCION}
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            onChange={HandleChange}
                            error={errores.DIRECCION}
                            helperText = {errores.DIRECCION? "Dirección inválida. No puede pasarse de los 500 caracteres. Tampoco puede tener caracterse especiales":""}
                        />
                        </FormGroup>
                        <Box mt={2} display="flex" justifyContent="flex-end">
                            <Button onClick={onClose}>
                                Cancelar
                            </Button>
                            <Button variant="contained" sx={{ backgroundColor: '#4976CB' }} type="submit" onClick={handleUpdate}>
                                Guardar Cambios
                            </Button>
                        </Box>
                    </Box>
                </Modal>
            </div>
    );
};

export default ModalUpdate;