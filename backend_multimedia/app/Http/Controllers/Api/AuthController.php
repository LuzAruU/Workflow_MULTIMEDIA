<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\AuthToken;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    /**
     * Login
     */
    public function login(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'email' => 'required|email',
                'password' => 'required|string'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Datos de validación incorrectos',
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = User::where('email', $request->email)->first();

            if (!$user || !Hash::check($request->password, $user->hash_contrasena)) {
                return response()->json([
                    'message' => 'Credenciales incorrectas'
                ], 401);
            }

            // Crear token
            $token = $user->createAuthToken();

            return response()->json([
                'message' => 'Login exitoso',
                'user' => [
                    'id' => $user->id,
                    'codigo' => 'USR' . strtoupper(substr($user->id, 0, 6)),
                    'nombre' => $user->nombre_completo,
                    'email' => $user->email,
                    'avatar' => $user->url_avatar
                ],
                'token' => $token,
                'expires_at' => now()->addDays(30)->toDateTimeString()
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error en el login',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    
    /**
     * Logout
     */
    public function logout(Request $request)
    {
        try {
            $token = $request->bearerToken();
            
            if ($token) {
                AuthToken::where('token', $token)->delete();
            }

            return response()->json([
                'message' => 'Logout exitoso'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error en el logout',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get authenticated user
     */
    public function me(Request $request)
    {
        try {
            $user = $request->user();

            return response()->json([
                'id' => $user->id,
                'codigo' => 'USR' . strtoupper(substr($user->id, 0, 6)),
                'nombre' => $user->nombre_completo,
                'email' => $user->email,
                'avatar' => $user->url_avatar
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al obtener usuario',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
