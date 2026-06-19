import { useState } from 'react';
import axios from 'axios';

const API_GATEWAY = "http://localhost:8080";

export default function BookingPage({ user }) {
  const [bookingId, setBookingId]   = useState('');
  const [booking, setBooking]       = useState(null);
  const [message, setMessage]       = useState('');
  const [loading, setLoading]       = useState(false);
  const [showtimeId, setShowtimeId] = useState('');
  const [seatId, setSeatId]         = useState('');
  const [activeTab, setActiveTab]   = useState('create');

  const createBooking = async () => {
    if (!showtimeId || !seatId) {
      setMessage('❌ Showtime ID dan Seat ID wajib diisi');
      return;
    }
    setLoading(true);
    setMessage('');
    setBooking(null);
    try {
      const res = await axios.post(`${API_GATEWAY}/bookings/create`, {
        showtime_id: Number(showtimeId),
        seat_id:     Number(seatId),
        user_id:     String(user.id),
        user_name:   user.name,
      });
      setBooking(res.data.booking);
      setMessage('✅ ' + res.data.message);
    } catch (err) {
      setMessage('❌ ' + (err.response?.data?.message || 'Gagal membuat booking'));
    } finally {
      setLoading(false);
    }
  };

  const searchBooking = async () => {
    if (!bookingId.trim()) return;
    setLoading(true);
    setMessage('');
    setBooking(null);
    try {
      const res = await axios.get(`${API_GATEWAY}/bookings/${bookingId.trim().toUpperCase()}`);
      setBooking(res.data);
    } catch (err) {
      setMessage('❌ ' + (err.response?.data?.message || 'Booking tidak ditemukan'));
    } finally {
      setLoading(false);
    }
  };

  const payBooking = async () => {
    setLoading(true);
    setMessage('');
    try {
      const res = await axios.post(`${API_GATEWAY}/bookings/${booking.booking_id}/pay`);
      setBooking(res.data.ticket);
      setMessage('✅ ' + res.data.message);
    } catch (err) {
      setMessage('❌ ' + (err.response?.data?.message || 'Gagal memproses pembayaran'));
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async () => {
    setLoading(true);
    setMessage('');
    try {
      const res = await axios.post(`${API_GATEWAY}/bookings/${booking.booking_id}/cancel`);
      setMessage('✅ ' + res.data.message);
      setBooking(prev => ({ ...prev, status: 'EXPIRED' }));
    } catch (err) {
      setMessage('❌ ' + (err.response?.data?.message || 'Gagal membatalkan booking'));
    } finally {
      setLoading(false);
    }
  };

  const statusColor = {
    PENDING: 'bg-yellow-500 text-gray-900',
    SUCCESS: 'bg-green-500 text-white',
    EXPIRED: 'bg-red-500 text-white',
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-1 text-white">🪑 Buat Booking</h2>
      <p className="text-gray-400 text-sm mb-6">
        Login sebagai <span className="text-indigo-400 font-semibold">{user.name}</span>
        <span className="text-gray-600 ml-2">(ID: {user.id})</span>
      </p>

      {/* Tab */}
      <div className="flex gap-1 mb-6 bg-gray-800 p-1 rounded-lg w-fit">
        <button
          onClick={() => { setActiveTab('create'); setBooking(null); setMessage(''); }}
          className={`px-4 py-2 rounded-md text-sm font-semibold transition ${activeTab === 'create' ? 'bg-indigo-500 text-white' : 'text-gray-400 hover:text-white'}`}
        >
          Buat Baru
        </button>
        <button
          onClick={() => { setActiveTab('search'); setBooking(null); setMessage(''); }}
          className={`px-4 py-2 rounded-md text-sm font-semibold transition ${activeTab === 'search' ? 'bg-indigo-500 text-white' : 'text-gray-400 hover:text-white'}`}
        >
          Cari by ID
        </button>
      </div>

      {/* Tab Buat Baru */}
      {activeTab === 'create' && (
        <div className="bg-gray-800 rounded-xl p-5 mb-6 border border-gray-700">
          <p className="text-sm text-gray-400 mb-4">
            Lihat <span className="text-indigo-400">Jadwal Film</span> untuk mendapatkan Showtime ID dan Seat ID.
          </p>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Showtime ID</label>
              <input
                type="number"
                placeholder="contoh: 1"
                value={showtimeId}
                onChange={e => setShowtimeId(e.target.value)}
                className="w-full bg-gray-700 text-white placeholder-gray-500 px-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Seat ID</label>
              <input
                type="number"
                placeholder="contoh: 1"
                value={seatId}
                onChange={e => setSeatId(e.target.value)}
                className="w-full bg-gray-700 text-white placeholder-gray-500 px-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="bg-gray-700 rounded-lg px-4 py-3 text-xs text-gray-400">
              User: <span className="text-white font-semibold">{user.name}</span>
              <span className="ml-3">ID: <span className="text-white">{user.id}</span></span>
            </div>
            <button
              onClick={createBooking}
              disabled={loading}
              className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-2 rounded-lg text-sm font-semibold transition disabled:opacity-50"
            >
              {loading ? 'Memproses...' : '🎟️ Buat Booking'}
            </button>
          </div>
        </div>
      )}

      {/* Tab Cari by ID */}
      {activeTab === 'search' && (
        <div className="flex gap-2 mb-6">
          <input
            type="text"
            placeholder="Masukkan Booking ID (contoh: BOOK0001)"
            value={bookingId}
            onChange={e => setBookingId(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && searchBooking()}
            className="flex-1 bg-gray-700 text-white placeholder-gray-400 px-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={searchBooking}
            disabled={loading}
            className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition disabled:opacity-50"
          >
            {loading ? '...' : 'Cari'}
          </button>
        </div>
      )}

      {message && <div className="mb-4 p-3 bg-gray-700 rounded-lg text-sm text-white">{message}</div>}

      {/* Detail booking */}
      {booking && (
        <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs text-gray-400 mb-1">Booking ID</p>
              <p className="font-mono font-bold text-white text-lg">{booking.booking_id}</p>
            </div>
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${statusColor[booking.status]}`}>
              {booking.status}
            </span>
          </div>

          <div className="space-y-2 text-sm mb-5">
            <div className="flex justify-between"><span className="text-gray-400">Film</span><span className="text-white font-semibold">{booking.movie_title}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Studio</span><span className="text-white">{booking.studio_name}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Tanggal & Jam</span><span className="text-white">{booking.show_date} · {booking.show_time}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Kursi</span><span className="text-white font-bold">{booking.seat_label}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Harga</span><span className="text-indigo-400 font-bold">Rp {Number(booking.price).toLocaleString('id-ID')}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Nama</span><span className="text-white">{booking.user_name}</span></div>
          </div>

          {booking.status === 'SUCCESS' && booking.qr_code && (
            <div className="bg-gray-900 rounded-lg p-4 text-center mb-4">
              <p className="text-xs text-gray-400 mb-2">E-Ticket / QR Code</p>
              <p className="font-mono text-green-400 font-bold text-base tracking-widest">{booking.qr_code}</p>
              {booking.paid_at && <p className="text-xs text-gray-500 mt-2">Dibayar: {booking.paid_at}</p>}
            </div>
          )}

          {booking.status === 'PENDING' && booking.expired_at && (
            <div className="bg-yellow-900 border border-yellow-600 rounded-lg p-3 text-xs text-yellow-300 mb-4">
              ⏳ Selesaikan pembayaran sebelum: {booking.expired_at}
            </div>
          )}

          {booking.status === 'PENDING' && (
            <div className="flex gap-3">
              <button onClick={payBooking} disabled={loading} className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg text-sm font-semibold transition disabled:opacity-50">
                💳 Bayar Sekarang
              </button>
              <button onClick={cancelBooking} disabled={loading} className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg text-sm font-semibold transition disabled:opacity-50">
                ✕ Batalkan
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}