<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PaymentController extends Controller
{
    /**
     * POST /api/payments/charge
     *
     * Called by the frontend or another microservice (e.g. booking-service)
     * to create and process a payment.
     *
     * Body JSON:
     * {
     *   "order_id"   : "BOOK-001",        // reservation/booking ID from booking-service
     *   "amount"     : 120000,             // in IDR (integer)
     *   "method"     : "CREDIT_CARD",      // CREDIT_CARD | DEBIT_CARD | BANK_TRANSFER | E_WALLET | CASH
     *   "card_last4" : "1234",             // optional — for card methods
     *   "user_id"    : "USER-42"           // optional — for reference
     * }
     
    public function charge(Request $request)
    {
        $request->validate([
            'order_id' => 'required|string|unique:payments,order_id',
            'amount'   => 'required|numeric|min:1',
            'method'   => 'required|in:CREDIT_CARD,DEBIT_CARD,BANK_TRANSFER,E_WALLET,CASH',
        ]);

        // ── Dummy gateway simulation ──────────────────────────────────────
        // Card ending in 0000 → declined (useful for demo/testing failures)
        $declined = ($request->card_last4 === '0000');

        $status       = $declined ? 'failed'  : 'success';
        $snap_token   = $declined ? null       : 'DUMMY-' . strtoupper(Str::random(16));
        // ─────────────────────────────────────────────────────────────────

        $payment = Payment::create([
            'order_id'   => $request->order_id,
            'amount'     => $request->amount,
            'status'     => $status,
            'snap_token' => $snap_token,
            'method'     => $request->method,
            'user_id'    => $request->user_id,
            'card_last4' => $request->card_last4,
        ]);

        if ($declined) {
            return response()->json([
                'success' => false,
                'message' => 'Payment declined (simulated).',
                'data'    => $payment,
            ], 402);
        }

        return response()->json([
            'success'    => true,
            'message'    => 'Payment processed successfully (simulated).',
            'snap_token' => $snap_token,
            'data'       => $payment,
        ], 201);
    }

    /**
     * POST /api/payments/callback
     *
     * Simulated webhook endpoint. In production this would be called by
     * Midtrans. For the class project, any POST to this route with an
     * order_id will mark that payment as success.
     */
    public function callback(Request $request)
    {
        $request->validate([
            'order_id'        => 'required|string',
            'transaction_status' => 'sometimes|string',
        ]);

        $payment = Payment::where('order_id', $request->order_id)->first();

        if (! $payment) {
            return response()->json([
                'success' => false,
                'message' => 'Payment not found.',
            ], 404);
        }

        // Map Midtrans statuses (or accept plain strings for dummy flow)
        $status = match ($request->transaction_status ?? 'settlement') {
            'settlement', 'capture', 'success' => 'success',
            'pending'                           => 'pending',
            default                             => 'failed',
        };

        $payment->update(['status' => $status]);

        return response()->json([
            'success' => true,
            'message' => "Payment status updated to '{$status}'.",
            'data'    => $payment,
        ]);
    }

    /**
     * GET /api/payments
     *
     * List all payments. Supports query filters:
     *   ?status=success
     *   ?order_id=BOOK-001
     *   ?user_id=USER-42
     */
    public function index(Request $request)
    {
        $query = Payment::query();

        if ($request->filled('status'))   $query->where('status',   $request->status);
        if ($request->filled('order_id')) $query->where('order_id', $request->order_id);
        if ($request->filled('user_id'))  $query->where('user_id',  $request->user_id);

        $payments = $query->latest()->get();

        return response()->json([
            'success' => true,
            'count'   => $payments->count(),
            'data'    => $payments,
        ]);
    }

    /**
     * GET /api/payments/{id}
     *
     * Get a single payment by its primary key or order_id.
     */
    public function show(string $id)
    {
        // Try by PK first, then by order_id
        $payment = Payment::find($id) ?? Payment::where('order_id', $id)->first();

        if (! $payment) {
            return response()->json([
                'success' => false,
                'message' => 'Payment not found.',
            ], 404);
        }

        return response()->json(['success' => true, 'data' => $payment]);
    }

    /**
     * POST /api/payments/{id}/refund
     *
     * Refund a successful payment (dummy).
     */
    public function refund(string $id)
    {
        $payment = Payment::find($id) ?? Payment::where('order_id', $id)->first();

        if (! $payment) {
            return response()->json(['success' => false, 'message' => 'Payment not found.'], 404);
        }

        if ($payment->status !== 'success') {
            return response()->json([
                'success' => false,
                'message' => "Cannot refund a payment with status: {$payment->status}.",
            ], 400);
        }

        $payment->update(['status' => 'refunded']);

        return response()->json([
            'success' => true,
            'message' => 'Refund processed successfully (simulated).',
            'data'    => $payment,
        ]);
    }

    /**
     * GET /api/payments/health
     *
     * Health check for API Gateway / Docker healthcheck.
     */
    public function health()
    {
        return response()->json([
            'service'   => 'payment-service',
            'status'    => 'UP',
            'timestamp' => now()->toISOString(),
        ]);
    }
}
