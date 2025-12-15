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
        Schema::create('miembros_proyecto', function (Blueprint $table) {
            $table->uuid('id')->primary()->comment('UUID v4');
            $table->uuid('proyecto_id');
            $table->uuid('usuario_id');
            $table->enum('rol', ['ORGANIZADOR', 'EJECUTOR', 'REVISOR', 'SOLICITANTE', 'QA']);
            
            $table->foreign('proyecto_id')->references('id')->on('proyectos')->onDelete('cascade');
            $table->foreign('usuario_id')->references('id')->on('users')->onDelete('cascade');
            $table->unique(['proyecto_id', 'usuario_id', 'rol'], 'uk_miembro_proyecto');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('miembros_proyecto');
    }
};
