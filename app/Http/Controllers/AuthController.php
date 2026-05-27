<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    // POST /api/auth/register
    public function register(Request $request)
    {
        $request->validate([
            'name'     => 'required|string',
            'email'    => 'required|email|unique:users',
            'password' => 'required|min:6',
        ]);

        $user  = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
        ]);

        $token = $user->createToken('token')->plainTextToken;

        return response()->json([
            'message' => 'Register berhasil',
            'token'   => $token,
            'user'    => $user,
        ], 201);
    }

    // POST /api/auth/login
    public function login(Request $request)
    {
        $email    = $request->input('email');
        $password = $request->input('password');

        if (! $email || ! $password) {
            return response()->json(['message' => 'Email dan password wajib diisi'], 422);
        }

        $user = User::query()->where('email', $email)->first();

        if (! $user) {
            return response()->json(['message' => 'Email tidak ditemukan'], 401);
        }

        if (! Hash::check($password, $user->password)) {
            return response()->json(['message' => 'Password salah'], 401);
        }

        $token = $user->createToken('token')->plainTextToken;

        return response()->json([
            'message' => 'Login berhasil',
            'token'   => $token,
            'user'    => $user,
        ]);
    }

    // GET /api/auth/me  (butuh token)
    public function me(Request $request)
    {
        return response()->json($request->user());
    }
}
