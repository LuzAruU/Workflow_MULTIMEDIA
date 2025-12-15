<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Adjunto extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';
    protected $table = 'adjuntos';
    public $timestamps = false;

    protected $fillable = [
        'tipo_recurso',
        'url',
        'nombre_archivo',
        'contexto',
        'id_padre',
        'subido_por'
    ];

    protected $casts = [
        'subido_en' => 'datetime'
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

    public function usuario()
    {
        return $this->belongsTo(User::class, 'subido_por');
    }

    public function tarea()
    {
        return $this->belongsTo(Tarea::class, 'id_padre');
    }

    public function entrega()
    {
        return $this->belongsTo(EntregaTarea::class, 'id_padre');
    }

    public function revision()
    {
        return $this->belongsTo(RevisionQA::class, 'id_padre');
    }
}
