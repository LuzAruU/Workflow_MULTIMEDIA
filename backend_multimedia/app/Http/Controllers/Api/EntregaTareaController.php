<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\EntregaTarea;
use App\Models\RevisionQA;
use App\Models\Tarea;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class EntregaTareaController extends Controller
{
    /**
     * Obtener todas las entregas de una tarea
     */
    public function index($tareaId)
    {
        try {
            $entregas = EntregaTarea::where('tarea_id', $tareaId)
                ->with(['revision.revisor', 'adjuntos'])
                ->orderBy('numero_version', 'desc')
                ->get()
                ->map(function ($entrega) {
                    return [
                        'id' => $entrega->id,
                        'tarea_id' => $entrega->tarea_id,
                        'numero_version' => $entrega->numero_version,
                        'resumen' => $entrega->resumen,
                        'metodologia' => $entrega->metodologia,
                        'entregado_en' => $entrega->entregado_en,
                        'adjuntos' => $entrega->adjuntos,
                        'revision' => $entrega->revision ? [
                            'id' => $entrega->revision->id,
                            'veredicto' => $entrega->revision->veredicto,
                            'texto_retroalimentacion' => $entrega->revision->texto_retroalimentacion,
                            'revisado_en' => $entrega->revision->revisado_en,
                            'revisor' => [
                                'id' => $entrega->revision->revisor->id,
                                'nombre' => $entrega->revision->revisor->nombre_completo,
                                'avatar' => $entrega->revision->revisor->url_avatar
                            ]
                        ] : null
                    ];
                });

            return response()->json($entregas, 200);
        } catch (\Exception $e) {
            Log::error('Error al obtener entregas:', ['error' => $e->getMessage()]);
            return response()->json([
                'message' => 'Error al obtener entregas',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Crear una nueva entrega
     */
    public function store(Request $request)
    {
        try {
            Log::info('=== CREAR ENTREGA ===');
            Log::info('Datos recibidos:', $request->all());

            $validator = Validator::make($request->all(), [
                'tarea_id' => 'required|exists:tareas,id',
                'resumen' => 'required|string',
                'metodologia' => 'nullable|string'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Error de validación',
                    'errors' => $validator->errors()
                ], 422);
            }

            DB::beginTransaction();

            $entrega = EntregaTarea::create([
                'tarea_id' => $request->tarea_id,
                'resumen' => $request->resumen,
                'metodologia' => $request->metodologia
            ]);

            // Cambiar estado de la tarea a PENDIENTE_QA
            $tarea = Tarea::find($request->tarea_id);
            $tarea->update(['estado' => 'TAREA_TERMINADA_PENDIENTE_QA']);

            DB::commit();
            Log::info('Entrega creada exitosamente:', ['id' => $entrega->id, 'version' => $entrega->numero_version]);

            return response()->json([
                'message' => 'Entrega creada exitosamente',
                'entrega' => [
                    'id' => $entrega->id,
                    'tarea_id' => $entrega->tarea_id,
                    'numero_version' => $entrega->numero_version,
                    'resumen' => $entrega->resumen,
                    'metodologia' => $entrega->metodologia,
                    'entregado_en' => $entrega->entregado_en
                ]
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error al crear entrega:', ['error' => $e->getMessage()]);
            return response()->json([
                'message' => 'Error al crear la entrega',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Crear una revisión QA para una entrega
     */
    public function crearRevision(Request $request, $entregaId)
    {
        try {
            Log::info('=== CREAR REVISIÓN QA ===');
            Log::info('Entrega ID:', ['id' => $entregaId]);
            Log::info('Datos recibidos:', $request->all());

            $validator = Validator::make($request->all(), [
                'veredicto' => 'required|in:APROBAR,SOLICITAR_CAMBIOS',
                'texto_retroalimentacion' => 'nullable|string'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Error de validación',
                    'errors' => $validator->errors()
                ], 422);
            }

            $entrega = EntregaTarea::find($entregaId);
            if (!$entrega) {
                return response()->json(['message' => 'Entrega no encontrada'], 404);
            }

            $user = $request->user();

            DB::beginTransaction();

            $revision = RevisionQA::create([
                'entrega_id' => $entregaId,
                'revisor_id' => $user->id,
                'veredicto' => $request->veredicto,
                'texto_retroalimentacion' => $request->texto_retroalimentacion
            ]);

            // Actualizar estado de la tarea según el veredicto
            $tarea = $entrega->tarea;
            if ($request->veredicto === 'APROBAR') {
                $tarea->update([
                    'estado' => 'TAREA_COMPLETADA',
                    'completado_en' => now()
                ]);
            } else {
                $tarea->update(['estado' => 'TAREA_CAMBIOS_SOLICITADOS']);
            }

            DB::commit();
            Log::info('Revisión creada exitosamente:', ['id' => $revision->id, 'veredicto' => $revision->veredicto]);

            $revision->load('revisor');

            return response()->json([
                'message' => 'Revisión creada exitosamente',
                'revision' => [
                    'id' => $revision->id,
                    'entrega_id' => $revision->entrega_id,
                    'veredicto' => $revision->veredicto,
                    'texto_retroalimentacion' => $revision->texto_retroalimentacion,
                    'revisado_en' => $revision->revisado_en,
                    'revisor' => [
                        'id' => $revision->revisor->id,
                        'nombre' => $revision->revisor->nombre_completo,
                        'avatar' => $revision->revisor->url_avatar
                    ]
                ]
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error al crear revisión:', ['error' => $e->getMessage()]);
            return response()->json([
                'message' => 'Error al crear la revisión',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
