const express = require('express');
const router = express.Router();
const adminController = require('../controllers/AdminController');
const { auth, restrictTo } = require('../auth');

// Protect all routes and only allow admins
router.use(auth); // Ensure user is logged in
router.use(restrictTo('administrador')); // Only allow admins to access these routes

// Dashboard
router.get("/", adminController.adminStats);
router.get("/calendario", adminController.adminCalendar);

// Profile
router.get("/perfil/:id", adminController.viewAdminProfile);
router.put("/perfil/datos/:id", adminController.updateAdminProfile);
router.put("/perfil/contrasena/check/:id", adminController.checkPasswordMatch);
router.put("/perfil/contrasena/:id", adminController.updateAdminPassword);

// Clients Routes
router.get("/clientes", adminController.clientList)
router.get("/clientes/activos", adminController.clientActivosList); // Route to fetch active clients for the dropdown
router.get("/availableClients", adminController.clientAvailableList)
router.post("/clientes/add", adminController.clientAddPost)
router.put("/clientes/update/:id", adminController.clientUpdatePut)
router.put("/clientes/delete/", adminController.clientDeletePut)

//Mascots Routes
router.get("/mascotas", adminController.mascotList)
router.post("/mascotas/add", adminController.mascotAddPost)
router.put("/mascotas/update", adminController.mascotUpdatePut)
router.put("/mascotas/delete/", adminController.mascotDeletePut)

//Species Routes
router.get("/especies", adminController.speciesList)

//Razas Routes
router.get("/razas", adminController.breedsList)



// Services routes
router.get("/servicios", adminController.serviceList);
router.post("/servicios", adminController.serviceCreatePost);
router.put("/servicios", adminController.serviceUpdatePost);
router.put('/servicios/estado/:id', adminController.serviceToggleState);
router.get("/tratamientos", adminController.treatmentList)

// Veterinarians routes
router.get('/veterinarios', adminController.veterinarioList);
router.get('/veterinarios/activos', adminController.veterinariosActivosList);
router.get('/veterinarios/:id', adminController.veterinarioVerificarSiEstaba);
router.post('/veterinarios', adminController.veterinarioCreatePost);
router.delete('/veterinarios/:id', adminController.veterinarioDeletePost);
router.put('/veterinarios/:id', adminController.veterinarioUpdatePut);
router.put('/veterinarios/estado/:id', adminController.veterinarioToggleEstado);

// Citas routes
router.get('/citas', adminController.citaList);
router.post('/citas', adminController.citaCreate);
router.put('/citas/estado/:citaId', adminController.updateCitaEstado);

router.get("/tipos_cita", adminController.tipoCitasActivosList);
router.get("/mascotas/:id_usuario_cli", adminController.getMascotasActivasByCliente);
router.get('/citas/available-times', adminController.availableTimes);
router.get("/clientes/activos", adminController.clientActivosList); // Route to fetch active clients for the dropdown
router.get("/servicios-for-citas", adminController.serviceListForCitas);

// Endpoint to get services associated with a cita
router.get('/citas/:citaId/servicios', adminController.getCitaServiciosByCitaId);

// Endpoint to delete services associated with a cita
router.delete('/citas/:citaId/servicios', adminController.deleteCitaServiciosByCitaId);

// Endpoint to create a cita_servicio
router.post('/citas/servicios', adminController.createCitaServicio);

// Endpoint to update a cita (include services in the request body)
router.put('/citas/:citaId', adminController.updateCita);
// Placeholder for mascotas route (if needed)
router.get("/mascotas", (req, res) => {
  res.send("crud mascotas");
});

// Pagos
router.get("/pagos", adminController.PagosList);
router.get("/pagos/servicios/", adminController.CitasServiciosList);

module.exports = router;
