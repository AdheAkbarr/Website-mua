// Nama file: utils/exportPDF.js
// Deskripsi: Utilitas untuk mengekspor elemen HTML menjadi PDF (digunakan untuk Invoice & Laporan Bulanan)

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Mengekspor elemen HTML berdasarkan ID menjadi file PDF multi-halaman
 * @param {string} elementId - ID dari container HTML yang ingin dicetak
 * @param {string} filename - Nama file output PDF (contoh: invoice-123.pdf)
 */
export const exportElementToPDF = async (elementId, filename = 'dokumen.pdf') => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Elemen dengan ID "${elementId}" tidak ditemukan.`);
    return;
  }

  try {
    // Buat clone element agar bisa dimodifikasi style khusus cetak secara temporer
    const originalStyle = element.style.cssText;
    
    // Pastikan area cetak memiliki latar belakang putih penuh dan tidak terpotong overflow
    element.style.backgroundColor = '#ffffff';
    element.style.color = '#1f2937'; // gray-800
    
    // Tunggu render selesai
    await new Promise((resolve) => setTimeout(resolve, 300));

    const canvas = await html2canvas(element, {
      scale: 2, // Meningkatkan resolusi cetak agar teks tajam
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      allowTaint: true
    });

    // Kembalikan style original
    element.style.cssText = originalStyle;

    const imgData = canvas.toDataURL('image/png');
    
    // Inisialisasi jsPDF ukuran A4 (210mm x 297mm)
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = 210;
    const pdfPageHeight = 297;
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    let heightLeft = imgHeight;
    let position = 0;

    // Halaman Pertama
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pdfPageHeight;

    // Loop jika konten lebih tinggi dari 1 halaman A4
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfPageHeight;
    }

    pdf.save(filename);
  } catch (error) {
    console.error('Gagal mengekspor PDF:', error);
    alert('Terjadi kesalahan saat membuat file PDF. Silakan coba lagi.');
  }
};
