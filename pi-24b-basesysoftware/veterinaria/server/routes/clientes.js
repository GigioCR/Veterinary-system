const express = require('express');
const router = express.Router();
const clientController = require('../controllers/ClientController');
const { auth, restrictTo } = require('../auth');

// Protect all client routes
router.use(auth); // Ensure user is logged in
router.use(restrictTo('cliente')); // Only allow clients to access these routes

// Client routes

//Dashboard routes
router.get("/calendario/:id", clientController.clientCalendar);
router.get("/calendarioDash/:id", clientController.clientCalendarDash);

// Profile
router.get("/perfil/:id", clientController.viewClientProfile);
router.put("/perfil/datos/:id", clientController.updateClientProfile);
router.put("/perfil/contrasena/check/:id", clientController.checkPasswordMatch);
router.put("/perfil/contrasena/:id", clientController.updateClientPassword);

// Route to mascotas associated with the client
router.get("/mascotas/:id", clientController.clientMascotasList)
router.get("/mascotasDash/:id", clientController.clientMascotasListDash)
router.get("/mascotas/padecimientos/:id", clientController.medHistoryList)
router.post("/mascotas/add", clientController.clientMascotAddPost)
router.put("/mascotas/update", clientController.mascotUpdatePut)
router.put("/mascotas/delete", clientController.mascotDeletePut)
router.get("/mascotas/citas/:id", clientController.medHistoryCitasList)
router.get("/tratamientos", clientController.treatmentList)
router.get("/diagnosticos", clientController.diagnosticList)

//Route to get species and breeds
router.get("/especies", clientController.speciesList)
router.get("/razas", clientController.breedsList)
router.post('/citas', clientController.createCita);

// Route to get all citas associated with the client
router.get("/citas", clientController.clientCitasList);

// Route to get services associated to a cita
router.get("/cita_servicios/:citaId", clientController.getCitaServiciosByCitaId);
router.get("/cita_serviciosCli/:citaId", clientController.getCitaServiciosByCitaIdCli);
router.get('/servicios/:citaId', clientController.getCitaServicios);

// Fetch Tipos de Cita
router.get('/tipos_cita', clientController.fetchTipoCitas);
router.get('/citas/available-times', clientController.getAvailableTimes);

router.put('/citas/:citaId', clientController.updateCita);
router.put('/citas/:citaId/estado', clientController.updateCitaEstado);

// Routes for cita_servicios
router.delete("/cita_servicios/:citaId", clientController.deleteCitaServiciosByCitaId);
router.post("/cita_servicios", clientController.createCitaServicio);
router.get('/servicios', clientController.fetchServicios);

// Pagos
router.get("/pagos/:id", clientController.PagosList);
router.get("/pagos/servicios/:id", clientController.CitasServiciosList);
router.post("/pagos/:id", clientController.clientCheckout);
router.get("/session", clientController.clientSessionStatus);
router.get("/payment_method/session", clientController.clientPaymentMethod);
router.put("/pagos/update", clientController.clientPaymentComplete);
router.get('/veterinarios/activos', clientController.fetchVeterinarians);

module.exports = router;