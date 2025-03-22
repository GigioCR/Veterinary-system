const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/PaymentController');
const { auth, restrictTo } = require('../auth');

// Apply authentication middleware to all routes
router.use(auth);

// Allow both 'cliente' and 'administrador' roles to access the routes
router.use(restrictTo('cliente', 'administrador'));

// Route to generate payment receipt
router.get('/recibo/:id', paymentController.generatePaymentReceipt);

module.exports = router;
