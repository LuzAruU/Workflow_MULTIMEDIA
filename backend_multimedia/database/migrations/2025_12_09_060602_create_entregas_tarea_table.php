<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('entregas_tarea', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tarea_id');
            $table->integer('numero_version')->comment('Soporte para el bucle de corrección');
            $table->text('resumen')->nullable();
            $table->text('metodologia')->nullable();
            $table->timestamp('entregado_en')->useCurrent();
            
            $table->foreign('tarea_id')->references('id')->on('tareas')->onDelete('cascade');
            $table->unique(['tarea_id', 'numero_version'], 'uk_entrega_version');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('entregas_tarea');
    }
};
