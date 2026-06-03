<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SeatController extends Controller
{
    // Lihat kursi
    public function index($showtimeId)
    {
        $seats = DB::table('seats')
            ->where('showtime_id', $showtimeId)
            ->get();

        return response()->json($seats);
    }

    // Reservasi dengan LOCKING
    public function reserve(Request $request)
    {
        $request->validate([
            'showtime_id' => 'required|integer',
            'seat_ids' => 'required|array',
            'seat_ids.*' => 'integer',
            'user_id' => 'required|string'
        ]);

        DB::beginTransaction();

        try {
            $seats = DB::table('seats')
                ->where('showtime_id', $request->showtime_id)
                ->whereIn('id', $request->seat_ids)
                ->lockForUpdate()
                ->get();

            foreach ($seats as $seat) {
                if ($seat->status !== 'available') {
                    DB::rollBack();
                    return response()->json(['error' => 'Seat not available'], 409);
                }
            }

            DB::table('seats')
                ->where('showtime_id', $request->showtime_id)
                ->whereIn('id', $request->seat_ids)
                ->update([
                    'status' => 'locked',
                    'locked_by' => $request->user_id,
                    'locked_until' => now()->addMinutes(10)
                ]);

            DB::commit();

            return response()->json(['message' => 'Seats locked successfully']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    // Konfirmasi booking
    public function confirm(Request $request)
    {
        $request->validate([
            'seat_ids' => 'required|array',
            'seat_ids.*' => 'integer',
            'user_id' => 'required|string'
        ]);

        DB::beginTransaction();

        try {
            $updated = DB::table('seats')
                ->whereIn('id', $request->seat_ids)
                ->where('locked_by', $request->user_id)
                ->where('status', 'locked')
                ->update([
                    'status' => 'booked',
                    'locked_by' => null,
                    'locked_until' => null
                ]);

            if ($updated === 0) {
                DB::rollBack();
                return response()->json(['error' => 'Cannot confirm booking'], 409);
            }

            DB::commit();

            return response()->json(['message' => 'Booking confirmed']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
