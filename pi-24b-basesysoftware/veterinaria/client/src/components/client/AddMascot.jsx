import React, { useState, useEffect } from 'react';
import axios from 'axios';
import axiosInstance from '../../api/axiosInstance';
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
import { CircularProgress } from '@mui/material';


const inputPropsStyle = {
    shrink: true, // Ensures the label stays on top
}
const listBoxStyle = {
    maxHeight: 120
};
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

    const AddMascot = ({open, onClose, handleModificationSuccess, userID}) => {
        const [mascot, setMascot] = useState({
            USR_ID: userID,
            MASCOT_ID: "",
            NAME: "",
            SPECIES: "",
            BREED: "",
            AGE: "",
            WEIGHT: "",
        })

        // la especie elegida en el menú
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
        const [availableClients, setAvailableClients] = useState([])

        const filterBreeds = () => {

        }

        const HandleChange = (e, newValue) => {
                if (e.target.name) {
                    setMascot((prev) => ({ ...prev, [e.target.name]: e.target.value }));
                    setErrores((prevErrores) => ({ ...prevErrores, [e.target.name]: false }));
                } else {
                if (newValue) {
                    if (newValue.USER_ID) {
                        setMascot((prev) => ({ ...prev, USR_ID: newValue.USER_ID }));
                    }
                    if (newValue.SPECIES_ID) {
                        setSelectedSpecies(newValue.SPECIES_ID)
                        setMascot((prev) => ({ ...prev, SPECIES: newValue.SPECIES_ID }));
                        filterBreeds();
                        setFilteredBreeds(breeds.filter(breed => breed.SPECIES_ID === newValue.SPECIES_ID));
                    }
                    if (newValue.BREED_ID) {
                        setMascot((prev) => ({ ...prev, BREED: newValue.BREED_ID }));
                    }
                } else {
                    setMascot((prev) => ({ ...prev, USR_ID: "" }));
                }
            }
        }

        const handleCloseErrorBanner = () => {
            setErrorAlertVisible(false)
        }

        const handleCloseUserDoesntExistsError = () => {
            setUserDoesntExistError(false)
        }

        // const fetchAvailableClients = async() => {
        //     try {
        //         const response = await axiosInstance.get("http://localhost:8080/administradores/availableClients");

        //         const clientsData = response.data;
        //         const clientsFormatted = clientsData.map(clientsArray => ({
        //             USER_ID: clientsArray[0],
        //             label: `${clientsArray[1]} ${clientsArray[2]}`
        //         }));
        //         setAvailableClients(clientsFormatted);
        //     } catch (error) {
        //         console.log("se acabó")
        //     } finally {
        //         setLoading(false);
        //     }
        // }

        const fetchSpecies = async() => {
            try {
                const response = await axiosInstance.get("http://localhost:8080/clientes/especies");

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
                const response = await axiosInstance.get("http://localhost:8080/clientes/razas");

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
            fetchSpecies()
        }, [open]);

        useEffect(()=> {
            fetchBreeds()
        }, [open]) ;

          
        
        // para clearear el cliente cuando se cierra el modal
        useEffect(() => {
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
                newErrores.BREED = true;
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
                mascot.USR_ID = userID;
                console.log("El peso es: " + mascot.WEIGHT)
                const result = await axiosInstance.post("http://localhost:8080/clientes/mascotas/add", mascot)
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
                    <ErrorAlert message="El identificador de mascota ya existe, ingrese otro" open={errorAlertVisible} onClose={handleCloseErrorBanner}></ErrorAlert>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6" component="h2">
                            Agregar Mascota
                        </Typography>
                        <IconButton onClick={onClose}>
                            <Close />
                        </IconButton>
                    </Box>
                        <FormGroup sx={{pt:4}}>

                        <TextField required
                            label = "Identificador de mascota"
                            name="MASCOT_ID"
                            value={mascot.MASCOT_ID}
                            variant="outlined"
                            InputLabelProps={inputPropsStyle}
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
                            variant="outlined"
                            InputLabelProps={inputPropsStyle}
                            fullWidth
                            margin="normal"
                            onChange={HandleChange}
                            error = {errores.NAME}
                            helperText= {errores.NAME? "El nombre no puede tener más de 50 letras ni estar vacío. Solo puede usar letras. No se permiten espacios" : ""}
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
                            renderInput={(params) => <TextField required {...params} label="Especie" name='SPECIES' error = {errores.SPECIES}
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
                        <TextField required
                            label="Edad en años"
                            name="AGE"
                            value={mascot.AGE}
                            variant="outlined"
                            InputLabelProps={inputPropsStyle}
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
                            variant="outlined"
                            type={"text"}
                            InputLabelProps={inputPropsStyle}
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

export default AddMascot;
