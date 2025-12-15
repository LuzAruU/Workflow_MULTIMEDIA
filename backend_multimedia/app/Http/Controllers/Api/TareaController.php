<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tarea;
use App\Models\Proyecto;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class TareaController extends Controller
{
    public function index($proyectoId)
    {
        try {
            $tareas = Tarea::where('proyecto_id', $proyectoId)
                ->with(['ejecutor', 'qa'])
                ->get()
                ->map(function ($tarea) {
                    return [
                        'id' => $tarea->id,
                        'proyecto_id' => $tarea->proyecto_id,
                        'titulo' => $tarea->titulo,
                        'descripcion' => $tarea->descripcion_enriquecida,
                        'prioridad' => $tarea->prioridad,
                        'estado' => $tarea->estado,
                        'fecha_limite' => $tarea->fecha_limite,
                        'completado_en' => $tarea->completado_en,
                        'solicitante' => $tarea->solicitante_id,
                        'ejecutor' => $tarea->ejecutor ? [
                            'id' => $tarea->ejecutor->id,
                            'nombre' => $tarea->ejecutor->nombre_completo,
                            'avatar' => $tarea->ejecutor->url_avatar
                        ] : null,
                        'qa' => $tarea->qa ? [
                            'id' => $tarea->qa->id,
                            'nombre' => $tarea->qa->nombre_completo,
                            'avatar' => $tarea->qa->url_avatar
                        ] : null
                    ];
                });

            return response()->json($tareas, 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al obtener tareas',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            Log::info('=== CREAR TAREA ===');
            Log::info('Datos recibidos:', $request->all());

            $validator = Validator::make($request->all(), [
                'proyecto_id' => 'required|exists:proyectos,id',
                'titulo' => 'required|string|max:255',
                'descripcion' => 'nullable|string',
                'prioridad' => 'required|in:BAJA,MEDIA,ALTA,CRÍTICA',
                'fecha_limite' => 'nullable|date',
                'ejecutor_id' => 'nullable|exists:users,id',
                'qa_id' => 'nullable|exists:users,id'
            ]);

            if ($validator->fails()) {
                Log::error('Error de validación:', $validator->errors()->toArray());
                return response()->json([
                    'message' => 'Error de validación',
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = $request->user();

            $tarea = Tarea::create([
                'proyecto_id' => $request->proyecto_id,
                'solicitante_id' => $user->id,
                'ejecutor_id' => $request->ejecutor_id,
                'qa_id' => $request->qa_id,
                'titulo' => $request->titulo,
                'descripcion_enriquecida' => $request->descripcion,
                'prioridad' => $request->prioridad,
                'fecha_limite' => $request->fecha_limite,
                'estado' => 'TAREA_CREADA'
            ]);

            Log::info('Tarea creada exitosamente:', ['id' => $tarea->id]);

            $tarea->load(['ejecutor', 'qa']);

            return response()->json([
                'message' => 'Tarea creada exitosamente',
                'tarea' => [
                    'id' => $tarea->id,
                    'proyecto_id' => $tarea->proyecto_id,
                    'titulo' => $tarea->titulo,
                    'descripcion' => $tarea->descripcion_enriquecida,
                    'prioridad' => $tarea->prioridad,
                    'estado' => $tarea->estado,
                    'fecha_limite' => $tarea->fecha_limite,
                    'solicitante' => $tarea->solicitante_id,
                    'ejecutor' => $tarea->ejecutor ? [
                        'id' => $tarea->ejecutor->id,
                        'nombre' => $tarea->ejecutor->nombre_completo,
                        'avatar' => $tarea->ejecutor->url_avatar
                    ] : null,
                    'qa' => $tarea->qa ? [
                        'id' => $tarea->qa->id,
                        'nombre' => $tarea->qa->nombre_completo,
                        'avatar' => $tarea->qa->url_avatar
                    ] : null
                ]
            ], 201);

        } catch (\Exception $e) {
            Log::error('Error al crear tarea:', [
                'message' => $e->getMessage(),
                'line' => $e->getLine()
            ]);
            return response()->json([
                'message' => 'Error al crear la tarea',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $tarea = Tarea::find($id);

            if (!$tarea) {
                return response()->json([
                    'message' => 'Tarea no encontrada'
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'titulo' => 'sometimes|required|string|max:255',
                'descripcion' => 'nullable|string',
                'prioridad' => 'sometimes|in:BAJA,MEDIA,ALTA,CRÍTICA',
                'estado' => 'sometimes|in:TAREA_CREADA,TAREA_ASIGNADA,TAREA_EN_PROGRESO,TAREA_TERMINADA_PENDIENTE_QA,TAREA_EN_REVISION,TAREA_CAMBIOS_SOLICITADOS,TAREA_COMPLETADA',
                'fecha_limite' => 'nullable|date',
                'ejecutor_id' => 'nullable|exists:users,id',
                'qa_id' => 'nullable|exists:users,id'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Error de validación',
                    'errors' => $validator->errors()
                ], 422);
            }

            $tarea->update($request->only([
                'titulo',
                'descripcion_enriquecida',
                'prioridad',
                'estado',
                'fecha_limite',
                'ejecutor_id',
                'qa_id'
            ]));

            if ($request->estado === 'TAREA_COMPLETADA' && !$tarea->completado_en) {
                $tarea->update(['completado_en' => now()]);
            }

            $tarea->load(['solicitante', 'ejecutor', 'qa']);

            return response()->json([
                'message' => 'Tarea actualizada exitosamente',
                'tarea' => [
                    'id' => $tarea->id,
                    'titulo' => $tarea->titulo,
                    'descripcion' => $tarea->descripcion_enriquecida,
                    'prioridad' => $tarea->prioridad,
                    'estado' => $tarea->estado,
                    'fecha_limite' => $tarea->fecha_limite,
                    'completado_en' => $tarea->completado_en
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al actualizar la tarea',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $tarea = Tarea::find($id);

            if (!$tarea) {
                return response()->json([
                    'message' => 'Tarea no encontrada'
                ], 404);
            }

            $tarea->delete();

            return response()->json([
                'message' => 'Tarea eliminada exitosamente'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al eliminar la tarea',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function cambiarEstado(Request $request, $id)
    {
        try {
            $tarea = Tarea::find($id);

            if (!$tarea) {
                return response()->json([
                    'message' => 'Tarea no encontrada'
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'estado' => 'required|in:TAREA_CREADA,TAREA_ASIGNADA,TAREA_EN_PROGRESO,TAREA_TERMINADA_PENDIENTE_QA,TAREA_EN_REVISION,TAREA_CAMBIOS_SOLICITADOS,TAREA_COMPLETADA'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Error de validación',
                    'errors' => $validator->errors()
                ], 422);
            }

            $tarea->update(['estado' => $request->estado]);

            if ($request->estado === 'TAREA_COMPLETADA' && !$tarea->completado_en) {
                $tarea->update(['completado_en' => now()]);
            }

            return response()->json([
                'message' => 'Estado actualizado exitosamente',
                'tarea' => [
                    'id' => $tarea->id,
                    'estado' => $tarea->estado
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al cambiar estado',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtiene todos los adjuntos relacionados con una tarea
     * Incluye adjuntos de solicitud, entregas y revisiones
     */
    public function adjuntos(Request $request, $id)
    {
        try {
            $user = $request->user();
            
            \Log::info('=== INICIO BUSQUEDA ADJUNTOS ===');
            \Log::info('Task ID received:', $id);
            \Log::info('User ID:', $user ? $user->id : 'null');
            
            if (!$user) {
                return response()->json([
                    'message' => 'Usuario no autenticado'
                ], 401);
            }

            // Verificar que la tarea existe y el usuario tiene acceso
            $tarea = \App\Models\Tarea::with(['proyecto.miembros'])
                ->whereHas('proyecto.miembros', function ($query) use ($user) {
                    $query->where('usuario_id', $user->id);
                })
                ->find($id);

            \Log::info('Task found:', $tarea ? 'yes' : 'no');
            \Log::info('Task ID if found:', $tarea ? $tarea->id : 'null');

            if (!$tarea) {
                return response()->json([
                    'message' => 'Tarea no encontrada o no tienes acceso'
                ], 404);
            }

            // Obtener adjuntos de la tarea (solicitud)
            $adjuntosSolicitud = \App\Models\Adjunto::where('id_padre', $tarea->id)
                ->where('contexto', 'SOLICITUD')
                ->with('usuario')
                ->get();

            \Log::info('Adjuntos solicitud encontrados:', [
                'count' => $adjuntosSolicitud->count(),
                'ids' => $adjuntosSolicitud->pluck('id')->toArray(),
                'contextos' => $adjuntosSolicitud->pluck('contexto')->toArray()
            ]);

            // Obtener IDs de entregas de la tarea
            $entregaIds = \App\Models\EntregaTarea::where('tarea_id', $tarea->id)->pluck('id');

            \Log::info('Entrega IDs encontrados:', $entregaIds->toArray());

            // Obtener adjuntos de entregas
            $adjuntosEntregas = \App\Models\Adjunto::whereIn('id_padre', $entregaIds)
                ->where('contexto', 'ENTREGA')
                ->with('usuario')
                ->get();

            \Log::info('Adjuntos entregas encontrados:', [
                'count' => $adjuntosEntregas->count(),
                'ids' => $adjuntosEntregas->pluck('id')->toArray(),
                'contextos' => $adjuntosEntregas->pluck('contexto')->toArray(),
                'id_padres' => $adjuntosEntregas->pluck('id_padre')->toArray()
            ]);

            // Obtener IDs de revisiones de las entregas
            $revisionIds = \App\Models\RevisionQA::whereIn('entrega_id', $entregaIds)->pluck('id');

            \Log::info('Revision IDs encontrados:', $revisionIds->toArray());

            // Obtener adjuntos de revisiones
            $adjuntosRevisiones = \App\Models\Adjunto::whereIn('id_padre', $revisionIds)
                ->where('contexto', 'REVISION')
                ->with('usuario')
                ->get();

            \Log::info('Adjuntos revisiones encontrados:', [
                'count' => $adjuntosRevisiones->count(),
                'ids' => $adjuntosRevisiones->pluck('id')->toArray(),
                'contextos' => $adjuntosRevisiones->pluck('contexto')->toArray(),
                'id_padres' => $adjuntosRevisiones->pluck('id_padre')->toArray()
            ]);

            // Combinar todos los adjuntos
            $todosAdjuntos = $adjuntosSolicitud->concat($adjuntosEntregas)->concat($adjuntosRevisiones);

            \Log::info('Total adjuntos combinados:', [
                'count' => $todosAdjuntos->count(),
                'todos_ids' => $todosAdjuntos->pluck('id')->toArray(),
                'todos_contextos' => $todosAdjuntos->pluck('contexto')->toArray()
            ]);

            // Formatear respuesta
            $adjuntosFormateados = $todosAdjuntos->map(function ($adjunto) {
                return [
                    'id' => $adjunto->id,
                    'tipo_recurso' => $adjunto->tipo_recurso,
                    'url' => $adjunto->url,
                    'nombre_archivo' => $adjunto->nombre_archivo,
                    'contexto' => $adjunto->contexto,
                    'id_padre' => $adjunto->id_padre,
                    'subido_por' => [
                        'id' => $adjunto->usuario->id ?? null,
                        'nombre' => $adjunto->usuario->nombre_completo ?? 'Usuario desconocido'
                    ],
                    'subido_en' => $adjunto->subido_en
                ];
            });

            \Log::info('=== FIN BUSQUEDA ADJUNTOS ===');

            return response()->json($adjuntosFormateados, 200);

        } catch (\Exception $e) {
            \Log::error('Error en adjuntos:', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'message' => 'Error al obtener adjuntos',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
