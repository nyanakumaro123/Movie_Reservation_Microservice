import { useState } from 'react';
import axios from 'axios';

const API_GATEWAY = "http://localhost:3000";

export default function AuthPage({ onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(false); // Switcher halaman
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(''); // Tambahan untuk registrasi

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isRegister) {
      // --- LOGIKA REGISTRASI ---
      try {
        const response = await axios.post(`${API_GATEWAY}/auth/register`, { name, email, password });
        alert(response.data.message || "Registrasi Berhasil! Silakan Login.");
        setIsRegister(false); // Pindahkan ke halaman login setelah sukses register
      } catch (error) {
        alert(error.response?.data?.message || "Registrasi Gagal");
      }
    } else {
      // --- LOGIKA LOGIN ---
      try {
        const response = await axios.post(`${API_GATEWAY}/auth/login`, { email, password });
        onLoginSuccess(response.data.user, response.data.token);
        alert(response.data.message);
      } catch (error) {
        alert(error.response?.data?.message || "Login Gagal");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold text-center mb-6 text-indigo-400">
          {isRegister ? "Daftar Akun Cine Reserve" : "Masuk Cine Reserve"}
        </h2>

        {isRegister && (
          <input type="text" placeholder="Nama Lengkap" className="w-full p-2 mb-4 rounded bg-gray-700 focus:outline-none" value={name} onChange={e => setName(e.target.value)} required />
        )}

        <input type="email" placeholder="Email" className="w-full p-2 mb-4 rounded bg-gray-700 focus:outline-none" value={email} onChange={e => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" className="w-full p-2 mb-6 rounded bg-gray-700 focus:outline-none" value={password} onChange={e => setPassword(e.target.value)} required />
        
        <button type="submit" className="w-full bg-indigo-500 p-2 rounded font-bold hover:bg-indigo-600 transition">
          {isRegister ? "Sign Up" : "Sign In"}
        </button>

        <p className="text-sm text-gray-400 mt-4 text-center">
          {isRegister ? "Sudah punya akun?" : "Belum punya akun?"}{" "}
          <button type="button" className="text-indigo-400 font-semibold hover:underline" onClick={() => setIsRegister(!isRegister)}>
            {isRegister ? "Login di sini" : "Daftar di sini"}
          </button>
        </p>
      </form>
    </div>
  );
}