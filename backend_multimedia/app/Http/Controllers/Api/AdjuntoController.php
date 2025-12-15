<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Adjunto;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class AdjuntoController extends Controller
{
    public function index($tareaId)
    {
        try {
            $adjuntos = Adjunto::where('id_padre', $tareaId)
                ->with('usuario')
                ->orderBy('subido_en', 'desc')
                ->get()
                ->map(function ($adjunto) {
                    return [
                        'id' => $adjunto->id,
                        'tipo_recurso' => $adjunto->tipo_recurso,
                        'url' => $adjunto->url,
                        'nombre_archivo' => $adjunto->nombre_archivo,
                        'contexto' => $adjunto->contexto,
                        'subido_por' => [
                            'id' => $adjunto->usuario->id,
                            'nombre' => $adjunto->usuario->nombre_completo,
                            'avatar' => $adjunto->usuario->url_avatar
                        ],
                        'subido_en' => $adjunto->subido_en
                    ];
                });

            return response()->json($adjuntos, 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al obtener adjuntos',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            Log::info('=== SUBIR ADJUNTO ===');
            Log::info('Datos recibidos:', $request->all());
            Log::info('Archivos:', ['tiene_archivo' => $request->hasFile('archivo')]);

            $validator = Validator::make($request->all(), [
                'id_padre' => 'required|string', // Ya no validamos exists, puede ser tarea o entrega
                'tipo_recurso' => 'required|in:IMAGEN,DOCUMENTO,ENLACE,OTRO',
                'contexto' => 'required|in:SOLICITUD,ENTREGA,REVISION',
                'archivo' => 'required_without:url|file|max:10240',
                'url' => 'required_without:archivo|url',
                'nombre_archivo' => 'nullable|string|max:255'
            ]);

            if ($validator->fails()) {
                Log::error('Error de validación:', $validator->errors()->toArray());
                return response()->json([
                    'message' => 'Error de validación',
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = $request->user();
            $url = $request->url;
            $nombreArchivo = $request->nombre_archivo;

            // Si es un archivo subido, guardarlo
            if ($request->hasFile('archivo')) {
                $archivo = $request->file('archivo');
                $nombreArchivo = $nombreArchivo ?? $archivo->getClientOriginalName();
                
                // Guardar en storage/app/public/adjuntos
                $path = $archivo->store('adjuntos', 'public');
                // URL relativa sin usar url() helper
                $url = '/storage/' . $path;
                
                Log::info('Archivo guardado:', [
                    'path' => $path,
                    'url' => $url,
                    'nombre' => $nombreArchivo
                ]);
            }

            $adjunto = Adjunto::create([
                'tipo_recurso' => $request->tipo_recurso,
                'url' => $url,
                'nombre_archivo' => $nombreArchivo,
                'contexto' => $request->contexto,
                'id_padre' => $request->id_padre,
                'subido_por' => $user->id
            ]);

            Log::info('Adjunto creado exitosamente:', [
                'id' => $adjunto->id,
                'id_padre' => $adjunto->id_padre,
                'contexto' => $adjunto->contexto
            ]);

            $adjunto->load('usuario');

            return response()->json([
                'message' => 'Adjunto subido exitosamente',
                'adjunto' => [
                    'id' => $adjunto->id,
                    'tipo_recurso' => $adjunto->tipo_recurso,
                    'url' => $adjunto->url,
                    'nombre_archivo' => $adjunto->nombre_archivo,
                    'contexto' => $adjunto->contexto,
                    'id_padre' => $adjunto->id_padre,
                    'subido_por' => [
                        'id' => $adjunto->usuario->id,
                        'nombre' => $adjunto->usuario->nombre_completo,
                        'avatar' => $adjunto->usuario->url_avatar
                    ],
                    'subido_en' => $adjunto->subido_en
                ]
            ], 201);

        } catch (\Exception $e) {
            Log::error('Error al subir adjunto:', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'message' => 'Error al subir el adjunto',
                'error' => $e->getMessage(),
                'details' => $e->getTraceAsString()
            ], 500);
        }
    }

    
}
