import React, { useState } from "react";
import axios from 'axios';
import axiosInstance from '../../api/axiosInstance';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import  {Paper,  Grid2, IconButton }  from '@mui/material';
import { Close } from '@mui/icons-material';

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

const ModalDeleteMascot = ({ open,onClose, mascot_p, handleModificationSuccess}) => {

  const [mascot, setMascot] = useState({
    MASCOT_ID: mascot_p.ID_MASCOTA,
    ESTADO: mascot_p.ESTADO
});

  const handleUpdate = async () => {
    try {

      if (mascot.ESTADO == 1) {
        mascot.ESTADO = 0
      } else {
        mascot.ESTADO = 1
      }

      await axiosInstance.put("http://localhost:8080/administradores/mascotas/delete/", mascot);
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
                    <Typography variant="h6">
                      Confirmar { mascot.ESTADO === 1 ? 'Deshabilitar' : 'Habilitar'}
                    </Typography>
                        <IconButton onClick={onClose}>
                            <Close />
                        </IconButton>
                    </Box>

                        <Typography id="modal-modal-title">
                        {mascot.ESTADO == 1? "¿Seguro que quiere deshabilitar a la mascota?":"¿Seguro que quiere habilitar a la mascota?"}
                        </Typography>
                        <Box mt={2} display="flex" justifyContent="flex-end">
                            <Button onClick={onClose}>
                                Cancelar
                            </Button>
                            <Button variant="contained" sx={{ backgroundColor: '#4976CB' }} type="submit" onClick={handleUpdate}>
                              {mascot_p.ESTADO === 1 ? 'Deshabilitar' : 'Habilitar'}
                            </Button>
                        </Box>
                    </Box>
                </Modal>
            </div>
  );
};

export default ModalDeleteMascot;