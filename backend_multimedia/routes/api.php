<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ProyectoController;
use App\Http\Controllers\Api\UsuarioController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\TareaController;
use App\Http\Controllers\Api\AdjuntoController;
use App\Http\Controllers\Api\EntregaTareaController;

// Rutas públicas
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

Route::get('/test', function () {
    return response()->json([
        'message' => 'API funcionando correctamente',
        'timestamp' => now()
    ]);
});

// Rutas protegidas
Route::middleware('auth.token')->group(function () {
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    
    // Proyectos
    Route::get('/proyectos', [ProyectoController::class, 'index']);
    Route::get('/proyectos/{id}', [ProyectoController::class, 'show']);
    Route::post('/proyectos', [ProyectoController::class, 'store']);
    Route::put('/proyectos/{id}', [ProyectoController::class, 'update']);
    Route::delete('/proyectos/{id}', [ProyectoController::class, 'destroy']);
    
    // Usuarios
    Route::get('/usuarios', [UsuarioController::class, 'index']);
    Route::get('/usuarios/{id}', [UsuarioController::class, 'show']);
    
    // Tareas
    Route::get('/proyectos/{proyectoId}/tareas', [TareaController::class, 'index']);
    Route::post('/tareas', [TareaController::class, 'store']);
    Route::put('/tareas/{id}', [TareaController::class, 'update']);
    Route::patch('/tareas/{id}/estado', [TareaController::class, 'cambiarEstado']);
    Route::delete('/tareas/{id}', [TareaController::class, 'destroy']);
    
    // Adjuntos
    Route::get('/tareas/{tareaId}/adjuntos', [AdjuntoController::class, 'index']);
    Route::post('/adjuntos', [AdjuntoController::class, 'store']);
    Route::delete('/adjuntos/{id}', [AdjuntoController::class, 'destroy']);
    
    // Entregas de Tareas
    Route::get('/tareas/{tareaId}/entregas', [EntregaTareaController::class, 'index']);
    Route::post('/entregas', [EntregaTareaController::class, 'store']);
    Route::post('/entregas/{entregaId}/revision', [EntregaTareaController::class, 'crearRevision']);
});
