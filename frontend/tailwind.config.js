// Nama file: tailwind.config.js
// Deskripsi: Konfigurasi Tailwind CSS v3 untuk mendeteksi file sumber dan mengaktifkan dark mode

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Mendukung alih tema gelap manual dengan menambahkan class 'dark' pada elemen html
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
      // Kustomisasi warna tambahan jika diperlukan, namun Tailwind Rose default
      // sudah sepenuhnya cocok dengan kode warna yang diminta user (#F43F5E, #FB7185, #FFF1F2)
    },
  },
  plugins: [],
}
