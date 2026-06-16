// Nama file: pages/Register.jsx
// Deskripsi: Halaman Manajemen Staff Ella Makeup (Hanya untuk Admin Utama) - CRUD lengkap

import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Lock, KeyRound, Smartphone, UserPlus, ArrowLeft, Edit, Trash2, Shield, Eye, EyeOff } from 'lucide-react';
import api from '../api/axios';
import useToastStore from '../store/toastStore';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Modal from '../components/ui/Modal';

const Register = () => {
  const navigate = useNavigate();
  const { showToast } = useToastStore();

  // Data State
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modals & Dialogue State
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [targetDeleteId, setTargetDeleteId] = useState(null);

  // Form State
  const [nama, setNama] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [pinDigits, setPinDigits] = useState(['', '', '', '', '', '']);
  const [formErrors, setFormErrors] = useState({});
  const [showPasswordText, setShowPasswordText] = useState(false);

  // Load staff list
  const fetchStaffData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/auth/users');
      setStaffList(response.data || []);
    } catch (error) {
      const errMsg = error.response?.data?.error || 'Gagal memuat data staff.';
      showToast(errMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffData();
  }, []);

  // Reset Form
  const resetForm = () => {
    setNama('');
    setUsername('');
    setPassword('');
    setPinDigits(['', '', '', '', '', '']);
    setSelectedStaff(null);
    setFormErrors({});
  };

  // Handle PIN Digit changes
  const handlePinChange = (index, value) => {
    if (value !== '' && !/^[0-9]$/.test(value)) return;

    const newPin = [...pinDigits];
    newPin[index] = value;
    setPinDigits(newPin);

    if (value !== '' && index < 5) {
      const nextInput = document.getElementById(`reg-pin-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handlePinKeyDown = (index, e) => {
    if (e.key === 'Backspace' && pinDigits[index] === '' && index > 0) {
      const prevInput = document.getElementById(`reg-pin-${index - 1}`);
      prevInput?.focus();
    }
  };

  // Click Add
  const handleAddClick = () => {
    resetForm();
    setModalOpen(true);
  };

  // Click Edit
  const handleEditClick = (staff) => {
    setSelectedStaff(staff);
    setNama(staff.nama);
    setUsername(staff.username);
    setPassword(''); // Biarkan kosong jika tidak ingin mengubah
    setPinDigits(['', '', '', '', '', '']); // Biarkan kosong jika tidak ingin mengubah
    setFormErrors({});
    setModalOpen(true);
  };

  // Click Delete
  const handleDeleteTrigger = (id) => {
    setTargetDeleteId(id);
    setDeleteDialogOpen(true);
  };

  const validateForm = () => {
    const errors = {};
    if (!nama.trim()) errors.nama = 'Nama lengkap wajib diisi.';
    if (!username.trim()) {
      errors.username = 'Username wajib diisi.';
    } else if (username.trim().toLowerCase() === 'admin') {
      errors.username = 'Username "admin" sudah digunakan untuk admin utama.';
    }

    if (!selectedStaff) {
      // Create mode: password & pin wajib diisi
      if (!password) {
        errors.password = 'Kata sandi wajib diisi.';
      } else if (password.length < 6) {
        errors.password = 'Kata sandi minimal 6 karakter.';
      }

      const pin = pinDigits.join('');
      if (pin.length !== 6 || isNaN(Number(pin))) {
        errors.pin = 'PIN 6-digit angka wajib diisi lengkap.';
      }
    } else {
      // Edit mode: password & pin opsional
      if (password && password.length < 6) {
        errors.password = 'Kata sandi minimal 6 karakter jika ingin diubah.';
      }
      
      const pin = pinDigits.join('');
      if (pin.length > 0 && (pin.length !== 6 || isNaN(Number(pin)))) {
        errors.pin = 'PIN harus berupa 6-digit angka jika ingin diubah.';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      showToast('Mohon isi formulir dengan benar.', 'warning');
      return;
    }

    setLoading(true);
    try {
      const pin = pinDigits.join('');
      const payload = {
        nama,
        username: username.trim().toLowerCase(),
        password: password || undefined,
        pin: pin || undefined
      };

      if (selectedStaff) {
        await api.put(`/auth/users/${selectedStaff.id}`, payload);
        showToast('Akun staff berhasil diperbarui!', 'success');
      } else {
        await api.post('/auth/register', payload);
        showToast('Akun staff baru berhasil dibuat!', 'success');
      }

      setModalOpen(false);
      resetForm();
      fetchStaffData();
    } catch (error) {
      const errMsg = error.response?.data?.error || 'Gagal menyimpan data staff.';
      showToast(errMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!targetDeleteId) return;
    setLoading(true);
    try {
      await api.delete(`/auth/users/${targetDeleteId}`);
      showToast('Akun staff berhasil dihapus!', 'success');
      fetchStaffData();
    } catch (error) {
      const errMsg = error.response?.data?.error || 'Gagal menghapus akun staff.';
      showToast(errMsg, 'error');
    } finally {
      setDeleteDialogOpen(false);
      setTargetDeleteId(null);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-gray-800 dark:text-white flex items-center">
            <Shield className="w-6 h-6 text-rose-500 mr-2 shrink-0" />
            Kelola Akun Staff Ella Makeup
          </h2>
          <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">
            Lihat daftar staff, tambahkan staff baru, edit profil, sandi, PIN, atau hapus akses akun.
          </p>
        </div>
        <button
          onClick={handleAddClick}
          className="px-4 py-2.5 text-xs font-bold text-white bg-rose-500 hover:bg-rose-600 rounded-xl shadow-md shadow-rose-200 dark:shadow-none flex items-center justify-center space-x-1.5 transition-all focus:outline-none"
        >
          <UserPlus className="w-4 h-4" />
          <span>Tambah Staff Baru</span>
        </button>
      </div>

      {/* Konten Utama */}
      {loading && staffList.length === 0 ? (
        <LoadingSpinner text="Memuat data staff..." />
      ) : staffList.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 border border-rose-100 dark:border-gray-700 rounded-3xl p-16 text-center shadow-sm">
          <div className="flex flex-col items-center justify-center space-y-2">
            <User className="w-12 h-12 text-gray-300 dark:text-gray-600" />
            <h4 className="text-base font-bold text-gray-800 dark:text-white">
              Belum ada staff terdaftar
            </h4>
            <p className="text-xs text-gray-400 dark:text-gray-500 max-w-sm">
              Gunakan tombol "Tambah Staff Baru" di atas untuk mendaftarkan akun pembantu atau asisten Anda.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 border border-rose-100 dark:border-gray-700 rounded-3xl p-6 shadow-sm overflow-hidden transition-colors duration-200">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-rose-50 dark:border-gray-700 text-gray-400 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Nama Lengkap</th>
                  <th className="py-3 px-4">Username</th>
                  <th className="py-3 px-4">Kewenangan</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-gray-700 dark:text-gray-300">
                {/* Custom Admin Info */}
                <tr className="bg-rose-50/10 dark:bg-rose-950/5 font-semibold">
                  <td className="py-3.5 px-4 font-bold text-rose-500 dark:text-rose-400">Admin Utama</td>
                  <td className="py-3.5 px-4">@admin</td>
                  <td className="py-3.5 px-4">
                    <span className="bg-rose-100 text-rose-800 dark:bg-rose-950/30 dark:text-rose-400 px-2 py-0.5 rounded-md text-[9px] uppercase font-black tracking-wide">
                      Superadmin
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right text-gray-400 text-[10px] italic">Sistem Utama</td>
                </tr>

                {/* Staff list mapping */}
                {staffList.map((staff) => (
                  <tr key={staff.id} className="hover:bg-rose-50/10 dark:hover:bg-gray-700/10 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-gray-800 dark:text-white">{staff.nama}</td>
                    <td className="py-3.5 px-4">@{staff.username}</td>
                    <td className="py-3.5 px-4">
                      <span className="bg-blue-100 text-blue-800 dark:bg-blue-950/30 dark:text-blue-400 px-2 py-0.5 rounded-md text-[9px] uppercase font-bold tracking-wide">
                        Staff
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex justify-end space-x-1">
                        <button
                          onClick={() => handleEditClick(staff)}
                          className="p-1.5 text-gray-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          title="Edit Akun Staff"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTrigger(staff.id)}
                          className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors"
                          title="Hapus Akun Staff"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Edit / Tambah Staff */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={selectedStaff ? 'Edit Akun Staff' : 'Tambah Staff Baru'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Nama Staff */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide block">
              Nama Lengkap Staff *
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                className={`w-full bg-rose-50/10 dark:bg-gray-900 border ${formErrors.nama ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 dark:border-gray-700 focus:ring-rose-500'} rounded-xl py-2.5 pl-9 pr-3 text-xs text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1`}
                placeholder="Contoh: Siska Amelia"
                disabled={loading}
              />
            </div>
            {formErrors.nama && <p className="text-[10px] text-red-500 mt-0.5">{formErrors.nama}</p>}
          </div>

          {/* Username */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide block">
              Username Login *
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={`w-full bg-rose-50/10 dark:bg-gray-900 border ${formErrors.username ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 dark:border-gray-700 focus:ring-rose-500'} rounded-xl py-2.5 pl-9 pr-3 text-xs text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1`}
                placeholder="Masukkan username"
                disabled={loading}
              />
            </div>
            {formErrors.username && <p className="text-[10px] text-red-500 mt-0.5">{formErrors.username}</p>}
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide block">
              {selectedStaff ? 'Kata Sandi Baru (Kosongkan jika tidak diubah)' : 'Kata Sandi *'}
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type={showPasswordText ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full bg-rose-50/10 dark:bg-gray-900 border ${formErrors.password ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 dark:border-gray-700 focus:ring-rose-500'} rounded-xl py-2.5 pl-9 pr-10 text-xs text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1`}
                placeholder={selectedStaff ? 'Masukkan kata sandi baru' : 'Kata sandi minimal 6 karakter'}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPasswordText(!showPasswordText)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
              >
                {showPasswordText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {formErrors.password && <p className="text-[10px] text-red-500 mt-0.5">{formErrors.password}</p>}
          </div>

          {/* PIN 6-digit */}
          <div className="space-y-2 text-center py-2.5 bg-rose-50/30 dark:bg-gray-900/60 border border-rose-100/40 dark:border-gray-800 rounded-2xl">
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
              {selectedStaff ? 'Ubah PIN 6-Digit (Kosongkan jika tidak diubah)' : 'Atur PIN 6-Digit Staff'}
            </label>
            
            <div className="flex justify-between items-center max-w-[280px] mx-auto py-1.5">
              {pinDigits.map((digit, index) => (
                <input
                  key={index}
                  id={`reg-pin-${index}`}
                  type="password"
                  pattern="[0-9]*"
                  inputMode="numeric"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handlePinChange(index, e.target.value)}
                  onKeyDown={(e) => handlePinKeyDown(index, e)}
                  className="w-10 h-12 text-center text-xl font-bold bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 focus:border-rose-400 dark:focus:border-rose-500 rounded-xl focus:outline-none transition-all shadow-sm"
                  disabled={loading}
                />
              ))}
            </div>
            <p className="text-[9px] text-gray-400 dark:text-gray-500">
              PIN digunakan untuk login praktis dari smartphone staff.
            </p>
            {formErrors.pin && <p className="text-[10px] text-red-500 mt-0.5">{formErrors.pin}</p>}
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-2 pt-4 border-t border-rose-50 dark:border-gray-700">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-700 rounded-xl"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-bold text-white bg-rose-500 hover:bg-rose-600 rounded-xl shadow-md"
            >
              {selectedStaff ? 'Simpan Perubahan' : 'Daftarkan Staff'}
            </button>
          </div>

        </form>
      </Modal>

      {/* Dialog Konfirmasi Hapus */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Hapus Akses Staff?"
        message="Apakah Anda yakin ingin menghapus akun staff ini secara permanen? Akun tersebut tidak akan bisa lagi mengakses sistem dashboard Ella Makeup."
        confirmText="Ya, Hapus Permanen"
      />

    </div>
  );
};

export default Register;
