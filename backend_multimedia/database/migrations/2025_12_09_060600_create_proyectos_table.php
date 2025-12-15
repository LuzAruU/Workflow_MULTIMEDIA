<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('proyectos', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('nombre', 255);
            $table->text('descripcion')->nullable();
            $table->enum('estado', ['ABIERTO', 'EN PROGRESO', 'CERRADO', 'CANCELADO'])->default('ABIERTO');
            $table->timestamp('creado_en')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('proyectos');
    }
};
