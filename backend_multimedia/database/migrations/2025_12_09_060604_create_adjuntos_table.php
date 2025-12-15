<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('adjuntos', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->enum('tipo_recurso', ['IMAGEN', 'DOCUMENTO', 'ENLACE', 'OTRO']);
            $table->string('url', 500);
            $table->string('nombre_archivo', 255)->nullable();
            $table->enum('contexto', ['SOLICITUD', 'ENTREGA', 'REVISION']);
            $table->uuid('id_padre')->comment('ID de Tarea, Entrega o Revision, según el contexto');
            $table->uuid('subido_por');
            $table->timestamp('subido_en')->useCurrent();
            
            $table->foreign('subido_por')->references('id')->on('users');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('adjuntos');
    }
};
