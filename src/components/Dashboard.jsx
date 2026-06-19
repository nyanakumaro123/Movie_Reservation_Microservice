import { useState } from 'react';
import InventoryPage from './InventoryPage';
import BookingPage from './BookingPage';
import MovieListPage from './MovieListPage';
import MyBookingsPage from './MyBookingsPage';

const API_GATEWAY = "http://localhost:8080";

// ── Dashboard Admin ───────────────────────────────────
function AdminDashboard({ user, token, onLogout, page, setPage }) {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <h1 className="font-bold text-indigo-400 text-lg">🎬 Cine Reserve</h1>
          <span className="text-xs bg-indigo-600 text-white px-2 py-0.5 rounded font-semibold">ADMIN</span>
          <button onClick={() => setPage('home')} className={`text-sm transition ${page === 'home' ? 'text-white font-semibold' : 'text-gray-400 hover:text-white'}`}>Home</button>
          <button onClick={() => setPage('inventory')} className={`text-sm transition ${page === 'inventory' ? 'text-white font-semibold' : 'text-gray-400 hover:text-white'}`}>Inventory</button>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400">{user.name}</span>
          <button onClick={onLogout} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition">Logout</button>
        </div>
      </div>

      {page === 'home' && (
        <div className="max-w-4xl mx-auto p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-1">Selamat Datang, {user.name}!</h2>
            <p className="text-gray-400">Anda login sebagai <span className="text-indigo-400 font-semibold">Admin</span></p>
          </div>
          <div className="max-w-sm">
            <button onClick={() => setPage('inventory')} className="w-full bg-gray-800 hover:bg-indigo-900 border border-gray-700 hover:border-indigo-500 p-6 rounded-xl text-left transition">
              <div className="text-2xl mb-3">🎬</div>
              <p className="font-semibold text-white">Inventory Service</p>
              <p className="text-xs text-gray-400 mt-1">Kelola jadwal tayang dan kursi</p>
            </button>
          </div>
        </div>
      )}

      {page === 'inventory' && <InventoryPage token={token} apiUrl={API_GATEWAY} />}
    </div>
  );
}

// ── Dashboard User ────────────────────────────────────
function UserDashboard({ user, token, onLogout, page, setPage }) {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <h1 className="font-bold text-indigo-400 text-lg">🎬 Cine Reserve</h1>
          <span className="text-xs bg-green-700 text-white px-2 py-0.5 rounded font-semibold">USER</span>
          <button onClick={() => setPage('home')} className={`text-sm transition ${page === 'home' ? 'text-white font-semibold' : 'text-gray-400 hover:text-white'}`}>Home</button>
          <button onClick={() => setPage('movies')} className={`text-sm transition ${page === 'movies' ? 'text-white font-semibold' : 'text-gray-400 hover:text-white'}`}>Jadwal Film</button>
          <button onClick={() => setPage('booking')} className={`text-sm transition ${page === 'booking' ? 'text-white font-semibold' : 'text-gray-400 hover:text-white'}`}>Booking</button>
          <button onClick={() => setPage('mybookings')} className={`text-sm transition ${page === 'mybookings' ? 'text-white font-semibold' : 'text-gray-400 hover:text-white'}`}>Tiket Saya</button>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400">{user.name}</span>
          <button onClick={onLogout} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition">Logout</button>
        </div>
      </div>

      {page === 'home' && (
        <div className="max-w-4xl mx-auto p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-1">Selamat Datang, {user.name}!</h2>
            <p className="text-gray-400">Anda login sebagai <span className="text-green-400 font-semibold">User</span></p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button onClick={() => setPage('movies')} className="bg-gray-800 hover:bg-indigo-900 border border-gray-700 hover:border-indigo-500 p-6 rounded-xl text-left transition">
              <div className="text-2xl mb-3">🎬</div>
              <p className="font-semibold text-white">Jadwal Film</p>
              <p className="text-xs text-gray-400 mt-1">Lihat jadwal dan posisi kursi</p>
            </button>
            <button onClick={() => setPage('booking')} className="bg-gray-800 hover:bg-green-900 border border-gray-700 hover:border-green-500 p-6 rounded-xl text-left transition">
              <div className="text-2xl mb-3">🪑</div>
              <p className="font-semibold text-white">Booking</p>
              <p className="text-xs text-gray-400 mt-1">Pesan tiket baru</p>
            </button>
            <button onClick={() => setPage('mybookings')} className="bg-gray-800 hover:bg-yellow-900 border border-gray-700 hover:border-yellow-500 p-6 rounded-xl text-left transition">
              <div className="text-2xl mb-3">📋</div>
              <p className="font-semibold text-white">Tiket Saya</p>
              <p className="text-xs text-gray-400 mt-1">Lihat semua tiket yang dipesan</p>
            </button>
          </div>
        </div>
      )}

      {page === 'movies'     && <MovieListPage />}
      {page === 'booking'    && <BookingPage user={user} />}
      {page === 'mybookings' && <MyBookingsPage user={user} />}
    </div>
  );
}

// ── Dashboard utama ───────────────────────────────────
export default function Dashboard({ user, token, onLogout }) {
  const [page, setPage] = useState('home');

  if (user.role === 'admin') {
    return <AdminDashboard user={user} token={token} onLogout={onLogout} page={page} setPage={setPage} />;
  }

  return <UserDashboard user={user} token={token} onLogout={onLogout} page={page} setPage={setPage} />;
}