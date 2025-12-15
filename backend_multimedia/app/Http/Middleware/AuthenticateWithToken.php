<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\AuthToken;

class AuthenticateWithToken
{
    public function handle(Request $request, Closure $next)
    {
        $token = $request->bearerToken();
        
        if (!$token) {
            return response()->json([
                'message' => 'Token no proporcionado'
            ], 401);
        }
        
        $authToken = AuthToken::where('token', $token)
            ->where('expires_at', '>', now())
            ->with('user')
            ->first();
        
        if (!$authToken) {
            return response()->json([
                'message' => 'Token inválido o expirado'
            ], 401);
        }
        
        // Establecer el usuario autenticado
        $request->setUserResolver(function () use ($authToken) {
            return $authToken->user;
        });
        
        return $next($request);
    }
}
