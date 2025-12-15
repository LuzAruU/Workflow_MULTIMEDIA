<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('revisiones_qa', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('entrega_id')->comment('Revisión específica de una versión de entrega');
            $table->uuid('revisor_id');
            $table->enum('veredicto', ['APROBAR', 'SOLICITAR_CAMBIOS']);
            $table->text('texto_retroalimentacion')->nullable()->comment('Obligatorio si se SOLICITAN_CAMBIOS');
            $table->timestamp('revisado_en')->useCurrent();
            
            $table->foreign('entrega_id')->references('id')->on('entregas_tarea')->onDelete('cascade');
            $table->foreign('revisor_id')->references('id')->on('users');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('revisiones_qa');
    }
};
