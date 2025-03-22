const express = require('express');
const router = express.Router();
const vetController = require('../controllers/VetController');
const { auth, restrictTo } = require('../auth');

// Protect all veterinarian routes
router.use(auth); // Ensure user is logged in
router.use(restrictTo('veterinario')); // Only allow veterinarians to access these routes

// Veterinarian routes

// Dashboard
router.get("/stats/:id", vetController.vetStats);
router.get("/calendario/:id", vetController.vetCalendar);

// Profile
router.get("/perfil/:id", vetController.viewVetProfile);
router.put("/perfil/datos/:id", vetController.updateVetProfile);
router.put("/perfil/contrasena/check/:id", vetController.checkPasswordMatch);
router.put("/perfil/contrasena/:id", vetController.updateVetPassword);

//Clients routes
router.get("/availableClients", vetController.clientAvailableList)

// Mascots routes
router.get("/mascotas", vetController.mascotList)
router.post("/mascotas/add", vetController.mascotAddPost)
router.put("/mascotas/update", vetController.mascotUpdatePut)
router.put("/mascotas/delete/", vetController.mascotDeletePut)

//Especies routes
router.get("/especies", vetController.speciesList);

//Razas Routes
router.get("/razas", vetController.breedsList)

// MedHistory routes
router.get("/mascotas/:id", vetController.medHistoryList)
router.get("/mascotas/citas/:id", vetController.medHistoryCitasList)
router.get("/cita_servicios/:citaId", vetController.CitasServiciosList)
router.get("/diagnosticos", vetController.diagnosticList)
router.get("/tratamientos", vetController.treatmentList)
router.post("/mascotas/padecimientos", vetController.addMedHistory)
router.put("/mascotas/padecimientos", vetController.editMedHistory)

// Citas routes
router.get('/citas/:id', vetController.citaList);
// Citas routes
router.get('/citas/:id', vetController.citaList);

// Update appointment status
router.put('/citas/:citaId/estado', vetController.updateCitaEstado);

// Get appointment details
router.get('/citas/:citaId/detalles', vetController.getCitaServicios);


module.exports = router;

