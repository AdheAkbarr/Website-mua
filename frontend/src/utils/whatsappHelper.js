// Nama file: utils/whatsappHelper.js
// Deskripsi: Utilitas untuk membersihkan nomor telepon dan memformat template pesan WhatsApp otomatis

import { formatDateIndo, formatRupiah } from './dateHelper';

/**
 * Memformat nomor telepon Indonesia menjadi standar internasional (dimulai dengan 62)
 * Contoh: 08123456789 -> 628123456789
 * @param {string} phone 
 * @returns {string}
 */
export const formatPhoneForWA = (phone) => {
  if (!phone) return '';
  // Hapus semua karakter non-numerik
  let cleaned = phone.replace(/[^0-9]/g, '');
  
  // Konversi awalan 0 ke 62
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.slice(1);
  }
  
  // Jika tidak diawali 62 dan langsung 8xxx, tambahkan 62
  if (cleaned.startsWith('8') && cleaned.length >= 9) {
    cleaned = '62' + cleaned;
  }
  
  return cleaned;
};

/**
 * Mendapatkan URL lengkap wa.me dengan teks pesan ter-encode
 * @param {string} phone 
 * @param {string} message 
 * @returns {string}
 */
export const getWAUrl = (phone, message) => {
  const formattedPhone = formatPhoneForWA(phone);
  return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
};

/**
 * Membuat berbagai template pesan WhatsApp
 */
export const getWhatsAppTemplates = (booking) => {
  if (!booking) return {};

  const name = booking.nama_client;
  const code = booking.kode_booking || '-';
  const dateStr = formatDateIndo(booking.tanggal_acara);
  const time = booking.jam_acara;
  const location = booking.lokasi;
  const packageName = booking.nama_paket || 'Paket Makeup';
  const total = formatRupiah(booking.harga_total);
  const dp = formatRupiah(booking.dp_jumlah);
  const sisaVal = booking.harga_total - booking.dp_jumlah;
  const sisa = formatRupiah(sisaVal);
  const deadline = booking.deadline_konfirmasi ? formatDateIndo(booking.deadline_konfirmasi) : '-';

  return {
    // 1. Konfirmasi Booking Baru
    confirmation: `Halo Kak *${name}*, terima kasih telah memesan jasa makeup kami 🌸\n\nBerikut rincian pesanan Anda:\n📌 *Kode Booking:* ${code}\n✨ *Paket Makeup:* ${packageName}\n📅 *Tanggal Acara:* ${dateStr}\n⏰ *Jam Acara:* ${time} WIB\n📍 *Lokasi:* ${location}\n👤 *Jumlah Orang:* ${booking.jumlah_orang} orang\n\n💵 *Total Biaya:* ${total}\n💳 *DP Masuk:* ${dp}\n⏳ *Sisa Pembayaran:* *${sisa}*\n\nMohon konfirmasi kembali apakah rincian di atas sudah sesuai. Terima kasih!`,

    // 2. Reminder H-3 sebelum acara
    reminderH3: `Halo Kak *${name}*, pengingat H-3 untuk jadwal makeup Anda pada:\n📅 *Hari/Tanggal:* ${dateStr}\n⏰ *Jam:* ${time} WIB\n📍 *Lokasi:* ${location}\n✨ *Paket:* ${packageName}\n\nSisa pembayaran sebesar *${sisa}* dapat dilunasi sebelum atau pada saat acara berlangsung. Silakan hubungi kami jika ada pertanyaan atau penyesuaian jadwal ya Kak. Terima kasih! 🌸`,

    // 3. Reminder H-1 sebelum acara
    reminderH1: `Halo Kak *${name}*, pengingat H-1 untuk jadwal makeup Anda *BESOK*:\n📅 *Hari/Tanggal:* ${dateStr}\n⏰ *Jam:* ${time} WIB\n📍 *Lokasi:* ${location}\n✨ *Paket:* ${packageName}\n\nMohon pastikan lokasi sudah siap pada waktu yang ditentukan agar makeup berjalan lancar. Sisa pembayaran Anda: *${sisa}*. Sampai jumpa besok Kak! 🌸`,

    // 4. Reminder H-0 (Hari H)
    reminderH0: `Halo Kak *${name}*, hari ini adalah jadwal makeup Anda 🌸\n⏰ *Jam:* ${time} WIB\n📍 *Lokasi:* ${location}\n✨ *Paket:* ${packageName}\n\nTim kami sedang/akan segera meluncur ke lokasi Anda. Sampai bertemu sebentar lagi!`,

    // 5. Pengingat Deadline Konfirmasi DP / Pesanan
    deadlineReminder: `Halo Kak *${name}*, ini pengingat bahwa batas waktu (deadline) konfirmasi booking makeup Anda adalah *${deadline}*.\n\nMohon lakukan pembayaran uang muka (DP) sebesar ${dp} untuk mengamankan slot tanggal Anda. Jika sudah membayar, mohon abaikan pesan ini atau kirimkan bukti bayarnya ya Kak. Terima kasih banyak! 🌸`,

    // 6. Rincian Invoice & Tanda Terima DP
    invoice: `*INVOICE PEMBAYARAN ELLA MAKEUP*\n==============================\n📌 *Kode Booking:* ${code}\n👤 *Nama Client:* ${name}\n✨ *Paket Makeup:* ${packageName}\n📅 *Tanggal Acara:* ${dateStr}\n\n💵 *Total Biaya:* ${total}\n💳 *DP Terbayar:* ${dp}\n⏳ *Sisa Tagihan:* *${sisa}*\n📈 *Status DP:* ${booking.dp_status.toUpperCase()}\n\nTerima kasih atas kepercayaannya! 🌸`,

    // 7. Ucapan Selesai Acara (Terima Kasih)
    thankYou: `Dear Kak *${name}*,\nTerima kasih banyak telah memercayakan penampilan Anda di hari bahagia bersama kami 🌸\n\nSemoga Kakak puas dengan hasil makeup kami. Jika tidak keberatan, mohon bagikan kritik, saran, atau testimoni Kakak untuk peningkatan kualitas kami ke depan.\n\nSelamat beristirahat dan semoga hari-hari Kakak senantiasa dipenuhi kebahagiaan! ✨`
  };
};
