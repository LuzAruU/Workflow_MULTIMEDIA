<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Proyecto;
use App\Models\MiembroProyecto;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ProyectoController extends Controller
{
    /**
     * Lista todos los proyectos del usuario autenticado
     */
    public function index(Request $request)
    {
        try {
            $user = $request->user();
            
            if (!$user) {
                return response()->json([
                    'message' => 'Usuario no autenticado'
                ], 401);
            }

            // Obtener solo los proyectos donde el usuario es miembro
            $proyectos = Proyecto::with(['miembros.usuario'])
                ->whereHas('miembros', function ($query) use ($user) {
                    $query->where('usuario_id', $user->id);
                })
                ->orderBy('creado_en', 'desc')
                ->get()
                ->map(function ($proyecto) {
                    return [
                        'id' => $proyecto->id,
                        'nombre' => $proyecto->nombre,
                        'descripcion' => $proyecto->descripcion,
                        'estado' => $proyecto->estado,
                        'creado_en' => $proyecto->creado_en,
                        'miembros' => $proyecto->miembros->map(function ($miembro) {
                            return [
                                'id' => $miembro->id,
                                'usuarioId' => $miembro->usuario_id,
                                'rol' => $miembro->rol,
                                'nombre' => $miembro->usuario->nombre_completo ?? 'Usuario',
                                'email' => $miembro->usuario->email ?? '',
                                'avatar' => $miembro->usuario->url_avatar ?? null,
                            ];
                        })
                    ];
                });

            return response()->json($proyectos, 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al obtener proyectos',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtiene un proyecto específico (solo si el usuario es miembro)
     */
    public function show(Request $request, $id)
    {
        try {
            $user = $request->user();
            
            if (!$user) {
                return response()->json([
                    'message' => 'Usuario no autenticado'
                ], 401);
            }

            // Verificar que el usuario sea miembro del proyecto
            $proyecto = Proyecto::with(['miembros.usuario', 'tareas'])
                ->whereHas('miembros', function ($query) use ($user) {
                    $query->where('usuario_id', $user->id);
                })
                ->find($id);

            if (!$proyecto) {
                return response()->json([
                    'message' => 'Proyecto no encontrado o no tienes acceso'
                ], 404);
            }

            return response()->json([
                'id' => $proyecto->id,
                'nombre' => $proyecto->nombre,
                'descripcion' => $proyecto->descripcion,
                'estado' => $proyecto->estado,
                'creado_en' => $proyecto->creado_en,
                'miembros' => $proyecto->miembros->map(function ($miembro) {
                    return [
                        'id' => $miembro->id,
                        'usuarioId' => $miembro->usuario_id,
                        'rol' => $miembro->rol,
                        'nombre' => $miembro->usuario->nombre_completo ?? 'Usuario',
                        'email' => $miembro->usuario->email ?? '',
                        'avatar' => $miembro->usuario->url_avatar ?? null,
                    ];
                }),
                'tareas' => $proyecto->tareas
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al obtener el proyecto',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Crea un nuevo proyecto
     */
    public function store(Request $request)
    {
        try {
            Log::info('=== INICIO CREAR PROYECTO ===');
            Log::info('Datos recibidos:', $request->all());

            $validator = Validator::make($request->all(), [
                'nombre' => 'required|string|max:255',
                'descripcion' => 'nullable|string',
                'estado' => 'nullable|in:ABIERTO,EN PROGRESO,CERRADO,CANCELADO',
                'miembros' => 'nullable|array',
                'miembros.*.usuarioId' => 'required_with:miembros|string',
                'miembros.*.rol' => 'required_with:miembros|in:ORGANIZADOR,EJECUTOR,REVISOR,SOLICITANTE,QA'
            ]);

            if ($validator->fails()) {
                Log::error('Error de validación:', $validator->errors()->toArray());
                return response()->json([
                    'message' => 'Error de validación',
                    'errors' => $validator->errors()
                ], 422);
            }

            DB::beginTransaction();

            $proyecto = Proyecto::create([
                'nombre' => $request->nombre,
                'descripcion' => $request->descripcion ?? '',
                'estado' => $request->estado ?? 'ABIERTO'
            ]);

            Log::info('Proyecto creado:', ['id' => $proyecto->id, 'nombre' => $proyecto->nombre]);

            // Agregar miembros al proyecto
            if ($request->has('miembros') && is_array($request->miembros)) {
                Log::info('Procesando miembros:', ['cantidad' => count($request->miembros)]);
                
                foreach ($request->miembros as $index => $miembroData) {
                    Log::info("Procesando miembro {$index}:", $miembroData);
                    
                    // Verificar si el usuario existe
                    $usuario = \App\Models\User::find($miembroData['usuarioId']);
                    
                    if ($usuario) {
                        Log::info("Usuario encontrado:", [
                            'id' => $usuario->id,
                            'nombre' => $usuario->nombre_completo
                        ]);
                        
                        $miembroCreado = MiembroProyecto::create([
                            'proyecto_id' => $proyecto->id,
                            'usuario_id' => $miembroData['usuarioId'],
                            'rol' => $miembroData['rol']
                        ]);
                        
                        Log::info("Miembro creado exitosamente:", [
                            'id' => $miembroCreado->id,
                            'proyecto_id' => $miembroCreado->proyecto_id,
                            'usuario_id' => $miembroCreado->usuario_id,
                            'rol' => $miembroCreado->rol
                        ]);
                    } else {
                        Log::warning("Usuario no encontrado: {$miembroData['usuarioId']}");
                    }
                }
            } else {
                Log::warning('No se recibieron miembros o no es un array');
            }

            DB::commit();
            Log::info('Transacción completada exitosamente');

            $proyecto->load(['miembros.usuario']);
            
            Log::info('Proyecto con miembros cargado:', [
                'proyecto_id' => $proyecto->id,
                'cantidad_miembros' => $proyecto->miembros->count()
            ]);

            return response()->json([
                'message' => 'Proyecto creado exitosamente',
                'proyecto' => [
                    'id' => $proyecto->id,
                    'nombre' => $proyecto->nombre,
                    'descripcion' => $proyecto->descripcion,
                    'estado' => $proyecto->estado,
                    'creado_en' => $proyecto->creado_en,
                    'miembros' => $proyecto->miembros->map(function ($miembro) {
                        return [
                            'id' => $miembro->id,
                            'usuarioId' => $miembro->usuario_id,
                            'rol' => $miembro->rol,
                            'nombre' => $miembro->usuario->nombre_completo ?? 'Usuario',
                            'email' => $miembro->usuario->email ?? '',
                            'avatar' => $miembro->usuario->url_avatar ?? null,
                        ];
                    })
                ]
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error al crear proyecto:', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'message' => 'Error al crear el proyecto',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Actualiza un proyecto existente
     */
    public function update(Request $request, $id)
    {
        try {
            Log::info('=== ACTUALIZAR PROYECTO ===');
            Log::info('ID del proyecto:', ['id' => $id]);
            Log::info('Datos recibidos:', $request->all());

            $proyecto = Proyecto::find($id);

            if (!$proyecto) {
                return response()->json([
                    'message' => 'Proyecto no encontrado'
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'nombre' => 'sometimes|required|string|max:255',
                'descripcion' => 'nullable|string',
                'estado' => 'in:ABIERTO,EN PROGRESO,CERRADO,CANCELADO',
                'miembros' => 'nullable|array',
                'miembros.*.usuarioId' => 'required_with:miembros|string',
                'miembros.*.rol' => 'required_with:miembros|in:ORGANIZADOR,EJECUTOR,REVISOR,SOLICITANTE,QA'
            ]);

            if ($validator->fails()) {
                Log::error('Error de validación:', $validator->errors()->toArray());
                return response()->json([
                    'message' => 'Error de validación',
                    'errors' => $validator->errors()
                ], 422);
            }

            DB::beginTransaction();

            // Actualizar información básica del proyecto
            if ($request->has('nombre') || $request->has('descripcion') || $request->has('estado')) {
                $proyecto->update($request->only(['nombre', 'descripcion', 'estado']));
                Log::info('Información básica actualizada');
            }

            // Actualizar miembros si se envían
            if ($request->has('miembros')) {
                Log::info('Actualizando miembros:', ['cantidad' => count($request->miembros)]);
                
                // Eliminar miembros actuales
                MiembroProyecto::where('proyecto_id', $proyecto->id)->delete();
                Log::info('Miembros antiguos eliminados');
                
                // Agregar nuevos miembros
                foreach ($request->miembros as $index => $miembroData) {
                    Log::info("Procesando miembro {$index}:", $miembroData);
                    
                    $usuario = \App\Models\User::find($miembroData['usuarioId']);
                    
                    if ($usuario) {
                        $miembroCreado = MiembroProyecto::create([
                            'proyecto_id' => $proyecto->id,
                            'usuario_id' => $miembroData['usuarioId'],
                            'rol' => $miembroData['rol']
                        ]);
                        
                        Log::info("Miembro agregado:", [
                            'id' => $miembroCreado->id,
                            'nombre' => $usuario->nombre_completo,
                            'rol' => $miembroCreado->rol
                        ]);
                    } else {
                        Log::warning("Usuario no encontrado: {$miembroData['usuarioId']}");
                    }
                }
            }

            DB::commit();
            Log::info('Proyecto actualizado exitosamente');

            $proyecto->load(['miembros.usuario']);

            return response()->json([
                'message' => 'Proyecto actualizado exitosamente',
                'proyecto' => [
                    'id' => $proyecto->id,
                    'nombre' => $proyecto->nombre,
                    'descripcion' => $proyecto->descripcion,
                    'estado' => $proyecto->estado,
                    'creado_en' => $proyecto->creado_en,
                    'miembros' => $proyecto->miembros->map(function ($miembro) {
                        return [
                            'id' => $miembro->id,
                            'usuarioId' => $miembro->usuario_id,
                            'rol' => $miembro->rol,
                            'nombre' => $miembro->usuario->nombre_completo ?? 'Usuario',
                            'email' => $miembro->usuario->email ?? '',
                            'avatar' => $miembro->usuario->url_avatar ?? null,
                        ];
                    })
                ]
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error al actualizar proyecto:', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);
            return response()->json([
                'message' => 'Error al actualizar el proyecto',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Elimina un proyecto
     */
    public function destroy($id)
    {
        try {
            $proyecto = Proyecto::find($id);

            if (!$proyecto) {
                return response()->json([
                    'message' => 'Proyecto no encontrado'
                ], 404);
            }

            $proyecto->delete();

            return response()->json([
                'message' => 'Proyecto eliminado exitosamente'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al eliminar el proyecto',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
