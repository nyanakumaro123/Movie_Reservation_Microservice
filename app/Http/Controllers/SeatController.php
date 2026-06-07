<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SeatController extends Controller
{
    // Get seats by showtime
    public function index($showtimeId, Request $request)
    {
        // Cleanup expired locks
        DB::table('seats')
            ->where('status', 'locked')
            ->where('locked_until', '<', now())
            ->update([
                'status' => 'available', 
                'locked_by' => null, 
                'locked_until' => null
            ]);
        
        $seats = DB::table('seats')
            ->where('showtime_id', $showtimeId)
            ->select('id', 'seat_row', 'seat_number', 'status', 'locked_by')
            ->get();
        
        // Format seat_code dari seat_row + seat_number
        $seats = $seats->map(function($seat) {
            $seat->seat_code = $seat->seat_row . $seat->seat_number;
            $seat->studio_id = 1; // default
            $seat->movie_id = 1;  // default
            return $seat;
        });
        
        return response()->json([
            'success' => true,
            'data' => $seats
        ]);
    }
    
    // Reserve (lock) a seat
    public function reserve(Request $request)
    {
        $request->validate([
            'seat_id' => 'required|integer',
            'showtime_id' => 'required|integer',
            'user_id' => 'required|string'
        ]);
        
        try {
            DB::beginTransaction();
            
            $seat = DB::table('seats')
                ->where('id', $request->seat_id)
                ->where('showtime_id', $request->showtime_id)
                ->lockForUpdate()
                ->first();
            
            if (!$seat) {
                DB::rollBack();
                return response()->json(['success' => false, 'message' => 'Seat not found'], 404);
            }
            
            if ($seat->status === 'sold') {
                DB::rollBack();
                return response()->json(['success' => false, 'message' => 'Seat already sold'], 409);
            }
            
            if ($seat->status === 'locked' && $seat->locked_by !== $request->user_id) {
                DB::rollBack();
                return response()->json(['success' => false, 'message' => 'Seat locked by another user'], 409);
            }
            
            DB::table('seats')
                ->where('id', $request->seat_id)
                ->update([
                    'status' => 'locked',
                    'locked_by' => $request->user_id,
                    'locked_until' => now()->addMinutes(10)
                ]);
            
            DB::commit();
            
            return response()->json(['success' => true, 'message' => 'Seat reserved successfully']);
            
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
    
    // Confirm or cancel reservation
    public function confirm(Request $request)
    {
        $request->validate([
            'seat_id' => 'required|integer',
            'showtime_id' => 'required|integer',
            'user_id' => 'required|string',
            'action' => 'required|in:confirm,cancel'
        ]);
        
        try {
            DB::beginTransaction();
            
            $seat = DB::table('seats')
                ->where('id', $request->seat_id)
                ->where('showtime_id', $request->showtime_id)
                ->lockForUpdate()
                ->first();
            
            if (!$seat) {
                DB::rollBack();
                return response()->json(['success' => false, 'message' => 'Seat not found'], 404);
            }
            
            if ($request->action === 'confirm') {
                DB::table('seats')
                    ->where('id', $request->seat_id)
                    ->update([
                        'status' => 'sold',
                        'locked_by' => null,
                        'locked_until' => null
                    ]);
                    
                DB::commit();
                return response()->json(['success' => true, 'message' => 'Seat confirmed and sold']);
                
            } else {
                // Cancel - release lock
                if ($seat->locked_by !== $request->user_id) {
                    DB::rollBack();
                    return response()->json(['success' => false, 'message' => 'Cannot cancel: seat not locked by you'], 403);
                }
                
                DB::table('seats')
                    ->where('id', $request->seat_id)
                    ->update([
                        'status' => 'available',
                        'locked_by' => null,
                        'locked_until' => null
                    ]);
                    
                DB::commit();
                return response()->json(['success' => true, 'message' => 'Seat released']);
            }
            
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
}