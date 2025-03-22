const PDFDocument = require('pdfkit');
require('pdfkit-table');
const fs = require('fs');

(async function testTable() {
    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream('test.pdf'));

    await doc.table(
        {
            headers: [
                { label: 'CANT.', property: 'cantidad', width: 50, align: 'center' },
                { label: 'DESCRIPCIÓN', property: 'descripcion', width: 200, align: 'left' },
                { label: 'PRECIO UNITARIO', property: 'precio_unitario', width: 100, align: 'right' },
                { label: 'IMPORTE', property: 'importe', width: 100, align: 'right' },
            ],
            rows: [
                {
                    cantidad: 1,
                    descripcion: 'Consulta Veterinaria',
                    precio_unitario: '₡15,000',
                    importe: '₡15,000',
                },
                {
                    cantidad: 2,
                    descripcion: 'Vacuna Triple',
                    precio_unitario: '₡10,000',
                    importe: '₡20,000',
                },
            ],
        },
        {
            prepareHeader: () => doc.font('Helvetica-Bold').fontSize(12),
            prepareRow: () => doc.font('Helvetica').fontSize(10),
        }
    );

    doc.end();
})();
