import { useState } from 'react';
import axios from 'axios';
import InventoryPage from './InventoryPage';

const API_GATEWAY = "http://localhost:3000";

export default function Dashboard({ user, token, onLogout }) {
  const [page, setPage] = useState('home');

  const getMovieData = async () => {
    try {
      const res = await axios.get(`${API_GATEWAY}/inventory/showtimes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Data Film Berhasil Diambil: " + JSON.stringify(res.data.data));
    } catch (err) {
      alert(err.response?.data?.message);
    }
  };

  const doBooking = async () => {
    try {
      const res = await axios.post(`${API_GATEWAY}/bookings`, { seat_id: "A1" }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Booking Sukses: " + res.data.message);
    } catch (err) {
      alert(err.response?.data?.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">

      {/* ── Navbar ── */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <h1 className="font-bold text-indigo-400 text-lg">🎬 Cine Reserve</h1>
          <button
            onClick={() => setPage('home')}
            className={`text-sm transition ${page === 'home' ? 'text-white font-semibold' : 'text-gray-400 hover:text-white'}`}
          >
            Home
          </button>
          <button
            onClick={() => setPage('inventory')}
            className={`text-sm transition ${page === 'inventory' ? 'text-white font-semibold' : 'text-gray-400 hover:text-white'}`}
          >
            Jadwal Film
          </button>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400">
            {user.name} · <span className="text-indigo-400 uppercase font-semibold text-xs">{user.role}</span>
          </span>
          <button
            onClick={onLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition"
          >
            Logout
          </button>
        </div>
      </div>

      {/* ── Halaman Home ── */}
      {page === 'home' && (
        <div className="max-w-4xl mx-auto p-8">

          {/* Sambutan */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-1">Selamat Datang, {user.name}!</h2>
            <p className="text-gray-400">
              Anda masuk sebagai{' '}
              <span className="text-indigo-400 font-semibold uppercase">{user.role}</span>
            </p>
          </div>

          {/* Kartu menu */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

            {/* Jadwal Film */}
            <button
              onClick={() => setPage('inventory')}
              className="bg-gray-800 hover:bg-indigo-900 border border-gray-700 hover:border-indigo-500 p-6 rounded-xl text-left transition"
            >
              <div className="text-2xl mb-3">🎟️</div>
              <p className="font-semibold text-white">Jadwal Film</p>
              <p className="text-xs text-gray-400 mt-1">Lihat jadwal tayang dan pilih kursi</p>
            </button>

            {/* Movie Service */}
            <button
              onClick={getMovieData}
              className="bg-gray-800 hover:bg-blue-900 border border-gray-700 hover:border-blue-500 p-6 rounded-xl text-left transition"
            >
              <div className="text-2xl mb-3">🎥</div>
              <p className="font-semibold text-white">Movie Service</p>
              <p className="text-xs text-gray-400 mt-1">Khusus Admin</p>
            </button>

            {/* Booking Service */}
            <button
              onClick={doBooking}
              className="bg-gray-800 hover:bg-green-900 border border-gray-700 hover:border-green-500 p-6 rounded-xl text-left transition"
            >
              <div className="text-2xl mb-3">🪑</div>
              <p className="font-semibold text-white">Booking Service</p>
              <p className="text-xs text-gray-400 mt-1">Khusus User</p>
            </button>

          </div>
        </div>
      )}

      {/* ── Halaman Inventory ── */}
      {page === 'inventory' && (
        <InventoryPage token={token} />
      )}

    </div>
  );
}