// Nama file: pages/Login.jsx
// Deskripsi: Halaman login aplikasi booking MUA (mendukung username/password dan PIN 6-digit)

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeyRound, User, Lock, Sparkles, Smartphone } from 'lucide-react';
import useAuthStore from '../store/authStore';
import useToastStore from '../store/toastStore';

const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, loading, error, clearError } = useAuthStore();
  const { showToast } = useToastStore();

  const [activeTab, setActiveTab] = useState('password'); // 'password' atau 'pin'
  
  // State untuk form password
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // State untuk form PIN (array 6 digit)
  const [pinDigits, setPinDigits] = useState(['', '', '', '', '', '']);

  // Redirect jika sudah login
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Hapus error store saat ganti tab
  useEffect(() => {
    clearError();
  }, [activeTab, clearError]);

  // Tampilkan toast error jika terdeteksi dari store
  useEffect(() => {
    if (error) {
      showToast(error, 'error');
    }
  }, [error, showToast]);

  // Handle submit username + password
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      showToast('Username dan password wajib diisi!', 'warning');
      return;
    }

    const res = await login({ username, password });
    if (res.success) {
      showToast('Selamat datang kembali!', 'success');
      navigate('/');
    }
  };

  // Handle input digit PIN
  const handlePinChange = (index, value) => {
    // Hanya izinkan angka
    if (value !== '' && !/^[0-9]$/.test(value)) return;

    const newPin = [...pinDigits];
    newPin[index] = value;
    setPinDigits(newPin);

    // Auto-focus input berikutnya jika diisi
    if (value !== '' && index < 5) {
      const nextInput = document.getElementById(`pin-${index + 1}`);
      nextInput?.focus();
    }
  };

  // Handle tombol backspace pada input PIN
  const handlePinKeyDown = (index, e) => {
    if (e.key === 'Backspace' && pinDigits[index] === '' && index > 0) {
      const prevInput = document.getElementById(`pin-${index - 1}`);
      prevInput?.focus();
    }
  };

  // Pemicu login PIN otomatis ketika semua 6 digit terisi
  useEffect(() => {
    const fullPin = pinDigits.join('');
    if (fullPin.length === 6) {
      const triggerPinLogin = async () => {
        const res = await login({ pin: fullPin });
        if (res.success) {
          showToast('Login PIN berhasil!', 'success');
          navigate('/');
        } else {
          // Reset PIN jika gagal
          setPinDigits(['', '', '', '', '', '']);
          const firstInput = document.getElementById('pin-0');
          firstInput?.focus();
        }
      };
      triggerPinLogin();
    }
  }, [pinDigits, login, navigate, showToast]);

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-gradient-to-tr from-rose-50 to-rose-100 dark:from-gray-900 dark:to-gray-950 transition-colors duration-200">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-3xl border border-rose-100 dark:border-gray-700 shadow-2xl p-8 transform transition-all">
        
        {/* Logo MUA */}
        <div className="flex flex-col items-center justify-center text-center space-y-2 mb-8">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-400 to-rose-600 text-white font-black text-2xl shadow-lg shadow-rose-200 dark:shadow-none">
            E
          </div>
          <h2 className="text-2xl font-black text-gray-800 dark:text-white leading-tight">
            Ella <span className="text-rose-500">Makeup</span>
          </h2>
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center">
            <Sparkles className="w-3.5 h-3.5 text-rose-400 mr-1 animate-pulse" />
            Professional Dashboard
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1.5 bg-rose-50 dark:bg-gray-700 rounded-2xl mb-8 border border-rose-100/50 dark:border-gray-600/30">
          <button
            onClick={() => setActiveTab('password')}
            className={`flex-1 flex items-center justify-center py-2.5 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'password'
                ? 'bg-white dark:bg-gray-800 text-rose-500 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-rose-400'
            }`}
          >
            <Lock className="w-3.5 h-3.5 mr-1.5" />
            Kata Sandi
          </button>
          <button
            onClick={() => setActiveTab('pin')}
            className={`flex-1 flex items-center justify-center py-2.5 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'pin'
                ? 'bg-white dark:bg-gray-800 text-rose-500 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-rose-400'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 mr-1.5" />
            PIN 6-Digit
          </button>
        </div>

        {/* Form area */}
        {activeTab === 'password' ? (
          <form onSubmit={handlePasswordSubmit} className="space-y-5">
            {/* Username Input */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide block">
                Username
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-rose-50/20 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl py-3 pl-10 pr-4 text-sm text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-400 transition-all"
                  placeholder="Masukkan username"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide block">
                Kata Sandi
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                  <KeyRound className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-rose-50/20 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl py-3 pl-10 pr-4 text-sm text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-400 transition-all"
                  placeholder="Masukkan kata sandi"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-rose-500 hover:bg-rose-600 disabled:bg-rose-400 text-white font-bold py-3.5 rounded-xl transition-colors shadow-md shadow-rose-200 dark:shadow-none mt-2 focus:outline-none focus:ring-2 focus:ring-rose-400 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <span className="inline-block animate-pulse">Menghubungkan...</span>
              ) : (
                <span>Masuk Sekarang</span>
              )}
            </button>
          </form>
        ) : (
          <div className="space-y-6">
            {/* PIN Inputs */}
            <div className="space-y-2 text-center">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
                Masukkan PIN Akun Anda
              </label>
              
              <div className="flex justify-between items-center max-w-[280px] mx-auto py-2">
                {pinDigits.map((digit, index) => (
                  <input
                    key={index}
                    id={`pin-${index}`}
                    type="password"
                    pattern="[0-9]*"
                    inputMode="numeric"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handlePinChange(index, e.target.value)}
                    onKeyDown={(e) => handlePinKeyDown(index, e)}
                    className="w-10 h-12 text-center text-xl font-bold bg-rose-50/30 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 focus:border-rose-400 dark:focus:border-rose-500 rounded-xl focus:outline-none transition-all shadow-inner"
                    disabled={loading}
                  />
                ))}
              </div>
            </div>

            <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center leading-relaxed">
              Login PIN menggunakan kredensial instan Anda yang tersimpan.<br />
              Default PIN adalah: <strong>123456</strong>
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-rose-50 dark:border-gray-700 text-center">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Sistem Aman Terenkripsi JWT 🔐
          </p>
        </div>

      </div>
    </div>
  );
};

export default Login;
