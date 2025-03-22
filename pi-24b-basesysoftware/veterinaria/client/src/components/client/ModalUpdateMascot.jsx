import React, { useState } from "react";
import axiosInstance from '../../api/axiosInstance';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import TextField from '@mui/material/TextField';
import FormGroup from '@mui/material/FormGroup';
import  {IconButton }  from '@mui/material';
import { Close } from '@mui/icons-material';

// style for modals

const inputPropsStyle = {
    shrink: true, // Ensures the label stays on top
}

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

const ModalUpdateMascot = ({ open, onClose, mascot_p, handleModificationSuccess}) => { 
    // objeto vacío para guardar los errores
    const [errores,setErrores] = useState({});

    const [mascot, setMascot] = useState({
        MASCOT_ID: mascot_p.ID_MASCOTA,
        NAME: mascot_p.NOMBRE_MASCOTA,
        AGE: mascot_p.AGE,
        WEIGHT: mascot_p.WEIGHT,
    });

    const HandleChange = (e) => {
        // actualiza la info del cliente
        setMascot((prev) => ({...prev, [e.target.name]: e.target.value}))
        // actualiza si hubieron errores en form
        setErrores((prevErrores) => ({ ...prevErrores, [e.target.name]: false }))
    }

    const handleUpdate = async () => {
        //e.preventDefault()
            const newErrores = {} // para guardar los errores
            console.log("Entre a handleUpdate")
            const nombreRegex = /^[A-Za-z]+$/; // Solo letras
            // solo letras y números sin espacios ni nada especial
            const ageRegex = /^[\d]+$/; // solo números
            const weightRegex = /^(?:\d{1,3}|\d+(\.\d+)?)$/
        
            if (!nombreRegex.test(mascot.NAME) || mascot.NAME.length > 50 || mascot.NAME.length <= 0) {
                newErrores.NAME = true;
            }
            if (!ageRegex.test(mascot.AGE) || String(mascot.AGE).length > 2 || String(mascot.AGE).length <= 0) {
                newErrores.AGE = true;
            }

            if (!weightRegex.test(mascot.WEIGHT) || String(mascot.WEIGHT).length > 6 ||
             (String(mascot.WEIGHT).indexOf('.') === -1 && String(mascot.WEIGHT).length > 3) ||
                String(mascot.WEIGHT).length <= 0) {
                newErrores.WEIGHT = true;
            }
            setErrores(newErrores)

            // hay algún error
            if (Object.keys(newErrores).length > 0) {
                return
            }
        try {
            await axiosInstance.put("http://localhost:8080/clientes/mascotas/update" ,mascot);
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
                            Modificar Mascota
                        </Typography>
                        <IconButton onClick={onClose}>
                            <Close />
                        </IconButton>
                    </Box>
                        <FormGroup>
                        <TextField required
                            inputProps={{ "data-testid": "nombre" }}
                            label="Nombre"
                            name="NAME"
                            value={mascot.NAME}
                            InputLabelProps={inputPropsStyle}
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            onChange={HandleChange}
                            error = {errores.NAME}
                            helperText= {errores.NAME? "El nombre no puede tener más de 50 letras ni estar vacío. Solo puede usar letras." : ""}
                        />
                        <TextField required
                            inputProps={{ "data-testid": "edad" }}
                            label="Edad en años"
                            name="AGE"
                            value={mascot.AGE}
                            InputLabelProps={inputPropsStyle}
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            onChange={HandleChange}
                            error={errores.AGE}
                            helperText = {errores.AGE? "Edad inválida. Debe ser un número y no debe tener más de 2 dígitos":""}
                        />
                        <TextField required
                            inputProps={{ "data-testid": "peso" }}
                            label="Peso en kg"
                            name="WEIGHT"
                            value={mascot.WEIGHT}
                            InputLabelProps={inputPropsStyle}
                            variant="outlined"
                            type={"text"}
                            fullWidth
                            margin="normal"
                            onChange={HandleChange}
                            error={errores.WEIGHT}
                            helperText = {errores.WEIGHT?"Peso inválido. Debe ser un número de máximo 5 dígitos 2 de ellos decimales":""}
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

export default ModalUpdateMascot;