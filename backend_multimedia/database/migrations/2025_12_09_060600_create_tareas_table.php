<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('tareas', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('proyecto_id');
            $table->uuid('solicitante_id')->comment('Cualquier usuario del proyecto');
            $table->uuid('ejecutor_id')->nullable()->comment('Asignado por el Organizador');
            $table->uuid('qa_id')->nullable()->comment('Asignado por el Organizador para revisión');
            
            $table->string('titulo', 255);
            $table->text('descripcion_enriquecida')->nullable();
            $table->enum('prioridad', ['BAJA', 'MEDIA', 'ALTA', 'CRÍTICA'])->default('MEDIA');
            $table->timestamp('fecha_limite')->nullable();
            $table->enum('estado', [
                'TAREA_CREADA',
                'TAREA_ASIGNADA',
                'TAREA_EN_PROGRESO',
                'TAREA_TERMINADA_PENDIENTE_QA',
                'TAREA_EN_REVISION',
                'TAREA_CAMBIOS_SOLICITADOS',
                'TAREA_COMPLETADA'
            ])->default('TAREA_CREADA');
            $table->timestamp('completado_en')->nullable();
            
            $table->foreign('proyecto_id')->references('id')->on('proyectos')->onDelete('cascade');
            $table->foreign('solicitante_id')->references('id')->on('users');
            $table->foreign('ejecutor_id')->references('id')->on('users');
            $table->foreign('qa_id')->references('id')->on('users');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tareas');
    }
};
