<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Tarea extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';
    protected $table = 'tareas';
    public $timestamps = false;

    protected $fillable = [
        'proyecto_id',
        'solicitante_id',
        'ejecutor_id',
        'qa_id',
        'titulo',
        'descripcion_enriquecida',
        'prioridad',
        'fecha_limite',
        'estado',
        'completado_en'
    ];

    protected $casts = [
        'fecha_limite' => 'datetime',
        'completado_en' => 'datetime'
    ];

    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($model) {
            if (empty($model->id)) {
                $model->id = (string) Str::uuid();
            }
        });
    }

    public function proyecto()
    {
        return $this->belongsTo(Proyecto::class, 'proyecto_id');
    }

    public function solicitante()
    {
        return $this->belongsTo(User::class, 'solicitante_id');
    }

    public function ejecutor()
    {
        return $this->belongsTo(User::class, 'ejecutor_id');
    }

    public function qa()
    {
        return $this->belongsTo(User::class, 'qa_id');
    }
}
