import { useState, useEffect } from 'react';
import axios from 'axios';

const API_GATEWAY = 'http://localhost:8080';

const statusColor = {
  PENDING: 'bg-yellow-500 text-gray-900',
  SUCCESS: 'bg-green-500 text-white',
  EXPIRED: 'bg-red-500 text-white',
};

export default function MyBookingsPage({ user }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [message, setMessage]   = useState('');
  const [selected, setSelected] = useState(null);
  const [refresh, setRefresh]   = useState(0); // trigger manual refresh

  // Fetch langsung di dalam useEffect — tidak pakai fungsi luar
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_GATEWAY}/bookings/user/${user.id}`);
        if (!cancelled) setBookings(res.data);
      } catch {
        if (!cancelled) setMessage('❌ Gagal memuat data booking.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => { cancelled = true; };
  }, [user.id, refresh]); // refresh berubah = fetch ulang

  // Trigger refresh dari tombol atau setelah aksi
  const doRefresh = () => setRefresh(r => r + 1);

  const payBooking = async (bookingId) => {
    try {
      const res = await axios.post(`${API_GATEWAY}/bookings/${bookingId}/pay`);
      setMessage('✅ ' + res.data.message);
      setSelected(null);
      doRefresh();
    } catch (err) {
      setMessage('❌ ' + (err.response?.data?.message || 'Gagal memproses pembayaran'));
    }
  };

  const cancelBooking = async (bookingId) => {
    try {
      const res = await axios.post(`${API_GATEWAY}/bookings/${bookingId}/cancel`);
      setMessage('✅ ' + res.data.message);
      setSelected(null);
      doRefresh();
    } catch (err) {
      setMessage('❌ ' + (err.response?.data?.message || 'Gagal membatalkan booking'));
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-1">
        <h2 className="text-xl font-bold text-white">📋 Booking Saya</h2>
        <button onClick={doRefresh} className="text-xs text-indigo-400 hover:underline">🔄 Refresh</button>
      </div>
      <p className="text-gray-400 text-sm mb-6">Semua tiket yang pernah dipesan oleh {user.name}.</p>

      {message && <div className="mb-4 p-3 bg-gray-700 rounded-lg text-sm text-white">{message}</div>}
      {loading && <p className="text-gray-400 text-sm">Memuat data booking...</p>}

      {!loading && bookings.length === 0 && (
        <div className="bg-gray-800 rounded-xl p-8 text-center border border-gray-700">
          <p className="text-gray-500 text-sm">Belum ada booking. Buat booking baru dari tab Booking.</p>
        </div>
      )}

      <div className="space-y-3">
        {bookings.map(b => (
          <div key={b.booking_id} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            <button
              onClick={() => setSelected(selected === b.booking_id ? null : b.booking_id)}
              className="w-full text-left p-4 flex justify-between items-center transition"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-white font-bold text-sm">{b.booking_id}</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${statusColor[b.status]}`}>
                  {b.status}
                </span>
              </div>
              <div className="text-right">
                <p className="text-white text-sm font-semibold">{b.movie_title}</p>
                <p className="text-gray-400 text-xs">{b.show_date} · {b.show_time} · Kursi {b.seat_label}</p>
              </div>
            </button>

            {selected === b.booking_id && (
              <div className="border-t border-gray-700 p-4">
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between"><span className="text-gray-400">Film</span><span className="text-white font-semibold">{b.movie_title}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Studio</span><span className="text-white">{b.studio_name}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Tanggal & Jam</span><span className="text-white">{b.show_date} · {b.show_time}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Kursi</span><span className="text-white font-bold">{b.seat_label}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Harga</span><span className="text-indigo-400 font-bold">Rp {Number(b.price).toLocaleString('id-ID')}</span></div>
                </div>

                {b.status === 'SUCCESS' && b.qr_code && (
                  <div className="bg-gray-900 rounded-lg p-4 text-center mb-4">
                    <p className="text-xs text-gray-400 mb-2">E-Ticket / QR Code</p>
                    <p className="font-mono text-green-400 font-bold tracking-widest">{b.qr_code}</p>
                    {b.paid_at && <p className="text-xs text-gray-500 mt-2">Dibayar: {b.paid_at}</p>}
                  </div>
                )}

                {b.status === 'PENDING' && b.expired_at && (
                  <div className="bg-yellow-900 border border-yellow-600 rounded-lg p-3 text-xs text-yellow-300 mb-4">
                    ⏳ Bayar sebelum: {b.expired_at}
                  </div>
                )}

                {b.status === 'PENDING' && (
                  <div className="flex gap-3">
                    <button onClick={() => payBooking(b.booking_id)} className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg text-sm font-semibold transition">
                      💳 Bayar Sekarang
                    </button>
                    <button onClick={() => cancelBooking(b.booking_id)} className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg text-sm font-semibold transition">
                      ✕ Batalkan
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}