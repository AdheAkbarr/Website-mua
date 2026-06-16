// Nama file: pages/BookingForm.jsx
// Deskripsi: Halaman Form untuk Input & Edit Booking MUA dengan validasi lengkap dan auto-pricing

import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Sparkles } from 'lucide-react';
import usePackageStore from '../store/packageStore';
import useBookingStore from '../store/bookingStore';
import useToastStore from '../store/toastStore';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { formatRupiah } from '../utils/dateHelper';


const BookingForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const { packages, fetchPackages } = usePackageStore();
  const { createBooking, updateBooking, fetchBookingDetail, loading: bookingLoading } = useBookingStore();
  const { showToast } = useToastStore();

  // Form State
  const [namaClient, setNamaClient] = useState('');
  const [noHp, setNoHp] = useState('');
  const [tanggalAcara, setTanggalAcara] = useState('');
  const [jamAcara, setJamAcara] = useState('');
  const [lokasi, setLokasi] = useState('');
  const [jumlahOrang, setJumlahOrang] = useState(1);
  const [paketId, setPaketId] = useState('');
  const [hargaTotal, setHargaTotal] = useState(0);
  const [dpJumlah, setDpJumlah] = useState(0);
  const [dpStatus, setDpStatus] = useState('belum');
  const [deadlineKonfirmasi, setDeadlineKonfirmasi] = useState('');
  const [catatan, setCatatan] = useState('');
  const [status, setStatus] = useState('pending');
  const [kodeBooking, setKodeBooking] = useState('');

  // Validasi Error State
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Load paket & detail booking jika mode edit
  useEffect(() => {
    const initForm = async () => {
      setLoading(true);
      await fetchPackages();

      if (isEditMode) {
        const booking = await fetchBookingDetail(id);
        if (booking) {
          setNamaClient(booking.nama_client);
          setNoHp(booking.no_hp);
          setTanggalAcara(booking.tanggal_acara);
          setJamAcara(booking.jam_acara);
          setLokasi(booking.lokasi);
          setJumlahOrang(booking.jumlah_orang);
          setPaketId(booking.paket_id);
          setHargaTotal(booking.harga_total);
          setDpJumlah(booking.dp_jumlah);
          setDpStatus(booking.dp_status);
          setDeadlineKonfirmasi(booking.deadline_konfirmasi || '');
          setCatatan(booking.catatan || '');
          setStatus(booking.status);
          setKodeBooking(booking.kode_booking);
        } else {
          showToast('Booking tidak ditemukan.', 'error');
          navigate('/bookings');
        }
      }
      setLoading(false);
    };

    initForm();
  }, [id, isEditMode]);

  // Auto-calculate DP and DP Status based on status and total price
  useEffect(() => {
    const total = parseFloat(hargaTotal) || 0;
    if (status === 'confirmed') {
      setDpJumlah(total / 2);
      setDpStatus('lunas');
    } else if (status === 'done') {
      setDpJumlah(total);
      setDpStatus('lunas');
    } else {
      setDpJumlah(0);
      setDpStatus('belum');
    }
  }, [status, hargaTotal]);


  // Handler auto-fill harga total dari harga dasar paket pilihan
  const handlePackageChange = (pId) => {
    setPaketId(pId);
    if (pId) {
      const selectedPkg = packages.find((p) => p.id === parseInt(pId));
      if (selectedPkg) {
        setHargaTotal(selectedPkg.harga_dasar * jumlahOrang);
      }
    } else {
      setHargaTotal(0);
    }
  };

  // Handler auto-update harga total ketika jumlah pax berubah
  const handlePaxChange = (paxVal) => {
    const pax = parseInt(paxVal) || 1;
    setJumlahOrang(pax);
    if (paketId) {
      const selectedPkg = packages.find((p) => p.id === parseInt(paketId));
      if (selectedPkg) {
        setHargaTotal(selectedPkg.harga_dasar * pax);
      }
    }
  };


  // Validasi format form
  const validateForm = () => {
    const newErrors = {};

    if (!namaClient.trim()) newErrors.namaClient = 'Nama client wajib diisi.';
    
    // Validasi nomor WhatsApp (minimal 10 digit, hanya angka)
    const phoneClean = noHp.replace(/[^0-9]/g, '');
    if (!noHp) {
      newErrors.noHp = 'Nomor WhatsApp wajib diisi.';
    } else if (phoneClean.length < 9) {
      newErrors.noHp = 'Nomor WhatsApp tidak valid (terlalu pendek).';
    }

    if (!tanggalAcara) newErrors.tanggalAcara = 'Tanggal acara wajib dipilih.';
    if (!jamAcara) newErrors.jamAcara = 'Jam acara wajib ditentukan.';
    if (!lokasi.trim()) newErrors.lokasi = 'Lokasi / tempat acara wajib diisi.';
    if (!paketId) newErrors.paketId = 'Silakan pilih paket makeup.';
    if (jumlahOrang < 1) newErrors.jumlahOrang = 'Jumlah orang minimal 1.';
    if (hargaTotal < 0) newErrors.hargaTotal = 'Harga total tidak boleh negatif.';
    if (dpJumlah < 0) newErrors.dpJumlah = 'Jumlah DP tidak boleh negatif.';
    if (dpJumlah > hargaTotal) newErrors.dpJumlah = 'Jumlah DP tidak boleh melebihi harga total.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit form (create atau update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      showToast('Mohon lengkapi data dengan benar.', 'warning');
      return;
    }

    const payload = {
      nama_client: namaClient,
      no_hp: noHp,
      tanggal_acara: tanggalAcara,
      jam_acara: jamAcara,
      lokasi: lokasi,
      jumlah_orang: parseInt(jumlahOrang),
      paket_id: parseInt(paketId),
      catatan,
      harga_total: parseFloat(hargaTotal),
      dp_jumlah: parseFloat(dpJumlah),
      dp_status: dpStatus,
      deadline_konfirmasi: deadlineKonfirmasi || null,
      status: status
    };

    let result;
    if (isEditMode) {
      result = await updateBooking(id, payload);
    } else {
      result = await createBooking(payload);
    }

    if (result.success) {
      showToast(
        isEditMode ? 'Booking berhasil diperbarui!' : 'Booking baru berhasil disimpan!',
        'success'
      );
      // Redirect ke detail booking
      const bId = isEditMode ? id : result.data.bookingId;
      navigate(`/bookings/${bId}`);
    } else {
      showToast(result.error, 'error');
    }
  };

  if (loading) {
    return <LoadingSpinner text="Mempersiapkan formulir..." fullPage />;
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-12">
      
      {/* Header Form */}
      <div className="flex items-center space-x-3">
        <Link
          to={isEditMode ? `/bookings/${id}` : '/bookings'}
          className="p-2 bg-white dark:bg-gray-800 border border-rose-100 dark:border-gray-700 text-gray-500 hover:text-rose-500 rounded-xl transition-colors shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-xl md:text-2xl font-black text-gray-800 dark:text-white flex items-center">
            {isEditMode ? 'Edit Booking Klien' : 'Buat Booking Baru'}
          </h2>
          <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">
            {isEditMode ? `Memperbarui booking ${kodeBooking}` : 'Masukkan data reservasi makeup baru di bawah ini.'}
          </p>
        </div>
      </div>

      {/* Main Card Form */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 border border-rose-100 dark:border-gray-700 rounded-3xl p-6 md:p-8 shadow-sm space-y-6 transition-colors duration-200">
        
        {/* Section 1: Informasi Client */}
        <div>
          <h3 className="text-xs font-bold text-rose-500 dark:text-rose-400 uppercase tracking-widest border-b border-rose-50 dark:border-gray-700 pb-2 mb-4">
            1. Data Diri Client
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Nama Client */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide block">
                Nama Client *
              </label>
              <input
                type="text"
                value={namaClient}
                onChange={(e) => setNamaClient(e.target.value)}
                className={`w-full bg-rose-50/10 dark:bg-gray-900 border ${errors.namaClient ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 dark:border-gray-700 focus:ring-rose-500'} rounded-xl py-2.5 px-3 text-xs text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1`}
                placeholder="Masukkan nama lengkap client"
              />
              {errors.namaClient && <p className="text-[10px] text-red-500 mt-0.5">{errors.namaClient}</p>}
            </div>

            {/* Nomor WA */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide block">
                Nomor WhatsApp *
              </label>
              <input
                type="tel"
                value={noHp}
                onChange={(e) => setNoHp(e.target.value)}
                className={`w-full bg-rose-50/10 dark:bg-gray-900 border ${errors.noHp ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 dark:border-gray-700 focus:ring-rose-500'} rounded-xl py-2.5 px-3 text-xs text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1`}
                placeholder="Contoh: 08123456789"
              />
              {errors.noHp && <p className="text-[10px] text-red-500 mt-0.5">{errors.noHp}</p>}
            </div>

          </div>
        </div>

        {/* Section 2: Jadwal & Lokasi Acara */}
        <div>
          <h3 className="text-xs font-bold text-rose-500 dark:text-rose-400 uppercase tracking-widest border-b border-rose-50 dark:border-gray-700 pb-2 mb-4">
            2. Jadwal & Lokasi Acara
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Tanggal Acara */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide block">
                Tanggal Acara *
              </label>
              <input
                type="date"
                value={tanggalAcara}
                onChange={(e) => setTanggalAcara(e.target.value)}
                className={`w-full bg-rose-50/10 dark:bg-gray-900 border ${errors.tanggalAcara ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 dark:border-gray-700 focus:ring-rose-500'} rounded-xl py-2.5 px-3 text-xs text-gray-800 dark:text-white focus:outline-none focus:ring-1`}
              />
              {errors.tanggalAcara && <p className="text-[10px] text-red-500 mt-0.5">{errors.tanggalAcara}</p>}
            </div>

            {/* Jam Acara */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide block">
                Jam Acara *
              </label>
              <input
                type="time"
                value={jamAcara}
                onChange={(e) => setJamAcara(e.target.value)}
                className={`w-full bg-rose-50/10 dark:bg-gray-900 border ${errors.jamAcara ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 dark:border-gray-700 focus:ring-rose-500'} rounded-xl py-2.5 px-3 text-xs text-gray-800 dark:text-white focus:outline-none focus:ring-1`}
              />
              {errors.jamAcara && <p className="text-[10px] text-red-500 mt-0.5">{errors.jamAcara}</p>}
            </div>

            {/* Jumlah Orang */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide block">
                Jumlah Orang (Pax) *
              </label>
              <input
                type="number"
                min="1"
                value={jumlahOrang}
                onChange={(e) => handlePaxChange(e.target.value)}
                className={`w-full bg-rose-50/10 dark:bg-gray-900 border ${errors.jumlahOrang ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 dark:border-gray-700 focus:ring-rose-500'} rounded-xl py-2.5 px-3 text-xs text-gray-800 dark:text-white focus:outline-none focus:ring-1`}
              />
              {errors.jumlahOrang && <p className="text-[10px] text-red-500 mt-0.5">{errors.jumlahOrang}</p>}
            </div>

          </div>

          {/* Lokasi Acara (Textarea) */}
          <div className="space-y-1 mt-4">
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide block">
              Lokasi / Tempat Acara *
            </label>
            <textarea
              rows="3"
              value={lokasi}
              onChange={(e) => setLokasi(e.target.value)}
              className={`w-full bg-rose-50/10 dark:bg-gray-900 border ${errors.lokasi ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 dark:border-gray-700 focus:ring-rose-500'} rounded-xl py-2.5 px-3 text-xs text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1`}
              placeholder="Contoh: Hotel Mulia Senayan, Ruang Lavender Lantai 3, Jakarta Selatan"
            />
            {errors.lokasi && <p className="text-[10px] text-red-500 mt-0.5">{errors.lokasi}</p>}
          </div>
        </div>

        {/* Section 3: Layanan & Biaya */}
        <div>
          <h3 className="text-xs font-bold text-rose-500 dark:text-rose-400 uppercase tracking-widest border-b border-rose-50 dark:border-gray-700 pb-2 mb-4">
            3. Pilihan Paket & Rincian Biaya
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Paket Makeup */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide block">
                Paket Makeup *
              </label>
              <select
                value={paketId}
                onChange={(e) => handlePackageChange(e.target.value)}
                className={`w-full bg-rose-50/10 dark:bg-gray-900 border ${errors.paketId ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 dark:border-gray-700 focus:ring-rose-500'} rounded-xl py-2.5 px-3 text-xs text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1`}
              >
                <option value="">-- Pilih Paket --</option>
                {packages.filter(p => p.aktif === 1 || p.id === paketId).map((pkg) => (
                  <option key={pkg.id} value={pkg.id}>
                    {pkg.nama_paket} ({formatRupiah(pkg.harga_dasar)})
                  </option>
                ))}
              </select>
              {errors.paketId && <p className="text-[10px] text-red-500 mt-0.5">{errors.paketId}</p>}
            </div>

            {/* Harga Total (bisa override) */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide block">
                Harga Total Layanan *
              </label>
              <input
                type="number"
                value={hargaTotal}
                onChange={(e) => setHargaTotal(parseFloat(e.target.value) || 0)}
                className={`w-full bg-rose-50/10 dark:bg-gray-900 border ${errors.hargaTotal ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 dark:border-gray-700 focus:ring-rose-500'} rounded-xl py-2.5 px-3 text-xs text-gray-800 dark:text-white focus:outline-none focus:ring-1`}
              />
              {errors.hargaTotal && <p className="text-[10px] text-red-500 mt-0.5">{errors.hargaTotal}</p>}
            </div>

          </div>

          <div className="mt-4 p-4 bg-rose-50/25 dark:bg-gray-900/40 border border-rose-100/40 dark:border-gray-800 rounded-2xl space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Uang Muka DP Terbayar */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">Uang Muka (DP) Terbayar (Otomatis)</span>
                <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 block mt-1">
                  {formatRupiah(dpJumlah)}
                </span>
                <span className="text-[9px] text-gray-400 dark:text-gray-500 block leading-tight">
                  {status === 'confirmed' ? 'Setengah harga total (50%)' : status === 'done' ? 'Penuh (100%)' : '0 (Menunggu DP)'}
                </span>
              </div>

              {/* Status Pelunasan DP */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">Status Pelunasan DP</span>
                <span className={`inline-block font-extrabold text-xs uppercase px-2 py-0.5 rounded mt-1 ${
                  dpStatus === 'lunas' 
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400' 
                    : 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400'
                }`}>
                  {dpStatus === 'lunas' ? 'Lunas' : 'Belum Lunas'}
                </span>
              </div>

              {/* Deadline Konfirmasi DP */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
                  Batas Waktu (Deadline) Konfirmasi DP
                </label>
                <input
                  type="date"
                  value={deadlineKonfirmasi}
                  onChange={(e) => setDeadlineKonfirmasi(e.target.value)}
                  className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg py-1 px-2 text-xs text-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                  disabled={status === 'confirmed' || status === 'done'}
                />
              </div>

            </div>
          </div>
        </div>

        {/* Section 4: Catatan & Status */}
        <div>
          <h3 className="text-xs font-bold text-rose-500 dark:text-rose-400 uppercase tracking-widest border-b border-rose-50 dark:border-gray-700 pb-2 mb-4">
            4. Status & Catatan
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Status Booking */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide block">
                Status Alur Booking *
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-rose-50/10 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl py-2.5 px-3 text-xs text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-rose-500"
              >
                <option value="pending">Pending (Menunggu DP)</option>
                <option value="confirmed">Confirmed (Buku Slot)</option>
                <option value="done">Selesai Acara</option>
                <option value="cancelled">Dibatalkan</option>
              </select>
            </div>

            {/* Catatan Khusus */}
            <div className="space-y-1">

              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide block">
                Catatan Khusus Klien
              </label>
              <textarea
                rows="2"
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                className="w-full bg-rose-50/10 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl py-2.5 px-3 text-xs text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-rose-500"
                placeholder="Catatan permintaan makeup khusus (misal: kulit sensitif, request adat Sunda siger, dll)"
              />
            </div>

          </div>
        </div>

        {/* Submit & Save */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-rose-50 dark:border-gray-700">
          <Link
            to={isEditMode ? `/bookings/${id}` : '/bookings'}
            className="px-5 py-3 text-xs font-bold text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
          >
            Batal
          </Link>
          <button
            type="submit"
            disabled={bookingLoading}
            className="px-6 py-3 text-xs font-bold text-white bg-rose-500 hover:bg-rose-600 disabled:bg-rose-400 rounded-xl shadow-md shadow-rose-200 dark:shadow-none transition-colors flex items-center space-x-1.5 focus:outline-none focus:ring-2 focus:ring-rose-400"
          >
            <Save className="w-4 h-4" />
            <span>{isEditMode ? 'Simpan Perubahan' : 'Buat Reservasi'}</span>
          </button>
        </div>

      </form>

    </div>
  );
};

export default BookingForm;
