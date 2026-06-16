// Nama file: pages/BookingDetail.jsx
// Deskripsi: Halaman Detail Booking Klien - menampilkan timeline, log reminder, cetak invoice, dan tombol share WhatsApp

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Phone, Calendar, Clock, MapPin, User, FileText, Send, CheckCircle2, RefreshCw } from 'lucide-react';
import useBookingStore from '../store/bookingStore';
import useToastStore from '../store/toastStore';
import StatusBadge, { DpStatusBadge } from '../components/booking/StatusBadge';
import BookingTimeline from '../components/booking/BookingTimeline';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Modal from '../components/ui/Modal';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { formatDateIndo, formatDateIndoWithDay, formatRupiah } from '../utils/dateHelper';
import { getWAUrl, getWhatsAppTemplates } from '../utils/whatsappHelper';
import { exportElementToPDF } from '../utils/exportPDF';

const BookingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToastStore();

  const {
    bookingDetail,
    statusLogs,
    reminderLogs,
    loading,
    error,
    fetchBookingDetail,
    updateBookingStatus,
    deleteBooking,
    logManualReminder
  } = useBookingStore();

  // Modal Control
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  
  // State untuk ubah status
  const [newStatus, setNewStatus] = useState('pending');
  const [statusComment, setStatusComment] = useState('');

  useEffect(() => {
    fetchBookingDetail(id);
  }, [id, fetchBookingDetail]);

  if (loading) {
    return <LoadingSpinner text="Memuat berkas client..." fullPage />;
  }

  if (error || !bookingDetail) {
    return (
      <div className="text-center py-16 space-y-4">
        <p className="text-sm text-red-500 font-bold">{error || 'Data booking tidak ditemukan.'}</p>
        <Link to="/bookings" className="text-xs text-rose-500 font-bold underline">
          Kembali ke Daftar Booking
        </Link>
      </div>
    );
  }

  const sisa = bookingDetail.harga_total - bookingDetail.dp_jumlah;
  const templates = getWhatsAppTemplates(bookingDetail);

  // Aksi ubah status booking
  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    const res = await updateBookingStatus(id, newStatus, statusComment);
    if (res.success) {
      showToast('Status booking berhasil diperbarui!', 'success');
      setStatusModalOpen(false);
      setStatusComment('');
    } else {
      showToast(res.error, 'error');
    }
  };

  // Aksi hapus booking
  const handleDeleteConfirm = async () => {
    const res = await deleteBooking(id);
    if (res.success) {
      showToast('Booking berhasil dihapus!', 'success');
      navigate('/bookings');
    } else {
      showToast(res.error, 'error');
    }
  };

  // Pemicu buka WhatsApp + Pencatatan Log Reminder manual
  const handleSendWAShare = (tipe, pesan) => {
    // Simpan log pengiriman ke database
    logManualReminder(id, tipe, pesan);
    
    // Buka tautan WhatsApp
    const waUrl = getWAUrl(bookingDetail.no_hp, pesan);
    window.open(waUrl, '_blank', 'noopener,noreferrer');
    showToast(`Membuka WhatsApp untuk mengirim reminder ${tipe}`, 'info');
  };

  // Cetak invoice PDF
  const handlePrintInvoice = async () => {
    setLoading(true);
    // Jalankan ekspor
    const filename = `invoice-${bookingDetail.kode_booking}.pdf`;
    await exportElementToPDF('invoice-print-area', filename);
    setLoading(false);
    showToast('Invoice PDF berhasil diunduh!', 'success');
    setInvoiceModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Navigation Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Link
            to="/bookings"
            className="p-2 bg-white dark:bg-gray-800 border border-rose-100 dark:border-gray-700 text-gray-500 hover:text-rose-500 rounded-xl transition-colors shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block">
              Daftar Detail Booking
            </span>
            <h2 className="text-xl md:text-2xl font-black text-gray-800 dark:text-white flex items-center">
              {bookingDetail.nama_client}
            </h2>
          </div>
        </div>

        {/* Buttons Aksi Utama */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setNewStatus(bookingDetail.status);
              setStatusModalOpen(true);
            }}
            className="px-4 py-2.5 text-xs font-bold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-rose-100 dark:border-gray-700 hover:bg-rose-50/50 rounded-xl transition-colors shadow-sm flex items-center space-x-1.5 focus:outline-none"
          >
            <RefreshCw className="w-4 h-4 text-gray-400" />
            <span>Ubah Status</span>
          </button>
          
          <button
            onClick={() => setInvoiceModalOpen(true)}
            className="px-4 py-2.5 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:text-rose-400 rounded-xl transition-colors flex items-center space-x-1.5 focus:outline-none"
          >
            <FileText className="w-4 h-4" />
            <span>Cetak Invoice</span>
          </button>

          <Link
            to={`/bookings/${id}/edit`}
            className="px-4 py-2.5 text-xs font-bold text-white bg-rose-500 hover:bg-rose-600 rounded-xl shadow-md shadow-rose-200 dark:shadow-none flex items-center space-x-1.5 transition-all"
          >
            <Edit className="w-4 h-4" />
            <span>Edit Booking</span>
          </Link>

          <button
            onClick={() => setDeleteDialogOpen(true)}
            className="p-2.5 text-red-500 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 rounded-xl transition-colors"
            title="Hapus Booking"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Grid Utama */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Kolom Kiri & Tengah: Rincian Lengkap */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Card Rincian Klien */}
          <div className="bg-white dark:bg-gray-800 border border-rose-100 dark:border-gray-700 rounded-3xl p-6 shadow-sm space-y-6 transition-colors duration-200">
            
            <div className="flex items-center justify-between border-b border-rose-50 dark:border-gray-700 pb-4">
              <div>
                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 tracking-wider block">KODE RESERVASI</span>
                <span className="text-base font-extrabold text-gray-800 dark:text-white">{bookingDetail.kode_booking}</span>
              </div>
              <div className="flex flex-col items-end space-y-1">
                <StatusBadge status={bookingDetail.status} />
                <DpStatusBadge status={bookingDetail.dp_status} />
              </div>
            </div>

            {/* Spek data */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div className="space-y-4">
                
                {/* Nama Client */}
                <div className="flex items-start space-x-3">
                  <User className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs text-gray-400 dark:text-gray-500 font-semibold uppercase tracking-wider block">Nama Client</span>
                    <span className="font-bold text-gray-800 dark:text-white text-base">{bookingDetail.nama_client}</span>
                  </div>
                </div>

                {/* Nomor HP */}
                <div className="flex items-start space-x-3">
                  <Phone className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs text-gray-400 dark:text-gray-500 font-semibold uppercase tracking-wider block">WhatsApp / No. HP</span>
                    <a href={`tel:${bookingDetail.no_hp}`} className="font-bold text-rose-500 hover:underline text-base block">
                      {bookingDetail.no_hp}
                    </a>
                  </div>
                </div>

                {/* Jadwal Acara */}
                <div className="flex items-start space-x-3">
                  <Calendar className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs text-gray-400 dark:text-gray-500 font-semibold uppercase tracking-wider block">Jadwal Acara</span>
                    <span className="font-bold text-gray-800 dark:text-white text-sm">
                      {formatDateIndoWithDay(bookingDetail.tanggal_acara)}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center mt-1">
                      <Clock className="w-3.5 h-3.5 mr-1 shrink-0" />
                      Mulai Pukul: {bookingDetail.jam_acara} WIB
                    </span>
                  </div>
                </div>

              </div>

              <div className="space-y-4">
                
                {/* Paket Makeup */}
                <div className="flex items-start space-x-3">
                  <span className="p-1 bg-rose-50 dark:bg-rose-950/20 rounded text-rose-500 shrink-0 mt-0.5 font-bold text-xs">MUA</span>
                  <div>
                    <span className="text-xs text-gray-400 dark:text-gray-500 font-semibold uppercase tracking-wider block">Pilihan Paket MUA</span>
                    <span className="font-bold text-gray-800 dark:text-white text-base">{bookingDetail.nama_paket || 'Kustom'}</span>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 italic">
                      {bookingDetail.paket_deskripsi || 'Tidak ada deskripsi paket.'}
                    </p>
                  </div>
                </div>

                {/* Pax & Lokasi */}
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs text-gray-400 dark:text-gray-500 font-semibold uppercase tracking-wider block">Lokasi Makeup</span>
                    <span className="font-semibold text-gray-800 dark:text-white text-sm block leading-relaxed">{bookingDetail.lokasi}</span>
                    <span className="text-xs text-rose-500 dark:text-rose-400 font-bold block mt-1">
                      Kapasitas / Kapasitas Client: {bookingDetail.jumlah_orang} pax
                    </span>
                  </div>
                </div>

              </div>
            </div>

            {/* Catatan Khusus */}
            {bookingDetail.catatan && (
              <div className="bg-rose-50/25 dark:bg-gray-700/30 border border-rose-100/35 dark:border-gray-700 rounded-2xl p-4 text-xs">
                <span className="font-bold text-rose-500 dark:text-rose-400 uppercase tracking-widest block mb-1.5">Catatan Khusus MUA</span>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed font-mono">
                  {bookingDetail.catatan}
                </p>
              </div>
            )}

            {/* Tabel Keuangan */}
            <div>
              <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Rincian Finansial</h4>
              <div className="bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl p-4 space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Harga Dasar Paket</span>
                  <span className="font-semibold text-gray-700 dark:text-gray-300">{formatRupiah(bookingDetail.paket_harga_dasar)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Harga Kesepakatan (Total)</span>
                  <span className="font-semibold text-gray-800 dark:text-white">{formatRupiah(bookingDetail.harga_total)}</span>
                </div>
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 border-t border-gray-100 dark:border-gray-800 pt-2.5">
                  <span>Down Payment (DP) Terbayar</span>
                  <span className="font-bold">{formatRupiah(bookingDetail.dp_jumlah)}</span>
                </div>
                <div className="flex justify-between border-t border-gray-100 dark:border-gray-800 pt-2.5 text-sm">
                  <span className="font-bold text-gray-600 dark:text-gray-300">SISA TAGIHAN PELUNASAN</span>
                  <span className={`font-black ${sisa > 0 ? 'text-red-500 dark:text-red-400 animate-pulse' : 'text-emerald-600'}`}>
                    {formatRupiah(sisa)}
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Quick WA Sharing Templates */}
          <div className="bg-white dark:bg-gray-800 border border-rose-100 dark:border-gray-700 rounded-3xl p-6 shadow-sm transition-colors duration-200">
            <h3 className="text-sm font-bold text-gray-800 dark:text-white uppercase tracking-wider mb-4">
              Kirim / Bagikan Pesan WhatsApp
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              
              <button
                onClick={() => handleSendWAShare('CONFIRMATION', templates.confirmation)}
                className="p-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900 rounded-xl text-left transition-all text-xs font-bold space-y-1.5 focus:outline-none"
              >
                <div className="flex items-center space-x-1"><Send className="w-3.5 h-3.5" /> <span>Kirim Konfirmasi</span></div>
                <span className="text-[10px] text-gray-400 font-medium block">Pesan konfirmasi rincian booking awal</span>
              </button>

              <button
                onClick={() => handleSendWAShare('H-3', templates.reminderH3)}
                className="p-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900 rounded-xl text-left transition-all text-xs font-bold space-y-1.5 focus:outline-none"
              >
                <div className="flex items-center space-x-1"><Send className="w-3.5 h-3.5" /> <span>Reminder H-3</span></div>
                <span className="text-[10px] text-gray-400 font-medium block">Pesan H-3 pengingat sisa tagihan</span>
              </button>

              <button
                onClick={() => handleSendWAShare('H-1', templates.reminderH1)}
                className="p-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900 rounded-xl text-left transition-all text-xs font-bold space-y-1.5 focus:outline-none"
              >
                <div className="flex items-center space-x-1"><Send className="w-3.5 h-3.5" /> <span>Reminder H-1</span></div>
                <span className="text-[10px] text-gray-400 font-medium block">Pesan H-1 persiapan lokasi makeup</span>
              </button>

              <button
                onClick={() => handleSendWAShare('H-0', templates.reminderH0)}
                className="p-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900 rounded-xl text-left transition-all text-xs font-bold space-y-1.5 focus:outline-none"
              >
                <div className="flex items-center space-x-1"><Send className="w-3.5 h-3.5" /> <span>Hari Acara H-0</span></div>
                <span className="text-[10px] text-gray-400 font-medium block">Pesan hari H info tim otw lokasi</span>
              </button>

              {bookingDetail.deadline_konfirmasi && (
                <button
                  onClick={() => handleSendWAShare('DEADLINE_ALERT', templates.deadlineReminder)}
                  className="p-3 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900 rounded-xl text-left transition-all text-xs font-bold space-y-1.5 focus:outline-none"
                >
                  <div className="flex items-center space-x-1"><Send className="w-3.5 h-3.5" /> <span>Deadline DP</span></div>
                  <span className="text-[10px] text-gray-400 font-medium block">Pesan pengingat batas waktu konfirmasi</span>
                </button>
              )}

              <button
                onClick={() => handleSendWAShare('THANK_YOU', templates.thankYou)}
                className="p-3 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-100 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900 rounded-xl text-left transition-all text-xs font-bold space-y-1.5 focus:outline-none"
              >
                <div className="flex items-center space-x-1"><Send className="w-3.5 h-3.5" /> <span>Terima Kasih</span></div>
                <span className="text-[10px] text-gray-400 font-medium block">Pesan ucapan selesai acara & feedback</span>
              </button>

            </div>
          </div>

        </div>

        {/* Kolom Kanan: Timeline Log Status & Log Reminder */}
        <div className="space-y-6">
          
          {/* Card Timeline Status */}
          <div className="bg-white dark:bg-gray-800 border border-rose-100 dark:border-gray-700 rounded-3xl p-6 shadow-sm transition-colors duration-200">
            <h3 className="text-sm font-bold text-gray-800 dark:text-white uppercase tracking-wider mb-5 border-b border-rose-50 dark:border-gray-700 pb-2">
              Riwayat Perubahan Status
            </h3>
            <BookingTimeline logs={statusLogs} />
          </div>

          {/* Card Log Reminder Terkirim */}
          <div className="bg-white dark:bg-gray-800 border border-rose-100 dark:border-gray-700 rounded-3xl p-6 shadow-sm transition-colors duration-200">
            <h3 className="text-sm font-bold text-gray-800 dark:text-white uppercase tracking-wider mb-4 border-b border-rose-50 dark:border-gray-700 pb-2">
              Riwayat Reminder Terkirim
            </h3>
            
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {reminderLogs.length === 0 ? (
                <div className="text-center py-8 text-xs text-gray-400 dark:text-gray-500">
                  Belum ada reminder yang tercatat terkirim untuk klien ini.
                </div>
              ) : (
                reminderLogs.map((log) => (
                  <div key={log.id} className="p-3 border border-gray-100 dark:border-gray-700 rounded-xl space-y-1.5 bg-gray-50/50 dark:bg-gray-900/40 text-xs">
                    <div className="flex justify-between text-[10px] font-bold text-rose-500">
                      <span>REMINDER {log.tipe}</span>
                      <span className="text-gray-400 font-medium">
                        {new Date(log.sent_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}{' '}
                        {new Date(log.sent_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 font-mono text-[11px] line-clamp-3" title={log.pesan}>
                      {log.pesan}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Modal 1: Ubah Status */}
      <Modal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        title="Perbarui Status Booking"
      >
        <form onSubmit={handleStatusSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block">
              Status Baru MUA
            </label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full bg-rose-50/10 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl py-2.5 px-3 text-xs text-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
            >
              <option value="pending">Pending (Menunggu DP)</option>
              <option value="confirmed">Confirmed (Buku Slot)</option>
              <option value="done">Selesai Acara</option>
              <option value="cancelled">Dibatalkan</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block">
              Catatan / Alasan Perubahan Status
            </label>
            <textarea
              rows="3"
              value={statusComment}
              onChange={(e) => setStatusComment(e.target.value)}
              className="w-full bg-rose-50/10 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl py-2.5 px-3 text-xs text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-rose-500"
              placeholder="Contoh: DP masuk dari Klien sebesar Rp 500.000 via transfer bank BCA."
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={() => setStatusModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-700 rounded-xl"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-rose-500 hover:bg-rose-600 rounded-xl shadow-md"
            >
              Simpan Status
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal 2: Review & Cetak Invoice */}
      <Modal
        isOpen={invoiceModalOpen}
        onClose={() => setInvoiceModalOpen(false)}
        title="Invoice / Tanda Terima Pembayaran"
      >
        <div className="space-y-6">
          
          {/* Invoice Print Container (A4 target) */}
          <div 
            id="invoice-print-area" 
            className="p-6 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl space-y-6 font-sans text-gray-800 dark:text-gray-100"
          >
            {/* Kop Surat */}
            <div className="flex justify-between items-start border-b border-rose-100 pb-4">
              <div>
                <h2 className="text-lg font-black text-rose-500 uppercase tracking-wider">ELLA MAKEUP</h2>
                <p className="text-[10px] text-gray-400">Jasa Professional Makeup & Hairdo</p>
                <p className="text-[9px] text-gray-400 mt-1">Jl. Mawar Merah No. 24, Jakarta Pusat<br />WhatsApp: +62 812-3456-7890</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded uppercase tracking-wider block">INVOICE RESERVASI</span>
                <span className="text-xs font-bold block mt-1">#{bookingDetail.kode_booking}</span>
                <span className="text-[9px] text-gray-400 block mt-0.5">Tanggal: {new Date(bookingDetail.created_at).toLocaleDateString('id-ID')}</span>
              </div>
            </div>

            {/* Info Klien */}
            <div className="grid grid-cols-2 gap-4 text-[10px] bg-gray-50 dark:bg-gray-900/60 p-3 rounded-lg">
              <div>
                <span className="text-gray-400 uppercase tracking-wider block font-bold">KLIEN RESERVASI:</span>
                <span className="font-extrabold text-sm block mt-0.5">{bookingDetail.nama_client}</span>
                <span className="block">{bookingDetail.no_hp}</span>
              </div>
              <div className="text-right">
                <span className="text-gray-400 uppercase tracking-wider block font-bold">JADWAL ACARA:</span>
                <span className="font-extrabold text-xs block mt-0.5">{formatDateIndo(bookingDetail.tanggal_acara)}</span>
                <span className="block mt-0.5">Pukul: {bookingDetail.jam_acara} WIB</span>
                <span className="block mt-0.5 text-rose-500 font-bold">Tempat: {bookingDetail.lokasi}</span>
              </div>
            </div>

            {/* Item Table */}
            <table className="w-full text-left text-[10px] border-collapse">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 text-gray-400 font-bold uppercase">
                  <th className="py-2">Paket Layanan MUA</th>
                  <th className="py-2 text-center">Jumlah Klien</th>
                  <th className="py-2 text-right">Harga Dasar</th>
                  <th className="py-2 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                <tr className="font-medium text-gray-800 dark:text-gray-200">
                  <td className="py-2.5">
                    <span className="font-extrabold">{bookingDetail.nama_paket || 'Kustom'}</span>
                    <p className="text-[8px] text-gray-400">{bookingDetail.paket_deskripsi || 'Sesi makeup eksklusif'}</p>
                  </td>
                  <td className="py-2.5 text-center">{bookingDetail.jumlah_orang} pax</td>
                  <td className="py-2.5 text-right">{formatRupiah(bookingDetail.paket_harga_dasar)}</td>
                  <td className="py-2.5 text-right font-extrabold">{formatRupiah(bookingDetail.harga_total)}</td>
                </tr>
              </tbody>
            </table>

            {/* Total Area */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 flex justify-between items-start text-[10px]">
              <div>
                <span className="text-gray-400 block font-bold uppercase">CATATAN:</span>
                <p className="text-gray-500 font-mono text-[8px] max-w-xs mt-0.5">
                  - Uang muka (DP) yang sudah disetor tidak dapat dikembalikan.<br />
                  - Pelunasan tagihan wajib dibayarkan sebelum atau pada hari H acara.
                </p>
              </div>
              <div className="w-48 space-y-1.5 text-right">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Tagihan:</span>
                  <span className="font-bold">{formatRupiah(bookingDetail.harga_total)}</span>
                </div>
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>DP Terbayar:</span>
                  <span>-{formatRupiah(bookingDetail.dp_jumlah)}</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-1.5 text-xs font-black text-rose-500">
                  <span>Sisa Pelunasan:</span>
                  <span>{formatRupiah(sisa)}</span>
                </div>
              </div>
            </div>

            {/* Stamp Tanda Terima */}
            <div className="flex justify-between pt-6 text-[9px] text-center">
              <div className="w-24">
                <p className="text-gray-400">Klien Reservasi</p>
                <div className="h-10" />
                <p className="font-bold border-t border-gray-200 pt-1">{bookingDetail.nama_client}</p>
              </div>
              <div className="w-32 bg-rose-50/50 p-2 border border-dashed border-rose-200 rounded-lg flex flex-col justify-center items-center">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span className="font-bold text-emerald-600 block text-[9px] mt-0.5">STAMP TANDA TERIMA DP</span>
                <span className="text-[8px] text-gray-400">{bookingDetail.dp_status.toUpperCase()}</span>
              </div>
              <div className="w-24">
                <p className="text-gray-400">Hormat Kami,</p>
                <div className="h-10" />
                <p className="font-bold border-t border-gray-200 pt-1">Ella Makeup Studio</p>
              </div>
            </div>

          </div>

          {/* Buttons Download */}
          <div className="flex justify-end space-x-2 pt-2">
            <button
              onClick={() => setInvoiceModalOpen(false)}
              className="px-4 py-2.5 text-xs font-semibold text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 rounded-xl"
            >
              Tutup Preview
            </button>
            <button
              onClick={handlePrintInvoice}
              className="px-5 py-2.5 text-xs font-bold text-white bg-rose-500 hover:bg-rose-600 rounded-xl shadow-md flex items-center space-x-1.5 focus:outline-none"
            >
              <FileText className="w-4 h-4" />
              <span>Unduh PDF Invoice</span>
            </button>
          </div>

        </div>
      </Modal>

      {/* Dialog Konfirmasi Hapus */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Hapus Reservasi Client?"
        message={`Apakah Anda yakin ingin menghapus reservasi untuk ${bookingDetail.nama_client}? Tindakan ini akan menghapus log dan data reservasi secara permanen.`}
        confirmText="Ya, Hapus Permanen"
      />

    </div>
  );
};

export default BookingDetail;
