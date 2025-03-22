const oracledb = require('oracledb');
const config = require('../config/dbConfig');
const asyncHandler = require('express-async-handler');
const path = require('path');
const PdfPrinter = require('pdfmake');
const fonts = {
  LiberationSans: {
    normal: path.join(__dirname, '../services/LiberationSans-Regular.ttf'),
    bold: path.join(__dirname, '../services/LiberationSans-Bold.ttf'),
    italics: path.join(__dirname, '../services/LiberationSans-Italic.ttf'),
    bolditalics: path.join(__dirname, '../services/LiberationSans-BoldItalic.ttf'),
  },
};
const printer = new PdfPrinter(fonts);

module.exports = {
  generatePaymentReceipt: asyncHandler(async (req, res) => {
    let conn;

    try {
      const paymentId = parseInt(req.params.id);

      // Create connection
      conn = await oracledb.getConnection(config);

      // Call the stored procedure
      const result = await conn.execute(
          `BEGIN
              ADMIN.SP_GET_PAYMENT_DETAILS(
                  :p_payment_id,
                  :p_mascota,
                  :p_veterinario,
                  :p_fecha_cita,
                  :p_hora_cita,
                  :p_monto_total,
                  :p_cliente_nombre,
                  :p_cliente_direccion,
                  :p_fecha_pago,
                  :p_servicios_cursor,
                  :p_error
              );
          END;`,
          {
              p_payment_id: { dir: oracledb.BIND_IN, val: paymentId },
              p_mascota: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 50 },
              p_veterinario: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 100 },
              p_fecha_cita: { dir: oracledb.BIND_OUT, type: oracledb.DATE },
              p_hora_cita: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 5 },
              p_monto_total: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
              p_cliente_nombre: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 100 },
              p_cliente_direccion: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 255 },
              p_fecha_pago: { dir: oracledb.BIND_OUT, type: oracledb.DATE },
              p_servicios_cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
              p_error: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 200 },
          }
      );

      // Check for errors from the stored procedure
      if (result.outBinds.p_error) {
          return res.status(400).json({ message: result.outBinds.p_error });
      }

      // Extract data from out parameters
      const mascota = result.outBinds.p_mascota;
      const veterinario = result.outBinds.p_veterinario;
      const fechaCita = result.outBinds.p_fecha_cita;
      const horaCita = result.outBinds.p_hora_cita;
      const montoTotal = result.outBinds.p_monto_total;
      const clienteNombre = result.outBinds.p_cliente_nombre;
      const clienteDireccion = result.outBinds.p_cliente_direccion;
      const fechaPago = result.outBinds.p_fecha_pago;

      // Fetch services from cursor
      const servicios = [];
      const resultSet = result.outBinds.p_servicios_cursor;
      let row;
      while ((row = await resultSet.getRow())) {
          servicios.push({
              nombre: row[0], // Nombre Servicio
              precio: row[1], // Precio
          });
      }
      await resultSet.close();

      // Group and Count Services
      const serviceCounts = servicios.reduce((acc, servicio) => {
        const key = `${servicio.nombre}-${servicio.precio}`;
        if (!acc[key]) {
          acc[key] = { ...servicio, cantidad: 0 };
        }
        acc[key].cantidad += 1;
        return acc;
      }, {});

      // Convert grouped services to an array
      const groupedServicios = Object.values(serviceCounts);

      // Prepare table rows with adjusted column widths
      const tableBody = [
        [
          { text: 'CANT.', style: 'tableHeader', alignment: 'right' },
          { text: 'DESCRIPCIÓN', style: 'tableHeader', alignment: 'right' },
          { text: 'PRECIO UNITARIO', style: 'tableHeader', alignment: 'right' },
          { text: 'IMPORTE', style: 'tableHeader', alignment: 'right' },
        ],
        ...groupedServicios.map((servicio) => {
          const unitPriceExclTax = Math.round(servicio.precio / 1.13); // Tax-exclusive unit price
          const totalExclTax = Math.round(unitPriceExclTax * servicio.cantidad); // Total excl. tax
          return [
            { text: servicio.cantidad, alignment: 'center' },
            { text: servicio.nombre },
            {
              text: `₡${unitPriceExclTax.toLocaleString('es-CR')}`, // Unit price excl. tax
              alignment: 'right',
            },
            {
              text: `₡${totalExclTax.toLocaleString('es-CR')}`, // Total excl. tax
              alignment: 'right',
            },
          ];
        }),
      ];
      // Totals
      const total = groupedServicios.reduce(
        (sum, servicio) => sum + servicio.precio * servicio.cantidad,
        0
      );
      const subtotal = Math.round(total / 1.13); // Calculate subtotal without tax
      const tax = total - subtotal; // Calculate tax as the difference

      // Define document content
      const docDefinition = {
        defaultStyle: {
          font: 'LiberationSans', // Ensure this matches the key in the `fonts` object
          fontSize: 10,
        },
        content: [
          // Header with logo and title in the same line
          {
            columns: [
              {
                stack: [
                  { text: 'Recibo de Pago', style: 'header' },
                  {
                    text: 'Veterinaria El Bigote',
                    style: 'companyName',
                  },
                  {
                    text: 'Avenida Central, San José, Costa Rica',
                    style: 'companyAddress',
                  },
                ],
                width: '*',
              },
              {
                image: path.join(
                  __dirname,
                  './../../client/src/assets/homeAssets/gatilloAzulillo.png'
                ), // Replace with your logo path
                width: 80,
                alignment: 'right',
              },
            ],
            columnGap: 10,
          },
          {
            text: `Número de Factura: ${paymentId}\nFecha de Pago: ${fechaPago.toLocaleDateString(
              'es-ES'
            )}`,
            style: 'invoiceInfo',
            margin: [0, 20, 0, 10],
          },
          {
            columns: [
              {
                width: '50%',
                stack: [
                  { text: 'Facturar a:', style: 'sectionHeader' },
                  {
                    text: `${clienteNombre}\n${clienteDireccion}`,
                    margin: [0, 5, 0, 15],
                  },
                ],
              },
              {
                width: '50%',
                stack: [
                  { text: 'Detalles del Pago:', style: 'sectionHeader' },
                  {
                    text: `Mascota: ${mascota}\nVeterinario: ${veterinario}\nFecha de la cita: ${fechaCita.toLocaleDateString(
                      'es-ES'
                    )}\nHora de la cita: ${horaCita}`,
                    margin: [0, 5, 0, 15],
                  },
                ],
              },
            ],
          },
          {
            table: {
              headerRows: 1,
              widths: ['10%', '50%', '20%', '20%'],
              body: tableBody,
            },
            layout: 'lightHorizontalLines',
            margin: [0, 20, 0, 0],
          },
          {
            // Totals table
            table: {
              widths: ['*', 'auto'],
              body: [
                [
                  { text: 'Subtotal', alignment: 'right', bold: true },
                  {
                    text: `₡${subtotal.toLocaleString('es-CR')}`,
                    alignment: 'right',
                  },
                ],
                [
                  { text: 'IVA (13%)', alignment: 'right', bold: true },
                  {
                    text: `₡${tax.toLocaleString('es-CR')}`,
                    alignment: 'right',
                  },
                ],
                [
                  { text: 'TOTAL', alignment: 'right', bold: true, fontSize: 12 },
                  {
                    text: `₡${total.toLocaleString('es-CR')}`,
                    alignment: 'right',
                    bold: true,
                    fontSize: 12,
                  },
                ],
              ],
            },
            layout: 'noBorders',
            margin: [0, 20, 0, 0],
          },
          {
            text:
              'Gracias por confiar en la Veterinaria El Bigote.\nEl pago fue procesado exitosamente.',
            style: 'footer',
            margin: [0, 30, 0, 0],
          },
        ],
        styles: {
          header: {
            fontSize: 20,
            bold: true,
          },
          companyName: {
            fontSize: 14,
            bold: true,
          },
          companyAddress: {
            fontSize: 10,
            color: 'gray',
          },
          invoiceInfo: {
            fontSize: 12,
          },
          sectionHeader: {
            fontSize: 12,
            bold: true,
            color: '#4a90e2',
          },
          tableHeader: {
            bold: true,
            fontSize: 11,
            color: 'white',
            fillColor: '#4a90e2',
          },
          footer: {
            fontSize: 10,
            alignment: 'center',
            color: 'gray',
          },
        },
      };

      // Generate PDF
      const pdfDoc = printer.createPdfKitDocument(docDefinition);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=recibo_${paymentId}.pdf`
      );
      pdfDoc.pipe(res);
      pdfDoc.end();
    } catch (error) {
      console.error('Error generating payment receipt:', error);
      res.status(500).json({ message: 'Error generating receipt' });
    } finally {
      // Close the database connection
      if (conn) {
        try {
          await conn.close();
        } catch (err) {
          console.error('Error closing connection:', err);
        }
      }
    }
  }),
};



