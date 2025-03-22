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



const ModalDelete = ({ open,onClose, client_p, handleModificationSuccess}) => {

  const [client, setClient] = useState({
    USER_ID: client_p.USER_ID,
    ESTADO: client_p.ESTADO
});

  const handleUpdate = async () => {
    try {
      if (client.ESTADO == 1) {
        client.ESTADO = 0
      } else {
        client.ESTADO = 1
      }
      await axiosInstance.put("http://localhost:8080/administradores/clientes/delete/", client);
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
                          <strong> {client.ESTADO == 1? "Deshabilitar Cliente": "Habilitar Cliente"}</strong>
                        </Typography>
                        <IconButton onClick={onClose}>
                            <Close />
                        </IconButton>
                    </Box>

                        <Typography id="modal-modal-title" component="h2">
                        {client.ESTADO == 1? "¿Seguro que quiere deshabilitar al cliente?":"¿Seguro que quiere habilitar al cliente?"}
                        </Typography>


                        <Box mt={2} display="flex" justifyContent="flex-end">
                          <Button onClick={onClose} sx={{ mr: 2 }}>Cancelar</Button>
                          <Button
                            variant="contained"
                            color={client.ESTADO === 1 ? 'primary' : 'primary'}
                            onClick={handleUpdate}
                          >
                            {client.ESTADO === 1 ? 'Deshabilitar' : 'Habilitar'}
                          </Button>
                        </Box>

                    </Box>
                </Modal>
            </div>
  );
};

export default ModalDelete;