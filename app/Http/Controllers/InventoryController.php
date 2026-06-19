<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class InventoryController extends Controller
{
    // ═══════════════════════════════════════════════
    //  STUDIOS
    // ═══════════════════════════════════════════════

    // GET /api/inventory/studios
    public function studios()
    {
        $studios = DB::table('studios')->get();
        return response()->json($studios);
    }

    // ═══════════════════════════════════════════════
    //  SHOWTIMES
    // ═══════════════════════════════════════════════

    // GET /api/inventory/showtimes
    public function showtimes()
    {

        $showtimes = DB::table('showtimes')
            ->join('studios', 'studios.id', '=', 'showtimes.studio_id')
            ->select(
                'showtimes.id',
                'showtimes.movie_title',
                'showtimes.show_date',
                'showtimes.show_time',
                'showtimes.price',
                'studios.name as studio_name',
                'studios.seat_type'
            )
            ->orderBy('showtimes.show_date')
            ->orderBy('showtimes.show_time')
            ->get();

        return response()->json($showtimes);
    }

    // ═══════════════════════════════════════════════
    //  SEAT AVAILABILITY
    // ═══════════════════════════════════════════════

    // GET /api/inventory/showtimes/{id}/seats
    // Ambil semua kursi beserta statusnya untuk satu jadwal
    public function seats($showtimeId)
    {
        $showtime = DB::table('showtimes')
            ->join('studios', 'studios.id', '=', 'showtimes.studio_id')
            ->where('showtimes.id', $showtimeId)
            ->select('showtimes.*', 'studios.name as studio_name', 'studios.seat_type')
            ->first();

        if (!$showtime) {
            return response()->json(['message' => 'Jadwal tidak ditemukan'], 404);
        }

        // Auto-release lock yang sudah expired
        DB::table('seat_availability')
            ->where('showtime_id', $showtimeId)
            ->where('status', 'locked')
            ->where('locked_until', '<', now())
            ->update(['status' => 'available', 'locked_until' => null]);

        $seats = DB::table('seat_availability')
            ->join('seats', 'seats.id', '=', 'seat_availability.seat_id')
            ->where('seat_availability.showtime_id', $showtimeId)
            ->select(
                'seats.id as seat_id',
                'seats.label',
                'seats.row',
                'seats.number',
                'seat_availability.status',
                'seat_availability.locked_until'
            )
            ->orderBy('seats.row')
            ->orderBy('seats.number')
            ->get();

        return response()->json([
            'showtime' => $showtime,
            'seats'    => $seats,
        ]);
    }

    // ═══════════════════════════════════════════════
    //  LOCK KURSI (dipanggil saat user mulai bayar)
    // ═══════════════════════════════════════════════

    // POST /api/inventory/seats/lock
    // Body: { showtime_id, seat_id }
    public function lockSeat(Request $request)
    {
        $request->validate([
            'showtime_id' => 'required|integer',
            'seat_id'     => 'required|integer',
        ]);

        $availability = DB::table('seat_availability')
            ->where('showtime_id', $request->showtime_id)
            ->where('seat_id', $request->seat_id)
            ->first();

        if (!$availability) {
            return response()->json(['message' => 'Kursi tidak ditemukan'], 404);
        }

        // Jika sudah locked, cek apakah masih berlaku
        if ($availability->status === 'locked') {
            $isStillLocked = $availability->locked_until && now()->lt($availability->locked_until);
            if ($isStillLocked) {
                return response()->json(['message' => 'Kursi sedang dikunci oleh pengguna lain'], 409);
            }
        }

        if ($availability->status === 'booked') {
            return response()->json(['message' => 'Kursi sudah terjual'], 409);
        }

        // Lock selama 7 menit
        $lockedUntil = now()->addMinutes(7);

        DB::table('seat_availability')
            ->where('showtime_id', $request->showtime_id)
            ->where('seat_id', $request->seat_id)
            ->update([
                'status'       => 'locked',
                'locked_until' => $lockedUntil,
                'updated_at'   => now(),
            ]);

        return response()->json([
            'message'      => 'Kursi berhasil dikunci selama 7 menit',
            'locked_until' => $lockedUntil,
        ]);
    }

    // ═══════════════════════════════════════════════
    //  BOOK KURSI (dipanggil setelah pembayaran sukses)
    // ═══════════════════════════════════════════════

    // POST /api/inventory/seats/book
    // Body: { showtime_id, seat_id }
    public function bookSeat(Request $request)
    {
        $request->validate([
            'showtime_id' => 'required|integer',
            'seat_id'     => 'required|integer',
        ]);

        $rows = DB::table('seat_availability')
            ->where('showtime_id', $request->showtime_id)
            ->where('seat_id', $request->seat_id)
            ->whereIn('status', ['available', 'locked']) // hanya bisa book jika available atau locked
            ->update([
                'status'       => 'booked',
                'locked_until' => null,
                'updated_at'   => now(),
            ]);

        if ($rows === 0) {
            return response()->json(['message' => 'Kursi tidak dapat di-booking (sudah terjual atau tidak ditemukan)'], 409);
        }

        return response()->json(['message' => 'Kursi berhasil di-booking']);
    }

    // ═══════════════════════════════════════════════
    //  RELEASE LOCK (jika user batal bayar)
    // ═══════════════════════════════════════════════

    // POST /api/inventory/seats/release
    // Body: { showtime_id, seat_id }
    public function releaseSeat(Request $request)
    {
        $request->validate([
            'showtime_id' => 'required|integer',
            'seat_id'     => 'required|integer',
        ]);

        DB::table('seat_availability')
            ->where('showtime_id', $request->showtime_id)
            ->where('seat_id', $request->seat_id)
            ->where('status', 'locked')
            ->update([
                'status'       => 'available',
                'locked_until' => null,
                'updated_at'   => now(),
            ]);

        return response()->json(['message' => 'Kursi berhasil dilepas']);
    }
}
