// Nama file: pages/PackageManager.jsx
// Deskripsi: Halaman CRUD Master Paket Makeup MUA beserta statistik booking per paket

import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight, Sparkles, Check, X } from 'lucide-react';
import usePackageStore from '../store/packageStore';
import useToastStore from '../store/toastStore';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { formatRupiah } from '../utils/dateHelper';

const PackageManager = () => {
  const { showToast } = useToastStore();
  const {
    packages,
    loading,
    error,
    fetchPackages,
    createPackage,
    updatePackage,
    deletePackage,
    togglePackageActive
  } = usePackageStore();

  // Modal Control
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPkg, setSelectedPkg] = useState(null);
  const [targetDeleteId, setTargetDeleteId] = useState(null);

  // Form State
  const [namaPaket, setNamaPaket] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [hargaDasar, setHargaDasar] = useState(0);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  // Reset form
  const resetForm = () => {
    setNamaPaket('');
    setDeskripsi('');
    setHargaDasar(0);
    setSelectedPkg(null);
    setFormErrors({});
  };

  // Buka modal untuk tambah paket baru
  const handleAddClick = () => {
    resetForm();
    setModalOpen(true);
  };

  // Buka modal untuk edit paket
  const handleEditClick = (pkg) => {
    setSelectedPkg(pkg);
    setNamaPaket(pkg.nama_paket);
    setDeskripsi(pkg.deskripsi || '');
    setHargaDasar(pkg.harga_dasar);
    setFormErrors({});
    setModalOpen(true);
  };

  // Toggle status aktif/nonaktif
  const handleToggleActive = async (id) => {
    const res = await togglePackageActive(id);
    if (res.success) {
      showToast(res.aktif === 1 ? 'Paket diaktifkan.' : 'Paket dinonaktifkan.', 'success');
    } else {
      showToast(res.error, 'error');
    }
  };

  // Validasi form
  const validateForm = () => {
    const errors = {};
    if (!namaPaket.trim()) errors.namaPaket = 'Nama paket wajib diisi.';
    if (hargaDasar < 0) errors.hargaDasar = 'Harga dasar tidak boleh kurang dari 0.';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit form (create atau update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      nama_paket: namaPaket,
      deskripsi,
      harga_dasar: parseFloat(hargaDasar)
    };

    let res;
    if (selectedPkg) {
      res = await updatePackage(selectedPkg.id, payload);
    } else {
      res = await createPackage(payload);
    }

    if (res.success) {
      showToast(
        selectedPkg ? 'Paket berhasil diperbarui!' : 'Paket baru berhasil ditambahkan!',
        'success'
      );
      setModalOpen(false);
      resetForm();
    } else {
      showToast(res.error, 'error');
    }
  };

  // Pemicu hapus
  const handleDeleteTrigger = (id) => {
    setTargetDeleteId(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!targetDeleteId) return;
    const res = await deletePackage(targetDeleteId);
    if (res.success) {
      showToast('Paket berhasil dihapus!', 'success');
    } else {
      showToast(res.error, 'error');
    }
    setTargetDeleteId(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-gray-800 dark:text-white flex items-center">
            <Sparkles className="w-6 h-6 text-rose-500 mr-2 shrink-0" />
            Pricelist Ella Makeup
          </h2>
          <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">
            Kelola pricelist harga, deskripsi layanan makeup, dan pantau total pesanan tiap paket.
          </p>
        </div>
        <button
          onClick={handleAddClick}
          className="px-4 py-2.5 text-xs font-bold text-white bg-rose-500 hover:bg-rose-600 rounded-xl shadow-md shadow-rose-200 dark:shadow-none flex items-center justify-center space-x-1.5 transition-all focus:outline-none"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Paket Baru</span>
        </button>
      </div>

      {/* Konten Utama */}
      {loading && packages.length === 0 ? (
        <LoadingSpinner text="Memuat paket layanan..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className={`bg-white dark:bg-gray-800 border rounded-3xl p-6 shadow-sm flex flex-col justify-between transition-all duration-200 hover:shadow-md ${
                pkg.aktif === 1
                  ? 'border-rose-100 dark:border-gray-700'
                  : 'border-gray-200 dark:border-gray-800 opacity-60'
              }`}
            >
              <div>
                
                {/* Header Paket */}
                <div className="flex items-start justify-between pb-3 border-b border-rose-50 dark:border-gray-700/60 mb-3">
                  <div>
                    <h3 className="text-base font-extrabold text-gray-800 dark:text-white leading-snug">
                      {pkg.nama_paket}
                    </h3>
                    <span className="text-[10px] text-gray-400 font-bold tracking-wider block uppercase mt-0.5">
                      Statistik: {pkg.total_bookings} Booking
                    </span>
                  </div>
                  
                  {/* Status Active Badge */}
                  <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider ${
                    pkg.aktif === 1
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                  }`}>
                    {pkg.aktif === 1 ? 'Aktif' : 'Nonaktif'}
                  </span>
                </div>

                {/* Deskripsi */}
                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed min-h-[48px] line-clamp-3">
                  {pkg.deskripsi || 'Tidak ada deskripsi layanan.'}
                </p>

                {/* Harga Dasar */}
                <div className="mt-4 pt-3 border-t border-rose-50 dark:border-gray-700/60 flex flex-col">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">HARGA ACUAN DASAR</span>
                  <span className="text-lg font-black text-rose-500 dark:text-rose-400 mt-0.5">
                    {formatRupiah(pkg.harga_dasar)}
                  </span>
                </div>

              </div>

              {/* Tombol Aksi */}
              <div className="flex items-center justify-between mt-6 pt-3 border-t border-rose-50 dark:border-gray-700/60">
                
                {/* Switch Toggle */}
                <button
                  type="button"
                  onClick={() => handleToggleActive(pkg.id)}
                  className="flex items-center text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-rose-500 dark:hover:text-white transition-colors"
                >
                  {pkg.aktif === 1 ? (
                    <>
                      <ToggleRight className="w-6 h-6 text-rose-500 mr-1.5 shrink-0" />
                      <span>Aktif</span>
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="w-6 h-6 text-gray-400 mr-1.5 shrink-0" />
                      <span>Matikan</span>
                    </>
                  )}
                </button>

                {/* Edit & Hapus */}
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleEditClick(pkg)}
                    className="p-2 text-gray-500 hover:text-rose-500 hover:bg-rose-50 dark:text-gray-400 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    title="Edit Paket"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteTrigger(pkg.id)}
                    className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:text-gray-400 dark:hover:bg-red-950/20 rounded-lg transition-colors"
                    title="Hapus Paket"
                    disabled={pkg.total_bookings > 0} // disable visual jika terpakai, dicek di backend juga
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

              </div>

            </div>
          ))}
        </div>
      )}

      {/* Modal Edit / Tambah */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={selectedPkg ? 'Perbarui Pricelist Makeup' : 'Tambah Pricelist Baru'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Nama Paket */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block">
              Nama Paket Makeup *
            </label>
            <input
              type="text"
              value={namaPaket}
              onChange={(e) => setNamaPaket(e.target.value)}
              className={`w-full bg-rose-50/10 dark:bg-gray-900 border ${formErrors.namaPaket ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 dark:border-gray-700 focus:ring-rose-500'} rounded-xl py-2.5 px-3 text-xs text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1`}
              placeholder="Contoh: Paket Pengantin Nasional"
            />
            {formErrors.namaPaket && <p className="text-[10px] text-red-500 mt-0.5">{formErrors.namaPaket}</p>}
          </div>

          {/* Harga Dasar */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block">
              Harga Dasar Acuan (IDR) *
            </label>
            <input
              type="number"
              value={hargaDasar}
              onChange={(e) => setHargaDasar(parseFloat(e.target.value) || 0)}
              className={`w-full bg-rose-50/10 dark:bg-gray-900 border ${formErrors.hargaDasar ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 dark:border-gray-700 focus:ring-rose-500'} rounded-xl py-2.5 px-3 text-xs text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1`}
            />
            {formErrors.hargaDasar && <p className="text-[10px] text-red-500 mt-0.5">{formErrors.hargaDasar}</p>}
          </div>

          {/* Deskripsi */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block">
              Deskripsi Paket & Cakupan Layanan
            </label>
            <textarea
              rows="4"
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              className="w-full bg-rose-50/10 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl py-2.5 px-3 text-xs text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-rose-500"
              placeholder="Jelaskan detail layanan: tipe makeup, hairdo/hijabdo, retouch, busana pengantin, dll..."
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-700 rounded-xl"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-rose-500 hover:bg-rose-600 rounded-xl shadow-md"
            >
              {selectedPkg ? 'Simpan Paket' : 'Tambahkan'}
            </button>
          </div>

        </form>
      </Modal>

      {/* Dialog Konfirmasi Hapus */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Hapus Paket Makeup?"
        message="Apakah Anda yakin ingin menghapus paket makeup ini dari database? Paket ini hanya dapat dihapus jika tidak pernah digunakan oleh data booking klien manapun."
        confirmText="Ya, Hapus Permanen"
      />

    </div>
  );
};

export default PackageManager;
