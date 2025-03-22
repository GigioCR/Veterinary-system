const express = require("express");
const app = express();
app.use(express.json());
const cors = require("cors");
const oracledb = require('oracledb'); // Import oracledb

// Import the auth and restrictTo middlewares
const { auth, restrictTo } = require('./auth'); 

// Communicate with frontend
const corsOptions = {
  origin: ["http://localhost:5173"],
};
app.use(cors(corsOptions));

// Import the auth router
const authRouter = require('./routes/authRoutes');

// Use the auth router for both register and login routes
app.use('/', authRouter);

// Import role routes
const adminRoutes = require('./routes/administradores');
const clientRoutes = require('./routes/clientes');
const vetRoutes = require('./routes/veterinarios');

// Apply (sub)routes with protections
app.use('/administradores', auth, restrictTo('administrador'), adminRoutes);
app.use('/clientes', auth, restrictTo('cliente'), clientRoutes);
app.use('/veterinarios', auth, restrictTo('veterinario'), vetRoutes);

// Import payment routes
const pagosRoutes = require('./routes/pagos');
// Apply multi-user payment route
app.use('/pagos', pagosRoutes);

// Start up the server at port 8080
app.listen(8080, () => {
  console.log("Server started on port 8080");
})