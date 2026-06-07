<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Inventory Service - Admin Dashboard</title>
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
    <style>
        .seat {
            transition: all 0.2s ease;
            cursor: pointer;
        }
        .seat:hover:not(.disabled) {
            transform: scale(1.05);
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }
    </style>
</head>
<body class="bg-gray-100">
    <!-- Navbar -->
    <nav class="bg-indigo-600 text-white shadow-lg">
        <div class="container mx-auto px-4 py-3">
            <div class="flex justify-between items-center">
                <h1 class="text-xl font-bold">🎬 Inventory Service - Admin Dashboard</h1>
                <div class="flex gap-4">
                    <span class="text-sm">Laravel + MySQL</span>
                </div>
            </div>
        </div>
    </nav>

    <div class="container mx-auto px-4 py-6">
        <!-- Studio, Movie, Schedule Selection -->
        <div class="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 class="text-lg font-bold mb-4">🎛️ Konfigurasi Studio & Jadwal</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700">Studio</label>
                    <select id="studioSelect" class="mt-1 block w-full border rounded-md p-2">
                        <option value="1">Studio A (IMAX) - 120 kursi</option>
                        <option value="2">Studio B (Regular) - 100 kursi</option>
                        <option value="3">Studio C (VIP) - 60 kursi</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">Movie</label>
                    <select id="movieSelect" class="mt-1 block w-full border rounded-md p-2">
                        <option value="1">Avengers: Endgame</option>
                        <option value="2">Dune: Part Two</option>
                        <option value="3">Oppenheimer</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">Schedule / Showtime</label>
                    <select id="scheduleSelect" class="mt-1 block w-full border rounded-md p-2">
                        <option value="1">10:00 AM</option>
                        <option value="2">01:00 PM</option>
                        <option value="3">04:00 PM</option>
                        <option value="4">07:00 PM</option>
                    </select>
                </div>
            </div>
            <div class="flex gap-3 mt-4">
                <button id="refreshBtn" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">🔄 Refresh</button>
                <button id="resetAllBtn" class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">🗑️ Reset All Lock</button>
            </div>
        </div>

        <!-- Legend -->
        <div class="bg-white rounded-lg shadow-md p-4 mb-6">
            <div class="flex flex-wrap gap-6">
                <div class="flex items-center gap-2"><div class="w-5 h-5 bg-green-500 rounded"></div><span>Available</span></div>
                <div class="flex items-center gap-2"><div class="w-5 h-5 bg-yellow-500 rounded"></div><span>Locked by You</span></div>
                <div class="flex items-center gap-2"><div class="w-5 h-5 bg-red-500 rounded"></div><span>Locked by Others</span></div>
                <div class="flex items-center gap-2"><div class="w-5 h-5 bg-gray-400 rounded"></div><span>Sold</span></div>
            </div>
        </div>

        <!-- Layar -->
        <div class="bg-gray-800 text-white text-center p-3 rounded-t-lg mb-2">
            🎬 SCREEN 🎬
        </div>

        <!-- Seat Grid -->
        <div class="bg-white rounded-b-lg shadow-lg p-6 overflow-x-auto">
            <div id="seatContainer" class="grid gap-2 justify-center" style="grid-template-columns: repeat(12, 55px);">
                <div class="text-center text-gray-500 col-span-12">Loading seats...</div>
            </div>
        </div>

        <!-- Info Panel -->
        <div class="bg-white rounded-lg shadow-md p-6 mt-6">
            <div class="flex justify-between items-center flex-wrap gap-4">
                <div>
                    <p class="text-lg font-semibold">📊 Statistik</p>
                    <p>Available: <span id="availableCount" class="font-bold text-green-600">0</span></p>
                    <p>Locked by You: <span id="lockedByMeCount" class="font-bold text-yellow-600">0</span></p>
                    <p>Locked by Others: <span id="lockedByOthersCount" class="font-bold text-red-600">0</span></p>
                    <p>Sold: <span id="soldCount" class="font-bold text-gray-600">0</span></p>
                </div>
                <div>
                    <p class="text-lg font-semibold">🔒 Selected Seats</p>
                    <p id="selectedSeatsList" class="text-sm text-gray-600">-</p>
                </div>
                <button id="bulkLockBtn" class="bg-indigo-500 text-white px-6 py-3 rounded-lg hover:bg-indigo-600 disabled:opacity-50" disabled>
                    ✅ Lock Selected Seats
                </button>
            </div>
            <div class="mt-4 p-3 bg-gray-100 rounded text-sm">
                <strong>Status:</strong> <span id="statusMessage">Ready</span>
            </div>
        </div>
    </div>

    <script>
        // State
        let seats = [];
        let selectedSeats = new Set();
        let currentUser = 'admin_' + Math.random().toString(36).substr(2, 8);
        let currentStudio = 1;
        let currentMovie = 1;
        let currentSchedule = 1;

        // Get CSRF token
        const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

        // Fetch seats from Laravel backend
        async function fetchSeats() {
            try {
                const response = await axios.get(`/api/seats/${currentSchedule}`, {
                    params: {
                        studio_id: currentStudio,
                        movie_id: currentMovie
                    }
                });
                seats = response.data.data || response.data;
                renderSeats();
                updateStats();
                document.getElementById('statusMessage').innerHTML = '✅ Data kursi berhasil dimuat';
            } catch (error) {
                console.error('Error fetching seats:', error);
                document.getElementById('statusMessage').innerHTML = '❌ Gagal mengambil data kursi. Pastikan service berjalan.';
                document.getElementById('seatContainer').innerHTML = '<div class="text-center text-red-500 col-span-12">Gagal load data. Cek koneksi ke backend.</div>';
            }
        }

        // Lock a seat
        async function lockSeat(seatId) {
            try {
                const response = await axios.post('/api/seats/reserve', {
                    seat_id: seatId,
                    showtime_id: currentSchedule,
                    user_id: currentUser
                }, {
                    headers: { 'X-CSRF-TOKEN': csrfToken }
                });
                
                if (response.data.success || response.data.status === 'success') {
                    document.getElementById('statusMessage').innerHTML = `✅ Kursi berhasil di-reserve`;
                    await fetchSeats();
                }
            } catch (error) {
                const msg = error.response?.data?.message || error.message;
                document.getElementById('statusMessage').innerHTML = `❌ Gagal reserve: ${msg}`;
                alert(`Gagal reserve kursi: ${msg}`);
            }
        }

        // Release lock (confirm = cancel)
        async function releaseLock(seatId) {
            try {
                const response = await axios.post('/api/seats/confirm', {
                    seat_id: seatId,
                    showtime_id: currentSchedule,
                    user_id: currentUser,
                    action: 'cancel'
                }, {
                    headers: { 'X-CSRF-TOKEN': csrfToken }
                });
                
                if (response.data.success || response.data.status === 'success') {
                    document.getElementById('statusMessage').innerHTML = `🔓 Kursi berhasil di-unlock`;
                    await fetchSeats();
                }
            } catch (error) {
                document.getElementById('statusMessage').innerHTML = `❌ Gagal unlock: ${error.message}`;
            }
        }

        // Bulk lock selected seats
        async function bulkLock() {
            const seatsToLock = Array.from(selectedSeats);
            if (seatsToLock.length === 0) return;
            
            document.getElementById('statusMessage').innerHTML = `🔄 Melocking ${seatsToLock.length} kursi...`;
            
            for (let seatId of seatsToLock) {
                await lockSeat(seatId);
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            
            selectedSeats.clear();
            document.getElementById('statusMessage').innerHTML = `✅ Selesai melock ${seatsToLock.length} kursi`;
            updateSelectedSeatsDisplay();
            updateStats();
        }

        // Reset all locks
        async function resetAllLocks() {
            if (!confirm('⚠️ Yakin ingin me-reset semua lock? Ini akan membuka semua kursi yang terlock.')) return;
            
            const lockedSeats = seats.filter(s => s.status === 'locked');
            let resetCount = 0;
            
            for (let seat of lockedSeats) {
                await releaseLock(seat.id);
                resetCount++;
                await new Promise(resolve => setTimeout(resolve, 50));
            }
            
            document.getElementById('statusMessage').innerHTML = `✅ Berhasil me-reset ${resetCount} kursi`;
            await fetchSeats();
        }

        // Toggle seat selection
        function toggleSeat(seatId, status, lockedBy) {
            if (status === 'available') {
                if (selectedSeats.has(seatId)) {
                    selectedSeats.delete(seatId);
                } else {
                    selectedSeats.add(seatId);
                }
                updateSelectedSeatsDisplay();
                updateStats();
            } else if (status === 'locked' && lockedBy === currentUser) {
                releaseLock(seatId);
            }
        }

        // Render seat grid
        function renderSeats() {
            const container = document.getElementById('seatContainer');
            if (!seats || seats.length === 0) {
                container.innerHTML = '<div class="text-center text-gray-500 col-span-12">Tidak ada data kursi</div>';
                return;
            }
            
            container.innerHTML = '';
            
            seats.forEach(seat => {
                const seatDiv = document.createElement('div');
                seatDiv.className = `seat w-12 h-12 rounded-lg flex items-center justify-center font-bold text-sm`;
                
                let bgColor = '';
                let isSelected = selectedSeats.has(seat.id);
                let seatStatus = seat.status || seat.seat_status;
                let lockedBy = seat.locked_by;
                
                if (seatStatus === 'sold') {
                    bgColor = 'bg-gray-400 cursor-not-allowed';
                } else if (seatStatus === 'locked') {
                    if (lockedBy === currentUser) {
                        bgColor = isSelected ? 'bg-orange-600' : 'bg-yellow-500';
                    } else {
                        bgColor = 'bg-red-500 cursor-not-allowed';
                    }
                } else {
                    bgColor = isSelected ? 'bg-orange-500' : 'bg-green-500';
                }
                
                seatDiv.classList.add(bgColor);
                seatDiv.innerText = seat.seat_code || seat.seat_number;
                
                if ((seatStatus === 'available') || (seatStatus === 'locked' && lockedBy === currentUser)) {
                    seatDiv.onclick = () => toggleSeat(seat.id, seatStatus, lockedBy);
                }
                
                container.appendChild(seatDiv);
            });
        }

        function updateStats() {
            if (!seats) return;
            
            const available = seats.filter(s => (s.status || s.seat_status) === 'available').length;
            const lockedByMe = seats.filter(s => (s.status || s.seat_status) === 'locked' && (s.locked_by === currentUser)).length;
            const lockedByOthers = seats.filter(s => (s.status || s.seat_status) === 'locked' && (s.locked_by !== currentUser)).length;
            const sold = seats.filter(s => (s.status || s.seat_status) === 'sold').length;
            
            document.getElementById('availableCount').innerText = available;
            document.getElementById('lockedByMeCount').innerText = lockedByMe;
            document.getElementById('lockedByOthersCount').innerText = lockedByOthers;
            document.getElementById('soldCount').innerText = sold;
            
            document.getElementById('bulkLockBtn').disabled = selectedSeats.size === 0;
        }

        function updateSelectedSeatsDisplay() {
            const selectedCodes = Array.from(selectedSeats).map(id => {
                const seat = seats.find(s => s.id === id);
                return seat ? (seat.seat_code || seat.seat_number) : id;
            });
            document.getElementById('selectedSeatsList').innerHTML = selectedCodes.join(', ') || '-';
            document.getElementById('bulkLockBtn').disabled = selectedSeats.size === 0;
        }

        // Refresh data
        async function refresh() {
            document.getElementById('statusMessage').innerHTML = '🔄 Loading...';
            selectedSeats.clear();
            await fetchSeats();
            updateSelectedSeatsDisplay();
        }

        // Auto-refresh setiap 15 detik
        setInterval(refresh, 15000);

        // Event listeners
        document.getElementById('refreshBtn').onclick = refresh;
        document.getElementById('resetAllBtn').onclick = resetAllLocks;
        document.getElementById('bulkLockBtn').onclick = bulkLock;
        
        document.getElementById('studioSelect').onchange = async (e) => {
            currentStudio = parseInt(e.target.value);
            await refresh();
        };
        document.getElementById('movieSelect').onchange = async (e) => {
            currentMovie = parseInt(e.target.value);
            await refresh();
        };
        document.getElementById('scheduleSelect').onchange = async (e) => {
            currentSchedule = parseInt(e.target.value);
            await refresh();
        };

        // Initial load
        refresh();
        
        console.log('Admin Dashboard ready. User ID:', currentUser);
    </script>
</body>
</html>