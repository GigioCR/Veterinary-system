import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import TextField from '@mui/material/TextField';
import FormGroup from '@mui/material/FormGroup';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import  {Paper,  Grid2, IconButton }  from '@mui/material';
import { Close } from '@mui/icons-material';
import ErrorAlert from '../alerts/ErrorAlert';
import Autocomplete from '@mui/material/Autocomplete';
import axiosInstance from '../../api/axiosInstance';


const listBoxStyle = {
    maxHeight: 120
};

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

    const AddMascotWithClient = ({open, onClose, handleModificationSuccess, p_client}) => {
        const client = p_client;
        const [mascot, setMascot] = useState({
            USR_ID: client.USER_ID,
            MASCOT_ID: "",
            NAME: "",
            SPECIES: "",
            BREED: "",
            AGE: "",
            WEIGHT: "",
        })

        const [selectedSpecies, setSelectedSpecies] = useState('')

        const [filteredBreeds, setFilteredBreeds] = useState([]);


        const [species, setSpecies] = useState([])

        const [breeds, setBreeds] = useState([])

        // Loading state
        const [loading, setLoading] = useState(true);
        
        // objeto vacío para guardar los errores
        const [errores,setErrores] = useState({});

        const [errorAlertVisible, setErrorAlertVisible] = useState(false)

        const [userDoesntExistError, setUserDoesntExistError] = useState(false)

        const HandleChange = (e, newValue) => {
            mascot.USR_ID = client.USER_ID
            if (e.target.name) {
                setMascot((prev) => ({ ...prev, [e.target.name]: e.target.value }));
                setErrores((prevErrores) => ({ ...prevErrores, [e.target.name]: false }));
            } else {
            if (newValue) {
                // if (newValue.USER_ID) {
                //     setMascot((prev) => ({ ...prev, USR_ID: newValue.USER_ID }));
                // }
                if (newValue.SPECIES_ID) {
                    setSelectedSpecies(newValue.SPECIES_ID)
                    console.log("seclected species es: " + selectedSpecies)
                    setMascot((prev) => ({ ...prev, SPECIES: newValue.SPECIES_ID }));
                    setFilteredBreeds(breeds.filter(breed => breed.SPECIES_ID === newValue.SPECIES_ID));
                }
                if (newValue.BREED_ID) {
                    setMascot((prev) => ({ ...prev, BREED: newValue.BREED_ID }));
                }
            }
        }
        }

        const handleCloseErrorBanner = () => {
            setErrorAlertVisible(false)
        }

        const handleCloseUserDoesntExistsError = () => {
            setUserDoesntExistError(false)
        }


        const fetchSpecies = async() => {
            try {
                const response = await axiosInstance.get("http://localhost:8080/administradores/especies");

                const especiesData = response.data;
                const especiesFormatted = especiesData.map(especiesArray => ({
                    SPECIES_ID: especiesArray[0],
                    label: `${especiesArray[1]}`
                }));
                setSpecies(especiesFormatted);
            } catch (error) {
                console.log("se acabó en especies")
            } finally {
                setLoading(false);
            }
        }

        const fetchBreeds = async() => {
            try {
                const response = await axiosInstance.get("http://localhost:8080/administradores/razas");

                const breedsData = response.data;
                const breedsDataFormatted = breedsData.map(breedsDataArray => ({
                    SPECIES_ID: breedsDataArray[0],
                    BREED_ID: breedsDataArray[1],
                    label: `${breedsDataArray[2]}`
                }));
                setBreeds(breedsDataFormatted);
            } catch (error) {
                console.log("se acabó en razas")
            } finally {
                setLoading(false);
            }
        }

        useEffect(()=> {
            fetchBreeds()
        }, [open]) ;
        
        // para clearear el cliente cuando se cierra el modal
        useEffect(() => {

            if (open) {
                //console.log("hice fetch")
                fetchSpecies()
            }

            if (!open) {
              setMascot({
                USR_ID: "",
                MASCOT_ID: "",
                NAME: "",
                SPECIES: "",
                BREED: "",
                AGE: "",
                WEIGHT: "",
              });
              setErrores("")
              setSelectedSpecies("")
            }
          }, [open]);
        
        const handleClickAdd = async e => {
            e.preventDefault()
            const newErrores = {} // para guardar los errores
            const nombreRegex = /^[A-Za-z]+$/; // Solo letras
            // solo letras y números sin espacios ni nada especial
            const idRegex = /^[A-Za-z\d]+$/;
            const ageRegex = /^[\d]+$/; // solo números
            const weightRegex = /^(?:\d{1,3}|\d+(\.\d+)?)$/

            if (mascot.SPECIES.length <= 0) {
                newErrores.SPECIES = true;
            }
           
            if (mascot.BREED.length <= 0) {
                newErrores.BREED = true
            }

            if (!idRegex.test(mascot.MASCOT_ID) || mascot.MASCOT_ID.length > 50 || mascot.MASCOT_ID.length <= 0) {
                newErrores.MASCOT_ID = true
            }
            
            if (!nombreRegex.test(mascot.NAME) || mascot.NAME.length > 50 || mascot.NAME.length <= 0) {
                newErrores.NAME = true;
            }
            
            if (!ageRegex.test(mascot.AGE) || mascot.AGE.length > 2 || mascot.AGE.length <= 0) {
                newErrores.AGE = true;
            }

            if (!weightRegex.test(mascot.WEIGHT) || mascot.WEIGHT.length > 6 ||
             (mascot.WEIGHT.indexOf('.') === -1 && mascot.WEIGHT.length > 3) ||
                mascot.WEIGHT.length <= 0) {
                newErrores.WEIGHT = true;
            }
            setErrores(newErrores)

            // hay algún error
            if (Object.keys(newErrores).length > 0) {
                return
            }
            try {
                const result = await axiosInstance.post("http://localhost:8080/administradores/mascotas/add", mascot)
                if (result.data.mascotsExists) {
                    setErrorAlertVisible(true)
                    return
                } else if (!result.data.userExists) {
                    setUserDoesntExistError(true)
                    return
                } else {
                    handleModificationSuccess(true)
                    onClose()
                }
            } catch (error) {
                //setBackendError(true)
                handleModificationSuccess(false)
                onClose()
            }
        }
        
        if (loading) {
            return (
                <Box
                >
                </Box>
            );
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
                    <ErrorAlert message="El cliente indicado no existe" open={userDoesntExistError} onClose={handleCloseUserDoesntExistsError}></ErrorAlert>
                    <ErrorAlert message="El identificador de mascota ya existe, ingrese otro" open={errorAlertVisible} onClose={handleCloseErrorBanner}></ErrorAlert>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6" component="h2">
                            Agregar Mascota
                        </Typography>
                        <IconButton onClick={onClose}>
                            <Close />
                        </IconButton>
                    </Box>
                        <FormGroup>

                        <TextField 
                            label = "Cliente"
                            disabled
                            InputLabelProps={inputPropsStyle}
                            value={`${client.NOMBRE} ${client.APELLIDO}`}
                            variant="outlined"
                            fullWidth
                            margin="normal"
                        />
                        <TextField required
                            label = "Identificador de mascota"
                            name="MASCOT_ID"
                            InputLabelProps={inputPropsStyle}
                            value={mascot.MASCOT_ID}
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            onChange={HandleChange}
                            error = {errores.MASCOT_ID}
                            helperText={errores.MASCOT_ID?"El identificador de mascota no puede tener más de 50 caracteres ni ser vacío y solo debe tener letar y/o números":""}
                        />
                        <TextField required
                            label="Nombre"
                            name="NAME"
                            value={mascot.NAME}
                            InputLabelProps={inputPropsStyle}
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            onChange={HandleChange}
                            error = {errores.NAME}
                            helperText= {errores.NAME? "El nombre no puede tener más de 50 letras ni estar vacío. Solo puede usar letras.  No se permites Espacios" : ""}
                        />
                            
                        <FormControl fullWidth margin="normal" variant="outlined"> 
                            <Autocomplete
                            disablePortal
                            ListboxProps={{ style: listBoxStyle }}
                            margin="normal"
                            fullWidth
                            disableClearable
                            options={species} 
                            onChange={HandleChange}
                            renderInput={(params) => <TextField required {...params} label="Especie" name='SPECIES' error={errores.SPECIES} 
                                helperText={errores.SPECIES? "Debe elegir una especie":""} InputLabelProps={inputPropsStyle} value={mascot.SPECIES} />}
                        />
                        </FormControl>
                        <FormControl fullWidth margin="normal" variant="outlined" >
                        <Autocomplete
                            disablePortal
                            ListboxProps={{ style: listBoxStyle }}
                            margin="normal"
                            disabled = {selectedSpecies?false:true}
                            disableClearable
                            fullWidth
                            options={filteredBreeds} 
                            onChange={HandleChange}
                            renderInput={(params) => <TextField required {...params} label="Raza" name='BREED' error={errores.BREED} 
                            helperText={errores.BREED? "Debe elegir una raza":""} InputLabelProps={inputPropsStyle} value={mascot.BREED} />}
                        />
                        </FormControl>
                        {/* </FormControl> */}
                        <TextField required
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
                            <Button variant="contained" sx={{ backgroundColor: '#4976CB' }} type="submit" onClick={handleClickAdd}>
                                Agregar
                            </Button>
                        </Box>

                    </Box>
                </Modal>
            </div>
        );
    }

export default AddMascotWithClient;
