import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

try {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  doc.autoTable({
    startY: 50,
    head: [['A', 'B']],
    body: [['1', '2']]
  });
  console.log('lastAutoTable:', doc.lastAutoTable);
} catch (e) {
  console.error('Error:', e);
}
