import { useState, useEffect } from 'react';
import axios from 'axios';

const API_GATEWAY = 'http://localhost:3000';

const statusStyle = {
  available: 'bg-green-500 hover:bg-green-400 cursor-pointer text-white',
  locked:    'bg-yellow-400 cursor-not-allowed text-gray-800',
  booked:    'bg-red-500 cursor-not-allowed text-white opacity-60',
};

export default function InventoryPage({ token }) {
  const [showtimes, setShowtimes] = useState([]);
  const [selected, setSelected]   = useState(null);
  const [seats, setSeats]         = useState([]);
  const [showtime, setShowtime]   = useState(null);
  const [loading, setLoading]     = useState(false);
  const [message, setMessage]     = useState('');

  // Filter tanggal
  const [filterDate, setFilterDate] = useState('');

  // Ambil semua jadwal tayang saat halaman dibuka
  useEffect(() => {
    axios.get(`${API_GATEWAY}/inventory/showtimes`)
      .then(r => {
        setShowtimes(r.data);
        // Set filter ke tanggal pertama yang ada
        if (r.data.length > 0) {
          setFilterDate(r.data[0].show_date);
        }
      })
      .catch(() => setMessage('❌ Gagal memuat jadwal tayang. Pastikan backend berjalan.'));
  }, []);

  // Ambil kursi saat user klik jadwal
  const loadSeats = async (showtimeId) => {
    setSelected(showtimeId);
    setLoading(true);
    setMessage('');
    setSeats([]);
    setShowtime(null);
    try {
      const r = await axios.get(`${API_GATEWAY}/inventory/showtimes/${showtimeId}/seats`);
      setShowtime(r.data.showtime);
      setSeats(r.data.seats);
    } catch {
      setMessage('❌ Gagal memuat data kursi.');
    } finally {
      setLoading(false);
    }
  };

  // Klik kursi → lock
  const handleSeatClick = async (seat) => {
    if (seat.status !== 'available') return;
    try {
      const r = await axios.post(`${API_GATEWAY}/inventory/seats/lock`, {
        showtime_id: selected,
        seat_id:     seat.seat_id,
      }, { headers: { Authorization: `Bearer ${token}` } });
      setMessage(`✅ ${r.data.message} — Kursi ${seat.label}`);
      loadSeats(selected);
    } catch (err) {
      setMessage(`❌ ${err.response?.data?.message || 'Gagal mengunci kursi'}`);
    }
  };

  // Ambil daftar tanggal unik dari showtimes
  const uniqueDates = [...new Set(showtimes.map(st => st.show_date))].sort();

  // Filter showtimes berdasarkan tanggal yang dipilih
  const filteredShowtimes = showtimes.filter(st => st.show_date === filterDate);

  // Grup kursi per baris
  const rows = seats.reduce((acc, seat) => {
    if (!acc[seat.row]) acc[seat.row] = [];
    acc[seat.row].push(seat);
    return acc;
  }, {});

  // Hitung ringkasan kursi
  const totalSeats     = seats.length;
  const availableSeats = seats.filter(s => s.status === 'available').length;
  const lockedSeats    = seats.filter(s => s.status === 'locked').length;
  const bookedSeats    = seats.filter(s => s.status === 'booked').length;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-xl font-bold mb-1 text-white">🎬 Jadwal Tayang</h2>
      <p className="text-gray-400 text-sm mb-6">Pilih jadwal lalu klik kursi untuk menguncinya.</p>

      {/* ── Filter Tanggal ── */}
      <div className="flex gap-2 flex-wrap mb-4">
        {uniqueDates.map(date => (
          <button
            key={date}
            onClick={() => { setFilterDate(date); setSelected(null); setSeats([]); setShowtime(null); }}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
              filterDate === date
                ? 'bg-indigo-500 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {new Date(date + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })}
          </button>
        ))}
      </div>

      {/* ── Daftar Showtimes ── */}
      {filteredShowtimes.length === 0 ? (
        <p className="text-gray-500 text-sm">Tidak ada jadwal untuk tanggal ini.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
          {filteredShowtimes.map(st => (
            <button
              key={st.id}
              onClick={() => loadSeats(st.id)}
              className={`text-left p-4 rounded-xl border transition ${
                selected === st.id
                  ? 'border-indigo-500 bg-indigo-900'
                  : 'border-gray-600 bg-gray-800 hover:border-gray-400'
              }`}
            >
              <p className="font-semibold text-white text-sm leading-snug">{st.movie_title}</p>
              <p className="text-xs text-gray-400 mt-1">{st.studio_name}</p>
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded">{st.seat_type}</span>
                <span className="text-xs text-indigo-400 font-bold">{st.show_time}</span>
              </div>
              <p className="text-indigo-300 font-bold text-sm mt-2">
                Rp {Number(st.price).toLocaleString('id-ID')}
              </p>
            </button>
          ))}
        </div>
      )}

      {/* ── Pesan Feedback ── */}
      {message && (
        <div className="mb-4 p-3 bg-gray-700 rounded-lg text-sm text-white">{message}</div>
      )}

      {/* ── Loading ── */}
      {loading && <p className="text-gray-400 text-sm">Memuat denah kursi...</p>}

      {/* ── Denah Kursi ── */}
      {!loading && showtime && (
        <div className="bg-gray-800 rounded-xl p-5">

          {/* Info jadwal */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-white">{showtime.movie_title}</h3>
            <p className="text-gray-400 text-sm">
              {showtime.studio_name} · {showtime.seat_type} · {showtime.show_time}
            </p>
          </div>

          {/* Ringkasan kursi */}
          <div className="flex gap-4 mb-4 text-xs text-gray-400">
            <span>Total: <strong className="text-white">{totalSeats}</strong></span>
            <span className="text-green-400">Tersedia: <strong>{availableSeats}</strong></span>
            <span className="text-yellow-400">Dikunci: <strong>{lockedSeats}</strong></span>
            <span className="text-red-400">Terjual: <strong>{bookedSeats}</strong></span>
          </div>

          {/* Legenda */}
          <div className="flex gap-4 mb-5 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded bg-green-500 inline-block"/>
              <span className="text-gray-300">Tersedia</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded bg-yellow-400 inline-block"/>
              <span className="text-gray-300">Dikunci</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded bg-red-500 inline-block"/>
              <span className="text-gray-300">Terjual</span>
            </span>
          </div>

          {/* Layar */}
          <div className="w-full text-center mb-6">
            <div className="inline-block bg-gray-600 text-gray-300 text-xs px-8 py-1 rounded">
              LAYAR
            </div>
          </div>

          {/* Grid kursi */}
          <div className="space-y-2">
            {Object.entries(rows).map(([row, rowSeats]) => (
              <div key={row} className="flex items-center gap-2">
                <span className="text-gray-500 font-mono text-xs w-4">{row}</span>
                <div className="flex gap-1 flex-wrap">
                  {rowSeats.map(seat => (
                    <button
                      key={seat.seat_id}
                      onClick={() => handleSeatClick(seat)}
                      disabled={seat.status !== 'available'}
                      className={`w-8 h-8 rounded text-xs font-bold transition ${statusStyle[seat.status]}`}
                      title={
                        seat.status === 'locked'
                          ? `Dikunci hingga ${seat.locked_until}`
                          : seat.status === 'booked'
                          ? 'Sudah terjual'
                          : `Klik untuk kunci kursi ${seat.label}`
                      }
                    >
                      {seat.number}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => loadSeats(selected)}
            className="mt-5 text-xs text-indigo-400 hover:underline"
          >
            🔄 Refresh status kursi
          </button>
        </div>
      )}
    </div>
  );
}