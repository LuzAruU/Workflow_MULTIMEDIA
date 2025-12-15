<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class UsuarioController extends Controller
{
    public function index()
    {
        try {
            $usuarios = User::select('id', 'nombre_completo', 'email', 'url_avatar')
                ->get()
                ->map(function ($usuario) {
                    return [
                        'id' => $usuario->id,
                        'nombre' => $usuario->nombre_completo,
                        'email' => $usuario->email,
                        'avatar' => $usuario->url_avatar
                    ];
                });

            return response()->json($usuarios, 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al obtener usuarios',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $usuario = User::find($id);

            if (!$usuario) {
                return response()->json([
                    'message' => 'Usuario no encontrado'
                ], 404);
            }

            return response()->json([
                'id' => $usuario->id,
                'nombre' => $usuario->nombre_completo,
                'email' => $usuario->email,
                'avatar' => $usuario->url_avatar
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al obtener el usuario',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function usuarioActual(Request $request)
    {
        try {
            $email = $request->query('email');
            
            if ($email) {
                $usuario = User::where('email', $email)->first();
            } else {
                // Por defecto, devolver el primer usuario
                $usuario = User::first();
            }

            if (!$usuario) {
                return response()->json([
                    'message' => 'No hay usuarios en el sistema'
                ], 404);
            }

            return response()->json([
                'id' => $usuario->id,
                'codigo' => 'USR' . strtoupper(substr($usuario->id, 0, 6)),
                'nombre' => $usuario->nombre_completo,
                'email' => $usuario->email,
                'avatar' => $usuario->url_avatar
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al obtener el usuario actual',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function buscarPorEmail($email)
    {
        try {
            $usuario = User::where('email', 'like', "%{$email}%")
                ->first();

            if (!$usuario) {
                return response()->json([
                    'message' => 'Usuario no encontrado'
                ], 404);
            }

            return response()->json([
                'id' => $usuario->id,
                'nombre' => $usuario->nombre_completo,
                'email' => $usuario->email,
                'avatar' => $usuario->url_avatar
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al buscar el usuario',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
