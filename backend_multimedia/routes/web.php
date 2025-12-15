<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;

Route::get('/', function () {
    return view('welcome');
});

// Ruta para servir archivos de storage
Route::get('/storage/adjuntos/{filename}', function ($filename) {
    $path = storage_path('app/public/adjuntos/' . $filename);
    
    if (!file_exists($path)) {
        abort(404);
    }

    $file = file_get_contents($path);
    $type = mime_content_type($path);

    return response($file, 200)->header('Content-Type', $type);
})->where('filename', '.*');
