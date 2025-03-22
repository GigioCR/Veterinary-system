const PDFDocument = require('pdfkit');

const generateReceiptPDF = (res, receiptData) => {
  const {
    mascota,
    veterinario,
    fechaCita,
    horaCita,
    servicios,
    montoTotal,
  } = receiptData;

  // Generate the PDF
  const doc = new PDFDocument({ margin: 50 });

  // Set response headers
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=recibo_${paymentId}.pdf`);

  // Add header
  doc
    .fillColor('#333333')
    .fontSize(20)
    .text('FACTURA', { align: 'left' })
    .moveDown(1);

  // Add company information
  doc
    .fontSize(10)
    .text('Veterinaria El Bigote', { align: 'left' })
    .text('Carretera Muelle 38', { align: 'left' })
    .text('37531 Ávila, Ávila', { align: 'left' })
    .moveDown(1);

  // Add payment details
  doc
    .fontSize(12)
    .fillColor('#000000')
    .text(`Mascota: ${mascota}`)
    .text(`Veterinario: ${veterinario}`)
    .text(`Fecha de la cita: ${fechaCita.toLocaleDateString('es-ES')}`)
    .text(`Hora de la cita: ${horaCita}`)
    .moveDown(1);

  // Add services table
  doc
    .fontSize(12)
    .fillColor('#333333')
    .text('Servicios:', { underline: true })
    .moveDown(0.5);

  // Add table headers
  doc
    .fontSize(10)
    .fillColor('#000000')
    .text('CANT.', { width: 50, continued: true })
    .text('DESCRIPCIÓN', { width: 300, continued: true })
    .text('PRECIO UNITARIO', { width: 100, continued: true })
    .text('IMPORTE', { align: 'right' });

  // Add table rows for services
  servicios.forEach((servicio, index) => {
    doc
      .fontSize(10)
      .text(`${index + 1}`, { width: 50, continued: true })
      .text(servicio.nombre, { width: 300, continued: true })
      .text(`₡${servicio.precio}`, { width: 100, continued: true })
      .text(`₡${servicio.precio}`, { align: 'right' });
  });

  // Add total
  doc
    .moveDown(1)
    .fontSize(12)
    .fillColor('#333333')
    .text(`Monto total: ₡${montoTotal}`, { align: 'right' });

  // Add footer
  doc
    .moveDown(2)
    .fontSize(10)
    .fillColor('#888888')
    .text('Gracias por confiar en la Veterinaria El Bigote.', { align: 'center' })

  // Finalize the PDF and pipe it to the response
  doc.end();
  doc.pipe(res);
};

module.exports = { generateReceiptPDF };
