// Nama file: utils/dateHelper.js
// Deskripsi: Fungsi pembantu untuk memformat tanggal dan mata uang Rupiah

/**
 * Format tanggal string (YYYY-MM-DD) menjadi format Indonesia (contoh: 16 Juni 2026)
 * @param {string} dateStr 
 * @returns {string}
 */
export const formatDateIndo = (dateStr) => {
  if (!dateStr) return '-';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  } catch (error) {
    return dateStr;
  }
};

/**
 * Format tanggal string menjadi format lengkap dengan nama Hari (contoh: Selasa, 16 Juni 2026)
 * @param {string} dateStr 
 * @returns {string}
 */
export const formatDateIndoWithDay = (dateStr) => {
  if (!dateStr) return '-';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  } catch (error) {
    return dateStr;
  }
};

/**
 * Format angka menjadi format mata uang Rupiah (contoh: Rp 350.000)
 * @param {number} amount 
 * @returns {string}
 */
export const formatRupiah = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) return 'Rp 0';
  const rounded = Math.round(amount);
  const formatted = new Intl.NumberFormat('id-ID').format(rounded);
  return `Rp ${formatted}`;
};

/**
 * Mendapatkan string tanggal hari ini dalam format YYYY-MM-DD
 * @returns {string}
 */
export const getTodayDateString = () => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

/**
 * Mendapatkan selisih hari antara dua tanggal string
 * @param {string} dateStr1 
 * @param {string} dateStr2 
 * @returns {number}
 */
export const getDiffDays = (dateStr1, dateStr2) => {
  const d1 = new Date(dateStr1);
  const d2 = new Date(dateStr2);
  d1.setHours(12, 0, 0, 0);
  d2.setHours(12, 0, 0, 0);
  const diffTime = d1.getTime() - d2.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
};
